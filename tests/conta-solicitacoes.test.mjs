import {test} from 'node:test';
import assert from 'node:assert/strict';
import {criarCardSolicitacao,iniciarSolicitacoesConta} from '../public/loja/conta-solicitacoes.js';
class Elemento {
    children=[];events={};textContent='';disabled=false;hidden=false;
    constructor(tag){this.tag=tag;}
    append(...items){this.children.push(...items);}
    replaceChildren(...items){this.children=items;}
    setAttribute(){}
    addEventListener(nome,handler){this.events[nome]=handler;}
}
const document={createElement:tag=>new Elemento(tag)};
const arvore=el=>[el,...el.children.flatMap(arvore)];
const solicitacao={id:1,nomeProduto:'<img src=x onerror=alert(1)>',descricao:'Descricao longa',criadoEm:'2026-10-11T15:00:00Z',status:'cotada',cotacao:{valor:50,freteInternacional:null,tipoEnvio:'nacional'},pedidoId:null};
test('cards usam texto seguro e diferenciam cotacao de pagamento',()=>{
    const nodes=arvore(criarCardSolicitacao(solicitacao,document));
    assert.ok(nodes.some(n=>n.textContent.includes('<img')));assert.ok(!nodes.some(n=>n.tag==='img'));
    assert.ok(nodes.some(n=>n.textContent.includes('Aguarde a criação')));assert.ok(!nodes.some(n=>n.tag==='a'));
    const comPedido=arvore(criarCardSolicitacao({...solicitacao,pedidoId:42},document));assert.equal(comPedido.find(n=>n.tag==='a').href,'/loja/acompanhamento?pedido=42');assert.ok(comPedido.some(n=>n.textContent==='Pedido gerado'));
});
function tela(api){
    const elements=new Map();const el=id=>{if(!elements.has(id))elements.set(id,new Elemento('div'));return elements.get(id);};
    const controlador=iniciarSolicitacoesConta({document:{...document,getElementById:el},api});
    return {el,controlador};
}
const tick=()=>new Promise(r=>setImmediate(r));
test('lista pagina sem duplicar, permite atualizar e recuperar de falha',async()=>{
    let falhar=false;
    const t=tela(async caminho=>{if(falhar)throw Error('offline');const pagina=Number(new URL(caminho,'https://loja.example').searchParams.get('pagina'));return{pagina,totalPaginas:2,dados:[{...solicitacao,id:pagina}]};});
    await t.controlador.iniciar();assert.equal(t.el('solicitacoes-anterior').disabled,true);assert.equal(t.el('solicitacoes-proxima').disabled,false);
    t.el('solicitacoes-proxima').events.click();await tick();assert.equal(t.el('solicitacoes-proxima').disabled,true);assert.equal(t.el('conta-solicitacoes').children.length,1);
    falhar=true;t.el('solicitacoes-atualizar').events.click();await tick();assert.equal(t.el('conta-solicitacoes').children.length,0);assert.ok(t.el('solicitacoes-feedback').textContent.includes('Não foi possível'));assert.equal(t.el('solicitacoes-atualizar').disabled,false);
    falhar=false;t.el('solicitacoes-atualizar').events.click();await tick();assert.equal(t.el('conta-solicitacoes').children.length,1);
});
test('logout descarta resposta atrasada; sessao expirada oferece login sem dados anteriores',async()=>{
    let concluir;const t=tela(()=>new Promise(r=>concluir=r));const pendente=t.controlador.iniciar();t.controlador.limpar();concluir({pagina:1,totalPaginas:1,dados:[solicitacao]});await pendente;assert.equal(t.el('conta-solicitacoes').children.length,0);
    const expirada=tela(async()=>{throw Object.assign(Error('Entre'),{status:401});});await expirada.controlador.iniciar();assert.ok(expirada.el('solicitacoes-feedback').textContent.includes('expirou'));assert.equal(expirada.el('conta-solicitacoes').children[0].href,'/loja/conta');
});
