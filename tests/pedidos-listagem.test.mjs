import { test, after, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

// Todas as leituras do banco sao substituidas por dados de teste; nada e gravado.
process.env.DATABASE_URL = 'postgresql://teste:teste@localhost:5432/teste';
const { prisma } = await import('../src/lib/prisma.ts');
const { listarPedidos, listarPedidosPorCliente } = await import('../src/controllers/pedidos.controller.ts');
const registros = Array.from({length:96}, (_,i) => {
    const id=i+1;
    return {
        id, clienteId:id%2+1, total:10,
        status:id<=60?'enviado':id<=85?'pendente':id<=95?'pago':'cancelado',
        transportadora:id>=92&&id<=95?'Correios':null,
        codigoRastreio:id>=92&&id<=95?'BR123':null,
        criadoEm:new Date('2026-01-01T12:00:00Z'), observacao:null,
        entregaNome:null, entregaTelefone:null, entregaEndereco:null,
        cliente:{id:id%2+1,nome:'Jo\u00e3o',telefone:'(11) 99999-1234'},
        itens:[{produtoId:1,nomeProduto:'Kitkat',quantidade:1,precoUnitario:10,subtotal:10}]
    };
});
const originalPedidos = prisma.pedido.findMany;
const originalCliente = prisma.cliente.findUnique;
const consulta=mock.fn(async ({where={}}) => registros.filter(p =>
    (!where.status || p.status===where.status) && (!where.clienteId || p.clienteId===where.clienteId)));
prisma.pedido.findMany = consulta;
prisma.cliente.findUnique = async ({where}) => where.id<=2?{id:where.id,nome:'Joao',telefone:'11999991234',endereco:'Rua'}:null;
after(async()=> {prisma.pedido.findMany=originalPedidos;prisma.cliente.findUnique=originalCliente;await prisma.$disconnect();});
async function listar(query={}, clienteId) {
    const res={code:200,body:null,status(code){this.code=code;return this;},json(body){this.body=body;return this;}};
    const req={query,params:{clienteId:String(clienteId)}};
    await (clienteId===undefined?listarPedidos:listarPedidosPorCliente)(req,res);
    return res;
}
test('acao encontra pedidos alem dos primeiros 50; resumo engloba todas as paginas',async()=>{
    const {body}=await listar({acao:'pix',limite:'10'});
    assert.equal(body.total,25);assert.equal(body.totalPaginas,3);
    assert.deepEqual(body.dados.map(p=>p.id),[85,84,83,82,81,80,79,78,77,76]);
    assert.equal(body.resumo.valorTotal,250);assert.equal(body.resumo.acoes.pix,25);
    const segunda=(await listar({acao:'pix',limite:'10',pagina:'2'})).body;
    const terceira=(await listar({acao:'pix',limite:'10',pagina:'3'})).body;
    const ids=[...body.dados,...segunda.dados,...terceira.dados].map(p=>p.id);
    assert.equal(new Set(ids).size,25);assert.equal(terceira.dados.length,5);
});
test('fila aplica prioridade antes de paginar e desempata por ID',async()=>{
    const {body}=await listar({precisaAcao:'true',limite:'50'});
    assert.equal(body.total,35);
    assert.equal(body.dados[0].id,85);assert.equal(body.dados[25].id,91);assert.equal(body.dados[31].id,95);
    assert.deepEqual(body.resumo.acoes,{pix:25,rastreio:6,envio:4});
});
test('filtros combinam cliente, status, acao e busca parcial normalizada',async()=>{
    const {body}=await listar({acao:'rastreio',status:'pago',busca:'joao'},1);
    assert.deepEqual(body.dados.map(p=>p.id),[90,88,86]);
    assert.equal((await listar({acao:'envio',busca:'999991234'})).body.total,4);
    assert.equal((await listar({acao:'pix',busca:'kit'})).body.total,25);
    assert.equal((await listar({acao:'pix',busca:'#8'})).body.total,6);
});
test('combinacao sem resultados e pagina alem do fim preservam metadados',async()=>{
    const vazio=(await listar({acao:'pix',status:'enviado'})).body;
    assert.equal(vazio.total,0);assert.equal(vazio.totalPaginas,0);assert.deepEqual(vazio.dados,[]);
    const fora=(await listar({acao:'pix',pagina:'9'})).body;
    assert.equal(fora.total,25);assert.deepEqual(fora.dados,[]);
    assert.equal((await listar({precisaAcao:'false',limite:'50'})).body.total,96);
});
test('parametros invalidos retornam 400 antes da consulta de pedidos',async()=>{
    const antes=consulta.mock.callCount();
    for(const query of [{acao:'invalida'},{acao:['pix']},{precisaAcao:'sim'},{pagina:'0'},{limite:'51'},{status:'xxx'},{busca:{nome:'a'}}]) {
        assert.equal((await listar(query)).code,400);
    }
    assert.equal(consulta.mock.callCount(),antes);
    assert.equal((await listar({},999)).code,404);
});

const source=await readFile(new URL('../public/admin/app.js',import.meta.url),'utf8');
const loader=source.slice(source.indexOf('async function carregarPedidos(paginaSolicitada)'),source.indexOf('async function carregarDadosFormularioPedido('));
function tela(api) {
    const elemento=()=>({value:'',checked:false,disabled:false,textContent:'',setAttribute(){},removeAttribute(){},replaceChildren(...rows){this.rows=rows;}});
    const c={URLSearchParams,apiFetch:api,carregarDadosFormularioPedido:async()=>{},pedidoConsultaAtual:0,pedidoPaginaAtual:1,pedidoTotalPaginas:0,pedidoFiltrosAtuais:'',pedidoClienteFiltro:null,
        criarLinhaPedido:p=>p,criarLinhaVazia:(_,text)=>text,atualizarContextoFiltroPedidos(){},atualizarResumoListaPedidos(r){c.resumo=r;},appFeedback:{},setFeedback(){}};
    for(const k of ['pedidoLimite','pedidoStatusFiltro','pedidoBuscaFiltro','pedidoPrecisaAcaoFiltro','pedidoAcaoFiltro','pedidoPaginaAnterior','pedidoPaginaProxima','pedidoPaginaInfo','pedidosTbody','pedidoListaResumo']) c[k]=elemento();
    c.pedidoLimite.value='10';vm.createContext(c);vm.runInContext(loader,c);return c;
}
function pagina(numero,total=25) {return {pagina:numero,limite:10,total,totalPaginas:Math.ceil(total/10),dados:total?[{id:numero}]:[],resumo:{}};}
test('admin preserva pagina ao atualizar e reinicia ao mudar filtro ou cliente',async()=>{
    const urls=[];const c=tela(async url=>{urls.push(url);return pagina(Number(new URL(url,'http://teste').searchParams.get('pagina')));});
    await c.carregarPedidos();await c.carregarPedidos(2);await c.carregarPedidos();
    assert.equal(c.pedidoPaginaAtual,2);assert.match(urls.at(-1),/pagina=2/);
    c.pedidoAcaoFiltro.value='pix';await c.carregarPedidos();assert.equal(c.pedidoPaginaAtual,1);
    c.pedidoClienteFiltro={id:2};await c.carregarPedidos();assert.match(urls.at(-1),/pedidos\/cliente\/2/);assert.match(urls.at(-1),/acao=pix/);
});
test('admin recua se ultima pagina esvaziar e desabilita navegacao sem resultados',async()=>{
    let total=25;const c=tela(async url=>pagina(Number(new URL(url,'http://teste').searchParams.get('pagina')),total));
    await c.carregarPedidos();await c.carregarPedidos(3);total=20;await c.carregarPedidos();assert.equal(c.pedidoPaginaAtual,2);
    total=0;await c.carregarPedidos();assert.equal(c.pedidoPaginaAtual,1);
    assert.equal(c.pedidoPaginaAnterior.disabled,true);assert.equal(c.pedidoPaginaProxima.disabled,true);
});
test('resposta antiga nao sobrescreve uma busca mais recente',async()=>{
    const pendentes=[];const c=tela(()=>new Promise(resolve=>pendentes.push(resolve)));
    const antiga=c.carregarPedidos();await new Promise(resolve=>setImmediate(resolve));
    c.pedidoBuscaFiltro.value='nova';const nova=c.carregarPedidos();await new Promise(resolve=>setImmediate(resolve));
    pendentes[1]({...pagina(1),dados:[{id:99}]});await nova;
    pendentes[0]({...pagina(1),dados:[{id:1}]});await antiga;
    assert.equal(c.pedidosTbody.rows[0].id,99);
});
test('falha de rede mostra erro e permite tentar novamente',async()=>{
    let falha=true;const c=tela(async()=>{if(falha)throw Error('Sem conexao');return pagina(1);});
    await c.carregarPedidos();assert.equal(c.pedidoPaginaInfo.textContent,'Falha ao carregar');assert.equal(c.pedidoPaginaProxima.disabled,true);
    falha=false;await c.carregarPedidos();assert.equal(c.pedidoPaginaProxima.disabled,false);
});
