UPDATE "Pedido"
SET
    "entregaNome" = "Cliente"."nome",
    "entregaTelefone" = "Cliente"."telefone",
    "entregaEmail" = "Cliente"."email",
    "entregaCep" = "Cliente"."cep",
    "entregaEndereco" = "Cliente"."endereco",
    "entregaNumero" = "Cliente"."numero",
    "entregaComplemento" = "Cliente"."complemento",
    "entregaBairro" = "Cliente"."bairro",
    "entregaCidade" = "Cliente"."cidade",
    "entregaEstado" = "Cliente"."estado",
    "entregaReferencia" = "Cliente"."referencia"
FROM "Cliente"
WHERE "Pedido"."clienteId" = "Cliente"."id"
AND "Pedido"."entregaEndereco" IS NULL;
