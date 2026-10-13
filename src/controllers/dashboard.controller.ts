import { obterNovidadesAdmin, secoesNovidades, type SecaoNovidades } from "../services/novidades-admin.service.js";
import type { Request, Response } from "express";
import { obterResumoDashboard } from "../services/dashboard.service.js";

export async function buscarResumoDashboard(req: Request, res: Response) {
    const resumo = await obterResumoDashboard();

    return res.json(resumo);
}

export async function buscarNovidadesAdmin(req: Request, res: Response) {
    res.setHeader("Cache-Control", "no-store");
    const vistos = {} as Record<SecaoNovidades, number>;
    for (const secao of secoesNovidades) {
        const valor = req.query[secao] ?? "0";
        if (typeof valor !== "string" || !/^\d{1,10}$/.test(valor) || Number(valor) > 2147483647) return res.status(400).json({ mensagem: "Marcador de novidades inválido." });
        vistos[secao] = Number(valor);
    }
    return res.json(await obterNovidadesAdmin(vistos));
}
