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
const dashboardAlerts = document.querySelector("#dashboard-alerts");
const produtoForm = document.querySelector("#produto-form");
const produtoNome = document.querySelector("#produto-nome");
const produtoPreco = document.querySelector("#produto-preco");
const produtoEstoque = document.querySelector("#produto-estoque");
const produtoPublicadoNaLoja = document.querySelector("#produto-publicado-na-loja");
const produtoFiltrosForm = document.querySelector("#produto-filtros-form");
const produtoNomeFiltro = document.querySelector("#produto-nome-filtro");
const produtoEstoqueBaixoFiltro = document.querySelector("#produto-estoque-baixo-filtro");
const produtoFiltrosLimpar = document.querySelector("#produto-filtros-limpar");
const produtoImagemBotao = document.querySelector("#produto-imagem-botao");
const produtoImagemArquivo = document.querySelector("#produto-imagem-arquivo");
const produtosTbody = document.querySelector("#produtos-tbody");
const clientesTbody = document.querySelector("#clientes-tbody");
const clienteFiltrosForm = document.querySelector("#cliente-filtros-form");
const clienteNomeFiltro = document.querySelector("#cliente-nome-filtro");
const clienteTelefoneFiltro = document.querySelector("#cliente-telefone-filtro");
const clienteFiltrosLimpar = document.querySelector("#cliente-filtros-limpar");
const pedidosTbody = document.querySelector("#pedidos-tbody");
const pedidoForm = document.querySelector("#pedido-form");
const pedidoCliente = document.querySelector("#pedido-cliente");
const pedidoProduto = document.querySelector("#pedido-produto");
const pedidoQuantidade = document.querySelector("#pedido-quantidade");
const pedidoObservacao = document.querySelector("#pedido-observacao");
const pedidoFiltrosForm = document.querySelector("#pedido-filtros-form");
const pedidoBuscaFiltro = document.querySelector("#pedido-busca-filtro");
const pedidoStatusFiltro = document.querySelector("#pedido-status-filtro");
const pedidoFiltrosLimpar = document.querySelector("#pedido-filtros-limpar");
const pagamentosTbody = document.querySelector("#pagamentos-tbody");
const solicitacoesTbody = document.querySelector("#solicitacoes-tbody");
const solicitacaoStatusFiltro = document.querySelector("#solicitacao-status-filtro");
const produtoModal = document.querySelector("#produto-modal");
const produtoEditForm = document.querySelector("#produto-edit-form");
const produtoEditId = document.querySelector("#produto-edit-id");
const produtoEditNome = document.querySelector("#produto-edit-nome");
const produtoEditPreco = document.querySelector("#produto-edit-preco");
const produtoEditEstoque = document.querySelector("#produto-edit-estoque");
const produtoEditPublicadoNaLoja = document.querySelector("#produto-edit-publicado-na-loja");
const produtoEditCancelar = document.querySelector("#produto-edit-cancelar");
const clienteModal = document.querySelector("#cliente-modal");
const clienteModalTitulo = document.querySelector("#cliente-modal-titulo");
const clienteEditForm = document.querySelector("#cliente-edit-form");
const clienteEditId = document.querySelector("#cliente-edit-id");
const clienteEditNome = document.querySelector("#cliente-edit-nome");
const clienteEditTelefone = document.querySelector("#cliente-edit-telefone");
const clienteEditEmail = document.querySelector("#cliente-edit-email");
const clienteEditCep = document.querySelector("#cliente-edit-cep");
const clienteEditCepBuscar = document.querySelector("#cliente-edit-cep-buscar");
const clienteEditCepFeedback = document.querySelector("#cliente-edit-cep-feedback");
const clienteEditNumero = document.querySelector("#cliente-edit-numero");
const clienteEditEndereco = document.querySelector("#cliente-edit-endereco");
const clienteEditComplemento = document.querySelector("#cliente-edit-complemento");
const clienteEditBairro = document.querySelector("#cliente-edit-bairro");
const clienteEditCidade = document.querySelector("#cliente-edit-cidade");
const clienteEditEstado = document.querySelector("#cliente-edit-estado");
const clienteEditReferencia = document.querySelector("#cliente-edit-referencia");
const clienteEditCancelar = document.querySelector("#cliente-edit-cancelar");

const pedidoModal = document.querySelector('#pedido-modal');
const pedidoTitulo = document.querySelector('#pedido-titulo');
const pedidoFeedback = document.querySelector('#pedido-feedback');
const pedidoConteudo = document.querySelector('#pedido-conteudo');
const pedidoFechar = document.querySelector('#pedido-fechar');
let consultaPedidoAtual = 0;

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

const statusSolicitacoes = ["recebida", "em_analise", "cotada", "aprovada", "recusada", "cancelada"];

let token = localStorage.getItem("adminToken");
let activeView = "dashboard";
let clienteCepAtual = "";
let clienteBuscaCep = null;
let produtoFiltroTimer = null;
let clienteFiltroTimer = null;
let pedidoFiltroTimer = null;
let clienteOrigemSolicitacaoId = null;
let produtoOrigemSolicitacao = null;
let pedidoOrigemSolicitacaoId = null;
let pedidoFormDadosCarregados = false;
let pedidoProdutosDisponiveis = [];

function invalidarDadosFormularioPedido() {
    pedidoFormDadosCarregados = false;
    pedidoProdutosDisponiveis = [];
}

function limparOrigemProdutoSolicitacao() {
    produtoOrigemSolicitacao = null;
}

function limparOrigemPedidoSolicitacao() {
    pedidoOrigemSolicitacaoId = null;
}

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

function formatarEnderecoEntrega(endereco) {
    if (!endereco) return "";

    const partes = [
        endereco.endereco,
        endereco.numero ? `numero ${endereco.numero}` : undefined,
        endereco.complemento,
        endereco.bairro,
        endereco.cidade,
        endereco.estado,
        endereco.cep ? `CEP ${endereco.cep}` : undefined
    ].filter(Boolean);

    return partes.join(", ");
}

function criarLinkWhatsApp(telefone, texto = "") {
    const digitos = String(telefone ?? "").replace(/\D/g, "");

    if (digitos.length < 10) {
        return undefined;
    }

    const numero = digitos.startsWith("55") ? digitos : "55" + digitos;
    const link = document.createElement("a");
    link.className = "small-button whatsapp-button";
    link.href = "https://wa.me/" + numero + (texto ? "?text=" + encodeURIComponent(texto) : "");
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "WhatsApp";

    return link;
}

function obterTelefoneContatoPedido(pedido) {
    return pedido.enderecoEntrega?.telefone ?? pedido.cliente?.telefone ?? "";
}

function obterNomeContatoPedido(pedido) {
    return pedido.enderecoEntrega?.nome ?? pedido.cliente?.nome ?? "";
}

function obterDescricaoStatusPedido(status) {
    const descricoes = {
        pendente: "recebido e aguardando pagamento",
        pago: "com pagamento aprovado e em preparacao",
        enviado: "enviado",
        cancelado: "cancelado"
    };

    return descricoes[status] ?? status;
}

function montarMensagemWhatsAppPedido(pedido) {
    const nome = obterNomeContatoPedido(pedido);
    const saudacao = nome ? "Ola, " + nome + "." : "Ola.";
    const linkAcompanhamento = new URL("/loja/acompanhamento?pedido=" + pedido.id, window.location.origin).href;
    const partes = [
        saudacao + " Seu pedido #" + pedido.id + " na Loja Japao esta " +
            obterDescricaoStatusPedido(pedido.status) + ".",
        "Acompanhe por aqui: " + linkAcompanhamento,
        "Por seguranca, informe o telefone usado no pedido ao abrir a pagina."
    ];

    if (pedido.status === "enviado" && pedido.transportadora && pedido.codigoRastreio) {
        partes.push("Rastreio: " + pedido.transportadora + " - " + pedido.codigoRastreio + ".");
    }

    return partes.join(" ");
}

