import { randomBytes } from "node:crypto";

const segredo = randomBytes(48).toString("base64url");

console.log("Use este valor no AUTH_TOKEN_SECRET do .env de producao:");
console.log("");
console.log(`AUTH_TOKEN_SECRET="${segredo}"`);
