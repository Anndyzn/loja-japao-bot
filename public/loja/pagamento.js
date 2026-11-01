import { criarQuadroPix } from "./pix.js";
import { contaApi } from "./conta-api.js";

export function criarQuadroPagamento(pedido) {
    const mp = pedido.mercadoPago;
    if (!mp?.disponivel && !mp?.iniciada) return criarQuadroPix(pedido);
    if (pedido.status === "cancelado") return null;
    const quadro = document.createElement("section");
    quadro.className = "tracking-card tracking-pix pagamento-mp";
    const titulo = document.createElement("h3");
    titulo.textContent = "Mercado Pago — ambiente de teste";
    const texto = document.createElement("p");
    texto.textContent = mp.revisao ? "Pagamento em revisão. Fale com a loja antes de tentar pagar novamente." :
        pedido.status === "pago" || pedido.status === "enviado" ? "Pagamento de teste confirmado. Não envie mercadoria real." :
        "Teste cartão de crédito no Mercado Pago. Pix aparecerá se disponível nessa conta de teste. Não use cartão ou dinheiro real.";
    const feedback = document.createElement("p");
    feedback.setAttribute("role", "status");
    const acoes = document.createElement("div");
    acoes.className = "payment-actions";
    const id = pedido.pedidoId ?? pedido.id;
    const abrir = document.createElement("button");
    abrir.type = "button";
    abrir.textContent = mp.linkCriado ? "Continuar no Mercado Pago" : "Testar pagamento no Mercado Pago";
    const consultar = document.createElement("button");
    consultar.type = "button";
    consultar.className = "secondary-button";
    consultar.textContent = "Verificar pagamento";
    const encerrada = ["processed", "failed", "canceled", "refunded"].includes(mp.status);
    abrir.hidden = pedido.status !== "pendente" || mp.revisao || encerrada;
    consultar.hidden = !mp.linkCriado;
    abrir.disabled = consultar.disabled = !mp.disponivel;
    const instrucao = document.createElement("p");
    instrucao.className = "result-text";
    instrucao.textContent = !mp.disponivel ? "Consulta temporariamente indisponível. Não faça outro pagamento." :
        mp.linkCriado ? "Se já concluiu o teste, verifique o pagamento aqui. A confirmação depende da consulta ao Mercado Pago." :
        "Clique em Testar pagamento no Mercado Pago para abrir a página de pagamento.";
    abrir.addEventListener("click", async () => {
        abrir.disabled = true;
        feedback.textContent = "Preparando pagamento...";
        try {
            const resultado = await contaApi("/mercado-pago/pedidos/" + id + "/iniciar", {});
            const url = new URL(resultado.url);
            if (url.origin !== "https://www.mercadopago.com.br" || url.pathname !== "/checkout/v1/redirect" || url.username || url.password)
                throw new Error("O link de pagamento não é válido.");
            location.assign(url.href);
        } catch (erro) {
            feedback.textContent = erro.message;
            abrir.disabled = false;
            consultar.hidden = !mp.linkCriado;
        }
    });
    consultar.addEventListener("click", async () => {
        consultar.disabled = true;
        feedback.textContent = "Consultando o Mercado Pago...";
        try {
            const resultado = await contaApi("/mercado-pago/pedidos/" + id + "/consultar", {});
            feedback.textContent = resultado.mensagem;
            abrir.hidden = resultado.status !== "pendente" || resultado.mercadoPago?.revisao ||
                ["processed", "failed", "canceled", "refunded"].includes(resultado.mercadoPago?.status);
            if (resultado.status !== pedido.status)
                location.assign("/loja/acompanhamento?pedido=" + encodeURIComponent(id));
        } catch (erro) { feedback.textContent = erro.message; }
        finally { consultar.disabled = !mp.disponivel; }
    });
    acoes.append(abrir, consultar);
    quadro.append(titulo, texto, acoes, feedback, instrucao);
    return quadro;
}
