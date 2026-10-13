import { test } from 'node:test';
import assert from 'node:assert/strict';
import { destinoAposLogin, urlLoginPara, exigirContaNaPagina } from '../public/loja/conta-api.js';

test('login normal volta a vitrine e caminhos externos nunca sao usados',()=>{
    for(const busca of ['', '?voltar=https://fora.example', '?voltar=//fora.example', '?voltar=__proto__', '?voltar=constructor']) assert.equal(destinoAposLogin(busca),'/loja');
    assert.equal(destinoAposLogin('?voltar=carrinho'),'/loja/carrinho');
});
test('login preserva o produto solicitado ou o numero do pedido',()=>{
    const busca=new URLSearchParams({produtoId:'12',produto:'Pocky & chocolate',descricao:'Caixa pequena',clienteId:'99'});
    const login=urlLoginPara('solicitacao',busca.toString());
    const destino=destinoAposLogin(new URL(login,'https://loja.example').search);
    const url=new URL(destino,'https://loja.example');assert.equal(url.pathname,'/loja/solicitacao');assert.equal(url.searchParams.get('produto'),'Pocky & chocolate');assert.equal(url.searchParams.get('produtoId'),'12');assert.equal(url.searchParams.has('clienteId'),false);
    assert.equal(destinoAposLogin('?voltar=acompanhamento&pedido=42'),'/loja/acompanhamento?pedido=42');
});
test('pagina protegida pede login somente sem sessao; erro de rede nao vira logout',async()=>{
    const fetchOriginal=globalThis.fetch,locationOriginal=globalThis.location;const destinos=[];
    globalThis.location={search:'?pedido=42',replace:url=>destinos.push(url)};
    try {
        globalThis.fetch=async()=>Response.json({mensagem:'Entre'},{status:401});assert.equal(await exigirContaNaPagina('acompanhamento'),null);assert.match(destinos[0],/pedido=42/);
        globalThis.fetch=async()=>Response.json({cliente:{id:1}});assert.equal((await exigirContaNaPagina('solicitacao')).cliente.id,1);assert.equal(destinos.length,1);
        globalThis.fetch=async()=>{throw Error('Rede indisponivel');};await assert.rejects(exigirContaNaPagina('solicitacao'),/Rede/);assert.equal(destinos.length,1);
    }finally{globalThis.fetch=fetchOriginal;if(locationOriginal===undefined)delete globalThis.location;else globalThis.location=locationOriginal;}
});
