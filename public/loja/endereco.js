export const camposEnderecoConta = ["cep", "endereco", "numero", "complemento", "bairro", "cidade", "estado", "referencia"];
export function enderecoCompleto(cliente = {}) {
    return ["cep", "endereco", "numero", "bairro", "cidade", "estado"].every(campo => String(cliente[campo] ?? "").trim());
}
export function instalarBuscaCep(form, cepFeedback, aoPreencher = () => {}) {
    const cepInput = form.elements.cep;

    const camposEndereco = {
        endereco: "logradouro",
        bairro: "bairro",
        cidade: "localidade",
        estado: "uf"
    };
    let cepAtual = "";
    let buscaCep = null;
    let buscandoCep = false;

    function mostrarFeedbackCep(mensagem, tipo = "") {
        cepFeedback.textContent = mensagem;
        cepFeedback.className = ("feedback " + tipo).trim();
    }

    function cancelarBuscaCep() {
        buscaCep?.abort();
        buscaCep = null;
        buscandoCep = false;
    }

    async function buscarEnderecoPorCep() {
        const cep = cepInput.value.replace(/\D/g, "");
        cepInput.value = cep.length > 5 ? cep.slice(0, 5) + "-" + cep.slice(5) : cep;
        if (cep === cepAtual) return;
        cepAtual = cep;
        cancelarBuscaCep();

        // Não reutiliza rua e cidade de um CEP anterior.
        for (const campo of Object.keys(camposEndereco)) {
            form.elements[campo].value = "";
        }
        if (cep.length !== 8) {
            mostrarFeedbackCep("Digite os 8 dígitos do CEP.");
            return;
        }

        const consulta = new AbortController();
        buscaCep = consulta;
        buscandoCep = true;
        mostrarFeedbackCep("Buscando endereço...");
        const tempoLimite = setTimeout(() => consulta.abort(), 8000);
        // Preserva correções que o cliente fizer enquanto a busca estiver em andamento.
        const valoresIniciais = Object.fromEntries(Object.keys(camposEndereco).map(campo => [campo, form.elements[campo].value]));

        try {
            const resposta = await fetch("https://viacep.com.br/ws/" + cep + "/json/", {
                signal: consulta.signal
            });
            if (!resposta.ok) throw new Error("Falha na consulta");
            const endereco = await resposta.json();
            if (buscaCep !== consulta) return;
            if (!endereco || typeof endereco !== "object") throw new Error("Resposta inválida");
            if (endereco.erro) {
                mostrarFeedbackCep("CEP não encontrado. Confira o CEP ou preencha o endereço manualmente.", "error");
                return;
            }
            for (const [campo, propriedade] of Object.entries(camposEndereco)) {
                const input = form.elements[campo];
                if (input.value === valoresIniciais[campo]) {
                    input.value = typeof endereco[propriedade] === "string" ? endereco[propriedade] : "";
                }
            }
            aoPreencher();
            mostrarFeedbackCep("Confira o endereço e informe o número. Complete os campos que estiverem vazios.", "success");
        } catch {
            if (buscaCep !== consulta) return;
            mostrarFeedbackCep("Não foi possível buscar o CEP. Preencha o endereço manualmente.", "error");
        } finally {
            clearTimeout(tempoLimite);
            if (buscaCep === consulta) {
                buscaCep = null;
                buscandoCep = false;
            }
        }
    }

    cepInput.addEventListener("input", buscarEnderecoPorCep);
    cepInput.addEventListener("change", buscarEnderecoPorCep);
    form.addEventListener("reset", () => {
        cancelarBuscaCep();
        cepAtual = "";
        mostrarFeedbackCep("Digite o CEP para buscar o endereço.");
    });


    return {
        get buscando() { return buscandoCep; },
        buscar: buscarEnderecoPorCep,
        cancelar: cancelarBuscaCep,
        sincronizar() {
            cancelarBuscaCep(); cepAtual = cepInput.value.replace(/\D/g, "");
            mostrarFeedbackCep(cepAtual ? "Confira o endereço de entrega." : "Digite o CEP para buscar o endereço.");
        }
    };
}

export function validarCamposEndereco(dados) {
    const erros = {}, limites = { cep: 9, endereco: 200, numero: 30, complemento: 150, bairro: 100, cidade: 100, estado: 2, referencia: 200 };
    for (const [campo, limite] of Object.entries(limites)) {
        const valor = String(dados[campo] ?? "").trim();
        if (!["complemento", "referencia"].includes(campo) && !valor) erros[campo] = "Preencha este campo.";
        if (valor.length > limite) erros[campo] = "Use até " + limite + " caracteres.";
    }
    if (!/^\d{5}-?\d{3}$/.test(String(dados.cep ?? "").trim())) erros.cep = "Informe os 8 números do CEP.";
    if (!"AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ").includes(String(dados.estado ?? "").trim().toUpperCase())) erros.estado = "Informe a sigla do estado, como SP.";
    return erros;
}
