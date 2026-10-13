import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizarCpf, validarCpf } from '../src/utils/cpf.ts';

test('CPF aceita pontuacao e conserva zeros iniciais',()=>{
    for(const cpf of ['11144477735','111.444.777-35','01234567890',' 012.345.678-90 ']) assert.equal(validarCpf(cpf,true),undefined);
    assert.equal(normalizarCpf('012.345.678-90'),'01234567890');
});
test('CPF rejeita erro nos digitos, repeticoes e formato incorreto',()=>{
    for(const cpf of ['11144477736','11144477745','00000000000','11111111111','123456789','abc11144477735','111-444-777-35',11144477735,null,'']) assert.ok(validarCpf(cpf));
});
test('CPF ausente so e aceito nos fluxos compativeis com clientes antigos',()=>{
    assert.equal(validarCpf(undefined),undefined);assert.ok(validarCpf(undefined,true));
});
