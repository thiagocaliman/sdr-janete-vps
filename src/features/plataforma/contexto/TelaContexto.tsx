import { ChevronRight, CircleCheck, Plus } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { Aviso, Botao } from "@/components/base";

import { idTituloArea, VistaArea } from "../AreaVazia";
import { Carregando, ErroLeitura } from "../dados/estados";
import { useClienteDados } from "../dados/ProvedorDados";
import { useTelaEstreita } from "../exemplo";
import { usePapel } from "../papel";
import { Ensinar } from "./Ensinar";
import { FaixaVersaoAntiga, Historico } from "./Historico";
import { useContexto } from "./loja";
import { Mapa } from "./Mapa";
import { PonteContextoBanco } from "./ponte";
import { avisoCamposFracos, camposFracos, contagem, numeroDoItem, semVersao, versaoAtual, versaoNaTela } from "./regras";
import { primeiroAlvo, Secao } from "./Secao";
import { s } from "./tela-estilos";
import { CAMPOS, ehChaveCampo, ehGrupo, GRUPO_DAS_LIVRES, infoCampo, infoGrupo, type Alvo, type GrupoId } from "./tipos";

// A tela do Contexto, organizada pelo Método D.A.T.A.: junta o cabeçalho (os números, "+ Ensinar algo
// novo" e a legenda), a faixa da versão antiga, o palco (o Mapa das 4 camadas ou a Secao de uma delas)
// e o rodapé com o histórico. Quem decide o que está aberto é esta tela: a seção (camada, item e de
// onde veio), o painel de ensinar e a gaveta do histórico. A troca entre o mapa e a seção é direta:
// cada um entra com a própria animação curta (Mapa.module.css e Secao.module.css).

const usarLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;

interface SecaoAberta {
  grupo: GrupoId;
  alvo: Alvo;
  /** Entrou por um campo ou pergunta (no celular, o editor abre direto). */
  editor: boolean;
  /** O id que recebe o foco ao voltar para o mapa. */
  origem: string;
}

function grupoDoAlvo(alvo: Alvo): GrupoId {
  return ehChaveCampo(alvo) ? infoCampo(alvo).grupo : GRUPO_DAS_LIVRES;
}

/** O botão do mapa que abre aquele item (o foco volta para ele). */
function origemDoAlvo(alvo: Alvo): string {
  if (ehChaveCampo(alvo)) return `ctx-l-${alvo}`;
  const n = numeroDoItem(alvo);
  return n === null ? "ctx-card-novo" : `ctx-card-${n}`;
}

function nomeDoAlvo(alvo: Alvo): string {
  if (ehChaveCampo(alvo)) return infoCampo(alvo).rotulo;
  const n = numeroDoItem(alvo);
  return n === null ? "Nova pergunta livre" : `a pergunta livre ${n}`;
}

/** Põe o foco num elemento (ou no título da área, se ele não existir). Com mouse, sem anel. */
function focarId(id: string, semAnel: boolean): void {
  const el = document.getElementById(id) ?? document.getElementById(idTituloArea("contexto"));
  if (!el) return;
  if (semAnel) {
    el.setAttribute("data-sem-anel", "");
    el.addEventListener("blur", () => el.removeAttribute("data-sem-anel"), { once: true });
  }
  el.focus({ preventScroll: true });
}

/**
 * A rota /app/contexto. No modo banco (há cliente do Supabase na camada de dados), a ponte põe as
 * versões do banco; sem ele (testes e modo exemplo), a loja usa as da memória.
 */
export function TelaContexto() {
  const cliente = useClienteDados();
  return cliente ? (
    <PonteContextoBanco>
      <TelaComEstados />
    </PonteContextoBanco>
  ) : (
    <TelaComEstados />
  );
}

