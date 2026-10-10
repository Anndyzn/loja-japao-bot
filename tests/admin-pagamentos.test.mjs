import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../public/admin/app.js', import.meta.url), 'utf8');
const consulta = source.slice(source.indexOf('function dataPagamentoBrasilia('), source.indexOf('function criarCelulaContatoSolicitacao('));
const resumo = source.slice(source.indexOf('function atualizarResumoListaPagamentos('), source.indexOf('function atualizarResumoListaProdutos('));
const busca = source.slice(source.indexOf('function pagamentoConfereBuscaLocal('), source.indexOf('function atualizarContextoFiltroPedidos('));
const eventos = source.slice(source.indexOf('pagamentoFiltrosForm.addEventListener("submit"'), source.indexOf('solicitacaoStatusFiltro.addEventListener("change"'));
function elemento() {
    return {value:'', textContent:'', rows:[], events:{}, replaceChildren(...rows){this.rows=rows;}, addEventListener(nome, callback){this.events[nome]=callback;}};
}
function tela(api = async () => []) {
    const c = {Intl, Date, URLSearchParams, pagamentoConsultaAtual:0, pagamentoFiltroTimer:null,
        activeView:'pagamentos', apiFetch:api, window:{clearTimeout(){},setTimeout(){}},
        criarLinhaPagamento:p=>p, criarLinhaVazia:(_,texto)=>texto, criarStat:(label,valor)=>({label,valor}),
        formatarMoeda:n=>Number(n).toFixed(2),
        normalizarTexto:s=>String(s).toLowerCase(), normalizarDigitos:s=>String(s).replace(/\D/g,'')};
    for (const k of ['pagamentoDataInicio','pagamentoDataFim','pagamentoPeriodoHoje','pagamentoPeriodoMes',
        'pagamentoPeriodoFeedback','pagamentoResumoCards','pagamentoListaResumo','pagamentosTbody',
        'pagamentoBuscaFiltro','pagamentoMetodoFiltro','pagamentoStatusFiltro','pagamentoFiltrosForm','pagamentoFiltrosLimpar']) c[k]=elemento();
    c.pagamentoFiltrosForm.reset=()=>{for(const k of ['pagamentoDataInicio','pagamentoDataFim','pagamentoBuscaFiltro','pagamentoMetodoFiltro','pagamentoStatusFiltro'])c[k].value='';};
    vm.createContext(c);vm.runInContext(consulta+resumo+busca+eventos,c);return c;
}
const pagamento=(id,criadoEm,valor=10,metodo='pix',status='aprovado')=>({id,pedidoId:id,criadoEm,valor,metodo,status});
const ids=c=>Array.from(c.pagamentosTbody.rows,p=>p.id);

