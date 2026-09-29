import { clientes, gerarProximoClienteId } from "../data/clientes.js";

type FiltrosClientes = {
    nome?: string | undefined;
    telefone?: string | undefined;
};

export function obterTodosClientes() {
    return clientes;
}

export function obterClientesFiltrados(filtros: FiltrosClientes) {
    let clientesFiltrados = clientes;

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

export function obterClientePorId(id: number) {
    return clientes.find((cliente) => cliente.id === id);
}

export function criarCliente(nome: string, telefone: string, endereco: string) {
    const novoCliente = {
        id: gerarProximoClienteId(),
        nome,
        telefone,
        endereco
    };

    clientes.push(novoCliente);

    return novoCliente;
}

export function atualizarClientePorId(
    id: number,
    nome: string | undefined,
    telefone: string | undefined,
    endereco: string | undefined
) {
    const cliente = obterClientePorId(id);

    if (!cliente) {
        return undefined;
    }

    if (nome !== undefined) {
        cliente.nome = nome;
    }

    if (telefone !== undefined) {
        cliente.telefone = telefone;
    }

    if (endereco !== undefined) {
        cliente.endereco = endereco;
    }

    return cliente;
}

export function removerClientePorId(id: number) {
    const indiceCliente = clientes.findIndex((cliente) => cliente.id === id);

    if (indiceCliente === -1) {
        return false;
    }

    clientes.splice(indiceCliente, 1);

    return true;
}
