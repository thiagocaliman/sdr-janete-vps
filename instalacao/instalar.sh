#!/usr/bin/env bash
# =============================================================================
# AI PRO Janete: instalador para uma VPS Ubuntu 24.04 limpa.
#
# Instala tudo em /opt/janete:
#   - Docker (se ainda não houver);
#   - Supabase próprio (banco, login, API, arquivos e tempo real), preso em 127.0.0.1;
#   - o banco da Janete (estrutura, dados iniciais, tempo real e relógio);
#   - o app (compilado num contêiner Node 22) ouvindo em 127.0.0.1:3010;
#   - nginx com HTTPS gratuito (Let's Encrypt) no seu domínio;
#   - backup diário do banco às 03:00 (horário de Brasília).
#
# Uso (no Web Console da Hostinger, como root):
#   curl -fsSL https://raw.githubusercontent.com/<usuario>/<repo>/main/instalacao/instalar.sh | bash
#
# Pergunta o domínio e o e-mail. Para rodar sem perguntas:
#   JANETE_DOMINIO=janete.seudominio.com.br JANETE_EMAIL=voce@email.com bash instalar.sh
#
# Rodar de novo atualiza o app e mantém os dados e as chaves.
# =============================================================================
set -euo pipefail

REPO_URL="${JANETE_REPO_URL:-https://github.com/thiagocaliman/sdr-janete-vps.git}"
REPO_BRANCH="${JANETE_REPO_BRANCH:-main}"
# Versão fixa do Supabase (a mesma testada com a Janete).
SUPABASE_COMMIT="a1538e957b0b25c05e54f8779dc6847c9a3f06cb"
BASE=/opt/janete
NODE_IMG="node:22.22-bookworm"
BUN_IMG="oven/bun:1.3"

passo() { printf '\n\033[1;38;5;202m==> %s\033[0m\n' "$*"; }
ok() { printf '    \033[32mok\033[0m %s\n' "$*"; }
falha() { printf '\n\033[1;31mErro:\033[0m %s\n' "$*" >&2; exit 1; }
perguntar() {
  # lê do teclado mesmo quando o script vem pelo "curl | bash"
  local texto="$1" var="$2" resposta=""
  if (: < /dev/tty) 2>/dev/null; then read -r -p "$texto" resposta < /dev/tty || true; fi
  printf -v "$var" '%s' "$resposta"
}

[ "$(id -u)" -eq 0 ] || falha "rode como root (no Web Console da Hostinger você já é root)."
. /etc/os-release 2>/dev/null || true
[ "${ID:-}" = "ubuntu" ] || falha "este instalador é para Ubuntu (a VPS da Hostinger com Ubuntu 24.04)."

# As portas 80 e 443 precisam estar livres ou com o nginx (outro proxy, como Caddy ou Traefik, conflita).
OCUPADAS="$( (ss -ltnpH 2>/dev/null || true) | awk '$4 ~ /:(80|443)$/' | grep -v '"nginx"' || true)"
if [ -n "$OCUPADAS" ]; then
  printf '%s\n' "$OCUPADAS" >&2
  falha "as portas 80 ou 443 já estão em uso por outro programa (acima). A Janete usa o nginx nessas portas: use uma VPS separada ou libere as portas."
fi

# ---------------------------------------------------------------- 1. perguntas
passo "Configuração"
DOMINIO="${JANETE_DOMINIO:-}"
EMAIL="${JANETE_EMAIL:-}"
if [ -f "$BASE/instalacao.env" ]; then
  # reinstalação: reaproveita o que já foi respondido
  . "$BASE/instalacao.env"
fi
[ -n "$DOMINIO" ] || perguntar "Domínio do app (ex.: janete.seudominio.com.br): " DOMINIO
DOMINIO="$(printf '%s' "$DOMINIO" | tr -d '[:space:]' | sed -E 's#^https?://##; s#/.*$##' | tr 'A-Z' 'a-z')"
[ -n "$DOMINIO" ] || falha "informe o domínio."
SEM_HTTPS="${JANETE_SEM_HTTPS:-0}"
[ "$SEM_HTTPS" = "1" ] || [ -n "$EMAIL" ] || perguntar "Seu e-mail (para o certificado HTTPS): " EMAIL
if [ "$SEM_HTTPS" = "1" ]; then URL="http://$DOMINIO"; else URL="https://$DOMINIO"; fi
[ "$SEM_HTTPS" = "1" ] || [ -n "$EMAIL" ] || falha "informe o e-mail para o certificado HTTPS."
mkdir -p "$BASE"
umask 077
printf 'DOMINIO=%q\nEMAIL=%q\n' "$DOMINIO" "$EMAIL" > "$BASE/instalacao.env"
umask 022
ok "app em $URL"

