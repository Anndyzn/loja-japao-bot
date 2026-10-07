CREATE TYPE "TipoEnvioPedido" AS ENUM ('nacional', 'internacional_direto');

ALTER TABLE "Pedido"
ADD COLUMN "tipoEnvio" "TipoEnvioPedido" NOT NULL DEFAULT 'nacional',
ADD COLUMN "clienteCienteTaxasImportacao" BOOLEAN NOT NULL DEFAULT false;
