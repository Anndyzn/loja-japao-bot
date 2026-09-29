import type { Request, Response } from "express";
import { gerarProximoProdutoId, produtos } from "../data/produtos.js";

export function listarProdutos(req: Request, res: Response) {
    return res.json(produtos);
}

export function buscarProdutoPorId(req: Request, res: Response) {
    const id = Number(req.params.id);

    const produto = produtos.find((produto) => produto.id === id);

    if (!produto) {
        return res.status(404).json({
            mensagem: "Produto não encontrado"
        });
    }

    return res.json(produto);
}

export function cadastrarProduto(req: Request, res: Response) {
    const { nome, preco, estoque } = req.body;

    if (!nome || preco === undefined || estoque === undefined) {
        return res.status(400).json({
            mensagem: "Nome, preço e estoque são obrigatorios"
        });
    }

    const novoProduto = {
        id: gerarProximoProdutoId(),
        nome,
        preco,
        estoque
    };

    produtos.push(novoProduto);

    return res.status(201).json(novoProduto);
}

export function atualizarProduto(req: Request, res: Response) {
    const id = Number(req.params.id);

    const produto = produtos.find((produto) => produto.id === id);

    if (!produto) {
        return res.status(404).json({
            mensagem: "Produto não encontrado"
        });
    }

    const { nome, preco, estoque } = req.body;

    if (nome !== undefined) {
        produto.nome = nome;
    }

    if (preco !== undefined) {
        produto.preco = preco;
    }

    if (estoque !== undefined) {
        produto.estoque = estoque;
    }

    return res.json(produto);
}

export function removerProduto(req: Request, res: Response) {
    const id = Number(req.params.id);

    const indiceProduto = produtos.findIndex((produto) => produto.id === id);

    if (indiceProduto === -1) {
        return res.status(404).json({
            mensagem: "Produto não encontrado"
        });
    }

    produtos.splice(indiceProduto, 1);

    return res.json({
        mensagem: "Produto removido com sucesso"
    });
}
