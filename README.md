# VanEscolar

Plataforma de gestão de transporte escolar para uma única empresa.

## Requisitos

- Node.js 20+
- PostgreSQL (o ambiente de produção utiliza Neon)

## Instalação e ambiente

```bash
npm install
cp .env.example .env
```

Preencha `DATABASE_URL` com a URL PostgreSQL fornecida pelo Neon e use um `JWT_SECRET` aleatório com ao menos 32 caracteres. Nenhum segredo deve ser versionado.

## Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
```

`prisma:migrate` aplica migrations incrementais já versionadas, sem resetar o banco.

## Desenvolvimento

```bash
npm run dev -w @vanescolar/api
npm run dev -w @vanescolar/web
```

A API usa `http://localhost:3000` e a aplicação web, `http://localhost:5173`.

## Deploy no Render e CORS

O cliente usa exclusivamente `VITE_API_URL` como configuração pública da API. O backend aceita cookies de sessão somente para a allowlist explícita de `FRONTEND_URLS`; não use curingas. Em serviços separados do Render, o cookie é `HttpOnly`, `Secure` e `SameSite=None`. Em desenvolvimento ele é `SameSite=Lax` sem `Secure`.

Configure o **Web Service (backend)** com:

```env
NODE_ENV=production
DATABASE_URL=<conexão PostgreSQL>
JWT_SECRET=<segredo aleatório com ao menos 32 caracteres>
FRONTEND_URLS=https://vanapp-front.onrender.com
```

`PORT` é fornecida pelo Render. Configure o **Static Site (frontend)** no momento do build com:

```env
VITE_API_URL=https://vanapp-36s4.onrender.com
```

Depois de mudar `VITE_API_URL`, é necessário um novo build do frontend. `GET /health` pode ser usado como health check do backend. As migrations são aplicadas com `npm run prisma:migrate` e nunca executam seed de demonstração em produção.

## Módulo financeiro

O financeiro persiste valores em centavos inteiros e oferece lançamentos paginados, receitas, despesas, parcelamento, pagamentos parciais idempotentes, cancelamento auditado, mensalidades geradas automaticamente, abastecimentos vinculados ao veículo, inadimplência, indicadores e projeção de caixa. Todos os endpoints exigem sessão e filtram lançamentos pelo proprietário autenticado.

O cadastro atual é explicitamente de empresa única e ainda não possui entidades de rotas, escolas, manutenção, perfis/permissões ou infraestrutura de upload. Por isso, rentabilidade por rota, integração automática de manutenção, anexos e fechamento mensal por permissão dependem primeiro da implementação desses domínios; o financeiro não cria cópias artificiais dessas entidades.

## Qualidade e build

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
