import { criarQuadroPix } from "./pix.js";

const trackingForm = document.querySelector("#tracking-form");
const pedidoIdInput = document.querySelector("#pedido-id");
const telefoneInput = document.querySelector("#pedido-telefone");
const trackingResult = document.querySelector("#tracking-result");
const trackingFeedback = document.querySelector("#tracking-feedback");
const CHAVE_TELEFONE_ACOMPANHAMENTO = "lojaJapaoTelefoneAcompanhamento";

const etapas = [
    {
        status: "pendente",
        titulo: "Recebido"
    },
    {
        status: "pago",
        titulo: "Pagamento"
    },
    {
        status: "enviado",
        titulo: "Enviado"
    }
];

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarData(valor) {
    return new Date(valor).toLocaleString("pt-BR");
}

function normalizarDigitos(valor) {
    return String(valor ?? "").replace(/\D/g, "");
}

function normalizarTexto(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function criarLinkRastreio(rastreio) {
    if (!rastreio) {
        return undefined;
    }

    const transportadora = normalizarTexto(rastreio.transportadora);

    if (!transportadora.includes("correios")) {
        return undefined;
    }

    const link = document.createElement("a");
    link.className = "hero-button tracking-link";
    link.href = "https://rastreamento.correios.com.br/app/index.php?objeto=" + encodeURIComponent(rastreio.codigo);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Abrir rastreamento";

    return link;
}

function setFeedback(mensagem, tipo = "") {
    trackingFeedback.textContent = mensagem;
    trackingFeedback.className = `feedback ${tipo}`.trim();
}

async function apiFetch(caminho) {
    const resposta = await fetch(caminho);
    const conteudo = await resposta.json().catch(() => undefined);

    if (!resposta.ok) {
        throw new Error(conteudo?.mensagem ?? "Nao foi possivel buscar o pedido");
    }

    return conteudo;
}

function obterIndiceStatus(status) {
    if (status === "cancelado") {
        return -1;
    }

    return etapas.findIndex((etapa) => etapa.status === status);
}

function criarEtapa(etapa, indice, indiceAtual, pedidoCancelado) {
    const item = document.createElement("article");
    item.className = "tracking-step";

    if (pedidoCancelado) {
        item.classList.add("muted");
    } else if (indice <= indiceAtual) {
        item.classList.add("done");
    }

    const marcador = document.createElement("span");
    marcador.className = "tracking-marker";
    marcador.textContent = String(indice + 1);

    const titulo = document.createElement("strong");
    titulo.textContent = etapa.titulo;

    item.append(marcador, titulo);

    return item;
}

function criarItemPedido(item) {
    const linha = document.createElement("article");
    linha.className = "tracking-item";

    const info = document.createElement("div");

    const nome = document.createElement("p");
    nome.className = "cart-item-title";
    nome.textContent = item.nomeProduto;

    const detalhe = document.createElement("p");
    detalhe.className = "cart-item-detail";
    detalhe.textContent = `${item.quantidade} x ${formatarMoeda(item.precoUnitario)}`;

    info.append(nome, detalhe);

    const subtotal = document.createElement("strong");
    subtotal.textContent = formatarMoeda(item.subtotal);

    linha.append(info, subtotal);

    return linha;
}

function renderizarPedido(pedido) {
    const indiceAtual = obterIndiceStatus(pedido.status);
    const pedidoCancelado = pedido.status === "cancelado";

    trackingResult.classList.remove("hidden");
    trackingResult.replaceChildren();

    const resumo = document.createElement("section");
    resumo.className = "tracking-summary";

    const titulo = document.createElement("div");
    titulo.innerHTML = `
        <p class="eyebrow">Pedido #${pedido.pedidoId}</p>
        <h2>${pedido.mensagem}</h2>
        <p class="tracking-meta">Cliente: ${pedido.cliente.nome} - Criado em ${formatarData(pedido.criadoEm)}</p>
    `;

    const total = document.createElement("strong");
    total.className = "tracking-total";
    total.textContent = formatarMoeda(pedido.total);

    resumo.append(titulo, total);

    const status = document.createElement("section");
    status.className = "tracking-steps";
    status.replaceChildren(...etapas.map((etapa, indice) => {
        return criarEtapa(etapa, indice, indiceAtual, pedidoCancelado);
    }));

    if (pedidoCancelado) {
        const cancelado = document.createElement("article");
        cancelado.className = "tracking-canceled";
        cancelado.textContent = "Pedido cancelado";
        status.append(cancelado);
    }

    const detalhes = document.createElement("section");
    detalhes.className = "tracking-details";

    const pagamento = document.createElement("article");
    pagamento.className = "tracking-card";
    pagamento.innerHTML = `
        <p class="eyebrow">Pagamento</p>
        <h3>${pedido.pagamento.status}</h3>
        <p>${pedido.pagamento.metodo ?? "Metodo ainda nao confirmado"}</p>
    `;

    const itens = document.createElement("article");
    itens.className = "tracking-card";

    const itensTitulo = document.createElement("div");
    itensTitulo.innerHTML = `
        <p class="eyebrow">Itens</p>
        <h3>Resumo do pedido</h3>
    `;

    const itensLista = document.createElement("div");
    itensLista.className = "tracking-items";
    itensLista.replaceChildren(...pedido.itens.map(criarItemPedido));

    itens.append(itensTitulo, itensLista);
    detalhes.append(pagamento, itens);
    if (pedido.freteServico) {
        const frete = document.createElement("article");
        frete.className = "tracking-card";
        const titulo = document.createElement("h3"); titulo.textContent = "Entrega contratada";
        const descricao = document.createElement("p");
        descricao.textContent = pedido.freteTransportadora + " / " + pedido.freteServico + " - " + formatarMoeda(pedido.freteValor) + " - " + pedido.fretePrazoDias + " dias uteis apos postagem" + (pedido.freteAmbiente === "sandbox" ? " (SIMULACAO)" : "");
        const valores = document.createElement("p"); valores.textContent = "Produtos: " + formatarMoeda(pedido.subtotalProdutos) + " | Total com frete: " + formatarMoeda(pedido.total);
        frete.append(titulo, descricao, valores); detalhes.append(frete);
    }
    const quadroPix = criarQuadroPix(pedido);
    if (quadroPix) detalhes.append(quadroPix);

    if (pedido.status === "enviado") {
        const envio = document.createElement("article");
        envio.className = "tracking-card";
        const tituloEnvio = document.createElement("h3");
        tituloEnvio.textContent = "Rastreio do envio";
        const transportadora = document.createElement("p");
        const codigo = document.createElement("p");
        codigo.className = "tracking-code";
        const orientacao = document.createElement("p");
        if (pedido.rastreio) {
            transportadora.textContent = "Transportadora: " + pedido.rastreio.transportadora;
            codigo.textContent = pedido.rastreio.codigo;
            orientacao.textContent = "Use este código no site da transportadora para consultar a entrega.";
            const linkRastreio = criarLinkRastreio(pedido.rastreio);
            envio.append(tituloEnvio, transportadora, codigo, orientacao);

            if (linkRastreio) {
                envio.append(linkRastreio);
            }
        } else {
            orientacao.textContent = "O código de rastreio ainda não foi informado. Consulte novamente mais tarde.";
            envio.append(tituloEnvio, transportadora, codigo, orientacao);
        }
        detalhes.append(envio);
    }

    if (Array.isArray(pedido.historico) && pedido.historico.length > 0) {
        const historico = document.createElement("article");
        historico.className = "tracking-card tracking-history";
        const tituloHistorico = document.createElement("div");
        tituloHistorico.innerHTML = `
            <p class="eyebrow">Historico</p>
            <h3>Linha do tempo</h3>
        `;
        const listaHistorico = document.createElement("div");
        listaHistorico.className = "tracking-history-list";

        listaHistorico.replaceChildren(...pedido.historico.map((evento) => {
            const linha = document.createElement("p");
            linha.textContent = `${formatarData(evento.criadoEm)} - ${evento.descricao}`;
            return linha;
        }));

        historico.append(tituloHistorico, listaHistorico);
        detalhes.append(historico);
    }

    trackingResult.append(resumo, status, detalhes);
}

async function buscarPedido(pedidoId, telefone) {
    setFeedback("Buscando pedido...");
    trackingResult.classList.add("hidden");

    const parametros = new URLSearchParams({
        telefone
    });
    const pedido = await apiFetch(`/pedidos/${pedidoId}/acompanhamento?${parametros.toString()}`);
    renderizarPedido(pedido);
    setFeedback("Pedido encontrado.", "success");
}

trackingForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const pedidoId = Number(pedidoIdInput.value);
    const telefone = telefoneInput.value.trim();

    if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
        setFeedback("Informe um numero de pedido valido.", "error");
        return;
    }

    if (normalizarDigitos(telefone).length < 8) {
        setFeedback("Informe o telefone usado no pedido.", "error");
        telefoneInput.focus();
        return;
    }

    try {
        sessionStorage.setItem(CHAVE_TELEFONE_ACOMPANHAMENTO, telefone);
        await buscarPedido(pedidoId, telefone);
    } catch (erro) {
        setFeedback(erro.message, "error");
    }
});

const pedidoUrl = new URLSearchParams(window.location.search).get("pedido");

if (pedidoUrl) {
    pedidoIdInput.value = pedidoUrl;
    const telefoneSalvo = sessionStorage.getItem(CHAVE_TELEFONE_ACOMPANHAMENTO);

    if (telefoneSalvo) {
        telefoneInput.value = telefoneSalvo;
        trackingForm.requestSubmit();
    } else {
        setFeedback("Informe o telefone usado no pedido para ver o acompanhamento.");
    }
}
