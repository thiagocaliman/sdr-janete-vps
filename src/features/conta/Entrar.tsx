import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { movimentoReduzido } from "@/components/janete/VooJanete";
import { Aviso, Botao, Campo } from "@/components/base";
import { supabase } from "@/integrations/supabase/client";

import { CampoSenhaConta, CartaoConta, classesConta as s } from "./CartaoConta";
import { TEMPO_GIRO_MS } from "./CriarConta";
import { assumirProgresso } from "./dono";
import { traduzirErroConta, type ErroConta } from "./erros";
import { ESPERA_NO_CENTRO_MS, usePalcoConta } from "./PalcoConta";
import { emailValido } from "./validacao";

const ERRO_EMAIL_FORMATO = "Confira o e-mail. Falta algo como @empresa.com.br.";

/**
 * /entrar: o cartão do palco do login (proposta A). Depois de entrar, o cartão fecha no ponto e a
 * bola se contrai no `carregando` do próprio palco, sem voo (a plataforma, quando recebe o símbolo
 * voando, abre o tour do fim do onboarding); 660 ms depois vai para "/", e o redirecionamento de lá
 * decide entre o onboarding e a plataforma.
 */
export function Entrar() {
  const navigate = useNavigate();
  const palco = usePalcoConta();
  // O e-mail digitado no Criar conta vem junto (a senha nunca).
  const [email, setEmail] = useState(() => palco.email);
  const [senha, setSenha] = useState("");
  const [emailTocado, setEmailTocado] = useState(false);
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState<ErroConta | null>(null);
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const emailOk = emailValido(email);
  const erroFormatoEmail = email.trim().length > 0 && !emailOk && (emailTocado || senha.length > 0);
  const bloqueada = !(emailOk && senha.length > 0) || entrando;

  const irParaInicio = () => navigate({ to: "/", replace: true });

  /**
   * A passagem do palco até o carregando no centro; sem ela (sem WAAPI, palco ausente), vai na hora.
   * Com a passagem feita, a sessão já existe e ir para "/" não depende desta tela continuar montada:
   * o Voltar do navegador no meio dela troca o filho do palco, mas a passagem segue até o fim, e o
   * carregando ficaria parado para sempre. Por isso o timer não é dos que o desmontar limparia.
   */
  const passarEIr = async () => {
    const ok = await palco.passagem({ voo: false });
    if (ok) {
      setTimeout(() => void irParaInicio(), ESPERA_NO_CENTRO_MS);
      return;
    }
    if (montado.current) void irParaInicio();
  };

  const entrar = async (ev?: FormEvent) => {
    ev?.preventDefault();
    if (bloqueada) return;
    // Enviar durante a entrada não espera a coreografia: a tela assenta na hora.
    palco.assentar();
    const inicio = Date.now();
    setEntrando(true);
    setErro(null);
    let falha: unknown = null;
    let idUsuario: string | null = null;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
      falha = error;
      idUsuario = data?.user?.id ?? null;
    } catch (e) {
      falha = e;
    }
    if (falha) {
      if (!montado.current) return;
      const problema = traduzirErroConta(falha, "entrar");
      setEntrando(false);
      setErro(problema);
      // A senha errada: a bola treme (não faz nada com movimento reduzido).
      if (problema.campo === "senha") palco.tremer();
      if (problema.campo) {
        const id = problema.campo === "email" ? "e-email" : "e-senha";
        setTimeout(() => document.getElementById(id)?.focus({ preventScroll: true }), 60);
      }
      return;
    }
    // O progresso da aba só some quando quem entrou é outra conta: a mesma conta (sessão que
    // expirou, sem ter clicado em Sair) continua de onde parou.
    assumirProgresso(idUsuario);
    // A tela pode ter saído enquanto o Supabase respondia (o Voltar do navegador): a sessão existe,
    // então vai direto, sem passagem.
    if (movimentoReduzido() || !montado.current) {
      await irParaInicio();
      return;
    }
    // O "Entrando…" já está na região de anúncio desde o clique: da passagem em diante o cartão fica
    // inert e sai da árvore de acessibilidade. O botão gira pelo menos 380 ms antes de o cartão fechar
    // (de novo fora dos timers do desmontar: se a tela sair nesse meio, vai direto).
    setTimeout(
      () => (montado.current ? void passarEIr() : void irParaInicio()),
      Math.max(0, TEMPO_GIRO_MS - (Date.now() - inicio)),
    );
  };

  const erroEmail = erroFormatoEmail ? ERRO_EMAIL_FORMATO : erro?.campo === "email" ? erro.mensagem : undefined;
  const erroSenha = erro?.campo === "senha" ? erro.mensagem : undefined;
  const erroGeral = erro && !erro.campo ? erro : null;

  return (
    <CartaoConta
      idTitulo="entrar-titulo"
      titulo="Entre na sua conta"
      subtitulo="Use o e-mail e a senha que você cadastrou."
      anuncio={entrando ? "Entrando…" : ""}
    >
      <form className={s.form} onSubmit={entrar} noValidate>
        <Campo
          id="e-email"
          rotulo="E-mail de trabalho"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(ev) => {
            setEmail(ev.target.value);
            palco.definirEmail(ev.target.value);
            if (erro) setErro(null);
          }}
          onBlur={() => setEmailTocado(true)}
          placeholder="voce@empresa.com.br"
          erro={erroEmail}
        />
        <CampoSenhaConta
          id="e-senha"
          valor={senha}
          aoMudar={(v) => {
            setSenha(v);
            if (erro) setErro(null);
          }}
          autoComplete="current-password"
          placeholder="Sua senha"
          erro={erroSenha}
        />
        {erroGeral ? (
          <Aviso tom="erro" compacto>
            {erroGeral.mensagem}
          </Aviso>
        ) : null}
        <Botao type="submit" tamanho="grande" largo disabled={bloqueada && !entrando} carregando={entrando} data-bloco="2">
          {entrando ? "Entrando" : "Entrar"}
        </Botao>
      </form>
      {/* Enquanto entra, a troca de tela fica travada (como o protótipo, que só troca em "aberto"):
          sair daqui no meio deixaria a sessão aberta numa tela do login. */}
      <p className={s.rodape} data-bloco="3" inert={entrando}>
        Ainda não tem conta?{" "}
        <Link to="/criar-conta" className={s.link}>
          Criar conta
        </Link>
      </p>
    </CartaoConta>
  );
}
