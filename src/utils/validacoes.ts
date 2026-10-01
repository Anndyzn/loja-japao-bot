export function idEhInvalido(id: number) {
    return !Number.isInteger(id) || id <= 0;
}

function campoTextoObrigatorioEhInvalido(valor: unknown) {
    return typeof valor !== "string" || valor.trim() === "";
}

function campoTextoOpcionalEhInvalido(valor: unknown) {
    return valor !== undefined && (typeof valor !== "string" || valor.trim() === "");
}

export function validarCriacaoProduto(
    nome: unknown,
    preco: unknown,
    estoque: unknown,
    imagemUrl: unknown,
    publicadoNaLoja: unknown
) {
    if (campoTextoObrigatorioEhInvalido(nome)) {
        return "Nome deve ser um texto nao vazio";
    }

    if (typeof preco !== "number" || preco <= 0) {
        return "Preco deve ser um numero maior que zero";
    }

    if (typeof estoque !== "number" || !Number.isInteger(estoque) || estoque < 0) {
        return "Estoque deve ser um numero inteiro maior ou igual a zero";
    }

    if (campoTextoOpcionalEhInvalido(imagemUrl)) {
        return "URL da imagem deve ser um texto nao vazio";
    }

    if (publicadoNaLoja !== undefined && typeof publicadoNaLoja !== "boolean") {
        return "Publicado na loja deve ser verdadeiro ou falso";
    }

    return undefined;
}

export function validarAtualizacaoProduto(
    nome: unknown,
    preco: unknown,
    estoque: unknown,
    imagemUrl: unknown,
    publicadoNaLoja: unknown
) {
    if (
        nome === undefined &&
        preco === undefined &&
        estoque === undefined &&
        imagemUrl === undefined &&
        publicadoNaLoja === undefined
    ) {
        return "Informe ao menos um campo para atualizar";
    }

    if (campoTextoOpcionalEhInvalido(nome)) {
        return "Nome deve ser um texto nao vazio";
    }

    if (preco !== undefined && (typeof preco !== "number" || preco <= 0)) {
        return "Preco deve ser um numero maior que zero";
    }

    if (estoque !== undefined && (typeof estoque !== "number" || !Number.isInteger(estoque) || estoque < 0)) {
        return "Estoque deve ser um numero inteiro maior ou igual a zero";
    }

    if (campoTextoOpcionalEhInvalido(imagemUrl)) {
        return "URL da imagem deve ser um texto nao vazio";
    }

    if (publicadoNaLoja !== undefined && typeof publicadoNaLoja !== "boolean") {
        return "Publicado na loja deve ser verdadeiro ou falso";
    }

    return undefined;
}

export function validarCriacaoCliente(
    nome: unknown,
    telefone: unknown,
    endereco: unknown,
    cep: unknown,
    numero: unknown,
    bairro: unknown,
    cidade: unknown,
    estado: unknown,
    email: unknown,
    complemento: unknown,
    referencia: unknown
) {
    if (campoTextoObrigatorioEhInvalido(nome)) {
        return "Nome deve ser um texto nao vazio";
    }

    if (campoTextoObrigatorioEhInvalido(telefone)) {
        return "Telefone deve ser um texto nao vazio";
    }

    if (campoTextoObrigatorioEhInvalido(endereco)) {
        return "Endereco deve ser um texto nao vazio";
    }

    if (campoTextoObrigatorioEhInvalido(cep)) {
        return "CEP deve ser um texto nao vazio";
    }

    if (campoTextoObrigatorioEhInvalido(numero)) {
        return "Numero deve ser um texto nao vazio";
    }

    if (campoTextoObrigatorioEhInvalido(bairro)) {
        return "Bairro deve ser um texto nao vazio";
    }

    if (campoTextoObrigatorioEhInvalido(cidade)) {
        return "Cidade deve ser um texto nao vazio";
    }

    if (campoTextoObrigatorioEhInvalido(estado)) {
        return "Estado deve ser um texto nao vazio";
    }

    if (campoTextoOpcionalEhInvalido(email)) {
        return "Email deve ser um texto nao vazio";
    }

    if (campoTextoOpcionalEhInvalido(complemento)) {
        return "Complemento deve ser um texto nao vazio";
    }

    if (campoTextoOpcionalEhInvalido(referencia)) {
        return "Referencia deve ser um texto nao vazio";
    }

    return undefined;
}

