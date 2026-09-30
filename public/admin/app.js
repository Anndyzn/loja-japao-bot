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
const produtoImagemBotao = document.querySelector("#produto-imagem-botao");
const produtoImagemArquivo = document.querySelector("#produto-imagem-arquivo");
const produtosTbody = document.querySelector("#produtos-tbody");
const clientesTbody = document.querySelector("#clientes-tbody");
const pedidosTbody = document.querySelector("#pedidos-tbody");
const pagamentosTbody = document.querySelector("#pagamentos-tbody");
const solicitacoesTbody = document.querySelector("#solicitacoes-tbody");
const produtoModal = document.querySelector("#produto-modal");
const produtoEditForm = document.querySelector("#produto-edit-form");
const produtoEditId = document.querySelector("#produto-edit-id");
const produtoEditNome = document.querySelector("#produto-edit-nome");
const produtoEditPreco = document.querySelector("#produto-edit-preco");
const produtoEditEstoque = document.querySelector("#produto-edit-estoque");
const produtoEditCancelar = document.querySelector("#produto-edit-cancelar");
const clienteModal = document.querySelector("#cliente-modal");
const clienteEditForm = document.querySelector("#cliente-edit-form");
const clienteEditId = document.querySelector("#cliente-edit-id");
const clienteEditNome = document.querySelector("#cliente-edit-nome");
const clienteEditTelefone = document.querySelector("#cliente-edit-telefone");
const clienteEditEmail = document.querySelector("#cliente-edit-email");
const clienteEditCep = document.querySelector("#cliente-edit-cep");
const clienteEditNumero = document.querySelector("#cliente-edit-numero");
const clienteEditEndereco = document.querySelector("#cliente-edit-endereco");
const clienteEditComplemento = document.querySelector("#cliente-edit-complemento");
const clienteEditBairro = document.querySelector("#cliente-edit-bairro");
const clienteEditCidade = document.querySelector("#cliente-edit-cidade");
const clienteEditEstado = document.querySelector("#cliente-edit-estado");
const clienteEditReferencia = document.querySelector("#cliente-edit-referencia");
const clienteEditCancelar = document.querySelector("#cliente-edit-cancelar");

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

function formatarEnderecoCliente(cliente) {
    const partes = [
        cliente.endereco,
        cliente.numero ? `numero ${cliente.numero}` : undefined,
        cliente.complemento,
        cliente.bairro,
        cliente.cidade,
        cliente.estado,
        cliente.cep ? `CEP ${cliente.cep}` : undefined
    ].filter(Boolean);

    return partes.join(", ");
}

function arquivoParaBase64(arquivo) {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader();

        leitor.addEventListener("load", () => resolve(String(leitor.result)));
        leitor.addEventListener("error", () => reject(new Error("Nao foi possivel ler a imagem")));
        leitor.readAsDataURL(arquivo);
    });
}

function obterValorOpcionalDoInput(input) {
    const texto = input.value.trim();

    return texto === "" ? undefined : texto;
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

function criarCelulaFotoProduto(produto) {
    const td = document.createElement("td");

    if (!produto.imagemUrl) {
        const placeholder = document.createElement("span");
        placeholder.className = "product-thumb placeholder-thumb";
        placeholder.textContent = "Sem foto";
        td.append(placeholder);
        return td;
    }

    const imagem = document.createElement("img");
    imagem.className = "product-thumb";
    imagem.src = produto.imagemUrl;
    imagem.alt = produto.nome;

    td.append(imagem);
    return td;
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
    const foto = criarBotao("Foto");
    const excluir = criarBotao("Excluir", "small-button danger-button");

    editar.addEventListener("click", () => editarProduto(produto));
    foto.addEventListener("click", () => selecionarFotoProduto(produto));
    excluir.addEventListener("click", () => excluirProduto(produto));
    actions.append(editar, foto, excluir);

    const tdActions = document.createElement("td");
    tdActions.append(actions);

    tr.append(
        criarCelula(produto.id),
        criarCelulaFotoProduto(produto),
        criarCelula(produto.nome),
        criarCelula(formatarMoeda(produto.preco)),
        criarCelula(produto.estoque),
        tdActions
    );

    return tr;
}

async function enviarFotoProduto(produtoId, arquivo) {
    if (!arquivo || arquivo.size === 0) {
        return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) {
        throw new Error("Imagem deve ser JPG, PNG ou WEBP");
    }

    if (arquivo.size > 3 * 1024 * 1024) {
        throw new Error("Imagem deve ter no maximo 3MB");
    }

    const imagem = await arquivoParaBase64(arquivo);

    await apiFetch(`/produtos/${produtoId}/imagem`, {
        method: "POST",
        body: JSON.stringify({
            imagem
        })
    });
}

function selecionarFotoProduto(produto) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";

    input.addEventListener("change", async () => {
        const arquivo = input.files?.[0];

        if (!arquivo) {
            return;
        }

        try {
            await enviarFotoProduto(produto.id, arquivo);
            setFeedback(appFeedback, "Foto do produto atualizada", "success");
            await carregarProdutos();
        } catch (erro) {
            setFeedback(appFeedback, erro.message, "error");
        }
    });

    input.click();
}

function abrirModalProduto(produto) {
    produtoEditId.value = String(produto.id);
    produtoEditNome.value = produto.nome;
    produtoEditPreco.value = String(produto.preco);
    produtoEditEstoque.value = String(produto.estoque);
    produtoModal.classList.remove("hidden");
    produtoEditNome.focus();
}

function fecharModalProduto() {
    produtoEditForm.reset();
    produtoModal.classList.add("hidden");
}

