
CREATE TABLE "ContaCliente" (
 "clienteId" INTEGER NOT NULL, "email" TEXT NOT NULL, "senhaHash" TEXT,
 "conviteHash" TEXT, "conviteExpiraEm" TIMESTAMP(3), "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "ContaCliente_pkey" PRIMARY KEY ("clienteId"),
 CONSTRAINT "ContaCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ContaCliente_email_key" ON "ContaCliente"("email");
CREATE UNIQUE INDEX "ContaCliente_conviteHash_key" ON "ContaCliente"("conviteHash");
CREATE TABLE "SessaoCliente" (
 "tokenHash" TEXT NOT NULL, "clienteId" INTEGER NOT NULL, "expiraEm" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "SessaoCliente_pkey" PRIMARY KEY ("tokenHash"),
 CONSTRAINT "SessaoCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "ContaCliente"("clienteId") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "SessaoCliente_clienteId_idx" ON "SessaoCliente"("clienteId");
CREATE INDEX "SessaoCliente_expiraEm_idx" ON "SessaoCliente"("expiraEm");
