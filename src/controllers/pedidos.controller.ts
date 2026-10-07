import type { Request, Response } from "express";
import { obterPixManual } from "../services/pix.service.js";
import { obterAcompanhamentoPedido } from "../services/acompanhamento.service.js";
import { obterClientePorId } from "../services/clientes.service.js";
import type { StatusPedido } from "../services/pedidos.service.js";
import { atualizarRastreioPedidoPorId, atualizarStatusPedidoPorId, criarPedido, obterPedidoPorId, obterPedidosFiltrados } from "../services/pedidos.service.js";
import { obterParametrosPaginacao } from "../utils/paginacao.js";
import { montarListagemPedidos } from "../utils/listagem-pedidos.js";
import type { AcaoPedido } from "../utils/listagem-pedidos.js";
import { idEhInvalido, validarAtualizacaoStatusPedido, validarCriacaoPedido } from "../utils/validacoes.js";
import { validarTokenAdmin } from "../utils/tokens.js";

function obterPermissaoProdutoInterno(req: Request) {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return {
            permitir: false
        };
    }

    if (!authorization.startsWith("Bearer ")) {
        return {
            permitir: false,
            mensagemErro: "Token de admin invalido"
        };
    }

    const token = authorization.replace("Bearer ", "").trim();

    if (!validarTokenAdmin(token)) {
        return {
            permitir: false,
            mensagemErro: "Token de admin invalido ou expirado"
        };
    }

    return {
        permitir: true
    };
}

async function responderListagemPedidos(req: Request, res: Response, clienteId?: number) {
    const { status, pagina, limite, busca, precisaAcao, acao } = req.query;

    if (precisaAcao !== undefined && precisaAcao !== "true" && precisaAcao !== "false") {
        return res.status(400).json({ mensagem: "precisaAcao deve ser true ou false" });
    }
    if (acao !== undefined && (typeof acao !== "string" || !["pix", "rastreio", "envio"].includes(acao))) {
        return res.status(400).json({ mensagem: "Acao deve ser pix, rastreio ou envio" });
    }

    if (status !== undefined) {
        const erroValidacao = validarAtualizacaoStatusPedido(status);

        if (erroValidacao) {
            return res.status(400).json({
                mensagem: erroValidacao
            });
        }
    }

    if (busca !== undefined && typeof busca !== "string") {
        return res.status(400).json({
            mensagem: "Busca deve ser um texto"
        });
    }

    const buscaTratada = typeof busca === "string" ? busca.trim() : undefined;

    if (buscaTratada && buscaTratada.length > 100) {
        return res.status(400).json({
            mensagem: "Busca deve ter no maximo 100 caracteres"
        });
    }

    const paginacao = obterParametrosPaginacao(pagina, limite);

    if (paginacao.mensagemErro) {
        return res.status(400).json({
            mensagem: paginacao.mensagemErro
        });
    }

    const pedidosFiltrados = await obterPedidosFiltrados({
        clienteId,
        status: status as StatusPedido | undefined,
        busca: buscaTratada
    });
    return res.json(montarListagemPedidos(
        pedidosFiltrados, paginacao.pagina!, paginacao.limite!,
        precisaAcao === "true", acao as AcaoPedido | undefined
    ));
}

export async function listarPedidos(req: Request, res: Response) {
    return responderListagemPedidos(req, res);
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

    return res.json({
        ...pedido,
        pix: obterPixManual(pedido.status)
    });
}

export async function acompanharPedido(req: Request, res: Response) {
    const id = Number(req.params.id);
    const telefone = typeof req.query.telefone === "string" ? req.query.telefone.trim() : "";

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um numero inteiro positivo"
        });
    }

    if (!telefone) {
        return res.status(400).json({
            mensagem: "Informe o telefone usado no pedido"
        });
    }

    const resultado = await obterAcompanhamentoPedido(id, telefone);

    if (resultado.mensagemErro) {
        return res.status(resultado.statusHttp).json({
            mensagem: resultado.mensagemErro
        });
    }

    return res.json(resultado.acompanhamento);
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

    return responderListagemPedidos(req, res, clienteId);
}

