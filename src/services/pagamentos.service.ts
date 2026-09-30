import type { MetodoPagamento, StatusPagamento } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

export type { MetodoPagamento } from "../../generated/prisma/client.js";

type PagamentoResposta = {
    id: number;
    pedidoId: number;
    valor: number;
    metodo: MetodoPagamento;
    status: StatusPagamento;
    criadoEm: string;
};

type PagamentoBanco = {
    id: number;
    pedidoId: number;
    valor: unknown;
    metodo: MetodoPagamento;
    status: StatusPagamento;
    criadoEm: Date;
};

type ResultadoCriacaoPagamento = {
    pagamento?: PagamentoResposta;
    mensagemErro?: string;
};

function formatarPagamento(pagamento: PagamentoBanco): PagamentoResposta {
    return {
        id: pagamento.id,
        pedidoId: pagamento.pedidoId,
        valor: Number(pagamento.valor),
        metodo: pagamento.metodo,
        status: pagamento.status,
        criadoEm: pagamento.criadoEm.toISOString()
    };
}

export async function obterTodosPagamentos() {
    const pagamentos = await prisma.pagamento.findMany({
        orderBy: {
            id: "asc"
        }
    });

    return pagamentos.map(formatarPagamento);
}

export async function obterPagamentoPorId(id: number) {
    const pagamento = await prisma.pagamento.findUnique({
        where: {
            id
        }
    });

    if (!pagamento) {
        return undefined;
    }

    return formatarPagamento(pagamento);
}

export async function obterPagamentosPorPedidoId(pedidoId: number) {
    const pagamentos = await prisma.pagamento.findMany({
        where: {
            pedidoId
        },
        orderBy: {
            id: "asc"
        }
    });

    return pagamentos.map(formatarPagamento);
}

export async function criarPagamento(
    pedidoId: number,
    metodo: MetodoPagamento
): Promise<ResultadoCriacaoPagamento> {
    return await prisma.$transaction(async (tx) => {
        const pedido = await tx.pedido.findUnique({
            where: {
                id: pedidoId
            }
        });

        if (!pedido) {
            return {
                mensagemErro: "Pedido nao encontrado"
            };
        }

        if (pedido.status === "cancelado") {
            return {
                mensagemErro: "Pedido cancelado nao pode receber pagamento"
            };
        }

        if (pedido.status === "pago" || pedido.status === "enviado") {
            return {
                mensagemErro: "Pedido ja foi pago"
            };
        }

        const novoPagamento = await tx.pagamento.create({
            data: {
                pedidoId,
                valor: Number(pedido.total),
                metodo
            }
        });

        await tx.pedido.update({
            where: {
                id: pedidoId
            },
            data: {
                status: "pago"
            }
        });

        return {
            pagamento: formatarPagamento(novoPagamento)
        };
    });
}
