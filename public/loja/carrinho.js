import { aplicarConfiguracaoPublica } from "./configuracao.js";
import { criarQuadroPix } from "./pix.js";

void aplicarConfiguracaoPublica("Carrinho");

const checkoutForm = document.querySelector("#checkout-form");
const cartItems = document.querySelector("#cart-items");
const cartTotal = document.querySelector("#cart-total");
const checkoutTotal = document.querySelector("#checkout-total");
const paymentTotal = document.querySelector("#payment-total");
const calcularFreteButton = document.querySelector("#calcular-frete");
const freteSelect = document.querySelector("#frete-opcoes");
const freteFeedback = document.querySelector("#frete-feedback");
let freteOpcoes = [];
let freteConsulta = 0;
let freteSubtotal;
let enviandoPedido = false;
function obterFreteSelecionado() { return freteOpcoes.find(f => f.token === freteSelect.value); }
function invalidarFrete() {
    freteConsulta++;
    freteOpcoes = [];
    freteSubtotal = undefined;
    freteSelect.replaceChildren(new Option("Calcule o frete", ""));
    freteSelect.disabled = true;
    calcularFreteButton.disabled = false;
    freteFeedback.textContent = "Calcule o frete apos informar o CEP.";
    atualizarTotais();
}
const clearCartButton = document.querySelector("#clear-cart");
const feedback = document.querySelector("#store-feedback");
const orderNumber = document.querySelector("#order-number");
const orderStatus = document.querySelector("#order-status");
const trackingLink = document.querySelector("#tracking-link");
const stepTabs = Array.from(document.querySelectorAll("[data-step-target]"));
const stepPanels = Array.from(document.querySelectorAll("[data-step]"));

const cepInput = checkoutForm.elements.cep;
const cepFeedback = document.querySelector("#cep-feedback");
const camposEndereco = {
    endereco: "logradouro",
    bairro: "bairro",
    cidade: "localidade",
    estado: "uf"
};
let cepAtual = "";
let buscaCep = null;
let buscandoCep = false;

function mostrarFeedbackCep(mensagem, tipo = "") {
    cepFeedback.textContent = mensagem;
    cepFeedback.className = ("feedback " + tipo).trim();
}

function cancelarBuscaCep() {
    buscaCep?.abort();
    buscaCep = null;
    buscandoCep = false;
}

async function buscarEnderecoPorCep() {
    const cep = cepInput.value.replace(/\D/g, "");
    cepInput.value = cep.length > 5 ? cep.slice(0, 5) + "-" + cep.slice(5) : cep;
    if (cep === cepAtual) return;
    cepAtual = cep;
    cancelarBuscaCep();

    // Não reutiliza rua e cidade de um CEP anterior.
    for (const campo of Object.keys(camposEndereco)) {
        checkoutForm.elements[campo].value = "";
    }
    if (cep.length !== 8) {
        mostrarFeedbackCep("Digite os 8 dígitos do CEP.");
        return;
    }

    const consulta = new AbortController();
    buscaCep = consulta;
    buscandoCep = true;
    mostrarFeedbackCep("Buscando endereço...");
    const tempoLimite = setTimeout(() => consulta.abort(), 8000);
    // Preserva correções que o cliente fizer enquanto a busca estiver em andamento.
    const valoresIniciais = Object.fromEntries(Object.keys(camposEndereco).map(campo => [campo, checkoutForm.elements[campo].value]));

    try {
        const resposta = await fetch("https://viacep.com.br/ws/" + cep + "/json/", {
            signal: consulta.signal
        });
        if (!resposta.ok) throw new Error("Falha na consulta");
        const endereco = await resposta.json();
        if (buscaCep !== consulta) return;
        if (!endereco || typeof endereco !== "object") throw new Error("Resposta inválida");
        if (endereco.erro) {
            mostrarFeedbackCep("CEP não encontrado. Confira o CEP ou preencha o endereço manualmente.", "error");
            return;
        }
        for (const [campo, propriedade] of Object.entries(camposEndereco)) {
            const input = checkoutForm.elements[campo];
            if (input.value === valoresIniciais[campo]) {
                input.value = typeof endereco[propriedade] === "string" ? endereco[propriedade] : "";
            }
        }
        mostrarFeedbackCep("Confira o endereço e informe o número. Complete os campos que estiverem vazios.", "success");
    } catch {
        if (buscaCep !== consulta) return;
        mostrarFeedbackCep("Não foi possível buscar o CEP. Preencha o endereço manualmente.", "error");
    } finally {
        clearTimeout(tempoLimite);
        if (buscaCep === consulta) {
            buscaCep = null;
            buscandoCep = false;
        }
    }
}

