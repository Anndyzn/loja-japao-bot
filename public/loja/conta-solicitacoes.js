import { contaApi } from "./conta-api.js";
const etapas = {
    recebida: ["Recebida", "A loja recebeu sua solicitação e vai analisar o produto."],
    em_analise: ["Em análise", "Estamos verificando disponibilidade e preço."],
    cotada: ["Cotação disponível", "Confira o valor e fale com a loja para combinar os próximos passos."],
    aprovada: ["Aprovada", "A loja está preparando seu pedido."],
    recusada: ["Não foi possível atender", "Fale com a loja se quiser consultar outra opção."],
    cancelada: ["Cancelada", "Esta solicitação foi encerrada."]
};
export function criarCardSolicitacao(solicitacao, document) {
    const card = document.createElement("article"); card.className = "tracking-card conta-solicitacao";
    const titulo = document.createElement("h3"); titulo.textContent = "#" + solicitacao.id + " — " + solicitacao.nomeProduto;
    const data = document.createElement("p"); data.className = "conta-solicitacao-data";
    data.textContent = "Solicitada em " + new Date(solicitacao.criadoEm).toLocaleDateString("pt-BR");
    const [rotulo, orientacao] = etapas[solicitacao.status] ?? ["Em acompanhamento", "Consulte a loja para saber mais."];
    const status = document.createElement("strong"); status.className = "conta-solicitacao-status"; status.textContent = solicitacao.pedidoId ? "Pedido gerado" : rotulo;
    const mensagem = document.createElement("p"); mensagem.textContent = solicitacao.pedidoId ? "Seu atendimento continua no pedido. Abra para conferir o pagamento e a entrega." : orientacao;
    card.append(titulo, data, status, mensagem);
    if (solicitacao.cotacao) {
        const moeda = valor => Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        const cotacao = document.createElement("p"); cotacao.className = "conta-solicitacao-cotacao";
        cotacao.textContent = "Valor cotado: " + moeda(solicitacao.cotacao.valor);
        const frete = document.createElement("p");
        frete.textContent = solicitacao.cotacao.tipoEnvio === "internacional_direto" && solicitacao.cotacao.freteInternacional !== null
            ? "Inclui " + moeda(solicitacao.cotacao.freteInternacional) + " de frete internacional."
            : "O frete será confirmado no pedido.";
        card.append(cotacao, frete);
        if (!solicitacao.pedidoId) { const aviso = document.createElement("p"); aviso.textContent = "Aguarde a criação do pedido para realizar o pagamento."; card.append(aviso); }
    }
    if (solicitacao.descricao) {
        const detalhes = document.createElement("details"), resumo = document.createElement("summary"), descricao = document.createElement("p");
        resumo.textContent = "O que solicitei"; descricao.textContent = solicitacao.descricao;
        detalhes.append(resumo, descricao); card.append(detalhes);
    }
    if (Number.isSafeInteger(solicitacao.pedidoId) && solicitacao.pedidoId > 0) {
        const link = document.createElement("a"); link.className = "ghost-link";
        link.href = "/loja/acompanhamento?pedido=" + solicitacao.pedidoId; link.textContent = "Ver pedido #" + solicitacao.pedidoId; card.append(link);
    }
    return card;
}
export function iniciarSolicitacoesConta({ document, api = contaApi }) {
    const el = id => document.getElementById(id);
    const lista = el("conta-solicitacoes"), aviso = el("solicitacoes-feedback"), anterior = el("solicitacoes-anterior"), proxima = el("solicitacoes-proxima"), atualizar = el("solicitacoes-atualizar");
    let pagina = 1, paginas = 0, consulta = 0, ativa = false, carregando = false;
    function controles() {
        anterior.disabled = !ativa || carregando || pagina <= 1;
        proxima.disabled = !ativa || carregando || pagina >= paginas;
        atualizar.disabled = !ativa || carregando;
        el("solicitacoes-paginacao").hidden = paginas <= 1;
        el("solicitacoes-pagina").textContent = "Página " + pagina + " de " + Math.max(1, paginas);
    }
    async function carregar(destino = pagina) {
        if (!ativa) return;
        const atual = ++consulta; carregando = true; controles(); lista.setAttribute("aria-busy", "true");
        lista.replaceChildren(); aviso.textContent = "Carregando solicitações...";
        try {
            const resposta = await api("/conta/solicitacoes?pagina=" + destino);
            if (atual !== consulta) return;
            pagina = resposta.pagina; paginas = resposta.totalPaginas;
            lista.replaceChildren(...resposta.dados.map(item => criarCardSolicitacao(item, document)));
            aviso.textContent = resposta.dados.length ? "" : resposta.totalPaginas === 0 ? "Você ainda não fez solicitações." : "Nenhuma solicitação nesta página.";
        } catch (erro) {
            if (atual !== consulta) return;
            aviso.textContent = erro.status === 401 ? "Sua sessão expirou. Entre novamente na sua conta." : "Não foi possível carregar as solicitações. Clique em Atualizar solicitações para tentar novamente.";
            if (erro.status === 401) { const link = document.createElement("a"); link.href = "/loja/conta"; link.textContent = "Entrar na conta"; link.className = "ghost-link"; lista.append(link); }
        } finally {
            if (atual === consulta) { carregando = false; lista.setAttribute("aria-busy", "false"); controles(); }
        }
    }
    anterior.addEventListener("click", () => { if (!anterior.disabled) void carregar(pagina - 1); });
    proxima.addEventListener("click", () => { if (!proxima.disabled) void carregar(pagina + 1); });
    atualizar.addEventListener("click", () => { if (!atualizar.disabled) void carregar(); });
    return {
        iniciar() { ativa = true; pagina = 1; paginas = 0; return carregar(1); },
        limpar() { ativa = false; consulta++; carregando = false; paginas = 0; pagina = 1; lista.replaceChildren(); aviso.textContent = ""; lista.setAttribute("aria-busy", "false"); controles(); }
    };
}