export async function cadastrarPedido(req: Request, res: Response) {
    const {
        clienteId,
        itens,
        observacao,
        freteToken,
        tipoEnvio,
        clienteCienteTaxasImportacao,
        freteInternacionalValor
    } = req.body;
    const tipoEnvioTratado = tipoEnvio === "internacional_direto" ? "internacional_direto" : "nacional";

    if (tipoEnvio !== undefined && tipoEnvio !== "nacional" && tipoEnvio !== "internacional_direto") {
        return res.status(400).json({ mensagem: "Tipo de envio invalido" });
    }

    if (tipoEnvioTratado === "nacional" && (typeof freteToken !== "string" || !freteToken || freteToken.length > 8000)) {
        return res.status(400).json({ mensagem: "Calcule e selecione o frete antes de criar o pedido" });
    }

    if (
        tipoEnvioTratado === "internacional_direto" &&
        freteInternacionalValor !== undefined &&
        (typeof freteInternacionalValor !== "number" || !Number.isFinite(freteInternacionalValor) || freteInternacionalValor < 0)
    ) {
        return res.status(400).json({
            mensagem: "Frete internacional deve ser um numero maior ou igual a zero"
        });
    }

    const erroValidacao = validarCriacaoPedido(clienteId, itens, observacao);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const observacaoTratada = typeof observacao === "string" ? observacao.trim() : undefined;
    const permissaoProdutoInterno = obterPermissaoProdutoInterno(req);

    if (permissaoProdutoInterno.mensagemErro) {
        return res.status(401).json({
            mensagem: permissaoProdutoInterno.mensagemErro
        });
    }

    if (tipoEnvioTratado === "internacional_direto" && !permissaoProdutoInterno.permitir) {
        return res.status(401).json({
            mensagem: "Envio internacional direto so pode ser criado pelo admin"
        });
    }

    const resultado = await criarPedido(clienteId, itens, observacaoTratada, {
        permitirProdutoInterno: permissaoProdutoInterno.permitir,
        freteToken,
        freteInternacionalValor: tipoEnvioTratado === "internacional_direto" && typeof freteInternacionalValor === "number"
            ? freteInternacionalValor
            : undefined,
        tipoEnvio: tipoEnvioTratado,
        clienteCienteTaxasImportacao: clienteCienteTaxasImportacao === true
    });

    if (resultado.mensagemErro) {
        return res.status(400).json({
            mensagem: resultado.mensagemErro
        });
    }

    return res.status(201).json({
        ...resultado.pedido,
        pix: obterPixManual(resultado.pedido?.status)
    });
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

export async function atualizarRastreioPedido(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (idEhInvalido(id)) {
        return res.status(400).json({ mensagem: "ID deve ser um numero inteiro positivo" });
    }
    const { transportadora, codigoRastreio } = req.body ?? {};
    if (typeof transportadora !== "string" || !transportadora.trim() || transportadora.trim().length > 100) {
        return res.status(400).json({ mensagem: "Transportadora deve ter de 1 a 100 caracteres" });
    }
    if (typeof codigoRastreio !== "string" || !codigoRastreio.trim() || codigoRastreio.trim().length > 100) {
        return res.status(400).json({ mensagem: "Codigo de rastreio deve ter de 1 a 100 caracteres" });
    }
    const resultado = await atualizarRastreioPedidoPorId(id, transportadora.trim(), codigoRastreio.trim());
    if (resultado.mensagemErro) {
        return res.status(resultado.mensagemErro === "Pedido nao encontrado" ? 404 : 400)
            .json({ mensagem: resultado.mensagemErro });
    }
    return res.json(resultado.pedido);
}
