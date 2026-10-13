import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../public/admin/app.js',import.meta.url),'utf8');
const mensagem=source.slice(source.indexOf('function montarMensagemWhatsAppSolicitacao('),source.indexOf('function mostrarFeedbackCepCliente('));
const contexto=vm.createContext({URL,window:{location:{origin:'https://loja.example'}},formatarMoeda:n=>'R$ '+n});vm.runInContext(mensagem,contexto);
test('cotacao nao expoe anotacao interna e depois do pedido envia acompanhamento com login',()=>{
    const solicitacao={nomeProduto:'Produto de teste',contato:{nome:'Cliente'},valorCotado:150,observacaoAdmin:'Fornecedor secreto'};
    const antes=contexto.montarMensagemWhatsAppSolicitacao(solicitacao);assert.ok(antes.includes('150'));assert.ok(!antes.includes('secreto'));assert.ok(antes.includes('gerar o pedido'));
    const depois=contexto.montarMensagemWhatsAppSolicitacao({...solicitacao,pedidoId:17});assert.ok(depois.includes('https://loja.example/loja/acompanhamento?pedido=17'));assert.ok(depois.includes('Entre na sua conta'));assert.ok(!depois.includes('gerar o pedido'));assert.ok(!depois.includes('secreto'));
});
