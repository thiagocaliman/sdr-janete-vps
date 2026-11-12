import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { reiniciarContexto } from "@/features/plataforma/contexto/loja";
import { Mapa, type PropsMapa } from "@/features/plataforma/contexto/Mapa";
import { CAMPOS, GRUPOS, camposDoGrupo, type Alvo } from "@/features/plataforma/contexto/tipos";
import { ProvedorPapel, type Papel } from "@/features/plataforma/papel";

// O mapa do Método D.A.T.A.: quatro camadas (Descrição, Ação, Treinamento e Atenção), cada uma com a
// letra, o nome, a pergunta-guia e os campos dela, ligados por curvas. As medidas
// (getBoundingClientRect) são simuladas: o mapa tem 1136 x 800, o rótulo de cada camada fica à
// esquerda e os campos numa coluna à direita.

function ret(left: number, top: number, width: number, height: number): DOMRect {
  const r = { left, top, width, height, x: left, y: top, right: left + width, bottom: top + height };
  return { ...r, toJSON: () => r } as DOMRect;
}

function medidaFalsa(this: Element): DOMRect {
  const el = this as HTMLElement;
  if (el.id === "ctx-mapa") return ret(0, 0, 1136, 800);
  const camada = el.closest<HTMLElement>("[data-camada]");
  const i = GRUPOS.findIndex((g) => g.id === camada?.dataset["camada"]);
  if (el.hasAttribute("data-rotulo")) return ret(0, 40 + i * 200, 400, 72);
  if (el.hasAttribute("data-nos")) return ret(510, i * 200, 500, 200);
  if (el.hasAttribute("data-ponta") && camada) {
    const k = [...camada.querySelectorAll("[data-ponta]")].indexOf(el);
    return ret(510, 10 + i * 200 + k * 44, 200, 40);
  }
  return ret(0, 0, 0, 0);
}

const props = (extra: Partial<PropsMapa> = {}): PropsMapa => ({ aoAbrir: vi.fn(), estreita: false, ...extra });

function montar(extra: Partial<PropsMapa> = {}, papel: Papel = "admin") {
  const p = props(extra);
  const r = render(
    <ProvedorPapel inicial={papel}>
      <Mapa {...p} />
    </ProvedorPapel>,
  );
  return { ...r, p };
}

const curva = (c: HTMLElement, alvo: Alvo | "mais") => c.querySelector<SVGPathElement>(`path[data-alvo="${alvo}"]`);

beforeEach(() => {
  reiniciarContexto();
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(medidaFalsa);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  reiniciarContexto();
});

describe("as quatro camadas do D.A.T.A.", () => {
  it("vêm na ordem D, A, T, A, cada uma com a letra, o nome e a pergunta-guia", () => {
    const { container } = montar();
    const camadas = [...container.querySelectorAll<HTMLElement>("[data-camada]")];
    expect(camadas.map((c) => c.dataset["camada"])).toEqual(["descricao", "acao", "treinamento", "atencao"]);
    camadas.forEach((c, i) => {
      const g = GRUPOS[i]!;
      const texto = c.querySelector("[data-rotulo]")?.textContent ?? "";
      expect(texto).toContain(g.letra);
      expect(texto).toContain(g.nome);
      expect(texto).toContain(g.guia);
    });
    expect(GRUPOS.map((g) => g.letra).join(".")).toBe("D.A.T.A");
    expect(GRUPOS.map((g) => g.nome)).toEqual(["Descrição", "Ação", "Treinamento", "Atenção"]);
  });

  it("os oito campos continuam todos lá, cada um na sua camada", () => {
    const { container } = montar();
    const porCamada = (g: string) => [...container.querySelectorAll(`[data-camada="${g}"] [data-campo]`)].map((b) => b.getAttribute("data-campo"));
    expect(porCamada("descricao")).toEqual(["empresa_oferta", "cliente_ideal", "preco", "diferenciais"]);
    expect(porCamada("acao")).toEqual(["quando_passar_humano", "horario"]);
    expect(porCamada("treinamento")).toEqual(["objecoes"]);
    expect(porCamada("atencao")).toEqual(["tom_voz"]);
    expect(container.querySelectorAll("[data-campo]")).toHaveLength(CAMPOS.length);
    expect(CAMPOS).toHaveLength(8);
  });

  it("as perguntas livres ficam no Treinamento, com o 'Novo item livre' no fim", () => {
    const { container } = montar();
    const t = container.querySelector('[data-camada="treinamento"]')!;
    expect(t.querySelectorAll("[data-livre]").length).toBeGreaterThan(1);
    expect(t.querySelector("#ctx-card-novo")).toBeInTheDocument();
    expect(container.querySelector('[data-camada="atencao"] [data-livre]')).toBeNull();
    expect(camposDoGrupo("atencao").map((c) => c.chave)).toEqual(["tom_voz"]);
  });

  it("a atendente vê o mapa, sem o 'Novo item livre'", () => {
    const { container } = montar({}, "atendente");
    expect(container.querySelectorAll("[data-campo]")).toHaveLength(8);
    expect(container.querySelector("#ctx-card-novo")).toBeNull();
  });
});

