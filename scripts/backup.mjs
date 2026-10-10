import { spawn } from 'node:child_process';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, readdir, lstat, readFile, writeFile, copyFile, rename, realpath } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('../', import.meta.url));
const pastaBackups = path.join(raiz, 'backups');

// Sem shell: o dump binario passa diretamente para o arquivo, inclusive no Windows.
export async function executarDocker(args, { entrada, saida, env = process.env } = {}) {
    const proc = spawn('docker', ['compose', ...args], {
        cwd: raiz, env, windowsHide: true, stdio: [entrada ? 'pipe' : 'ignore', 'pipe', 'pipe']
    });
    let texto = '', erro = '';
    proc.stderr.on('data', chunk => { erro = (erro + chunk.toString()).slice(-8000); });
    const fim = new Promise((resolve, reject) => {
        proc.on('error', () => reject(new Error('Nao foi possivel executar Docker. Abra o Docker Desktop e tente novamente.')));
        proc.on('close', code => code === 0 && !erro.trim() ? resolve() : reject(new Error(
            'O Docker/PostgreSQL nao concluiu a operacao sem avisos. Confira se o container esta ligado e se a configuracao local do banco esta correta.'
        )));
    });
    const tarefas = [fim];
    if (saida) tarefas.push(pipeline(proc.stdout, createWriteStream(saida, { flags: 'wx' })));
    else proc.stdout.on('data', chunk => { texto += chunk.toString(); });
    if (entrada) tarefas.push(pipeline(createReadStream(entrada), proc.stdin));
    try { await Promise.all(tarefas); }
    catch (error) { proc.kill(); await Promise.allSettled(tarefas); throw error; }
    return texto;
}

function dentro(base, destino) {
    const relativo = path.relative(base, destino);
    return relativo === '' || (!relativo.startsWith('..' + path.sep) && relativo !== '..' && !path.isAbsolute(relativo));
}

export async function listarArquivos(pasta, prefixo = '') {
    const info = await lstat(pasta);
    if (info.isSymbolicLink() || !info.isDirectory()) throw new Error('O backup exige pastas reais, sem links simbolicos.');
    const arquivos = [];
    for (const item of await readdir(pasta, { withFileTypes: true })) {
        const relativo = prefixo ? prefixo + '/' + item.name : item.name;
        const absoluto = path.join(pasta, item.name);
        if (item.isSymbolicLink()) throw new Error('Foi encontrado um link simbolico. O backup nao foi concluido.');
        if (item.isDirectory()) arquivos.push(...await listarArquivos(absoluto, relativo));
        else if (item.isFile()) arquivos.push(relativo);
        else throw new Error('Foi encontrado um arquivo especial. O backup nao foi concluido.');
    }
    return arquivos.sort();
}

export async function assinatura(arquivo) {
    const hash = createHash('sha256');
    let bytes = 0;
    for await (const chunk of createReadStream(arquivo)) { hash.update(chunk); bytes += chunk.length; }
    return { bytes, sha256: hash.digest('hex') };
}

export async function verificarBackup(pasta) {
    const arquivos = await listarArquivos(pasta);
    const manifesto = JSON.parse(await readFile(path.join(pasta, 'manifesto.json'), 'utf8'));
    if (manifesto.formato !== 1 || !Array.isArray(manifesto.arquivos)) throw new Error('Manifesto de backup invalido.');
    const esperados = manifesto.arquivos.map(item => item.caminho);
    if (!esperados.includes('banco.dump') || new Set(esperados).size !== esperados.length ||
        esperados.some(nome => typeof nome !== 'string' || (nome !== 'banco.dump' && !nome.startsWith('uploads/')) ||
            nome.split('/').some(parte => !parte || parte === '.' || parte === '..' || parte.includes('\\') || parte.includes(':')))) {
        throw new Error('Lista de arquivos do backup invalida.');
    }
    const encontrados = arquivos.filter(nome => nome !== 'manifesto.json');
    if (JSON.stringify(encontrados.sort()) !== JSON.stringify([...esperados].sort())) {
        throw new Error('Backup incompleto: arquivos ausentes ou extras.');
    }
    for (const item of manifesto.arquivos) {
        const atual = await assinatura(path.join(pasta, item.caminho));
        if (atual.bytes !== item.bytes || atual.sha256 !== item.sha256) throw new Error('Backup alterado ou corrompido: ' + item.caminho);
    }
    return manifesto;
}

