import type { ErrorRequestHandler, RequestHandler } from "express";

type ErroHttp = Error & {
    status?: number;
    statusCode?: number;
    type?: string;
};

export const tratarRotaNaoEncontrada: RequestHandler = (req, res) => {
    return res.status(404).json({
        mensagem: "Rota nao encontrada",
        caminho: req.originalUrl
    });
};

export const tratarErros: ErrorRequestHandler = (erro, req, res, next) => {
    if (res.headersSent) {
        return next(erro);
    }

    const erroHttp = erro as ErroHttp;

    console.error("Erro na requisicao:", {
        metodo: req.method,
        caminho: req.originalUrl,
        erro
    });

    if (erroHttp.type === "entity.parse.failed") {
        return res.status(400).json({
            mensagem: "JSON invalido no corpo da requisicao"
        });
    }

    const status = erroHttp.status ?? erroHttp.statusCode ?? 500;

    if (status >= 400 && status < 500) {
        return res.status(status).json({
            mensagem: erroHttp.message || "Erro na requisicao"
        });
    }

    return res.status(500).json({
        mensagem: "Erro interno do servidor"
    });
};
