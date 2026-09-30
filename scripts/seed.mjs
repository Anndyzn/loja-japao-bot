import pg from "pg";

if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile(".env");
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL nao configurada");
}

const { Client } = pg;

const produtosIniciais = [
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
        nome: "Pelucia Pokemon",
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

const clientesIniciais = [
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

const client = new Client({
    connectionString
});

await client.connect();

try {
    for (const produto of produtosIniciais) {
        await client.query(
            `
                INSERT INTO "Produto" ("id", "nome", "preco", "estoque", "criadoEm", "atualizadoEm")
                VALUES ($1, $2, $3, $4, NOW(), NOW())
                ON CONFLICT ("id") DO NOTHING
            `,
            [produto.id, produto.nome, produto.preco, produto.estoque]
        );
    }

    await client.query(`
        SELECT setval(
            pg_get_serial_sequence('"Produto"', 'id'),
            (SELECT COALESCE(MAX("id"), 1) FROM "Produto")
        )
    `);

    for (const cliente of clientesIniciais) {
        await client.query(
            `
                INSERT INTO "Cliente" ("id", "nome", "telefone", "endereco", "criadoEm", "atualizadoEm")
                VALUES ($1, $2, $3, $4, NOW(), NOW())
                ON CONFLICT ("id") DO NOTHING
            `,
            [cliente.id, cliente.nome, cliente.telefone, cliente.endereco]
        );
    }

    await client.query(`
        SELECT setval(
            pg_get_serial_sequence('"Cliente"', 'id'),
            (SELECT COALESCE(MAX("id"), 1) FROM "Cliente")
        )
    `);

    console.log("Dados iniciais cadastrados no banco.");
} finally {
    await client.end();
}
