import type { Request, Response } from "express";
import { obterSaudeSistema } from "../services/health.service.js";

export async function verificarSaude(req: Request, res: Response) {
    const saude = await obterSaudeSistema();
    const statusHttp = saude.status === "ok" ? 200 : 503;

    return res.status(statusHttp).json(saude);
}