# ---------------------------------------------------------------- 2. pacotes
passo "Instalando os programas (Docker, nginx, certbot)"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq ca-certificates curl git openssl nginx certbot python3-certbot-nginx >/dev/null
if ! command -v docker >/dev/null 2>&1; then
  apt-get install -y -qq docker.io docker-compose-v2 >/dev/null
fi
docker compose version >/dev/null 2>&1 || apt-get install -y -qq docker-compose-v2 >/dev/null
systemctl enable --now docker >/dev/null 2>&1 || service docker start >/dev/null 2>&1 || true
if ! docker info >/dev/null 2>&1; then
  # servidor sem systemd: liga o Docker direto
  (nohup dockerd >/var/log/dockerd.log 2>&1 &)
  for i in $(seq 1 30); do docker info >/dev/null 2>&1 && break; sleep 2; done
fi
docker info >/dev/null 2>&1 || falha "o Docker não respondeu."
ok "Docker $(docker version --format '{{.Server.Version}}'), nginx e certbot"

# ---------------------------------------------------------------- 3. código
passo "Baixando o código da Janete"
if [ -n "${JANETE_PASTA_CODIGO:-}" ]; then
  # teste local: usa uma pasta já baixada
  rm -rf "$BASE/codigo"; cp -a "$JANETE_PASTA_CODIGO" "$BASE/codigo"
elif [ -d "$BASE/codigo/.git" ]; then
  git -C "$BASE/codigo" fetch -q origin "$REPO_BRANCH"
  git -C "$BASE/codigo" reset -q --hard "origin/$REPO_BRANCH"
else
  rm -rf "$BASE/codigo"
  git clone -q --depth 1 --branch "$REPO_BRANCH" "$REPO_URL" "$BASE/codigo"
fi
COD="$BASE/codigo"
ok "código em $COD"

# ---------------------------------------------------------------- 4. Supabase
passo "Preparando o Supabase"
SB="$BASE/supabase"
if [ ! -f "$SB/docker-compose.yml" ]; then
  TMP="$(mktemp -d)"
  git clone -q --filter=blob:none --no-checkout https://github.com/supabase/supabase.git "$TMP/supabase"
  git -C "$TMP/supabase" sparse-checkout set docker >/dev/null
  git -C "$TMP/supabase" checkout -q "$SUPABASE_COMMIT"
  mkdir -p "$SB"; cp -a "$TMP/supabase/docker/." "$SB/"; rm -rf "$TMP"
  ok "Supabase baixado (versão fixa)"
fi
cp "$COD/instalacao/supabase-override.yml" "$SB/docker-compose.override.yml"

definir() { # definir CHAVE valor  (no .env do Supabase)
  local k="$1" v="$2"
  if grep -q "^$k=" "$SB/.env"; then sed -i "s|^$k=.*|$k=$v|" "$SB/.env"; else printf '%s=%s\n' "$k" "$v" >> "$SB/.env"; fi
}
if [ ! -f "$SB/.env" ]; then
  cp "$SB/.env.example" "$SB/.env"
  (cd "$SB" && sh utils/generate-keys.sh --update-env >/dev/null && sh utils/add-new-auth-keys.sh --update-env >/dev/null)
  chmod 600 "$SB/.env"
  ok "chaves do Supabase geradas"
fi
definir COMPOSE_FILE "docker-compose.yml:docker-compose.override.yml"
definir SUPABASE_PUBLIC_URL "$URL"
definir API_EXTERNAL_URL "$URL/auth/v1"
definir SITE_URL "$URL"
definir ADDITIONAL_REDIRECT_URLS "$URL/**"
definir POOLER_TENANT_ID "janete"
# o cadastro fica aberto só até a dona criar a conta (o fechar-cadastro.sh fecha depois);
# numa reinstalação, o que já estava fechado continua fechado
# sem servidor de e-mail, a conta já nasce confirmada
definir ENABLE_EMAIL_AUTOCONFIRM "true"

ler() { grep "^$1=" "$SB/.env" | head -1 | cut -d= -f2-; }
ANON_KEY="$(ler ANON_KEY)"; SERVICE_KEY="$(ler SERVICE_ROLE_KEY)"
[ -n "$ANON_KEY" ] && [ -n "$SERVICE_KEY" ] || falha "as chaves do Supabase não foram geradas."

