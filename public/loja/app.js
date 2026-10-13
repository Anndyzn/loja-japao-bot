import { obterContaCliente } from "./conta-api.js";
import { aplicarConfiguracaoPublica } from "./configuracao.js";

const productsGrid = document.querySelector("#products-grid");
const categoryFilter = document.querySelector("#catalog-category");
const catalogResults = document.querySelector("#catalog-results");
const reloadProducts = document.querySelector("#reload-products");
const cartCount = document.querySelector("#cart-count");
const cartTotalPreview = document.querySelector("#cart-total-preview");
const feedback = document.querySelector("#store-feedback");
const floatingCartButton = document.querySelector("#floating-cart-button");
const floatingCartCount = document.querySelector("#floating-cart-count");
const cartBackdrop = document.querySelector("#cart-backdrop");
const cartDrawer = document.querySelector("#cart-drawer");
const closeCartDrawer = document.querySelector("#close-cart-drawer");
const drawerCartItems = document.querySelector("#drawer-cart-items");
const drawerCartTotal = document.querySelector("#drawer-cart-total");
const drawerClearCart = document.querySelector("#drawer-clear-cart");

const CHAVE_CARRINHO = "lojaJapaoCarrinho";

let produtos = [];
let carregandoProdutos = false;
let carrinho = carregarCarrinho();

void aplicarConfiguracaoPublica();

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function setFeedback(mensagem, tipo = "") {
    feedback.textContent = mensagem;
    feedback.className = `feedback ${tipo}`.trim();
}

function carregarCarrinho() {
    try {
        const itens = JSON.parse(localStorage.getItem(CHAVE_CARRINHO) ?? "[]");

        if (!Array.isArray(itens)) {
            return new Map();
        }

        return new Map(
            itens
                .filter((item) => item?.produto?.id && Number.isInteger(item.quantidade) && item.quantidade > 0)
                .map((item) => [item.produto.id, item])
        );
    } catch {
        return new Map();
    }
}

function salvarCarrinho() {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(Array.from(carrinho.values())));
    atualizarResumoCarrinho();
    renderizarCarrinhoRapido();
}

function calcularTotal() {
    return Array.from(carrinho.values()).reduce((total, item) => {
        return total + Number(item.produto.preco) * item.quantidade;
    }, 0);
}

function calcularQuantidadeItens() {
    return Array.from(carrinho.values()).reduce((total, item) => total + item.quantidade, 0);
}

function atualizarResumoCarrinho() {
    const quantidade = calcularQuantidadeItens();

    cartCount.textContent = String(quantidade);
    floatingCartCount.textContent = String(quantidade);
    document.querySelector("#floating-cart-total").textContent = formatarMoeda(calcularTotal());
    cartTotalPreview.textContent = `${formatarMoeda(calcularTotal())} no carrinho`;
    floatingCartButton.classList.toggle("has-items", quantidade > 0);
}

async function apiFetch(caminho, opcoes = {}) {
    const headers = {
        ...(opcoes.body ? { "Content-Type": "application/json" } : {}),
        ...opcoes.headers
    };

    const resposta = await fetch(caminho, {
        ...opcoes,
        headers
    });

    const conteudo = await resposta.json().catch(() => undefined);

    if (!resposta.ok) {
        throw new Error(conteudo?.mensagem ?? "Nao foi possivel concluir a acao");
    }

    return conteudo;
}

function obterQuantidadeNoCarrinho(produtoId) {
    return carrinho.get(produtoId)?.quantidade ?? 0;
}

function produtoEhInternacional(produto) {
    return produto.tipoEnvio === "internacional_direto";
}

function sincronizarCarrinhoComProdutos() {
    let mudou = false;

    for (const [produtoId, item] of carrinho) {
        const produtoAtualizado = produtos.find((produto) => produto.id === produtoId);

        if (!produtoAtualizado || produtoAtualizado.estoque <= 0 || produtoEhInternacional(produtoAtualizado)) {
            carrinho.delete(produtoId);
            mudou = true;
            continue;
        }

        const quantidade = Math.min(item.quantidade, produtoAtualizado.estoque);

        if (quantidade !== item.quantidade || item.produto.preco !== produtoAtualizado.preco) {
            carrinho.set(produtoId, {
                produto: produtoAtualizado,
                quantidade
            });
            mudou = true;
        }
    }

    if (mudou) {
        salvarCarrinho();
    } else {
        atualizarResumoCarrinho();
    }
}

function adicionarAoCarrinho(produto, quantidade) {
    const quantidadeAtual = obterQuantidadeNoCarrinho(produto.id);
    const novaQuantidade = quantidadeAtual + quantidade;

    if (novaQuantidade > produto.estoque) {
        setFeedback("Quantidade maior que o estoque disponivel.", "error");
        return;
    }

    carrinho.set(produto.id, {
        produto,
        quantidade: novaQuantidade
    });

    salvarCarrinho();
    setFeedback(`${produto.nome} adicionado ao carrinho.`, "success");
    renderizarProdutos();
    abrirCarrinhoRapido();
}

