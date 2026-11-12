// Modo escuro (lib/tema.ts): a escolha fica no localStorage, o <html> recebe data-tema e a
// classe "dark", e o script do <head> repete a mesma regra antes da primeira pintura.
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { CHAVE_TEMA, SCRIPT_TEMA, aplicarTema, definirTema, lerTema, useTema } from "@/lib/tema";

function limpar() {
  localStorage.clear();
  aplicarTema("claro");
}

beforeEach(limpar);
afterEach(limpar);

describe("tema", () => {
  it("sem escolha guardada, abre claro", () => {
    expect(lerTema()).toBe("claro");
    expect(document.documentElement.dataset["tema"]).toBeUndefined();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("definirTema guarda a escolha e pinta o documento", () => {
    definirTema("escuro");
    expect(localStorage.getItem(CHAVE_TEMA)).toBe("escuro");
    expect(document.documentElement.dataset["tema"]).toBe("escuro");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    definirTema("claro");
    expect(lerTema()).toBe("claro");
    expect(document.documentElement.dataset["tema"]).toBeUndefined();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("o script do <head> aplica o escuro guardado e ignora o resto", () => {
    localStorage.setItem(CHAVE_TEMA, "escuro");
    new Function(SCRIPT_TEMA)();
    expect(document.documentElement.dataset["tema"]).toBe("escuro");

    limpar();
    localStorage.setItem(CHAVE_TEMA, "roxo");
    new Function(SCRIPT_TEMA)();
    expect(document.documentElement.dataset["tema"]).toBeUndefined();
  });

  it("o botão alterna e o rótulo diz para onde vai", () => {
    function Botao() {
      const { tema, alternar } = useTema();
      return (
        <button type="button" onClick={alternar}>
          {tema === "escuro" ? "Usar o tema claro" : "Usar o tema escuro"}
        </button>
      );
    }
    render(<Botao />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Usar o tema escuro" }));
    });
    expect(screen.getByRole("button", { name: "Usar o tema claro" })).toBeTruthy();
    expect(document.documentElement.dataset["tema"]).toBe("escuro");
  });
});
