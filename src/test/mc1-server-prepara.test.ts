import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// A entrada do servidor (src/server.ts) e a cópia que se prepara sozinha (spec-motor-acordado,
// decisão 1): cada instância pede prepararCopia() até dar certo (no máximo 1 vez a cada 30 s), com
// teto de 2 s na página e sem espera na API, sem quebrar nem atrasar mais que isso a resposta. A
// entrada do TanStack e o motor são falsos.
const m = vi.hoisted(() => ({ fetch: vi.fn(), prepararCopia: vi.fn() }));

vi.mock("@tanstack/react-start/server-entry", () => ({ default: { fetch: m.fetch } }));
vi.mock("@/features/mensageria/nucleo/motor.server", () => ({ prepararCopia: m.prepararCopia }));

type Entrada = { fetch: (r: Request, env: unknown, ctx: unknown) => Promise<Response> };
/** Um módulo novo por teste: o "já preparei" é de cada instância. */
let entrada: Entrada;

const pedido = () => new Request("https://janete.exemplo.com/app");

beforeEach(async () => {
  m.fetch.mockReset().mockImplementation(async () => new Response("pagina", { status: 200 }));
  m.prepararCopia.mockReset().mockResolvedValue("pronta");
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.resetModules();
  entrada = (await import("@/server")).default as Entrada;
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("src/server.ts: a cópia se prepara na 1ª requisição", () => {
  it("prepara uma vez só por instância, em várias requisições, quando dá certo", async () => {
    for (let i = 0; i < 3; i++) {
      const r = await entrada.fetch(pedido(), {}, {});
      expect(r.status).toBe(200);
      expect(await r.text()).toBe("pagina");
    }
    expect(m.prepararCopia).toHaveBeenCalledTimes(1);
    expect(m.fetch).toHaveBeenCalledTimes(3);
  });

  it("o preparo que falha ou lança não quebra a resposta", async () => {
    m.prepararCopia.mockRejectedValue(new Error("sem SUPABASE_SERVICE_ROLE_KEY"));
    const r = await entrada.fetch(pedido(), {}, {});
    expect(r.status).toBe(200);
    expect(await r.text()).toBe("pagina");
  });

  it("o preparo que não volta atrasa a 1ª resposta no máximo 2 s; as seguintes não esperam", async () => {
    vi.useFakeTimers();
    m.prepararCopia.mockReturnValue(new Promise(() => {}));
    let respondeu = false;
    const primeira = entrada.fetch(pedido(), {}, {}).then((r) => ((respondeu = true), r));
    await vi.advanceTimersByTimeAsync(1_999);
    expect(respondeu).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(respondeu).toBe(true);
    expect((await primeira).status).toBe(200);

    let segunda = false;
    void entrada.fetch(pedido(), {}, {}).then(() => (segunda = true));
    await vi.advanceTimersByTimeAsync(0);
    expect(segunda).toBe(true);
    expect(m.prepararCopia).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["devolve falhou", () => m.prepararCopia.mockResolvedValueOnce("falhou")],
    ["lança", () => m.prepararCopia.mockRejectedValueOnce(new Error("rede"))],
  ])("o preparo que %s é pedido de novo 30 s depois, e não antes", async (_caso, falhar) => {
    let agora = Date.parse("2026-11-03T12:00:00Z");
    vi.spyOn(Date, "now").mockImplementation(() => agora);
    falhar();
    await entrada.fetch(pedido(), {}, {});
    expect(m.prepararCopia).toHaveBeenCalledTimes(1);
    agora += 29_999;
    await entrada.fetch(pedido(), {}, {});
    expect(m.prepararCopia).toHaveBeenCalledTimes(1);
    agora += 1;
    await entrada.fetch(pedido(), {}, {});
    expect(m.prepararCopia).toHaveBeenCalledTimes(2);
  });

  it.each(["pronta", "preparada"])("depois de %s, nunca mais pede o preparo", async (resultado) => {
    let agora = Date.parse("2026-11-03T12:00:00Z");
    vi.spyOn(Date, "now").mockImplementation(() => agora);
    m.prepararCopia.mockResolvedValue(resultado);
    await entrada.fetch(pedido(), {}, {});
    for (const passo of [30_000, 60 * 60 * 1000, 24 * 60 * 60 * 1000]) {
      agora += passo;
      await entrada.fetch(pedido(), {}, {});
    }
    expect(m.prepararCopia).toHaveBeenCalledTimes(1);
  });

  it("na API pública, o preparo que não volta não atrasa a resposta, e o waitUntil o segura", async () => {
    vi.useFakeTimers();
    const pendurado = new Promise(() => {});
    m.prepararCopia.mockReturnValue(pendurado);
    const waitUntil = vi.fn();
    let respondeu = false;
    const api = new Request("https://janete.exemplo.com/api/public/cron/mensageria", {
      method: "POST",
    });
    const resposta = entrada.fetch(api, {}, { waitUntil }).then((r) => ((respondeu = true), r));
    await vi.advanceTimersByTimeAsync(0);
    expect(respondeu).toBe(true);
    expect((await resposta).status).toBe(200);
    expect(m.prepararCopia).toHaveBeenCalledTimes(1);
    expect(waitUntil).toHaveBeenCalledTimes(1);
    expect(waitUntil.mock.calls[0]![0]).toBeInstanceOf(Promise);
  });

  it("na página, o waitUntil também recebe o preparo (ele segue depois do teto)", async () => {
    const waitUntil = vi.fn();
    const r = await entrada.fetch(pedido(), {}, { waitUntil });
    expect(r.status).toBe(200);
    expect(waitUntil).toHaveBeenCalledTimes(1);
  });

  it("a página de erro continua igual quando a entrada lança", async () => {
    m.fetch.mockRejectedValue(new Error("quebrou"));
    const r = await entrada.fetch(pedido(), {}, {});
    expect(r.status).toBe(500);
    expect(r.headers.get("content-type")).toContain("text/html");
  });
});
