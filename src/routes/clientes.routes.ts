import { Router } from "express";
import { atualizarCliente, buscarClientePorId, cadastrarCliente, listarClientes, removerCliente } from "../controllers/clientes.controller.js";
import { exigirAdmin } from "../middlewares/auth.middleware.js";

export const clientesRoutes = Router();

clientesRoutes.get("/", exigirAdmin, listarClientes);

clientesRoutes.get("/:id", exigirAdmin, buscarClientePorId);

clientesRoutes.post("/", cadastrarCliente);

clientesRoutes.patch("/:id", exigirAdmin, atualizarCliente);

clientesRoutes.delete("/:id", exigirAdmin, removerCliente);
