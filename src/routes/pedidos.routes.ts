import { Router } from "express";
import { atualizarRastreioPedido, acompanharPedido, atualizarStatusPedido, buscarPedidoPorId, cadastrarPedido, listarPedidos, listarPedidosPorCliente } from "../controllers/pedidos.controller.js";
import { exigirAdmin } from "../middlewares/auth.middleware.js";

export const pedidosRoutes = Router();

pedidosRoutes.get("/", exigirAdmin, listarPedidos);

pedidosRoutes.get("/cliente/:clienteId", exigirAdmin, listarPedidosPorCliente);

pedidosRoutes.get("/:id/acompanhamento", acompanharPedido);

pedidosRoutes.get("/:id", exigirAdmin, buscarPedidoPorId);

pedidosRoutes.post("/", cadastrarPedido);

pedidosRoutes.patch("/:id/status", exigirAdmin, atualizarStatusPedido);

pedidosRoutes.patch("/:id/rastreio", exigirAdmin, atualizarRastreioPedido);
