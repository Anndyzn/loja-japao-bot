export function obterHomeApi() {
    return {
        nome: "Loja Japao Bot API",
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
