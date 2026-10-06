import { env } from "../config/env.js";

export function obterPixManual(status: string | undefined) {
    if (status !== "pendente" || !env.PIX_CHAVE || !env.PIX_RECEBEDOR) {
        return null;
    }

    return {
        chave: env.PIX_CHAVE,
        recebedor: env.PIX_RECEBEDOR
    };
}
