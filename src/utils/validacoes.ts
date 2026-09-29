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
