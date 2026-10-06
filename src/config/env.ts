const SEGREDO_LOCAL = "segredo-local-de-desenvolvimento";
const SEGREDOS_PROIBIDOS_PRODUCAO = new Set([
    SEGREDO_LOCAL,
    "troque-este-segredo-em-producao"
]);

function carregarEnvLocal() {
    if (typeof process.loadEnvFile !== "function") {
        return;
    }

    try {
        process.loadEnvFile(".env");
    } catch (erro) {
        const erroNode = erro as NodeJS.ErrnoException;

        if (erroNode.code !== "ENOENT") {
            throw erro;
        }
    }
}

function obterTextoObrigatorio(nome: string) {
    const valor = process.env[nome]?.trim();

    if (!valor) {
        throw new Error(`${nome} nao configurada`);
    }

    return valor;
}

function obterTextoOpcional(nome: string, padrao: string) {
    const valor = process.env[nome]?.trim();

    return valor || padrao;
}

function obterPorta() {
    const valor = process.env.PORT?.trim();

    if (!valor) {
        return 3000;
    }

    const porta = Number(valor);

    if (!Number.isInteger(porta) || porta <= 0 || porta > 65535) {
        throw new Error("PORT deve ser um numero entre 1 e 65535");
    }

    return porta;
}

function obterInteiroPositivoOpcional(nome: string, padrao: number) {
    const valor = process.env[nome]?.trim();

    if (!valor) {
        return padrao;
    }

    const numero = Number(valor);

    if (!Number.isInteger(numero) || numero <= 0) {
        throw new Error(`${nome} deve ser um numero inteiro positivo`);
    }

    return numero;
}

function obterBooleanoOpcional(nome: string, padrao: boolean) {
    const valor = process.env[nome]?.trim().toLowerCase();

    if (!valor) {
        return padrao;
    }

    if (["true", "1", "sim", "yes"].includes(valor)) {
        return true;
    }

    if (["false", "0", "nao", "no"].includes(valor)) {
        return false;
    }

    throw new Error(`${nome} deve ser true ou false`);
}

function obterSegredoToken(producao: boolean) {
    const segredo = process.env.AUTH_TOKEN_SECRET?.trim();

    if (!producao) {
        return segredo || SEGREDO_LOCAL;
    }

    if (!segredo) {
        throw new Error("AUTH_TOKEN_SECRET deve ser configurado em producao");
    }

    if (segredo.length < 32) {
        throw new Error("AUTH_TOKEN_SECRET deve ter pelo menos 32 caracteres em producao");
    }

    if (SEGREDOS_PROIBIDOS_PRODUCAO.has(segredo)) {
        throw new Error("AUTH_TOKEN_SECRET de exemplo nao pode ser usado em producao");
    }

    return segredo;
}

carregarEnvLocal();

const nodeEnv = process.env.NODE_ENV?.trim() || "development";
const producao = nodeEnv === "production";

export const env = {
    NODE_ENV: nodeEnv,
    IS_PRODUCTION: producao,
    PORT: obterPorta(),
    DATABASE_URL: obterTextoObrigatorio("DATABASE_URL"),
    AUTH_TOKEN_SECRET: obterSegredoToken(producao),
    UPLOADS_DIR: obterTextoOpcional("UPLOADS_DIR", "public/uploads"),
    PIX_CHAVE: obterTextoOpcional("PIX_CHAVE", ""),
    PIX_RECEBEDOR: obterTextoOpcional("PIX_RECEBEDOR", ""),
    TRUST_PROXY: obterBooleanoOpcional("TRUST_PROXY", false),
    LOG_REQUESTS: obterBooleanoOpcional("LOG_REQUESTS", true),
    PUBLIC_WRITE_MAX_REQUISICOES: obterInteiroPositivoOpcional("PUBLIC_WRITE_MAX_REQUISICOES", 30),
    PUBLIC_WRITE_JANELA_MINUTOS: obterInteiroPositivoOpcional("PUBLIC_WRITE_JANELA_MINUTOS", 10),
    PUBLIC_TRACKING_MAX_CONSULTAS: obterInteiroPositivoOpcional("PUBLIC_TRACKING_MAX_CONSULTAS", 60),
    PUBLIC_TRACKING_JANELA_MINUTOS: obterInteiroPositivoOpcional("PUBLIC_TRACKING_JANELA_MINUTOS", 10),
    ADMIN_LOGIN_MAX_TENTATIVAS: obterInteiroPositivoOpcional("ADMIN_LOGIN_MAX_TENTATIVAS", 5),
    ADMIN_LOGIN_BLOQUEIO_MINUTOS: obterInteiroPositivoOpcional("ADMIN_LOGIN_BLOQUEIO_MINUTOS", 15)
};
