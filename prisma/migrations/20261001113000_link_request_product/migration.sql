ALTER TABLE "SolicitacaoProduto"
ADD COLUMN "produtoId" INTEGER;

ALTER TABLE "SolicitacaoProduto"
ADD CONSTRAINT "SolicitacaoProduto_produtoId_fkey"
FOREIGN KEY ("produtoId")
REFERENCES "Produto"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
