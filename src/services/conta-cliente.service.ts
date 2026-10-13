import { normalizarCpf, validarCpf } from "../utils/cpf.js";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { gerarHashSenha, senhaConfere } from "../utils/senhas.js";

export class ErroConta extends Error {
    constructor(message: string, public status = 400, public campos: Record<string, string> = {}) { super(message); }
}
export const emailNormalizado = (email: string) => email.trim().toLowerCase();
export function telefoneConta(telefone: string) {
    const digitos = telefone.replace(/\D/g, "");
    return /^55\d{10,11}$/.test(digitos) ? digitos.slice(2) : digitos;
}
export const hashTokenCliente = (token: string) => createHash("sha256").update(token).digest("hex");
const hashDummy = gerarHashSenha(randomBytes(32).toString("hex"));
const conflitoCpf = () => new ErroConta("Este CPF ja possui cadastro. Entre na sua conta ou use Esqueci minha senha.", 409, { cpf: "Este CPF ja possui cadastro. Entre ou use Esqueci minha senha." });
const conflitoEmail = () => new ErroConta("Este e-mail ja possui uma conta. Entre com sua senha ou use outro e-mail para uma pessoa diferente.", 409, { email: "Este e-mail ja possui conta. Entre ou informe outro e-mail." });
function emailValido(email: unknown): email is string {
    return typeof email === "string" && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
export function validarSenhaCliente(senha: unknown): asserts senha is string {
    if (typeof senha !== "string" || senha.length < 10 || senha.length > 128) throw new ErroConta("Confira a senha informada", 400, { senha: "Use entre 10 e 128 caracteres." });
}
function duplicado(erro: unknown) { return typeof erro === "object" && erro !== null && "code" in erro && erro.code === "P2002"; }

type DadosCadastro = { nome?: unknown; email?: unknown; telefone?: unknown; senha?: unknown; cpf?: unknown };
export function validarCadastroConta(dados: DadosCadastro): asserts dados is { nome: string; email: string; telefone: string; senha: string; cpf: string } {
    const campos: Record<string, string> = {};
    if (typeof dados.nome !== "string" || dados.nome.trim().split(/\s+/).length < 2 || dados.nome.length > 120) campos.nome = "Informe seu nome e sobrenome (ate 120 caracteres).";
    if (!emailValido(dados.email)) campos.email = "Informe um e-mail valido, como nome@exemplo.com.";
    if (typeof dados.telefone !== "string" || !/^\d{10,11}$/.test(telefoneConta(dados.telefone))) campos.telefone = "Informe o DDD e o telefone: 10 ou 11 digitos.";
    const erroCpf = validarCpf(dados.cpf, true);
    if (erroCpf) campos.cpf = erroCpf;
    if (typeof dados.senha !== "string" || dados.senha.length < 10 || dados.senha.length > 128) campos.senha = "Use entre 10 e 128 caracteres.";
    if (Object.keys(campos).length) throw new ErroConta("Confira os campos destacados.", 400, campos);
}

export async function registrarContaCliente(dados: DadosCadastro) {
    validarCadastroConta(dados);
    const cpf = normalizarCpf(dados.cpf);
    const nome = dados.nome.trim(), email = emailNormalizado(dados.email), telefone = telefoneConta(dados.telefone);
    const senhaHash = gerarHashSenha(dados.senha);
    try {
        return await prisma.$transaction(async tx => {
            // Telefone e contato; somente CPF identifica o cadastro.
            await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${"cadastro-cpf:" + cpf}))::text`;
            if (await tx.cliente.findUnique({ where: { cpf }, select: { id: true } })) throw conflitoCpf();
            if (await tx.contaCliente.findUnique({ where: { email }, select: { clienteId: true } })) throw conflitoEmail();
            const conta = await tx.contaCliente.create({ data: {
                email, senhaHash, cliente: { create: { nome, telefone, email, cpf, endereco: "" } }
            } });
            return { clienteId: conta.clienteId, senhaHash };
        });
    } catch (erro) {
        if (duplicado(erro)) {
            // A restricao do banco tambem cobre cadastros simultaneos.
            if (await prisma.cliente.findUnique({ where: { cpf }, select: { id: true } })) throw conflitoCpf();
            throw conflitoEmail();
        }
        throw erro;
    }
}

export async function entrarContaCliente(emailEntrada: unknown, senha: unknown) {
    if (!emailValido(emailEntrada) || typeof senha !== "string" || senha.length > 128) throw new ErroConta("E-mail ou senha invalidos", 401);
    const conta = await prisma.contaCliente.findUnique({ where: { email: emailNormalizado(emailEntrada) } });
    const confere = senhaConfere(senha, conta?.senhaHash ?? hashDummy);
    if (!conta?.senhaHash || !confere) throw new ErroConta("E-mail ou senha invalidos", 401);
    return { clienteId: conta.clienteId, senhaHash: conta.senhaHash };
}

export async function criarSessaoCliente(credencial: { clienteId: number; senhaHash: string }) {
    const { clienteId, senhaHash } = credencial;
    const token = randomBytes(32).toString("hex");
    const expiraEm = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.sessaoCliente.deleteMany({ where: { expiraEm: { lte: new Date() } } });
    await prisma.$transaction(async tx => {
        // Uma troca de senha concorrente nao pode emitir sessao com a senha antiga.
        await tx.$queryRaw`SELECT "clienteId" FROM "ContaCliente" WHERE "clienteId" = ${clienteId} FOR UPDATE`;
        const conta = await tx.contaCliente.findUnique({ where: { clienteId } });
        if (!conta?.senhaHash || conta.senhaHash !== senhaHash) throw new ErroConta("Entre novamente com sua senha atual", 401);
        await tx.sessaoCliente.create({ data: { tokenHash: hashTokenCliente(token), clienteId, expiraEm } });
    });
    return { token, expiraEm };
}

export async function redefinirSenhaCliente(token: unknown, senha: unknown) {
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) throw new ErroConta("Link invalido ou expirado");
    validarSenhaCliente(senha);
    const senhaHash = gerarHashSenha(senha);
    return prisma.$transaction(async tx => {
        const conta = await tx.contaCliente.findUnique({ where: { conviteHash: hashTokenCliente(token) } });
        if (!conta?.senhaHash) throw new ErroConta("Link invalido ou expirado");
        const alterada = await tx.contaCliente.updateMany({ where: {
            clienteId: conta.clienteId, conviteHash: hashTokenCliente(token), conviteExpiraEm: { gt: new Date() }
        }, data: { senhaHash, conviteHash: null, conviteExpiraEm: null } });
        if (alterada.count !== 1) throw new ErroConta("Link invalido ou expirado");
        await tx.sessaoCliente.deleteMany({ where: { clienteId: conta.clienteId } });
        return { clienteId: conta.clienteId, senhaHash };
    });
}