function alterarQuantidade(produtoId, novaQuantidade) {
    const item = carrinho.get(produtoId);

    if (!item) {
        return;
    }

    if (novaQuantidade <= 0) {
        carrinho.delete(produtoId);
    } else {
        carrinho.set(produtoId, {
            ...item,
            quantidade: Math.min(novaQuantidade, item.produto.estoque)
        });
    }

    salvarCarrinho();
    renderizarProdutos();
}

function criarItemCarrinhoRapido(item) {
    const { produto, quantidade } = item;
    const card = document.createElement("article");
    card.className = "drawer-cart-item";

    const imagemBox = document.createElement("div");
    imagemBox.className = "drawer-item-image";

    if (produto.imagemUrl) {
        const imagem = document.createElement("img");
        imagem.src = produto.imagemUrl;
        imagem.alt = produto.nome;
        imagem.loading = "lazy";
        imagem.decoding = "async";
        imagemBox.append(imagem);
    } else {
        imagemBox.textContent = produto.nome.slice(0, 2).toUpperCase();
    }

    const info = document.createElement("div");
    info.className = "drawer-item-info";

    const nome = document.createElement("p");
    nome.className = "cart-item-title";
    nome.textContent = produto.nome;

    const detalhe = document.createElement("p");
    detalhe.className = "cart-item-detail";
    detalhe.textContent = `${quantidade} x ${formatarMoeda(produto.preco)}`;

    info.append(nome, detalhe);

    const controles = document.createElement("div");
    controles.className = "mini-quantity";

    const diminuir = document.createElement("button");
    diminuir.type = "button";
    diminuir.className = "ghost-button square-button";
    diminuir.textContent = "-";
    diminuir.addEventListener("click", () => alterarQuantidade(produto.id, quantidade - 1));

    const total = document.createElement("strong");
    total.textContent = formatarMoeda(Number(produto.preco) * quantidade);

    const aumentar = document.createElement("button");
    aumentar.type = "button";
    aumentar.className = "ghost-button square-button";
    aumentar.textContent = "+";
    aumentar.disabled = quantidade >= produto.estoque;
    aumentar.addEventListener("click", () => alterarQuantidade(produto.id, quantidade + 1));

    controles.append(diminuir, total, aumentar);
    card.append(imagemBox, info, controles);

    return card;
}

function renderizarCarrinhoRapido() {
    const itens = Array.from(carrinho.values());

    if (itens.length === 0) {
        drawerCartItems.innerHTML = `<div class="empty-state">Seu carrinho esta vazio.</div>`;
    } else {
        drawerCartItems.replaceChildren(...itens.map(criarItemCarrinhoRapido));
    }

    drawerCartTotal.textContent = formatarMoeda(calcularTotal());
}

function abrirCarrinhoRapido() {
    cartDrawer.classList.add("open");
    cartBackdrop.classList.remove("hidden");
}

function fecharCarrinhoRapido() {
    cartDrawer.classList.remove("open");
    cartBackdrop.classList.add("hidden");
}

function criarCardProduto(produto) {
    const card = document.createElement("article");
    card.className = "product-card";

    const quantidadeNoCarrinho = obterQuantidadeNoCarrinho(produto.id);
    const internacional = produtoEhInternacional(produto);
    const estoqueDisponivel = internacional ? 0 : produto.estoque - quantidadeNoCarrinho;
    const disabled = estoqueDisponivel <= 0;

    const info = document.createElement("div");
    info.className = "product-meta";

    const media = document.createElement("div");
    media.className = "product-media";

    if (produto.imagemUrl) {
        const imagem = document.createElement("img");
        imagem.src = produto.imagemUrl;
        imagem.alt = produto.nome;
        media.append(imagem);
    } else {
        media.classList.add("product-media-placeholder");
        media.textContent = produto.nome.slice(0, 2).toUpperCase();
    }

    const nome = document.createElement("h3");
    nome.className = "product-name";
    nome.textContent = produto.nome;

    const preco = document.createElement("p");
    preco.className = "product-price";
    preco.textContent = formatarMoeda(produto.preco);

    const estoque = document.createElement("p");
    estoque.className = "product-stock";
    estoque.textContent = internacional ? "Envio direto do Japao" : (disabled ? "Indisponivel" : `${estoqueDisponivel} disponiveis`);

    const badge = document.createElement("p");
    badge.className = internacional ? "cart-badge product-badge-international" : "cart-badge";
    badge.textContent = internacional
        ? "Cotacao antes do pedido"
        : (quantidadeNoCarrinho > 0 ? `${quantidadeNoCarrinho} no carrinho` : "Pronto para escolher");

    if (produto.categoria) {
        const categoria = document.createElement("p");
        categoria.className = "product-category";
        categoria.textContent = produto.categoriaNome;
        info.append(categoria);
    }
    info.append(nome, preco, estoque, badge);

    const actions = document.createElement("div");
    actions.className = "product-actions";

    if (internacional) {
        const aviso = document.createElement("p");
        aviso.className = "product-note";
        aviso.textContent = "Produto enviado direto do Japao. Frete internacional e taxas de importacao sao combinados antes do pedido.";

        const solicitar = document.createElement("a");
        solicitar.className = "hero-button";
        solicitar.href = "/loja/solicitacao?produtoId=" + encodeURIComponent(String(produto.id)) +
            "&produto=" + encodeURIComponent(produto.nome) +
            "&descricao=" + encodeURIComponent("Tenho interesse neste produto com envio direto do Japao.");
        solicitar.textContent = "Solicitar cotacao";

        actions.classList.add("product-actions-single");
        actions.append(solicitar);
        card.append(media, info, aviso, actions);

        return card;
    }

    const input = document.createElement("input");
    input.type = "number";
    input.inputMode = "numeric";
    input.setAttribute("aria-label", "Quantidade de " + produto.nome);
    input.min = "1";
    input.max = String(Math.max(estoqueDisponivel, 1));
    input.step = "1";
    input.value = "1";
    input.disabled = disabled;

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = disabled ? "Sem estoque" : "Adicionar";
    button.disabled = disabled;
    button.addEventListener("click", () => {
        const quantidade = Number(input.value);

        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            setFeedback("Informe uma quantidade valida.", "error");
            return;
        }

        adicionarAoCarrinho(produto, quantidade);
    });

    actions.append(input, button);
    card.append(media, info, actions);

    return card;
}

