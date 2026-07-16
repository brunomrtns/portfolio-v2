# Bruno Integrations — Portfolio v2

**Portfolio e plataforma de conteúdo de Bruno Martins — Software Engineer.**

Showcase de produtos (Trivestia, Avesia), stack técnica, experiência profissional e blog técnico, com painel admin para gerenciar conteúdo. SPA React com design premium, i18n em 6 idiomas e API Fastify com PostgreSQL.

---

## Quick start

```bash
# 1. Copiar env e preencher secrets
cp .env.example .env

# 2. Instalar dependências
pnpm install

# 3. Subir infraestrutura (Postgres)
pnpm docker:up          # ou: docker compose -f docker/docker-compose.dev.yml up -d

# 4. Gerar Prisma client + migrations + seed
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 5. Subir tudo (API + Web)
./dev.sh                # ou: pnpm dev
```

- **Web**: http://localhost:3103
- **API**: http://localhost:3104/api/health

**Credenciais admin demo:** definidas no `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)

---

## Estrutura do monorepo

```
portfolio-v2/
├── apps/
│   ├── api/              # Fastify REST API (Node.js, port 3104)
│   ├── web/              # React + Vite SPA (port 3103)
│   └── (sem worker)
├── packages/
│   ├── shared/           # Helpers, bcrypt, validações Zod
│   └── types/            # Tipos TypeScript compartilhados
├── docker/
│   ├── docker-compose.yml         # Stack de produção (API + Web + Postgres)
│   ├── docker-compose.dev.yml     # Apenas Postgres para dev
│   └── portfolio-nginx.conf       # Fragmento de config nginx para produção
├── scripts/
│   ├── deploy.sh                  # Deploy para VPS (rsync + Docker + nginx)
│   └── update-portfolio-nginx.py  # Injeção idempotente de rotas no trivestia-nginx
├── dev.sh               # Script conveniente para dev
└── turbo.json
```

---

## Arquitetura

```
                    ┌─────────────────┐
                    │   Web (React)   │
                    │   port 3103     │
                    └────────┬────────┘
                             │ HTTP
                    ┌────────▼────────┐
                    │  API (Fastify)  │
                    │  port 3104      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  PostgreSQL 16  │
                    └─────────────────┘
```

### Backend (`apps/api` — Node.js/Fastify)

- **Fastify** + **Prisma ORM** (PostgreSQL)
- **JWT auth** com bcrypt, middleware de proteção de rotas admin
- Rate limiting, helmet, CORS
- **Rotas**:
  - `GET /api/health` — health check
  - `POST /api/auth/login` — autenticação admin
  - `GET /api/auth/me` — perfil do usuário logado
  - `GET /api/products` — lista de produtos públicos
  - `GET /api/skills` — stack técnica
  - `GET /api/experience` — experiência profissional
  - `GET /api/articles` — lista de artigos do blog
  - `GET /api/articles/:slug` — artigo por slug
  - `GET /api/categories` — categorias do blog
  - `POST /api/contact` — envio de mensagem de contato
  - `POST /api/admin/...` — CRUD de produtos, artigos, skills, experiência (protegido)

### Frontend (`apps/web` — React + Vite)

- **React 19** + **Vite** + **TypeScript**
- **Tailwind CSS v4** — design system com tokens semânticos
- **Framer Motion** + **GSAP** — animações e motion design cinematográfico
- **TanStack Query v5** — server state
- **react-hook-form** + **zod** — validação de formulários
- **react-markdown** — renderização de artigos
- **i18next** + **easy-translate-i18n** — 6 idiomas (pt-BR, en, es, de, fr, ja)
- **Lenis** — smooth scroll

#### Design system — "Premium Dark"

- **Dark-first** com superfícies quentes (não azul-frio)
- **Tipografia**: Inter (UI) + JetBrains Mono (código/dados)
- **Motion**: parallax multi-camada, word-by-word reveal, magnetic CTAs, stagger
- **Glassmorphism**: `.glass`, `.glass-strong` para profundidade
- **Gradient text**: `.text-gradient` para destaques
- **Section transitions**: `SectionTransition` component entre seções

#### Páginas

- `/` — Landing page (Hero, Sobre, Produtos, Stack, Experiência, Formação, Contato)
- `/portfolio/blog` — Lista de artigos
- `/portfolio/blog/:slug` — Artigo individual (markdown render)
- `/portfolio/panel` — Painel admin (login + CRUD)

---

## Internacionalização (i18n)

6 idiomas suportados via `easy-translate-i18n`:

| Idioma | Código | Arquivo |
|--------|--------|---------|
| Português (BR) | `pt-BR` | `src/i18n/locales/pt-BR.json` (fonte) |
| Inglês | `en` | `src/i18n/locales/en.json` |
| Espanhol | `es` | `src/i18n/locales/es.json` |
| Alemão | `de` | `src/i18n/locales/de.json` |
| Francês | `fr` | `src/i18n/locales/fr.json` |
| Japonês | `ja` | `src/i18n/locales/ja.json` |

**Workflow:**

1. Editar strings em `pt-BR.json` (idioma fonte)
2. Rodar `npx easy-translate-i18n` para gerar traduções automáticas
3. Revisar traduções manualmente quando necessário

O idioma é detectado automaticamente (browser) e pode ser trocado via switcher na navbar.

---

## Deploy para produção

O deploy é feito via `scripts/deploy.sh` para a VPS onde `brunointegrations.com` já roda o `trivestia-nginx` (reverse proxy principal).

### Arquitetura de produção

```
                    ┌──────────────────────┐
                    │  trivestia-nginx     │
                    │  (ports 80/443)      │
                    │  brunointegrations.com│
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     /        │  /portfolio/   │  /portfolio/api/
     │        │  (SPA)         │  (API)
     ▼        ▼                ▼
  portfolio-web        portfolio-api
  (nginx interno)      (Fastify, port 3104)
                              │
                              ▼
                      portfolio-postgres
                      (PostgreSQL 16)
