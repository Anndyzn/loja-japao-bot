import { obterTodosClientes } from "./clientes.service.js";
import { obterTodosPagamentos } from "./pagamentos.service.js";
import { obterTodosPedidos } from "./pedidos.service.js";
import { obterTodosProdutos } from "./produtos.service.js";
import { obterTodasSolicitacoes } from "./solicitacoes.service.js";

export function obterResumoDashboard() {
    const produtos = obterTodosProdutos();
    const clientes = obterTodosClientes();
    const pagamentos = obterTodosPagamentos();
    const pedidos = obterTodosPedidos();
    const solicitacoes = obterTodasSolicitacoes();

    const produtosComEstoqueBaixo = produtos.filter((produto) => produto.estoque <= 5);
    const pedidosPendentes = pedidos.filter((pedido) => pedido.status === "pendente");
    const pedidosPagos = pedidos.filter((pedido) => pedido.status === "pago");
    const pedidosEnviados = pedidos.filter((pedido) => pedido.status === "enviado");
    const solicitacoesAbertas = solicitacoes.filter((solicitacao) => {
        return ["recebida", "em_analise", "cotada"].includes(solicitacao.status);
    });

    const faturamentoConfirmado = pedidos
        .filter((pedido) => pedido.status === "pago" || pedido.status === "enviado")
        .reduce((total, pedido) => total + pedido.total, 0);

    return {
        produtos: {
            total: produtos.length,
            estoqueBaixo: produtosComEstoqueBaixo.length
        },
        clientes: {
            total: clientes.length
        },
        pedidos: {
            total: pedidos.length,
            pendentes: pedidosPendentes.length,
            pagos: pedidosPagos.length,
            enviados: pedidosEnviados.length,
            faturamentoConfirmado: Number(faturamentoConfirmado.toFixed(2))
        },
        pagamentos: {
            total: pagamentos.length,
            aprovados: pagamentos.length
        },
        solicitacoes: {
            total: solicitacoes.length,
            abertas: solicitacoesAbertas.length
        }
    };
}
