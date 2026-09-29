import type { Request, Response } from "express";
import { obterResumoDashboard } from "../services/dashboard.service.js";

export function buscarResumoDashboard(req: Request, res: Response) {
    const resumo = obterResumoDashboard();

    return res.json(resumo);
}
