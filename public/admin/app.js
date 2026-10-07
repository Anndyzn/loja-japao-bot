const loginView = document.querySelector("#login-view");
const appView = document.querySelector("#app-view");
let appNome = "Loja Japao";
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
const senhaForm = document.querySelector("#senha-form");
const senhaAtual = document.querySelector("#senha-atual");
const novaSenha = document.querySelector("#nova-senha");
const confirmarSenha = document.querySelector("#confirmar-senha");
const senhaFeedback = document.querySelector("#senha-feedback");
const adminLogadoInfo = document.querySelector("#admin-logado-info");
const sistemaStatus = document.querySelector("#sistema-status");
const produtoForm = document.querySelector("#produto-form");
const produtoNome = document.querySelector("#produto-nome");
const produtoPreco = document.querySelector("#produto-preco");
const produtoEstoque = document.querySelector("#produto-estoque");
const produtoPublicadoNaLoja = document.querySelector("#produto-publicado-na-loja");
const produtoTipoEnvio = document.querySelector("#produto-tipo-envio");
const produtoFiltrosForm = document.querySelector("#produto-filtros-form");
const produtoNomeFiltro = document.querySelector("#produto-nome-filtro");
const produtoPublicadoFiltro = document.querySelector("#produto-publicado-filtro");
const produtoTipoEnvioFiltro = document.querySelector("#produto-tipo-envio-filtro");
const produtoEstoqueBaixoFiltro = document.querySelector("#produto-estoque-baixo-filtro");
const produtoFiltrosLimpar = document.querySelector("#produto-filtros-limpar");
const produtoMedidasIncompletasFiltro = document.querySelector("#produto-medidas-incompletas-filtro");
const produtoImagemBotao = document.querySelector("#produto-imagem-botao");
const produtoImagemArquivo = document.querySelector("#produto-imagem-arquivo");
const produtosTbody = document.querySelector("#produtos-tbody");
const produtoListaResumo = document.querySelector("#produto-lista-resumo");
const clientesTbody = document.querySelector("#clientes-tbody");
const clienteListaResumo = document.querySelector("#cliente-lista-resumo");
const clienteFiltrosForm = document.querySelector("#cliente-filtros-form");
const clienteNomeFiltro = document.querySelector("#cliente-nome-filtro");
const clienteTelefoneFiltro = document.querySelector("#cliente-telefone-filtro");
const clienteEnderecoIncompletoFiltro = document.querySelector("#cliente-endereco-incompleto-filtro");
const clienteFiltrosLimpar = document.querySelector("#cliente-filtros-limpar");
const pedidosTbody = document.querySelector("#pedidos-tbody");
const pedidoForm = document.querySelector("#pedido-form");
const pedidoFreteSelect = document.querySelector("#pedido-frete");
const pedidoCalcularFrete = document.querySelector("#pedido-calcular-frete");
const pedidoFreteFeedback = document.querySelector("#pedido-frete-feedback");
let pedidoFreteOpcoes = [];
let pedidoFreteConsulta = 0;
let pedidoFreteAssinatura = "";
let pedidoFreteSubtotal = 0;
const pedidoCliente = document.querySelector("#pedido-cliente");
const pedidoProduto = document.querySelector("#pedido-produto");
const pedidoQuantidade = document.querySelector("#pedido-quantidade");
const pedidoTipoEnvio = document.querySelector("#pedido-tipo-envio");
const pedidoObservacao = document.querySelector("#pedido-observacao");
const pedidoTaxasImportacaoGrupo = document.querySelector("#pedido-taxas-importacao-grupo");
const pedidoClienteCienteTaxas = document.querySelector("#pedido-cliente-ciente-taxas");
const pedidoFreteInternacionalGrupo = document.querySelector("#pedido-frete-internacional-grupo");
const pedidoFreteInternacional = document.querySelector("#pedido-frete-internacional");
const pedidoFiltrosForm = document.querySelector("#pedido-filtros-form");
const pedidoBuscaFiltro = document.querySelector("#pedido-busca-filtro");
const pedidoStatusFiltro = document.querySelector("#pedido-status-filtro");
const pedidoPrecisaAcaoFiltro = document.querySelector("#pedido-precisa-acao-filtro");
const pedidoAcaoFiltro = document.querySelector("#pedido-acao-filtro");
const pedidoFiltrosLimpar = document.querySelector("#pedido-filtros-limpar");
const pedidoFiltroContexto = document.querySelector("#pedido-filtro-contexto");
const pedidoListaResumo = document.querySelector("#pedido-lista-resumo");
const pedidoPaginaAnterior = document.querySelector("#pedido-pagina-anterior");
const pedidoPaginaProxima = document.querySelector("#pedido-pagina-proxima");
const pedidoPaginaInfo = document.querySelector("#pedido-pagina-info");
const pedidoLimite = document.querySelector("#pedido-limite");
let pedidoPaginaAtual = 1;
let pedidoTotalPaginas = 0;
let pedidoFiltrosAtuais = "";
let pedidoConsultaAtual = 0;
const pagamentosTbody = document.querySelector("#pagamentos-tbody");
const pagamentoListaResumo = document.querySelector("#pagamento-lista-resumo");
const pagamentoFiltrosForm = document.querySelector("#pagamento-filtros-form");
const pagamentoBuscaFiltro = document.querySelector("#pagamento-busca-filtro");
const pagamentoMetodoFiltro = document.querySelector("#pagamento-metodo-filtro");
const pagamentoStatusFiltro = document.querySelector("#pagamento-status-filtro");
const pagamentoFiltrosLimpar = document.querySelector("#pagamento-filtros-limpar");
const solicitacoesTbody = document.querySelector("#solicitacoes-tbody");
const solicitacaoBuscaFiltro = document.querySelector("#solicitacao-busca-filtro");
const solicitacaoStatusFiltro = document.querySelector("#solicitacao-status-filtro");
const solicitacaoFiltrosLimpar = document.querySelector("#solicitacao-filtros-limpar");
const solicitacaoFiltroContexto = document.querySelector("#solicitacao-filtro-contexto");
const solicitacaoListaResumo = document.querySelector("#solicitacao-lista-resumo");
const produtoModal = document.querySelector("#produto-modal");
const produtoEditForm = document.querySelector("#produto-edit-form");
const produtoEditId = document.querySelector("#produto-edit-id");
const produtoEditNome = document.querySelector("#produto-edit-nome");
const produtoEditPreco = document.querySelector("#produto-edit-preco");
const produtoEditEstoque = document.querySelector("#produto-edit-estoque");
const produtoEditPublicadoNaLoja = document.querySelector("#produto-edit-publicado-na-loja");
const produtoEditTipoEnvio = document.querySelector("#produto-edit-tipo-envio");
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
const clienteHistoricoResumo = document.querySelector("#cliente-historico-resumo");
const clienteWhatsAppLink = document.querySelector("#cliente-whatsapp-link");

const pedidoModal = document.querySelector('#pedido-modal');
const pedidoTitulo = document.querySelector('#pedido-titulo');
const pedidoFeedback = document.querySelector('#pedido-feedback');
const pedidoConteudo = document.querySelector('#pedido-conteudo');
const pedidoFechar = document.querySelector('#pedido-fechar');
let consultaPedidoAtual = 0;

const pixModal = document.querySelector("#pix-modal");
const pixConfirmacaoForm = document.querySelector("#pix-confirmacao-form");
const pixConfirmacaoDados = document.querySelector("#pix-confirmacao-dados");
const pixConfirmacaoFeedback = document.querySelector("#pix-confirmacao-feedback");
const pixConfirmacaoCancelar = document.querySelector("#pix-confirmacao-cancelar");
const pixConfirmacaoConfirmar = document.querySelector("#pix-confirmacao-confirmar");

const viewTitles = {
    dashboard: "Dashboard",
    produtos: "Produtos",
    clientes: "Clientes",
    pedidos: "Pedidos",
    pagamentos: "Pagamentos",
    solicitacoes: "Solicitacoes",
    seguranca: "Seguranca"
};

const viewSections = {
    dashboard: document.querySelector("#dashboard-view"),
    produtos: document.querySelector("#produtos-view"),
    clientes: document.querySelector("#clientes-view"),
    pedidos: document.querySelector("#pedidos-view"),
    pagamentos: document.querySelector("#pagamentos-view"),
    solicitacoes: document.querySelector("#solicitacoes-view"),
    seguranca: document.querySelector("#seguranca-view")
};

const statusSolicitacoes = ["recebida", "em_analise", "cotada", "aprovada", "recusada", "cancelada"];

let token = localStorage.getItem("adminToken");
let activeView = "dashboard";
let adminLogado = null;
let clienteCepAtual = "";
let clienteBuscaCep = null;
let produtoFiltroTimer = null;
let clienteFiltroTimer = null;
let pedidoFiltroTimer = null;
let pagamentoFiltroTimer = null;
let solicitacaoFiltroTimer = null;
let clienteOrigemSolicitacaoId = null;
let produtoOrigemSolicitacao = null;
let pedidoOrigemSolicitacaoId = null;
let pedidoFormDadosCarregados = false;
let pedidoClientesDisponiveis = [];
let pedidoProdutosDisponiveis = [];
let pedidoClienteFiltro = null;
let solicitacaoClienteFiltro = null;
let consultaClienteResumoAtual = 0;
let pixConfirmacaoPedido = null;
let pixConfirmacaoActions = null;
let pixConfirmacaoPedidoDetalheId = null;

function travarScrollPagina() {
    document.body.classList.add("modal-open");
}

function liberarScrollPagina() {
    document.body.classList.remove("modal-open");
}

function invalidarDadosFormularioPedido() {
    invalidarFretePedido();
    pedidoFormDadosCarregados = false;
    pedidoClientesDisponiveis = [];
    pedidoProdutosDisponiveis = [];
}

function limparOrigemProdutoSolicitacao() {
    produtoOrigemSolicitacao = null;
}

