import { Router } from "express";
import { buscarProdutoPorId, cadastrarProduto, listarProdutos } from "../controllers/produtos.controller.js";
import { produtos } from "../data/produtos.js";

export const produtosRoutes = Router();

produtosRoutes.get("/", listarProdutos);

produtosRoutes.get("/:id", buscarProdutoPorId);

produtosRoutes.post("/", cadastrarProduto);

produtosRoutes.patch("/:id", (req, res) => {
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
});

produtosRoutes.delete("/:id", (req, res) => {
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
});
