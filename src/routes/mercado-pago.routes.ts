import { Router } from "express";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { exigirCliente, protegerAcaoCliente } from "../middlewares/cliente.middleware.js";
import { limitarEscritaPublica } from "../middlewares/rate-limit.middleware.js";
import { ErroMercadoPago, assinaturaMpValida } from "../services/mercado-pago-api.js";
import { iniciarPagamentoMp, consultarPagamentoMp, resumoMercadoPago } from "../services/mercado-pago.service.js";

export const mercadoPagoRoutes = Router();
mercadoPagoRoutes.use((_req, res, next) => { res.setHeader("Cache-Control", "no-store"); next(); });
mercadoPagoRoutes.post("/webhook", async (req, res) => {
    const config = env.MERCADO_PAGO;
    if (!config?.segredoWebhook) return res.sendStatus(503);
    const id = req.query["data.id"];
    if (!assinaturaMpValida(id, req.get("x-signature"), req.get("x-request-id"), config.segredoWebhook))
        return res.sendStatus(401);
    if (req.body?.type !== "order" || req.body?.live_mode !== false ||
        typeof req.body?.data?.id !== "string" || req.body.data.id.toUpperCase() !== String(id).toUpperCase())
        return res.sendStatus(400);
    const tentativa = await prisma.cobrancaMercadoPago.findUnique({ where: { orderId: String(id).toUpperCase() } });
    // A entrega pode chegar antes da resposta do POST. Pedimos retentativa, sem confirmar o corpo recebido.
    if (!tentativa) return res.sendStatus(503);
    await consultarPagamentoMp(tentativa.pedidoId);
    return res.sendStatus(200);
});
for (const acao of ["iniciar", "consultar"] as const) {
    mercadoPagoRoutes.post("/pedidos/:id/" + acao, protegerAcaoCliente, exigirCliente, limitarEscritaPublica, async (req, res) => {
        const id = Number(req.params.id);
        if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ mensagem: "Pedido invalido." });
        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body) || Object.keys(req.body).length)
            return res.status(400).json({ mensagem: "O pagamento usa os valores salvos no pedido. Nao envie valores no formulario." });
        const resultado = acao === "iniciar" ? await iniciarPagamentoMp(id, res.locals.clienteId as number) :
            await consultarPagamentoMp(id, res.locals.clienteId as number);
        return res.json(acao === "consultar" ? { ...resultado, mercadoPago: await resumoMercadoPago(id) } : resultado);
    });
}
mercadoPagoRoutes.use(((erro, _req, res, next) => {
    if (erro instanceof ErroMercadoPago) return res.status(erro.status).json({ mensagem: erro.message });
    return next(erro);
}) as import("express").ErrorRequestHandler);
