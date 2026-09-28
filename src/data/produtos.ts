export type Produto = {
    id: number;
    nome: string;
    preco: number;
    estoque: number;
};

export const produtos: Produto[] = [
    {
        id: 1,
        nome: "KitKat Matcha",
        preco: 29.90,
        estoque: 10
    },
    {
        id: 2,
        nome: "Pocky Morango",
        preco: 24.90,
        estoque: 15
    },
    {
        id: 3,
        nome: "Pelúcia Pokémon",
        preco: 149.90,
        estoque: 3
    },
    {
        id: 4,
        nome: "Chaveiro One Piece",
        preco: 39.90,
        estoque: 8
    }
];