function normalizarTexto(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function criarLinkRastreio(transportadora, codigoRastreio) {
    if (!transportadora || !codigoRastreio) {
        return undefined;
    }

    if (!normalizarTexto(transportadora).includes("correios")) {
        return undefined;
    }

    const link = document.createElement("a");
    link.className = "small-button whatsapp-button";
    link.href = "https://rastreamento.correios.com.br/app/index.php?objeto=" + encodeURIComponent(codigoRastreio);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Abrir rastreamento";

    return link;
}

function montarMensagemWhatsAppSolicitacao(solicitacao) {
    const nome = solicitacao.contato?.nome ?? "";
    const saudacao = nome ? "Ola, " + nome + "." : "Ola.";

    if (solicitacao.valorCotado) {
        return saudacao + " Sua cotacao para " + solicitacao.nomeProduto +
            " ficou em " + formatarMoeda(solicitacao.valorCotado) +
            ". Se estiver tudo certo, me confirme por aqui para eu gerar o pedido.";
    }

    return saudacao + " Recebemos sua solicitacao sobre " + solicitacao.nomeProduto +
        ". Vou analisar e te retorno com a cotacao.";
}

function mostrarFeedbackCepCliente(mensagem, tipo = "") {
    clienteEditCepFeedback.textContent = mensagem;
    clienteEditCepFeedback.className = ("feedback field-wide " + tipo).trim();
}

function cancelarBuscaCepCliente() {
    clienteBuscaCep?.abort();
    clienteBuscaCep = null;
}

async function buscarEnderecoClientePorCep(opcoes = {}) {
    const forcar = opcoes.forcar === true;
    const cep = clienteEditCep.value.replace(/\D/g, "");
    clienteEditCep.value = cep.length > 5 ? cep.slice(0, 5) + "-" + cep.slice(5) : cep;

    if (cep === clienteCepAtual && !forcar) {
        return;
    }

    clienteCepAtual = cep;
    cancelarBuscaCepCliente();

    if (cep.length !== 8) {
        mostrarFeedbackCepCliente("Digite os 8 digitos do CEP.");
        return;
    }

    const consulta = new AbortController();
    clienteBuscaCep = consulta;
    mostrarFeedbackCepCliente("Buscando endereco...");
    const tempoLimite = setTimeout(() => consulta.abort(), 8000);

    try {
        const resposta = await fetch("https://viacep.com.br/ws/" + cep + "/json/", {
            signal: consulta.signal
        });

        if (!resposta.ok) {
            throw new Error("Falha na consulta");
        }

        const endereco = await resposta.json();

        if (clienteBuscaCep !== consulta) {
            return;
        }

        if (!endereco || typeof endereco !== "object") {
            throw new Error("Resposta invalida");
        }

        if (endereco.erro) {
            mostrarFeedbackCepCliente("CEP nao encontrado. Confira ou preencha manualmente.", "error");
            return;
        }

        clienteEditEndereco.value = typeof endereco.logradouro === "string" ? endereco.logradouro : "";
        clienteEditBairro.value = typeof endereco.bairro === "string" ? endereco.bairro : "";
        clienteEditCidade.value = typeof endereco.localidade === "string" ? endereco.localidade : "";
        clienteEditEstado.value = typeof endereco.uf === "string" ? endereco.uf : "";
        mostrarFeedbackCepCliente("Endereco preenchido. Confira e ajuste se precisar.", "success");
    } catch {
        if (clienteBuscaCep !== consulta) {
            return;
        }

        mostrarFeedbackCepCliente("Nao foi possivel buscar o CEP. Preencha manualmente.", "error");
    } finally {
        clearTimeout(tempoLimite);

        if (clienteBuscaCep === consulta) {
            clienteBuscaCep = null;
        }
    }
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

function preencherSelect(select, itens, criarTexto, textoVazio = "Nenhum item encontrado", textoPlaceholder = "Selecione") {
    select.replaceChildren();

    const primeiraOpcao = document.createElement("option");
    primeiraOpcao.value = "";
    primeiraOpcao.textContent = itens.length > 0 ? textoPlaceholder : textoVazio;
    primeiraOpcao.disabled = true;
    primeiraOpcao.selected = true;
    select.append(primeiraOpcao);

    for (const item of itens) {
        const option = document.createElement("option");
        option.value = String(item.id);
        option.textContent = criarTexto(item);
        select.append(option);
    }
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
    const usarToken = token && caminho !== "/auth/login";
    const headers = {
        ...(opcoes.body ? { "Content-Type": "application/json" } : {}),
        ...(usarToken ? { Authorization: `Bearer ${token}` } : {}),
        ...opcoes.headers
    };

    const resposta = await fetch(caminho, {
        ...opcoes,
        headers
    });

    const conteudo = await resposta.json().catch(() => undefined);

    if (!resposta.ok) {
        const mensagem = conteudo?.mensagem ?? "Erro ao processar requisicao";
        const erro = new Error(mensagem);
        erro.status = resposta.status;

        if (resposta.status === 401 && caminho !== "/auth/login") {
            erro.sessaoEncerrada = true;
            mostrarLogin();
            setFeedback(loginFeedback, "Sessao expirada. Faca login novamente.", "error");
        }

        throw erro;
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
        if (erro.sessaoEncerrada) {
            return;
        }

        if (erro.message.includes("Token")) {
            mostrarLogin();
            setFeedback(loginFeedback, erro.message, "error");
            return;
        }

        setFeedback(appFeedback, erro.message, "error");
    }
}

function criarStat(label, valor, opcoes = {}) {
    const card = document.createElement("article");
    card.className = "stat-card";

    const labelEl = document.createElement("p");
    labelEl.className = "stat-label";
    labelEl.textContent = label;

    const valueEl = document.createElement("p");
    valueEl.className = "stat-value";
    valueEl.textContent = valor;

    card.append(labelEl, valueEl);

    if (opcoes.acao) {
        const hint = document.createElement("span");
        hint.className = "stat-action";
        hint.textContent = opcoes.textoAcao ?? "Abrir";
        card.append(hint);
        card.classList.add("is-clickable");
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.addEventListener("click", opcoes.acao);
        card.addEventListener("keydown", (evento) => {
            if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();
                opcoes.acao();
            }
        });
    }

    return card;
}

function criarPainelDashboard(titulo, itens, criarLinha, mensagemVazia) {
    const painel = document.createElement("section");
    painel.className = "dashboard-panel";

    const heading = document.createElement("h2");
    heading.textContent = titulo;

    const lista = document.createElement("div");
    lista.className = "dashboard-list";

    if (itens.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "muted-cell";
        vazio.textContent = mensagemVazia;
        lista.append(vazio);
    } else {
        lista.replaceChildren(...itens.map(criarLinha));
    }

    painel.append(heading, lista);

    return painel;
}

function criarLinhaPedidoDashboard(pedido) {
    const linha = document.createElement("article");
    linha.className = "dashboard-list-item";

    const info = document.createElement("div");

    const titulo = document.createElement("strong");
    titulo.textContent = "#" + pedido.id + " - " + pedido.cliente.nome;

    const detalhe = document.createElement("p");
    detalhe.className = "muted-cell";
    detalhe.textContent = pedido.status + " - " + formatarMoeda(pedido.total) + " - " + formatarData(pedido.criadoEm);

    info.append(titulo, detalhe);

    const botao = criarBotao("Abrir");
    botao.addEventListener("click", () => abrirModalPedido(pedido.id));

    linha.append(info, botao);

    return linha;
}

function criarLinhaProdutoEstoqueDashboard(produto) {
    const linha = document.createElement("article");
    linha.className = "dashboard-list-item";

    const info = document.createElement("div");

    const titulo = document.createElement("strong");
    titulo.textContent = produto.nome;

    const detalhe = document.createElement("p");
    detalhe.className = "muted-cell";
    detalhe.textContent = "Estoque " + produto.estoque + " - " + formatarMoeda(produto.preco) +
        " - " + (produto.publicadoNaLoja ? "Publicado" : "Interno");

    info.append(titulo, detalhe);

    const botao = criarBotao("Ver produtos");
    botao.addEventListener("click", () => irParaProdutosDashboard({ estoqueBaixo: true }));

    linha.append(info, botao);

    return linha;
}

async function irParaProdutosDashboard(opcoes = {}) {
    trocarView("produtos");
    produtoFiltrosForm.reset();
    produtoEstoqueBaixoFiltro.checked = opcoes.estoqueBaixo === true;
    await carregarView();
}

async function irParaClientesDashboard() {
    trocarView("clientes");
    clienteFiltrosForm.reset();
    await carregarView();
}

async function irParaPedidosDashboard(status = "") {
    trocarView("pedidos");
    pedidoFiltrosForm.reset();
    pedidoStatusFiltro.value = status;
    await carregarView();
}

async function irParaPagamentosDashboard() {
    trocarView("pagamentos");
    await carregarView();
}

async function irParaSolicitacoesDashboard(status = "") {
    trocarView("solicitacoes");
    solicitacaoStatusFiltro.value = status;
    await carregarView();
}

async function carregarPedidosDashboard(status) {
    const parametros = new URLSearchParams({ limite: "50" });

    if (status) {
        parametros.set("status", status);
    }

    const resposta = await apiFetch("/pedidos?" + parametros.toString());

    return obterListaPaginada(resposta);
}

function criarPainelResumoDashboard(titulo, linhas, acaoTexto, acao) {
    const painel = document.createElement("section");
    painel.className = "dashboard-panel";

    const heading = document.createElement("h2");
    heading.textContent = titulo;
    painel.append(heading);

    for (const linha of linhas) {
        const item = document.createElement("p");
        item.className = "dashboard-summary-line";
        item.textContent = linha;
        painel.append(item);
    }

    if (acao) {
        const botao = criarBotao(acaoTexto);
        botao.addEventListener("click", acao);
        painel.append(botao);
    }

    return painel;
}

function criarPainelAtalhosDashboard() {
    const painel = document.createElement("section");
    painel.className = "dashboard-panel";

    const heading = document.createElement("h2");
    heading.textContent = "Atalhos";

    const lista = document.createElement("div");
    lista.className = "dashboard-actions";

    const atalhos = [
        ["Produtos", () => irParaProdutosDashboard()],
        ["Clientes", irParaClientesDashboard],
        ["Pedidos", () => irParaPedidosDashboard()],
        ["Pagamentos", irParaPagamentosDashboard]
    ];

    for (const [texto, acao] of atalhos) {
        const botao = criarBotao(texto);
        botao.addEventListener("click", acao);
        lista.append(botao);
    }

    painel.append(heading, lista);

    return painel;
}

async function mostrarPedidosDashboard(titulo, status, opcoes = {}) {
    setFeedback(appFeedback, "Carregando " + titulo.toLowerCase() + "...");

    const pedidos = Array.isArray(status)
        ? (await Promise.all(status.map(carregarPedidosDashboard))).flat()
        : await carregarPedidosDashboard(status);

    const pedidosOrdenados = pedidos.sort((a, b) => {
        return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime();
    });
    const total = pedidosOrdenados.reduce((soma, pedido) => soma + Number(pedido.total), 0);
    const statusDestino = typeof status === "string" ? status : "";

    dashboardAlerts.replaceChildren(
        criarPainelDashboard(
            titulo,
            pedidosOrdenados.slice(0, 10),
            criarLinhaPedidoDashboard,
            "Nenhum pedido encontrado."
        ),
        criarPainelResumoDashboard(
            "Resumo",
            [
                "Pedidos encontrados: " + pedidosOrdenados.length,
                "Total: " + formatarMoeda(total)
            ],
            opcoes.textoAcao ?? "Ver na tela Pedidos",
            () => irParaPedidosDashboard(statusDestino)
        )
    );

    setFeedback(appFeedback, "");
}

function mostrarEstoqueDashboard(produtos) {
    dashboardAlerts.replaceChildren(
        criarPainelDashboard(
            "Itens com estoque baixo",
            produtos,
            criarLinhaProdutoEstoqueDashboard,
            "Nenhum produto com estoque baixo."
        ),
        criarPainelResumoDashboard(
            "Resumo",
            [
                "Itens exibidos: " + produtos.length,
                "Criterio atual: estoque menor ou igual a 5"
            ],
            "Ver todos em Produtos",
            () => irParaProdutosDashboard({ estoqueBaixo: true })
        )
    );
}

function renderizarPaineisDashboardPadrao(resumo) {
    dashboardAlerts.replaceChildren(
        criarPainelDashboard(
            "Pedidos recentes",
            resumo.pedidosRecentes ?? [],
            criarLinhaPedidoDashboard,
            "Nenhum pedido criado ainda."
        ),
        criarPainelDashboard(
            "Estoque baixo",
            resumo.produtosEstoqueBaixo ?? [],
            criarLinhaProdutoEstoqueDashboard,
            "Nenhum produto com estoque baixo."
        ),
        criarPainelAtalhosDashboard()
    );
}

async function carregarDashboard() {
    const resumo = await apiFetch("/dashboard/resumo");

    statsGrid.replaceChildren(
        criarStat("Faturamento", formatarMoeda(resumo.pedidos.faturamentoConfirmado), {
            textoAcao: "Ver faturados",
            acao: () => mostrarPedidosDashboard("Pedidos faturados", ["pago", "enviado"], {
                textoAcao: "Ver pedidos"
            })
        }),
        criarStat("Em aberto", resumo.pedidos.pendentes, {
            textoAcao: "Ver abertos",
            acao: () => mostrarPedidosDashboard("Pedidos em aberto", "pendente")
        }),
        criarStat("Estoque baixo", resumo.produtos.estoqueBaixo, {
            textoAcao: "Ver itens",
            acao: () => mostrarEstoqueDashboard(resumo.produtosEstoqueBaixo ?? [])
        }),
        criarStat("Solicitacoes", resumo.solicitacoes.abertas, {
            textoAcao: "Ver solicitacoes",
            acao: () => irParaSolicitacoesDashboard()
        })
    );

    renderizarPaineisDashboardPadrao(resumo);
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
        criarCelula(produto.publicadoNaLoja ? "Publicado" : "Interno"),
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
    produtoEditPublicadoNaLoja.checked = produto.publicadoNaLoja;
    produtoModal.classList.remove("hidden");
    produtoEditNome.focus();
}

function fecharModalProduto() {
    produtoEditForm.reset();
    produtoModal.classList.add("hidden");
}

async function carregarProdutos() {
    const parametros = new URLSearchParams({ limite: "50" });
    const nome = produtoNomeFiltro.value.trim();

    if (nome) {
        parametros.set("nome", nome);
    }

    if (produtoEstoqueBaixoFiltro.checked) {
        parametros.set("estoqueBaixo", "true");
    }

    const resposta = await apiFetch("/produtos?" + parametros.toString());
    const produtos = obterListaPaginada(resposta);

    produtosTbody.replaceChildren(
        ...(produtos.length > 0 ? produtos.map(criarLinhaProduto) : [criarLinhaVazia(7, "Nenhum produto encontrado")])
    );
}

async function preencherProdutoPorSolicitacao(solicitacao) {
    produtoOrigemSolicitacao = solicitacao;
    trocarView("produtos");
    await carregarView();
    produtoNome.value = solicitacao.nomeProduto;
    produtoPreco.value = String(solicitacao.valorCotado ?? "");
    produtoEstoque.value = "";
    produtoPublicadoNaLoja.checked = false;
    produtoEstoque.focus();
    setFeedback(
        appFeedback,
        "Produto preenchido como item interno. Informe estoque, foto se quiser, e cadastre para vincular a solicitacao.",
        "success"
    );
}

function montarObservacaoPedidoSolicitacao(solicitacao) {
    const partes = [
        "Solicitacao #" + solicitacao.id,
        "Produto solicitado: " + solicitacao.nomeProduto
    ];

    if (solicitacao.descricao) {
        partes.push("Descricao: " + solicitacao.descricao);
    }

    if (solicitacao.valorCotado) {
        partes.push("Valor cotado: " + formatarMoeda(solicitacao.valorCotado));
    }

    if (solicitacao.linkReferencia) {
        partes.push("Referencia: " + solicitacao.linkReferencia);
    }

    return partes.join(" | ");
}

async function preencherPedidoPorSolicitacao(solicitacao) {
    if (solicitacao.status === "aprovada" || solicitacao.pedidoId) {
        setFeedback(appFeedback, "Esta solicitacao ja esta aprovada. Confira o pedido vinculado ou procure o pedido criado.", "error");
        return;
    }

    if (!solicitacao.clienteId) {
        setFeedback(appFeedback, "Crie ou vincule o cliente antes de preparar o pedido.", "error");
        return;
    }

    if (!solicitacao.valorCotado) {
        setFeedback(appFeedback, "Salve a cotacao antes de preparar o pedido.", "error");
        return;
    }

    if (!solicitacao.produtoId) {
        setFeedback(appFeedback, "Cadastre o produto interno da solicitacao antes de preparar o pedido.", "error");
        return;
    }

    trocarView("pedidos");
    await carregarView();

    pedidoCliente.value = String(solicitacao.clienteId);
    pedidoQuantidade.value = "1";
    pedidoObservacao.value = montarObservacaoPedidoSolicitacao(solicitacao);

    let produtoEncontrado = pedidoProdutosDisponiveis.find((produto) => produto.id === solicitacao.produtoId);

    if (!produtoEncontrado) {
        produtoEncontrado = await apiFetch("/produtos/" + solicitacao.produtoId);
        pedidoProdutosDisponiveis.push(produtoEncontrado);

        const option = document.createElement("option");
        option.value = String(produtoEncontrado.id);
        option.textContent = "#" + produtoEncontrado.id + " - " + produtoEncontrado.nome + " - " +
            formatarMoeda(produtoEncontrado.preco) + " - estoque " + produtoEncontrado.estoque;
        pedidoProduto.append(option);
    }

    pedidoProduto.value = String(produtoEncontrado.id);
    pedidoOrigemSolicitacaoId = solicitacao.id;
    pedidoQuantidade.focus();
    setFeedback(appFeedback, "Pedido preparado com cliente e produto. Confira a quantidade e clique em Criar pedido.", "success");
}

async function vincularPedidoEncontradoPorSolicitacao(solicitacao) {
    try {
        setFeedback(appFeedback, "Procurando pedido criado para a solicitacao #" + solicitacao.id + "...");
        const resposta = await apiFetch("/pedidos?limite=50");
        const pedidos = obterListaPaginada(resposta);
        const marcador = "Solicitacao #" + solicitacao.id;
        const encontrados = pedidos.filter((pedido) => {
            return typeof pedido.observacao === "string" && pedido.observacao.includes(marcador);
        });

        if (encontrados.length === 0) {
            setFeedback(appFeedback, "Nao encontrei pedido com a observacao " + marcador + ".", "error");
            return;
        }

        const pedidoMaisRecente = encontrados.reduce((maisRecente, pedido) => {
            return pedido.id > maisRecente.id ? pedido : maisRecente;
        }, encontrados[0]);

        if (encontrados.length > 1) {
            const ids = encontrados.map((pedido) => "#" + pedido.id).join(", ");
            const confirmou = window.confirm(
                "Encontrei mais de um pedido para esta solicitacao: " + ids + ". " +
                "Vincular ao mais recente, pedido #" + pedidoMaisRecente.id + "?"
            );

            if (!confirmou) {
                setFeedback(appFeedback, "Vinculo cancelado. Confira os pedidos manualmente.", "error");
                return;
            }
        }

        await apiFetch(`/solicitacoes/${solicitacao.id}/pedido`, {
            method: "PATCH",
            body: JSON.stringify({
                pedidoId: pedidoMaisRecente.id
            })
        });

        await carregarSolicitacoes();
        setFeedback(appFeedback, "Solicitacao vinculada ao pedido #" + pedidoMaisRecente.id + ".", "success");
    } catch (erro) {
        setFeedback(appFeedback, "Nao foi possivel vincular o pedido: " + erro.message, "error");
    }
}

async function editarProduto(produto) {
    abrirModalProduto(produto);
}

function agendarBuscaProdutos() {
    window.clearTimeout(produtoFiltroTimer);

    produtoFiltroTimer = window.setTimeout(async () => {
        if (activeView === "produtos") {
            await carregarProdutos();
        }
    }, 350);
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
    invalidarDadosFormularioPedido();
    await carregarProdutos();
}

function criarLinhaCliente(cliente) {
    const tr = document.createElement("tr");
    const actions = document.createElement("div");
    actions.className = "actions";

    const editar = criarBotao("Editar");
    const excluir = criarBotao("Excluir", "small-button danger-button");
    const whatsapp = criarLinkWhatsApp(cliente.telefone, "Ola, " + cliente.nome + ". Aqui e da Loja Japao.");

    editar.addEventListener("click", () => editarCliente(cliente));
    excluir.addEventListener("click", () => excluirCliente(cliente));
    actions.append(editar, excluir);

    if (whatsapp) {
        actions.append(whatsapp);
    }

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
    const parametros = new URLSearchParams({ limite: "50" });
    const nome = clienteNomeFiltro.value.trim();
    const telefone = clienteTelefoneFiltro.value.trim();

    if (nome) {
        parametros.set("nome", nome);
    }

    if (telefone) {
        parametros.set("telefone", telefone);
    }

    const resposta = await apiFetch("/clientes?" + parametros.toString());
    const clientes = obterListaPaginada(resposta);

    clientesTbody.replaceChildren(
        ...(clientes.length > 0 ? clientes.map(criarLinhaCliente) : [criarLinhaVazia(5, "Nenhum cliente encontrado")])
    );
}

function agendarBuscaClientes() {
    window.clearTimeout(clienteFiltroTimer);

    clienteFiltroTimer = window.setTimeout(async () => {
        if (activeView === "clientes") {
            await carregarClientes();
        }
    }, 350);
}

function agendarBuscaPedidos() {
    window.clearTimeout(pedidoFiltroTimer);

    pedidoFiltroTimer = window.setTimeout(async () => {
        if (activeView === "pedidos") {
            await carregarPedidos();
        }
    }, 350);
}

function abrirModalCliente(cliente) {
    clienteOrigemSolicitacaoId = null;
    clienteModalTitulo.textContent = "Editar cliente";
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
    clienteCepAtual = clienteEditCep.value.replace(/\D/g, "");
    mostrarFeedbackCepCliente("Altere o CEP ou clique em Buscar CEP.");
    clienteModal.classList.remove("hidden");
    clienteEditNome.focus();
}

function abrirModalClienteParaCadastro(dados = {}) {
    clienteOrigemSolicitacaoId = dados.solicitacaoId ?? null;
    clienteModalTitulo.textContent = "Cadastrar cliente";
    clienteEditId.value = "";
    clienteEditNome.value = dados.nome ?? "";
    clienteEditTelefone.value = dados.telefone ?? "";
    clienteEditEmail.value = "";
    clienteEditCep.value = "";
    clienteEditNumero.value = "";
    clienteEditEndereco.value = "";
    clienteEditComplemento.value = "";
    clienteEditBairro.value = "";
    clienteEditCidade.value = "";
    clienteEditEstado.value = "";
    clienteEditReferencia.value = "";
    clienteCepAtual = "";
    mostrarFeedbackCepCliente("Informe o CEP para buscar o endereco.");
    clienteModal.classList.remove("hidden");
    (clienteEditNome.value && clienteEditTelefone.value ? clienteEditCep : clienteEditNome).focus();
}

function fecharModalCliente() {
    cancelarBuscaCepCliente();
    clienteCepAtual = "";
    clienteOrigemSolicitacaoId = null;
    mostrarFeedbackCepCliente("");
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
    invalidarDadosFormularioPedido();
    await carregarClientes();
}

function criarDetalhePedido(rotulo, valor) {
    const paragrafo = document.createElement('p');
    const titulo = document.createElement('strong');
    titulo.textContent = rotulo + ': ';
    paragrafo.append(titulo, document.createTextNode(valor || 'Não informado'));
    return paragrafo;
}

async function abrirClientePorId(clienteId) {
    try {
        setFeedback(appFeedback, "Carregando cliente...");
        const cliente = await apiFetch("/clientes/" + clienteId);
        abrirModalCliente(cliente);
        setFeedback(appFeedback, "");
    } catch (erro) {
        setFeedback(appFeedback, "Nao foi possivel carregar o cliente: " + erro.message, "error");
    }
}

function criarSecaoPedido(titulo) {
    const secao = document.createElement('section');
    secao.className = 'pedido-secao';
    const heading = document.createElement('h3');
    heading.textContent = titulo;
    secao.append(heading);
    return secao;
}

function criarRastreioPedido(pedido) {
    const secao = criarSecaoPedido("Rastreio do envio");
    if (pedido.status !== "pago" && pedido.status !== "enviado") {
        secao.append(
            criarDetalhePedido("Transportadora", pedido.transportadora),
            criarDetalhePedido("Código de rastreio", pedido.codigoRastreio)
        );
        const linkRastreio = criarLinkRastreio(pedido.transportadora, pedido.codigoRastreio);

        if (linkRastreio) {
            secao.append(linkRastreio);
        }

        return secao;
    }

    const form = document.createElement("form");
    form.className = "modal-grid";
    const links = document.createElement("div");
    links.className = "actions field-wide";

    function atualizarLinkRastreio() {
        const linkRastreio = criarLinkRastreio(transportadora.value.trim(), codigo.value.trim());
        links.replaceChildren();

        if (linkRastreio) {
            links.append(linkRastreio);
        }
    }

    function criarCampo(rotulo, valor) {
        const label = document.createElement("label");
        label.textContent = rotulo;
        const input = document.createElement("input");
        input.type = "text";
        input.required = true;
        input.maxLength = 100;
        input.value = valor ?? "";
        label.append(input);
        form.append(label);
        return input;
    }
    const transportadora = criarCampo("Transportadora (ex.: Correios)", pedido.transportadora);
    const codigo = criarCampo("Código de rastreio", pedido.codigoRastreio);
    const aviso = document.createElement("p");
    aviso.className = "field-wide";
    aviso.textContent = "Após a postagem, salve o código e marque o pedido como enviado. O cliente verá o rastreio no acompanhamento.";
    const mensagem = document.createElement("p");
    mensagem.className = "feedback";
    mensagem.setAttribute("role", "status");
    const salvar = criarBotao("Salvar rastreio");
    salvar.type = "submit";
    atualizarLinkRastreio();
    form.append(aviso, links, salvar, mensagem);
    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        if (salvar.disabled) return;
        if (!transportadora.value.trim() || !codigo.value.trim()) {
            setFeedback(mensagem, "Informe a transportadora e o código.", "error");
            return;
        }
        salvar.disabled = true;
        transportadora.disabled = true;
        codigo.disabled = true;
        setFeedback(mensagem, "Salvando rastreio...");
        try {
            const atualizado = await apiFetch("/pedidos/" + pedido.id + "/rastreio", {
                method: "PATCH",
                body: JSON.stringify({
                    transportadora: transportadora.value.trim(),
                    codigoRastreio: codigo.value.trim()
                })
            });
            transportadora.value = atualizado.transportadora;
            codigo.value = atualizado.codigoRastreio;
            atualizarLinkRastreio();
            setFeedback(mensagem, "Rastreio salvo.", "success");

            if (activeView === "pedidos") {
                await carregarPedidos();
            }
        } catch (erro) {
            setFeedback(mensagem, erro.message, "error");
        } finally {
            salvar.disabled = false;
            transportadora.disabled = false;
            codigo.disabled = false;
        }
    });
    secao.append(form);
    return secao;
}

