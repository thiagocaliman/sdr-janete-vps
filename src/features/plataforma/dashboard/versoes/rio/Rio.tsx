import { useEffect, useMemo, useRef } from "react";

import { Esqueleto } from "@/components/base";
import type { Classes } from "@/components/base/cx";

import { contagem, numero, porcentagem, type EtapaFunil } from "../../dados";
import { ambienteDoPalco, ETAPA_SAIRAM } from "../final/apoio";
import { DicaDeRolar, Pergunte, type ColunaFunil, type PropsFunil } from "../final/Funil";
import type { ModoPalco } from "../final/Palco";
import { TextoNumero } from "../final/pecas";
import { avancar, estadoInicial, montarTabela, tomDoPonto, type EstadoDoRio, type FimDoPonto, type TabelaDoRio } from "./rio";
import estilos from "./Rio.module.css";

const s = estilos as Classes<
  | "cabecalho"
  | "titulo"
  | "ancora"
  | "legenda"
  | "legendaItem"
  | "amostra"
  | "palco"
  | "tela"
  | "etapas"
  | "etapa"
  | "cabeca"
  | "nome"
  | "numero"
  | "conv"
  | "leito"
  | "queda"
  | "quedaLinha"
  | "quedaForte"
  | "vazio"
  | "saidas"
  | "pergunte"
  | "dica"
>;

// O rio de leads (a direção "Rio" aprovada em 10/11/2026): o desenho do funil do período como uma
// correnteza. Cada ponto é um lead, sempre da esquerda para a direita: laranja em andamento, verde
// quando vira venda, vermelho quando é perdido (afunda), cinza quando para sem responder.
//
// O canvas é só desenho (aria-hidden). Os números, os nomes das etapas e as saídas são texto de
// verdade, os mesmos do funil; a tabela do funil para o leitor de tela continua vindo do Palco.
// Sem canvas (jsdom, navegador antigo) ou com movimento reduzido, a tela continua completa: no
// primeiro caso sem o desenho, no segundo com um quadro parado.

const TONS: Record<FimDoPonto, { variavel: string; reserva: string }> = {
  andando: { variavel: "--ap-azul", reserva: "#ff551b" },
  ganho: { variavel: "--ap-sucesso", reserva: "#17845a" },
  perdido: { variavel: "--ap-erro", reserva: "#b42318" },
  parado: { variavel: "--ap-tinta-3", reserva: "#66666e" },
};

type Cores = Record<FimDoPonto | "linha", string>;

function lerCores(el: Element): Cores {
  const estilo = getComputedStyle(el);
  const ler = (variavel: string, reserva: string) => estilo.getPropertyValue(variavel).trim() || reserva;
  return {
    andando: ler(TONS.andando.variavel, TONS.andando.reserva),
    ganho: ler(TONS.ganho.variavel, TONS.ganho.reserva),
    perdido: ler(TONS.perdido.variavel, TONS.perdido.reserva),
    parado: ler(TONS.parado.variavel, TONS.parado.reserva),
    linha: ler("--ap-linha-forte", "#d6d6dc"),
  };
}

