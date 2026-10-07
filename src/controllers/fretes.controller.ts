import type { Request, Response } from "express";
import { cotarFrete, ErroFrete } from "../services/fretes.service.js";
import { validarTokenAdmin } from "../utils/tokens.js";
export async function calcularFrete(req: Request, res: Response) {
    const authorization = req.headers.authorization;
    let permitirInternos = false;
    if (authorization) {
        permitirInternos = authorization.startsWith("Bearer ") && !!validarTokenAdmin(authorization.slice(7).trim());
        if (!permitirInternos) return res.status(401).json({mensagem:"Token de admin invalido ou expirado"});
    }
    res.setHeader("Cache-Control","no-store");
    try { return res.json(await cotarFrete(req.body?.cep,req.body?.itens,permitirInternos)); }
    catch (erro) {
        if (erro instanceof ErroFrete) return res.status(erro.status).json({mensagem:erro.message});
        throw erro;
    }
}
