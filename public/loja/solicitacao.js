import { aplicarConfiguracaoPublica } from "./configuracao.js";
import { contaApi, exigirContaNaPagina, urlLoginPara } from "./conta-api.js";

void aplicarConfiguracaoPublica("Solicitar produto");
const form = document.querySelector("#solicitacao-form");
const enviar = document.querySelector("#solicitacao-enviar");
const feedback = document.querySelector("#solicitacao-feedback");
const nova = document.querySelector("#solicitacao-nova");
let contaAtual = null;
let enviando = false;
let concluida = false;
let produtoIdVinculado;

function preencherCamposPelaUrl() {
    const params = new URLSearchParams(window.location.search);
    const produtoId = Number(params.get("produtoId"));
    if (Number.isSafeInteger(produtoId) && produtoId > 0) produtoIdVinculado = produtoId;
    if (params.get("produto")) form.elements.nomeProduto.value = params.get("produto").slice(0, 200);
    for (const campo of ["descricao", "linkReferencia"]) {
        if (params.get(campo)) form.elements[campo].value = params.get(campo).slice(0, 2000);
    }
}
function mostrarMensagem(texto, tipo = "") {
    feedback.textContent = texto;
    feedback.className = ("feedback " + tipo).trim();
}
form.addEventListener("submit", async evento => {
    evento.preventDefault();
    if (!contaAtual || enviando || concluida) return;
    const dados = Object.fromEntries(new FormData(form));
    for (const campo of Object.keys(dados)) dados[campo] = String(dados[campo]).trim();
    if (!dados.linkReferencia) delete dados.linkReferencia;
    if (produtoIdVinculado) dados.produtoId = produtoIdVinculado;
    if (!dados.nomeProduto || !dados.descricao) {
        mostrarMensagem("Preencha o produto e a descricao.", "error");
        return;
    }
    enviando = true;
    enviar.disabled = true;
    mostrarMensagem("Enviando solicitacao...");
    try {
        const resultado = await contaApi("/solicitacoes/publica", dados);
        concluida = true;
        form.classList.add("hidden");
        nova.classList.remove("hidden");
        document.querySelector("#solicitacao-acompanhar").classList.remove("hidden");
        mostrarMensagem("Solicitacao #" + resultado.id + " recebida! Entraremos em contato pelo telefone da sua conta.", "success");
        feedback.focus();
    } catch (erro) {
        if (erro.status === 401) {
            const retorno = new URLSearchParams({ produto: dados.nomeProduto, descricao: dados.descricao });
            if (dados.produtoId) retorno.set("produtoId", String(dados.produtoId));
            if (dados.linkReferencia) retorno.set("linkReferencia", dados.linkReferencia);
            location.assign(urlLoginPara("solicitacao", retorno.toString()));
        }
        mostrarMensagem(erro.message || "Nao foi possivel enviar. Confira sua conexao e tente novamente.", "error");
    } finally {
        enviando = false;
        enviar.disabled = false;
    }
});
nova.addEventListener("click", () => {
    form.reset();
    produtoIdVinculado = undefined;
    concluida = false;
    form.classList.remove("hidden");
    nova.classList.add("hidden");
    document.querySelector("#solicitacao-acompanhar").classList.add("hidden");
    mostrarMensagem("");
    form.elements.nomeProduto.focus();
});
try {
    contaAtual = await exigirContaNaPagina("solicitacao");
    if (contaAtual) {
        document.querySelector("#solicitacao-conta").textContent = "Solicitando como " + contaAtual.cliente.nome + ". Contato: " + contaAtual.cliente.telefone;
        preencherCamposPelaUrl();
        form.classList.remove("hidden");
    }
} catch (erro) {
    document.querySelector("#solicitacao-conta").textContent = "Nao foi possivel conferir sua conta. Atualize a pagina para tentar novamente.";
    mostrarMensagem(erro.message, "error");
}
