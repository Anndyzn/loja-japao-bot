import type { RequestHandler } from "express";

export const registrarLogRequisicao: RequestHandler = (req, res, next) => {
    const inicio = process.hrtime.bigint();

    res.on("finish", () => {
        const duracaoMs = Number(process.hrtime.bigint() - inicio) / 1_000_000;
        const requestId = res.locals.requestId ?? "-";
        const status = res.statusCode;
        const tamanhoResposta = res.getHeader("content-length") ?? "-";

        console.log("Requisicao HTTP:", {
            requestId,
            metodo: req.method,
            caminho: req.originalUrl,
            status,
            duracaoMs: Number(duracaoMs.toFixed(1)),
            tamanhoResposta
        });
    });

    return next();
};
