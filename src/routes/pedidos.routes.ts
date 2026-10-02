import { Router } from "express";
import { atualizarRastreioPedido, acompanharPedido, atualizarStatusPedido, buscarPedidoPorId, cadastrarPedido, listarPedidos, listarPedidosPorCliente } from "../controllers/pedidos.controller.js";
import { exigirAdmin } from "../middlewares/auth.middleware.js";
import { limitarAcompanhamentoPublico, limitarEscritaPublica } from "../middlewares/rate-limit.middleware.js";

export const pedidosRoutes = Router();

pedidosRoutes.get("/", exigirAdmin, listarPedidos);

pedidosRoutes.get("/cliente/:clienteId", exigirAdmin, listarPedidosPorCliente);

pedidosRoutes.get("/:id/acompanhamento", limitarAcompanhamentoPublico, acompanharPedido);

pedidosRoutes.get("/:id", exigirAdmin, buscarPedidoPorId);

pedidosRoutes.post("/", limitarEscritaPublica, cadastrarPedido);

pedidosRoutes.patch("/:id/status", exigirAdmin, atualizarStatusPedido);

pedidosRoutes.patch("/:id/rastreio", exigirAdmin, atualizarRastreioPedido);
