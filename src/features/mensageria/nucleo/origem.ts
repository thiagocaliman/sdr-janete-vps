// A origem de teste, sem nenhuma dependência: o motor (motor.server.ts) a usa no webhook, na 1ª
// requisição de cada instância e na rota do worker, e o configuracao.server a reexporta. Importar o
// configuracao.server inteiro só por ela carregaria as chaves, os gateways e a fala numa partida a
// frio.

/**
 * Origem é da máquina local (localhost ou 127.0.0.1): o gateway de WhatsApp não alcança esse
 * endereço, então ele nunca vira o endereço do webhook nem o do motor.
 */
export function ehOrigemDePrevia(origem: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(origem);
}
