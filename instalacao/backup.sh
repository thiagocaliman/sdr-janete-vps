#!/bin/sh
# Backup diário da AI PRO Janete: banco inteiro (pg_dumpall), arquivos do storage e configuração.
# Guarda os últimos 14 dias em /opt/janete/backups. Cron: /etc/cron.d/janete-backup (06:00 UTC = 03:00 Brasília).
set -eu
umask 077
DEST=/opt/janete/backups
DATA=$(date -u +%Y-%m-%d_%H%M)
TMP="$DEST/.parcial-$DATA"
mkdir -p "$TMP"
trap 'rm -rf "$TMP"' EXIT

# 1. banco: todas as bases e papéis. Se a cópia sair incompleta, o backup não é gravado.
docker exec supabase-db pg_dumpall -U supabase_admin | gzip -9 > "$TMP/banco.sql.gz"
gzip -t "$TMP/banco.sql.gz"
zcat "$TMP/banco.sql.gz" | tail -5 | grep -q "PostgreSQL database cluster dump complete"

# 2. arquivos enviados (storage)
tar -czf "$TMP/storage.tar.gz" -C /opt/janete/supabase/volumes storage

# 3. configuração (contém chaves: a pasta de backups é só do root)
CONFIG=""
for f in opt/janete/app.env opt/janete/build.env opt/janete/instalacao.env opt/janete/supabase/.env \
  opt/janete/supabase/docker-compose.yml opt/janete/supabase/docker-compose.override.yml \
  opt/janete/supabase/volumes/api etc/nginx/sites-available/janete.conf; do
  [ -e "/$f" ] && CONFIG="$CONFIG $f"
done
# shellcheck disable=SC2086
tar -czf "$TMP/config.tar.gz" -C / $CONFIG

tar -cf "$DEST/janete-$DATA.tar" -C "$TMP" banco.sql.gz storage.tar.gz config.tar.gz

# guarda 14 dias
find "$DEST" -maxdepth 1 -name "janete-*.tar" -mtime +13 -delete
echo "$(date -u +%FT%TZ) ok janete-$DATA.tar $(du -h "$DEST/janete-$DATA.tar" | cut -f1)"
