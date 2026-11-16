# AI PRO Janete na sua VPS

A Janete é uma SDR de WhatsApp com inteligência artificial: atende os leads, qualifica, responde em texto ou em áudio, move cada lead no funil e passa a conversa para a equipe quando precisa de uma pessoa. Ela roda inteira na sua VPS, com banco de dados próprio.

Tempo total: uns 30 minutos, a maior parte esperando o instalador baixar e montar tudo.

Código do projeto (aberto, é dele que o instalador baixa tudo): https://github.com/thiagocaliman/sdr-janete-vps

## O que você precisa

- Uma VPS **Ubuntu 24.04** na Hostinger (KVM 2 ou maior). O ideal é uma VPS só para a Janete. Ela pode dividir a VPS com outros projetos que usem o nginx, mas não com projetos que usem o Caddy ou o Traefik nas portas 80 e 443 (como o n8n dos outros guias): o instalador confere isso e para antes de mexer em qualquer coisa.
- Um **domínio ou subdomínio** para a Janete, por exemplo `janete.seudominio.com.br`.
- Uma chave de inteligência artificial (OpenAI, Anthropic, OpenRouter ou Groq) e um WhatsApp para conectar. A voz em áudio (ElevenLabs) é opcional.

## 1. Apontar o domínio

No painel do seu domínio, crie um registro:

| Tipo | Nome | Aponta para |
|---|---|---|
| A | `janete` (ou o subdomínio que você escolheu) | o IP da sua VPS |

O IP aparece no painel da VPS na Hostinger. A propagação costuma levar poucos minutos.

## 2. Rodar o instalador

No painel da Hostinger, abra a VPS e clique em **Terminal** (Web Console). Cole o comando abaixo e aperte Enter:

```bash
curl -fsSL https://raw.githubusercontent.com/thiagocaliman/sdr-janete-vps/main/instalacao/instalar.sh | bash
```

Ele pergunta duas coisas:

1. **Domínio do app**: digite o subdomínio do passo 1, sem `https://`.
2. **Seu e-mail**: usado só para o certificado HTTPS gratuito.

Depois disso não precisa fazer nada. Ele instala o Docker, o Supabase (banco, login e arquivos), o app, o HTTPS e o backup diário. No fim aparece:

```
A AI PRO Janete está no ar:  https://janete.seudominio.com.br
```

Se der erro no certificado HTTPS, quase sempre é o domínio que ainda não aponta para a VPS. Confira o passo 1, espere alguns minutos e rode o mesmo comando de novo.

## 3. Criar a sua conta

Abra o endereço no navegador e clique em **Criar conta**. A primeira conta vira a **dona do app**. Depois disso ninguém mais se cadastra sozinho: as outras pessoas entram por convite, na tela **Equipe**.

## 4. Configurar a Janete

O próprio app conduz o passo a passo:

1. **Conectar o WhatsApp**: Z-API e Evolution conectam por QR code; Meta oficial e Zernio, por chave.
2. **Cérebro**: cole a chave da inteligência artificial e escolha o modelo.
3. **Contexto**: conte para a Janete sobre a sua empresa, o cliente ideal, o preço, as objeções e quando passar para uma pessoa.
4. **Voz** (opcional): cole a chave da ElevenLabs e escolha a voz das respostas em áudio.

Pronto. Mande uma mensagem para o número conectado e veja a Janete responder no **Chat**.

## Usar com um agente de inteligência artificial

O caminho recomendado é o arquivo [GUIA-JANETE-AGENTE-HOSTINGER.md](GUIA-JANETE-AGENTE-HOSTINGER.md): ele foi escrito para o agente seguir, com os canais oficiais do Hostinger Connector, as regras de segurança e o pedido pronto. Anexe ele no seu agente e siga o topo do arquivo.

Se preferir usar este guia mesmo, anexe e mande:

> Use o Hostinger Connector para listar minhas VPS e aguarde eu escolher. Na VPS escolhida, confira se é Ubuntu 24.04, se as portas 80 e 443 estão livres ou já atendidas pelo nginx, e se o domínio que vou informar aponta para o IP dela. Depois me acompanhe no Web Console para rodar o instalador deste guia, um passo por vez. Não reinstale a VPS, não apague nada que já existe nela e não compre nenhum serviço. A criação da conta, as senhas, as chaves e o QR code do WhatsApp eu faço direto nas telas.

## Depois de instalado

| Para | Faça |
|---|---|
| Atualizar a Janete | rode o mesmo comando de instalação de novo (seus dados ficam) |
| Ver os erros do app | `docker logs --tail 50 janete-app` |
| Reiniciar o app | `docker restart janete-app` |
| Desinstalar a Janete | `bash /opt/janete/desinstalar.sh` |

A Janete guarda sozinha uma cópia por dia, você não precisa fazer nada. Se algo der muito errado, o caminho mais simples é voltar a VPS inteira pelo backup da Hostinger, no painel da sua VPS.

O desinstalador pede para você digitar `APAGAR` e remove só a Janete: o app, o banco com as conversas, o site dela no nginx e o certificado. O Docker, o nginx e os outros projetos da VPS continuam como estavam, e os backups vão para uma pasta `/root/janete-backups-DATA`. Para instalar de novo, rode o comando de instalação.

## O que ainda não vem pronto

- **E-mail**: sem um servidor de envio (SMTP), o convite e a recuperação de senha não chegam por e-mail. Use o botão **Copiar link** do convite e mande pelo WhatsApp. Para trocar a senha, use o ícone de chave no topo do app.
