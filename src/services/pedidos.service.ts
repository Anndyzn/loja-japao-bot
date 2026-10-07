import type { StatusPedido } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { validarCotacaoFrete, ErroFrete } from "./fretes.service.js";
import { bloquearPedido, bloquearProduto } from "../utils/bloqueios.js";

export type { StatusPedido } from "../../generated/prisma/client.js";

export type ItemPedidoEntrada = {
    produtoId: number;
    quantidade: number;
};

type FiltrosPedidos = {
    clienteId?: number | undefined;
    status?: StatusPedido | undefined;
    busca?: string | undefined;
};

type ItemPedidoResposta = {
    produtoId: number;
    nomeProduto: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
};

type EnderecoEntregaResposta = {
    nome: string;
    telefone: string;
    email?: string;
    cep?: string;
    endereco: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    referencia?: string;
};

type ClientePedidoResposta = {
    id: number;
    nome: string;
    telefone: string;
};

type HistoricoPedidoResposta = {
    id: number;
    status: StatusPedido;
    descricao: string;
    criadoEm: string;
};

export type PedidoResposta = {
    subtotalProdutos: number;
    freteValor: number;
    freteServicoId: string | null;
    freteServico: string | null;
    freteTransportadora: string | null;
    fretePrazoDias: number | null;
    freteAmbiente: string | null;

    id: number;
    clienteId: number;
    cliente?: ClientePedidoResposta;
    itens: ItemPedidoResposta[];
    historico?: HistoricoPedidoResposta[];
    total: number;
    status: StatusPedido;
    observacao?: string;
    enderecoEntrega?: EnderecoEntregaResposta;
    transportadora: string | null;
    codigoRastreio: string | null;
    criadoEm: string;
};

type PedidoComItens = {
    subtotalProdutos: unknown;
    freteValor: unknown;
    freteServicoId: string | null;
    freteServico: string | null;
    freteTransportadora: string | null;
    fretePrazoDias: number | null;
    freteAmbiente: string | null;

    id: number;
    clienteId: number;
    total: unknown;
    status: StatusPedido;
    observacao: string | null;
    entregaNome: string | null;
    entregaTelefone: string | null;
    entregaEmail: string | null;
    entregaCep: string | null;
    entregaEndereco: string | null;
    entregaNumero: string | null;
    entregaComplemento: string | null;
    entregaBairro: string | null;
    entregaCidade: string | null;
    entregaEstado: string | null;
    entregaReferencia: string | null;
    transportadora: string | null;
    codigoRastreio: string | null;
    criadoEm: Date;
    cliente?: ClientePedidoResposta;
    itens: Array<{
        produtoId: number;
        nomeProduto: string;
        quantidade: number;
        precoUnitario: unknown;
        subtotal: unknown;
    }>;
    historico?: Array<{
        id: number;
        status: StatusPedido;
        descricao: string;
        criadoEm: Date;
    }>;
};

type ResultadoCriacaoPedido = {
    pedido?: PedidoResposta;
    mensagemErro?: string;
};

type OpcoesCriacaoPedido = {
    freteToken?: string | undefined;
    permitirProdutoInterno?: boolean;
};

type ResultadoAtualizacaoStatusPedido = {
    pedido?: PedidoResposta;
    mensagemErro?: string;
};

function obterDescricaoHistoricoStatus(status: StatusPedido) {
    if (status === "pendente") {
        return "Pedido voltou para pendente.";
    }

    if (status === "pago") {
        return "Pedido marcado como pago.";
    }

    if (status === "enviado") {
        return "Pedido marcado como enviado.";
    }

    return "Pedido cancelado. Estoque devolvido.";
}

function adicionarCampoOpcional(
    endereco: EnderecoEntregaResposta,
    campo: Exclude<keyof EnderecoEntregaResposta, "nome" | "telefone" | "endereco">,
    valor: string | null
) {
    if (valor !== null) {
        endereco[campo] = valor;
    }
}