```

### Rotas públicas

| URL | Descrição |
|-----|-----------|
| `https://brunointegrations.com/` | Portfolio landing page |
| `https://brunointegrations.com/portfolio/blog` | Blog |
| `https://brunointegrations.com/portfolio/blog/:slug` | Artigo |
| `https://brunointegrations.com/portfolio/panel` | Painel admin |
| `https://brunointegrations.com/portfolio/api/health` | API health check |

### Comandos de deploy

```bash
# Deploy completo (build + compose + nginx + smoke test + bump versão)
./scripts/deploy.sh

# Deploy sem bump de versão (para testes)
./scripts/deploy.sh --no-commit

# Deploy com auto-commit (se working tree não estiver limpa)
./scripts/deploy.sh --auto-commit

# Só buildar as imagens (não sobe containers)
./scripts/deploy.sh --build-only

# Só rodar migrations
./scripts/deploy.sh --migrate-only

# Bump de versão específico
./scripts/deploy.sh --bump minor    # patch (default) | minor | major
```

### O que o deploy faz

1. Verifica working tree limpa (ou commita com `--auto-commit`)
2. Cria tag de rollback (`pre-deploy-*`)
3. Sincroniza código para `/opt/portfolio` na VPS (rsync)
4. Sincroniza `.env.prod` e `docker-compose.yml`
5. Builda imagens Docker na VPS (`portfolio-api`, `portfolio-web`)
6. Sobe a stack com `docker compose up -d`
7. Roda Prisma migrations + seed
8. Injeta rotas do portfolio no `trivestia-nginx` (idempotente via `nginx.conf.clean`)
9. Reinicia `trivestia-nginx`
10. Smoke test (API interna, Web interna, homepage pública, API pública)
11. Se OK: bump de versão + commit + tag `vX.Y.Z` + push para GitHub

### Pré-requisitos de deploy

- `my-vps` instalado e configurado
- Docker + Docker Compose na VPS
- `.env.prod` com as variáveis de produção
- `trivestia-nginx` rodando na VPS
- Rede Docker `trivestia-net` existente
- `nginx.conf.clean` em `/opt/trivestia/nginx/` (base sem rotas do portfolio)

### Rollback

```bash
# Voltar para uma versão anterior
git checkout <tag-ou-commit>
./scripts/deploy.sh --no-build    # usa imagens já buildadas

# Ou restaurar nginx.conf do backup
my-vps "cp /opt/trivestia/nginx/nginx.conf.bak.portfolio.<timestamp> /opt/trivestia/nginx/nginx.conf"
my-vps "docker restart trivestia-nginx"
```

---

## Environment variables

Veja `.env.example` para a lista completa. Variáveis principais:

| Variável | Default | Descrição |
|----------|---------|-----------|
| `POSTGRES_USER` | `portfolio` | Usuário do PostgreSQL |
| `POSTGRES_PASSWORD` | — | Senha do PostgreSQL (obrigatório) |
| `POSTGRES_DB` | `portfolio` | Nome do banco |
| `JWT_SECRET` | — | Secret para JWT (obrigatório, mínimo 32 chars) |
| `CORS_ORIGIN` | `https://brunointegrations.com` | Origem permitida para CORS |
| `ADMIN_EMAIL` | — | Email do admin inicial (seed) |
| `ADMIN_PASSWORD` | — | Senha do admin inicial (seed) |

---

## Comandos úteis

| Comando | Descrição |
|---------|-----------|
| `./dev.sh` | Subir ambiente de dev completo |
| `pnpm dev` | Subir apenas API + Web (turbo) |
| `pnpm build` | Buildar todos os pacotes |
| `pnpm typecheck` | Typecheck de todos os pacotes |
| `pnpm db:generate` | Regenerar Prisma client |
| `pnpm db:migrate` | Rodar Prisma migrations (dev) |
| `pnpm db:seed` | Seed do banco |
| `npx easy-translate-i18n` | Gerar traduções i18n |
| `./scripts/deploy.sh` | Deploy para produção |

---

## Tech stack

**Backend:** Node.js 22, Fastify 5, Prisma 6, PostgreSQL 16, JWT, bcrypt, Zod

**Frontend:** React 19, Vite 6, TypeScript 5, Tailwind CSS v4, Framer Motion, GSAP, TanStack Query 5, i18next, Lenis, react-markdown

**Infra:** Docker, Docker Compose, Nginx, pnpm workspaces, Turborepo

---

## Licença

UNLICENSED — uso privado.
