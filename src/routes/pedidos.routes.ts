import { Router } from "express";
import { atualizarStatusPedido, buscarPedidoPorId, cadastrarPedido, listarPedidos, listarPedidosPorCliente } from "../controllers/pedidos.controller.js";

export const pedidosRoutes = Router();

pedidosRoutes.get("/", listarPedidos);

pedidosRoutes.get("/cliente/:clienteId", listarPedidosPorCliente);

pedidosRoutes.get("/:id", buscarPedidoPorId);

pedidosRoutes.post("/", cadastrarPedido);

pedidosRoutes.patch("/:id/status", atualizarStatusPedido);
