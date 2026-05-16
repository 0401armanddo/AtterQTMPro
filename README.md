# Átter QTM Pro

Sistema de controle de qualidade de concreto para obras — NBR 5739:2018, NBR 12655:2022, NBR 6118:2023.

## Pré-requisitos

- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para o banco de dados PostgreSQL)

## Como executar localmente

Abra **três terminais** separados:

### Terminal 1 — Banco de dados (PostgreSQL via Docker)

```bash
docker compose up -d
```

> Aguarde aparecer `postgres  | ... database system is ready to accept connections`

### Terminal 2 — API (Node.js + Fastify)

```bash
cd api
cp .env.example .env        # cria o .env com os valores padrão
npm install
npm run db:push             # cria as tabelas no banco
npm run db:seed             # cria o usuário admin padrão
npm run dev                 # inicia a API em http://localhost:3000
```

### Terminal 3 — Frontend (React + Vite)

```bash
cp .env.example .env        # cria o .env com VITE_API_URL
npm install
npm run dev                 # inicia o app em http://localhost:5173
```

### Acesso

Abra o navegador em: **http://localhost:5173**

| Campo | Valor |
|---|---|
| E-mail | `admin@atterqtm.com` |
| Senha | `admin123` |

---

## Variáveis de ambiente

### `api/.env`

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/atterqtmpro"
JWT_SECRET="troque-esta-chave-em-producao"
PORT=3000
```

### `.env` (raiz — frontend)

```env
VITE_API_URL=http://localhost:3000
```

---

## Scripts disponíveis

### Frontend (raiz)

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |

### API (`api/`)

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia a API com hot-reload |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm run start` | Executa o build compilado |
| `npm run db:push` | Sincroniza o schema Prisma com o banco |
| `npm run db:migrate` | Cria uma migration de produção |
| `npm run db:seed` | Insere os dados iniciais |
| `npm run db:studio` | Abre o Prisma Studio (UI do banco) |

---

## Funcionalidades

- **Autenticação JWT** — login, registro, controle por papel (Admin / Técnico / Visualizador)
- **Obras** — cadastro completo com fck de projeto, CREA, CNO, ART
- **Fornecimentos** — nota fiscal, slump, temperatura, central de concretagem
- **Amostras e Corpos de Prova** — moldagem, identificação, idades de ensaio
- **Ensaios** — registro de carga de ruptura com cálculo automático de resistência (fc = 4F/πD²)
- **Dashboard** — KPIs, gráfico de evolução, carta de controle Shewhart, histograma, pizza de conformidade
- **Ensaios Pendentes** — agenda com código de urgência por prazo
- **Relatórios** — exportação CSV e laudo PDF conforme NBR (html2canvas + jsPDF)
- **fck,est automático** — Método 1 (n<6): 2×fcm − fcmax · Método 2 (n≥6): fcm − 1,65×s

---

## Tecnologias

**Frontend:** React 18 · TypeScript · Vite · TailwindCSS v4 · React Router v6 · TanStack Query v5 · Recharts v3 · React Hook Form + Zod · jsPDF + html2canvas

**Backend:** Node.js · Fastify 5 · Prisma 6 · PostgreSQL 16 · bcryptjs · JWT
