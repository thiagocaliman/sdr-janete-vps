// Registro dos adaptadores. Cada workflow de gateway só mexe na própria pasta; este arquivo
// não muda (spec da mensageria, "Contratos").
//
// Exceção da cópia na VPS (PUBLICAR-JANETE-VPS.md, item 7): todo adaptador passa pela trava de
// saída. Sem JANETE_ENVIO_LIBERADO=sim no ambiente do servidor, nenhum envio, "lido" ou
// "digitando" chega ao gateway, e o webhook do gateway não é apontado nem desligado sem
// JANETE_WEBHOOK_LIBERADO=sim. O navegador não tem como mudar isso.
import { ErroGateway, type AdaptadorGateway, type GatewayId } from "../nucleo/tipos";
import { adaptadorEvolution } from "./evolution";
import { adaptadorMeta } from "./meta";
import { adaptadorZapi } from "./zapi";
import { adaptadorZernio } from "./zernio";

const ORIGINAIS: Record<GatewayId, AdaptadorGateway> = {
  meta: adaptadorMeta,
  zernio: adaptadorZernio,
  zapi: adaptadorZapi,
  evolution: adaptadorEvolution,
};

/** Lido a cada chamada: trocar a variável e reiniciar o processo basta. */
export function envioLiberado(): boolean {
  return process.env["JANETE_ENVIO_LIBERADO"] === "sim";
}

export function webhookLiberado(): boolean {
  return process.env["JANETE_WEBHOOK_LIBERADO"] === "sim";
}

export function comTravaDeSaida(a: AdaptadorGateway): AdaptadorGateway {
  const travado: AdaptadorGateway = {
    ...a,
    async enviar(p, c, opcoes) {
      // definitivo: o ciclo marca a mensagem como falha, nunca como entregue
      if (!envioLiberado()) throw new ErroGateway("envio_bloqueado", true);
      return a.enviar(p, c, opcoes);
    },
    async marcarLidaEDigitando(p, c) {
      if (!envioLiberado()) return;
      return a.marcarLidaEDigitando(p, c);
    },
  };
  if (a.marcarLida) {
    const marcarLida = a.marcarLida.bind(a);
    travado.marcarLida = async (ref, c, opcoes) => (envioLiberado() ? marcarLida(ref, c, opcoes) : false);
  }
  if (a.configurarWebhook) {
    const configurar = a.configurarWebhook.bind(a);
    travado.configurarWebhook = async (c, url) => {
      if (!webhookLiberado()) throw new ErroGateway("webhook_bloqueado", true);
      return configurar(c, url);
    };
  }
  if (a.desligarWebhook) {
    const desligar = a.desligarWebhook.bind(a);
    travado.desligarWebhook = async (c) => {
      if (!webhookLiberado()) throw new ErroGateway("webhook_bloqueado", true);
      return desligar(c);
    };
  }
  return travado;
}

export const ADAPTADORES: Record<GatewayId, AdaptadorGateway> = {
  meta: comTravaDeSaida(ORIGINAIS.meta),
  zernio: comTravaDeSaida(ORIGINAIS.zernio),
  zapi: comTravaDeSaida(ORIGINAIS.zapi),
  evolution: comTravaDeSaida(ORIGINAIS.evolution),
};

export function adaptadorDe(gateway: string): AdaptadorGateway | null {
  return (ADAPTADORES as Record<string, AdaptadorGateway | undefined>)[gateway] ?? null;
}
