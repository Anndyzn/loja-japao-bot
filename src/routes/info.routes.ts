import { Router } from "express";
import { mostrarInformacoesApi } from "../controllers/info.controller.js";

export const infoRoutes = Router();

infoRoutes.get("/", mostrarInformacoesApi);
