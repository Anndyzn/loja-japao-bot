ALTER TABLE "Produto" ADD COLUMN "pesoKg" DECIMAL(10,3), ADD COLUMN "alturaCm" INTEGER, ADD COLUMN "larguraCm" INTEGER, ADD COLUMN "comprimentoCm" INTEGER;
ALTER TABLE "Pedido" ADD COLUMN "subtotalProdutos" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "freteValor" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "freteServicoId" TEXT, ADD COLUMN "freteServico" TEXT,
ADD COLUMN "freteTransportadora" TEXT, ADD COLUMN "fretePrazoDias" INTEGER, ADD COLUMN "freteAmbiente" TEXT;
UPDATE "Pedido" SET "subtotalProdutos" = "total";
