// Rota do worker (src/routes/api/public/cron/mensageria.ts). O teste fica aqui, e não ao lado da rota,
// porque o gerador de rotas do TanStack leria um .test.ts dentro de src/routes como rota.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  rodarLaco: vi.fn(),
  achouTrabalho: vi.fn(),
  marcarWorkerVisto: vi.fn(),
  conferirChaveDoMotor: vi.fn(),
  prepararCopia: vi.fn(),
  pendenciasDoMotor: vi.fn(),
  acordarMotor: vi.fn(),
  esperarJanelaDoToque: vi.fn(),
}));
vi.mock("@/features/mensageria/nucleo/ciclo.server", () => ({
  rodarLaco: m.rodarLaco,
  achouTrabalho: m.achouTrabalho,
  ORCAMENTO_LACO_MS: 45_000,
}));
vi.mock("@/features/mensageria/nucleo/banco.server", () => ({
  marcarWorkerVisto: m.marcarWorkerVisto,
}));
// o motor de verdade (a regra de renovar e o teto), com o banco falso por baixo
vi.mock("@/features/mensageria/nucleo/motor.server", async (original) => ({
  ...(await original<typeof import("@/features/mensageria/nucleo/motor.server")>()),
  conferirChaveDoMotor: m.conferirChaveDoMotor,
  prepararCopia: m.prepararCopia,
  pendenciasDoMotor: m.pendenciasDoMotor,
  acordarMotor: m.acordarMotor,
  // a espera da janela do "recente" (até ~41,5 s) não roda nos testes sem relógio falso; os testes
  // dela usam a de verdade (esperaDeVerdade)
  esperarJanelaDoToque: m.esperarJanelaDoToque,
}));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: {} }));

const { esperarJanelaDoToque: esperaDeVerdade } = await vi.importActual<
  typeof import("@/features/mensageria/nucleo/motor.server")
>("@/features/mensageria/nucleo/motor.server");

const { Route } = await import("@/routes/api/public/cron/mensageria");

type Handler = (ctx: { request: Request }) => Promise<Response>;
const post = (Route.options as unknown as { server: { handlers: { POST: Handler } } }).server
  .handlers.POST;

const SEGREDO_FALSO = "segredo-de-teste-do-cron";

const CHAVE_DO_MOTOR = "a".repeat(64);

