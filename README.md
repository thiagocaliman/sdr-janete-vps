# AI PRO Janete

A Janete é uma SDR de WhatsApp com inteligência artificial: atende os leads que chegam no seu WhatsApp, qualifica, responde em texto ou em áudio com voz natural, move cada lead no funil e passa a conversa para a sua equipe quando precisa de uma pessoa.

Tudo roda na **sua própria VPS**: o app, o banco de dados e os arquivos. Você não paga mensalidade de plataforma, só a VPS e o uso das chaves de inteligência artificial que você cadastrar.

## O que vem pronto

- **Chat** com todas as conversas do WhatsApp, em tempo real, com áudio, imagem e documento.
- **Kanban** do funil (Novo, Em qualificação, Qualificado, Em negociação, Ganho, Perdido).
- **Contatos** com resumo e anotações que a Janete escreve sozinha.
- **Dashboard** com conversas, tempo de resposta, funil e custo da inteligência artificial.
- **Equipe**: convide pessoas como admin ou atendente; a Janete passa a conversa para quem está livre.
- **Contexto**: tudo o que a Janete sabe sobre a sua empresa, com histórico de versões.
- **Configuração**: WhatsApp (Z-API, Evolution, Meta oficial ou Zernio), o cérebro (OpenAI, Anthropic, OpenRouter ou Groq) e a voz (ElevenLabs).
- Modo claro e escuro, troca de senha e backup diário automático.

## Instalar

**Jeito mais fácil: com o seu agente de IA.** Se você usa ChatGPT, Claude, Claude Code, Codex ou um editor com o **Hostinger Connector**, baixe o arquivo [GUIA-JANETE-AGENTE-HOSTINGER.md](GUIA-JANETE-AGENTE-HOSTINGER.md), anexe numa conversa nova e mande o pedido que está no topo dele. O agente lista as suas VPS, aponta o subdomínio e te acompanha no Web Console, um passo por vez.

Para fazer sozinho, você precisa de:

1. Uma VPS **Ubuntu 24.04** (na Hostinger, a KVM 2 ou maior).
2. Um **domínio ou subdomínio** apontando para o IP da VPS (registro A), por exemplo `janete.seudominio.com.br`.

Abra o **Web Console** da VPS no painel da Hostinger e cole:

```bash
curl -fsSL https://raw.githubusercontent.com/thiagocaliman/sdr-janete-vps/main/instalacao/instalar.sh | bash
```

O instalador pergunta o domínio e o seu e-mail e faz o resto sozinho, em uns 15 a 30 minutos (a maior parte é download):

- instala o Docker, o nginx e o certificado HTTPS gratuito;
- sobe o Supabase próprio (banco, login, arquivos e tempo real), fechado para a internet;
- cria o banco da Janete;
- compila e publica o app;
- liga o backup diário.

No fim ele mostra o endereço. Abra, crie a sua conta (a **primeira conta vira a dona do app**) e siga o passo a passo da tela.

## Atualizar

Rode o mesmo comando de instalação de novo. Ele baixa a versão nova do app e recompila, sem mexer nos seus dados nem nas suas chaves.

## Backup

Todo dia às 03:00 (horário de Brasília) o servidor guarda uma cópia em `/opt/janete/backups`, mantendo os últimos 14 dias. Cada arquivo tem o banco inteiro, as mídias e a configuração.

Para fazer um backup na hora:

```bash
/opt/janete/backup.sh
```

Os backups ficam na própria VPS. Para se proteger de perder a VPS inteira, baixe uma cópia de vez em quando ou ative os backups da Hostinger.

## Desinstalar

```bash
bash /opt/janete/desinstalar.sh
```

Ele pede para você digitar `APAGAR` e remove só a Janete: o app, o Supabase dela (com o banco e as conversas), a pasta `/opt/janete`, o site no nginx, o certificado HTTPS e os agendamentos. O Docker, o nginx, o certbot e os outros projetos da VPS não são tocados. Os backups são guardados em `/root/janete-backups-DATA` antes de apagar.

Para instalar de novo depois, rode o comando de instalação.

## Onde fica cada coisa

| Caminho | O que é |
|---|---|
| `/opt/janete/codigo` | o código do app |
| `/opt/janete/app-atual` | o app compilado que está no ar (a versão anterior fica em `app-anterior`) |
| `/opt/janete/supabase` | o Supabase (banco, login, arquivos) |
| `/opt/janete/app.env` | a configuração do app (tem chaves: não compartilhe) |
| `/opt/janete/backups` | os backups diários |

Comandos úteis:

```bash
docker logs --tail 50 janete-app
```

```bash
docker restart janete-app
```

## Para quem quer mexer no código

- Stack: TanStack Start (React 19 com renderização no servidor), Vite, Tailwind 4, React Query e Supabase.
- `src/`: o app. `banco/`: a estrutura e os dados iniciais do banco. `instalacao/`: o instalador.
- Testes: `bun install` e depois `bunx vitest run`.
- Depois de mudar o código no servidor, recompile rodando o instalador de novo.
