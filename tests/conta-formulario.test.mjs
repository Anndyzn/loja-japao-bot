import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatarCpf, formatarTelefone, validarCamposConta, erroCpf } from '../public/loja/conta-formulario.js';
import { validarCpf } from '../src/utils/cpf.ts';
import { contaApi } from '../public/loja/conta-api.js';
const dados = { nome: 'Cliente Teste', cpf: '11144477735', telefone: '11911112222', email: 'teste@example.com', senha: 'Senha-teste-123', confirmacao: 'Senha-teste-123' };
test('mascaras aceitam digitacao parcial, colagem e telefone fixo ou celular', () => {
    assert.equal(formatarCpf('1114'), '111.4'); assert.equal(formatarCpf('11144477735'), '111.444.777-35');
    assert.equal(formatarCpf('111.444.777-35'), '111.444.777-35'); assert.equal(formatarCpf('abc'), '');
    assert.equal(formatarTelefone('11'), '11'); assert.equal(formatarTelefone('1133334444'), '(11) 3333-4444');
    assert.equal(formatarTelefone('+55 (11) 91111-2222'), '(11) 91111-2222');
});
test('CPF confere os digitos verificadores com a mesma regra do backend', () => {
    for (const cpf of ['', '111', '11111111111', '11144477736', '11144477735', '111.444.777-35']) assert.equal(!erroCpf(cpf), !validarCpf(cpf, true));
});
test('cadastro indica todos os campos invalidos e permite corrigir sem perder dados', () => {
    assert.deepEqual(validarCamposConta(dados, 'registrar'), {});
    const invalidos = validarCamposConta({ nome: 'Cliente', cpf: '111', telefone: '11', email: 'invalido', senha: 'curta', confirmacao: 'outra' }, 'registrar');
    assert.deepEqual(Object.keys(invalidos), ['nome', 'cpf', 'telefone', 'email', 'senha', 'confirmacao']);
    assert.deepEqual(validarCamposConta({...dados, telefone: '+55 (11) 3333-4444'}, 'registrar'), {});
    assert.ok(validarCamposConta({...dados, senha: 'x'.repeat(129)}, 'registrar').senha);
});
test('login nao exige campos de cadastro; ativacao exige senha e confirmacao', () => {
    assert.deepEqual(validarCamposConta({email: dados.email, senha: 'antiga'}, 'entrar'), {});
    assert.ok(validarCamposConta({email: dados.email, senha: ''}, 'entrar').senha);
    assert.deepEqual(validarCamposConta({senha: dados.senha, confirmacao: dados.senha}, 'ativar'), {});
    assert.ok(validarCamposConta({senha: dados.senha, confirmacao: ''}, 'ativar').confirmacao);
});
test('API preserva erros por campo e tempo para nova tentativa', async () => {
    const original = globalThis.fetch;
    try {
        globalThis.fetch = async () => Response.json({mensagem:'Confira', campos:{cpf:'Confira o CPF'}}, {status:400});
        await assert.rejects(contaApi('/conta/registrar', {}), e => e.campos.cpf === 'Confira o CPF' && e.status === 400);
        globalThis.fetch = async () => Response.json({mensagem:'Aguarde'}, {status:429, headers:{'Retry-After':'120'}});
        await assert.rejects(contaApi('/conta/registrar', {}), e => e.status === 429 && e.tentarEmSegundos === 120);
    } finally { globalThis.fetch = original; }
});

test('recuperacao pede apenas email valido, sem CPF ou senha',()=>{
    assert.deepEqual(validarCamposConta({email:'cliente@example.com'},'recuperar'),{});
    assert.ok(validarCamposConta({email:'invalido'},'recuperar').email);
});
