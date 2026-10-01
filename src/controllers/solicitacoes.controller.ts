import type { Request, Response } from "express";
import { obterClientePorId } from "../services/clientes.service.js";
import type { StatusSolicitacao } from "../services/solicitacoes.service.js";
import { criarSolicitacaoPublica, atualizarCotacaoSolicitacaoPorId, atualizarStatusSolicitacaoPorId, criarSolicitacaoProduto, obterSolicitacaoPorId, obterSolicitacoesFiltradas, obterSolicitacoesPorClienteId, vincularClienteSolicitacaoPorId, vincularPedidoSolicitacaoPorId, vincularProdutoSolicitacaoPorId } from "../services/solicitacoes.service.js";
import { obterParametrosPaginacao, paginarLista } from "../utils/paginacao.js";
import { validarSolicitacaoPublica, idEhInvalido, validarAtualizacaoCotacaoSolicitacao, validarAtualizacaoStatusSolicitacao, validarCriacaoSolicitacao } from "../utils/validacoes.js";

export async function listarSolicitacoes(req: Request, res: Response) {
    const { status, pagina, limite } = req.query;

    if (status !== undefined) {
        const erroValidacao = validarAtualizacaoStatusSolicitacao(status);

        if (erroValidacao) {
            return res.status(400).json({
                mensagem: erroValidacao
            });
        }
    }

    const solicitacoesFiltradas = await obterSolicitacoesFiltradas({
        status: status as StatusSolicitacao | undefined
    });

    const paginacao = obterParametrosPaginacao(pagina, limite);

    if (paginacao.mensagemErro) {
        return res.status(400).json({
            mensagem: paginacao.mensagemErro
        });
    }

    return res.json(paginarLista(solicitacoesFiltradas, paginacao.pagina!, paginacao.limite!));
}

export async function buscarSolicitacaoPorId(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um numero inteiro positivo"
        });
    }

    const solicitacao = await obterSolicitacaoPorId(id);

    if (!solicitacao) {
        return res.status(404).json({
            mensagem: "Solicitacao nao encontrada"
        });
    }

    return res.json(solicitacao);
}

export async function listarSolicitacoesPorCliente(req: Request, res: Response) {
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

    const solicitacoesDoCliente = await obterSolicitacoesPorClienteId(clienteId);

    const { pagina, limite } = req.query;

    const paginacao = obterParametrosPaginacao(pagina, limite);

    if (paginacao.mensagemErro) {
        return res.status(400).json({
            mensagem: paginacao.mensagemErro
        });
    }

    return res.json(paginarLista(solicitacoesDoCliente, paginacao.pagina!, paginacao.limite!));
}

export async function cadastrarSolicitacao(req: Request, res: Response) {
    const { clienteId, nomeProduto, descricao, linkReferencia } = req.body;

    const erroValidacao = validarCriacaoSolicitacao(clienteId, nomeProduto, descricao, linkReferencia);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const linkTratado = typeof linkReferencia === "string" ? linkReferencia.trim() : undefined;

    const resultado = await criarSolicitacaoProduto(
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

export async function atualizarStatusSolicitacao(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um numero inteiro positivo"
        });
    }

    const { status } = req.body;

    const erroValidacao = validarAtualizacaoStatusSolicitacao(status);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const solicitacao = await atualizarStatusSolicitacaoPorId(id, status as StatusSolicitacao);

    if (!solicitacao) {
        return res.status(404).json({
            mensagem: "Solicitacao nao encontrada"
        });
    }

    return res.json(solicitacao);
}

export async function atualizarCotacaoSolicitacao(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um numero inteiro positivo"
        });
    }

    const { valorCotado, observacaoAdmin } = req.body;
    const erroValidacao = validarAtualizacaoCotacaoSolicitacao(valorCotado, observacaoAdmin);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const solicitacao = await atualizarCotacaoSolicitacaoPorId(
        id,
        valorCotado,
        typeof observacaoAdmin === "string" && observacaoAdmin.trim() !== "" ? observacaoAdmin.trim() : undefined
    );

    if (!solicitacao) {
        return res.status(404).json({
            mensagem: "Solicitacao nao encontrada"
        });
    }

    return res.json(solicitacao);
}

export async function vincularClienteSolicitacao(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um numero inteiro positivo"
        });
    }

    const { clienteId } = req.body;

    if (typeof clienteId !== "number" || idEhInvalido(clienteId)) {
        return res.status(400).json({
            mensagem: "Cliente ID deve ser um numero inteiro positivo"
        });
    }

    const resultado = await vincularClienteSolicitacaoPorId(id, clienteId);

    if (resultado.mensagemErro) {
        return res.status(404).json({
            mensagem: resultado.mensagemErro
        });
    }

    return res.json(resultado.solicitacao);
}

export async function vincularProdutoSolicitacao(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um numero inteiro positivo"
        });
    }

    const { produtoId } = req.body;

    if (typeof produtoId !== "number" || idEhInvalido(produtoId)) {
        return res.status(400).json({
            mensagem: "Produto ID deve ser um numero inteiro positivo"
        });
    }

    const resultado = await vincularProdutoSolicitacaoPorId(id, produtoId);

    if (resultado.mensagemErro) {
        return res.status(404).json({
            mensagem: resultado.mensagemErro
        });
    }

    return res.json(resultado.solicitacao);
}

export async function vincularPedidoSolicitacao(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um numero inteiro positivo"
        });
    }

    const { pedidoId } = req.body;

    if (typeof pedidoId !== "number" || idEhInvalido(pedidoId)) {
        return res.status(400).json({
            mensagem: "Pedido ID deve ser um numero inteiro positivo"
        });
    }

    const resultado = await vincularPedidoSolicitacaoPorId(id, pedidoId);

    if (resultado.mensagemErro) {
        return res.status(404).json({
            mensagem: resultado.mensagemErro
        });
    }

    return res.json(resultado.solicitacao);
}

export async function cadastrarSolicitacaoPublica(req: Request, res: Response) {
    const { nome, telefone, nomeProduto, descricao, linkReferencia } = req.body ?? {};
    const erro = validarSolicitacaoPublica(nome, telefone, nomeProduto, descricao, linkReferencia);
    if (erro) return res.status(400).json({ mensagem: erro });
    const resultado = await criarSolicitacaoPublica(
        nome.trim(), telefone.trim(), nomeProduto.trim(), descricao.trim(),
        typeof linkReferencia === "string" ? linkReferencia.trim() : undefined
    );
    return res.status(201).json(resultado);
}
