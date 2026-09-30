import type { StatusPedido } from "../data/pedidos.js";
import { obterClientePorId } from "./clientes.service.js";
import { obterPagamentosPorPedidoId } from "./pagamentos.service.js";
import { obterPedidoPorId } from "./pedidos.service.js";

function obterMensagemAcompanhamento(status: StatusPedido) {
    if (status === "pendente") {
        return "Pedido recebido. Aguardando pagamento.";
    }

    if (status === "pago") {
        return "Pagamento aprovado. Pedido em preparação.";
    }

    if (status === "enviado") {
        return "Pedido enviado.";
    }

    return "Pedido cancelado.";
}

export function obterAcompanhamentoPedido(pedidoId: number) {
    const pedido = obterPedidoPorId(pedidoId);

    if (!pedido) {
        return undefined;
    }

    const cliente = obterClientePorId(pedido.clienteId);
    const pagamentos = obterPagamentosPorPedidoId(pedido.id);
    const pagamentoAprovado = pagamentos.find((pagamento) => pagamento.status === "aprovado");

    return {
        pedidoId: pedido.id,
        status: pedido.status,
        mensagem: obterMensagemAcompanhamento(pedido.status),
        cliente: cliente
            ? {
                id: cliente.id,
                nome: cliente.nome
            }
            : null,
        pagamento: pagamentoAprovado
            ? {
                status: pagamentoAprovado.status,
                metodo: pagamentoAprovado.metodo,
                valor: pagamentoAprovado.valor,
                criadoEm: pagamentoAprovado.criadoEm
            }
            : {
                status: "pendente",
                metodo: null,
                valor: pedido.total,
                criadoEm: null
            },
        itens: pedido.itens,
        total: pedido.total,
        criadoEm: pedido.criadoEm
    };
}
