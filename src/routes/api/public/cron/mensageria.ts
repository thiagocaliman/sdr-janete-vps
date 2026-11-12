// Worker da mensageria (spec da mensageria, premissa "Worker" e "Resultado da prova"; e
// docs/spec-motor-acordado.md, "A rota"): chamado pelo toque do motor (o banco, com net.http_post e
// o cabeçalho x-janete-motor).
// Quem chama não espera a resposta, mas a rota segue rodando (o tempo limite fica entre 50 e 60 s).
// Por isso ela responde só depois de rodar: confere quem chamou e roda o laço de passadas com
// orçamento de 45 s (ORCAMENTO_LACO_MS, no ciclo), contado da 1ª linha do handler.
// - Com o cabeçalho x-janete-motor, a chave decide; sem ele ou com a chave errada, 401.
// - A cada chamada autenticada, grava configuracao.worker_visto_em (o sinal que a Saúde lê) e
//   prepara a instalação nova (prepararCopia), ao mesmo tempo que o laço roda, sem esperá-los
//   antes: a falha só vai para o log.
// - Depois do laço, espera fechar a janela do "recente" (esperarJanelaDoToque: o webhook que chegou
//   no fim do laço ocioso levou "recente" e contou com esta chamada), lê as pendências e pede outro
//   toque quando ainda há trabalho perto (deveRenovarToque). Devolve { ...resumo, toque } (toque: o
//   resultado do pedido, ou null quando não pediu).
// - Tudo depois do laço (a espera da janela, a leitura das pendências e o toque) termina até o
//   limite duro (inicioEm + 45 s + 5 s): a espera para 3 s antes dele (numa partida a frio, o
//   vistoEm vem segundos depois do inicioEm); com pouco tempo, a leitura das pendências é pulada e a
//   regra decide só pelo trabalho achado; o teto do toque é o que sobra, e com menos de 500 ms ele
//   não sai (toque: "sem_tempo" na resposta).
import { createFileRoute } from "@tanstack/react-router";

import { FOLGA_CORTE_MS } from "@/features/mensageria/nucleo/prazo";

/** Teto da leitura das pendências depois do laço (o laço já gastou ~45 s dos 50). */
const TETO_PENDENCIAS_MS = 2_000;
/** Com menos que isto até o limite duro, a leitura das pendências é pulada. */
const MIN_PENDENCIAS_MS = 1_500;
/** O que a leitura das pendências deixa para o toque, dentro do que sobra. */
const RESERVA_DEPOIS_PENDENCIAS_MS = 1_000;
/** O que a espera da janela deixa até o limite duro: a leitura inteira (2 s) e 1 s para o toque. */
const RESERVA_DEPOIS_ESPERA_MS = TETO_PENDENCIAS_MS + RESERVA_DEPOIS_PENDENCIAS_MS;
/** Com menos que isto até o limite duro, o toque de renovação não sai. */
const MIN_TOQUE_MS = 500;

export const Route = createFileRoute("/api/public/cron/mensageria")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // antes da autenticação e do import do ciclo, que numa partida a frio leva tempo
        const inicioEm = Date.now();
        // Cópia na VPS: o motor (que gera respostas e envia) fica parado até
        // JANETE_MOTOR_LIGADO=sim no ambiente do servidor (PUBLICAR-JANETE-VPS.md, item 7).
        if (process.env["JANETE_MOTOR_LIGADO"] !== "sim") {
          return Response.json({ motor: "pausado" }, { status: 503 });
        }
        // Só o toque do motor (o banco, com a chave do motor no cabeçalho) roda o laço.
        const chave = request.headers.get("x-janete-motor");
        if (chave === null) return new Response("Unauthorized", { status: 401 });
        const { conferirChaveDoMotor } = await import("@/features/mensageria/nucleo/motor.server");
        if (!(await conferirChaveDoMotor(chave))) {
          return new Response("Unauthorized", { status: 401 });
        }

        const [{ rodarLaco, achouTrabalho, ORCAMENTO_LACO_MS }, { marcarWorkerVisto }, motor] =
          await Promise.all([
            import("@/features/mensageria/nucleo/ciclo.server"),
            import("@/features/mensageria/nucleo/banco.server"),
            import("@/features/mensageria/nucleo/motor.server"),
          ]);
        // não espera antes do laço; marcarWorkerVisto e prepararCopia nunca lançam (a falha vai
        // para o log)
        const vistoEm = Date.now();
        const visto = marcarWorkerVisto(new Date(vistoEm)).catch(() => false);
        const preparo = motor.prepararCopia().catch(() => "falhou" as const);
        const resumo = await rodarLaco({ inicioEm });
        await Promise.all([visto, preparo]);
        // o laço ocioso acaba em ~38 s; a janela do "recente" vai até vistoEm + 40 s, mas a espera
        // nunca passa do limite duro menos a leitura e o toque
        const limite = inicioEm + ORCAMENTO_LACO_MS + FOLGA_CORTE_MS;
        await motor.esperarJanelaDoToque(vistoEm, limite - RESERVA_DEPOIS_ESPERA_MS);

        const resta = limite - Date.now();
        const pendencias =
          resta < MIN_PENDENCIAS_MS
            ? null
            : await motor.comTeto(
                motor.pendenciasDoMotor(),
                Math.min(TETO_PENDENCIAS_MS, resta - RESERVA_DEPOIS_PENDENCIAS_MS),
                null,
              );
        let toque: Awaited<ReturnType<typeof motor.acordarMotor>> | "sem_tempo" | null = null;
        if (motor.deveRenovarToque(pendencias, achouTrabalho(resumo))) {
          const restaToque = limite - Date.now();
          // sem tempo para o toque, não pede: a resposta registra (o próximo acontecimento acorda)
          toque =
            restaToque < MIN_TOQUE_MS
              ? "sem_tempo"
              : await motor.acordarMotor(null, {
                  renovar: true,
                  tetoMs: Math.min(motor.TETO_TOQUE_MS, restaToque),
                });
        }
        return Response.json({ ...resumo, toque });
      },
    },
  },
});
