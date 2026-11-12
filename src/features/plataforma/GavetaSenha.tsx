import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { CheckCircle2 } from "lucide-react";

import { Botao } from "@/components/base";
import { CampoSenha } from "@/components/base/CampoSenha";
import { type Classes } from "@/components/base/cx";
import { traduzirErroConta } from "@/features/conta/erros";
import { SENHA_MINIMA } from "@/features/conta/validacao";

import { FecharGaveta, Gaveta } from "./comum/Gaveta";
import estilos from "./equipe/GavetaConvite.module.css";

// "Trocar senha" (no topo, ao lado do Sair): a pessoa logada confirma a senha atual e escolhe uma
// nova. A senha atual é conferida entrando de novo com ela (signInWithPassword, o mesmo usuário),
// e só então a nova é gravada (updateUser). Não depende de e-mail: funciona sem SMTP.

const s = estilos as Classes<"cvCab" | "cvCabTexto" | "cvTitulo" | "cvApoio" | "cvCorpo" | "cvPe" | "cvEnviar" | "cvCancelar" | "cvSr">;

/** O pedaço do cliente do Supabase Auth que a troca usa (os testes passam um falso). */
export interface AuthSenha {
  getUser(): Promise<{ data: { user: { email?: string | null } | null }; error: unknown }>;
  signInWithPassword(c: { email: string; password: string }): Promise<{ error: unknown }>;
  updateUser(u: { password: string }): Promise<{ error: unknown }>;
}

interface Props {
  aberta: boolean;
  aoFechar: () => void;
  auth: AuthSenha;
}

export function GavetaSenha({ aberta, aoFechar, auth }: Props) {
  return (
    <Gaveta aberta={aberta} aoFechar={aoFechar} rotulo="Trocar senha">
      {aberta ? <ConteudoSenha aoFechar={aoFechar} auth={auth} /> : null}
    </Gaveta>
  );
}

type Erros = { atual?: string | undefined; nova?: string | undefined; confirma?: string | undefined; geral?: string | undefined };

function ConteudoSenha({ aoFechar, auth }: Omit<Props, "aberta">) {
  const base = useId();
  const id = { atual: `${base}-atual`, nova: `${base}-nova`, confirma: `${base}-confirma` };

  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirma, setConfirma] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);
  const [pronto, setPronto] = useState(false);
  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const falhar = (e: Erros) => {
    setErros(e);
    setSalvando(false);
    const primeiro = e.atual ? id.atual : e.nova ? id.nova : e.confirma ? id.confirma : null;
    if (primeiro) document.getElementById(primeiro)?.focus();
  };

  const salvar = async () => {
    if (salvando) return;
    const e: Erros = {};
    if (!atual) e.atual = "Digite a sua senha atual.";
    if (nova.length < SENHA_MINIMA) e.nova = `Use pelo menos ${SENHA_MINIMA} caracteres.`;
    else if (nova === atual) e.nova = "A senha nova precisa ser diferente da atual.";
    if (!e.nova && confirma !== nova) e.confirma = "As duas senhas não são iguais.";
    if (e.atual || e.nova || e.confirma) {
      falhar(e);
      return;
    }

    setErros({});
    setSalvando(true);
    try {
      const { data } = await auth.getUser();
      const email = data.user?.email;
      if (!email) {
        falhar({ geral: "A sua sessão acabou. Saia, entre de novo e tente outra vez." });
        return;
      }
      // 1) a senha atual confere?
      const entrada = await auth.signInWithPassword({ email, password: atual });
      if (!montado.current) return;
      if (entrada.error) {
        const t = traduzirErroConta(entrada.error, "entrar");
        falhar(t.campo === "senha" || t.campo === "email" ? { atual: "A senha atual não confere." } : { geral: t.mensagem });
        return;
      }
      // 2) grava a nova
      const troca = await auth.updateUser({ password: nova });
      if (!montado.current) return;
      if (troca.error) {
        const t = traduzirErroConta(troca.error, "criar");
        falhar(t.campo === "senha" ? { nova: t.mensagem } : { geral: t.mensagem });
        return;
      }
      setSalvando(false);
      setPronto(true);
    } catch (erro) {
      if (!montado.current) return;
      falhar({ geral: traduzirErroConta(erro, "criar").mensagem });
    }
  };

  const tecla = (ev: KeyboardEvent<HTMLInputElement>) => {
    if (ev.key !== "Enter") return;
    ev.preventDefault();
    void salvar();
  };

  return (
    <>
      <div className={s.cvCab}>
        <div className={s.cvCabTexto}>
          <h2 className={s.cvTitulo}>Trocar senha</h2>
          <p className={s.cvApoio}>Confirme a senha que você usa hoje e escolha a nova.</p>
        </div>
        <FecharGaveta aoFechar={aoFechar} />
      </div>

      {pronto ? (
        <div className={s.cvCorpo} role="status">
          <p style={{ display: "flex", gap: 8, alignItems: "center", margin: 0, fontWeight: 600 }}>
            <CheckCircle2 size={20} strokeWidth={1.75} aria-hidden="true" style={{ color: "var(--ap-sucesso)" }} />
            Senha trocada
          </p>
          <p className={s.cvApoio}>Da próxima vez que entrar, use a senha nova.</p>
        </div>
      ) : (
        <div className={s.cvCorpo}>
          <CampoSenha
            id={id.atual}
            rotulo="Senha atual"
            autoComplete="current-password"
            data-autofocus=""
            value={atual}
            erro={erros.atual}
            onChange={(ev) => {
              setAtual(ev.target.value);
              setErros((x) => ({ ...x, atual: undefined, geral: undefined }));
            }}
            onKeyDown={tecla}
          />
          <CampoSenha
            id={id.nova}
            rotulo="Senha nova"
            autoComplete="new-password"
            value={nova}
            erro={erros.nova}
            dica={`Pelo menos ${SENHA_MINIMA} caracteres.`}
            onChange={(ev) => {
              setNova(ev.target.value);
              setErros((x) => ({ ...x, nova: undefined, geral: undefined }));
            }}
            onKeyDown={tecla}
          />
          <CampoSenha
            id={id.confirma}
            rotulo="Repita a senha nova"
            autoComplete="new-password"
            value={confirma}
            erro={erros.confirma}
            onChange={(ev) => {
              setConfirma(ev.target.value);
              setErros((x) => ({ ...x, confirma: undefined, geral: undefined }));
            }}
            onKeyDown={tecla}
          />
          <p className={s.cvSr} role="alert">
            {erros.geral ?? null}
          </p>
          {erros.geral ? (
            <p style={{ margin: 0, color: "var(--ap-erro)", fontSize: "var(--ap-fs-apoio)" }}>{erros.geral}</p>
          ) : null}
        </div>
      )}

      <div className={s.cvPe}>
        {pronto ? (
          <Botao type="button" variante="principal" className={s.cvEnviar} onClick={aoFechar}>
            Fechar
          </Botao>
        ) : (
          <>
            <Botao type="button" variante="principal" className={s.cvEnviar} carregando={salvando} onClick={() => void salvar()}>
              {salvando ? "Salvando" : "Salvar senha nova"}
            </Botao>
            <Botao type="button" variante="discreto" className={s.cvCancelar} onClick={aoFechar}>
              Cancelar
            </Botao>
          </>
        )}
      </div>
    </>
  );
}