function formatarEnderecoEntrega(pedido: PedidoComItens) {
    if (!pedido.entregaNome || !pedido.entregaTelefone || !pedido.entregaEndereco) {
        return undefined;
    }

    const endereco: EnderecoEntregaResposta = {
        nome: pedido.entregaNome,
        telefone: pedido.entregaTelefone,
        endereco: pedido.entregaEndereco
    };

    adicionarCampoOpcional(endereco, "email", pedido.entregaEmail);
    adicionarCampoOpcional(endereco, "cep", pedido.entregaCep);
    adicionarCampoOpcional(endereco, "numero", pedido.entregaNumero);
    adicionarCampoOpcional(endereco, "complemento", pedido.entregaComplemento);
    adicionarCampoOpcional(endereco, "bairro", pedido.entregaBairro);
    adicionarCampoOpcional(endereco, "cidade", pedido.entregaCidade);
    adicionarCampoOpcional(endereco, "estado", pedido.entregaEstado);
    adicionarCampoOpcional(endereco, "referencia", pedido.entregaReferencia);

    return endereco;
}

function filtrarHistoricoDuplicado<T extends { descricao: string }>(historico: T[]) {
    const descricoes = new Set<string>();

    return historico.filter((item) => {
        if (descricoes.has(item.descricao)) {
            return false;
        }

        descricoes.add(item.descricao);
        return true;
    });
}

function clienteTemEnderecoCompleto(cliente: {
    cep: string | null;
    endereco: string | null;
    numero: string | null;
    bairro: string | null;
    cidade: string | null;
    estado: string | null;
}) {
    return Boolean(
        cliente.cep &&
        cliente.endereco &&
        cliente.numero &&
        cliente.bairro &&
        cliente.cidade &&
        cliente.estado
    );
}

function formatarPedido(pedido: PedidoComItens): PedidoResposta {
    const resposta: PedidoResposta = {
        id: pedido.id,
        clienteId: pedido.clienteId,
        itens: pedido.itens.map((item) => {
            return {
                produtoId: item.produtoId,
                nomeProduto: item.nomeProduto,
                quantidade: item.quantidade,
                precoUnitario: Number(item.precoUnitario),
                subtotal: Number(item.subtotal)
            };
        }),
        total: Number(pedido.total),
        subtotalProdutos: Number(pedido.subtotalProdutos),
        freteValor: Number(pedido.freteValor),
        freteServicoId: pedido.freteServicoId,
        freteServico: pedido.freteServico,
        freteTransportadora: pedido.freteTransportadora,
        fretePrazoDias: pedido.fretePrazoDias,
        freteAmbiente: pedido.freteAmbiente,
        status: pedido.status,
        transportadora: pedido.transportadora,
        codigoRastreio: pedido.codigoRastreio,
        criadoEm: pedido.criadoEm.toISOString()
    };

    if (pedido.observacao !== null) {
        resposta.observacao = pedido.observacao;
    }

    if (pedido.cliente !== undefined) {
        resposta.cliente = pedido.cliente;
    }

    const enderecoEntrega = formatarEnderecoEntrega(pedido);

    if (enderecoEntrega !== undefined) {
        resposta.enderecoEntrega = enderecoEntrega;
    }

    if (pedido.historico !== undefined) {
        resposta.historico = filtrarHistoricoDuplicado(pedido.historico).map((item) => {
            return {
                id: item.id,
                status: item.status,
                descricao: item.descricao,
                criadoEm: item.criadoEm.toISOString()
            };
        });
    }

    return resposta;
}

