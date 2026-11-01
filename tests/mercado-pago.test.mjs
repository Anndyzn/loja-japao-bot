import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { lerConfiguracaoMercadoPago } from '../src/config/mercado-pago.ts';
import { centavos, validarUrlCheckout, validarOrder, avaliarOrder, assinaturaMpValida, requisitarMp } from '../src/services/mercado-pago-api.ts';
import { env } from '../src/config/env.ts';
const id = 'ORDTST01KS5AJ6HTK2HRQ3XJ3C2JCKP9';
const base = () => ({
    id, type: 'online', processing_mode: 'manual', currency: 'BRL', external_reference: 'referencia',
    user_id: '12345', total_amount: '47.92', total_paid_amount: '47.92', status: 'processed', status_detail: 'accredited',
    last_updated_date: '2026-10-31T10:00:00.000Z', transactions: { payments: [{
        id: 'PAY01M4V4XX5CXZ6KF1P3DEMX83VY', amount: '47.92', paid_amount: '47.92',
        status: 'processed', status_detail: 'accredited', payment_method: {type:'credit_card',id:'visa'}
    }] }
});
test('configuracao opcional, restrita a teste local; token nunca define modo pelo prefixo', () => {
    assert.equal(lerConfiguracaoMercadoPago({}), null);
    assert.equal(lerConfiguracaoMercadoPago({MERCADO_PAGO_ACCESS_TOKEN:'APP_USR-falso'}), null);
    const valores = {MERCADO_PAGO_MODO:'teste', MERCADO_PAGO_ACCESS_TOKEN:'APP_USR-falso'};
    assert.equal(lerConfiguracaoMercadoPago(valores).origem,null);
    for (const extra of [{NODE_ENV:'production'}, {MERCADO_PAGO_MODO:'production'}, {MERCADO_PAGO_ACCESS_TOKEN:''},
        ...['http://localhost:3000','https://user:pass@loja.test','https://loja.test/path','https://loja.test?x=1'].map(url=>({MERCADO_PAGO_URL_RETORNO:url}))])
        assert.throws(()=>lerConfiguracaoMercadoPago({...valores,...extra}));
    assert.equal(lerConfiguracaoMercadoPago({...valores,MERCADO_PAGO_URL_RETORNO:'https://loja.test/'}).origem,'https://loja.test');
});
test('centavos exatos e links restritos ao checkout brasileiro da mesma order', () => {
    assert.equal(centavos('47.92'),4792);
    assert.equal(centavos('0.1'),10);
    for (const valor of ['1.001','NaN',Infinity,-1,'1e2',undefined]) assert.throws(()=>centavos(valor));
    const url='https://www.mercadopago.com.br/checkout/v1/redirect?order_id='+id;
    assert.equal(validarUrlCheckout(url,id),url);
    for(const invalida of [url.replace('https','http'),url.replace('.com.br','.com.br.evil.test'),url.replace('/checkout/','/outro/'),url.replace(id,'outro'),url.replace('//','//user:pass@')])
        assert.throws(()=>validarUrlCheckout(invalida,id));
});
test('confirmacao exige moeda, referencia, vendedor, valor e order de teste corretos',()=>{
    assert.doesNotThrow(()=>validarOrder(base(),'referencia','47.92','12345',id));
    for (const extra of [{id:'ORD01KS5AJ6HTK2HRQ3XJ3C2JCKP9'}, {live_mode:true}, {currency:'USD'}, {user_id:'678'},
        {external_reference:'outro'}, {total_amount:'47.91'}, {last_updated_date:'x'}, {processing_mode:'automatic'}])
        assert.throws(()=>validarOrder({...base(),...extra},'referencia','47.92','12345',id));
});
test('apenas pagamento integral creditado e Pix/cartao sao aprovados; reversoes vao para revisao',()=>{
    assert.equal(avaliarOrder(base()).metodo,'cartao');
    const pix=base();pix.transactions.payments[0].payment_method={type:'bank_transfer',id:'pix'};
    assert.equal(avaliarOrder(pix).metodo,'pix');
    for(const status of ['created','processing','action_required','failed','canceled']) assert.equal(avaliarOrder({...base(),status}).pagamentoId,undefined);
    for(const extra of [{status:'refunded'},{status_detail:'partially_refunded'}, {total_paid_amount:'20.00'},
        {transactions:{...base().transactions,refunds:[{}]}},{transactions:{...base().transactions,chargebacks:[{}]}},
        {transactions:{payments:[...base().transactions.payments,...base().transactions.payments]}}])
        assert.equal(avaliarOrder({...base(),...extra}).revisao,true);
    const boleto=base();boleto.transactions.payments[0].payment_method={type:'ticket',id:'bolbradesco'};
    assert.equal(avaliarOrder(boleto).revisao,true);
});
test('assinatura inclui id da URL, request-id e timestamp; normaliza maiusculas e rejeita adulteracoes',()=>{
    const segredo='segredo-ficticio',requestId='request-123',ts='1793455200000';
    const hash=createHmac('sha256',segredo).update('id:'+id.toLowerCase()+';request-id:'+requestId+';ts:'+ts+';').digest('hex');
    const assinatura='ts='+ts+',v1='+hash;
    assert.equal(assinaturaMpValida(id,assinatura,requestId,segredo),true);
    for(const args of [[id+'A',assinatura,requestId,segredo],[id,assinatura,'outro',segredo],
        [id,assinatura,requestId,'outro'],[id,assinatura+',ts='+ts,requestId,segredo],[id,'v1=x',requestId,segredo],
        [id,assinatura,undefined,segredo],[id,assinatura,requestId,'']])
        assert.equal(assinaturaMpValida(...args),false);
});
test('cliente HTTP tem timeout, nao segue redirect e nao expoe o corpo de erros',async()=>{
    const anterior=env.MERCADO_PAGO;
    env.MERCADO_PAGO={token:'segredo-nao-expor',origem:null,segredoWebhook:''};
    const interceptar=mock.method(globalThis,'fetch',async(url,options)=>{
        assert.equal(url,'https://api.mercadopago.com/v1/orders');
        assert.equal(options.redirect,'error');
        assert.equal(options.headers['X-Idempotency-Key'],'chave');
        assert.ok(options.signal instanceof AbortSignal);
        return new Response('segredo-nao-expor',{status:400});
    });
    try { await assert.rejects(requisitarMp('',{},'chave'),err=>!err.message.includes('segredo-nao-expor')); }
    finally {interceptar.mock.restore();env.MERCADO_PAGO=anterior;}
});

test('order criada sem status_detail permite abrir checkout, mas nao comprova pagamento',()=>{
    const criada={...base(),status:'created',total_paid_amount:'0.00',transactions:{payments:[]}};
    delete criada.status_detail;
    assert.doesNotThrow(()=>validarOrder(criada,'referencia','47.92','12345',id));
    assert.equal(avaliarOrder(criada).pagamentoId,undefined);
    for(const status_detail of [null,123,{},[]])
        assert.throws(()=>validarOrder({...criada,status_detail},'referencia','47.92','12345',id));
    const semDetalhe=base();delete semDetalhe.status_detail;
    assert.throws(()=>validarOrder(semDetalhe,'referencia','47.92','12345',id));
    assert.equal(avaliarOrder(semDetalhe).pagamentoId,undefined);
});
