import { randomBytes, scryptSync } from "node:crypto";
import pg from "pg";

if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile(".env");
}

const connectionString = process.env.DATABASE_URL;
const nodeEnv = process.env.NODE_ENV ?? "development";

if (!connectionString) {
    throw new Error("DATABASE_URL nao configurada");
}

const { Client } = pg;
const SENHAS_ADMIN_PROIBIDAS = new Set([
    "admin123",
    "123456",
    "12345678",
    "password",
    "senha123"
]);

function obterAdminInicial() {
    const email = process.env.ADMIN_EMAIL ?? "admin@lojajapao.com";
    const senha = process.env.ADMIN_PASSWORD ?? "admin123";

    if (nodeEnv === "production") {
        if (!process.env.ADMIN_EMAIL?.trim()) {
            throw new Error("ADMIN_EMAIL deve ser configurado para executar seed em producao");
        }

        if (!process.env.ADMIN_PASSWORD?.trim()) {
            throw new Error("ADMIN_PASSWORD deve ser configurado para executar seed em producao");
        }

        if (senha.length < 10) {
            throw new Error("ADMIN_PASSWORD deve ter pelo menos 10 caracteres em producao");
        }

        if (SENHAS_ADMIN_PROIBIDAS.has(senha.toLowerCase())) {
            throw new Error("ADMIN_PASSWORD nao pode usar senha padrao ou fraca em producao");
        }
    }

    return {
        nome: "Administrador",
        email,
        senha
    };
}

function gerarHashSenha(senha) {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(senha, salt, 64).toString("hex");

    return `${salt}:${hash}`;
}

const produtosIniciais = [
    {
        id: 1,
        nome: "KitKat Matcha",
        preco: 29.90,
        estoque: 10,
        imagemUrl: null
    },
    {
        id: 2,
        nome: "Pocky Morango",
        preco: 24.90,
        estoque: 15,
        imagemUrl: null
    },
    {
        id: 3,
        nome: "Pelucia Pokemon",
        preco: 149.90,
        estoque: 3,
        imagemUrl: null
    },
    {
        id: 4,
        nome: "Chaveiro One Piece",
        preco: 39.90,
        estoque: 8,
        imagemUrl: null
    }
];

const clientesIniciais = [
    {
        id: 1,
        nome: "Ana Souza",
        telefone: "(11) 99999-0001",
        email: "ana@exemplo.com",
        cep: "01513-000",
        endereco: "Rua Sakura",
        numero: "123",
        complemento: "Apto 45",
        bairro: "Liberdade",
        cidade: "Sao Paulo",
        estado: "SP",
        referencia: "Proximo ao metro Liberdade"
    },
    {
        id: 2,
        nome: "Carlos Lima",
        telefone: "(21) 99999-0002",
        email: "carlos@exemplo.com",
        cep: "20040-020",
        endereco: "Avenida Fuji",
        numero: "456",
        complemento: "Sala 12",
        bairro: "Centro",
        cidade: "Rio de Janeiro",
        estado: "RJ",
        referencia: "Entrada pela galeria"
    }
];

const adminInicial = obterAdminInicial();

const client = new Client({
    connectionString
});

await client.connect();

try {
    for (const produto of produtosIniciais) {
        await client.query(
            `
                INSERT INTO "Produto" ("id", "nome", "preco", "estoque", "imagemUrl", "criadoEm", "atualizadoEm")
                VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                ON CONFLICT ("id") DO NOTHING
            `,
            [produto.id, produto.nome, produto.preco, produto.estoque, produto.imagemUrl]
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
                INSERT INTO "Cliente" (
                    "id",
                    "nome",
                    "telefone",
                    "email",
                    "cep",
                    "endereco",
                    "numero",
                    "complemento",
                    "bairro",
                    "cidade",
                    "estado",
                    "referencia",
                    "criadoEm",
                    "atualizadoEm"
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
                ON CONFLICT ("id") DO NOTHING
            `,
            [
                cliente.id,
                cliente.nome,
                cliente.telefone,
                cliente.email,
                cliente.cep,
                cliente.endereco,
                cliente.numero,
                cliente.complemento,
                cliente.bairro,
                cliente.cidade,
                cliente.estado,
                cliente.referencia
            ]
        );
    }

    await client.query(`
        SELECT setval(
            pg_get_serial_sequence('"Cliente"', 'id'),
            (SELECT COALESCE(MAX("id"), 1) FROM "Cliente")
        )
    `);

    await client.query(
        `
            INSERT INTO "Admin" ("nome", "email", "senhaHash", "criadoEm", "atualizadoEm")
            VALUES ($1, $2, $3, NOW(), NOW())
            ON CONFLICT ("email") DO NOTHING
        `,
        [adminInicial.nome, adminInicial.email.toLowerCase(), gerarHashSenha(adminInicial.senha)]
    );

    await client.query(`
        SELECT setval(
            pg_get_serial_sequence('"Admin"', 'id'),
            (SELECT COALESCE(MAX("id"), 1) FROM "Admin")
        )
    `);

    console.log("Dados iniciais cadastrados no banco.");
} finally {
    await client.end();
}
