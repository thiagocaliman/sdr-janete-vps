// Trava de saída da cópia na VPS (PUBLICAR-JANETE-VPS.md, item 7): sem JANETE_ENVIO_LIBERADO=sim,
// nenhum gateway real recebe envio, "lido" ou "digitando"; sem JANETE_WEBHOOK_LIBERADO=sim, o
// webhook do gateway não é apontado nem desligado. Nenhuma chamada de rede sai nestes testes.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ErroGateway, type AdaptadorGateway } from "../nucleo/tipos";
import { ADAPTADORES, adaptadorDe, comTravaDeSaida } from "./index";

const conexao = {
  id: "00000000-0000-0000-0000-000000000000",
  gateway: "evolution",
  id_externo: "teste",
  parametros: { url: "https://gateway.invalid", instancia: "teste" },
  segredos: { apikey: "ficticia", token: "ficticio", token_webhook: "ficticio" },
} as never;
const pedido = {
  destino: [{ tipo: "telefone", valor: "5511999999999" }],
  tipo: "texto",
  texto: "não pode sair",
} as never;
const ref = { id_externo: "abc", destino: [{ tipo: "telefone", valor: "5511999999999" }] } as never;

let rede: ReturnType<typeof vi.fn>;

beforeEach(() => {
  rede = vi.fn(async () => new Response("{}", { status: 200 }));
  vi.stubGlobal("fetch", rede);
  vi.stubEnv("JANETE_ENVIO_LIBERADO", "");
  vi.stubEnv("JANETE_WEBHOOK_LIBERADO", "");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("trava de saída nos quatro gateways", () => {
  for (const id of Object.keys(ADAPTADORES)) {
    it(`${id}: envio recusado de forma definitiva, sem rede`, async () => {
      const a = adaptadorDe(id)!;
      const erro = await a.enviar(pedido, conexao).catch((e: unknown) => e);
      expect(erro).toBeInstanceOf(ErroGateway);
      expect((erro as ErroGateway).codigo).toBe("envio_bloqueado");
      expect((erro as ErroGateway).definitivo).toBe(true);
      expect(rede).not.toHaveBeenCalled();
    });

    it(`${id}: "lido" e "digitando" não saem`, async () => {
      const a = adaptadorDe(id)!;
      await a.marcarLidaEDigitando(ref, conexao);
      if (a.marcarLida) expect(await a.marcarLida(ref, conexao)).toBe(false);
      expect(rede).not.toHaveBeenCalled();
    });

    it(`${id}: webhook do gateway não é apontado nem desligado`, async () => {
      const a = adaptadorDe(id)!;
      if (a.configurarWebhook) {
        const erro = await a.configurarWebhook(conexao, "https://exemplo.invalid/x").catch((e: unknown) => e);
        expect((erro as ErroGateway).codigo).toBe("webhook_bloqueado");
      }
      if (a.desligarWebhook) {
        const erro = await a.desligarWebhook(conexao).catch((e: unknown) => e);
        expect((erro as ErroGateway).codigo).toBe("webhook_bloqueado");
      }
      expect(rede).not.toHaveBeenCalled();
    });
  }

  it("valor diferente de 'sim' continua travado", async () => {
    for (const valor of ["true", "1", "SIM", "yes"]) {
      vi.stubEnv("JANETE_ENVIO_LIBERADO", valor);
      const erro = await adaptadorDe("evolution")!.enviar(pedido, conexao).catch((e: unknown) => e);
      expect((erro as ErroGateway).codigo).toBe("envio_bloqueado");
    }
    expect(rede).not.toHaveBeenCalled();
  });
});

describe("liberada no servidor, a trava repassa ao adaptador", () => {
  it("chama o enviar original só com JANETE_ENVIO_LIBERADO=sim", async () => {
    const enviar = vi.fn(async () => ({ id_externo: "x" }));
    const falso = { gateway: "evolution", enviar, marcarLidaEDigitando: vi.fn() } as unknown as AdaptadorGateway;
    const travado = comTravaDeSaida(falso);
    await expect(travado.enviar(pedido, conexao)).rejects.toBeInstanceOf(ErroGateway);
    expect(enviar).not.toHaveBeenCalled();
    vi.stubEnv("JANETE_ENVIO_LIBERADO", "sim");
    await expect(travado.enviar(pedido, conexao)).resolves.toEqual({ id_externo: "x" });
    expect(enviar).toHaveBeenCalledTimes(1);
  });
});
