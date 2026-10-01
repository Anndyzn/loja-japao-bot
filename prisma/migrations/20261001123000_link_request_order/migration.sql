ALTER TABLE "SolicitacaoProduto"
ADD COLUMN "pedidoId" INTEGER;

ALTER TABLE "SolicitacaoProduto"
ADD CONSTRAINT "SolicitacaoProduto_pedidoId_fkey"
FOREIGN KEY ("pedidoId")
REFERENCES "Pedido"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
