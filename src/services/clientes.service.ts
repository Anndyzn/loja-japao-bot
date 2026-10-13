import type { Cliente } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

type FiltrosClientes = {
    nome?: string | undefined;
    telefone?: string | undefined;
};

export type DadosCliente = {
    cpf?: string;
    nome?: string;
    telefone?: string;
    email?: string;
    cep?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    referencia?: string;
};

export type DadosCriacaoCliente = DadosCliente & {
    nome: string;
    telefone: string;
    endereco: string;
    cep: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
};

type ClienteResposta = {
    cpf?: string;
    id: number;
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

type ResultadoCriacaoCliente = {
    cliente: ClienteResposta;
    criado: boolean;
};

function adicionarCampoOpcional<T extends Record<string, unknown>>(
    objeto: T,
    campo: keyof T,
    valor: string | null | undefined
) {
    if (valor !== null && valor !== undefined) {
        objeto[campo] = valor as T[keyof T];
    }
}

function formatarCliente(cliente: Cliente): ClienteResposta {
    const resposta: ClienteResposta = {
        id: cliente.id,
        nome: cliente.nome,
        telefone: cliente.telefone,
        endereco: cliente.endereco
    };

    adicionarCampoOpcional(resposta, "cpf", cliente.cpf);
    adicionarCampoOpcional(resposta, "email", cliente.email);
    adicionarCampoOpcional(resposta, "cep", cliente.cep);
    adicionarCampoOpcional(resposta, "numero", cliente.numero);
    adicionarCampoOpcional(resposta, "complemento", cliente.complemento);
    adicionarCampoOpcional(resposta, "bairro", cliente.bairro);
    adicionarCampoOpcional(resposta, "cidade", cliente.cidade);
    adicionarCampoOpcional(resposta, "estado", cliente.estado);
    adicionarCampoOpcional(resposta, "referencia", cliente.referencia);

    return resposta;
}

function montarDadosCliente(dados: DadosCliente) {
    const dadosCliente: DadosCliente = {};

    for (const [campo, valor] of Object.entries(dados)) {
        if (valor !== undefined) {
            dadosCliente[campo as keyof DadosCliente] = valor;
        }
    }

    return dadosCliente;
}

function obterDigitos(texto: string) {
    return texto.replace(/\D/g, "");
}

export async function obterClientesFiltrados(filtros: FiltrosClientes) {
    const clientes = await prisma.cliente.findMany({
        orderBy: {
            id: "asc"
        }
    });

    let clientesFiltrados = clientes.map(formatarCliente);

    if (filtros.nome !== undefined) {
        clientesFiltrados = clientesFiltrados.filter((cliente) => {
            return cliente.nome.toLowerCase().includes(filtros.nome!.toLowerCase());
        });
    }

    if (filtros.telefone !== undefined) {
        const telefoneBuscado = obterDigitos(filtros.telefone);

        clientesFiltrados = clientesFiltrados.filter((cliente) => {
            return obterDigitos(cliente.telefone).includes(telefoneBuscado);
        });
    }

    return clientesFiltrados;
}

export async function obterClientePorId(id: number) {
    const cliente = await prisma.cliente.findUnique({
        where: {
            id
        }
    });

    if (!cliente) {
        return undefined;
    }

    return formatarCliente(cliente);
}

function tratarConflitoCpf(erro: unknown): never {
    if (typeof erro === "object" && erro !== null && "code" in erro && erro.code === "P2002") {
        throw Object.assign(new Error("CPF ja cadastrado em outro cliente. Confira o cadastro correto antes de continuar."), { status: 409 });
    }
    throw erro;
}

export async function criarCliente(dados: DadosCriacaoCliente): Promise<ResultadoCriacaoCliente> {
    try {
        return await prisma.$transaction(async tx => {
            if (dados.cpf) {
                await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${"cadastro-cpf:" + dados.cpf}))::text`;
                const existente = await tx.cliente.findUnique({ where: { cpf: dados.cpf } });
                if (existente) {
                    const atualizado = await tx.cliente.update({ where: { id: existente.id }, data: montarDadosCliente(dados) });
                    return { cliente: formatarCliente(atualizado), criado: false };
                }
            }
            // Sem CPF, o admin deve escolher explicitamente um cadastro existente.
            // Compartilhar telefone nunca autoriza sobrescrever outro cliente.
            const novo = await tx.cliente.create({ data: dados });
            return { cliente: formatarCliente(novo), criado: true };
        });
    } catch (erro) { return tratarConflitoCpf(erro); }
}

export async function atualizarClientePorId(id: number, dados: DadosCliente) {
    const clienteExiste = await prisma.cliente.findUnique({ where: { id } });
    if (!clienteExiste) return undefined;
    try {
        const atualizado = await prisma.cliente.update({ where: { id }, data: montarDadosCliente(dados) });
        return formatarCliente(atualizado);
    } catch (erro) { return tratarConflitoCpf(erro); }
}

export async function removerClientePorId(id: number) {
    const clienteExiste = await prisma.cliente.findUnique({
        where: {
            id
        }
    });

    if (!clienteExiste) {
        return false;
    }

    try {
        await prisma.cliente.delete({
            where: {
                id
            }
        });
    } catch (erro) {
        if (typeof erro === "object" && erro !== null && "code" in erro && erro.code === "P2003") {
            return "emUso";
        }

        throw erro;
    }

    return true;
}
