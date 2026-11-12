import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// A instalação nova se prepara sozinha (docs/spec-motor-acordado.md, decisão 1): cada instância pede
// prepararCopia() até dar certo, no máximo uma tentativa a cada 30 s (o preparo que falha ou lança
// é pedido de novo numa requisição seguinte; depois de "pronta" ou "preparada", nunca mais). Numa
// cópia nova, este é o único lugar que prepara antes da 1ª conta: sem ele, ela nasce sem o gatilho
// da 1ª conta e fica sem admin.
// - Página: espera o preparo no máximo 2 s, sem quebrar a resposta. Passado o teto, ele segue sem
//   ninguém esperar (protegido pelo ctx.waitUntil, na Cloudflare).
// - /api/public/*: não espera. O toque do motor chega numa instância fria e conta o orçamento de
//   45 s (a rota do worker pede a própria preparação), e o webhook responde à Zernio em 5 s.
const TETO_PREPARO_MS = 2_000;
/** O intervalo mínimo entre duas tentativas de preparo na mesma instância. */
const REPREPARAR_APOS_MS = 30_000;

let preparoOk = false;
let tentouEm: number | null = null;

/** O preparo desta requisição, ou null quando não é a vez (já deu certo, ou tentou há pouco). */
function pedirPreparo(ctx: unknown): Promise<void> | null {
  const agora = Date.now();
  if (preparoOk || (tentouEm !== null && agora - tentouEm < REPREPARAR_APOS_MS)) return null;
  tentouEm = agora;
  // o import entra no teto: numa partida a frio ele também leva tempo
  const preparo = import("./features/mensageria/nucleo/motor.server")
    .then(({ prepararCopia }) => prepararCopia())
    .then(
      (r) => {
        if (r !== "falhou") preparoOk = true;
      },
      () => undefined,
    );
  try {
    (ctx as { waitUntil?: (p: Promise<unknown>) => void } | null | undefined)?.waitUntil?.(preparo);
  } catch {
    // sem waitUntil que funcione, o preparo só deixa de ser protegido depois da resposta
  }
  return preparo;
}

/** O preparo, ou o teto de 2 s; nunca rejeita. */
async function comTetoDoPreparo(preparo: Promise<void>): Promise<void> {
  let relogio: ReturnType<typeof setTimeout> | undefined;
  const teto = new Promise<void>((resolver) => {
    relogio = setTimeout(resolver, TETO_PREPARO_MS);
  });
  await Promise.race([preparo, teto]);
  clearTimeout(relogio);
}

function ehApiPublica(request: Request): boolean {
  try {
    return new URL(request.url).pathname.startsWith("/api/public/");
  } catch {
    return false;
  }
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      // a preparação corre junto com o import da entrada, sem somar ao tempo dela; a API não espera
      const preparo = pedirPreparo(ctx);
      const esperar = preparo && !ehApiPublica(request) ? comTetoDoPreparo(preparo) : undefined;
      const [handler] = await Promise.all([getServerEntry(), esperar]);
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
