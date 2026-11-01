import { resumoMercadoPago } from "./mercado-pago.service.js";
import type { StatusPedido } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { obterPixManual } from "./pix.service.js";

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

function filtrarHistoricoDuplicado<T extends { descricao: string }>(historico: T[]) {
    const descricoes = new Set<string>();

    return historico.filter((item) => {
        if (descricoes.has(item.descricao)) {
            return false;
        }

        descricoes.add(item.descricao);
        return true;
    });
}

export async function obterAcompanhamentoPedido(pedidoId: number, clienteAutenticadoId: number) {
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
            },
            historico: {
                orderBy: {
                    criadoEm: "asc"
                }
            }
        }
    });

    if (!pedido || pedido.clienteId !== clienteAutenticadoId) {
        return {
            mensagemErro: "Pedido nao encontrado",
            statusHttp: 404
        };
    }

    const pagamentoAprovado = pedido.pagamentos.find((pagamento) => pagamento.status === "aprovado");

    const mercadoPago = await resumoMercadoPago(pedido.id);
    const acompanhamento = {
        mercadoPago,
        pedidoId: pedido.id,
        status: pedido.status,
        mensagem: mercadoPago.revisao ? "Pagamento em revisao. Fale com a loja antes de continuar." : obterMensagemAcompanhamento(pedido.status),
        pix: obterPixManual(pagamentoAprovado ? undefined : pedido.status),
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
                status: mercadoPago.revisao ? "em_revisao" : "pendente",
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
        historico: filtrarHistoricoDuplicado(pedido.historico).map((item) => {
            return {
                status: item.status,
                descricao: item.descricao,
                criadoEm: item.criadoEm.toISOString()
            };
        }),
        total: Number(pedido.total),
        subtotalProdutos: Number(pedido.subtotalProdutos),
        freteValor: Number(pedido.freteValor),
        freteServico: pedido.freteServico,
        freteTransportadora: pedido.freteTransportadora,
        fretePrazoDias: pedido.fretePrazoDias,
        freteAmbiente: pedido.freteAmbiente,
        tipoEnvio: pedido.tipoEnvio,
        clienteCienteTaxasImportacao: pedido.clienteCienteTaxasImportacao,
        criadoEm: pedido.criadoEm.toISOString()
    };

    if (pedido.observacao !== null) {
        return {
            acompanhamento: {
                ...acompanhamento,
                observacao: pedido.observacao
            }
        };
    }

    return {
        acompanhamento
    };
}
