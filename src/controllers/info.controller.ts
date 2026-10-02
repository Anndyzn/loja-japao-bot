import type { Request, Response } from "express";
import { obterInformacoesApi } from "../services/info.service.js";

export function mostrarInformacoesApi(req: Request, res: Response) {
    return res.json(obterInformacoesApi());
}
