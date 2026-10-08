import { env } from "../config/env.js";

export function obterHomeApi() {
    return {
        nome: env.APP_NOME + " API",
        mensagem: "API funcionando",
        links: {
            info: "/info",
            health: "/health",
            admin: "/admin",
            loja: "/loja",
            carrinho: "/loja/carrinho",
            acompanhamento: "/loja/acompanhamento"
        }
    };
}

export function obterConfiguracaoPublica() {
    return {
        app: {
            nome: env.APP_NOME
        },
        loja: {
            heroEtiqueta: env.LOJA_HERO_ETIQUETA,
            heroTitulo: env.LOJA_HERO_TITULO,
            heroDescricao: env.LOJA_HERO_DESCRICAO,
            heroImagemUrl: env.LOJA_HERO_IMAGEM_URL,
            corPrincipal: env.LOJA_COR_PRINCIPAL,
            corPrincipalEscuro: env.LOJA_COR_PRINCIPAL_ESCURO,
            atendimentoTexto: env.LOJA_ATENDIMENTO_TEXTO
        }
    };
}
