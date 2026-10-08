import { env } from "../config/env.js";

const PLACEHOLDERS = new Set([
    "sua-chave-pix",
    "nome do recebedor",
    "cole-seu-token-sandbox-aqui",
    "seu-email@example.com",
    "00000000"
]);

function textoReal(valor: string) {
    const texto = valor.trim();

    return texto !== "" && !PLACEHOLDERS.has(texto.toLowerCase());
}

function emailValido(valor: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

export function obterResumoConfiguracaoSistema() {
    const pixConfigurado = textoReal(env.PIX_CHAVE) && textoReal(env.PIX_RECEBEDOR);
    const cepFreteConfigurado = /^\d{8}$/.test(env.FRETE_CEP_ORIGEM) && !PLACEHOLDERS.has(env.FRETE_CEP_ORIGEM);
    const tokenFreteConfigurado = textoReal(env.MELHOR_ENVIO_TOKEN);
    const contatoFreteConfigurado = textoReal(env.MELHOR_ENVIO_CONTATO) && emailValido(env.MELHOR_ENVIO_CONTATO);
    const ambienteFreteValido = ["sandbox", "production"].includes(env.MELHOR_ENVIO_AMBIENTE);
    const freteConfigurado = cepFreteConfigurado && tokenFreteConfigurado && contatoFreteConfigurado && ambienteFreteValido;

    return {
        app: {
            nome: env.APP_NOME
        },
        loja: {
            heroTitulo: env.LOJA_HERO_TITULO,
            heroImagemUrl: env.LOJA_HERO_IMAGEM_URL,
            corPrincipal: env.LOJA_COR_PRINCIPAL,
            corPrincipalEscuro: env.LOJA_COR_PRINCIPAL_ESCURO,
            atendimentoTexto: env.LOJA_ATENDIMENTO_TEXTO
        },
        pix: {
            status: pixConfigurado ? "configurado" : "pendente",
            mensagem: pixConfigurado ? "Pix manual pronto para o checkout" : "Configure PIX_CHAVE e PIX_RECEBEDOR no .env"
        },
        frete: {
            status: freteConfigurado ? "configurado" : "pendente",
            ambiente: env.MELHOR_ENVIO_AMBIENTE,
            mensagem: freteConfigurado
                ? "Cotacao automatica pronta"
                : "Configure CEP de origem, token e contato do Melhor Envio no .env"
        }
    };
}
