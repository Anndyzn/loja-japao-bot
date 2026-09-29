import type { Request, Response } from "express";
import { atualizarProdutoPorId, criarProduto, obterProdutoPorId, obterProdutosFiltrados, removerProdutoPorId } from "../services/produtos.service.js";
import { idEhInvalido, validarAtualizacaoProduto, validarCriacaoProduto } from "../utils/validacoes.js";

export function listarProdutos(req: Request, res: Response) {
    const { nome, estoqueBaixo } = req.query;

    if (nome !== undefined && typeof nome !== "string") {
        return res.status(400).json({
            mensagem: "Filtro nome deve ser texto"
        });
    }

    if (estoqueBaixo !== undefined && estoqueBaixo !== "true" && estoqueBaixo !== "false") {
        return res.status(400).json({
            mensagem: "Filtro estoqueBaixo deve ser true ou false"
        });
    }

    const produtosFiltrados = obterProdutosFiltrados({
        nome: typeof nome === "string" && nome.trim() !== "" ? nome.trim() : undefined,
        estoqueBaixo: estoqueBaixo === "true"
    });

    return res.json(produtosFiltrados);
}

export function buscarProdutoPorId(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um número inteiro positivo"
        });
    }

    const produto = obterProdutoPorId(id);

    if (!produto) {
        return res.status(404).json({
            mensagem: "Produto não encontrado"
        });
    }

    return res.json(produto);
}

export function cadastrarProduto(req: Request, res: Response) {
    const { nome, preco, estoque } = req.body;

    const erroValidacao = validarCriacaoProduto(nome, preco, estoque);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const novoProduto = criarProduto(nome.trim(), preco, estoque);

    return res.status(201).json(novoProduto);
}

export function atualizarProduto(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um número inteiro positivo"
        });
    }

    const { nome, preco, estoque } = req.body;

    const erroValidacao = validarAtualizacaoProduto(nome, preco, estoque);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const nomeAtualizado = typeof nome === "string" ? nome.trim() : nome;

    const produto = atualizarProdutoPorId(id, nomeAtualizado, preco, estoque);

    if (!produto) {
        return res.status(404).json({
            mensagem: "Produto não encontrado"
        });
    }

    return res.json(produto);
}

export function removerProduto(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um número inteiro positivo"
        });
    }

    const produtoFoiRemovido = removerProdutoPorId(id);

    if (!produtoFoiRemovido) {
        return res.status(404).json({
            mensagem: "Produto não encontrado"
        });
    }

    return res.json({
        mensagem: "Produto removido com sucesso"
    });
}
