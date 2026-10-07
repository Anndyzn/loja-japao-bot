import { test, after } from 'node:test';
import assert from 'node:assert/strict';
const nome=process.env.CONSISTENCIA_DATABASE_NAME;
if(!/^loja_japao_test_[a-f0-9]{32}$/.test(nome??'') || new URL(process.env.DATABASE_URL).pathname!=='/'+nome) {
    throw Error('Execute npm run test:consistencia para usar um banco temporario isolado.');
}
const {prisma}=await import('../src/lib/prisma.ts');
const {criarPedido:criarPedidoReal,atualizarStatusPedidoPorId:status,atualizarRastreioPedidoPorId:rastreio}=await import('../src/services/pedidos.service.ts');
const {criarPagamento:pagar}=await import('../src/services/pagamentos.service.ts');
const {assinarCotacaoFrete,cotarFrete,validarCotacaoFrete}=await import('../src/services/fretes.service.ts');
const {env}=await import('../src/config/env.ts');
const freteTeste={valor:18.75,servicoId:'1',servico:'PAC',transportadora:'Correios',prazoDias:5,ambiente:'sandbox'};
async function criarPedido(clienteId,itens,observacao) {
    const produtos=await prisma.produto.findMany({where:{id:{in:itens.map(i=>i.produtoId)}}});
    const clienteAtual=await prisma.cliente.findUniqueOrThrow({where:{id:clienteId}});
    const token=assinarCotacaoFrete(freteTeste,itens.map(i=>({produto:produtos.find(p=>p.id===i.produtoId),quantidade:i.quantidade})),clienteAtual.cep).token;
    return criarPedidoReal(clienteId,itens,observacao,{freteToken:token});
}
after(async()=>{await prisma.$disconnect();});
const cliente=await prisma.cliente.create({data:{nome:'Cliente teste',telefone:'11999990000',endereco:'Rua teste',cep:'01001000',numero:'1',bairro:'Centro',cidade:'Sao Paulo',estado:'SP'}});
async function produto(estoque=5){return prisma.produto.create({data:{nome:'Produto teste',preco:10,estoque,pesoKg:0.2,alturaCm:5,larguraCm:12,comprimentoCm:18}});}
async function criar(p,quantidade=1){return criarPedido(cliente.id,[{produtoId:p.id,quantidade}],undefined);}
async function fixture(){const p=await produto();const result=await criar(p);assert.ok(result.pedido);return {p,id:result.pedido.id};}
async function estoque(p){return (await prisma.produto.findUniqueOrThrow({where:{id:p.id}})).estoque;}
async function estado(id){return prisma.pedido.findUniqueOrThrow({where:{id},include:{pagamentos:true,historico:true}});}

