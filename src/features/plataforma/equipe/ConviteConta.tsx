import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { Aviso, Botao, Campo } from "@/components/base";
import { CampoSenhaConta, CartaoConta, classesConta as s } from "@/features/conta/CartaoConta";
import { assumirProgresso } from "@/features/conta/dono";
import { traduzirErroConta } from "@/features/conta/erros";
import { SENHA_MINIMA } from "@/features/conta/validacao";
import { supabase } from "@/integrations/supabase/client";

import { CHAVES } from "../dados/chaves";
import type { ClienteSupabase } from "../dados/colunas";
import { carregarEu } from "../dados/leituras";
import { claimsDoToken, entrouPorLinkDoEmail } from "./entrada";

// /convite (spec de ligar as telas ao banco, 2.2 e 2.4; decisões 1, 2 e 15): quem abre o link do
// convite (o e-mail do Supabase ou o "Copiar link" do admin) chega aqui já com a sessão do Supabase
// (o cliente lê o link sozinho). A pessoa escolhe o nome e a senha (auth.updateUser), a tela chama
// aceitarConvite (que cria o membro com o papel do convite) e vai direto para /app, sem onboarding.
// A conta que já existia (criada sem convite, sem `invited_at`) troca a senha antiga, porque quem
// criou a conta podia saber essa senha; o aceitar encerra as outras sessões dela (equipe.server.ts).
// A sessão que entrou só com a senha não vê o formulário: só o link do e-mail serve para aceitar.
// Fica no cartão do login (o PalcoConta da rota de layout _conta).

/** O tamanho máximo do nome (o mesmo do servidor, equipe.server.ts). */
export const MAX_NOME_CONVITE = 80;

/** A resposta do aceitarConvite (equipe.functions.ts), no que a tela usa. */
export type RespostaAceitar = { ok: boolean; erro?: string; membroId?: string };

export interface PropsConviteConta {
  /** O cliente do Supabase (testes passam um falso). Padrão: o do navegador. */
  cliente?: ClienteSupabase | undefined;
  /** A função de servidor (testes passam uma falsa). Padrão: aceitarConvite de equipe.functions.ts. */
  aceitar?: ((nome: string) => Promise<RespostaAceitar>) | undefined;
}

type Situacao =
  | { tipo: "lendo" }
  | { tipo: "confirmar"; tokenHash: string; tipoLink: "invite" | "magiclink" }
  | { tipo: "sem_link"; motivo: "vencido" | "sem_sessao" | "senha" }
  | { tipo: "pronto"; email: string; contaExistente: boolean };

/** Quem entrou só com a senha: o convite pede o link do e-mail (o de convite ou o de acesso). */
const TEXTO_LINK_NECESSARIO =
  "Para entrar na equipe, abra o link que chegou no seu e-mail. Se ele já foi usado ou venceu, peça ao admin para reenviar o convite.";

/** O texto de cada recusa do aceitarConvite. */
export function textoDoAceite(erro: string | undefined): string {
  switch (erro) {
    case "nao_encontrado":
      return "Não achamos o seu convite. Ele pode ter sido cancelado. Peça um convite novo ao admin.";
    case "link_necessario":
      return TEXTO_LINK_NECESSARIO;
    case "sem_acesso":
      return "Sua conta está desativada. Fale com o admin da sua equipe.";
    case "email_em_uso":
      return "Esse e-mail já está na equipe com outra conta. Fale com o admin da sua equipe.";
    case "nome_vazio":
      return "Escreva o seu nome.";
    default:
      return "Não deu para entrar agora. Confira a internet e tente de novo.";
  }
}

/**
 * O link novo do convite (equipe.server.ts, linkDoConviteSeguro): /convite?token_hash=...&type=...
 * O código só é usado no clique em "Abrir convite", e não ao abrir a página, porque o robô de prévia
 * do WhatsApp (e de outros apps) abre o link antes da pessoa e gastaria o código de uso único.
 */
export function codigoDoLink(href: string): { tokenHash: string; tipoLink: "invite" | "magiclink" } | null {
  try {
    const url = new URL(href);
    const tokenHash = url.searchParams.get("token_hash");
    const tipo = url.searchParams.get("type");
    if (!tokenHash || (tipo !== "invite" && tipo !== "magiclink")) return null;
    return { tokenHash, tipoLink: tipo };
  } catch {
    return null;
  }
}

/** O link trouxe um erro do Supabase (vencido, já usado): `#error=...` ou `?error=...`. */
export function linkComErro(href: string): boolean {
  try {
    const url = new URL(href);
    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    return !!(hash.get("error") || hash.get("error_code") || url.searchParams.get("error") || url.searchParams.get("error_code"));
  } catch {
    return false;
  }
}

