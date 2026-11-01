import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verificarMercadoPago } from '../scripts/verificar-mercado-pago.mjs';

const valores = { MERCADO_PAGO_ACCESS_TOKEN: 'APP_USR-segredo-ficticio' };
const resposta = (corpo, status = 200) => new Response(JSON.stringify(corpo), { status });

test('sem credencial ou com espacos nao chama a rede', async () => {
    for (const token of ['', ' ', 'abc def', 'abc\ndef']) {
        await assert.rejects(verificarMercadoPago({ MERCADO_PAGO_ACCESS_TOKEN: token }, () => assert.fail('Nao deveria chamar rede')));
    }
});
test('consulta fixa GET com token no header, timeout e sem redirecionamento; oculta dados pessoais', async () => {
    let chamadas = 0;
    const resultado = await verificarMercadoPago(valores, async (url, opcoes) => {
        chamadas++;
        assert.equal(url, 'https://api.mercadolibre.com/users/me');
        assert.equal(opcoes.method, 'GET');
        assert.equal(opcoes.redirect, 'error');
        assert.equal(opcoes.headers.Authorization, 'Bearer ' + valores.MERCADO_PAGO_ACCESS_TOKEN);
        assert.ok(opcoes.signal instanceof AbortSignal);
        assert.equal(opcoes.body, undefined);
        return resposta({ id: 123, site_id: 'MLB', email: 'privado@example.com' });
    });
    assert.equal(chamadas, 1);
    assert.match(resultado, /Conexao OK/);
    assert.doesNotMatch(resultado, /privado|123|APP_USR/);
});
test('erros HTTP nao expoem o corpo privado e nao sao repetidos automaticamente', async () => {
    for (const status of [401, 403, 429, 500]) {
        let chamadas = 0;
        await assert.rejects(verificarMercadoPago(valores, async () => {
            chamadas++;
            return resposta({ mensagem: valores.MERCADO_PAGO_ACCESS_TOKEN }, status);
        }), erro => !erro.message.includes(valores.MERCADO_PAGO_ACCESS_TOKEN));
        assert.equal(chamadas, 1);
    }
});
test('falhas de rede ou timeout nao expoem erro original', async () => {
    await assert.rejects(verificarMercadoPago(valores, async () => {
        throw new Error(valores.MERCADO_PAGO_ACCESS_TOKEN);
    }), /Nao foi possivel conectar/);
});
test('respostas malformadas ou conta fora do Brasil nao passam', async () => {
    for (const corpo of [null, {}, {id: 0, site_id: 'MLB'}, {id: 123, site_id: 'MLA'}]) {
        await assert.rejects(verificarMercadoPago(valores, async () => resposta(corpo)));
    }
    await assert.rejects(verificarMercadoPago(valores, async () => new Response('nao e JSON')), /resposta invalida/);
});
