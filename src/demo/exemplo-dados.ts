// GERADO para a demo (vite.demo.config.ts): cópia de src/features/plataforma/exemplo/dados.ts com os
// leads, as anotações e os nomes do negócio fictício da demo (Rio Alto Voos Panorâmicos). Mesma API.
import { MODO_VOZ_PADRAO, type VozDaConta } from "@/features/servidor/vozes-tipos";

import { ATENDENTE_DEMO, DONO_DEMO } from "./negocio";

import type {
  AtorHistorico,
  Configuracao,
  Conexao,
  Contato,
  Convite,
  Conversa,
  ChaveIA,
  CustoIA,
  EstadoBase,
  Etapa,
  EventoPassagem,
  HistoricoEtapa,
  Membro,
  Mensagem,
  MotivoHumano,
  OrigemPassagem,
  StatusMensagem,
  TipoMensagem,
} from "@/features/plataforma/exemplo/tipos";

// Os dados fictícios do modo exemplo: um arquivo só, coerente entre as telas (o mesmo lead aparece
// no Chat, no Kanban e em Contatos). Os leads e as conversas são os dos protótipos já aprovados:
// os 8 do Chat final (as conversas ricas) e 15 do Kanban 2. Telefones (xx) 90000-xxxx, e-mails em
// ".exemplo" e empresas inventadas: nada de pessoa ou empresa real. Nenhum número daqui vale como
// número de negócio (spec, premissas).
//
// As horas são as dos protótipos, relativas ao "agora" deles (hoje, 14:44): cada momento vira
// "tantos minutos antes de agora", então a ordem e as distâncias se mantêm em qualquer hora do dia.
// O dia que a tela mostra (hoje, ontem) sai do instante, no fuso de São Paulo, pela tela.

/** Os ids fixos que as telas e os testes podem usar. */
export const IDS = {
  voce: "mb-voce",
  marina: "mb-marina",
  /** O convite pendente do exemplo (spec da Equipe, F3). */
  convite: "cn-rodrigo",
  conexao: "cx-zapi",
  chaveResposta: "ch-resposta",
  etapa: {
    novo: "et-novo",
    em_qualificacao: "et-em-qualificacao",
    qualificado: "et-qualificado",
    em_negociacao: "et-em-negociacao",
    ganho: "et-ganho",
    perdido: "et-perdido",
  },
} as const;

type ChaveEtapa = keyof typeof IDS.etapa;
type Quem = "voce" | "marina";

/** Id do contato e da conversa de um lead do exemplo ("ricardo" → "ct-ricardo" / "cv-ricardo"). */
export const idContato = (lead: string) => `ct-${lead}`;
export const idConversa = (lead: string) => `cv-${lead}`;

/**
 * As vozes da "conta da ElevenLabs" do exemplo (spec-voz-uso, P18): três, sem prévia, porque a demo
 * não toca áudio inventado (o mesmo critério do QR code, que a demo também não inventa).
 */
export const VOZES_EXEMPLO: readonly VozDaConta[] = [
  { id: "exemplo-voz-a", nome: "Voz de exemplo A", detalhe: null, portugues: true, previa: null },
  { id: "exemplo-voz-b", nome: "Voz de exemplo B", detalhe: null, portugues: true, previa: null },
  { id: "exemplo-voz-c", nome: "Voz de exemplo C", detalhe: null, portugues: true, previa: null },
];

/* ---------- tempo ---------- */

/** [dia, hora]: dia 0 = hoje, -1 = ontem; hora "hh:mm" do protótipo. */
type Quando = readonly [dia: number, hora: string];

// O "agora" dos protótipos é 14:44; um minuto a mais deixa tudo no passado, até o que chegou às 14:44.
const REF_MIN = 14 * 60 + 45;

function minutosAntes([dia, hora]: Quando): number {
  const [h = 0, m = 0] = hora.split(":").map(Number);
  return -dia * 1440 + REF_MIN - (h * 60 + m);
}

/* ---------- as sementes ---------- */

interface MsgSemente {
  de: "lead" | "janete" | "tela" | "cel";
  em: Quando;
  texto?: string;
  tipo?: TipoMensagem;
  autor?: Quem;
  st?: StatusMensagem;
  midia?: { nome: string; mime: string; tamanho?: number };
  dur?: number;
  /** Só em áudio: o texto transcrito; `null` = sem transcrição. */
  transc?: string | null;
  reacao?: string;
  /** Índice (na lista de itens) da mensagem citada. */
  cita?: number;
  editada?: boolean;
  apagada?: boolean;
  erro?: string;
}

interface EventoSemente {
  ev: EventoPassagem["tipo"];
  em: Quando;
  quem?: Quem;
  motivo?: MotivoHumano;
  de?: OrigemPassagem;
  deQuem?: Quem;
}

type ItemSemente = MsgSemente | EventoSemente;

interface LeadSemente {
  lead: string;
  nome: string;
  zap: string;
  /** Só dígitos, com o código do país, como no banco (check telefone ~ '^[0-9]+$'). */
  tel: string;
  email?: string;
  empresa?: string;
  /** A etapa atual é a última do histórico. */
  hist: readonly (readonly [ChaveEtapa, "sistema" | "janete" | Quem, Quando])[];
  modo: "janete" | "humano";
  resp?: Quem;
  motivo?: MotivoHumano;
  naoLidas?: number;
  devolvida?: Quando;
  resumo: string;
  obs?: string;
  /** Gasto de IA de cada resposta da Janete (US$, fictício). */
  custoResposta: number;
  digitando?: boolean;
  itens: readonly ItemSemente[];
}

const KB = 1024;
const MB = 1024 * 1024;
const JPG = "image/jpeg";
const PDF = "application/pdf";

