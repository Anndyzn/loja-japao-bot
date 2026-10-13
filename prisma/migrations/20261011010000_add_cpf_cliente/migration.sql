-- Campos opcionais preservam os cadastros e pedidos anteriores.
ALTER TABLE "Cliente" ADD COLUMN "cpf" VARCHAR(11);
ALTER TABLE "Pedido" ADD COLUMN "entregaCpf" VARCHAR(11);
