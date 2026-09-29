import { gerarProximaSolicitacaoId, solicitacoes } from "../data/solicitacoes.js";
import type { SolicitacaoProduto, StatusSolicitacao } from "../data/solicitacoes.js";
import { obterClientePorId } from "./clientes.service.js";

type FiltrosSolicitacoes = {
    status?: StatusSolicitacao | undefined;
};

type ResultadoCriacaoSolicitacao = {
    solicitacao?: SolicitacaoProduto;
    mensagemErro?: string;
};

export function obterTodasSolicitacoes() {
    return solicitacoes;
}

export function obterSolicitacoesFiltradas(filtros: FiltrosSolicitacoes) {
    let solicitacoesFiltradas = solicitacoes;

    if (filtros.status !== undefined) {
        solicitacoesFiltradas = solicitacoesFiltradas.filter((solicitacao) => {
            return solicitacao.status === filtros.status;
        });
    }

    return solicitacoesFiltradas;
}

export function obterSolicitacaoPorId(id: number) {
    return solicitacoes.find((solicitacao) => solicitacao.id === id);
}

export function obterSolicitacoesPorClienteId(clienteId: number) {
    return solicitacoes.filter((solicitacao) => solicitacao.clienteId === clienteId);
}

export function criarSolicitacaoProduto(
    clienteId: number,
    nomeProduto: string,
    descricao: string,
    linkReferencia: string | undefined
): ResultadoCriacaoSolicitacao {
    const cliente = obterClientePorId(clienteId);

    if (!cliente) {
        return {
            mensagemErro: "Cliente não encontrado"
        };
    }

    const novaSolicitacao: SolicitacaoProduto = {
        id: gerarProximaSolicitacaoId(),
        clienteId,
        nomeProduto,
        descricao,
        status: "recebida",
        criadoEm: new Date().toISOString()
    };

    if (linkReferencia !== undefined) {
        novaSolicitacao.linkReferencia = linkReferencia;
    }

    solicitacoes.push(novaSolicitacao);

    return {
        solicitacao: novaSolicitacao
    };
}

export function atualizarStatusSolicitacaoPorId(id: number, status: StatusSolicitacao) {
    const solicitacao = obterSolicitacaoPorId(id);

    if (!solicitacao) {
        return undefined;
    }

    solicitacao.status = status;

    return solicitacao;
}
