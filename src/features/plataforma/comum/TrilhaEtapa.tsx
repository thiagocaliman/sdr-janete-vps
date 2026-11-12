import type { CSSProperties } from "react";

import { cx, type Classes } from "@/components/base/cx";

import type { Etapa, HistoricoEtapa } from "../exemplo";
import estilos from "./TrilhaEtapa.module.css";

const s = estilos as Classes<"trilha" | "fio" | "cheio" | "parada" | "ponto">;

// A trilha de etapa: a mesma linguagem do rio do Dashboard, pequena, para o Chat e os Contatos.
// Um fio com uma parada por etapa aberta e a última na venda; o ponto do lead fica na parada dele e
// desliza quando a etapa muda. Laranja em andamento, verde quando virou venda, vermelho no perdido
// (o ponto fica onde o lead saiu, e o caminho feito vira cinza; sem saber onde saiu, a trilha
// inteira fica em vermelho apagado, sem ponto).
//
// É desenho: fica fora da leitura de tela (aria-hidden). O nome da etapa está sempre em texto ao lado.

type EtapaDaTrilha = Pick<Etapa, "id" | "tipo"> & { arquivada?: boolean | undefined };

export type TomDaTrilha = "andando" | "ganho" | "perdido";

export interface PosicaoNaTrilha {
  /** Quantas paradas a trilha tem (as etapas abertas e a da venda). */
  paradas: number;
  /** A parada onde o ponto fica (-1: não se sabe, e a trilha fica sem ponto). */
  indice: number;
  tom: TomDaTrilha;
}

/**
 * Onde o lead fica na trilha. As etapas vêm na ordem do funil (as arquivadas ficam de fora). No perdido, `perdidoEm` é
 * a etapa aberta de onde ele saiu; sem ela (as listas não leem o histórico), o índice é -1: a
 * trilha fica inteira em vermelho apagado, sem ponto, para não afirmar uma parada que não se sabe.
 */
export function posicaoNaTrilha(
  todas: readonly EtapaDaTrilha[],
  etapaId: string | null | undefined,
  perdidoEm?: string | null | undefined,
): PosicaoNaTrilha | null {
  // As arquivadas não são parada: quem ainda está numa delas fica sem trilha.
  const etapas = todas.filter((e) => !e.arquivada);
  const abertas = etapas.filter((e) => e.tipo === "aberta");
  const temGanho = etapas.some((e) => e.tipo === "ganho");
  const paradas = abertas.length + (temGanho ? 1 : 0);
  const atual = etapas.find((e) => e.id === etapaId);
  if (!atual || paradas < 2) return null;
  const ultima = paradas - 1;
  if (atual.tipo === "ganho") return { paradas, indice: ultima, tom: "ganho" };
  if (atual.tipo === "aberta") return { paradas, indice: abertas.findIndex((e) => e.id === atual.id), tom: "andando" };
  const saiuDe = perdidoEm ? abertas.findIndex((e) => e.id === perdidoEm) : -1;
  return { paradas, indice: saiuDe, tom: "perdido" };
}

/**
 * A etapa de onde o lead saiu, pelo histórico (a mudança mais recente para a etapa atual). Serve para
 * o ponto do perdido ficar onde ele parou. O histórico pode vir em qualquer ordem.
 */
export function saiuDaEtapa(
  historico: readonly Pick<HistoricoEtapa, "de_etapa_id" | "para_etapa_id" | "criado_em">[] | null | undefined,
  etapaId: string | null | undefined,
): string | null {
  let achada: { de: string | null; em: string } | null = null;
  for (const h of historico ?? []) {
    if (h.para_etapa_id !== etapaId) continue;
    if (!achada || h.criado_em > achada.em) achada = { de: h.de_etapa_id, em: h.criado_em };
  }
  return achada?.de ?? null;
}

interface Props {
  /** As etapas, na ordem do funil. */
  etapas: readonly EtapaDaTrilha[] | null | undefined;
  etapaId: string | null | undefined;
  /** No perdido, a etapa aberta de onde o lead saiu (ver `saiuDaEtapa`). */
  perdidoEm?: string | null | undefined;
  /** "mini" é a das listas (10 px de altura). */
  tamanho?: "normal" | "mini" | undefined;
  className?: string | undefined;
}

export function TrilhaEtapa({ etapas, etapaId, perdidoEm, tamanho = "normal", className }: Props) {
  const pos = posicaoNaTrilha(etapas ?? [], etapaId, perdidoEm);
  if (!pos) return null;
  const { paradas, indice, tom } = pos;
  const p = Math.max(indice, 0) / (paradas - 1);
  return (
    <span
      className={cx(s.trilha, className)}
      data-trilha={tamanho}
      data-tom={tom}
      data-parada={indice}
      aria-hidden="true"
      style={{ "--tr-p": p } as CSSProperties}
    >
      <i className={s.fio} />
      <i className={s.cheio} />
      {Array.from({ length: paradas }, (_, i) => (
        <i
          key={i}
          className={s.parada}
          data-feita={i <= indice ? "" : undefined}
          style={{ left: `${(i / (paradas - 1)) * 100}%` }}
        />
      ))}
      {indice >= 0 ? <i className={s.ponto} /> : null}
    </span>
  );
}
