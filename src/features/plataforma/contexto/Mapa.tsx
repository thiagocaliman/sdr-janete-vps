import { MessageSquareText, Plus } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import { cx } from "@/components/base/cx";

import { usePapel } from "../papel";
import { useContexto } from "./loja";
import { m } from "./mapa-estilos";
import {
  alvoDoItem,
  conteudoDe,
  dadosDoAlvo,
  MAX_ITENS_LIVRES,
  noTetoDeItens,
  plural,
  situacao,
  TEXTO_TETO_ITENS,
  versaoAtual,
  versaoNaTela,
  type EstadoContexto,
} from "./regras";
import { camposDoGrupo, GRUPO_DAS_LIVRES, GRUPOS, type Alvo, type GrupoId, type Situacao } from "./tipos";

// O mapa do Método D.A.T.A.: quatro camadas (Descrição, Ação, Treinamento, Atenção), cada uma com a
// letra, o nome, a pergunta-guia e os campos dela ligados por curvas. É só a organização da tela:
// os campos, as perguntas livres e o que a Janete lê continuam os mesmos.

/** Quantas perguntas livres aparecem no mapa; as outras ficam atrás do "mais N" (abre a camada). */
export const LIVRES_NO_MAPA = 3;

export interface PropsMapa {
  /** Abre a camada (pelo título) ou um campo ou pergunta dela no editor. */
  aoAbrir: (alvo: Alvo | GrupoId) => void;
  /** O campo que o "Ensinar" acabou de descobrir: a curva dele acende por um instante. */
  raio?: { alvo: Alvo; n: number } | null | undefined;
  estreita: boolean;
  className?: string | undefined;
}

interface Fio {
  ponta: string;
  grupo: GrupoId;
  sit: Situacao;
  d: string;
}

interface Geo {
  w: number;
  h: number;
  fios: Fio[];
  eixos: { grupo: GrupoId; x: number; y: number }[];
}

const usarLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;
const meio = (n: number) => Math.round(n * 2) / 2;
const fx = (n: number) => String(Math.round(n * 100) / 100);

const ESTADO_ARIA: Record<Situacao, string> = {
  sabe: "a Janete sabe",
  vazio: "ainda vazio",
  nao_salvo: "mudanças não salvas",
};

const ESTADO_TEXTO: Record<Situacao, string> = { sabe: "Salvo", vazio: "Vazio", nao_salvo: "Não salvo" };

const ORDEM: Record<Situacao, number> = { vazio: 0, sabe: 1, nao_salvo: 2 };

function mesmaGeo(a: Geo | null, b: Geo | null): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Numa versão antiga: este campo está diferente do que a versão atual guarda? */
function mudaDaAtual(estado: EstadoContexto, alvo: Alvo): boolean {
  if (estado.vendo === null) return false;
  const vista = dadosDoAlvo(versaoNaTela(estado), alvo);
  const atual = dadosDoAlvo(versaoAtual(estado), alvo);
  if (!vista || !atual) return vista !== atual;
  return (
    vista.texto.trim() !== atual.texto.trim() ||
    vista.pergunta.trim() !== atual.pergunta.trim() ||
    vista.anexos.map((a) => a.id).join("|") !== atual.anexos.map((a) => a.id).join("|")
  );
}

