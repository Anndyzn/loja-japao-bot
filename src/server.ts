import express from "express";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { registrarLogRequisicao } from "./middlewares/log-requisicao.middleware.js";
import { aplicarRequestId } from "./middlewares/requisicao.middleware.js";
import { aplicarHeadersSeguranca } from "./middlewares/seguranca.middleware.js";
import { authRoutes } from "./routes/auth.routes.js";
import { clientesRoutes } from "./routes/clientes.routes.js";
import { dashboardRoutes } from "./routes/dashboard.routes.js";
import { healthRoutes } from "./routes/health.routes.js";
import { homeRoutes } from "./routes/home.routes.js";
import { infoRoutes } from "./routes/info.routes.js";
import { tratarErros, tratarRotaNaoEncontrada } from "./middlewares/erros.middleware.js";
import { pagamentosRoutes } from "./routes/pagamentos.routes.js";
import { pedidosRoutes } from "./routes/pedidos.routes.js";
import { produtosRoutes } from "./routes/produtos.routes.js";
import { solicitacoesRoutes } from "./routes/solicitacoes.routes.js";

const app = express();

app.disable("x-powered-by");

if (env.TRUST_PROXY) {
    app.set("trust proxy", 1);
}

app.use(aplicarRequestId);
if (env.LOG_REQUESTS) {
    app.use(registrarLogRequisicao);
}
app.use(aplicarHeadersSeguranca);
app.use(express.json({
    limit: "8mb"
}));
app.use("/admin", express.static("public/admin"));
app.use("/loja", express.static("public/loja"));
app.use("/uploads", express.static(env.UPLOADS_DIR));
app.get("/loja/carrinho", (req, res) => {
    res.sendFile("carrinho.html", {
        root: "public/loja"
    });
});
app.get("/loja/acompanhamento", (req, res) => {
    res.sendFile("acompanhamento.html", {
        root: "public/loja"
    });
});

app.get("/loja/solicitacao", (req, res) => {
    res.sendFile("solicitacao.html", { root: "public/loja" });
});

const PORT = env.PORT;

app.use("/", homeRoutes);

app.use("/produtos", produtosRoutes);
app.use("/auth", authRoutes);
app.use("/clientes", clientesRoutes);
app.use("/pedidos", pedidosRoutes);
app.use("/solicitacoes", solicitacoesRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/pagamentos", pagamentosRoutes);
app.use("/health", healthRoutes);
app.use("/info", infoRoutes);

app.use(tratarRotaNaoEncontrada);
app.use(tratarErros);

const servidor = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

let encerrando = false;

async function desconectarBanco() {
    try {
        await prisma.$disconnect();
    } catch (erro) {
        console.error("Erro ao desconectar do banco:", erro);
        process.exitCode = 1;
    }
}

function encerrarComSeguranca(sinal: NodeJS.Signals) {
    if (encerrando) {
        return;
    }

    encerrando = true;
    console.log(`Recebido ${sinal}. Encerrando servidor...`);

    const limite = setTimeout(() => {
        console.error("Encerramento demorou demais. Finalizando processo.");
        process.exit(1);
    }, 10000);

    limite.unref();

    servidor.close((erro) => {
        void (async () => {
            if (erro) {
                console.error("Erro ao encerrar servidor HTTP:", erro);
                process.exitCode = 1;
            }

            await desconectarBanco();
            process.exit(process.exitCode ?? 0);
        })();
    });
}

process.on("SIGINT", encerrarComSeguranca);
process.on("SIGTERM", encerrarComSeguranca);
