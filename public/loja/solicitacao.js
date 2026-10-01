const form = document.querySelector("#solicitacao-form");
const enviar = document.querySelector("#solicitacao-enviar");
const feedback = document.querySelector("#solicitacao-feedback");
const nova = document.querySelector("#solicitacao-nova");
let enviando = false;
let concluida = false;

function mostrarMensagem(texto, tipo = "") {
    feedback.textContent = texto;
    feedback.className = ("feedback " + tipo).trim();
}

form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (enviando || concluida) return;
    const dados = Object.fromEntries(new FormData(form));
    for (const campo of Object.keys(dados)) dados[campo] = String(dados[campo]).trim();
    if (!dados.linkReferencia) delete dados.linkReferencia;
    if (!dados.nome || !dados.telefone || !dados.nomeProduto || !dados.descricao) {
        mostrarMensagem("Preencha nome, telefone, produto e descrição.", "error");
        return;
    }
    enviando = true;
    enviar.disabled = true;
    mostrarMensagem("Enviando solicitação...");
    try {
        const resposta = await fetch("/solicitacoes/publica", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
        const resultado = await resposta.json();
        if (!resposta.ok) throw new Error(resultado.mensagem ?? "Não foi possível enviar a solicitação.");
        concluida = true;
        form.classList.add("hidden");
        nova.classList.remove("hidden");
        mostrarMensagem("Solicitação #" + resultado.id + " recebida! Aguarde nosso contato pelo telefone informado.", "success");
        feedback.focus();
    } catch (erro) {
        mostrarMensagem(erro.message || "Não foi possível enviar. Confira sua conexão e tente novamente.", "error");
    } finally {
        enviando = false;
        enviar.disabled = false;
    }
});

nova.addEventListener("click", () => {
    form.reset();
    concluida = false;
    form.classList.remove("hidden");
    nova.classList.add("hidden");
    mostrarMensagem("");
    form.elements.nome.focus();
});
