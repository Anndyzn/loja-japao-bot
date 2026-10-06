export function criarQuadroPix(pedido) {
    if (pedido.status !== "pendente" || pedido.pagamento?.status === "aprovado") {
        return null;
    }

    const quadro = document.createElement("section");
    quadro.className = "tracking-card";
    const titulo = document.createElement("h3");
    titulo.textContent = "Pagamento por Pix";
    quadro.append(titulo);

    const orientacao = document.createElement("p");
    if (!pedido.pix?.chave || !pedido.pix?.recebedor) {
        orientacao.textContent = "Os dados para Pix ainda nao estao disponiveis. Entre em contato com a loja para receber as instrucoes de pagamento.";
        quadro.append(orientacao);
        return quadro;
    }

    const valor = document.createElement("p");
    valor.textContent = "Valor: " + Number(pedido.total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const recebedor = document.createElement("p");
    recebedor.textContent = "Recebedor: " + pedido.pix.recebedor;
    const rotulo = document.createElement("label");
    rotulo.textContent = "Chave Pix";
    const chave = document.createElement("input");
    chave.type = "text";
    chave.readOnly = true;
    chave.value = pedido.pix.chave;
    rotulo.append(chave);

    const copiar = document.createElement("button");
    copiar.type = "button";
    copiar.textContent = "Copiar chave Pix";
    const feedback = document.createElement("p");
    feedback.setAttribute("role", "status");
    copiar.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(pedido.pix.chave);
            feedback.textContent = "Chave copiada. Abra o aplicativo do seu banco e escolha pagar por chave Pix.";
        } catch {
            chave.focus();
            chave.select();
            feedback.textContent = "Nao foi possivel copiar automaticamente. A chave esta selecionada para voce copiar manualmente.";
        }
    });

    orientacao.textContent = "No aplicativo do banco, escolha Pix por chave, cole a chave e informe o valor acima. Confira o recebedor antes de confirmar. Se ja pagou, aguarde a confirmacao da loja; nao pague novamente. O pedido continua pendente ate a conferencia manual.";
    quadro.append(valor, recebedor, rotulo, copiar, feedback, orientacao);
    return quadro;
}
