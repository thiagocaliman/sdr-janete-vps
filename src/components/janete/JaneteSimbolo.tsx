import type { CSSProperties } from "react";
import { cx, type Classes } from "@/components/base/cx";
import estilos from "./JaneteSimbolo.module.css";

const s = estilos as Classes<"janete" | "desenho" | "anel" | "letras" | "pontos" | "check" | "brilho">;

/** O brilho de quatro pontas do AI Spark (o desenho usa a área 180 150 920 920 do original de 1254). */
export const BRILHO =
  "M 882 167 C 892 167 896 176 898 190 C 917 283 962 329 1056 343 C 1070 345 1078 352 1078 361 C 1078 370 1070 376 1056 379 C 963 396 914 444 898 536 C 895 550 889 558 882 558 C 872 558 867 549 865 535 C 850 445 802 396 709 379 C 694 376 685 370 685 361 C 685 351 694 345 708 343 C 802 326 850 280 865 190 C 868 176 873 167 882 167 Z";

/**
 * dormindo: cinza e parado (antes de conectar) · carregando: o brilho gira
 * (validação, preparo) · check: o "AI" dá lugar ao traço do check ·
 * acordada: laranja, o brilho respira · fala: o "AI" dá lugar a três pontos.
 */
/** O anel aberto e as letras, para quem desenha o símbolo por conta própria (o palco do login). */
export const ANEL = "M 678 282 A 375 375 0 1 0 968 568";
export const LETRA_A = "M 381 809 L 506 475 H 585 L 703 809 H 631 L 609 745 H 477 L 454 809 Z M 498 685 H 589 L 545 553 Z";
export const LETRA_I = "M 739 475 H 807 V 809 H 739 Z";

export type EstadoJanete = "dormindo" | "carregando" | "check" | "acordada" | "fala";

export const ESTADOS_JANETE: readonly EstadoJanete[] = [
  "dormindo",
  "carregando",
  "check",
  "acordada",
  "fala",
];

const ROTULOS: Record<EstadoJanete, string> = {
  dormindo: "Janete, em repouso",
  carregando: "Janete, carregando",
  check: "Janete, tudo certo",
  acordada: "Janete",
  fala: "Janete, falando",
};

type Props = {
  estado?: EstadoJanete | undefined;
  /** Lado do símbolo em px (de 16 a 144). Padrão 40. */
  tamanho?: number | undefined;
  /** Só em `fala`: os três pontos pulam em onda (o "digitando" do chat). */
  digitando?: boolean | undefined;
  /** Nome acessível. Padrão (também com ""): o do estado ("Janete, carregando"). */
  rotulo?: string | undefined;
  /** Ao lado do nome "Janete" já escrito, o símbolo é decoração: `aria-hidden`. */
  decorativo?: boolean | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  /** `data-*` repassados ao disco (alvo do voo entre etapas, `data-testid`). */
  [dado: `data-${string}`]: string | undefined;
};

/**
 * O símbolo da Janete (o AI Spark: anel aberto, "AI" e brilho de quatro pontas), só o
 * desenho em laranja, sem fundo. Um componente só para todos os estados: trocar `estado`
 * faz a transição contínua. Com `prefers-reduced-motion`, vai direto ao estado final.
 *
 * Dentro de um botão com `data-janete-gatilho`, o "AI" vira os três pontos de fala no hover
 * e no foco (o botão do canto "Fale com a Janete").
 */
export function JaneteSimbolo({
  estado = "acordada",
  tamanho = 40,
  digitando = false,
  rotulo,
  decorativo = false,
  className,
  style,
  ...dados
}: Props) {
  const acessivel = decorativo
    ? ({ "aria-hidden": true } as const)
    : ({
        role: "img",
        // `||`, não `??`: rótulo vazio cai no do estado (para esconder, use `decorativo`).
        "aria-label": rotulo || (estado === "fala" && digitando ? "Janete, digitando" : ROTULOS[estado]),
      } as const);

  return (
    <span
      {...dados}
      {...acessivel}
      className={cx(s.janete, className)}
      data-estado={estado}
      data-digitando={(estado === "fala" && digitando) || undefined}
      style={{ width: tamanho, height: tamanho, ...style }}
    >
      <svg className={s.desenho} viewBox="180 150 920 920" aria-hidden="true" focusable="false">
        <path className={s.anel} d={ANEL} />
        <g className={s.letras}>
          <path fillRule="evenodd" d={LETRA_A} />
          <path d={LETRA_I} />
        </g>
        <g className={s.pontos}>
          <circle cx="473" cy="649" r="46" />
          <circle cx="603" cy="649" r="46" />
          <circle cx="733" cy="649" r="46" />
        </g>
        <path className={s.check} d="M 455 660 L 560 765 L 760 545" />
        <path className={s.brilho} d={BRILHO} />
      </svg>
    </span>
  );
}
