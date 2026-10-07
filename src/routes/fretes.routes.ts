import { Router } from "express";
import { calcularFrete } from "../controllers/fretes.controller.js";
import { limitarEscritaPublica } from "../middlewares/rate-limit.middleware.js";
export const fretesRoutes = Router();
fretesRoutes.post("/cotacao", limitarEscritaPublica, calcularFrete);
