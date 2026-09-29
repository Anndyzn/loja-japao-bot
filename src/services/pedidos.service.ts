import { gerarProximoPedidoId, pedidos } from "../data/pedidos.js";
import type { Pedido, StatusPedido } from "../data/pedidos.js";
import type { Produto } from "../data/produtos.js";
import { obterClientePorId } from "./clientes.service.js";
import { obterProdutoPorId } from "./produtos.service.js";

export type ItemPedidoEntrada = {
    produtoId: number;
    quantidade: number;
};

type ResultadoCriacaoPedido = {
    pedido?: Pedido;
    mensagemErro?: string;
};

type ResultadoAtualizacaoStatusPedido = {
    pedido?: Pedido;
    mensagemErro?: string;
};

export function obterTodosPedidos() {
    return pedidos;
}

export function obterPedidoPorId(id: number) {
    return pedidos.find((pedido) => pedido.id === id);
}

export function obterPedidosPorClienteId(clienteId: number) {
    return pedidos.filter((pedido) => pedido.clienteId === clienteId);
}

export function criarPedido(clienteId: number, itensEntrada: ItemPedidoEntrada[]): ResultadoCriacaoPedido {
    const cliente = obterClientePorId(clienteId);

    if (!cliente) {
        return {
            mensagemErro: "Cliente não encontrado"
        };
    }

    const produtosDoPedido: Array<{ produto: Produto; quantidade: number }> = [];

    for (const item of itensEntrada) {
        const produto = obterProdutoPorId(item.produtoId);

        if (!produto) {
            return {
                mensagemErro: `Produto ${item.produtoId} não encontrado`
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
        produto.estoque -= quantidade;

        const subtotal = Number((produto.preco * quantidade).toFixed(2));

        return {
            produtoId: produto.id,
            nomeProduto: produto.nome,
            quantidade,
            precoUnitario: produto.preco,
            subtotal
        };
    });

    const total = Number(
        itens.reduce((soma, item) => soma + item.subtotal, 0).toFixed(2)
    );

    const novoPedido: Pedido = {
        id: gerarProximoPedidoId(),
        clienteId,
        itens,
        total,
        status: "pendente",
        criadoEm: new Date().toISOString()
    };

    pedidos.push(novoPedido);

    return {
        pedido: novoPedido
    };
}

function devolverItensAoEstoque(pedido: Pedido) {
    for (const item of pedido.itens) {
        const produto = obterProdutoPorId(item.produtoId);

        if (produto) {
            produto.estoque += item.quantidade;
        }
    }
}

export function atualizarStatusPedidoPorId(id: number, status: StatusPedido): ResultadoAtualizacaoStatusPedido {
    const pedido = obterPedidoPorId(id);

    if (!pedido) {
        return {
            mensagemErro: "Pedido não encontrado"
        };
    }

    if (pedido.status === "cancelado") {
        return {
            mensagemErro: "Pedido cancelado não pode mudar de status"
        };
    }

    if (pedido.status === status) {
        return {
            pedido
        };
    }

    if (status === "cancelado") {
        devolverItensAoEstoque(pedido);
    }

    pedido.status = status;

    return {
        pedido
    };
}
