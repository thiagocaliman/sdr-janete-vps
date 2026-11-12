import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  Award,
  Clock,
  createLucideIcon,
  FileText,
  GraduationCap,
  MessageCircleQuestion,
  ShieldAlert,
  Tag,
  Target,
  Users,
  Zap,
} from "lucide-react";

import type { Enums } from "@/integrations/supabase/types";

/** O prédio do Contexto 6 (IC.empresa, Contexto-6.dc.html): o lucide não tem um igual. */
const Empresa = createLucideIcon("ctx-empresa", [
  ["path", { d: "M3 21h18", key: "chao" }],
  ["path", { d: "M5 21V7l7-4 7 4v14", key: "predio" }],
  ["path", { d: "M9 10h1M14 10h1M9 14h1M14 14h1", key: "janelas" }],
  ["path", { d: "M10 21v-3h4v3", key: "porta" }],
]);

// O contrato da tela de Contexto (docs/spec-contexto.md, "Contratos"). A forma segue a tabela
// `contexto_versoes` (drizzle/migrations/0000 e 0009): no modo banco, as versões vêm de
// dados/contexto.ts; nos testes, da loja em memória (loja.ts).

/** As 8 colunas de texto de `contexto_versoes`. */
export type ChaveCampo =
  | "empresa_oferta"
  | "cliente_ideal"
  | "preco"
  | "diferenciais"
  | "tom_voz"
  | "quando_passar_humano"
  | "objecoes"
  | "horario";

/**
 * As 4 camadas do Método D.A.T.A.: Descrição, Ação, Treinamento e Atenção. É só a organização da tela:
 * as colunas do banco e o que a IA lê (mensageria/ia/instrucoes.ts) não mudam. As perguntas livres
 * ficam em Treinamento, junto com as Objeções.
 */
export type GrupoId = "descricao" | "acao" | "treinamento" | "atencao";

export interface InfoCampo {
  chave: ChaveCampo;
  /** O nome curto da tela (o rótulo longo, o da IA, fica em mensageria/ia/instrucoes.ts). */
  rotulo: string;
  grupo: GrupoId;
  icone: LucideIcon;
  /** O que o campo guarda; vira o texto de ajuda do campo vazio e o placeholder. */
  ajuda: string;
}

/** Na ordem das colunas do banco (a ordem de cada camada na tela sai de `camposDoGrupo`). */
export const CAMPOS: readonly InfoCampo[] = [
  { chave: "empresa_oferta", grupo: "descricao", rotulo: "Empresa e oferta", icone: Empresa, ajuda: "O que a empresa faz e o que vende." },
  { chave: "cliente_ideal", grupo: "descricao", rotulo: "Cliente ideal", icone: Target, ajuda: "Para quem vocês vendem." },
  { chave: "preco", grupo: "descricao", rotulo: "Preço", icone: Tag, ajuda: "Quanto custa e como se paga." },
  { chave: "diferenciais", grupo: "descricao", rotulo: "Diferenciais", icone: Award, ajuda: "Por que escolher vocês e não a concorrência." },
  { chave: "tom_voz", grupo: "atencao", rotulo: "Tom de voz", icone: AudioLines, ajuda: "Como a Janete deve falar com os leads." },
  {
    chave: "quando_passar_humano",
    grupo: "acao",
    rotulo: "Passar para humano",
    icone: Users,
    ajuda: "Quando um lead está pronto para falar com alguém da equipe.",
  },
  {
    chave: "objecoes",
    grupo: "treinamento",
    rotulo: "Objeções",
    icone: MessageCircleQuestion,
    ajuda: "As dúvidas e resistências que mais aparecem, com a resposta para cada uma.",
  },
  { chave: "horario", grupo: "acao", rotulo: "Horário", icone: Clock, ajuda: "Quando a Janete atende e o que ela diz fora do horário." },
] as const;

export interface InfoGrupo {
  id: GrupoId;
  /** A letra do método: D, A, T, A. */
  letra: string;
  nome: string;
  curto: string;
  /** A pergunta-guia da camada. */
  guia: string;
  icone: LucideIcon;
}

export const GRUPOS: readonly InfoGrupo[] = [
  { id: "descricao", letra: "D", nome: "Descrição", curto: "Descrição", guia: "O que a Janete precisa saber sobre seu negócio?", icone: FileText },
  { id: "acao", letra: "A", nome: "Ação", curto: "Ação", guia: "O que a Janete deve fazer durante o atendimento?", icone: Zap },
  {
    id: "treinamento",
    letra: "T",
    nome: "Treinamento",
    curto: "Treinamento",
    guia: "Quais perguntas e situações a Janete precisa aprender a responder?",
    icone: GraduationCap,
  },
  { id: "atencao", letra: "A", nome: "Atenção", curto: "Atenção", guia: "Como a Janete deve se comportar ao conversar com seus clientes?", icone: ShieldAlert },
] as const;

/** A camada que guarda as perguntas livres. */
export const GRUPO_DAS_LIVRES: GrupoId = "treinamento";

export function infoGrupo(id: GrupoId): InfoGrupo {
  const g = GRUPOS.find((x) => x.id === id);
  if (!g) throw new Error(`camada desconhecida: ${id}`);
  return g;
}

