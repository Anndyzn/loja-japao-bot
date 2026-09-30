import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import type { Request, Response } from "express";
import { atualizarProdutoPorId, criarProduto, obterProdutoPorId, obterProdutosFiltrados, removerProdutoPorId } from "../services/produtos.service.js";
import { obterParametrosPaginacao, paginarLista } from "../utils/paginacao.js";
import { idEhInvalido, validarAtualizacaoProduto, validarCriacaoProduto } from "../utils/validacoes.js";

const DIRETORIO_UPLOAD_PRODUTOS = "public/uploads/produtos";
const LIMITE_IMAGEM_BYTES = 3 * 1024 * 1024;

const extensoesPorMime = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp"
} as const;

type ResultadoImagemProduto =
    | {
        mensagemErro: string;
    }
    | {
        conteudo: Buffer;
        extensao: string;
    };

function textoOpcional(valor: unknown) {
    if (typeof valor !== "string") {
        return undefined;
    }

    const texto = valor.trim();

    return texto === "" ? undefined : texto;
}

function decodificarImagemProduto(valor: unknown): ResultadoImagemProduto {
    if (typeof valor !== "string") {
        return {
            mensagemErro: "Imagem deve ser enviada em base64"
        };
    }

    const resultado = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(valor);

    if (!resultado) {
        return {
            mensagemErro: "Imagem deve ser JPG, PNG ou WEBP"
        };
    }

    const tipoMime = resultado[1] as keyof typeof extensoesPorMime | undefined;
    const base64 = resultado[2];

    if (!tipoMime || !base64) {
        return {
            mensagemErro: "Imagem deve ser JPG, PNG ou WEBP"
        };
    }

    const conteudo = Buffer.from(base64, "base64");

    if (conteudo.length === 0) {
        return {
            mensagemErro: "Imagem nao pode estar vazia"
        };
    }

    if (conteudo.length > LIMITE_IMAGEM_BYTES) {
        return {
            mensagemErro: "Imagem deve ter no maximo 3MB"
        };
    }

    return {
        conteudo,
        extensao: extensoesPorMime[tipoMime]
    };
}

export async function listarProdutos(req: Request, res: Response) {
    const { nome, estoqueBaixo, pagina, limite } = req.query;

    if (nome !== undefined && typeof nome !== "string") {
        return res.status(400).json({
            mensagem: "Filtro nome deve ser texto"
        });
    }

    if (estoqueBaixo !== undefined && estoqueBaixo !== "true" && estoqueBaixo !== "false") {
        return res.status(400).json({
            mensagem: "Filtro estoqueBaixo deve ser true ou false"
        });
    }

    const produtosFiltrados = await obterProdutosFiltrados({
        nome: typeof nome === "string" && nome.trim() !== "" ? nome.trim() : undefined,
        estoqueBaixo: estoqueBaixo === "true"
    });

    const paginacao = obterParametrosPaginacao(pagina, limite);

    if (paginacao.mensagemErro) {
        return res.status(400).json({
            mensagem: paginacao.mensagemErro
        });
    }

    return res.json(paginarLista(produtosFiltrados, paginacao.pagina!, paginacao.limite!));
}

export async function buscarProdutoPorId(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um número inteiro positivo"
        });
    }

    const produto = await obterProdutoPorId(id);

    if (!produto) {
        return res.status(404).json({
            mensagem: "Produto não encontrado"
        });
    }

    return res.json(produto);
}

export async function cadastrarProduto(req: Request, res: Response) {
    const { nome, preco, estoque, imagemUrl } = req.body;

    const erroValidacao = validarCriacaoProduto(nome, preco, estoque, imagemUrl);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const novoProduto = await criarProduto(nome.trim(), preco, estoque, textoOpcional(imagemUrl));

    return res.status(201).json(novoProduto);
}

export async function atualizarProduto(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um número inteiro positivo"
        });
    }

    const { nome, preco, estoque, imagemUrl } = req.body;

    const erroValidacao = validarAtualizacaoProduto(nome, preco, estoque, imagemUrl);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const nomeAtualizado = typeof nome === "string" ? nome.trim() : nome;

    const produto = await atualizarProdutoPorId(id, nomeAtualizado, preco, estoque, textoOpcional(imagemUrl));

    if (!produto) {
        return res.status(404).json({
            mensagem: "Produto não encontrado"
        });
    }

    return res.json(produto);
}

export async function enviarImagemProduto(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um numero inteiro positivo"
        });
    }

    const produtoExiste = await obterProdutoPorId(id);

    if (!produtoExiste) {
        return res.status(404).json({
            mensagem: "Produto nao encontrado"
        });
    }

    const resultadoImagem = decodificarImagemProduto(req.body.imagem);

    if ("mensagemErro" in resultadoImagem) {
        return res.status(400).json({
            mensagem: resultadoImagem.mensagemErro
        });
    }

    await mkdir(DIRETORIO_UPLOAD_PRODUTOS, {
        recursive: true
    });

    const nomeArquivo = `produto-${id}-${randomUUID()}.${resultadoImagem.extensao}`;
    const caminhoArquivo = `${DIRETORIO_UPLOAD_PRODUTOS}/${nomeArquivo}`;
    const imagemUrl = `/uploads/produtos/${nomeArquivo}`;

    await writeFile(caminhoArquivo, resultadoImagem.conteudo);

    const produto = await atualizarProdutoPorId(id, undefined, undefined, undefined, imagemUrl);

    return res.json(produto);
}

export async function removerProduto(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um número inteiro positivo"
        });
    }

    const produtoFoiRemovido = await removerProdutoPorId(id);

    if (!produtoFoiRemovido) {
        return res.status(404).json({
            mensagem: "Produto não encontrado"
        });
    }

    return res.json({
        mensagem: "Produto removido com sucesso"
    });
}
