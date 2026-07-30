#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# dev.sh — Portfolio v2 Development Environment Bootstrap
#
# Usage:  ./dev.sh
#
# Steps:
#   1. Check prerequisites (node, pnpm, docker)
#   2. Ensure .env exists
#   3. Start infra (postgres)
#   4. Wait for healthcheck
#   5. Install dependencies
#   6. Build shared packages (types, shared)
#   7. Run migrations + seed
#   8. Open separate terminals for each dev service (API, Web)
#
# The main script finishes after setup. Each service runs in its own terminal
# window so logs are visible and errors don't get lost.
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

# ── Colors ─────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_step() { echo -e "\n${CYAN}═══ $* ═══${NC}"; }
log_ok()   { echo -e "${GREEN}[✓]${NC} $*"; }
log_fail() { echo -e "${RED}[✗]${NC} $*" >&2; exit 1; }
log_warn() { echo -e "${YELLOW}[!]${NC} $*"; }

# ── Helper: check command exists ──────────────────────────────────────────────
check_command() {
    local cmd="$1"
    local label="${2:-$1}"
    if command -v "${cmd}" &>/dev/null; then
        log_ok "${label} found: $(command -v "${cmd}")"
    else
        log_fail "${label} is required but not found in PATH."
    fi
}

# ── Helper: wait for docker service health ────────────────────────────────────
wait_for_health() {
    local service="$1"
    local label="${2:-$1}"
    local max_wait=60
    local elapsed=0

    # Get the actual container name (docker compose may prefix with project name)
    local container
    container=$(docker compose -f "${DEV_COMPOSE:-docker/docker-compose.dev.yml}" ps -q "${service}" 2>/dev/null || echo "")

    if [[ -z "${container}" ]]; then
        # Fallback: try docker ps by name pattern
        container=$(docker ps -q --filter "name=${service}")
    fi

    printf "  Waiting for %s to become healthy" "${label}"
    while true; do
        local health
        health=$(docker inspect --format '{{.State.Health.Status}}' "${container}" 2>/dev/null || echo "")
        if [[ "${health}" == "healthy" ]]; then
            echo ""
            log_ok "${label} is healthy"
            return
        fi
        printf "."
        sleep 2
        elapsed=$((elapsed + 2))
        if [[ ${elapsed} -ge ${max_wait} ]]; then
            echo ""
            log_fail "Timeout waiting for ${label} (>${max_wait}s). Check: docker logs ${container}"
        fi
    done
}

# ── Helper: detect terminal emulator ──────────────────────────────────────────
detect_terminal() {
    if command -v konsole &>/dev/null; then
        TERM_CMD=(konsole --new-tab --hold --workdir "${SCRIPT_DIR}")
        log_ok "Terminal: konsole (KDE)"
        return
    fi

    if command -v gnome-terminal &>/dev/null; then
        TERM_CMD=(gnome-terminal --tab --working-directory="${SCRIPT_DIR}")
        log_ok "Terminal: gnome-terminal"
        return
    fi

    if command -v terminator &>/dev/null; then
        TERM_CMD=(terminator --new-tab --working-directory="${SCRIPT_DIR}")
        log_ok "Terminal: terminator"
        return
    fi

    if command -v xterm &>/dev/null; then
        TERM_CMD=(xterm -e "cd ${SCRIPT_DIR} &&")
        log_ok "Terminal: xterm"
        return
    fi

    if command -v tmux &>/dev/null; then
        TERM_CMD=(_tmux_new_window)
        log_ok "Terminal: tmux (no graphical emulator found)"
        return
    fi

    log_fail "No terminal emulator found. Install konsole, gnome-terminal, or tmux."
}

_tmux_new_window() {
    local title="$1"
    shift
    local cmd="$*"

    if ! tmux has-session -t portfolio 2>/dev/null; then
        tmux new-session -d -s portfolio -n "main"
    fi

    tmux new-window -t portfolio -n "${title}" "${cmd}; bash"
}

