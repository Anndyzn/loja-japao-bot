export type ConfiguracaoEmail = {
    host: string; port: number; user: string; password: string; remetente: string; origem: string;
};

export function lerConfiguracaoEmail(valores: NodeJS.ProcessEnv, producao: boolean): ConfiguracaoEmail | null {
    const nomes = ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "SMTP_REMETENTE", "APP_URL_PUBLICA"] as const;
    if (!nomes.some(nome => valores[nome]?.trim())) return null;
    for (const nome of nomes) if (!valores[nome]?.trim()) throw new Error(nome + " deve ser configurada para recuperar senhas por e-mail");
    const port = Number(valores.SMTP_PORT || "587");
    if (![465, 587].includes(port)) throw new Error("SMTP_PORT deve ser 465 (TLS) ou 587 (STARTTLS)");
    const remetente = valores.SMTP_REMETENTE!.trim();
    if (!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(remetente)) throw new Error("SMTP_REMETENTE deve conter apenas um e-mail valido");
    let url: URL;
    try { url = new URL(valores.APP_URL_PUBLICA!.trim()); } catch { throw new Error("APP_URL_PUBLICA deve ser uma URL valida"); }
    if (url.username || url.password || url.search || url.hash || url.pathname !== "/" ||
        !["https:", "http:"].includes(url.protocol) || (producao && url.protocol !== "https:")) {
        throw new Error("APP_URL_PUBLICA deve ser a origem da loja, sem caminho, usuario ou parametros; HTTPS e obrigatorio em producao");
    }
    return { host: valores.SMTP_HOST!.trim(), port, user: valores.SMTP_USER!.trim(),
        password: valores.SMTP_PASSWORD!, remetente, origem: url.origin };
}
