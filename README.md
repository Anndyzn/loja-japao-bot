# Loja Japao Bot

API backend para uma loja de produtos do Japao, com cadastro de produtos,
clientes, pedidos, pagamentos, solicitacoes de produtos e dashboard.

O projeto foi criado para aprender Full Stack na pratica. A API usa Express,
TypeScript, PostgreSQL, Docker e Prisma.

## Tecnologias

- Node.js
- TypeScript
- Express
- PostgreSQL
- Docker Compose
- Prisma

## Como Rodar

Instale as dependencias:

```bash
npm install
```

Crie o arquivo `.env` a partir do exemplo:

```bash
copy .env.example .env
```

O `.env.example` e apenas um modelo seguro para subir no Git. Depois de copiar,
preencha o `.env` local com os seus dados reais:

```txt
ADMIN_EMAIL="seu-email-admin"
ADMIN_PASSWORD="sua-senha-forte"
```

Esses dados sao usados pelo `npm run db:seed` para criar o admin inicial.

Em producao, o `db:seed` nao aceita criar admin com senha padrao. Configure
`ADMIN_EMAIL` e `ADMIN_PASSWORD` fortes antes de executar seed no servidor.

As variaveis principais sao:

```txt
NODE_ENV=development
PORT=3000
APP_NOME="Loja Japao"
LOJA_HERO_ETIQUETA="Importados do Japao"
LOJA_HERO_TITULO="Doces, presentes e achadinhos japoneses"
LOJA_HERO_DESCRICAO="Produtos selecionados para montar seu pedido com calma e finalizar em uma tela separada."
LOJA_HERO_IMAGEM_URL="/loja/assets/hero-produtos-japao.png"
LOJA_COR_PRINCIPAL="#c52233"
LOJA_COR_PRINCIPAL_ESCURO="#8e1724"
LOJA_ATENDIMENTO_TEXTO="Atendimento pelo WhatsApp apos a confirmacao do pedido."
DATABASE_URL="postgresql://..."
UPLOADS_DIR="public/uploads"
TRUST_PROXY=false
LOG_REQUESTS=true
PUBLIC_WRITE_MAX_REQUISICOES=30
PUBLIC_WRITE_JANELA_MINUTOS=10
PUBLIC_TRACKING_MAX_CONSULTAS=60
PUBLIC_TRACKING_JANELA_MINUTOS=10
ADMIN_LOGIN_MAX_TENTATIVAS=5
ADMIN_LOGIN_BLOQUEIO_MINUTOS=15
PIX_CHAVE=""
PIX_RECEBEDOR=""
FRETE_CEP_ORIGEM="00000000"
MELHOR_ENVIO_AMBIENTE="sandbox"
MELHOR_ENVIO_TOKEN="cole-seu-token-sandbox-aqui"
MELHOR_ENVIO_CONTATO="seu-email@example.com"
AUTH_TOKEN_SECRET="gere-um-segredo-com-npm-run-gerar-segredo"
```

`PORT` define onde a API vai rodar. Em desenvolvimento, o padrao e `3000`.
`APP_NOME` define o nome exibido no admin, na loja publica e em mensagens de
WhatsApp geradas pelo sistema. Para adaptar para outro cliente, troque esse
valor no `.env` local ou no ambiente de producao.
`LOJA_HERO_ETIQUETA`, `LOJA_HERO_TITULO`, `LOJA_HERO_DESCRICAO` e
`LOJA_HERO_IMAGEM_URL` controlam o conteudo principal da vitrine publica.
Use uma URL local iniciada com `/` ou uma URL `https://`.
`LOJA_COR_PRINCIPAL` e `LOJA_COR_PRINCIPAL_ESCURO` controlam os botoes e
destaques da loja publica. Use cores hexadecimais com 6 digitos, como
`#c52233`.
`LOJA_ATENDIMENTO_TEXTO` aparece nas telas publicas como orientacao curta de
atendimento ou suporte.
`UPLOADS_DIR` define onde as fotos enviadas pelo admin ficam salvas no disco.
O padrao local e `public/uploads`, e as imagens continuam sendo acessadas pela
URL publica `/uploads/...`.
`TRUST_PROXY` deve ficar `true` somente quando a API estiver atras de um proxy
confiavel. Isso ajuda o Express a identificar corretamente o IP real do cliente.
`LOG_REQUESTS` controla os logs simples de requisicao no terminal.
`PUBLIC_WRITE_MAX_REQUISICOES` e `PUBLIC_WRITE_JANELA_MINUTOS` limitam criacoes
publicas, como cliente, pedido e solicitacao, para reduzir spam.
`PUBLIC_TRACKING_MAX_CONSULTAS` e `PUBLIC_TRACKING_JANELA_MINUTOS` limitam a
consulta publica de acompanhamento de pedidos.
`ADMIN_LOGIN_MAX_TENTATIVAS` e `ADMIN_LOGIN_BLOQUEIO_MINUTOS` controlam a
protecao contra muitas tentativas de login incorretas no admin.
`PIX_CHAVE` e `PIX_RECEBEDOR` aparecem para o cliente no checkout e no
acompanhamento enquanto o pedido esta aguardando pagamento.
`FRETE_CEP_ORIGEM`, `MELHOR_ENVIO_AMBIENTE`, `MELHOR_ENVIO_TOKEN` e
`MELHOR_ENVIO_CONTATO` configuram a cotacao automatica de frete.
`AUTH_TOKEN_SECRET` assina o login do admin. Em desenvolvimento o sistema aceita
um valor local, mas em producao ele deve ser trocado por um texto forte,
com pelo menos 32 caracteres.

Para gerar um segredo forte:

```bash
npm run gerar:segredo
```

A porta do banco pode variar entre computadores. O `.env` e local e nao vai
para o Git: ao atualizar o projeto, preserve esse arquivo em cada maquina.

Por padrao, o Docker Compose usa a porta `5432`. Se ela estiver ocupada,
ajuste **os dois valores** no `.env` local, por exemplo:

```env
POSTGRES_PORT=5433
DATABASE_URL="postgresql://loja_japao:loja_japao@localhost:5433/loja_japao_bot?schema=public"
```

