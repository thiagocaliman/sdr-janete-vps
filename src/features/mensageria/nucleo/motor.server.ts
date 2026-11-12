// O motor acordado pelos acontecimentos (docs/spec-motor-acordado.md, seção 2, "Servidor"). O
// worker não depende de agendamento externo: quando algo acontece (uma mensagem nova, uma tela que
// vê atraso, uma conexão ativada), o servidor pede ao banco um toque (acordar_motor), e o banco
// chama a rota do worker com net.http_post e a chave própria do motor (x-janete-motor).
// - O endereço gravado é só https://<host>, fora da prévia (ehOrigemDePrevia): o webhook grava o
//   publicado, e a tela grava só o host que recebeu o pedido (nunca o cabeçalho Origin).
// - A chave nunca sai do banco: a rota manda a que chegou e o banco diz sim ou não (motor_confere).
// - prepararCopia: a instalação nova se prepara sozinha (dados iniciais, gatilho da 1ª conta, tempo
//   real e o relógio do banco). Cada instância lembra o resultado por 1 h.
// Nenhuma função daqui lança: a falha vira "falhou" (ou null) e vai para o log só com um código.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

import { ehOrigemDePrevia } from "./origem";

export type ResultadoToque = "tocado" | "recente" | "sem_endereco" | "falhou";
export type ResultadoPreparo = "pronta" | "preparada" | "falhou";
/** Os momentos de motor_pendencias, em ms (Date.parse); null = nenhum item. */
export type PendenciasMotor = {
  proximoEm: number | null;
  vencidoDesde: number | null;
  atrasadoDesde: number | null;
};

/** Teto do pedido de toque (gravar o endereço e acordar_motor). */
export const TETO_TOQUE_MS = 3_000;
/** Quanto tempo cada instância lembra que a cópia está preparada. */
export const LEMBRAR_PREPARO_MS = 60 * 60 * 1000;
/** A janela da regra de renovar o toque no fim do laço (10 min para frente e para trás). */
export const JANELA_RENOVAR_MS = 10 * 60 * 1000;
/** Por quanto tempo o acordar_motor sem renovar responde "recente" depois do worker_visto_em. */
export const JANELA_RECENTE_MS = 40_000;
/** A folga entre o relógio do servidor (o worker_visto_em) e o now() do banco (o tocado_em). */
export const FOLGA_RELOGIO_MS = 1_500;

const TOQUES = new Set<string>(["tocado", "recente", "sem_endereco"]);
const PREPAROS = new Set<string>(["pronta", "preparada"]);

/**
 * A promessa ou, passado `ms`, o valor do teto. Nunca rejeita: a falha também vira o valor do
 * teto. A promessa segue rodando depois do teto (só não é mais esperada).
 */
export function comTeto<T>(promessa: Promise<T>, ms: number, noTeto: T): Promise<T> {
  let relogio: ReturnType<typeof setTimeout> | undefined;
  const teto = new Promise<T>((resolver) => {
    relogio = setTimeout(() => resolver(noTeto), ms);
  });
  return Promise.race([promessa.catch(() => noTeto), teto]).finally(() => clearTimeout(relogio));
}

function codigo(erro: unknown): string {
  const c = (erro as { code?: unknown } | null)?.code;
  return typeof c === "string" && /^[A-Za-z0-9_]{1,20}$/.test(c) ? c : "desconhecido";
}

/**
 * A origem que pode virar o endereço do motor: https, sem porta, fora da prévia e da máquina
 * local. Devolve a origem normalizada (new URL(...).origin) ou null. O formato final do host quem
 * confere é o banco (motor_endereco).
 */
export function origemDoMotor(origem: string | null | undefined): string | null {
  if (!origem) return null;
  let url: URL;
  try {
    url = new URL(origem);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.port !== "") return null;
  if (ehOrigemDePrevia(url.origin)) return null;
  return url.origin;
}

async function tocar(origem: string | null | undefined, renovar: boolean): Promise<ResultadoToque> {
  try {
    const endereco = origemDoMotor(origem);
    if (endereco) {
      // o endereço que falha não impede o toque com o endereço que já estava gravado
      const gravou = await supabaseAdmin.rpc("motor_endereco", { p_url: endereco });
      if (gravou.error) console.error("motor_endereco_falhou", codigo(gravou.error));
    }
    const { data, error } = await supabaseAdmin.rpc("acordar_motor", { p_renovar: renovar });
    if (error) {
      console.error("motor_toque_falhou", codigo(error));
      return "falhou";
    }
    return typeof data === "string" && TOQUES.has(data) ? (data as ResultadoToque) : "falhou";
  } catch (erro) {
    console.error("motor_toque_falhou", codigo(erro));
    return "falhou";
  }
}

/**
 * Pede um toque no motor. Com `origem` válida (origemDoMotor), grava antes o endereço. Com
 * `renovar`, é a renovação do fim do laço (acordar_motor(true): só espera 10 s desde o último
 * toque). Teto de 3 s, ou o `tetoMs` menor (o fim do laço passa o que sobra até o limite duro);
 * nunca lança.
 */
export function acordarMotor(
  origem?: string | null,
  opcoes: { renovar?: boolean; tetoMs?: number } = {},
): Promise<ResultadoToque> {
  const teto = opcoes.tetoMs !== undefined ? Math.min(TETO_TOQUE_MS, opcoes.tetoMs) : TETO_TOQUE_MS;
  return comTeto(tocar(origem, opcoes.renovar === true), teto, "falhou");
}

