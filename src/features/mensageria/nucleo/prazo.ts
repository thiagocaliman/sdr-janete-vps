// Prazo absoluto de uma chamada do worker (spec da mensageria, "Resultado da prova"): a rota
// tem um tempo limite de 50 a 60 s, então cada passo recebe o instante em que tem de ter acabado
// (fimEm, em ms desde 1970, como Date.now()) e corta o próprio tempo por ele.

export type OpcoesPrazo = {
  /** Instante (Date.now()) em que a chamada tem de ter acabado. Sem ele, vale só o teto. */
  fimEm?: number;
};

/** Folga padrão antes do fim, para gravar o resultado depois que o pedido desiste. */
export const FOLGA_PRAZO_MS = 1_000;

/**
 * Tempo para um pedido: o teto dele, cortado pelo que falta até fimEm menos a folga.
 * Nunca negativo (0 = o pedido desiste na hora).
 */
export function tempoAte(tetoMs: number, fimEm?: number, folgaMs = FOLGA_PRAZO_MS): number {
  if (fimEm === undefined || !Number.isFinite(fimEm)) return tetoMs;
  return Math.max(0, Math.min(tetoMs, fimEm - Date.now() - folgaMs));
}

// ---------------------------------------------------------------------------
// Envio: o pedido ao gateway nunca pode ser cortado no meio
// ---------------------------------------------------------------------------
// Se o gateway aceita a mensagem e o tempo limite corta a rota antes do concluir_envio, ela fica
// "enviando" e, 2 min depois, o pegar_envios a devolve para a fila: sem eco do gateway (a Meta
// não tem), o lead a recebe 2 vezes. Abortar o pedido mais cedo não resolve (o tempo esgotado
// também reenvia). Por isso o ciclo só começa um envio quando o teto inteiro dele, mais a
// reserva do concluir_envio, cabe antes do corte.

/**
 * O corte de tempo vem entre 50 e 60 s (a prova gravou até ~50 s). Com o orçamento de 45 s,
 * fimEm + 5 s = 50 s é o limite duro para um pedido já começado terminar.
 */
export const FOLGA_CORTE_MS = 5_000;
/** Teto do pedido de envio de texto ao gateway (os 4 gateways). */
export const TETO_ENVIO_TEXTO_MS = 10_000;
/** Teto do envio de mídia: a Evolution baixa o arquivo da URL assinada antes de responder. */
export const TETO_ENVIO_MIDIA_MS = 20_000;
/** Reserva para o concluir_envio (até 3 tentativas, com pausas de 200 e 800 ms). */
export const RESERVA_CONCLUIR_ENVIO_MS = 2_000;

export type TipoEnvio = "texto" | "imagem" | "audio" | "documento";

export function tetoEnvio(tipo: TipoEnvio): number {
  return tipo === "texto" ? TETO_ENVIO_TEXTO_MS : TETO_ENVIO_MIDIA_MS;
}

/** true = um pedido com esse teto, mais a reserva do concluir_envio, termina antes do corte. */
export function cabeEnvio(tetoMs: number, fimEm: number): boolean {
  return fimEm + FOLGA_CORTE_MS - Date.now() >= tetoMs + RESERVA_CONCLUIR_ENVIO_MS;
}

/**
 * Tempo do pedido de envio no gateway: o teto do tipo. Com fimEm, nunca passa do corte menos a
 * reserva do concluir_envio. Como o ciclo só começa o envio quando cabeEnvio, na prática é
 * sempre o teto inteiro; o corte por fimEm é só a rede de segurança (última tentativa).
 */
export function tempoEnvio(tipo: TipoEnvio, fimEm?: number): number {
  const limite =
    fimEm === undefined || !Number.isFinite(fimEm) ? undefined : fimEm + FOLGA_CORTE_MS;
  return tempoAte(tetoEnvio(tipo), limite, RESERVA_CONCLUIR_ENVIO_MS);
}
