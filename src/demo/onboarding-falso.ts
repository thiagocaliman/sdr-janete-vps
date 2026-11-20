// As etapas do onboarding na demo: as respostas do "servidor" são simuladas aqui, na hora, sem rede.
// Qualquer chave ou token é aceito e nada do que a pessoa digita sai do navegador (nem fica guardado:
// só os 4 últimos caracteres, como no app de verdade).
import type { EntradaSalvarConexao, ResultadoSalvarConexao } from "@/features/mensageria/configuracao.server";
import type { EntradaQr, ResultadoQr } from "@/features/servidor/qr-conexao";
import { criarDadosOnboardingMemoria, type DadosOnboarding } from "@/features/plataforma/dados/onboarding";
import { VOZES_EXEMPLO } from "@/features/plataforma/exemplo/dados";

const NUMERO_DEMO = "(21) 90000-0000";
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ultimos4 = (texto: string) => (texto.trim().slice(-4) || "DEMO").toUpperCase();

/** Um QR de enfeite (não abre nada se for lido): quadrados fixos nos cantos e o miolo sorteado. */
function qrDeEnfeite(semente: number): string {
  const n = 29;
  let x = semente || 1;
  const sorteio = () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) % 100;
  };
  const canto = (cx: number, cy: number) =>
    `<rect x="${cx}" y="${cy}" width="7" height="7" fill="#111"/><rect x="${cx + 1}" y="${cy + 1}" width="5" height="5" fill="#fff"/><rect x="${cx + 2}" y="${cy + 2}" width="3" height="3" fill="#111"/>`;
  const livre = (i: number, j: number) => !((i < 8 && j < 8) || (i > n - 9 && j < 8) || (i < 8 && j > n - 9));
  let miolo = "";
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) if (livre(i, j) && sorteio() < 48) miolo += `<rect x="${i}" y="${j}" width="1" height="1" fill="#111"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${n + 4} ${n + 4}" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/>${miolo}${canto(0, 0)}${canto(n - 7, 0)}${canto(0, n - 7)}<rect x="10" y="12.2" width="9" height="4.6" rx="1" fill="#fff"/><text x="14.5" y="15.9" font-family="Arial,sans-serif" font-size="3.2" font-weight="700" text-anchor="middle" fill="#e8501c">DEMO</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Os dados do onboarding da demo: tudo aceito, com pequenas esperas para a tela mostrar o "validando". */
export function criarDadosOnboardingDemo(): DadosOnboarding {
  // o QR "é lido" uns 9 segundos depois de aparecer
  let qrDesde = 0;
  return criarDadosOnboardingMemoria({
    salvarConexao: async (entrada: EntradaSalvarConexao): Promise<ResultadoSalvarConexao> => {
      await esperar(1200);
      return {
        ok: true,
        conexao_id: "demo-conexao",
        nome: NUMERO_DEMO,
        gateway: entrada.gateway as Extract<ResultadoSalvarConexao, { ok: true }>["gateway"],
        url_webhook: "https://suaagenc.ia.br/janete-demo/webhook-de-exemplo",
        ...(entrada.gateway === "meta" ? { verifyToken: "token-de-exemplo-da-demo" } : {}),
        avisos: [],
      };
    },
    salvarChaveIA: async (entrada) => {
      await esperar(1400);
      return { ok: true, ultimos4: ultimos4(entrada.chave), status: "ativa" };
    },
    pedirQr: async (entrada: EntradaQr): Promise<ResultadoQr> => {
      await esperar(700);
      if (entrada.pedir === "qr") {
        if (!qrDesde) qrDesde = Date.now();
        return { ok: true, conectado: false, qr: qrDeEnfeite(Date.now() & 0xffff), passkey: false };
      }
      if (qrDesde && Date.now() - qrDesde > 9000) return { ok: true, conectado: true, rotulo: NUMERO_DEMO };
      return { ok: true, conectado: false, qr: null, passkey: false };
    },
    listarVozes: async () => {
      await esperar(700);
      return { ok: true, vozes: [...VOZES_EXEMPLO], atual: null };
    },
    escolherVoz: async (entrada) => {
      await esperar(600);
      const voz = VOZES_EXEMPLO.find((v) => v.id === entrada.vozId) ?? VOZES_EXEMPLO[0]!;
      return { ok: true, voz: { id: voz.id, nome: voz.nome } };
    },
    desconectarCelular: async () => {
      await esperar(500);
      qrDesde = 0;
      return { ok: true };
    },
    usarChaveElevenLabs: async () => {
      await esperar(600);
      return { ok: true, copiada: true, ultimos4: "DEMO", status: "ativa" };
    },
  });
}
