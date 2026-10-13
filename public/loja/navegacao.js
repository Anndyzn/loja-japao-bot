// Navegação compartilhada nas páginas do cliente; aparece apenas no celular.
export function iniciarNavegacaoCliente() {
    if (document.querySelector(".mobile-nav")) return;
    const nav = document.createElement("nav");
    nav.className = "mobile-nav";
    nav.setAttribute("aria-label", "Navegação da loja");
    const itens = [
        ["Loja", "/loja", "M3 10 12 3l9 7v11H3Z M9 21v-8h6v8"],
        ["Pedidos", "/loja/conta#meus-pedidos", "M5 3h14v18H5Z M8 8h8 M8 12h8 M8 16h5"],
        ["Solicitar", "/loja/solicitacao", "M4 4h16v13H9l-5 4Z M8 10h8 M12 6v8"],
        ["Conta", "/loja/conta", "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-3a8 6 0 0 1 16 0v3"],
        ["Carrinho", "/loja/carrinho", "M2 3h3l3 12h11l3-9H6 M10 20h.01 M18 20h.01"]
    ];
    for (const [texto, href, desenho] of itens) {
        const link = document.createElement("a");
        link.href = href;
        const icone = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        icone.setAttribute("viewBox", "0 0 24 24");
        icone.setAttribute("aria-hidden", "true");
        const linha = document.createElementNS("http://www.w3.org/2000/svg", "path");
        linha.setAttribute("d", desenho);icone.append(linha);
        const label = document.createElement("span");label.textContent = texto;
        link.append(icone, label);nav.append(link);
    }
    function atualizarAtivo() {
        const rota = location.pathname.replace(/\.html$/, "").replace(/\/$/, "");
        const destino = rota === "/loja/index" ? "/loja" : rota;
        for (const link of nav.querySelectorAll("a")) {
            const url = new URL(link.href);
            const pedidos = destino === "/loja/acompanhamento" || (destino === "/loja/conta" && location.hash === "#meus-pedidos");
            const ativo = pedidos ? url.hash === "#meus-pedidos" : url.pathname === destino && !url.hash;
            if (ativo) link.setAttribute("aria-current", "page");else link.removeAttribute("aria-current");
        }
    }
    document.body.append(nav);
    atualizarAtivo();window.addEventListener("hashchange", atualizarAtivo);
}