test('duas confirmacoes simultaneas registram um unico Pix e historico',async()=>{
    const {p,id}=await fixture();const resultados=await Promise.all([pagar(id,'pix'),pagar(id,'pix')]);
    assert.equal(resultados.filter(r=>r.pagamento).length,1);assert.equal(resultados.filter(r=>r.mensagemErro).length,1);
    const pedido=await estado(id);assert.equal(pedido.status,'pago');assert.equal(pedido.pagamentos.length,1);
    assert.equal(pedido.historico.filter(h=>h.status==='pago').length,1);assert.equal(await estoque(p),4);
});
test('cancelamentos simultaneos e repetidos devolvem estoque uma unica vez',async()=>{
    const {p,id}=await fixture();await Promise.all([status(id,'cancelado'),status(id,'cancelado')]);await status(id,'cancelado');
    const pedido=await estado(id);assert.equal(pedido.status,'cancelado');assert.equal(await estoque(p),5);
    assert.equal(pedido.historico.filter(h=>h.status==='cancelado').length,1);
    assert.ok((await pagar(id,'pix')).mensagemErro);assert.ok((await status(id,'pendente')).mensagemErro);
});
test('Pix concorrente com cancelamento nao reabre pedido nem duplica estoque',async()=>{
    const {p,id}=await fixture();await Promise.all([pagar(id,'pix'),status(id,'cancelado')]);
    const pedido=await estado(id);assert.equal(pedido.status,'cancelado');assert.ok(pedido.pagamentos.length<=1);
    assert.equal(await estoque(p),5);assert.ok((await pagar(id,'pix')).mensagemErro);
});
test('duas compras da ultima unidade aprovam somente um pedido',async()=>{
    const p=await produto(1);const resultados=await Promise.all([criar(p),criar(p)]);
    assert.equal(resultados.filter(r=>r.pedido).length,1);assert.equal(resultados.filter(r=>r.mensagemErro).length,1);
    assert.equal(await estoque(p),0);assert.equal(await prisma.itemPedido.count({where:{produtoId:p.id}}),1);
});
test('compras com produtos em ordem inversa terminam sem estoque negativo',async()=>{
    const a=await produto(2),b=await produto(2);
    const comprar=itens=>criarPedido(cliente.id,itens.map(p=>({produtoId:p.id,quantidade:1})),undefined);
    const resultados=await Promise.all([comprar([a,b]),comprar([b,a])]);
    assert.ok(resultados.every(r=>r.pedido));assert.equal(await estoque(a),0);assert.equal(await estoque(b),0);
});
test('produto insuficiente nao reduz parcialmente o estoque dos outros itens',async()=>{
    const a=await produto(2),b=await produto(0);
    const r=await criarPedido(cliente.id,[{produtoId:a.id,quantidade:1},{produtoId:b.id,quantidade:1}],undefined);
    assert.ok(r.mensagemErro);assert.equal(await estoque(a),2);assert.equal(await estoque(b),0);
});
test('pago so pela confirmacao Pix; envio exige pagamento e rastreio; etapas nao retrocedem',async()=>{
    const {p,id}=await fixture();assert.ok((await status(id,'pago')).mensagemErro);assert.ok((await status(id,'enviado')).mensagemErro);
    assert.equal((await estado(id)).status,'pendente');
    await pagar(id,'pix');assert.ok((await status(id,'pendente')).mensagemErro);assert.ok((await status(id,'enviado')).mensagemErro);
    await rastreio(id,'Correios','BR123');assert.ok((await status(id,'enviado')).pedido);
    await status(id,'enviado');assert.ok((await status(id,'cancelado')).mensagemErro);assert.ok((await status(id,'pago')).mensagemErro);
    assert.equal((await estado(id)).historico.filter(h=>h.status==='enviado').length,1);assert.equal(await estoque(p),4);
});
test('envio concorrente com cancelamento termina em apenas uma das etapas',async()=>{
    const {p,id}=await fixture();await pagar(id,'pix');await rastreio(id,'Correios','BR456');
    await Promise.all([status(id,'enviado'),status(id,'cancelado')]);
    const pedido=await estado(id);assert.ok(['enviado','cancelado'].includes(pedido.status));
    assert.equal(await estoque(p),pedido.status==='cancelado'?5:4);
    assert.equal(pedido.historico.filter(h=>['enviado','cancelado'].includes(h.status)).length,1);
});
test('rastreios identicos simultaneos nao duplicam historico; cancelado nao aceita rastreio',async()=>{
    const {id}=await fixture();await pagar(id,'pix');await Promise.all([rastreio(id,'Correios','BR789'),rastreio(id,'Correios','BR789')]);
    assert.equal((await estado(id)).historico.filter(h=>h.descricao.startsWith('Rastreio informado')).length,1);
    await status(id,'cancelado');assert.ok((await rastreio(id,'Correios','OUTRO')).mensagemErro);
    assert.equal((await estado(id)).codigoRastreio,'BR789');
});
test('cancelar pago preserva pagamento e devolve estoque sem registrar estorno ficticio',async()=>{
    const {p,id}=await fixture();await pagar(id,'pix');await status(id,'cancelado');
    const pedido=await estado(id);assert.equal(pedido.pagamentos.length,1);assert.equal(pedido.pagamentos[0].status,'aprovado');assert.equal(await estoque(p),5);
});
test('registros antigos inconsistentes nao permitem envio sem pagamento nem segundo pagamento',async()=>{
    const {id}=await fixture();await prisma.pedido.update({where:{id},data:{status:'pago',transportadora:'Correios',codigoRastreio:'BR123'}});
    assert.ok((await status(id,'enviado')).mensagemErro);
    await prisma.pedido.update({where:{id},data:{status:'pendente'}});
    await prisma.pagamento.create({data:{pedidoId:id,valor:10,metodo:'pix'}});
    assert.ok((await pagar(id,'pix')).mensagemErro);assert.equal((await estado(id)).pagamentos.length,1);
});
test('falha no historico reverte pagamento, cancelamento e criacao por inteiro',async()=>{
    const f=await fixture(),p=await produto(3);
    // Trigger apenas no banco descartavel: simula falha real depois das escritas.
    await prisma.$executeRawUnsafe(`CREATE FUNCTION falhar_historico_teste() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Falha de teste'; END; $$`);
    await prisma.$executeRawUnsafe(`CREATE TRIGGER falha_teste BEFORE INSERT ON "HistoricoPedido" FOR EACH ROW EXECUTE FUNCTION falhar_historico_teste()`);
    try {
        await assert.rejects(pagar(f.id,'pix'));assert.equal((await estado(f.id)).status,'pendente');assert.equal((await estado(f.id)).pagamentos.length,0);
        await assert.rejects(status(f.id,'cancelado'));assert.equal(await estoque(f.p),4);assert.equal((await estado(f.id)).status,'pendente');
        await assert.rejects(criar(p));assert.equal(await estoque(p),3);assert.equal(await prisma.itemPedido.count({where:{produtoId:p.id}}),0);
    } finally {
        await prisma.$executeRawUnsafe('DROP TRIGGER falha_teste ON "HistoricoPedido"');
        await prisma.$executeRawUnsafe('DROP FUNCTION falhar_historico_teste()');
    }
});


