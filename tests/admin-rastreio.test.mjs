import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../public/admin/app.js', import.meta.url), 'utf8');
const trecho = source.slice(source.indexOf('function criarRastreioPedido('), source.indexOf('function criarHistoricoPedido('));
const proximaAcao = source.slice(source.indexOf('function obterProximaAcaoPedido('), source.indexOf('function criarCelulaProximaAcaoPedido('));
class Elemento {
    children = []; events = {}; textContent = ''; value = ''; disabled = false;
    constructor(tag) { this.tag = tag; }
    append(...nodes) { this.children.push(...nodes); }
    replaceChildren(...nodes) { this.children = nodes; }
    setAttribute() {}
    addEventListener(name, handler) { this.events[name] = handler; }
    async emitir(name) { await this.events[name]?.({preventDefault() {}}); }
}
const elementos = node => [node, ...node.children.flatMap(elementos)];
const pedidoBase = {id: 17, status: 'pago', transportadora: null, codigoRastreio: null,
    freteTransportadora: 'Correios', freteServico: 'SEDEX', freteValor: 18.75, freteAmbiente: 'sandbox'};
function tela(pedido = {}, api) {
    const calls = [];
    const criar = tag => new Elemento(tag);
    const c = {
        document: {createElement: criar}, window: {confirm: () => true}, consultaPedidoAtual: 1,
        appFeedback: criar('p'), formatarMoeda: n => n.toFixed(2),
        criarSecaoPedido: () => criar('section'),
        criarDetalhePedido: (label, value) => { const el = criar('p'); el.textContent = label + ': ' + (value ?? '-'); return el; },
        criarLinkRastreio: (carrier, code) => { if (!carrier || !code) return null; const a = criar('a'); a.textContent = carrier + '/' + code; return a; },
        criarBotao: label => { const el = criar('button'); el.textContent = label; return el; },
        setFeedback: (el, msg) => { el.textContent = msg; },
        recarregarTelaAposAlterarPedido: async () => {}, carregarDetalhesPedidoNoModal: async () => {},
        apiFetch: async (path, options) => { const body = JSON.parse(options.body); calls.push({path, body}); return api ? api(path, body) : body; }
    };
    vm.createContext(c); vm.runInContext(trecho + proximaAcao, c);
    const dados = {...pedidoBase, ...pedido};
    const root = c.criarRastreioPedido(dados);
    const find = pred => elementos(root).find(pred);
    return {calls, dados, root, form: find(el => el.tag === 'form'),
        campo: name => find(el => el.name === name), botao: text => find(el => el.tag === 'button' && el.textContent === text),
        texto: () => elementos(root).map(el => el.textContent).join(' '), acao: () => c.obterProximaAcaoPedido(dados)};
}

test('transportadora cotada vem preenchida; salvar envia apenas rastreio e preserva cotacao', async () => {
    const t = tela();
    assert.equal(t.campo('transportadora').value, 'Correios');
    assert.match(t.texto(), new RegExp('Correios / SEDEX')); assert.match(t.texto(), /SIMULA/);
    assert.equal(t.botao('Marcar como enviado'), undefined);
    await t.form.emitir('submit'); assert.equal(t.calls.length, 0);
    t.campo('codigoRastreio').value = ' TESTE123 ';
    await t.form.emitir('submit');
    assert.deepEqual(t.calls, [{path: '/pedidos/17/rastreio', body: {transportadora: 'Correios', codigoRastreio: 'TESTE123'}}]);
    assert.equal(t.dados.freteTransportadora, 'Correios'); assert.equal(t.dados.status, 'pago');
    assert.match(t.acao().detalhe, new RegExp('Correios / SEDEX'));
});

test('rastreio existente prevalece sobre cotacao; pedidos antigos permitem preenchimento manual', () => {
    const t = tela({transportadora: 'Outra transportadora', codigoRastreio: 'SALVO'});
    assert.equal(t.campo('transportadora').value, 'Outra transportadora');
    assert.equal(t.campo('codigoRastreio').value, 'SALVO');
    const antigo = tela({freteTransportadora: null, freteServico: null});
    assert.equal(antigo.campo('transportadora').value, '');
    assert.match(antigo.acao().detalhe, /Falta transportadora/);
});

test('pendente e cancelado mostram entrega mas nao oferecem edicao; enviado permite corrigir rastreio', () => {
    for (const status of ['pendente', 'cancelado']) {
        const t = tela({status}); assert.equal(t.form, undefined); assert.match(t.texto(), /SEDEX/);
    }
    const t = tela({status: 'enviado', transportadora: 'Correios', codigoRastreio: 'SALVO'});
    assert.ok(t.form); assert.equal(t.botao('Marcar como enviado'), undefined);
});

test('alteracoes sem salvar bloqueiam envio; salvar libera e mantem acao separada', async () => {
    const t = tela({transportadora: 'Correios', codigoRastreio: 'ANTIGO'});
    const enviar = t.botao('Marcar como enviado'); assert.equal(enviar.disabled, false);
    t.campo('codigoRastreio').value = 'NOVO'; await t.campo('codigoRastreio').emitir('input');
    assert.equal(enviar.disabled, true); await enviar.emitir('click'); assert.equal(t.calls.length, 0);
    await t.form.emitir('submit'); assert.equal(enviar.disabled, false);
    assert.equal(t.calls.length, 1); assert.equal(t.calls[0].body.codigoRastreio, 'NOVO');
    t.campo('transportadora').value = 'Outra'; await t.campo('transportadora').emitir('change');
    assert.equal(enviar.disabled, true);
    t.campo('transportadora').value = 'Correios'; await t.campo('transportadora').emitir('input');
    assert.equal(enviar.disabled, false);
    await enviar.emitir('click'); assert.equal(t.calls[1].path, '/pedidos/17/status');
    assert.deepEqual(t.calls[1].body, {status: 'enviado'});
});

test('salvamento em andamento bloqueia envio e repeticao; falha libera campos sem perder alteracao', async () => {
    let rejeitar; const pendente = new Promise((_, reject) => { rejeitar = reject; });
    const t = tela({transportadora: 'Correios', codigoRastreio: 'SALVO'}, () => pendente);
    t.campo('codigoRastreio').value = 'NOVO'; await t.campo('codigoRastreio').emitir('input');
    const salvar = t.form.emitir('submit');
    assert.equal(t.campo('codigoRastreio').disabled, true); assert.equal(t.botao('Marcar como enviado').disabled, true);
    await t.form.emitir('submit'); await t.botao('Marcar como enviado').emitir('click');
    assert.equal(t.calls.length, 1);
    rejeitar(Error('Falha na rede')); await salvar;
    assert.equal(t.campo('codigoRastreio').value, 'NOVO'); assert.equal(t.campo('codigoRastreio').disabled, false);
    assert.equal(t.botao('Marcar como enviado').disabled, true); assert.match(t.texto(), /Falha na rede/);
});
