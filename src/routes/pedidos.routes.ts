import { Router } from "express";
import { acompanharPedido, atualizarStatusPedido, buscarPedidoPorId, cadastrarPedido, listarPedidos, listarPedidosPorCliente } from "../controllers/pedidos.controller.js";

export const pedidosRoutes = Router();

pedidosRoutes.get("/", listarPedidos);

pedidosRoutes.get("/cliente/:clienteId", listarPedidosPorCliente);

pedidosRoutes.get("/:id/acompanhamento", acompanharPedido);

pedidosRoutes.get("/:id", buscarPedidoPorId);

pedidosRoutes.post("/", cadastrarPedido);

pedidosRoutes.patch("/:id/status", atualizarStatusPedido);
