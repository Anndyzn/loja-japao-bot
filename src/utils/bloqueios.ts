import type { Prisma } from "../../generated/prisma/client.js";

// O bloqueio dura ate o fim da transacao. Outras operacoes esperam e releem o estado atual.
export async function bloquearPedido(tx: Prisma.TransactionClient, id: number) {
    await tx.$queryRaw`SELECT id FROM "Pedido" WHERE id = ${id} FOR UPDATE`;
}

export async function bloquearProduto(tx: Prisma.TransactionClient, id: number) {
    await tx.$queryRaw`SELECT id FROM "Produto" WHERE id = ${id} FOR UPDATE`;
}
