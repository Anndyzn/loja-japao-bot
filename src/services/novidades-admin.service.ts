import { prisma } from "../lib/prisma.js";
export const secoesNovidades = ["pedidos", "solicitacoes", "pagamentos", "clientes"] as const;
export type SecaoNovidades = typeof secoesNovidades[number];
export async function obterNovidadesAdmin(vistos: Record<SecaoNovidades, number>) {
    // Snapshot consistente: a quantidade e o ultimo ID pertencem a mesma consulta.
    return prisma.$transaction(async tx => {
        const contar = async (maximo: Promise<{ _max: { id: number | null } }>, quantidade: (apos: number, ate: number) => Promise<number>, visto: number) => {
            const ultimoId = (await maximo)._max.id ?? 0;
            const novos = await quantidade(visto, ultimoId);
            return { novos, ultimoId };
        };
        const [pedidos, solicitacoes, pagamentos, clientes] = await Promise.all([
            contar(tx.pedido.aggregate({ _max: { id: true } }), (gt, lte) => tx.pedido.count({ where: { id: { gt, lte } } }), vistos.pedidos),
            contar(tx.solicitacaoProduto.aggregate({ _max: { id: true } }), (gt, lte) => tx.solicitacaoProduto.count({ where: { id: { gt, lte } } }), vistos.solicitacoes),
            contar(tx.pagamento.aggregate({ _max: { id: true } }), (gt, lte) => tx.pagamento.count({ where: { id: { gt, lte } } }), vistos.pagamentos),
            contar(tx.cliente.aggregate({ _max: { id: true } }), (gt, lte) => tx.cliente.count({ where: { id: { gt, lte } } }), vistos.clientes)
        ]);
        return { pedidos, solicitacoes, pagamentos, clientes };
    }, { isolationLevel: "RepeatableRead" });
}
