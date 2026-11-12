import { readFileSync } from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ESTADOS_JANETE, JaneteSimbolo, type EstadoJanete } from "@/components/janete/JaneteSimbolo";

// Lido do disco: no Vitest o CSS não é processado e o `?raw` volta vazio.
const cssJanete = readFileSync(
  path.resolve(__dirname, "../components/janete/JaneteSimbolo.module.css"),
  "utf-8",
);

const ROTULO_ESPERADO: Record<EstadoJanete, string> = {
  dormindo: "Janete, em repouso",
  carregando: "Janete, carregando",
  check: "Janete, tudo certo",
  acordada: "Janete",
  fala: "Janete, falando",
};

describe("JaneteSimbolo", () => {
  it("tem os 5 estados do contrato", () => {
    expect([...ESTADOS_JANETE]).toEqual(["dormindo", "carregando", "check", "acordada", "fala"]);
  });

  it.each(ESTADOS_JANETE)("renderiza no estado %s com nome acessível e as peças do símbolo", (estado) => {
    const { container } = render(<JaneteSimbolo estado={estado} tamanho={56} />);

    const simbolo = screen.getByRole("img", { name: ROTULO_ESPERADO[estado] });
    expect(simbolo).toHaveAttribute("data-estado", estado);
    expect(simbolo).toHaveStyle({ width: "56px", height: "56px" });
    // um SVG só (anel, "AI", três pontos de fala, check e brilho), sempre presentes: a troca de
    // estado é só CSS e não remonta nada.
    expect(simbolo.children).toHaveLength(1);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("viewBox", "180 150 920 920");
    expect(svg.querySelectorAll("circle")).toHaveLength(3);
    expect(svg.querySelectorAll("path")).toHaveLength(5);
    expect(svg.querySelector("path")).toHaveAttribute("d", "M 678 282 A 375 375 0 1 0 968 568");
  });

  it("troca de estado no mesmo elemento, para a transição do CSS acontecer", () => {
    const { rerender } = render(<JaneteSimbolo estado="dormindo" />);
    const antes = screen.getByRole("img");

    for (const estado of ["carregando", "check", "acordada", "fala"] as const) {
      rerender(<JaneteSimbolo estado={estado} />);
      const depois = screen.getByRole("img");
      expect(depois).toBe(antes);
      expect(depois).toHaveAttribute("data-estado", estado);
    }
  });

  it("marca o digitando só no estado fala", () => {
    const { rerender } = render(<JaneteSimbolo estado="fala" digitando />);
    expect(screen.getByRole("img", { name: "Janete, digitando" })).toHaveAttribute("data-digitando");

    rerender(<JaneteSimbolo estado="acordada" digitando />);
    expect(screen.getByRole("img", { name: "Janete" })).not.toHaveAttribute("data-digitando");
  });

  it("aceita rótulo próprio e vira decoração quando o nome já está escrito ao lado", () => {
    const { rerender } = render(<JaneteSimbolo estado="carregando" rotulo="Testando a chave" />);
    expect(screen.getByRole("img", { name: "Testando a chave" })).toBeInTheDocument();

    rerender(<JaneteSimbolo estado="acordada" decorativo data-testid="janete" />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByTestId("janete")).toHaveAttribute("aria-hidden", "true");
  });

  it("rótulo vazio cai no nome do estado, sem imagem sem nome", () => {
    render(<JaneteSimbolo estado="carregando" rotulo="" />);
    expect(screen.getByRole("img", { name: "Janete, carregando" })).toBeInTheDocument();
  });

  it("usa 40px quando não recebe tamanho", () => {
    render(<JaneteSimbolo />);
    expect(screen.getByRole("img")).toHaveStyle({ width: "40px", height: "40px" });
  });

  it("o CSS cobre os 5 estados e o movimento reduzido", () => {
    for (const estado of ESTADOS_JANETE) {
      expect(cssJanete).toContain(`[data-estado='${estado}']`);
    }
    expect(cssJanete).toContain("@media (prefers-reduced-motion: reduce)");
    for (const quadro of ["respira", "carrega", "pop", "pula"]) {
      expect(cssJanete).toContain(`@keyframes ${quadro} `);
    }
  });

  it("com movimento reduzido, o carregando tem um sinal parado diferente do acordada", () => {
    const reduzido = cssJanete.slice(cssJanete.indexOf("@media (prefers-reduced-motion: reduce)"));
    const regra = /\.janete\[data-estado='carregando'\] \.brilho \{([^}]*)\}/.exec(reduzido);
    expect(regra).not.toBeNull();
    expect(regra![1]).toContain("animation: none");
    expect(regra![1]).toContain("transform: rotate(45deg) scale(0.86)");
  });
});
