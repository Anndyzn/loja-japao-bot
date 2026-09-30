import type { StatusPedido } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

export type { StatusPedido } from "../../generated/prisma/client.js";

export type ItemPedidoEntrada = {
    produtoId: number;
    quantidade: number;
};

type FiltrosPedidos = {
    status?: StatusPedido | undefined;
};

type ItemPedidoResposta = {
    produtoId: number;
    nomeProduto: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
};

export type PedidoResposta = {
    id: number;
    clienteId: number;
    itens: ItemPedidoResposta[];
    total: number;
    status: StatusPedido;
    observacao?: string;
    criadoEm: string;
};

type PedidoComItens = {
    id: number;
    clienteId: number;
    total: unknown;
    status: StatusPedido;
    observacao: string | null;
    criadoEm: Date;
    itens: Array<{
        produtoId: number;
        nomeProduto: string;
        quantidade: number;
        precoUnitario: unknown;
        subtotal: unknown;
    }>;
};

type ResultadoCriacaoPedido = {
    pedido?: PedidoResposta;
    mensagemErro?: string;
};

type ResultadoAtualizacaoStatusPedido = {
    pedido?: PedidoResposta;
    mensagemErro?: string;
};

function formatarPedido(pedido: PedidoComItens): PedidoResposta {
    const resposta: PedidoResposta = {
        id: pedido.id,
        clienteId: pedido.clienteId,
        itens: pedido.itens.map((item) => {
            return {
                produtoId: item.produtoId,
                nomeProduto: item.nomeProduto,
                quantidade: item.quantidade,
                precoUnitario: Number(item.precoUnitario),
                subtotal: Number(item.subtotal)
            };
        }),
        total: Number(pedido.total),
        status: pedido.status,
        criadoEm: pedido.criadoEm.toISOString()
    };

    if (pedido.observacao !== null) {
        resposta.observacao = pedido.observacao;
    }

    return resposta;
}

function agruparItensPorProduto(itensEntrada: ItemPedidoEntrada[]) {
    const quantidadesPorProduto = new Map<number, number>();

    for (const item of itensEntrada) {
        const quantidadeAtual = quantidadesPorProduto.get(item.produtoId) ?? 0;
        quantidadesPorProduto.set(item.produtoId, quantidadeAtual + item.quantidade);
    }

    return Array.from(quantidadesPorProduto.entries()).map(([produtoId, quantidade]) => {
        return {
            produtoId,
            quantidade
        };
    });
}

const includeItensPedido = {
    itens: {
        orderBy: {
            id: "asc"
        }
    }
} as const;

type DadosCriacaoPedido = {
    clienteId: number;
    total: number;
    observacao?: string;
    itens: {
        create: Array<{
            produtoId: number;
            nomeProduto: string;
            quantidade: number;
            precoUnitario: number;
            subtotal: number;
        }>;
    };
};

export async function obterTodosPedidos() {
    const pedidos = await prisma.pedido.findMany({
        include: includeItensPedido,
        orderBy: {
            id: "asc"
        }
    });

    return pedidos.map(formatarPedido);
}

export async function obterPedidosFiltrados(filtros: FiltrosPedidos) {
    if (!filtros.status) {
        const pedidos = await prisma.pedido.findMany({
            include: includeItensPedido,
            orderBy: {
                id: "asc"
            }
        });

        return pedidos.map(formatarPedido);
    }

    const pedidos = await prisma.pedido.findMany({
        where: {
            status: filtros.status
        },
        include: includeItensPedido,
        orderBy: {
            id: "asc"
        }
    });

    return pedidos.map(formatarPedido);
}

export async function obterPedidoPorId(id: number) {
    const pedido = await prisma.pedido.findUnique({
        where: {
            id
        },
        include: includeItensPedido
    });

    if (!pedido) {
        return undefined;
    }

    return formatarPedido(pedido);
}

export async function obterPedidosPorClienteId(clienteId: number) {
    const pedidos = await prisma.pedido.findMany({
        where: {
            clienteId
        },
        include: includeItensPedido,
        orderBy: {
            id: "asc"
        }
    });

    return pedidos.map(formatarPedido);
}

export async function criarPedido(
    clienteId: number,
    itensEntrada: ItemPedidoEntrada[],
    observacao: string | undefined
): Promise<ResultadoCriacaoPedido> {
    const cliente = await prisma.cliente.findUnique({
        where: {
            id: clienteId
        }
    });

    if (!cliente) {
        return {
            mensagemErro: "Cliente nao encontrado"
        };
    }

    const itensAgrupados = agruparItensPorProduto(itensEntrada);

    return await prisma.$transaction(async (tx) => {
        const produtosDoPedido = [];

        for (const item of itensAgrupados) {
            const produto = await tx.produto.findUnique({
                where: {
                    id: item.produtoId
                }
            });

            if (!produto) {
                return {
                    mensagemErro: `Produto ${item.produtoId} nao encontrado`
                };
            }

            if (produto.estoque < item.quantidade) {
                return {
                    mensagemErro: `Estoque insuficiente para o produto ${produto.nome}`
                };
            }

            produtosDoPedido.push({
                produto,
                quantidade: item.quantidade
            });
        }

        const itens = produtosDoPedido.map(({ produto, quantidade }) => {
            const precoUnitario = Number(produto.preco);
            const subtotal = Number((precoUnitario * quantidade).toFixed(2));

            return {
                produtoId: produto.id,
                nomeProduto: produto.nome,
                quantidade,
                precoUnitario,
                subtotal
            };
        });

        const total = Number(
            itens.reduce((soma, item) => soma + item.subtotal, 0).toFixed(2)
        );

        for (const item of itens) {
            await tx.produto.update({
                where: {
                    id: item.produtoId
                },
                data: {
                    estoque: {
                        decrement: item.quantidade
                    }
                }
            });
        }

        const dadosPedido: DadosCriacaoPedido = {
            clienteId,
            total,
            itens: {
                create: itens.map((item) => {
                    return {
                        produtoId: item.produtoId,
                        nomeProduto: item.nomeProduto,
                        quantidade: item.quantidade,
                        precoUnitario: item.precoUnitario,
                        subtotal: item.subtotal
                    };
                })
            }
        };

        if (observacao !== undefined) {
            dadosPedido.observacao = observacao;
        }

        const novoPedido = await tx.pedido.create({
            data: dadosPedido,
            include: includeItensPedido
        });

        return {
            pedido: formatarPedido(novoPedido)
        };
    });
}

export async function atualizarStatusPedidoPorId(
    id: number,
    status: StatusPedido
): Promise<ResultadoAtualizacaoStatusPedido> {
    return await prisma.$transaction(async (tx) => {
        const pedido = await tx.pedido.findUnique({
            where: {
                id
            },
            include: includeItensPedido
        });

        if (!pedido) {
            return {
                mensagemErro: "Pedido nao encontrado"
            };
        }

        if (pedido.status === "cancelado") {
            return {
                mensagemErro: "Pedido cancelado nao pode mudar de status"
            };
        }

        if (pedido.status === status) {
            return {
                pedido: formatarPedido(pedido)
            };
        }

        if (status === "cancelado") {
            for (const item of pedido.itens) {
                await tx.produto.update({
                    where: {
                        id: item.produtoId
                    },
                    data: {
                        estoque: {
                            increment: item.quantidade
                        }
                    }
                });
            }
        }

        const pedidoAtualizado = await tx.pedido.update({
            where: {
                id
            },
            data: {
                status
            },
            include: includeItensPedido
        });

        return {
            pedido: formatarPedido(pedidoAtualizado)
        };
    });
}
