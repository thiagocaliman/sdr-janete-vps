# AI PRO Janete na VPS com o seu agente de IA e o Hostinger Connector

Este arquivo é para você anexar no seu agente de IA. Ele conduz a instalação da **AI PRO Janete** (SDR de WhatsApp com inteligência artificial) na sua VPS Hostinger, um passo por vez. Funciona com qualquer agente que tenha o **Hostinger Connector**: ChatGPT, Claude, Claude Code, Codex ou os editores (VS Code, Cursor, Antigravity).

## Para o aluno: como usar

1. **Ligue o Hostinger Connector no seu agente**, pelo canal oficial. Em todos o login é na tela da Hostinger, sem colar senha no chat:

| Seu agente | Onde instalar | Botão |
|---|---|---|
| ChatGPT (e Codex) | https://openai.com/pt-BR/business/plugins/hostinger-connector/ | Instalar plugin |
| Claude (app e navegador) | https://claude.ai/directory/hostinger-connector | Conectar ao Claude |
| Claude Code | https://claude.com/marketplace/plugins/hostinger | Install in Claude Code |
| VS Code | https://marketplace.visualstudio.com/items?itemName=hostinger-official.hostinger-connector | Install |
| Cursor, Windsurf, Antigravity | https://open-vsx.org/extension/hostinger/hostinger-connector | Install |

2. **Tenha em mãos:** o subdomínio que vai usar (ex.: `janete.seudominio.com.br`) e um e-mail seu. A chave da IA da Janete, o WhatsApp e a voz você só vai usar no fim, direto nas telas do app.
3. **Abra uma conversa nova, anexe este arquivo e mande o pedido abaixo**, trocando o que está entre colchetes.

### Pedido para mandar junto com o arquivo

> Siga o arquivo anexo para instalar a AI PRO Janete na minha VPS Hostinger usando o Hostinger Connector. Meu subdomínio é [janete.seudominio.com.br] e meu e-mail para o certificado é [voce@email.com]. Liste minhas VPS e espere eu escolher. Faça um passo por vez, me diga o resultado esperado e espere eu confirmar antes de seguir. Não compre, não contrate, não reinstale a VPS e não apague nada que já existe nela. Senhas, chaves de IA e o QR code do WhatsApp eu coloco direto nas telas: não me peça no chat.

O agente faz a parte da conta Hostinger (VPS e DNS) e te entrega os comandos. Você cola no **Terminal da VPS** (Web Console: painel da Hostinger, abra a VPS, botão **Terminal**) e devolve o que apareceu. No fim, você faz as telas do app com ele te guiando.

---

# Instruções para o agente de IA

Você vai conduzir uma pessoa leiga na instalação da AI PRO Janete. Fale em português simples, um passo por vez, e confira o resultado real de cada passo antes de seguir.

Repositório oficial do app: https://github.com/thiagocaliman/sdr-janete-vps (se conseguir ler, o `AGENTS.md` de lá complementa este arquivo).

## Regras que valem do começo ao fim

- **Nunca** use operações do Connector que compram, contratam, renovam, reinstalam ou recriam VPS, nem que apagam sites, VPS ou registros de DNS. Recriar a VPS apaga tudo que está nela, sem volta.
- **Não escolha a VPS sozinho.** Liste e espere a pessoa escolher, mesmo que só exista uma.
- **Antes de qualquer alteração** (inclusive criar um registro de DNS), diga exatamente o que vai mudar e espere um "ok".
- **Não peça e não aceite no chat** senha, chave de IA, token ou QR code. Se a pessoa colar um segredo, avise para trocar depois e não repita o valor.
- **Não mostre** o conteúdo de `/opt/janete/app.env`, `/opt/janete/build.env`, `/opt/janete/instalacao.env` nem `/opt/janete/supabase/.env`. Não faça `select *` nas tabelas `motor`, `conexoes` e `ia_chaves`.
- **Não abra** as portas do Supabase para a internet e **não edite** arquivos em `/opt/janete/codigo`.
- **Não rode** `/opt/janete/desinstalar.sh` sem a pessoa pedir com todas as letras: ele apaga o app e as conversas.
- Não invente nomes de operações do Connector: busque as ferramentas disponíveis e leia o esquema antes de usar.

## O Connector e o terminal são coisas diferentes

O Hostinger Connector cuida da **conta**: listar VPS, ver plano, sistema, IP e estado, ler e criar registros de DNS. Ele **não executa comandos dentro da VPS**.

Os comandos Linux deste arquivo vão para o **Web Console** da VPS: você entrega **um bloco por vez**, diz o que deve aparecer e espera a pessoa colar e devolver o resultado. Se você roda num ambiente com terminal próprio (Claude Code, Codex) **e** a pessoa já tem acesso SSH a essa VPS funcionando, pode rodar os blocos você mesmo, avisando antes. Não crie chaves SSH, não mude senha e não desative verificação de identidade para conseguir acesso.

## Passo 1. Confirmar o Connector

