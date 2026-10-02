import type { Request, Response } from "express";
import { obterHomeApi } from "../services/home.service.js";

export function mostrarHomeApi(req: Request, res: Response) {
    return res.json(obterHomeApi());
}
