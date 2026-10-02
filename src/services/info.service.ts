import { readFileSync } from "node:fs";
import { join } from "node:path";
import { env } from "../config/env.js";

type PackageJson = {
    name?: string;
    version?: string;
};

let pacoteCache: PackageJson | undefined;

function obterPackageJson() {
    if (pacoteCache !== undefined) {
        return pacoteCache;
    }

    try {
        pacoteCache = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as PackageJson;
    } catch {
        pacoteCache = {};
    }

    return pacoteCache;
}

export function obterInformacoesApi() {
    const pacote = obterPackageJson();

    return {
        nome: pacote.name ?? "loja-japao-bot",
        versao: pacote.version ?? "desconhecida",
        ambiente: env.NODE_ENV,
        uptimeSegundos: Math.floor(process.uptime()),
        dataHora: new Date().toISOString()
    };
}
