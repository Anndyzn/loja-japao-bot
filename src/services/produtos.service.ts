import { gerarProximoProdutoId, produtos } from "../data/produtos.js";

type FiltrosProdutos = {
    nome?: string | undefined;
    estoqueBaixo?: boolean | undefined;
};

export function obterTodosProdutos() {
    return produtos;
}

export function obterProdutosFiltrados(filtros: FiltrosProdutos) {
    let produtosFiltrados = produtos;

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

export function obterProdutoPorId(id: number) {
    return produtos.find((produto) => produto.id === id);
}

export function criarProduto(nome: string, preco: number, estoque: number) {
    const novoProduto = {
        id: gerarProximoProdutoId(),
        nome,
        preco,
        estoque
    };

    produtos.push(novoProduto);

    return novoProduto;
}

export function atualizarProdutoPorId(
    id: number,
    nome: string | undefined,
    preco: number | undefined,
    estoque: number | undefined
) {
    const produto = obterProdutoPorId(id);

    if (!produto) {
        return undefined;
    }

    if (nome !== undefined) {
        produto.nome = nome;
    }

    if (preco !== undefined) {
        produto.preco = preco;
    }

    if (estoque !== undefined) {
        produto.estoque = estoque;
    }

    return produto;
}

export function removerProdutoPorId(id: number) {
    const indiceProduto = produtos.findIndex((produto) => produto.id === id);

    if (indiceProduto === -1) {
        return false;
    }

    produtos.splice(indiceProduto, 1);

    return true;
}