O `POSTGRES_PORT` define a porta no computador; dentro do container, o
PostgreSQL continua usando `5432`. Sem `POSTGRES_PORT`, o padrao e `5432`,
mantendo a compatibilidade com o `.env` antigo. Apos mudar a porta, execute
`npm run db:up` e reinicie a API. Nao e necessario apagar o volume do banco.

Suba o banco PostgreSQL:

```bash
npm run db:up
```

Crie as tabelas no banco:

```bash
npm run db:migrate
```

Gere o Prisma Client:

```bash
npm run db:generate
```

Cadastre produtos e clientes iniciais:

```bash
npm run db:seed
```

Inicie a API:

```bash
npm run dev
```

A API roda em:

```txt
http://localhost:3000
```

A raiz da API retorna um JSON com links rapidos para `info`, `health`, admin,
loja, carrinho e acompanhamento.

O health check da API roda em:

```txt
http://localhost:3000/health
```

Ele retorna `200` quando a API e o banco estao respondendo. Se o banco falhar,
retorna `503`, que e o codigo usado para indicar indisponibilidade temporaria.

As informacoes publicas da API rodam em:

```txt
http://localhost:3000/info
```

Essa rota retorna nome, versao, ambiente, uptime e horario da API sem consultar
o banco e sem expor segredos.

A configuracao publica da loja roda em:

```txt
http://localhost:3000/configuracao-publica
```

Essa rota retorna somente dados publicos de personalizacao, como nome da loja,
texto da vitrine, imagem e cores. Ela nao expoe Pix, tokens ou segredos.

A tela admin roda em:

```txt
http://localhost:3000/admin
```

A loja publica roda em:

```txt
http://localhost:3000/loja
```

O carrinho e checkout rodam em:

```txt
http://localhost:3000/loja/carrinho
```

A tela publica de acompanhamento roda em:

```txt
http://localhost:3000/loja/acompanhamento
```

Se o PowerShell bloquear `npm`, use `npm.cmd`:

```bash
npm.cmd run dev
```

## Ambiente de Producao

Antes de colocar no ar, configure um `.env` proprio no servidor:

```env
NODE_ENV=production
PORT=3000
APP_NOME="Nome da loja"
LOJA_HERO_ETIQUETA="Categoria ou chamada curta"
LOJA_HERO_TITULO="Titulo principal da loja"
LOJA_HERO_DESCRICAO="Descricao curta da proposta da loja"
LOJA_HERO_IMAGEM_URL="/loja/assets/hero-produtos-japao.png"
LOJA_COR_PRINCIPAL="#c52233"
LOJA_COR_PRINCIPAL_ESCURO="#8e1724"
LOJA_ATENDIMENTO_TEXTO="Atendimento pelo WhatsApp apos a confirmacao do pedido."
DATABASE_URL="postgresql://usuario:senha@host:5432/banco?schema=public"
UPLOADS_DIR="/caminho/persistente/uploads"
TRUST_PROXY=true
LOG_REQUESTS=true
PUBLIC_WRITE_MAX_REQUISICOES=30
PUBLIC_WRITE_JANELA_MINUTOS=10
PUBLIC_TRACKING_MAX_CONSULTAS=60
PUBLIC_TRACKING_JANELA_MINUTOS=10
ADMIN_LOGIN_MAX_TENTATIVAS=5
ADMIN_LOGIN_BLOQUEIO_MINUTOS=15
PIX_CHAVE="sua-chave-pix"
PIX_RECEBEDOR="Nome que recebe o Pix"
FRETE_CEP_ORIGEM="cep-de-postagem-com-8-digitos"
MELHOR_ENVIO_AMBIENTE="production"
MELHOR_ENVIO_TOKEN="token-privado-do-melhor-envio"
MELHOR_ENVIO_CONTATO="email-de-contato"
AUTH_TOKEN_SECRET="gere-um-segredo-forte-com-mais-de-32-caracteres"
```

Voce pode gerar o valor do `AUTH_TOKEN_SECRET` com:

```bash
npm.cmd run gerar:segredo
```

Em `NODE_ENV=production`, o servidor nao inicia se `AUTH_TOKEN_SECRET` estiver
vazio, curto demais ou com o valor de exemplo. Isso evita publicar o admin com
tokens faceis de falsificar.

Antes de publicar, rode uma verificacao basica do ambiente:

```bash
npm.cmd run verificar:deploy
```

Esse comando confere variaveis obrigatorias, segredo do admin, dados Pix,
configuracao de frete, valores booleanos e se `UPLOADS_DIR` pode ser
criado/escrito. Ele nao imprime valores sensiveis.

Depois de configurar o banco no servidor, aplique as migrations e inicie a API:

```bash
npm.cmd run db:deploy
npm.cmd run db:generate
npm.cmd run build
npm.cmd start
```

Para uma publicacao real, tambem garanta HTTPS, backup do banco e persistencia
para a pasta configurada em `UPLOADS_DIR`, porque as fotos dos produtos ficam
nessa pasta.

O projeto tambem possui `.dockerignore` para evitar que `.env`, `node_modules`,
`dist`, `generated`, caches e uploads locais sejam enviados em builds Docker.

Ao receber `Ctrl+C`, `SIGINT` ou `SIGTERM`, a API tenta encerrar com seguranca:
fecha o servidor HTTP e desconecta do banco antes de finalizar o processo.

O login admin possui uma protecao simples contra varias senhas erradas. Por
padrao, 5 falhas para o mesmo IP e email bloqueiam novas tentativas por 15
minutos. Em uma estrutura com varios servidores, essa contagem deve evoluir
para banco ou cache compartilhado.

Rotas publicas que criam dados possuem limite simples por IP. Por padrao, sao
30 envios a cada 10 minutos para cliente, pedido e solicitacao. Se a
chamada tiver token admin valido, esse limite publico nao e aplicado.
O acompanhamento publico de pedido tambem tem limite por IP. Por padrao, sao 60
consultas a cada 10 minutos.

A API tambem envia headers basicos de seguranca nas respostas, como bloqueio de
iframe, protecao contra MIME sniffing, politica simples de permissao de
recursos do navegador e `Content-Security-Policy`. A CSP permite recursos do
proprio sistema e conexao com `https://viacep.com.br`, usada na busca de CEP do
checkout.