describe("as curvas e a situação de cada campo", () => {
  it("cada campo e cada pergunta tem a sua curva, saindo do eixo da camada", () => {
    const { container } = montar();
    const pontas = [...container.querySelectorAll<HTMLElement>("[data-ponta]")].map((e) => e.dataset["ponta"]);
    const fios = [...container.querySelectorAll("path[data-alvo]")].map((p) => p.getAttribute("data-alvo"));
    expect([...fios].sort()).toEqual([...pontas].sort());
    expect(container.querySelectorAll("circle[data-de]")).toHaveLength(4);
    // todas as curvas de uma camada partem do mesmo ponto
    const inicios = new Set([...container.querySelectorAll('path[data-de="descricao"]')].map((p) => p.getAttribute("d")?.split("C")[0]));
    expect(inicios.size).toBe(1);
  });

  it("salvo, vazio e não salvo aparecem no botão e na curva", () => {
    reiniciarContexto({ jaEntrou: true, rascunhos: { preco: { base: 6, texto: "novo preço" } } });
    const { container } = montar();
    const sit = (id: string) => container.querySelector(`#${id}`)?.getAttribute("data-situacao");
    expect(sit("ctx-l-preco")).toBe("nao_salvo");
    expect(sit("ctx-l-empresa_oferta")).toBe("sabe");
    expect(curva(container, "preco")).toHaveAttribute("data-situacao", "nao_salvo");
    expect(curva(container, "empresa_oferta")).toHaveAttribute("data-situacao", "sabe");
    const vazio = container.querySelector<HTMLElement>('[data-campo][data-situacao="vazio"]');
    if (vazio) {
      const fio = curva(container, vazio.dataset["campo"] as Alvo);
      expect(fio).toHaveAttribute("data-situacao", "vazio");
      expect(fio).toHaveAttribute("stroke-dasharray");
    }
  });

  it("o 'Ensinar' acende a curva do campo descoberto", () => {
    const { container } = montar({ raio: { alvo: "preco", n: 1 } });
    const raio = container.querySelector("path[data-raio]");
    expect(raio).toBeInTheDocument();
    expect(raio?.getAttribute("d")).toBe(curva(container, "preco")?.getAttribute("d"));
  });

  it("no celular não há curvas: as camadas viram uma lista", () => {
    const { container } = montar({ estreita: true });
    expect(container.querySelector("#ctx-mapa")).toHaveAttribute("data-estreita");
    expect(container.querySelector("svg path[data-alvo]")).toBeNull();
    expect(container.querySelectorAll("[data-campo]")).toHaveLength(8);
  });
});

describe("abrir", () => {
  it("o título abre a camada; o campo e a pergunta abrem aquele item", () => {
    const { container, p } = montar();
    fireEvent.click(container.querySelector('[data-grupo="acao"]')!);
    fireEvent.click(container.querySelector('[data-grupo="descricao"]')!);
    fireEvent.click(container.querySelector("#ctx-l-preco")!);
    fireEvent.click(container.querySelector("#ctx-card-2")!);
    fireEvent.click(container.querySelector("#ctx-card-novo")!);
    expect(vi.mocked(p.aoAbrir).mock.calls.map((c) => c[0])).toEqual(["acao", "descricao", "preco", "livre-2", "livre-novo"]);
  });

  it("com o mouse numa camada, ela fica em destaque", () => {
    const { container } = montar();
    const mapa = container.querySelector("#ctx-mapa")!;
    fireEvent.mouseEnter(container.querySelector('[data-camada="treinamento"]')!);
    expect(mapa).toHaveAttribute("data-ativa", "treinamento");
  });
});
