import express from "express";
import { clientesRoutes } from "./routes/clientes.routes.js";
import { pedidosRoutes } from "./routes/pedidos.routes.js";
import { produtosRoutes } from "./routes/produtos.routes.js";

const app = express();

app.use(express.json());

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("API da loja Japão funcionando! jp")
});

app.use("/produtos", produtosRoutes);
app.use("/clientes", clientesRoutes);
app.use("/pedidos", pedidosRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
