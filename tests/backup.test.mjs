import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { assinatura, verificarBackup } from '../scripts/backup.mjs';

async function fixture(t) {
    const pasta = await mkdtemp(path.join(os.tmpdir(), 'loja-backup-teste-'));
    t.after(async () => {
        const alvo = path.resolve(pasta), base = path.resolve(os.tmpdir());
        if (path.dirname(alvo) !== base || !path.basename(alvo).startsWith('loja-backup-teste-')) throw Error('Pasta temporaria invalida');
        await rm(alvo, { recursive:true, force:true });
    });
    await mkdir(path.join(pasta, 'uploads', 'produtos'), { recursive:true });
    await writeFile(path.join(pasta, 'banco.dump'), Buffer.from([0,255,13,10,128]));
    await writeFile(path.join(pasta, 'uploads', 'produtos', 'foto.jpg'), Buffer.from([255,216,0,255,217]));
    const arquivos = [];
    for(const caminho of ['banco.dump','uploads/produtos/foto.jpg']) arquivos.push({caminho,...await assinatura(path.join(pasta,caminho))});
    await writeFile(path.join(pasta, 'manifesto.json'), JSON.stringify({formato:1,quantidadeUploads:1,arquivos}));
    return pasta;
}

test('confere arquivos binarios e uploads em subpastas', async t=>{
    const pasta=await fixture(t);
    assert.equal((await verificarBackup(pasta)).quantidadeUploads,1);
});
test('rejeita imagem alterada mesmo mantendo o tamanho', async t=>{
    const pasta=await fixture(t);
    await writeFile(path.join(pasta,'uploads/produtos/foto.jpg'),Buffer.from([0,216,0,255,217]));
    await assert.rejects(verificarBackup(pasta),/corrompido/);
});
test('rejeita dump incompleto', async t=>{
    const pasta=await fixture(t);await writeFile(path.join(pasta,'banco.dump'),'');
    await assert.rejects(verificarBackup(pasta),/corrompido/);
});
test('rejeita arquivo ausente',async t=>{
    const pasta=await fixture(t);await rm(path.join(pasta,'uploads/produtos/foto.jpg'));
    await assert.rejects(verificarBackup(pasta),/ausentes/);
});
test('rejeita arquivo extra',async t=>{
    const pasta=await fixture(t);await writeFile(path.join(pasta,'extra.txt'),'extra');
    await assert.rejects(verificarBackup(pasta),/extras/);
});
test('nao aceita caminhos fora do backup ou entradas duplicadas',async t=>{
    const pasta=await fixture(t), arq=path.join(pasta,'manifesto.json');
    const original=JSON.parse(await readFile(arq,'utf8'));
    for(const nome of ['uploads/../../.env','uploads/C:/segredo','uploads/..\\.env','banco.dump']) {
        const m=structuredClone(original);m.arquivos.push({caminho:nome,bytes:0,sha256:''});
        await writeFile(arq,JSON.stringify(m));await assert.rejects(verificarBackup(pasta),/invalida/);
    }
});
