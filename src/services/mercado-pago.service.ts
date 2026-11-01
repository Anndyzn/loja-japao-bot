import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { bloquearPedido } from "../utils/bloqueios.js";
import { env } from "../config/env.js";
import { ErroMercadoPago, configuracaoMp, centavos, moedaMp, requisitarMp, validarOrder, validarUrlCheckout, avaliarOrder } from "./mercado-pago-api.js";

export async function resumoMercadoPago(pedidoId: number) {
    const tentativa = await prisma.cobrancaMercadoPago.findUnique({ where: { pedidoId } });
    return {
        disponivel: !!env.MERCADO_PAGO, teste: true, iniciada: !!tentativa,
        linkCriado: !!(tentativa?.orderId && tentativa.checkoutUrl),
        status: tentativa?.status ?? null, revisao: tentativa?.revisao ?? false
    };
}
export async function iniciarPagamentoMp(pedidoId: number, clienteId: number) {
    const config = configuracaoMp();
    // Persiste chave e corpo ANTES da chamada externa. Um timeout nao cria uma nova tentativa.
    const tentativa = await prisma.$transaction(async tx => {
        await bloquearPedido(tx, pedidoId);
        const pedido = await tx.pedido.findUnique({ where: { id: pedidoId }, include: { itens: true, pagamentos: true } });
        if (!pedido || pedido.clienteId !== clienteId) throw new ErroMercadoPago("Pedido nao encontrado.", 404);
        if (pedido.status !== "pendente" || pedido.pagamentos.length) throw new ErroMercadoPago("Este pedido nao esta disponivel para pagamento.", 409);
        const existente = await tx.cobrancaMercadoPago.findUnique({ where: { pedidoId } });
        if (existente) return existente;
        if (centavos(pedido.total) <= 0) throw new ErroMercadoPago("O total do pedido deve ser maior que zero.");
        const chave = randomUUID();
        const itens = pedido.itens.map(i => ({ title: i.nomeProduto, quantity: i.quantidade, unit_price: moedaMp(i.precoUnitario) }));
        if (centavos(pedido.freteValor) > 0) itens.push({ title: "Frete", quantity: 1, unit_price: moedaMp(pedido.freteValor) });
        if (itens.reduce((soma, i) => soma + centavos(i.unit_price) * i.quantity, 0) !== centavos(pedido.total))
            throw new ErroMercadoPago("Os valores do pedido precisam ser revisados pela loja.", 409);
        const retorno = config.origem ? config.origem + "/loja/acompanhamento?pedido=" + pedidoId : null;
        const corpo = {
            type: "online", processing_mode: "manual", capture_mode: "automatic_async",
            total_amount: moedaMp(pedido.total), external_reference: chave, expiration_time: "P1D", items: itens,
            // O comprador informa seus dados na pagina do MP. Nao enviar e-mail real para simular pagamento.
            config: {
                payment_method: { not_allowed_types: ["ticket", "debit_card", "prepaid_card", "atm", "account_money", "digital_currency"], max_installments: 1 },
                online: { retries: { allowed: false }, ...(retorno ? { success_url: retorno, failure_url: retorno, pending_url: retorno, auto_return: "all" } : {}) }
            }
        };
        return tx.cobrancaMercadoPago.create({ data: { pedidoId, chave, total: pedido.total, requisicao: corpo } });
    });
    if (tentativa.revisao || ["canceled", "refunded", "failed", "processed"].includes(tentativa.status))
        throw new ErroMercadoPago("Esta tentativa ja foi encerrada ou precisa de revisao. Consulte o acompanhamento.", 409);
    if (tentativa.checkoutUrl && tentativa.orderId)
        return { url: validarUrlCheckout(tentativa.checkoutUrl, tentativa.orderId) };
    const order = await requisitarMp("", tentativa.requisicao, tentativa.chave);
    validarOrder(order, tentativa.chave, tentativa.total);
    const url = validarUrlCheckout(order.checkout_url, order.id);
    await prisma.$transaction(async tx => {
        await bloquearPedido(tx, pedidoId);
        const atual = await tx.cobrancaMercadoPago.findUniqueOrThrow({ where: { pedidoId } });
        if (atual.orderId && atual.orderId !== order.id) throw new ErroMercadoPago("Tentativa de pagamento divergente.", 409);
        // Nao retroceder o status se um webhook ja atualizou a mesma tentativa.
        await tx.cobrancaMercadoPago.update({ where: { pedidoId }, data: {
            orderId: order.id, vendedorId: String(order.user_id), checkoutUrl: url
        } });
    });
    return { url };
}
export async function consultarPagamentoMp(pedidoId: number, clienteId?: number) {
    configuracaoMp();
    // Serializa consultas concorrentes, inclusive webhook e cliente, para nao aplicar estados fora de ordem.
    return prisma.$transaction(async tx => {
        await bloquearPedido(tx, pedidoId);
        const pedido = await tx.pedido.findUnique({ where: { id: pedidoId }, include: { pagamentos: true } });
        if (!pedido || (clienteId !== undefined && pedido.clienteId !== clienteId)) throw new ErroMercadoPago("Pedido nao encontrado.", 404);
        const tentativa = await tx.cobrancaMercadoPago.findUnique({ where: { pedidoId } });
        if (!tentativa?.orderId) throw new ErroMercadoPago("O link de pagamento ainda nao foi criado.", 409);
        const order = await requisitarMp("/" + tentativa.orderId);
        validarOrder(order, tentativa.chave, pedido.total, tentativa.vendedorId, tentativa.orderId);
        const atualizadaEm = new Date(order.last_updated_date);
        if (tentativa.atualizadaRemotoEm && atualizadaEm < tentativa.atualizadaRemotoEm)
            return { mensagem: "Aguardando atualizacao do Mercado Pago.", status: pedido.status };
        const avaliacao = avaliarOrder(order);
        // Uma revisao financeira nunca e desfeita automaticamente.
        const revisao = tentativa.revisao || avaliacao.revisao ||
            (!!avaliacao.pagamentoId && (pedido.status === "cancelado" ||
                pedido.pagamentos.some(p => p.mercadoPagoId !== avaliacao.pagamentoId))) ||
            (pedido.pagamentos.some(p => p.mercadoPagoId) && !avaliacao.pagamentoId);
        await tx.cobrancaMercadoPago.update({ where: { pedidoId }, data: {
            status: order.status, revisao, atualizadaRemotoEm: atualizadaEm
        } });
        if (revisao) {
            await tx.pagamento.updateMany({ where: { pedidoId, mercadoPagoId: { not: null } }, data: { status: "em_revisao" } });
            if (!tentativa.revisao) await historico(tx, pedidoId, pedido.status,
                "Mercado Pago (teste): pagamento precisa de revisao. Confira reembolso, contestacao ou divergencia antes do envio.");
            return { mensagem: "Pagamento em revisao pela loja. Nao pague novamente.", status: pedido.status };
        }
        if (avaliacao.pagamentoId && avaliacao.metodo) {
            const existente = pedido.pagamentos.find(p => p.mercadoPagoId === avaliacao.pagamentoId);
            if (!existente) {
                await tx.pagamento.create({ data: { pedidoId, valor: pedido.total, metodo: avaliacao.metodo, mercadoPagoId: avaliacao.pagamentoId } });
                await tx.pedido.update({ where: { id: pedidoId }, data: { status: "pago" } });
                await historico(tx, pedidoId, "pago", "Pagamento de TESTE confirmado pela API do Mercado Pago via " + avaliacao.metodo + ". Nao enviar mercadoria real.");
            }
            return { mensagem: "Pagamento de teste confirmado.", status: pedido.status === "enviado" ? "enviado" : "pago" };
        }
        return { mensagem: order.status === "failed" ? "Pagamento recusado. Nenhum pagamento foi confirmado." :
            order.status === "canceled" ? "Cobranca cancelada ou expirada." : "Pagamento ainda nao confirmado pelo Mercado Pago.", status: pedido.status };
    }, { timeout: 15000, maxWait: 3000 });
}
async function historico(tx: Prisma.TransactionClient, pedidoId: number, status: "pendente" | "pago" | "enviado" | "cancelado", descricao: string) {
    await tx.historicoPedido.create({ data: { pedidoId, status, descricao } });
}