function atualizarCategorias() {
    const selecionada = categoryFilter.value;
    const categorias = new Map();
    for (const produto of produtos) {
        if (produto.categoria) categorias.set(produto.categoria, produto.categoriaNome);
    }
    const todas = new Option("Todas as categorias", "");
    const opcoes = [...categorias].sort((a, b) => a[1].localeCompare(b[1], "pt-BR"))
        .map(([valor, nome]) => new Option(nome, valor));
    categoryFilter.replaceChildren(todas, ...opcoes);
    categoryFilter.value = categorias.has(selecionada) ? selecionada : "";
    categoryFilter.disabled = categorias.size === 0;
}

function renderizarProdutos() {
    const visiveis = categoryFilter.value
        ? produtos.filter(produto => produto.categoria === categoryFilter.value)
        : produtos;
    catalogResults.textContent = visiveis.length === 1 ? "1 produto" : visiveis.length + " produtos";
    if (visiveis.length === 0) {
        productsGrid.innerHTML = '<div class="empty-state">Nenhum produto disponível no momento.</div>';
        return;
    }
    productsGrid.replaceChildren(...visiveis.map(criarCardProduto));
}

async function carregarProdutos() {
    if (carregandoProdutos) return;
    carregandoProdutos = true;
    reloadProducts.disabled = true;
    productsGrid.setAttribute("aria-busy", "true");
    try {
        setFeedback("");
        // O carrinho usa o catálogo completo, nunca somente a categoria visível.
        const catalogo = [];
        let pagina = 1;
        let totalPaginas = 1;
        do {
            const resposta = await apiFetch("/produtos?limite=50&publicadoNaLoja=true&pagina=" + pagina);
            catalogo.push(...(resposta.dados ?? resposta));
            totalPaginas = resposta.totalPaginas ?? 1;
            pagina += 1;
        } while (pagina <= totalPaginas);
        produtos = catalogo;
        atualizarCategorias();
        sincronizarCarrinhoComProdutos();
        renderizarProdutos();
    } catch (erro) {
        setFeedback(erro.message, "error");
    } finally {
        carregandoProdutos = false;
        reloadProducts.disabled = false;
        productsGrid.removeAttribute("aria-busy");
    }
}

categoryFilter.addEventListener("change", () => {
    setFeedback("");
    renderizarProdutos();
});

reloadProducts.addEventListener("click", carregarProdutos);
window.addEventListener("storage", () => {
    carrinho = carregarCarrinho();
    atualizarResumoCarrinho();
    renderizarCarrinhoRapido();
    renderizarProdutos();
});

floatingCartButton.addEventListener("click", abrirCarrinhoRapido);
closeCartDrawer.addEventListener("click", fecharCarrinhoRapido);
cartBackdrop.addEventListener("click", fecharCarrinhoRapido);
drawerClearCart.addEventListener("click", () => {
    carrinho.clear();
    salvarCarrinho();
    renderizarProdutos();
    setFeedback("Carrinho limpo.");
});

atualizarResumoCarrinho();
renderizarCarrinhoRapido();
await carregarProdutos();

async function atualizarContaNaVitrine() {
    const saudacao = document.querySelector("#loja-saudacao");
    const link = document.querySelector("#loja-conta-link");
    try {
        const conta = await obterContaCliente();
        saudacao.textContent = conta ? "Bem-vindo, " + conta.cliente.nome.trim().split(/\s+/)[0] + "!" : "";
        saudacao.classList.toggle("hidden", !conta);
        link.textContent = conta ? "Minha conta" : "Entrar / Criar conta";
    } catch {
        saudacao.textContent = "";
        saudacao.classList.add("hidden");
        link.textContent = "Minha conta / Entrar";
    }
}
void atualizarContaNaVitrine();
window.addEventListener("pageshow", evento => { if (evento.persisted) void atualizarContaNaVitrine(); });
