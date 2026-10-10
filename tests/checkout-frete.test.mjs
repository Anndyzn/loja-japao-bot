import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

// Executa o script real da loja com DOM/API simulados, sem dependencias ou rede.
const sessaoSource = (await readFile(new URL('../public/loja/pedido-sessao.js', import.meta.url), 'utf8')).replaceAll('export function ', 'function ');
const source = sessaoSource + (await readFile(new URL('../public/loja/carrinho.js', import.meta.url), 'utf8'))
    .replace('import { aplicarConfiguracaoPublica } from "./configuracao.js";', 'const aplicarConfiguracaoPublica = () => Promise.resolve();')
    .replace('import { salvarUltimoPedido, montarAtalhoUltimoPedido } from "./pedido-sessao.js";', '')
    .replace('import { criarQuadroPix } from "./pix.js";', '');
class Element {
    value = ''; textContent = ''; disabled = false; inert = false; children = []; events = new Map();
    classList = {toggle() {}};
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = children; this.value = children[0]?.value ?? ''; }
    addEventListener(name, cb) { this.events.set(name, [...this.events.get(name) ?? [], cb]); }
    async emit(name) { await Promise.all((this.events.get(name) ?? []).map(cb => cb({preventDefault() {}}))); }
    querySelectorAll() { return []; }
    checkValidity() { return true; }
    reportValidity() {}
    reset() { void this.emit('reset'); }
}
const produto = {id: 1, nome: 'Produto', preco: 10, estoque: 5};
const opcao = (token = 'cotacao', expires = Date.now() + 60000) => ({
    token, expiraEm: expires, valor: 18.75, servico: 'PAC', transportadora: 'Correios', prazoDias: 5, ambiente: 'sandbox'
});
const json = (body, ok = true) => ({ok, json: async () => body});
function deferred() { let resolve; const promise = new Promise(r => { resolve = r; }); return {promise, resolve}; }
async function loja(handler = async () => json({subtotalProdutos: 20, opcoes: [opcao()]}), opcoesTeste = {}) {
    const dom = new Map(), calls = [];
    const el = id => { if (!dom.has(id)) dom.set(id, new Element()); return dom.get(id); };
    const form = el('#checkout-form');
    form.elements = Object.fromEntries(['nome','telefone','email','cep','endereco','numero','complemento','bairro','cidade','estado','referencia','observacao','metodo'].map(k => [k, new Element()]));
    Object.assign(form.elements.cep, {value: '01001000'});
    form.elements.nome.value = 'Cliente'; form.elements.telefone.value = '11999990000';
    const storage = opcoesTeste.storage ?? new Map([['lojaJapaoCarrinho', JSON.stringify([{produto, quantidade: 2}])]]);
    const sessao = opcoesTeste.sessao ?? new Map();
    let bloqueado = false;
    const conferir = () => { if (bloqueado) throw Error('Armazenamento bloqueado'); };
    const context = vm.createContext({
        document: {querySelector: el, querySelectorAll: () => [], createElement: () => new Element()},
        Option: class extends Element { constructor(label, value) { super(); this.textContent = label; this.value = value; } },
        FormData: class { constructor(form) { this.fields = Object.fromEntries(Object.entries(form.elements).map(([k,v]) => [k, v.value])); } get(k) { return this.fields[k]; } },
        localStorage: {getItem: k => storage.get(k), setItem: (k,v) => { conferir();storage.set(k,v); }},
        sessionStorage: {getItem: k => { conferir();return sessao.get(k); }, setItem: (k,v) => { conferir();sessao.set(k,v); },removeItem:k=>{conferir();sessao.delete(k);}}, criarQuadroPix: () => undefined,
        setTimeout, clearTimeout, AbortController,
        fetch: async (path, options = {}) => {
            if (path.startsWith('/produtos')) return json({dados: [produto]});
            if (path.startsWith('https://viacep')) return json({logradouro: 'Rua', bairro: 'Centro', localidade: 'Sao Paulo', uf: 'SP'});
            calls.push({path, body: options.body ? JSON.parse(options.body) : undefined});
            return handler(path, options);
        }
    });
    const api = await vm.runInContext('(async () => {' + source + '; return {alterarQuantidade, finalizarPedido}; })()', context);
    assert.equal(el('#store-feedback').textContent, ''); // Falha se a inicializacao do script quebrou.
    return {el, form, calls, api, storage, sessao, bloquearArmazenamento:()=>{bloqueado=true;}, calcular: () => el('#calcular-frete').emit('click'),
        selecionar: async token => { el('#frete-opcoes').value = token; await el('#frete-opcoes').emit('change'); },
        finalizar: () => api.finalizarPedido({preventDefault() {}})};
}

test('exige escolha, soma o valor cotado e invalida ao alterar CEP ou quantidade', async () => {
    const l = await loja();
    await l.finalizar(); assert.equal(l.calls.length, 0);
    await l.calcular();
    assert.match(l.el('#payment-total').textContent, /Selecione/);
    assert.match(l.el('#frete-opcoes').children[1].textContent, /SIMULACAO/);
    await l.selecionar('cotacao'); assert.match(l.el('#payment-total').textContent, /38,75/);
    l.form.elements.cep.value = '22220000'; await l.form.elements.cep.emit('input');
    assert.equal(l.el('#frete-opcoes').disabled, true);
    await l.calcular(); await l.selecionar('cotacao');
    l.api.alterarQuantidade(1, 3);
    assert.equal(l.el('#frete-opcoes').disabled, true);
    assert.match(l.el('#checkout-total').textContent, /30,00.*frete/);
});

