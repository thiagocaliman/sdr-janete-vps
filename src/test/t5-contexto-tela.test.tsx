import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TelaContexto } from "@/features/plataforma/contexto";
import { lerContexto, reiniciarContexto } from "@/features/plataforma/contexto/loja";
import { ProvedorPapel, type Papel } from "@/features/plataforma/papel";
import { Route } from "@/routes/app/contexto";

// A tela do Contexto pelo Método D.A.T.A.: junta o cabeçalho, o mapa das 4 camadas, a seção, o painel
// de ensinar e o histórico, e a rota. A troca entre o mapa e a seção é direta (sem passagem animada).

const matchMediaOriginal = window.matchMedia;

/** Tela estreita (celular): só a consulta de largura da casca casa. */
function telaEstreita(): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query === "(max-width: 899px)",
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

function montar(papel: Papel = "admin", Tela: ComponentType = TelaContexto) {
  return render(
    <ProvedorPapel inicial={papel}>
      <Tela />
    </ProvedorPapel>,
  );
}

const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector<T>(sel);

/** Clica e deixa os timers curtos da tela (foco, fases da volta) correrem. */
async function clicar(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
  });
}

beforeEach(() => {
  reiniciarContexto({ jaEntrou: true });
});

afterEach(() => {
  cleanup();
  if (vi.isFakeTimers()) vi.runOnlyPendingTimers();
  vi.useRealTimers();
  Object.defineProperty(window, "matchMedia", { writable: true, configurable: true, value: matchMediaOriginal });
});

describe("a rota /app/contexto", () => {
  it("monta a TelaContexto, com o h1 #area-contexto dentro da VistaArea", () => {
    const Componente = Route.options.component as ComponentType;
    expect(Componente).toBe(TelaContexto);
    montar("admin", Componente);
    const h1 = screen.getByRole("heading", { level: 1, name: "Conhecimento da Janete · Método D.A.T.A." });
    expect(h1).toHaveAttribute("id", "area-contexto");
    expect(h1.closest('section[data-area="contexto"]')).not.toBeNull();
    expect($("#ctx-mapa")).not.toBeNull();
    expect(document.querySelectorAll("#ctx-mapa [data-camada]")).toHaveLength(4);
    expect(document.body.textContent).toContain("Ensine sua IA a atender melhor.");
  });
});

describe("cabeçalho e rodapé", () => {
  it("mostra os números da versão na tela, a legenda, o rodapé e o histórico", async () => {
    montar();
    const tela = document.body.textContent ?? "";
    expect(tela).toContain("6 de 8 campos");
    expect(tela).toContain("3 perguntas livres");
    // sem anexos na v1 (decisão 11a)
    expect(tela).not.toMatch(/anexo/i);
    expect(tela).toContain("A Janete sabe");
    expect(tela).toContain("Ainda vazio");
    expect(tela).toContain("Não salvo");
    expect(tela).toContain("Versão 6");
    expect(tela).toContain("Em uso");
    expect(tela).toContain("Cada alteração salva cria uma nova versão.");
    expect(tela).not.toMatch(/Ver como/);

    const hist = $("[data-acao='historico']")!;
    expect(hist).toHaveAttribute("aria-expanded", "false");
    await clicar(hist);
    expect($("#ctx-gaveta")).not.toBeNull();
    expect(hist).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelectorAll("#ctx-gaveta li[data-versao]")).toHaveLength(6);
  });

  it("vendo uma versão antiga: a faixa, os números dela, o rodapé 'Antiga' e sem ensinar", () => {
    reiniciarContexto({ jaEntrou: true, vendo: 3 });
    montar();
    expect(screen.getByRole("region", { name: "Versão antiga" })).toHaveAttribute("data-vendo", "3");
    expect(document.body.textContent).toContain("Antiga · só leitura");
    expect($("[data-acao='ensinar']")).toBeNull();
    expect(document.body.textContent).not.toContain("Não salvo");
  });

  it("o atendente não vê '+ Ensinar algo novo' nem 'Não salvo'", () => {
    montar("atendente");
    expect($("[data-acao='ensinar']")).toBeNull();
    expect(document.body.textContent).not.toContain("Não salvo");
    expect($("[data-acao='historico']")).not.toBeNull();
  });
});

