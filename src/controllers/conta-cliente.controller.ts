import { salvarEnderecoDaConta } from "../services/endereco-conta.service.js";
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { COOKIE_CLIENTE, tokenCookieCliente } from "../middlewares/cliente.middleware.js";
import { ErroConta, registrarContaCliente, entrarContaCliente, criarSessaoCliente, gerarConviteCliente, ativarContaCliente, hashTokenCliente } from "../services/conta-cliente.service.js";
import { verificarBloqueioLogin, registrarFalhaLogin, limparFalhasLogin } from "../services/login-rate-limit.service.js";

export function tratarErroConta(erro: unknown, _req: Request, res: Response, next: NextFunction) {
    if (erro instanceof ErroConta) return res.status(erro.status).json({ mensagem: erro.message, campos: erro.campos });
    return next(erro);
}
const cookieOpcoes = { httpOnly: true, secure: env.IS_PRODUCTION, sameSite: "lax" as const, path: "/" };
async function responderSessao(res: Response, credencial: { clienteId: number; senhaHash: string }, status = 200) {
    const sessao = await criarSessaoCliente(credencial);
    res.cookie(COOKIE_CLIENTE, sessao.token, { ...cookieOpcoes, expires: sessao.expiraEm });
    return res.status(status).json({ mensagem: "Conta conectada" });
}
export async function registrar(req: Request, res: Response) {
    const id = await registrarContaCliente(req.body ?? {});
    return responderSessao(res, id, 201);
}
export async function entrar(req: Request, res: Response) {
    const chave = "cliente:" + (req.ip || req.socket.remoteAddress) + ":" + String(req.body?.email ?? "").trim().toLowerCase().slice(0, 254);
    const bloqueio = verificarBloqueioLogin(chave);
    if (bloqueio.bloqueado) { res.setHeader("Retry-After", String(bloqueio.segundosRestantes)); return res.status(429).json({ mensagem: "Muitas tentativas. Aguarde antes de tentar novamente." }); }
    try {
        const id = await entrarContaCliente(req.body?.email, req.body?.senha);
        limparFalhasLogin(chave);
        return responderSessao(res, id);
    } catch (erro) { if (erro instanceof ErroConta) registrarFalhaLogin(chave); throw erro; }
}
export async function ativar(req: Request, res: Response) { return responderSessao(res, await ativarContaCliente(req.body?.token, req.body?.senha)); }
export async function sair(req: Request, res: Response) {
    const token = tokenCookieCliente(req);
    if (token) await prisma.sessaoCliente.deleteMany({ where: { tokenHash: hashTokenCliente(token) } });
    res.clearCookie(COOKIE_CLIENTE, cookieOpcoes);
    return res.json({ mensagem: "Voce saiu da conta" });
}
export async function minhaConta(_req: Request, res: Response) {
    const conta = await prisma.contaCliente.findUniqueOrThrow({ where: { clienteId: res.locals.clienteId }, include: { cliente: true } });
    return res.json({ cliente: conta.cliente, emailLogin: conta.email });
}
export async function meusPedidos(req: Request, res: Response) {
    const pagina = Math.max(1, Math.min(100000, Number(req.query.pagina) || 1));
    if (!Number.isInteger(pagina)) throw new ErroConta("Pagina invalida");
    const where = { clienteId: res.locals.clienteId as number };
    const [total, dados] = await Promise.all([
        prisma.pedido.count({ where }),
        prisma.pedido.findMany({ where, orderBy: { id: "desc" }, skip: (pagina - 1) * 20, take: 20,
            select: { id: true, criadoEm: true, total: true, status: true } })
    ]);
    return res.json({ dados, pagina, totalPaginas: Math.ceil(total / 20) });
}
export async function conviteAdmin(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) throw new ErroConta("Cliente invalido");
    res.setHeader("Cache-Control", "no-store");
    return res.json(await gerarConviteCliente(id));
}

export async function salvarEndereco(req: Request, res: Response) {
    const cliente = await salvarEnderecoDaConta(res.locals.clienteId as number, req.body);
    return res.json({ mensagem: "Endereço principal salvo.", cliente });
}

export async function minhasSolicitacoes(req: Request, res: Response) {
    const valorPagina = req.query.pagina ?? "1";
    if (typeof valorPagina !== "string" || !/^[1-9]\d{0,5}$/.test(valorPagina) || Number(valorPagina) > 100000 || Object.keys(req.query).some(campo => campo !== "pagina")) {
        throw new ErroConta("Consulta inválida. Informe apenas uma página válida.");
    }
    const pagina = Number(valorPagina), clienteId = res.locals.clienteId as number;
    const where = { clienteId };
    const [total, solicitacoes] = await prisma.$transaction([
        prisma.solicitacaoProduto.count({ where }),
        prisma.solicitacaoProduto.findMany({
            where, orderBy: { id: "desc" }, skip: (pagina - 1) * 10, take: 10,
            // Selecao explicita: nunca enviar anotacoes internas ou dados de outros clientes.
            select: { id: true, nomeProduto: true, descricao: true, status: true, criadoEm: true,
                valorCotado: true, freteInternacionalCotado: true,
                produto: { select: { tipoEnvio: true } }, pedido: { select: { id: true, clienteId: true } } }
        })
    ], { isolationLevel: "RepeatableRead" });
    const dados = solicitacoes.map(solicitacao => ({
        id: solicitacao.id, nomeProduto: solicitacao.nomeProduto, descricao: solicitacao.descricao,
        status: solicitacao.status, criadoEm: solicitacao.criadoEm,
        cotacao: ["cotada", "aprovada"].includes(solicitacao.status) && solicitacao.valorCotado !== null ? {
            valor: Number(solicitacao.valorCotado),
            freteInternacional: solicitacao.freteInternacionalCotado === null ? null : Number(solicitacao.freteInternacionalCotado),
            tipoEnvio: solicitacao.produto?.tipoEnvio ?? null
        } : null,
        // Um vinculo administrativo incorreto nunca revela o numero de um pedido alheio.
        pedidoId: solicitacao.pedido?.clienteId === clienteId ? solicitacao.pedido.id : null
    }));
    return res.json({ dados, pagina, total, totalPaginas: Math.ceil(total / 10) });
}
