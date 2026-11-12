import { Outlet, RouterProvider, createMemoryHistory, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { numero, ProvedorPainel, usePainelDashboard, type EtapaFunil, type Simulacao, type ValorPainelDashboard } from "@/features/plataforma/dashboard/dados";
import { TelaDashboardFinal } from "@/features/plataforma/dashboard/versoes/final/TelaDashboardFinal";
import { zerarEstadoDoVoo } from "@/features/plataforma/dashboard/versoes/final/voo";
import { avancar, estadoInicial, MAX_PONTOS, montarTabela, sortear, tomDoPonto } from "@/features/plataforma/dashboard/versoes/rio/rio";
import { TelaDashboardRio } from "@/features/plataforma/dashboard/versoes/rio/TelaDashboardRio";
import { ProvedorDados } from "@/features/plataforma/dados/ProvedorDados";
import { criarEstadoInicial } from "@/features/plataforma/exemplo";
import { ProvedorPapel } from "@/features/plataforma/papel";

// A versão "rio" do Dashboard: a conta do desenho (rio.ts), pura, e a tela montada como a versão
// final é montada no teste dela. No jsdom não há canvas de verdade: o rio não desenha, e a tela
// precisa continuar completa só com o texto.

const { getUser } = vi.hoisted(() => ({
  getUser: vi.fn(() => Promise.resolve({ data: { user: { id: "u-1", email: "bruno@exemplo.test", user_metadata: { nome: "Bruno Teste" } } } })),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getUser } } }));

const voo = vi.hoisted(() => ({
  ativo: false,
  pousar: vi.fn(),
  voar: vi.fn<(para: unknown, opcoes?: unknown) => Promise<void>>(() => Promise.resolve()),
  mudarEstado: vi.fn(),
  legenda: vi.fn(),
  soltar: vi.fn(),
}));
vi.mock("@/components/janete/VooJanete", async (original) => {
  const real = await original<typeof import("@/components/janete/VooJanete")>();
  return { ...real, useVooJanete: () => voo };
});

const AGORA = new Date("2026-10-30T17:45:00.000Z");
const relogio = () => new Date(AGORA);

let sonda: ValorPainelDashboard | null = null;
function Sonda() {
  sonda = usePainelDashboard();
  return null;
}

function montar({ simulacao = "normal", componente = TelaDashboardRio }: { simulacao?: Simulacao; componente?: () => ReactElement } = {}) {
  const raiz = createRootRoute({
    component: () => (
      <ProvedorPapel inicial="admin">
        <ProvedorDados progredirEnvios={false} relogio={relogio} exemplo={() => criarEstadoInicial(AGORA)}>
          <ProvedorPainel relogio={relogio} simulacaoInicial={simulacao}>
            <Sonda />
            <Outlet />
          </ProvedorPainel>
        </ProvedorDados>
      </ProvedorPapel>
    ),
  });
  const dashboard = createRoute({ getParentRoute: () => raiz, path: "/app/dashboard", component: componente });
  const outras = ["/app/chat", "/app/kanban", "/app/configuracao", "/app/contexto"].map((caminho) =>
    createRoute({ getParentRoute: () => raiz, path: caminho, component: () => <h1>{caminho}</h1> }),
  );
  const router = createRouter({
    routeTree: raiz.addChildren([dashboard, ...outras]),
    history: createMemoryHistory({ initialEntries: ["/app/dashboard"] }),
  });
  return render(<RouterProvider router={router} />);
}

const esperarTela = () => screen.findByRole("heading", { level: 1, name: /^Boa tarde/ });
const texto = (el: Element | null) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();

