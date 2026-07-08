#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Deploy do Portfolio v2 para a VPS
#
# Uso:  ./deploy.sh [--build-only] [--no-build] [--migrate-only] [--no-commit]
#                   [--auto-commit] [--bump patch|minor|major]
#
# O que faz:
#   0. Verifica working tree limpa (ou commita automaticamente)
#   1. Sincroniza o código para /opt/portfolio na VPS (via rsync)
#   2. Sincroniza .env.prod e docker-compose.yml
#   3. Builda as 2 imagens Docker na VPS (api, web)
#   4. Sobe a stack com docker compose
#   5. Roda Prisma migrations + seed
#   6. Atualiza nginx do trivestia-nginx com rotas do portfolio
#   7. Reinicia trivestia-nginx
#   8. Smoke test (API + Web + homepage)
#   9. Se OK: bump de versão + commit + tag vX.Y.Z + push
#
# Versionamento (semver):
#   --bump patch  (default) — bug fixes, pequenas mudanças
#   --bump minor          — novas features, backward compatible
#   --bump major          — breaking changes
#
# Pré-requisitos:
#   - my-vps instalado e configurado
#   - Docker + Docker Compose na VPS
#   - .env.prod com as variáveis de produção
#   - trivestia-nginx rodando na VPS (reverse proxy principal)
#   - rede Docker trivestia-net existente
# =============================================================================

set -euo pipefail

# ── Config ───────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"
VPS_PATH="/opt/portfolio"
NGINX_CONF_PATH="/opt/trivestia/nginx/nginx.conf"

# ── Verificar my-vps ─────────────────────────────────────────────────────────
if ! command -v my-vps &>/dev/null; then
  echo -e "\033[1;31m  ✗\033[0m 'my-vps' não encontrado. Instale my-vps antes de fazer deploy." >&2
  exit 1
fi

# Helper: executar comando remoto na VPS via my-vps
vps() {
  my-vps --no-lock "$@"
}

# Helper: copiar arquivo local para VPS via my-vps
vps_cp() {
  my-vps --no-lock --scp "$1" "$2"
}

log() { echo -e "\033[1;34m[deploy]\033[0m $*"; }
ok()  { echo -e "\033[1;32m  ✓\033[0m $*"; }
err() { echo -e "\033[1;31m  ✗\033[0m $*" >&2; }

# ── Argumentos ───────────────────────────────────────────────────────────────
BUILD_ONLY=0
NO_BUILD=0
MIGRATE_ONLY=0
NO_COMMIT=0
AUTO_COMMIT=0
BUMP="patch"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --build-only)   BUILD_ONLY=1;  shift ;;
    --no-build)     NO_BUILD=1;    shift ;;
    --migrate-only) MIGRATE_ONLY=1; shift ;;
    --no-commit)    NO_COMMIT=1;   shift ;;
    --auto-commit)  AUTO_COMMIT=1; shift ;;
    --bump)         BUMP="$2";     shift 2 ;;
    -h|--help)
      echo "Uso: ./deploy.sh [opções]"
      echo ""
      echo "  --build-only       Só builda as imagens, não sobe containers"
      echo "  --no-build         Pula o build (usa imagens existentes)"
      echo "  --migrate-only     Só roda migrations"
      echo "  --no-commit        Não commita/bumpa versão após deploy"
      echo "  --auto-commit      Commita mudanças não-commitadas antes do deploy"
      echo "  --bump patch|minor|major  Tipo de bump (default: patch)"
      exit 0
      ;;
    *) echo "Argumento desconhecido: $1"; exit 1 ;;
  esac
done

# ── Helpers de versionamento ─────────────────────────────────────────────────

get_version() {
  node -p "require('./package.json').version"
}

bump_version() {
  local current="$1" type="$2"
  local major minor patch
  IFS='.' read -r major minor patch <<< "$current"
  case "$type" in
    major)  major=$((major + 1)); minor=0; patch=0 ;;
    minor)  minor=$((minor + 1)); patch=0 ;;
    patch)  patch=$((patch + 1)) ;;
  esac
  echo "${major}.${minor}.${patch}"
}

