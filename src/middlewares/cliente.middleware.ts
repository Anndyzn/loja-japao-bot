import type { Request, RequestHandler } from "express";
import { prisma } from "../lib/prisma.js";
import { hashTokenCliente } from "../services/conta-cliente.service.js";
export const COOKIE_CLIENTE = "loja_cliente";
export function tokenCookieCliente(req: Request) {
    const token = req.headers.cookie?.split(";").map(c => c.trim()).find(c => c.startsWith(COOKIE_CLIENTE + "="))?.slice(COOKIE_CLIENTE.length + 1);
    return token && /^[a-f0-9]{64}$/.test(token) ? token : undefined;
}
export const exigirCliente: RequestHandler = async (req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    const token = tokenCookieCliente(req);
    const sessao = token ? await prisma.sessaoCliente.findUnique({ where: { tokenHash: hashTokenCliente(token) } }) : null;
    if (!sessao || sessao.expiraEm <= new Date()) return res.status(401).json({ mensagem: "Entre na sua conta para continuar" });
    res.locals.clienteId = sessao.clienteId;
    return next();
};
// JSON + header proprio impedem formularios externos; nao ha CORS liberado.
export const protegerAcaoCliente: RequestHandler = (req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    if (!req.is("application/json") || req.get("X-Loja-Cliente") !== "1" || req.get("Sec-Fetch-Site") === "cross-site") {
        return res.status(403).json({ mensagem: "Abra a loja novamente para continuar" });
    }
    const origem = req.get("Origin");
    if (origem) {
        try { if (new URL(origem).origin !== req.protocol + "://" + req.get("host")) throw Error(); }
        catch { return res.status(403).json({ mensagem: "Origem da requisicao invalida" }); }
    }
    return next();
};
