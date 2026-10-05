import type { Prisma, StatusSolicitacao } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

export type { StatusSolicitacao } from "../../generated/prisma/client.js";

type FiltrosSolicitacoes = {
    status?: StatusSolicitacao | undefined;
    busca?: string | undefined;
};

type SolicitacaoResposta = {
    id: number;
    clienteId: number | null;
    produtoId: number | null;
    pedidoId: number | null;
    contato?: { nome: string; telefone: string };
    produto?: {
        id: number;
        nome: string;
        preco: number;
        estoque: number;
    };
    nomeProduto: string;
    descricao: string;
    linkReferencia?: string;
    valorCotado?: number;
    observacaoAdmin?: string;
    status: StatusSolicitacao;
    criadoEm: string;
};

type SolicitacaoBanco = {
    id: number;
    clienteId: number | null;
    produtoId: number | null;
    pedidoId: number | null;
    contatoNome: string | null;
    contatoTelefone: string | null;
    produto?: {
        id: number;
        nome: string;
        preco: unknown;
        estoque: number;
    } | null;
    nomeProduto: string;
    descricao: string;
    linkReferencia: string | null;
    valorCotado: unknown | null;
    observacaoAdmin: string | null;
    status: StatusSolicitacao;
    criadoEm: Date;
};

type ResultadoCriacaoSolicitacao = {
    solicitacao?: SolicitacaoResposta;
    mensagemErro?: string;
};

const includeProdutoSolicitacao = {
    produto: {
        select: {
            id: true,
            nome: true,
            preco: true,
            estoque: true
        }
    }
} satisfies Prisma.SolicitacaoProdutoInclude;

function criarWhereSolicitacoes(filtros: FiltrosSolicitacoes) {
    const where: Prisma.SolicitacaoProdutoWhereInput = {};

    if (filtros.status) {
        where.status = filtros.status;
    }

    const busca = filtros.busca?.trim();

    if (!busca) {
        return where;
    }

    const buscaNumerica = Number(busca);
    const buscaEhId = Number.isInteger(buscaNumerica) && buscaNumerica > 0;
    const texto: Prisma.StringFilter<"SolicitacaoProduto"> = {
        contains: busca,
        mode: "insensitive"
    };
    const textoCliente: Prisma.StringFilter<"Cliente"> = {
        contains: busca,
        mode: "insensitive"
    };

    where.OR = [
        { nomeProduto: texto },
        { descricao: texto },
        { contatoNome: texto },
        { contatoTelefone: { contains: busca } },
        { linkReferencia: texto },
        { observacaoAdmin: texto },
        { cliente: { is: { nome: textoCliente } } },
        { cliente: { is: { telefone: { contains: busca } } } }
    ];

    if (buscaEhId) {
        where.OR.push(
            { id: buscaNumerica },
            { clienteId: buscaNumerica },
            { produtoId: buscaNumerica },
            { pedidoId: buscaNumerica }
        );
    }

    return where;
}

function formatarSolicitacao(solicitacao: SolicitacaoBanco): SolicitacaoResposta {
    const resposta: SolicitacaoResposta = {
        id: solicitacao.id,
        clienteId: solicitacao.clienteId,
        produtoId: solicitacao.produtoId,
        pedidoId: solicitacao.pedidoId,
        nomeProduto: solicitacao.nomeProduto,
        descricao: solicitacao.descricao,
        status: solicitacao.status,
        criadoEm: solicitacao.criadoEm.toISOString()
    };

    if (solicitacao.produto) {
        resposta.produto = {
            id: solicitacao.produto.id,
            nome: solicitacao.produto.nome,
            preco: Number(solicitacao.produto.preco),
            estoque: solicitacao.produto.estoque
        };
    }

    if (solicitacao.contatoNome && solicitacao.contatoTelefone) {
        resposta.contato = { nome: solicitacao.contatoNome, telefone: solicitacao.contatoTelefone };
    }

    if (solicitacao.linkReferencia !== null) {
        resposta.linkReferencia = solicitacao.linkReferencia;
    }

    if (solicitacao.valorCotado !== null) {
        resposta.valorCotado = Number(solicitacao.valorCotado);
    }

    if (solicitacao.observacaoAdmin !== null) {
        resposta.observacaoAdmin = solicitacao.observacaoAdmin;
    }

    return resposta;
}