# ── Helper: buildar imagem e abortar se falhar ────────────────────────────────
build_image() {
  local name="$1" dockerfile="$2"
  log "  Buildando $name..."
  local log_file
  log_file=$(mktemp)
  local exit_code=0
  vps "cd $VPS_PATH && docker build -f $dockerfile -t $name:latest . 2>&1; echo \"EXIT_CODE=\$?\"" > "$log_file" 2>&1 || exit_code=$?

  local remote_exit
  remote_exit=$(grep -oP 'EXIT_CODE=\K[0-9]+' "$log_file" | tail -1)
  rm -f "$log_file"

  if [[ "$exit_code" -ne 0 || "$remote_exit" != "0" ]]; then
    err "$name FALHOU no build (exit: ${remote_exit:-$exit_code})"
    err "Rode manualmente para ver o log completo:"
    err "  my-vps \"cd $VPS_PATH && docker build -f $dockerfile -t $name:latest .\""
    exit 1
  fi
  ok "$name buildada"
}

# ── Step 0: Verificar working tree ───────────────────────────────────────────
log "Verificando pré-requisitos..."

if [[ "$MIGRATE_ONLY" -eq 0 ]]; then
  if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
    if [[ "$AUTO_COMMIT" -eq 1 ]]; then

      # ── Safety: block sensitive files ──────────────────────────────────────
      SENSITIVE=$(git status --porcelain | awk '{print $2}' | grep -iE '\.env($|\.|[^.])|secret|\.pem|\.key|id_rsa|id_ed25519|credentials|\.p12|\.pfx|PLAN\.md' || true)
      if [[ -n "$SENSITIVE" ]]; then
        err "Arquivos sensíveis detectados — auto-commit abortado:"
        echo "$SENSITIVE" | sed 's/^/    /'
        echo ""
        echo "  Commite manualmente após revisar:"
        echo "    git add -A && git commit -m 'sua mensagem'"
        exit 1
      fi

      CHANGED_FILES=$(git status --porcelain | awk '{print $2}')
      CHANGES=$(echo "$CHANGED_FILES" | wc -l)
      log "Auto-commitando $CHANGES arquivo(s) modificado(s)..."
      git add -A
      git commit -m "chore: pre-deploy auto-commit"
      ok "Mudanças commitadas"
    else
      err "Working tree não está limpa. Commite suas mudanças antes do deploy."
      echo ""
      git status --short
      echo ""
      echo "  Ou use --auto-commit:"
      echo "    ./deploy.sh --auto-commit"
      exit 1
    fi
  else
    ok "Working tree limpa"
  fi
fi

# Versão atual
CURRENT_VERSION=$(get_version)
log "Versão atual: v$CURRENT_VERSION"

# Criar tag de rollback
DEPLOY_TAG="pre-deploy-$(date +%Y%m%d-%H%M%S)"
if git rev-parse --git-dir &>/dev/null; then
  git tag "$DEPLOY_TAG" 2>/dev/null && ok "Tag de rollback criada: $DEPLOY_TAG" || true
fi

if [[ ! -f "$PROJECT_ROOT/.env.prod" ]]; then
  err ".env.prod não encontrado em $PROJECT_ROOT"
  exit 1
fi

if [[ ! -f "$PROJECT_ROOT/docker/docker-compose.yml" ]]; then
  err "docker-compose.yml não encontrado em docker/"
  exit 1
fi

# Verificar conectividade com VPS
if ! vps "echo ok" &>/dev/null; then
  err "Não foi possível conectar à VPS via my-vps"
  exit 1
fi
ok "Conexão com VPS OK (via my-vps)"

# Verificar se a rede trivestia-net existe
TRIVESTIA_NET=$(vps "docker network ls --filter name=trivestia-net --format '{{.Name}}' 2>&1" || echo "")
if [[ "$TRIVESTIA_NET" != "trivestia-net" ]]; then
  err "Rede Docker 'trivestia-net' não encontrada na VPS"
  err "A rede trivestia-net é necessária para que o trivestia-nginx possa"
  err "fazer proxy para os containers do portfolio."
  exit 1
