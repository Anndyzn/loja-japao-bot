const secoes = ["pedidos", "solicitacoes", "pagamentos", "clientes"];
export function lerMarcadores(valor) {
    let dados; try { dados = JSON.parse(valor || "{}"); } catch { dados = {}; }
    return Object.fromEntries(secoes.map(secao => [secao, Number.isSafeInteger(dados?.[secao]) && dados[secao] >= 0 && dados[secao] <= 2147483647 ? dados[secao] : 0]));
}
export function criarNovidadesAdmin({ api, document, window, storage }) {
    let chave = "", vistos = lerMarcadores(null), resumo = null, secao = "dashboard", geracao = 0, timer = null, carregando = false, falhou = false;
    const painel = document.querySelector("#novidades-painel"), texto = document.querySelector("#novidades-texto"), botao = document.querySelector("#novidades-vistas");
    function renderizar() {
        for (const nome of secoes) {
            const badge = document.querySelector('[data-novidades="' + nome + '"]');
            const total = resumo?.[nome]?.novos ?? 0;
            badge.hidden = !total || !chave;
            badge.textContent = total > 99 ? "99+" : String(total);
            badge.setAttribute("aria-label", total + " novos registros");
            badge.title = total + " novos registros desde a última conferência";
        }
        painel.hidden = !chave || !secoes.includes(secao);
        const total = resumo?.[secao]?.novos ?? 0;
        texto.textContent = falhou ? "Não foi possível atualizar as novidades. Tente Atualizar." : resumo ? (total ? (total === 1 ? "1 novo registro" : total + " novos registros") + " nesta seção. Confira a lista e os filtros antes de marcar como vistos." : "Nenhum registro novo desde sua última conferência.") : "Conferindo novidades...";
        botao.disabled = !resumo || !total || falhou;
    }
    async function atualizar() {
        if (!chave || carregando || document.visibilityState === "hidden") return;
        const atual = geracao; carregando = true;
        try {
            const resposta = await api("/dashboard/novidades?" + new URLSearchParams(vistos));
            if (atual !== geracao) return;
            resumo = resposta; falhou = false;
            renderizar();
        } catch { if (atual === geracao) { falhou = true; renderizar(); } }
        finally { if (atual === geracao) carregando = false; }
    }
    function parar() {
        geracao++; chave = ""; resumo = null; carregando = false; falhou = false;
        window.clearInterval(timer); timer = null; renderizar();
    }
    botao.addEventListener("click", async () => {
        if (!resumo?.[secao] || botao.disabled) return;
        const nome = secao;
        const novosMarcadores = { ...vistos, [nome]: resumo[nome].ultimoId };
        try { storage.setItem(chave, JSON.stringify(novosMarcadores)); }
        catch { texto.textContent = "O navegador não permitiu salvar a leitura. As novidades podem reaparecer ao abrir o painel."; return; }
        vistos = novosMarcadores;
        // Nao busca um novo marcador antes de confirmar: chegadas posteriores continuam novas.
        geracao++; carregando = false; resumo[nome] = { ...resumo[nome], novos: 0 }; renderizar();
        await atualizar();
    });
    document.addEventListener("visibilitychange", () => { if (document.visibilityState !== "hidden") void atualizar(); });
    window.addEventListener("storage", evento => {
        if (!chave || evento.key !== chave) return;
        vistos = lerMarcadores(evento.newValue); geracao++; carregando = false; void atualizar();
    });
    return {
        iniciar(adminId) {
            parar(); chave = "lojaAdminNovidades:" + adminId;
            try { vistos = lerMarcadores(storage.getItem(chave)); } catch { vistos = lerMarcadores(null); }
            renderizar(); void atualizar(); timer = window.setInterval(() => void atualizar(), 30000);
        },
        selecionar(nome) { secao = nome; renderizar(); }, atualizar, parar
    };
}
