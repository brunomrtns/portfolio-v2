#!/usr/bin/env python3
"""
update-portfolio-nginx.py — Atualiza o nginx.conf do trivestia-nginx
para incluir as rotas do portfolio.

Uso: python3 update-portfolio-nginx.py

Estratégia:
  1. Usa /opt/trivestia/nginx/nginx.conf.clean como base (estado original, sem portfolio)
  2. Adiciona upstreams do portfolio no bloco http
  3. Remove o redirect "location = /" (que vai para /trivestia/)
  4. Adiciona locations do portfolio no bloco server
  5. Escreve o resultado para nginx.conf
  6. Cria backup automático do nginx.conf atual

Idempotente: sempre começa do clean base, então múltiplas execuções
não acumulam duplicatas.
"""

import re
import sys
import shutil
from datetime import datetime
from pathlib import Path

NGINX_CONF = Path("/opt/trivestia/nginx/nginx.conf")
CLEAN_BASE = Path("/opt/trivestia/nginx/nginx.conf.clean")

# ── Portfolio upstreams (vão no bloco http) ────────────────────────────────────
PORTFOLIO_UPSTREAMS = """    # ── Portfolio Upstreams ───────────────────────────────────────────────
    upstream portfolio_api {
        server portfolio-api:3104;
        keepalive 16;
    }
    upstream portfolio_web {
        server portfolio-web:80;
        keepalive 16;
    }"""

# ── Portfolio locations (vão no bloco server, antes do fechamento) ─────────────
PORTFOLIO_LOCATIONS = """    # ── Portfolio Locations ───────────────────────────────────────────────
    # Redirect /portfolio → /portfolio/
    location = /portfolio {
        return 301 /portfolio/;
    }

    # Portfolio API
    location /portfolio/api/ {
        limit_req zone=api_limit burst=30 nodelay;
        rewrite ^/portfolio/api/(.*)$ /api/$1 break;
        proxy_pass         http://portfolio_api;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   Connection        "";
        proxy_buffering    off;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
        client_max_body_size 20M;
    }

    # Portfolio Web (SPA) — strip /portfolio/ prefix
    location /portfolio/ {
        limit_req zone=web_limit burst=100 nodelay;
        rewrite ^/portfolio/(.*)$ /$1 break;
        proxy_pass         http://portfolio_web;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    # Portfolio homepage — serve at root
    location = / {
        limit_req zone=web_limit burst=100 nodelay;
        proxy_pass         http://portfolio_web;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }"""


def main():
    if not CLEAN_BASE.exists():
        print(f"✗ Clean base não encontrado: {CLEAN_BASE}", file=sys.stderr)
        print("  Crie-o manualmente antes do primeiro deploy:")
        print(f"    cp {NGINX_CONF} {CLEAN_BASE}")
        sys.exit(1)

    # Backup do nginx.conf atual (pode estar modificado)
    if NGINX_CONF.exists():
        backup = NGINX_CONF.with_suffix(
            f".conf.bak.portfolio.{datetime.now().strftime('%Y%m%d%H%M%S')}"
        )
        shutil.copy2(NGINX_CONF, backup)
        print(f"  ✓ Backup criado: {backup}")

    # Sempre começa do clean base
    content = CLEAN_BASE.read_text()
    print(f"  ✓ Base limpa carregada: {CLEAN_BASE}")

    # ── Step 1: Insert portfolio upstreams after avesia upstreams ───────────
    avesia_pattern = r"(upstream avesia_web \{[^}]+keepalive 32;\s*\})"
    match = re.search(avesia_pattern, content)
    if match:
        insert_pos = match.end()
        content = content[:insert_pos] + "\n\n" + PORTFOLIO_UPSTREAMS + content[insert_pos:]
        print("  ✓ Portfolio upstreams adicionados")
    else:
        # Fallback: insert before the log_format line
        log_pattern = r"(log_format main)"
        match = re.search(log_pattern, content)
        if match:
            insert_pos = match.start()
            content = content[:insert_pos] + PORTFOLIO_UPSTREAMS + "\n\n  " + content[insert_pos:]
            print("  ✓ Portfolio upstreams adicionados (fallback position)")
        else:
            print("  ⚠ Não foi possível encontrar posição para upstreams", file=sys.stderr)
            sys.exit(1)

    # ── Step 2: Remove the "location = /" redirect to /trivestia/ ───────────
    content = re.sub(
        r"\n\s*# Redirect raiz → /trivestia/\n\s*location = / \{\n\s*return 301 https://\$host/trivestia/;\n\s*\}\n",
        "\n",
        content,
    )

    # ── Step 3: Insert portfolio locations after the Avesia /avesia/ block ───
    # Find the Avesia /avesia/ location block and insert after it
    # The Avesia block is the last location in the server block
    avesia_loc_pattern = r"(location /avesia/ \{[^}]*proxy_set_header\s+X-Forwarded-Proto\s+\$scheme;\s*\n\s*\})"
    match = re.search(avesia_loc_pattern, content)
    if match:
        insert_pos = match.end()
        content = content[:insert_pos] + "\n\n" + PORTFOLIO_LOCATIONS + content[insert_pos:]
        print("  ✓ Portfolio locations adicionados")
    else:
        # Fallback: find the closing of the server block (last "  }" before final "}")
        lines = content.split("\n")
        last_server_close = -1
        for i in range(len(lines) - 1, -1, -1):
            if lines[i].strip() == "}" and lines[i].startswith("  }"):
                last_server_close = i
                break
        if last_server_close >= 0:
            lines.insert(last_server_close, PORTFOLIO_LOCATIONS)
            content = "\n".join(lines)
            print("  ✓ Portfolio locations adicionados (fallback position)")
        else:
            print("  ⚠ Não foi possível encontrar posição para locations", file=sys.stderr)
            sys.exit(1)

    # ── Step 4: Write the updated config ────────────────────────────────────
    NGINX_CONF.write_text(content)
    print(f"  ✓ {NGINX_CONF} atualizado")


if __name__ == "__main__":
    main()