function criarHistoricoPedido(pedido) {
    const secao = criarSecaoPedido("Historico");
    const historico = Array.isArray(pedido.historico) ? pedido.historico : [];

    if (historico.length === 0) {
        const vazio = document.createElement("p");
        vazio.textContent = "Nenhum historico registrado.";
        secao.append(vazio);
        return secao;
    }

    for (const item of historico) {
        const linha = document.createElement("p");
        linha.className = "timeline-line";
        linha.textContent = formatarData(item.criadoEm) + " - " + item.status + " - " + item.descricao;
        secao.append(linha);
    }

    return secao;
}

function renderizarDetalhesPedido(pedido, cliente, pagamentos) {
    const resumo = criarSecaoPedido('Resumo');
    resumo.append(
        criarDetalhePedido('Status', pedido.status),
        criarDetalhePedido('Criado em', formatarData(pedido.criadoEm)),
        criarDetalhePedido('Total', formatarMoeda(pedido.total))
    );
    const entrega = criarSecaoPedido('Cliente e entrega');
    const entregaPedido = pedido.enderecoEntrega;

    entrega.append(
        criarDetalhePedido('Cliente cadastrado', '#' + cliente.id + ' - ' + cliente.nome),
        criarDetalhePedido('Nome no pedido', entregaPedido?.nome ?? cliente.nome),
        criarDetalhePedido('Telefone no pedido', entregaPedido?.telefone ?? cliente.telefone),
        criarDetalhePedido('Email no pedido', entregaPedido?.email ?? cliente.email),
        criarDetalhePedido(
            entregaPedido ? 'Endereco salvo no pedido' : 'Endereco atual do cliente',
            entregaPedido ? formatarEnderecoEntrega(entregaPedido) : formatarEnderecoCliente(cliente)
        ),
        criarDetalhePedido('Referencia no pedido', entregaPedido?.referencia ?? cliente.referencia)
    );

    if (entregaPedido) {
        entrega.append(criarDetalhePedido('Endereco atual do cliente', formatarEnderecoCliente(cliente)));
    }

    const whatsappPedido = criarLinkWhatsApp(
        obterTelefoneContatoPedido({
            ...pedido,
            cliente
        }),
        montarMensagemWhatsAppPedido({
            ...pedido,
            cliente
        })
    );

    if (whatsappPedido) {
        whatsappPedido.textContent = "Enviar status por WhatsApp";
        entrega.append(whatsappPedido);
    }

    const itens = criarSecaoPedido('Itens');
    for (const item of pedido.itens) {
        const linha = document.createElement('p');
        linha.textContent = item.nomeProduto + ' — ' + item.quantidade + ' × ' +
            formatarMoeda(item.precoUnitario) + ' = ' + formatarMoeda(item.subtotal);
        itens.append(linha);
    }
    const financeiro = criarSecaoPedido('Pagamentos');
    if (pagamentos.length === 0) {
        const aviso = document.createElement('p');
        aviso.textContent = 'Nenhum pagamento registrado.';
        financeiro.append(aviso);
    }
    for (const pagamento of pagamentos) {
        const linha = document.createElement('p');
        linha.textContent = '#' + pagamento.id + ' — ' + pagamento.metodo + ' — ' +
            formatarMoeda(pagamento.valor) + ' — ' + pagamento.status + ' — ' +
            formatarData(pagamento.criadoEm);
        financeiro.append(linha);
    }
    const observacao = criarSecaoPedido('Observação');
    const texto = document.createElement('p');
    texto.textContent = pedido.observacao || 'Nenhuma observação.';
    observacao.append(texto);
    pedidoConteudo.replaceChildren(
        resumo,
        entrega,
        criarRastreioPedido(pedido),
        criarHistoricoPedido(pedido),
        itens,
        financeiro,
        observacao
    );
}

