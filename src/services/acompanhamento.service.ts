import type { StatusPedido } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

function obterMensagemAcompanhamento(status: StatusPedido) {
    if (status === "pendente") {
        return "Pedido recebido. Aguardando pagamento.";
    }

    if (status === "pago") {
        return "Pagamento aprovado. Pedido em preparacao.";
    }

    if (status === "enviado") {
        return "Pedido enviado.";
    }

    return "Pedido cancelado.";
}

export async function obterAcompanhamentoPedido(pedidoId: number) {
    const pedido = await prisma.pedido.findUnique({
        where: {
            id: pedidoId
        },
        include: {
            cliente: true,
            itens: {
                orderBy: {
                    id: "asc"
                }
            },
            pagamentos: {
                orderBy: {
                    id: "asc"
                }
            }
        }
    });

    if (!pedido) {
        return undefined;
    }

    const pagamentoAprovado = pedido.pagamentos.find((pagamento) => pagamento.status === "aprovado");

    const acompanhamento = {
        pedidoId: pedido.id,
        status: pedido.status,
        mensagem: obterMensagemAcompanhamento(pedido.status),
        rastreio: pedido.status === "enviado" && pedido.transportadora && pedido.codigoRastreio
            ? { transportadora: pedido.transportadora, codigo: pedido.codigoRastreio }
            : null,
        cliente: {
            id: pedido.cliente.id,
            nome: pedido.cliente.nome
        },
        pagamento: pagamentoAprovado
            ? {
                status: pagamentoAprovado.status,
                metodo: pagamentoAprovado.metodo,
                valor: Number(pagamentoAprovado.valor),
                criadoEm: pagamentoAprovado.criadoEm.toISOString()
            }
            : {
                status: "pendente",
                metodo: null,
                valor: Number(pedido.total),
                criadoEm: null
            },
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
        criadoEm: pedido.criadoEm.toISOString()
    };

    if (pedido.observacao !== null) {
        return {
            ...acompanhamento,
            observacao: pedido.observacao
        };
    }

    return acompanhamento;
}