async function carregarProdutos() {
    const resposta = await apiFetch("/produtos?limite=50");
    const produtos = obterListaPaginada(resposta);

    produtosTbody.replaceChildren(
        ...(produtos.length > 0 ? produtos.map(criarLinhaProduto) : [criarLinhaVazia(6, "Nenhum produto encontrado")])
    );
}

async function editarProduto(produto) {
    abrirModalProduto(produto);
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
        criarCelula(formatarEnderecoCliente(cliente)),
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

function abrirModalCliente(cliente) {
    clienteEditId.value = String(cliente.id);
    clienteEditNome.value = cliente.nome ?? "";
    clienteEditTelefone.value = cliente.telefone ?? "";
    clienteEditEmail.value = cliente.email ?? "";
    clienteEditCep.value = cliente.cep ?? "";
    clienteEditNumero.value = cliente.numero ?? "";
    clienteEditEndereco.value = cliente.endereco ?? "";
    clienteEditComplemento.value = cliente.complemento ?? "";
    clienteEditBairro.value = cliente.bairro ?? "";
    clienteEditCidade.value = cliente.cidade ?? "";
    clienteEditEstado.value = cliente.estado ?? "";
    clienteEditReferencia.value = cliente.referencia ?? "";
    clienteModal.classList.remove("hidden");
    clienteEditNome.focus();
}

function fecharModalCliente() {
    clienteEditForm.reset();
    clienteModal.classList.add("hidden");
}

async function editarCliente(cliente) {
    abrirModalCliente(cliente);
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
        criarCelula(pedido.observacao ?? "-"),
        criarCelula(formatarData(pedido.criadoEm)),
        tdActions
    );

    return tr;
}

async function carregarPedidos() {
    const resposta = await apiFetch("/pedidos?limite=50");
    const pedidos = obterListaPaginada(resposta);

    pedidosTbody.replaceChildren(
        ...(pedidos.length > 0 ? pedidos.map(criarLinhaPedido) : [criarLinhaVazia(7, "Nenhum pedido encontrado")])
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
        const produto = await apiFetch("/produtos", {
            method: "POST",
            body: JSON.stringify({
                nome: String(formData.get("nome")),
                preco: Number(formData.get("preco")),
                estoque: Number(formData.get("estoque"))
            })
        });

        const arquivo = formData.get("imagemArquivo");

        if (arquivo instanceof File && arquivo.size > 0) {
            await enviarFotoProduto(produto.id, arquivo);
        }

        produtoForm.reset();
        produtoImagemBotao.textContent = "Escolher arquivo";
        setFeedback(appFeedback, "Produto cadastrado", "success");
        await carregarProdutos();
    } catch (erro) {
        setFeedback(appFeedback, erro.message, "error");
    }
});

produtoImagemBotao.addEventListener("click", () => {
    produtoImagemArquivo.click();
});

produtoImagemArquivo.addEventListener("change", () => {
    produtoImagemBotao.textContent = produtoImagemArquivo.files?.length ? "Foto selecionada" : "Escolher arquivo";
});

produtoEditCancelar.addEventListener("click", fecharModalProduto);

produtoModal.addEventListener("click", (evento) => {
    if (evento.target === produtoModal) {
        fecharModalProduto();
    }
});

produtoEditForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const id = Number(produtoEditId.value);
    const nome = produtoEditNome.value.trim();
    const preco = Number(produtoEditPreco.value);
    const estoque = Number(produtoEditEstoque.value);

    if (!nome) {
        setFeedback(appFeedback, "Nome deve ser preenchido", "error");
        return;
    }

    if (!Number.isFinite(preco) || preco <= 0 || !Number.isInteger(estoque) || estoque < 0) {
        setFeedback(appFeedback, "Preco ou estoque invalido", "error");
        return;
    }

    try {
        await apiFetch(`/produtos/${id}`, {
            method: "PATCH",
            body: JSON.stringify({
                nome,
                preco,
                estoque
            })
        });

        fecharModalProduto();
        setFeedback(appFeedback, "Produto atualizado", "success");
        await carregarProdutos();
    } catch (erro) {
        setFeedback(appFeedback, erro.message, "error");
    }
});

clienteEditCancelar.addEventListener("click", fecharModalCliente);

clienteModal.addEventListener("click", (evento) => {
    if (evento.target === clienteModal) {
        fecharModalCliente();
    }
});

clienteEditForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const id = Number(clienteEditId.value);
    const nome = clienteEditNome.value.trim();
    const telefone = clienteEditTelefone.value.trim();
    const cep = clienteEditCep.value.trim();
    const numero = clienteEditNumero.value.trim();
    const endereco = clienteEditEndereco.value.trim();
    const bairro = clienteEditBairro.value.trim();
    const cidade = clienteEditCidade.value.trim();
    const estado = clienteEditEstado.value.trim().toUpperCase();

    if (!nome || !telefone || !cep || !numero || !endereco || !bairro || !cidade || !estado) {
        setFeedback(appFeedback, "Preencha os campos obrigatorios do cliente", "error");
        return;
    }

    try {
        await apiFetch(`/clientes/${id}`, {
            method: "PATCH",
            body: JSON.stringify({
                nome,
                telefone,
                email: obterValorOpcionalDoInput(clienteEditEmail),
                cep,
                numero,
                endereco,
                complemento: obterValorOpcionalDoInput(clienteEditComplemento),
                bairro,
                cidade,
                estado,
                referencia: obterValorOpcionalDoInput(clienteEditReferencia)
            })
        });

        fecharModalCliente();
        setFeedback(appFeedback, "Cliente atualizado", "success");
        await carregarClientes();
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
