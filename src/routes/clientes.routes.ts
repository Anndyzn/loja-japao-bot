import { Router } from "express";
import { atualizarCliente, buscarClientePorId, cadastrarCliente, listarClientes, removerCliente } from "../controllers/clientes.controller.js";

export const clientesRoutes = Router();

clientesRoutes.get("/", listarClientes);

clientesRoutes.get("/:id", buscarClientePorId);

clientesRoutes.post("/", cadastrarCliente);

clientesRoutes.patch("/:id", atualizarCliente);

clientesRoutes.delete("/:id", removerCliente);
