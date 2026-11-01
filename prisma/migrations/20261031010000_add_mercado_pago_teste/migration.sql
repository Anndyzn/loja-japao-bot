
ALTER TYPE "StatusPagamento" ADD VALUE 'em_revisao';
ALTER TABLE "Pagamento" ADD COLUMN "mercadoPagoId" TEXT;
CREATE UNIQUE INDEX "Pagamento_mercadoPagoId_key" ON "Pagamento"("mercadoPagoId");
CREATE TABLE "CobrancaMercadoPago" (
    "pedidoId" INTEGER NOT NULL,
    "chave" TEXT NOT NULL,
    "orderId" TEXT,
    "vendedorId" TEXT,
    "checkoutUrl" TEXT,
    "total" DECIMAL(10,2) NOT NULL,
    "requisicao" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'created',
    "revisao" BOOLEAN NOT NULL DEFAULT false,
    "atualizadaRemotoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CobrancaMercadoPago_pkey" PRIMARY KEY ("pedidoId"),
    CONSTRAINT "CobrancaMercadoPago_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CobrancaMercadoPago_chave_key" ON "CobrancaMercadoPago"("chave");
CREATE UNIQUE INDEX "CobrancaMercadoPago_orderId_key" ON "CobrancaMercadoPago"("orderId");
