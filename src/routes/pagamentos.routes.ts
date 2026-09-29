import { Router } from "express";
import { buscarPagamentoPorId, cadastrarPagamento, listarPagamentos, listarPagamentosPorPedido } from "../controllers/pagamentos.controller.js";

export const pagamentosRoutes = Router();

pagamentosRoutes.get("/", listarPagamentos);

pagamentosRoutes.get("/pedido/:pedidoId", listarPagamentosPorPedido);

pagamentosRoutes.get("/:id", buscarPagamentoPorId);

pagamentosRoutes.post("/", cadastrarPagamento);
