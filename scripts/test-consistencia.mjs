import { Client } from "pg";
import { readdir, readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";

try { process.loadEnvFile('.env'); } catch (error) { if(error.code !== 'ENOENT') throw error; }
const origem = new URL(process.env.DATABASE_URL || '');
if (!['localhost','127.0.0.1','[::1]'].includes(origem.hostname)) {
    throw new Error('Este teste so aceita PostgreSQL local. Nenhum banco foi criado.');
}
const nome = 'loja_japao_test_' + randomUUID().replaceAll('-','');
const testeUrl = new URL(origem);
testeUrl.pathname = '/' + nome;
const admin = new Client({connectionString:origem.toString()});
let criado = false;
let banco;
try {
    await admin.connect();
    await admin.query('CREATE DATABASE "' + nome + '"');
    criado = true;
    banco = new Client({connectionString:testeUrl.toString()});
    await banco.connect();
    const pasta = new URL('../prisma/migrations/',import.meta.url);
    const dirs = (await readdir(pasta,{withFileTypes:true})).filter(d=>d.isDirectory()).map(d=>d.name).sort();
    for (const dir of dirs) {
        if(dir === '20261006180000_add_frete_nacional') {
            const cliente = await banco.query(`INSERT INTO "Cliente" (nome,telefone,endereco,"atualizadoEm") VALUES ('Legado','11999999999','Rua',NOW()) RETURNING id`);
            await banco.query(`INSERT INTO "Pedido" ("clienteId",total,observacao,"atualizadoEm") VALUES ($1,123.45,'pedido-legado-teste',NOW())`,[cliente.rows[0].id]);
        }
        await banco.query(await readFile(new URL(dir+'/migration.sql',pasta),'utf8'));
    }
    await banco.end(); banco = undefined;
    console.log('Banco temporario criado e migrations aplicadas. O banco da loja nao sera usado pelos testes.');
    const code = await new Promise((resolve,reject)=> {
        const child = spawn(process.execPath,['--import','tsx','--test','tests/pedidos-consistencia.test.mjs'],{
            stdio:'inherit',
            env:{...process.env,NODE_ENV:'development',FRETE_CEP_ORIGEM:'01001000',MELHOR_ENVIO_AMBIENTE:'sandbox',MELHOR_ENVIO_TOKEN:'token-exclusivo-testes-frete',MELHOR_ENVIO_CONTATO:'teste@example.com',DATABASE_URL:testeUrl.toString(),CONSISTENCIA_DATABASE_NAME:nome}
        });
        child.once('error',reject);
        child.once('exit',code=>resolve(code??1));
    });
    process.exitCode = code;
} finally {
    if(banco) await banco.end();
    // Remove exclusivamente o banco aleatorio criado por esta execucao.
    if(criado && /^loja_japao_test_[a-f0-9]{32}$/.test(nome) && testeUrl.pathname === '/' + nome) {
        await admin.query('DROP DATABASE "' + nome + '" WITH (FORCE)');
        console.log('Banco temporario removido.');
    }
    await admin.end();
}