beforeEach(() => {
  window.sessionStorage.clear();
  window.sessionStorage.setItem("janete-dashboard-visto", "1");
  zerarEstadoDoVoo();
  sonda = null;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/* ---------- a conta do desenho ---------- */

function etapa(nome: string, chegaram: number, perdido = 0, semResposta = 0, tipo: "aberta" | "ganho" = "aberta"): EtapaFunil {
  return { etapaId: nome, nome, tipo, chegaram, abandonaram: { total: perdido + semResposta, perdido, semResposta } } as unknown as EtapaFunil;
}

/** Um gerador fixo, para a simulação dar sempre o mesmo resultado. */
function sorteFixa(semente = 7) {
  let s = semente;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe("dv · versão rio: a conta do desenho", () => {
  const funil = [etapa("Novo", 100, 20, 10), etapa("Qualificado", 60, 15, 5), etapa("Proposta", 30, 10, 0), etapa("Ganho", 12, 0, 0, "ganho")];

  it("a tabela reparte todos os leads que chegaram, sem contar ninguém duas vezes", () => {
    const t = montarTabela(funil);
    expect(t.etapas).toBe(4);
    expect(t.total).toBe(100);
    const de = (k: number, fim: string) => t.destinos.find((d) => d.k === k && d.fim === fim)?.peso ?? 0;
    expect([de(0, "perdido"), de(0, "parado"), de(0, "andando")]).toEqual([20, 10, 10]);
    expect([de(1, "perdido"), de(1, "parado"), de(1, "andando")]).toEqual([15, 5, 10]);
    expect([de(2, "perdido"), de(2, "andando")]).toEqual([10, 8]);
    expect(de(3, "ganho")).toBe(12);
  });

  it("números estranhos não viram peso negativo, e o funil vazio não sorteia ninguém", () => {
    const t = montarTabela([etapa("Novo", 10, 50, 50), etapa("Ganho", 20, 0, 0, "ganho")]);
    expect(t.destinos.every((d) => d.peso > 0)).toBe(true);
    const vazio = montarTabela([etapa("Novo", 0), etapa("Ganho", 0, 0, 0, "ganho")]);
    expect(vazio.total).toBe(0);
    expect(sortear(vazio, 0.5)).toBeNull();
  });

  it("o sorteio segue a proporção dos pesos", () => {
    const t = montarTabela(funil);
    expect(sortear(t, 0)).toMatchObject({ k: 0, fim: "perdido" });
    expect(sortear(t, 0.999999)).toMatchObject({ k: 3, fim: "ganho" });
    expect(sortear(t, 5)).toMatchObject({ k: 3, fim: "ganho" });
    const sorte = sorteFixa();
    let ganhos = 0;
    for (let i = 0; i < 4000; i++) if (sortear(t, sorte())?.fim === "ganho") ganhos++;
    expect(ganhos / 4000).toBeGreaterThan(0.09);
    expect(ganhos / 4000).toBeLessThan(0.15);
  });

  it("o rio corre da esquerda para a direita, não passa do limite de pontos e cada ponto acaba na cor do fim dele", () => {
    const t = montarTabela(funil);
    const estado = estadoInicial();
    const sorte = sorteFixa();
    const vistos = new Set<string>();
    for (let i = 0; i < 3000; i++) {
      const antes = new Map(estado.pontos.map((p) => [p, p.x]));
      avancar(estado, t, 1 / 30, 8, sorte);
      expect(estado.pontos.length).toBeLessThanOrEqual(MAX_PONTOS);
      for (const p of estado.pontos) {
        if (p.estado === "indo" && antes.has(p)) expect(p.x).toBeGreaterThan(antes.get(p)!);
        if (p.estado === "indo" && p.fim !== "ganho") expect(tomDoPonto(p)).toBe("andando");
        if (p.estado === "fim") {
          expect(tomDoPonto(p)).toBe(p.fim);
          vistos.add(p.fim);
        }
        if (p.fim === "ganho") vistos.add(tomDoPonto(p) === "ganho" ? "ganho-verde" : "ganho-laranja");
      }
    }
    expect(estado.pontos.length).toBeGreaterThan(20);
    for (const fim of ["perdido", "parado", "andando", "ganho-verde", "ganho-laranja"]) expect(vistos, fim).toContain(fim);
  });

  it("sem ninguém no período, o rio fica vazio", () => {
    const estado = estadoInicial();
    for (let i = 0; i < 200; i++) avancar(estado, montarTabela([]), 1 / 30, 8, sorteFixa());
    expect(estado.pontos).toHaveLength(0);
  });
});

/* ---------- a tela ---------- */

describe("dv · versão rio: a tela", () => {
  it("é a mesma página da final, marcada como rio, com o funil no fluxo (sem o palco da rolagem)", async () => {
    montar();
    const h1 = await esperarTela();
    expect(h1).toHaveAttribute("id", "area-dashboard");
    const pagina = document.querySelector('[data-dash="pagina"]');
    expect(pagina).toHaveAttribute("data-versao", "rio");
    expect(pagina).toHaveAttribute("data-dash-modo", "aberto");
    for (const gancho of ["janete", "funil", "indice", "resultado", "rio"]) expect(document.querySelector(`[data-dash="${gancho}"]`), gancho).not.toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: "Funil do período" })).toHaveAttribute("id", "dvb-funil-titulo");
  });

  it("os números de cada etapa são texto de verdade, os mesmos do painel", async () => {
    montar();
    await esperarTela();
    const { funil } = sonda!.painel;
    expect(funil.etapas.length).toBeGreaterThan(1);
    const rio = document.querySelector<HTMLElement>('[data-dash="rio"]')!;
    for (const e of funil.etapas) {
      const li = rio.querySelector<HTMLElement>(`[data-etapa="${e.etapaId}"]`);
      expect(li, e.nome).not.toBeNull();
      expect(texto(li)).toContain(e.nome);
      expect(texto(li)).toContain(numero(e.chegaram));
    }
    expect(texto(document.querySelector('[data-dash="funil"]'))).toContain(`${numero(funil.leadsNovos)} que chegaram`);
    expect(screen.getByRole("list", { name: "As cores do rio" })).toHaveTextContent("virou venda");
  });

  it("cada etapa é um botão que leva ao capítulo dela, e há a saída para Perdido", async () => {
    montar();
    await esperarTela();
    const { funil } = sonda!.painel;
    const primeira = funil.etapas[0]!;
    const botao = screen.getByRole("button", { name: new RegExp(`^${primeira.nome}: .*Ver a etapa em detalhe$`) });
    expect(() => fireEvent.click(botao)).not.toThrow();
    const saidas = screen.getByRole("button", { name: /para Perdido\. Ver para onde foram os que saíram$/ });
    expect(() => fireEvent.click(saidas)).not.toThrow();
  });

  it("onde não há canvas de verdade (jsdom), o desenho não tenta pintar e a tela continua de pé", async () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext");
    montar();
    await esperarTela();
    expect(document.querySelector('[data-dash="rio-tela"]')).toHaveAttribute("aria-hidden", "true");
    expect(getContext).not.toHaveBeenCalled();
  });

  it("no período sem nenhum lead, diz isso e não mostra o rio", async () => {
    montar({ simulacao: "periodo_vazio" });
    await esperarTela();
    expect(sonda!.painel.vazio).toBe(true);
    expect(document.querySelector('[data-dash="rio-tela"]')).toBeNull();
  });

  it("a versão final continua de pé ao lado, com o desenho dela", async () => {
    montar({ componente: TelaDashboardFinal });
    await esperarTela();
    expect(document.querySelector('[data-dash="pagina"]')).toHaveAttribute("data-versao", "final");
    expect(document.querySelector('[data-dash="rio"]')).toBeNull();
  });
});
