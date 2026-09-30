const loginView = document.querySelector("#login-view");
const appView = document.querySelector("#app-view");
const loginForm = document.querySelector("#login-form");
const loginEmail = document.querySelector("#login-email");
const loginSenha = document.querySelector("#login-senha");
const loginFeedback = document.querySelector("#login-feedback");
const appFeedback = document.querySelector("#app-feedback");
const logoutButton = document.querySelector("#logout-button");
const refreshButton = document.querySelector("#refresh-button");
const viewTitle = document.querySelector("#view-title");
const navButtons = document.querySelectorAll(".nav-button");
const dashboardView = document.querySelector("#dashboard-view");
const produtosView = document.querySelector("#produtos-view");
const statsGrid = document.querySelector("#stats-grid");
const produtoForm = document.querySelector("#produto-form");
const produtosTbody = document.querySelector("#produtos-tbody");

let token = localStorage.getItem("adminToken");
let activeView = "dashboard";

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function setFeedback(elemento, mensagem, tipo = "") {
    elemento.textContent = mensagem;
    elemento.className = `feedback ${tipo}`.trim();
}

async function apiFetch(caminho, opcoes = {}) {
    const headers = {
        ...(opcoes.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...opcoes.headers
    };

    const resposta = await fetch(caminho, {
        ...opcoes,
        headers
    });

    const conteudo = await resposta.json().catch(() => undefined);

    if (!resposta.ok) {
        const mensagem = conteudo?.mensagem ?? "Erro ao processar requisicao";
        throw new Error(mensagem);
    }

    return conteudo;
}

function mostrarLogin() {
    token = null;
    localStorage.removeItem("adminToken");
    loginView.classList.remove("hidden");
    appView.classList.add("hidden");
}

async function mostrarApp() {
    loginView.classList.add("hidden");
    appView.classList.remove("hidden");
    await carregarView();
}

function trocarView(view) {
    activeView = view;
    viewTitle.textContent = view === "dashboard" ? "Dashboard" : "Produtos";

    for (const botao of navButtons) {
        botao.classList.toggle("active", botao.dataset.view === view);
    }

    dashboardView.classList.toggle("hidden", view !== "dashboard");
    produtosView.classList.toggle("hidden", view !== "produtos");
}

async function carregarView() {
    setFeedback(appFeedback, "");

    try {
        if (activeView === "dashboard") {
            await carregarDashboard();
        } else {
            await carregarProdutos();
        }
    } catch (erro) {
        if (erro.message.includes("Token")) {
            mostrarLogin();
            setFeedback(loginFeedback, erro.message, "error");
            return;
        }

        setFeedback(appFeedback, erro.message, "error");
    }
}

function criarStat(label, valor) {
    const card = document.createElement("article");
    card.className = "stat-card";
    card.innerHTML = `
        <p class="stat-label">${label}</p>
        <p class="stat-value">${valor}</p>
    `;

    return card;
}

async function carregarDashboard() {
    const resumo = await apiFetch("/dashboard/resumo");

    statsGrid.replaceChildren(
        criarStat("Produtos", resumo.produtos.total),
        criarStat("Estoque baixo", resumo.produtos.estoqueBaixo),
        criarStat("Clientes", resumo.clientes.total),
        criarStat("Pedidos", resumo.pedidos.total),
        criarStat("Pendentes", resumo.pedidos.pendentes),
        criarStat("Pagos", resumo.pedidos.pagos),
        criarStat("Pagamentos", resumo.pagamentos.total),
        criarStat("Faturamento", formatarMoeda(resumo.pedidos.faturamentoConfirmado))
    );
}

function criarLinhaProduto(produto) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${produto.id}</td>
        <td>${produto.nome}</td>
        <td>${formatarMoeda(produto.preco)}</td>
        <td>${produto.estoque}</td>
        <td>
            <div class="actions">
                <button class="small-button" type="button" data-action="editar">Editar</button>
                <button class="small-button danger-button" type="button" data-action="excluir">Excluir</button>
            </div>
        </td>
    `;

    tr.querySelector("[data-action='editar']").addEventListener("click", () => editarProduto(produto));
    tr.querySelector("[data-action='excluir']").addEventListener("click", () => excluirProduto(produto));

    return tr;
}

async function carregarProdutos() {
    const resposta = await apiFetch("/produtos?limite=50");
    const produtos = resposta.dados ?? resposta;

    produtosTbody.replaceChildren(...produtos.map(criarLinhaProduto));
}

async function editarProduto(produto) {
    const precoTexto = window.prompt("Novo preco", String(produto.preco));

    if (precoTexto === null) {
        return;
    }

    const estoqueTexto = window.prompt("Novo estoque", String(produto.estoque));

    if (estoqueTexto === null) {
        return;
    }

    const preco = Number(precoTexto);
    const estoque = Number(estoqueTexto);

    if (!Number.isFinite(preco) || preco <= 0 || !Number.isInteger(estoque) || estoque < 0) {
        setFeedback(appFeedback, "Preco ou estoque invalido", "error");
        return;
    }

    await apiFetch(`/produtos/${produto.id}`, {
        method: "PATCH",
        body: JSON.stringify({
            preco,
            estoque
        })
    });

    setFeedback(appFeedback, "Produto atualizado", "success");
    await carregarProdutos();
}

async function excluirProduto(produto) {
    const confirmou = window.confirm(`Excluir ${produto.nome}?`);

    if (!confirmou) {
        return;
    }

    await apiFetch(`/produtos/${produto.id}`, {
        method: "DELETE"
    });

    setFeedback(appFeedback, "Produto removido", "success");
    await carregarProdutos();
}

loginForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    setFeedback(loginFeedback, "");

    try {
        const resultado = await apiFetch("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email: loginEmail.value,
                senha: loginSenha.value
            })
        });

        token = resultado.token;
        localStorage.setItem("adminToken", token);
        await mostrarApp();
    } catch (erro) {
        setFeedback(loginFeedback, erro.message, "error");
    }
});

produtoForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const formData = new FormData(produtoForm);

    try {
        await apiFetch("/produtos", {
            method: "POST",
            body: JSON.stringify({
                nome: String(formData.get("nome")),
                preco: Number(formData.get("preco")),
                estoque: Number(formData.get("estoque"))
            })
        });

        produtoForm.reset();
        setFeedback(appFeedback, "Produto cadastrado", "success");
        await carregarProdutos();
    } catch (erro) {
        setFeedback(appFeedback, erro.message, "error");
    }
});

for (const botao of navButtons) {
    botao.addEventListener("click", async () => {
        trocarView(botao.dataset.view);
        await carregarView();
    });
}

refreshButton.addEventListener("click", carregarView);
logoutButton.addEventListener("click", mostrarLogin);

if (token) {
    mostrarApp();
} else {
    mostrarLogin();
}
