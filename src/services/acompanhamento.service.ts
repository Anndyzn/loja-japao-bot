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

function normalizarDigitos(valor: string | null | undefined) {
    return String(valor ?? "").replace(/\D/g, "");
}

function telefoneConfere(telefoneInformado: string, telefonesDoPedido: Array<string | null>) {
    const informado = normalizarDigitos(telefoneInformado);

    if (informado.length < 8) {
        return false;
    }

    return telefonesDoPedido.some((telefone) => {
        const telefoneDoPedido = normalizarDigitos(telefone);

        if (telefoneDoPedido.length < 8) {
            return false;
        }

        if (telefoneDoPedido === informado) {
            return true;
        }

        if (informado.length >= 10 && telefoneDoPedido.endsWith(informado)) {
            return true;
        }

        return telefoneDoPedido.length >= 10 && informado.endsWith(telefoneDoPedido);
    });
}

export async function obterAcompanhamentoPedido(pedidoId: number, telefoneInformado: string) {
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

    if (!pedido) {
        return {
            mensagemErro: "Pedido nao encontrado",
            statusHttp: 404
        };
    }

    const telefoneDoPedido = pedido.entregaTelefone ?? pedido.cliente.telefone;

    if (!telefoneConfere(telefoneInformado, [telefoneDoPedido])) {
        return {
            mensagemErro: "Telefone nao confere com o pedido",
            statusHttp: 403
        };
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
        historico: pedido.historico.map((item) => {
            return {
                status: item.status,
                descricao: item.descricao,
                criadoEm: item.criadoEm.toISOString()
            };
        }),
        total: Number(pedido.total),
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
