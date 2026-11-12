// Registra no console do navegador o erro que a tela de erro pegou. Fica num lugar só para, se um
// dia houver um serviço de monitoramento, bastar trocar aqui.
export function registrarErro(erro: unknown, contexto: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  console.error("[AI PRO Janete] erro na tela", { rota: window.location.pathname, ...contexto }, erro);
}