export function validarAtualizacaoCliente(
    nome: unknown,
    telefone: unknown,
    endereco: unknown,
    cep: unknown,
    numero: unknown,
    bairro: unknown,
    cidade: unknown,
    estado: unknown,
    email: unknown,
    complemento: unknown,
    referencia: unknown
) {
    if (
        nome === undefined &&
        telefone === undefined &&
        endereco === undefined &&
        cep === undefined &&
        numero === undefined &&
        bairro === undefined &&
        cidade === undefined &&
        estado === undefined &&
        email === undefined &&
        complemento === undefined &&
        referencia === undefined
    ) {
        return "Informe ao menos um campo para atualizar";
    }

    if (campoTextoOpcionalEhInvalido(nome)) {
        return "Nome deve ser um texto nao vazio";
    }

    if (campoTextoOpcionalEhInvalido(telefone)) {
        return "Telefone deve ser um texto nao vazio";
    }

    if (campoTextoOpcionalEhInvalido(endereco)) {
        return "Endereco deve ser um texto nao vazio";
    }

    if (campoTextoOpcionalEhInvalido(cep)) {
        return "CEP deve ser um texto nao vazio";
    }

    if (campoTextoOpcionalEhInvalido(numero)) {
        return "Numero deve ser um texto nao vazio";
    }

    if (campoTextoOpcionalEhInvalido(bairro)) {
        return "Bairro deve ser um texto nao vazio";
    }

    if (campoTextoOpcionalEhInvalido(cidade)) {
        return "Cidade deve ser um texto nao vazio";
    }

    if (campoTextoOpcionalEhInvalido(estado)) {
        return "Estado deve ser um texto nao vazio";
    }

    if (campoTextoOpcionalEhInvalido(email)) {
        return "Email deve ser um texto nao vazio";
    }

    if (campoTextoOpcionalEhInvalido(complemento)) {
        return "Complemento deve ser um texto nao vazio";
    }

    if (campoTextoOpcionalEhInvalido(referencia)) {
        return "Referencia deve ser um texto nao vazio";
    }

    return undefined;
}

export function validarCriacaoPedido(clienteId: unknown, itens: unknown, observacao: unknown) {
    if (typeof clienteId !== "number" || idEhInvalido(clienteId)) {
        return "Cliente ID deve ser um numero inteiro positivo";
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
            return "Produto ID deve ser um numero inteiro positivo";
        }

        if (typeof quantidade !== "number" || !Number.isInteger(quantidade) || quantidade <= 0) {
            return "Quantidade deve ser um numero inteiro maior que zero";
        }
    }

    if (campoTextoOpcionalEhInvalido(observacao)) {
        return "Observacao deve ser um texto nao vazio";
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
        return "Cliente ID deve ser um numero inteiro positivo";
    }

    if (campoTextoObrigatorioEhInvalido(nomeProduto)) {
        return "Nome do produto deve ser um texto nao vazio";
    }

    if (campoTextoObrigatorioEhInvalido(descricao)) {
        return "Descricao deve ser um texto nao vazio";
    }

    if (campoTextoOpcionalEhInvalido(linkReferencia)) {
        return "Link de referencia deve ser um texto nao vazio";
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

export function validarAtualizacaoCotacaoSolicitacao(valorCotado: unknown, observacaoAdmin: unknown) {
    if (typeof valorCotado !== "number" || !Number.isFinite(valorCotado) || valorCotado <= 0) {
        return "Valor cotado deve ser um numero maior que zero";
    }

    if (campoTextoOpcionalEhInvalido(observacaoAdmin)) {
        return "Observacao interna deve ser um texto nao vazio";
    }

    return undefined;
}

export function validarCriacaoPagamento(pedidoId: unknown, metodo: unknown) {
    const metodosValidos = ["pix", "cartao", "boleto"];

    if (typeof pedidoId !== "number" || idEhInvalido(pedidoId)) {
        return "Pedido ID deve ser um numero inteiro positivo";
    }

    if (typeof metodo !== "string" || !metodosValidos.includes(metodo)) {
        return "Metodo de pagamento deve ser pix, cartao ou boleto";
    }

    return undefined;
}

export function validarSolicitacaoPublica(
    nome: unknown,
    telefone: unknown,
    nomeProduto: unknown,
    descricao: unknown,
    linkReferencia: unknown
) {
    const campos = [
        { valor: nome, rotulo: "Nome", limite: 120 },
        { valor: telefone, rotulo: "Telefone", limite: 30 },
        { valor: nomeProduto, rotulo: "Produto", limite: 200 },
        { valor: descricao, rotulo: "Descrição", limite: 2000 }
    ];
    for (const campo of campos) {
        if (typeof campo.valor !== "string" || !campo.valor.trim() || campo.valor.trim().length > campo.limite) {
            return campo.rotulo + " deve ter de 1 a " + campo.limite + " caracteres";
        }
    }
    if (typeof telefone === "string") {
        const digitos = telefone.replace(/\D/g, "");
        if (digitos.length < 10 || digitos.length > 15 || !/^[+()\d\s.-]+$/.test(telefone)) {
            return "Informe um telefone válido com DDD";
        }
    }
    if (linkReferencia !== undefined) {
        if (typeof linkReferencia !== "string" || !linkReferencia.trim() || linkReferencia.trim().length > 2000) {
            return "Link deve ser um endereço de até 2000 caracteres";
        }
        try {
            const url = new URL(linkReferencia.trim());
            if (!["http:", "https:"].includes(url.protocol)) return "Link deve começar com http:// ou https://";
        } catch {
            return "Informe um link válido, começando com https://";
        }
    }
    return undefined;
}
