import { randomUUID } from 'node:crypto';
import { test, after, mock } from 'node:test';
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
test('pedido internacional direto exige admin e ciencia das taxas sem mexer no estoque',async()=>{
    const p=await prisma.produto.create({data:{nome:'Produto internacional',preco:100,estoque:3,tipoEnvio:'internacional_direto',publicadoNaLoja:true}});
    const itens=[{produtoId:p.id,quantidade:1}];
    assert.ok((await criarPedidoReal(cliente.id,itens,undefined,{tipoEnvio:'internacional_direto',freteInternacionalValor:45,clienteCienteTaxasImportacao:true})).mensagemErro);
    assert.ok((await criarPedidoReal(cliente.id,itens,undefined,{tipoEnvio:'internacional_direto',permitirProdutoInterno:true,freteInternacionalValor:45})).mensagemErro);
    const pedido=(await criarPedidoReal(cliente.id,itens,'Solicitacao internacional',{tipoEnvio:'internacional_direto',permitirProdutoInterno:true,freteInternacionalValor:45,clienteCienteTaxasImportacao:true})).pedido;
    assert.ok(pedido);assert.equal(pedido.tipoEnvio,'internacional_direto');assert.equal(pedido.subtotalProdutos,100);
    assert.equal(pedido.freteValor,45);assert.equal(pedido.total,145);assert.equal(pedido.clienteCienteTaxasImportacao,true);
    assert.equal(await estoque(p),3);assert.equal((await pagar(pedido.id,'pix')).pagamento.valor,145);
    await status(pedido.id,'cancelado');assert.equal(await estoque(p),3);
});
test('pedido nacional com frete manual admin soma total e mantem controle de estoque',async()=>{
    const p=await produto(4);
    assert.ok((await criarPedidoReal(cliente.id,[{produtoId:p.id,quantidade:1}],undefined,{freteManualValor:12})).mensagemErro);
    const pedido=(await criarPedidoReal(cliente.id,[{produtoId:p.id,quantidade:2}],undefined,{permitirProdutoInterno:true,freteManualValor:12})).pedido;
    assert.ok(pedido);assert.equal(pedido.tipoEnvio,'nacional');assert.equal(pedido.subtotalProdutos,20);
    assert.equal(pedido.freteValor,12);assert.equal(pedido.total,32);assert.equal(pedido.freteAmbiente,'manual');
    assert.equal(await estoque(p),2);assert.equal((await pagar(pedido.id,'pix')).pagamento.valor,32);
    await status(pedido.id,'cancelado');assert.equal(await estoque(p),4);
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

test('contas de clientes e checkout autenticado via HTTP', async t => {
    const {default:express}=await import('express');
    const {once}=await import('node:events');
    const {checkoutRoutes}=await import('../src/routes/checkout.routes.ts');
    const {produtosRoutes}=await import('../src/routes/produtos.routes.ts');
    const {dashboardRoutes}=await import('../src/routes/dashboard.routes.ts');
    const {contaClienteRoutes}=await import('../src/routes/conta-cliente.routes.ts');
    const {clientesRoutes}=await import('../src/routes/clientes.routes.ts');
    const {pedidosRoutes}=await import('../src/routes/pedidos.routes.ts');
    const {solicitacoesRoutes}=await import('../src/routes/solicitacoes.routes.ts');
    const {gerarTokenAdmin}=await import('../src/utils/tokens.ts');
    const {tratarErros,tratarRotaNaoEncontrada}=await import('../src/middlewares/erros.middleware.ts');
    const {hashTokenCliente,entrarContaCliente,criarSessaoCliente}=await import('../src/services/conta-cliente.service.ts');
    const {limitarEscritaPublica}=await import('../src/middlewares/rate-limit.middleware.ts');
    const app=express();app.use(express.json());
    app.post('/teste-limite-publico',limitarEscritaPublica,(_req,res)=>res.json({ok:true}));
    // IPs distintos isolam os cenarios do limitador; so este servidor de teste confia no header.
    app.set('trust proxy',true);
    app.use('/produtos',produtosRoutes);
    app.use('/dashboard',dashboardRoutes);app.use('/checkout',checkoutRoutes);app.use('/conta',contaClienteRoutes);app.use('/clientes',clientesRoutes);
    app.use('/pedidos',pedidosRoutes);app.use('/solicitacoes',solicitacoesRoutes);app.use(tratarRotaNaoEncontrada);app.use(tratarErros);
    const server=app.listen(0,'127.0.0.1');await once(server,'listening');
    const base='http://127.0.0.1:'+server.address().port;
    const tokenAdmin=gerarTokenAdmin({id:1,email:'admin-teste@example.com'});
    let requisicao=0;
    async function request(rota,{body,cookie,admin=false,headers={}}={}){
        const r=await fetch(base+rota,{method:body===undefined?'GET':'POST',headers:{
            'Idempotency-Key':randomUUID(),'Content-Type':'application/json','X-Loja-Cliente':'1','X-Forwarded-For':'192.0.2.'+(++requisicao),
            ...(cookie?{Cookie:cookie}:{}),...(admin?{Authorization:'Bearer '+tokenAdmin}:{}),...headers
        },...(body===undefined?{}:{body:JSON.stringify(body)})});
        return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0],headers:r.headers};
    }
    function cpfTeste(numero) {
        let cpf=String(numero).padStart(9,'0');
        for(const tamanho of [9,10]) { let soma=0;for(let i=0;i<tamanho;i++)soma+=Number(cpf[i])*(tamanho+1-i);const resto=soma%11;cpf+=resto<2?0:11-resto; }
        return cpf;
    }
    const cadastro={nome:'Conta teste',cpf:'111.444.777-35',email:'conta@example.com',telefone:'11911112222',senha:'Senha-forte-teste-123'};
    const dados={nome:cadastro.nome,cpf:cadastro.cpf,telefone:cadastro.telefone,cep:'01001000',endereco:'Rua primeira',numero:'22',bairro:'Centro',cidade:'Sao Paulo',estado:'SP'};
    const post=(rota,body,cookie,extra={})=>request(rota,{body,cookie,...extra});
    async function compra(p,alteracoes={}){
        const clienteEntrega={...dados,...alteracoes};
        const freteToken=assinarCotacaoFrete(freteTeste,[{produto:p,quantidade:1}],clienteEntrega.cep).token;
        return {cliente:clienteEntrega,itens:[{produtoId:p.id,quantidade:1}],freteToken};
    }
    const {emailRecuperacao}=await import('../src/services/email-recuperacao.service.ts');
    const {aguardarEnviosRecuperacao}=await import('../src/services/recuperacao-senha.service.ts');
    let emailAtivo=false, falharEmail=false;const emails=[];
    const disponibilidadeMock=mock.method(emailRecuperacao,'disponivel',()=>emailAtivo);
    const envioMock=mock.method(emailRecuperacao,'enviar',async(email,token)=>{if(falharEmail)throw Error('Falha SMTP de teste');emails.push({email,token});});
    let cookie,clienteId,primeiroPedido;
    try {

        await t.test('categorias permitem classificar, filtrar, editar e remover sem perder dados',async()=>{
            const categorias=await request('/produtos/categorias');assert.equal(categorias.status,200);assert.equal(categorias.body.length,7);
            const dadosProduto={nome:'Produto categoria teste',preco:22,estoque:4,categoria:'comidas_doces'};
            assert.equal((await post('/produtos',dadosProduto)).status,401);
            const a=await post('/produtos',dadosProduto,undefined,{admin:true});assert.equal(a.status,201);assert.equal(a.body.categoria,'comidas_doces');assert.equal(a.body.categoriaNome,'Comidas e doces');
            const b=await post('/produtos',dadosProduto,undefined,{admin:true});assert.equal(b.status,201);
            const listagem=await request('/produtos?categoria=comidas_doces&limite=1');assert.equal(listagem.body.total,2);assert.equal(listagem.body.dados.length,1);assert.equal(listagem.body.totalPaginas,2);
            const editar=async (body,autenticado=true)=>{const r=await fetch(base+'/produtos/'+a.body.id,{method:'PATCH',headers:{'Content-Type':'application/json',...(autenticado?{Authorization:'Bearer '+tokenAdmin}:{})},body:JSON.stringify(body)});return {status:r.status,body:await r.json()};};
            assert.equal((await editar({categoria:'action_figures'},false)).status,401);
            const editado=await editar({categoria:'action_figures'});assert.equal(editado.status,200);assert.equal(editado.body.categoria,'action_figures');assert.equal(editado.body.preco,22);assert.equal(editado.body.estoque,4);
            const outroCampo=await editar({nome:'Produto renomeado'});assert.equal(outroCampo.body.categoria,'action_figures');
            for(const categoria of ['invalida','',123,{},['comidas_doces']]) {
                assert.equal((await editar({categoria})).status,400);
                assert.equal((await post('/produtos',{...dadosProduto,categoria},undefined,{admin:true})).status,400);
            }
            assert.equal((await editar({categoria:'eletronicos',nome:''})).status,400);
            assert.equal((await editar({categoria:'eletronicos',pesoKg:-1})).status,400);
            assert.equal((await request('/produtos?categoria=desconhecida')).status,400);
            assert.equal((await request('/produtos?categoria=outros&categoria=eletronicos')).status,400);
            const removida=await editar({categoria:null});assert.equal(removida.status,200);assert.equal(removida.body.categoria,null);assert.equal(removida.body.categoriaNome,'Sem categoria');
            const legado=await produto();assert.equal((await request('/produtos/'+legado.id)).body.categoria,null);
            const semCategoria=await request('/produtos?categoria=sem_categoria&limite=50');assert.ok(semCategoria.body.dados.some(p=>p.id===a.body.id));
            assert.equal((await request('/produtos?categoria=comidas_doces')).body.total,1);
        });
        await t.test('rotas administrativas e checkout exigem a autenticacao correta',async()=>{
            for(const rota of ['/clientes','/pedidos','/solicitacoes','/checkout']) {
                assert.equal((await post(rota,{clienteId:cliente.id})).status,401);
            }
            assert.equal((await request('/conta/me')).status,401);
            assert.equal((await post('/checkout',{},undefined,{admin:true})).status,401);
        });
        await t.test('novidades exigem admin e contam apenas registros acima dos marcadores',async()=>{
            assert.equal((await request('/dashboard/novidades')).status,401);
            for(const valor of ['-1','abc','1.5','2147483648'])assert.equal((await request('/dashboard/novidades?clientes='+valor,{admin:true})).status,400);
            const inicial=await request('/dashboard/novidades',{admin:true});assert.equal(inicial.status,200);assert.equal(inicial.headers.get('cache-control'),'no-store');
            const query=new URLSearchParams(Object.entries(inicial.body).map(([nome,dado])=>[nome,String(dado.ultimoId)]));
            const visto=await request('/dashboard/novidades?'+query,{admin:true});for(const dado of Object.values(visto.body))assert.equal(dado.novos,0);
            const novo=await prisma.cliente.create({data:{nome:'Novidade Teste',telefone:'11900000000',endereco:'Rua'}});
            const atual=await request('/dashboard/novidades?'+query,{admin:true});assert.equal(atual.body.clientes.novos,1);assert.equal(atual.body.clientes.ultimoId,novo.id);assert.equal(atual.body.pedidos.novos,0);assert.deepEqual(Object.keys(atual.body.clientes).sort(),['novos','ultimoId']);
        });
        await t.test('cadastro cria uma conta, cookie HttpOnly e nao retorna credenciais',async()=>{
            const antes=await prisma.cliente.count();const r=await post('/conta/registrar',cadastro);
            assert.equal(r.status,201);cookie=r.cookie;assert.ok(cookie);
            assert.match(r.headers.get('set-cookie'),/HttpOnly/);assert.match(r.headers.get('set-cookie'),/SameSite=Lax/);
            const me=await request('/conta/me',{cookie});assert.equal(me.status,200);clienteId=me.body.cliente.id;
            assert.equal(me.body.cliente.cpf,'11144477735');assert.equal(me.body.emailLogin,cadastro.email);assert.equal(me.body.senhaHash,undefined);assert.equal(me.body.cliente.conta,undefined);
            assert.equal(await prisma.cliente.count(),antes+1);
            const sessao=await prisma.sessaoCliente.findFirstOrThrow({where:{clienteId}});
            assert.notEqual(sessao.tokenHash,cookie.split('=')[1]);
        });
        await t.test('erros de campos nao consomem tentativas de cadastro ou ativacao',async()=>{
            const headers={'X-Forwarded-For':'198.51.100.40'},antes=await prisma.cliente.count();
            for(let i=0;i<env.PUBLIC_WRITE_MAX_REQUISICOES+2;i++) {
                const r=await post('/conta/registrar',{nome:'Teste',cpf:'111',telefone:'11',email:'invalido',senha:'curta'},undefined,{headers});
                assert.equal(r.status,400);assert.deepEqual(Object.keys(r.body.campos).sort(),['cpf','email','nome','senha','telefone']);
                assert.equal(r.headers.get('ratelimit-remaining'),null);
                const a=await post('/conta/redefinir-senha',{token:'a'.repeat(64),senha:'curta'},undefined,{headers});
                assert.equal(a.status,400);assert.ok(a.body.campos.senha);
            }
            assert.equal(await prisma.cliente.count(),antes);
            assert.equal((await post('/conta/registrar',{...cadastro,cpf:cpfTeste(20),email:'correcao@example.com'},undefined,{headers})).status,201);
            assert.equal((await post('/conta/entrar',cadastro,undefined,{headers})).status,200);
        });
        await t.test('cadastro nao herda limite de outras acoes publicas',async()=>{
            const headers={'X-Forwarded-For':'198.51.100.41'};
            for(let i=0;i<env.PUBLIC_WRITE_MAX_REQUISICOES;i++) assert.equal((await post('/teste-limite-publico',{},undefined,{headers})).status,200);
            assert.equal((await post('/teste-limite-publico',{},undefined,{headers})).status,429);
            assert.equal((await post('/conta/registrar',{...cadastro,cpf:cpfTeste(21),email:'independente@example.com'},undefined,{headers})).status,201);
        });
        await t.test('envios validos repetidos continuam limitados sem bloquear login',async()=>{
            const headers={'X-Forwarded-For':'198.51.100.42'};
            for(let i=0;i<env.PUBLIC_WRITE_MAX_REQUISICOES;i++) {
                const r=await post('/conta/registrar',cadastro,undefined,{headers});assert.equal(r.status,409);assert.ok(r.body.campos.cpf);
            }
            const r=await post('/conta/registrar',cadastro,undefined,{headers});assert.equal(r.status,429);assert.ok(Number(r.headers.get('retry-after'))>0);
            assert.equal((await post('/conta/entrar',cadastro,undefined,{headers})).status,200);
        });
        await t.test('CPF invalido ou ausente nao cria conta, pedido nem atualiza cliente',async()=>{
            const antes=await prisma.cliente.count(),pedidos=await prisma.pedido.count();
            const perfil=await prisma.cliente.findUniqueOrThrow({where:{id:clienteId}}),p=await produto();
            for (const cpf of [undefined,'11111111111','111.444.777-36',11144477735]) {
                assert.equal((await post('/conta/registrar',{...cadastro,cpf,email:'cpf@example.com',telefone:'11910101010'})).status,400);
                assert.equal((await post('/checkout',await compra(p,{cpf}),cookie)).status,400);
            }
            assert.equal(await prisma.cliente.count(),antes);assert.equal(await prisma.pedido.count(),pedidos);
            assert.deepEqual(await prisma.cliente.findUniqueOrThrow({where:{id:clienteId}}),perfil);assert.equal(await estoque(p),5);
        });
        await t.test('CPF repetido ou e-mail de login existente nao cria nem assume conta',async()=>{
            const antes=await prisma.cliente.count();
            for(const repetido of [cadastro,{...cadastro,email:'outro@example.com',telefone:'+55 (11) 91111-2222'},{...cadastro,cpf:cpfTeste(9),email:' CONTA@EXAMPLE.COM ',telefone:'11922223333'}]) {
                assert.equal((await post('/conta/registrar',repetido)).status,409);
            }
            assert.equal(await prisma.cliente.count(),antes);
        });
        await t.test('cadastros simultaneos do mesmo CPF deixam apenas um cliente',async()=>{
            const antes=await prisma.cliente.count();const baseCadastro={...cadastro,cpf:cpfTeste(2),telefone:'11933334444'};
            const rs=await Promise.all([post('/conta/registrar',{...baseCadastro,email:'concorrente1@example.com'}),post('/conta/registrar',{...baseCadastro,email:'concorrente2@example.com',telefone:'+55 11 92222-3333'})]);
            assert.deepEqual(rs.map(r=>r.status).sort(),[201,409]);assert.equal(await prisma.cliente.count(),antes+1);
        });
        await t.test('pessoas com CPFs diferentes podem compartilhar telefone',async()=>{
            const antes=await prisma.cliente.findUniqueOrThrow({where:{id:clienteId}}),total=await prisma.cliente.count();
            const r=await post('/conta/registrar',{...cadastro,cpf:cpfTeste(3),email:'compartilhado@example.com',telefone:'+55 (11) 91111-2222'});
            assert.equal(r.status,201);const me=await request('/conta/me',{cookie:r.cookie});assert.notEqual(me.body.cliente.id,clienteId);
            assert.equal(await prisma.cliente.count(),total+1);assert.deepEqual(await prisma.cliente.findUniqueOrThrow({where:{id:clienteId}}),antes);
        });
        await t.test('contato antigo sem CPF ou conta nao bloqueia telefone e email novos',async()=>{
            const antigo=await prisma.cliente.create({data:{nome:'Contato antigo',telefone:cadastro.telefone,email:'contato-antigo@example.com',endereco:'Rua antiga'}});
            const r=await post('/conta/registrar',{...cadastro,cpf:cpfTeste(4),email:antigo.email});assert.equal(r.status,201);
            assert.notEqual((await request('/conta/me',{cookie:r.cookie})).body.cliente.id,antigo.id);
            assert.deepEqual(await prisma.cliente.findUniqueOrThrow({where:{id:antigo.id}}),antigo);
        });
        await t.test('login aceita email normalizado e rejeita senha incorreta sem criar cliente',async()=>{
            const antes=await prisma.cliente.count();assert.equal((await post('/conta/entrar',{email:cadastro.email,senha:'incorreta'})).status,401);
            const r=await post('/conta/entrar',{email:' CONTA@EXAMPLE.COM ',senha:cadastro.senha});assert.equal(r.status,200);
            assert.equal((await request('/conta/me',{cookie:r.cookie})).body.cliente.id,clienteId);assert.equal(await prisma.cliente.count(),antes);
        });
        await t.test('duas compras reutilizam conta e preservam o endereco do pedido anterior',async()=>{
            const p=await produto(),antes=await prisma.cliente.count();
            const a=await post('/checkout',await compra(p),cookie);assert.equal(a.status,201);primeiroPedido=a.body.id;
            const b=await post('/checkout',await compra(p,{endereco:'Rua segunda',numero:'99'}),cookie);assert.equal(b.status,201);
            assert.equal(a.body.clienteId,clienteId);assert.equal(b.body.clienteId,clienteId);assert.equal(b.body.total,28.75);
            assert.equal(await prisma.cliente.count(),antes);assert.equal(await estoque(p),3);
            assert.equal((await estado(a.body.id)).entregaEndereco,'Rua primeira');
            assert.equal((await estado(b.body.id)).entregaEndereco,'Rua segunda');
            assert.equal((await estado(a.body.id)).entregaCpf,'11144477735');
            assert.equal((await estado(b.body.id)).entregaCpf,'11144477735');
            assert.equal(b.body.enderecoEntrega.cpf,'11144477735');
            assert.equal((await prisma.cliente.findUniqueOrThrow({where:{id:clienteId}})).endereco,'Rua segunda');
        });
        await t.test('endereco principal da conta e entrega alternativa preservam historico e isolamento',async()=>{
            const perfil={...cadastro,cpf:cpfTeste(30),email:'endereco@example.com'};
            const nova=await post('/conta/registrar',perfil);assert.equal(nova.status,201);
            const sessao=nova.cookie,id=(await request('/conta/me',{cookie:sessao})).body.cliente.id;
            const endereco={cep:'01001-000',endereco:'Rua principal',numero:'10',bairro:'Centro',cidade:'Sao Paulo',estado:'sp',complemento:'Casa',referencia:'Portao'};
            assert.equal((await post('/conta/endereco',endereco)).status,401);
            assert.equal((await post('/conta/endereco',endereco,sessao,{headers:{'X-Loja-Cliente':''}})).status,403);
            assert.equal((await post('/conta/endereco',{...endereco,clienteId},sessao)).status,400);
            assert.equal((await post('/conta/endereco',{...endereco,cpf:cadastro.cpf},sessao)).status,400);
            const salva=await post('/conta/endereco',endereco,sessao);assert.equal(salva.status,200);assert.equal(salva.body.cliente.id,id);assert.equal(salva.body.cliente.estado,'SP');assert.equal(salva.body.cliente.cep,'01001000');
            const antes=await prisma.cliente.findUniqueOrThrow({where:{id}});
            const outraConta=await prisma.cliente.findUniqueOrThrow({where:{id:clienteId}});
            const invalido=await post('/conta/endereco',{...endereco,cep:'11',estado:'XX'},sessao);assert.equal(invalido.status,400);assert.ok(invalido.body.campos.cep);assert.ok(invalido.body.campos.estado);
            assert.deepEqual(await prisma.cliente.findUniqueOrThrow({where:{id}}),antes);
            const p=await produto();
            const corpo=await compra(p,{...endereco,cep:'01001000',estado:'SP',cpf:perfil.cpf});
            const primeiro=await post('/checkout',{...corpo,enderecoEntrega:'principal'},sessao);assert.equal(primeiro.status,201);
            const principal=await prisma.cliente.findUniqueOrThrow({where:{id}});
            const alternativo=await compra(p,{cpf:perfil.cpf,cep:'22220000',endereco:'Rua alternativa',numero:'99'});
            const segundo=await post('/checkout',{...alternativo,enderecoEntrega:'outro'},sessao);assert.equal(segundo.status,201);
            assert.equal(segundo.body.clienteId,id);assert.equal((await estado(segundo.body.id)).entregaEndereco,'Rua alternativa');assert.equal((await estado(segundo.body.id)).entregaCep,'22220000');
            assert.equal((await estado(segundo.body.id)).entregaComplemento,null);
            assert.deepEqual(await prisma.cliente.findUniqueOrThrow({where:{id}}),principal);
            const estoqueAntes=await estoque(p);
            assert.equal((await post('/checkout',{...alternativo,enderecoEntrega:'outro',freteToken:corpo.freteToken},sessao)).status,400);
            assert.equal((await post('/checkout',{...alternativo,enderecoEntrega:true},sessao)).status,400);
            assert.equal(await estoque(p),estoqueAntes);
            const mudou=await post('/conta/endereco',{...endereco,endereco:'Rua nova',complemento:'',referencia:''},sessao);assert.equal(mudou.status,200);assert.equal(mudou.body.cliente.complemento,null);assert.equal(mudou.body.cliente.referencia,null);
            assert.equal((await estado(primeiro.body.id)).entregaEndereco,'Rua principal');assert.equal((await estado(segundo.body.id)).entregaEndereco,'Rua alternativa');
            assert.deepEqual(await prisma.cliente.findUniqueOrThrow({where:{id:clienteId}}),outraConta);
        });
        await t.test('cotacao pode ser salva antes do pedido mas nao reabre solicitacao vinculada',async()=>{
            const solicitacao=await prisma.solicitacaoProduto.create({data:{clienteId,nomeProduto:'Item de teste',descricao:'Descricao',status:'recebida'}});
            const cotar=()=>fetch(base+'/solicitacoes/'+solicitacao.id+'/cotacao',{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+tokenAdmin},body:JSON.stringify({valorCotado:50,observacaoAdmin:'Anotacao interna'})});
            assert.equal((await cotar()).status,200);
            assert.equal((await prisma.solicitacaoProduto.findUniqueOrThrow({where:{id:solicitacao.id}})).status,'cotada');
            await prisma.solicitacaoProduto.update({where:{id:solicitacao.id},data:{pedidoId:primeiroPedido,status:'aprovada'}});
            const antes=await prisma.solicitacaoProduto.findUniqueOrThrow({where:{id:solicitacao.id}});
            assert.equal((await cotar()).status,409);assert.deepEqual(await prisma.solicitacaoProduto.findUniqueOrThrow({where:{id:solicitacao.id}}),antes);
        });
        await t.test('CPF da conta nao pode ser trocado no checkout nem duplicado no banco',async()=>{
            const p=await produto(),antes=await prisma.cliente.findUniqueOrThrow({where:{id:clienteId}});
            const r=await post('/checkout',await compra(p,{cpf:cpfTeste(10)}),cookie);assert.equal(r.status,400);assert.match(r.body.mensagem,/mesmo da sua conta/);
            assert.deepEqual(await prisma.cliente.findUniqueOrThrow({where:{id:clienteId}}),antes);assert.equal(await estoque(p),5);
            await assert.rejects(prisma.cliente.create({data:{nome:'Duplicado',cpf:antes.cpf,telefone:'11900001111',endereco:'Rua'}}),erro=>erro.code==='P2002');
        });
        await t.test('checkout rejeita clienteId e privilegios de admin sem alterar cadastro',async()=>{
            const p=await produto(),payload=await compra(p),antes=await prisma.cliente.count();
            for(const extra of [{clienteId:cliente.id},{permitirProdutoInterno:true},{freteManualValor:0},{tipoEnvio:'internacional_direto'},{cliente:{...dados,id:cliente.id}}]){
                assert.equal((await post('/checkout',{...payload,...extra},cookie)).status,400);
            }
            assert.equal(await prisma.cliente.count(),antes);assert.equal(await estoque(p),5);
        });
        await t.test('falha de frete ou estoque desfaz atualizacao do cliente e pedido',async()=>{
            const p=await produto(),semEstoque=await produto(0),antes=await prisma.cliente.findUniqueOrThrow({where:{id:clienteId}}),pedidos=await prisma.pedido.count();
            const payload=await compra(p);payload.freteToken='invalido';
            assert.equal((await post('/checkout',payload,cookie)).status,400);
            assert.equal((await post('/checkout',await compra(semEstoque),cookie)).status,400);
            assert.deepEqual(await prisma.cliente.findUniqueOrThrow({where:{id:clienteId}}),antes);assert.equal(await prisma.pedido.count(),pedidos);assert.equal(await estoque(p),5);
        });
        await t.test('produto interno e ultima unidade respeitam regras existentes',async()=>{
            const p=await produto();await prisma.produto.update({where:{id:p.id},data:{publicadoNaLoja:false}});
            assert.equal((await post('/checkout',await compra(p),cookie)).status,400);assert.equal(await estoque(p),5);
            const ultimo=await produto(1),payload=await compra(ultimo),antes=await prisma.cliente.count();
            const rs=await Promise.all([post('/checkout',payload,cookie),post('/checkout',payload,cookie)]);
            assert.deepEqual(rs.map(r=>r.status).sort(),[201,400]);assert.equal(await prisma.cliente.count(),antes);assert.equal(await estoque(ultimo),0);
        });

        await t.test('mesma tentativa simultanea gera um pedido, uma baixa e um historico',async()=>{
            const p=await produto(3),body=await compra(p),chave=randomUUID();
            const options={headers:{'Idempotency-Key':chave}};
            const respostas=await Promise.all([post('/checkout',body,cookie,options),post('/checkout',body,cookie,options)]);
            assert.deepEqual(respostas.map(r=>r.status).sort(),[200,201]);
            assert.equal(respostas[0].body.id,respostas[1].body.id);assert.equal(await estoque(p),2);
            assert.equal(await prisma.pedido.count({where:{clienteId,checkoutChave:chave}}),1);
            assert.equal(await prisma.historicoPedido.count({where:{pedidoId:respostas[0].body.id}}),1);
            const antes=await prisma.cliente.findUniqueOrThrow({where:{id:clienteId}});
            const alterada=await post('/checkout',{...body,cliente:{...body.cliente,endereco:'Rua adulterada'}},cookie,options);
            assert.equal(alterada.status,409);assert.equal(await estoque(p),2);
            assert.deepEqual(await prisma.cliente.findUniqueOrThrow({where:{id:clienteId}}),antes);
            const nova=await post('/checkout',body,cookie);assert.equal(nova.status,201);
            assert.notEqual(nova.body.id,respostas[0].body.id);assert.equal(await estoque(p),1);
        });
        await t.test('repeticao apos frete expirar ou pagamento confirmado devolve o estado atual',async sub=>{
            const p=await produto(1),body=await compra(p),chave=randomUUID(),options={headers:{'Idempotency-Key':chave}};
            const criado=await post('/checkout',body,cookie,options);assert.equal(criado.status,201);
            const antes=Date.now();sub.mock.method(Date,'now',()=>antes+16*60000);
            const repetido=await post('/checkout',body,cookie,options);assert.equal(repetido.status,200);assert.equal(repetido.body.id,criado.body.id);
            await pagar(criado.body.id,'pix');
            const pago=await request('/checkout/'+chave,{cookie});assert.equal(pago.status,200);assert.equal(pago.body.status,'pago');assert.equal(pago.headers.get('cache-control'),'no-store');
            await status(criado.body.id,'cancelado');
            const cancelado=await post('/checkout',body,cookie,options);assert.equal(cancelado.status,200);assert.equal(cancelado.body.status,'cancelado');assert.equal(await estoque(p),1);
            assert.equal(cancelado.body.checkoutHash,undefined);assert.equal(cancelado.body.checkoutChave,undefined);
        });
        await t.test('recuperacao exige conta e nao revela tentativas de outros clientes',async()=>{
            const p=await produto(),body=await compra(p),chave=randomUUID();
            const criado=await post('/checkout',body,cookie,{headers:{'Idempotency-Key':chave}});assert.equal(criado.status,201);
            assert.equal((await request('/checkout/'+chave)).status,401);
            const contaNova=await post('/conta/registrar',{...cadastro,cpf:cpfTeste(71),email:'outra-tentativa@example.com'});assert.equal(contaNova.status,201);
            assert.equal((await request('/checkout/'+chave,{cookie:contaNova.cookie})).status,404);
            assert.equal((await request('/checkout/'+randomUUID(),{cookie})).status,404);
            assert.equal((await request('/checkout/invalida',{cookie})).status,400);
            for(const valor of ['', 'chave-invalida', 'a'.repeat(100)]) assert.equal((await post('/checkout',body,cookie,{headers:{'Idempotency-Key':valor}})).status,400);
        });
        await t.test('meus pedidos e acompanhamento nao revelam pedidos de outras contas',async()=>{
            const meus=await request('/conta/pedidos',{cookie});assert.equal(meus.status,200);assert.ok(meus.body.dados.some(p=>p.id===primeiroPedido));
            assert.equal((await request('/pedidos/'+primeiroPedido+'/acompanhamento',{cookie})).status,200);
            const legado=await fixture();
            assert.equal((await request('/pedidos/'+legado.id+'/acompanhamento',{cookie})).status,404);
            assert.equal((await request('/pedidos/'+primeiroPedido+'/acompanhamento?telefone='+dados.telefone)).status,401);
            const outra=await post('/conta/registrar',{...cadastro,cpf:cpfTeste(5),email:'outra@example.com',telefone:'11955556666'});
            assert.deepEqual((await request('/conta/pedidos',{cookie:outra.cookie})).body.dados,[]);
            assert.equal((await request('/pedidos/'+primeiroPedido+'/acompanhamento',{cookie:outra.cookie})).status,404);
        });
        await t.test('cookie e operacoes de conta recusam expiracao e origem externa',async()=>{
            assert.equal((await post('/conta/entrar',cadastro,undefined,{headers:{'X-Loja-Cliente':''}})).status,403);
            assert.equal((await post('/checkout',{},cookie,{headers:{Origin:'https://site-externo.example'}})).status,403);
            assert.equal((await post('/conta/sair',{},cookie,{headers:{'Sec-Fetch-Site':'cross-site'}})).status,403);
            const temporaria=await post('/conta/entrar',cadastro);await prisma.sessaoCliente.update({where:{tokenHash:hashTokenCliente(temporaria.cookie.split('=')[1])},data:{expiraEm:new Date(0)}});
            assert.equal((await request('/conta/me',{cookie:temporaria.cookie})).status,401);
        });
        await t.test('login bloqueia tentativas repetidas',async()=>{
            const headers={'X-Forwarded-For':'198.51.100.1'};
            for(let i=0;i<env.ADMIN_LOGIN_MAX_TENTATIVAS;i++)assert.equal((await post('/conta/entrar',{email:'bloqueio@example.com',senha:'incorreta'},undefined,{headers})).status,401);
            const r=await post('/conta/entrar',{email:'bloqueio@example.com',senha:'incorreta'},undefined,{headers});assert.equal(r.status,429);assert.ok(Number(r.headers.get('retry-after'))>0);
        });
        await t.test('recuperacao sem remetente configurado fica indisponivel sem prometer envio',async()=>{
            assert.deepEqual((await request('/conta/recuperacao-disponivel')).body,{disponivel:false});
            assert.equal((await post('/conta/recuperar-senha',{email:cadastro.email})).status,503);
            assert.equal(emails.length,0);emailAtivo=true;
            assert.deepEqual((await request('/conta/recuperacao-disponivel')).body,{disponivel:true});
        });
        await t.test('liberacao manual foi removida e recuperacao nao ativa cadastro sem senha',async()=>{
            const antigo=await prisma.cliente.create({data:{nome:'Antigo',cpf:cpfTeste(6),telefone:'11966667777',email:'antigo@example.com',endereco:'Rua antiga'}}),antes=await prisma.cliente.count();
            assert.equal((await post('/conta/registrar',{...cadastro,cpf:antigo.cpf,email:antigo.email})).status,409);
            assert.equal((await post('/clientes/'+antigo.id+'/acesso',{},undefined,{admin:true})).status,404);
            assert.equal((await post('/conta/ativar',{token:'a'.repeat(64),senha:cadastro.senha})).status,404);
            await prisma.contaCliente.create({data:{clienteId:antigo.id,email:antigo.email,conviteHash:hashTokenCliente('a'.repeat(64)),conviteExpiraEm:new Date(Date.now()+60000)}});
            assert.equal((await post('/conta/redefinir-senha',{token:'a'.repeat(64),senha:cadastro.senha})).status,400);
            const a=await post('/conta/recuperar-senha',{email:antigo.email});
            const b=await post('/conta/recuperar-senha',{email:'desconhecido@example.com'});
            assert.equal(a.status,202);assert.deepEqual(a.body,b.body);await aguardarEnviosRecuperacao();
            assert.equal(emails.length,0);assert.equal(await prisma.cliente.count(),antes);
        });
        await t.test('recuperacao envia apenas ao email de login, sem token na resposta e sem encerrar sessao',async()=>{
            const r=await post('/conta/recuperar-senha',{email:' CONTA@EXAMPLE.COM ',destinatario:'outro@example.com',url:'https://externo.example'});
            assert.equal(r.status,202);assert.equal(r.headers.get('cache-control'),'no-store');assert.equal(r.cookie,undefined);
            await aguardarEnviosRecuperacao();assert.equal(emails.length,1);assert.equal(emails[0].email,cadastro.email);assert.match(emails[0].token,/^[a-f0-9]{64}$/);
            assert.ok(!JSON.stringify(r.body).includes(emails[0].token));
            const conta=await prisma.contaCliente.findUniqueOrThrow({where:{clienteId}});
            assert.equal(conta.conviteHash,hashTokenCliente(emails[0].token));assert.notEqual(conta.conviteHash,emails[0].token);
            assert.ok(conta.conviteExpiraEm.getTime()>Date.now());assert.ok(conta.conviteExpiraEm.getTime()<=Date.now()+30*60000);
            assert.equal((await request('/conta/me',{cookie})).status,200);
            const repetido=await post('/conta/recuperar-senha',{email:cadastro.email});await aguardarEnviosRecuperacao();
            assert.deepEqual(repetido.body,r.body);assert.equal(emails.length,1);
        });
        await t.test('novo link invalida anterior, link vencido falha e erro de envio limpa somente seu token',async()=>{
            const clock=mock.method(Date,'now',()=>Date.parse('2030-01-01T00:00:00Z'));
            try{
                const anterior=emails[0].token;
                await post('/conta/recuperar-senha',{email:cadastro.email});await aguardarEnviosRecuperacao();assert.equal(emails.length,2);
                assert.equal((await post('/conta/redefinir-senha',{token:anterior,senha:cadastro.senha})).status,400);
                await prisma.contaCliente.update({where:{clienteId},data:{conviteExpiraEm:new Date(0)}});
                assert.equal((await post('/conta/redefinir-senha',{token:emails[1].token,senha:cadastro.senha})).status,400);
                clock.mock.mockImplementation(()=>Date.parse('2030-01-01T00:02:00Z'));falharEmail=true;
                const r=await post('/conta/recuperar-senha',{email:cadastro.email});assert.equal(r.status,202);await aguardarEnviosRecuperacao();
                assert.equal((await prisma.contaCliente.findUniqueOrThrow({where:{clienteId}})).conviteHash,null);
            }finally{clock.mock.restore();falharEmail=false;}
        });
        await t.test('reset tem uso unico, revoga sessoes e exige login com a nova senha',async()=>{
            const credencialAntiga=await entrarContaCliente(cadastro.email,cadastro.senha);
            const clock=mock.method(Date,'now',()=>Date.parse('2030-01-01T02:00:00Z'));
            try {await post('/conta/recuperar-senha',{email:cadastro.email});await aguardarEnviosRecuperacao();}finally{clock.mock.restore();}
            const token=emails.at(-1).token;
            const resultados=await Promise.all([1,2].map(()=>post('/conta/redefinir-senha',{token,senha:'Nova-senha-teste-123'})));
            assert.deepEqual(resultados.map(r=>r.status).sort(),[200,400]);
            assert.equal((await request('/conta/me',{cookie})).status,401);await assert.rejects(criarSessaoCliente(credencialAntiga),/senha atual/);
            assert.equal((await post('/conta/entrar',cadastro)).status,401);
            const entrada=await post('/conta/entrar',{email:cadastro.email,senha:'Nova-senha-teste-123'});assert.equal(entrada.status,200);cookie=entrada.cookie;
            assert.equal((await request('/conta/me',{cookie})).status,200);
        });
        await t.test('recuperacao valida antes de limitar, bloqueia abuso por IP e rejeita origem externa',async()=>{
            const headers={'X-Forwarded-For':'198.51.100.220'};
            for(let i=0;i<8;i++)assert.equal((await post('/conta/recuperar-senha',{email:'invalido'},undefined,{headers})).status,400);
            for(let i=0;i<5;i++)assert.equal((await post('/conta/recuperar-senha',{email:'limite'+i+'@example.com'},undefined,{headers})).status,202);
            const r=await post('/conta/recuperar-senha',{email:'limite@example.com'},undefined,{headers});assert.equal(r.status,429);assert.ok(Number(r.headers.get('retry-after'))>0);
            assert.equal((await post('/conta/recuperar-senha',{email:cadastro.email},undefined,{headers:{Origin:'https://externo.example'}})).status,403);
            assert.equal((await post('/conta/registrar',{...cadastro,email:'curta@example.com',senha:'123'})).status,400);
            await aguardarEnviosRecuperacao();
        });
        await t.test('admin completa CPF antigo sem reescrever pedidos anteriores',async()=>{
            const legado=await fixture();
            const atualizar=async cpf=>{
                const r=await fetch(base+'/clientes/'+cliente.id,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+tokenAdmin},body:JSON.stringify({cpf})});
                return {status:r.status,body:await r.json()};
            };
            assert.equal((await atualizar('111.444.777-36')).status,400);
            const r=await atualizar(cpfTeste(7));assert.equal(r.status,200);assert.equal(r.body.cpf,cpfTeste(7));
            assert.equal((await estado(legado.id)).entregaCpf,null);
            const novo=await fixture();assert.equal((await estado(novo.id)).entregaCpf,cpfTeste(7));
            assert.equal((await atualizar(cpfTeste(17))).status,200);assert.equal((await estado(novo.id)).entregaCpf,cpfTeste(7));
            assert.equal((await atualizar('11144477735')).status,409);
            assert.equal((await atualizar(cpfTeste(7))).status,200);
            assert.equal((await request('/clientes/'+cliente.id,{admin:true})).body.cpf,cpfTeste(7));
        });
        await t.test('admin distingue pessoas pelo CPF e nunca sobrescreve pelo telefone',async()=>{
            const antes=await prisma.cliente.findUniqueOrThrow({where:{id:cliente.id}});
            const a=await post('/clientes',{...dados,cpf:cpfTeste(8),telefone:cliente.telefone},undefined,{admin:true});assert.equal(a.status,201);assert.notEqual(a.body.id,cliente.id);
            const b=await post('/clientes',{...dados,cpf:cpfTeste(8),telefone:'11920202020'},undefined,{admin:true});assert.equal(b.status,200);assert.equal(b.body.id,a.body.id);
            const semCpf=await post('/clientes',{...dados,cpf:undefined,telefone:cliente.telefone},undefined,{admin:true});assert.equal(semCpf.status,201);assert.notEqual(semCpf.body.id,cliente.id);
            assert.deepEqual(await prisma.cliente.findUniqueOrThrow({where:{id:cliente.id}}),antes);
        });
        await t.test('minhas solicitacoes isola contas, pagina e nao expoe anotacoes nem pedidos alheios',async()=>{
            const perfil={...cadastro,cpf:cpfTeste(31),email:'solicitacoes@example.com'};
            const registro=await post('/conta/registrar',perfil);assert.equal(registro.status,201);
            const sessao=registro.cookie,id=(await request('/conta/me',{cookie:sessao})).body.cliente.id;
            const p=await produto();const pedido=await post('/checkout',await compra(p,{cpf:perfil.cpf}),sessao);assert.equal(pedido.status,201);
            for(let i=0;i<21;i++)await prisma.solicitacaoProduto.create({data:{clienteId:id,nomeProduto:'Solicitado '+i,descricao:'Descricao do cliente',observacaoAdmin:'CUSTO INTERNO CONFIDENCIAL',valorCotado:50,status:i===18?'em_analise':'cotada',pedidoId:i===20?pedido.body.id:i===19?primeiroPedido:null}});
            await prisma.solicitacaoProduto.create({data:{clienteId,nomeProduto:'De outro cliente',descricao:'Privado'}});
            await prisma.solicitacaoProduto.create({data:{contatoTelefone:perfil.telefone,nomeProduto:'Sem vinculo',descricao:'Privado'}});
            assert.equal((await request('/conta/solicitacoes')).status,401);
            assert.equal((await request('/conta/solicitacoes',{admin:true})).status,401);
            const primeira=await request('/conta/solicitacoes',{cookie:sessao});assert.equal(primeira.status,200);assert.equal(primeira.headers.get('cache-control'),'no-store');assert.equal(primeira.body.total,21);assert.equal(primeira.body.totalPaginas,3);assert.equal(primeira.body.dados.length,10);
            assert.equal(primeira.body.dados[0].pedidoId,pedido.body.id);assert.equal(primeira.body.dados[1].pedidoId,null);assert.equal(primeira.body.dados[2].cotacao,null);assert.equal(primeira.body.dados[0].cotacao.valor,50);
            assert.deepEqual(Object.keys(primeira.body.dados[0]).sort(),['cotacao','criadoEm','descricao','id','nomeProduto','pedidoId','status']);
            assert.ok(!JSON.stringify(primeira.body).includes('CONFIDENCIAL'));
            const segunda=await request('/conta/solicitacoes?pagina=2',{cookie:sessao}),terceira=await request('/conta/solicitacoes?pagina=3',{cookie:sessao});
            assert.equal(segunda.body.dados.length,10);assert.equal(terceira.body.dados.length,1);assert.equal(new Set([...primeira.body.dados,...segunda.body.dados,...terceira.body.dados].map(s=>s.id)).size,21);
            for(const query of ['pagina=0','pagina=-1','pagina=1.2','pagina=abc','pagina=100001','clienteId='+clienteId,'pagina=1&pagina=2'])assert.equal((await request('/conta/solicitacoes?'+query,{cookie:sessao})).status,400);
        });
        await t.test('sair invalida a sessao no servidor',async()=>{
            assert.equal((await post('/conta/sair',{},cookie)).status,200);
            assert.equal((await request('/conta/me',{cookie})).status,401);
        });
        await t.test('admin continua criando pedido manual; solicitacao da loja exige conta e usa seus dados',async()=>{
            const r=await post('/clientes',{...dados,cpf:cpfTeste(7),telefone:cliente.telefone,nome:'Revisado pelo admin'},undefined,{admin:true});
            assert.equal(r.status,200);assert.equal(r.body.id,cliente.id);
            const p=await produto();const pedido=await post('/pedidos',{clienteId:cliente.id,itens:[{produtoId:p.id,quantidade:1}],freteManualValor:5},undefined,{admin:true});
            assert.equal(pedido.status,201);assert.equal(pedido.body.total,15);
            const dadosProduto={nomeProduto:'Produto procurado',descricao:'Quero cotar'};
            assert.equal((await post('/solicitacoes/publica',dadosProduto)).status,401);
            const login=await post('/conta/entrar',{email:cadastro.email,senha:'Nova-senha-teste-123'});
            assert.equal(login.status,200);
            const antes=await prisma.cliente.count();
            for (const injetado of [{clienteId:cliente.id},{nome:'Outra pessoa'},{telefone:'11900000000'}]) {
                assert.equal((await post('/solicitacoes/publica',{...dadosProduto,...injetado},login.cookie)).status,400);
            }
            assert.equal((await post('/solicitacoes/publica',dadosProduto,login.cookie,{headers:{'X-Loja-Cliente':''}})).status,403);
            const solicitacao=await post('/solicitacoes/publica',dadosProduto,login.cookie);assert.equal(solicitacao.status,201);
            const salva=await prisma.solicitacaoProduto.findUniqueOrThrow({where:{id:solicitacao.body.id}});
            const titular=await prisma.cliente.findUniqueOrThrow({where:{id:clienteId}});
            assert.equal(salva.clienteId,clienteId);assert.equal(salva.contatoNome,titular.nome);assert.equal(salva.contatoTelefone,titular.telefone);
            assert.equal(await prisma.cliente.count(),antes);
            const listagem=await request('/solicitacoes/'+salva.id,{admin:true});assert.equal(listagem.status,200);assert.equal(listagem.body.clienteId,clienteId);
        });
    } finally {
        await aguardarEnviosRecuperacao();disponibilidadeMock.mock.restore();envioMock.mock.restore(); await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve())); }
});

