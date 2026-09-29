export type MetodoPagamento = "pix" | "cartao" | "boleto";

export type StatusPagamento = "aprovado";

export type Pagamento = {
    id: number;
    pedidoId: number;
    valor: number;
    metodo: MetodoPagamento;
    status: StatusPagamento;
    criadoEm: string;
};

export const pagamentos: Pagamento[] = [];

let proximoPagamentoId = pagamentos.length + 1;

export function gerarProximoPagamentoId() {
    const id = proximoPagamentoId;
    proximoPagamentoId++;

    return id;
}
