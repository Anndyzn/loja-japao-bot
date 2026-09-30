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

Se o PowerShell bloquear `npm`, use `npm.cmd`:

```bash
npm.cmd run dev
```

## Scripts

```txt
npm run dev          inicia a API em modo desenvolvimento
npm run db:up        sobe o PostgreSQL com Docker
npm run db:down      derruba o PostgreSQL
npm run db:migrate   aplica migrations do Prisma
npm run db:generate  gera o Prisma Client
npm run db:seed      cadastra dados iniciais
npm run db:studio    abre o Prisma Studio
```

## Fluxo Principal

1. Criar ou usar um cliente existente.
2. Listar produtos disponiveis.
3. Criar um pedido com `clienteId` e itens.
4. Criar um pagamento para o pedido.
5. Acompanhar o pedido pelo endpoint de acompanhamento.

## Rotas

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

```http
PATCH /produtos/1
Content-Type: application/json
```

```json
{
  "preco": 27.9,
  "estoque": 12
}
```

Remover produto:

```http
DELETE /produtos/1
```

### Clientes

Listar clientes:

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
  "endereco": "Rua Tokyo, 100"
}
```

Atualizar cliente:

```http
PATCH /clientes/1
Content-Type: application/json
```

```json
{
  "endereco": "Rua Osaka, 200"
}
```

Remover cliente:

```http
DELETE /clientes/1
```

### Pedidos

Listar pedidos:

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

```http
GET /pedidos/1
```

Listar pedidos de um cliente:

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
  "itens": [
    {
      "produtoId": 1,
      "quantidade": 2
    }
  ]
}
```

Atualizar status do pedido:

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
GET /pedidos/1/acompanhamento
```

### Pagamentos

Listar pagamentos:

```http
GET /pagamentos
```

Buscar pagamento por ID:

```http
GET /pagamentos/1
```

Listar pagamentos de um pedido:

```http
GET /pagamentos/pedido/1
```

Criar pagamento:

```http
POST /pagamentos
Content-Type: application/json
```

```json
{
  "pedidoId": 1,
  "metodo": "pix"
}
```

Metodos de pagamento:

```txt
pix, cartao, boleto
```

### Solicitacoes de Produto

Listar solicitacoes:

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

```http
GET /solicitacoes/1
```

Listar solicitacoes de um cliente:

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
6. Bot envia o status usando `GET /pedidos/:id/acompanhamento`.

## Admin

A tela de login futura sera para admin, nao para o cliente comum.

O admin podera:

- cadastrar e editar produtos;
- ver pedidos;
- atualizar status de pedidos;
- ver dashboard;
- gerenciar solicitacoes.

O cliente comum podera fazer pedido pelo site ou WhatsApp sem login, pelo menos
na primeira versao.
