# Continuar em outro computador — Loja Japão Bot

Atualizado em 07/10/2026. Este arquivo acompanha o commit de frete nacional,
melhorias operacionais e responsividade. Confira o hash com `git log -1 --oneline`.

## Como trabalhamos

- Leia o código atual antes de alterar; o repositório é a fonte da verdade.
- Explique de forma curta e didática e aguarde o teste do usuário.
- Mantenha a solução simples e barata, sem serviços pagos desnecessários.
- Preserve funcionalidades existentes. Não publique em produção automaticamente.

Stack: Node.js, TypeScript, Express, PostgreSQL via Docker Compose, Prisma 7
(configuração em prisma7.config.ts), frontend HTML/CSS/JavaScript puro.

## O que entrou nesta atualização

1. Frete Brasil → Brasil pelo Melhor Envio, com PAC/SEDEX.
   - POST /fretes/cotacao usa CEP de origem/destino e dados do produto no banco.
   - Produtos têm peso embalado em kg e altura/largura/comprimento em cm.
   - Cotação assinada, válida por 15 minutos; mudanças de itens, preço, medidas
     ou CEP invalidam a cotação. Erros da API não viram frete grátis.
   - Pedido exige freteToken e salva subtotal, valor do frete, serviço,
     transportadora, prazo e ambiente. Total do Pix inclui o frete.
   - Migration 20261006180000_add_frete_nacional preserva pedidos antigos.
   - Token fica no backend. Configuração atual de testes: sandbox.
   - Conexão real com o sandbox foi testada e retornou cotação. O usuário
     também confirmou que as opções apareceram no checkout.
   - Integração apenas calcula: compra de etiqueta e postagem continuam manuais.

2. Admin e rastreio.
   - Transportadora vem preenchida pela cotação; rastreio já salvo prevalece.
   - Mostra serviço escolhido; mudanças não salvas bloqueiam Marcar como enviado.
   - Produtos têm indicação/filtro de medidas pendentes e botão Completar medidas.
   - Filtros de pedidos são aplicados antes da paginação; resumo considera todos
     os resultados filtrados. Navegação com 10/20/50 pedidos por página.

3. Consistência de pedidos, estoque e Pix.
   - Bloqueios de registros e transações evitam pagamento duplicado, estoque
     negativo e devolução duplicada de estoque em operações simultâneas.
   - Pago exige confirmação do Pix. Envio exige pagamento e rastreio.
   - Cancelado não reabre; enviado não retrocede/cancela por esse fluxo.
   - Cancelar pedido pago preserva o pagamento; não simula reembolso bancário.

4. Responsividade.
   - Loja, checkout, carrinho lateral, acompanhamento e solicitação ajustados.
   - Admin com menu horizontal no celular, tabelas com rolagem própria,
     formulários adaptáveis e modais limitados à altura disponível.
   - 160 combinações de telas/tamanhos verificadas em Chrome com dados fictícios.
   - Falta o usuário conferir em celular real, inclusive com teclado aberto.

## Preparar a outra máquina (PowerShell)

Na pasta do repositório, confira se há trabalho local antes de atualizar:

```powershell
git status --short --branch
git pull --ff-only origin main
npm.cmd install
if (!(Test-Path -LiteralPath .env)) { Copy-Item -LiteralPath .env.example -Destination .env }
```

Se algum comando falhar, pare e resolva antes de continuar. Não descarte trabalho
local para forçar o pull. O comando acima preserva um .env que já exista.

Confira no .env local:

- DATABASE_URL e POSTGRES_PORT (a porta deve ser igual nos dois).
- PIX_CHAVE e PIX_RECEBEDOR.
- AUTH_TOKEN_SECRET, ADMIN_EMAIL e ADMIN_PASSWORD.
- FRETE_CEP_ORIGEM: CEP de postagem no Brasil.
- MELHOR_ENVIO_AMBIENTE=sandbox.
- MELHOR_ENVIO_TOKEN: token da conta sandbox com shipping-calculate.
- MELHOR_ENVIO_CONTATO: email de contato.

Não envie tokens para o chat/Git. Copie-os por meio privado ou configure novamente.
Nesta máquina usamos a porta 5433; na outra respeite a configuração local.

Com o Docker Desktop iniciado e .env conferido:

```powershell
npm.cmd run db:up
npm.cmd run db:deploy
npm.cmd run db:generate
npm.cmd run check
npm.cmd run build
npm.cmd run verificar:build
npm.cmd run dev
```

Abra http://localhost:3000/admin e http://localhost:3000/loja.
Health: http://localhost:3000/health.

O banco Docker e public/uploads não vão no Git. Para ter os mesmos pedidos,
clientes, produtos, senha de admin e fotos, exporte/importe o banco e copie
os uploads separadamente. Não recrie o banco existente. Um banco novo exige
configuração inicial; db:seed cria dados de exemplo, não restaura os dados daqui.

## Validações feitas antes do commit

- npm.cmd run check
- node --check nos seis scripts de public/admin e public/loja.
- npm.cmd run test:pedidos (9 testes).
- npm.cmd run test:checkout (6 testes).
- node --test tests/admin-rastreio.test.mjs (5 testes).
- npm.cmd run test:consistencia (18 testes em banco temporário local).
- npm.cmd run build e npm.cmd run verificar:build.
- git diff --check.

Todos passaram: 38 testes. Os testes de consistência removem somente o banco
aleatório que criaram; não utilizam o banco da loja para as operações de teste.

## De onde continuar

Primeiro testar a responsividade no celular ou modo dispositivo do navegador.
Depois conferir o fluxo completo de frete: selecionar entrega, criar pedido
pendente com produtos + frete, confirmar Pix de teste, salvar rastreio e marcar
enviado. Não fazer Pix real em testes. Verificar se frete e rastreio permanecem
visíveis no admin e no acompanhamento.

Manter inicialmente Pix manual, cotação automática e postagem manual.
Antes de vender de verdade, ainda é necessário revisar embalagem/medidas,
configurar credenciais de produção, verificar valores reais de frete e executar
verificar:deploy. A configuração local teve alertas de segredo/senha de exemplo;
não considerar a publicação em produção pronta. Também planejar backup e
hospedagem simples. Não avançar para emissão automática de etiquetas sem alinhar.
