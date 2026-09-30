import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const TAMANHO_CHAVE = 64;

export function gerarHashSenha(senha: string) {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(senha, salt, TAMANHO_CHAVE).toString("hex");

    return `${salt}:${hash}`;
}

export function senhaConfere(senha: string, senhaHash: string) {
    const [salt, hashSalvo] = senhaHash.split(":");

    if (!salt || !hashSalvo) {
        return false;
    }

    const hashInformado = scryptSync(senha, salt, TAMANHO_CHAVE);
    const hashSalvoBuffer = Buffer.from(hashSalvo, "hex");

    if (hashInformado.length !== hashSalvoBuffer.length) {
        return false;
    }

    return timingSafeEqual(hashInformado, hashSalvoBuffer);
}
