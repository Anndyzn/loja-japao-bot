import { Router } from "express";
import { buscarResumoDashboard } from "../controllers/dashboard.controller.js";
import { exigirAdmin } from "../middlewares/auth.middleware.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/resumo", exigirAdmin, buscarResumoDashboard);