function normalizarTexto(valor: string | null | undefined) {
    return String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function normalizarDigitos(valor: string | null | undefined) {
    return String(valor ?? "").replace(/\D/g, "");
}

function textoContem(campo: string | null | undefined, busca: string) {
    return normalizarTexto(campo).includes(busca);
}

function digitosContem(campo: string | null | undefined, busca: string) {
    return normalizarDigitos(campo).includes(busca);
}

function pedidoConfereBusca(pedido: PedidoResposta, busca: string | undefined) {
    const buscaTratada = busca?.trim();

    if (!buscaTratada) {
        return true;
    }

    if (buscaTratada.startsWith("#")) {
        const buscaId = normalizarDigitos(buscaTratada);

        return buscaId ? String(pedido.id).startsWith(buscaId) : true;
    }

    const buscaTexto = normalizarTexto(buscaTratada);
    const buscaDigitos = normalizarDigitos(buscaTratada);
    const camposTexto = [
        String(pedido.id),
        pedido.status,
        pedido.cliente?.nome,
        pedido.enderecoEntrega?.nome,
        pedido.observacao,
        ...pedido.itens.map((item) => item.nomeProduto)
    ];

    if (camposTexto.some((campo) => textoContem(campo, buscaTexto))) {
        return true;
    }

    if (!buscaDigitos) {
        return false;
    }

    return [
        String(pedido.id),
        pedido.cliente?.telefone,
        pedido.enderecoEntrega?.telefone
    ].some((campo) => digitosContem(campo, buscaDigitos));
}

function agruparItensPorProduto(itensEntrada: ItemPedidoEntrada[]) {
    const quantidadesPorProduto = new Map<number, number>();

    for (const item of itensEntrada) {
        const quantidadeAtual = quantidadesPorProduto.get(item.produtoId) ?? 0;
        quantidadesPorProduto.set(item.produtoId, quantidadeAtual + item.quantidade);
    }

    return Array.from(quantidadesPorProduto.entries()).map(([produtoId, quantidade]) => {
        return {
            produtoId,
            quantidade
        };
    });
}

const includeItensPedido = {
    itens: {
        orderBy: {
            id: "asc"
        }
    },
    cliente: {
        select: {
            id: true,
            nome: true,
            telefone: true
        }
    }
} as const;

const includePedidoCompleto = {
    ...includeItensPedido,
    historico: {
        orderBy: {
            criadoEm: "asc"
        }
    }
} as const;

type DadosCriacaoPedido = {
    subtotalProdutos: number;
    freteValor: number;
    freteServicoId: string | null;
    freteServico: string | null;
    freteTransportadora: string | null;
    fretePrazoDias: number | null;
    freteAmbiente: string | null;

    clienteId: number;
    total: number;
    observacao?: string;
    entregaNome: string;
    entregaTelefone: string;
    entregaEmail: string | null;
    entregaCep: string | null;
    entregaEndereco: string;
    entregaNumero: string | null;
    entregaComplemento: string | null;
    entregaBairro: string | null;
    entregaCidade: string | null;
    entregaEstado: string | null;
    entregaReferencia: string | null;
    itens: {
        create: Array<{
            produtoId: number;
            nomeProduto: string;
            quantidade: number;
            precoUnitario: number;
            subtotal: number;
        }>;
    };
};

export async function obterTodosPedidos() {
    const pedidos = await prisma.pedido.findMany({
        include: includeItensPedido,
        orderBy: {
            id: "asc"
        }
    });

    return pedidos.map(formatarPedido);
}

export async function obterPedidosFiltrados(filtros: FiltrosPedidos) {
    const opcoesConsulta = {
        include: includeItensPedido,
        orderBy: {
            id: "asc"
        }
    } as const;

    const pedidos = await prisma.pedido.findMany({
        ...opcoesConsulta,
        where: {
            ...(filtros.status ? { status: filtros.status } : {}),
            ...(filtros.clienteId !== undefined ? { clienteId: filtros.clienteId } : {})
        }
    });

    return pedidos.map(formatarPedido)
        .filter((pedido) => pedidoConfereBusca(pedido, filtros.busca));
}


export async function obterPedidoPorId(id: number) {
    const pedido = await prisma.pedido.findUnique({
        where: {
            id
        },
        include: includePedidoCompleto
    });

    if (!pedido) {
        return undefined;
    }

    return formatarPedido(pedido);
}

export async function obterPedidosPorClienteId(clienteId: number) {
    const pedidos = await prisma.pedido.findMany({
        where: {
            clienteId
        },
        include: includeItensPedido,
        orderBy: {
            id: "asc"
        }
    });

    return pedidos.map(formatarPedido);
}

export async function criarPedido(
    clienteId: number,
    itensEntrada: ItemPedidoEntrada[],
    observacao: string | undefined,
    opcoes: OpcoesCriacaoPedido = {}
): Promise<ResultadoCriacaoPedido> {
    const cliente = await prisma.cliente.findUnique({
        where: {
            id: clienteId
        }
    });

    if (!cliente) {
        return {
            mensagemErro: "Cliente nao encontrado"
        };
    }

    if (!clienteTemEnderecoCompleto(cliente)) {
        return {
            mensagemErro: "Complete o endereco do cliente antes de criar o pedido"
        };
    }

    // Sempre bloqueia produtos na mesma ordem para evitar esperas circulares.
    const itensAgrupados = agruparItensPorProduto(itensEntrada).sort((a, b) => a.produtoId - b.produtoId);

    return await prisma.$transaction(async (tx) => {
        const produtosDoPedido = [];

        for (const item of itensAgrupados) {
            await bloquearProduto(tx, item.produtoId);
            const produto = await tx.produto.findUnique({
                where: {
                    id: item.produtoId
                }
            });

            if (!produto) {
                return {
                    mensagemErro: `Produto ${item.produtoId} nao encontrado`
                };
            }

            if (!produto.publicadoNaLoja && opcoes.permitirProdutoInterno !== true) {
                return {
                    mensagemErro: `Produto ${produto.nome} nao esta disponivel na loja`
                };
            }

            if (produto.estoque < item.quantidade) {
                return {
                    mensagemErro: `Estoque insuficiente para o produto ${produto.nome}`
                };
            }

            produtosDoPedido.push({
                produto,
                quantidade: item.quantidade
            });
        }

        const itens = produtosDoPedido.map(({ produto, quantidade }) => {
            const precoUnitario = Number(produto.preco);
            const subtotal = Number((precoUnitario * quantidade).toFixed(2));

            return {
                produtoId: produto.id,
                nomeProduto: produto.nome,
                quantidade,
                precoUnitario,
                subtotal
            };
        });

        const subtotalProdutos = Number(
            itens.reduce((soma, item) => soma + item.subtotal, 0).toFixed(2)
        );
        let frete;
        try {
            frete = validarCotacaoFrete(opcoes.freteToken, produtosDoPedido, cliente.cep!);
        } catch (erro) {
            if (erro instanceof ErroFrete) return { mensagemErro: erro.message };
            throw erro;
        }
        const total = Number((subtotalProdutos + frete.valor).toFixed(2));

        for (const item of itens) {
            await tx.produto.update({
                where: {
                    id: item.produtoId
                },
                data: {
                    estoque: {
                        decrement: item.quantidade
                    }
                }
            });
        }

        const dadosPedido: DadosCriacaoPedido = {
            subtotalProdutos,
            freteValor: frete.valor,
            freteServicoId: frete.servicoId,
            freteServico: frete.servico,
            freteTransportadora: frete.transportadora,
            fretePrazoDias: frete.prazoDias,
            freteAmbiente: frete.ambiente,
            clienteId,
            total,
            entregaNome: cliente.nome,
            entregaTelefone: cliente.telefone,
            entregaEmail: cliente.email,
            entregaCep: cliente.cep,
            entregaEndereco: cliente.endereco,
            entregaNumero: cliente.numero,
            entregaComplemento: cliente.complemento,
            entregaBairro: cliente.bairro,
            entregaCidade: cliente.cidade,
            entregaEstado: cliente.estado,
            entregaReferencia: cliente.referencia,
            itens: {
                create: itens.map((item) => {
                    return {
                        produtoId: item.produtoId,
                        nomeProduto: item.nomeProduto,
                        quantidade: item.quantidade,
                        precoUnitario: item.precoUnitario,
                        subtotal: item.subtotal
                    };
                })
            }
        };

        if (observacao !== undefined) {
            dadosPedido.observacao = observacao;
        }

        const novoPedido = await tx.pedido.create({
            data: dadosPedido,
            include: includeItensPedido
        });

        await tx.historicoPedido.create({
            data: {
                pedidoId: novoPedido.id,
                status: "pendente",
                descricao: "Pedido criado."
            }
        });

        return {
            pedido: formatarPedido(novoPedido)
        };
    });
}

export async function atualizarStatusPedidoPorId(
    id: number,
    status: StatusPedido
): Promise<ResultadoAtualizacaoStatusPedido> {
    return await prisma.$transaction(async (tx) => {
        await bloquearPedido(tx, id);
        const pedido = await tx.pedido.findUnique({
            where: {
                id
            },
            include: includeItensPedido
        });

        if (!pedido) {
            return {
                mensagemErro: "Pedido nao encontrado"
            };
        }

        if (status === "pago") {
            return { mensagemErro: "Use a confirmacao de recebimento do Pix para registrar o pagamento" };
        }

        // Repetir cancelamento ou envio nao repete estoque nem historico.
        if (pedido.status === status) return { pedido: formatarPedido(pedido) };

        if (pedido.status === "cancelado") {
            return { mensagemErro: "Pedido cancelado nao pode mudar de status" };
        }
        if (pedido.status === "enviado") {
            return { mensagemErro: "Pedido enviado nao pode voltar de etapa nem ser cancelado por este fluxo" };
        }
        if (status === "pendente") {
            return { mensagemErro: "Pedido nao pode voltar para pendente" };
        }

        if (status === "enviado") {
            if (pedido.status !== "pago") {
                return {
                    mensagemErro: "Pedido precisa estar pago antes de ser enviado"
                };
            }

            const pagamento = await tx.pagamento.findFirst({ where: { pedidoId: id, status: "aprovado" } });
            if (!pagamento) {
                return { mensagemErro: "Pedido precisa ter pagamento registrado antes de ser enviado" };
            }

            if (!pedido.transportadora || !pedido.codigoRastreio) {
                return {
                    mensagemErro: "Informe o rastreio antes de marcar o pedido como enviado"
                };
            }
        }

        if (status === "cancelado") {
            const itensOrdenados = [...pedido.itens].sort((a, b) => a.produtoId - b.produtoId);
            for (const item of itensOrdenados) {
                await tx.produto.update({
                    where: {
                        id: item.produtoId
                    },
                    data: {
                        estoque: {
                            increment: item.quantidade
                        }
                    }
                });
            }
        }

        const pedidoAtualizado = await tx.pedido.update({
            where: {
                id
            },
            data: {
                status
            },
            include: includeItensPedido
        });

        await tx.historicoPedido.create({
            data: {
                pedidoId: id,
                status,
                descricao: obterDescricaoHistoricoStatus(status)
            }
        });

        return {
            pedido: formatarPedido(pedidoAtualizado)
        };
    });
}

export async function atualizarRastreioPedidoPorId(
    id: number,
    transportadora: string,
    codigoRastreio: string
): Promise<ResultadoAtualizacaoStatusPedido> {
    return await prisma.$transaction(async (tx) => {
        await bloquearPedido(tx, id);
        const pedido = await tx.pedido.findUnique({
            where: { id },
            include: includeItensPedido
        });
        if (!pedido) return { mensagemErro: "Pedido nao encontrado" };
        if (pedido.status !== "pago" && pedido.status !== "enviado") {
            return { mensagemErro: "Rastreio so pode ser informado para pedidos pagos ou enviados" };
        }
        if (pedido.transportadora === transportadora && pedido.codigoRastreio === codigoRastreio) {
            return { pedido: formatarPedido(pedido) };
        }
        const pedidoAtualizado = await tx.pedido.update({
            where: { id },
            data: { transportadora, codigoRastreio },
            include: includeItensPedido
        });
        await tx.historicoPedido.create({
            data: {
                pedidoId: id,
                status: pedidoAtualizado.status,
                descricao: "Rastreio informado: " + transportadora + " - " + codigoRastreio + "."
            }
        });
        return { pedido: formatarPedido(pedidoAtualizado) };
    });
}
