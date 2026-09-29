import { gerarProximoPagamentoId, pagamentos } from "../data/pagamentos.js";
import type { MetodoPagamento, Pagamento } from "../data/pagamentos.js";
import { atualizarStatusPedidoPorId, obterPedidoPorId } from "./pedidos.service.js";

type ResultadoCriacaoPagamento = {
    pagamento?: Pagamento;
    mensagemErro?: string;
};

export function obterTodosPagamentos() {
    return pagamentos;
}

export function obterPagamentoPorId(id: number) {
    return pagamentos.find((pagamento) => pagamento.id === id);
}

export function obterPagamentosPorPedidoId(pedidoId: number) {
    return pagamentos.filter((pagamento) => pagamento.pedidoId === pedidoId);
}

export function criarPagamento(pedidoId: number, metodo: MetodoPagamento): ResultadoCriacaoPagamento {
    const pedido = obterPedidoPorId(pedidoId);

    if (!pedido) {
        return {
            mensagemErro: "Pedido não encontrado"
        };
    }

    if (pedido.status === "cancelado") {
        return {
            mensagemErro: "Pedido cancelado não pode receber pagamento"
        };
    }

    if (pedido.status === "pago" || pedido.status === "enviado") {
        return {
            mensagemErro: "Pedido já foi pago"
        };
    }

    const novoPagamento: Pagamento = {
        id: gerarProximoPagamentoId(),
        pedidoId,
        valor: pedido.total,
        metodo,
        status: "aprovado",
        criadoEm: new Date().toISOString()
    };

    pagamentos.push(novoPagamento);

    atualizarStatusPedidoPorId(pedidoId, "pago");

    return {
        pagamento: novoPagamento
    };
}
