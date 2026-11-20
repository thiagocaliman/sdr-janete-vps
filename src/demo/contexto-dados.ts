import { semAnexos } from "@/features/plataforma/contexto/regras";
import type { ChaveCampo, ItemLivre, VersaoContexto } from "@/features/plataforma/contexto/tipos";

import { CONTEXTO_DEMO, PERGUNTAS_DEMO } from "./negocio";

// O Contexto de exemplo na demo (troca o de src/features/plataforma/contexto/dados.ts no build da
// demo): 3 versões da Rio Alto, da mais nova para a mais velha. A v3 é a atual, com os 8 campos.

type Campos = Record<ChaveCampo, string>;

function copiar(v: VersaoContexto): VersaoContexto {
  return { ...v, campos: { ...v.campos }, itens: v.itens.map((i) => ({ ...i })), anexos: semAnexos() };
}

const ITENS: ItemLivre[] = PERGUNTAS_DEMO.map((p) => ({ pergunta: p.pergunta, resposta: p.resposta }));

export function versoesDeExemplo(): VersaoContexto[] {
  const campos1: Campos = {
    empresa_oferta: "Rio Alto Voos Panorâmicos: passeios de helicóptero sobre o Rio de Janeiro.",
    cliente_ideal: "Turistas e cariocas que querem ver o Rio de cima.",
    preco: "Cristo Redentor, R$ 690 por pessoa. Cristo e Pão de Açúcar, R$ 990. Rio Completo, R$ 2.290.",
    diferenciais: "",
    tom_voz: "Simpática e direta.",
    quando_passar_humano: "Quando o cliente quiser reservar.",
    objecoes: "",
    horario: "",
  };
  const v1: VersaoContexto = {
    id: 1,
    numero: 1,
    origem: "onboarding",
    quem: "Você",
    criadoEm: "2026-11-02T10:15:00-03:00",
    resumo: "Montada no onboarding, com 6 campos.",
    campos: campos1,
    itens: [],
    anexos: semAnexos(),
  };
  const base2 = copiar(v1);
  const v2: VersaoContexto = {
    ...base2,
    id: 2,
    numero: 2,
    origem: "edicao",
    criadoEm: "2026-11-04T18:40:00-03:00",
    resumo: "Objeções, Horário e 2 perguntas livres.",
    campos: { ...base2.campos, objecoes: CONTEXTO_DEMO.objecoes, horario: CONTEXTO_DEMO.horario },
    itens: ITENS.slice(0, 2).map((i) => ({ ...i })),
  };
  const v3: VersaoContexto = {
    ...copiar(v2),
    id: 3,
    numero: 3,
    origem: "edicao",
    criadoEm: "2026-11-10T09:05:00-03:00",
    resumo: "Os 8 campos completos e mais 2 perguntas livres.",
    campos: { ...CONTEXTO_DEMO },
    itens: ITENS.map((i) => ({ ...i })),
  };
  return [v3, v2, v1];
}
