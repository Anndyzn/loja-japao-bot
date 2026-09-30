import type { Cliente } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

type FiltrosClientes = {
    nome?: string | undefined;
    telefone?: string | undefined;
};

type ClienteResposta = {
    id: number;
    nome: string;
    telefone: string;
    endereco: string;
};

function formatarCliente(cliente: Cliente): ClienteResposta {
    return {
        id: cliente.id,
        nome: cliente.nome,
        telefone: cliente.telefone,
        endereco: cliente.endereco
    };
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
        clientesFiltrados = clientesFiltrados.filter((cliente) => {
            return cliente.telefone.includes(filtros.telefone!);
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

export async function criarCliente(nome: string, telefone: string, endereco: string) {
    const novoCliente = await prisma.cliente.create({
        data: {
            nome,
            telefone,
            endereco
        }
    });

    return formatarCliente(novoCliente);
}

export async function atualizarClientePorId(
    id: number,
    nome: string | undefined,
    telefone: string | undefined,
    endereco: string | undefined
) {
    const clienteExiste = await prisma.cliente.findUnique({
        where: {
            id
        }
    });

    if (!clienteExiste) {
        return undefined;
    }

    const dadosAtualizacao: {
        nome?: string;
        telefone?: string;
        endereco?: string;
    } = {};

    if (nome !== undefined) {
        dadosAtualizacao.nome = nome;
    }

    if (telefone !== undefined) {
        dadosAtualizacao.telefone = telefone;
    }

    if (endereco !== undefined) {
        dadosAtualizacao.endereco = endereco;
    }

    const clienteAtualizado = await prisma.cliente.update({
        where: {
            id
        },
        data: dadosAtualizacao
    });

    return formatarCliente(clienteAtualizado);
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

    await prisma.cliente.delete({
        where: {
            id
        }
    });

    return true;
}
