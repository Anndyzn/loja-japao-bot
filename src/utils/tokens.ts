import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";

export type PayloadTokenAdmin = {
    adminId: number;
    email: string;
    exp: number;
};

const DURACAO_TOKEN_SEGUNDOS = 60 * 60 * 8;

function obterSegredoToken() {
    return env.AUTH_TOKEN_SECRET;
}

function codificarBase64Url(valor: string) {
    return Buffer.from(valor).toString("base64url");
}

function assinar(payloadCodificado: string) {
    return createHmac("sha256", obterSegredoToken())
        .update(payloadCodificado)
        .digest("base64url");
}

function assinaturasConferem(assinaturaRecebida: string, assinaturaEsperada: string) {
    const recebida = Buffer.from(assinaturaRecebida);
    const esperada = Buffer.from(assinaturaEsperada);

    if (recebida.length !== esperada.length) {
        return false;
    }

    return timingSafeEqual(recebida, esperada);
}

export function gerarTokenAdmin(admin: { id: number; email: string }) {
    const payload: PayloadTokenAdmin = {
        adminId: admin.id,
        email: admin.email,
        exp: Math.floor(Date.now() / 1000) + DURACAO_TOKEN_SEGUNDOS
    };

    const payloadCodificado = codificarBase64Url(JSON.stringify(payload));
    const assinatura = assinar(payloadCodificado);

    return `${payloadCodificado}.${assinatura}`;
}

export function validarTokenAdmin(token: string) {
    const [payloadCodificado, assinaturaRecebida] = token.split(".");

    if (!payloadCodificado || !assinaturaRecebida) {
        return undefined;
    }

    const assinaturaEsperada = assinar(payloadCodificado);

    if (!assinaturasConferem(assinaturaRecebida, assinaturaEsperada)) {
        return undefined;
    }

    let payload: PayloadTokenAdmin;

    try {
        payload = JSON.parse(Buffer.from(payloadCodificado, "base64url").toString("utf8")) as PayloadTokenAdmin;
    } catch {
        return undefined;
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
        return undefined;
    }

    return payload;
}
