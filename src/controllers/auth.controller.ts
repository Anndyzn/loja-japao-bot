import type { Request, Response } from "express";
import { loginAdmin } from "../services/auth.service.js";

export async function autenticarAdmin(req: Request, res: Response) {
    const { email, senha } = req.body;

    if (typeof email !== "string" || email.trim() === "") {
        return res.status(400).json({
            mensagem: "Email deve ser informado"
        });
    }

    if (typeof senha !== "string" || senha.trim() === "") {
        return res.status(400).json({
            mensagem: "Senha deve ser informada"
        });
    }

    const resultado = await loginAdmin(email.trim().toLowerCase(), senha);

    if (!resultado) {
        return res.status(401).json({
            mensagem: "Email ou senha invalidos"
        });
    }

    return res.json(resultado);
}
