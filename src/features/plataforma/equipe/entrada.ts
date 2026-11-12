// O jeito de entrar da sessão (o `amr` do token do Supabase): o aceitarConvite (equipe.server.ts)
// confere de verdade, e a página /convite (ConviteConta.tsx) só decide o que mostrar. Sem `.server`:
// vai também para o navegador e não carrega nada do servidor.

/** O que se lê do token da sessão: o e-mail e o jeito de entrar. */
export type ClaimsSessao = { email?: unknown; amr?: unknown };

/**
 * Os jeitos de entrar (o `amr` do token do Supabase) que só existem para quem abriu um link ou digitou
 * um código mandado ao e-mail da conta: "otp" (o link no fluxo implícito, que é o deste app) e, no fluxo
 * PKCE, o nome de cada tipo de link. Ficam de fora "password" (o cadastro com confirmação automática
 * também entra como "password"), "token_refresh" e "email_change".
 */
const ENTRADAS_PELO_EMAIL = new Set(["otp", "magiclink", "invite", "recovery", "email/signup"]);

/** true quando a sessão entrou por um link (ou código) do e-mail. O `amr` vem como [{ method }] ou como ["método"]. */
export function entrouPorLinkDoEmail(claims: ClaimsSessao | null | undefined): boolean {
  const amr = claims?.amr;
  if (!Array.isArray(amr)) return false;
  return amr.some((entrada: unknown) => {
    const metodo =
      typeof entrada === "string"
        ? entrada
        : entrada && typeof entrada === "object" && typeof (entrada as { method?: unknown }).method === "string"
          ? (entrada as { method: string }).method
          : null;
    return metodo !== null && ENTRADAS_PELO_EMAIL.has(metodo);
  });
}

/**
 * As claims de um token de acesso (JWT), só decodificadas, sem conferir a assinatura: serve para a tela
 * decidir o que mostrar; quem confere de verdade é o servidor. null quando o token não tem o formato.
 */
export function claimsDoToken(token: string | null | undefined): ClaimsSessao | null {
  if (!token) return null;
  const partes = token.split(".");
  if (partes.length !== 3 || !partes[1]) return null;
  try {
    const base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    const binario = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
    const bytes = Uint8Array.from(binario, (c) => c.charCodeAt(0));
    const claims: unknown = JSON.parse(new TextDecoder().decode(bytes));
    return claims && typeof claims === "object" && !Array.isArray(claims) ? (claims as ClaimsSessao) : null;
  } catch {
    return null;
  }
}