const aceitarPadrao = async (nome: string): Promise<RespostaAceitar> => {
  const { aceitarConvite } = await import("./equipe.functions");
  return aceitarConvite({ data: { nome } });
};

export function ConviteConta({ cliente: clienteProp, aceitar = aceitarPadrao }: PropsConviteConta) {
  const cliente = clienteProp ?? supabase;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [situacao, setSituacao] = useState<Situacao>({ tipo: "lendo" });
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [erroNome, setErroNome] = useState<string | undefined>();
  const [erroSenha, setErroSenha] = useState<string | undefined>();
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);
  const [abrindo, setAbrindo] = useState(false);
  const [recarga, setRecarga] = useState(0);
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  // A sessão do link: o cliente do Supabase lê o endereço sozinho; o getSession espera essa leitura.
  useEffect(() => {
    let vivo = true;
    void (async () => {
      const codigo = typeof window !== "undefined" ? codigoDoLink(window.location.href) : null;
      if (codigo) {
        setSituacao({ tipo: "confirmar", ...codigo });
        return;
      }
      const vencido = typeof window !== "undefined" && linkComErro(window.location.href);
      let usuario: { id: string; email?: string | undefined; invited_at?: string | undefined } | null = null;
      let token: string | undefined;
      try {
        const { data } = await cliente.auth.getSession();
        usuario = data.session?.user ?? null;
        token = data.session?.access_token;
      } catch {
        usuario = null;
      }
      if (!vivo) return;
      if (!usuario) {
        setSituacao({ tipo: "sem_link", motivo: vencido ? "vencido" : "sem_sessao" });
        return;
      }
      // Quem já entrou (o convite já foi aceito) vai direto para a plataforma.
      try {
        const eu = await carregarEu(cliente);
        if (!vivo) return;
        if (eu) {
          await navigate({ to: "/app", replace: true });
          return;
        }
      } catch {
        // sem saber, mostra o formulário: o aceitarConvite responde se já é membro
      }
      if (!vivo) return;
      // A sessão que entrou só com a senha não aceita (o servidor confere): avisa antes de a pessoa
      // trocar a senha à toa. O token que não dá para ler mostra o formulário, e o servidor decide.
      const claims = claimsDoToken(token);
      if (claims && !entrouPorLinkDoEmail(claims)) {
        setSituacao({ tipo: "sem_link", motivo: "senha" });
        return;
      }
      // Só muda o texto: a conta que o convite criou tem `invited_at`; a criada sem convite, não.
      setSituacao({ tipo: "pronto", email: usuario.email ?? "", contaExistente: !usuario.invited_at });
    })();
    return () => {
      vivo = false;
    };
  }, [cliente, navigate, recarga]);

  // O clique em "Abrir convite": só aqui o código do link é usado (verifyOtp cria a sessão).
  const abrirConvite = async () => {
    if (abrindo || situacao.tipo !== "confirmar") return;
    setAbrindo(true);
    let ok = false;
    try {
      const { error } = await cliente.auth.verifyOtp({ token_hash: situacao.tokenHash, type: situacao.tipoLink });
      ok = !error;
    } catch {
      ok = false;
    }
    // o código não fica no endereço (nem no histórico) depois de usado
    if (typeof window !== "undefined") window.history.replaceState(window.history.state, "", window.location.pathname);
    if (!montado.current) return;
    setAbrindo(false);
    if (!ok) {
      setSituacao({ tipo: "sem_link", motivo: "vencido" });
      return;
    }
    setSituacao({ tipo: "lendo" });
    setRecarga((n) => n + 1);
  };

  const entrar = async (ev?: FormEvent) => {
    ev?.preventDefault();
    if (entrando || situacao.tipo !== "pronto") return;
    const limpo = nome.replace(/\s+/g, " ").trim();
    const faltaNome = !limpo ? "Escreva o seu nome." : undefined;
    const faltaSenha = senha.length < SENHA_MINIMA ? `Use pelo menos ${SENHA_MINIMA} caracteres.` : undefined;
    setErroNome(faltaNome);
    setErroSenha(faltaSenha);
    setErroGeral(null);
    if (faltaNome || faltaSenha) {
      document.getElementById(faltaNome ? "cv-nome" : "cv-senha")?.focus();
      return;
    }

    setEntrando(true);
    // 1) a senha (e o nome nos dados da conta)
    try {
      const { error } = await cliente.auth.updateUser({ password: senha, data: { nome: limpo } });
      // Tentar de novo depois de uma falha do aceite: a senha já é esta, e tudo bem.
      if (error && (error as { code?: string }).code !== "same_password") {
        if (!montado.current) return;
        const problema = traduzirErroConta(error, "criar");
        setEntrando(false);
        if (problema.campo === "senha") {
          setErroSenha(problema.mensagem);
          document.getElementById("cv-senha")?.focus();
        } else {
          setErroGeral(problema.mensagem);
        }
        return;
      }
    } catch (e) {
      if (!montado.current) return;
      setEntrando(false);
      setErroGeral(traduzirErroConta(e, "criar").mensagem);
      return;
    }

    // 2) entra na equipe (o membro nasce com o papel do convite). Na conta que já existia, o servidor
    // encerra as outras sessões antes, depois da senha nova gravada aqui.
    let r: RespostaAceitar;
    try {
      r = await aceitar(limpo);
    } catch {
      r = { ok: false, erro: "falha" };
    }
    if (!r.ok) {
      if (!montado.current) return;
      setEntrando(false);
      if (r.erro === "nome_vazio") {
        setErroNome(textoDoAceite(r.erro));
        document.getElementById("cv-nome")?.focus();
      } else {
        setErroGeral(textoDoAceite(r.erro));
      }
      return;
    }

    // 3) direto para a plataforma (decisão 2: quem entra pelo convite não passa pelo onboarding).
    // O Eu "sem acesso" que estiver em cache não serve mais.
    try {
      const { data } = await cliente.auth.getSession();
      assumirProgresso(data.session?.user.id ?? null);
    } catch {
      assumirProgresso(null);
    }
    queryClient.removeQueries({ queryKey: CHAVES.eu });
    await navigate({ to: "/app", replace: true });
  };

  if (situacao.tipo === "lendo") {
    return (
      <CartaoConta idTitulo="convite-titulo" titulo="Abrindo o convite" subtitulo="Só um instante." anuncio="Abrindo o convite…">
        <div className={s.form} />
      </CartaoConta>
    );
  }

  if (situacao.tipo === "confirmar") {
    return (
      <CartaoConta
        idTitulo="convite-titulo"
        titulo="Você recebeu um convite"
        subtitulo="Toque no botão para abrir o seu convite e entrar na equipe."
        anuncio={abrindo ? "Abrindo o convite…" : ""}
      >
        <div className={s.form}>
          <Botao type="button" tamanho="grande" largo carregando={abrindo} onClick={() => void abrirConvite()} data-bloco="2">
            {abrindo ? "Abrindo" : "Abrir convite"}
          </Botao>
        </div>
      </CartaoConta>
    );
  }

  if (situacao.tipo === "sem_link" && situacao.motivo === "senha") {
    return (
      <CartaoConta idTitulo="convite-titulo" titulo="Abra o link do seu e-mail" subtitulo={TEXTO_LINK_NECESSARIO}>
        {null}
      </CartaoConta>
    );
  }

  if (situacao.tipo === "sem_link") {
    return (
      <CartaoConta
        idTitulo="convite-titulo"
        titulo="Este link não vale mais"
        subtitulo={
          situacao.motivo === "vencido"
            ? "O link do convite venceu ou já foi usado. Peça ao admin para reenviar o convite."
            : "Abra o link do convite que chegou no seu e-mail. Se ele venceu, peça ao admin para reenviar."
        }
      >
        <p className={s.rodape} data-bloco="3">
          Já criou a sua senha?{" "}
          <Link to="/entrar" className={s.link}>
            Entrar
          </Link>
        </p>
      </CartaoConta>
    );
  }

  return (
    <CartaoConta
      idTitulo="convite-titulo"
      titulo="Entre na equipe"
      subtitulo={
        (situacao.email ? `Você foi convidado com ${situacao.email}. ` : "") +
        (situacao.contaExistente
          ? "Escolha o nome que a equipe vai ver e uma senha nova: a antiga deixa de valer, e a sua conta sai dos outros aparelhos."
          : "Escolha o nome que a equipe vai ver e a sua senha.")
      }
      anuncio={entrando ? "Entrando…" : ""}
    >
      <form className={s.form} onSubmit={entrar} noValidate>
        <Campo
          id="cv-nome"
          rotulo="Seu nome"
          autoComplete="name"
          maxLength={MAX_NOME_CONVITE}
          value={nome}
          onChange={(ev) => {
            setNome(ev.target.value);
            setErroNome(undefined);
          }}
          placeholder="Como a equipe vai te chamar"
          erro={erroNome}
        />
        <CampoSenhaConta
          id="cv-senha"
          valor={senha}
          aoMudar={(v) => {
            setSenha(v);
            setErroSenha(undefined);
          }}
          autoComplete="new-password"
          comMedida
          placeholder={situacao.contaExistente ? "Crie uma senha nova" : "Crie uma senha"}
          erro={erroSenha}
        />
        {erroGeral ? (
          <Aviso tom="erro" compacto>
            {erroGeral}
          </Aviso>
        ) : null}
        <Botao type="submit" tamanho="grande" largo carregando={entrando} data-bloco="2">
          {entrando ? "Entrando" : "Entrar na equipe"}
        </Botao>
      </form>
    </CartaoConta>
  );
}