export function ehGrupo(x: string): x is GrupoId {
  return GRUPOS.some((g) => g.id === x);
}

/** Um item de `contexto_versoes.itens`: o formato que mensageria/ia/instrucoes.ts lê. Nunca `{ p, r }`. */
export interface ItemLivre {
  pergunta: string;
  resposta: string;
}

/**
 * O banco não guarda anexos, e na v1 eles ficam escondidos (decisão 11a da spec de ligar as telas):
 * toda versão vem com as listas vazias. O tipo fica para quando os anexos entrarem.
 */
export interface Anexo {
  id: string;
  tipo: "arquivo" | "link";
  /** O nome do arquivo ou o endereço do link. */
  nome: string;
  /** "PDF · 3,2 MB" ou o host do link. */
  detalhe: string;
  /** O que a Janete aprendeu (texto da linha "A Janete aprendeu: …"); vazio enquanto lê. */
  aprendeu: string;
  estado: "lendo" | "pronto";
}

export type OrigemVersao = Enums<"contexto_origem">;

/**
 * Uma versão imutável (uma linha de `contexto_versoes`). `id` é o da linha: a atual é a de maior id,
 * a mesma que a Janete usa. `numero` é o que a tela mostra (1, 2, 3, sem buracos: decisão 11c).
 */
export interface VersaoContexto {
  id: number;
  numero: number;
  origem: OrigemVersao;
  /** "Você", o nome de quem salvou, ou "Alguém que saiu da equipe" (`criado_por` → membros). */
  quem: string;
  /** Instante ISO (`criado_em`); a tela formata em America/Sao_Paulo (regras.quando). */
  criadoEm: string;
  /** Só na origem "restauracao": o número da versão de onde veio (pelo `restaurada_de`). */
  restauradaDe?: number | undefined;
  /** Uma linha para o histórico ("Preço e Diferenciais, com 2 anexos."). */
  resumo: string;
  campos: Record<ChaveCampo, string>;
  itens: ItemLivre[];
  anexos: Record<ChaveCampo, Anexo[]>;
}

/** O que está aberto no editor: um campo, um item livre (1, 2, …) ou o item novo. */
export type Alvo = ChaveCampo | `livre-${number}` | "livre-novo";

/** O que o admin mudou e ainda não salvou ("Não salvo"). O atendente nunca vê rascunho. */
export interface Rascunho {
  /** O texto inteiro do campo, quando editado pelo "Editar texto". */
  texto?: string | undefined;
  /** O que chegou pela caixa de mandar ou pelo "Ensinar", somado ao texto ao salvar. */
  extras?: string[] | undefined;
  /** Anexos novos (os da versão atual continuam na versão). */
  anexos?: Anexo[] | undefined;
  /** Anexos da versão atual marcados para sair. */
  removidos?: string[] | undefined;
  pergunta?: string | undefined;
  resposta?: string | undefined;
  /**
   * O id da versão aberta quando o rascunho nasceu: vai como `p_base` do `contexto_salvar`, para o
   * banco saber se outro admin mudou o mesmo campo enquanto este editava (decisão 11b).
   */
  base?: number | undefined;
}

export type Situacao = "sabe" | "vazio" | "nao_salvo";

export type ErroContexto =
  /** Atendente (ou sem papel de admin). */
  | "sem_permissao"
  /** Salvar sem nenhuma mudança, ou item livre sem pergunta ou sem resposta. */
  | "vazio"
  /** Versão, item ou anexo que não existe. */
  | "nao_encontrado"
  /** A tela está mostrando uma versão antiga: só lê. */
  | "versao_antiga"
  /** Já há uma pergunta livre nova sem salvar: o "Ensinar" não a troca por outra. */
  | "ocupado"
  /** Outro admin mudou o mesmo campo enquanto este editava (decisão 11b, `contexto_mudou`). */
  | "contexto_mudou"
  /** Passou de 2.000 letras num campo ou numa resposta livre (decisão 11d). */
  | "limite_tamanho"
  /** O Contexto passaria de 50 perguntas livres (`limite_itens` do `contexto_salvar`). */
  | "limite_itens"
  /** Rede ou erro que a tela não trata. */
  | "falha";

/**
 * O resultado de toda ação. Nunca lança; a recusada não muda nada. `versao` é o número da versão
 * gravada. Com `contexto_mudou`, `textoNovo` traz o que o outro admin deixou naquele campo.
 */
export type ResultadoContexto =
  | { ok: true; versao?: number | undefined }
  | { ok: false; erro: ErroContexto; textoNovo?: string | undefined };

/** O que o "Ensinar algo novo" descobriu: o campo, um item livre novo, ou nada (a tela pede para escolher). */
export type DestinoEnsinar = ChaveCampo | "livre" | null;

export function ehChaveCampo(x: string): x is ChaveCampo {
  return CAMPOS.some((c) => c.chave === x);
}

export function infoCampo(chave: ChaveCampo): InfoCampo {
  const c = CAMPOS.find((x) => x.chave === chave);
  if (!c) throw new Error(`campo desconhecido: ${chave}`);
  return c;
}

export function camposDoGrupo(g: GrupoId): readonly InfoCampo[] {
  return CAMPOS.filter((c) => c.grupo === g);
}