test('resposta atrasada de uma cotacao anterior nao substitui a atual', async () => {
    const antigo = deferred(); let n = 0;
    const l = await loja(async () => ++n === 1 ? antigo.promise : json({subtotalProdutos: 30, opcoes: [opcao('novo')]}));
    const primeira = l.calcular();
    l.api.alterarQuantidade(1, 3);
    await l.calcular();
    antigo.resolve(json({subtotalProdutos: 20, opcoes: [opcao('antigo')]})); await primeira;
    assert.equal(l.el('#frete-opcoes').children[1].value, 'novo');
    await l.selecionar('novo'); assert.match(l.el('#payment-total').textContent, /48,75/);
});

test('falha do provedor limpa cotacao anterior e impede checkout', async () => {
    let falhar = false;
    const l = await loja(async () => falhar ? json({mensagem: 'Frete indisponivel'}, false) : json({subtotalProdutos: 20, opcoes: [opcao()]}));
    await l.calcular(); await l.selecionar('cotacao'); falhar = true;
    await l.calcular(); await l.finalizar();
    assert.match(l.el('#frete-feedback').textContent, /indisponivel/);
    assert.equal(l.el('#frete-opcoes').disabled, true);
    assert.equal(l.el('#calcular-frete').disabled, false);
    assert.ok(l.calls.every(c => c.path === '/fretes/cotacao'));
});

test('cotacao vencida nao envia cliente nem pedido', async () => {
    const l = await loja(async () => json({subtotalProdutos: 20, opcoes: [opcao('vencida', Date.now() - 1000)]}));
    await l.calcular(); await l.selecionar('vencida'); await l.finalizar();
    assert.equal(l.calls.length, 1); assert.match(l.el('#store-feedback').textContent, /frete valido/);
});

test('checkout envia token, evita envio duplo e exibe total retornado pelo servidor', async () => {
    const cliente = deferred();
    const l = await loja(async path => {
        if (path === '/fretes/cotacao') return json({subtotalProdutos: 20, opcoes: [opcao()]});
        if (path === '/clientes') return cliente.promise;
        if (path === '/pedidos') return json({id: 42, total: 38.75, subtotalProdutos: 20, freteValor: 18.75, freteServico: 'PAC', freteTransportadora: 'Correios', fretePrazoDias: 5, freteAmbiente: 'sandbox', status: 'pendente'});
        throw Error('Rota inesperada');
    });
    await l.calcular(); await l.selecionar('cotacao');
    const envio = l.finalizar(); await l.finalizar();
    assert.equal(l.form.inert, true);
    assert.equal(l.calls.filter(c => c.path === '/clientes').length, 1);
    cliente.resolve(json({id: 7})); await envio;
    assert.equal(l.form.inert, false);
    const pedidos = l.calls.filter(c => c.path === '/pedidos'); assert.equal(pedidos.length, 1);
    assert.deepEqual(pedidos[0].body.itens, [{produtoId: 1, quantidade: 2}]);
    assert.equal(pedidos[0].body.freteToken, 'cotacao'); assert.equal(pedidos[0].body.clienteId, 7);
    assert.match(l.el('#order-status').textContent, /Aguardando pagamento.*38,75/);
    assert.match(l.el('#order-status').textContent, /SIMULACAO/);
});

test('falha na criacao libera formulario para tentar de novo sem perder o carrinho', async () => {
    const l = await loja(async path => path === '/fretes/cotacao' ? json({subtotalProdutos: 20, opcoes: [opcao()]}) : json({mensagem: 'Pedido recusado'}, false));
    await l.calcular(); await l.selecionar('cotacao'); await l.finalizar();
    assert.equal(l.form.inert, false); assert.match(l.el('#store-feedback').textContent, /Pedido recusado/);
    await l.finalizar(); assert.equal(l.calls.filter(c => c.path === '/clientes').length, 2);
});

const compraOk = async path => {
    if(path==='/fretes/cotacao') return json({subtotalProdutos:20,opcoes:[opcao()]});
    if(path==='/clientes') return json({id:7});
    return json({id:42,total:38.75,subtotalProdutos:20,freteValor:18.75,status:'pendente'});
};
test('reabrir checkout preserva atalho do pedido e nao faz nova compra',async()=>{
    const l=await loja(compraOk);await l.calcular();await l.selecionar('cotacao');await l.finalizar();
    assert.deepEqual(JSON.parse(l.sessao.get('lojaJapaoUltimoPedido')),{id:42,telefone:'11999990000'});
    const reaberta=await loja(compraOk,{storage:l.storage,sessao:l.sessao});
    const atalho=reaberta.el('#ultimo-pedido');
    assert.equal(atalho.children[1].children[0].href,'/loja/acompanhamento?pedido=42');
    assert.equal(reaberta.calls.length,0);
    await atalho.children[1].children[1].emit('click');
    assert.equal(l.sessao.has('lojaJapaoUltimoPedido'),false);
});
test('armazenamento bloqueado apos envio nao transforma pedido criado em falha nem duplica compra',async()=>{
    const l=await loja(compraOk);await l.calcular();await l.selecionar('cotacao');l.bloquearArmazenamento();
    await l.finalizar();assert.match(l.el('#store-feedback').textContent,/Pedido 42 criado.*Anote/);
    assert.match(l.el('#order-number').textContent,/#42/);
    await l.finalizar();assert.equal(l.calls.filter(c=>c.path==='/pedidos').length,1);
});