async function abrirModalPedido(pedidoId) {
    const consulta = ++consultaPedidoAtual;
    pedidoTitulo.textContent = 'Pedido #' + pedidoId;
    pedidoConteudo.replaceChildren();
    setFeedback(pedidoFeedback, 'Carregando detalhes...');
    pedidoConteudo.setAttribute('aria-busy', 'true');
    pedidoModal.showModal();
    pedidoFechar.focus();

    try {
        const pedido = await apiFetch('/pedidos/' + pedidoId);
        if (consulta !== consultaPedidoAtual) return;
        // Cliente e pagamentos podem ser consultados ao mesmo tempo.
        const [cliente, pagamentos] = await Promise.all([
            apiFetch('/clientes/' + pedido.clienteId),
            apiFetch('/pagamentos/pedido/' + pedidoId)
        ]);
        if (consulta !== consultaPedidoAtual) return;
        renderizarDetalhesPedido(pedido, cliente, pagamentos);
        setFeedback(pedidoFeedback, '');
    } catch (erro) {
        if (consulta !== consultaPedidoAtual) return;
        setFeedback(pedidoFeedback, 'Não foi possível carregar os detalhes: ' + erro.message, 'error');
    } finally {
        if (consulta === consultaPedidoAtual) pedidoConteudo.setAttribute('aria-busy', 'false');
    }
}

