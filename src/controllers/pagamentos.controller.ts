import type { Request, Response } from "express";
import type { MetodoPagamento } from "../data/pagamentos.js";
import { criarPagamento, obterPagamentoPorId, obterPagamentosPorPedidoId, obterTodosPagamentos } from "../services/pagamentos.service.js";
import { obterPedidoPorId } from "../services/pedidos.service.js";
import { idEhInvalido, validarCriacaoPagamento } from "../utils/validacoes.js";

export function listarPagamentos(req: Request, res: Response) {
    const todosPagamentos = obterTodosPagamentos();

    return res.json(todosPagamentos);
}

export function buscarPagamentoPorId(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um número inteiro positivo"
        });
    }

    const pagamento = obterPagamentoPorId(id);

    if (!pagamento) {
        return res.status(404).json({
            mensagem: "Pagamento não encontrado"
        });
    }

    return res.json(pagamento);
}

export function listarPagamentosPorPedido(req: Request, res: Response) {
    const pedidoId = Number(req.params.pedidoId);

    if (idEhInvalido(pedidoId)) {
        return res.status(400).json({
            mensagem: "Pedido ID deve ser um número inteiro positivo"
        });
    }

    const pedido = obterPedidoPorId(pedidoId);

    if (!pedido) {
        return res.status(404).json({
            mensagem: "Pedido não encontrado"
        });
    }

    const pagamentosDoPedido = obterPagamentosPorPedidoId(pedidoId);

    return res.json(pagamentosDoPedido);
}

export function cadastrarPagamento(req: Request, res: Response) {
    const { pedidoId, metodo } = req.body;

    const erroValidacao = validarCriacaoPagamento(pedidoId, metodo);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const resultado = criarPagamento(pedidoId, metodo as MetodoPagamento);

    if (resultado.mensagemErro === "Pedido não encontrado") {
        return res.status(404).json({
            mensagem: resultado.mensagemErro
        });
    }

    if (resultado.mensagemErro) {
        return res.status(400).json({
            mensagem: resultado.mensagemErro
        });
    }

    return res.status(201).json(resultado.pagamento);
}