/** Os 3 estados: carregando (o esqueleto), erro com "Tentar de novo", e a tela (vazia ou não). */
function TelaComEstados() {
  const { leitura } = useContexto();
  if (leitura.carregando) {
    return (
      <VistaArea area="contexto">
        <Carregando forma="cartao" quantos={3} rotulo="Carregando o Contexto" />
      </VistaArea>
    );
  }
  // A tela de erro só enquanto os dados não chegaram. Uma releitura que falha em segundo plano (o
  // React Query guarda o erro junto com os dados antigos) vira um aviso compacto, e a seção aberta,
  // o rascunho e o foco ficam onde estavam: a TelaPronta não desmonta (fica na mesma posição).
  if (leitura.erro && !leitura.pronta) {
    return (
      <VistaArea area="contexto">
        <ErroLeitura erro={leitura.erro} tentarDeNovo={leitura.tentarDeNovo} titulo="Não deu para carregar o Contexto" />
      </VistaArea>
    );
  }
  return (
    <>
      {leitura.erro ? (
        <div style={{ marginBottom: 16 }} data-aviso-releitura="">
          <Aviso
            tom="atencao"
            compacto
            acao={
              <Botao variante="contorno" tamanho="compacto" onClick={leitura.tentarDeNovo}>
                Tentar de novo
              </Botao>
            }
          >
            {AVISO_RELEITURA_CONTEXTO}
          </Aviso>
        </div>
      ) : null}
      <TelaPronta />
    </>
  );
}

/** O aviso compacto da releitura que falhou com a tela já pronta. */
export const AVISO_RELEITURA_CONTEXTO = "Não deu para atualizar o Contexto. O que está na tela pode estar desatualizado.";

