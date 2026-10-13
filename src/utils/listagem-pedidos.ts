import type { PedidoResposta } from "../services/pedidos.service.js";
import { paginarLista } from "./paginacao.js";

export type AcaoPedido = "pix" | "rastreio" | "envio";

export function obterAcaoPedido(pedido: PedidoResposta): AcaoPedido | undefined {
    if (pedido.status === "pendente") return "pix";
    if (pedido.status !== "pago") return undefined;
    return pedido.transportadora && pedido.codigoRastreio ? "envio" : "rastreio";
}

export function montarListagemPedidos(
    pedidos: PedidoResposta[], pagina: number, limite: number,
    precisaAcao: boolean, acao?: AcaoPedido, esperaPixHoras?: number, agora = Date.now()
) {
    let encontrados = pedidos.filter(pedido => {
        const tipo = obterAcaoPedido(pedido);
        if (esperaPixHoras !== undefined && (pedido.status !== "pendente" ||
            agora - new Date(pedido.criadoEm).getTime() < esperaPixHoras * 3600000)) return false;
        return (!precisaAcao || tipo !== undefined) && (!acao || tipo === acao);
    });
    if (precisaAcao || acao || esperaPixHoras !== undefined) {
        const prioridades = { pix: 1, rastreio: 2, envio: 3 };
        encontrados = encontrados.sort((a, b) => {
            if (esperaPixHoras !== undefined) {
                return new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime() || a.id - b.id;
            }
            const prioridade = (prioridades[obterAcaoPedido(a)!] ?? 4) - (prioridades[obterAcaoPedido(b)!] ?? 4);
            return prioridade || new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime() || b.id - a.id;
        });
    }
    const resumo = {
        valorTotal: 0, pendentes: 0, pagos: 0, enviados: 0, cancelados: 0,
        acoes: { pix: 0, rastreio: 0, envio: 0 }
    };
    for (const pedido of encontrados) {
        resumo.valorTotal += pedido.total;
        if (pedido.status === "pendente") resumo.pendentes++;
        if (pedido.status === "pago") resumo.pagos++;
        if (pedido.status === "enviado") resumo.enviados++;
        if (pedido.status === "cancelado") resumo.cancelados++;
        const tipo = obterAcaoPedido(pedido);
        if (tipo) resumo.acoes[tipo]++;
    }
    return { ...paginarLista(encontrados, pagina, limite), resumo };
}