export async function obterTodasSolicitacoes() {
    const solicitacoes = await prisma.solicitacaoProduto.findMany({
        include: includeProdutoSolicitacao,
        orderBy: {
            id: "asc"
        }
    });

    return solicitacoes.map(formatarSolicitacao);
}

export async function obterSolicitacoesFiltradas(filtros: FiltrosSolicitacoes) {
    const solicitacoes = await prisma.solicitacaoProduto.findMany({
        where: criarWhereSolicitacoes(filtros),
        include: includeProdutoSolicitacao,
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
        },
        include: {
            produto: {
                select: {
                    id: true,
                    nome: true,
                    preco: true,
                    estoque: true
                }
            }
        }
    });

    if (!solicitacao) {
        return undefined;
    }

    return formatarSolicitacao(solicitacao);
}

export async function obterSolicitacoesPorClienteId(clienteId: number, busca?: string) {
    const solicitacoes = await prisma.solicitacaoProduto.findMany({
        where: {
            AND: [
                { clienteId },
                criarWhereSolicitacoes({ busca })
            ]
        },
        include: includeProdutoSolicitacao,
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

export async function atualizarCotacaoSolicitacaoPorId(
    id: number,
    valorCotado: number,
    observacaoAdmin: string | undefined
) {
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
            valorCotado,
            observacaoAdmin: observacaoAdmin ?? null,
            status: "cotada"
        }
    });

    return formatarSolicitacao(solicitacaoAtualizada);
}

export async function vincularClienteSolicitacaoPorId(id: number, clienteId: number) {
    const solicitacaoExiste = await prisma.solicitacaoProduto.findUnique({
        where: {
            id
        }
    });

    if (!solicitacaoExiste) {
        return {
            mensagemErro: "Solicitacao nao encontrada"
        };
    }

    const clienteExiste = await prisma.cliente.findUnique({
        where: {
            id: clienteId
        }
    });

    if (!clienteExiste) {
        return {
            mensagemErro: "Cliente nao encontrado"
        };
    }

    const solicitacaoAtualizada = await prisma.solicitacaoProduto.update({
        where: {
            id
        },
        data: {
            clienteId
        }
    });

    return {
        solicitacao: formatarSolicitacao(solicitacaoAtualizada)
    };
}

export async function vincularProdutoSolicitacaoPorId(id: number, produtoId: number) {
    const solicitacaoExiste = await prisma.solicitacaoProduto.findUnique({
        where: {
            id
        }
    });

    if (!solicitacaoExiste) {
        return {
            mensagemErro: "Solicitacao nao encontrada"
        };
    }

    const produtoExiste = await prisma.produto.findUnique({
        where: {
            id: produtoId
        }
    });

    if (!produtoExiste) {
        return {
            mensagemErro: "Produto nao encontrado"
        };
    }

    const solicitacaoAtualizada = await prisma.solicitacaoProduto.update({
        where: {
            id
        },
        data: {
            produtoId
        },
        include: {
            produto: {
                select: {
                    id: true,
                    nome: true,
                    preco: true,
                    estoque: true
                }
            }
        }
    });

    return {
        solicitacao: formatarSolicitacao(solicitacaoAtualizada)
    };
}

export async function vincularPedidoSolicitacaoPorId(id: number, pedidoId: number) {
    const solicitacaoExiste = await prisma.solicitacaoProduto.findUnique({
        where: {
            id
        }
    });

    if (!solicitacaoExiste) {
        return {
            mensagemErro: "Solicitacao nao encontrada"
        };
    }

    if (solicitacaoExiste.pedidoId !== null && solicitacaoExiste.pedidoId !== pedidoId) {
        return {
            mensagemErro: `Solicitacao ja vinculada ao pedido ${solicitacaoExiste.pedidoId}`
        };
    }

    const pedidoExiste = await prisma.pedido.findUnique({
        where: {
            id: pedidoId
        }
    });

    if (!pedidoExiste) {
        return {
            mensagemErro: "Pedido nao encontrado"
        };
    }

    const solicitacaoAtualizada = await prisma.solicitacaoProduto.update({
        where: {
            id
        },
        data: {
            pedidoId,
            status: "aprovada"
        },
        include: {
            produto: {
                select: {
                    id: true,
                    nome: true,
                    preco: true,
                    estoque: true
                }
            }
        }
    });

    return {
        solicitacao: formatarSolicitacao(solicitacaoAtualizada)
    };
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