describe("mapa ⇄ seção ⇄ mapa", () => {
  it("o título da camada abre a área no 1º item; Voltar volta ao mapa", async () => {
    montar();
    await clicar($("[data-grupo='atencao']"));
    expect($("#ctx-mapa")).toBeNull();
    const secao = $("#ctx-secao")!;
    expect(secao).toHaveAttribute("data-secao", "atencao");
    expect($("[data-item='tom_voz']")).toHaveAttribute("aria-current", "true");
    expect($("#ctx-editor")).not.toBeNull();
    // os hooks do cabeçalho e do rodapé continuam
    expect($("[data-acao='ensinar']")).not.toBeNull();
    expect($("[data-acao='historico']")).not.toBeNull();

    await clicar($("[data-acao='voltar']"));
    expect($("#ctx-secao")).toBeNull();
    expect($("#ctx-mapa")).not.toBeNull();
  });

  it("a linha abre aquele item; data-item troca o editor; data-trocar troca a área; Esc volta", async () => {
    montar();
    await clicar($("[data-campo='preco']"));
    expect($("#ctx-secao")).toHaveAttribute("data-secao", "descricao");
    expect($("#ctx-ed-tit")).toHaveTextContent("Preço");

    await clicar($("[data-item='diferenciais']"));
    expect($("#ctx-ed-tit")).toHaveTextContent("Diferenciais");

    await clicar($("[data-trocar='treinamento']"));
    expect($("#ctx-secao")).toHaveAttribute("data-secao", "treinamento");
    expect($("[data-item='objecoes']")).toHaveAttribute("aria-current", "true");
    expect($("[data-item='livre-1']")).not.toBeNull();

    await act(async () => {
      fireEvent.keyDown($("#ctx-secao")!, { key: "Escape" });
    });
    expect($("#ctx-secao")).toBeNull();
    expect($("#ctx-mapa")).not.toBeNull();
  });

  it("o cartão e o título do grupo abrem as perguntas livres; Esc com o foco fora da seção também volta", async () => {
    montar();
    await clicar($("[data-livre='2']"));
    expect($("[data-item='livre-2']")).toHaveAttribute("aria-current", "true");
    await clicar($("[data-acao='voltar']"));

    await clicar($("[data-grupo='descricao']"));
    expect($("[data-item='empresa_oferta']")).toHaveAttribute("aria-current", "true");
    (document.activeElement as HTMLElement | null)?.blur();
    await act(async () => {
      fireEvent.keyDown(document.body, { key: "Escape" });
    });
    expect($("#ctx-secao")).toBeNull();
  });

  it("na volta, o foco vai para o botão do mapa que abriu a seção", async () => {
    vi.useFakeTimers();
    montar();
    await clicar($("[data-campo='preco']"));
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    await clicar($("[data-acao='voltar']"));
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(document.activeElement).toBe($("#ctx-l-preco"));
  });
});

describe("o botão do cabeçalho abre o painel de ensinar", () => {
  it("abre o #ctx-ens acima do mapa, fecha e abre de novo", async () => {
    montar();
    const btn = $("[data-acao='ensinar']")!;
    await clicar(btn);
    const painel = $("#ctx-ens")!;
    expect(painel).not.toBeNull();
    expect(painel.closest("#ctx-palco")).not.toBeNull();
    expect(painel.compareDocumentPosition($("#ctx-mapa")!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(btn).toHaveAttribute("aria-expanded", "true");

    await clicar(btn);
    expect($("#ctx-ens")).toBeNull();
    expect(btn).toHaveAttribute("aria-expanded", "false");

    await clicar(btn);
    expect(document.querySelectorAll("#ctx-ens")).toHaveLength(1);
  });

  it("com a seção aberta, o botão do cabeçalho volta ao mapa e abre o painel", async () => {
    montar();
    await clicar($("[data-campo='horario']"));
    expect($("#ctx-secao")).not.toBeNull();
    await clicar($("[data-acao='ensinar']"));
    expect($("#ctx-secao")).toBeNull();
    expect($("#ctx-ens")).not.toBeNull();
    expect($("#ctx-mapa")).not.toBeNull();
  });

  it("ensinar 'atendemos sábado das 9h' liga o raio até Horário e 'Abrir Horário' leva à seção", async () => {
    vi.useFakeTimers();
    montar();
    await clicar($("[data-acao='ensinar']"));
    await act(async () => {
      vi.advanceTimersByTime(10);
    });
    const caixa = $<HTMLTextAreaElement>("#ens-in")!;
    fireEvent.change(caixa, { target: { value: "atendemos sábado das 9h" } });
    fireEvent.keyDown(caixa, { key: "Enter" });
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(lerContexto().rascunhos.horario?.extras).toEqual(["atendemos sábado das 9h."]);
    expect($("[data-campo='horario']")).toHaveAttribute("data-situacao", "nao_salvo");

    await clicar($("#ens-abrir"));
    expect($("#ctx-ens")).toBeNull();
    expect($("#ctx-secao")).toHaveAttribute("data-secao", "acao");
    expect($("#ctx-ed-tit")).toHaveTextContent("Horário");
  });
});

describe("o raio do ensinar", () => {
  function ret(left: number, top: number, width: number, height: number): DOMRect {
    const r = { left, top, width, height, x: left, y: top, right: left + width, bottom: top + height };
    return { ...r, toJSON: () => r } as DOMRect;
  }

  it("corre uma vez: some depois da animação e não corre de novo quando o mapa remonta", async () => {
    vi.useFakeTimers();
    // o mapa com tamanho (as curvas existem)
    const spy = vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      const el = this as HTMLElement;
      if (el.id === "ctx-mapa") return ret(0, 0, 1136, 640);
      if (el.hasAttribute("data-rotulo")) return ret(0, 40, 400, 72);
      if (el.hasAttribute("data-nos")) return ret(510, 0, 500, 200);
      if (el.getAttribute("data-ponta")) return ret(510, 60, 200, 40);
      return ret(0, 0, 0, 0);
    });
    const ensinar = async (texto: string) => {
      const caixa = $<HTMLTextAreaElement>("#ens-in")!;
      fireEvent.change(caixa, { target: { value: texto } });
      fireEvent.keyDown(caixa, { key: "Enter" });
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
    };
    try {
      montar();
      await clicar($("[data-acao='ensinar']"));
      await act(async () => {
        vi.advanceTimersByTime(10);
      });
      await ensinar("atendemos sábado das 9h");
      expect($("[data-raio='horario']")).not.toBeNull();
      await act(async () => {
        vi.advanceTimersByTime(1200);
      });
      expect($("[data-raio]")).toBeNull();

      // de novo, e logo "Abrir Horário": na volta, as curvas reaparecem sem o raio
      await clicar(screen.getByRole("button", { name: "Ensinar outra coisa" }));
      await ensinar("atendemos sábado das 10h");
      expect($("[data-raio='horario']")).not.toBeNull();
      await clicar($("#ens-abrir"));
      expect($("#ctx-secao")).not.toBeNull();
      await clicar($("[data-acao='voltar']"));
      await act(async () => {
        vi.advanceTimersByTime(200);
      });
      expect($("#ctx-mapa path[data-alvo='horario']")).not.toBeNull();
      expect($("[data-raio]")).toBeNull();
    } finally {
      spy.mockRestore();
    }
  });
});

