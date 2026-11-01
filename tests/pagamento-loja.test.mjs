import {test,mock} from 'node:test';
import assert from 'node:assert/strict';
import {criarQuadroPagamento} from '../public/loja/pagamento.js';
class Elemento {
    children=[];events={};textContent='';disabled=false;hidden=false;
    constructor(tag){this.tag=tag;}
    append(...itens){this.children.push(...itens);}
    setAttribute(){}
    addEventListener(nome,acao){this.events[nome]=acao;}
}
const arvore=el=>[el,...el.children.flatMap(arvore)];
globalThis.document={createElement:tag=>new Elemento(tag)};
const pedido={id:10,status:'pendente',total:28.75,mercadoPago:{disponivel:true,iniciada:false,linkCriado:false,revisao:false,status:null}};
test('teste exibe aviso, respeita pendente, revisao e modo desativado',()=>{
    const botoes=p=>arvore(criarQuadroPagamento(p)).filter(n=>n.tag==='button');
    assert.match(arvore(criarQuadroPagamento(pedido)).map(n=>n.textContent).join(' '),/Não use cartão ou dinheiro real/);
    assert.equal(botoes(pedido)[0].hidden,false);
    assert.equal(botoes({...pedido,status:'pago'})[0].hidden,true);
    assert.equal(botoes({...pedido,mercadoPago:{...pedido.mercadoPago,revisao:true}})[0].hidden,true);
    assert.equal(botoes({...pedido,mercadoPago:{...pedido.mercadoPago,disponivel:false,iniciada:true}})[0].disabled,true);
    assert.equal(criarQuadroPagamento({...pedido,status:'cancelado'}),null);
    const manual=criarQuadroPagamento({...pedido,mercadoPago:null,pix:{chave:'chave-teste',recebedor:'Loja'}});
    assert.ok(arvore(manual).some(n=>n.textContent==='Pagamento por Pix'));
});
test('botao envia apenas id do pedido com protecao CSRF; URL externa indevida nao abre',async()=>{
    const destinos=[];globalThis.location={assign:url=>destinos.push(url)};
    const interceptar=mock.method(globalThis,'fetch',async(url,options)=>{
        assert.equal(url,'/mercado-pago/pedidos/10/iniciar');
        assert.equal(options.headers['X-Loja-Cliente'],'1');
        assert.equal(options.body,'{}');
        return Response.json({url:'https://site-indevido.example'});
    });
    try{
        const nodes=arvore(criarQuadroPagamento(pedido));const botao=nodes.find(n=>n.tag==='button');
        await botao.events.click();assert.equal(destinos.length,0);assert.equal(botao.disabled,false);
        assert.ok(nodes.some(n=>n.textContent.includes('link de pagamento')));
    }finally{interceptar.mock.restore();}
});
test('consulta nao aceita status da URL: usa backend e atualiza apenas com resposta',async()=>{
    const destinos=[];globalThis.location={assign:url=>destinos.push(url)};
    const interceptar=mock.method(globalThis,'fetch',async()=>Response.json({mensagem:'Confirmado pela API',status:'pago',mercadoPago:{status:'processed',revisao:false}}));
    try{
        const nodes=arvore(criarQuadroPagamento({...pedido,mercadoPago:{...pedido.mercadoPago,iniciada:true,linkCriado:true}}));
        await nodes.find(n=>n.textContent==='Verificar pagamento').events.click();
        assert.deepEqual(destinos,['/loja/acompanhamento?pedido=10']);
    }finally{interceptar.mock.restore();}
});

test('tentativa salva sem link nao oferece continuar ou verificar; erro preserva orientacao',async()=>{
    const nodes=arvore(criarQuadroPagamento({...pedido,mercadoPago:{...pedido.mercadoPago,iniciada:true,linkCriado:false}}));
    const botoes=nodes.filter(n=>n.tag==='button');
    assert.equal(botoes[0].textContent,'Testar pagamento no Mercado Pago');
    assert.equal(botoes[1].hidden,true);
    const interceptar=mock.method(globalThis,'fetch',async()=>Response.json({mensagem:'Falha ao preparar link. Tente novamente.'},{status:502}));
    try {
        await botoes[0].events.click();
        assert.equal(botoes[0].disabled,false);
        assert.equal(botoes[1].hidden,true);
        assert.ok(nodes.some(n=>n.textContent==='Falha ao preparar link. Tente novamente.'));
    } finally {interceptar.mock.restore();}
    const pronta=arvore(criarQuadroPagamento({...pedido,mercadoPago:{...pedido.mercadoPago,iniciada:true,linkCriado:true}}));
    assert.equal(pronta.find(n=>n.textContent==='Continuar no Mercado Pago').hidden,false);
    assert.equal(pronta.find(n=>n.textContent==='Verificar pagamento').hidden,false);
});