const LEADS: readonly LeadSemente[] = [
  /* ===== as conversas ricas do Chat ===== */
  {
    lead: "larissa",
    nome: "Larissa Couto",
    zap: "Lari Couto",
    tel: "5521900000001",
    email: "larissa.couto@email.exemplo",
    hist: [
      ["novo", "sistema", [-1, "20:14"]],
      ["em_qualificacao", "janete", [-1, "20:15"]],
      ["qualificado", "janete", [0, "14:12"]],
    ],
    modo: "humano",
    motivo: "janete_passou",
    naoLidas: 1,
    resumo:
      "Quer pedir a namorada em casamento num voo privativo, só as duas, no fim da tarde, passando pelo Cristo. Recebeu o roteiro e o preço (a partir de R$ 3.900). Quer sábado que vem, por volta das 17h. É surpresa.",
    obs: "Surpresa: não ligar nem mandar nada para a namorada.",
    custoResposta: 0.014,
    itens: [
      { de: "lead", em: [-1, "20:14"], texto: "Boa noite! Quero pedir minha namorada em casamento lá em cima. Vocês fazem isso?" },
      {
        de: "janete",
        em: [-1, "20:14"],
        texto: "Boa noite, Larissa! Fazemos, sim, e é um dos voos mais bonitos que a gente faz. Seriam só vocês duas?",
      },
      {
        de: "lead",
        em: [-1, "20:21"],
        tipo: "audio",
        dur: 34,
        midia: { nome: "audio-larissa.ogg", mime: "audio/ogg", tamanho: 55 * KB },
        transc:
          "Isso, só nós duas. Eu queria que fosse no fim da tarde, com o pôr do sol, e se der passando pelo Cristo. É aniversário de namoro também, então tem que ser perfeito.",
      },
      {
        de: "janete",
        em: [-1, "20:22"],
        texto:
          "Que lindo! Para esse momento o ideal é o voo privativo: só vocês duas e o piloto, com o Cristo e a orla no fim da tarde. Vou te mandar o roteiro com o mapa.",
      },
      { de: "janete", em: [-1, "20:22"], tipo: "documento", midia: { nome: "roteiro-voo-privativo.pdf", mime: PDF, tamanho: 1.8 * MB } },
      {
        de: "janete",
        em: [-1, "20:23"],
        tipo: "imagem",
        texto: "Essa é a vista do fim da tarde, sobre a orla.",
        midia: { nome: "por-do-sol-vista-aerea.jpg", mime: JPG, tamanho: 2.1 * MB },
      },
      { de: "lead", em: [-1, "20:30"], texto: "Meu Deus, perfeito 😍 Quanto fica?" },
      {
        de: "janete",
        em: [-1, "20:31"],
        texto: "O voo privativo começa em R$ 3.900, para até 3 pessoas, no Pix ou no cartão em até 6 vezes. Você já tem um dia em mente?",
        reacao: "🙏",
      },
      { de: "lead", em: [0, "14:08"], texto: "Pensei no sábado que vem, umas 17h. Dá?" },
      {
        de: "janete",
        em: [0, "14:11"],
        cita: 8,
        texto:
          "Anotei: sábado que vem, por volta das 17h. Quem confirma a vaga e o horário do pôr do sol é a nossa equipe. Já passei para eles, e eles continuam com você por aqui mesmo.",
      },
      { ev: "passou", em: [0, "14:12"], motivo: "janete_passou" },
      { de: "lead", em: [0, "14:40"], texto: "Ah, e ela não pode saber de nada, tá? 🙈" },
    ],
  },
  {
    lead: "pedro",
    nome: "Pedro Albuquerque",
    zap: "Pedro A.",
    tel: "5531900000002",
    hist: [
      ["novo", "sistema", [0, "14:30"]],
      ["em_qualificacao", "janete", [0, "14:31"]],
    ],
    modo: "janete",
    resumo:
      "Família de 4: o casal e dois filhos, de 6 e 9 anos. Quer o voo do Cristo e Pão de Açúcar. Ele pesa 105 kg, dentro do limite. Estão no Rio até domingo e preferem sexta de manhã.",
    custoResposta: 0.006,
    digitando: true,
    itens: [
      { de: "lead", em: [0, "14:30"], texto: "Oi! Somos 4: eu, minha esposa e dois filhos, de 6 e 9 anos. Criança pode voar?" },
      {
        de: "janete",
        em: [0, "14:30"],
        texto: "Oi, Pedro! Pode, sim: a partir de 2 anos, cada criança com assento próprio e acompanhada de um adulto. Vocês vão adorar.",
      },
      {
        de: "janete",
        em: [0, "14:31"],
        texto: "Qual passeio chamou mais a atenção de vocês: o do Cristo, de 7 minutos, ou o do Cristo e Pão de Açúcar, de 12?",
      },
      { de: "lead", em: [0, "14:39"], texto: "O de 12. Tem limite de peso? Eu tenho uns 105 kg" },
      {
        de: "janete",
        em: [0, "14:40"],
        texto: "Tem, sim: até 120 kg por passageiro, então está tudo certo. O de 12 minutos sai R$ 990 por pessoa. Para quando vocês estão pensando?",
      },
      { de: "lead", em: [0, "14:44"], texto: "Estamos no Rio até domingo. Pode ser sexta de manhã?" },
    ],
  },
  {
    lead: "sofia",
    nome: "Sofía Gómez",
    zap: "Sofi",
    tel: "5491100000003",
    hist: [
      ["novo", "sistema", [-1, "10:05"]],
      ["em_qualificacao", "janete", [-1, "10:06"]],
      ["qualificado", "janete", [-1, "10:20"]],
      ["em_negociacao", "marina", [-1, "11:02"]],
    ],
    modo: "humano",
    resp: "marina",
    motivo: "humano_tela",
    naoLidas: 1,
    resumo:
      "Turista argentina, em dupla. Quer o voo do Cristo, de 7 minutos. A conversa foi em espanhol. A Camila ofereceu quinta às 10h, ela aceitou e recebeu a confirmação. Hoje perguntou onde é o embarque.",
    custoResposta: 0.008,
    itens: [
      { de: "lead", em: [-1, "10:05"], texto: "¡Hola! ¿Cuánto cuesta el vuelo al Cristo? Somos dos." },
      {
        de: "janete",
        em: [-1, "10:05"],
        texto: "¡Hola, Sofía! El vuelo al Cristo Redentor dura 7 minutos y cuesta R$ 690 por persona: R$ 1.380 para las dos. ¿Qué día les gustaría volar?",
      },
      { de: "lead", em: [-1, "10:12"], texto: "El jueves por la mañana. ¿Aceptan tarjeta extranjera?" },
      {
        de: "janete",
        em: [-1, "10:13"],
        texto: "Sí, aceptamos tarjeta en hasta 6 cuotas, y también Pix. Anoté: jueves por la mañana, dos personas. Ya le pasé a nuestro equipo para confirmar el horario.",
      },
      { ev: "passou", em: [-1, "10:20"], motivo: "janete_passou" },
      { ev: "assumiu", em: [-1, "11:00"], quem: "marina", de: "janete" },
      { de: "tela", autor: "marina", em: [-1, "11:02"], texto: "¡Hola, Sofía! Soy Camila. Tenemos lugar el jueves a las 10h. ¿Les reservo?" },
      { de: "lead", em: [-1, "11:15"], texto: "¡Sí! Perfecto 🙌" },
      {
        de: "tela",
        autor: "marina",
        em: [-1, "11:20"],
        tipo: "documento",
        midia: { nome: "confirmacion-reserva-jueves-10h.pdf", mime: PDF, tamanho: 210 * KB },
      },
      { de: "lead", em: [0, "09:02"], texto: "¿Dónde es el embarque exactamente?" },
    ],
  },
  {
    lead: "renato",
    nome: "Renato Lopes",
    zap: "Renato Lopes",
    tel: "5511900000004",
    email: "renato.lopes@vertice.exemplo",
    empresa: "Vértice Seguros",
    hist: [
      ["novo", "sistema", [-2, "09:40"]],
      ["qualificado", "janete", [-2, "09:52"]],
      ["em_negociacao", "voce", [-2, "15:10"]],
    ],
    modo: "humano",
    motivo: "humano_celular",
    resumo:
      "Organiza o evento de fim de ano da empresa: 10 pessoas no Rio Completo, no começo do mês que vem. Recebeu a proposta do grupo por e-mail. O financeiro quer pagar metade agora e metade no dia.",
    custoResposta: 0.012,
    itens: [
      {
        de: "lead",
        em: [-2, "09:40"],
        texto: "Bom dia. Estou organizando um evento de fim de ano da empresa, 10 pessoas. Vocês fazem voo para grupo?",
      },
      {
        de: "janete",
        em: [-2, "09:41"],
        texto:
          "Bom dia, Renato! Fazemos, sim. Para grupos acima de 6 pessoas a equipe monta uma proposta com os voos em sequência. Qual roteiro vocês têm em mente, e para quando?",
      },
      { de: "lead", em: [-2, "09:50"], texto: "Rio Completo. No começo do mês que vem." },
      {
        de: "janete",
        em: [-2, "09:52"],
        texto: "Anotei: 10 pessoas, Rio Completo, começo do mês que vem. Vou passar para a equipe montar a proposta do grupo.",
      },
      { ev: "passou", em: [-2, "09:52"], motivo: "janete_passou" },
      { ev: "celular", em: [-2, "15:10"] },
      {
        de: "cel",
        em: [-2, "15:10"],
        texto: "Renato, aqui é o Rafael, da Rio Alto. Mandei a proposta do grupo por e-mail. Para 10 pessoas no Rio Completo, fazemos em 4 voos seguidos.",
      },
      { de: "lead", em: [0, "11:20"], texto: "Recebi. O financeiro pediu para pagar metade agora e metade no dia. Pode ser?" },
    ],
  },
  {
    lead: "juliana",
    nome: "Juliana Martins",
    zap: "Ju Martins",
    tel: "5511900000005",
    hist: [
      ["novo", "sistema", [-1, "23:38"]],
      ["em_qualificacao", "janete", [-1, "23:38"]],
      ["qualificado", "janete", [-1, "23:46"]],
      ["ganho", "voce", [0, "06:20"]],
    ],
    modo: "janete",
    devolvida: [0, "06:22"],
    resumo:
      "Chamou às 23h38 querendo voar no dia seguinte, em dupla, no Cristo e Pão de Açúcar. A Janete respondeu na hora e anotou o pedido. Às 6h12 o Rafael ofereceu as 9h, ela pagou no Pix e voou hoje. Mandou foto do voo.",
    custoResposta: 0.009,
    itens: [
      { de: "lead", em: [-1, "23:38"], texto: "Oi, ainda dá tempo de reservar para amanhã? Sei que está tarde 😅" },
      {
        de: "janete",
        em: [-1, "23:38"],
        texto: "Oi, Juliana! Dá para deixar tudo encaminhado agora: a equipe confirma as vagas a partir das 6h. Quantas pessoas, e qual passeio?",
      },
      { de: "lead", em: [-1, "23:42"], texto: "Duas, Cristo e Pão de Açúcar. E se chover?" },
      {
        de: "janete",
        em: [-1, "23:43"],
        texto: "O voo só sai com tempo bom. Se a equipe cancelar por causa do clima, vocês remarcam sem custo ou recebem o valor de volta.",
      },
      { de: "lead", em: [-1, "23:45"], texto: "Ótimo. De manhã cedo seria o ideal" },
      {
        de: "janete",
        em: [-1, "23:46"],
        texto: "Anotei: duas pessoas, Cristo e Pão de Açúcar, amanhã de manhã cedo. A equipe confirma a partir das 6h, aqui mesmo.",
      },
      { ev: "passou", em: [-1, "23:46"], motivo: "janete_passou" },
      { ev: "assumiu", em: [0, "06:10"], quem: "voce", de: "janete" },
      { de: "tela", autor: "voce", em: [0, "06:12"], texto: "Bom dia, Juliana! Aqui é o Rafael. Tenho vaga às 9h hoje para vocês duas. Fecho?" },
      { de: "lead", em: [0, "06:15"], texto: "Fecha! Mandei o Pix" },
      { de: "lead", em: [0, "06:16"], tipo: "imagem", midia: { nome: "comprovante-pix.jpg", mime: JPG, tamanho: 180 * KB } },
      { de: "tela", autor: "voce", em: [0, "06:20"], texto: "Recebido. Às 8h30 vocês fazem o briefing. Bom voo!", reacao: "❤️" },
      { ev: "devolveu", em: [0, "06:22"], quem: "voce" },
      { de: "janete", em: [0, "11:05"], texto: "Oi, Juliana! Como foi o voo? Se quiser, me manda uma foto lá de cima." },
      {
        de: "lead",
        em: [0, "11:30"],
        tipo: "imagem",
        texto: "Foi incrível!!",
        midia: { nome: "selfie-no-helicoptero.jpg", mime: JPG, tamanho: 1.4 * MB },
      },
    ],
  },
  {
    lead: "marcelo",
    nome: "Marcelo Freitas",
    zap: "Marcelo F.",
    tel: "5521900000006",
    hist: [
      ["novo", "sistema", [-4, "16:20"]],
      ["em_qualificacao", "janete", [-4, "16:21"]],
      ["perdido", "janete", [-3, "10:02"]],
    ],
    modo: "janete",
    resumo: "Perguntou o preço do Rio Completo e achou caro. A Janete ofereceu o voo do Cristo, de 7 minutos. Ele preferiu deixar para outra vez.",
    custoResposta: 0.007,
    itens: [
      { de: "lead", em: [-4, "16:20"], texto: "Quanto é o Rio Completo?" },
      {
        de: "janete",
        em: [-4, "16:20"],
        texto: "Oi, Marcelo! O Rio Completo tem 30 minutos e sai R$ 2.290 por pessoa, com as fotos do voo e o briefing de segurança. Quantas pessoas seriam?",
      },
      { de: "lead", em: [-4, "16:35"], texto: "Achei caro" },
      {
        de: "janete",
        em: [-4, "16:36"],
        texto: "Entendo. Para ver o Rio de cima gastando menos, o voo do Cristo tem 7 minutos e sai R$ 690. O Cristo de pertinho é a parte que o pessoal mais ama.",
      },
      { de: "lead", em: [-3, "10:00"], texto: "Vou deixar para outra vez, obrigado" },
      { de: "janete", em: [-3, "10:02"], st: "entregue", texto: "Combinado, Marcelo. Quando quiser voar, é só me chamar por aqui." },
    ],
  },
  {
    lead: "aline",
    nome: "Aline Barros",
    zap: "Aline",
    tel: "5541900000007",
    hist: [["novo", "sistema", [0, "14:41"]]],
    modo: "janete",
    naoLidas: 2,
    resumo: "Pediu um vídeo do passeio para mostrar ao marido e recebeu o do Cristo e Pão de Açúcar. Gostou e pensa em voar domingo de manhã.",
    custoResposta: 0.004,
    itens: [
      { de: "lead", em: [0, "14:41"], texto: "Oi! Vocês têm algum vídeo do passeio? Quero mostrar para o meu marido" },
      { de: "janete", em: [0, "14:41"], texto: "Oi, Aline! Tenho, sim. Esse é um trecho do voo do Cristo e Pão de Açúcar:" },
      {
        de: "janete",
        em: [0, "14:42"],
        tipo: "video",
        dur: 30,
        midia: { nome: "voo-cristo-pao-de-acucar.mp4", mime: "video/mp4", tamanho: 6.2 * MB },
      },
      { de: "janete", em: [0, "14:42"], st: "entregue", texto: "Vocês estão pensando em voar quando?" },
      {
        de: "lead",
        em: [0, "14:44"],
        tipo: "audio",
        dur: 11,
        midia: { nome: "audio-aline.ogg", mime: "audio/ogg", tamanho: 18 * KB },
        transc: "Nossa, que lindo. Ele vai amar. A gente tá pensando no domingo, de manhã.",
      },
      { de: "lead", em: [0, "14:44"], tipo: "figurinha", midia: { nome: "figurinha.webp", mime: "image/webp", tamanho: 22 * KB } },
    ],
  },
  {
    lead: "bruno",
    nome: "Bruno Teixeira",
    zap: "Bruno | Concierge",
    tel: "5521900000008",
    email: "concierge@brisaleme.exemplo",
    empresa: "Hotel Brisa Leme",
    hist: [
      ["novo", "sistema", [0, "10:15"]],
      ["em_qualificacao", "janete", [0, "10:16"]],
      ["qualificado", "janete", [0, "10:25"]],
    ],
    modo: "humano",
    motivo: "janete_passou",
    resumo: "Concierge de um hotel no Leme. Cerca de 20 a 25 hóspedes por mês pedem passeio de helicóptero, a maioria estrangeiros. Quer parceria.",
    custoResposta: 0.01,
    itens: [
      {
        de: "lead",
        em: [0, "10:15"],
        texto: "Bom dia. Sou o concierge do Hotel Brisa Leme. Muitos hóspedes pedem passeio de helicóptero. Vocês têm parceria com hotel?",
      },
      { de: "janete", em: [0, "10:16"], texto: "Bom dia, Bruno! Que bom saber. Mais ou menos quantos hóspedes pedem esse passeio por mês?" },
      { de: "lead", em: [0, "10:22"], texto: "Uns 20, 25 por mês. Principalmente estrangeiros." },
      {
        de: "janete",
        em: [0, "10:25"],
        texto: "Anotei: cerca de 20 a 25 hóspedes por mês, a maioria estrangeiros. Parceria quem define é o Rafael, nosso sócio. Já passei para ele, e ele fala com você por aqui.",
      },
      { ev: "passou", em: [0, "10:25"], motivo: "janete_passou" },
      { de: "lead", em: [0, "10:31"], texto: "Perfeito, aguardo." },
    ],
  },

  /* ===== os outros leads do quadro ===== */
  {
    lead: "carolina",
    nome: "Carolina Pires",
    zap: "Carol",
    tel: "5521900000009",
    hist: [["novo", "sistema", [0, "13:50"]]],
    modo: "janete",
    resumo: "Perguntou o preço do voo de 30 minutos. Recebeu o valor e ainda não disse quantas pessoas.",
    custoResposta: 0.003,
    itens: [
      { de: "lead", em: [0, "13:50"], texto: "Qual o valor do voo de 30 minutos?" },
      {
        de: "janete",
        em: [0, "13:50"],
        st: "entregue",
        texto: "Oi, Carolina! O Rio Completo tem 30 minutos e sai R$ 2.290 por pessoa, com as fotos do voo incluídas. Quantas pessoas seriam?",
      },
    ],
  },
  {
    lead: "andre",
    nome: "André Souza",
    zap: "André",
    tel: "5511900000010",
    hist: [
      ["novo", "sistema", [-1, "15:30"]],
      ["em_qualificacao", "janete", [-1, "15:31"]],
    ],
    modo: "janete",
    resumo:
      "Quer dar o voo de presente para a mãe, que faz 70 anos e tem um pouco de medo de altura. A Janete sugeriu o voo do Cristo, de 7 minutos, os dois juntos. Ele vai ver o dia com ela.",
    custoResposta: 0.006,
    itens: [
      { de: "lead", em: [-1, "15:30"], texto: "Quero dar de presente para a minha mãe, que faz 70 anos. Mas ela tem um pouco de medo de altura" },
      {
        de: "janete",
        em: [-1, "15:31"],
        texto:
          "Que presente bonito, André! O voo é bem estável e o piloto explica tudo antes de sair. Muita gente que chega com medo volta encantada. Para começar com calma, o voo do Cristo tem só 7 minutos.",
      },
      { de: "lead", em: [-1, "15:40"], texto: "Boa ideia. Ela pode ir comigo?" },
      { de: "janete", em: [-1, "15:41"], texto: "Pode, sim. São R$ 690 por pessoa, R$ 1.380 para vocês dois. Já tem um dia em mente?" },
      { de: "lead", em: [0, "12:10"], texto: "Ainda vou ver com ela e te aviso" },
    ],
  },
  {
    lead: "fernanda",
    nome: "Fernanda Rocha",
    zap: "Fê Rocha",
    tel: "5521900000011",
    hist: [
      ["novo", "sistema", [0, "11:00"]],
      ["em_qualificacao", "janete", [0, "11:01"]],
      ["qualificado", "janete", [0, "11:12"]],
    ],
    modo: "humano",
    motivo: "janete_passou",
    resumo: "Quer o Rio Completo com o marido, sexta por volta das 15h. Já tem o preço. Falta a equipe confirmar a vaga.",
    custoResposta: 0.007,
    itens: [
      { de: "lead", em: [0, "11:00"], texto: "Oi, quero fazer o Rio Completo com meu marido" },
      {
        de: "janete",
        em: [0, "11:01"],
        texto: "Oi, Fernanda! Ótima escolha: são 30 minutos passando pelo Cristo, Pão de Açúcar, praias e Maracanã. Sai R$ 2.290 por pessoa. Para quando?",
      },
      { de: "lead", em: [0, "11:10"], texto: "Sexta, umas 15h" },
      {
        de: "janete",
        em: [0, "11:12"],
        texto: "Anotei: Rio Completo, duas pessoas, sexta por volta das 15h. Já passei para a equipe confirmar a vaga.",
      },
      { ev: "passou", em: [0, "11:12"], motivo: "janete_passou" },
    ],
  },
  {
    lead: "gabriel",
    nome: "Gabriel Lima",
    zap: "Gabriel",
    tel: "5521900000012",
    hist: [
      ["novo", "sistema", [-3, "09:00"]],
      ["qualificado", "janete", [-3, "09:10"]],
      ["em_negociacao", "marina", [-3, "09:40"]],
      ["ganho", "marina", [-3, "10:00"]],
    ],
    modo: "janete",
    devolvida: [-3, "10:01"],
    resumo: "Voou em dupla no voo do Cristo, às 10h, fechado pela Camila. Depois do voo, deixou avaliação e mandou foto.",
    custoResposta: 0.005,
    itens: [
      { de: "lead", em: [-3, "09:00"], texto: "Bom dia, quero o do Cristo para dois, amanhã" },
      { de: "janete", em: [-3, "09:01"], texto: "Bom dia, Gabriel! São R$ 690 por pessoa. Que horário vocês preferem?" },
      { de: "lead", em: [-3, "09:05"], texto: "Umas 10h" },
      { ev: "passou", em: [-3, "09:10"], motivo: "janete_passou" },
      { ev: "assumiu", em: [-3, "09:38"], quem: "marina", de: "janete" },
      { de: "tela", autor: "marina", em: [-3, "09:40"], texto: "Oi, Gabriel! Aqui é a Camila. Confirmado amanhã às 10h para dois. Te mando o Pix por aqui." },
      { de: "lead", em: [-3, "09:50"], texto: "Pago!" },
      { ev: "devolveu", em: [-3, "10:01"], quem: "marina" },
      {
        de: "janete",
        em: [-1, "18:00"],
        texto: "Oi, Gabriel! Esperamos que vocês tenham curtido o voo. Se puder, deixa uma avaliação para a gente? Ajuda muito.",
      },
      {
        de: "lead",
        em: [-1, "18:20"],
        tipo: "imagem",
        texto: "Já deixei! Foi demais",
        midia: { nome: "nos-dois-la-em-cima.jpg", mime: JPG, tamanho: 1.7 * MB },
        reacao: "❤️",
      },
    ],
  },
  {
    lead: "patricia",
    nome: "Patrícia Nogueira",
    zap: "Paty",
    tel: "5521900000013",
    hist: [
      ["novo", "sistema", [-8, "14:00"]],
      ["qualificado", "janete", [-8, "14:15"]],
      ["em_negociacao", "voce", [-8, "16:00"]],
      ["ganho", "voce", [-6, "12:00"]],
    ],
    modo: "janete",
    resumo: "Fez o voo privativo com duas amigas, fechado pelo Rafael. Voltou agradecendo.",
    custoResposta: 0.004,
    itens: [
      { de: "lead", em: [-6, "18:40"], texto: "Obrigada pelo voo de hoje! As meninas amaram" },
      { de: "janete", em: [-6, "18:41"], texto: "Que bom, Patrícia! Obrigada por voarem com a gente. Quando quiserem repetir, é só chamar." },
    ],
  },
  {
    lead: "lucas",
    nome: "Lucas Andrade",
    zap: "Lucas",
    tel: "5521900000014",
    hist: [
      ["novo", "sistema", [-9, "20:00"]],
      ["em_qualificacao", "janete", [-9, "20:01"]],
      ["perdido", "janete", [-2, "09:00"]],
    ],
    modo: "janete",
    resumo: "Perguntou o preço, recebeu os três roteiros e não respondeu mais.",
    custoResposta: 0.004,
    itens: [
      { de: "lead", em: [-9, "20:00"], texto: "Preço?" },
      {
        de: "janete",
        em: [-9, "20:00"],
        st: "entregue",
        texto: "Oi, Lucas! Temos três roteiros, por pessoa: Cristo (7 min), R$ 690; Cristo e Pão de Açúcar (12 min), R$ 990; Rio Completo (30 min), R$ 2.290. Qual te interessa mais?",
      },
    ],
  },
  {
    lead: "mariana",
    nome: "Mariana Costa",
    zap: "Mari Costa",
    tel: "5511900000015",
    hist: [
      ["novo", "sistema", [0, "09:10"]],
      ["qualificado", "janete", [0, "09:20"]],
      ["em_negociacao", "marina", [0, "10:00"]],
    ],
    modo: "humano",
    resp: "marina",
    motivo: "humano_tela",
    resumo:
      "Vem ao Rio com as duas irmãs. Quer o Cristo e Pão de Açúcar na terça à tarde. A Camila ofereceu terça às 14h30 e mandou o Pix. Falta o comprovante.",
    custoResposta: 0.005,
    itens: [
      { de: "lead", em: [0, "09:10"], texto: "Bom dia! Vou para o Rio com minhas duas irmãs semana que vem e queremos o de 12 minutos" },
      {
        de: "janete",
        em: [0, "09:11"],
        texto: "Bom dia, Mariana! O Cristo e Pão de Açúcar sai R$ 990 por pessoa, R$ 2.970 para vocês três. Qual dia vocês preferem?",
      },
      { de: "lead", em: [0, "09:18"], texto: "Terça à tarde" },
      { ev: "passou", em: [0, "09:20"], motivo: "janete_passou" },
      { ev: "assumiu", em: [0, "09:58"], quem: "marina", de: "janete" },
      { de: "tela", autor: "marina", em: [0, "10:00"], texto: "Oi, Mariana! Aqui é a Camila. Tenho terça às 14h30 para as três. Se fechar, te mando o Pix." },
      { de: "lead", em: [0, "10:12"], texto: "Fechado! Me manda" },
      {
        de: "tela",
        autor: "marina",
        em: [0, "10:13"],
        texto: "A chave Pix é pix@rioalto.exemplo. Assim que cair, confirmo a reserva.",
      },
    ],
  },
  {
    lead: "thomas",
    nome: "Thomas Clarke",
    zap: "Tom",
    tel: "447700000016",
    hist: [
      ["novo", "sistema", [0, "08:05"]],
      ["em_qualificacao", "janete", [0, "08:06"]],
      ["qualificado", "janete", [0, "08:21"]],
    ],
    modo: "humano",
    motivo: "janete_passou",
    resumo:
      "Turista britânico, sozinho. Quer o voo do Cristo amanhã, por volta das 9h. A conversa foi em inglês. Aceita voar junto com outro grupo, porque o mínimo é de 2 passageiros.",
    custoResposta: 0.006,
    itens: [
      { de: "lead", em: [0, "08:05"], texto: "Hi! Do you have any flights tomorrow morning? Just me." },
      {
        de: "janete",
        em: [0, "08:05"],
        texto:
          "Hi, Thomas! Yes, we fly from 8 am, weather permitting. The Christ the Redeemer flight is 7 minutes, R$ 690. Flights need at least 2 passengers, but our team can try to pair you with another group. Would that work?",
      },
      { de: "lead", em: [0, "08:20"], texto: "Sure, that works. Around 9 am would be great." },
      { de: "janete", em: [0, "08:21"], texto: "Noted: 1 person, Christ the Redeemer, tomorrow around 9 am. Our team will confirm here shortly." },
      { ev: "passou", em: [0, "08:21"], motivo: "janete_passou" },
    ],
  },
];

