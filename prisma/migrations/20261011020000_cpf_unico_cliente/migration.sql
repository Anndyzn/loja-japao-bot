-- NULL continua permitido em cadastros antigos. Nao mescla nem apaga clientes.
CREATE UNIQUE INDEX "Cliente_cpf_key" ON "Cliente"("cpf");