async function irParaPedido(pedidoId) {
    trocarView("pedidos");
    await carregarView();
    await abrirModalPedido(pedidoId);
}

pedidoFechar.addEventListener('click', () => pedidoModal.close());
pedidoModal.addEventListener('close', () => {
    // Ignora respostas que chegarem depois que o modal foi fechado.
    consultaPedidoAtual++;
    pedidoConteudo.replaceChildren();
    pedidoConteudo.setAttribute('aria-busy', 'false');
});

function criarCelulaClientePedido(pedido) {
    const td = criarCelula("");
    const botao = criarBotao(pedido.cliente ? pedido.cliente.nome : "Cliente #" + pedido.clienteId);
    botao.addEventListener("click", () => abrirClientePorId(pedido.clienteId));
    td.append(botao);

    const telefoneContato = obterTelefoneContatoPedido(pedido);

    if (telefoneContato) {
        const telefone = document.createElement("p");
        telefone.className = "muted-cell";
        telefone.textContent = telefoneContato;
        td.append(telefone);

        const whatsapp = criarLinkWhatsApp(
            telefoneContato,
            montarMensagemWhatsAppPedido(pedido)
        );

        if (whatsapp) {
            whatsapp.textContent = "Enviar status";
            td.append(whatsapp);
        }
    }

    return td;
}