cepInput.addEventListener("input", buscarEnderecoPorCep);
cepInput.addEventListener("input", invalidarFrete);
cepInput.addEventListener("change", invalidarFrete);
cepInput.addEventListener("change", buscarEnderecoPorCep);
checkoutForm.addEventListener("reset", () => {
    cancelarBuscaCep();
    cepAtual = "";
    mostrarFeedbackCep("Digite o CEP para buscar o endereço.");
});

const CHAVE_CARRINHO = "lojaJapaoCarrinho";
const CHAVE_TELEFONE_ACOMPANHAMENTO = "lojaJapaoTelefoneAcompanhamento";
const ORDEM_ETAPAS = ["resumo", "entrega", "pagamento", "acompanhamento"];

let produtos = [];
let carrinho = carregarCarrinho();
let pedidoCriado = undefined;
let etapaAtual = "resumo";

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

function obterTexto(formData, campo) {
    return String(formData.get(campo) ?? "").trim();
}

function obterTextoOpcional(formData, campo) {
    const texto = obterTexto(formData, campo);

    return texto === "" ? undefined : texto;
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

function calcularTotal() {
    return Array.from(carrinho.values()).reduce((total, item) => {
        return total + Number(item.produto.preco) * item.quantidade;
    }, 0);
}

function sincronizarCarrinhoComProdutos() {
    let mudou = false;

    for (const [produtoId, item] of carrinho) {
        const produtoAtualizado = produtos.find((produto) => produto.id === produtoId);

        if (!produtoAtualizado || produtoAtualizado.estoque <= 0 || produtoAtualizado.tipoEnvio === "internacional_direto") {
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
        setFeedback("Carrinho atualizado com o estoque atual.", "success");
    }
}

function definirEtapa(etapa) {
    etapaAtual = etapa;

    stepPanels.forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.step === etapa);
    });

    stepTabs.forEach((tab) => {
        const target = tab.dataset.stepTarget;
        tab.classList.toggle("active", target === etapa);
        tab.disabled = target === "acompanhamento" && !pedidoCriado;
    });
}

function etapaIndice(etapa) {
    return ORDEM_ETAPAS.indexOf(etapa);
}

function validarCarrinho() {
    if (carrinho.size > 0) {
        return true;
    }

    definirEtapa("resumo");
    setFeedback("Adicione ao menos um produto ao carrinho.", "error");

    return false;
}

function validarEntrega() {
    if (buscandoCep) {
        definirEtapa("entrega");
        mostrarFeedbackCep("Aguarde a busca do endereço terminar.");
        return false;
    }
    const entrega = document.querySelector('[data-step="entrega"]');
    const campoInvalido = Array.from(entrega.querySelectorAll("input, select, textarea")).find((campo) => {
        return !campo.checkValidity();
    });

    if (!campoInvalido) {
        return true;
    }

    definirEtapa("entrega");
    setTimeout(() => campoInvalido.reportValidity());

    return false;
}

function podeIrParaEtapa(etapa) {
    if (etapaIndice(etapa) >= etapaIndice("entrega") && !validarCarrinho()) {
        return false;
    }

    if (etapaIndice(etapa) >= etapaIndice("pagamento") && !validarEntrega()) {
        return false;
    }

    if (etapa === "acompanhamento" && !pedidoCriado) {
        return false;
    }

    return true;
}

function atualizarTotais() {
    const subtotal = freteSubtotal ?? calcularTotal();
    const frete = obterFreteSelecionado();
    cartTotal.textContent = formatarMoeda(calcularTotal());
    document.querySelector("#frete-subtotal").textContent = formatarMoeda(subtotal);
    document.querySelector("#frete-valor").textContent = frete ? formatarMoeda(frete.valor) : "A calcular";
    checkoutTotal.textContent = frete ? formatarMoeda(subtotal + frete.valor) : formatarMoeda(subtotal) + " + frete";
    paymentTotal.textContent = frete ? formatarMoeda(subtotal + frete.valor) : "Selecione a entrega";
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
    renderizarCarrinho();
}

