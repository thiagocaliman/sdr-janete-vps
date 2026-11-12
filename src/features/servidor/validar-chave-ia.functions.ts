// Função de servidor: testa a chave de IA no provedor, sem gravar nada (onda 1).
// Uso no navegador: await validarChaveIA({ data: { provedor, chave, modelo, workspaceId } })
// Resposta: { ok: true, ultimos4 } ou { ok: false, erro, mensagem }. A chave nunca volta.
// Exige sessão do Supabase e conta de membro ativo (eh_membro; sem ele, erro sem_acesso), para a
// função não virar um repassador aberto de pedidos.
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { lerEntradaChaveIA, validarChaveIALogica, type EntradaChaveIA, type ResultadoChaveIA } from "./chave-ia";
import { exigirMembro, type SemAcessoServidor } from "./membro";

export type { EntradaChaveIA, ErroChaveIA, ProvedorIA, ResultadoChaveIA } from "./chave-ia";
export type { SemAcessoServidor } from "./membro";

export const validarChaveIA = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((entrada: EntradaChaveIA) => lerEntradaChaveIA(entrada))
  .handler(async ({ data, context }): Promise<ResultadoChaveIA | SemAcessoServidor> => {
    const recusa = await exigirMembro(context.supabase);
    if (recusa) return recusa;
    return validarChaveIALogica(data);
  });