fi
ok "Rede trivestia-net OK"

# ── Migrate only ─────────────────────────────────────────────────────────────
if [[ "$MIGRATE_ONLY" -eq 1 ]]; then
  log "Modo: migrations apenas"
  POSTGRES_USER=$(grep '^POSTGRES_USER=' "$PROJECT_ROOT/.env.prod" | cut -d= -f2-)
  POSTGRES_PASSWORD=$(grep '^POSTGRES_PASSWORD=' "$PROJECT_ROOT/.env.prod" | cut -d= -f2-)
  POSTGRES_DB=$(grep '^POSTGRES_DB=' "$PROJECT_ROOT/.env.prod" | cut -d= -f2-)
  vps "docker run --rm --network portfolio-net \
    -e DATABASE_URL='postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@portfolio-postgres:5432/${POSTGRES_DB}?schema=public' \
    -v $VPS_PATH/apps/api/prisma:/app/apps/api/prisma:ro \
    -w /app/apps/api portfolio-api:latest \
    sh -c 'node \$(find /app/node_modules/.pnpm -path \"*/prisma/build/index.js\" | head -1) migrate deploy' 2>&1"
  ok "Migrations aplicadas"
  exit 0
fi

# ── Step 1: Sincronizar código ───────────────────────────────────────────────
log "Step 1/8: Sincronizando código para VPS..."

vps "mkdir -p $VPS_PATH/{apps/api/prisma,apps/web/src,packages,docker,scripts}"

RSYNC_EXCLUDES="--exclude=.git --exclude=node_modules --exclude=**/node_modules --exclude=**/dist --exclude=**/.turbo --exclude=**/coverage --exclude=**/__pycache__ --exclude='**/*.tsbuildinfo' --exclude=.env --exclude=.env.local --exclude=.env.prod --exclude=.turbo --exclude=PLAN.md --exclude=.devin --exclude=.claude --exclude='*.log' --exclude=test-results"

if command -v rsync &>/dev/null; then
  my-vps --no-lock --rsync "$PROJECT_ROOT/" "$VPS_PATH/" --rsync-args "$RSYNC_EXCLUDES --delete" 2>&1 || {
    log "rsync falhou — usando tar"
    tar czf - --exclude='.git' --exclude='node_modules' --exclude='**/node_modules' \
      --exclude='**/dist' --exclude='**/.turbo' --exclude='**/*.tsbuildinfo' \
      --exclude='.env' --exclude='.env.local' --exclude='.env.prod' \
      --exclude='PLAN.md' --exclude='.devin' --exclude='.claude' --exclude='*.log' \
      -C "$PROJECT_ROOT" . | my-vps --no-lock "tar xzf - -C $VPS_PATH"
  }
  ok "Código sincronizado via rsync"
else
  log "rsync não disponível — usando tar"
  tar czf - --exclude='.git' --exclude='node_modules' --exclude='**/node_modules' \
    --exclude='**/dist' --exclude='**/.turbo' --exclude='**/*.tsbuildinfo' \
    --exclude='.env' --exclude='.env.local' --exclude='.env.prod' \
    --exclude='PLAN.md' --exclude='.devin' --exclude='.claude' --exclude='*.log' \
    -C "$PROJECT_ROOT" . | my-vps --no-lock "tar xzf - -C $VPS_PATH"
  ok "Código sincronizado via tar"
fi

# ── Step 2: Sincronizar .env + docker-compose ────────────────────────────────
log "Step 2/8: Sincronizando .env e docker-compose..."
vps_cp "$PROJECT_ROOT/.env.prod" "$VPS_PATH/.env"
vps_cp "$PROJECT_ROOT/docker/docker-compose.yml" "$VPS_PATH/docker-compose.yml"
ok "Config sincronizada"

# ── Step 3: Build das imagens ────────────────────────────────────────────────
if [[ "$NO_BUILD" -eq 0 ]]; then
  log "Step 3/8: Buildando imagens Docker na VPS..."

  build_image "portfolio-api" "apps/api/Dockerfile"
  build_image "portfolio-web" "apps/web/Dockerfile"