Toda resposta tambem recebe `X-Request-Id`. Esse identificador ajuda a ligar um
erro visto no navegador ou cliente HTTP com o log correspondente no servidor.
Quando `LOG_REQUESTS=true`, cada requisicao registra metodo, caminho, status,
tempo de resposta e `requestId` no terminal.

## Checklist Antes de Publicar

Use este checklist para saber se o projeto ja esta pronto para uma primeira
versao online:

### Obrigatorio para colocar no ar

- Configurar `.env` de producao com `NODE_ENV=production`.
- Gerar um `AUTH_TOKEN_SECRET` forte com `npm run gerar:segredo`.
- Usar senha admin forte, diferente de `admin123`.
- Configurar `ADMIN_EMAIL` e `ADMIN_PASSWORD` fortes antes de usar `db:seed`.
- Configurar `DATABASE_URL` apontando para o PostgreSQL de producao.
- Garantir que `UPLOADS_DIR` seja uma pasta persistente para fotos dos produtos.
- Configurar `PIX_CHAVE` e `PIX_RECEBEDOR` para o checkout Pix.
- Rodar `npm run verificar:deploy`.
- Rodar `npm run check` e `npm run build`.
- Aplicar migrations com `npm run db:deploy`.
- Confirmar `/health` retornando banco `ok`.
- Testar login admin.
- Fazer um pedido completo pela loja publica.
- Conferir pedido no admin, pagamento, rastreio e acompanhamento publico.
- Testar uma solicitacao publica de produto.
- Publicar com HTTPS.
- Ter rotina de backup do banco.

### Pode melhorar depois da primeira versao

- Integracao real de pagamento.
- Integracao automatica com WhatsApp.
- Rastreio automatico por transportadora.
- Storage externo para imagens, como S3 ou similar.
- Relatorios financeiros mais completos.
- Permissoes diferentes para mais de um usuario admin.
- Testes automatizados de ponta a ponta.
- Melhorias visuais finas no admin e na loja publica.

### Decisao pratica

Se todos os itens obrigatorios passarem, o sistema ja pode ir para uma primeira
versao controlada. Os itens da segunda lista melhoram o produto, mas nao precisam
bloquear o primeiro deploy.

## Scripts

```txt
npm run dev          inicia a API em modo desenvolvimento
npm run build        compila o TypeScript para a pasta dist
npm start            inicia a API compilada em dist/src/server.js
npm run check        valida o TypeScript sem gerar arquivos
npm run gerar:segredo gera um AUTH_TOKEN_SECRET forte
npm run verificar:build confere arquivos essenciais da versao compilada
npm run verificar:deploy verifica configuracoes antes de publicar
npm run db:up        sobe o PostgreSQL com Docker
npm run db:down      derruba o PostgreSQL
npm run db:migrate   aplica migrations do Prisma
npm run db:deploy    aplica migrations existentes em producao
npm run db:generate  gera o Prisma Client
npm run db:seed      cadastra dados iniciais
npm run db:studio    abre o Prisma Studio
```

## Fluxo Principal

1. Criar ou usar um cliente existente.
2. Listar produtos disponiveis.
3. Criar um pedido com `clienteId` e itens.
4. Admin confirma o recebimento do Pix para registrar o pagamento e marcar o pedido como pago.
5. Acompanhar o pedido informando numero do pedido e telefone.

## Roteiro de Teste Manual

Use este roteiro quando puxar o projeto em outro computador, quando fizer uma
alteracao importante ou antes de publicar:

1. Rodar `npm run check` para validar o TypeScript.
2. Rodar `npm run build` para confirmar que a versao compilada gera sem erro.
3. Rodar `npm run verificar:build` para conferir os arquivos compilados.
4. Rodar `npm run verificar:deploy` para revisar variaveis de ambiente.
5. Subir o banco com `npm run db:up`.
6. Aplicar migrations com `npm run db:migrate` em desenvolvimento ou
   `npm run db:deploy` em producao.
7. Rodar `npm run db:generate` se o Prisma Client precisar ser atualizado.
8. Iniciar a API com `npm run dev`.
9. Abrir `http://localhost:3000/info` e confirmar as informacoes publicas.
10. Abrir `http://localhost:3000/health` e confirmar que o banco esta `ok`.
11. Entrar no admin em `http://localhost:3000/admin`.
12. Cadastrar ou editar um produto, incluindo imagem, preco, estoque e
    visibilidade na loja.
13. Abrir `http://localhost:3000/loja` e confirmar que o produto publicado
    aparece para o cliente.
14. Fazer um pedido publico pelo carrinho, preenchendo CEP, numero,
    complemento e telefone.
15. No admin, conferir detalhes do pedido, endereco do pedido, endereco atual
    do cliente, itens, total e historico.
16. Confirmar recebimento do Pix no pedido de teste, depois salvar rastreio e marcar
    como enviado.
17. Abrir o acompanhamento publico e consultar usando numero do pedido e
    telefone do cliente.
18. Criar uma solicitacao publica de produto e conferir no admin se contato,
    descricao e link aparecem corretamente.

Esse teste e manual de proposito: ele imita o caminho real do cliente e do
admin. Quando tudo passa aqui, a chance de quebrar algo importante fica bem
menor.

## Rotas

### Autenticacao Admin

