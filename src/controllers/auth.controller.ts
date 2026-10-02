import type { Request, Response } from "express";
import { alterarSenhaAdmin as alterarSenhaAdminService, loginAdmin } from "../services/auth.service.js";
import { limparFalhasLogin, registrarFalhaLogin, verificarBloqueioLogin } from "../services/login-rate-limit.service.js";
import { validarTokenAdmin } from "../utils/tokens.js";

type ResultadoBloqueio = ReturnType<typeof verificarBloqueioLogin>;

function obterPayloadAdmin(req: Request) {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return undefined;
    }

    const token = authorization.replace("Bearer ", "").trim();

    return validarTokenAdmin(token);
}

function obterChaveTentativasLogin(req: Request, email: string) {
    const ip = req.ip || req.socket.remoteAddress || "ip-desconhecido";

    return `${ip}:${email}`;
}

function responderBloqueioLogin(res: Response, bloqueio: ResultadoBloqueio) {
    if (!bloqueio.bloqueado) {
        return undefined;
    }

    res.setHeader("Retry-After", String(bloqueio.segundosRestantes));

    return res.status(429).json({
        mensagem: "Muitas tentativas de login. Tente novamente mais tarde.",
        tentarNovamenteEm: bloqueio.tentarNovamenteEm.toISOString()
    });
}

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

    const emailNormalizado = email.trim().toLowerCase();
    const chaveTentativas = obterChaveTentativasLogin(req, emailNormalizado);
    const bloqueioAntesDoLogin = verificarBloqueioLogin(chaveTentativas);
    const respostaBloqueio = responderBloqueioLogin(res, bloqueioAntesDoLogin);

    if (respostaBloqueio) {
        return respostaBloqueio;
    }

    const resultado = await loginAdmin(emailNormalizado, senha);

    if (!resultado) {
        const bloqueioAposFalha = registrarFalhaLogin(chaveTentativas);
        const respostaBloqueioAposFalha = responderBloqueioLogin(res, bloqueioAposFalha);

        if (respostaBloqueioAposFalha) {
            return respostaBloqueioAposFalha;
        }

        return res.status(401).json({
            mensagem: "Email ou senha invalidos"
        });
    }

    limparFalhasLogin(chaveTentativas);

    return res.json(resultado);
}

export async function alterarSenhaAdmin(req: Request, res: Response) {
    const { senhaAtual, novaSenha, confirmacaoSenha } = req.body;

    if (typeof senhaAtual !== "string" || senhaAtual.trim() === "") {
        return res.status(400).json({
            mensagem: "Senha atual deve ser informada"
        });
    }

    if (typeof novaSenha !== "string" || novaSenha.length < 6) {
        return res.status(400).json({
            mensagem: "Nova senha deve ter pelo menos 6 caracteres"
        });
    }

    if (typeof confirmacaoSenha !== "string" || confirmacaoSenha !== novaSenha) {
        return res.status(400).json({
            mensagem: "Confirmacao da senha nao confere"
        });
    }

    const payload = obterPayloadAdmin(req);

    if (!payload) {
        return res.status(401).json({
            mensagem: "Token de admin invalido ou expirado"
        });
    }

    const resultado = await alterarSenhaAdminService(payload.adminId, senhaAtual, novaSenha);

    if (!resultado.sucesso) {
        return res.status(resultado.mensagemErro === "Admin nao encontrado" ? 404 : 400).json({
            mensagem: resultado.mensagemErro
        });
    }

    return res.json({
        mensagem: "Senha atualizada com sucesso",
        admin: resultado.admin
    });
}
