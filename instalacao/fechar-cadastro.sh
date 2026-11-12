#!/bin/sh
# Fecha o cadastro público depois que a dona do app criou a conta: a partir daí, as pessoas só
# entram por convite (tela Equipe). Roda a cada minuto pelo /etc/cron.d/janete-cadastro e se
# desliga sozinho quando termina.
set -eu
SB=/opt/janete/supabase
N=$(docker exec supabase-db psql -U supabase_admin -d postgres -tAc "select count(*) from public.membros" 2>/dev/null || echo 0)
[ "${N:-0}" -gt 0 ] || exit 0
sed -i 's|^DISABLE_SIGNUP=.*|DISABLE_SIGNUP=true|' "$SB/.env"
(cd "$SB" && docker compose up -d auth >/dev/null 2>&1)
rm -f /etc/cron.d/janete-cadastro
echo "$(date -u +%FT%TZ) cadastro fechado: a dona do app já tem conta"
