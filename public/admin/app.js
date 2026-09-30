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
const statsGrid = document.querySelector("#stats-grid");
const produtoForm = document.querySelector("#produto-form");
const produtosTbody = document.querySelector("#produtos-tbody");
const clientesTbody = document.querySelector("#clientes-tbody");
const pedidosTbody = document.querySelector("#pedidos-tbody");
const pagamentosTbody = document.querySelector("#pagamentos-tbody");
const solicitacoesTbody = document.querySelector("#solicitacoes-tbody");

const viewTitles = {
    dashboard: "Dashboard",
    produtos: "Produtos",
    clientes: "Clientes",
    pedidos: "Pedidos",
    pagamentos: "Pagamentos",
    solicitacoes: "Solicitacoes"
};

const viewSections = {
    dashboard: document.querySelector("#dashboard-view"),
    produtos: document.querySelector("#produtos-view"),
    clientes: document.querySelector("#clientes-view"),
    pedidos: document.querySelector("#pedidos-view"),
    pagamentos: document.querySelector("#pagamentos-view"),
    solicitacoes: document.querySelector("#solicitacoes-view")
};

const statusPedidos = ["pendente", "pago", "enviado", "cancelado"];
const statusSolicitacoes = ["recebida", "em_analise", "cotada", "aprovada", "recusada", "cancelada"];

let token = localStorage.getItem("adminToken");
let activeView = "dashboard";

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarData(valor) {
    return new Date(valor).toLocaleString("pt-BR");
}

function setFeedback(elemento, mensagem, tipo = "") {
    elemento.textContent = mensagem;
    elemento.className = `feedback ${tipo}`.trim();
}

function obterListaPaginada(resposta) {
    return resposta.dados ?? resposta;
}

function criarCelula(texto, className = "") {
    const td = document.createElement("td");
    td.textContent = texto;

    if (className) {
        td.className = className;
    }

    return td;
}

function criarBotao(texto, className = "small-button") {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = className;
    botao.textContent = texto;

    return botao;
}

function criarSelectStatus(opcoes, valorAtual) {
    const select = document.createElement("select");
    select.className = "status-select";

    for (const opcao of opcoes) {
        const option = document.createElement("option");
        option.value = opcao;
        option.textContent = opcao;
        option.selected = opcao === valorAtual;
        select.append(option);
    }

    return select;
}

function criarLinhaVazia(colunas, mensagem) {
    const tr = document.createElement("tr");
    const td = criarCelula(mensagem, "muted-cell");
    td.colSpan = colunas;
    tr.append(td);

    return tr;
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
    viewTitle.textContent = viewTitles[view];

    for (const botao of navButtons) {
        botao.classList.toggle("active", botao.dataset.view === view);
    }

    for (const [nomeView, section] of Object.entries(viewSections)) {
        section.classList.toggle("hidden", nomeView !== view);
    }
}