test('periodo inclui os limites do dia em Brasilia e ordena do mais recente', async()=>{
    const c=tela(async()=>[
        pagamento(1,'2026-10-10T02:59:59.999Z'), pagamento(2,'2026-10-10T03:00:00Z'),
        pagamento(3,'2026-10-11T02:59:59.999Z'), pagamento(4,'2026-10-11T03:00:00Z')]);
    c.pagamentoDataInicio.value=c.pagamentoDataFim.value='2026-10-10';
    await c.carregarPagamentos(); assert.deepEqual(ids(c),[3,2]);
    assert.equal(c.pagamentoResumoCards.rows[0].valor,'20.00');
    c.pagamentoDataInicio.value='';await c.carregarPagamentos();assert.deepEqual(ids(c),[3,2,1]);
    c.pagamentoDataInicio.value='2026-10-11';c.pagamentoDataFim.value='';await c.carregarPagamentos();assert.deepEqual(ids(c),[4]);
});
test('periodo combina com busca, metodo e status; soma centavos e calcula media',async()=>{
    const c=tela(async()=>[pagamento(10,'2026-10-10T12:00:00Z',0.1),pagamento(11,'2026-10-10T13:00:00Z',0.2),
        pagamento(12,'2026-10-10T12:00:00Z',90,'boleto'),pagamento(13,'2026-10-09T12:00:00Z',80)]);
    c.pagamentoDataInicio.value='2026-10-10';c.pagamentoMetodoFiltro.value='pix';c.pagamentoStatusFiltro.value='aprovado';
    await c.carregarPagamentos();assert.deepEqual(ids(c),[11,10]);
    assert.deepEqual(Array.from(c.pagamentoResumoCards.rows,r=>r.valor),['0.30','2','0.15']);
    c.pagamentoBuscaFiltro.value='#10';await c.carregarPagamentos();assert.deepEqual(ids(c),[10]);
});
test('periodo invertido nao consulta nem preserva totais antigos; vazio mostra zero',async()=>{
    let chamadas=0;const c=tela(async()=>{chamadas++;return [];});
    c.pagamentoResumoCards.rows=[{valor:'antigo'}];
    c.pagamentoDataInicio.value='2026-10-11';c.pagamentoDataFim.value='2026-10-10';
    await c.carregarPagamentos();assert.equal(chamadas,0);assert.equal(c.pagamentoResumoCards.rows.length,0);
    assert.match(c.pagamentoPeriodoFeedback.textContent,/data inicial/);
    c.pagamentoDataFim.value='2026-10-11';await c.carregarPagamentos();
    assert.deepEqual(Array.from(c.pagamentoResumoCards.rows,r=>r.valor),['0.00','0','0.00']);
});
test('Hoje, Este mes e Limpar usam os eventos da tela e preservam filtros combinados',async()=>{
    const c=tela();c.pagamentoMetodoFiltro.value='pix';const hoje=c.dataPagamentoBrasilia(new Date());
    await c.pagamentoPeriodoHoje.events.click();assert.equal(c.pagamentoDataInicio.value,hoje);assert.equal(c.pagamentoDataFim.value,hoje);
    await c.pagamentoPeriodoMes.events.click();assert.equal(c.pagamentoDataInicio.value,hoje.slice(0,7)+'-01');assert.equal(c.pagamentoMetodoFiltro.value,'pix');
    await c.pagamentoFiltrosLimpar.events.click();assert.equal(c.pagamentoDataInicio.value,'');assert.equal(c.pagamentoDataFim.value,'');assert.equal(c.pagamentoMetodoFiltro.value,'');
});
test('resposta atrasada nao substitui consulta nova, nem um periodo invalido',async()=>{
    const pendentes=[];const c=tela(()=>new Promise(resolve=>pendentes.push(resolve)));
    const antiga=c.carregarPagamentos();const nova=c.carregarPagamentos();
    pendentes[1]([pagamento(2,'2026-10-10T12:00:00Z')]);await nova;
    pendentes[0]([pagamento(1,'2026-10-10T12:00:00Z')]);await antiga;assert.deepEqual(ids(c),[2]);
    const terceira=c.carregarPagamentos();c.pagamentoDataInicio.value='2026-10-11';c.pagamentoDataFim.value='2026-10-10';await c.carregarPagamentos();
    pendentes[2]([pagamento(3,'2026-10-10T12:00:00Z')]);await terceira;assert.equal(c.pagamentoResumoCards.rows.length,0);assert.match(c.pagamentoPeriodoFeedback.textContent,/data inicial/);
});
test('erro de rede remove totais antigos e permite nova tentativa',async()=>{
    let falha=false;const c=tela(async()=>{if(falha)throw Error('offline');return [pagamento(1,'2026-10-10T12:00:00Z')];});
    await c.carregarPagamentos();falha=true;await c.carregarPagamentos();
    assert.equal(c.pagamentoResumoCards.rows.length,0);assert.match(c.pagamentoPeriodoFeedback.textContent,/tentar novamente/);
    falha=false;await c.carregarPagamentos();assert.deepEqual(ids(c),[1]);assert.equal(c.pagamentoPeriodoFeedback.textContent,'');
});