/** O desenho de um quadro. O leito é a faixa do canvas onde o rio corre (em px do canvas). */
function desenhar(
  ctx: CanvasRenderingContext2D,
  estado: EstadoDoRio,
  cores: Cores,
  m: { largura: number; altura: number; leitoTopo: number; leitoAltura: number; etapas: number },
) {
  ctx.clearRect(0, 0, m.largura, m.altura);
  // as divisas das etapas e a linha d'água de quem afunda
  ctx.strokeStyle = cores.linha;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  for (let i = 1; i < m.etapas; i++) {
    const x = Math.round((m.largura * i) / m.etapas) + 0.5;
    ctx.moveTo(x, m.leitoTopo);
    ctx.lineTo(x, m.leitoTopo + m.leitoAltura);
  }
  ctx.stroke();
  ctx.setLineDash([3, 5]);
  ctx.beginPath();
  const fundo = Math.round(m.leitoTopo + m.leitoAltura) + 0.5;
  ctx.moveTo(0, fundo);
  ctx.lineTo(m.largura, fundo);
  ctx.stroke();
  ctx.setLineDash([]);

  for (const p of estado.pontos) {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.opacidade)) * (p.estado === "fim" && p.fim === "parado" ? 0.75 : 1);
    ctx.fillStyle = cores[tomDoPonto(p)];
    ctx.beginPath();
    ctx.arc(p.x * m.largura, m.leitoTopo + p.y * m.leitoAltura, p.raio, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** O canvas do rio: mede, simula e desenha. Não monta nada onde não há canvas de verdade. */
function TelaDoRio({ tabela, reduzido, celular }: { tabela: TabelaDoRio; reduzido: boolean; celular: boolean }) {
  const tela = useRef<HTMLCanvasElement>(null);
  // a tabela muda a cada leitura do painel: o rio continua correndo e só passa a sortear pela nova
  const atual = useRef(tabela);
  atual.current = tabela;

  useEffect(() => {
    const canvas = tela.current;
    if (!canvas || !ambienteDoPalco()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const estado = estadoInicial();
    let cores = lerCores(canvas);
    const medida = { largura: 0, altura: 0, leitoTopo: 0, leitoAltura: 0, etapas: 1 };
    let quadro = 0;
    let antes = 0;
    let visivel = true;

    const ritmo = () => (medida.largura < 500 ? 5 : 8);
    const pintar = () => desenhar(ctx, estado, cores, { ...medida, etapas: Math.max(1, atual.current.etapas) });

    const medir = () => {
      const caixa = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      medida.largura = Math.max(1, caixa.width);
      medida.altura = Math.max(1, caixa.height);
      canvas.width = Math.round(medida.largura * dpr);
      canvas.height = Math.round(medida.altura * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // o leito: no computador, a faixa reservada entre os números e as saídas; no celular, a tela toda
      const leito = canvas.parentElement?.querySelector<HTMLElement>("[data-rio-leito]");
      const caixaLeito = leito?.getBoundingClientRect();
      if (caixaLeito && caixaLeito.height > 0) {
        medida.leitoTopo = caixaLeito.top - caixa.top;
        medida.leitoAltura = caixaLeito.height * 0.8;
      } else {
        medida.leitoTopo = medida.altura * 0.08;
        medida.leitoAltura = medida.altura * 0.7;
      }
    };

    const aquecer = (passos: number) => {
      for (let i = 0; i < passos; i++) avancar(estado, atual.current, 1 / 30, ritmo());
    };

    medir();

    if (reduzido) {
      // um quadro só, com o rio já cheio
      aquecer(500);
      pintar();
      const aoMedir = () => {
        medir();
        pintar();
      };
      const ro = typeof ResizeObserver === "function" ? new ResizeObserver(aoMedir) : null;
      ro?.observe(canvas);
      return () => ro?.disconnect();
    }

    aquecer(500);

    const passo = (agora: number) => {
      quadro = 0;
      const dt = antes ? Math.min(0.05, (agora - antes) / 1000) : 1 / 60;
      antes = agora;
      avancar(estado, atual.current, dt, ritmo());
      pintar();
      agendar();
    };
    const agendar = () => {
      if (!quadro && visivel && !document.hidden) quadro = requestAnimationFrame(passo);
    };
    const parar = () => {
      if (quadro) cancelAnimationFrame(quadro);
      quadro = 0;
      antes = 0;
    };
    const aoVisibilidade = () => (document.hidden ? parar() : agendar());

    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(medir) : null;
    ro?.observe(canvas);
    const io = new IntersectionObserver((entradas) => {
      visivel = entradas.some((e) => e.isIntersecting);
      if (visivel) agendar();
      else parar();
    });
    io.observe(canvas);
    // o tema claro ou escuro troca as cores dos pontos
    const mo = typeof MutationObserver === "function" ? new MutationObserver(() => (cores = lerCores(canvas))) : null;
    mo?.observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema", "class"] });
    document.addEventListener("visibilitychange", aoVisibilidade);
    pintar();
    agendar();

    return () => {
      parar();
      ro?.disconnect();
      io.disconnect();
      mo?.disconnect();
      document.removeEventListener("visibilitychange", aoVisibilidade);
    };
  }, [reduzido, celular]);

  return <canvas ref={tela} className={s.tela} data-dash="rio-tela" aria-hidden="true" />;
}

/* ---------- os textos de cada etapa ---------- */

function rotuloDaEtapa(e: EtapaFunil): string {
  return `${e.nome}: ${contagem(e.chegaram, "chegou", "chegaram")}. Ver a etapa em detalhe`;
}

function conversaoDaAnterior(c: ColunaFunil): string {
  if (!c.anterior) return "entrada";
  return c.anterior.conversaoProxPct === null ? "" : `${porcentagem(c.anterior.conversaoProxPct)} da etapa anterior`;
}

function Amostra({ tom }: { tom: FimDoPonto }) {
  return <span className={s.amostra} data-tom={tom} aria-hidden="true" />;
}

/** O que aconteceu com quem ficou na etapa: perdidos, parados sem resposta e os que ainda estão nela. */
function Saidas({ e }: { e: EtapaFunil }) {
  if (e.tipo === "ganho") {
    return (
      <span className={s.quedaLinha}>
        <Amostra tom="ganho" />
        <span className={s.quedaForte}>{contagem(e.chegaram, "venda", "vendas")}</span>
      </span>
    );
  }
  const { perdido, semResposta } = e.abandonaram;
  return (
    <>
      {perdido ? (
        <span className={s.quedaLinha}>
          <Amostra tom="perdido" />
          {contagem(perdido, "perdido", "perdidos")}
        </span>
      ) : null}
      {semResposta ? (
        <span className={s.quedaLinha}>
          <Amostra tom="parado" />
          {numero(semResposta)} sem resposta
        </span>
      ) : null}
      {e.aindaEstao ? (
        <span className={s.quedaLinha}>
          <Amostra tom="andando" />
          {numero(e.aindaEstao)} ainda {e.aindaEstao === 1 ? "está" : "estão"}
        </span>
      ) : null}
      {!perdido && !semResposta && !e.aindaEstao ? <span className={s.quedaLinha}>Ninguém parou aqui</span> : null}
    </>
  );
}

/* ---------- o cartão ---------- */

export function Rio({ painel, colunas, carregando, idTitulo, aoIr, modo, reduzido }: PropsFunil & { modo: ModoPalco; reduzido: boolean }) {
  const { funil, periodo } = painel;
  const vazio = painel.vazio || funil.leadsNovos === 0;
  const celular = modo === "celular";
  const tabela = useMemo(() => montarTabela(funil.etapas), [funil.etapas]);
  const corre = !vazio && !carregando && tabela.total > 0;

  return (
    <>
      <header className={s.cabecalho}>
        <div>
          <h2 id={idTitulo} className={s.titulo}>
            Funil do período
          </h2>
          <p className={s.ancora}>
            {carregando
              ? "carregando o período"
              : vazio
                ? `nenhum lead chegou ${periodo.rotulo}`
                : `cada ponto é um lead dos ${numero(funil.leadsNovos)} que chegaram ${periodo.rotulo}`}
          </p>
        </div>
        <ul className={s.legenda} aria-label="As cores do rio">
          <li className={s.legendaItem}>
            <Amostra tom="andando" />
            em andamento
          </li>
          <li className={s.legendaItem}>
            <Amostra tom="ganho" />
            virou venda
          </li>
          <li className={s.legendaItem}>
            <Amostra tom="perdido" />
            perdido
          </li>
          <li className={s.legendaItem}>
            <Amostra tom="parado" />
            parado sem resposta
          </li>
        </ul>
      </header>

      <div className={s.palco} data-dash="rio" data-modo={modo} data-vazio={vazio || undefined} data-corre={corre || undefined}>
        {corre ? <TelaDoRio tabela={tabela} reduzido={reduzido} celular={celular} /> : null}
        <ol className={s.etapas} style={{ gridTemplateColumns: celular ? undefined : `repeat(${Math.max(1, colunas.length)}, minmax(0, 1fr))` }}>
          {colunas.map((c) => {
            const e = c.etapa;
            return (
              <li key={e.etapaId} className={s.etapa} data-etapa={e.etapaId} data-ganho={e.tipo === "ganho" || undefined}>
                <button type="button" className={s.cabeca} aria-label={rotuloDaEtapa(e)} onClick={() => aoIr(e.etapaId)}>
                  <span className={s.nome}>{e.nome}</span>
                  {carregando ? (
                    <Esqueleto forma="bloco" largura={64} altura={32} raio="mini" />
                  ) : vazio ? null : (
                    <TextoNumero texto={numero(e.chegaram)} className={s.numero} />
                  )}
                  <span className={s.conv}>{carregando || vazio ? "" : conversaoDaAnterior(c)}</span>
                </button>
                <span className={s.leito} data-rio-leito="" aria-hidden="true" />
                <span className={s.queda}>{carregando || vazio ? null : <Saidas e={e} />}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {vazio && !carregando ? <p className={s.vazio}>Nenhum lead chegou neste período</p> : null}
      {vazio || carregando ? null : (
        <button type="button" className={s.saidas} onClick={() => aoIr(ETAPA_SAIRAM)}>
          <Amostra tom="perdido" />
          {contagem(funil.perdidos, "lead foi", "leads foram")} para Perdido. Ver para onde foram os que saíram
        </button>
      )}
      {vazio ? null : <Pergunte perguntas={funil.perguntas} className={s.pergunte} />}
      {vazio ? null : <DicaDeRolar className={s.dica} />}
    </>
  );
}
