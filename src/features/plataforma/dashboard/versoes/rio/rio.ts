import type { EtapaFunil } from "../../dados";

// O rio de leads: a conta do desenho, separada do React e do canvas para poder ser testada.
//
// Cada ponto do rio é um lead. Ele nasce na margem esquerda, anda até a etapa onde a história dele
// termina no período e lá mostra o que aconteceu: virou venda (verde, segue até sair pela direita),
// foi perdido (vermelho, afunda), parou sem responder (cinza, fica à deriva) ou ainda está em
// andamento (laranja, fica na etapa). As proporções vêm do funil do painel: nada aqui vira número na
// tela, é só desenho.

export type FimDoPonto = "ganho" | "perdido" | "parado" | "andando";

export interface Destino {
  /** O índice da etapa onde o ponto termina. */
  k: number;
  fim: FimDoPonto;
  /** Quantos leads do período tiveram este fim nesta etapa (o peso do sorteio). */
  peso: number;
}

export interface TabelaDoRio {
  destinos: Destino[];
  /** A soma dos pesos (0 quando não chegou ninguém). */
  total: number;
  /** Quantas etapas o rio atravessa. */
  etapas: number;
}

const naoNegativo = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

/**
 * De cada etapa, quem ficou nela (chegou e não chegou à seguinte) se divide em perdidos, parados sem
 * resposta e os que ainda estão em andamento. Na etapa de ganho, todos os que chegaram viraram venda.
 */
export function montarTabela(etapas: readonly EtapaFunil[]): TabelaDoRio {
  const destinos: Destino[] = [];
  etapas.forEach((e, k) => {
    const chegaram = naoNegativo(e.chegaram);
    if (e.tipo === "ganho") {
      if (chegaram > 0) destinos.push({ k, fim: "ganho", peso: chegaram });
      return;
    }
    const seguinte = etapas[k + 1];
    const ficaram = naoNegativo(chegaram - (seguinte ? naoNegativo(seguinte.chegaram) : 0));
    const perdido = Math.min(ficaram, naoNegativo(e.abandonaram.perdido));
    const parado = Math.min(ficaram - perdido, naoNegativo(e.abandonaram.semResposta));
    const andando = ficaram - perdido - parado;
    if (perdido > 0) destinos.push({ k, fim: "perdido", peso: perdido });
    if (parado > 0) destinos.push({ k, fim: "parado", peso: parado });
    if (andando > 0) destinos.push({ k, fim: "andando", peso: andando });
  });
  return { destinos, total: destinos.reduce((s, d) => s + d.peso, 0), etapas: etapas.length };
}

/** Sorteia o fim de um ponto, na proporção dos pesos. `r` vai de 0 (inclusive) a 1 (exclusive). */
export function sortear(tabela: TabelaDoRio, r: number): Destino | null {
  if (tabela.total <= 0) return null;
  let alvo = Math.min(Math.max(r, 0), 0.999999) * tabela.total;
  for (const d of tabela.destinos) {
    if (alvo < d.peso) return d;
    alvo -= d.peso;
  }
  return tabela.destinos[tabela.destinos.length - 1] ?? null;
}

/* ---------- a simulação ---------- */

export interface Ponto {
  x: number;
  y: number;
  /** A linha de base do ponto na correnteza (0 a 1 da altura do leito). */
  faixa: number;
  /** A fase do balanço. */
  onda: number;
  /** Onde ele para (0 a 1 da largura). */
  alvoX: number;
  /** A partir de onde o ponto que vira venda fica verde (o começo da última etapa). */
  verdeEm: number;
  fim: FimDoPonto;
  /** "indo" até chegar ao alvo; depois, o fim dele. */
  estado: "indo" | "fim";
  /** Segundos desde que chegou ao fim. */
  t: number;
  velocidade: number;
  raio: number;
  /** 0 a 1. Em 0 o ponto sai do rio. */
  opacidade: number;
}

export interface EstadoDoRio {
  pontos: Ponto[];
  /** Fração de ponto acumulada para o próximo nascimento. */
  resto: number;
  tempo: number;
}

export const MAX_PONTOS = 260;
/** Quanto tempo o ponto parado (cinza) e o que ainda anda (laranja) ficam na etapa antes de sumir. */
export const ESPERA_S = 4;

export function estadoInicial(): EstadoDoRio {
  return { pontos: [], resto: 0, tempo: 0 };
}

function nascer(tabela: TabelaDoRio, sorte: () => number): Ponto | null {
  const d = sortear(tabela, sorte());
  if (!d) return null;
  const largura = 1 / Math.max(1, tabela.etapas);
  // dentro da coluna da etapa, longe das margens dela; o ganho atravessa a última e sai pela direita
  const alvoX = d.fim === "ganho" ? 1.04 : (d.k + 0.2 + sorte() * 0.6) * largura;
  return {
    x: -0.02,
    y: 0,
    faixa: 0.12 + sorte() * 0.76,
    onda: sorte() * Math.PI * 2,
    alvoX,
    verdeEm: d.k * largura,
    fim: d.fim,
    estado: "indo",
    t: 0,
    velocidade: 0.11 + sorte() * 0.07,
    raio: 2.2 + sorte() * 1.6,
    opacidade: 1,
  };
}

/**
 * Avança o rio `dt` segundos. `porSegundo` é o ritmo dos nascimentos. As posições ficam em frações
 * (x de 0 a 1 da largura, y de 0 a 1 da altura do leito; acima de 1 o ponto já afundou).
 */
export function avancar(estado: EstadoDoRio, tabela: TabelaDoRio, dt: number, porSegundo: number, sorte: () => number = Math.random): void {
  estado.tempo += dt;
  estado.resto += dt * porSegundo;
  while (estado.resto >= 1) {
    estado.resto -= 1;
    if (estado.pontos.length >= MAX_PONTOS) continue;
    const p = nascer(tabela, sorte);
    if (p) {
      p.y = p.faixa;
      estado.pontos.push(p);
    }
  }
  for (const p of estado.pontos) {
    if (p.estado === "indo") {
      p.x += p.velocidade * dt;
      p.y = p.faixa + Math.sin(estado.tempo * 1.6 + p.onda) * 0.035;
      if (p.x >= p.alvoX) {
        p.estado = "fim";
        p.t = 0;
        if (p.fim === "ganho") p.opacidade = 0;
      }
      continue;
    }
    p.t += dt;
    if (p.fim === "perdido") {
      // afunda e some
      p.y += (0.25 + p.t * 0.5) * dt;
      p.x += p.velocidade * 0.15 * dt;
      p.opacidade = Math.max(0, 1 - p.t / 1.8);
    } else {
      // parado sem resposta (à deriva) ou ainda em andamento (quieto na etapa)
      const deriva = p.fim === "parado" ? 0.012 : 0.004;
      p.x += Math.cos(estado.tempo * 0.7 + p.onda) * deriva * dt;
      p.y = p.faixa + Math.sin(estado.tempo * 0.9 + p.onda) * 0.03;
      p.opacidade = p.t < ESPERA_S ? 1 : Math.max(0, 1 - (p.t - ESPERA_S) / 1.2);
    }
  }
  estado.pontos = estado.pontos.filter((p) => p.opacidade > 0);
}

/** A cor de um ponto: laranja enquanto anda; ao chegar ao fim, a cor do fim. */
export function tomDoPonto(p: Ponto): FimDoPonto {
  if (p.fim === "ganho") return p.x >= p.verdeEm ? "ganho" : "andando";
  return p.estado === "fim" ? p.fim : "andando";
}
