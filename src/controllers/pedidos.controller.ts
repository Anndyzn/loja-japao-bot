import type { Request, Response } from "express";
import type { StatusPedido } from "../data/pedidos.js";
import { obterClientePorId } from "../services/clientes.service.js";
import { atualizarStatusPedidoPorId, criarPedido, obterPedidoPorId, obterPedidosPorClienteId, obterTodosPedidos } from "../services/pedidos.service.js";
import { idEhInvalido, validarAtualizacaoStatusPedido, validarCriacaoPedido } from "../utils/validacoes.js";

export function listarPedidos(req: Request, res: Response) {
    const todosPedidos = obterTodosPedidos();

    return res.json(todosPedidos);
}

export function buscarPedidoPorId(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um número inteiro positivo"
        });
    }

    const pedido = obterPedidoPorId(id);

    if (!pedido) {
        return res.status(404).json({
            mensagem: "Pedido não encontrado"
        });
    }

    return res.json(pedido);
}

export function listarPedidosPorCliente(req: Request, res: Response) {
    const clienteId = Number(req.params.clienteId);

    if (idEhInvalido(clienteId)) {
        return res.status(400).json({
            mensagem: "Cliente ID deve ser um número inteiro positivo"
        });
    }

    const cliente = obterClientePorId(clienteId);

    if (!cliente) {
        return res.status(404).json({
            mensagem: "Cliente não encontrado"
        });
    }

    const pedidosDoCliente = obterPedidosPorClienteId(clienteId);

    return res.json(pedidosDoCliente);
}

export function cadastrarPedido(req: Request, res: Response) {
    const { clienteId, itens } = req.body;

    const erroValidacao = validarCriacaoPedido(clienteId, itens);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const resultado = criarPedido(clienteId, itens);

    if (resultado.mensagemErro) {
        return res.status(400).json({
            mensagem: resultado.mensagemErro
        });
    }

    return res.status(201).json(resultado.pedido);
}

export function atualizarStatusPedido(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um número inteiro positivo"
        });
    }

    const { status } = req.body;

    const erroValidacao = validarAtualizacaoStatusPedido(status);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const resultado = atualizarStatusPedidoPorId(id, status as StatusPedido);

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

    return res.json(resultado.pedido);
}
