// Tema claro ou escuro do app. A escolha fica no navegador (localStorage), por pessoa e por
// aparelho; sem escolha, o app abre claro. O <html> recebe data-tema="escuro" e a classe "dark"
// (a dos componentes shadcn); os tokens --ap-* do modo escuro estão em styles/ai-pro.css.
import { useCallback, useSyncExternalStore } from "react";

export type Tema = "claro" | "escuro";

export const CHAVE_TEMA = "janete-tema";
const EVENTO = "janete-tema";

/** Lê a escolha guardada. Sem escolha, ou sem acesso ao localStorage: claro. */
export function lerTema(): Tema {
  try {
    return localStorage.getItem(CHAVE_TEMA) === "escuro" ? "escuro" : "claro";
  } catch {
    return "claro";
  }
}

/** Pinta o documento com o tema (não guarda a escolha). */
export function aplicarTema(tema: Tema, raiz: HTMLElement = document.documentElement): void {
  if (tema === "escuro") {
    raiz.dataset["tema"] = "escuro";
    raiz.classList.add("dark");
  } else {
    delete raiz.dataset["tema"];
    raiz.classList.remove("dark");
  }
  raiz.style.colorScheme = tema === "escuro" ? "dark" : "light";
}

/** Guarda a escolha e pinta o documento. */
export function definirTema(tema: Tema): void {
  try {
    localStorage.setItem(CHAVE_TEMA, tema);
  } catch {
    // sem localStorage (aba privada bloqueada): o tema vale só até recarregar
  }
  aplicarTema(tema);
  window.dispatchEvent(new Event(EVENTO));
}

/**
 * Roda no <head>, antes da primeira pintura, para a página não piscar clara antes de ficar
 * escura. Mesma lógica de lerTema + aplicarTema, em JavaScript puro.
 */
export const SCRIPT_TEMA = `try{if(localStorage.getItem(${JSON.stringify(CHAVE_TEMA)})==="escuro"){var r=document.documentElement;r.dataset.tema="escuro";r.classList.add("dark");r.style.colorScheme="dark"}}catch(e){}`;

function assinar(aviso: () => void): () => void {
  const aoMudar = (e: Event) => {
    if (e.type === EVENTO || (e as StorageEvent).key === CHAVE_TEMA) {
      if (e.type === "storage") aplicarTema(lerTema());
      aviso();
    }
  };
  window.addEventListener(EVENTO, aoMudar);
  // outra aba trocou o tema
  window.addEventListener("storage", aoMudar);
  return () => {
    window.removeEventListener(EVENTO, aoMudar);
    window.removeEventListener("storage", aoMudar);
  };
}

/** O tema atual e a troca. No servidor é sempre "claro". */
export function useTema(): { tema: Tema; alternar: () => void } {
  const tema = useSyncExternalStore(assinar, lerTema, () => "claro" as Tema);
  const alternar = useCallback(() => definirTema(lerTema() === "escuro" ? "claro" : "escuro"), []);
  return { tema, alternar };
}