export async function configuracaoBancoLocal() {
    try { process.loadEnvFile(path.join(raiz, '.env')); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    let url;
    try { url = new URL(process.env.DATABASE_URL); } catch { throw new Error('Configure DATABASE_URL no .env local.'); }
    if (!['postgres:', 'postgresql:'].includes(url.protocol) || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
        throw new Error('Este comando atende somente o PostgreSQL local do Docker Compose deste projeto.');
    }
    const porta = url.port || '5432';
    const publicada = await executarDocker(['port', 'postgres', '5432']);
    if (!publicada.trim().split(/\r?\n/).some(linha => linha.trim().endsWith(':' + porta))) {
        throw new Error('A porta de DATABASE_URL nao corresponde ao PostgreSQL do Docker Compose.');
    }
    const usuario = decodeURIComponent(url.username), banco = decodeURIComponent(url.pathname.slice(1));
    if (!usuario || !banco || banco.includes('/') || usuario.startsWith('-') || banco.startsWith('-')) throw new Error('Usuario ou banco invalidos em DATABASE_URL.');
    return { usuario, banco, env: { ...process.env, PGPASSWORD: decodeURIComponent(url.password) } };
}

export async function criarBackup() {
    const config = await configuracaoBancoLocal();
    const uploads = path.resolve(raiz, process.env.UPLOADS_DIR || 'public/uploads');
    let origemExiste = true;
    try { await lstat(uploads); } catch (error) { if (error.code !== 'ENOENT') throw error; origemExiste = false; }
    // Evita copiar o projeto ou incluir backups recursivamente por configuracao incorreta.
    const origemReal = origemExiste ? await realpath(uploads) : uploads;
    const backupsReal = path.join(await realpath(raiz), 'backups');
    if (dentro(origemReal, backupsReal) || dentro(backupsReal, origemReal)) throw new Error('UPLOADS_DIR nao pode conter a pasta backups nem ficar dentro dela.');
    const imagens = origemExiste ? await listarArquivos(uploads) : [];
    await mkdir(pastaBackups, { recursive: true });
    const backupInfo = await lstat(pastaBackups);
    if (backupInfo.isSymbolicLink() || !backupInfo.isDirectory()) throw new Error('A pasta backups nao pode ser um link simbolico.');
    const nome = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-') + '-' + randomUUID().slice(0, 8);
    const temporaria = path.join(pastaBackups, nome + '.incompleto');
    const destino = path.join(pastaBackups, nome);
    await mkdir(temporaria);
    console.log('Criando backup. Mantenha a API parada e o Docker ligado durante a copia.');
    try {
        const dump = path.join(temporaria, 'banco.dump');
        await executarDocker(['exec', '-T', '-e', 'PGPASSWORD', 'postgres', 'pg_dump',
            '--host=127.0.0.1', '--username=' + config.usuario, '--dbname=' + config.banco,
            '--format=custom', '--no-owner', '--no-acl'], { saida: dump, env: config.env });
        // Confere se o PostgreSQL reconhece o arquivo como um dump valido.
        await executarDocker(['exec', '-T', 'postgres', 'pg_restore', '--list'], { entrada: dump });
        await mkdir(path.join(temporaria, 'uploads'));
        for (const relativo of imagens) {
            const alvo = path.join(temporaria, 'uploads', relativo);
            await mkdir(path.dirname(alvo), { recursive: true });
            await copyFile(path.join(uploads, relativo), alvo);
        }
        const arquivos = [];
        for (const caminho of await listarArquivos(temporaria)) arquivos.push({ caminho, ...await assinatura(path.join(temporaria, caminho)) });
        const pacote = JSON.parse(await readFile(path.join(raiz, 'package.json'), 'utf8'));
        const manifesto = { formato: 1, criadoEm: new Date().toISOString(), versaoApp: pacote.version,
            uploadsOrigemExistia: origemExiste, quantidadeUploads: imagens.length, arquivos };
        await writeFile(path.join(temporaria, 'manifesto.json'), JSON.stringify(manifesto, null, 2) + '\n', { flag: 'wx' });
        await verificarBackup(temporaria);
        await rename(temporaria, destino);
        console.log('Backup concluido: ' + destino);
        console.log('Banco e ' + imagens.length + ' arquivo(s) de uploads conferidos. O .env nao foi incluido.');
        if (!origemExiste) console.log('A pasta de uploads ainda nao existe nesta maquina; o backup contem apenas o banco e uma pasta uploads vazia.');
        console.log('Guarde uma copia em outro local privado: o backup contem dados de clientes e administradores.');
        return destino;
    } catch (error) {
        console.error('Backup NAO concluido. A pasta com sufixo .incompleto nao deve ser usada: ' + temporaria);
        throw error;
    }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const args = process.argv.slice(2);
        if (!args.length) await criarBackup();
        else if (args.length === 2 && args[0] === '--verificar') {
            const manifesto = await verificarBackup(path.resolve(args[1]));
            console.log('Integridade conferida: banco e ' + manifesto.quantidadeUploads + ' arquivo(s) de uploads. Nenhum dado foi restaurado.');
        } else throw new Error('Uso: npm run backup ou npm run backup:verificar -- "backups/pasta-do-backup"');
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