passo "Ligando o Supabase (a 1ª vez baixa as imagens e leva alguns minutos)"
(cd "$SB" && docker compose pull -q >/dev/null 2>&1 || true)
(cd "$SB" && docker compose up -d >/dev/null 2>&1)
for i in $(seq 1 90); do
  docker exec supabase-db pg_isready -U postgres -h localhost >/dev/null 2>&1 && break
  sleep 2
done
docker exec supabase-db pg_isready -U postgres -h localhost >/dev/null 2>&1 || falha "o banco não subiu."
# o Supabase termina as migrações internas dele depois do banco aceitar conexão
for i in $(seq 1 60); do
  docker exec supabase-db psql -U supabase_admin -d postgres -tAc "select 1 from pg_namespace where nspname='storage'" 2>/dev/null | grep -q 1 \
    && docker exec supabase-db psql -U supabase_admin -d postgres -tAc "select 1 from pg_tables where schemaname='storage' and tablename='buckets'" 2>/dev/null | grep -q 1 \
    && break
  sleep 3
done
ok "Supabase no ar"

# ---------------------------------------------------------------- 5. banco
passo "Criando o banco da Janete"
# psql calado: um erro do banco pode citar valores de linhas (chaves), então só o resumo aparece
sql() { docker exec -e PGOPTIONS='-c client_min_messages=warning' supabase-db psql -U supabase_admin -d postgres -tAq -v ON_ERROR_STOP=1 -c "$1" >/dev/null 2>&1; }
sql_arquivo() { docker exec -i -e PGOPTIONS='-c client_min_messages=warning' supabase-db psql -U supabase_admin -d postgres -q -v ON_ERROR_STOP=1 < "$1" >/dev/null 2>"$BASE/ultimo-erro-banco.log"; }
JA_TEM="$(docker exec supabase-db psql -U supabase_admin -d postgres -tAc "select count(*) from pg_tables where schemaname='public' and tablename='mensagens'")"
if [ "$JA_TEM" = "0" ]; then
  sql_arquivo "$COD/banco/01-estrutura.sql" || falha "a estrutura do banco falhou (detalhes em $BASE/ultimo-erro-banco.log)."
  ok "estrutura criada"
else
  ok "o banco já existia: mantido"
fi
sql_arquivo "$COD/banco/02-inicio.sql" || falha "os dados iniciais do banco falharam (detalhes em $BASE/ultimo-erro-banco.log)."
rm -f "$BASE/ultimo-erro-banco.log"
# o endereço que o banco chama para acordar o motor (só https; sem https o app grava quando puder)
if [ "$SEM_HTTPS" != "1" ]; then
  sql "update public.motor set url = '$URL'" || falha "não deu para gravar o endereço do motor."
fi
(cd "$SB" && docker compose restart rest >/dev/null 2>&1)
ok "dados iniciais, tempo real e relógio prontos"

# ---------------------------------------------------------------- 6. app
passo "Compilando o app (leva alguns minutos)"
umask 077
cat > "$BASE/build.env" <<EOF
VITE_SUPABASE_URL=$URL
VITE_SUPABASE_PUBLISHABLE_KEY=$ANON_KEY
VITE_SUPABASE_PROJECT_ID=janete
EOF
if [ ! -f "$BASE/app.env" ]; then
  cat > "$BASE/app.env" <<EOF
NODE_ENV=production
HOST=127.0.0.1
PORT=3010
SUPABASE_URL=$URL
SUPABASE_PUBLISHABLE_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY
JANETE_ENVIO_LIBERADO=sim
JANETE_WEBHOOK_LIBERADO=sim
JANETE_MOTOR_LIGADO=sim
EOF
fi
umask 022
docker pull -q "$BUN_IMG" >/dev/null
docker pull -q "$NODE_IMG" >/dev/null
docker run --rm -v "$COD:/app" -w /app "$BUN_IMG" bun install --frozen-lockfile >/dev/null 2>&1 \
  || docker run --rm -v "$COD:/app" -w /app "$BUN_IMG" bun install >/dev/null 2>&1
docker run --rm --env-file "$BASE/build.env" -v "$COD:/app" -w /app "$NODE_IMG" \
  node node_modules/vite/bin/vite.js build >/dev/null 2>&1
