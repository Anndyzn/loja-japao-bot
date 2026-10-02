import { Router } from "express";
import { alterarSenhaAdmin, autenticarAdmin } from "../controllers/auth.controller.js";
import { exigirAdmin } from "../middlewares/auth.middleware.js";

export const authRoutes = Router();

authRoutes.post("/login", autenticarAdmin);

authRoutes.patch("/senha", exigirAdmin, alterarSenhaAdmin);
