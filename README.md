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

O `.env.example` ja vem com um admin inicial de desenvolvimento:

```txt
ADMIN_EMAIL="admin@lojajapao.com"
ADMIN_PASSWORD="admin123"
```

Esses dados sao usados pelo `npm run db:seed`.

Em producao, o `db:seed` nao aceita criar admin com senha padrao. Configure
`ADMIN_EMAIL` e `ADMIN_PASSWORD` fortes antes de executar seed no servidor.

As variaveis principais sao:

```txt
NODE_ENV=development
PORT=3000
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
AUTH_TOKEN_SECRET="troque-este-segredo-em-producao"
```

`PORT` define onde a API vai rodar. Em desenvolvimento, o padrao e `3000`.
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
`AUTH_TOKEN_SECRET` assina o login do admin. Em desenvolvimento o sistema aceita
o valor do exemplo, mas em producao ele deve ser trocado por um texto forte,
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

Esse comando confere variaveis obrigatorias, segredo do admin, valores booleanos
e se `UPLOADS_DIR` pode ser criado/escrito. Ele nao imprime valores sensiveis.

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
  "email": "admin@lojajapao.com",
  "senha": "admin123"
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

## WhatsApp

O WhatsApp ainda nao foi implementado. A ideia e criar uma camada de bot que
usa esta API.

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
enviado. O cliente vera os dados na pagina de acompanhamento depois de informar
o telefone do pedido. Para Correios, o sistema mostra um botao para abrir o
rastreamento no site da transportadora. Ainda nao ha sincronizacao de eventos de entrega.

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

No admin, a aba Solicitacoes mostra o contato. Use Ver descricao para consultar
os detalhes e o link. O contato com o visitante e feito manualmente.
A rota publica e POST /solicitacoes/publica; a listagem continua exclusiva do admin.

Ao atualizar outra maquina, aplique as migrations e gere o Prisma Client antes
de iniciar o servidor, conforme os comandos da secao anterior.
