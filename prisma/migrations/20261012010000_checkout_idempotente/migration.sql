ALTER TABLE "Pedido" ADD COLUMN "checkoutChave" VARCHAR(36), ADD COLUMN "checkoutHash" VARCHAR(64);
CREATE UNIQUE INDEX "Pedido_clienteId_checkoutChave_key" ON "Pedido"("clienteId", "checkoutChave");
