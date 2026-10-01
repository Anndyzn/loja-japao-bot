import { Router } from "express";
import { cadastrarSolicitacaoPublica, atualizarCotacaoSolicitacao, atualizarStatusSolicitacao, buscarSolicitacaoPorId, cadastrarSolicitacao, listarSolicitacoes, listarSolicitacoesPorCliente, vincularClienteSolicitacao, vincularPedidoSolicitacao, vincularProdutoSolicitacao } from "../controllers/solicitacoes.controller.js";
import { exigirAdmin } from "../middlewares/auth.middleware.js";

export const solicitacoesRoutes = Router();

solicitacoesRoutes.get("/", exigirAdmin, listarSolicitacoes);

solicitacoesRoutes.get("/cliente/:clienteId", exigirAdmin, listarSolicitacoesPorCliente);

solicitacoesRoutes.get("/:id", exigirAdmin, buscarSolicitacaoPorId);

solicitacoesRoutes.post("/", cadastrarSolicitacao);

solicitacoesRoutes.patch("/:id/status", exigirAdmin, atualizarStatusSolicitacao);

solicitacoesRoutes.patch("/:id/cotacao", exigirAdmin, atualizarCotacaoSolicitacao);

solicitacoesRoutes.patch("/:id/cliente", exigirAdmin, vincularClienteSolicitacao);

solicitacoesRoutes.patch("/:id/produto", exigirAdmin, vincularProdutoSolicitacao);

solicitacoesRoutes.patch("/:id/pedido", exigirAdmin, vincularPedidoSolicitacao);

solicitacoesRoutes.post("/publica", cadastrarSolicitacaoPublica);
