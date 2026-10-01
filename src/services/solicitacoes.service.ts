import type { StatusSolicitacao } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

export type { StatusSolicitacao } from "../../generated/prisma/client.js";

type FiltrosSolicitacoes = {
    status?: StatusSolicitacao | undefined;
};

type SolicitacaoResposta = {
    id: number;
    clienteId: number | null;
    contato?: { nome: string; telefone: string };
    nomeProduto: string;
    descricao: string;
    linkReferencia?: string;
    status: StatusSolicitacao;
    criadoEm: string;
};

type SolicitacaoBanco = {
    id: number;
    clienteId: number | null;
    contatoNome: string | null;
    contatoTelefone: string | null;
    nomeProduto: string;
    descricao: string;
    linkReferencia: string | null;
    status: StatusSolicitacao;
    criadoEm: Date;
};

type ResultadoCriacaoSolicitacao = {
    solicitacao?: SolicitacaoResposta;
    mensagemErro?: string;
};

function formatarSolicitacao(solicitacao: SolicitacaoBanco): SolicitacaoResposta {
    const resposta: SolicitacaoResposta = {
        id: solicitacao.id,
        clienteId: solicitacao.clienteId,
        nomeProduto: solicitacao.nomeProduto,
        descricao: solicitacao.descricao,
        status: solicitacao.status,
        criadoEm: solicitacao.criadoEm.toISOString()
    };

    if (solicitacao.contatoNome && solicitacao.contatoTelefone) {
        resposta.contato = { nome: solicitacao.contatoNome, telefone: solicitacao.contatoTelefone };
    }

    if (solicitacao.linkReferencia !== null) {
        resposta.linkReferencia = solicitacao.linkReferencia;
    }

    return resposta;
}

export async function obterTodasSolicitacoes() {
    const solicitacoes = await prisma.solicitacaoProduto.findMany({
        orderBy: {
            id: "asc"
        }
    });

    return solicitacoes.map(formatarSolicitacao);
}

export async function obterSolicitacoesFiltradas(filtros: FiltrosSolicitacoes) {
    if (!filtros.status) {
        const solicitacoes = await prisma.solicitacaoProduto.findMany({
            orderBy: {
                id: "asc"
            }
        });

        return solicitacoes.map(formatarSolicitacao);
    }

    const solicitacoes = await prisma.solicitacaoProduto.findMany({
        where: {
            status: filtros.status
        },
        orderBy: {
            id: "asc"
        }
    });

    return solicitacoes.map(formatarSolicitacao);
}

export async function obterSolicitacaoPorId(id: number) {
    const solicitacao = await prisma.solicitacaoProduto.findUnique({
        where: {
            id
        }
    });

    if (!solicitacao) {
        return undefined;
    }

    return formatarSolicitacao(solicitacao);
}

export async function obterSolicitacoesPorClienteId(clienteId: number) {
    const solicitacoes = await prisma.solicitacaoProduto.findMany({
        where: {
            clienteId
        },
        orderBy: {
            id: "asc"
        }
    });

    return solicitacoes.map(formatarSolicitacao);
}

export async function criarSolicitacaoProduto(
    clienteId: number,
    nomeProduto: string,
    descricao: string,
    linkReferencia: string | undefined
): Promise<ResultadoCriacaoSolicitacao> {
    const cliente = await prisma.cliente.findUnique({
        where: {
            id: clienteId
        }
    });

    if (!cliente) {
        return {
            mensagemErro: "Cliente nao encontrado"
        };
    }

    const dadosSolicitacao: {
        clienteId: number;
        nomeProduto: string;
        descricao: string;
        linkReferencia?: string;
    } = {
        clienteId,
        nomeProduto,
        descricao
    };

    if (linkReferencia !== undefined) {
        dadosSolicitacao.linkReferencia = linkReferencia;
    }

    const novaSolicitacao = await prisma.solicitacaoProduto.create({
        data: dadosSolicitacao
    });

    return {
        solicitacao: formatarSolicitacao(novaSolicitacao)
    };
}

export async function atualizarStatusSolicitacaoPorId(id: number, status: StatusSolicitacao) {
    const solicitacaoExiste = await prisma.solicitacaoProduto.findUnique({
        where: {
            id
        }
    });

    if (!solicitacaoExiste) {
        return undefined;
    }

    const solicitacaoAtualizada = await prisma.solicitacaoProduto.update({
        where: {
            id
        },
        data: {
            status
        }
    });

    return formatarSolicitacao(solicitacaoAtualizada);
}

export async function criarSolicitacaoPublica(
    nome: string,
    telefone: string,
    nomeProduto: string,
    descricao: string,
    linkReferencia: string | undefined
) {
    // Visitantes podem pedir uma cotação antes de terem um cadastro de entrega.
    const solicitacao = await prisma.solicitacaoProduto.create({
        data: {
            contatoNome: nome,
            contatoTelefone: telefone,
            nomeProduto,
            descricao,
            ...(linkReferencia ? { linkReferencia } : {})
        }
    });
    return { id: solicitacao.id, status: solicitacao.status };
}