Fazer login como admin:

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "seu-email-admin",
  "senha": "sua-senha-forte"
}
```

A resposta retorna um `token`. Use esse token nas rotas administrativas:

```http
Authorization: Bearer SEU_TOKEN_AQUI
```

Depois de muitas tentativas incorretas, o login retorna `429` com
`tentarNovamenteEm`. O painel admin mostra esse horario para orientar a nova
tentativa.

Validar token/sessao atual:

Requer token admin.

```http
GET /auth/me
```

Retorna os dados basicos do admin logado quando o token ainda e valido.

Na primeira versao, o login e apenas para admin. O cliente comum ainda pode
criar cliente, pedido e solicitacao sem login. Por isso o checkout
publico pede mais dados de entrega, como CEP, numero, complemento, bairro,
cidade, estado e ponto de referencia.

Alterar senha do admin:

Requer token admin. A nova senha deve ter pelo menos 10 caracteres.

```http
PATCH /auth/senha
Content-Type: application/json
```

```json
{
  "senhaAtual": "senha-atual",
  "novaSenha": "nova-senha-forte",
  "confirmacaoSenha": "nova-senha-forte"
}
```

### Produtos

Listar produtos:

```http
GET /produtos
```

Filtros opcionais:

```http
GET /produtos?nome=kitkat
GET /produtos?estoqueBaixo=true
GET /produtos?pagina=1&limite=10
```

Buscar produto por ID:

```http
GET /produtos/1
```

Criar produto:

Requer token admin.

Pelo painel admin, a foto do produto e enviada por upload do computador. A API
salva a imagem dentro de `UPLOADS_DIR/produtos` e o produto passa a usar uma
URL local, como `/uploads/produtos/produto-1.png`.

```http
POST /produtos
Content-Type: application/json
```

```json
{
  "nome": "Ramune",
  "preco": 19.9,
  "estoque": 20
}
```

Atualizar produto:

Requer token admin.

```http
PATCH /produtos/1
Content-Type: application/json
```

```json
{
  "nome": "Ramune Melon",
  "preco": 27.9,
  "estoque": 12
}
```

Enviar foto de um produto existente:

Requer token admin.

```http
POST /produtos/1/imagem
Content-Type: application/json
```

```json
{
  "imagem": "data:image/png;base64,..."
}
```

Formatos aceitos:

```txt
JPG, PNG, WEBP ate 3MB
```

A API tambem confere a assinatura interna do arquivo para rejeitar conteudo que
nao seja realmente JPG, PNG ou WEBP.

Remover foto de um produto:

Requer token admin.

```http
DELETE /produtos/1/imagem
```

O produto continua cadastrado, mas volta a ficar sem imagem.

Remover produto:

Requer token admin.

```http
DELETE /produtos/1
```

Se o produto ja estiver vinculado a pedidos, a API retorna `409` e bloqueia a
exclusao para preservar o historico. Nesse caso, edite o produto e desmarque
`Publicado na loja`.

### Clientes

Listar clientes:

Requer token admin.

```http
GET /clientes
```

Filtros opcionais:

```http
GET /clientes?nome=ana
GET /clientes?telefone=99999
GET /clientes?pagina=1&limite=10
```

Buscar cliente por ID:

Requer token admin.

```http
GET /clientes/1
```

Criar cliente:

```http
POST /clientes
Content-Type: application/json
```

```json
{
  "nome": "Maria Silva",
  "telefone": "(11) 98888-7777",
  "email": "maria@exemplo.com",
  "cep": "01001-000",
  "endereco": "Rua Tokyo",
  "numero": "100",
  "complemento": "Apto 12",
  "bairro": "Liberdade",
  "cidade": "Sao Paulo",
  "estado": "SP",
  "referencia": "Proximo ao mercado"
}
```

Se ja existir cliente com o mesmo telefone, ignorando parenteses, espacos e
tracos, a API reaproveita esse cadastro, atualiza os dados atuais do cliente e
retorna `200`. Se o telefone ainda nao existir, cria um novo cliente e retorna
`201`. A resposta de cadastro tambem traz `criadoAgora`, que sera `true` quando
criou um cliente novo e `false` quando reaproveitou um cliente existente.

Atualizar cliente:

Requer token admin.

```http
PATCH /clientes/1
Content-Type: application/json
```

```json
{
  "telefone": "(11) 97777-6666",
  "cep": "01002-000",
  "endereco": "Rua Osaka",
  "numero": "200",
  "complemento": "Casa 2",
  "bairro": "Centro",
  "cidade": "Sao Paulo",
  "estado": "SP",
  "referencia": "Portao azul"
}
```

Remover cliente:

Requer token admin.

```http
DELETE /clientes/1
```

Se o cliente ja tiver pedidos ou solicitacoes vinculadas, a API retorna `409` e
bloqueia a exclusao para preservar o historico.

### Pedidos

Listar pedidos:

Requer token admin.

```http
GET /pedidos
```

Filtrar por status:

```http
GET /pedidos?status=pendente
```

Status de pedido:

```txt
pendente, pago, enviado, cancelado
```

Buscar pedido por ID:

Requer token admin.

```http
GET /pedidos/1
```

Listar pedidos de um cliente:

Requer token admin.

```http
GET /pedidos/cliente/1
```

Criar pedido:

```http
POST /pedidos
Content-Type: application/json
```

```json
{
  "clienteId": 1,
  "observacao": "Entregar no periodo da tarde",
  "freteToken": "token retornado por POST /fretes/cotacao",
  "itens": [
    {
      "produtoId": 1,
      "quantidade": 2
    }
  ]
}
```

Atualizar status do pedido:

Requer token admin.

```http
PATCH /pedidos/1/status
Content-Type: application/json
```

```json
{
  "status": "enviado"
}
```

Acompanhar pedido:

```http
GET /pedidos/1/acompanhamento?telefone=11999990001
```

Tambem existe a tela publica:

```txt
http://localhost:3000/loja/acompanhamento?pedido=1
```

A tela preenche o numero quando ele vem na URL, mas ainda pede o telefone do
pedido antes de mostrar os dados.

### Pagamentos

Listar pagamentos:

Requer token admin.

```http
GET /pagamentos
```

Buscar pagamento por ID:

Requer token admin.

```http
GET /pagamentos/1
```

Listar pagamentos de um pedido:

Requer token admin.

```http
GET /pagamentos/pedido/1
```

Confirmar manualmente o recebimento do Pix (requer token admin):

```http
POST /pagamentos
Authorization: Bearer SEU_TOKEN_ADMIN
Content-Type: application/json
```

```json
{
  "pedidoId": 1,
  "metodo": "pix"
}
```

O checkout oferece somente Pix. Finalizar a compra cria um pedido pendente,
sem registrar pagamento. O acompanhamento mostra que esta aguardando pagamento.

Apos conferir o recebimento do valor total na conta bancaria, o admin usa
Confirmar recebimento do Pix. Essa acao registra o pagamento e marca o pedido
como pago. O historico identifica a confirmacao manual. Nao ha consulta ao banco
nem transferencia de dinheiro feita pelo sistema.

POST /pagamentos exige token admin valido (401 sem autenticacao) e aceita somente
`pix` (400 para outros metodos). Registros antigos de cartao e boleto continuam
disponiveis para consulta e nos filtros do admin.

Configure no seu `.env` local a chave que voce ja cadastrou no banco e o nome
exato do recebedor. Preencha as duas variaveis:

```env
PIX_CHAVE=""
PIX_RECEBEDOR=""
```

Reinicie a API depois de alterar o `.env`. Nao sobrescreva o arquivo existente
com o `.env.example`. Em outro computador, configure esses dados novamente.
A chave e o nome sao exibidos aos clientes; nao coloque senhas ou tokens nesses campos.

A tela de pedido criado e o acompanhamento mostram chave, recebedor, valor e
botao Copiar chave Pix apenas enquanto o pedido esta pendente. Sem os dois dados
configurados, mostram uma orientacao para contatar a loja. O acompanhamento
continua exigindo o numero e o telefone do pedido.

O cliente usa Pix por chave no aplicativo do banco e informa o valor exibido.
Nao e um codigo Pix Copia e Cola nem um QR Code. Copiar a chave nao confirma o
pagamento. Se ja pagou, deve aguardar a conferencia manual sem pagar novamente.
A tela usa a configuracao atual da loja, inclusive para pedidos pendentes antigos.

Teste manual desta etapa (use pedidos de teste, sem transferencia real):

1. Finalize um pedido na loja e confira que aparece Aguardando pagamento.
2. No admin, confira o pedido pendente e sem registro de pagamento.
3. Clique em Confirmar recebimento do Pix e cancele a confirmacao: deve continuar pendente.
4. Confirme no pedido de teste: deve ficar pago, com um pagamento Pix e historico de confirmacao manual.
5. Atualize o acompanhamento publico e confira o pagamento aprovado.
6. Confira que o botao de confirmar recebimento desaparece depois de pago.
7. Com os dados Pix configurados, confira o valor, o recebedor e a copia da chave nas duas telas publicas.
8. Depois de pago ou cancelado, atualize o acompanhamento e confira que o quadro Pix desaparece.
9. Com uma das variaveis Pix vazia, reinicie a API e confira a orientacao de contato.
10. Em Pedidos > Ver detalhes, confirme o Pix pela secao Pagamentos e confira que o modal atualiza para pago.
11. Salve um rastreio duas vezes com os mesmos dados e confira que o historico nao duplica a etapa.
12. Confira os botoes de WhatsApp do pedido para dados Pix, pagamento aprovado, rastreio e status atual.

### Recebimentos por periodo no admin

Em Pagamentos, use Recebido de / Ate ou os atalhos Hoje e Este mes. Limpar
restaura a consulta de todos os periodos. Busca, metodo e status continuam
combinando com o periodo escolhido. As datas incluem o dia inteiro no fuso
America/Sao_Paulo e usam a data de registro do pagamento, nao a data do pedido.
Os registros mais recentes aparecem primeiro.

Os cards mostram total recebido, quantidade de pagamentos aprovados e valor
medio dentro dos filtros. Incluem frete e pagamentos preservados de pedidos
cancelados. Nao descontam custos ou devolucoes: este resumo nao representa lucro.
A consulta reaproveita a rota admin GET /pagamentos, sem nova integracao.

Teste manual: consulte Hoje, Este mes, um intervalo sem registros e um periodo
com data inicial maior que a final. Combine com Pix e busca por pedido; confira
se tabela e totais correspondem. Limpar deve trazer todos os registros novamente.
Teste automatizado: node --test tests/admin-pagamentos.test.mjs.

### Solicitacoes de Produto

Listar solicitacoes:

Requer token admin.

```http
GET /solicitacoes
```

Filtrar por status:

```http
GET /solicitacoes?status=recebida
```

Status de solicitacao:

```txt
recebida, em_analise, cotada, aprovada, recusada, cancelada
```

Buscar solicitacao por ID:

Requer token admin.

```http
GET /solicitacoes/1
```

Listar solicitacoes de um cliente:

Requer token admin.

```http
GET /solicitacoes/cliente/1
```

Criar solicitacao:

```http
POST /solicitacoes
Content-Type: application/json
```

```json
{
  "clienteId": 1,
  "nomeProduto": "Action figure Naruto",
  "descricao": "Produto importado do Japao",
  "linkReferencia": "https://exemplo.com/produto"
}
```

Atualizar status da solicitacao:

Requer token admin.

```http
PATCH /solicitacoes/1/status
Content-Type: application/json
```

```json
{
  "status": "em_analise"
}
```

### Dashboard

Resumo do sistema:

Requer token admin.

```http
GET /dashboard/resumo
```

No painel, o dashboard foi pensado como central de trabalho: cards principais
no topo, fila de acoes abaixo e atalhos para as telas mais usadas. O atalho
Pedidos ativos abre pedidos pendentes/pagos; Finalizados abre enviados e
cancelados. Isso evita misturar trabalho do dia com historico.

## WhatsApp

Ainda nao existe bot integrado nem envio automatico de mensagens. O admin usa
links do WhatsApp e mensagens prontas para agilizar o atendimento manual.

Em Solicitacoes, o admin pode enviar ou copiar mensagens de recebimento e
cotacao. Em Pedidos > Ver detalhes, a secao WhatsApp mostra acoes conforme a
etapa do pedido:

- dados Pix, enquanto o pedido esta pendente e as variaveis Pix estao configuradas;
- pagamento aprovado, depois da confirmacao manual do Pix;
- rastreio, quando transportadora e codigo ja foram salvos;
- status atual do pedido.

Cada mensagem pode ser aberta no WhatsApp ou copiada. O sistema nao envia
mensagens sozinho; o admin ainda precisa conferir e enviar pelo WhatsApp.

A ideia futura e criar uma camada de bot que usa esta API.

Exemplo de fluxo futuro:

1. Cliente manda "ver produtos".
2. Bot chama `GET /produtos`.
3. Cliente escolhe itens.
4. Bot chama `POST /clientes` se o cliente ainda nao existir.
5. Bot chama `POST /pedidos`.
6. Bot envia o status usando `GET /pedidos/:id/acompanhamento?telefone=...`.

## Admin

A tela de login e para admin, nao para o cliente comum.

Primeira versao da tela admin:

```txt
http://localhost:3000/admin
```

O admin podera:

- cadastrar e editar produtos;
- ver clientes;
- ver pedidos;
- atualizar status de pedidos;
- ver pagamentos;
- ver dashboard;
- gerenciar solicitacoes;
- atualizar status de solicitacoes.

O cliente comum podera fazer pedido pelo site ou WhatsApp sem login, pelo menos
na primeira versao.

## Rastreio de envio

No admin, abra Pedidos > Ver detalhes e informe transportadora e codigo de
rastreio. Os campos podem ser cadastrados ou corrigidos em pedidos pagos ou
enviados. Salvar o rastreio nao muda o status; apos a postagem, use Marcar como
enviado, que aparece no proprio modal quando o pedido esta pago e ja tem
rastreio salvo. O cliente vera os dados na pagina de acompanhamento depois de
informar o telefone do pedido. Para Correios, o sistema mostra um botao para
abrir o rastreamento no site da transportadora. Ainda nao ha sincronizacao de
eventos de entrega.

Salvar o mesmo rastreio novamente nao cria uma nova etapa duplicada no historico.

A rota administrativa e PATCH /pedidos/:id/rastreio, com os campos
transportadora e codigoRastreio (textos de 1 a 100 caracteres).

Ao trazer esta alteracao para outra maquina, preserve o .env local e, com o
banco iniciado, aplique as migrations existentes e gere o cliente Prisma antes
de iniciar a API:

~~~powershell
npx.cmd --yes prisma@7.10.0 migrate deploy
npm.cmd run db:generate
npm.cmd run dev
~~~

## Solicitacao publica de produtos

A pagina /loja/solicitacao permite pedir uma cotacao informando nome, telefone,
produto, descricao e link opcional. Nao exige compra anterior nem endereco.
A solicitacao guarda os dados de contato e nasce com status recebida; nao cria
pedido, pagamento ou cadastro de cliente. Solicitacoes antigas continuam ligadas
aos clientes existentes. A vinculacao automatica com o checkout fica para outra etapa.

No admin, a aba Solicitacoes mostra o contato, o ciclo da solicitacao e a
proxima acao. O ciclo usa OK/Falta para Cotacao, Cliente, Produto e Pedido.
Quando uma solicitacao ja tem cotacao, cliente e produto, o botao Preparar
pedido aparece diretamente na linha. Use Ver descricao para consultar detalhes,
link, observacao interna e acoes extras. O contato com o visitante e feito
manualmente.
A rota publica e POST /solicitacoes/publica; a listagem continua exclusiva do admin.

Ao atualizar outra maquina, aplique as migrations e gere o Prisma Client antes
de iniciar o servidor, conforme os comandos da secao anterior.

### Filtros e paginacao de pedidos

GET /pedidos e GET /pedidos/cliente/:clienteId aceitam status, ciclo,
busca, precisaAcao=true|false, acao=pix|rastreio|envio, pagina e limite (ate 50).
Todos os filtros sao combinados antes de paginar. A busca parcial existente
por cliente, telefone, produto e numero continua disponivel.

O filtro ciclo aceita ativos, finalizados ou todos. Ativos mostra pendente e
pago; finalizados mostra enviado e cancelado. Se um status especifico for
informado, ele tem prioridade sobre o ciclo.

A resposta inclui dados, pagina, limite, total, totalPaginas e resumo dos
resultados filtrados (valor total, status e acoes). O resumo nao se limita
a pagina visivel. Sem resultados, dados fica vazio e totalPaginas e zero.
Filtros de acao ordenam por Pix, rastreio e envio, depois pelos pedidos mais
recentes, com desempate por ID. Combinacoes sem correspondencia retornam vazio.

O admin permite navegar por Anterior/Proxima e escolher 10, 20 ou 50 pedidos.
Mudar filtros volta para a primeira pagina; atualizar um pedido preserva a
pagina e recua se a ultima pagina ficar vazia. Respostas antigas de buscas
sobrepostas nao substituem a consulta atual. Os atalhos do Dashboard e o
filtro por cliente usam a mesma listagem.

Na criacao manual de pedidos pelo admin, pedidos nacionais podem usar uma
cotacao automatica ou um frete combinado manual. O frete manual e exclusivo
do admin, entra no total do pedido e no Pix, e nao altera a regra de estoque.
No checkout publico, o cliente continua usando a cotacao automatica.

A busca continua sendo feita em memoria no backend para preservar a
normalizacao atual de acentos e telefones. A consulta ao banco ja restringe
status e cliente; a paginacao em SQL pode ser uma evolucao para grandes volumes.

Teste manual: altere o tamanho da pagina, navegue, combine busca com cada
tipo de acao, teste os atalhos do Dashboard e os pedidos de um cliente.
Confirme Pix ou salve rastreio com filtro ativo e confira que a lista e o
resumo se atualizam. Nenhuma migration e necessaria para esta alteracao.

Regressao automatizada: `npm run test:pedidos`. Usa 96 pedidos ficticios e
substitui as leituras do Prisma em memoria, sem gravar no banco. Cobre filtros
alem da primeira pagina, totais, cliente, busca, entradas invalidas, pagina
esvaziada, erro de rede e respostas fora de ordem.

### Consistencia de pedidos, pagamentos e estoque

- Somente POST /pagamentos, autenticado como admin, pode confirmar Pix e mudar
  o pedido para pago. PATCH /pedidos/:id/status rejeita o destino pago.
- Nao e permitido voltar para pendente. Repetir cancelamento ou envio retorna
  o estado atual, sem repetir estoque nem historico.
- Enviar exige pedido pago, pagamento aprovado registrado e rastreio completo.
- Cancelar e permitido antes do envio (pendente ou pago). Devolve o estoque
  uma unica vez. Um pagamento ja registrado permanece no historico; o estorno
  deve ser tratado manualmente. Este fluxo nao registra nem executa estornos.
- Pedido enviado nao pode voltar de etapa ou ser cancelado pelo fluxo simples.
  Devolucoes apos envio precisarao de um fluxo proprio.
- Confirmacao de Pix, status e rastreio bloqueiam a linha do pedido durante
  a transacao. Uma segunda operacao espera e verifica o estado atualizado.
- Criacao de pedidos bloqueia os produtos por ID antes de conferir o estoque;
  duas compras nao podem consumir a mesma ultima unidade. Todas as alteracoes
  de cada operacao sao confirmadas juntas ou desfeitas em caso de erro.

Nenhuma migration e necessaria. Registros antigos inconsistentes nao sao
alterados automaticamente; enviar um pedido pago sem pagamento registrado
retorna uma orientacao de erro para que o caso seja conferido.

Teste de concorrencia: `npm run test:consistencia`. Requer PostgreSQL local
ativo e usuario com permissao de criar bancos. Cria um banco de nome aleatorio,
aplica as migrations existentes, testa operacoes simultaneas e rollback, e
remove exclusivamente esse banco ao terminar. Nao utiliza dados da loja.

## Frete automatico Brasil -> Brasil

Esta etapa consulta Correios PAC e SEDEX pelo Melhor Envio, a partir do seu
estoque no Brasil. Nao compra etiquetas nem agenda postagem. Pix continua
manual: o pedido nasce pendente e o admin confirma o recebimento.

### Atualizar este computador ou outra maquina

Com o Docker iniciado:

```powershell
npm install
npm run db:up
npm run db:deploy
npm run db:generate
npm run check
npm run dev
```

A migration adiciona peso/medidas aos produtos e dados de frete aos pedidos.
Pedidos antigos mantem o total original, com frete zero e sem servico definido;
nao representam uma cotacao nova. Nao recrie o banco.

No .env local, preencha (o arquivo nao vai para o Git):

```dotenv
FRETE_CEP_ORIGEM="CEP de postagem no Brasil, com 8 digitos"
MELHOR_ENVIO_AMBIENTE="sandbox"
MELHOR_ENVIO_TOKEN="token privado da sua conta sandbox"
MELHOR_ENVIO_CONTATO="seu email de contato"
```

Crie a conta de testes no [sandbox do Melhor Envio](https://sandbox.melhorenvio.com.br/).
As contas e credenciais de sandbox e producao sao separadas. Gere o token no
painel em Integracoes > Permissoes de Acesso. Guarde-o somente no servidor.
Reinicie o backend depois de mudar o .env. Nunca envie o token pelo chat ou Git.

No admin, edite cada produto e informe peso embalado por unidade em kg (ex. 0.250)
e altura, largura e comprimento em cm inteiros. Use medidas reais, incluindo a
embalagem. Produtos antigos continuam editaveis sem medidas, mas nao podem
ser cotados ate completar esses campos.

### Fluxo e teste manual

1. Adicione produtos ao carrinho e preencha o endereco de entrega.
2. Na etapa Pagamento, clique em Calcular frete e escolha um servico.
3. Confira subtotal dos produtos, frete e total antes de finalizar.
4. O pedido fica pendente; o valor do Pix inclui o frete.
5. Confira o mesmo resumo nos detalhes do admin e no acompanhamento publico.
6. Alterar CEP ou quantidade exige uma nova cotacao. Sem cotacao, ou com
   cotacao vencida, o pedido nao e criado. Teste tambem um produto sem medidas.
7. No admin, criar pedido tambem exige calcular e selecionar o frete.

Cotacoes expiram em 15 minutos. O backend assina a opcao e confere produtos,
quantidades, precos, medidas e CEP ao criar o pedido. O navegador nao decide
quanto cobrar. Falhas na integracao nao viram frete gratis. O prazo mostrado
corresponde ao transporte em dias uteis apos a postagem.

No sandbox as opcoes e os pedidos mostram SIMULACAO. Nao faca pagamentos reais
nesses testes. Em producao, configure NODE_ENV=production,
MELHOR_ENVIO_AMBIENTE=production e credenciais de producao, alem das demais
variaveis obrigatorias. O backend rejeita frete sandbox em producao.
Execute npm run verificar:deploy antes de publicar. A validacao local nao
comprova a autenticacao com o provedor: teste sua conta e CEPs reais antes de abrir a loja.

### API de cotacao

```http
POST /fretes/cotacao
Content-Type: application/json
```

```json
{
  "cep": "01001000",
  "itens": [{ "produtoId": 1, "quantidade": 2 }]
}
```

Resposta: subtotalProdutos e opcoes com valor, servico, transportadora,
prazoDias, ambiente, expiraEm e token. Envie o token escolhido como freteToken
em POST /pedidos junto dos mesmos itens e de um cliente com o mesmo CEP.
Para cotar produtos internos, envie Authorization: Bearer com token admin.

Testes: npm run test:checkout verifica a logica do navegador com DOM e API
simulados; npm run test:consistencia verifica migracao, cotacoes e pedidos em
PostgreSQL temporario, com a API do provedor simulada. Nenhum deles compra
etiquetas ou valida sua conta real. A revisao visual no navegador e manual.

Documentacao consultada: [calculo por produtos](https://docs.melhorenvio.com.br/reference/calculo-de-fretes-por-produtos)
e [ambiente sandbox](https://docs.melhorenvio.com.br/docs/sandbox).
O calculo usa custom_price e custom_delivery_time retornados pelo provedor.

### Rastreio no admin apos a cotacao

Em Pedidos > Ver detalhes > Rastreio do envio, a transportadora vem preenchida
pela entrega escolhida. Se ja existir rastreio, prevalece a transportadora salva.
O servico escolhido (PAC/SEDEX), valor e indicacao de sandbox ficam visiveis
junto ao formulario. Pedidos antigos sem cotacao continuam com preenchimento manual.

Apos postar, informe o codigo, salve o rastreio e marque como enviado.
Alteracoes ainda nao salvas bloqueiam o botao de envio. A transportadora pode
ser corrigida, preservando o frete original cobrado do cliente. A integracao
atual apenas calcula frete: a etiqueta e a postagem continuam fora do sistema.

Teste manual: abra um pedido pago com frete, confira o preenchimento, salve
um rastreio de teste e reabra. Altere o codigo sem salvar e confira que o envio
fica desabilitado; salve e confira a liberacao. Confira tambem um pedido antigo
sem cotacao e um pedido que ja tenha transportadora de envio cadastrada.

Teste automatizado do formulario, sem banco ou rede:
`node --test tests/admin-rastreio.test.mjs`.

### Produtos com medidas de envio pendentes

O admin mostra uma coluna com peso/dimensoes ou os campos que faltam.
Use o filtro "Sem medidas de envio" e o botao "Completar medidas" para abrir
uma edicao no primeiro campo pendente. O filtro combina com nome, publicacao
e estoque baixo, e e aplicado no backend antes da paginacao.
GET /produtos aceita medidasIncompletas=true e retorna medidasEnvioPendentes
em cada produto. false ou ausencia do filtro mantem todos os produtos.

Essa indicacao usa apenas o cadastro local, sem chamadas ao Melhor Envio.
"Medidas completas" nao garante cobertura da transportadora para todo CEP;
a disponibilidade continua sendo consultada no checkout. Nenhuma migration
ou nova dependencia e necessaria.

Teste manual: filtre os produtos sem medidas, complete um cadastro e salve.
Ele deve sair desse filtro; ao limpar, deve exibir "Medidas completas".
O cadastro ainda pode ser salvo incompleto para preparar produtos internos.

### Responsividade da loja e do admin

Formularios, seletores e textos longos se ajustam a telas pequenas. No admin,
o menu fica horizontal no celular; deslize para acessar as outras abas.
As tabelas mantem colunas legiveis e rolam dentro do proprio quadro (tambem
acessivel por teclado). Modais usam a altura disponivel com rolagem interna.
O carrinho lateral acompanha a altura da tela e bloqueia a rolagem do fundo.

Verificacao em Chrome isolado, com dados ficticios e gravacoes da API
bloqueadas: catalogo, carrinho lateral, quatro etapas do checkout,
acompanhamento, solicitacao, login, sete abas do admin e quatro modais.
Foram conferidas 160 combinacoes entre telas e tamanhos, de 320 a 1440 px,
incluindo pouca altura e celular deitado, sem transbordamento horizontal
nos elementos verificados fora das areas de rolagem intencional e sem
excecoes JavaScript. Capturas selecionadas foram revisadas visualmente.

Teste manual: atualize com Ctrl+F5, reduza a janela ou use o modo dispositivo
do navegador; confira filtros, rolagem de tabelas, abertura/fechamento dos
modais e campos de frete. Teste tambem no celular real, principalmente
com o teclado aberto. Nenhuma dependencia ou servico foi adicionado.

## Backup local do banco e das imagens

Com o Docker ligado, pare a API com Ctrl+C no terminal de npm run dev/start.
Evite cadastrar pedidos ou alterar imagens durante a copia. Depois rode:

```bash
npm run backup
```

O comando confere se DATABASE_URL aponta para a porta do PostgreSQL local deste
Docker Compose e cria uma nova pasta datada dentro de backups/, sem sobrescrever
backups anteriores. Usa pg_dump do proprio container, sem instalar PostgreSQL no PC.
A pasta contem banco.dump, uploads/ e manifesto.json com tamanhos e hashes SHA-256.
O dump inclui tabelas, dados, historico de migrations e administradores da loja.
O .env, o codigo e usuarios globais do PostgreSQL nao fazem parte do backup.
Se UPLOADS_DIR nao existir, isso sera informado e uploads/ ficara vazia.

O banco e exportado em formato custom do PostgreSQL, usado pelo pg_restore:
[documentacao do pg_dump](https://www.postgresql.org/docs/16/app-pgdump.html).
A copia de imagens e separada do dump; por isso mantenha a API parada ate terminar.
Depois, inicie a API novamente com npm run dev (ou npm start para o build).

Para conferir os arquivos depois de copiar para outro computador:

```bash
npm run backup:verificar -- "backups/NOME-DA-PASTA"
```

A verificacao funciona sem Docker e nao restaura nem altera o banco. Confere se
arquivos estao ausentes, extras ou diferentes do manifesto; nao substitui um teste
de restauracao. Copie a pasta inteira, incluindo manifesto.json e uploads/.
Guarde outra copia em um local privado fora deste computador. Backups contem dados
de clientes e hashes de senha dos administradores; nao publique nem envie ao Git.
backups/ e arquivos *.dump estao excluidos do Git e do contexto de build Docker.

Se falhar, o comando retorna erro e preserva a pasta com sufixo .incompleto para
inspecao. Essa pasta nao e um backup concluido. Corrija a causa e execute novamente.
Nenhum backup anterior ou dado da loja e apagado automaticamente.

Para recuperar em outra maquina, o destino deve ser um banco vazio: use pg_restore
com --no-owner --no-acl --exit-on-error --single-transaction e copie uploads/ para
UPLOADS_DIR. Preserve o .env local e ajuste DATABASE_URL para o banco restaurado.
Nao restaure por cima de um banco em uso; prepare a restauracao antes de trocar a
conexao. O login sera o do admin salvo no backup. Em seguida aplique migrations
pendentes com npm run db:deploy. O comando de backup nao executa restauracoes.

Teste automatizado da integridade: node --test tests/backup.test.mjs.

### Retomar o ultimo pedido na loja

Depois de criar um pedido ou consulta-lo com telefone valido, o carrinho e o
acompanhamento mostram um atalho para o ultimo pedido da sessao. Atualizar a
pagina preserva o atalho. O acompanhamento consulta a API novamente para mostrar
Pix, pagamento e rastreio atuais; nenhum status ou endereco fica salvo nesse atalho.

A referencia (numero e telefone) fica em sessionStorage, restrita a sessao da aba,
e nao e sincronizada com outros computadores. Nao substitui guardar o numero do
pedido. Um link explicito para outro pedido prevalece sobre a referencia salva e
pede o telefone correspondente. Remover atalho remove o atalho e, no
acompanhamento, limpa o resultado, sem cancelar ou apagar o pedido da loja.

Se o navegador bloquear o armazenamento, a consulta manual continua funcionando.
Uma compra ja criada continua sendo mostrada como concluida, com orientacao para
anotar o numero e nao refazer a compra.

Teste manual: finalize uma compra de teste, atualize o carrinho e abra o atalho.
Confirme o Pix no admin e consulte novamente para conferir o novo status. Use
Remover atalho e verifique que numero e telefone precisam ser informados
novamente. Nenhuma transferencia real e necessaria.
Testes: npm run test:checkout e node --test tests/acompanhamento-sessao.test.mjs.
