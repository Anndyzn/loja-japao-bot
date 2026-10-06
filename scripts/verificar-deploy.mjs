import { access, mkdir } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";

const SEGREDOS_PROIBIDOS = new Set([
    "segredo-local-de-desenvolvimento",
    "troque-este-segredo-em-producao"
]);
const SENHAS_ADMIN_PROIBIDAS = new Set([
    "admin123",
    "123456",
    "12345678",
    "password",
    "senha123"
]);

const erros = [];
const avisos = [];
const oks = [];

function carregarEnv() {
    if (typeof process.loadEnvFile !== "function") {
        avisos.push("Versao do Node nao possui process.loadEnvFile; variaveis devem vir do ambiente.");
        return;
    }

    try {
        process.loadEnvFile(".env");
        oks.push(".env carregado");
    } catch (erro) {
        if (erro?.code === "ENOENT") {
            avisos.push(".env nao encontrado; usando apenas variaveis do ambiente.");
            return;
        }

        throw erro;
    }
}

function obterVariavel(nome) {
    return process.env[nome]?.trim() ?? "";
}

function exigirVariavel(nome) {
    const valor = obterVariavel(nome);

    if (!valor) {
        erros.push(`${nome} nao configurada`);
        return "";
    }

    oks.push(`${nome} configurada`);
    return valor;
}

function validarBooleano(nome) {
    const valor = obterVariavel(nome);

    if (!valor) {
        return;
    }

    if (!["true", "false", "1", "0", "sim", "nao", "yes", "no"].includes(valor.toLowerCase())) {
        erros.push(`${nome} deve ser true ou false`);
        return;
    }

    oks.push(`${nome} valido`);
}

function validarInteiroPositivo(nome) {
    const valor = obterVariavel(nome);

    if (!valor) {
        return;
    }

    const numero = Number(valor);

    if (!Number.isInteger(numero) || numero <= 0) {
        erros.push(`${nome} deve ser um numero inteiro positivo`);
        return;
    }

    oks.push(`${nome} valido`);
}

function validarSegredo() {
    const segredo = exigirVariavel("AUTH_TOKEN_SECRET");

    if (!segredo) {
        return;
    }

    if (segredo.length < 32) {
        erros.push("AUTH_TOKEN_SECRET deve ter pelo menos 32 caracteres");
    }

    if (SEGREDOS_PROIBIDOS.has(segredo)) {
        erros.push("AUTH_TOKEN_SECRET ainda esta com valor de exemplo/desenvolvimento");
    }
}

async function validarUploadsDir() {
    const uploadsDir = obterVariavel("UPLOADS_DIR") || "public/uploads";
    const caminho = resolve(uploadsDir);

    try {
        await mkdir(caminho, {
            recursive: true
        });
        await access(caminho, constants.W_OK);
        oks.push("UPLOADS_DIR existe e permite escrita");
    } catch {
        erros.push("UPLOADS_DIR nao permite escrita ou nao pode ser criado");
    }
}

function validarAmbiente() {
    const nodeEnv = obterVariavel("NODE_ENV") || "development";

    if (nodeEnv !== "production") {
        avisos.push(`NODE_ENV atual e "${nodeEnv}". Para publicar, use NODE_ENV=production.`);
    } else {
        oks.push("NODE_ENV=production");
    }
}

function validarDatabaseUrl() {
    const databaseUrl = exigirVariavel("DATABASE_URL");

    if (!databaseUrl) {
        return;
    }

    if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
        erros.push("DATABASE_URL deve usar postgresql:// ou postgres://");
        return;
    }

    oks.push("DATABASE_URL parece ser PostgreSQL");
}

function validarAdminInicial() {
    const nodeEnv = obterVariavel("NODE_ENV") || "development";
    const email = obterVariavel("ADMIN_EMAIL");
    const senha = obterVariavel("ADMIN_PASSWORD");
    const algumaVariavelAdmin = email || senha;

    if (!algumaVariavelAdmin) {
        avisos.push("ADMIN_EMAIL e ADMIN_PASSWORD nao configurados; configure antes de usar db:seed para criar admin inicial.");
        return;
    }

    if (!email) {
        erros.push("ADMIN_EMAIL nao configurado");
    } else if (!email.includes("@")) {
        erros.push("ADMIN_EMAIL parece invalido");
    } else {
        oks.push("ADMIN_EMAIL configurado");
    }

    if (!senha) {
        erros.push("ADMIN_PASSWORD nao configurado");
        return;
    }

    if (senha.length < 10) {
        const mensagem = "ADMIN_PASSWORD deve ter pelo menos 10 caracteres";

        if (nodeEnv === "production") {
            erros.push(mensagem);
        } else {
            avisos.push(mensagem + " antes de publicar.");
        }
    } else {
        oks.push("ADMIN_PASSWORD tem tamanho minimo");
    }

    if (SENHAS_ADMIN_PROIBIDAS.has(senha.toLowerCase())) {
        erros.push("ADMIN_PASSWORD nao pode usar senha padrao ou fraca");
    }
}

function validarPixManual() {
    const nodeEnv = obterVariavel("NODE_ENV") || "development";
    const chave = obterVariavel("PIX_CHAVE");
    const recebedor = obterVariavel("PIX_RECEBEDOR");

    if (chave && recebedor) {
        oks.push("PIX_CHAVE e PIX_RECEBEDOR configurados");
        return;
    }

    const mensagem = "PIX_CHAVE e PIX_RECEBEDOR devem ser configurados para o checkout Pix";

    if (nodeEnv === "production") {
        erros.push(mensagem);
        return;
    }

    avisos.push(mensagem + " antes de publicar.");
}

function imprimirResultado() {
    console.log("Verificacao de deploy");
    console.log("");

    for (const ok of oks) {
        console.log(`[ok] ${ok}`);
    }

    for (const aviso of avisos) {
        console.log(`[aviso] ${aviso}`);
    }

    for (const erro of erros) {
        console.log(`[erro] ${erro}`);
    }

    console.log("");

    if (erros.length > 0) {
        console.log(`Resultado: ${erros.length} erro(s). Corrija antes de publicar.`);
        process.exitCode = 1;
        return;
    }

    if (avisos.length > 0) {
        console.log(`Resultado: sem erros, com ${avisos.length} aviso(s).`);
        return;
    }

    console.log("Resultado: pronto para os proximos passos do deploy.");
}

carregarEnv();
validarAmbiente();
validarDatabaseUrl();
validarSegredo();
validarAdminInicial();
validarPixManual();
validarBooleano("TRUST_PROXY");
validarBooleano("LOG_REQUESTS");
validarInteiroPositivo("PORT");
validarInteiroPositivo("PUBLIC_WRITE_MAX_REQUISICOES");
validarInteiroPositivo("PUBLIC_WRITE_JANELA_MINUTOS");
validarInteiroPositivo("PUBLIC_TRACKING_MAX_CONSULTAS");
validarInteiroPositivo("PUBLIC_TRACKING_JANELA_MINUTOS");
validarInteiroPositivo("ADMIN_LOGIN_MAX_TENTATIVAS");
validarInteiroPositivo("ADMIN_LOGIN_BLOQUEIO_MINUTOS");
await validarUploadsDir();
imprimirResultado();