function criarLinhaPedido(pedido) {
    const tr = document.createElement("tr");
    const actions = document.createElement("div");
    actions.className = "actions";

    const detalhes = criarBotao("Ver detalhes");
    detalhes.addEventListener("click", () => abrirModalPedido(pedido.id));
    actions.append(detalhes);

    function adicionarAcao(texto, status, classe = "small-button") {
        const botao = criarBotao(texto, classe);
        botao.addEventListener("click", () => atualizarStatusPedido(pedido.id, status, actions));
        actions.append(botao);
    }

    if (pedido.status === "pendente") {
        const registrarPagamento = criarBotao("Registrar pagamento");
        registrarPagamento.addEventListener("click", () => registrarPagamentoPedido(pedido.id, actions));
        actions.append(registrarPagamento);
    }
    if (pedido.status === "pago") {
        if (pedido.transportadora && pedido.codigoRastreio) {
            adicionarAcao("Marcar como enviado", "enviado");
        } else {
            const adicionarRastreio = criarBotao("Adicionar rastreio");
            adicionarRastreio.addEventListener("click", () => abrirModalPedido(pedido.id));
            actions.append(adicionarRastreio);
        }
    }
    if (pedido.status !== "cancelado") {
        adicionarAcao("Cancelar pedido", "cancelado", "danger-button");
    }

    const tdActions = document.createElement("td");
    tdActions.append(actions);

    tr.append(
        criarCelula(pedido.id),
        criarCelulaClientePedido(pedido),
        criarCelula(formatarMoeda(pedido.total)),
        criarCelula(pedido.status),
        criarCelula(pedido.observacao ?? "-"),
        criarCelula(formatarData(pedido.criadoEm)),
        tdActions
    );

    return tr;
}

async function carregarPedidos() {
    await carregarDadosFormularioPedido();

    const parametros = new URLSearchParams({ limite: "50" });
    const status = pedidoStatusFiltro.value;
    const busca = pedidoBuscaFiltro.value.trim();

    if (status) {
        parametros.set("status", status);
    }

    if (busca) {
        parametros.set("busca", busca);
    }

    const resposta = await apiFetch("/pedidos?" + parametros.toString());
    const pedidos = obterListaPaginada(resposta);

    pedidosTbody.replaceChildren(
        ...(pedidos.length > 0 ? pedidos.map(criarLinhaPedido) : [criarLinhaVazia(7, "Nenhum pedido encontrado")])
    );
}

async function carregarDadosFormularioPedido(forcar = false) {
    if (pedidoFormDadosCarregados && !forcar) {
        return;
    }

    const [clientesResposta, produtosResposta] = await Promise.all([
        apiFetch("/clientes?limite=50"),
        apiFetch("/produtos?limite=50")
    ]);

    const clientes = obterListaPaginada(clientesResposta);
    const produtos = obterListaPaginada(produtosResposta);
    pedidoProdutosDisponiveis = produtos;

    preencherSelect(pedidoCliente, clientes, (cliente) => {
        return "#" + cliente.id + " - " + cliente.nome + " - " + cliente.telefone;
    }, "Nenhum cliente cadastrado", "Selecione um cliente");

    preencherSelect(pedidoProduto, produtos, (produto) => {
        return "#" + produto.id + " - " + produto.nome + " - " +
            formatarMoeda(produto.preco) + " - estoque " + produto.estoque;
    }, "Nenhum produto cadastrado", "Selecione um produto");

    pedidoFormDadosCarregados = true;
}

async function registrarPagamentoPedido(pedidoId, actions) {
    if (actions.dataset.atualizando === "true") return;

    const metodo = window.prompt("Metodo do pagamento: pix, cartao ou boleto", "pix")?.trim().toLowerCase();
    const metodosValidos = ["pix", "cartao", "boleto"];

    if (!metodo) {
        return;
    }

    if (!metodosValidos.includes(metodo)) {
        setFeedback(appFeedback, "Metodo deve ser pix, cartao ou boleto.", "error");
        return;
    }

    actions.dataset.atualizando = "true";
    const botoes = actions.querySelectorAll("button, a");
    botoes.forEach(botao => { botao.disabled = true; });

    try {
        await apiFetch("/pagamentos", {
            method: "POST",
            body: JSON.stringify({
                pedidoId,
                metodo
            })
        });

        await carregarPedidos();

        if (activeView === "pagamentos") {
            await carregarPagamentos();
        }

        setFeedback(appFeedback, "Pagamento registrado e pedido #" + pedidoId + " marcado como pago.", "success");
    } catch (erro) {
        setFeedback(appFeedback, erro.message, "error");
        actions.dataset.atualizando = "false";
        botoes.forEach(botao => { botao.disabled = false; });
    }
}

async function atualizarStatusPedido(pedidoId, status, actions) {
    if (actions.dataset.atualizando === "true") return;

    if (status === "cancelado") {
        const confirmou = window.confirm(
            "Cancelar o pedido #" + pedidoId + "? Os itens voltarão ao estoque. " +
            "O pedido não poderá ser reaberto e nenhum estorno será realizado automaticamente."
        );
        if (!confirmou) return;
    }

    actions.dataset.atualizando = "true";
    const botoes = actions.querySelectorAll("button");
    botoes.forEach(botao => { botao.disabled = true; });
    setFeedback(appFeedback, "Atualizando pedido...");

    try {
        await apiFetch("/pedidos/" + pedidoId + "/status", {
            method: "PATCH",
            body: JSON.stringify({ status })
        });
    } catch (erro) {
        setFeedback(appFeedback, "Não foi possível atualizar o pedido: " + erro.message, "error");
        actions.dataset.atualizando = "false";
        botoes.forEach(botao => { botao.disabled = false; });
        return;
    }

    try {
        await carregarPedidos();
        setFeedback(appFeedback, "Pedido #" + pedidoId + " atualizado para " + status + ".", "success");
    } catch {
        // O status foi salvo: mantém as ações antigas bloqueadas até recarregar.
        setFeedback(appFeedback, "Status salvo, mas não foi possível recarregar a lista. Clique em Atualizar.", "error");
    }
}

