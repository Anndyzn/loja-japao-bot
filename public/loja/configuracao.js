export async function aplicarConfiguracaoPublica(tituloPrefixo = "") {
    try {
        const resposta = await fetch("/configuracao-publica");

        if (!resposta.ok) {
            throw new Error("Configuracao indisponivel");
        }

        const configuracao = await resposta.json();
        const nome = configuracao.app?.nome || "Loja Japao";

        document.querySelectorAll("[data-app-name]").forEach((elemento) => {
            elemento.textContent = nome;
        });

        const heroEtiqueta = document.querySelector("[data-hero-etiqueta]");
        const heroTitulo = document.querySelector("[data-hero-titulo]");
        const heroDescricao = document.querySelector("[data-hero-descricao]");
        const heroImagem = document.querySelector("[data-hero-imagem]");
        const atendimentoTexto = configuracao.loja?.atendimentoTexto;

        if (heroEtiqueta && configuracao.loja?.heroEtiqueta) {
            heroEtiqueta.textContent = configuracao.loja.heroEtiqueta;
        }

        if (heroTitulo && configuracao.loja?.heroTitulo) {
            heroTitulo.textContent = configuracao.loja.heroTitulo;
        }

        if (heroDescricao && configuracao.loja?.heroDescricao) {
            heroDescricao.textContent = configuracao.loja.heroDescricao;
        }

        if (heroImagem && configuracao.loja?.heroImagemUrl && urlImagemEhPermitida(configuracao.loja.heroImagemUrl)) {
            heroImagem.src = configuracao.loja.heroImagemUrl;
        }

        if (atendimentoTexto) {
            document.querySelectorAll("[data-atendimento-texto]").forEach((elemento) => {
                elemento.textContent = atendimentoTexto;
            });
        }

        aplicarTema(configuracao.loja);

        document.title = tituloPrefixo ? tituloPrefixo + " | " + nome : nome;

        return configuracao;
    } catch {
        return {
            app: {
                nome: "Loja Japao"
            }
        };
    }
}

function aplicarTema(loja = {}) {
    if (corHexEhPermitida(loja.corPrincipal)) {
        document.documentElement.style.setProperty("--accent", loja.corPrincipal);
    }

    if (corHexEhPermitida(loja.corPrincipalEscuro)) {
        document.documentElement.style.setProperty("--accent-dark", loja.corPrincipalEscuro);
    }
}

function corHexEhPermitida(valor) {
    return typeof valor === "string" && /^#[0-9a-fA-F]{6}$/.test(valor.trim());
}

function urlImagemEhPermitida(valor) {
    if (typeof valor !== "string") {
        return false;
    }

    const texto = valor.trim();

    if (texto.startsWith("/") && !texto.startsWith("//")) {
        return true;
    }

    try {
        const url = new URL(texto);
        return ["http:", "https:"].includes(url.protocol);
    } catch {
        return false;
    }
}
