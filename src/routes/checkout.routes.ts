import { exigirCliente, protegerAcaoCliente } from "../middlewares/cliente.middleware.js";
﻿import { Router } from "express";
import { finalizarCheckout, recuperarCheckout } from "../controllers/checkout.controller.js";
import { limitarEscritaPublica } from "../middlewares/rate-limit.middleware.js";

export const checkoutRoutes = Router();
checkoutRoutes.get("/:chave", exigirCliente, recuperarCheckout);
checkoutRoutes.post("/", protegerAcaoCliente, exigirCliente, limitarEscritaPublica, finalizarCheckout);
