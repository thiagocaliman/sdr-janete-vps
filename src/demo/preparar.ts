import { CHAVE_SESSION_STORAGE, ESTADO_INICIAL, type EstadoOnboarding } from "@/features/onboarding/estado";

import { CONTEXTO_DEMO } from "./negocio";

/**
 * Deixa a aba como a de uma conta que já fez o onboarding: o nome da empresa (que o topo tira da
 * primeira frase de "Empresa e oferta") e o tom vêm das respostas. Só grava se a aba ainda não tem.
 */
export function prepararAbaDemo(): void {
  try {
    if (sessionStorage.getItem(CHAVE_SESSION_STORAGE)) return;
    const estado: EstadoOnboarding = {
      ...ESTADO_INICIAL,
      etapa: "preparando",
      conexao: { modo: "naooficial", gateway: "zapi", rotulo: "(21) 90000-0000" },
      cerebro: { provedor: "anthropic", modelo: "claude-haiku-5-5", ultimos4: "DEMO" },
      voz: { ultimos4: null, pulou: true },
      conversa: { respostas: { ...CONTEXTO_DEMO }, confirmado: true },
      concluidoEm: "2026-11-02T10:20:00-03:00",
    };
    sessionStorage.setItem(CHAVE_SESSION_STORAGE, JSON.stringify(estado));
  } catch {
    // sem sessionStorage (modo privado): a demo abre sem o nome da empresa no topo
  }
}
