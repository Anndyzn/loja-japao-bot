import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";

if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile(".env");
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL nao configurada");
}

const adapter = new PrismaPg({
    connectionString
});

export const prisma = new PrismaClient({
    adapter
});
