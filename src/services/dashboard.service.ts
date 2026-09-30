import { prisma } from "../lib/prisma.js";

export async function obterResumoDashboard() {
    const [
        totalProdutos,
        produtosComEstoqueBaixo,
        totalClientes,
        totalPedidos,
        pedidosPendentes,
        pedidosPagos,
        pedidosEnviados,
        faturamentoConfirmado,
        totalPagamentos,
        pagamentosAprovados,
        totalSolicitacoes,
        solicitacoesAbertas
    ] = await Promise.all([
        prisma.produto.count(),
        prisma.produto.count({
            where: {
                estoque: {
                    lte: 5
                }
            }
        }),
        prisma.cliente.count(),
        prisma.pedido.count(),
        prisma.pedido.count({
            where: {
                status: "pendente"
            }
        }),
        prisma.pedido.count({
            where: {
                status: "pago"
            }
        }),
        prisma.pedido.count({
            where: {
                status: "enviado"
            }
        }),
        prisma.pedido.aggregate({
            _sum: {
                total: true
            },
            where: {
                status: {
                    in: ["pago", "enviado"]
                }
            }
        }),
        prisma.pagamento.count(),
        prisma.pagamento.count({
            where: {
                status: "aprovado"
            }
        }),
        prisma.solicitacaoProduto.count(),
        prisma.solicitacaoProduto.count({
            where: {
                status: {
                    in: ["recebida", "em_analise", "cotada"]
                }
            }
        })
    ]);

    return {
        produtos: {
            total: totalProdutos,
            estoqueBaixo: produtosComEstoqueBaixo
        },
        clientes: {
            total: totalClientes
        },
        pedidos: {
            total: totalPedidos,
            pendentes: pedidosPendentes,
            pagos: pedidosPagos,
            enviados: pedidosEnviados,
            faturamentoConfirmado: Number(faturamentoConfirmado._sum.total ?? 0)
        },
        pagamentos: {
            total: totalPagamentos,
            aprovados: pagamentosAprovados
        },
        solicitacoes: {
            total: totalSolicitacoes,
            abertas: solicitacoesAbertas
        }
    };
}