[ -f "$COD/.output/server/index.mjs" ] || falha "a compilação do app falhou."
rm -rf "$BASE/app-anterior"
[ -d "$BASE/app-atual" ] && mv "$BASE/app-atual" "$BASE/app-anterior"
cp -a "$COD/.output" "$BASE/app-atual"
docker rm -f janete-app >/dev/null 2>&1 || true
docker run -d --name janete-app --restart unless-stopped --network host --env-file "$BASE/app.env" \
  -v "$BASE/app-atual:/srv:ro" -w /srv "$NODE_IMG" node server/index.mjs >/dev/null
for i in $(seq 1 30); do
  curl -fs -o /dev/null http://127.0.0.1:3010/entrar && break
  sleep 2
done
curl -fs -o /dev/null http://127.0.0.1:3010/entrar || falha "o app não respondeu (veja: docker logs janete-app)."
ok "app no ar em 127.0.0.1:3010"

# ---------------------------------------------------------------- 7. nginx e HTTPS
passo "Publicando no domínio"
sed "s/__DOMINIO__/$DOMINIO/g" "$COD/instalacao/nginx.conf.modelo" > /etc/nginx/sites-available/janete.conf
ln -sf /etc/nginx/sites-available/janete.conf /etc/nginx/sites-enabled/janete.conf
nginx -t >/dev/null 2>&1 || falha "configuração do nginx inválida (nginx -t)."
if pgrep -x nginx >/dev/null 2>&1; then
  nginx -s reload
else
  systemctl enable --now nginx >/dev/null 2>&1 || service nginx start >/dev/null 2>&1 || nginx
fi
# o nginx recarrega em segundo plano: espera o site novo responder
for i in $(seq 1 15); do
  curl -fs -o /dev/null -H "Host: $DOMINIO" http://127.0.0.1/entrar && break
  sleep 2
done
curl -fs -o /dev/null -H "Host: $DOMINIO" http://127.0.0.1/entrar || falha "o nginx não respondeu (confira com: nginx -t)."
ok "nginx publicando $DOMINIO"
if [ "$SEM_HTTPS" != "1" ]; then
  # a Let's Encrypt às vezes recusa o 1º pedido sem motivo: tenta até 3 vezes antes de desistir
  HTTPS_OK=0
  for i in 1 2 3; do
    if certbot --nginx -d "$DOMINIO" -m "$EMAIL" --agree-tos --non-interactive --redirect >/dev/null 2>&1; then
      HTTPS_OK=1; break
    fi
    sleep 20
  done
  [ "$HTTPS_OK" = "1" ] \
    || falha "o certificado HTTPS falhou. Confira se o domínio $DOMINIO aponta para o IP desta VPS e rode de novo (detalhes em /var/log/letsencrypt/letsencrypt.log)."
  ok "HTTPS ativo"
fi

# ---------------------------------------------------------------- 8. backup
passo "Backup diário"
cp "$COD/instalacao/backup.sh" "$BASE/backup.sh"; chmod 700 "$BASE/backup.sh"
mkdir -p "$BASE/backups"; chmod 700 "$BASE/backups"
cat > /etc/cron.d/janete-backup <<EOF
# Backup diário da Janete às 03:00 de Brasília (06:00 UTC)
0 6 * * * root $BASE/backup.sh >> /var/log/janete-backup.log 2>&1
EOF
ok "todo dia às 03:00, guardando 14 dias em $BASE/backups"

# ---------------------------------------------------------------- 9. cadastro
cp "$COD/instalacao/fechar-cadastro.sh" "$BASE/fechar-cadastro.sh"; chmod 700 "$BASE/fechar-cadastro.sh"
cp "$COD/instalacao/desinstalar.sh" "$BASE/desinstalar.sh"; chmod 700 "$BASE/desinstalar.sh"
MEMBROS="$(docker exec supabase-db psql -U supabase_admin -d postgres -tAc "select count(*) from public.membros")"
if [ "$MEMBROS" = "0" ] && ! grep -q '^DISABLE_SIGNUP=true' "$SB/.env"; then
  cat > /etc/cron.d/janete-cadastro <<EOF
# Fecha o cadastro público assim que a dona do app criar a conta (depois se apaga sozinho)
* * * * * root $BASE/fechar-cadastro.sh >> /var/log/janete-cadastro.log 2>&1
EOF
fi

# ---------------------------------------------------------------- fim
passo "Pronto"
cat <<EOF

  A AI PRO Janete está no ar:  $URL

  1. Abra o endereço acima e crie a sua conta (a 1ª conta vira a dona do app).
  2. Siga o passo a passo da tela: conecte o WhatsApp e cadastre a chave da inteligência artificial.

  Para atualizar no futuro, rode o mesmo comando de instalação de novo.

EOF
