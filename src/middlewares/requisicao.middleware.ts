import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

const REQUEST_ID_HEADER = "X-Request-Id";
const REQUEST_ID_VALIDO = /^[A-Za-z0-9._:-]{8,100}$/;

function obterRequestIdInformado(valor: string | string[] | undefined) {
    if (typeof valor !== "string") {
        return undefined;
    }

    const requestId = valor.trim();

    if (!REQUEST_ID_VALIDO.test(requestId)) {
        return undefined;
    }

    return requestId;
}

export const aplicarRequestId: RequestHandler = (req, res, next) => {
    const requestId = obterRequestIdInformado(req.headers["x-request-id"]) ?? randomUUID();

    res.locals.requestId = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);

    return next();
};
