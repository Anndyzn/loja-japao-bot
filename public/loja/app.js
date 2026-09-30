const productsGrid = document.querySelector("#products-grid");
const reloadProducts = document.querySelector("#reload-products");
const cartItems = document.querySelector("#cart-items");
const cartTotal = document.querySelector("#cart-total");
const clearCartButton = document.querySelector("#clear-cart");
const checkoutForm = document.querySelector("#checkout-form");
const feedback = document.querySelector("#store-feedback");

let produtos = [];
const carrinho = new Map();

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

function calcularTotal() {
    return Array.from(carrinho.values()).reduce((total, item) => {
        return total + item.produto.preco * item.quantidade;
    }, 0);
}

function renderizarCarrinho() {
    const itens = Array.from(carrinho.values());

    if (itens.length === 0) {
        cartItems.innerHTML = `<p class="feedback">Seu carrinho esta vazio.</p>`;
    } else {
        cartItems.replaceChildren(...itens.map(({ produto, quantidade }) => {
            const item = document.createElement("article");
            item.className = "cart-item";

            const info = document.createElement("div");
        const titulo = document.createElement("p");
        titulo.className = "cart-item-title";
        titulo.textContent = produto.nome;

        const detalhe = document.createElement("p");
        detalhe.className = "cart-item-detail";
        detalhe.textContent = `${quantidade} x ${formatarMoeda(produto.preco)}`;

        info.append(titulo, detalhe);

            const remover = document.createElement("button");
            remover.type = "button";
            remover.className = "ghost-button";
            remover.textContent = "-";
            remover.addEventListener("click", () => removerDoCarrinho(produto.id));

            item.append(info, remover);
            return item;
        }));
    }

    cartTotal.textContent = formatarMoeda(calcularTotal());
    renderizarProdutos();
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

    setFeedback(`${produto.nome} adicionado ao carrinho.`, "success");
    renderizarCarrinho();
}

function removerDoCarrinho(produtoId) {
    const item = carrinho.get(produtoId);

    if (!item) {
        return;
    }

    if (item.quantidade <= 1) {
        carrinho.delete(produtoId);
    } else {
        carrinho.set(produtoId, {
            ...item,
            quantidade: item.quantidade - 1
        });
    }

    renderizarCarrinho();
}

function criarCardProduto(produto) {
    const card = document.createElement("article");
    card.className = "product-card";

    const quantidadeNoCarrinho = obterQuantidadeNoCarrinho(produto.id);
    const estoqueDisponivel = produto.estoque - quantidadeNoCarrinho;
    const disabled = estoqueDisponivel <= 0;

    const info = document.createElement("div");
    info.className = "product-meta";

    const nome = document.createElement("h3");
    nome.className = "product-name";
    nome.textContent = produto.nome;

    const preco = document.createElement("p");
    preco.className = "product-price";
    preco.textContent = formatarMoeda(produto.preco);

    const estoque = document.createElement("p");
    estoque.className = "product-stock";
    estoque.textContent = disabled ? "Indisponivel" : `${estoqueDisponivel} disponiveis`;

    info.append(nome, preco, estoque);

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
    card.append(info, actions);

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
    setFeedback("");
    const resposta = await apiFetch("/produtos?limite=50");
    produtos = resposta.dados ?? resposta;
    renderizarProdutos();
    renderizarCarrinho();
}

async function finalizarPedido(evento) {
    evento.preventDefault();

    if (carrinho.size === 0) {
        setFeedback("Adicione ao menos um produto ao carrinho.", "error");
        return;
    }

    const formData = new FormData(checkoutForm);
    const nome = String(formData.get("nome")).trim();
    const telefone = String(formData.get("telefone")).trim();
    const endereco = String(formData.get("endereco")).trim();
    const metodo = String(formData.get("metodo"));

    try {
        setFeedback("Enviando pedido...");

        const cliente = await apiFetch("/clientes", {
            method: "POST",
            body: JSON.stringify({
                nome,
                telefone,
                endereco
            })
        });

        const pedido = await apiFetch("/pedidos", {
            method: "POST",
            body: JSON.stringify({
                clienteId: cliente.id,
                itens: Array.from(carrinho.values()).map(({ produto, quantidade }) => {
                    return {
                        produtoId: produto.id,
                        quantidade
                    };
                })
            })
        });

        await apiFetch("/pagamentos", {
            method: "POST",
            body: JSON.stringify({
                pedidoId: pedido.id,
                metodo
            })
        });

        carrinho.clear();
        checkoutForm.reset();
        await carregarProdutos();
        setFeedback(`Pedido ${pedido.id} criado. Acompanhe em /pedidos/${pedido.id}/acompanhamento`, "success");
    } catch (erro) {
        setFeedback(erro.message, "error");
    }
}

reloadProducts.addEventListener("click", carregarProdutos);
clearCartButton.addEventListener("click", () => {
    carrinho.clear();
    renderizarCarrinho();
    setFeedback("Carrinho limpo.");
});
checkoutForm.addEventListener("submit", finalizarPedido);

await carregarProdutos();
