export type Cliente = {
    id: number;
    nome: string;
    telefone: string;
    endereco: string;
};

export const clientes: Cliente[] = [
    {
        id: 1,
        nome: "Ana Souza",
        telefone: "(11) 99999-0001",
        endereco: "Rua Sakura, 123"
    },
    {
        id: 2,
        nome: "Carlos Lima",
        telefone: "(21) 99999-0002",
        endereco: "Avenida Fuji, 456"
    }
];

let proximoClienteId = clientes.length + 1;

export function gerarProximoClienteId() {
    const id = proximoClienteId;
    proximoClienteId++;

    return id;
}
