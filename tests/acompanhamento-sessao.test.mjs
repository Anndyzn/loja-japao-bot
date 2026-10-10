import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const sessao = (await readFile(new URL('../public/loja/pedido-sessao.js',import.meta.url),'utf8')).replaceAll('export function ','function ');
const source = await readFile(new URL('../public/loja/acompanhamento.js',import.meta.url),'utf8');
const atalho = source.slice(source.indexOf('let consultaAcompanhamento ='),source.indexOf('const etapas ='));
const consulta = source.slice(source.indexOf('async function buscarPedido('));
class Elemento {
    value='';textContent='';children=[];events={};hidden=false;
    classList={add:()=>{this.hidden=true;},toggle:(_,valor)=>{this.hidden=valor;}};
    append(...children){this.children.push(...children);}
    replaceChildren(...children){this.children=children;}
    addEventListener(nome,callback){this.events[nome]=callback;}
    focus(){}
    requestSubmit(){this.pendente=this.events.submit({preventDefault(){}});return this.pendente;}
}
function tela({salvo,query='',api=async()=>({status:'pago'}),bloqueado=false}={}){
    const storage=new Map(salvo===undefined?[]:[['lojaJapaoUltimoPedido',typeof salvo==='string'?salvo:JSON.stringify(salvo)]]);
    const container=new Elemento(),calls=[];
    const c={URLSearchParams,window:{location:{search:query}},trackingForm:new Elemento(),pedidoIdInput:new Elemento(),telefoneInput:new Elemento(),trackingResult:new Elemento(),
        normalizarDigitos:v=>String(v??'').replace(/\D/g,''),
        sessionStorage:{getItem:k=>{if(bloqueado)throw Error('bloqueado');return storage.get(k);},setItem:(k,v)=>{if(bloqueado)throw Error('bloqueado');storage.set(k,v);},removeItem:k=>storage.delete(k)},
        document:{querySelector:()=>container,createElement:()=>new Elemento()},
        setFeedback:msg=>{c.feedback=msg;},renderizarPedido:p=>{c.pedido=p;},apiFetch:async url=>{calls.push(url);return api(url);}};
    vm.createContext(c);vm.runInContext(sessao+atalho+consulta,c);
    return {c,storage,container,calls,pronto:()=>c.trackingForm.pendente};
}
test('abrir acompanhamento sem numero na URL recupera referencia e consulta status atual',async()=>{
    const t=tela({salvo:{id:42,telefone:'11999990000'}});await t.pronto();
    assert.equal(t.calls[0],'/pedidos/42/acompanhamento?telefone=11999990000');
    assert.equal(t.c.pedido.status,'pago');assert.equal(t.c.pedidoIdInput.value,'42');
});
test('link de outro pedido prevalece e nao reaproveita telefone do pedido salvo',async()=>{
    const t=tela({salvo:{id:42,telefone:'11999990000'},query:'?pedido=99'});
    assert.equal(t.c.pedidoIdInput.value,'99');assert.equal(t.c.telefoneInput.value,'');assert.equal(t.calls.length,0);
});
test('consulta sem autorizacao nao substitui referencia anterior',async()=>{
    const t=tela({salvo:{id:42,telefone:'11999990000'},query:'?pedido=99',api:async()=>{throw Error('Telefone nao confere');}});
    t.c.telefoneInput.value='11888880000';await t.c.trackingForm.requestSubmit();
    assert.equal(JSON.parse(t.storage.get('lojaJapaoUltimoPedido')).id,42);assert.match(t.c.feedback,/nao confere/);
});
test('dados invalidos, JSON corrompido e storage bloqueado permitem consulta manual',async()=>{
    for(const salvo of ['{quebrado',{id:-1,telefone:'11999990000'},{id:42,telefone:'abc'}]){
        const t=tela({salvo});assert.equal(t.calls.length,0);assert.equal(t.container.hidden,true);
    }
    const t=tela({bloqueado:true,query:'?pedido=42'});t.c.telefoneInput.value='11999990000';await t.c.trackingForm.requestSubmit();
    assert.equal(t.c.pedido.status,'pago');assert.equal(t.c.feedback,'Pedido encontrado.');
});
test('esquecer remove atalho e resultado sem alterar o pedido no servidor',async()=>{
    const t=tela({salvo:{id:42,telefone:'11999990000'}});await t.pronto();
    t.container.children[1].children[1].events.click();
    assert.equal(t.storage.has('lojaJapaoUltimoPedido'),false);assert.equal(t.c.telefoneInput.value,'');
    assert.equal(t.c.trackingResult.hidden,true);assert.equal(t.calls.length,1);
});
test('resposta antiga nao sobrescreve novo pedido e nao recria atalho esquecido',async()=>{
    const pendentes=[];const t=tela({api:()=>new Promise(resolve=>pendentes.push(resolve))});
    const primeira=t.c.buscarPedido(1,'11999990000'),segunda=t.c.buscarPedido(2,'11888880000');
    pendentes[1]({status:'enviado'});await segunda;pendentes[0]({status:'pendente'});await primeira;
    assert.equal(t.c.pedido.status,'enviado');assert.equal(JSON.parse(t.storage.get('lojaJapaoUltimoPedido')).id,2);
    const terceira=t.c.buscarPedido(2,'11888880000');t.container.children[1].children[1].events.click();
    pendentes[2]({status:'enviado'});await terceira;assert.equal(t.storage.has('lojaJapaoUltimoPedido'),false);
});