else
  log "Step 3/8: Build pulado (--no-build)"
fi

if [[ "$BUILD_ONLY" -eq 1 ]]; then
  log "Modo build-only — containers não serão reiniciados"
  exit 0
fi

# ── Step 4: Subir a stack ────────────────────────────────────────────────────
log "Step 4/8: Subindo stack com docker compose..."
COMPOSE_LOG=$(mktemp)
COMPOSE_EXIT=0
vps "cd $VPS_PATH && docker compose -f docker-compose.yml up -d 2>&1; echo \"EXIT_CODE=\$?\"" > "$COMPOSE_LOG" 2>&1 || COMPOSE_EXIT=$?
COMPOSE_REMOTE_EXIT=$(grep -oP 'EXIT_CODE=\K[0-9]+' "$COMPOSE_LOG" | tail -1)
tail -20 "$COMPOSE_LOG"
rm -f "$COMPOSE_LOG"
if [[ "$COMPOSE_EXIT" -ne 0 || "$COMPOSE_REMOTE_EXIT" != "0" ]]; then
  err "docker compose up FALHOU (exit: ${COMPOSE_REMOTE_EXIT:-$COMPOSE_EXIT})"
  exit 1
fi
ok "Stack iniciada"

# ── Step 5: Migrations + Seed ────────────────────────────────────────────────
log "Step 5/8: Rodando Prisma migrations + seed..."

POSTGRES_USER=$(grep '^POSTGRES_USER=' "$PROJECT_ROOT/.env.prod" | cut -d= -f2-)
POSTGRES_PASSWORD=$(grep '^POSTGRES_PASSWORD=' "$PROJECT_ROOT/.env.prod" | cut -d= -f2-)
POSTGRES_DB=$(grep '^POSTGRES_DB=' "$PROJECT_ROOT/.env.prod" | cut -d= -f2-)

vps "docker run --rm --network portfolio-net \
  -e DATABASE_URL='postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@portfolio-postgres:5432/${POSTGRES_DB}?schema=public' \
  -e ADMIN_EMAIL='$(grep '^ADMIN_EMAIL=' "$PROJECT_ROOT/.env.prod" | cut -d= -f2-)' \
  -e ADMIN_PASSWORD='$(grep '^ADMIN_PASSWORD=' "$PROJECT_ROOT/.env.prod" | cut -d= -f2-)' \
  -v $VPS_PATH/apps/api/prisma:/app/apps/api/prisma:ro \
  -w /app/apps/api portfolio-api:latest \
  sh -c 'node \$(find /app/node_modules/.pnpm -path \"*/prisma/build/index.js\" | head -1) migrate deploy && node dist/seeds/index.js' 2>&1"
ok "Migrations + seed aplicados"

# ── Step 6: Atualizar nginx do trivestia-nginx ───────────────────────────────
log "Step 6/8: Atualizando nginx com rotas do portfolio..."

# Enviar o script Python para a VPS
vps_cp "$PROJECT_ROOT/scripts/update-portfolio-nginx.py" "$VPS_PATH/scripts/update-portfolio-nginx.py"

# Executar o script na VPS
vps "python3 $VPS_PATH/scripts/update-portfolio-nginx.py 2>&1"
ok "Nginx config atualizado"

# ── Step 7: Reiniciar trivestia-nginx ────────────────────────────────────────
log "Step 7/8: Reiniciando trivestia-nginx..."
vps "docker restart trivestia-nginx 2>&1"
ok "trivestia-nginx reiniciado"

# ── Step 8: Smoke test ───────────────────────────────────────────────────────
log "Step 8/8: Smoke test..."

log "  Aguardando containers (20s)..."
sleep 20

log "  Status dos containers:"
vps "cd $VPS_PATH && docker compose -f docker-compose.yml ps --format 'table {{.Name}}\t{{.Status}}' 2>&1"

