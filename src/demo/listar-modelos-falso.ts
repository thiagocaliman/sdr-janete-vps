// "listar-modelos.functions" na demo: a lista curada do app, sem chamar o provedor.
import { MODELOS } from "@/features/ia/modelos";
import type { EntradaListarModelos, ResultadoListarModelos } from "@/features/servidor/listar-modelos";

export type { EntradaListarModelos, ModeloListado, ResultadoListarModelos } from "@/features/servidor/listar-modelos";
export type { SemAcessoServidor } from "@/features/servidor/membro";

export async function listarModelos({ data }: { data: EntradaListarModelos }): Promise<ResultadoListarModelos> {
  await new Promise((r) => setTimeout(r, 600));
  const modelos = MODELOS.filter((m) => m.provedor === data.provedor).map((m) => ({
    id: m.id,
    nome: m.nome,
    perfil: m.perfil,
    precoEntrada: m.precoEntrada,
    precoSaida: m.precoSaida,
    recomendado: m.recomendado,
  }));
  return { ok: true, modelos, origem: "provedor" };
}
