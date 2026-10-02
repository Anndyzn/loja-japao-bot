import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

export async function obterSaudeSistema() {
    const inicioBanco = Date.now();
    let banco: {
        status: "ok" | "erro";
        latenciaMs: number;
    };

    try {
        await prisma.$queryRaw`SELECT 1`;
        banco = {
            status: "ok",
            latenciaMs: Date.now() - inicioBanco
        };
    } catch {
        banco = {
            status: "erro",
            latenciaMs: Date.now() - inicioBanco
        };
    }

    return {
        status: banco.status === "ok" ? "ok" : "erro",
        ambiente: env.NODE_ENV,
        uptimeSegundos: Math.floor(process.uptime()),
        dataHora: new Date().toISOString(),
        banco
    };
}
