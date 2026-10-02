import type { Request, RequestHandler } from "express";
import { env } from "../config/env.js";
import { validarTokenAdmin } from "../utils/tokens.js";

type RegistroRateLimit = {
    inicioJanela: number;
    total: number;
};

const registrosEscritaPublica = new Map<string, RegistroRateLimit>();
const registrosAcompanhamentoPublico = new Map<string, RegistroRateLimit>();
const JANELA_ESCRITA_PUBLICA_MS = env.PUBLIC_WRITE_JANELA_MINUTOS * 60 * 1000;
const JANELA_ACOMPANHAMENTO_PUBLICO_MS = env.PUBLIC_TRACKING_JANELA_MINUTOS * 60 * 1000;

function obterAgora() {
    return Date.now();
}

function obterTokenAdmin(req: Request) {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return undefined;
    }

    return authorization.replace("Bearer ", "").trim();
}

function possuiTokenAdminValido(req: Request) {
    const token = obterTokenAdmin(req);

    return token ? validarTokenAdmin(token) !== undefined : false;
}

function obterChaveRateLimit(req: Request) {
    return req.ip || req.socket.remoteAddress || "ip-desconhecido";
}

function limparRegistrosExpirados(registros: Map<string, RegistroRateLimit>, janelaMs: number, agora: number) {
    for (const [chave, registro] of registros.entries()) {
        if (agora - registro.inicioJanela > janelaMs) {
            registros.delete(chave);
        }
    }
}

function criarLimitadorPorIp(opcoes: {
    registros: Map<string, RegistroRateLimit>;
    janelaMs: number;
    maximo: number;
    mensagem: string;
}): RequestHandler {
    return (req, res, next) => {
        if (possuiTokenAdminValido(req)) {
            return next();
        }

        const agora = obterAgora();
        const chave = obterChaveRateLimit(req);
        const registroAtual = opcoes.registros.get(chave);
        const registro =
            registroAtual && agora - registroAtual.inicioJanela <= opcoes.janelaMs
                ? registroAtual
                : {
                    inicioJanela: agora,
                    total: 0
                };

        registro.total += 1;
        opcoes.registros.set(chave, registro);

        const resetEmMs = registro.inicioJanela + opcoes.janelaMs;
        const segundosParaReset = Math.max(1, Math.ceil((resetEmMs - agora) / 1000));
        const restantes = Math.max(0, opcoes.maximo - registro.total);

        res.setHeader("RateLimit-Limit", String(opcoes.maximo));
        res.setHeader("RateLimit-Remaining", String(restantes));
        res.setHeader("RateLimit-Reset", String(segundosParaReset));

        limparRegistrosExpirados(opcoes.registros, opcoes.janelaMs, agora);

        if (registro.total > opcoes.maximo) {
            res.setHeader("Retry-After", String(segundosParaReset));

            return res.status(429).json({
                mensagem: opcoes.mensagem,
                tentarNovamenteEm: new Date(resetEmMs).toISOString(),
                requestId: res.locals.requestId
            });
        }

        return next();
    };
}

export const limitarEscritaPublica = criarLimitadorPorIp({
    registros: registrosEscritaPublica,
    janelaMs: JANELA_ESCRITA_PUBLICA_MS,
    maximo: env.PUBLIC_WRITE_MAX_REQUISICOES,
    mensagem: "Muitas tentativas. Aguarde um pouco antes de enviar novamente."
});

export const limitarAcompanhamentoPublico = criarLimitadorPorIp({
    registros: registrosAcompanhamentoPublico,
    janelaMs: JANELA_ACOMPANHAMENTO_PUBLICO_MS,
    maximo: env.PUBLIC_TRACKING_MAX_CONSULTAS,
    mensagem: "Muitas consultas de acompanhamento. Aguarde um pouco antes de tentar novamente."
});
