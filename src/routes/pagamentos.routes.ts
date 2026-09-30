import { Router } from "express";
import { buscarPagamentoPorId, cadastrarPagamento, listarPagamentos, listarPagamentosPorPedido } from "../controllers/pagamentos.controller.js";
import { exigirAdmin } from "../middlewares/auth.middleware.js";

export const pagamentosRoutes = Router();

pagamentosRoutes.get("/", exigirAdmin, listarPagamentos);

pagamentosRoutes.get("/pedido/:pedidoId", exigirAdmin, listarPagamentosPorPedido);

pagamentosRoutes.get("/:id", exigirAdmin, buscarPagamentoPorId);

pagamentosRoutes.post("/", cadastrarPagamento);
