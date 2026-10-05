import { Router } from "express";
import { alterarSenhaAdmin, autenticarAdmin, obterSessaoAdmin } from "../controllers/auth.controller.js";
import { exigirAdmin } from "../middlewares/auth.middleware.js";

export const authRoutes = Router();

authRoutes.post("/login", autenticarAdmin);

authRoutes.get("/me", exigirAdmin, obterSessaoAdmin);

authRoutes.patch("/senha", exigirAdmin, alterarSenhaAdmin);
