#!/usr/bin/env python3
"""
update-portfolio-nginx.py — Atualiza o nginx.conf do trivestia-nginx
para incluir as rotas do portfolio.

Uso: python3 update-portfolio-nginx.py

O que faz:
  1. Lê /opt/trivestia/nginx/nginx.conf
  2. Adiciona/remova upstreams do portfolio no bloco http
  3. Substitui location = / (redirect para /trivestia/) por proxy para portfolio-web
  4. Adiciona location blocks do portfolio no bloco server
  5. Escreve o arquivo de volta
  6. Cria backup automático

Idempotente: pode ser rodado múltiplas vezes sem duplicar config.
"""

import re
import sys
import shutil
from datetime import datetime
from pathlib import Path

NGINX_CONF = Path("/opt/trivestia/nginx/nginx.conf")

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
    if not NGINX_CONF.exists():
        print(f"✗ {NGINX_CONF} não encontrado", file=sys.stderr)
        sys.exit(1)

    # Backup
    backup = NGINX_CONF.with_suffix(
        f".conf.bak.portfolio.{datetime.now().strftime('%Y%m%d%H%M%S')}"
    )
    shutil.copy2(NGINX_CONF, backup)
    print(f"  ✓ Backup criado: {backup}")

    content = NGINX_CONF.read_text()

    # ── Step 1: Remove existing portfolio upstreams ─────────────────────────
    content = re.sub(
        r"\n\s*# ── Portfolio Upstreams[^\n]*\n.*?keepalive 16;\n\s*}\n",
        "\n",
        content,
        flags=re.DOTALL,
    )

    # ── Step 2: Insert portfolio upstreams after avesia upstreams ───────────
    # Find the avesia_web upstream block end and insert after it
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

    # ── Step 3: Remove existing portfolio locations ─────────────────────────
    content = re.sub(
        r"\n\s*# ── Portfolio Locations[^\n]*\n.*?proxy_set_header\s+X-Forwarded-Proto\s+\$scheme;\s*\n\s*}\n",
        "\n",
        content,
        flags=re.DOTALL,
    )

    # ── Step 4: Remove existing location = / (redirect to /trivestia/) ──────
    # Replace the redirect with nothing — the portfolio location = / will handle it
    content = re.sub(
        r"\n\s*# Redirect raiz → /trivestia/\n\s*location = / \{\n\s*return 301 https://\$host/trivestia/;\n\s*\}\n",
        "\n",
        content,
    )

    # ── Step 5: Insert portfolio locations before the closing of server block ─
    # The server block ends with the last location block + closing braces
    # We need to insert before the final "  }" that closes the server block
    # Strategy: find the last "  }" in the file (which closes the server block)
    # and insert before it

    # Find the Avesia /avesia/ location block and insert after it
    avesia_loc_pattern = r"(location /avesia/ \{[^}]*proxy_set_header\s+X-Forwarded-Proto\s+\$scheme;\s*\n\s*\})"
    match = re.search(avesia_loc_pattern, content)
    if match:
        insert_pos = match.end()
        content = content[:insert_pos] + "\n\n" + PORTFOLIO_LOCATIONS + content[insert_pos:]
        print("  ✓ Portfolio locations adicionados")
    else:
        # Fallback: find the closing of the server block
        # The server block is the last one, ending with "  }" before the final "}"
        # We insert before the last "  }" (2-space indent = server block close)
        lines = content.split("\n")
        # Find the last line that is exactly "  }" (server block close)
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

    # ── Step 6: Write the updated config ────────────────────────────────────
    NGINX_CONF.write_text(content)
    print(f"  ✓ {NGINX_CONF} atualizado")


if __name__ == "__main__":
    main()