/** O formato da chave do motor: encode(gen_random_bytes(32), 'hex'), sempre 64 hexadecimais minúsculos. */
const FORMATO_CHAVE = /^[0-9a-f]{64}$/;

/**
 * A chave que chegou no cabeçalho x-janete-motor bate com a do banco? Falha = não. A que nem tem o
 * formato da chave é recusada sem ir ao banco (a rota é pública).
 */
export async function conferirChaveDoMotor(chave: string | null): Promise<boolean> {
  if (!chave || !FORMATO_CHAVE.test(chave)) return false;
  try {
    const { data, error } = await supabaseAdmin.rpc("motor_confere", { p_chave: chave });
    if (error) {
      console.error("motor_chave_falhou", codigo(error));
      return false;
    }
    return data === true;
  } catch (erro) {
    console.error("motor_chave_falhou", codigo(erro));
    return false;
  }
}

async function chamarPreparo(): Promise<ResultadoPreparo> {
  try {
    const { data, error } = await supabaseAdmin.rpc("preparar_copia");
    if (error) {
      console.error("preparar_copia_falhou", codigo(error));
      return "falhou";
    }
    return typeof data === "string" && PREPAROS.has(data) ? (data as ResultadoPreparo) : "falhou";
  } catch (erro) {
    console.error("preparar_copia_falhou", codigo(erro));
    return "falhou";
  }
}

let preparo: { em: number; promessa: Promise<ResultadoPreparo> } | null = null;

/**
 * Prepara a instalação nova (preparar_copia; no original devolve "pronta" na hora). Cada instância
 * lembra o resultado por 1 h, e pedidos ao mesmo tempo dividem a mesma chamada. A falha não fica
 * lembrada: o pedido seguinte tenta de novo.
 */
export function prepararCopia(): Promise<ResultadoPreparo> {
  const agora = Date.now();
  if (preparo && agora - preparo.em < LEMBRAR_PREPARO_MS) {
    return preparo.promessa.then((r) => (r === "preparada" ? "pronta" : r));
  }
  const promessa = chamarPreparo().then((r) => {
    if (r === "falhou" && preparo?.promessa === promessa) preparo = null;
    return r;
  });
  preparo = { em: agora, promessa };
  return promessa;
}

function momento(v: unknown): number | null {
  if (typeof v !== "string") return null;
  const ms = Date.parse(v);
  return Number.isNaN(ms) ? null : ms;
}

/** O que o motor tem pela frente (motor_pendencias), pelo supabaseAdmin. Falha = null. */
export async function pendenciasDoMotor(): Promise<PendenciasMotor | null> {
  try {
    const { data, error } = await supabaseAdmin.rpc("motor_pendencias");
    if (error) {
      console.error("motor_pendencias_falhou", codigo(error));
      return null;
    }
    const linha = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined;
    return {
      proximoEm: momento(linha?.["proximo_em"]),
      vencidoDesde: momento(linha?.["vencido_desde"]),
      atrasadoDesde: momento(linha?.["atrasado_desde"]),
    };
  } catch (erro) {
    console.error("motor_pendencias_falhou", codigo(erro));
    return null;
  }
}

/**
 * Espera fechar a janela do "recente" antes da última leitura do laço (vistoEm: o worker_visto_em
 * gravado por esta chamada, em ms). Enquanto ela está aberta, o webhook que arma uma conversa leva
 * "recente" do acordar_motor e não toca, contando com este laço; se o laço ocioso já acabou (~38 s),
 * a mensagem ficaria sem ninguém. Esperando até vistoEm + 40 s + 1,5 s, todo webhook que levou
 * "recente" por causa desta chamada já gravou quando as pendências são lidas, e a regra de renovar o
 * enxerga (o tocado_em do toque que trouxe esta chamada é sempre anterior ao visto). Com `ateEm`
 * (ms), a espera nunca passa dele: a rota guarda o tempo da leitura e do toque antes do limite duro.
 * Nunca rejeita.
 */
export function esperarJanelaDoToque(vistoEm: number, ateEm?: number): Promise<void> {
  const fim = vistoEm + JANELA_RECENTE_MS + FOLGA_RELOGIO_MS;
  const espera = (ateEm === undefined ? fim : Math.min(fim, ateEm)) - Date.now();
  if (!(espera > 0)) return Promise.resolve();
  return new Promise((resolver) => setTimeout(resolver, espera));
}

/**
 * A regra de renovar o toque no fim do laço (spec, premissa "O fim do laço"). Renova quando há:
 * - item que fica pronto nos próximos 10 min;
 * - item vencido há menos de 10 min;
 * - trabalho achado no laço, com pendência sobrando.
 * Item vencido há mais tempo, sem trabalho achado, não renova (um item que nunca é pego não vira
 * laço sem fim). Sem a leitura das pendências (null), renova só se o laço achou trabalho.
 */
export function deveRenovarToque(
  pendencias: PendenciasMotor | null,
  achouTrabalho: boolean,
  agora: number = Date.now(),
): boolean {
  if (!pendencias) return achouTrabalho;
  const { proximoEm, vencidoDesde } = pendencias;
  if (proximoEm !== null && proximoEm - agora <= JANELA_RENOVAR_MS) return true;
  if (vencidoDesde !== null && agora - vencidoDesde < JANELA_RENOVAR_MS) return true;
  return achouTrabalho && (proximoEm !== null || vencidoDesde !== null);
}
