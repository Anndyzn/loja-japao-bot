const trackingForm = document.querySelector("#tracking-form");
const pedidoIdInput = document.querySelector("#pedido-id");
const trackingResult = document.querySelector("#tracking-result");
const trackingFeedback = document.querySelector("#tracking-feedback");

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

    trackingResult.append(resumo, status, detalhes);
}

async function buscarPedido(pedidoId) {
    setFeedback("Buscando pedido...");
    trackingResult.classList.add("hidden");

    const pedido = await apiFetch(`/pedidos/${pedidoId}/acompanhamento`);
    renderizarPedido(pedido);
    setFeedback("Pedido encontrado.", "success");
}

trackingForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const pedidoId = Number(pedidoIdInput.value);

    if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
        setFeedback("Informe um numero de pedido valido.", "error");
        return;
    }

    try {
        await buscarPedido(pedidoId);
    } catch (erro) {
        setFeedback(erro.message, "error");
    }
});

const pedidoUrl = new URLSearchParams(window.location.search).get("pedido");

if (pedidoUrl) {
    pedidoIdInput.value = pedidoUrl;
    trackingForm.requestSubmit();
}