test('cotacao explica recusa por medidas ou trecho sem expor retorno bruto do provedor',async()=>{
    const p=await produto(),original=globalThis.fetch;
    const requisicao=()=>cotarFrete(cliente.cep,[{produtoId:p.id,quantidade:1}]);
    try {
        globalThis.fetch=async()=>Response.json([{id:1,error:'Transportadora nao atende este trecho.'},{id:2,error:'Dimensoes do objeto ultrapassam o limite da transportadora.'}]);
        await assert.rejects(requisicao(),/peso ou tamanho da embalagem/);
        globalThis.fetch=async()=>Response.json([{id:1,error:'Transportadora nao atende este trecho.'},{id:2,error:'Transportadora nao atende este trecho.'}]);
        await assert.rejects(requisicao(),/nao atendem este trecho/);
        globalThis.fetch=async()=>Response.json([{id:1,error:'Erro interno confidencial'},{id:2,error:'Falha interna'}]);
        await assert.rejects(requisicao(),erro=>erro.status===422 && !erro.message.includes('confidencial') && /Nenhuma opcao/.test(erro.message));
        globalThis.fetch=async()=>Response.json([{id:1,error:'Dimensoes ultrapassam limite'},{id:2,name:'SEDEX',company:{name:'Correios'},custom_price:'18.75',custom_delivery_time:2}]);
        const cotacao=await requisicao();assert.equal(cotacao.opcoes.length,1);assert.equal(cotacao.opcoes[0].servico,'SEDEX');
    }finally{globalThis.fetch=original;}
});