function criarLinhaPagamento(pagamento) {
    const tr = document.createElement("tr");
    const pedidoBotao = criarBotao("Pedido #" + pagamento.pedidoId);
    pedidoBotao.addEventListener("click", () => irParaPedido(pagamento.pedidoId));

    tr.append(
        criarCelula(pagamento.id),
        (() => {
            const td = criarCelula("");
            td.append(pedidoBotao);
            return td;
        })(),
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

function criarCelulaContatoSolicitacao(solicitacao) {
    const td = criarCelula("");

    if (solicitacao.contato) {
        const nome = document.createElement("p");
        nome.textContent = solicitacao.contato.nome;
        const telefone = document.createElement("p");
        telefone.textContent = solicitacao.contato.telefone;
        td.append(nome, telefone);

        const whatsapp = criarLinkWhatsApp(
            solicitacao.contato.telefone,
            montarMensagemWhatsAppSolicitacao(solicitacao)
        );

        if (whatsapp) {
            whatsapp.textContent = solicitacao.valorCotado ? "Enviar cotacao" : "WhatsApp";
            td.append(whatsapp);
        }
    } else {
        const origem = document.createElement("p");
        origem.textContent = solicitacao.clienteId ? "Cliente #" + solicitacao.clienteId : "Visitante";
        td.append(origem);
    }

    if (solicitacao.clienteId) {
        const abrirCliente = criarBotao("Abrir cliente");
        abrirCliente.addEventListener("click", () => abrirClientePorId(solicitacao.clienteId));
        td.append(abrirCliente);
    } else if (solicitacao.contato) {
        const criarCliente = criarBotao("Criar cliente");
        criarCliente.addEventListener("click", () => abrirModalClienteParaCadastro({
            solicitacaoId: solicitacao.id,
            nome: solicitacao.contato.nome,
            telefone: solicitacao.contato.telefone
        }));
        td.append(criarCliente);
    }

    return td;
}

function criarCelulaProdutoSolicitado(solicitacao) {
    const td = criarCelula(solicitacao.nomeProduto);
    const detalhes = document.createElement("details");
    const resumo = document.createElement("summary");
    resumo.textContent = "Ver descrição";
    const descricao = document.createElement("p");
    descricao.textContent = solicitacao.descricao;
    detalhes.append(resumo, descricao);
    if (solicitacao.linkReferencia) {
        try {
            const url = new URL(solicitacao.linkReferencia);
            if (["http:", "https:"].includes(url.protocol)) {
                const link = document.createElement("a");
                link.href = url.href;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.textContent = "Abrir referência do produto";
                detalhes.append(link);
            }
        } catch { /* Referências antigas podem não ser URLs. */ }
    }
    const cotacaoAtual = document.createElement("p");
    cotacaoAtual.textContent = solicitacao.valorCotado
        ? "Cotacao atual: " + formatarMoeda(solicitacao.valorCotado)
        : "Cotacao ainda nao informada.";
    detalhes.append(cotacaoAtual);

    if (solicitacao.produto) {
        const produtoVinculado = document.createElement("p");
        produtoVinculado.textContent = "Produto cadastrado: #" + solicitacao.produto.id + " - " +
            solicitacao.produto.nome + " - estoque " + solicitacao.produto.estoque;
        detalhes.append(produtoVinculado);
    }

    if (solicitacao.pedidoId) {
        const pedidoVinculado = document.createElement("p");
        const abrirPedido = criarBotao("Pedido #" + solicitacao.pedidoId);
        abrirPedido.addEventListener("click", () => irParaPedido(solicitacao.pedidoId));
        pedidoVinculado.append("Pedido criado: ", abrirPedido);
        detalhes.append(pedidoVinculado);
    }

    if (solicitacao.observacaoAdmin) {
        const observacao = document.createElement("p");
        observacao.textContent = "Observacao interna: " + solicitacao.observacaoAdmin;
        detalhes.append(observacao);
    }

    const proximoPasso = document.createElement("p");
    proximoPasso.className = "muted-cell";

    if (solicitacao.pedidoId) {
        proximoPasso.textContent = "Concluido: solicitacao vinculada ao pedido #" + solicitacao.pedidoId + ".";
    } else if (solicitacao.status === "aprovada") {
        proximoPasso.textContent = "Aprovada, mas sem pedido vinculado. Procure o pedido criado antes de preparar outro.";
    } else if (!solicitacao.valorCotado) {
        proximoPasso.textContent = "Proximo passo: salvar a cotacao.";
    } else if (!solicitacao.clienteId && !solicitacao.produtoId) {
        proximoPasso.textContent = "Proximo passo: se o cliente aprovar, crie o cadastro dele e o produto interno.";
    } else if (!solicitacao.clienteId) {
        proximoPasso.textContent = "Proximo passo: crie ou vincule o cadastro do cliente.";
    } else if (!solicitacao.produtoId) {
        proximoPasso.textContent = "Proximo passo: cadastrar o produto interno.";
    } else {
        proximoPasso.textContent = "Pronto: depois da confirmacao do cliente, prepare o pedido.";
    }

    detalhes.append(proximoPasso);

    const acoesSolicitacao = document.createElement("div");
    acoesSolicitacao.className = "actions";

    if (solicitacao.valorCotado && !solicitacao.produtoId) {
        const criarProduto = criarBotao("Cadastrar produto interno");
        criarProduto.addEventListener("click", () => preencherProdutoPorSolicitacao(solicitacao));
        acoesSolicitacao.append(criarProduto);
    }

    if (solicitacao.status === "aprovada" && !solicitacao.pedidoId) {
        const procurarPedido = criarBotao("Procurar pedido criado");
        procurarPedido.addEventListener("click", () => vincularPedidoEncontradoPorSolicitacao(solicitacao));
        acoesSolicitacao.append(procurarPedido);
    }

    if (
        solicitacao.status !== "aprovada" &&
        solicitacao.valorCotado &&
        solicitacao.clienteId &&
        solicitacao.produtoId &&
        !solicitacao.pedidoId
    ) {
        const prepararPedido = criarBotao("Preparar pedido confirmado");
        prepararPedido.addEventListener("click", () => preencherPedidoPorSolicitacao(solicitacao));
        acoesSolicitacao.append(prepararPedido);
    }

    if (acoesSolicitacao.childElementCount > 0) {
        detalhes.append(acoesSolicitacao);
    }

    const form = document.createElement("form");
    form.className = "quote-form";

    const valorLabel = document.createElement("label");
    valorLabel.textContent = "Valor cotado";
    const valorInput = document.createElement("input");
    valorInput.type = "number";
    valorInput.min = "0.01";
    valorInput.step = "0.01";
    valorInput.required = true;
    valorInput.value = solicitacao.valorCotado ?? "";
    valorLabel.append(valorInput);

    const observacaoLabel = document.createElement("label");
    observacaoLabel.textContent = "Observacao interna";
    const observacaoInput = document.createElement("textarea");
    observacaoInput.rows = 3;
    observacaoInput.value = solicitacao.observacaoAdmin ?? "";
    observacaoLabel.append(observacaoInput);

    const salvarCotacao = criarBotao("Salvar cotacao");
    salvarCotacao.type = "submit";
    const mensagem = document.createElement("p");
    mensagem.className = "feedback";
    mensagem.setAttribute("role", "status");

    form.append(valorLabel, observacaoLabel, salvarCotacao, mensagem);
    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const valorCotado = Number(valorInput.value);
        const observacaoAdmin = observacaoInput.value.trim();

        if (!Number.isFinite(valorCotado) || valorCotado <= 0) {
            setFeedback(mensagem, "Informe um valor maior que zero.", "error");
            return;
        }

        salvarCotacao.disabled = true;
        setFeedback(mensagem, "Salvando cotacao...");

        try {
            await apiFetch("/solicitacoes/" + solicitacao.id + "/cotacao", {
                method: "PATCH",
                body: JSON.stringify({
                    valorCotado,
                    observacaoAdmin: observacaoAdmin || undefined
                })
            });

            setFeedback(appFeedback, "Cotacao salva e solicitacao marcada como cotada.", "success");
            await carregarSolicitacoes();
        } catch (erro) {
            setFeedback(mensagem, erro.message, "error");
        } finally {
            salvarCotacao.disabled = false;
        }
    });
    detalhes.append(form);

    td.append(detalhes);
    return td;
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
        criarCelulaContatoSolicitacao(solicitacao),
        criarCelulaProdutoSolicitado(solicitacao),
        criarCelula(solicitacao.status),
        criarCelula(formatarData(solicitacao.criadoEm)),
        tdActions
    );

    return tr;
}

