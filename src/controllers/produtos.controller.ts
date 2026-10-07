import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { camposMedidas, validarMedidasProduto, extrairMedidasProduto } from "../utils/medidas-produto.js";
import { atualizarProdutoPorId, criarProduto, obterProdutoPorId, obterProdutosFiltrados, removerProdutoPorId } from "../services/produtos.service.js";
import { obterParametrosPaginacao, paginarLista } from "../utils/paginacao.js";
import { idEhInvalido, validarAtualizacaoProduto, validarCriacaoProduto } from "../utils/validacoes.js";

const DIRETORIO_UPLOAD_PRODUTOS = join(env.UPLOADS_DIR, "produtos");
const LIMITE_IMAGEM_BYTES = 3 * 1024 * 1024;
const PREFIXO_URL_UPLOAD_PRODUTOS = "/uploads/produtos/";

const extensoesPorMime = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp"
} as const;

function imagemConfereTipo(tipoMime: keyof typeof extensoesPorMime, conteudo: Buffer) {
    if (tipoMime === "image/jpeg") {
        return conteudo.length >= 3 &&
            conteudo[0] === 0xff &&
            conteudo[1] === 0xd8 &&
            conteudo[2] === 0xff;
    }

    if (tipoMime === "image/png") {
        return conteudo.length >= 8 &&
            conteudo[0] === 0x89 &&
            conteudo[1] === 0x50 &&
            conteudo[2] === 0x4e &&
            conteudo[3] === 0x47 &&
            conteudo[4] === 0x0d &&
            conteudo[5] === 0x0a &&
            conteudo[6] === 0x1a &&
            conteudo[7] === 0x0a;
    }

    return conteudo.length >= 12 &&
        conteudo.subarray(0, 4).toString("ascii") === "RIFF" &&
        conteudo.subarray(8, 12).toString("ascii") === "WEBP";
}

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

function obterCaminhoImagemProduto(imagemUrl: string | undefined) {
    if (!imagemUrl?.startsWith(PREFIXO_URL_UPLOAD_PRODUTOS)) {
        return undefined;
    }

    const nomeArquivo = imagemUrl.slice(PREFIXO_URL_UPLOAD_PRODUTOS.length);

    if (!nomeArquivo || nomeArquivo.includes("/") || nomeArquivo.includes("\\")) {
        return undefined;
    }

    return join(DIRETORIO_UPLOAD_PRODUTOS, nomeArquivo);
}

async function removerArquivoImagemProduto(imagemUrl: string | undefined) {
    const caminhoArquivo = obterCaminhoImagemProduto(imagemUrl);

    if (!caminhoArquivo) {
        return false;
    }

    try {
        await unlink(caminhoArquivo);
        return true;
    } catch (erro) {
        const erroNode = erro as NodeJS.ErrnoException;

        if (erroNode.code === "ENOENT") {
            return false;
        }

        console.warn("Nao foi possivel remover arquivo de imagem do produto:", erro);
        return false;
    }
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

    if (!imagemConfereTipo(tipoMime, conteudo)) {
        return {
            mensagemErro: "Conteudo da imagem nao confere com JPG, PNG ou WEBP"
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
    const { nome, estoqueBaixo, publicadoNaLoja, medidasIncompletas, pagina, limite } = req.query;

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

    if (publicadoNaLoja !== undefined && publicadoNaLoja !== "true" && publicadoNaLoja !== "false") {
        return res.status(400).json({
            mensagem: "Filtro publicadoNaLoja deve ser true ou false"
        });
    }

    if (medidasIncompletas !== undefined && medidasIncompletas !== "true" && medidasIncompletas !== "false") {
        return res.status(400).json({ mensagem: "Filtro medidasIncompletas deve ser true ou false" });
    }

    const produtosFiltrados = await obterProdutosFiltrados({
        nome: typeof nome === "string" && nome.trim() !== "" ? nome.trim() : undefined,
        estoqueBaixo: estoqueBaixo === "true",
        medidasIncompletas: medidasIncompletas === "true",
        publicadoNaLoja: publicadoNaLoja === undefined ? undefined : publicadoNaLoja === "true"
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
    const { nome, preco, estoque, imagemUrl, publicadoNaLoja } = req.body;

    const erroValidacao = validarCriacaoProduto(nome, preco, estoque, imagemUrl, publicadoNaLoja) || validarMedidasProduto(req.body);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const produtoPublicado = typeof publicadoNaLoja === "boolean" ? publicadoNaLoja : true;
    const novoProduto = await criarProduto(nome.trim(), preco, estoque, textoOpcional(imagemUrl), produtoPublicado, extrairMedidasProduto(req.body));

    return res.status(201).json(novoProduto);
}

export async function atualizarProduto(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um número inteiro positivo"
        });
    }

    const { nome, preco, estoque, imagemUrl, publicadoNaLoja } = req.body;

    const erroCampos = validarAtualizacaoProduto(nome, preco, estoque, imagemUrl, publicadoNaLoja);
    const somenteMedidas = camposMedidas.some(campo => req.body[campo] !== undefined) &&
        [nome, preco, estoque, imagemUrl, publicadoNaLoja].every(valor => valor === undefined);
    const erroValidacao = (somenteMedidas ? undefined : erroCampos) || validarMedidasProduto(req.body);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    const nomeAtualizado = typeof nome === "string" ? nome.trim() : nome;

    const produto = await atualizarProdutoPorId(id, nomeAtualizado, preco, estoque, textoOpcional(imagemUrl), publicadoNaLoja, extrairMedidasProduto(req.body));

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

    const produto = await atualizarProdutoPorId(id, undefined, undefined, undefined, imagemUrl, undefined);
    await removerArquivoImagemProduto(produtoExiste.imagemUrl);

    return res.json(produto);
}

export async function removerImagemProduto(req: Request, res: Response) {
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

    const produto = await atualizarProdutoPorId(id, undefined, undefined, undefined, null, undefined);
    await removerArquivoImagemProduto(produtoExiste.imagemUrl);

    return res.json(produto);
}

export async function removerProduto(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (idEhInvalido(id)) {
        return res.status(400).json({
            mensagem: "ID deve ser um número inteiro positivo"
        });
    }

    const produtoExiste = await obterProdutoPorId(id);

    if (!produtoExiste) {
        return res.status(404).json({
            mensagem: "Produto nao encontrado"
        });
    }

    const produtoFoiRemovido = await removerProdutoPorId(id);

    if (produtoFoiRemovido === "emUso") {
        return res.status(409).json({
            mensagem: "Produto possui pedidos vinculados. Despublique da loja em vez de excluir."
        });
    }

    if (!produtoFoiRemovido) {
        return res.status(404).json({
            mensagem: "Produto não encontrado"
        });
    }

    await removerArquivoImagemProduto(produtoExiste.imagemUrl);

    return res.json({
        mensagem: "Produto removido com sucesso"
    });
}
