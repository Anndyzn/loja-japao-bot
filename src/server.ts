import express from "express";
import { produtosRoutes } from "./routes/produtos.routes.js";

const app = express();

app.use(express.json());

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("API da loja Japão funcionando! jp")
});

app.use("/produtos", produtosRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
