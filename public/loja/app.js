const productsGrid = document.querySelector("#products-grid");
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
let carrinho = carregarCarrinho();

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

function sincronizarCarrinhoComProdutos() {
    let mudou = false;

    for (const [produtoId, item] of carrinho) {
        const produtoAtualizado = produtos.find((produto) => produto.id === produtoId);

        if (!produtoAtualizado || produtoAtualizado.estoque <= 0) {
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
    const estoqueDisponivel = produto.estoque - quantidadeNoCarrinho;
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
    estoque.textContent = disabled ? "Indisponivel" : `${estoqueDisponivel} disponiveis`;

    const badge = document.createElement("p");
    badge.className = "cart-badge";
    badge.textContent = quantidadeNoCarrinho > 0 ? `${quantidadeNoCarrinho} no carrinho` : "Pronto para escolher";

    info.append(nome, preco, estoque, badge);

    const actions = document.createElement("div");
    actions.className = "product-actions";

    const input = document.createElement("input");
    input.type = "number";
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

function renderizarProdutos() {
    if (produtos.length === 0) {
        productsGrid.innerHTML = `<div class="empty-state">Nenhum produto disponivel no momento.</div>`;
        return;
    }

    productsGrid.replaceChildren(...produtos.map(criarCardProduto));
}

async function carregarProdutos() {
    try {
        setFeedback("");
        const resposta = await apiFetch("/produtos?limite=50&publicadoNaLoja=true");
        produtos = resposta.dados ?? resposta;
        sincronizarCarrinhoComProdutos();
        renderizarProdutos();
    } catch (erro) {
        setFeedback(erro.message, "error");
    }
}

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
