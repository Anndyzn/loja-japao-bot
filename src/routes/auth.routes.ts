import { Router } from "express";
import { autenticarAdmin } from "../controllers/auth.controller.js";

export const authRoutes = Router();

authRoutes.post("/login", autenticarAdmin);
