import { Router } from "express";
import { buscarResumoDashboard } from "../controllers/dashboard.controller.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/resumo", buscarResumoDashboard);
