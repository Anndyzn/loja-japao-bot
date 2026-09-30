import { Router } from "express";
import { atualizarProduto, buscarProdutoPorId, cadastrarProduto, listarProdutos, removerProduto } from "../controllers/produtos.controller.js";
import { exigirAdmin } from "../middlewares/auth.middleware.js";

export const produtosRoutes = Router();

produtosRoutes.get("/", listarProdutos);

produtosRoutes.get("/:id", buscarProdutoPorId);

produtosRoutes.post("/", exigirAdmin, cadastrarProduto);

produtosRoutes.patch("/:id", exigirAdmin, atualizarProduto);

produtosRoutes.delete("/:id", exigirAdmin, removerProduto);
