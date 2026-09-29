export type StatusPedido = "pendente" | "pago" | "enviado" | "cancelado";

export type ItemPedido = {
    produtoId: number;
    nomeProduto: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
};

export type Pedido = {
    id: number;
    clienteId: number;
    itens: ItemPedido[];
    total: number;
    status: StatusPedido;
    criadoEm: string;
};

export const pedidos: Pedido[] = [];

let proximoPedidoId = pedidos.length + 1;

export function gerarProximoPedidoId() {
    const id = proximoPedidoId;
    proximoPedidoId++;

    return id;
}
