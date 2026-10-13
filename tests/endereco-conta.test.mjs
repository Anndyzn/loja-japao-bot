import { test } from 'node:test';
import assert from 'node:assert/strict';
import { instalarBuscaCep, validarCamposEndereco } from '../public/loja/endereco.js';
function formulario() {
    const campo=()=>({value:'',addEventListener(){}});
    return { elements:Object.fromEntries(['cep','endereco','bairro','cidade','estado'].map(k=>[k,campo()])),addEventListener(){} };
}
test('busca CEP cancelada nao sobrescreve o endereco selecionado depois',async()=>{
    const original=globalThis.fetch;let concluir;const f=formulario();const api=instalarBuscaCep(f,{});
    try {
        globalThis.fetch=()=>new Promise(r=>{concluir=r;});f.elements.cep.value='01001000';const pendente=api.buscar();
        f.elements.cep.value='22220000';f.elements.endereco.value='Rua principal';api.sincronizar();
        concluir(Response.json({logradouro:'Rua antiga',bairro:'Centro',localidade:'Cidade',uf:'SP'}));await pendente;
        assert.equal(f.elements.endereco.value,'Rua principal');assert.equal(api.buscando,false);
    }finally{api.cancelar();globalThis.fetch=original;}
});
test('busca CEP preserva correcao manual durante a consulta e notifica validacao',async()=>{
    const original=globalThis.fetch;let concluir,chamadas=0;const f=formulario();const api=instalarBuscaCep(f,{},()=>chamadas++);
    try {
        globalThis.fetch=()=>new Promise(r=>{concluir=r;});f.elements.cep.value='01001000';const pendente=api.buscar();f.elements.endereco.value='Rua corrigida';
        concluir(Response.json({logradouro:'Rua da consulta',bairro:'Centro',localidade:'Cidade',uf:'SP'}));await pendente;
        assert.equal(f.elements.endereco.value,'Rua corrigida');assert.equal(f.elements.bairro.value,'Centro');assert.equal(chamadas,1);
    }finally{api.cancelar();globalThis.fetch=original;}
});
test('endereco exige CEP, numero e UF, permitindo limpar campos opcionais',()=>{
    const completo={cep:'01001-000',endereco:'Rua',numero:'S/N',bairro:'Centro',cidade:'Sao Paulo',estado:'sp',complemento:'',referencia:''};
    assert.deepEqual(validarCamposEndereco(completo),{});
    const erros=validarCamposEndereco({...completo,cep:'11',estado:'XX',numero:''});assert.deepEqual(Object.keys(erros).sort(),['cep','estado','numero']);
});
