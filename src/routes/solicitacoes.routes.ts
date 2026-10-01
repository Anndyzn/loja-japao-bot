import { Router } from "express";
import { cadastrarSolicitacaoPublica, atualizarStatusSolicitacao, buscarSolicitacaoPorId, cadastrarSolicitacao, listarSolicitacoes, listarSolicitacoesPorCliente } from "../controllers/solicitacoes.controller.js";
import { exigirAdmin } from "../middlewares/auth.middleware.js";

export const solicitacoesRoutes = Router();

solicitacoesRoutes.get("/", exigirAdmin, listarSolicitacoes);

solicitacoesRoutes.get("/cliente/:clienteId", exigirAdmin, listarSolicitacoesPorCliente);

solicitacoesRoutes.get("/:id", exigirAdmin, buscarSolicitacaoPorId);

solicitacoesRoutes.post("/", cadastrarSolicitacao);

solicitacoesRoutes.patch("/:id/status", exigirAdmin, atualizarStatusSolicitacao);

solicitacoesRoutes.post("/publica", cadastrarSolicitacaoPublica);
