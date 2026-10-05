import { access } from "node:fs/promises";
import { constants } from "node:fs";

const arquivosObrigatorios = [
    "dist/src/server.js",
    "dist/generated/prisma/client.js",
    "dist/generated/prisma/internal/class.js",
    "public/admin/index.html",
    "public/loja/index.html",
    "public/loja/carrinho.html",
    "public/loja/acompanhamento.html",
    "public/loja/solicitacao.html"
];

const erros = [];

for (const arquivo of arquivosObrigatorios) {
    try {
        await access(arquivo, constants.R_OK);
    } catch {
        erros.push(arquivo);
    }
}

if (erros.length > 0) {
    console.log("Verificacao do build falhou.");
    console.log("");

    for (const arquivo of erros) {
        console.log(`[erro] Arquivo nao encontrado: ${arquivo}`);
    }

    console.log("");
    console.log("Rode npm run build e confira se o Prisma Client foi gerado.");
    process.exit(1);
}

console.log("Verificacao do build concluida.");
console.log("Arquivos essenciais encontrados em dist e public.");
