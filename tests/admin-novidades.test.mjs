import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarNovidadesAdmin, lerMarcadores } from '../public/admin/novidades.js';
const tick=()=>new Promise(r=>setImmediate(r));
function tela() {
    const elementos=new Map(), eventos={}, storage=new Map();let falhar=false, total=2, apiCustom;
    const el=id=>{if(!elementos.has(id))elementos.set(id,{textContent:'',hidden:false,disabled:false,setAttribute(){},addEventListener(nome,fn){this[nome]=fn;}});return elementos.get(id);};
    const api=async path=>{
        if(apiCustom)return apiCustom(path);
        if(falhar)throw Error('offline');
        const p=new URL(path,'https://loja.example').searchParams;
        return Object.fromEntries(['pedidos','solicitacoes','pagamentos','clientes'].map(nome=>[nome,{novos:Math.max(0,total-Number(p.get(nome))),ultimoId:total}]));
    };
    const controlador=criarNovidadesAdmin({api,document:{querySelector:el,visibilityState:'visible',addEventListener(){}},window:{setInterval:()=>1,clearInterval(){},addEventListener:(nome,fn)=>eventos[nome]=fn},storage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}});
    return {controlador,el,storage,eventos,setTotal:n=>total=n,setFalha:v=>falhar=v,setApi:fn=>apiCustom=fn};
}
test('marcadores corrompidos ou negativos nao escondem novidades',()=>{
    assert.deepEqual(lerMarcadores('{'),{pedidos:0,solicitacoes:0,pagamentos:0,clientes:0});
    assert.equal(lerMarcadores('{"pedidos":-1,"clientes":999999999999}').pedidos,0);
    assert.equal(lerMarcadores('null').clientes,0);
});
test('abrir secao nao marca leitura; chegada posterior continua nova e admins sao separados',async()=>{
    const t=tela();t.controlador.iniciar(1);await tick();t.controlador.selecionar('pedidos');
    assert.equal(t.el('[data-novidades="pedidos"]').textContent,'2');assert.equal(t.storage.size,0);
    t.setTotal(3);await t.el('#novidades-vistas').click();
    assert.equal(JSON.parse(t.storage.get('lojaAdminNovidades:1')).pedidos,2);
    assert.equal(t.el('[data-novidades="pedidos"]').textContent,'1');assert.equal(t.el('[data-novidades="clientes"]').textContent,'3');
    t.controlador.iniciar(2);await tick();assert.equal(t.el('[data-novidades="pedidos"]').textContent,'3');
    t.controlador.iniciar(1);await tick();assert.equal(t.el('[data-novidades="pedidos"]').textContent,'1');
});
test('falha de consulta nao zera contadores; logout descarta resposta atrasada',async()=>{
    const t=tela();t.controlador.iniciar(1);await tick();t.controlador.selecionar('clientes');
    t.setFalha(true);await t.controlador.atualizar();assert.equal(t.el('[data-novidades="clientes"]').textContent,'2');assert.equal(t.el('#novidades-vistas').disabled,true);
    let concluir;t.setApi(()=>new Promise(r=>concluir=r));const consulta=t.controlador.atualizar();t.controlador.parar();
    concluir({clientes:{novos:8,ultimoId:8}});await consulta;assert.equal(t.el('[data-novidades="clientes"]').hidden,true);assert.equal(t.el('#novidades-painel').hidden,true);
});
