import type { Request, Response } from "express";
import { atualizarClientePorId, criarCliente, obterClientePorId, obterClientesFiltrados, removerClientePorId } from "../services/clientes.service.js";
import { idEhInvalido, validarAtualizacaoCliente, validarCriacaoCliente } from "../utils/validacoes.js";

export function listarClientes(req: Request, res: Response) {
    const { nome, telefone } = req.query;

    if (nome !== undefined && typeof nome !== "string") {
        return res.status(400).json({
            mensagem: "Filtro nome deve ser texto"
        });
    }

    if (telefone !== undefined && typeof telefone !== "string") {
        return res.status(400).json({
            mensagem: "Filtro telefone deve ser texto"
        });
    }

    const clientesFiltrados = obterClientesFiltrados({
        nome: typeof nome === "string" && nome.trim() !== "" ? nome.trim() : undefined,
        telefone: typeof telefone === "string" && telefone.trim() !== "" ? telefone.trim() : undefined
    });

    return res.json(clientesFiltrados);
}

export function buscarClientePorId(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um número inteiro positivo"
        });
    }

    const cliente = obterClientePorId(id);

    if (!cliente) {
        return res.status(404).json({
            mensagem: "Cliente não encontrado"
        });
    }

    return res.json(cliente);
}

export function cadastrarCliente(req: Request, res: Response) {
    const { nome, telefone, endereco } = req.body;

    const erroValidacao = validarCriacaoCliente(nome, telefone, endereco);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const novoCliente = criarCliente(nome.trim(), telefone.trim(), endereco.trim());

    return res.status(201).json(novoCliente);
}

export function atualizarCliente(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um número inteiro positivo"
        });
    }

    const { nome, telefone, endereco } = req.body;

    const erroValidacao = validarAtualizacaoCliente(nome, telefone, endereco);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const nomeAtualizado = typeof nome === "string" ? nome.trim() : nome;
    const telefoneAtualizado = typeof telefone === "string" ? telefone.trim() : telefone;
    const enderecoAtualizado = typeof endereco === "string" ? endereco.trim() : endereco;

    const cliente = atualizarClientePorId(id, nomeAtualizado, telefoneAtualizado, enderecoAtualizado);

    if (!cliente) {
        return res.status(404).json({
            mensagem: "Cliente não encontrado"
        });
    }

    return res.json(cliente);
}

export function removerCliente(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um número inteiro positivo"
        });
    }

    const clienteFoiRemovido = removerClientePorId(id);

    if (!clienteFoiRemovido) {
        return res.status(404).json({
            mensagem: "Cliente não encontrado"
        });
    }

    return res.json({
        mensagem: "Cliente removido com sucesso"
    });
}
