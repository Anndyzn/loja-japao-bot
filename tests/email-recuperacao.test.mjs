import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { lerConfiguracaoEmail } from '../src/config/email.ts';
import nodemailer from 'nodemailer';
import { env } from '../src/config/env.ts';
import { emailRecuperacao } from '../src/services/email-recuperacao.service.ts';
const valores={SMTP_HOST:'smtp.example.com',SMTP_PORT:'587',SMTP_USER:'loja@example.com',SMTP_PASSWORD:'segredo-de-teste',SMTP_REMETENTE:'loja@example.com',APP_URL_PUBLICA:'https://loja.example'};
test('email opcional exige configuracao completa, origem confiavel e porta TLS',()=>{
    assert.equal(lerConfiguracaoEmail({SMTP_PORT:'587'},false),null);
    assert.equal(lerConfiguracaoEmail(valores,true).origem,'https://loja.example');
    for(const campo of ['SMTP_HOST','SMTP_USER','SMTP_PASSWORD','SMTP_REMETENTE','APP_URL_PUBLICA'])assert.throws(()=>lerConfiguracaoEmail({...valores,[campo]:''},false));
    for(const url of ['http://loja.example','https://usuario:senha@loja.example','https://loja.example/caminho','https://loja.example?x=1','https://loja.example#token','javascript:alert(1)'])assert.throws(()=>lerConfiguracaoEmail({...valores,APP_URL_PUBLICA:url},true));
    assert.equal(lerConfiguracaoEmail({...valores,APP_URL_PUBLICA:'http://localhost:3000'},false).origem,'http://localhost:3000');
    for(const port of ['25','abc','0'])assert.throws(()=>lerConfiguracaoEmail({...valores,SMTP_PORT:port},true));
});
test('SMTP usa TLS, origem configurada e destinatario unico sem logar ou enviar na rede',async()=>{
    const anterior=env.EMAIL_RECUPERACAO;let opcoes,mensagem;
    const transporte=mock.method(nodemailer,'createTransport',config=>{opcoes=config;return {sendMail:async msg=>{mensagem=msg;return {accepted:['cliente@example.com']};}};});
    try{
        for(const port of ['587','465']){
            env.EMAIL_RECUPERACAO=lerConfiguracaoEmail({...valores,SMTP_PORT:port},true);
            await emailRecuperacao.enviar('cliente@example.com','a'.repeat(64));
            assert.equal(opcoes.requireTLS,true);assert.equal(opcoes.secure,port==='465');assert.equal(opcoes.disableFileAccess,true);assert.equal(opcoes.disableUrlAccess,true);
            assert.deepEqual(mensagem.to,{address:'cliente@example.com',name:''});
            assert.ok(mensagem.text.includes('https://loja.example/loja/conta#recuperacao='+'a'.repeat(64)));assert.ok(!mensagem.text.includes(valores.SMTP_PASSWORD));
        }
        env.EMAIL_RECUPERACAO=null;assert.equal(emailRecuperacao.disponivel(),false);await assert.rejects(emailRecuperacao.enviar('cliente@example.com','a'),/nao configurado/);
    }finally{env.EMAIL_RECUPERACAO=anterior;transporte.mock.restore();}
});
