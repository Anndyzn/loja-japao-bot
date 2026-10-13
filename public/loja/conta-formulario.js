// Validacao imediata para orientar o cliente. O servidor sempre valida novamente.
export const digitos = valor => String(valor ?? "").replace(/\D/g, "");
export function telefoneNacional(valor) {
    const numero = digitos(valor);
    return /^55\d{10,11}$/.test(numero) ? numero.slice(2) : numero;
}
export function formatarCpf(valor) {
    const cpf = digitos(valor).slice(0, 11);
    return cpf.slice(0, 3) + (cpf.length > 3 ? "." + cpf.slice(3, 6) : "") + (cpf.length > 6 ? "." + cpf.slice(6, 9) : "") + (cpf.length > 9 ? "-" + cpf.slice(9) : "");
}
export function formatarTelefone(valor) {
    const numero = telefoneNacional(valor).slice(0, 11);
    if (numero.length <= 2) return numero;
    const local = numero.slice(2), corte = local.length > 8 ? 5 : 4;
    return "(" + numero.slice(0, 2) + ") " + local.slice(0, corte) + (local.length > corte ? "-" + local.slice(corte) : "");
}
export function erroCpf(valor) {
    const cpf = digitos(valor);
    if (cpf.length !== 11) return "Preencha os 11 números do CPF.";
    if (/^(\d)\1{10}$/.test(cpf)) return "CPF inválido. Confira os números digitados.";
    for (const tamanho of [9, 10]) {
        let soma = 0;
        for (let i = 0; i < tamanho; i++) soma += Number(cpf[i]) * (tamanho + 1 - i);
        const resto = soma % 11;
        if (Number(cpf[tamanho]) !== (resto < 2 ? 0 : 11 - resto)) return "CPF inválido. Confira os números digitados.";
    }
    return "";
}
export function validarCamposConta(dados, modo) {
    const erros = {};
    if (modo === "registrar") {
        if (typeof dados.nome !== "string" || dados.nome.trim().split(/\s+/).length < 2 || dados.nome.length > 120) erros.nome = "Informe seu nome e sobrenome (até 120 caracteres).";
        const cpf = erroCpf(dados.cpf); if (cpf) erros.cpf = cpf;
        if (!/^\d{10,11}$/.test(telefoneNacional(dados.telefone))) erros.telefone = "Informe o DDD e o telefone: 10 ou 11 números.";
    }
    if (modo !== "ativar" && (typeof dados.email !== "string" || dados.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim()))) erros.email = "Informe um e-mail válido, como nome@exemplo.com.";
    if (modo === "recuperar") return erros;
    if (!dados.senha) erros.senha = modo === "entrar" ? "Informe sua senha." : "Crie uma senha de 10 a 128 caracteres.";
    else if (dados.senha.length > 128 || (modo !== "entrar" && dados.senha.length < 10)) erros.senha = "Use entre 10 e 128 caracteres.";
    if (modo !== "entrar") {
        if (!dados.confirmacao) erros.confirmacao = "Repita a senha para confirmar.";
        else if (dados.senha !== dados.confirmacao) erros.confirmacao = "As senhas precisam ser iguais.";
    }
    return erros;
}

function aplicarMascara(input, formatar) {
    const posicionar = (valor, quantidade) => {
        input.value = formatar(valor);
        let posicao = 0, contagem = 0;
        while (posicao < input.value.length && contagem < quantidade) { if (/\d/.test(input.value[posicao])) contagem++; posicao++; }
        input.setSelectionRange(posicao, posicao);
    };
    input.addEventListener("input", () => {
        const posicao = input.selectionStart ?? input.value.length;
        posicionar(input.value, digitos(input.value.slice(0, posicao)).length);
    });
    // Colar CPF formatado ou telefone com +55 funciona sem truncar antes da mascara.
    input.addEventListener("paste", evento => {
        const texto = evento.clipboardData?.getData("text");
        if (texto === undefined) return;
        evento.preventDefault();
        const inicio = input.selectionStart ?? 0, fim = input.selectionEnd ?? input.value.length;
        const antes = input.value.slice(0, inicio), depois = input.value.slice(fim);
        posicionar(antes + texto + depois, digitos(antes + texto).length);
        input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    // Backspace/Delete sobre pontuacao apaga o numero vizinho, sem prender o cursor.
    input.addEventListener("beforeinput", evento => {
        const pos = input.selectionStart;
        if (pos === null || pos !== input.selectionEnd || !["deleteContentBackward", "deleteContentForward"].includes(evento.inputType)) return;
        const voltar = evento.inputType === "deleteContentBackward";
        let indice = voltar ? pos - 1 : pos;
        if (indice < 0 || indice >= input.value.length || /\d/.test(input.value[indice])) return;
        while (indice >= 0 && indice < input.value.length && !/\d/.test(input.value[indice])) indice += voltar ? -1 : 1;
        if (indice < 0 || indice >= input.value.length) return;
        evento.preventDefault();
        const valor = input.value.slice(0, indice) + input.value.slice(indice + 1);
        posicionar(valor, digitos(input.value.slice(0, voltar ? indice : pos)).length);
        input.dispatchEvent(new Event("input", { bubbles: true }));
    });
}

export function prepararFormularioConta(form, modo, validar = validarCamposConta) {
    const campos = [...form.querySelectorAll("input[name]")];
    const visitados = new Set();
    const mensagens = new Map();
    form.noValidate = true;
    function exibir(nome, mensagem = "") {
        const campo = campos.find(item => item.name === nome), aviso = mensagens.get(nome);
        if (!campo || !aviso) return;
        aviso.textContent = mensagem; aviso.hidden = !mensagem;
        campo.setAttribute("aria-invalid", mensagem ? "true" : "false");
    }
    const dados = () => Object.fromEntries(new FormData(form));
    const atualizar = nome => exibir(nome, validar(dados(), modo)[nome]);
    for (const campo of campos) {
        campo.id ||= form.id + "-" + campo.name;
        const aviso = document.createElement("small");
        aviso.id = campo.id + "-erro"; aviso.className = "conta-erro-campo"; aviso.hidden = true;
        campo.insertAdjacentElement("afterend", aviso); mensagens.set(campo.name, aviso);
        campo.setAttribute("aria-describedby", [campo.getAttribute("aria-describedby"), aviso.id].filter(Boolean).join(" "));
        if (campo.name === "cpf") aplicarMascara(campo, formatarCpf);
        if (campo.name === "telefone") aplicarMascara(campo, formatarTelefone);
        campo.addEventListener("blur", () => { visitados.add(campo.name); atualizar(campo.name); });
        campo.addEventListener("input", () => {
            if (visitados.has(campo.name)) atualizar(campo.name);
            if (campo.name === "senha" && visitados.has("confirmacao")) atualizar("confirmacao");
        });
    }
    return {
        validar() {
            const erros = validar(dados(), modo);
            for (const campo of campos) { visitados.add(campo.name); exibir(campo.name, erros[campo.name]); }
            campos.find(campo => erros[campo.name])?.focus();
            return Object.keys(erros).length === 0;
        },
        errosServidor(erros = {}) {
            for (const campo of campos) if (typeof erros[campo.name] === "string") { visitados.add(campo.name); exibir(campo.name, erros[campo.name]); }
            campos.find(campo => typeof erros[campo.name] === "string")?.focus();
        }
    };
}
