import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

export type ItemFrete = {
    produto: { id: number; preco: unknown; pesoKg: unknown; alturaCm: number | null; larguraCm: number | null; comprimentoCm: number | null };
    quantidade: number;
};
export type Frete = { valor: number; servicoId: string; servico: string; transportadora: string; prazoDias: number; ambiente: string };
export class ErroFrete extends Error {
    constructor(message: string, public status = 400) { super(message); }
}
export function normalizarCep(cep: string) { return cep.replace(/\D/g, ""); }
function produtosCotacao(itens: ItemFrete[]) {
    return [...itens].sort((a,b) => a.produto.id - b.produto.id).map(({produto:p,quantidade}) => ({
        id: String(p.id), width: p.larguraCm, height: p.alturaCm, length: p.comprimentoCm,
        weight: Number(p.pesoKg), insurance_value: Number(p.preco), quantity: quantidade
    }));
}
function resumoCotacao(itens: ItemFrete[], cep: string) {
    return createHash("sha256").update(JSON.stringify({
        origem: env.FRETE_CEP_ORIGEM, destino: normalizarCep(cep),
        ambiente: env.MELHOR_ENVIO_AMBIENTE, produtos: produtosCotacao(itens)
    })).digest("hex");
}
function assinatura(payload: string) {
    return createHmac("sha256", env.AUTH_TOKEN_SECRET).update("frete-v1:" + payload).digest();
}
// O navegador recebe uma cotacao assinada, nunca o token da transportadora.
export function assinarCotacaoFrete(frete: Frete, itens: ItemFrete[], cep: string, expiraEm = Date.now() + 15 * 60_000) {
    const payload = Buffer.from(JSON.stringify({frete, resumo: resumoCotacao(itens, cep), expiraEm})).toString("base64url");
    return { ...frete, expiraEm, token: payload + "." + assinatura(payload).toString("base64url") };
}
export function validarCotacaoFrete(token: unknown, itens: ItemFrete[], cep: string): Frete {
    if (typeof token !== "string" || token.length > 8000) throw new ErroFrete("Calcule e selecione o frete antes de finalizar o pedido");
    const partes = token.split(".");
    const [payload, hash] = partes;
    if (partes.length !== 2 || !payload || !hash) throw new ErroFrete("Cotacao de frete invalida. Calcule novamente");
    const recebido = Buffer.from(hash, "base64url");
    const esperado = assinatura(payload);
    if (recebido.length !== esperado.length || !timingSafeEqual(recebido, esperado)) throw new ErroFrete("Cotacao de frete invalida. Calcule novamente");
    let cotacao;
    try { cotacao = JSON.parse(Buffer.from(payload,"base64url").toString()); }
    catch { throw new ErroFrete("Cotacao de frete invalida. Calcule novamente"); }
    if (!Number.isFinite(cotacao.expiraEm) || cotacao.expiraEm <= Date.now()) throw new ErroFrete("Cotacao de frete expirou. Calcule novamente");
    if (cotacao.resumo !== resumoCotacao(itens, cep)) throw new ErroFrete("Produtos, precos ou CEP mudaram. Calcule o frete novamente");
    const f = cotacao.frete as Frete;
    if (!f || !Number.isFinite(f.valor) || f.valor < 0 || !Number.isInteger(f.prazoDias) || f.prazoDias < 0 ||
        typeof f.servicoId !== "string" || typeof f.servico !== "string" || typeof f.transportadora !== "string" ||
        f.ambiente !== env.MELHOR_ENVIO_AMBIENTE || (env.IS_PRODUCTION && f.ambiente !== "production")) {
        throw new ErroFrete("Cotacao de frete invalida. Calcule novamente");
    }
    return f;
}
function conferirConfiguracao() {
    if (!/^\d{8}$/.test(env.FRETE_CEP_ORIGEM) || !env.MELHOR_ENVIO_TOKEN ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.MELHOR_ENVIO_CONTATO) ||
        !["sandbox", "production"].includes(env.MELHOR_ENVIO_AMBIENTE) ||
        (env.IS_PRODUCTION && env.MELHOR_ENVIO_AMBIENTE !== "production")) {
        throw new ErroFrete("Frete ainda nao esta disponivel. Entre em contato com a loja", 503);
    }
}
export async function cotarFrete(cepEntrada: unknown, itensEntrada: unknown, permitirInternos = false) {
    if (typeof cepEntrada !== "string" || !/^[0-9.\-\s]+$/.test(cepEntrada) || !/^\d{8}$/.test(normalizarCep(cepEntrada))) {
        throw new ErroFrete("Informe um CEP valido com 8 digitos");
    }
    if (!Array.isArray(itensEntrada) || !itensEntrada.length || itensEntrada.length > 50) throw new ErroFrete("Informe entre 1 e 50 itens para calcular frete");
    const quantidades = new Map<number,number>();
    for (const item of itensEntrada) {
        if (!item || !Number.isSafeInteger(item.produtoId) || item.produtoId <= 0 || !Number.isSafeInteger(item.quantidade) || item.quantidade <= 0 || item.quantidade > 999) {
            throw new ErroFrete("Produto e quantidade invalidos para cotacao");
        }
        const quantidade = (quantidades.get(item.produtoId) ?? 0) + item.quantidade;
        if (quantidade > 999) throw new ErroFrete("Quantidade por produto deve ser ate 999");
        quantidades.set(item.produtoId, quantidade);
    }
    conferirConfiguracao();
    const produtos = await prisma.produto.findMany({where:{id:{in:[...quantidades.keys()]}}});
    const itens: ItemFrete[] = [];
    for (const [id,quantidade] of quantidades) {
        const produto = produtos.find(p=>p.id === id);
        if (!produto || (!produto.publicadoNaLoja && !permitirInternos)) throw new ErroFrete("Um produto nao esta disponivel para entrega");
        if (produto.estoque < quantidade) throw new ErroFrete("Estoque insuficiente para " + produto.nome);
        if (![produto.pesoKg,produto.alturaCm,produto.larguraCm,produto.comprimentoCm].every(v=>v !== null && Number.isFinite(Number(v)) && Number(v)>0)) {
            throw new ErroFrete("O produto " + produto.nome + " ainda nao tem peso e medidas de envio cadastrados", 422);
        }
        itens.push({produto,quantidade});
    }
    const url = env.MELHOR_ENVIO_AMBIENTE === "production" ? "https://melhorenvio.com.br" : "https://sandbox.melhorenvio.com.br";
    let resposta: Response;
    try {
        resposta = await fetch(url + "/api/v2/me/shipment/calculate", {
            method: "POST", signal: AbortSignal.timeout(10_000),
            headers: { "Content-Type":"application/json", Accept:"application/json", Authorization:"Bearer " + env.MELHOR_ENVIO_TOKEN, "User-Agent":"LojaJapaoBot (" + env.MELHOR_ENVIO_CONTATO + ")" },
            body: JSON.stringify({from:{postal_code:env.FRETE_CEP_ORIGEM},to:{postal_code:normalizarCep(cepEntrada)},products:produtosCotacao(itens),services:"1,2",options:{receipt:false,own_hand:false}})
        });
    } catch { throw new ErroFrete("Nao foi possivel consultar o frete agora. Tente novamente", 503); }
    if (!resposta.ok) throw new ErroFrete("Consulta de frete indisponivel. Tente novamente ou contate a loja", 503);
    const body: unknown = await resposta.json().catch(()=>null);
    if (!Array.isArray(body)) throw new ErroFrete("Resposta de frete invalida. Tente novamente", 502);
    const opcoes = [];
    for (const opcao of body) {
        if (!opcao || opcao.error || ![1,2].includes(Number(opcao.id))) continue;
        if (opcao.custom_price === null || opcao.custom_price === undefined || opcao.custom_price === "" ||
            opcao.custom_delivery_time === null || opcao.custom_delivery_time === undefined || opcao.custom_delivery_time === "") continue;
        const valor = Number(opcao.custom_price), prazoDias = Number(opcao.custom_delivery_time);
        if (!Number.isFinite(valor) || valor < 0 || valor > 999999 || !Number.isInteger(prazoDias) || prazoDias < 0 || prazoDias > 365 ||
            typeof opcao.name !== "string" || !opcao.name.trim() || typeof opcao.company?.name !== "string" || !opcao.company.name.trim()) continue;
        opcoes.push(assinarCotacaoFrete({valor:Number(valor.toFixed(2)),prazoDias,servicoId:String(opcao.id),servico:opcao.name.slice(0,100),transportadora:opcao.company.name.slice(0,100),ambiente:env.MELHOR_ENVIO_AMBIENTE},itens,cepEntrada));
    }
    if (!opcoes.length) throw new ErroFrete("Nenhuma opcao de entrega disponivel para este CEP e estes produtos", 422);
    return {
        subtotalProdutos: Number(itens.reduce((sum,i)=>sum + Number((Number(i.produto.preco)*i.quantidade).toFixed(2)),0).toFixed(2)),
        opcoes: opcoes.sort((a,b)=>a.valor-b.valor)
    };
}
