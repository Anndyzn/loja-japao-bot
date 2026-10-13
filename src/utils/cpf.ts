// Aceita CPF com ou sem pontuacao. Esta verificacao nao comprova identidade.
export function normalizarCpf(cpf: string) {
    return cpf.replace(/\D/g, "");
}

export function validarCpf(valor: unknown, obrigatorio = false): string | undefined {
    if (valor === undefined && !obrigatorio) return undefined;
    if (typeof valor !== "string" || !/^(?:\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/.test(valor.trim())) {
        return "Informe um CPF valido com 11 digitos";
    }
    const cpf = normalizarCpf(valor);
    if (/^(\d)\1{10}$/.test(cpf)) return "CPF invalido. Confira os numeros informados";
    // Os dois ultimos digitos conferem se houve erro de digitacao.
    for (const tamanho of [9, 10]) {
        let soma = 0;
        for (let i = 0; i < tamanho; i++) soma += Number(cpf[i]) * (tamanho + 1 - i);
        const resto = soma % 11;
        const digito = resto < 2 ? 0 : 11 - resto;
        if (digito !== Number(cpf[tamanho])) return "CPF invalido. Confira os numeros informados";
    }
    return undefined;
}