/* ---------- o que a Janete anotou (extra de tela) ---------- */

/**
 * Um fato: [rótulo, valor, índice (na lista de itens do lead) da mensagem de onde saiu]. Índice
 * `null` = o fato só está no resumo. O valor fica em texto, do jeito que o lead falou.
 */
type FatoSemente = readonly [rotulo: string, valor: string, item: number | null];

interface AnotacaoSemente {
  fatos: readonly FatoSemente[];
  /** [título no infinitivo, a frase que explica com o que o lead disse]. */
  passo?: readonly [titulo: string, texto: string];
}

// Os fatos e o próximo passo de cada lead (spec de Contatos, decisões 6 e 7). Só o que já está no
// resumo e nas mensagens dele, nada novo. Lead fora daqui fica com o perfil quase vazio (Ana Clara,
// que acabou de chegar); quem está em Perdido não tem próximo passo.
const ANOTACOES: Readonly<Record<string, AnotacaoSemente>> = {
  larissa: {
    fatos: [
      ["Interesse", "Voo privativo para pedido de casamento", 0],
      ["Pessoas", "Só as duas", 2],
      ["Roteiro", "Fim da tarde, passando pelo Cristo", 2],
      ["Dia e horário", "Sábado que vem, por volta das 17h", 8],
      ["Cuidado", "É surpresa: a namorada não pode saber", 11],
    ],
    passo: [
      "Confirmar a vaga de sábado às 17h",
      "Ela quer o voo privativo no sábado que vem, por volta das 17h, para pegar o pôr do sol. Já tem o preço. Falta a equipe confirmar a vaga. É surpresa.",
    ],
  },
  pedro: {
    fatos: [
      ["Pessoas", "4: o casal e filhos de 6 e 9 anos", 0],
      ["Roteiro", "Cristo e Pão de Açúcar (12 min)", 3],
      ["Peso", "105 kg, dentro do limite", 3],
      ["Dia e horário", "Sexta de manhã (ficam até domingo)", 5],
    ],
    passo: [
      "Confirmar a vaga de sexta de manhã",
      "Ele quer o voo de 12 minutos para a família de 4 na sexta de manhã. A Janete está respondendo; quando ela passar, a equipe confirma a vaga.",
    ],
  },
  sofia: {
    fatos: [
      ["Pessoas", "2", 0],
      ["Roteiro", "Cristo Redentor (7 min)", 0],
      ["Idioma", "Espanhol", 0],
      ["Pagamento", "Cartão estrangeiro", 2],
      ["Dia e horário", "Quinta às 10h", 6],
    ],
    passo: ["Mandar o endereço do embarque", "A reserva de quinta às 10h está confirmada. Hoje ela perguntou onde é o embarque."],
  },
  renato: {
    fatos: [
      ["Pessoas", "10, evento da empresa", 0],
      ["Roteiro", "Rio Completo (30 min)", 2],
      ["Quando", "Começo do mês que vem", 2],
      ["Pagamento", "Metade agora e metade no dia", 7],
    ],
    passo: [
      "Responder sobre o pagamento em duas vezes",
      "Ele já tem a proposta do grupo e pediu para pagar metade agora e metade no dia do voo.",
    ],
  },
  juliana: {
    fatos: [
      ["Pessoas", "2", 2],
      ["Roteiro", "Cristo e Pão de Açúcar (12 min)", 2],
      ["Dúvida", "E se chover", 2],
      ["Dia e horário", "Dia seguinte, de manhã cedo", 4],
      ["Pagamento", "Pix", 9],
    ],
    passo: ["Pedir uma avaliação", "Ela voou hoje e mandou foto dizendo que foi incrível. Bom momento para pedir uma avaliação."],
  },
  marcelo: {
    fatos: [
      ["Interesse", "Rio Completo (30 min)", 0],
      ["Objeção", "Achou caro", 2],
    ],
  },
  aline: {
    fatos: [
      ["Interesse", "Vídeo do passeio para mostrar ao marido", 0],
      ["Pessoas", "2: ela e o marido", 4],
      ["Dia e horário", "Domingo de manhã", 4],
    ],
    passo: ["Perguntar o roteiro", "Ela gostou do vídeo e pensa em domingo de manhã. Falta saber qual roteiro."],
  },
  bruno: {
    fatos: [
      ["Interesse", "Parceria com o hotel", 0],
      ["Volume", "20 a 25 hóspedes por mês", 2],
      ["Público", "Principalmente estrangeiros", 2],
    ],
    passo: ["Falar sobre a parceria", "Ele é concierge de hotel e pode mandar 20 a 25 hóspedes por mês. Quer saber como funciona a parceria."],
  },
  carolina: {
    fatos: [["Interesse", "Rio Completo (30 min)", 0]],
    passo: ["Saber quantas pessoas", "Ela recebeu o preço do Rio Completo. Falta saber quantas pessoas vão voar."],
  },
  andre: {
    fatos: [
      ["Interesse", "Presente de 70 anos para a mãe", 0],
      ["Objeção", "A mãe tem medo de altura", 0],
      ["Roteiro", "Cristo (7 min)", 1],
      ["Pessoas", "2: ele e a mãe", 2],
    ],
    passo: ["Perguntar o dia", "Ele vai combinar com a mãe. Retomar perguntando o dia."],
  },
  fernanda: {
    fatos: [
      ["Roteiro", "Rio Completo (30 min)", 0],
      ["Pessoas", "2: ela e o marido", 0],
      ["Dia e horário", "Sexta, por volta das 15h", 2],
    ],
    passo: ["Confirmar a vaga de sexta às 15h", "Ela quer o Rio Completo com o marido na sexta, por volta das 15h. Espera a confirmação desde o fim da manhã."],
  },
  gabriel: {
    fatos: [
      ["Roteiro", "Cristo (7 min)", 0],
      ["Pessoas", "2", 0],
      ["Horário", "10h", 2],
    ],
    passo: ["Oferecer o próximo passeio", "Ele voou, gostou e deixou avaliação. Na próxima vinda ao Rio, vale oferecer o Rio Completo."],
  },
  patricia: {
    fatos: [
      ["Roteiro", "Voo privativo", null],
      ["Pessoas", "3 amigas", null],
    ],
  },
  lucas: {
    fatos: [["Interesse", "Só perguntou o preço", 0]],
  },
  mariana: {
    fatos: [
      ["Pessoas", "3: ela e as duas irmãs", 0],
      ["Roteiro", "Cristo e Pão de Açúcar (12 min)", 0],
      ["Dia e horário", "Terça às 14h30", 5],
    ],
    passo: ["Conferir o Pix", "A Camila mandou a chave Pix para a reserva de terça às 14h30. Falta o comprovante."],
  },
  thomas: {
    fatos: [
      ["Pessoas", "1, aceita voar com outro grupo", 2],
      ["Roteiro", "Cristo (7 min)", 1],
      ["Idioma", "Inglês", 0],
      ["Dia e horário", "Amanhã, por volta das 9h", 2],
    ],
    passo: ["Encaixar num voo de amanhã às 9h", "Ele está sozinho e aceita voar com outro grupo. Ver se há voo do Cristo amanhã perto das 9h."],
  },
};

