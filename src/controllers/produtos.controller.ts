import type { Request, Response } from "express";
import { produtos } from "../data/produtos.js";

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
        id: produtos.length + 1,
        nome,
        preco,
        estoque
    };

    produtos.push(novoProduto);

    return res.status(201).json(novoProduto);
}
