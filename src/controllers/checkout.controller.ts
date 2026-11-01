import { resumoMercadoPago } from "../services/mercado-pago.service.js";
import { normalizarCpf, validarCpf } from "../utils/cpf.js";
import type { Request, Response } from "express";
import type { DadosCriacaoCliente } from "../services/clientes.service.js";
import { criarPedidoDaConta, obterPedidoDaTentativa } from "../services/pedidos.service.js";
import { obterPixManual } from "../services/pix.service.js";
import { validarCriacaoCliente, validarItensPedido } from "../utils/validacoes.js";

const chaveValida = (chave: unknown): chave is string => typeof chave === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(chave);

export async function recuperarCheckout(req: Request, res: Response) {
    const chave = req.params.chave;
    if (!chaveValida(chave)) return res.status(400).json({ mensagem: "Identificador da compra inválido" });
    const pedido = await obterPedidoDaTentativa(res.locals.clienteId as number, chave);
    if (!pedido) return res.status(404).json({ mensagem: "Esta tentativa ainda não tem pedido registrado" });
    return res.json({ ...pedido, mercadoPago: await resumoMercadoPago(pedido.id), pix: obterPixManual(pedido.status), reutilizado: true });
}

export async function finalizarCheckout(req: Request, res: Response) {
    const corpo = req.body;
    if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) {
        return res.status(400).json({ mensagem: "Informe os dados da compra" });
    }
    const chave = req.get("Idempotency-Key");
    if (!chaveValida(chave)) return res.status(400).json({ mensagem: "Atualize a página da loja antes de finalizar a compra" });
    const { cliente, itens, observacao, freteToken, enderecoEntrega = "principal" } = corpo;
    if (!cliente || typeof cliente !== "object" || Array.isArray(cliente)) {
        return res.status(400).json({ mensagem: "Informe os dados de entrega" });
    }
    // A conta autenticada define o cliente; o formulario nao pode escolher outro cadastro.
    const permitidos = ["cliente", "itens", "observacao", "freteToken", "enderecoEntrega"];
    const camposCliente = ["cpf", "nome", "telefone", "email", "cep", "endereco", "numero", "complemento", "bairro", "cidade", "estado", "referencia"];
    if (Object.keys(corpo).some(campo => !permitidos.includes(campo)) ||
        Object.keys(cliente).some(campo => !camposCliente.includes(campo))) {
        return res.status(400).json({ mensagem: "O checkout aceita apenas dados de entrega, itens, observacao e cotacao de frete" });
    }
    if (enderecoEntrega !== "principal" && enderecoEntrega !== "outro") return res.status(400).json({ mensagem: "Escolha o endereço principal ou outro endereço de entrega." });
    const erroCpf = validarCpf(cliente.cpf, true);
    if (erroCpf) return res.status(400).json({ mensagem: erroCpf });
    const erro = validarCriacaoCliente(cliente.nome, cliente.telefone, cliente.endereco,
        cliente.cep, cliente.numero, cliente.bairro, cliente.cidade, cliente.estado,
        cliente.email, cliente.complemento, cliente.referencia) || validarItensPedido(itens, observacao);
    if (erro) return res.status(400).json({ mensagem: erro });
    if (typeof freteToken !== "string" || !freteToken || freteToken.length > 8000) {
        return res.status(400).json({ mensagem: "Calcule e selecione um frete valido antes de finalizar" });
    }
    const dados: DadosCriacaoCliente = {
        cpf: normalizarCpf(cliente.cpf as string),
        nome: cliente.nome.trim(), telefone: cliente.telefone.trim(),
        cep: cliente.cep.trim(), endereco: cliente.endereco.trim(),
        numero: cliente.numero.trim(), bairro: cliente.bairro.trim(),
        cidade: cliente.cidade.trim(), estado: cliente.estado.trim().toUpperCase()
    };
    for (const campo of ["email", "complemento", "referencia"] as const) {
        if (typeof cliente[campo] === "string" && cliente[campo].trim()) dados[campo] = cliente[campo].trim();
    }
    const resultado = await criarPedidoDaConta(res.locals.clienteId as number, dados, itens,
        typeof observacao === "string" ? observacao.trim() : undefined, freteToken, chave, enderecoEntrega);
    if (resultado.mensagemErro) return res.status(resultado.statusHttp ?? 400).json({ mensagem: resultado.mensagemErro });
    return res.status(resultado.reutilizado ? 200 : 201).json({ ...resultado.pedido, mercadoPago: resultado.pedido ? await resumoMercadoPago(resultado.pedido.id) : null, reutilizado: resultado.reutilizado, pix: obterPixManual(resultado.pedido?.status) });
}
