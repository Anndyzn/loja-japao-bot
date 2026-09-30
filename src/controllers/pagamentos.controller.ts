import type { Request, Response } from "express";
import type { MetodoPagamento } from "../services/pagamentos.service.js";
import { criarPagamento, obterPagamentoPorId, obterPagamentosPorPedidoId, obterTodosPagamentos } from "../services/pagamentos.service.js";
import { obterPedidoPorId } from "../services/pedidos.service.js";
import { idEhInvalido, validarCriacaoPagamento } from "../utils/validacoes.js";

export async function listarPagamentos(req: Request, res: Response) {
    const todosPagamentos = await obterTodosPagamentos();

    return res.json(todosPagamentos);
}

export async function buscarPagamentoPorId(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um numero inteiro positivo"
        });
    }

    const pagamento = await obterPagamentoPorId(id);

    if (!pagamento) {
        return res.status(404).json({
            mensagem: "Pagamento nao encontrado"
        });
    }

    return res.json(pagamento);
}

export async function listarPagamentosPorPedido(req: Request, res: Response) {
    const pedidoId = Number(req.params.pedidoId);

    if (idEhInvalido(pedidoId)) {
        return res.status(400).json({
            mensagem: "Pedido ID deve ser um numero inteiro positivo"
        });
    }

    const pedido = await obterPedidoPorId(pedidoId);

    if (!pedido) {
        return res.status(404).json({
            mensagem: "Pedido nao encontrado"
        });
    }

    const pagamentosDoPedido = await obterPagamentosPorPedidoId(pedidoId);

    return res.json(pagamentosDoPedido);
}

export async function cadastrarPagamento(req: Request, res: Response) {
    const { pedidoId, metodo } = req.body;

    const erroValidacao = validarCriacaoPagamento(pedidoId, metodo);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const resultado = await criarPagamento(pedidoId, metodo as MetodoPagamento);

    if (resultado.mensagemErro === "Pedido nao encontrado") {
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
