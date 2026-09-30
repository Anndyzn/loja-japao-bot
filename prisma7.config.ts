if (typeof process.loadEnvFile === "function") {
  process.loadEnvFile(".env");
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
