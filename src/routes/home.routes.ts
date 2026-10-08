import { Router } from "express";
import { mostrarConfiguracaoPublica, mostrarHomeApi } from "../controllers/home.controller.js";

export const homeRoutes = Router();

homeRoutes.get("/", mostrarHomeApi);
homeRoutes.get("/configuracao-publica", mostrarConfiguracaoPublica);
