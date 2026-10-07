import { prisma } from "../lib/prisma.js";
import type { TipoEnvioPedido } from "../../generated/prisma/client.js";
import type { MedidasProduto } from "../utils/medidas-produto.js";
import { obterMedidasEnvioPendentes } from "../utils/medidas-produto.js";

type FiltrosProdutos = {
    nome?: string | undefined;
    estoqueBaixo?: boolean | undefined;
    medidasIncompletas?: boolean | undefined;
    publicadoNaLoja?: boolean | undefined;
    tipoEnvio?: TipoEnvioPedido | undefined;
};

type ProdutoResposta = MedidasProduto & {
    medidasEnvioPendentes: string[];
    id: number;
    nome: string;
    preco: number;
    estoque: number;
    imagemUrl?: string;
    publicadoNaLoja: boolean;
    tipoEnvio: TipoEnvioPedido;
};

type ProdutoBanco = {
    pesoKg: unknown;
    alturaCm: number | null;
    larguraCm: number | null;
    comprimentoCm: number | null;
    id: number;
    nome: string;
    preco: unknown;
    estoque: number;
    imagemUrl: string | null;
    publicadoNaLoja: boolean;
    tipoEnvio: TipoEnvioPedido;
};

function formatarProduto(produto: ProdutoBanco): ProdutoResposta {
    const resposta: ProdutoResposta = {
        id: produto.id,
        medidasEnvioPendentes: obterMedidasEnvioPendentes(produto),
        pesoKg: produto.pesoKg == null ? null : Number(produto.pesoKg),
        alturaCm: produto.alturaCm,
        larguraCm: produto.larguraCm,
        comprimentoCm: produto.comprimentoCm,
        nome: produto.nome,
        preco: Number(produto.preco),
        estoque: produto.estoque,
        publicadoNaLoja: produto.publicadoNaLoja,
        tipoEnvio: produto.tipoEnvio
    };

    if (produto.imagemUrl !== null) {
        resposta.imagemUrl = produto.imagemUrl;
    }

    return resposta;
}

export async function obterProdutosFiltrados(filtros: FiltrosProdutos) {
    const produtos = await prisma.$queryRaw<ProdutoBanco[]>`
        SELECT "id", "nome", "preco", "estoque", "imagemUrl", "publicadoNaLoja", "tipoEnvio", "pesoKg", "alturaCm", "larguraCm", "comprimentoCm"
        FROM "Produto"
        ORDER BY "id" ASC
    `;

    let produtosFiltrados = produtos.map(formatarProduto);

    if (filtros.nome !== undefined) {
        produtosFiltrados = produtosFiltrados.filter((produto) => {
            return produto.nome.toLowerCase().includes(filtros.nome!.toLowerCase());
        });
    }

    if (filtros.estoqueBaixo === true) {
        produtosFiltrados = produtosFiltrados.filter((produto) => produto.estoque <= 5);
    }

    if (filtros.publicadoNaLoja !== undefined) {
        produtosFiltrados = produtosFiltrados.filter((produto) => {
            return produto.publicadoNaLoja === filtros.publicadoNaLoja;
        });
    }

    if (filtros.tipoEnvio !== undefined) {
        produtosFiltrados = produtosFiltrados.filter((produto) => produto.tipoEnvio === filtros.tipoEnvio);
    }

    if (filtros.medidasIncompletas === true) {
        produtosFiltrados = produtosFiltrados.filter(produto => produto.medidasEnvioPendentes.length > 0);
    }

    return produtosFiltrados;
}

export async function obterProdutoPorId(id: number) {
    const produtos = await prisma.$queryRaw<ProdutoBanco[]>`
        SELECT "id", "nome", "preco", "estoque", "imagemUrl", "publicadoNaLoja", "tipoEnvio", "pesoKg", "alturaCm", "larguraCm", "comprimentoCm"
        FROM "Produto"
        WHERE "id" = ${id}
        LIMIT 1
    `;

    const produto = produtos[0];

    if (!produto) {
        return undefined;
    }

    return formatarProduto(produto);
}

export async function criarProduto(
    nome: string,
    preco: number,
    estoque: number,
    imagemUrl: string | undefined,
    publicadoNaLoja: boolean,
    tipoEnvio: TipoEnvioPedido,
    medidas: MedidasProduto = {}
) {
    const novoProduto = await prisma.produto.create({
        data: {
            nome,
            preco,
            estoque,
            publicadoNaLoja,
            tipoEnvio,
            ...medidas
        }
    });

    if (imagemUrl !== undefined) {
        await prisma.$executeRaw`
            UPDATE "Produto"
            SET "imagemUrl" = ${imagemUrl}
            WHERE "id" = ${novoProduto.id}
        `;
    }

    return (await obterProdutoPorId(novoProduto.id))!;
}

export async function atualizarProdutoPorId(
    id: number,
    nome: string | undefined,
    preco: number | undefined,
    estoque: number | undefined,
    imagemUrl: string | null | undefined,
    publicadoNaLoja: boolean | undefined,
    tipoEnvio: TipoEnvioPedido | undefined,
    medidas: MedidasProduto = {}
) {
    const produtoExiste = await prisma.produto.findUnique({
        where: {
            id
        }
    });

    if (!produtoExiste) {
        return undefined;
    }

    const dadosAtualizacao: MedidasProduto & {
        nome?: string;
        preco?: number;
        estoque?: number;
        imagemUrl?: string | null;
        publicadoNaLoja?: boolean;
        tipoEnvio?: TipoEnvioPedido;
    } = { ...medidas };

    if (nome !== undefined) {
        dadosAtualizacao.nome = nome;
    }

    if (preco !== undefined) {
        dadosAtualizacao.preco = preco;
    }

    if (estoque !== undefined) {
        dadosAtualizacao.estoque = estoque;
    }

    if (publicadoNaLoja !== undefined) {
        dadosAtualizacao.publicadoNaLoja = publicadoNaLoja;
    }

    if (tipoEnvio !== undefined) {
        dadosAtualizacao.tipoEnvio = tipoEnvio;
    }

    if (imagemUrl !== undefined) {
        dadosAtualizacao.imagemUrl = imagemUrl;
    }

    if (Object.keys(dadosAtualizacao).length > 0) {
        await prisma.produto.update({
            where: {
                id
            },
            data: dadosAtualizacao
        });
    }

    return await obterProdutoPorId(id);
}

export async function removerProdutoPorId(id: number) {
    const produtoExiste = await prisma.produto.findUnique({
        where: {
            id
        }
    });

    if (!produtoExiste) {
        return false;
    }

    try {
        await prisma.produto.delete({
            where: {
                id
            }
        });
    } catch (erro) {
        if (typeof erro === "object" && erro !== null && "code" in erro && erro.code === "P2003") {
            return "emUso";
        }

        throw erro;
    }

    return true;
}
