import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarEntradaWebhook } from '../scripts/tunel-mercado-pago.mjs';
const headers = { 'Content-Type': 'application/json', 'x-signature': 'assinatura-ficticia', 'x-request-id': 'request-ficticio' };
async function executar(requisitar, testar) {
    const servidor = criarEntradaWebhook(3000, { requisitar });
    await new Promise(resolve => servidor.listen(0, '127.0.0.1', resolve));
    try { await testar('http://127.0.0.1:' + servidor.address().port); }
    finally { servidor.closeAllConnections(); await new Promise(resolve => servidor.close(resolve)); }
}
test('tunel bloqueia loja, admin, metodos indevidos, falta de assinatura e corpo grande', async () => {
    let chamadas=0;
    await executar(async()=>{chamadas++;return new Response(null,{status:200});},async base=>{
        for(const path of ['/','/admin','/loja','/.env','/mercado-pago/webhook'])
            assert.equal((await fetch(base+path)).status,404);
        assert.equal((await fetch(base+'/admin',{method:'POST',headers,body:'{}'})).status,404);
        assert.equal((await fetch(base+'/mercado-pago/webhook',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
        assert.equal((await fetch(base+'/mercado-pago/webhook',{method:'POST',body:'texto'})).status,415);
        assert.equal((await fetch(base+'/mercado-pago/webhook',{method:'POST',headers,body:'x'.repeat(65537)})).status,413);
        assert.equal(chamadas,0);
    });
});
test('tunel preserva assinatura, query, corpo e status sem encaminhar cookies ou autorizacao',async()=>{
    for(const status of [200,401,503]) await executar(async(url,options)=>{
        assert.equal(url,'http://127.0.0.1:3000/mercado-pago/webhook?data.id=ORDTST123&type=order');
        assert.deepEqual(options.headers,headers);
        assert.equal(options.body.toString(),'{"type":"order"}');
        assert.equal(options.redirect,'error');
        return new Response('corpo privado nao deve ser repassado',{status});
    },async base=>{
        const r=await fetch(base+'/mercado-pago/webhook?data.id=ORDTST123&type=order',{method:'POST',headers:{...headers,Cookie:'privado',Authorization:'privado'},body:'{"type":"order"}'});
        assert.equal(r.status,status);assert.ok(!(await r.text()).includes('privado'));
    });
});
test('falha local e redirecionamento nunca confirmam notificacao',async()=>{
    for(const upstream of [async()=>{throw new Error('segredo');},async()=>new Response(null,{status:302})])
        await executar(upstream,async base=>{const r=await fetch(base+'/mercado-pago/webhook',{method:'POST',headers,body:'{}'});assert.equal(r.status,502);assert.ok(!(await r.text()).includes('segredo'));});
});