# Verificar API health (interna)
log "  Verificando API health (interna)..."
API_HEALTH=$(vps "docker exec portfolio-api wget -qO- http://127.0.0.1:3104/api/health 2>&1" || echo "FAIL")
API_OK=0
if [[ "$API_HEALTH" != "FAIL" ]]; then
  ok "API respondendo (interna): $API_HEALTH"
  API_OK=1
else
  err "API não respondeu (interna)"
fi

# Verificar Web (interna)
log "  Verificando Web (interna)..."
WEB_STATUS=$(vps "docker exec portfolio-web wget -qO /dev/null -S http://127.0.0.1:80 2>&1 | head -1" || echo "FAIL")
WEB_OK=0
if [[ "$WEB_STATUS" != "FAIL" ]]; then
  ok "Web respondendo (interna)"
  WEB_OK=1
else
  err "Web não respondeu (interna)"
fi

# Verificar homepage pública
log "  Verificando homepage pública..."
HOMEPAGE_STATUS=$(curl -sf --max-time 10 -o /dev/null -w "%{http_code}" https://brunointegrations.com/ 2>&1 || echo "FAIL")
HOMEPAGE_OK=0
if [[ "$HOMEPAGE_STATUS" == "200" ]]; then
  ok "Homepage pública respondendo (HTTP 200)"
  HOMEPAGE_OK=1
else
  err "Homepage pública não respondeu (status: $HOMEPAGE_STATUS)"
fi

# Verificar API pública
log "  Verificando API pública..."
API_PUBLIC=$(curl -sf --max-time 10 https://brunointegrations.com/portfolio/api/health 2>&1 || echo "FAIL")
API_PUBLIC_OK=0
if [[ "$API_PUBLIC" != "FAIL" ]]; then
  ok "API pública respondendo: $API_PUBLIC"
  API_PUBLIC_OK=1
else
  err "API pública não respondeu"
fi

# ── Step 9: Versionamento + commit + tag + push ──────────────────────────────
if [[ "$NO_COMMIT" -eq 1 ]]; then
  log "Versionamento pulado (--no-commit)"
else
  if [[ "$API_OK" -eq 1 && "$WEB_OK" -eq 1 && "$HOMEPAGE_OK" -eq 1 ]]; then
    NEW_VERSION=$(bump_version "$CURRENT_VERSION" "$BUMP")

    # Atualizar package.json
    node -e "
      const fs = require('fs');
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      pkg.version = '$NEW_VERSION';
      fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    "

    git add package.json
    git commit -m "chore: bump versão v$NEW_VERSION

Deploy: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Rollback: $DEPLOY_TAG"

    git tag "v$NEW_VERSION"
    ok "Versão bumpada: v$CURRENT_VERSION → v$NEW_VERSION"

    git push origin main 2>/dev/null && ok "Commits enviados" || err "Falha ao pushar commits"
    git push origin "v$NEW_VERSION" 2>/dev/null && ok "Tag v$NEW_VERSION enviada" || err "Falha ao pushar tag"
  else
    err "Smoke test falhou — versão não bumpada"
    err "Para rollback: git checkout $DEPLOY_TAG && ./deploy.sh --no-build"
  fi
fi

# ── Resumo final ─────────────────────────────────────────────────────────────
echo ""
log "═══════════════════════════════════════════════════════════════"
if [[ "$NO_COMMIT" -eq 0 && "${API_OK:-0}" -eq 1 && "${WEB_OK:-0}" -eq 1 && "${HOMEPAGE_OK:-0}" -eq 1 ]]; then
  log "  Deploy concluído! — v$NEW_VERSION"
  log "  URL: https://brunointegrations.com/"
  log "  Admin: https://brunointegrations.com/portfolio/panel"
  log "  Blog: https://brunointegrations.com/portfolio/blog"
  log "  API: https://brunointegrations.com/portfolio/api/health"
  log "  Tag: v$NEW_VERSION"
  log "  Rollback: $DEPLOY_TAG"
else
  log "  Deploy concluído (com warnings)"
  log "  URL: https://brunointegrations.com/"
  log "  Admin: https://brunointegrations.com/portfolio/panel"
fi
log "═══════════════════════════════════════════════════════════════"