async function carregarView() {
    setFeedback(appFeedback, "");

    try {
        if (activeView === "dashboard") {
            await carregarDashboard();
        }

        if (activeView === "produtos") {
            await carregarProdutos();
        }

        if (activeView === "clientes") {
            await carregarClientes();
        }

        if (activeView === "pedidos") {
            await carregarPedidos();
        }

        if (activeView === "pagamentos") {
            await carregarPagamentos();
        }

        if (activeView === "solicitacoes") {
            await carregarSolicitacoes();
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

    const labelEl = document.createElement("p");
    labelEl.className = "stat-label";
    labelEl.textContent = label;

    const valueEl = document.createElement("p");
    valueEl.className = "stat-value";
    valueEl.textContent = valor;

    card.append(labelEl, valueEl);

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
    const actions = document.createElement("div");
    actions.className = "actions";

    const editar = criarBotao("Editar");
    const excluir = criarBotao("Excluir", "small-button danger-button");

    editar.addEventListener("click", () => editarProduto(produto));
    excluir.addEventListener("click", () => excluirProduto(produto));
    actions.append(editar, excluir);

    const tdActions = document.createElement("td");
    tdActions.append(actions);

    tr.append(
        criarCelula(produto.id),
        criarCelula(produto.nome),
        criarCelula(formatarMoeda(produto.preco)),
        criarCelula(produto.estoque),
        tdActions
    );

    return tr;
}

async function carregarProdutos() {
    const resposta = await apiFetch("/produtos?limite=50");
    const produtos = obterListaPaginada(resposta);

    produtosTbody.replaceChildren(
        ...(produtos.length > 0 ? produtos.map(criarLinhaProduto) : [criarLinhaVazia(5, "Nenhum produto encontrado")])
    );
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

function criarLinhaCliente(cliente) {
    const tr = document.createElement("tr");
    const actions = document.createElement("div");
    actions.className = "actions";

    const editar = criarBotao("Editar");
    const excluir = criarBotao("Excluir", "small-button danger-button");

    editar.addEventListener("click", () => editarCliente(cliente));
    excluir.addEventListener("click", () => excluirCliente(cliente));
    actions.append(editar, excluir);

    const tdActions = document.createElement("td");
    tdActions.append(actions);

    tr.append(
        criarCelula(cliente.id),
        criarCelula(cliente.nome),
        criarCelula(cliente.telefone),
        criarCelula(cliente.endereco),
        tdActions
    );

    return tr;
}

async function carregarClientes() {
    const resposta = await apiFetch("/clientes?limite=50");
    const clientes = obterListaPaginada(resposta);

    clientesTbody.replaceChildren(
        ...(clientes.length > 0 ? clientes.map(criarLinhaCliente) : [criarLinhaVazia(5, "Nenhum cliente encontrado")])
    );
}

async function editarCliente(cliente) {
    const telefone = window.prompt("Novo telefone", cliente.telefone);

    if (telefone === null) {
        return;
    }

    const endereco = window.prompt("Novo endereco", cliente.endereco);

    if (endereco === null) {
        return;
    }

    await apiFetch(`/clientes/${cliente.id}`, {
        method: "PATCH",
        body: JSON.stringify({
            telefone,
            endereco
        })
    });

    setFeedback(appFeedback, "Cliente atualizado", "success");
    await carregarClientes();
}

async function excluirCliente(cliente) {
    const confirmou = window.confirm(`Excluir ${cliente.nome}?`);

    if (!confirmou) {
        return;
    }

    await apiFetch(`/clientes/${cliente.id}`, {
        method: "DELETE"
    });

    setFeedback(appFeedback, "Cliente removido", "success");
    await carregarClientes();
}

function criarLinhaPedido(pedido) {
    const tr = document.createElement("tr");
    const actions = document.createElement("div");
    actions.className = "actions";

    const statusSelect = criarSelectStatus(statusPedidos, pedido.status);
    const salvar = criarBotao("Salvar");

    salvar.addEventListener("click", () => atualizarStatusPedido(pedido.id, statusSelect.value));
    actions.append(statusSelect, salvar);

    const tdActions = document.createElement("td");
    tdActions.append(actions);

    tr.append(
        criarCelula(pedido.id),
        criarCelula(pedido.clienteId),
        criarCelula(formatarMoeda(pedido.total)),
        criarCelula(pedido.status),
        criarCelula(formatarData(pedido.criadoEm)),
        tdActions
    );

    return tr;
}

async function carregarPedidos() {
    const resposta = await apiFetch("/pedidos?limite=50");
    const pedidos = obterListaPaginada(resposta);

    pedidosTbody.replaceChildren(
        ...(pedidos.length > 0 ? pedidos.map(criarLinhaPedido) : [criarLinhaVazia(6, "Nenhum pedido encontrado")])
    );
}

async function atualizarStatusPedido(pedidoId, status) {
    await apiFetch(`/pedidos/${pedidoId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
            status
        })
    });

    setFeedback(appFeedback, "Status do pedido atualizado", "success");
    await carregarPedidos();
}

function criarLinhaPagamento(pagamento) {
    const tr = document.createElement("tr");

    tr.append(
        criarCelula(pagamento.id),
        criarCelula(pagamento.pedidoId),
        criarCelula(formatarMoeda(pagamento.valor)),
        criarCelula(pagamento.metodo),
        criarCelula(pagamento.status),
        criarCelula(formatarData(pagamento.criadoEm))
    );

    return tr;
}

async function carregarPagamentos() {
    const pagamentos = await apiFetch("/pagamentos");

    pagamentosTbody.replaceChildren(
        ...(pagamentos.length > 0 ? pagamentos.map(criarLinhaPagamento) : [criarLinhaVazia(6, "Nenhum pagamento encontrado")])
    );
}

function criarLinhaSolicitacao(solicitacao) {
    const tr = document.createElement("tr");
    const actions = document.createElement("div");
    actions.className = "actions";

    const statusSelect = criarSelectStatus(statusSolicitacoes, solicitacao.status);
    const salvar = criarBotao("Salvar");

    salvar.addEventListener("click", () => atualizarStatusSolicitacao(solicitacao.id, statusSelect.value));
    actions.append(statusSelect, salvar);

    const tdActions = document.createElement("td");
    tdActions.append(actions);

    tr.append(
        criarCelula(solicitacao.id),
        criarCelula(solicitacao.clienteId),
        criarCelula(solicitacao.nomeProduto),
        criarCelula(solicitacao.status),
        criarCelula(formatarData(solicitacao.criadoEm)),
        tdActions
    );

    return tr;
}

async function carregarSolicitacoes() {
    const resposta = await apiFetch("/solicitacoes?limite=50");
    const solicitacoes = obterListaPaginada(resposta);

    solicitacoesTbody.replaceChildren(
        ...(solicitacoes.length > 0 ? solicitacoes.map(criarLinhaSolicitacao) : [criarLinhaVazia(6, "Nenhuma solicitacao encontrada")])
    );
}

async function atualizarStatusSolicitacao(solicitacaoId, status) {
    await apiFetch(`/solicitacoes/${solicitacaoId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
            status
        })
    });

    setFeedback(appFeedback, "Status da solicitacao atualizado", "success");
    await carregarSolicitacoes();
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
