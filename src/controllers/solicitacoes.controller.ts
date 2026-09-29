import type { Request, Response } from "express";
import type { StatusSolicitacao } from "../data/solicitacoes.js";
import { obterClientePorId } from "../services/clientes.service.js";
import { atualizarStatusSolicitacaoPorId, criarSolicitacaoProduto, obterSolicitacaoPorId, obterSolicitacoesFiltradas, obterSolicitacoesPorClienteId } from "../services/solicitacoes.service.js";
import { idEhInvalido, validarAtualizacaoStatusSolicitacao, validarCriacaoSolicitacao } from "../utils/validacoes.js";

export function listarSolicitacoes(req: Request, res: Response) {
    const { status } = req.query;

    if (status !== undefined) {
        const erroValidacao = validarAtualizacaoStatusSolicitacao(status);

        if (erroValidacao) {
            return res.status(400).json({
                mensagem: erroValidacao
            });
        }
    }

    const solicitacoesFiltradas = obterSolicitacoesFiltradas({
        status: status as StatusSolicitacao | undefined
    });

    return res.json(solicitacoesFiltradas);
}

export function buscarSolicitacaoPorId(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um número inteiro positivo"
        });
    }

    const solicitacao = obterSolicitacaoPorId(id);

    if (!solicitacao) {
        return res.status(404).json({
            mensagem: "Solicitação não encontrada"
        });
    }

    return res.json(solicitacao);
}

export function listarSolicitacoesPorCliente(req: Request, res: Response) {
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

    const solicitacoesDoCliente = obterSolicitacoesPorClienteId(clienteId);

    return res.json(solicitacoesDoCliente);
}

export function cadastrarSolicitacao(req: Request, res: Response) {
    const { clienteId, nomeProduto, descricao, linkReferencia } = req.body;

    const erroValidacao = validarCriacaoSolicitacao(clienteId, nomeProduto, descricao, linkReferencia);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const linkTratado = typeof linkReferencia === "string" ? linkReferencia.trim() : undefined;

    const resultado = criarSolicitacaoProduto(
        clienteId,
        nomeProduto.trim(),
        descricao.trim(),
        linkTratado
    );

    if (resultado.mensagemErro) {
        return res.status(400).json({
            mensagem: resultado.mensagemErro
        });
    }

    return res.status(201).json(resultado.solicitacao);
}

export function atualizarStatusSolicitacao(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um número inteiro positivo"
        });
    }

    const { status } = req.body;

    const erroValidacao = validarAtualizacaoStatusSolicitacao(status);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const solicitacao = atualizarStatusSolicitacaoPorId(id, status as StatusSolicitacao);

    if (!solicitacao) {
        return res.status(404).json({
            mensagem: "Solicitação não encontrada"
        });
    }

    return res.json(solicitacao);
}
