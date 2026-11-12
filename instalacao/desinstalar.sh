#!/usr/bin/env bash
# =============================================================================
# AI PRO Janete: desinstalador.
#
# Apaga da VPS tudo o que o instalar.sh criou:
#   - o app e o Supabase da Janete (contêineres, rede, volumes e o banco);
#   - a pasta /opt/janete;
#   - o site da Janete no nginx e o certificado HTTPS dela;
#   - os agendamentos (backup diário e fechamento do cadastro).
#
# Não mexe em: Docker, nginx, certbot e nos outros sites e projetos da VPS.
# Os backups são guardados em /root/janete-backups-DATA antes de apagar.
#
# Uso (no Web Console da Hostinger, como root):
#   bash /opt/janete/desinstalar.sh
#
# Sem perguntas:           JANETE_CONFIRMA=APAGAR bash desinstalar.sh
# Apagar também os backups: JANETE_APAGAR_BACKUPS=1
# Apagar também as imagens: JANETE_APAGAR_IMAGENS=1
# =============================================================================
set -euo pipefail

BASE=/opt/janete
SB="$BASE/supabase"

passo() { printf '\n\033[1;38;5;202m==> %s\033[0m\n' "$*"; }
ok() { printf '    \033[32mok\033[0m %s\n' "$*"; }
falha() { printf '\n\033[1;31mErro:\033[0m %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || falha "rode como root (no Web Console da Hostinger você já é root)."

DOMINIO=""
if [ -f "$BASE/instalacao.env" ]; then
  # shellcheck disable=SC1091
  . "$BASE/instalacao.env"
fi
DOMINIO="${JANETE_DOMINIO:-$DOMINIO}"

# ---------------------------------------------------------------- confirmação
CONFIRMA="${JANETE_CONFIRMA:-}"
if [ "$CONFIRMA" != "APAGAR" ]; then
  printf '\nIsto apaga a Janete desta VPS: o app, o banco com todas as conversas e a configuração.\n'
  printf 'Os backups de %s/backups ficam guardados em /root.\n\n' "$BASE"
  if (: < /dev/tty) 2>/dev/null; then
    read -r -p "Para continuar, digite APAGAR: " CONFIRMA < /dev/tty || true
  fi
fi
[ "$CONFIRMA" = "APAGAR" ] || falha "nada foi apagado (a confirmação não veio)."

# ---------------------------------------------------------------- 1. agendamentos
passo "Desligando os agendamentos"
rm -f /etc/cron.d/janete-backup /etc/cron.d/janete-cadastro
ok "backup diário e fechamento do cadastro removidos"

# ---------------------------------------------------------------- 2. app e Supabase
passo "Parando o app e o Supabase"
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  docker rm -f janete-app >/dev/null 2>&1 || true
  IMAGENS=""
  if [ -f "$SB/docker-compose.yml" ]; then
    IMAGENS="$(cd "$SB" && docker compose config --images 2>/dev/null || true)"
    (cd "$SB" && docker compose down -v --remove-orphans >/dev/null 2>&1) || true
  fi
  # o que sobrar do projeto "janete" (se a pasta do Supabase já não existia)
  RESTO="$(docker ps -aq --filter label=com.docker.compose.project=janete)"
  # shellcheck disable=SC2086
  [ -z "$RESTO" ] || docker rm -f $RESTO >/dev/null 2>&1 || true
  VOLUMES="$(docker volume ls -q --filter label=com.docker.compose.project=janete)"
  # shellcheck disable=SC2086
  [ -z "$VOLUMES" ] || docker volume rm $VOLUMES >/dev/null 2>&1 || true
  docker network rm janete_default >/dev/null 2>&1 || true
  ok "contêineres, rede e volumes removidos"
  if [ "${JANETE_APAGAR_IMAGENS:-0}" = "1" ]; then
    # shellcheck disable=SC2086
    docker rmi $IMAGENS node:22.22-bookworm oven/bun:1.3 >/dev/null 2>&1 || true
    ok "imagens removidas"
  fi
else
  ok "Docker não está rodando: nada para parar"
fi

# ---------------------------------------------------------------- 3. nginx e HTTPS
passo "Tirando o site do nginx"
rm -f /etc/nginx/sites-enabled/janete.conf /etc/nginx/sites-available/janete.conf
if command -v nginx >/dev/null 2>&1; then
  if nginx -t >/dev/null 2>&1; then
    if pgrep -x nginx >/dev/null 2>&1; then nginx -s reload; fi
    ok "site removido (os outros sites continuam)"
  else
    printf '    aviso: o nginx acusou erro na configuração (confira com: nginx -t)\n'
  fi
fi
if [ -n "$DOMINIO" ] && command -v certbot >/dev/null 2>&1 && [ -d "/etc/letsencrypt/live/$DOMINIO" ]; then
  certbot delete --cert-name "$DOMINIO" --non-interactive >/dev/null 2>&1 || true
  ok "certificado de $DOMINIO removido"
fi

# ---------------------------------------------------------------- 4. arquivos
passo "Apagando os arquivos"
if [ -d "$BASE/backups" ] && [ "${JANETE_APAGAR_BACKUPS:-0}" != "1" ] \
  && [ -n "$(find "$BASE/backups" -maxdepth 1 -name 'janete-*.tar' -print -quit)" ]; then
  GUARDA="/root/janete-backups-$(date -u +%Y-%m-%d_%H%M)"
  mv "$BASE/backups" "$GUARDA"
  chmod 700 "$GUARDA"
  ok "backups guardados em $GUARDA"
fi
rm -rf "$BASE"
rm -f /var/log/janete-backup.log /var/log/janete-cadastro.log
ok "$BASE apagada"

passo "Pronto"
cat <<EOF

  A Janete foi removida desta VPS.
  O Docker, o nginx e os outros projetos continuam como estavam.
  Para instalar de novo, rode o comando de instalação do guia.

EOF
