# AI PRO Janete: instruções para agentes

Este arquivo é para agentes de inteligência artificial (Claude, Codex, Gemini ou outro) que vão ajudar uma pessoa a instalar, atualizar ou consertar a AI PRO Janete na VPS dela. A pessoa quase sempre é leiga: fale em português simples, um passo por vez, e confira o resultado de cada passo antes de seguir.

O passo a passo para humanos está em `GUIA-JANETE.md`. Este arquivo complementa o guia com o que um agente precisa saber.

## O que é

A Janete é uma SDR de WhatsApp: atende os leads, qualifica, responde em texto ou áudio, move o lead no funil e passa a conversa para a equipe. Roda inteira na VPS da pessoa: app, banco de dados (Supabase próprio) e arquivos.

Repositório: https://github.com/thiagocaliman/sdr-janete-vps

## Antes de instalar, confira

1. A VPS é **Ubuntu 24.04** e você está como **root** (no Web Console da Hostinger já é root).
2. As portas **80 e 443** estão livres ou já são do **nginx**. Se forem de outro programa (Caddy, Traefik, o n8n de outros guias), pare e avise: a Janete precisa de uma VPS separada ou das portas liberadas. O instalador também confere isso e para sozinho.
3. O **domínio ou subdomínio** da pessoa tem um registro A apontando para o IP da VPS. Sem isso o certificado HTTPS falha.
4. A VPS é KVM 2 ou maior.

Conferir as portas: `ss -ltnp | grep -E ':(80|443) '`
Conferir o domínio: `dig +short janete.seudominio.com.br` (tem que devolver o IP da VPS).

## Instalar

No Web Console da VPS:

```bash
curl -fsSL https://raw.githubusercontent.com/thiagocaliman/sdr-janete-vps/main/instalacao/instalar.sh | bash
```

Ele pergunta o **domínio** (sem `https://`) e o **e-mail** (só para o certificado). Leva de 15 a 30 minutos, a maior parte é download. No fim aparece `A AI PRO Janete está no ar:` com o endereço.

Para rodar sem perguntas (quando você executa o comando pela pessoa, sem teclado):

```bash
curl -fsSL https://raw.githubusercontent.com/thiagocaliman/sdr-janete-vps/main/instalacao/instalar.sh -o /root/instalar-janete.sh
JANETE_DOMINIO=janete.seudominio.com.br JANETE_EMAIL=voce@email.com bash /root/instalar-janete.sh
```

**Atualizar** é rodar o mesmo comando de novo: ele reaproveita o domínio e o e-mail, mantém os dados e as chaves e troca só o app.

## Depois de instalar

Estes passos são da pessoa, nas telas do app. Você orienta, não faz por ela.

1. Abrir o endereço e clicar em **Criar conta**. A primeira conta vira a dona do app. Cerca de um minuto depois o cadastro público fecha sozinho e as outras pessoas só entram por convite, na tela Equipe.
2. Seguir o passo a passo da tela: conectar o WhatsApp (Z-API, Evolution, Meta oficial ou Zernio), colar a chave da inteligência artificial (OpenAI, Anthropic, OpenRouter ou Groq), preencher o Contexto e, se quiser, a voz (ElevenLabs).
3. Mandar uma mensagem para o número conectado e ver a resposta na tela Chat.

## O que você nunca faz

- Não reinstale o sistema da VPS, não apague o que já existe nela e não compre nem contrate nada.
- Não peça senha, chave de inteligência artificial nem token no chat, e não digite nada disso pela pessoa. Conta, senha, chaves e QR code do WhatsApp ela faz direto nas telas.
- Não mostre o conteúdo de `/opt/janete/app.env`, `/opt/janete/build.env`, `/opt/janete/instalacao.env` nem de `/opt/janete/supabase/.env`. São as chaves da instalação.
- Não faça `select *` nas tabelas `motor`, `conexoes` e `ia_chaves`: elas guardam segredos. Se precisar olhar o banco, peça só as colunas necessárias.
- Não abra as portas do Supabase para a internet. Ele fica preso em `127.0.0.1` de propósito.
- Não rode `/opt/janete/desinstalar.sh` sem a pessoa pedir com todas as letras: ele apaga o app e o banco com as conversas.
- Não edite arquivos em `/opt/janete/codigo`: a atualização descarta qualquer mudança feita ali.

## Se der erro

| Mensagem do instalador | Causa mais comum | O que fazer |
|---|---|---|
| `as portas 80 ou 443 já estão em uso` | outro proxy na VPS (Caddy, Traefik) | usar outra VPS ou liberar as portas; não derrube o outro projeto sem a pessoa decidir |
| `o certificado HTTPS falhou` | o domínio ainda não aponta para a VPS | conferir o registro A, esperar alguns minutos e rodar o instalador de novo |
| `a estrutura do banco falhou` ou `os dados iniciais do banco falharam` | banco não terminou de subir | ver `/opt/janete/ultimo-erro-banco.log` e rodar de novo |
| `a compilação do app falhou` | falta de memória ou download interrompido | conferir `free -h` e rodar de novo |
| `o app não respondeu` | o app caiu ao subir | `docker logs --tail 50 janete-app` |
| `o nginx não respondeu` ou `configuração do nginx inválida` | conflito com outro site no nginx | `nginx -t` mostra a linha do problema |

Rodar o instalador de novo é sempre seguro: ele continua de onde parou e não apaga dados.

## Mapa do servidor

| Onde | O que é |
|---|---|
| `/opt/janete/codigo` | cópia deste repositório |
| `/opt/janete/app-atual` | o app compilado, servido pelo contêiner `janete-app` em `127.0.0.1:3010` |
| `/opt/janete/supabase` | o Supabase próprio (contêineres `supabase-*`) |
| `/opt/janete/backups` | backup diário às 03:00 de Brasília, guarda 14 dias |
| `/etc/cron.d/janete-backup` | agendamento do backup |
| `/etc/nginx` | o site da Janete no nginx, com o certificado da Let's Encrypt |

Comandos do dia a dia:

| Para | Comando |
|---|---|
| Ver se está tudo de pé | `docker ps --format '{{.Names}} {{.Status}}'` |
| Ver os erros do app | `docker logs --tail 50 janete-app` |
| Reiniciar o app | `docker restart janete-app` |
| Fazer um backup agora | `sh /opt/janete/backup.sh` |
| Desinstalar (só se a pessoa pedir) | `bash /opt/janete/desinstalar.sh` |

## Mapa do repositório

| Pasta | O que tem |
|---|---|
| `instalacao/` | instalador, desinstalador, backup e o modelo do nginx |
| `banco/` | estrutura e dados iniciais do banco |
| `src/features/mensageria` | o motor: recebe o WhatsApp, chama a inteligência artificial e responde |
| `src/features/plataforma` | as telas: Chat, Kanban, Contatos, Dashboard, Equipe, Contexto e Configuração |

Para mexer no código: `bun install`, `bun run dev` para rodar, `bun run test` para os testes e `bun run build` para compilar.

## O que ainda não vem pronto

- **E-mail**: sem servidor de envio (SMTP), convite e recuperação de senha não chegam por e-mail. O convite tem o botão **Copiar link** e a senha se troca pelo ícone de chave no topo do app.
