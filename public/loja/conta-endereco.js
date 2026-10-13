import { contaApi } from "./conta-api.js";
import { prepararFormularioConta } from "./conta-formulario.js";
import { instalarBuscaCep, camposEnderecoConta, enderecoCompleto, validarCamposEndereco } from "./endereco.js";
export function iniciarEnderecoConta() {
    const el = id => document.getElementById(id);
    const form = el("conta-endereco"), resumo = el("endereco-resumo"), aviso = el("endereco-feedback");
    const busca = instalarBuscaCep(form, el("endereco-cep-feedback"), () => {
        for (const campo of ["endereco", "bairro", "cidade", "estado"]) form.elements[campo].dispatchEvent(new Event("input", { bubbles: true }));
    });
    const validacao = prepararFormularioConta(form, "endereco", validarCamposEndereco);
    let cliente = null, versao = 0;
    const feedback = (texto, erro = false) => { aviso.textContent = texto; aviso.hidden = !texto; aviso.classList.toggle("conta-aviso-erro", erro); };
    function preencher() {
        for (const campo of camposEnderecoConta) form.elements[campo].value = cliente?.[campo] ?? "";
        busca.sincronizar();
        for (const campo of camposEnderecoConta) form.elements[campo].dispatchEvent(new Event("input", { bubbles: true })); feedback("");
    }
    function carregar(atual) {
        cliente = atual; versao++;
        const completo = enderecoCompleto(cliente);
        resumo.textContent = completo ? [cliente.endereco + ", " + cliente.numero, cliente.complemento, cliente.bairro, cliente.cidade + " / " + cliente.estado, "CEP " + cliente.cep, cliente.referencia].filter(Boolean).join(" — ") : "Você ainda não tem um endereço completo salvo. Adicione para agilizar suas compras e solicitações.";
        el("editar-endereco").textContent = completo ? "Editar endereço" : "Adicionar endereço";
        form.classList.add("hidden"); busca.cancelar();
        if (location.hash === "#endereco") abrir();
    }
    function abrir() { if (!cliente) return; preencher(); form.classList.remove("hidden"); form.elements.cep.focus(); }
    el("editar-endereco").addEventListener("click", abrir);
    el("cancelar-endereco").addEventListener("click", () => { busca.cancelar(); form.classList.add("hidden"); el("editar-endereco").focus(); });
    window.addEventListener("hashchange", () => { if (location.hash === "#endereco") abrir(); });
    form.addEventListener("submit", async evento => {
        evento.preventDefault(); if (form.inert || !cliente) return;
        if (busca.buscando) { feedback("Aguarde a busca do CEP ou preencha o endereço após a consulta."); return; }
        if (!validacao.validar()) { feedback("Confira os campos destacados.", true); return; }
        const dados = Object.fromEntries(new FormData(form)), atual = versao;
        form.inert = true; feedback("Salvando endereço...");
        try {
            const resposta = await contaApi("/conta/endereco", dados);
            if (atual !== versao) return;
            // Evita reabrir o editor apos salvar um link #endereco.
            if (location.hash === "#endereco") history.replaceState(null, "", location.pathname + location.search);
            carregar(resposta.cliente); resumo.textContent = "Endereço salvo. " + resumo.textContent; el("editar-endereco").focus();
        } catch (erro) {
            if (atual !== versao) return;
            form.inert = false; validacao.errosServidor(erro.campos); feedback(erro.message, true);
        } finally { form.inert = false; }
    });
    return { carregar, limpar() { cliente = null; versao++; busca.cancelar(); form.reset(); form.classList.add("hidden"); resumo.textContent = ""; } };
}