/** Os extras `fatosJanete` e `proximoPasso` de um lead, com o id real da mensagem de cada fato. */
function anotacoesDo(lead: string, idsItens: readonly string[]): Pick<Contato, "fatosJanete" | "proximoPasso"> {
  const a = ANOTACOES[lead];
  return {
    fatosJanete: (a?.fatos ?? []).map(([rotulo, valor, item]) => ({
      rotulo,
      valor,
      mensagemId: item === null ? null : (idsItens[item] ?? null),
    })),
    proximoPasso: a?.passo ? { titulo: a.passo[0], texto: a.passo[1] } : null,
  };
}

/* ---------- montagem ---------- */

// Pelo `ev`, e não pelo `de`: a passagem "assumiu" também tem `de` (de onde a conversa veio).
const ehMensagem = (i: ItemSemente): i is MsgSemente => !("ev" in i);

const ORIGEM = { lead: "lead", janete: "janete", tela: "humano_tela", cel: "humano_celular" } as const;

/** A prévia que o banco grava na conversa: o texto, ou "[tipo]" (gatilho tg_mensagens_apos_inserir). */
export function previaDoBanco(m: Pick<Mensagem, "texto" | "tipo">): string {
  const texto = m.texto?.trim();
  return (texto ? texto : `[${m.tipo}]`).slice(0, 140);
}

