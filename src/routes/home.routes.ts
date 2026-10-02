import { Router } from "express";
import { mostrarHomeApi } from "../controllers/home.controller.js";

export const homeRoutes = Router();

homeRoutes.get("/", mostrarHomeApi);
