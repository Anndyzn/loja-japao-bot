import { Router } from "express";
import { atualizarStatusSolicitacao, buscarSolicitacaoPorId, cadastrarSolicitacao, listarSolicitacoes, listarSolicitacoesPorCliente } from "../controllers/solicitacoes.controller.js";

export const solicitacoesRoutes = Router();

solicitacoesRoutes.get("/", listarSolicitacoes);

solicitacoesRoutes.get("/cliente/:clienteId", listarSolicitacoesPorCliente);

solicitacoesRoutes.get("/:id", buscarSolicitacaoPorId);

solicitacoesRoutes.post("/", cadastrarSolicitacao);

solicitacoesRoutes.patch("/:id/status", atualizarStatusSolicitacao);
