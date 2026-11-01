import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";

export class ErroMercadoPago extends Error {
    constructor(message: string, public status = 400) { super(message); }
}
export function configuracaoMp() {
    if (!env.MERCADO_PAGO) throw new ErroMercadoPago("Pagamento pelo Mercado Pago indisponivel.", 503);
    return env.MERCADO_PAGO;
}
export function centavos(valor: unknown): number {
    const texto = String(valor);
    if (!/^\d{1,8}(\.\d{1,2})?$/.test(texto)) throw new ErroMercadoPago("Valor monetario invalido.", 502);
    const [inteiro, decimal = ""] = texto.split(".");
    return Number(inteiro) * 100 + Number(decimal.padEnd(2, "0"));
}
export const moedaMp = (valor: unknown) => (centavos(valor) / 100).toFixed(2);
export const idOrderValido = (id: unknown): id is string => typeof id === "string" && /^ORDTST[A-Z0-9]{10,60}$/.test(id);
export function validarUrlCheckout(valor: unknown, orderId: string) {
    let url: URL;
    try { url = new URL(String(valor)); } catch { throw new ErroMercadoPago("Link de pagamento invalido.", 502); }
    if (url.protocol !== "https:" || url.hostname !== "www.mercadopago.com.br" || url.port ||
        url.username || url.password || url.hash || url.pathname !== "/checkout/v1/redirect" ||
        url.searchParams.get("order_id") !== orderId)
        throw new ErroMercadoPago("Link de pagamento fora do checkout esperado.", 502);
    return url.href;
}
export type OrderMp = {
    id: string; user_id: string; type: string; processing_mode: string; currency: string;
    external_reference: string; total_amount: string; total_paid_amount?: string;
    status: string; status_detail?: string; checkout_url?: string; last_updated_date: string;
    live_mode?: boolean;
    transactions?: { payments?: Array<{ id: string; amount: string; paid_amount: string;
        status: string; status_detail: string; payment_method?: { id: string; type: string } }>;
        refunds?: unknown[]; chargebacks?: unknown[] };
};
export async function requisitarMp(caminho: string, corpo?: unknown, chave?: string): Promise<OrderMp> {
    const config = configuracaoMp();
    let resposta: Response;
    try {
        resposta = await fetch("https://api.mercadopago.com/v1/orders" + caminho, {
            method: corpo ? "POST" : "GET", redirect: "error", signal: AbortSignal.timeout(8000),
            headers: { Authorization: "Bearer " + config.token, "Content-Type": "application/json",
                ...(chave ? { "X-Idempotency-Key": chave } : {}) },
            ...(corpo ? { body: JSON.stringify(corpo) } : {})
        });
    } catch { throw new ErroMercadoPago("Mercado Pago nao respondeu. Tente novamente; a mesma tentativa sera reutilizada.", 502); }
    if (!resposta.ok) {
        if ([401, 403].includes(resposta.status)) throw new ErroMercadoPago("Mercado Pago recusou a credencial ou permissao. Confira a aplicacao de teste.", 502);
        if (resposta.status === 429) throw new ErroMercadoPago("Aguarde um pouco antes de consultar o pagamento novamente.", 429);
        throw new ErroMercadoPago("Nao foi possivel concluir a consulta no Mercado Pago (HTTP " + resposta.status + ").", 502);
    }
    try { return await resposta.json() as OrderMp; }
    catch { throw new ErroMercadoPago("Resposta invalida do Mercado Pago.", 502); }
}
// O backend compara a order obtida pela API com a tentativa persistida, nunca com o retorno do navegador.
export function validarOrder(order: OrderMp, referencia: string, total: unknown, vendedor?: string | null, id?: string | null) {
    // A API pode omitir status_detail na order recem-criada, antes de qualquer pagamento.
    if (!order || typeof order.status !== "string" || order.status.length > 40 || (typeof order.status_detail !== "string" && !(order.status === "created" && order.status_detail === undefined)) || !idOrderValido(order.id) || order.live_mode === true ||
        order.type !== "online" || order.processing_mode !== "manual" || order.currency !== "BRL" ||
        order.external_reference !== referencia || centavos(order.total_amount) !== centavos(total) ||
        !/^\d+$/.test(String(order.user_id)) || (vendedor && String(order.user_id) !== vendedor) ||
        (id && order.id !== id) || !Number.isFinite(Date.parse(order.last_updated_date)))
        throw new ErroMercadoPago("A cobranca nao corresponde a este pedido de teste. Nenhum pagamento foi confirmado.", 502);
}
export function avaliarOrder(order: OrderMp) {
    const transacoes = order.transactions;
    if (transacoes && (transacoes.refunds !== undefined && !Array.isArray(transacoes.refunds) ||
        transacoes.chargebacks !== undefined && !Array.isArray(transacoes.chargebacks) ||
        transacoes.payments !== undefined && !Array.isArray(transacoes.payments))) return { revisao: true };
    if (order.status === "refunded" || order.status_detail === "partially_refunded" ||
        transacoes?.refunds?.length || transacoes?.chargebacks?.length) return { revisao: true };
    if (order.status !== "processed" || order.status_detail !== "accredited") return { revisao: false };
    const pagamentos = transacoes?.payments;
    if (!pagamentos || pagamentos.length !== 1) return { revisao: true };
    const pagamento = pagamentos[0]!;
    const metodo = pagamento.payment_method?.type === "credit_card" ? "cartao" as const :
        pagamento.payment_method?.id === "pix" && pagamento.payment_method.type === "bank_transfer" ? "pix" as const : undefined;
    if (!metodo || !/^PAY[A-Z0-9]{10,60}$/.test(pagamento.id) ||
        pagamento.status !== "processed" || pagamento.status_detail !== "accredited" ||
        centavos(order.total_paid_amount) !== centavos(order.total_amount) ||
        centavos(pagamento.amount) !== centavos(order.total_amount) ||
        centavos(pagamento.paid_amount) !== centavos(order.total_amount)) return { revisao: true };
    return { revisao: false, pagamentoId: pagamento.id, metodo };
}
export function assinaturaMpValida(id: unknown, assinatura: string | undefined, requestId: string | undefined, segredo: string) {
    if (typeof id !== "string" || !/^ORDTST[A-Z0-9]{10,60}$/i.test(id) || !segredo || !assinatura || !requestId ||
        !/^[A-Za-z0-9._:-]{1,100}$/.test(requestId)) return false;
    const partes = assinatura.split(",").map(parte => parte.trim().split("="));
    const timestamps = partes.filter(p => p[0] === "ts");
    const hashes = partes.filter(p => p[0] === "v1");
    if (timestamps.length !== 1 || hashes.length !== 1) return false;
    const ts = timestamps[0]?.[1], hash = hashes[0]?.[1];
    if (!ts || !/^\d{10,16}$/.test(ts) || !hash || !/^[a-f0-9]{64}$/i.test(hash)) return false;
    // Retentativas antigas sao seguras: consulta autenticada atual + aplicacao idempotente no banco.
    const esperado = createHmac("sha256", segredo).update("id:" + id.toLowerCase() + ";request-id:" + requestId + ";ts:" + ts + ";").digest();
    return timingSafeEqual(esperado, Buffer.from(hash, "hex"));
}
