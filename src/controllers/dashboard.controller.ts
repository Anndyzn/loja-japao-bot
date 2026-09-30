import type { Request, Response } from "express";
import { obterResumoDashboard } from "../services/dashboard.service.js";

export async function buscarResumoDashboard(req: Request, res: Response) {
    const resumo = await obterResumoDashboard();

    return res.json(resumo);
}
