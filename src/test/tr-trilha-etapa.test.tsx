import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { posicaoNaTrilha, saiuDaEtapa, TrilhaEtapa } from "@/features/plataforma/comum/TrilhaEtapa";

// A trilha de etapa (comum/TrilhaEtapa): a conta de onde o ponto fica e o desenho que sai dela.

const etapas = [
  { id: "novo", tipo: "aberta" },
  { id: "qualificado", tipo: "aberta" },
  { id: "proposta", tipo: "aberta" },
  { id: "ganho", tipo: "ganho" },
  { id: "perdido", tipo: "perdido" },
] as const;

afterEach(cleanup);

describe("tr · trilha de etapa: a conta", () => {
  it("as paradas são as etapas abertas e a venda; o perdido não é parada", () => {
    expect(posicaoNaTrilha(etapas, "novo")).toEqual({ paradas: 4, indice: 0, tom: "andando" });
    expect(posicaoNaTrilha(etapas, "proposta")).toEqual({ paradas: 4, indice: 2, tom: "andando" });
    expect(posicaoNaTrilha(etapas, "ganho")).toEqual({ paradas: 4, indice: 3, tom: "ganho" });
  });

  it("no perdido, o ponto fica onde o lead saiu; sem saber de onde, a trilha fica sem ponto", () => {
    expect(posicaoNaTrilha(etapas, "perdido", "qualificado")).toEqual({ paradas: 4, indice: 1, tom: "perdido" });
    expect(posicaoNaTrilha(etapas, "perdido")).toEqual({ paradas: 4, indice: -1, tom: "perdido" });
    expect(posicaoNaTrilha(etapas, "perdido", "sumiu")).toEqual({ paradas: 4, indice: -1, tom: "perdido" });
  });

  it("sem etapa conhecida, ou com um funil de uma parada só, não há trilha", () => {
    expect(posicaoNaTrilha(etapas, "outra")).toBeNull();
    expect(posicaoNaTrilha(etapas, null)).toBeNull();
    expect(posicaoNaTrilha([{ id: "novo", tipo: "aberta" }], "novo")).toBeNull();
    expect(posicaoNaTrilha([], "novo")).toBeNull();
  });

  it("etapa arquivada não vira parada, e quem está nela fica sem trilha", () => {
    const comArquivada = [etapas[0], { id: "velha", tipo: "aberta", arquivada: true }, ...etapas.slice(1)] as const;
    expect(posicaoNaTrilha(comArquivada, "qualificado")).toEqual({ paradas: 4, indice: 1, tom: "andando" });
    expect(posicaoNaTrilha(comArquivada, "velha")).toBeNull();
  });

  it("de onde o lead saiu vem da mudança mais recente para a etapa atual, em qualquer ordem", () => {
    const historico = [
      { de_etapa_id: "novo", para_etapa_id: "qualificado", criado_em: "2026-10-01T10:00:00Z" },
      { de_etapa_id: "proposta", para_etapa_id: "perdido", criado_em: "2026-10-05T10:00:00Z" },
      { de_etapa_id: "qualificado", para_etapa_id: "perdido", criado_em: "2026-10-02T10:00:00Z" },
    ];
    expect(saiuDaEtapa(historico, "perdido")).toBe("proposta");
    expect(saiuDaEtapa(historico, "ganho")).toBeNull();
    expect(saiuDaEtapa(undefined, "perdido")).toBeNull();
  });
});

describe("tr · trilha de etapa: o desenho", () => {
  it("desenha uma parada por etapa, acende as já feitas e fica fora da leitura de tela", () => {
    const { container } = render(<TrilhaEtapa etapas={etapas} etapaId="qualificado" />);
    const trilha = container.querySelector<HTMLElement>("[data-trilha]")!;
    expect(trilha).toHaveAttribute("aria-hidden", "true");
    expect(trilha).toHaveAttribute("data-tom", "andando");
    expect(trilha).toHaveAttribute("data-trilha", "normal");
    expect(trilha).toHaveAttribute("data-parada", "1");
    expect(trilha.style.getPropertyValue("--tr-p")).toBe(String(1 / 3));
    expect(trilha.querySelectorAll("[data-feita]")).toHaveLength(2);
    // o fio, o trecho feito, as 4 paradas e o ponto
    expect(trilha.querySelectorAll("i")).toHaveLength(7);
  });

  it("a venda vai até o fim, em verde; o perdido marca onde parou; a pequena é a das listas", () => {
    const ganho = render(<TrilhaEtapa etapas={etapas} etapaId="ganho" tamanho="mini" />).container.querySelector("[data-trilha]")!;
    expect(ganho).toHaveAttribute("data-tom", "ganho");
    expect(ganho).toHaveAttribute("data-trilha", "mini");
    expect(ganho.querySelectorAll("[data-feita]")).toHaveLength(4);
    const perdido = render(<TrilhaEtapa etapas={etapas} etapaId="perdido" perdidoEm="novo" />).container.querySelector("[data-trilha]")!;
    expect(perdido).toHaveAttribute("data-tom", "perdido");
    expect(perdido).toHaveAttribute("data-parada", "0");
    const semSaber = render(<TrilhaEtapa etapas={etapas} etapaId="perdido" />).container.querySelector("[data-trilha]")!;
    expect(semSaber).toHaveAttribute("data-parada", "-1");
    expect(semSaber.querySelectorAll("[data-feita]")).toHaveLength(0);
    // o fio, o trecho feito e as 4 paradas: sem o ponto
    expect(semSaber.querySelectorAll("i")).toHaveLength(6);
  });

  it("sem etapa conhecida, não desenha nada", () => {
    expect(render(<TrilhaEtapa etapas={etapas} etapaId="outra" />).container).toBeEmptyDOMElement();
    expect(render(<TrilhaEtapa etapas={undefined} etapaId="novo" />).container).toBeEmptyDOMElement();
  });
});