async function carregarSolicitacoes() {
    const status = solicitacaoStatusFiltro.value;
    const filtroStatus = status ? "&status=" + encodeURIComponent(status) : "";
    const resposta = await apiFetch("/solicitacoes?limite=50" + filtroStatus);
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
    const solicitacaoOrigem = produtoOrigemSolicitacao;

    try {
        const produto = await apiFetch("/produtos", {
            method: "POST",
            body: JSON.stringify({
                nome: String(formData.get("nome")),
                preco: Number(formData.get("preco")),
                estoque: Number(formData.get("estoque")),
                publicadoNaLoja: produtoPublicadoNaLoja.checked
            })
        });

        const arquivo = formData.get("imagemArquivo");

        if (arquivo instanceof File && arquivo.size > 0) {
            await enviarFotoProduto(produto.id, arquivo);
        }

        if (solicitacaoOrigem) {
            await apiFetch("/solicitacoes/" + solicitacaoOrigem.id + "/produto", {
                method: "PATCH",
                body: JSON.stringify({
                    produtoId: produto.id
                })
            });
        }

        produtoForm.reset();
        produtoImagemBotao.textContent = "Escolher arquivo";
        limparOrigemProdutoSolicitacao();
        invalidarDadosFormularioPedido();

        if (solicitacaoOrigem) {
            trocarView("solicitacoes");
            await carregarView();
            setFeedback(appFeedback, "Produto interno cadastrado. Depois da confirmacao do cliente, prepare o pedido.", "success");
            return;
        }

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

produtoFiltrosForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (activeView === "produtos") {
        await carregarProdutos();
    }
});

produtoFiltrosLimpar.addEventListener("click", async () => {
    produtoFiltrosForm.reset();
    window.clearTimeout(produtoFiltroTimer);

    if (activeView === "produtos") {
        await carregarProdutos();
    }
});

produtoNomeFiltro.addEventListener("input", agendarBuscaProdutos);
produtoEstoqueBaixoFiltro.addEventListener("change", async () => {
    if (activeView === "produtos") {
        await carregarProdutos();
    }
});

clienteFiltrosForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (activeView === "clientes") {
        await carregarClientes();
    }
});

clienteFiltrosLimpar.addEventListener("click", async () => {
    clienteFiltrosForm.reset();
    window.clearTimeout(clienteFiltroTimer);

    if (activeView === "clientes") {
        await carregarClientes();
    }
});
clienteNomeFiltro.addEventListener("input", agendarBuscaClientes);
clienteTelefoneFiltro.addEventListener("input", agendarBuscaClientes);

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
                estoque,
                publicadoNaLoja: produtoEditPublicadoNaLoja.checked
            })
        });

        fecharModalProduto();
        setFeedback(appFeedback, "Produto atualizado", "success");
        invalidarDadosFormularioPedido();
        await carregarProdutos();
    } catch (erro) {
        setFeedback(appFeedback, erro.message, "error");
    }
});

clienteEditCancelar.addEventListener("click", fecharModalCliente);

clienteEditCep.addEventListener("input", buscarEnderecoClientePorCep);
clienteEditCep.addEventListener("change", buscarEnderecoClientePorCep);
clienteEditCepBuscar.addEventListener("click", () => buscarEnderecoClientePorCep({ forcar: true }));
pedidoForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const clienteId = Number(pedidoCliente.value);
    const produtoId = Number(pedidoProduto.value);
    const quantidade = Number(pedidoQuantidade.value);
    const solicitacaoOrigemId = pedidoOrigemSolicitacaoId;

    if (!Number.isInteger(clienteId) || clienteId <= 0 || !Number.isInteger(produtoId) || produtoId <= 0) {
        setFeedback(appFeedback, "Selecione cliente e produto", "error");
        return;
    }

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
        setFeedback(appFeedback, "Quantidade deve ser maior que zero", "error");
        return;
    }

    if (pedidoForm.dataset.enviando === "true") {
        return;
    }

    pedidoForm.dataset.enviando = "true";

    try {
        const pedido = await apiFetch("/pedidos", {
            method: "POST",
            body: JSON.stringify({
                clienteId,
                observacao: obterValorOpcionalDoInput(pedidoObservacao),
                itens: [
                    {
                        produtoId,
                        quantidade
                    }
                ]
            })
        });

        let solicitacaoAtualizada = false;
        let erroVinculoSolicitacao = "";

        if (solicitacaoOrigemId !== null) {
            try {
                await apiFetch(`/solicitacoes/${solicitacaoOrigemId}/pedido`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        pedidoId: pedido.id
                    })
                });
                solicitacaoAtualizada = true;
            } catch (erro) {
                erroVinculoSolicitacao = erro.message;
                solicitacaoAtualizada = false;

                try {
                    await apiFetch(`/solicitacoes/${solicitacaoOrigemId}/status`, {
                        method: "PATCH",
                        body: JSON.stringify({
                            status: "aprovada"
                        })
                    });
                } catch { /* Se falhar, o pedido ja foi criado e o admin sera avisado abaixo. */ }
            }
        }

        pedidoForm.reset();
        pedidoQuantidade.value = "1";
        limparOrigemPedidoSolicitacao();
        invalidarDadosFormularioPedido();
        await carregarPedidos();
        setFeedback(
            appFeedback,
            solicitacaoOrigemId !== null && solicitacaoAtualizada
                ? "Pedido #" + pedido.id + " criado e vinculado a solicitacao."
                : solicitacaoOrigemId !== null
                    ? "Pedido #" + pedido.id + " criado, mas nao consegui vincular a solicitacao. " +
                        (erroVinculoSolicitacao ? "Motivo: " + erroVinculoSolicitacao + ". " : "") +
                        "Use Procurar pedido criado na solicitacao."
                : "Pedido #" + pedido.id + " criado.",
            solicitacaoOrigemId !== null && !solicitacaoAtualizada ? "error" : "success"
        );
        await abrirModalPedido(pedido.id);
    } catch (erro) {
        setFeedback(appFeedback, "Nao foi possivel criar o pedido: " + erro.message, "error");
    } finally {
        pedidoForm.dataset.enviando = "false";
    }
});

pedidoFiltrosForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (activeView === "pedidos") {
        await carregarPedidos();
    }
});

pedidoFiltrosLimpar.addEventListener("click", async () => {
    pedidoFiltrosForm.reset();
    window.clearTimeout(pedidoFiltroTimer);

    if (activeView === "pedidos") {
        await carregarPedidos();
    }
});

pedidoBuscaFiltro.addEventListener("input", agendarBuscaPedidos);

pedidoStatusFiltro.addEventListener("change", async () => {
    if (activeView === "pedidos") {
        await carregarPedidos();
    }
});

pedidoCliente.addEventListener("change", limparOrigemPedidoSolicitacao);
pedidoProduto.addEventListener("change", limparOrigemPedidoSolicitacao);

solicitacaoStatusFiltro.addEventListener("change", async () => {
    if (activeView === "solicitacoes") {
        await carregarSolicitacoes();
    }
});

clienteEditForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const idTexto = clienteEditId.value;
    const editando = idTexto !== "";
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
        const dadosCliente = {
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
        };

        const clienteSalvo = await apiFetch(editando ? `/clientes/${Number(idTexto)}` : "/clientes", {
            method: editando ? "PATCH" : "POST",
            body: JSON.stringify(dadosCliente)
        });

        if (!editando && clienteOrigemSolicitacaoId !== null) {
            await apiFetch(`/solicitacoes/${clienteOrigemSolicitacaoId}/cliente`, {
                method: "PATCH",
                body: JSON.stringify({
                    clienteId: clienteSalvo.id
                })
            });
        }

        fecharModalCliente();
        invalidarDadosFormularioPedido();
        await carregarView();
        setFeedback(appFeedback, editando ? "Cliente atualizado" : "Cliente cadastrado e vinculado", "success");
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