test('migration preserva o total dos pedidos antigos como subtotal e frete zero',async()=>{
    const legado=await prisma.pedido.findFirstOrThrow({where:{observacao:'pedido-legado-teste'}});
    assert.equal(Number(legado.total),123.45);assert.equal(Number(legado.subtotalProdutos),123.45);
    assert.equal(Number(legado.freteValor),0);assert.equal(legado.freteServico,null);
});
test('cotacao usa dados do banco, agrupa quantidades e cobra frete no Pix',async()=>{
    const p=await produto(5);const original=globalThis.fetch;
    globalThis.fetch=async(url,options)=>{
        assert.match(url,/sandbox\.melhorenvio/);
        const body=JSON.parse(options.body);assert.equal(body.from.postal_code,'01001000');assert.equal(body.products.length,1);
        assert.equal(body.products[0].quantity,2);assert.equal(body.products[0].weight,0.2);assert.equal(body.products[0].insurance_value,10);
        assert.equal(body.to.postal_code,'01001000');
        return Response.json([{id:1,name:'PAC',company:{name:'Correios'},price:'999.00',custom_price:'18.75',delivery_time:99,custom_delivery_time:5},{id:2,error:'Indisponivel'}]);
    };
    try {
        const cotacao=await cotarFrete('01001-000',[{produtoId:p.id,quantidade:1},{produtoId:p.id,quantidade:1}]);
        assert.equal(cotacao.subtotalProdutos,20);assert.equal(cotacao.opcoes.length,1);assert.equal(cotacao.opcoes[0].valor,18.75);assert.equal(cotacao.opcoes[0].prazoDias,5);
        assert.ok(!JSON.stringify(cotacao).includes(env.MELHOR_ENVIO_TOKEN));
        const pedido=(await criarPedidoReal(cliente.id,[{produtoId:p.id,quantidade:2}],undefined,{freteToken:cotacao.opcoes[0].token})).pedido;
        assert.ok(pedido);assert.equal(pedido.total,38.75);assert.equal(pedido.subtotalProdutos,20);assert.equal(pedido.freteValor,18.75);
        assert.equal((await pagar(pedido.id,'pix')).pagamento.valor,38.75);
        await status(pedido.id,'cancelado');assert.equal(await estoque(p),5);
    } finally {globalThis.fetch=original;}
});
test('frete adulterado, expirado, CEP diferente ou preco alterado nao cria pedido nem baixa estoque',async()=>{
    const p=await produto();const itens=[{produto:p,quantidade:1}];
    const token=assinarCotacaoFrete(freteTeste,itens,cliente.cep).token;
    const [body,hash]=token.split('.');const decoded=JSON.parse(Buffer.from(body,'base64url').toString());decoded.frete.valor=0;
    const adulterado=Buffer.from(JSON.stringify(decoded)).toString('base64url')+'.'+hash;
    const expirado=assinarCotacaoFrete(freteTeste,itens,cliente.cep,Date.now()-1).token;
    const outroCep=assinarCotacaoFrete(freteTeste,itens,'22041001').token;
    for(const freteToken of [undefined,adulterado,expirado,outroCep]) {
        assert.ok((await criarPedidoReal(cliente.id,[{produtoId:p.id,quantidade:1}],undefined,{freteToken})).mensagemErro);
    }
    assert.throws(()=>validarCotacaoFrete(token,[{produto:p,quantidade:2}],cliente.cep));
    await prisma.produto.update({where:{id:p.id},data:{preco:11}});
    assert.ok((await criarPedidoReal(cliente.id,[{produtoId:p.id,quantidade:1}],undefined,{freteToken:token})).mensagemErro);
    assert.equal(await estoque(p),5);assert.equal(await prisma.itemPedido.count({where:{produtoId:p.id}}),0);
});
test('cotacao rejeita medidas ausentes, produtos internos sem admin, CEP e quantidades invalidos',async()=>{
    const p=await produto();const original=globalThis.fetch;
    globalThis.fetch=async()=>{throw Error('Nao deve acessar o provedor');};
    try {
        await assert.rejects(cotarFrete('xxx',[]));
        await assert.rejects(cotarFrete(cliente.cep,[{produtoId:p.id,quantidade:0}]));
        await prisma.produto.update({where:{id:p.id},data:{pesoKg:null}});
        await assert.rejects(cotarFrete(cliente.cep,[{produtoId:p.id,quantidade:1}]),/peso e medidas/);
        await prisma.produto.update({where:{id:p.id},data:{pesoKg:0.2,publicadoNaLoja:false}});
        await assert.rejects(cotarFrete(cliente.cep,[{produtoId:p.id,quantidade:1}]),/disponivel/);
    } finally {globalThis.fetch=original;}
});
test('falha ou resposta incompleta do provedor nunca vira frete gratis',async()=>{
    const p=await produto();const original=globalThis.fetch;
    const requisicao=()=>cotarFrete(cliente.cep,[{produtoId:p.id,quantidade:1}]);
    try {
        globalThis.fetch=async()=>{throw Error('Timeout');};await assert.rejects(requisicao(),/Tente novamente/);
        globalThis.fetch=async()=>new Response('',{status:401});await assert.rejects(requisicao(),/indisponivel/);
        globalThis.fetch=async()=>Response.json({erro:'formato'});await assert.rejects(requisicao(),/invalida/);
        globalThis.fetch=async()=>Response.json([{id:1,name:'PAC',company:{name:'Correios'},price:'10.00',custom_price:null,custom_delivery_time:null}]);await assert.rejects(requisicao(),/Nenhuma opcao/);
    } finally {globalThis.fetch=original;}
});
test('producao nao aceita cotacoes sandbox; medidas e origem alteradas invalidam cotacao',async()=>{
    const p=await produto();const itens=[{produto:p,quantidade:1}];const token=assinarCotacaoFrete(freteTeste,itens,cliente.cep).token;
    assert.throws(()=>validarCotacaoFrete(token,[{produto:{...p,alturaCm:7},quantidade:1}],cliente.cep));
    const origem=env.FRETE_CEP_ORIGEM;const producao=env.IS_PRODUCTION;
    try {
        env.FRETE_CEP_ORIGEM='22041001';assert.throws(()=>validarCotacaoFrete(token,itens,cliente.cep));
        env.FRETE_CEP_ORIGEM=origem;env.IS_PRODUCTION=true;assert.throws(()=>validarCotacaoFrete(token,itens,cliente.cep));
    } finally {env.FRETE_CEP_ORIGEM=origem;env.IS_PRODUCTION=producao;}
});
