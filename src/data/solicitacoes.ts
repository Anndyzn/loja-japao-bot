export type StatusSolicitacao = "recebida" | "em_analise" | "cotada" | "aprovada" | "recusada" | "cancelada";

export type SolicitacaoProduto = {
    id: number;
    clienteId: number;
    nomeProduto: string;
    descricao: string;
    linkReferencia?: string;
    status: StatusSolicitacao;
    criadoEm: string;
};

export const solicitacoes: SolicitacaoProduto[] = [];

let proximaSolicitacaoId = solicitacoes.length + 1;

export function gerarProximaSolicitacaoId() {
    const id = proximaSolicitacaoId;
    proximaSolicitacaoId++;

    return id;
}
