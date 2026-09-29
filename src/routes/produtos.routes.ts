import { Router } from "express";
import { atualizarProduto, buscarProdutoPorId, cadastrarProduto, listarProdutos, removerProduto } from "../controllers/produtos.controller.js";

export const produtosRoutes = Router();

produtosRoutes.get("/", listarProdutos);

produtosRoutes.get("/:id", buscarProdutoPorId);

produtosRoutes.post("/", cadastrarProduto);

produtosRoutes.patch("/:id", atualizarProduto);

produtosRoutes.delete("/:id", removerProduto);
