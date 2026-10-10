const CHAVE_ULTIMO_PEDIDO = "lojaJapaoUltimoPedido";

function pedidoValido(pedido) {
    return pedido && Number.isSafeInteger(pedido.id) && pedido.id > 0 &&
        typeof pedido.telefone === "string" && /^\d{8,20}$/.test(pedido.telefone);
}

export function lerUltimoPedido() {
    try {
        const pedido = JSON.parse(sessionStorage.getItem(CHAVE_ULTIMO_PEDIDO) || "null");
        return pedidoValido(pedido) ? { id: pedido.id, telefone: pedido.telefone } : null;
    } catch {
        return null;
    }
}

export function salvarUltimoPedido(id, telefone) {
    const pedido = { id, telefone: String(telefone ?? "").replace(/\D/g, "") };
    if (!pedidoValido(pedido)) return false;
    try {
        // Apenas referencia e telefone; status, endereco e Pix sempre vem da API.
        sessionStorage.setItem(CHAVE_ULTIMO_PEDIDO, JSON.stringify(pedido));
        return true;
    } catch {
        // Armazenamento bloqueado nao transforma uma compra concluida em erro.
        return false;
    }
}

export function esquecerUltimoPedido() {
    try {
        sessionStorage.removeItem(CHAVE_ULTIMO_PEDIDO);
        sessionStorage.removeItem("lojaJapaoTelefoneAcompanhamento");
        return true;
    } catch {
        return false;
    }
}

export function montarAtalhoUltimoPedido(container, aoEsquecer = () => {}) {
    const pedido = lerUltimoPedido();
    container.replaceChildren();
    container.classList.toggle("hidden", !pedido);
    if (!pedido) return;
    const texto = document.createElement("p");
    texto.textContent = "Seu último pedido: #" + pedido.id + ". Consulte o pagamento e a entrega.";
    const acoes = document.createElement("div");
    acoes.className = "step-actions";
    const link = document.createElement("a");
    link.className = "ghost-link";
    link.href = "/loja/acompanhamento?pedido=" + pedido.id;
    link.textContent = "Acompanhar pedido #" + pedido.id;
    const esquecer = document.createElement("button");
    esquecer.type = "button";
    esquecer.className = "ghost-button";
    esquecer.textContent = "Remover atalho";
    esquecer.addEventListener("click", () => {
        if (!esquecerUltimoPedido()) {
            texto.textContent = "Nao foi possivel apagar o atalho. Limpe os dados deste site nas configuracoes do navegador.";
            return;
        }
        container.replaceChildren();
        container.classList.toggle("hidden", true);
        aoEsquecer();
    });
    acoes.append(link, esquecer);
    const ajuda = document.createElement("p");
    ajuda.className = "store-support";
    ajuda.textContent = "Remover o atalho só tira este acesso rápido da tela. Isso não cancela seu pedido.";
    container.append(texto, acoes, ajuda);
}
