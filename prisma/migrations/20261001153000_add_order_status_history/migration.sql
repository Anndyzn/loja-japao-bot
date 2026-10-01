CREATE TABLE "HistoricoPedido" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "status" "StatusPedido" NOT NULL,
    "descricao" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoPedido_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HistoricoPedido_pedidoId_idx" ON "HistoricoPedido"("pedidoId");

ALTER TABLE "HistoricoPedido"
ADD CONSTRAINT "HistoricoPedido_pedidoId_fkey"
FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "HistoricoPedido" ("pedidoId", "status", "descricao", "criadoEm")
SELECT "id", "status", 'Status atual importado para o historico.', "criadoEm"
FROM "Pedido";
