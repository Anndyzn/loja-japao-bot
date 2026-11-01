import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { pathToFileURL } from 'node:url';

const rota = '/mercado-pago/webhook';
// Porta publica do tunel aceita exclusivamente notificacoes; a assinatura continua validada pela API.
export function criarEntradaWebhook(portaApi, { requisitar = fetch, registrar = () => {} } = {}) {
    if (!Number.isInteger(portaApi) || portaApi < 1 || portaApi > 65535) throw new Error('PORT invalida.');
    return createServer({ requestTimeout: 15000, headersTimeout: 10000 }, async (req, res) => {
        const responder = (status) => {
            res.writeHead(status, { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(status === 200 ? 'OK' : 'HTTP ' + status);
        };
        try {
            const url = new URL(req.url, 'http://127.0.0.1');
            if (req.method !== 'POST' || url.pathname !== rota) return responder(404);
            if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return responder(415);
            if (!req.headers['x-signature'] || !req.headers['x-request-id']) return responder(401);
            let tamanho = 0;
            const partes = [];
            for await (const parte of req) {
                tamanho += parte.length;
                if (tamanho > 65536) { responder(413); return; }
                partes.push(parte);
            }
            const headers = { 'Content-Type': 'application/json' };
            for (const nome of ['x-signature', 'x-request-id']) {
                if (typeof req.headers[nome] !== 'string') return responder(400);
                headers[nome] = req.headers[nome];
            }
            const resposta = await requisitar('http://127.0.0.1:' + portaApi + rota + url.search, {
                method: 'POST', headers, body: Buffer.concat(partes),
                redirect: 'error', signal: AbortSignal.timeout(20000)
            });
            await resposta.body?.cancel();
            const status = resposta.status >= 300 && resposta.status < 400 ? 502 : resposta.status;
            registrar('Notificacao encaminhada: HTTP ' + status);
            responder(status);
        } catch {
            registrar('Nao foi possivel encaminhar a notificacao para a API local.');
            if (!res.headersSent && !res.destroyed) responder(502);
        }
    });
}

async function iniciar() {
    const arquivo = parseEnv(await readFile('.env', 'utf8'));
    const config = { ...arquivo, ...process.env };
    if (config.NODE_ENV === 'production' || config.MERCADO_PAGO_MODO !== 'teste')
        throw new Error('Este comando exige MERCADO_PAGO_MODO=teste e ambiente local.');
    const porta = Number(config.PORT || 3000);
    const servidor = criarEntradaWebhook(porta, { registrar: console.log });
    await new Promise((resolve, reject) => { servidor.once('error', reject); servidor.listen(0, '127.0.0.1', resolve); });
    const filho = spawn(process.platform === 'win32' ? 'cloudflared.exe' : 'cloudflared',
        ['tunnel', '--no-autoupdate', '--url', 'http://127.0.0.1:' + servidor.address().port],
        { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let encerrando = false;
    const encerrar = () => {
        if (encerrando) return;
        encerrando = true;
        filho.kill(); servidor.close(); servidor.closeAllConnections();
    };
    process.once('SIGINT', encerrar); process.once('SIGTERM', encerrar);
    filho.once('error', () => { console.error('Nao foi possivel iniciar cloudflared. Confira a instalacao e o PATH.'); process.exitCode = 1; encerrar(); });
    filho.once('exit', code => { if (!encerrando && code !== 0) process.exitCode = 1; encerrar(); });
    let buffer = '', anunciou = false;
    const receber = dados => {
        buffer = (buffer + dados.toString()).slice(-16000);
        const url = buffer.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
        if (!anunciou && url) {
            anunciou = true;
            console.log('URL para Webhooks / Teste / Order (Mercado Pago):');
            console.log(url[0] + rota);
            console.log('Endereco temporario: muda ao reiniciar. Ctrl+C encerra o tunel.');
        }
    };
    filho.stdout.on('data', receber); filho.stderr.on('data', receber);
    console.log('Criando tunel exclusivo para POST ' + rota + '...');
    console.log('Mantenha npm run dev rodando em outro terminal.');
    if (!config.MERCADO_PAGO_WEBHOOK_SECRET?.trim())
        console.log('Falta preencher MERCADO_PAGO_WEBHOOK_SECRET e reiniciar a API antes de simular.');
    const limite = setTimeout(() => {
        if (!anunciou) { console.error('O tunel nao forneceu endereco. Confira a internet e tente novamente.'); process.exitCode = 1; encerrar(); }
    }, 45000);
    limite.unref(); filho.once('exit', () => clearTimeout(limite));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    iniciar().catch(() => { console.error('Nao foi possivel iniciar. Confira .env, modo teste e PORT.'); process.exitCode = 1; });
}
