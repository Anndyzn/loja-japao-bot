export function idEhInvalido(id: number) {
    return !Number.isInteger(id) || id <= 0;
}

export function validarCriacaoProduto(nome: unknown, preco: unknown, estoque: unknown) {
    if (typeof nome !== "string" || nome.trim() === "") {
        return "Nome deve ser um texto não vazio";
    }

    if (typeof preco !== "number" || preco <= 0) {
        return "Preço deve ser um número maior que zero";
    }

    if (typeof estoque !== "number" || !Number.isInteger(estoque) || estoque < 0) {
        return "Estoque deve ser um número inteiro maior ou igual a zero";
    }

    return undefined;
}

export function validarAtualizacaoProduto(nome: unknown, preco: unknown, estoque: unknown) {
    if (nome === undefined && preco === undefined && estoque === undefined) {
        return "Informe ao menos um campo para atualizar";
    }

    if (nome !== undefined && (typeof nome !== "string" || nome.trim() === "")) {
        return "Nome deve ser um texto não vazio";
    }

    if (preco !== undefined && (typeof preco !== "number" || preco <= 0)) {
        return "Preço deve ser um número maior que zero";
    }

    if (estoque !== undefined && (typeof estoque !== "number" || !Number.isInteger(estoque) || estoque < 0)) {
        return "Estoque deve ser um número inteiro maior ou igual a zero";
    }

    return undefined;
}

export function validarCriacaoCliente(nome: unknown, telefone: unknown, endereco: unknown) {
    if (typeof nome !== "string" || nome.trim() === "") {
        return "Nome deve ser um texto não vazio";
    }

    if (typeof telefone !== "string" || telefone.trim() === "") {
        return "Telefone deve ser um texto não vazio";
    }

    if (typeof endereco !== "string" || endereco.trim() === "") {
        return "Endereço deve ser um texto não vazio";
    }

    return undefined;
}

export function validarAtualizacaoCliente(nome: unknown, telefone: unknown, endereco: unknown) {
    if (nome === undefined && telefone === undefined && endereco === undefined) {
        return "Informe ao menos um campo para atualizar";
    }

    if (nome !== undefined && (typeof nome !== "string" || nome.trim() === "")) {
        return "Nome deve ser um texto não vazio";
    }

    if (telefone !== undefined && (typeof telefone !== "string" || telefone.trim() === "")) {
        return "Telefone deve ser um texto não vazio";
    }

    if (endereco !== undefined && (typeof endereco !== "string" || endereco.trim() === "")) {
        return "Endereço deve ser um texto não vazio";
    }

    return undefined;
}

export function validarCriacaoPedido(clienteId: unknown, itens: unknown) {
    if (typeof clienteId !== "number" || idEhInvalido(clienteId)) {
        return "Cliente ID deve ser um número inteiro positivo";
    }

    if (!Array.isArray(itens) || itens.length === 0) {
        return "Pedido deve ter ao menos um item";
    }

    for (const item of itens) {
        if (typeof item !== "object" || item === null) {
            return "Cada item do pedido deve ser um objeto";
        }

        const { produtoId, quantidade } = item as {
            produtoId?: unknown;
            quantidade?: unknown;
        };

        if (typeof produtoId !== "number" || idEhInvalido(produtoId)) {
            return "Produto ID deve ser um número inteiro positivo";
        }

        if (typeof quantidade !== "number" || !Number.isInteger(quantidade) || quantidade <= 0) {
            return "Quantidade deve ser um número inteiro maior que zero";
        }
    }

    return undefined;
}

export function validarAtualizacaoStatusPedido(status: unknown) {
    const statusValidos = ["pendente", "pago", "enviado", "cancelado"];

    if (typeof status !== "string" || !statusValidos.includes(status)) {
        return "Status deve ser pendente, pago, enviado ou cancelado";
    }

    return undefined;
}

export function validarCriacaoSolicitacao(
    clienteId: unknown,
    nomeProduto: unknown,
    descricao: unknown,
    linkReferencia: unknown
) {
    if (typeof clienteId !== "number" || idEhInvalido(clienteId)) {
        return "Cliente ID deve ser um número inteiro positivo";
    }

    if (typeof nomeProduto !== "string" || nomeProduto.trim() === "") {
        return "Nome do produto deve ser um texto não vazio";
    }

    if (typeof descricao !== "string" || descricao.trim() === "") {
        return "Descrição deve ser um texto não vazio";
    }

    if (linkReferencia !== undefined && (typeof linkReferencia !== "string" || linkReferencia.trim() === "")) {
        return "Link de referência deve ser um texto não vazio";
    }

    return undefined;
}

export function validarAtualizacaoStatusSolicitacao(status: unknown) {
    const statusValidos = ["recebida", "em_analise", "cotada", "aprovada", "recusada", "cancelada"];

    if (typeof status !== "string" || !statusValidos.includes(status)) {
        return "Status deve ser recebida, em_analise, cotada, aprovada, recusada ou cancelada";
    }

    return undefined;
}

export function validarCriacaoPagamento(pedidoId: unknown, metodo: unknown) {
    const metodosValidos = ["pix", "cartao", "boleto"];

    if (typeof pedidoId !== "number" || idEhInvalido(pedidoId)) {
        return "Pedido ID deve ser um número inteiro positivo";
    }

    if (typeof metodo !== "string" || !metodosValidos.includes(metodo)) {
        return "Método de pagamento deve ser pix, cartao ou boleto";
    }

    return undefined;
}