function criarLinhaCarrinho(item) {
    const { produto, quantidade } = item;
    const linha = document.createElement("article");
    linha.className = "cart-item checkout-cart-item";

    const imagemBox = document.createElement("div");
    imagemBox.className = "checkout-item-image";

    if (produto.imagemUrl) {
        const imagem = document.createElement("img");
        imagem.src = produto.imagemUrl;
        imagem.alt = produto.nome;
        imagemBox.append(imagem);
    } else {
        imagemBox.textContent = produto.nome.slice(0, 2).toUpperCase();
    }

    const info = document.createElement("div");

    const titulo = document.createElement("p");
    titulo.className = "cart-item-title";
    titulo.textContent = produto.nome;

    const detalhe = document.createElement("p");
    detalhe.className = "cart-item-detail";
    detalhe.textContent = `${formatarMoeda(produto.preco)} cada`;

    info.append(titulo, detalhe);

    const controles = document.createElement("div");
    controles.className = "quantity-controls";

    const diminuir = document.createElement("button");
    diminuir.type = "button";
    diminuir.className = "ghost-button square-button";
    diminuir.textContent = "-";
    diminuir.addEventListener("click", () => alterarQuantidade(produto.id, quantidade - 1));

    const quantidadeTexto = document.createElement("strong");
    quantidadeTexto.textContent = String(quantidade);

    const aumentar = document.createElement("button");
    aumentar.type = "button";
    aumentar.className = "ghost-button square-button";
    aumentar.textContent = "+";
    aumentar.disabled = quantidade >= produto.estoque;
    aumentar.addEventListener("click", () => alterarQuantidade(produto.id, quantidade + 1));

    controles.append(diminuir, quantidadeTexto, aumentar);

    const subtotal = document.createElement("strong");
    subtotal.className = "cart-subtotal";
    subtotal.textContent = formatarMoeda(Number(produto.preco) * quantidade);

    linha.append(imagemBox, info, controles, subtotal);

    return linha;
}

function renderizarCarrinho() {
    invalidarFrete();
    const itens = Array.from(carrinho.values());
    const botaoAvancar = document.querySelector('[data-next-step="entrega"]');

    if (itens.length === 0) {
        cartItems.innerHTML = `<div class="empty-state">Seu carrinho esta vazio.</div>`;
    } else {
        cartItems.replaceChildren(...itens.map(criarLinhaCarrinho));
    }

    if (botaoAvancar) {
        botaoAvancar.disabled = itens.length === 0;
    }

    atualizarTotais();
}

function renderizarPedidoCriado(pedido) {
    checkoutTotal.textContent = formatarMoeda(pedido.total);
    paymentTotal.textContent = formatarMoeda(pedido.total);
    orderNumber.textContent = `Pedido #${pedido.id}`;
    const status = pedido.status === "pendente" ? "Aguardando pagamento" : pedido.status;
    orderStatus.textContent = `${status} - produtos ${formatarMoeda(pedido.subtotalProdutos)} + frete ${formatarMoeda(pedido.freteValor)} = ${formatarMoeda(pedido.total)}. ${pedido.freteTransportadora} / ${pedido.freteServico}: ${pedido.fretePrazoDias} dias uteis apos postagem.${pedido.freteAmbiente === "sandbox" ? " SIMULACAO DE FRETE." : ""}`;
    const quadroPix = criarQuadroPix(pedido);
    document.querySelector("#order-pix").replaceChildren(...(quadroPix ? [quadroPix] : []));
    trackingLink.href = `/loja/acompanhamento?pedido=${pedido.id}`;
    trackingLink.textContent = `Acompanhar pedido #${pedido.id}`;
}

async function carregarProdutos() {
    const resposta = await apiFetch("/produtos?limite=50&publicadoNaLoja=true");
    produtos = resposta.dados ?? resposta;
    sincronizarCarrinhoComProdutos();
    renderizarCarrinho();
}

