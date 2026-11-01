import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const script = fileURLToPath(new URL('../scripts/verificar-deploy.mjs', import.meta.url));
// Somente dados ficticios; nenhum acesso ao banco, ao SMTP ou ao .env da loja.
const base = {
    NODE_ENV: 'production', DATABASE_URL: 'postgresql://teste:nao-expor-database@localhost:5432/teste',
    AUTH_TOKEN_SECRET: 'segredo-exclusivo-deste-teste-isolado-123456789',
    ADMIN_EMAIL: 'admin@loja.test', ADMIN_PASSWORD: 'senha-exclusiva-nao-expor-123',
    PIX_CHAVE: 'pix@loja.test', PIX_RECEBEDOR: 'Loja Teste',
    FRETE_CEP_ORIGEM: '01001000', MELHOR_ENVIO_AMBIENTE: 'production',
    MELHOR_ENVIO_TOKEN: 'token-de-frete-nao-expor', MELHOR_ENVIO_CONTATO: 'frete@loja.test',
    APP_URL_PUBLICA: 'https://loja.test', SMTP_HOST: 'smtp.loja.test', SMTP_PORT: '587',
    SMTP_USER: 'email@loja.test', SMTP_PASSWORD: 'senha-smtp-nao-expor', SMTP_REMETENTE: 'email@loja.test'
};
const camposEmail = ['APP_URL_PUBLICA', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_REMETENTE'];

async function verificar(alteracoes = {}) {
    const raiz = resolve(tmpdir());
    const pasta = await mkdtemp(resolve(raiz, 'loja-deploy-test-'));
    try {
        const ambiente = {};
        for (const chave of ['PATH', 'Path', 'SystemRoot', 'WINDIR', 'TEMP', 'TMP']) {
            if (process.env[chave]) ambiente[chave] = process.env[chave];
        }
        const resultado = spawnSync(process.execPath, [script], {
            cwd: pasta, env: {...ambiente, ...base, ...alteracoes, UPLOADS_DIR: resolve(pasta, 'uploads')},
            encoding: 'utf8', timeout: 15000
        });
        assert.ifError(resultado.error);
        assert.equal(resultado.signal, null);
        const saida = resultado.stdout + resultado.stderr;
        for (const chave of ['DATABASE_URL', 'AUTH_TOKEN_SECRET', 'ADMIN_PASSWORD', 'SMTP_PASSWORD', 'MELHOR_ENVIO_TOKEN']) {
            assert.ok(!saida.includes(base[chave]), 'Nao deve exibir ' + chave);
        }
        return {codigo: resultado.status, saida};
    } finally {
        // Remocao limitada exclusivamente ao diretorio temporario criado por este teste.
        if (dirname(resolve(pasta)) !== raiz || !basename(pasta).startsWith('loja-deploy-test-')) throw new Error('Pasta inesperada');
        await rm(pasta, {recursive: true, force: true});
    }
}

test('configuracao completa passa sem prometer entrega SMTP', async () => {
    for (const porta of ['465', '587']) {
        const r = await verificar({SMTP_PORT: porta});
        assert.equal(r.codigo, 0, r.saida);
        assert.match(r.saida, /APP_URL_PUBLICA tem formato valido/);
        assert.match(r.saida, /sem enviar e-mail/);
    }
});

test('email ausente avisa em desenvolvimento e bloqueia preflight de producao', async () => {
    const vazio = Object.fromEntries(camposEmail.map(c => [c, '']));
    const dev = await verificar({...vazio, NODE_ENV: 'development'});
    assert.equal(dev.codigo, 0, dev.saida);
    assert.match(dev.saida, /\[aviso\] Recuperacao de senha indisponivel/);
    const prod = await verificar(vazio);
    assert.equal(prod.codigo, 1);
    assert.match(prod.saida, /\[erro\] Recuperacao de senha indisponivel/);
});

test('configuracao parcial de email falha antes de iniciar API', async () => {
    for (const campo of camposEmail) {
        const r = await verificar({[campo]: '', NODE_ENV: 'development'});
        assert.equal(r.codigo, 1, campo);
        assert.ok(r.saida.includes('[erro] ' + campo + ' deve ser configurada'));
    }
});

test('origem de recuperacao rejeita HTTP em producao, caminhos e parametros', async () => {
    for (const origem of ['http://loja.test', 'https://loja.test/conta', 'https://loja.test?x=1',
        'https://loja.test#token', 'https://usuario:senha@loja.test', 'javascript:alert(1)', 'nao-e-url']) {
        const r = await verificar({APP_URL_PUBLICA: origem});
        assert.equal(r.codigo, 1, origem);
        assert.match(r.saida, /\[erro\] APP_URL_PUBLICA/);
        assert.ok(!r.saida.includes(origem));
    }
    const r = await verificar({APP_URL_PUBLICA: 'http://localhost:3000', NODE_ENV: 'development'});
    assert.equal(r.codigo, 0, r.saida);
});

test('porta SMTP e remetente invalidos sao erros de configuracao', async () => {
    for (const porta of ['25', 'abc', '0']) {
        const r = await verificar({SMTP_PORT: porta});
        assert.equal(r.codigo, 1);
        assert.match(r.saida, /\[erro\] SMTP_PORT/);
    }
    for (const remetente of ['sem-arroba', 'Loja <loja@loja.test>', 'a@loja.test,b@loja.test']) {
        const r = await verificar({SMTP_REMETENTE: remetente});
        assert.equal(r.codigo, 1);
        assert.match(r.saida, /\[erro\] SMTP_REMETENTE/);
    }
});

test('segredos fracos e frete sandbox continuam bloqueando producao', async () => {
    const r = await verificar({AUTH_TOKEN_SECRET: 'curto', ADMIN_PASSWORD: 'admin123', MELHOR_ENVIO_AMBIENTE: 'sandbox'});
    assert.equal(r.codigo, 1);
    assert.match(r.saida, /\[erro\] AUTH_TOKEN_SECRET/);
    assert.match(r.saida, /\[erro\] ADMIN_PASSWORD/);
    assert.match(r.saida, /\[erro\] Frete em sandbox/);
});