Use uma operação de **leitura** do Connector para listar as VPS da conta. Uma resposta real (mesmo uma lista vazia) confirma o acesso. Só encontrar a ferramenta no catálogo não confirma login.

Se o Connector não estiver ligado, mande a pessoa para a tabela "Ligue o Hostinger Connector" do topo e espere.

## Passo 2. Escolher e conferir a VPS

Mostre nome, plano, sistema, IP e estado de cada VPS e espere a escolha. Na escolhida, confira pelo Connector:

| Item | Precisa ser |
|---|---|
| Sistema | Ubuntu 24.04 |
| Plano | KVM 2 ou maior (2 CPUs e 8 GB) |
| Estado | ligada (running) |

Se não for Ubuntu 24.04, pare e explique. Reinstalar o sistema não faz parte deste pedido.

## Passo 3. Conferir a VPS por dentro (Web Console)

Entregue este bloco para a pessoa colar no Terminal da VPS:

```bash
. /etc/os-release; echo "sistema: $PRETTY_NAME"
free -h | awk '/Mem:/{print "memoria: "$2}'
echo "portas 80/443:"; ss -ltnpH | awk '$4 ~ /:(80|443)$/' || true
[ -d /opt/janete ] && echo "janete: JA EXISTE" || echo "janete: nao instalada"
command -v docker >/dev/null && docker ps --format '{{.Names}}' || echo "docker: nao instalado"
```

Como ler o resultado:

| Linha | Pode seguir | Pare e explique |
|---|---|---|
| portas 80/443 | nada listado, ou só `nginx` | `caddy`, `traefik`, `docker-proxy` ou outro programa: outro projeto ocupa as portas (por exemplo o n8n dos outros guias). A Janete precisa de uma VPS separada ou das portas liberadas. Não derrube o outro projeto |
| janete | `nao instalada` | `JA EXISTE`: é atualização. Rodar o instalador de novo mantém dados e chaves e troca só o app. Confirme com a pessoa se é isso que ela quer |
| docker | não instalado, ou só contêineres `janete-app` e `supabase-*` | outros contêineres: mostre a lista e confirme que a pessoa sabe o que é antes de seguir |

## Passo 4. Apontar o subdomínio

O subdomínio precisa apontar para o IP da VPS **antes** da instalação, senão o certificado HTTPS falha.

**Se o domínio está na conta Hostinger:** leia os registros atuais pelo Connector. Mostre o registro que vai criar e espere o "ok":

| Tipo | Nome | Aponta para | TTL |
|---|---|---|---|
| A | `janete` (a parte antes do domínio) | IP da VPS escolhida | 300 |

Crie **sem apagar nem alterar** nenhum registro que já existe (site, e-mail, verificações). Se já existir um registro com o mesmo nome apontando para outro lugar, pare e pergunte.

**Se o domínio está em outro provedor:** diga exatamente o registro acima para a pessoa criar lá.

**Sem domínio próprio:** toda VPS Hostinger tem um endereço `srvXXXX.hstgr.cloud` (aparece no hostname da VPS), e qualquer subdomínio dele já aponta para ela. Dá para usar `janete.srvXXXX.hstgr.cloud` sem criar registro.

Confira no Web Console (tem que aparecer o IP da VPS):

```bash
getent ahostsv4 janete.seudominio.com.br | head -1
```

Troque pelo subdomínio real. Se não aparecer nada, espere 2 minutos e confira de novo.

## Passo 5. Instalar

Monte o comando com o subdomínio e o e-mail da pessoa e entregue:

```bash
curl -fsSL https://raw.githubusercontent.com/thiagocaliman/sdr-janete-vps/main/instalacao/instalar.sh -o /root/instalar-janete.sh
JANETE_DOMINIO=janete.seudominio.com.br JANETE_EMAIL=voce@email.com bash /root/instalar-janete.sh
```

Avise antes:
- leva de **15 a 30 minutos** na primeira vez, quase tudo download;
- a aba do Terminal precisa **ficar aberta** até o fim;
- não precisa digitar nada durante a instalação.

O instalador faz, nesta ordem: confere sistema e portas, instala Docker, nginx e certbot, baixa o código, sobe o Supabase (banco, login e arquivos), cria a estrutura do banco, compila e sobe o app, publica no nginx com HTTPS, agenda o backup diário (03:00 de Brasília, guarda 14 dias) e prepara o fechamento automático do cadastro.

**Sucesso:** no fim aparece `A AI PRO Janete está no ar:` com o endereço. Peça para a pessoa mandar as últimas linhas da tela (ou um print).

Se der erro, leia a mensagem e use a tabela "Se der erro" no fim deste arquivo. **Rodar o mesmo comando de novo é sempre seguro**: ele continua de onde parou e não apaga dados. Não proponha reinstalar a VPS.

## Passo 6. Conferir

Entregue este bloco (troque o subdomínio):