describe("Esc com o foco no corpo da página", () => {
  it("fecha a gaveta do histórico e o painel de ensinar", async () => {
    vi.useFakeTimers();
    montar();
    await clicar($("[data-acao='historico']"));
    expect($("#ctx-gaveta")).not.toBeNull();
    (document.activeElement as HTMLElement | null)?.blur();
    await act(async () => {
      fireEvent.keyDown(document.body, { key: "Escape" });
    });
    expect($("#ctx-gaveta")).toBeNull();
    expect(document.activeElement).toBe($("#ctx-historico-btn"));

    await clicar($("[data-acao='ensinar']"));
    await act(async () => {
      vi.advanceTimersByTime(10);
    });
    expect($("#ctx-ens")).not.toBeNull();
    (document.activeElement as HTMLElement | null)?.blur();
    await act(async () => {
      fireEvent.keyDown(document.body, { key: "Escape" });
    });
    expect($("#ctx-ens")).toBeNull();
    expect(document.activeElement).toBe($("#ctx-ensinar-btn"));
  });
});

describe("celular (matchMedia de tela estreita)", () => {
  it("a linha abre o editor em tela cheia; o título do grupo, só a lista", async () => {
    telaEstreita();
    montar();
    expect($("#ctx-mapa")).toHaveAttribute("data-estreita");

    await clicar($("[data-campo='preco']"));
    expect($("#ctx-secao")).toHaveAttribute("data-estreita");
    expect($("#ctx-editor")).toHaveAttribute("data-estreita");
    expect($("#ctx-ed-tit")).toHaveTextContent("Preço");
    expect($("#ctx-mapa")).toBeNull();

    // o "←" do editor volta para a lista
    await clicar($("#ctx-editor [data-acao='voltar']"));
    expect($("#ctx-editor")).toBeNull();
    expect(document.querySelectorAll("#ctx-secao [data-item]").length).toBeGreaterThan(0);

    await clicar($("#ctx-secao [data-acao='voltar']"));
    expect($("#ctx-mapa")).not.toBeNull();

    await clicar($("[data-grupo='treinamento']"));
    expect($("#ctx-secao")).toHaveAttribute("data-secao", "treinamento");
    expect($("#ctx-editor")).toBeNull();
    await clicar($("[data-item='objecoes']"));
    expect($("#ctx-editor")).not.toBeNull();
    expect($("#ctx-ed-tit")).toHaveTextContent("Objeções");
  });
});