# ── Helper: open a terminal tab/window for a service ──────────────────────────
open_service_term() {
    local title="$1"
    local cmd="$2"

    if [[ "${TERM_CMD[0]}" == "_tmux_new_window" ]]; then
        "${TERM_CMD[@]}" "${title}" "${cmd}"
    elif [[ "${TERM_CMD[0]}" == "xterm" ]]; then
        "${TERM_CMD[@]}" "${cmd}; exec bash" &
    else
        if [[ "${TERM_CMD[0]}" == "konsole" ]]; then
            konsole --new-tab --hold --workdir "${SCRIPT_DIR}" -p tabtitle="${title}" -e bash -lc "${cmd}" &
        elif [[ "${TERM_CMD[0]}" == "gnome-terminal" ]]; then
            gnome-terminal --tab --working-directory="${SCRIPT_DIR}" --title="${title}" -- bash -lc "${cmd}" &
        elif [[ "${TERM_CMD[0]}" == "terminator" ]]; then
            terminator --new-tab --working-directory="${SCRIPT_DIR}" --title="${title}" -e "bash -lc '${cmd}'" &
        else
            "${TERM_CMD[@]}" -e bash -lc "${cmd}" &
        fi
    fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# 1. Prerequisites
# ═══════════════════════════════════════════════════════════════════════════════
log_step "Checking prerequisites"
check_command node "Node.js"
check_command pnpm "pnpm"
check_command docker "Docker"

docker compose version &>/dev/null || log_fail "docker compose plugin not found"

# ── inotify: Vite + tsc --watch need more file watcher instances
INOTIFY_INSTANCES="/proc/sys/fs/inotify/max_user_instances"
CURRENT_INSTANCES=$(cat "${INOTIFY_INSTANCES}" 2>/dev/null || echo 0)
if [[ "${CURRENT_INSTANCES}" -lt 512 ]]; then
    if sudo -n true 2>/dev/null; then
        sudo sysctl -w fs.inotify.max_user_instances=512 &>/dev/null
        log_ok "inotify max_user_instances raised to 512"
    else
        log_warn "inotify max_user_instances=${CURRENT_INSTANCES} (need 512). Run: sudo sysctl fs.inotify.max_user_instances=512"
        log_warn "Without this, Vite may crash with EMFILE: too many open files."
    fi
else
    log_ok "inotify max_user_instances=${CURRENT_INSTANCES} (sufficient)"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# 2. Environment file
# ═══════════════════════════════════════════════════════════════════════════════
log_step "Environment configuration"
if [[ ! -f .env ]]; then
    log_warn ".env not found — copying from .env.example"
    cp .env.example .env
    log_warn "Review .env and update secrets before proceeding to production."
    log_ok ".env created from template"
else
    log_ok ".env exists"
fi

# Load environment variables
log_ok "Exporting environment variables from .env"
set -a
source .env
set +a

# Free up target ports (3103, 3104) if in use
log_step "Cleaning up lingering ports"
for port in 3103 3104; do
    if lsof -t -i:"${port}" &>/dev/null || fuser "${port}/tcp" &>/dev/null; then
        log_warn "Port ${port} is in use. Terminating process..."
        fuser -k "${port}/tcp" &>/dev/null || kill -9 $(lsof -t -i:"${port}") &>/dev/null || true
    fi
done
log_ok "Ports cleared and ready"

# ═══════════════════════════════════════════════════════════════════════════════
# 3. Start infrastructure
# ═══════════════════════════════════════════════════════════════════════════════
log_step "Starting infrastructure (postgres)"

# Use the dev docker-compose override if it exists, otherwise create one
# that maps postgres to a non-conflicting port (5434)
DEV_COMPOSE="${SCRIPT_DIR}/docker/docker-compose.dev.yml"
if [[ ! -f "${DEV_COMPOSE}" ]]; then
    cat > "${DEV_COMPOSE}" << 'DEVYAML'
services:
  portfolio-postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    ports:
      - "5434:5432"
    environment:
      POSTGRES_USER: portfolio
      POSTGRES_PASSWORD: portfolio
      POSTGRES_DB: portfolio
    volumes:
      - portfolio-pgdata-dev:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U portfolio -d portfolio']
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  portfolio-pgdata-dev:
DEVYAML
    log_ok "Created docker/docker-compose.dev.yml"
fi

docker compose -f "${DEV_COMPOSE}" up -d portfolio-postgres
log_ok "PostgreSQL container started"

# ═══════════════════════════════════════════════════════════════════════════════
# 4. Wait for healthcheck
# ═══════════════════════════════════════════════════════════════════════════════
log_step "Waiting for healthchecks"
wait_for_health portfolio-postgres "PostgreSQL"

# ═══════════════════════════════════════════════════════════════════════════════
# 5. Install dependencies
# ═══════════════════════════════════════════════════════════════════════════════
log_step "Installing dependencies"
if [[ ! -d node_modules ]]; then
    pnpm install
    log_ok "Dependencies installed"
else
    log_ok "node_modules exists — skipping install (use 'pnpm install' to update)"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# 6. Build shared packages
# ═══════════════════════════════════════════════════════════════════════════════
log_step "Building shared packages (types, shared)"
pnpm --filter @portfolio/types build
pnpm --filter @portfolio/shared build
log_ok "Shared packages built"

# ═══════════════════════════════════════════════════════════════════════════════
# 7. Database migrations + seed
# ═══════════════════════════════════════════════════════════════════════════════
log_step "Database setup"

# Ensure API .env exists with DATABASE_URL pointing to dev postgres
API_ENV="${SCRIPT_DIR}/apps/api/.env"
if [[ ! -f "${API_ENV}" ]]; then
    cat > "${API_ENV}" << 'APIENV'
DATABASE_URL="postgresql://portfolio:portfolio@localhost:5434/portfolio?schema=public"
BI_IDENTITY_URL="http://localhost:3300"
PORT=3104
CORS_ORIGIN="http://localhost:3103"
ADMIN_EMAIL=brunomartinsss@gmail.com
APIENV
    log_ok "Created apps/api/.env (dev)"
else
    log_ok "apps/api/.env exists"
fi

log_ok "Generating Prisma client"
pnpm --filter @portfolio/api exec prisma generate || log_fail "Failed to generate Prisma client"

# Run migrations
if [[ -d apps/api/prisma/migrations ]]; then
    log_ok "Migrations directory found"
    pnpm --filter @portfolio/api exec prisma migrate dev || log_warn "Migration may already be applied"
else
    log_warn "No migrations directory found — pushing database schema directly"
    pnpm --filter @portfolio/api exec prisma db push || log_fail "Failed to sync database schema"
fi

# Seed
log_ok "Running seed"
pnpm --filter @portfolio/api exec prisma db seed || log_warn "Seed may have already been applied"
log_ok "Seed completed"

# ═══════════════════════════════════════════════════════════════════════════════
# 8. Start dev servers in separate terminals
# ═══════════════════════════════════════════════════════════════════════════════
log_step "Starting dev servers (separate terminals)"

detect_terminal

# ── Terminal 1: API server ───────────────────────────────────────────────────
log_ok "Opening terminal: API (port 3104)"
open_service_term "Portfolio API" \
    "echo -e '\033[0;36m═══ Portfolio API (port 3104) ═══\033[0m' && pnpm --filter @portfolio/api dev"

sleep 0.5

# ── Terminal 2: Web (Vite) ───────────────────────────────────────────────────
log_ok "Opening terminal: Web (port 3103)"
open_service_term "Portfolio Web" \
    "echo -e '\033[0;36m═══ Portfolio Web (port 3103) ═══\033[0m' && pnpm --filter @portfolio/web dev"

sleep 0.5

# ── Terminal 3: Docker logs (infra) ──────────────────────────────────────────
log_ok "Opening terminal: Infra logs (Docker)"
open_service_term "Portfolio Infra" \
    "echo -e '\033[0;36m═══ Portfolio Infrastructure Logs ═══\033[0m' && docker compose -f docker/docker-compose.dev.yml logs -f portfolio-postgres"

# ═══════════════════════════════════════════════════════════════════════════════
# Done — print summary
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Portfolio v2 Dev Environment Ready                               ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  3 terminals opened — one per service:                           ║${NC}"
echo -e "${GREEN}║                                                                   ║${NC}"
echo -e "${GREEN}║  1. API           http://localhost:3104                          ║${NC}"
echo -e "${GREEN}║  2. Web           http://localhost:3103                          ║${NC}"
echo -e "${GREEN}║  3. Infra logs    (postgres)                                     ║${NC}"
echo -e "${GREEN}║                                                                   ║${NC}"
echo -e "${GREEN}║  Postgres:  localhost:5434                                        ║${NC}"
echo -e "${GREEN}║                                                                   ║${NC}"
echo -e "${GREEN}║  To stop: Ctrl+C in each terminal, or:                           ║${NC}"
echo -e "${GREEN}║    docker compose -f docker/docker-compose.dev.yml down           ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# If using tmux, attach to the session
if [[ "${TERM_CMD[0]}" == "_tmux_new_window" ]]; then
    echo -e "${CYAN}tmux session 'portfolio' created. Attaching...${NC}"
    echo -e "${YELLOW}Press Ctrl+B then D to detach without killing the session.${NC}"
    echo ""
    exec tmux attach -t portfolio
fi

log_ok "All services started in separate terminals. This window can be closed."
