if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(".env");
  } catch (erro) {
    // Na hospedagem, as variaveis podem vir do ambiente, sem arquivo .env.
    if (!(erro instanceof Error) || !("code" in erro) || erro.code !== "ENOENT") throw erro;
  }
}

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: process.env["DATABASE_URL"]
  }
};