```bash
docker ps --format '{{.Names}} {{.Status}}' | grep -E 'janete|supabase'
curl -s -o /dev/null -w "site: %{http_code}\n" https://janete.seudominio.com.br/entrar
```

Esperado: `janete-app` e os `supabase-*` como `Up`, e `site: 200`. Se você tiver como abrir páginas da web, confira também que o endereço abre com HTTPS.

## Passo 7. A parte da pessoa, nas telas (você só orienta)

Faça nesta ordem, uma ação por vez, esperando ela confirmar:

1. **Criar a conta dona, agora.** Abrir o endereço e clicar em **Criar conta**. A primeira conta vira a dona do app. Cerca de 1 minuto depois o cadastro público fecha sozinho; os outros entram por convite, na tela **Equipe**. Enquanto ninguém se cadastra, o cadastro fica aberto para qualquer um que descobrir o endereço: por isso é agora.
2. **Conectar o WhatsApp:** Z-API e Evolution por QR code; Meta oficial e Zernio por chave. O QR code ela lê com o celular: **WhatsApp, Configurações, Dispositivos conectados, Conectar dispositivo**.
3. **Cérebro:** colar a chave da IA (OpenAI, Anthropic, OpenRouter ou Groq) direto na tela e escolher o modelo.
4. **Contexto:** contar para a Janete sobre a empresa, o cliente ideal, o preço, as objeções e quando passar para uma pessoa. Você pode ajudar a escrever o texto, mas quem cola na tela é ela.
5. **Voz (opcional):** chave da ElevenLabs na tela e escolha da voz.

Para conferir que o cadastro fechou (opcional, no Web Console): `ls /etc/cron.d/janete-cadastro` deve responder que o arquivo não existe, uns 2 minutos depois da conta criada.

## Passo 8. Teste real

Peça para a pessoa mandar uma mensagem **de outro celular** para o número conectado. Na tela **Chat** a mensagem tem que aparecer, e a Janete tem que responder no WhatsApp em poucos segundos.

Não mande mensagens para terceiros e não teste com contatos que não autorizaram.

## Entrega

Feche com um resumo do que foi comprovado, separando cada estado (um não prova o outro):

| Estado | Como foi comprovado |
|---|---|
| Connector com acesso à conta | lista de VPS real |
| VPS certa | escolhida pela pessoa, Ubuntu 24.04, KVM 2+ |
| Subdomínio apontando | `getent` devolveu o IP da VPS |
| Instalação | mensagem `A AI PRO Janete está no ar:` |
| Site com HTTPS | `site: 200` |
| Conta dona criada | a pessoa entrou no app |
| WhatsApp conectado | tela de conexão mostra o número |
| Resposta real | mensagem de outro celular respondida |

Se algo ficou pendente (por depender da pessoa), diga qual e não declare sucesso.

## Se der erro

| Mensagem do instalador | Causa mais comum | O que fazer |
|---|---|---|
| `as portas 80 ou 443 já estão em uso` | outro proxy na VPS (Caddy, Traefik, n8n dos outros guias) | usar outra VPS ou liberar as portas; não derrube o outro projeto sem a pessoa decidir |
| `o certificado HTTPS falhou` | o subdomínio ainda não aponta para a VPS | conferir o passo 4, esperar alguns minutos e rodar o mesmo comando de novo (ele já tenta 3 vezes) |
| `a estrutura do banco falhou` ou `os dados iniciais do banco falharam` | o banco não terminou de subir | ver `tail -20 /opt/janete/ultimo-erro-banco.log` e rodar de novo |
| `a compilação do app falhou` | falta de memória ou download interrompido | conferir `free -h` e rodar de novo |
| `o app não respondeu` | o app caiu ao subir | `docker logs --tail 50 janete-app` |
| `o nginx não respondeu` ou `configuração do nginx inválida` | conflito com outro site no nginx | `nginx -t` mostra a linha do problema |
| o Terminal fechou no meio | aba fechada ou conexão caiu | abrir o Terminal de novo e rodar o mesmo comando |
| convite ou "esqueci a senha" não chega por e-mail | a instalação não tem servidor de e-mail (SMTP) | no convite, botão **Copiar link** e mandar pelo WhatsApp; a senha se troca pelo ícone de chave no topo do app |

## Depois de instalado

| Para | Comando (Web Console) |
|---|---|
| Ver se está tudo de pé | `docker ps --format '{{.Names}} {{.Status}}'` |
| Ver os erros do app | `docker logs --tail 50 janete-app` |
| Reiniciar o app | `docker restart janete-app` |
| Fazer um backup agora | `sh /opt/janete/backup.sh` |
| Atualizar a Janete | o mesmo comando do passo 5 (mantém dados, domínio e chaves) |
| Desinstalar (só se a pessoa pedir com todas as letras) | `bash /opt/janete/desinstalar.sh` (pede para digitar `APAGAR`; os backups vão para `/root/janete-backups-DATA`) |

O backup diário fica dentro da própria VPS. Recomende à pessoa ativar também o backup da Hostinger, no painel da VPS.