beforeEach(() => {
  for (const f of Object.values(m)) f.mockReset();
  m.rodarLaco.mockResolvedValue({ duracao_ms: 1, passadas: 3 });
  m.achouTrabalho.mockReturnValue(false);
  m.marcarWorkerVisto.mockResolvedValue(true);
  m.conferirChaveDoMotor.mockImplementation(async (c: string | null) => c === CHAVE_DO_MOTOR);
  m.prepararCopia.mockResolvedValue("pronta");
  // sem pendência nenhuma: não renova
  m.pendenciasDoMotor.mockResolvedValue({
    proximoEm: null,
    vencidoDesde: null,
    atrasadoDesde: null,
  });
  m.acordarMotor.mockResolvedValue("tocado");
  m.esperarJanelaDoToque.mockResolvedValue(undefined);
  // o motor fica parado sem esta variável (a trava do servidor)
  vi.stubEnv("JANETE_MOTOR_LIGADO", "sim");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const pedido = (auth?: string, motor?: string) => {
  const headers: Record<string, string> = {};
  if (auth) headers["authorization"] = auth;
  if (motor !== undefined) headers["x-janete-motor"] = motor;
  return new Request("https://app.exemplo/api/public/cron/mensageria", { method: "POST", headers });
};

describe("POST /api/public/cron/mensageria", () => {
  it("sem a chave do motor: 401 e o ciclo não roda", async () => {
    const r = await post({ request: pedido() });
    expect(r.status).toBe(401);
    expect(m.rodarLaco).not.toHaveBeenCalled();
    expect(m.marcarWorkerVisto).not.toHaveBeenCalled();
  });

  it("chave errada no cabeçalho: 401", async () => {
    const r = await post({ request: pedido(undefined, "outro") });
    expect(r.status).toBe(401);
    expect(m.rodarLaco).not.toHaveBeenCalled();
  });

  it("com a chave do motor: roda o laço contado do início do pedido e só então devolve o resumo", async () => {
    // o relógio anda 700 ms entre a 1ª linha do handler e o laço (autenticação e import)
    let agora = 5_000_000;
    const relogio = vi.spyOn(Date, "now").mockImplementation(() => {
      const t = agora;
      agora += 700;
      return t;
    });
    try {
      const r = await post({ request: pedido(undefined, CHAVE_DO_MOTOR) });
      expect(r.status).toBe(200);
      expect(m.rodarLaco).toHaveBeenCalledTimes(1);
      // o orçamento (45 s) é o do ciclo; a rota passa só o início, a 1ª leitura do relógio
      expect(m.rodarLaco).toHaveBeenCalledWith({ inicioEm: 5_000_000 });
      await expect(r.json()).resolves.toEqual({ duracao_ms: 1, passadas: 3, toque: null });
    } finally {
      relogio.mockRestore();
    }
  });

  it("cada chamada grava o worker_visto_em sem esperar antes do laço", async () => {
    // a gravação fica pendurada: o laço começa mesmo assim
    let soltar: (v: boolean) => void = () => {};
    m.marcarWorkerVisto.mockReturnValueOnce(new Promise<boolean>((ok) => (soltar = ok)));
    let lacoComecou = false;
    m.rodarLaco.mockImplementationOnce(async () => {
      lacoComecou = true;
      soltar(true);
      return { duracao_ms: 1, passadas: 1 };
    });
    const r = await post({ request: pedido(undefined, CHAVE_DO_MOTOR) });
    expect(lacoComecou).toBe(true);
    expect(m.marcarWorkerVisto).toHaveBeenCalledTimes(1);
    expect(r.status).toBe(200);

    await post({ request: pedido(undefined, CHAVE_DO_MOTOR) });
    expect(m.marcarWorkerVisto).toHaveBeenCalledTimes(2);
  });

  it("falha ao gravar o worker_visto_em não muda a resposta do laço", async () => {
    m.marcarWorkerVisto.mockRejectedValueOnce(new Error("inesperado"));
    const r = await post({ request: pedido(undefined, CHAVE_DO_MOTOR) });
    expect(r.status).toBe(200);
    expect(m.rodarLaco).toHaveBeenCalledTimes(1);
    await expect(r.json()).resolves.toEqual({ duracao_ms: 1, passadas: 3, toque: null });
  });
});

describe("o toque do motor (x-janete-motor)", () => {
  it("chave certa: roda o laço", async () => {
    const r = await post({ request: pedido(undefined, CHAVE_DO_MOTOR) });
    expect(r.status).toBe(200);
    expect(m.conferirChaveDoMotor).toHaveBeenCalledWith(CHAVE_DO_MOTOR);
    expect(m.rodarLaco).toHaveBeenCalledTimes(1);
    expect(m.marcarWorkerVisto).toHaveBeenCalledTimes(1);
  });

  it("chave errada: 401", async () => {
    const r = await post({ request: pedido(undefined, "b".repeat(64)) });
    expect(r.status).toBe(401);
    expect(m.rodarLaco).not.toHaveBeenCalled();
    expect(m.marcarWorkerVisto).not.toHaveBeenCalled();
    expect(m.prepararCopia).not.toHaveBeenCalled();
  });

  it("cabeçalho vazio: 401", async () => {
    const r = await post({ request: pedido(undefined, "") });
    expect(r.status).toBe(401);
    expect(m.rodarLaco).not.toHaveBeenCalled();
  });

  it("prepara a cópia junto com o worker_visto_em, sem esperar antes do laço", async () => {
    let soltar: (v: string) => void = () => {};
    m.prepararCopia.mockReturnValueOnce(new Promise<string>((ok) => (soltar = ok)));
    let lacoComecou = false;
    m.rodarLaco.mockImplementationOnce(async () => {
      lacoComecou = true;
      expect(m.prepararCopia).toHaveBeenCalledTimes(1);
      expect(m.marcarWorkerVisto).toHaveBeenCalledTimes(1);
      soltar("preparada");
      return { duracao_ms: 1, passadas: 1 };
    });
    const r = await post({ request: pedido(undefined, CHAVE_DO_MOTOR) });
    expect(lacoComecou).toBe(true);
    expect(r.status).toBe(200);
  });

  it("a cópia que falha ao preparar não muda a resposta", async () => {
    m.prepararCopia.mockRejectedValueOnce(new Error("inesperado"));
    const r = await post({ request: pedido(undefined, CHAVE_DO_MOTOR) });
    expect(r.status).toBe(200);
    await expect(r.json()).resolves.toEqual({ duracao_ms: 1, passadas: 3, toque: null });
  });
});

describe("a renovação do toque no fim do laço", () => {
  const AGORA = Date.parse("2026-11-03T12:00:00Z");
  const MIN = 60_000;
  const pendencias = (p: { proximoEm?: number; vencidoDesde?: number }) => ({
    proximoEm: p.proximoEm ?? null,
    vencidoDesde: p.vencidoDesde ?? null,
    atrasadoDesde: p.vencidoDesde ?? null,
  });

  async function fimDoLaco(): Promise<{ toque: unknown }> {
    const relogio = vi.spyOn(Date, "now").mockReturnValue(AGORA);
    try {
      const r = await post({ request: pedido(undefined, CHAVE_DO_MOTOR) });
      expect(r.status).toBe(200);
      return (await r.json()) as { toque: unknown };
    } finally {
      relogio.mockRestore();
    }
  }

  it("item que fica pronto nos próximos 10 min: renova com acordarMotor(null, { renovar: true })", async () => {
    m.pendenciasDoMotor.mockResolvedValue(pendencias({ proximoEm: AGORA + 10 * MIN }));
    const corpo = await fimDoLaco();
    expect(m.acordarMotor).toHaveBeenCalledTimes(1);
    expect(m.acordarMotor).toHaveBeenCalledWith(null, { renovar: true, tetoMs: 3_000 });
    expect(corpo).toEqual({ duracao_ms: 1, passadas: 3, toque: "tocado" });
  });

  it("item vencido há menos de 10 min: renova", async () => {
    m.pendenciasDoMotor.mockResolvedValue(pendencias({ vencidoDesde: AGORA - 10 * MIN + 1 }));
    m.acordarMotor.mockResolvedValue("recente");
    const corpo = await fimDoLaco();
    expect(m.acordarMotor).toHaveBeenCalledWith(null, { renovar: true, tetoMs: 3_000 });
    expect(corpo.toque).toBe("recente");
  });

  it("trabalho achado no laço, com pendência sobrando (mesmo velha ou longe): renova", async () => {
    m.achouTrabalho.mockReturnValue(true);
    m.pendenciasDoMotor.mockResolvedValue(pendencias({ vencidoDesde: AGORA - 60 * MIN }));
    const corpo = await fimDoLaco();
    expect(m.achouTrabalho).toHaveBeenCalledWith({ duracao_ms: 1, passadas: 3 });
    expect(m.acordarMotor).toHaveBeenCalledWith(null, { renovar: true, tetoMs: 3_000 });
    expect(corpo.toque).toBe("tocado");
  });

  it("item vencido há mais de 10 min, sem trabalho achado: não renova", async () => {
    m.pendenciasDoMotor.mockResolvedValue(pendencias({ vencidoDesde: AGORA - 10 * MIN }));
    const corpo = await fimDoLaco();
    expect(m.acordarMotor).not.toHaveBeenCalled();
    expect(corpo.toque).toBeNull();
  });

  it("item pronto daqui a mais de 10 min, sem trabalho: não renova", async () => {
    m.pendenciasDoMotor.mockResolvedValue(pendencias({ proximoEm: AGORA + 10 * MIN + 1 }));
    await fimDoLaco();
    expect(m.acordarMotor).not.toHaveBeenCalled();
  });

  it("trabalho achado sem pendência sobrando: não renova", async () => {
    m.achouTrabalho.mockReturnValue(true);
    await fimDoLaco();
    expect(m.acordarMotor).not.toHaveBeenCalled();
  });

  it("sem a leitura das pendências: renova só se o laço achou trabalho", async () => {
    m.pendenciasDoMotor.mockResolvedValue(null);
    await fimDoLaco();
    expect(m.acordarMotor).not.toHaveBeenCalled();
    m.achouTrabalho.mockReturnValue(true);
    await fimDoLaco();
    expect(m.acordarMotor).toHaveBeenCalledTimes(1);
  });

  it("a leitura das pendências que não volta tem teto de 2 s", async () => {
    vi.useFakeTimers();
    try {
      m.pendenciasDoMotor.mockReturnValue(new Promise(() => {}));
      m.achouTrabalho.mockReturnValue(true);
      const resposta = post({ request: pedido(undefined, CHAVE_DO_MOTOR) });
      await vi.advanceTimersByTimeAsync(1_999);
      expect(m.acordarMotor).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);
      const r = await resposta;
      expect(r.status).toBe(200);
      expect(m.acordarMotor).toHaveBeenCalledWith(null, { renovar: true, tetoMs: 3_000 });
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("o fim do laço ocioso não perde o toque do webhook (a janela do recente)", () => {
  const T0 = Date.parse("2026-11-03T12:00:00Z");

  afterEach(() => {
    vi.useRealTimers();
  });

  it("espera vistoEm + 41,5 s antes de ler as pendências, e renova com a conversa armada no fim", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(T0);
    m.esperarJanelaDoToque.mockImplementation(esperaDeVerdade);
    // o laço ocioso acaba em 38,5 s, sem trabalho
    m.rodarLaco.mockImplementation(async () => {
      vi.setSystemTime(T0 + 38_500);
      return { duracao_ms: 38_500, passadas: 13 };
    });
    // o lead responde em 39 s: o webhook grava, arma a conversa (pronta em 39 s + 15 s) e leva
    // "recente" (o visto tem 39 s); só uma leitura feita depois disso enxerga a conversa
    const leituras: number[] = [];
    m.pendenciasDoMotor.mockImplementation(async () => {
      leituras.push(Date.now());
      return {
        proximoEm: Date.now() >= T0 + 39_000 ? T0 + 54_000 : null,
        vencidoDesde: null,
        atrasadoDesde: null,
      };
    });
    const resposta = post({ request: pedido(undefined, CHAVE_DO_MOTOR) });
    await vi.advanceTimersByTimeAsync(10_000);
    const r = await resposta;
    expect(m.marcarWorkerVisto).toHaveBeenCalledWith(new Date(T0));
    expect(leituras).toHaveLength(1);
    expect(leituras[0]).toBeGreaterThanOrEqual(T0 + 41_500);
    expect(m.acordarMotor).toHaveBeenCalledWith(null, { renovar: true, tetoMs: 3_000 });
    await expect(r.json()).resolves.toMatchObject({ toque: "tocado" });
  });

  it("o laço ocupado que já passou da janela não espera", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(T0);
    m.esperarJanelaDoToque.mockImplementation(esperaDeVerdade);
    m.rodarLaco.mockImplementation(async () => {
      vi.setSystemTime(T0 + 44_000);
      return { duracao_ms: 44_000, passadas: 5 };
    });
    const leituras: number[] = [];
    m.pendenciasDoMotor.mockImplementation(async () => {
      leituras.push(Date.now());
      return { proximoEm: null, vencidoDesde: null, atrasadoDesde: null };
    });
    const resposta = post({ request: pedido(undefined, CHAVE_DO_MOTOR) });
    await vi.advanceTimersByTimeAsync(0);
    await resposta;
    expect(leituras).toEqual([T0 + 44_000]);
  });
});

describe("as leituras depois do laço cabem no limite duro (inicioEm + 50 s)", () => {
  const T0 = Date.parse("2026-11-03T12:00:00Z");

  it("com menos de 1,5 s até o limite: não lê as pendências e renova se achou trabalho", async () => {
    let agora = T0;
    const relogio = vi.spyOn(Date, "now").mockImplementation(() => agora);
    try {
      m.rodarLaco.mockImplementation(async () => {
        agora = T0 + 49_500;
        return { duracao_ms: 49_500, passadas: 4 };
      });
      m.achouTrabalho.mockReturnValue(true);
      const r = await post({ request: pedido(undefined, CHAVE_DO_MOTOR) });
      expect(m.pendenciasDoMotor).not.toHaveBeenCalled();
      expect(m.acordarMotor).toHaveBeenCalledWith(null, { renovar: true, tetoMs: 500 });
      await expect(r.json()).resolves.toMatchObject({ toque: "tocado" });

      m.achouTrabalho.mockReturnValue(false);
      m.acordarMotor.mockClear();
      agora = T0;
      await post({ request: pedido(undefined, CHAVE_DO_MOTOR) });
      expect(m.pendenciasDoMotor).not.toHaveBeenCalled();
      expect(m.acordarMotor).not.toHaveBeenCalled();
    } finally {
      relogio.mockRestore();
    }
  });

  it("com pouco tempo sobrando, o teto da leitura encolhe para deixar 1 s ao toque", async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(T0);
      m.rodarLaco.mockImplementation(async () => {
        // sobram 2,5 s até o limite: a leitura tem teto de 1,5 s
        vi.setSystemTime(T0 + 47_500);
        return { duracao_ms: 47_500, passadas: 4 };
      });
      m.achouTrabalho.mockReturnValue(true);
      m.pendenciasDoMotor.mockReturnValue(new Promise(() => {}));
      const resposta = post({ request: pedido(undefined, CHAVE_DO_MOTOR) });
      await vi.advanceTimersByTimeAsync(1_499);
      expect(m.acordarMotor).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);
      await resposta;
      expect(m.acordarMotor).toHaveBeenCalledWith(null, { renovar: true, tetoMs: 1_000 });
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("a partida a frio também termina até o limite duro (inicioEm + 50 s)", () => {
  const T0 = Date.parse("2026-11-03T12:00:00Z");

  afterEach(() => {
    vi.useRealTimers();
  });

  /** A chave conferida leva `ms` (a partida a frio): o vistoEm vem depois do inicioEm. */
  function partidaFria(ms: number) {
    m.conferirChaveDoMotor.mockImplementation(async (c: string | null) => {
      vi.setSystemTime(T0 + ms);
      return c === CHAVE_DO_MOTOR;
    });
  }

  /** O toque que o banco não responde: acaba no teto que a rota passou. */
  function toqueQueNaoVolta() {
    m.acordarMotor.mockImplementation(
      (_origem: null, opcoes: { tetoMs?: number }) =>
        new Promise((ok) => setTimeout(() => ok("falhou"), opcoes.tetoMs ?? 3_000)),
    );
  }

  it("vistoEm 5 s depois do inicioEm: espera a janela inteira, lê, renova e responde antes dos 50 s", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(T0);
    m.esperarJanelaDoToque.mockImplementation(esperaDeVerdade);
    partidaFria(5_000);
    // o laço ocioso acaba em vistoEm + 38,5 s, sem trabalho
    m.rodarLaco.mockImplementation(async () => {
      vi.setSystemTime(T0 + 43_500);
      return { duracao_ms: 43_500, passadas: 13 };
    });
    // a leitura demora 1,9 s e acha uma conversa armada perto: renova
    const leituras: number[] = [];
    m.pendenciasDoMotor.mockImplementation(() => {
      leituras.push(Date.now());
      return new Promise((ok) =>
        setTimeout(
          () => ok({ proximoEm: Date.now() + 10_000, vencidoDesde: null, atrasadoDesde: null }),
          1_900,
        ),
      );
    });
    toqueQueNaoVolta();
    let fim = 0;
    const resposta = post({ request: pedido(undefined, CHAVE_DO_MOTOR) }).then((r) => {
      fim = Date.now();
      return r;
    });
    await vi.advanceTimersByTimeAsync(20_000);
    const r = await resposta;
    expect(m.marcarWorkerVisto).toHaveBeenCalledWith(new Date(T0 + 5_000));
    // a janela do "recente" ficou coberta: a leitura é de vistoEm + 41,5 s
    expect(leituras).toEqual([T0 + 46_500]);
    // sobram 1,6 s para o toque (de 46,5 + 1,9 s até os 50 s)
    expect(m.acordarMotor).toHaveBeenCalledWith(null, { renovar: true, tetoMs: 1_600 });
    expect(fim).toBeLessThanOrEqual(T0 + 50_000);
    await expect(r.json()).resolves.toMatchObject({ toque: "falhou" });
  });

  it("vistoEm 9 s depois: a espera para 3 s antes do limite, e a leitura e o toque cabem nele", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(T0);
    m.esperarJanelaDoToque.mockImplementation(esperaDeVerdade);
    partidaFria(9_000);
    m.rodarLaco.mockImplementation(async () => {
      vi.setSystemTime(T0 + 45_000);
      return { duracao_ms: 45_000, passadas: 9 };
    });
    m.achouTrabalho.mockReturnValue(true);
    // a leitura que não volta: teto de 2 s
    const leituras: number[] = [];
    m.pendenciasDoMotor.mockImplementation(() => {
      leituras.push(Date.now());
      return new Promise(() => {});
    });
    toqueQueNaoVolta();
    let fim = 0;
    const resposta = post({ request: pedido(undefined, CHAVE_DO_MOTOR) }).then((r) => {
      fim = Date.now();
      return r;
    });
    await vi.advanceTimersByTimeAsync(20_000);
    await resposta;
    // a janela iria até 50,5 s; a espera para em 47 s
    expect(leituras).toEqual([T0 + 47_000]);
    expect(m.acordarMotor).toHaveBeenCalledWith(null, { renovar: true, tetoMs: 1_000 });
    expect(fim).toBeLessThanOrEqual(T0 + 50_000);
  });

  it("com menos de 500 ms até o limite: não toca e a resposta diz 'sem_tempo'", async () => {
    let agora = T0;
    const relogio = vi.spyOn(Date, "now").mockImplementation(() => agora);
    try {
      m.rodarLaco.mockImplementation(async () => {
        agora = T0 + 49_600;
        return { duracao_ms: 49_600, passadas: 4 };
      });
      m.achouTrabalho.mockReturnValue(true);
      const r = await post({ request: pedido(undefined, CHAVE_DO_MOTOR) });
      expect(m.pendenciasDoMotor).not.toHaveBeenCalled();
      expect(m.acordarMotor).not.toHaveBeenCalled();
      await expect(r.json()).resolves.toEqual({
        duracao_ms: 49_600,
        passadas: 4,
        toque: "sem_tempo",
      });
    } finally {
      relogio.mockRestore();
    }
  });
});