/**
 * O estado inicial do exemplo, com os momentos contados a partir de `agora`. Recarregar a página (ou
 * "Recomeçar o exemplo") monta de novo.
 */
export function criarEstadoInicial(agora: Date = new Date()): EstadoBase {
  // Na demo, as horas das conversas são as do relógio de São Paulo (a mensagem das 23h38 aparece às
  // 23h38): o "agora" dos dados é as 14:45 de hoje, ou de ontem se ainda não deu 14:45.
  const FUSO = 3 * 3_600_000;
  const sp = new Date(agora.getTime() - FUSO);
  let ancora = Date.UTC(sp.getUTCFullYear(), sp.getUTCMonth(), sp.getUTCDate(), 14, 45) + FUSO;
  if (ancora > agora.getTime()) ancora -= 86_400_000;
  const base = ancora;
  // Itens no mesmo minuto ganham segundos crescentes, para a ordem da conversa não depender do sort.
  const usados = new Map<number, number>();
  const iso = (q: Quando) => {
    const min = minutosAntes(q);
    const n = usados.get(min) ?? 0;
    usados.set(min, n + 1);
    return new Date(base - min * 60_000 + n * 1000).toISOString();
  };
  const isoPuro = (q: Quando) => new Date(base - minutosAntes(q) * 60_000).toISOString();
  const membroDe = (q: Quem) => (q === "voce" ? IDS.voce : IDS.marina);

  const etapas: Etapa[] = (
    [
      ["novo", "Novo", 10, "aberta", false],
      ["em_qualificacao", "Em qualificação", 20, "aberta", true],
      ["qualificado", "Qualificado", 30, "aberta", true],
      ["em_negociacao", "Em negociação", 40, "aberta", false],
      ["ganho", "Ganho", 50, "ganho", false],
      ["perdido", "Perdido", 60, "perdido", true],
    ] as const
  ).map(([chave, nome, ordem, tipo, janete]) => ({
    id: IDS.etapa[chave],
    chave,
    nome,
    ordem,
    tipo,
    cor: null,
    janete_pode_mover: janete,
    arquivada: false,
  }));

  const criadoEmpresa = isoPuro([-30, "09:00"]);
  const membros: Membro[] = [
    // O admin aparece como "Você" quando é ele quem olha (nomeDoMembro); para a Marina, é "Admin".
    { id: IDS.voce, nome: DONO_DEMO.nome, email: DONO_DEMO.email, papel: "admin", ativo: true, user_id: null, criado_em: criadoEmpresa },
    {
      id: IDS.marina,
      nome: ATENDENTE_DEMO.nome,
      email: ATENDENTE_DEMO.email,
      papel: "atendente",
      ativo: true,
      user_id: null,
      criado_em: isoPuro([-20, "10:00"]),
    },
  ];

  const conexao: Conexao = {
    id: IDS.conexao,
    nome: "(21) 90000-0000",
    gateway: "zapi",
    status: "conectada",
    ativa: true,
    oficial: false,
    id_externo: "INSTANCIA-EXEMPLO",
    ultimo_erro: null,
    criado_em: criadoEmpresa,
    atualizado_em: criadoEmpresa,
  };

  // A chave de resposta está ativa: o crédito acabou à tarde (Juliana e Thiago esperam por isso) e
  // o admin recarregou e validou de novo logo depois. Sem chave de transcrição: sem escuta de áudio.
  const chaves: ChaveIA[] = [
    {
      id: IDS.chaveResposta,
      finalidade: "resposta",
      provedor: "anthropic",
      modelo: "claude-haiku-5-5",
      status: "ativa",
      ultimos4: "TSTE",
      ultimo_erro: null,
      validada_em: isoPuro([0, "14:43"]),
      atualizada_em: isoPuro([0, "14:43"]),
      atualizada_por: IDS.voce,
    },
  ];

  const configuracao: Configuracao = {
    id: 1,
    espera_lote_s: 8,
    espera_lote_max_s: 60,
    onboarding_concluido_em: criadoEmpresa,
    atualizado_em: criadoEmpresa,
    // o exemplo começa sem chave de voz: o modo padrão e nenhuma voz escolhida (spec-voz-uso, C3)
    voz_resposta: MODO_VOZ_PADRAO,
    voz_id: null,
    voz_nome: null,
    voz_erro: null,
  };

  const contatos: Contato[] = [];
  const conversas: Conversa[] = [];
  const mensagens: Mensagem[] = [];
  const historico: HistoricoEtapa[] = [];
  const eventos: EventoPassagem[] = [];
  const custos: CustoIA[] = [];
  const digitando: string[] = [];

  for (const l of LEADS) {
    const ctId = idContato(l.lead);
    const cvId = idConversa(l.lead);

    // histórico de etapas (o 1º é a entrada em Novo, pelo sistema)
    let anterior: string | null = null;
    let etapaDesde = "";
    l.hist.forEach(([chave, ator, q], i) => {
      const para = IDS.etapa[chave];
      const em = isoPuro(q);
      const a: AtorHistorico = ator === "sistema" || ator === "janete" ? ator : "membro";
      historico.push({
        id: `hi-${l.lead}-${i + 1}`,
        contato_id: ctId,
        de_etapa_id: anterior,
        para_etapa_id: para,
        ator: a,
        membro_id: a === "membro" ? membroDe(ator as Quem) : null,
        criado_em: em,
      });
      anterior = para;
      etapaDesde = em;
    });
    const primeira = isoPuro(l.hist[0]![2]);

    // mensagens e passagens
    const idsItens: string[] = [];
    let nMsg = 0;
    let nEv = 0;
    let ultimaEm: string | null = null;
    let ultimaPrevia: string | null = null;
    let ultimaDoLead: string | null = null;
    let aguardandoDesde: string | null = null;
    l.itens.forEach((item) => {
      const em = iso(item.em);
      if (!ehMensagem(item)) {
        nEv += 1;
        const id = `ev-${l.lead}-${nEv}`;
        idsItens.push(id);
        eventos.push({
          id,
          conversa_id: cvId,
          tipo: item.ev,
          membro_id: item.quem ? membroDe(item.quem) : null,
          motivo: item.motivo ?? null,
          de: item.de ?? null,
          de_membro_id: item.deQuem ? membroDe(item.deQuem) : null,
          por_envio: false,
          criado_em: em,
        });
        if (item.ev === "passou") aguardandoDesde = em;
        return;
      }
      nMsg += 1;
      const id = `msg-${l.lead}-${nMsg}`;
      idsItens.push(id);
      const tipo = item.tipo ?? "texto";
      const entrada = item.de === "lead";
      const status: StatusMensagem = item.st ?? (entrada ? "recebida" : "lida");
      const m: Mensagem = {
        id,
        conversa_id: cvId,
        conexao_id: IDS.conexao,
        direcao: entrada ? "entrada" : "saida",
        origem: ORIGEM[item.de],
        tipo,
        status,
        texto: item.apagada ? null : (item.texto ?? null),
        transcricao: tipo === "audio" ? (item.transc ?? null) : null,
        momento: em,
        autor_membro_id: item.de === "tela" ? membroDe(item.autor ?? "voce") : null,
        midia_nome: item.midia?.nome ?? null,
        midia_mime: item.midia?.mime ?? null,
        midia_tamanho: item.midia?.tamanho !== undefined ? Math.round(item.midia.tamanho) : null,
        midia_caminho: null,
        midia_status: item.midia ? "copiada" : null,
        editada: item.editada ?? false,
        apagada_em: item.apagada ? em : null,
        erro: item.erro ?? null,
        criado_em: em,
        reacao: item.reacao ?? null,
        citaId: item.cita !== undefined ? (idsItens[item.cita] ?? null) : null,
        duracaoS: item.dur ?? null,
      };
      mensagens.push(m);
      if (status !== "cancelada") {
        ultimaEm = em;
        ultimaPrevia = previaDoBanco(m);
      }
      if (entrada) ultimaDoLead = em;
      if (item.de === "janete") {
        custos.push({
          id: custos.length + 1,
          conversa_id: cvId,
          criado_em: em,
          custo_usd: l.custoResposta,
          tipo: "resposta",
          provedor: "anthropic",
          modelo: "claude-haiku-5-5",
        });
      }
    });

    const esperando = l.modo === "humano" && !l.resp && l.motivo !== "humano_celular";
    contatos.push({
      id: ctId,
      nome: l.nome,
      nome_whatsapp: l.zap,
      telefone: l.tel,
      email: l.email ?? null,
      empresa: l.empresa ?? null,
      etapa_id: anterior ?? IDS.etapa.novo,
      etapa_desde: etapaDesde,
      observacoes: l.obs ?? null,
      resumo_janete: l.resumo,
      primeira_mensagem_em: primeira,
      criado_em: primeira,
      atualizado_em: ultimaEm ?? primeira,
      ...anotacoesDo(l.lead, idsItens),
    });
    conversas.push({
      id: cvId,
      contato_id: ctId,
      conexao_id: IDS.conexao,
      modo: l.modo,
      motivo_humano: l.modo === "humano" ? (l.motivo ?? "humano_tela") : null,
      responsavel_id: l.modo === "humano" && l.resp ? membroDe(l.resp) : null,
      aguardando_humano_desde: esperando ? (aguardandoDesde ?? ultimaEm) : null,
      devolvida_em: l.devolvida ? isoPuro(l.devolvida) : null,
      nao_lidas: l.naoLidas ?? 0,
      ultima_do_lead_em: ultimaDoLead,
      ultima_mensagem_em: ultimaEm,
      ultima_mensagem_preview: ultimaPrevia,
      criado_em: primeira,
      atualizado_em: ultimaEm ?? primeira,
    });
    if (l.digitando) digitando.push(cvId);
  }

  // O convite pendente do exemplo (spec da Equipe, F3): e-mail fictício, ainda sem senha.
  const convites: Convite[] = [
    { id: IDS.convite, email: "leo@rioalto.exemplo", papel: "atendente", convidado_por: IDS.voce, enviado_em: isoPuro([-1, "17:20"]) },
  ];

  return {
    etapas,
    membros,
    convites,
    contatos,
    conversas,
    mensagens,
    historico,
    conexao,
    chaves,
    configuracao,
    eventos,
    digitando,
    custos,
    auditoria: [],
  };
}
