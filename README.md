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

## Qualidade e build

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