export function Mapa({ aoAbrir, raio, estreita, className }: PropsMapa) {
  const { estado } = useContexto();
  const { papel } = usePapel();
  const admin = papel === "admin";
  const vendo = estado.vendo !== null;
  const podeEditar = admin && !vendo;
  const versao = versaoNaTela(estado);
  const itens = versao.itens;
  const noTeto = podeEditar && noTetoDeItens(versao);
  const naTela = itens.slice(0, LIVRES_NO_MAPA);
  const resto = itens.length - naTela.length;

  const raiz = useRef<HTMLDivElement>(null);
  const quadro = useRef(0);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [ativa, setAtiva] = useState<GrupoId | null>(null);

  const medir = useCallback(() => {
    const base = raiz.current;
    if (!base || estreita) {
      setGeo(null);
      return;
    }
    const b = base.getBoundingClientRect();
    if (!b.width || !b.height) {
      setGeo(null);
      return;
    }
    const fios: Fio[] = [];
    const eixos: Geo["eixos"] = [];
    for (const g of GRUPOS) {
      const linha = base.querySelector<HTMLElement>(`[data-camada="${g.id}"]`);
      const rot = linha?.querySelector<HTMLElement>("[data-rotulo]");
      const nos = linha?.querySelector<HTMLElement>("[data-nos]");
      if (!linha || !rot || !nos) continue;
      const r = rot.getBoundingClientRect();
      const n = nos.getBoundingClientRect();
      const hx = meio(Math.max(r.right - b.left + 14, n.left - b.left - 96));
      const hy = meio(r.top - b.top + r.height / 2);
      eixos.push({ grupo: g.id, x: hx, y: hy });
      for (const el of Array.from(nos.querySelectorAll<HTMLElement>("[data-ponta]"))) {
        const p = el.getBoundingClientRect();
        const nx = meio(p.left - b.left - 3);
        const ny = meio(p.top - b.top + p.height / 2);
        const c = (nx - hx) * 0.55;
        fios.push({
          ponta: el.dataset["ponta"] ?? "",
          grupo: g.id,
          sit: (el.dataset["situacao"] as Situacao | undefined) ?? "vazio",
          d: `M${fx(hx)} ${fx(hy)}C${fx(hx + c)} ${fx(hy)} ${fx(nx - c)} ${fx(ny)} ${fx(nx)} ${fx(ny)}`,
        });
      }
    }
    fios.sort((x, y) => ORDEM[x.sit] - ORDEM[y.sit]);
    const g: Geo = { w: Math.round(b.width), h: Math.round(b.height), fios, eixos };
    setGeo((ant) => (mesmaGeo(ant, g) ? ant : g));
  }, [estreita]);

  const agendar = useCallback(() => {
    cancelAnimationFrame(quadro.current);
    quadro.current = requestAnimationFrame(medir);
  }, [medir]);

  // As situações entram na chave: salvar ou rascunhar muda o traço da curva sem mudar o tamanho.
  const pontas: Alvo[] = [...GRUPOS.flatMap((g) => camposDoGrupo(g.id).map((c) => c.chave)), ...naTela.map((_, k) => alvoDoItem(k + 1))];
  const chave = [estreita, itens.length, papel, estado.vendo ?? 0, ...pontas.map((a) => situacao(estado, a, admin))].join("|");

  usarLayout(() => {
    medir();
  }, [medir, chave]);

  useEffect(() => {
    const base = raiz.current;
    if (!base || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(agendar);
    ro.observe(base);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(quadro.current);
    };
  }, [agendar]);

  // O "Ensinar" pode apontar uma pergunta que está atrás do "mais N": acende a curva do "mais".
  const pontaDoRaio = raio ? (geo?.fios.some((f) => f.ponta === raio.alvo) ? raio.alvo : "mais") : null;
  const fioDoRaio = pontaDoRaio ? geo?.fios.find((f) => f.ponta === pontaDoRaio) : undefined;

  return (
    <div
      id="ctx-mapa"
      ref={raiz}
      className={cx(m.mapa, className)}
      data-antiga={vendo ? "" : undefined}
      data-estreita={estreita ? "" : undefined}
      data-ativa={ativa ?? undefined}
    >
      {geo ? (
        <div className={m.fios} aria-hidden="true">
          <svg className={m.svg} width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`}>
            {geo.fios.map((f) => (
              <path
                key={f.ponta}
                className={m.fio}
                d={f.d}
                data-alvo={f.ponta}
                data-de={f.grupo}
                data-situacao={f.sit}
                strokeDasharray={f.sit === "vazio" ? "4 5" : undefined}
              />
            ))}
            {geo.eixos.map((e) => (
              <circle key={e.grupo} className={m.eixo} cx={e.x} cy={e.y} r={3.5} data-de={e.grupo} />
            ))}
            {raio && fioDoRaio ? <path key={`raio-${raio.n}`} className={m.raio} d={fioDoRaio.d} data-raio={raio.alvo} /> : null}
          </svg>
        </div>
      ) : null}

      {GRUPOS.map((g, i) => {
        const campos = camposDoGrupo(g.id);
        const comLivres = g.id === GRUPO_DAS_LIVRES;
        const cheios = campos.filter((c) => versao.campos[c.chave].trim() || versao.anexos[c.chave].length).length;
        const resumo =
          `${cheios} de ${campos.length} ${campos.length === 1 ? "campo" : "campos"} com conteúdo` +
          (comLivres ? ` e ${plural(itens.length, "pergunta livre", "perguntas livres")}` : "");
        const Icone = g.icone;
        return (
          <section
            key={g.id}
            className={m.camada}
            aria-labelledby={`ctx-g-${g.id}`}
            data-camada={g.id}
            style={{ "--i": i } as CSSProperties}
            onMouseEnter={() => setAtiva(g.id)}
            onMouseLeave={() => setAtiva(null)}
            onFocus={() => setAtiva(g.id)}
            onBlur={() => setAtiva(null)}
          >
            <h2 id={`ctx-g-${g.id}`} className={m.titulo}>
              <button
                id={`ctx-gb-${g.id}`}
                type="button"
                className={m.rotulo}
                data-grupo={g.id}
                data-rotulo=""
                aria-label={`${g.letra}, ${g.nome}. ${g.guia} ${resumo}. Abrir a área.`}
                onClick={() => aoAbrir(g.id)}
              >
                <span className={m.quadro} aria-hidden="true">
                  <Icone size={28} strokeWidth={2} />
                </span>
                <span className={m.letra} aria-hidden="true">
                  {g.letra}
                </span>
                <span className={m.textos} aria-hidden="true">
                  <span className={m.nome}>{g.nome}</span>
                  <span className={m.guia}>{g.guia}</span>
                </span>
              </button>
            </h2>

            <div className={m.nos} data-nos="">
              {campos.map((c) => {
                const sit = situacao(estado, c.chave, admin);
                const muda = mudaDaAtual(estado, c.chave);
                const nAnexos = conteudoDe(estado, c.chave, admin)?.anexos.length ?? 0;
                const Ic = c.icone;
                return (
                  <button
                    key={c.chave}
                    id={`ctx-l-${c.chave}`}
                    type="button"
                    className={m.no}
                    data-campo={c.chave}
                    data-ponta={c.chave}
                    data-situacao={sit}
                    data-muda={muda ? "" : undefined}
                    aria-label={`${c.rotulo}, ${ESTADO_ARIA[sit]}${nAnexos ? `, ${plural(nAnexos, "anexo", "anexos")}` : ""}${
                      muda ? ", diferente da versão atual" : ""
                    }. Abre a área ${g.nome}.`}
                    onClick={() => aoAbrir(c.chave)}
                  >
                    <span id={`ctx-li-${c.chave}`} className={m.bola} data-situacao={sit} aria-hidden="true">
                      <Ic size={15} strokeWidth={2} />
                    </span>
                    <span className={m.noNome} aria-hidden="true">
                      {c.rotulo}
                    </span>
                    <span className={m.noEstado} aria-hidden="true">
                      {ESTADO_TEXTO[sit]}
                    </span>
                  </button>
                );
              })}

              {comLivres
                ? naTela.map((item, k) => {
                    const n = k + 1;
                    const alvo = alvoDoItem(n);
                    const sit = situacao(estado, alvo, admin);
                    const muda = mudaDaAtual(estado, alvo);
                    const pergunta = conteudoDe(estado, alvo, admin)?.pergunta || item.pergunta;
                    return (
                      <button
                        key={alvo}
                        id={`ctx-card-${n}`}
                        type="button"
                        className={m.no}
                        data-livre={n}
                        data-ponta={alvo}
                        data-situacao={sit}
                        data-muda={muda ? "" : undefined}
                        aria-label={`Pergunta livre ${n}: ${pergunta}${sit === "nao_salvo" ? " Mudanças não salvas." : ""} Abre a área ${g.nome}.`}
                        onClick={() => aoAbrir(alvo)}
                      >
                        <span id={`ctx-ci-${n}`} className={m.bola} data-situacao={sit} aria-hidden="true">
                          <MessageSquareText size={15} strokeWidth={2} />
                        </span>
                        <span className={m.noNome} aria-hidden="true">
                          {pergunta}
                        </span>
                        {sit === "nao_salvo" ? (
                          <span className={m.noEstado} aria-hidden="true">
                            {ESTADO_TEXTO[sit]}
                          </span>
                        ) : null}
                      </button>
                    );
                  })
                : null}

              {comLivres && resto > 0 ? (
                <button
                  id="ctx-card-mais"
                  type="button"
                  className={cx(m.no, m.noMais)}
                  data-mais=""
                  data-ponta="mais"
                  data-situacao="sabe"
                  aria-label={`Mais ${plural(resto, "pergunta livre", "perguntas livres")}: ${itens.length} de ${MAX_ITENS_LIVRES} no total. Abre a área ${g.nome}.`}
                  onClick={() => aoAbrir(g.id)}
                >
                  <span className={m.noNome} aria-hidden="true">
                    mais {plural(resto, "pergunta livre", "perguntas livres")} · {itens.length} de {MAX_ITENS_LIVRES}
                  </span>
                </button>
              ) : null}

              {comLivres && podeEditar ? (
                <button
                  id="ctx-card-novo"
                  type="button"
                  className={cx(m.no, m.noNovo)}
                  data-livre="novo"
                  data-novo=""
                  data-ponta="livre-novo"
                  data-situacao="vazio"
                  data-desligado={noTeto ? "" : undefined}
                  aria-label="Novo item livre: acrescentar uma pergunta e a resposta"
                  aria-disabled={noTeto ? "true" : undefined}
                  aria-describedby={noTeto ? "ctx-card-novo-motivo" : undefined}
                  onClick={() => {
                    if (!noTeto) aoAbrir("livre-novo");
                  }}
                >
                  <span id="ctx-ci-novo" className={m.bola} data-situacao="vazio" aria-hidden="true">
                    <Plus size={15} strokeWidth={2} />
                  </span>
                  <span className={m.noNome} aria-hidden="true">
                    Novo item livre
                  </span>
                </button>
              ) : null}
              {comLivres && noTeto ? (
                <span id="ctx-card-novo-motivo" className={m.motivo} data-motivo="">
                  {TEXTO_TETO_ITENS}
                </span>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
