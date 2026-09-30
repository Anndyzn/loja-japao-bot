import type { Request, Response } from "express";
import { atualizarClientePorId, criarCliente, obterClientePorId, obterClientesFiltrados, removerClientePorId } from "../services/clientes.service.js";
import type { DadosCliente, DadosCriacaoCliente } from "../services/clientes.service.js";
import { obterParametrosPaginacao, paginarLista } from "../utils/paginacao.js";
import { idEhInvalido, validarAtualizacaoCliente, validarCriacaoCliente } from "../utils/validacoes.js";

function textoObrigatorio(valor: unknown) {
    return typeof valor === "string" ? valor.trim() : "";
}

function textoOpcional(valor: unknown) {
    if (typeof valor !== "string") {
        return undefined;
    }

    const texto = valor.trim();

    return texto === "" ? undefined : texto;
}

function adicionarTextoOpcional(dados: DadosCliente, campo: keyof DadosCliente, valor: unknown) {
    const texto = textoOpcional(valor);

    if (texto !== undefined) {
        dados[campo] = texto;
    }
}

export async function listarClientes(req: Request, res: Response) {
    const { nome, telefone, pagina, limite } = req.query;

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

    const clientesFiltrados = await obterClientesFiltrados({
        nome: typeof nome === "string" && nome.trim() !== "" ? nome.trim() : undefined,
        telefone: typeof telefone === "string" && telefone.trim() !== "" ? telefone.trim() : undefined
    });

    const paginacao = obterParametrosPaginacao(pagina, limite);

    if (paginacao.mensagemErro) {
        return res.status(400).json({
            mensagem: paginacao.mensagemErro
        });
    }

    return res.json(paginarLista(clientesFiltrados, paginacao.pagina!, paginacao.limite!));
}

export async function buscarClientePorId(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um numero inteiro positivo"
        });
    }

    const cliente = await obterClientePorId(id);

    if (!cliente) {
        return res.status(404).json({
            mensagem: "Cliente nao encontrado"
        });
    }

    return res.json(cliente);
}

export async function cadastrarCliente(req: Request, res: Response) {
    const {
        nome,
        telefone,
        email,
        cep,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        referencia
    } = req.body;

    const erroValidacao = validarCriacaoCliente(
        nome,
        telefone,
        endereco,
        cep,
        numero,
        bairro,
        cidade,
        estado,
        email,
        complemento,
        referencia
    );

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const dadosCliente: DadosCriacaoCliente = {
        nome: textoObrigatorio(nome),
        telefone: textoObrigatorio(telefone),
        cep: textoObrigatorio(cep),
        endereco: textoObrigatorio(endereco),
        numero: textoObrigatorio(numero),
        bairro: textoObrigatorio(bairro),
        cidade: textoObrigatorio(cidade),
        estado: textoObrigatorio(estado)
    };

    adicionarTextoOpcional(dadosCliente, "email", email);
    adicionarTextoOpcional(dadosCliente, "complemento", complemento);
    adicionarTextoOpcional(dadosCliente, "referencia", referencia);

    const novoCliente = await criarCliente(dadosCliente);

    return res.status(201).json(novoCliente);
}

export async function atualizarCliente(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um numero inteiro positivo"
        });
    }

    const {
        nome,
        telefone,
        email,
        cep,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        referencia
    } = req.body;

    const erroValidacao = validarAtualizacaoCliente(
        nome,
        telefone,
        endereco,
        cep,
        numero,
        bairro,
        cidade,
        estado,
        email,
        complemento,
        referencia
    );

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const dadosCliente: DadosCliente = {};

    adicionarTextoOpcional(dadosCliente, "nome", nome);
    adicionarTextoOpcional(dadosCliente, "telefone", telefone);
    adicionarTextoOpcional(dadosCliente, "email", email);
    adicionarTextoOpcional(dadosCliente, "cep", cep);
    adicionarTextoOpcional(dadosCliente, "endereco", endereco);
    adicionarTextoOpcional(dadosCliente, "numero", numero);
    adicionarTextoOpcional(dadosCliente, "complemento", complemento);
    adicionarTextoOpcional(dadosCliente, "bairro", bairro);
    adicionarTextoOpcional(dadosCliente, "cidade", cidade);
    adicionarTextoOpcional(dadosCliente, "estado", estado);
    adicionarTextoOpcional(dadosCliente, "referencia", referencia);

    const cliente = await atualizarClientePorId(id, dadosCliente);

    if (!cliente) {
        return res.status(404).json({
            mensagem: "Cliente nao encontrado"
        });
    }

    return res.json(cliente);
}

export async function removerCliente(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um numero inteiro positivo"
        });
    }

    const clienteFoiRemovido = await removerClientePorId(id);

    if (!clienteFoiRemovido) {
        return res.status(404).json({
            mensagem: "Cliente nao encontrado"
        });
    }

    return res.json({
        mensagem: "Cliente removido com sucesso"
    });
}
