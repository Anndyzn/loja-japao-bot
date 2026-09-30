import type { Request, Response } from "express";
import { obterAcompanhamentoPedido } from "../services/acompanhamento.service.js";
import { obterClientePorId } from "../services/clientes.service.js";
import type { StatusPedido } from "../services/pedidos.service.js";
import { atualizarStatusPedidoPorId, criarPedido, obterPedidoPorId, obterPedidosFiltrados, obterPedidosPorClienteId } from "../services/pedidos.service.js";
import { obterParametrosPaginacao, paginarLista } from "../utils/paginacao.js";
import { idEhInvalido, validarAtualizacaoStatusPedido, validarCriacaoPedido } from "../utils/validacoes.js";

export async function listarPedidos(req: Request, res: Response) {
    const { status, pagina, limite } = req.query;

    if (status !== undefined) {
        const erroValidacao = validarAtualizacaoStatusPedido(status);

        if (erroValidacao) {
            return res.status(400).json({
                mensagem: erroValidacao
            });
        }
    }

    const pedidosFiltrados = await obterPedidosFiltrados({
        status: status as StatusPedido | undefined
    });

    const paginacao = obterParametrosPaginacao(pagina, limite);

    if (paginacao.mensagemErro) {
        return res.status(400).json({
            mensagem: paginacao.mensagemErro
        });
    }

    return res.json(paginarLista(pedidosFiltrados, paginacao.pagina!, paginacao.limite!));
}

export async function buscarPedidoPorId(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um numero inteiro positivo"
        });
    }

    const pedido = await obterPedidoPorId(id);

    if (!pedido) {
        return res.status(404).json({
            mensagem: "Pedido nao encontrado"
        });
    }

    return res.json(pedido);
}

export async function acompanharPedido(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um numero inteiro positivo"
        });
    }

    const acompanhamento = await obterAcompanhamentoPedido(id);

    if (!acompanhamento) {
        return res.status(404).json({
            mensagem: "Pedido nao encontrado"
        });
    }

    return res.json(acompanhamento);
}

export async function listarPedidosPorCliente(req: Request, res: Response) {
    const clienteId = Number(req.params.clienteId);

    if (idEhInvalido(clienteId)) {
        return res.status(400).json({
            mensagem: "Cliente ID deve ser um numero inteiro positivo"
        });
    }

    const cliente = await obterClientePorId(clienteId);

    if (!cliente) {
        return res.status(404).json({
            mensagem: "Cliente nao encontrado"
        });
    }

    const pedidosDoCliente = await obterPedidosPorClienteId(clienteId);

    const { pagina, limite } = req.query;

    const paginacao = obterParametrosPaginacao(pagina, limite);

    if (paginacao.mensagemErro) {
        return res.status(400).json({
            mensagem: paginacao.mensagemErro
        });
    }

    return res.json(paginarLista(pedidosDoCliente, paginacao.pagina!, paginacao.limite!));
}

export async function cadastrarPedido(req: Request, res: Response) {
    const { clienteId, itens, observacao } = req.body;

    const erroValidacao = validarCriacaoPedido(clienteId, itens, observacao);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const observacaoTratada = typeof observacao === "string" ? observacao.trim() : undefined;

    const resultado = await criarPedido(clienteId, itens, observacaoTratada);

    if (resultado.mensagemErro) {
        return res.status(400).json({
            mensagem: resultado.mensagemErro
        });
    }

    return res.status(201).json(resultado.pedido);
}

export async function atualizarStatusPedido(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um numero inteiro positivo"
        });
    }

    const { status } = req.body;

    const erroValidacao = validarAtualizacaoStatusPedido(status);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const resultado = await atualizarStatusPedidoPorId(id, status as StatusPedido);

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

    return res.json(resultado.pedido);
}
