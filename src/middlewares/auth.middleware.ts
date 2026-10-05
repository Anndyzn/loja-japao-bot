import type { RequestHandler } from "express";
import { validarTokenAdmin } from "../utils/tokens.js";

export const exigirAdmin: RequestHandler = (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            mensagem: "Token de admin nao informado"
        });
    }

    const token = authorization.replace("Bearer ", "").trim();
    const payload = validarTokenAdmin(token);

    if (!payload) {
        return res.status(401).json({
            mensagem: "Token de admin invalido ou expirado"
        });
    }

    res.locals.adminPayload = payload;

    return next();
};