function TelaPronta() {
  const { estado, acoes, leitura } = useContexto();
  const { papel } = usePapel();
  const estreita = useTelaEstreita();
  const admin = papel === "admin";
  const vendo = estado.vendo !== null;
  const podeEditar = admin && !vendo;
  const versao = versaoNaTela(estado);
  const nums = contagem(versao);
  const nenhuma = semVersao(estado);
  // o aviso de campo fraco olha a versão salva atual (não a antiga na tela nem o rascunho). Com a
  // releitura falhando, a tela segue com os dados velhos, mas o aviso some (undefined: não se sabe).
  const fraco = avisoCamposFracos(camposFracos(leitura.erro ? undefined : nenhuma ? null : versaoAtual(estado)));

  /* ---- timers: todos saem ao desmontar ---- */
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const depois = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  }, []);
  useEffect(() => {
    const lista = timers.current;
    return () => {
      lista.forEach(clearTimeout);
      lista.clear();
    };
  }, []);

  /* ---- teclado ou mouse: o foco devolvido só desenha anel com teclado ---- */
  const teclado = useRef(false);
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Tab" || e.key === "Enter" || e.key === " " || e.key === "Escape" || e.key.startsWith("Arrow")) teclado.current = true;
    };
    const ponteiro = () => {
      teclado.current = false;
    };
    document.addEventListener("keydown", tecla, true);
    document.addEventListener("pointerdown", ponteiro, true);
    document.addEventListener("mousedown", ponteiro, true);
    return () => {
      document.removeEventListener("keydown", tecla, true);
      document.removeEventListener("pointerdown", ponteiro, true);
      document.removeEventListener("mousedown", ponteiro, true);
    };
  }, []);

  /* ---- o que está aberto ---- */
  const [secao, setSecao] = useState<SecaoAberta | null>(null);
  const [ensinar, setEnsinar] = useState<{ origem: string } | null>(null);
  const [hist, setHist] = useState(false);
  const [raio, setRaio] = useState<{ alvo: Alvo; n: number } | null>(null);
  const [toast, setToast] = useState<{ id: number; texto: string } | null>(null);
  const [anuncio, setAnuncio] = useState("");
  // o raio corre uma vez só: some depois da animação (e ao abrir a seção), para não correr de novo
  // quando o mapa remonta na volta ou as curvas reaparecem
  const raioSeq = useRef(0);
  const descobrir = (alvo: Alvo) => {
    const n = ++raioSeq.current;
    setRaio({ alvo, n });
    depois(() => setRaio((x) => (x?.n === n ? null : x)), 1100);
  };

  // vendo uma versão antiga (ou como atendente), o painel de ensinar fecha
  const [vendoAnt, setVendoAnt] = useState(estado.vendo);
  if (vendoAnt !== estado.vendo) {
    setVendoAnt(estado.vendo);
    if (estado.vendo !== null) setEnsinar(null);
  }
  const ensinarAberto = !!ensinar && podeEditar;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---- abrir a seção: título da camada (o 1º item), campo ou pergunta (aquele item) ---- */
  const abrir = (x: Alvo | GrupoId, origemPedida?: string) => {
    const tec = teclado.current;
    const pelaArea = ehGrupo(x);
    const grupo = pelaArea ? x : grupoDoAlvo(x);
    const alvo = pelaArea ? primeiroAlvo(grupo) : x;
    const ativo = typeof document !== "undefined" ? document.activeElement : null;
    const origem =
      origemPedida ??
      (ativo instanceof HTMLElement && /^ctx-(disco|gb|l|card)-/.test(ativo.id)
        ? ativo.id
        : pelaArea
          ? `ctx-gb-${grupo}`
          : origemDoAlvo(alvo));
    setEnsinar(null);
    setRaio(null);
    setHist(false);
    const nomeG = infoGrupo(grupo).nome;
    setAnuncio(`Seção ${nomeG}${pelaArea ? "" : `, com ${nomeDoAlvo(alvo)} no editor`}. Esc volta para o mapa.`);

    if (secao) {
      setSecao({ ...secao, grupo, alvo, editor: !pelaArea });
      return;
    }

    setSecao({ grupo, alvo, editor: !pelaArea, origem });

    // com teclado, o foco vai para o item aberto; com mouse, para o título (que não desenha anel)
    const foco = !pelaArea ? "ctx-ed-tit" : estreita || !tec ? "ctx-sec-tit" : `ctx-it-${alvo}`;
    depois(() => focarId(document.getElementById(foco) ? foco : "ctx-sec-tit", !tec), 90);
  };

  /* ---- voltar ao mapa (Voltar, Esc, e o "Ensinar" com a seção aberta) ---- */
  const voltar = (opcoes: { semFoco?: boolean } = {}) => {
    if (!secao) return;
    const tec = teclado.current;
    const volta = secao.origem;
    setAnuncio("De volta ao mapa do conhecimento.");
    setSecao(null);
    if (!opcoes.semFoco) depois(() => focarId(volta, !tec), 80);
  };

  const trocarGrupo = (g: GrupoId) => {
    if (!secao) return;
    setSecao({ ...secao, grupo: g, alvo: primeiroAlvo(g), editor: false, origem: `ctx-gb-${g}` });
    setAnuncio(`Seção ${infoGrupo(g).nome}.`);
  };

  /* ---- Esc com o foco fora (no corpo da página): fecha a gaveta ou o balão, ou volta ao mapa ---- */
  const esc = useRef<(e: KeyboardEvent) => void>(() => {});
  usarLayout(() => {
    esc.current = (e) => {
      if (document.querySelector('[role="alertdialog"]')) return;
      if (hist) {
        e.preventDefault();
        setHist(false);
        focarId("ctx-historico-btn", !teclado.current);
        return;
      }
      if (ensinarAberto) {
        e.preventDefault();
        setEnsinar(null);
        if (ensinar?.origem) focarId(ensinar.origem, !teclado.current);
        return;
      }
      if (!secao) return;
      e.preventDefault();
      voltar();
    };
  });
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) esc.current(e);
    };
    document.addEventListener("keydown", f);
    return () => document.removeEventListener("keydown", f);
  }, []);

  /* ---- "+ Ensinar algo novo": a peça e o botão do cabeçalho abrem o mesmo balão ---- */
  const alternarEnsinar = (origem: string) => {
    if (ensinar) {
      setEnsinar(null);
      return;
    }
    if (!podeEditar) return;
    setHist(false);
    // com a seção aberta, volta ao mapa e abre o painel acima dele
    if (secao) voltar({ semFoco: true });
    setEnsinar({ origem });
    setAnuncio("Ensinar algo novo: escreva e a Janete descobre o campo.");
  };

  const alternarHistorico = () => {
    if (hist) {
      setHist(false);
      return;
    }
    setEnsinar(null);
    setHist(true);
  };

  const aoRestaurar = (v: number, de: number) => {
    const texto = `Versão ${v} salva, igual à versão ${de}.`;
    setToast((x) => ({ id: (x?.id ?? 0) + 1, texto }));
    // o aviso visual nasce com o texto: quem fala é a região viva que já existe
    setAnuncio(texto);
  };

  return (
    <VistaArea area="contexto">
      <div className={s.tela} data-estreita={estreita ? "" : undefined}>
        <div className={s.cabDir}>
          <div className={s.nums}>
            <p className={s.num}>
              <b>{nums.campos}</b> de {CAMPOS.length} campos
            </p>
            <p className={s.num}>
              <b>{nums.itens}</b> {nums.itens === 1 ? "pergunta livre" : "perguntas livres"}
            </p>
          </div>
          {podeEditar ? (
            <button
              type="button"
              id="ctx-ensinar-btn"
              data-acao="ensinar"
              className={s.btnEns}
              aria-expanded={ensinarAberto}
              aria-controls={ensinarAberto ? "ctx-ens" : undefined}
              onClick={() => alternarEnsinar("ctx-ensinar-btn")}
            >
              <Plus className={s.btnEnsIc} strokeWidth={1.75} aria-hidden="true" />
              <span>Ensinar algo novo</span>
            </button>
          ) : null}
          {fraco ? (
            <p className={s.fraco} data-aviso-fraco="">
              {fraco}
            </p>
          ) : null}
          <div className={s.legenda} aria-hidden="true">
            <span className={s.leg}>
              <svg className={s.legTr} viewBox="0 0 26 8">
                <path className={s.tOn} d="M2 4H24" />
              </svg>
              A Janete sabe
            </span>
            <span className={s.leg}>
              <svg className={s.legTr} viewBox="0 0 26 8">
                <path className={s.tOff} d="M2 4H24" />
              </svg>
              Ainda vazio
            </span>
            {podeEditar ? (
              <span className={s.leg}>
                <svg className={s.legTr} viewBox="0 0 26 8">
                  <path className={s.tRasc} d="M2 4H24" />
                </svg>
                Não salvo
              </span>
            ) : null}
          </div>
        </div>

        <FaixaVersaoAntiga className={s.faixa} aoRestaurar={aoRestaurar} />

        <div id="ctx-palco" className={s.palco}>
          {secao ? (
            <div className={s.palcoSecao}>
              <Secao
                grupo={secao.grupo}
                alvo={secao.alvo}
                aoEscolher={(alvo) => setSecao((sc) => (sc ? { ...sc, alvo } : sc))}
                aoTrocarGrupo={trocarGrupo}
                aoVoltar={() => voltar()}
                estreita={estreita}
                editorAberto={estreita && secao.editor}
                focarAoAbrir={false}
              />
            </div>
          ) : (
            <>
              {ensinarAberto ? (
                <div className={s.ensinar}>
                  <Ensinar
                    aberto
                    aoFechar={() => setEnsinar(null)}
                    aoDescobrir={descobrir}
                    aoAbrirAlvo={(alvo) => abrir(alvo, origemDoAlvo(alvo))}
                    ponta={false}
                    devolverFocoPara={ensinar?.origem}
                  />
                </div>
              ) : null}
              <Mapa aoAbrir={(x) => abrir(x)} raio={raio} estreita={estreita} />
            </>
          )}
        </div>

        <footer className={s.rodape}>

          {nenhuma ? (
            <p className={s.rodEsq} data-vazio="">
              <b>Nenhuma versão ainda</b>
              <span className={s.rodDiv} aria-hidden="true" />
              <span>{admin ? "O 1º salvamento cria a versão 1." : "Quando o admin salvar, a versão 1 aparece aqui."}</span>
            </p>
          ) : (
            <p className={s.rodEsq}>
              <b>Versão {versao.numero}</b>
              <span className={s.pilula} data-antiga={vendo ? "" : undefined}>
                {vendo ? "Antiga · só leitura" : "Em uso"}
              </span>
              <span className={s.rodDiv} aria-hidden="true" />
              <span>Cada alteração salva cria uma nova versão.</span>
            </p>
          )}
          <button
            type="button"
            id="ctx-historico-btn"
            data-acao="historico"
            className={s.rodHist}
            aria-expanded={hist}
            aria-controls={hist ? "ctx-gaveta" : undefined}
            onClick={alternarHistorico}
          >
            <span>Ver histórico</span>
            <ChevronRight className={s.rodHistIc} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </footer>

        <Historico aberto={hist} aoFechar={() => setHist(false)} aoRestaurar={aoRestaurar} />

        {toast ? (
          <p key={toast.id} className={s.toast} aria-hidden="true">
            <CircleCheck className={s.toastIc} strokeWidth={2} aria-hidden="true" />
            <span>{toast.texto}</span>
          </p>
        ) : null}

        <p className={s.sr} aria-live="polite">
          {anuncio}
        </p>
      </div>
    </VistaArea>
  );
}
