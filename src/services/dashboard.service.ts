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
        pedidosAguardandoRastreio,
        pedidosProntosParaEnvio,
        faturamentoConfirmado,
        totalPagamentos,
        pagamentosAprovados,
        totalSolicitacoes,
        solicitacoesAbertas,
        pedidosRecentes,
        pedidosComAcao,
        produtosEstoqueBaixoLista
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
        prisma.pedido.count({
            where: {
                status: "pago",
                OR: [
                    {
                        transportadora: null
                    },
                    {
                        codigoRastreio: null
                    }
                ]
            }
        }),
        prisma.pedido.count({
            where: {
                status: "pago",
                transportadora: {
                    not: null
                },
                codigoRastreio: {
                    not: null
                }
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
        }),
        prisma.pedido.findMany({
            take: 5,
            include: {
                cliente: {
                    select: {
                        id: true,
                        nome: true,
                        telefone: true
                    }
                }
            },
            orderBy: {
                criadoEm: "desc"
            }
        }),
        prisma.pedido.findMany({
            take: 10,
            where: {
                status: {
                    in: ["pendente", "pago"]
                }
            },
            include: {
                cliente: {
                    select: {
                        id: true,
                        nome: true,
                        telefone: true
                    }
                }
            },
            orderBy: {
                criadoEm: "desc"
            }
        }),
        prisma.produto.findMany({
            take: 5,
            where: {
                estoque: {
                    lte: 5
                }
            },
            orderBy: [
                {
                    estoque: "asc"
                },
                {
                    nome: "asc"
                }
            ],
            select: {
                id: true,
                nome: true,
                preco: true,
                estoque: true,
                publicadoNaLoja: true
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
            acoes: {
                total: pedidosPendentes + pedidosAguardandoRastreio + pedidosProntosParaEnvio,
                pix: pedidosPendentes,
                rastreio: pedidosAguardandoRastreio,
                envio: pedidosProntosParaEnvio
            },
            faturamentoConfirmado: Number(faturamentoConfirmado._sum.total ?? 0)
        },
        pagamentos: {
            total: totalPagamentos,
            aprovados: pagamentosAprovados
        },
        solicitacoes: {
            total: totalSolicitacoes,
            abertas: solicitacoesAbertas
        },
        pedidosRecentes: pedidosRecentes.map((pedido) => {
            return {
                id: pedido.id,
                cliente: {
                    id: pedido.cliente.id,
                    nome: pedido.cliente.nome,
                    telefone: pedido.cliente.telefone
                },
                total: Number(pedido.total),
                status: pedido.status,
                criadoEm: pedido.criadoEm.toISOString()
            };
        }),
        pedidosComAcao: pedidosComAcao.map((pedido) => {
            return {
                id: pedido.id,
                cliente: {
                    id: pedido.cliente.id,
                    nome: pedido.cliente.nome,
                    telefone: pedido.cliente.telefone
                },
                total: Number(pedido.total),
                status: pedido.status,
                transportadora: pedido.transportadora,
                codigoRastreio: pedido.codigoRastreio,
                criadoEm: pedido.criadoEm.toISOString()
            };
        }),
        produtosEstoqueBaixo: produtosEstoqueBaixoLista.map((produto) => {
            return {
                id: produto.id,
                nome: produto.nome,
                preco: Number(produto.preco),
                estoque: produto.estoque,
                publicadoNaLoja: produto.publicadoNaLoja
            };
        })
    };
}