calcularFreteButton.addEventListener("click", async () => {
    if (!validarCarrinho() || !validarEntrega()) return;
    invalidarFrete();
    const consulta = freteConsulta;
    calcularFreteButton.disabled = true;
    freteFeedback.textContent = "Consultando opcoes de entrega...";
    try {
        const resposta = await apiFetch("/fretes/cotacao", {method:"POST",body:JSON.stringify({cep:cepInput.value,itens:Array.from(carrinho.values()).map(i=>({produtoId:i.produto.id,quantidade:i.quantidade}))})});
        if (consulta !== freteConsulta) return;
        freteOpcoes = resposta.opcoes;
        freteSubtotal = resposta.subtotalProdutos;
        freteSelect.replaceChildren(new Option("Selecione a entrega", ""), ...freteOpcoes.map(f=>new Option(f.transportadora + " / " + f.servico + " - " + formatarMoeda(f.valor) + " - " + f.prazoDias + " dias uteis apos postagem" + (f.ambiente === "sandbox" ? " (SIMULACAO)" : ""), f.token)));
        freteSelect.disabled = false;
        freteFeedback.textContent = "Escolha a entrega. Cotacao valida por 15 minutos.";
        atualizarTotais();
    } catch (erro) {
        if (consulta === freteConsulta) freteFeedback.textContent = erro.message;
    } finally {
        if (consulta === freteConsulta) calcularFreteButton.disabled = false;
    }
});
freteSelect.addEventListener("change", atualizarTotais);

async function finalizarPedido(evento) {
    evento.preventDefault();

    if (!validarCarrinho() || !validarEntrega()) {
        return;
    }

    const metodo = checkoutForm.elements.metodo;

    if (!metodo.checkValidity()) {
        definirEtapa("pagamento");
        setTimeout(() => metodo.reportValidity());
        return;
    }

    if (enviandoPedido) return;
    const frete = obterFreteSelecionado();
    if (!frete || frete.expiraEm <= Date.now()) {
        definirEtapa("pagamento");
        setFeedback("Calcule e selecione um frete valido antes de finalizar.", "error"); return;
    }
    const itensPedido = Array.from(carrinho.values()).map(i=>({produtoId:i.produto.id,quantidade:i.quantidade}));
    const formData = new FormData(checkoutForm);
    const telefonePedido = obterTexto(formData, "telefone");

    enviandoPedido = true;
    checkoutForm.inert = true;
    try {
        setFeedback("Enviando pedido...");

        const cliente = await apiFetch("/clientes", {
            method: "POST",
            body: JSON.stringify({
                nome: obterTexto(formData, "nome"),
                telefone: telefonePedido,
                email: obterTextoOpcional(formData, "email"),
                cep: obterTexto(formData, "cep"),
                endereco: obterTexto(formData, "endereco"),
                numero: obterTexto(formData, "numero"),
                complemento: obterTextoOpcional(formData, "complemento"),
                bairro: obterTexto(formData, "bairro"),
                cidade: obterTexto(formData, "cidade"),
                estado: obterTexto(formData, "estado").toUpperCase(),
                referencia: obterTextoOpcional(formData, "referencia")
            })
        });

        const pedido = await apiFetch("/pedidos", {
            method: "POST",
            body: JSON.stringify({
                clienteId: cliente.id,
                observacao: obterTextoOpcional(formData, "observacao"),
                freteToken: frete.token,
                itens: itensPedido
            })
        });

        pedidoCriado = pedido;
        sessionStorage.setItem(CHAVE_TELEFONE_ACOMPANHAMENTO, telefonePedido);
        carrinho.clear();
        salvarCarrinho();
        renderizarCarrinho();
        checkoutForm.reset();
        renderizarPedidoCriado(pedido);
        definirEtapa("acompanhamento");
        setFeedback(`Pedido ${pedido.id} criado. Aguardando pagamento e confirmacao da loja.`, "success");
    } catch (erro) {
        setFeedback(erro.message, "error");
    } finally {
        enviandoPedido = false;
        checkoutForm.inert = false;
    }
}

stepTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        const etapa = tab.dataset.stepTarget;

        if (podeIrParaEtapa(etapa)) {
            definirEtapa(etapa);
            setFeedback("");
        }
    });
});

document.querySelectorAll("[data-next-step]").forEach((button) => {
    button.addEventListener("click", () => {
        const etapa = button.dataset.nextStep;

        if (podeIrParaEtapa(etapa)) {
            definirEtapa(etapa);
            setFeedback("");
        }
    });
});

document.querySelectorAll("[data-previous-step]").forEach((button) => {
    button.addEventListener("click", () => {
        definirEtapa(button.dataset.previousStep);
        setFeedback("");
    });
});

clearCartButton.addEventListener("click", () => {
    carrinho.clear();
    salvarCarrinho();
    renderizarCarrinho();
    setFeedback("Carrinho limpo.");
});

checkoutForm.addEventListener("submit", finalizarPedido);

try {
    await carregarProdutos();
} catch (erro) {
    renderizarCarrinho();
    setFeedback(erro.message, "error");
}

definirEtapa("resumo");
