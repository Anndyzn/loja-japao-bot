import type { Produto } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

type FiltrosProdutos = {
    nome?: string | undefined;
    estoqueBaixo?: boolean | undefined;
};

type ProdutoResposta = {
    id: number;
    nome: string;
    preco: number;
    estoque: number;
};

function formatarProduto(produto: Produto): ProdutoResposta {
    return {
        id: produto.id,
        nome: produto.nome,
        preco: Number(produto.preco),
        estoque: produto.estoque
    };
}

export async function obterProdutosFiltrados(filtros: FiltrosProdutos) {
    const produtos = await prisma.produto.findMany({
        orderBy: {
            id: "asc"
        }
    });

    let produtosFiltrados = produtos.map(formatarProduto);

    if (filtros.nome !== undefined) {
        produtosFiltrados = produtosFiltrados.filter((produto) => {
            return produto.nome.toLowerCase().includes(filtros.nome!.toLowerCase());
        });
    }

    if (filtros.estoqueBaixo === true) {
        produtosFiltrados = produtosFiltrados.filter((produto) => produto.estoque <= 5);
    }

    return produtosFiltrados;
}

export async function obterProdutoPorId(id: number) {
    const produto = await prisma.produto.findUnique({
        where: {
            id
        }
    });

    if (!produto) {
        return undefined;
    }

    return formatarProduto(produto);
}

export async function criarProduto(nome: string, preco: number, estoque: number) {
    const novoProduto = await prisma.produto.create({
        data: {
            nome,
            preco,
            estoque
        }
    });

    return formatarProduto(novoProduto);
}

export async function atualizarProdutoPorId(
    id: number,
    nome: string | undefined,
    preco: number | undefined,
    estoque: number | undefined
) {
    const produtoExiste = await prisma.produto.findUnique({
        where: {
            id
        }
    });

    if (!produtoExiste) {
        return undefined;
    }

    const dadosAtualizacao: {
        nome?: string;
        preco?: number;
        estoque?: number;
    } = {};

    if (nome !== undefined) {
        dadosAtualizacao.nome = nome;
    }

    if (preco !== undefined) {
        dadosAtualizacao.preco = preco;
    }

    if (estoque !== undefined) {
        dadosAtualizacao.estoque = estoque;
    }

    const produtoAtualizado = await prisma.produto.update({
        where: {
            id
        },
        data: dadosAtualizacao
    });

    return formatarProduto(produtoAtualizado);
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

    await prisma.produto.delete({
        where: {
            id
        }
    });

    return true;
}
