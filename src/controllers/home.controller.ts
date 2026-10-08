import type { Request, Response } from "express";
import { obterConfiguracaoPublica, obterHomeApi } from "../services/home.service.js";

export function mostrarHomeApi(req: Request, res: Response) {
    return res.json(obterHomeApi());
}

export function mostrarConfiguracaoPublica(req: Request, res: Response) {
    return res.json(obterConfiguracaoPublica());
}
