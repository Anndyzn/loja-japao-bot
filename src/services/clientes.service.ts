import type { Cliente } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

type FiltrosClientes = {
    nome?: string | undefined;
    telefone?: string | undefined;
};

export type DadosCliente = {
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

async function obterClienteExistentePorTelefone(telefone: string) {
    const telefoneBuscado = obterDigitos(telefone);

    if (!telefoneBuscado) {
        return undefined;
    }

    const clientes = await prisma.cliente.findMany({
        select: {
            id: true,
            telefone: true
        },
        orderBy: {
            id: "asc"
        }
    });

    return clientes.find((cliente) => {
        return obterDigitos(cliente.telefone) === telefoneBuscado;
    });
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

export async function criarCliente(dados: DadosCriacaoCliente): Promise<ResultadoCriacaoCliente> {
    const clienteExistente = await obterClienteExistentePorTelefone(dados.telefone);

    if (clienteExistente) {
        const clienteAtualizado = await prisma.cliente.update({
            where: {
                id: clienteExistente.id
            },
            data: montarDadosCliente(dados)
        });

        return {
            cliente: formatarCliente(clienteAtualizado),
            criado: false
        };
    }

    const novoCliente = await prisma.cliente.create({
        data: dados
    });

    return {
        cliente: formatarCliente(novoCliente),
        criado: true
    };
}

export async function atualizarClientePorId(id: number, dados: DadosCliente) {
    const clienteExiste = await prisma.cliente.findUnique({
        where: {
            id
        }
    });

    if (!clienteExiste) {
        return undefined;
    }

    const clienteAtualizado = await prisma.cliente.update({
        where: {
            id
        },
        data: montarDadosCliente(dados)
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
