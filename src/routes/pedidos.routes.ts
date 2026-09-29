import { Router } from "express";
import { atualizarStatusPedido, buscarPedidoPorId, cadastrarPedido, listarPedidos } from "../controllers/pedidos.controller.js";

export const pedidosRoutes = Router();

pedidosRoutes.get("/", listarPedidos);

pedidosRoutes.get("/:id", buscarPedidoPorId);

pedidosRoutes.post("/", cadastrarPedido);

pedidosRoutes.patch("/:id/status", atualizarStatusPedido);
