import express from "express";
import { clientesRoutes } from "./routes/clientes.routes.js";
import { dashboardRoutes } from "./routes/dashboard.routes.js";
import { pedidosRoutes } from "./routes/pedidos.routes.js";
import { produtosRoutes } from "./routes/produtos.routes.js";
import { solicitacoesRoutes } from "./routes/solicitacoes.routes.js";

const app = express();

app.use(express.json());

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("API da loja Japão funcionando! jp")
});

app.use("/produtos", produtosRoutes);
app.use("/clientes", clientesRoutes);
app.use("/pedidos", pedidosRoutes);
app.use("/solicitacoes", solicitacoesRoutes);
app.use("/dashboard", dashboardRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
