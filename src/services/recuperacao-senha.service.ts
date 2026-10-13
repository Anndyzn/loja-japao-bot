import { randomBytes } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { emailRecuperacao } from "./email-recuperacao.service.js";
import { ErroConta, emailNormalizado, hashTokenCliente } from "./conta-cliente.service.js";

export const MENSAGEM_RECUPERACAO = "Se houver uma conta com este e-mail, voce recebera um link para redefinir a senha. Confira tambem o spam.";
const tentativas = new Map<string, { inicio: number; ultima: number; total: number }>();
const HORA = 60 * 60 * 1000;
const trabalhos = new Set<Promise<void>>();

export function validarEmailRecuperacao(email: unknown): asserts email is string {
    if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        throw new ErroConta("Confira o e-mail informado", 400, { email: "Informe um e-mail valido." });
    }
}

async function enviarRecuperacao(email: string) {
    const conta = await prisma.contaCliente.findUnique({ where: { email } });
    // Recuperacao nunca ativa clientes antigos sem senha nem cria contas.
    if (!conta?.senhaHash) return;
    const token = randomBytes(32).toString("hex");
    const tokenHash = hashTokenCliente(token);
    const alterada = await prisma.contaCliente.updateMany({
        where: { clienteId: conta.clienteId, senhaHash: conta.senhaHash },
        data: { conviteHash: tokenHash, conviteExpiraEm: new Date(Date.now() + 30 * 60 * 1000) }
    });
    if (!alterada.count) return;
    try { await emailRecuperacao.enviar(conta.email, token); }
    catch {
        await prisma.contaCliente.updateMany({ where: { clienteId: conta.clienteId, conviteHash: tokenHash },
            data: { conviteHash: null, conviteExpiraEm: null } });
        throw new Error("Falha ao enviar recuperacao");
    }
}

export function solicitarRecuperacao(emailEntrada: unknown) {
    validarEmailRecuperacao(emailEntrada);
    if (!emailRecuperacao.disponivel()) throw new ErroConta("A recuperacao de senha por e-mail ainda nao esta disponivel nesta loja.", 503);
    const agora = Date.now();
    for (const [chave, valor] of tentativas) if (agora - valor.inicio >= HORA) tentativas.delete(chave);
    const email = emailNormalizado(emailEntrada), chave = hashTokenCliente(email);
    const registro = tentativas.get(chave);
    // Mesma resposta para e-mails existentes, desconhecidos e repetidos.
    if (registro && (registro.total >= 3 || agora - registro.ultima < 60000)) return;
    if (trabalhos.size >= 10 || tentativas.size >= 5000) throw new ErroConta("Recuperacao temporariamente ocupada. Tente novamente em alguns minutos.", 503);
    tentativas.set(chave, { inicio: registro?.inicio ?? agora, ultima: agora, total: (registro?.total ?? 0) + 1 });
    // A resposta HTTP nao espera consulta/envio, evitando revelar contas pelo tempo de resposta.
    const trabalho = Promise.resolve().then(() => enviarRecuperacao(email)).catch(() => {
        console.warn("Falha no envio de recuperacao de senha. Confira o servico de e-mail da loja.");
    });
    trabalhos.add(trabalho);
    void trabalho.finally(() => trabalhos.delete(trabalho));
}

// Usado no encerramento do servidor e nos testes, sem expor tokens.
export async function aguardarEnviosRecuperacao() { await Promise.all([...trabalhos]); }
