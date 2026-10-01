import { prisma } from "../lib/prisma.js";

type FiltrosProdutos = {
    nome?: string | undefined;
    estoqueBaixo?: boolean | undefined;
    publicadoNaLoja?: boolean | undefined;
};

type ProdutoResposta = {
    id: number;
    nome: string;
    preco: number;
    estoque: number;
    imagemUrl?: string;
    publicadoNaLoja: boolean;
};

type ProdutoBanco = {
    id: number;
    nome: string;
    preco: unknown;
    estoque: number;
    imagemUrl: string | null;
    publicadoNaLoja: boolean;
};

function formatarProduto(produto: ProdutoBanco): ProdutoResposta {
    const resposta: ProdutoResposta = {
        id: produto.id,
        nome: produto.nome,
        preco: Number(produto.preco),
        estoque: produto.estoque,
        publicadoNaLoja: produto.publicadoNaLoja
    };

    if (produto.imagemUrl !== null) {
        resposta.imagemUrl = produto.imagemUrl;
    }

    return resposta;
}

export async function obterProdutosFiltrados(filtros: FiltrosProdutos) {
    const produtos = await prisma.$queryRaw<ProdutoBanco[]>`
        SELECT "id", "nome", "preco", "estoque", "imagemUrl", "publicadoNaLoja"
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

    return produtosFiltrados;
}

export async function obterProdutoPorId(id: number) {
    const produtos = await prisma.$queryRaw<ProdutoBanco[]>`
        SELECT "id", "nome", "preco", "estoque", "imagemUrl", "publicadoNaLoja"
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
    publicadoNaLoja: boolean
) {
    const novoProduto = await prisma.produto.create({
        data: {
            nome,
            preco,
            estoque,
            publicadoNaLoja
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
    imagemUrl: string | undefined,
    publicadoNaLoja: boolean | undefined
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
        publicadoNaLoja?: boolean;
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

    if (publicadoNaLoja !== undefined) {
        dadosAtualizacao.publicadoNaLoja = publicadoNaLoja;
    }

    if (Object.keys(dadosAtualizacao).length > 0) {
        await prisma.produto.update({
            where: {
                id
            },
            data: dadosAtualizacao
        });
    }

    if (imagemUrl !== undefined) {
        await prisma.$executeRaw`
            UPDATE "Produto"
            SET "imagemUrl" = ${imagemUrl}
            WHERE "id" = ${id}
        `;
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

    await prisma.produto.delete({
        where: {
            id
        }
    });

    return true;
}