function limparOrigemPedidoSolicitacao() {
    pedidoOrigemSolicitacaoId = null;
    if (pedidoFreteInternacional) {
        pedidoFreteInternacional.value = "0";
    }
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

function formatarDataCurta(valor) {
    return new Date(valor).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatarDuracao(segundos) {
    const total = Number(segundos);

    if (!Number.isFinite(total) || total < 0) {
        return "-";
    }

    const horas = Math.floor(total / 3600);
    const minutos = Math.floor((total % 3600) / 60);
    const restoSegundos = Math.floor(total % 60);

    if (horas > 0) {
        return horas + "h " + minutos + "min";
    }

    if (minutos > 0) {
        return minutos + "min " + restoSegundos + "s";
    }

    return restoSegundos + "s";
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

function clienteTemEnderecoCompleto(cliente) {
    return Boolean(
        cliente.cep &&
        cliente.endereco &&
        cliente.numero &&
        cliente.bairro &&
        cliente.cidade &&
        cliente.estado
    );
}

function obterCamposEnderecoFaltando(cliente) {
    const campos = [
        ["cep", "CEP"],
        ["endereco", "rua"],
        ["numero", "numero"],
        ["bairro", "bairro"],
        ["cidade", "cidade"],
        ["estado", "estado"]
    ];

    return campos
        .filter(([campo]) => !cliente[campo])
        .map(([, rotulo]) => rotulo);
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

function atualizarLinkWhatsAppCliente() {
    const nome = clienteEditNome.value.trim();
    const link = criarLinkWhatsApp(
        clienteEditTelefone.value,
        "Ola, " + (nome || "tudo bem") + ". Aqui e da " + appNome + "."
    );

    if (!link) {
        clienteWhatsAppLink.classList.add("hidden");
        clienteWhatsAppLink.removeAttribute("href");
        return;
    }

    clienteWhatsAppLink.href = link.href;
    clienteWhatsAppLink.classList.remove("hidden");
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

function montarLinkAcompanhamentoPedido(pedidoId) {
    return new URL("/loja/acompanhamento?pedido=" + pedidoId, window.location.origin).href;
}

async function copiarTexto(texto) {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(texto);
        return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = texto;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
}

function montarMensagemWhatsAppPedido(pedido) {
    const nome = obterNomeContatoPedido(pedido);
    const saudacao = nome ? "Ola, " + nome + "." : "Ola.";
    const linkAcompanhamento = montarLinkAcompanhamentoPedido(pedido.id);
    const partes = [
        saudacao + " Seu pedido #" + pedido.id + " na " + appNome + " esta " +
            obterDescricaoStatusPedido(pedido.status) + ".",
        "Acompanhe por aqui: " + linkAcompanhamento,
        "Por seguranca, informe o telefone usado no pedido ao abrir a pagina."
    ];

    if (pedido.status === "enviado" && pedido.transportadora && pedido.codigoRastreio) {
        partes.push("Rastreio: " + pedido.transportadora + " - " + pedido.codigoRastreio + ".");
    }

    if (pedido.tipoEnvio === "internacional_direto") {
        partes.push("Este e um envio internacional direto. Taxas de importacao, se cobradas, sao responsabilidade do cliente.");
    }

    return partes.join(" ");
}

function montarMensagemWhatsAppPedidoEtapa(pedido, etapa) {
    const nome = obterNomeContatoPedido(pedido);
    const saudacao = nome ? "Ola, " + nome + "." : "Ola.";
    const linkAcompanhamento = montarLinkAcompanhamentoPedido(pedido.id);

    if (etapa === "pix") {
        const avisoImportacao = pedido.tipoEnvio === "internacional_direto"
            ? " Este e um envio internacional direto; taxas de importacao, se cobradas, sao responsabilidade do cliente."
            : "";

        return saudacao + " Seguem os dados para pagamento do pedido #" + pedido.id +
            " na " + appNome + ". Valor: " + formatarMoeda(pedido.total) +
            ". Recebedor: " + pedido.pix.recebedor +
            ". Chave Pix: " + pedido.pix.chave +
            "." + avisoImportacao +
            ". Depois de pagar, envie o comprovante por aqui. Acompanhe seu pedido: " +
            linkAcompanhamento;
    }

    if (etapa === "pagamento") {
        return saudacao + " O pagamento do pedido #" + pedido.id +
            " foi confirmado. Agora vamos preparar o envio. Acompanhe por aqui: " +
            linkAcompanhamento;
    }

    if (etapa === "rastreio") {
        return saudacao + " Seu pedido #" + pedido.id + " foi enviado. Transportadora: " +
            pedido.transportadora + ". Codigo de rastreio: " + pedido.codigoRastreio +
            ". Acompanhe por aqui: " + linkAcompanhamento;
    }

    return montarMensagemWhatsAppPedido(pedido);
}

function formatarErroLogin(erro) {
    const tentarNovamenteEm = erro.dados?.tentarNovamenteEm;

    if (erro.status !== 429 || !tentarNovamenteEm) {
        return erro.message;
    }

    const dataTentativa = new Date(tentarNovamenteEm);

    if (Number.isNaN(dataTentativa.getTime())) {
        return erro.message;
    }

    return erro.message + " Tente novamente as " +
        dataTentativa.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        }) + ".";
}

function normalizarTexto(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function normalizarDigitos(texto) {
    return String(texto ?? "").replace(/\D/g, "");
}

function pedidoConfereBuscaLocal(pedido, busca) {
    const buscaTratada = busca.trim();

    if (!buscaTratada) {
        return true;
    }

    if (buscaTratada.startsWith("#")) {
        const buscaId = normalizarDigitos(buscaTratada);

        return buscaId ? String(pedido.id).startsWith(buscaId) : true;
    }

    const buscaTexto = normalizarTexto(buscaTratada);
    const buscaDigitos = normalizarDigitos(buscaTratada);
    const camposTexto = [
        String(pedido.id),
        pedido.status,
        pedido.cliente?.nome,
        pedido.enderecoEntrega?.nome,
        pedido.observacao,
        ...(pedido.itens ?? []).map((item) => item.nomeProduto)
    ];

    if (camposTexto.some((campo) => normalizarTexto(campo).includes(buscaTexto))) {
        return true;
    }

    if (!buscaDigitos) {
        return false;
    }

    return [
        String(pedido.id),
        pedido.cliente?.telefone,
        pedido.enderecoEntrega?.telefone
    ].some((campo) => normalizarDigitos(campo).includes(buscaDigitos));
}

function solicitacaoConfereBuscaLocal(solicitacao, busca) {
    const buscaTratada = busca.trim();

    if (!buscaTratada) {
        return true;
    }

    if (buscaTratada.startsWith("#")) {
        const buscaId = normalizarDigitos(buscaTratada);

        return buscaId ? String(solicitacao.id).startsWith(buscaId) : true;
    }

    const buscaTexto = normalizarTexto(buscaTratada);
    const buscaDigitos = normalizarDigitos(buscaTratada);
    const camposTexto = [
        String(solicitacao.id),
        String(solicitacao.clienteId ?? ""),
        String(solicitacao.produtoId ?? ""),
        String(solicitacao.pedidoId ?? ""),
        solicitacao.status,
        solicitacao.contato?.nome,
        solicitacao.nomeProduto,
        solicitacao.descricao,
        solicitacao.linkReferencia,
        solicitacao.observacaoAdmin,
        solicitacao.produto?.nome
    ];

    if (camposTexto.some((campo) => normalizarTexto(campo).includes(buscaTexto))) {
        return true;
    }

    if (!buscaDigitos) {
        return false;
    }

    return [
        String(solicitacao.id),
        String(solicitacao.clienteId ?? ""),
        String(solicitacao.produtoId ?? ""),
        String(solicitacao.pedidoId ?? ""),
        solicitacao.contato?.telefone
    ].some((campo) => normalizarDigitos(campo).includes(buscaDigitos));
}

function pagamentoConfereBuscaLocal(pagamento, busca) {
    const buscaTratada = busca.trim();

    if (!buscaTratada) {
        return true;
    }

    const buscaTexto = normalizarTexto(buscaTratada);
    const buscaDigitos = normalizarDigitos(buscaTratada);
    const camposTexto = [
        String(pagamento.id),
        "pedido " + pagamento.pedidoId,
        "#" + pagamento.pedidoId,
        pagamento.metodo,
        pagamento.status,
        formatarMoeda(pagamento.valor)
    ];

    if (camposTexto.some((campo) => normalizarTexto(campo).includes(buscaTexto))) {
        return true;
    }

    if (!buscaDigitos) {
        return false;
    }

    return [
        String(pagamento.id),
        String(pagamento.pedidoId),
        String(pagamento.valor)
    ].some((campo) => normalizarDigitos(campo).includes(buscaDigitos));
}

function atualizarContextoFiltroPedidos() {
    if (!pedidoClienteFiltro) {
        pedidoFiltroContexto.classList.add("hidden");
        pedidoFiltroContexto.textContent = "";
        return;
    }

    pedidoFiltroContexto.classList.remove("hidden");
    pedidoFiltroContexto.textContent = "Filtrando pedidos de " + pedidoClienteFiltro.nome +
        ". Use Limpar para voltar a todos os pedidos.";
}

function atualizarContextoFiltroSolicitacoes() {
    if (!solicitacaoClienteFiltro) {
        solicitacaoFiltroContexto.classList.add("hidden");
        solicitacaoFiltroContexto.textContent = "";
        return;
    }

    solicitacaoFiltroContexto.classList.remove("hidden");
    solicitacaoFiltroContexto.textContent = "Filtrando solicitacoes de " + solicitacaoClienteFiltro.nome +
        ". Use Limpar para voltar a todas as solicitacoes.";
}

function pedidoPrecisaAcao(pedido) {
    return pedido.status === "pendente" || pedido.status === "pago";
}

function obterTipoAcaoPedido(pedido) {
    if (pedido.status === "pendente") {
        return "pix";
    }

    if (pedido.status === "pago" && (!pedido.transportadora || !pedido.codigoRastreio)) {
        return "rastreio";
    }

    if (pedido.status === "pago") {
        return "envio";
    }

    return "";
}

function obterPrioridadeAcaoPedido(pedido) {
    if (pedido.status === "pendente") {
        return 1;
    }

    if (pedido.status === "pago" && (!pedido.transportadora || !pedido.codigoRastreio)) {
        return 2;
    }

    if (pedido.status === "pago") {
        return 3;
    }

    return 4;
}

function ordenarPedidosPorAcao(pedidos) {
    return [...pedidos].sort((pedidoA, pedidoB) => {
        const prioridadeA = obterPrioridadeAcaoPedido(pedidoA);
        const prioridadeB = obterPrioridadeAcaoPedido(pedidoB);

        if (prioridadeA !== prioridadeB) {
            return prioridadeA - prioridadeB;
        }

        return new Date(pedidoB.criadoEm).getTime() - new Date(pedidoA.criadoEm).getTime();
    });
}

function contarAcoesPedidos(pedidos) {
    return pedidos.reduce((contadores, pedido) => {
        if (pedido.status === "pendente") {
            contadores.pix++;
            return contadores;
        }

        if (pedido.status === "pago" && (!pedido.transportadora || !pedido.codigoRastreio)) {
            contadores.rastreio++;
            return contadores;
        }

        if (pedido.status === "pago") {
            contadores.envio++;
        }

        return contadores;
    }, {
        pix: 0,
        rastreio: 0,
        envio: 0
    });
}

function atualizarResumoListaPedidos(resposta) {
    const resumo = resposta.resumo;
    const acoes = resumo.acoes;
    pedidoListaResumo.textContent = resposta.total + " pedidos encontrados | Total " + formatarMoeda(resumo.valorTotal) +
        " | Pendentes " + resumo.pendentes + " | Pagos " + resumo.pagos +
        " | Enviados " + resumo.enviados + " | Cancelados " + resumo.cancelados +
        " | Pix " + acoes.pix + " | Rastreio " + acoes.rastreio + " | Envio " + acoes.envio;
}

function atualizarResumoListaSolicitacoes(solicitacoes) {
    const quantidade = solicitacoes.length;
    const recebidas = solicitacoes.filter((solicitacao) => solicitacao.status === "recebida").length;
    const emAnalise = solicitacoes.filter((solicitacao) => solicitacao.status === "em_analise").length;
    const abertas = solicitacoes.filter((solicitacao) => {
        return ["recebida", "em_analise", "cotada"].includes(solicitacao.status);
    }).length;
    const cotadas = solicitacoes.filter((solicitacao) => solicitacao.status === "cotada").length;
    const aprovadas = solicitacoes.filter((solicitacao) => solicitacao.status === "aprovada").length;
    const recusadas = solicitacoes.filter((solicitacao) => solicitacao.status === "recusada").length;
    const canceladas = solicitacoes.filter((solicitacao) => solicitacao.status === "cancelada").length;
    const textoQuantidade = quantidade === 1 ? "1 solicitacao listada" : quantidade + " solicitacoes listadas";

    solicitacaoListaResumo.textContent = textoQuantidade + " | Abertas " + abertas +
        " | Recebidas " + recebidas + " | Em analise " + emAnalise +
        " | Cotadas " + cotadas + " | Aprovadas " + aprovadas +
        " | Recusadas " + recusadas + " | Canceladas " + canceladas;
}

function atualizarResumoListaPagamentos(pagamentos) {
    const quantidade = pagamentos.length;
    const total = pagamentos.reduce((soma, pagamento) => soma + Number(pagamento.valor), 0);
    const pix = pagamentos.filter((pagamento) => pagamento.metodo === "pix").length;
    const cartao = pagamentos.filter((pagamento) => pagamento.metodo === "cartao").length;
    const boleto = pagamentos.filter((pagamento) => pagamento.metodo === "boleto").length;
    const textoQuantidade = quantidade === 1 ? "1 pagamento listado" : quantidade + " pagamentos listados";

    pagamentoListaResumo.textContent = textoQuantidade + " | Total aprovado " + formatarMoeda(total) +
        " | Pix " + pix + " | Cartao " + cartao + " | Boleto " + boleto;
}

function atualizarResumoListaProdutos(produtos) {
    const quantidade = produtos.length;
    const publicados = produtos.filter((produto) => produto.publicadoNaLoja).length;
    const internos = quantidade - publicados;
    const estoqueBaixo = produtos.filter((produto) => produto.estoque <= 5).length;
    const semMedidas = produtos.filter(produto => produto.medidasEnvioPendentes?.length > 0).length;
    const estoqueTotal = produtos.reduce((soma, produto) => soma + Number(produto.estoque), 0);
    const valorEstoque = produtos.reduce((soma, produto) => {
        return soma + (Number(produto.preco) * Number(produto.estoque));
    }, 0);
    const textoQuantidade = quantidade === 1 ? "1 produto listado" : quantidade + " produtos listados";

    produtoListaResumo.textContent = textoQuantidade + " | Loja " + publicados +
        " | Internos " + internos + " | Estoque baixo " + estoqueBaixo +
        " | Sem medidas de envio " + semMedidas + " | Itens em estoque " + estoqueTotal + " | Valor estoque " + formatarMoeda(valorEstoque);
}

function atualizarResumoListaClientes(clientes) {
    const quantidade = clientes.length;
    const comWhatsApp = clientes.filter((cliente) => normalizarDigitos(cliente.telefone).length >= 10).length;
    const comEmail = clientes.filter((cliente) => cliente.email).length;
    const enderecoCompleto = clientes.filter(clienteTemEnderecoCompleto).length;
    const textoQuantidade = quantidade === 1 ? "1 cliente listado" : quantidade + " clientes listados";

    clienteListaResumo.textContent = textoQuantidade + " | Com WhatsApp " + comWhatsApp +
        " | Com email " + comEmail + " | Endereco completo " + enderecoCompleto;
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
    const avisoImportacao = solicitacao.produto?.tipoEnvio === "internacional_direto"
        ? " Como esse item vem direto do Japao, frete internacional e possiveis taxas de importacao ficam por conta do cliente."
        : "";

    if (solicitacao.valorCotado) {
        if (solicitacao.produto?.tipoEnvio === "internacional_direto" && solicitacao.freteInternacionalCotado != null) {
            return saudacao + " Sua cotacao para " + solicitacao.nomeProduto +
                " ficou assim: produto " + formatarMoeda(solicitacao.produto.preco) +
                " + frete internacional " + formatarMoeda(solicitacao.freteInternacionalCotado) +
                " = total " + formatarMoeda(solicitacao.valorCotado) +
                "." + avisoImportacao + " Se estiver tudo certo, me confirme por aqui para eu gerar o pedido.";
        }

        return saudacao + " Sua cotacao para " + solicitacao.nomeProduto +
            " ficou em " + formatarMoeda(solicitacao.valorCotado) +
            "." + avisoImportacao + " Se estiver tudo certo, me confirme por aqui para eu gerar o pedido.";
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

function criarCelulaComConteudo(conteudo, className = "") {
    const td = document.createElement("td");

    if (className) {
        td.className = className;
    }

    td.append(conteudo);

    return td;
}

function criarStatusBadge(status, texto = status) {
    const badge = document.createElement("span");
    badge.className = "status-badge status-" + String(status).replace(/_/g, "-");
    badge.textContent = texto;

    return badge;
}

function criarBotao(texto, className = "small-button") {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = className;
    botao.textContent = texto;

    return botao;
}

function criarLinhaStatusSistema(rotulo, valor, destaque = undefined) {
    const linha = document.createElement("div");
    linha.className = "security-status-line";

    const nome = document.createElement("span");
    nome.textContent = rotulo;

    const conteudo = destaque
        ? criarStatusBadge(destaque, valor)
        : document.createElement("strong");

    if (!destaque) {
        conteudo.textContent = valor;
    }

    linha.append(nome, conteudo);
    return linha;
}

function criarItemConfirmacaoPix(rotulo, valor) {
    const item = document.createElement("div");
    const label = document.createElement("span");
    const conteudo = document.createElement("strong");

    label.textContent = rotulo;
    conteudo.textContent = valor || "-";
    item.append(label, conteudo);

    return item;
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
        erro.dados = conteudo;

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
    adminLogado = null;
    localStorage.removeItem("adminToken");
    senhaForm.reset();
    setFeedback(senhaFeedback, "");
    atualizarAdminLogadoInfo();
    loginView.classList.remove("hidden");
    appView.classList.add("hidden");
}

async function mostrarApp() {
    atualizarAdminLogadoInfo();
    loginView.classList.add("hidden");
    appView.classList.remove("hidden");
    await carregarView();
}

function atualizarAdminLogadoInfo() {
    if (!adminLogado) {
        adminLogadoInfo.textContent = "Sessao nao validada.";
        return;
    }

    adminLogadoInfo.textContent = adminLogado.nome + " | " + adminLogado.email;
}

async function carregarSeguranca() {
    sistemaStatus.textContent = "Carregando status...";

    const [saude, info, configuracaoResposta] = await Promise.all([
        apiFetch("/health"),
        apiFetch("/info"),
        apiFetch("/auth/configuracao")
    ]);

    const statusBanco = saude.banco?.status === "ok" ? "ok" : "erro";
    const configuracao = configuracaoResposta.configuracao ?? {};
    appNome = configuracao.app?.nome || appNome;
    document.title = appNome + " Admin";
    document.querySelectorAll("[data-app-name]").forEach((elemento) => {
        elemento.textContent = appNome;
    });
    const pixConfigurado = configuracao.pix?.status === "configurado";
    const freteConfigurado = configuracao.frete?.status === "configurado";
    const ambienteFrete = configuracao.frete?.ambiente ? " (" + configuracao.frete.ambiente + ")" : "";

    sistemaStatus.replaceChildren(
        criarLinhaStatusSistema("API", saude.status === "ok" ? "online" : "erro", saude.status === "ok" ? "aprovado" : "cancelado"),
        criarLinhaStatusSistema("Banco", statusBanco === "ok" ? "ok" : "erro", statusBanco === "ok" ? "aprovado" : "cancelado"),
        criarLinhaStatusSistema("Nome da loja", appNome),
        criarLinhaStatusSistema("Pix manual", pixConfigurado ? "configurado" : "pendente", pixConfigurado ? "aprovado" : "pendente"),
        criarLinhaStatusSistema("Frete", (freteConfigurado ? "configurado" : "pendente") + ambienteFrete, freteConfigurado ? "aprovado" : "pendente"),
        criarLinhaStatusSistema("Latencia banco", String(saude.banco?.latenciaMs ?? "-") + " ms"),
        criarLinhaStatusSistema("Ambiente", info.ambiente ?? saude.ambiente ?? "-"),
        criarLinhaStatusSistema("Versao", info.versao ?? "-"),
        criarLinhaStatusSistema("Tempo online", formatarDuracao(info.uptimeSegundos ?? saude.uptimeSegundos))
    );
}

async function iniciarAdmin() {
    if (!token) {
        mostrarLogin();
        return;
    }

    try {
        setFeedback(loginFeedback, "Validando sessao...");
        const resultado = await apiFetch("/auth/me");
        adminLogado = resultado.admin;
        setFeedback(loginFeedback, "");
        await mostrarApp();
    } catch (erro) {
        if (!erro.sessaoEncerrada) {
            mostrarLogin();
            setFeedback(loginFeedback, erro.message, "error");
        }
    }
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

        if (activeView === "seguranca") {
            await carregarSeguranca();
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

async function recarregarTelaAposAlterarPedido() {
    if (activeView === "dashboard") {
        await carregarDashboard();
        return;
    }

    if (activeView === "pedidos") {
        await carregarPedidos();
        return;
    }

    if (activeView === "pagamentos") {
        await carregarPagamentos();
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

function criarLinhaPedidoAcaoDashboard(pedido) {
    const linha = document.createElement("article");
    linha.className = "dashboard-list-item";

    const info = document.createElement("div");
    const proximaAcao = obterProximaAcaoPedido(pedido);

    const titulo = document.createElement("strong");
    titulo.textContent = "#" + pedido.id + " - " + pedido.cliente.nome;

    const detalhe = document.createElement("p");
    detalhe.className = "muted-cell";
    detalhe.textContent = proximaAcao.texto + " - " + formatarMoeda(pedido.total) +
        " - " + formatarData(pedido.criadoEm);

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
    produtoPublicadoFiltro.value = opcoes.publicadoNaLoja ?? "";
    produtoTipoEnvioFiltro.value = opcoes.tipoEnvio ?? "";
    produtoEstoqueBaixoFiltro.checked = opcoes.estoqueBaixo === true;
    await carregarView();
}

async function irParaClientesDashboard() {
    trocarView("clientes");
    clienteFiltrosForm.reset();
    await carregarView();
}

async function irParaPedidosDashboard(status = "") {
    pedidoPaginaAtual = 1;
    trocarView("pedidos");
    pedidoFiltrosForm.reset();
    pedidoClienteFiltro = null;
    pedidoStatusFiltro.value = status;
    pedidoPrecisaAcaoFiltro.checked = false;
    pedidoAcaoFiltro.value = "";
    await carregarView();
}

async function irParaPedidosComAcaoDashboard() {
    pedidoPaginaAtual = 1;
    trocarView("pedidos");
    pedidoFiltrosForm.reset();
    pedidoClienteFiltro = null;
    pedidoStatusFiltro.value = "";
    pedidoPrecisaAcaoFiltro.checked = true;
    pedidoAcaoFiltro.value = "";
    await carregarView();
}

async function irParaPedidosPorTipoAcaoDashboard(tipoAcao) {
    pedidoPaginaAtual = 1;
    trocarView("pedidos");
    pedidoFiltrosForm.reset();
    pedidoClienteFiltro = null;
    pedidoStatusFiltro.value = "";
    pedidoPrecisaAcaoFiltro.checked = true;
    pedidoAcaoFiltro.value = tipoAcao;
    await carregarView();
}

async function irParaPagamentosDashboard() {
    trocarView("pagamentos");
    pagamentoFiltrosForm.reset();
    await carregarView();
}

async function irParaSolicitacoesDashboard(status = "") {
    trocarView("solicitacoes");
    solicitacaoClienteFiltro = null;
    solicitacaoBuscaFiltro.value = "";
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

function criarPainelResumoAcoesDashboard(pedidos, totaisAcoes = undefined) {
    const painel = document.createElement("section");
    painel.className = "dashboard-panel";

    const heading = document.createElement("h2");
    heading.textContent = "Resumo da fila";

    const acoes = totaisAcoes ?? contarAcoesPedidos(pedidos);
    const total = acoes.total ?? (acoes.pix + acoes.rastreio + acoes.envio);
    const lista = document.createElement("div");
    lista.className = "dashboard-actions";

    const atalhos = [
        ["Pix " + acoes.pix, () => irParaPedidosPorTipoAcaoDashboard("pix")],
        ["Rastreio " + acoes.rastreio, () => irParaPedidosPorTipoAcaoDashboard("rastreio")],
        ["Envio " + acoes.envio, () => irParaPedidosPorTipoAcaoDashboard("envio")],
        ["Todos " + total, irParaPedidosComAcaoDashboard]
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
    const pedidosComAcao = ordenarPedidosPorAcao(resumo.pedidosComAcao ?? []);

    dashboardAlerts.replaceChildren(
        criarPainelDashboard(
            "Fila de acoes",
            pedidosComAcao,
            criarLinhaPedidoAcaoDashboard,
            "Nenhum pedido precisando de acao."
        ),
        criarPainelResumoAcoesDashboard(pedidosComAcao, resumo.pedidos.acoes),
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
        criarStat("Precisam acao", resumo.pedidos.acoes?.total ?? (resumo.pedidos.pendentes + resumo.pedidos.pagos), {
            textoAcao: "Abrir fila",
            acao: irParaPedidosComAcaoDashboard
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

function criarCelulaMedidasProduto(produto) {
    const pendentes = produto.medidasEnvioPendentes ?? [];
    const wrapper = document.createElement("div");
    wrapper.append(criarStatusBadge(
        pendentes.length ? "incompleto" : "aprovado",
        pendentes.length ? "Completar medidas" : "Medidas completas"
    ));
    const detalhe = document.createElement("p");
    detalhe.className = "muted-cell";
    if (pendentes.length) {
        const nomes = { pesoKg: "peso", alturaCm: "altura", larguraCm: "largura", comprimentoCm: "comprimento" };
        detalhe.textContent = "Falta: " + pendentes.map(campo => nomes[campo] ?? campo).join(", ");
        const completar = criarBotao("Completar medidas");
        completar.addEventListener("click", () => {
            abrirModalProduto(produto);
            produtoEditForm.elements[pendentes[0]]?.focus();
        });
        wrapper.append(detalhe, completar);
    } else {
        detalhe.textContent = produto.pesoKg + " kg | " + produto.alturaCm + " × " + produto.larguraCm + " × " + produto.comprimentoCm + " cm (A × L × C)";
        wrapper.append(detalhe);
    }
    return criarCelulaComConteudo(wrapper);
}

function criarCelulaTipoEnvioProduto(produto) {
    const internacional = produto.tipoEnvio === "internacional_direto";
    const wrapper = document.createElement("div");
    wrapper.append(criarStatusBadge(
        internacional ? "interno" : "publicado",
        internacional ? "Direto do Japao" : "Pronta entrega"
    ));
    const detalhe = document.createElement("p");
    detalhe.className = "muted-cell";
    detalhe.textContent = internacional ? "Solicitacao/cotacao" : "Carrinho com frete nacional";
    wrapper.append(detalhe);
    return criarCelulaComConteudo(wrapper);
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
    actions.append(editar, foto);

    if (produto.imagemUrl) {
        const removerFoto = criarBotao("Remover foto");
        removerFoto.addEventListener("click", () => removerFotoProduto(produto));
        actions.append(removerFoto);
    }

    actions.append(excluir);

    const tdActions = document.createElement("td");
    tdActions.append(actions);

    tr.append(
        criarCelula(produto.id),
        criarCelulaFotoProduto(produto),
        criarCelula(produto.nome),
        criarCelula(formatarMoeda(produto.preco)),
        criarCelula(produto.estoque),
        criarCelulaComConteudo(
            criarStatusBadge(
                produto.publicadoNaLoja ? "publicado" : "interno",
                produto.publicadoNaLoja ? "Publicado" : "Interno"
            )
        ),
        criarCelulaTipoEnvioProduto(produto),
        criarCelulaMedidasProduto(produto),
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

async function removerFotoProduto(produto) {
    const confirmou = window.confirm("Remover a foto de " + produto.nome + "?");

    if (!confirmou) {
        return;
    }

    await apiFetch(`/produtos/${produto.id}/imagem`, {
        method: "DELETE"
    });

    setFeedback(appFeedback, "Foto do produto removida", "success");
    await carregarProdutos();
}

function abrirModalProduto(produto) {
    produtoEditId.value = String(produto.id);
    produtoEditNome.value = produto.nome;
    produtoEditPreco.value = String(produto.preco);
    for (const campo of ["pesoKg", "alturaCm", "larguraCm", "comprimentoCm"]) {
        produtoEditForm.elements[campo].value = produto[campo] ?? "";
    }
    produtoEditEstoque.value = String(produto.estoque);
    produtoEditPublicadoNaLoja.checked = produto.publicadoNaLoja;
    produtoEditTipoEnvio.value = produto.tipoEnvio ?? "nacional";
    travarScrollPagina();
    produtoModal.classList.remove("hidden");
    produtoEditNome.focus();
}

function fecharModalProduto() {
    produtoEditForm.reset();
    produtoModal.classList.add("hidden");
    liberarScrollPagina();
}

async function carregarProdutos() {
    const parametros = new URLSearchParams({ limite: "50" });
    const nome = produtoNomeFiltro.value.trim();
    const publicadoNaLoja = produtoPublicadoFiltro.value;
    const tipoEnvio = produtoTipoEnvioFiltro.value;

    if (nome) {
        parametros.set("nome", nome);
    }

    if (publicadoNaLoja) {
        parametros.set("publicadoNaLoja", publicadoNaLoja);
    }

    if (tipoEnvio) {
        parametros.set("tipoEnvio", tipoEnvio);
    }

    if (produtoEstoqueBaixoFiltro.checked) {
        parametros.set("estoqueBaixo", "true");
    }

    if (produtoMedidasIncompletasFiltro.checked) {
        parametros.set("medidasIncompletas", "true");
    }

    const resposta = await apiFetch("/produtos?" + parametros.toString());
    const produtos = obterListaPaginada(resposta);

    produtosTbody.replaceChildren(
        ...(produtos.length > 0 ? produtos.map(criarLinhaProduto) : [criarLinhaVazia(9, "Nenhum produto encontrado")])
    );

    atualizarResumoListaProdutos(produtos);
}

async function preencherProdutoPorSolicitacao(solicitacao) {
    produtoOrigemSolicitacao = solicitacao;
    trocarView("produtos");
    await carregarView();
    produtoNome.value = solicitacao.nomeProduto;
    produtoPreco.value = String(solicitacao.valorCotado ?? "");
    produtoEstoque.value = "";
    produtoPublicadoNaLoja.checked = false;
    produtoTipoEnvio.value = "internacional_direto";
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

    if (solicitacao.freteInternacionalCotado != null) {
        partes.push("Frete internacional: " + formatarMoeda(solicitacao.freteInternacionalCotado));
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
    pedidoTipoEnvio.value = produtoEncontrado.tipoEnvio === "internacional_direto" ? "internacional_direto" : "nacional";
    pedidoFreteInternacional.value = String(
        solicitacao.freteInternacionalCotado ??
        (produtoEncontrado.tipoEnvio === "internacional_direto"
            ? Math.max(Number(solicitacao.valorCotado) - Number(produtoEncontrado.preco), 0)
            : 0)
    );
    atualizarTipoEnvioPedido();
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
    const confirmou = window.confirm(
        "Excluir " + produto.nome + "?\n\n" +
        "Se este produto ja tiver pedidos vinculados, o sistema vai bloquear a exclusao. " +
        "Nesse caso, edite o produto e desmarque Publicado na loja."
    );

    if (!confirmou) {
        return;
    }

    try {
        await apiFetch(`/produtos/${produto.id}`, {
            method: "DELETE"
        });

        setFeedback(appFeedback, "Produto removido", "success");
        invalidarDadosFormularioPedido();
        await carregarProdutos();
    } catch (erro) {
        const mensagem = erro.status === 409
            ? erro.message + " Use Editar e desmarque Publicado na loja."
            : erro.message;

        setFeedback(appFeedback, mensagem, "error");
    }
}

function criarCelulaEnderecoCliente(cliente) {
    const endereco = formatarEnderecoCliente(cliente);
    const faltando = obterCamposEnderecoFaltando(cliente);
    const wrapper = document.createElement("div");
    wrapper.className = "cliente-endereco";

    const texto = document.createElement("span");
    texto.textContent = endereco || "Endereco nao informado";
    wrapper.append(texto);

    if (faltando.length > 0) {
        const aviso = criarStatusBadge("incompleto", "Endereco incompleto");
        const detalhe = document.createElement("small");
        detalhe.textContent = "Falta: " + faltando.join(", ");
        wrapper.append(aviso, detalhe);
    }

    return criarCelulaComConteudo(wrapper);
}

function criarLinhaCliente(cliente) {
    const tr = document.createElement("tr");
    const enderecoIncompleto = !clienteTemEnderecoCompleto(cliente);
    const actions = document.createElement("div");
    actions.className = "actions";

    if (enderecoIncompleto) {
        tr.classList.add("linha-alerta");
    }

    const editar = criarBotao(enderecoIncompleto ? "Completar endereco" : "Editar");
    const excluir = criarBotao("Excluir", "small-button danger-button");
    const whatsapp = criarLinkWhatsApp(cliente.telefone, "Ola, " + cliente.nome + ". Aqui e da " + appNome + ".");

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
        criarCelulaEnderecoCliente(cliente),
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
    let clientes = obterListaPaginada(resposta);

    if (clienteEnderecoIncompletoFiltro.checked) {
        clientes = clientes.filter((cliente) => !clienteTemEnderecoCompleto(cliente));
    }

    clientesTbody.replaceChildren(
        ...(clientes.length > 0 ? clientes.map(criarLinhaCliente) : [criarLinhaVazia(5, "Nenhum cliente encontrado")])
    );

    atualizarResumoListaClientes(clientes);
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

function agendarBuscaSolicitacoes() {
    window.clearTimeout(solicitacaoFiltroTimer);

    solicitacaoFiltroTimer = window.setTimeout(async () => {
        if (activeView === "solicitacoes") {
            await carregarSolicitacoes();
        }
    }, 350);
}

function esconderHistoricoCliente() {
    consultaClienteResumoAtual++;
    clienteHistoricoResumo.classList.add("hidden");
    clienteHistoricoResumo.replaceChildren();
}

function criarCardPedidoCliente(pedido) {
    const card = document.createElement("article");
    card.className = "cliente-pedido-card";

    const info = document.createElement("div");

    const titulo = document.createElement("strong");
    titulo.textContent = "Pedido #" + pedido.id;

    const detalhe = document.createElement("p");
    detalhe.className = "muted-cell";
    detalhe.textContent = pedido.status + " - " + formatarMoeda(pedido.total) + " - " + formatarData(pedido.criadoEm);

    info.append(titulo, detalhe);

    const abrir = criarBotao("Ver pedido");
    abrir.addEventListener("click", async () => {
        fecharModalCliente();
        await irParaPedido(pedido.id);
    });

    card.append(info, abrir);

    return card;
}

async function irParaSolicitacoesDoCliente(clienteId, clienteNome, status = "") {
    solicitacaoClienteFiltro = {
        id: clienteId,
        nome: clienteNome || "Cliente #" + clienteId
    };
    solicitacaoBuscaFiltro.value = "";
    solicitacaoStatusFiltro.value = status;
    trocarView("solicitacoes");
    await carregarView();
}

function criarCardSolicitacaoCliente(solicitacao, clienteId, clienteNome) {
    const card = document.createElement("article");
    card.className = "cliente-pedido-card";

    const info = document.createElement("div");

    const titulo = document.createElement("strong");
    titulo.textContent = "Solicitacao #" + solicitacao.id;

    const detalhe = document.createElement("p");
    detalhe.className = "muted-cell";
    detalhe.textContent = solicitacao.status + " - " + solicitacao.nomeProduto + " - " + formatarData(solicitacao.criadoEm);

    if (solicitacao.valorCotado) {
        detalhe.textContent += " - " + formatarMoeda(solicitacao.valorCotado);
    }

    info.append(titulo, detalhe);

    const abrir = criarBotao("Ver na lista");
    abrir.addEventListener("click", async () => {
        fecharModalCliente();
        await irParaSolicitacoesDoCliente(clienteId, clienteNome, solicitacao.status);
    });

    card.append(info, abrir);

    return card;
}

function criarGrupoResumoCliente(tituloTexto, vazioTexto, itens, criarCard, opcoes = {}) {
    const grupo = document.createElement("section");
    grupo.className = "cliente-resumo-grupo";

    const cabecalho = document.createElement("div");
    cabecalho.className = "cliente-resumo-grupo-cabecalho";

    const titulo = document.createElement("h4");
    titulo.textContent = tituloTexto;
    cabecalho.append(titulo);

    if (itens.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "muted-cell";
        vazio.textContent = vazioTexto;
        grupo.append(cabecalho, vazio);
        return grupo;
    }

    if (opcoes.textoAcao && opcoes.acao) {
        const botao = criarBotao(opcoes.textoAcao);
        botao.addEventListener("click", opcoes.acao);
        cabecalho.append(botao);
    }

    const lista = document.createElement("div");
    lista.className = "cliente-pedidos-lista";
    lista.replaceChildren(...itens.map((item) => criarCard(item)));

    grupo.append(cabecalho, lista);

    return grupo;
}

function criarMetricaCliente(rotulo, valor) {
    const card = document.createElement("article");
    card.className = "cliente-metrica-card";

    const titulo = document.createElement("span");
    titulo.textContent = rotulo;

    const numero = document.createElement("strong");
    numero.textContent = valor;

    card.append(titulo, numero);

    return card;
}

function criarMetricasCliente(pedidos, solicitacoes) {
    const faturados = pedidos.filter((pedido) => {
        return pedido.status === "pago" || pedido.status === "enviado";
    });

    const totalConfirmado = faturados.reduce((soma, pedido) => soma + Number(pedido.total), 0);
    const pedidosAbertos = pedidos.filter((pedido) => pedido.status === "pendente").length;
    const solicitacoesAbertas = solicitacoes.filter((solicitacao) => {
        return ["recebida", "em_analise", "cotada"].includes(solicitacao.status);
    }).length;

    const metricas = document.createElement("div");
    metricas.className = "cliente-metricas-grid";
    metricas.append(
        criarMetricaCliente("Pedidos", String(pedidos.length)),
        criarMetricaCliente("Faturamento confirmado", formatarMoeda(totalConfirmado)),
        criarMetricaCliente("Pedidos em aberto", String(pedidosAbertos)),
        criarMetricaCliente("Solicitacoes abertas", String(solicitacoesAbertas))
    );

    return metricas;
}

async function irParaPedidosDoCliente(clienteId, clienteNome) {
    pedidoPaginaAtual = 1;
    pedidoClienteFiltro = {
        id: clienteId,
        nome: clienteNome || "Cliente #" + clienteId
    };
    pedidoFiltrosForm.reset();
    trocarView("pedidos");
    await carregarView();
}

function criarCabecalhoHistoricoCliente(clienteId, clienteNome, totalPedidos) {
    const cabecalho = document.createElement("div");
    cabecalho.className = "cliente-historico-cabecalho";

    const titulo = document.createElement("h3");
    titulo.textContent = "Historico do cliente";

    cabecalho.append(titulo);

    if (totalPedidos > 0) {
        const botao = criarBotao("Ver todos os pedidos");
        botao.addEventListener("click", async () => {
            fecharModalCliente();
            await irParaPedidosDoCliente(clienteId, clienteNome);
        });
        cabecalho.append(botao);
    }

    return cabecalho;
}

function renderizarResumoCliente(clienteId, clienteNome, pedidos, solicitacoes) {
    const cabecalho = criarCabecalhoHistoricoCliente(clienteId, clienteNome, pedidos.length);

    const pedidosRecentes = pedidos
        .slice()
        .sort((pedidoA, pedidoB) => new Date(pedidoB.criadoEm) - new Date(pedidoA.criadoEm))
        .slice(0, 5);

    const solicitacoesRecentes = solicitacoes
        .slice()
        .sort((solicitacaoA, solicitacaoB) => new Date(solicitacaoB.criadoEm) - new Date(solicitacaoA.criadoEm))
        .slice(0, 5);

    const grupos = document.createElement("div");
    grupos.className = "cliente-resumo-grid";
    grupos.append(
        criarGrupoResumoCliente("Pedidos recentes", "Nenhum pedido encontrado para este cliente.", pedidosRecentes, criarCardPedidoCliente),
        criarGrupoResumoCliente(
            "Solicitacoes recentes",
            "Nenhuma solicitacao encontrada para este cliente.",
            solicitacoesRecentes,
            (solicitacao) => criarCardSolicitacaoCliente(solicitacao, clienteId, clienteNome),
            {
                textoAcao: "Ver todas",
                acao: async () => {
                    fecharModalCliente();
                    await irParaSolicitacoesDoCliente(clienteId, clienteNome);
                }
            }
        )
    );

    clienteHistoricoResumo.replaceChildren(cabecalho, criarMetricasCliente(pedidos, solicitacoes), grupos);
}

async function carregarHistoricoCliente(clienteId, clienteNome) {
    const consulta = ++consultaClienteResumoAtual;
    clienteHistoricoResumo.classList.remove("hidden");
    clienteHistoricoResumo.replaceChildren();

    const carregando = document.createElement("p");
    carregando.className = "muted-cell";
    carregando.textContent = "Carregando historico do cliente...";
    clienteHistoricoResumo.append(carregando);

    try {
        const [pedidosResposta, solicitacoesResposta] = await Promise.all([
            apiFetch("/pedidos/cliente/" + clienteId + "?limite=50"),
            apiFetch("/solicitacoes/cliente/" + clienteId + "?limite=50")
        ]);

        if (consulta !== consultaClienteResumoAtual) {
            return;
        }

        renderizarResumoCliente(
            clienteId,
            clienteNome,
            obterListaPaginada(pedidosResposta),
            obterListaPaginada(solicitacoesResposta)
        );
    } catch (erro) {
        if (consulta !== consultaClienteResumoAtual) {
            return;
        }

        const mensagem = document.createElement("p");
        mensagem.className = "feedback error";
        mensagem.textContent = "Nao foi possivel carregar o historico: " + erro.message;
        clienteHistoricoResumo.replaceChildren(mensagem);
    }
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
    travarScrollPagina();
    clienteModal.classList.remove("hidden");
    atualizarLinkWhatsAppCliente();
    void carregarHistoricoCliente(cliente.id, cliente.nome);
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
    esconderHistoricoCliente();
    travarScrollPagina();
    clienteModal.classList.remove("hidden");
    atualizarLinkWhatsAppCliente();
    (clienteEditNome.value && clienteEditTelefone.value ? clienteEditCep : clienteEditNome).focus();
}

function fecharModalCliente() {
    cancelarBuscaCepCliente();
    esconderHistoricoCliente();
    clienteCepAtual = "";
    clienteOrigemSolicitacaoId = null;
    mostrarFeedbackCepCliente("");
    clienteEditForm.reset();
    clienteWhatsAppLink.classList.add("hidden");
    clienteWhatsAppLink.removeAttribute("href");
    clienteModal.classList.add("hidden");
    liberarScrollPagina();
}

async function editarCliente(cliente) {
    abrirModalCliente(cliente);
}

async function excluirCliente(cliente) {
    const confirmou = window.confirm(
        "Excluir " + cliente.nome + "?\n\n" +
        "Se este cliente ja tiver pedidos ou solicitacoes vinculadas, o sistema vai bloquear a exclusao para preservar o historico."
    );

    if (!confirmou) {
        return;
    }

    try {
        await apiFetch(`/clientes/${cliente.id}`, {
            method: "DELETE"
        });

        setFeedback(appFeedback, "Cliente removido", "success");
        invalidarDadosFormularioPedido();
        await carregarClientes();
    } catch (erro) {
        const mensagem = erro.status === 409
            ? erro.message + " O cadastro pode continuar ativo para consulta."
            : erro.message;

        setFeedback(appFeedback, mensagem, "error");
    }
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

function criarWhatsAppPedido(pedido, cliente) {
    const secao = criarSecaoPedido("WhatsApp");
    const pedidoComCliente = {
        ...pedido,
        cliente
    };
    const telefone = obterTelefoneContatoPedido(pedidoComCliente);

    if (!telefone) {
        const aviso = document.createElement("p");
        aviso.textContent = "Telefone do pedido nao disponivel.";
        secao.append(aviso);
        return secao;
    }

    const actions = document.createElement("div");
    actions.className = "pedido-whatsapp-actions";

    function adicionarMensagem(texto, etapa) {
        const mensagem = montarMensagemWhatsAppPedidoEtapa(pedidoComCliente, etapa);
        const grupo = document.createElement("div");
        grupo.className = "message-action";
        const link = criarLinkWhatsApp(
            telefone,
            mensagem
        );

        if (link) {
            link.textContent = texto;
            grupo.append(link);
        }

        const copiar = criarBotao("Copiar");
        copiar.addEventListener("click", async () => {
            try {
                await copiarTexto(mensagem);
                setFeedback(pedidoFeedback, "Mensagem copiada.", "success");
            } catch {
                setFeedback(pedidoFeedback, "Nao foi possivel copiar a mensagem.", "error");
            }
        });
        grupo.append(copiar);

        if (grupo.children.length > 0) {
            actions.append(grupo);
        }
    }

    if (pedido.status === "pendente" && pedido.pix?.chave && pedido.pix?.recebedor) {
        adicionarMensagem("Enviar dados Pix", "pix");
    }

    if (pedido.status === "pago" || pedido.status === "enviado") {
        adicionarMensagem("Enviar pagamento aprovado", "pagamento");
    }

    if (pedido.transportadora && pedido.codigoRastreio) {
        adicionarMensagem("Enviar rastreio", "rastreio");
    }

    adicionarMensagem("Enviar status atual", "status");

    if (actions.children.length === 0) {
        const aviso = document.createElement("p");
        aviso.textContent = "Telefone invalido para WhatsApp.";
        secao.append(aviso);
        return secao;
    }

    secao.append(actions);
    return secao;
}

function criarRastreioPedido(pedido) {
    const secao = criarSecaoPedido("Rastreio do envio");
    if (pedido.freteTransportadora && pedido.freteServico) {
        secao.append(criarDetalhePedido(
            "Entrega escolhida pelo cliente",
            pedido.freteTransportadora + " / " + pedido.freteServico + " - " + formatarMoeda(pedido.freteValor) +
                (pedido.freteAmbiente === "sandbox" ? " (SIMULAÇÃO)" : "")
        ));
    }
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
    // O rastreio salvo tem prioridade sobre a transportadora da cotação.
    const transportadora = criarCampo("Transportadora do envio", pedido.transportadora || pedido.freteTransportadora);
    transportadora.name = "transportadora";
    const codigo = criarCampo("Código de rastreio", pedido.codigoRastreio);
    codigo.name = "codigoRastreio";
    const aviso = document.createElement("p");
    aviso.className = "field-wide";
    aviso.textContent = "A cotação não emite a etiqueta. Após a postagem, informe o código e salve o rastreio antes de marcar como enviado. " +
        (pedido.freteTransportadora ? "A transportadora foi preenchida automaticamente; confira e corrija se necessário. " : "Informe também a transportadora. ") +
        "O frete escolhido pelo cliente permanece registrado no pedido.";
    const mensagem = document.createElement("p");
    mensagem.className = "feedback";
    mensagem.setAttribute("role", "status");
    const salvar = criarBotao("Salvar rastreio");
    salvar.type = "submit";
    const acoesEnvio = document.createElement("div");
    acoesEnvio.className = "actions field-wide";
    let operacaoEmAndamento = false;
    let marcarEnviado;
    let transportadoraSalva = pedido.transportadora ?? "";
    let codigoSalvo = pedido.codigoRastreio ?? "";
    const avisoAlteracoes = document.createElement("p");
    avisoAlteracoes.className = "feedback field-wide";
    avisoAlteracoes.setAttribute("role", "status");

    function rastreioAlterado() {
        return transportadora.value.trim() !== transportadoraSalva || codigo.value.trim() !== codigoSalvo;
    }

    function atualizarAcoesRastreio() {
        salvar.disabled = operacaoEmAndamento;
        transportadora.disabled = operacaoEmAndamento;
        codigo.disabled = operacaoEmAndamento;
        if (marcarEnviado) marcarEnviado.disabled = operacaoEmAndamento || rastreioAlterado();
        avisoAlteracoes.textContent = marcarEnviado && rastreioAlterado()
            ? "Salve as alterações do rastreio antes de marcar como enviado." : "";
        atualizarLinkRastreio();
    }
    for (const campo of [transportadora, codigo]) {
        campo.addEventListener("input", atualizarAcoesRastreio);
        campo.addEventListener("change", atualizarAcoesRastreio);
    }

    if (pedido.status === "pago" && pedido.transportadora && pedido.codigoRastreio) {
        marcarEnviado = criarBotao("Marcar como enviado");
        marcarEnviado.addEventListener("click", async () => {
            if (operacaoEmAndamento || rastreioAlterado()) return;

            const confirmou = window.confirm(
                "Marcar o pedido #" + pedido.id + " como enviado? " +
                "Confira se o rastreio salvo esta correto antes de continuar."
            );

            if (!confirmou) return;

            operacaoEmAndamento = true;
            atualizarAcoesRastreio();
            setFeedback(mensagem, "Marcando pedido como enviado...");

            try {
                await apiFetch("/pedidos/" + pedido.id + "/status", {
                    method: "PATCH",
                    body: JSON.stringify({ status: "enviado" })
                });

                await recarregarTelaAposAlterarPedido();

                await carregarDetalhesPedidoNoModal(pedido.id, consultaPedidoAtual);
                setFeedback(appFeedback, "Pedido #" + pedido.id + " marcado como enviado.", "success");
            } catch (erro) {
                setFeedback(mensagem, erro.message, "error");
            } finally {
                operacaoEmAndamento = false;
                atualizarAcoesRastreio();
            }
        });
        acoesEnvio.append(marcarEnviado);
    }

    atualizarAcoesRastreio();
    form.append(
        aviso,
        avisoAlteracoes,
        links,
        salvar,
        ...(acoesEnvio.children.length > 0 ? [acoesEnvio] : []),
        mensagem
    );
    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        if (operacaoEmAndamento) return;
        if (!transportadora.value.trim() || !codigo.value.trim()) {
            setFeedback(mensagem, "Informe a transportadora e o código.", "error");
            return;
        }
        operacaoEmAndamento = true;
        atualizarAcoesRastreio();
        setFeedback(mensagem, "Salvando rastreio...");
        try {
            const atualizado = await apiFetch("/pedidos/" + pedido.id + "/rastreio", {
                method: "PATCH",
                body: JSON.stringify({
                    transportadora: transportadora.value.trim(),
                    codigoRastreio: codigo.value.trim()
                })
            });
            transportadoraSalva = atualizado.transportadora;
            codigoSalvo = atualizado.codigoRastreio;
            transportadora.value = transportadoraSalva;
            codigo.value = codigoSalvo;
            atualizarLinkRastreio();
            setFeedback(mensagem, "Rastreio salvo.", "success");

            await recarregarTelaAposAlterarPedido();

            await carregarDetalhesPedidoNoModal(pedido.id, consultaPedidoAtual);
        } catch (erro) {
            setFeedback(mensagem, erro.message, "error");
        } finally {
            operacaoEmAndamento = false;
            atualizarAcoesRastreio();
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
        criarDetalhePedido('Tipo de envio', pedido.tipoEnvio === 'internacional_direto' ? 'Envio internacional direto' : 'Pronta entrega Brasil'),
        criarDetalhePedido('Taxas de importacao', pedido.tipoEnvio === 'internacional_direto' ? 'Responsabilidade do cliente' : '-'),
        criarDetalhePedido('Criado em', formatarData(pedido.criadoEm)),
        criarDetalhePedido('Produtos', formatarMoeda(pedido.subtotalProdutos)),
        criarDetalhePedido('Frete', pedido.tipoEnvio === 'internacional_direto' ? formatarMoeda(pedido.freteValor) + ' - frete internacional combinado' : (pedido.freteServico ? formatarMoeda(pedido.freteValor) + ' - ' + pedido.freteTransportadora + ' / ' + pedido.freteServico : 'Nao registrado (pedido anterior ao frete automatico)')),
        criarDetalhePedido('Prazo de transporte', pedido.fretePrazoDias == null ? '-' : pedido.fretePrazoDias + ' dias uteis apos postagem'),
        criarDetalhePedido('Cotacao', pedido.freteAmbiente === 'sandbox' ? 'Simulacao de frete' : 'Real / anterior'),
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

    const acompanhamentoActions = document.createElement("div");
    acompanhamentoActions.className = "actions";

    const linkAcompanhamento = document.createElement("a");
    linkAcompanhamento.className = "small-button";
    linkAcompanhamento.href = montarLinkAcompanhamentoPedido(pedido.id);
    linkAcompanhamento.target = "_blank";
    linkAcompanhamento.rel = "noopener noreferrer";
    linkAcompanhamento.textContent = "Abrir acompanhamento";

    const copiarLink = criarBotao("Copiar link");
    copiarLink.addEventListener("click", async () => {
        try {
            await copiarTexto(montarLinkAcompanhamentoPedido(pedido.id));
            setFeedback(pedidoFeedback, "Link de acompanhamento copiado.", "success");
        } catch (erro) {
            setFeedback(pedidoFeedback, "Nao foi possivel copiar o link.", "error");
        }
    });

    acompanhamentoActions.append(linkAcompanhamento, copiarLink);
    entrega.append(acompanhamentoActions);

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
    if (pedido.status === "pendente") {
        const confirmarPix = criarBotao("Confirmar recebimento do Pix");
        confirmarPix.addEventListener("click", () => abrirModalConfirmacaoPix(pedido, null, pedido.id));
        financeiro.append(confirmarPix);
    }
    const observacao = criarSecaoPedido('Observação');
    const texto = document.createElement('p');
    texto.textContent = pedido.observacao || 'Nenhuma observação.';
    observacao.append(texto);
    pedidoConteudo.replaceChildren(
        resumo,
        entrega,
        criarWhatsAppPedido(pedido, cliente),
        criarRastreioPedido(pedido),
        criarHistoricoPedido(pedido),
        itens,
        financeiro,
        observacao
    );
}

async function carregarDetalhesPedidoNoModal(pedidoId, consulta) {
    setFeedback(pedidoFeedback, 'Carregando detalhes...');
    pedidoConteudo.setAttribute('aria-busy', 'true');

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

async function abrirModalPedido(pedidoId) {
    const consulta = ++consultaPedidoAtual;
    pedidoTitulo.textContent = 'Pedido #' + pedidoId;
    pedidoConteudo.replaceChildren();
    travarScrollPagina();
    pedidoModal.showModal();
    pedidoFechar.focus();
    await carregarDetalhesPedidoNoModal(pedidoId, consulta);
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
    liberarScrollPagina();
});

pixConfirmacaoCancelar.addEventListener("click", () => pixModal.close());
pixConfirmacaoForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    await registrarPagamentoPedido();
});
pixModal.addEventListener("cancel", (evento) => {
    if (pixConfirmacaoConfirmar.disabled) {
        evento.preventDefault();
    }
});
pixModal.addEventListener("close", () => {
    pixConfirmacaoPedido = null;
    pixConfirmacaoActions = null;
    pixConfirmacaoPedidoDetalheId = null;
    pixConfirmacaoDados.replaceChildren();
    pixConfirmacaoConfirmar.disabled = false;
    pixConfirmacaoCancelar.disabled = false;
    setFeedback(pixConfirmacaoFeedback, "");
    if (!pedidoModal.open) {
        liberarScrollPagina();
    }
});

function criarCelulaClientePedido(pedido) {
    const td = criarCelula("", "pedido-cliente-cell");
    const botao = criarBotao(pedido.cliente ? pedido.cliente.nome : "Cliente #" + pedido.clienteId);
    botao.classList.add("pedido-cliente-botao");
    botao.addEventListener("click", () => abrirClientePorId(pedido.clienteId));
    td.append(botao);

    return td;
}

function obterProximaAcaoPedido(pedido) {
    if (pedido.status === "pendente") {
        return {
            texto: "Confirmar Pix",
            detalhe: "Aguardando comprovante ou conferencia na conta.",
            status: "pendente",
            prioridade: "pix"
        };
    }

    if (pedido.status === "pago") {
        if (pedido.transportadora && pedido.codigoRastreio) {
            return {
                texto: "Marcar enviado",
                detalhe: "Rastreio salvo. Falta atualizar o status.",
                status: "pago",
                prioridade: "envio"
            };
        }

        return {
            texto: "Informar rastreio",
            detalhe: pedido.freteTransportadora
                ? "Entrega: " + pedido.freteTransportadora + (pedido.freteServico ? " / " + pedido.freteServico : "") + ". Falta salvar o código de rastreio."
                : "Pagamento confirmado. Falta transportadora e codigo.",
            status: "cotada",
            prioridade: "rastreio"
        };
    }

    if (pedido.status === "enviado") {
        return {
            texto: "Acompanhar entrega",
            detalhe: pedido.codigoRastreio ? pedido.codigoRastreio : "Pedido ja saiu para envio.",
            status: "enviado",
            prioridade: "ok"
        };
    }

    return {
        texto: "Encerrado",
        detalhe: "Pedido cancelado.",
        status: "cancelado",
        prioridade: "ok"
    };
}

function criarCelulaProximaAcaoPedido(pedido) {
    const proximaAcao = obterProximaAcaoPedido(pedido);
    const wrapper = document.createElement("div");
    wrapper.className = "pedido-proxima-acao";
    wrapper.title = proximaAcao.detalhe;

    const badge = criarStatusBadge(proximaAcao.status, proximaAcao.texto);

    wrapper.append(badge);
    return criarCelulaComConteudo(wrapper);
}

function criarCelulaObservacaoPedido(pedido) {
    const observacao = pedido.observacao ?? "";

    if (!observacao.trim()) {
        return criarCelula("-", "pedido-observacao-cell muted-cell");
    }

    const preview = document.createElement("p");
    preview.className = "pedido-observacao-preview";
    preview.textContent = observacao;
    preview.title = observacao;

    return criarCelulaComConteudo(preview, "pedido-observacao-cell");
}

function criarLinhaPedido(pedido) {
    const tr = document.createElement("tr");
    const proximaAcao = obterProximaAcaoPedido(pedido);
    const actions = document.createElement("div");
    actions.className = "actions";

    if (pedidoPrecisaAcao(pedido)) {
        tr.classList.add("pedido-linha-acao", "pedido-linha-" + proximaAcao.prioridade);
    }

    const detalhes = criarBotao("Detalhes", "small-button");
    detalhes.addEventListener("click", () => abrirModalPedido(pedido.id));
    actions.append(detalhes);

    function adicionarAcao(texto, status, classe = "small-button") {
        const botao = criarBotao(texto, classe);
        botao.addEventListener("click", () => atualizarStatusPedido(pedido.id, status, actions));
        actions.append(botao);
    }

    if (pedido.status === "pendente") {
        const registrarPagamento = criarBotao("Confirmar Pix", "small-button");
        registrarPagamento.addEventListener("click", () => abrirModalConfirmacaoPix(pedido, actions));
        actions.append(registrarPagamento);
    }
    if (pedido.status === "pago") {
        if (pedido.transportadora && pedido.codigoRastreio) {
            adicionarAcao("Enviar", "enviado");
        } else {
            const adicionarRastreio = criarBotao("Rastreio", "small-button");
            adicionarRastreio.addEventListener("click", () => abrirModalPedido(pedido.id));
            actions.append(adicionarRastreio);
        }
    }
    if (pedido.status === "pendente" || pedido.status === "pago") {
        adicionarAcao("Cancelar", "cancelado", "danger-button");
    }

    const tdActions = document.createElement("td");
    tdActions.append(actions);

    tr.append(
        criarCelula(pedido.id),
        criarCelulaClientePedido(pedido),
        criarCelula(formatarMoeda(pedido.total)),
        criarCelulaComConteudo(criarStatusBadge(pedido.status)),
        criarCelulaProximaAcaoPedido(pedido),
        criarCelulaObservacaoPedido(pedido),
        criarCelula(formatarDataCurta(pedido.criadoEm), "pedido-data-cell"),
        tdActions
    );

    return tr;
}

async function carregarPedidos(paginaSolicitada) {
    const consulta = ++pedidoConsultaAtual;
    const parametros = new URLSearchParams({ limite: pedidoLimite.value });
    if (pedidoStatusFiltro.value) parametros.set("status", pedidoStatusFiltro.value);
    if (pedidoBuscaFiltro.value.trim()) parametros.set("busca", pedidoBuscaFiltro.value.trim());
    if (pedidoPrecisaAcaoFiltro.checked) parametros.set("precisaAcao", "true");
    if (pedidoAcaoFiltro.value) parametros.set("acao", pedidoAcaoFiltro.value);
    const rota = pedidoClienteFiltro ? "/pedidos/cliente/" + pedidoClienteFiltro.id : "/pedidos";
    const assinatura = rota + "?" + parametros.toString();
    const pagina = assinatura !== pedidoFiltrosAtuais ? 1 : (paginaSolicitada ?? pedidoPaginaAtual);
    pedidoFiltrosAtuais = assinatura;
    parametros.set("pagina", String(pagina));
    pedidoPaginaAnterior.disabled = true;
    pedidoPaginaProxima.disabled = true;
    pedidoPaginaInfo.textContent = "Carregando pedidos...";
    pedidosTbody.setAttribute("aria-busy", "true");
    try {
        await carregarDadosFormularioPedido();
        if (consulta !== pedidoConsultaAtual) return;
        const resposta = await apiFetch(rota + "?" + parametros.toString());
        if (consulta !== pedidoConsultaAtual) return;
        const ultimaPagina = Math.max(1, resposta.totalPaginas);
        if (pagina > ultimaPagina) return await carregarPedidos(ultimaPagina);
        pedidoPaginaAtual = resposta.pagina;
        pedidoTotalPaginas = resposta.totalPaginas;
        const pedidos = resposta.dados;
        pedidosTbody.replaceChildren(
            ...(pedidos.length ? pedidos.map(criarLinhaPedido) : [criarLinhaVazia(8, "Nenhum pedido encontrado")])
        );
        atualizarContextoFiltroPedidos();
        atualizarResumoListaPedidos(resposta);
        const inicio = resposta.total ? (resposta.pagina - 1) * resposta.limite + 1 : 0;
        const fim = inicio ? inicio + pedidos.length - 1 : 0;
        pedidoPaginaInfo.textContent = resposta.total
            ? "Pagina " + resposta.pagina + " de " + resposta.totalPaginas + " | " + inicio + " a " + fim + " de " + resposta.total
            : "Nenhum pedido encontrado";
        pedidoPaginaAnterior.disabled = pedidoPaginaAtual <= 1;
        pedidoPaginaProxima.disabled = pedidoPaginaAtual >= pedidoTotalPaginas;
    } catch (erro) {
        if (consulta !== pedidoConsultaAtual) return;
        pedidosTbody.replaceChildren(criarLinhaVazia(8, "Nao foi possivel carregar os pedidos. Tente Buscar novamente."));
        pedidoListaResumo.textContent = "";
        pedidoPaginaInfo.textContent = "Falha ao carregar";
        setFeedback(appFeedback, erro.message, "error");
    } finally {
        if (consulta === pedidoConsultaAtual) pedidosTbody.removeAttribute("aria-busy");
    }
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
    pedidoClientesDisponiveis = clientes;
    pedidoProdutosDisponiveis = produtos;

    preencherSelect(pedidoCliente, clientes, (cliente) => {
        const endereco = clienteTemEnderecoCompleto(cliente) ? "" : " - endereco incompleto";

        return "#" + cliente.id + " - " + cliente.nome + " - " + cliente.telefone + endereco;
    }, "Nenhum cliente cadastrado", "Selecione um cliente");

    preencherSelect(pedidoProduto, produtos, (produto) => {
        const tipo = produto.tipoEnvio === "internacional_direto" ? " - direto do Japao" : "";
        return "#" + produto.id + " - " + produto.nome + " - " +
            formatarMoeda(produto.preco) + " - estoque " + produto.estoque + tipo;
    }, "Nenhum produto cadastrado", "Selecione um produto");

    pedidoFormDadosCarregados = true;
    atualizarTipoEnvioPedidoPeloProduto();
}

function abrirModalConfirmacaoPix(pedido, actions = null, pedidoDetalheId = null) {
    if (actions?.dataset.atualizando === "true") return;

    pixConfirmacaoPedido = pedido;
    pixConfirmacaoActions = actions;
    pixConfirmacaoPedidoDetalheId = pedidoDetalheId;
    const nomeContato = obterNomeContatoPedido(pedido) || (pedido.cliente ? pedido.cliente.nome : "Cliente #" + pedido.clienteId);
    const telefoneContato = obterTelefoneContatoPedido(pedido) || "-";

    pixConfirmacaoDados.replaceChildren(
        criarItemConfirmacaoPix("Pedido", "#" + pedido.id),
        criarItemConfirmacaoPix("Cliente", nomeContato),
        criarItemConfirmacaoPix("Telefone", telefoneContato),
        criarItemConfirmacaoPix("Valor", formatarMoeda(pedido.total))
    );
    setFeedback(pixConfirmacaoFeedback, "");
    travarScrollPagina();
    pixModal.showModal();
    pixConfirmacaoCancelar.focus();
}

async function registrarPagamentoPedido() {
    const pedido = pixConfirmacaoPedido;
    const actions = pixConfirmacaoActions;
    const pedidoDetalheId = pixConfirmacaoPedidoDetalheId;

    if (!pedido || actions?.dataset.atualizando === "true") return;

    const metodo = "pix";

    if (actions) {
        actions.dataset.atualizando = "true";
    }
    const botoes = actions ? actions.querySelectorAll("button, a") : [];
    botoes.forEach(botao => { botao.disabled = true; });
    pixConfirmacaoConfirmar.disabled = true;
    pixConfirmacaoCancelar.disabled = true;
    setFeedback(pixConfirmacaoFeedback, "Confirmando recebimento...");

    try {
        await apiFetch("/pagamentos", {
            method: "POST",
            body: JSON.stringify({
                pedidoId: pedido.id,
                metodo
            })
        });

        pixModal.close();
        await recarregarTelaAposAlterarPedido();

        if (pedidoDetalheId && pedidoModal.open) {
            await carregarDetalhesPedidoNoModal(pedidoDetalheId, consultaPedidoAtual);
        }

        setFeedback(appFeedback, "Recebimento do Pix confirmado e pedido #" + pedido.id + " marcado como pago.", "success");
    } catch (erro) {
        setFeedback(pixConfirmacaoFeedback, erro.message, "error");
        if (actions) {
            actions.dataset.atualizando = "false";
        }
        botoes.forEach(botao => { botao.disabled = false; });
        pixConfirmacaoConfirmar.disabled = false;
        pixConfirmacaoCancelar.disabled = false;
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
        await recarregarTelaAposAlterarPedido();
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
        criarCelulaComConteudo(criarStatusBadge(pagamento.status)),
        criarCelula(formatarData(pagamento.criadoEm))
    );

    return tr;
}

async function carregarPagamentos() {
    let pagamentos = await apiFetch("/pagamentos");
    const busca = pagamentoBuscaFiltro.value.trim();
    const metodo = pagamentoMetodoFiltro.value;
    const status = pagamentoStatusFiltro.value;

    if (busca) {
        pagamentos = pagamentos.filter((pagamento) => pagamentoConfereBuscaLocal(pagamento, busca));
    }

    if (metodo) {
        pagamentos = pagamentos.filter((pagamento) => pagamento.metodo === metodo);
    }

    if (status) {
        pagamentos = pagamentos.filter((pagamento) => pagamento.status === status);
    }

    pagamentosTbody.replaceChildren(
        ...(pagamentos.length > 0 ? pagamentos.map(criarLinhaPagamento) : [criarLinhaVazia(6, "Nenhum pagamento encontrado")])
    );

    atualizarResumoListaPagamentos(pagamentos);
}

function criarCelulaContatoSolicitacao(solicitacao) {
    const td = criarCelula("");
    td.className = "solicitacao-contato-cell";

    if (solicitacao.contato) {
        const nome = document.createElement("p");
        nome.className = "cell-title";
        nome.textContent = solicitacao.contato.nome;
        const telefone = document.createElement("p");
        telefone.className = "muted-cell";
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
    const td = criarCelula("");
    td.className = "solicitacao-produto-cell";

    const tituloProduto = document.createElement("p");
    tituloProduto.className = "cell-title";
    tituloProduto.textContent = solicitacao.nomeProduto;
    td.append(tituloProduto);

    const detalhes = document.createElement("details");
    detalhes.className = "solicitacao-detalhes";
    const resumo = document.createElement("summary");
    const detalhesGrid = document.createElement("div");
    detalhesGrid.className = "solicitacao-detalhes-grid";
    resumo.textContent = "Ver descrição";
    const descricao = document.createElement("p");
    descricao.className = "solicitacao-info-box";
    descricao.textContent = solicitacao.descricao;
    detalhes.append(resumo, detalhesGrid);
    detalhesGrid.append(descricao);
    if (solicitacao.linkReferencia) {
        try {
            const url = new URL(solicitacao.linkReferencia);
            if (["http:", "https:"].includes(url.protocol)) {
                const link = document.createElement("a");
                link.href = url.href;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.textContent = "Abrir referência do produto";
                link.className = "solicitacao-info-box";
                detalhesGrid.append(link);
            }
        } catch { /* Referências antigas podem não ser URLs. */ }
    }
    const cotacaoAtual = document.createElement("p");
    cotacaoAtual.className = "solicitacao-info-box";
    if (solicitacao.valorCotado && solicitacao.produto?.tipoEnvio === "internacional_direto" && solicitacao.freteInternacionalCotado != null) {
        cotacaoAtual.textContent = "Cotacao atual: produto " + formatarMoeda(solicitacao.produto.preco) +
            " + frete " + formatarMoeda(solicitacao.freteInternacionalCotado) +
            " = " + formatarMoeda(solicitacao.valorCotado);
    } else {
        cotacaoAtual.textContent = solicitacao.valorCotado
            ? "Cotacao atual: " + formatarMoeda(solicitacao.valorCotado)
            : "Cotacao ainda nao informada.";
    }
    detalhesGrid.append(cotacaoAtual);

    if (solicitacao.produto) {
        const produtoVinculado = document.createElement("p");
        produtoVinculado.className = "solicitacao-info-box";
        const tipoProduto = solicitacao.produto.tipoEnvio === "internacional_direto"
            ? "direto do Japao"
            : "pronta entrega Brasil";
        produtoVinculado.textContent = "Produto cadastrado: #" + solicitacao.produto.id + " - " +
            solicitacao.produto.nome + " - " + tipoProduto + " - estoque " + solicitacao.produto.estoque;
        detalhesGrid.append(produtoVinculado);
    }

    if (solicitacao.pedidoId) {
        const pedidoVinculado = document.createElement("p");
        pedidoVinculado.className = "solicitacao-info-box";
        const abrirPedido = criarBotao("Pedido #" + solicitacao.pedidoId);
        abrirPedido.addEventListener("click", () => irParaPedido(solicitacao.pedidoId));
        pedidoVinculado.append("Pedido criado: ", abrirPedido);
        detalhesGrid.append(pedidoVinculado);
    }

    if (solicitacao.observacaoAdmin) {
        const observacao = document.createElement("p");
        observacao.className = "solicitacao-info-box";
        observacao.textContent = "Observacao interna: " + solicitacao.observacaoAdmin;
        detalhesGrid.append(observacao);
    }

    const proximoPasso = document.createElement("p");
    proximoPasso.className = "solicitacao-info-box muted-cell";

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

    detalhesGrid.append(proximoPasso);

    const acoesSolicitacao = document.createElement("div");
    acoesSolicitacao.className = "actions";

    const copiarMensagem = criarBotao(solicitacao.valorCotado ? "Copiar cotacao" : "Copiar mensagem");
    copiarMensagem.addEventListener("click", async () => {
        try {
            await copiarTexto(montarMensagemWhatsAppSolicitacao(solicitacao));
            setFeedback(appFeedback, "Mensagem da solicitacao copiada.", "success");
        } catch (erro) {
            setFeedback(appFeedback, "Nao foi possivel copiar a mensagem.", "error");
        }
    });
    acoesSolicitacao.append(copiarMensagem);

    if (solicitacao.valorCotado && !solicitacao.produtoId) {
        const criarProduto = criarBotao("Produto interno");
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
        const prepararPedido = criarBotao("Preparar pedido");
        prepararPedido.addEventListener("click", () => preencherPedidoPorSolicitacao(solicitacao));
        acoesSolicitacao.append(prepararPedido);
    }

    if (acoesSolicitacao.childElementCount > 0) {
        detalhes.append(acoesSolicitacao);
    }

    const form = document.createElement("form");
    form.className = "quote-form";
    const cotacaoInternacional = solicitacao.produto?.tipoEnvio === "internacional_direto";

    let valorInput;
    let valorProdutoResumo;

    if (cotacaoInternacional) {
        valorProdutoResumo = document.createElement("p");
        valorProdutoResumo.className = "solicitacao-info-box cotacao-total-box";
        valorProdutoResumo.textContent = "Produto: " + formatarMoeda(solicitacao.produto.preco);
    } else {
        const valorLabel = document.createElement("label");
        valorLabel.textContent = "Valor cotado";
        valorInput = document.createElement("input");
        valorInput.type = "number";
        valorInput.min = "0.01";
        valorInput.step = "0.01";
        valorInput.required = true;
        valorInput.value = solicitacao.valorCotado ?? "";
        valorLabel.append(valorInput);
        form.append(valorLabel);
    }

    const freteInternacionalLabel = document.createElement("label");
    freteInternacionalLabel.textContent = "Frete internacional";
    const freteInternacionalInput = document.createElement("input");
    freteInternacionalInput.type = "number";
    freteInternacionalInput.min = "0";
    freteInternacionalInput.step = "0.01";
    freteInternacionalInput.value = String(
        solicitacao.freteInternacionalCotado ??
        (solicitacao.valorCotado ? Math.max(Number(solicitacao.valorCotado) - Number(solicitacao.produto?.preco ?? 0), 0) : 0)
    );
    freteInternacionalLabel.append(freteInternacionalInput);

    const totalCotacao = document.createElement("p");
    totalCotacao.className = "solicitacao-info-box cotacao-total-box";

    function atualizarTotalCotacao() {
        if (!cotacaoInternacional) {
            return;
        }

        const valorProduto = Number(solicitacao.produto.preco);
        const frete = Number(freteInternacionalInput.value || 0);
        totalCotacao.textContent = "Total do Pix: " + formatarMoeda(valorProduto + (Number.isFinite(frete) ? frete : 0));
    }

    const ajudaCotacao = document.createElement("p");
    ajudaCotacao.className = "muted-cell";
    ajudaCotacao.textContent = cotacaoInternacional
        ? "Digite apenas o frete internacional. O sistema soma com o valor do produto. Taxas de importacao ficam por conta do cliente se forem cobradas."
        : "Use o valor combinado com o cliente para esta solicitacao.";

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

    if (cotacaoInternacional) {
        freteInternacionalInput.addEventListener("input", atualizarTotalCotacao);
        atualizarTotalCotacao();
        form.append(valorProdutoResumo, freteInternacionalLabel, totalCotacao, ajudaCotacao, observacaoLabel, salvarCotacao, mensagem);
    } else {
        form.append(ajudaCotacao, observacaoLabel, salvarCotacao, mensagem);
    }
    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const freteInternacionalCotado = cotacaoInternacional ? Number(freteInternacionalInput.value || 0) : undefined;
        const valorCotado = cotacaoInternacional
            ? Number((Number(solicitacao.produto.preco) + freteInternacionalCotado).toFixed(2))
            : Number(valorInput.value);
        const observacaoAdmin = observacaoInput.value.trim();

        if (!Number.isFinite(valorCotado) || valorCotado <= 0) {
            setFeedback(mensagem, "Informe um valor maior que zero.", "error");
            return;
        }

        if (cotacaoInternacional && (!Number.isFinite(freteInternacionalCotado) || freteInternacionalCotado < 0)) {
            setFeedback(mensagem, "Informe um frete internacional maior ou igual a zero.", "error");
            return;
        }

        salvarCotacao.disabled = true;
        setFeedback(mensagem, "Salvando cotacao...");

        try {
            await apiFetch("/solicitacoes/" + solicitacao.id + "/cotacao", {
                method: "PATCH",
                body: JSON.stringify({
                    valorCotado,
                    ...(cotacaoInternacional ? { freteInternacionalCotado } : {}),
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
        criarCelulaComConteudo(criarStatusBadge(solicitacao.status)),
        criarCelula(formatarDataCurta(solicitacao.criadoEm), "pedido-data-cell"),
        tdActions
    );

    return tr;
}

async function carregarSolicitacoes() {
    const status = solicitacaoStatusFiltro.value;
    const busca = solicitacaoBuscaFiltro.value.trim();
    const parametros = new URLSearchParams({ limite: "50" });

    if (busca) {
        parametros.set("busca", busca);
    }

    if (!solicitacaoClienteFiltro && status) {
        parametros.set("status", status);
    }

    const caminho = solicitacaoClienteFiltro
        ? "/solicitacoes/cliente/" + solicitacaoClienteFiltro.id + "?" + parametros.toString()
        : "/solicitacoes?" + parametros.toString();

    const resposta = await apiFetch(caminho);
    let solicitacoes = obterListaPaginada(resposta);

    if (solicitacaoClienteFiltro && status) {
        solicitacoes = solicitacoes.filter((solicitacao) => solicitacao.status === status);
    }

    if (busca) {
        solicitacoes = solicitacoes.filter((solicitacao) => solicitacaoConfereBuscaLocal(solicitacao, busca));
    }

    solicitacoesTbody.replaceChildren(
        ...(solicitacoes.length > 0 ? solicitacoes.map(criarLinhaSolicitacao) : [criarLinhaVazia(6, "Nenhuma solicitacao encontrada")])
    );

    atualizarContextoFiltroSolicitacoes();
    atualizarResumoListaSolicitacoes(solicitacoes);
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
        adminLogado = resultado.admin;
        localStorage.setItem("adminToken", token);
        await mostrarApp();
    } catch (erro) {
        setFeedback(loginFeedback, formatarErroLogin(erro), "error");
    }
});

senhaForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    setFeedback(senhaFeedback, "");

    if (novaSenha.value.length < 10) {
        setFeedback(senhaFeedback, "Nova senha deve ter pelo menos 10 caracteres", "error");
        return;
    }

    if (novaSenha.value !== confirmarSenha.value) {
        setFeedback(senhaFeedback, "Confirmacao da senha nao confere", "error");
        return;
    }

    try {
        await apiFetch("/auth/senha", {
            method: "PATCH",
            body: JSON.stringify({
                senhaAtual: senhaAtual.value,
                novaSenha: novaSenha.value,
                confirmacaoSenha: confirmarSenha.value
            })
        });

        senhaForm.reset();
        mostrarLogin();
        setFeedback(loginFeedback, "Senha alterada. Entre novamente.", "success");
    } catch (erro) {
        setFeedback(senhaFeedback, erro.message, "error");
    }
});

function lerMedidasProduto(form) {
    return Object.fromEntries(["pesoKg", "alturaCm", "larguraCm", "comprimentoCm"].map(campo => [campo, form.elements[campo].value === "" ? null : Number(form.elements[campo].value)]));
}

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
                publicadoNaLoja: produtoPublicadoNaLoja.checked,
                tipoEnvio: produtoTipoEnvio.value,
                ...lerMedidasProduto(produtoForm)
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
        produtoTipoEnvio.value = "nacional";
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
produtoPublicadoFiltro.addEventListener("change", async () => {
    if (activeView === "produtos") {
        await carregarProdutos();
    }
});
produtoTipoEnvioFiltro.addEventListener("change", async () => {
    if (activeView === "produtos") {
        await carregarProdutos();
    }
});
produtoMedidasIncompletasFiltro.addEventListener("change", agendarBuscaProdutos);
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
clienteEnderecoIncompletoFiltro.addEventListener("change", async () => {
    if (activeView === "clientes") {
        await carregarClientes();
    }
});

produtoEditCancelar.addEventListener("click", fecharModalProduto);

produtoModal.addEventListener("click", (evento) => {
    if (evento.target === produtoModal) {
        evento.preventDefault();
        evento.stopPropagation();
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
                publicadoNaLoja: produtoEditPublicadoNaLoja.checked,
                tipoEnvio: produtoEditTipoEnvio.value,
                ...lerMedidasProduto(produtoEditForm)
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

clienteEditNome.addEventListener("input", atualizarLinkWhatsAppCliente);
clienteEditTelefone.addEventListener("input", atualizarLinkWhatsAppCliente);
clienteEditCep.addEventListener("input", buscarEnderecoClientePorCep);
clienteEditCep.addEventListener("change", buscarEnderecoClientePorCep);
clienteEditCepBuscar.addEventListener("click", () => buscarEnderecoClientePorCep({ forcar: true }));
function assinaturaFretePedido() {
    return JSON.stringify([pedidoCliente.value, pedidoProduto.value, pedidoQuantidade.value]);
}
function pedidoUsaEnvioInternacional() {
    return pedidoTipoEnvio.value === "internacional_direto";
}

function calcularSubtotalPedidoAtual() {
    const produto = pedidoProdutosDisponiveis.find((item) => item.id === Number(pedidoProduto.value));
    const quantidade = Number(pedidoQuantidade.value);

    if (!produto || !Number.isInteger(quantidade) || quantidade <= 0) {
        return undefined;
    }

    return Number((Number(produto.preco) * quantidade).toFixed(2));
}

function atualizarResumoPedidoInternacional() {
    const subtotal = calcularSubtotalPedidoAtual();
    const frete = Number(pedidoFreteInternacional.value || 0);

    if (subtotal === undefined || !Number.isFinite(frete) || frete < 0) {
        pedidoFreteFeedback.textContent = "Informe produto, quantidade e frete internacional.";
        return;
    }

    pedidoFreteFeedback.textContent = "Produtos " + formatarMoeda(subtotal) +
        " + frete internacional " + formatarMoeda(frete) +
        " = " + formatarMoeda(subtotal + frete) +
        ". Taxas de importacao ficam por conta do cliente se forem cobradas.";
}

function atualizarTipoEnvioPedidoPeloProduto() {
    const produto = pedidoProdutosDisponiveis.find((item) => item.id === Number(pedidoProduto.value));

    if (produto) {
        pedidoTipoEnvio.value = produto.tipoEnvio === "internacional_direto" ? "internacional_direto" : "nacional";
    }

    atualizarTipoEnvioPedido();
}
function invalidarFretePedido() {
    pedidoFreteConsulta++;
    pedidoFreteOpcoes = [];
    pedidoFreteAssinatura = "";
    pedidoFreteSelect.replaceChildren(new Option("Calcule o frete", ""));
    pedidoFreteSelect.disabled = true;
    pedidoCalcularFrete.disabled = pedidoUsaEnvioInternacional();

    if (pedidoUsaEnvioInternacional()) {
        atualizarResumoPedidoInternacional();
    } else {
        pedidoFreteFeedback.textContent = "Selecione cliente, produto e quantidade para calcular.";
    }
}
function atualizarTipoEnvioPedido() {
    const internacional = pedidoUsaEnvioInternacional();
    pedidoTaxasImportacaoGrupo.classList.toggle("hidden", !internacional);
    pedidoFreteInternacionalGrupo.classList.toggle("hidden", !internacional);

    if (!internacional) {
        pedidoClienteCienteTaxas.checked = false;
        pedidoFreteInternacional.value = "0";
    }

    invalidarFretePedido();
}
for (const campo of [pedidoCliente, pedidoQuantidade]) campo.addEventListener("input", invalidarFretePedido);
pedidoFreteInternacional.addEventListener("input", atualizarResumoPedidoInternacional);
pedidoProduto.addEventListener("change", atualizarTipoEnvioPedidoPeloProduto);
pedidoTipoEnvio.addEventListener("change", atualizarTipoEnvioPedido);
pedidoForm.addEventListener("reset", () => setTimeout(atualizarTipoEnvioPedido, 0));
pedidoFreteSelect.addEventListener("change", () => {
    const f = pedidoFreteOpcoes.find(f => f.token === pedidoFreteSelect.value);
    pedidoFreteFeedback.textContent = f ? "Produtos " + formatarMoeda(pedidoFreteSubtotal) + " + frete " + formatarMoeda(f.valor) + " = " + formatarMoeda(pedidoFreteSubtotal + f.valor) + (f.ambiente === "sandbox" ? " (SIMULACAO)" : "") : "Selecione uma entrega.";
});
pedidoCalcularFrete.addEventListener("click", async () => {
    if (pedidoUsaEnvioInternacional()) {
        setFeedback(pedidoFreteFeedback, "Envio internacional direto nao usa frete nacional automatico.", "error");
        return;
    }

    invalidarFretePedido();
    const consulta = pedidoFreteConsulta;
    const assinatura = assinaturaFretePedido();
    const clienteId = Number(pedidoCliente.value), produtoId = Number(pedidoProduto.value), quantidade = Number(pedidoQuantidade.value);
    if (!clienteId || !produtoId || !Number.isInteger(quantidade) || quantidade <= 0) {
        setFeedback(pedidoFreteFeedback, "Selecione cliente, produto e quantidade validos.", "error"); return;
    }
    pedidoCalcularFrete.disabled = true;
    setFeedback(pedidoFreteFeedback, "Consultando frete...");
    try {
        const cliente = await apiFetch("/clientes/" + clienteId);
        if (consulta !== pedidoFreteConsulta || assinatura !== assinaturaFretePedido()) return;
        const resposta = await apiFetch("/fretes/cotacao", {method:"POST",body:JSON.stringify({cep:cliente.cep,itens:[{produtoId,quantidade}]})});
        if (consulta !== pedidoFreteConsulta || assinatura !== assinaturaFretePedido()) return;
        pedidoFreteOpcoes = resposta.opcoes;
        pedidoFreteSubtotal = resposta.subtotalProdutos;
        pedidoFreteAssinatura = assinatura;
        pedidoFreteSelect.replaceChildren(new Option("Selecione a entrega", ""), ...resposta.opcoes.map(f => new Option(f.transportadora + " / " + f.servico + " - " + formatarMoeda(f.valor) + " - " + f.prazoDias + " dias uteis apos postagem" + (f.ambiente === "sandbox" ? " (SIMULACAO)" : ""), f.token)));
        pedidoFreteSelect.disabled = false;
        setFeedback(pedidoFreteFeedback, "Escolha uma opcao. Cotacao valida por 15 minutos.");
    } catch (erro) {
        if (consulta === pedidoFreteConsulta) setFeedback(pedidoFreteFeedback, erro.message, "error");
    } finally {
        if (consulta === pedidoFreteConsulta) pedidoCalcularFrete.disabled = false;
    }
});

pedidoForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const clienteId = Number(pedidoCliente.value);
    const produtoId = Number(pedidoProduto.value);
    const quantidade = Number(pedidoQuantidade.value);
    const solicitacaoOrigemId = pedidoOrigemSolicitacaoId;
    const tipoEnvio = pedidoTipoEnvio.value === "internacional_direto" ? "internacional_direto" : "nacional";
    const envioInternacional = tipoEnvio === "internacional_direto";
    const freteInternacionalValor = Number(pedidoFreteInternacional.value || 0);
    const frete = pedidoFreteOpcoes.find(f => f.token === pedidoFreteSelect.value);
    if (!envioInternacional && (!frete || frete.expiraEm <= Date.now() || pedidoFreteAssinatura !== assinaturaFretePedido())) {
        setFeedback(appFeedback, "Calcule e selecione um frete valido antes de criar o pedido.", "error"); return;
    }

    if (envioInternacional && !pedidoClienteCienteTaxas.checked) {
        setFeedback(appFeedback, "Confirme que o cliente esta ciente das taxas de importacao.", "error");
        return;
    }

    if (envioInternacional && (!Number.isFinite(freteInternacionalValor) || freteInternacionalValor < 0)) {
        setFeedback(appFeedback, "Informe um frete internacional maior ou igual a zero.", "error");
        return;
    }

    if (!Number.isInteger(clienteId) || clienteId <= 0 || !Number.isInteger(produtoId) || produtoId <= 0) {
        setFeedback(appFeedback, "Selecione cliente e produto", "error");
        return;
    }

    const clienteSelecionado = pedidoClientesDisponiveis.find((cliente) => cliente.id === clienteId);

    if (clienteSelecionado && !clienteTemEnderecoCompleto(clienteSelecionado)) {
        setFeedback(appFeedback, "Complete o endereco do cliente antes de criar o pedido.", "error");
        abrirModalCliente(clienteSelecionado);
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
                tipoEnvio,
                clienteCienteTaxasImportacao: envioInternacional && pedidoClienteCienteTaxas.checked,
                ...(envioInternacional ? { freteInternacionalValor } : { freteToken: frete.token }),
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
        const mensagem = erro.message.includes("endereco do cliente")
            ? erro.message + ". Abra o cliente selecionado e preencha CEP, rua, numero, bairro, cidade e estado."
            : erro.message;

        setFeedback(appFeedback, "Nao foi possivel criar o pedido: " + mensagem, "error");
    } finally {
        pedidoForm.dataset.enviando = "false";
    }
});

pedidoPaginaAnterior.addEventListener("click", () => {
    if (!pedidoPaginaAnterior.disabled) void carregarPedidos(pedidoPaginaAtual - 1);
});
pedidoPaginaProxima.addEventListener("click", () => {
    if (!pedidoPaginaProxima.disabled) void carregarPedidos(pedidoPaginaAtual + 1);
});
pedidoLimite.addEventListener("change", () => { void carregarPedidos(1); });

pedidoFiltrosForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (activeView === "pedidos") {
        await carregarPedidos();
    }
});

pedidoFiltrosLimpar.addEventListener("click", async () => {
    pedidoPaginaAtual = 1;
    pedidoFiltrosForm.reset();
    pedidoClienteFiltro = null;
    window.clearTimeout(pedidoFiltroTimer);

    if (activeView === "pedidos") {
        await carregarPedidos();
    }
});

pedidoBuscaFiltro.addEventListener("input", agendarBuscaPedidos);

pedidoStatusFiltro.addEventListener("change", async () => {
    if (pedidoStatusFiltro.value) {
        pedidoPrecisaAcaoFiltro.checked = false;
        pedidoAcaoFiltro.value = "";
    }

    if (activeView === "pedidos") {
        await carregarPedidos();
    }
});

pedidoPrecisaAcaoFiltro.addEventListener("change", async () => {
    if (pedidoPrecisaAcaoFiltro.checked) {
        pedidoStatusFiltro.value = "";
    } else {
        pedidoAcaoFiltro.value = "";
    }

    if (activeView === "pedidos") {
        await carregarPedidos();
    }
});

pedidoAcaoFiltro.addEventListener("change", async () => {
    if (pedidoAcaoFiltro.value) {
        pedidoPrecisaAcaoFiltro.checked = true;
        pedidoStatusFiltro.value = "";
    }

    if (activeView === "pedidos") {
        await carregarPedidos();
    }
});

pedidoCliente.addEventListener("change", limparOrigemPedidoSolicitacao);
pedidoProduto.addEventListener("change", limparOrigemPedidoSolicitacao);

pagamentoFiltrosForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (activeView === "pagamentos") {
        await carregarPagamentos();
    }
});

pagamentoFiltrosLimpar.addEventListener("click", async () => {
    pagamentoFiltrosForm.reset();
    window.clearTimeout(pagamentoFiltroTimer);

    if (activeView === "pagamentos") {
        await carregarPagamentos();
    }
});

pagamentoBuscaFiltro.addEventListener("input", () => {
    window.clearTimeout(pagamentoFiltroTimer);
    pagamentoFiltroTimer = window.setTimeout(() => {
        if (activeView === "pagamentos") {
            void carregarPagamentos();
        }
    }, 300);
});

pagamentoMetodoFiltro.addEventListener("change", async () => {
    if (activeView === "pagamentos") {
        await carregarPagamentos();
    }
});

pagamentoStatusFiltro.addEventListener("change", async () => {
    if (activeView === "pagamentos") {
        await carregarPagamentos();
    }
});

solicitacaoStatusFiltro.addEventListener("change", async () => {
    if (activeView === "solicitacoes") {
        await carregarSolicitacoes();
    }
});

solicitacaoBuscaFiltro.addEventListener("input", agendarBuscaSolicitacoes);

solicitacaoFiltrosLimpar.addEventListener("click", async () => {
    solicitacaoClienteFiltro = null;
    solicitacaoBuscaFiltro.value = "";
    solicitacaoStatusFiltro.value = "";
    window.clearTimeout(solicitacaoFiltroTimer);

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

        let mensagemCliente = "Cliente atualizado";

        if (!editando) {
            mensagemCliente = clienteSalvo.criadoAgora === false ? "Cliente existente atualizado" : "Cliente cadastrado";

            if (clienteOrigemSolicitacaoId !== null) {
                mensagemCliente += " e vinculado";
            }
        }

        setFeedback(appFeedback, mensagemCliente, "success");
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

void iniciarAdmin();
