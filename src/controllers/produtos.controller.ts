import type { Request, Response } from "express";
import { atualizarProdutoPorId, criarProduto, obterProdutoPorId, obterProdutosFiltrados, removerProdutoPorId } from "../services/produtos-db.service.js";
import { obterParametrosPaginacao, paginarLista } from "../utils/paginacao.js";
import { idEhInvalido, validarAtualizacaoProduto, validarCriacaoProduto } from "../utils/validacoes.js";

export async function listarProdutos(req: Request, res: Response) {
    const { nome, estoqueBaixo, pagina, limite } = req.query;

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

    const produtosFiltrados = await obterProdutosFiltrados({
        nome: typeof nome === "string" && nome.trim() !== "" ? nome.trim() : undefined,
        estoqueBaixo: estoqueBaixo === "true"
    });

    const paginacao = obterParametrosPaginacao(pagina, limite);

    if (paginacao.mensagemErro) {
        return res.status(400).json({
            mensagem: paginacao.mensagemErro
        });
    }

    return res.json(paginarLista(produtosFiltrados, paginacao.pagina!, paginacao.limite!));
}

export async function buscarProdutoPorId(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um número inteiro positivo"
        });
    }

    const produto = await obterProdutoPorId(id);

    if (!produto) {
        return res.status(404).json({
            mensagem: "Produto não encontrado"
        });
    }

    return res.json(produto);
}

export async function cadastrarProduto(req: Request, res: Response) {
    const { nome, preco, estoque } = req.body;

    const erroValidacao = validarCriacaoProduto(nome, preco, estoque);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const novoProduto = await criarProduto(nome.trim(), preco, estoque);

    return res.status(201).json(novoProduto);
}

export async function atualizarProduto(req: Request, res: Response) {
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

    const produto = await atualizarProdutoPorId(id, nomeAtualizado, preco, estoque);

    if (!produto) {
        return res.status(404).json({
            mensagem: "Produto não encontrado"
        });
    }

    return res.json(produto);
}

export async function removerProduto(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um número inteiro positivo"
        });
    }

    const produtoFoiRemovido = await removerProdutoPorId(id);

    if (!produtoFoiRemovido) {
        return res.status(404).json({
            mensagem: "Produto não encontrado"
        });
    }

    return res.json({
        mensagem: "Produto removido com sucesso"
    });
}
