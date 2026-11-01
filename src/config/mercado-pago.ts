export type ConfiguracaoMercadoPago = { token: string; origem: string | null; segredoWebhook: string };
export function lerConfiguracaoMercadoPago(valores: NodeJS.ProcessEnv): ConfiguracaoMercadoPago | null {
    const modo = valores.MERCADO_PAGO_MODO?.trim() || "desativado";
    if (modo === "desativado") return null;
    if (modo !== "teste") throw new Error("MERCADO_PAGO_MODO deve ser desativado ou teste. Producao ainda nao habilitada.");
    if (valores.NODE_ENV?.trim() === "production") throw new Error("Mercado Pago de teste nao pode ser ativado em producao.");
    const token = valores.MERCADO_PAGO_ACCESS_TOKEN?.trim();
    if (!token || /\s/.test(token)) throw new Error("Configure MERCADO_PAGO_ACCESS_TOKEN com a credencial da aba Teste.");
    let origem: string | null = null;
    const endereco = valores.MERCADO_PAGO_URL_RETORNO?.trim();
    if (endereco) {
        let url: URL;
        try { url = new URL(endereco); } catch { throw new Error("MERCADO_PAGO_URL_RETORNO invalida."); }
        if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash)
            throw new Error("MERCADO_PAGO_URL_RETORNO deve ser uma origem HTTPS, sem caminho ou parametros.");
        origem = url.origin;
    }
    return { token, origem, segredoWebhook: valores.MERCADO_PAGO_WEBHOOK_SECRET?.trim() || "" };
}
