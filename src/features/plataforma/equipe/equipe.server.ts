// Lógica das funções de servidor da Equipe (spec de ligar as telas ao banco, 2.4, segundo bloco):
// convidar, copiar o link, reenviar, cancelar e aceitar o convite. As funções (createServerFn) ficam
// em equipe.functions.ts, que carrega este arquivo por import() dentro do handler.
//
// - O papel é conferido com o cliente do próprio usuário (eh_admin(), pelo membroAdmin da plataforma).
// - O supabaseAdmin (chave de serviço, ignora RLS) entra por import() dentro de cada função, depois da
//   conferência: `convites` só o servidor grava, e `membros` não tem insert para o authenticated.
// - Nunca lança: toda falha vira { ok: false, erro } com um código fixo, sem dado pessoal.
//
// Segurança do convite: só aceita quem entrou por um link (ou código) mandado ao e-mail do convite,
// nunca só com a senha (`entrouPorLinkDoEmail`, pelo `amr` do token). Dois casos:
// - a conta que o próprio convite criou (`convites.user_id`, gravado pelo inviteUserByEmail ou pelo
//   generateLink do tipo invite): o aceitarConvite acha o convite por essa conta;
// - a conta que já existia com o e-mail, criada sem convite (decisão 1 da seção 5 da spec, 02/11): o
//   convite fica sem conta presa e vai o link de acesso dessa conta; o aceitarConvite acha o convite
//   pelo e-mail da sessão. Quem criou essa conta sabe a senha antiga, por isso o link é a única entrada
//   aceita, a página /convite troca a senha antes de aceitar, e o aceitar encerra as outras sessões
//   dessa conta (admin.signOut "others") antes de criar o membro. Limite: o token de acesso que outra
//   sessão já tinha em mãos vale até vencer (até 1 h) para ler e gravar pelo banco.
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

import { ehUuid, membroAdmin, type ContextoUsuario } from "../dados/servidor.server";
import { entrouPorLinkDoEmail, type ClaimsSessao } from "./entrada";

export { entrouPorLinkDoEmail, type ClaimsSessao };

type ClienteAdmin = SupabaseClient<Database>;
type Papel = Database["public"]["Enums"]["papel_membro"];

export type { ContextoUsuario };

/** O contexto das funções que mandam link: o endereço do app (origem do pedido) para o redirectTo. */
export type ContextoComOrigem = ContextoUsuario & { origem: string };

/**
 * O contexto do aceitarConvite: o usuário, as claims do token (o e-mail e o jeito de entrar) e o
 * próprio token, para encerrar as outras sessões da conta que já existia (admin.signOut "others").
 */
export type ContextoAceitar = ContextoUsuario & {
  claims?: ClaimsSessao | null | undefined;
  token?: string | null | undefined;
};

export type SemAcesso = { ok: false; erro: "sem_acesso" };
export type NaoEncontrado = { ok: false; erro: "nao_encontrado" };
/** mensagem: só o código do que falhou (ex.: "convite_nao_gravado"), nunca dado do banco. */
export type Falha = { ok: false; erro: "falha"; mensagem: string };
/**
 * O e-mail já é de alguém: um membro, outro convite, ou outra conta do Auth no lugar da conta que o
 * convite criou (ela foi apagada e outra nasceu com o mesmo e-mail).
 * mensagem: "membro" | "convite" | "conta" (a tela escolhe o texto).
 */
export type EmailEmUso = { ok: false; erro: "email_em_uso"; mensagem: "membro" | "convite" | "conta" };

/** O convite foi gravado, mas o e-mail do Supabase não saiu: o admin usa "Copiar link". */
export type AvisoEmail = "email_nao_enviado";

export type ResultadoConvidar =
  | { ok: true; conviteId: string; aviso?: AvisoEmail }
  | SemAcesso
  | { ok: false; erro: "email_invalido" }
  | { ok: false; erro: "proprio_membro" }
  | EmailEmUso
  | Falha;

export type ResultadoLinkDoConvite = { ok: true; link: string } | SemAcesso | NaoEncontrado | EmailEmUso | Falha;
export type ResultadoReenviar = { ok: true; aviso?: AvisoEmail } | SemAcesso | NaoEncontrado | EmailEmUso | Falha;
export type ResultadoCancelar = { ok: true } | SemAcesso | NaoEncontrado | Falha;
/**
 * nao_encontrado: a sessão não tem convite (cancelado, ou ninguém convidou este e-mail);
 * sem_acesso: a conta já é membro, mas está desativada;
 * link_necessario: há convite, mas a sessão entrou só com a senha (precisa abrir o link do e-mail).
 */
export type ResultadoAceitar =
  | { ok: true; membroId: string }
  | SemAcesso
  | NaoEncontrado
  | { ok: false; erro: "nome_vazio" }
  | { ok: false; erro: "link_necessario" }
  | EmailEmUso
  | Falha;

export type EntradaConvidar = { email: string; papel: Papel };
export type EntradaConvite = { conviteId: string };
export type EntradaAceitar = { nome: string };

const SEM_ACESSO: SemAcesso = { ok: false, erro: "sem_acesso" };
const NAO_ENCONTRADO: NaoEncontrado = { ok: false, erro: "nao_encontrado" };

function falha(codigo: string): Falha {
  return { ok: false, erro: "falha", mensagem: codigo };
}

function emUso(mensagem: EmailEmUso["mensagem"]): EmailEmUso {
  return { ok: false, erro: "email_em_uso", mensagem };
}

/** O formato mínimo de um e-mail (x@y.zz), o mesmo da tela (equipe/dados.ts). */
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** O tamanho máximo de um e-mail (RFC 5321). */
export const MAX_EMAIL = 254;
/** O tamanho máximo do nome de quem entra pelo convite. */
export const MAX_NOME = 80;

/** O caminho da página que recebe o link do convite (src/routes/_conta/convite.tsx). */
export const CAMINHO_CONVITE = "/convite";

/** O e-mail como `membros.email` e `convites.email` guardam (aparado e minúsculo); null = inválido. */
export function normalizarEmail(email: string): string | null {
  const limpo = email.trim().toLowerCase();
  if (!limpo || limpo.length > MAX_EMAIL || !RE_EMAIL.test(limpo)) return null;
  return limpo;
}

/** O redirectTo dos links: a origem do app + /convite. A origem que não for http(s) cai em falha. */
export function enderecoDoConvite(origem: string): string | null {
  try {
    const url = new URL(origem);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return `${url.origin}${CAMINHO_CONVITE}`;
  } catch {
    return null;
  }
}

/**
 * O link que vai para a pessoa: a página /convite com o token_hash, e não o action_link do Supabase.
 * O action_link é de uso único e se gasta no primeiro GET, e o robô de prévia do WhatsApp (e de outros
 * apps e antivírus de e-mail) abre o link antes da pessoa. Na página, o código só é usado quando a
 * pessoa clica em "Abrir convite" (verifyOtp). Sem o hashed_token, fica o action_link.
 */
export function linkDoConviteSeguro(
  redirectTo: string,
  propriedades: { action_link?: string; hashed_token?: string; verification_type?: string } | null | undefined,
): string | null {
  const hash = propriedades?.hashed_token;
  const tipo = propriedades?.verification_type;
  if (hash && (tipo === "invite" || tipo === "magiclink")) {
    const url = new URL(redirectTo);
    url.searchParams.set("token_hash", hash);
    url.searchParams.set("type", tipo);
    return url.toString();
  }
  return propriedades?.action_link ?? null;
}

async function clienteAdmin(): Promise<ClienteAdmin> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

type ErroAuth = { code?: string | undefined; status?: number | undefined; message?: string | undefined } | null | undefined;

/** O Auth recusou porque já existe uma conta (confirmada) com esse e-mail. */
export function contaJaExiste(erro: ErroAuth): boolean {
  if (!erro) return false;
  if (erro.code === "email_exists" || erro.code === "user_already_exists") return true;
  return /already (been )?registered|already exists/i.test(erro.message ?? "");
}

/** O e-mail da sessão (claim `email`), como `convites.email` guarda; null quando falta ou não vale. */
function emailDaSessao(claims: ClaimsSessao | null | undefined): string | null {
  return typeof claims?.email === "string" ? normalizarEmail(claims.email) : null;
}

/** Grava a auditoria (melhor esforço: a ação já aconteceu). A falha fica no log só com o código. */
async function auditar(
  admin: ClienteAdmin,
  linha: Database["public"]["Tables"]["auditoria"]["Insert"],
): Promise<void> {
  try {
    const r = await admin.from("auditoria").insert(linha).select("id");
    if (r.error || !r.data || r.data.length !== 1) console.error("auditoria_falhou", linha.acao);
  } catch {
    console.error("auditoria_falhou", linha.acao);
  }
}

type LinhaConvite = { id: string; email: string; papel: Papel; user_id: string | null; convidado_por: string | null };

async function lerConvite(admin: ClienteAdmin, conviteId: string): Promise<LinhaConvite | null | "erro"> {
  const r = await admin
    .from("convites")
    .select("id, email, papel, user_id, convidado_por")
    .eq("id", conviteId)
    .maybeSingle();
  if (r.error) return "erro";
  return r.data ?? null;
}

/**
 * O convite de quem já entrou (o aceitarConvite criou o membro e não conseguiu apagar o convite):
 * apaga o convite e devolve true. Sem esta conferência, o "Copiar link" geraria um magiclink da conta
 * de um membro, e o admin entraria como essa pessoa. "erro" = não deu para ler `membros`.
 */
async function conviteDeQuemJaEntrou(admin: ClienteAdmin, convite: LinhaConvite): Promise<boolean | "erro"> {
  if (!convite.user_id) return false;
  const membro = await admin.from("membros").select("id").eq("user_id", convite.user_id).maybeSingle();
  if (membro.error) return "erro";
  if (!membro.data) return false;
  const apagado = await admin.from("convites").delete().eq("id", convite.id).select("id");
  if (apagado.error) console.error("convite_nao_apagado");
  return true;
}

// ---------- convidarMembro (admin) ----------

/**
 * Grava o convite e manda o e-mail do Supabase (inviteUserByEmail, com redirectTo = origem +
 * /convite). O e-mail que já é de um membro ou de outro convite dá email_em_uso; o seu próprio,
 * proprio_membro. O e-mail que já tem conta no Auth (criada sem convite) recebe o link de acesso dessa
 * conta (signInWithOtp, sem criar conta), e o convite fica sem conta presa (ver o topo do arquivo).
 * Se o e-mail não sai, o convite fica e volta o aviso email_nao_enviado (o admin usa "Copiar link").
 */
export async function convidarMembroLogica(ctx: ContextoComOrigem, entrada: EntradaConvidar): Promise<ResultadoConvidar> {
  try {
    const ator = await membroAdmin(ctx);
    if (!ator) return SEM_ACESSO;
    const email = normalizarEmail(entrada.email);
    if (!email) return { ok: false, erro: "email_invalido" };
    const redirectTo = enderecoDoConvite(ctx.origem);
    if (!redirectTo) return falha("origem_invalida");
    const admin = await clienteAdmin();

    const membro = await admin.from("membros").select("id").eq("email", email).maybeSingle();
    if (membro.error) return falha("membros_nao_lidos");
    if (membro.data) return membro.data.id === ator ? { ok: false, erro: "proprio_membro" } : emUso("membro");

    const existente = await admin.from("convites").select("id").eq("email", email).maybeSingle();
    if (existente.error) return falha("convites_nao_lidos");
    if (existente.data) return emUso("convite");

    const gravado = await admin
      .from("convites")
      .insert({ email, papel: entrada.papel, convidado_por: ator })
      .select("id")
      .single();
    if (gravado.error) {
      // outro admin convidou o mesmo e-mail ao mesmo tempo (convites.email é unique)
      if ((gravado.error as { code?: string }).code === "23505") return emUso("convite");
      return falha("convite_nao_gravado");
    }
    const conviteId = gravado.data.id;

    let aviso: AvisoEmail | undefined;
    let contaExistente = false;
    const enviado = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });
    if (enviado.error) {
      if (contaJaExiste(enviado.error)) {
        // A conta criada sem convite: vai o link de acesso dela, e o convite fica sem conta presa.
        contaExistente = true;
        const otp = await admin.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: redirectTo, shouldCreateUser: false },
        });
        if (otp.error) {
          aviso = "email_nao_enviado";
          console.error("convite_email_falhou", otp.error.status ?? "");
        }
      } else {
        aviso = "email_nao_enviado";
        console.error("convite_email_falhou", enviado.error.status ?? "");
      }
    } else if (enviado.data.user?.id) {
      const preso = await admin.from("convites").update({ user_id: enviado.data.user.id }).eq("id", conviteId).select("id");
      if (preso.error || !preso.data?.length) console.error("convite_user_id_nao_gravado");
    }

    await auditar(admin, {
      acao: "membro_convidado",
      alvo: conviteId,
      ator_membro_id: ator,
      detalhe: {
        email,
        papel: entrada.papel,
        ...(aviso ? { email_enviado: false } : {}),
        ...(contaExistente ? { conta_existente: true } : {}),
      },
    });
    return aviso ? { ok: true, conviteId, aviso } : { ok: true, conviteId };
  } catch {
    return falha("convite_nao_gravado");
  }
}

// ---------- linkDoConvite (admin) ----------

/**
 * O magiclink da conta que já existia com o e-mail do convite (criada sem convite). O convite segue sem
 * conta presa: o aceitarConvite acha pelo e-mail e só aceita a sessão que veio de um link do e-mail. A
 * conta que já é membro (com outro e-mail na equipe; o mesmo e-mail sai antes, no
 * `conviteSoltoDeQuemJaEntrou`) não recebe link, porque o admin entraria como ela: o convite que sobrou
 * é apagado, como no `conviteDeQuemJaEntrou`.
 */
async function linkDaContaQueJaExistia(
  admin: ClienteAdmin,
  convite: LinhaConvite,
  redirectTo: string,
): Promise<ResultadoLinkDoConvite> {
  const r = await admin.auth.admin.generateLink({ type: "magiclink", email: convite.email, options: { redirectTo } });
  if (r.error) return falha("link_nao_gerado");
  const userId = r.data.user?.id;
  const link = linkDoConviteSeguro(redirectTo, r.data.properties);
  if (!userId || !link) return falha("link_nao_gerado");
  const membro = await admin.from("membros").select("id").eq("user_id", userId).maybeSingle();
  if (membro.error) return falha("membros_nao_lidos");
  if (membro.data) {
    const apagado = await admin.from("convites").delete().eq("id", convite.id).select("id");
    if (apagado.error) console.error("convite_nao_apagado");
    return NAO_ENCONTRADO;
  }
  return { ok: true, link };
}

/**
 * O convite sem conta presa de quem já entrou (o aceitarConvite criou o membro pelo e-mail e não
 * conseguiu apagar o convite): apaga o convite e devolve true. "erro" = não deu para ler `membros`.
 */
async function conviteSoltoDeQuemJaEntrou(admin: ClienteAdmin, convite: LinhaConvite): Promise<boolean | "erro"> {
  const membro = await admin.from("membros").select("id").eq("email", convite.email).maybeSingle();
  if (membro.error) return "erro";
  if (!membro.data) return false;
  const apagado = await admin.from("convites").delete().eq("id", convite.id).select("id");
  if (apagado.error) console.error("convite_nao_apagado");
  return true;
}

/**
 * O link do "Copiar link" (decisão 1), sem mandar e-mail: generateLink do tipo magiclink para o
 * usuário que o convite criou, com o mesmo redirectTo. Se o convite ainda não tem usuário (o e-mail
 * do convite falhou antes de criar), o tipo invite cria e prende o usuário ao convite; se o e-mail já
 * tem conta (criada sem convite), vai o magiclink dessa conta, sem prender (`linkDaContaQueJaExistia`).
 */
export async function linkDoConviteLogica(ctx: ContextoComOrigem, entrada: EntradaConvite): Promise<ResultadoLinkDoConvite> {
  try {
    const ator = await membroAdmin(ctx);
    if (!ator) return SEM_ACESSO;
    if (!ehUuid(entrada.conviteId)) return NAO_ENCONTRADO;
    const redirectTo = enderecoDoConvite(ctx.origem);
    if (!redirectTo) return falha("origem_invalida");
    const admin = await clienteAdmin();

    const convite = await lerConvite(admin, entrada.conviteId);
    if (convite === "erro") return falha("convite_nao_lido");
    if (!convite) return NAO_ENCONTRADO;
    const jaEntrou = await conviteDeQuemJaEntrou(admin, convite);
    if (jaEntrou === "erro") return falha("membros_nao_lidos");
    if (jaEntrou) return NAO_ENCONTRADO;

    if (convite.user_id) {
      const r = await admin.auth.admin.generateLink({ type: "magiclink", email: convite.email, options: { redirectTo } });
      if (r.error) return falha("link_nao_gerado");
      // O e-mail mudou de dono (a conta do convite foi apagada e outra nasceu com o mesmo e-mail).
      if (r.data.user?.id !== convite.user_id) return emUso("conta");
      const link = linkDoConviteSeguro(redirectTo, r.data.properties);
      return link ? { ok: true, link } : falha("link_nao_gerado");
    }

    // O convite sem conta presa de quem já entrou pelo e-mail: sai antes de gerar qualquer link (o
    // magiclink trocaria o token de acesso da conta do membro).
    const soltoJaEntrou = await conviteSoltoDeQuemJaEntrou(admin, convite);
    if (soltoJaEntrou === "erro") return falha("membros_nao_lidos");
    if (soltoJaEntrou) return NAO_ENCONTRADO;

    const r = await admin.auth.admin.generateLink({ type: "invite", email: convite.email, options: { redirectTo } });
    if (r.error) {
      if (!contaJaExiste(r.error)) return falha("link_nao_gerado");
      return await linkDaContaQueJaExistia(admin, convite, redirectTo);
    }
    const link = linkDoConviteSeguro(redirectTo, r.data.properties);
    const userId = r.data.user?.id;
    if (!link || !userId) return falha("link_nao_gerado");
    const preso = await admin.from("convites").update({ user_id: userId }).eq("id", convite.id).select("id");
    // Sem o usuário preso ao convite, o link não serviria (o aceitar confere o user_id).
    if (preso.error || !preso.data?.length) return falha("convite_nao_gravado");
    return { ok: true, link };
  } catch {
    return falha("link_nao_gerado");
  }
}

// ---------- reenviarConvite (admin) ----------

/**
 * Manda um link novo (decisão 15): o inviteUserByEmail de novo (o Auth reenvia para a conta
 * convidada que ainda não confirmou). A conta que já existe recebe um link de entrada (signInWithOtp,
 * sem criar conta): a do convite que já abriu um link e não terminou, ou a conta criada sem convite
 * (o convite sem conta presa). Deu certo: grava enviado_em = agora e a auditoria convite_reenviado.
 * O e-mail que não sai volta como aviso, e o enviado_em fica.
 */
export async function reenviarConviteLogica(ctx: ContextoComOrigem, entrada: EntradaConvite): Promise<ResultadoReenviar> {
  try {
    const ator = await membroAdmin(ctx);
    if (!ator) return SEM_ACESSO;
    if (!ehUuid(entrada.conviteId)) return NAO_ENCONTRADO;
    const redirectTo = enderecoDoConvite(ctx.origem);
    if (!redirectTo) return falha("origem_invalida");
    const admin = await clienteAdmin();

    const convite = await lerConvite(admin, entrada.conviteId);
    if (convite === "erro") return falha("convite_nao_lido");
    if (!convite) return NAO_ENCONTRADO;
    // quem já entrou não recebe link de entrada (seria o link da conta de um membro)
    const jaEntrou = await conviteDeQuemJaEntrou(admin, convite);
    if (jaEntrou === "erro") return falha("membros_nao_lidos");
    if (jaEntrou) return NAO_ENCONTRADO;

    let enviou = false;
    const r = await admin.auth.admin.inviteUserByEmail(convite.email, { redirectTo });
    if (!r.error) {
      enviou = true;
      const userId = r.data.user?.id;
      if (userId && !convite.user_id) {
        const preso = await admin.from("convites").update({ user_id: userId }).eq("id", convite.id).select("id");
        if (preso.error || !preso.data?.length) console.error("convite_user_id_nao_gravado");
      } else if (userId && convite.user_id && userId !== convite.user_id) {
        return emUso("conta");
      }
    } else if (contaJaExiste(r.error)) {
      if (convite.user_id) {
        // A conta presa ao convite foi trocada por outra com o mesmo e-mail: o link iria para uma conta
        // que o aceitar não acha (o "Copiar link" responde do mesmo jeito).
        const dono = await admin.auth.admin.getUserById(convite.user_id);
        if (dono.error) return dono.error.status === 404 ? emUso("conta") : falha("convite_nao_reenviado");
        if (normalizarEmail(dono.data.user?.email ?? "") !== convite.email) return emUso("conta");
      } else {
        // a pessoa já entrou pelo e-mail e o convite sobrou: não manda link de entrada a um membro
        const jaEntrou = await conviteSoltoDeQuemJaEntrou(admin, convite);
        if (jaEntrou === "erro") return falha("membros_nao_lidos");
        if (jaEntrou) return NAO_ENCONTRADO;
      }
      // O link vai para o e-mail, que é de quem o convite chama; o aceitar confere o resto.
      const otp = await admin.auth.signInWithOtp({
        email: convite.email,
        options: { emailRedirectTo: redirectTo, shouldCreateUser: false },
      });
      enviou = !otp.error;
      if (otp.error) console.error("convite_email_falhou", otp.error.status ?? "");
    } else {
      console.error("convite_email_falhou", r.error.status ?? "");
    }

    if (!enviou) return { ok: true, aviso: "email_nao_enviado" };

    const marcado = await admin
      .from("convites")
      .update({ enviado_em: new Date().toISOString() })
      .eq("id", convite.id)
      .select("id");
    if (marcado.error) return falha("convite_nao_gravado");
    // 0 linhas: o convite foi cancelado ou aceito entre a leitura e agora
    if (!marcado.data?.length) return NAO_ENCONTRADO;

    await auditar(admin, { acao: "convite_reenviado", alvo: convite.id, ator_membro_id: ator, detalhe: { email: convite.email } });
    return { ok: true };
  } catch {
    return falha("convite_nao_reenviado");
  }
}

// ---------- cancelarConvite (admin) ----------

/**
 * Apaga o convite e a conta do Auth que ele criou, se ela ainda não virou membro (o link do e-mail
 * deixa de funcionar). A conta que já existia (o convite sem conta presa) nunca é apagada. Grava a
 * auditoria convite_cancelado.
 */
export async function cancelarConviteLogica(ctx: ContextoUsuario, entrada: EntradaConvite): Promise<ResultadoCancelar> {
  try {
    const ator = await membroAdmin(ctx);
    if (!ator) return SEM_ACESSO;
    if (!ehUuid(entrada.conviteId)) return NAO_ENCONTRADO;
    const admin = await clienteAdmin();

    const convite = await lerConvite(admin, entrada.conviteId);
    if (convite === "erro") return falha("convite_nao_lido");
    if (!convite) return NAO_ENCONTRADO;

    const apagado = await admin.from("convites").delete().eq("id", convite.id).select("id");
    if (apagado.error) return falha("convite_nao_apagado");
    if (!apagado.data?.length) return NAO_ENCONTRADO;

    if (convite.user_id) {
      const membro = await admin.from("membros").select("id").eq("user_id", convite.user_id).maybeSingle();
      if (membro.error) {
        console.error("conta_do_convite_nao_conferida");
      } else if (!membro.data) {
        const r = await admin.auth.admin.deleteUser(convite.user_id);
        if (r.error) console.error("conta_do_convite_nao_apagada", r.error.status ?? "");
      }
    }

    await auditar(admin, { acao: "convite_cancelado", alvo: convite.id, ator_membro_id: ator, detalhe: { email: convite.email } });
    return { ok: true };
  } catch {
    return falha("convite_nao_apagado");
  }
}

// ---------- aceitarConvite (sessão do convidado) ----------

/** O nome como `membros.nome` guarda: aparado, com os espaços juntados; null = vazio. */
export function limparNome(nome: string): string | null {
  const limpo = nome.replace(/\s+/g, " ").trim().slice(0, MAX_NOME).trim();
  return limpo || null;
}

async function membroDaConta(admin: ClienteAdmin, userId: string) {
  return admin.from("membros").select("id, ativo").eq("user_id", userId).maybeSingle();
}

type ConviteDaSessao = { linha: LinhaConvite; contaExistente: boolean };

/**
 * O convite de quem está aceitando: o preso à conta da sessão (a conta que o convite criou) ou, sem
 * ele, o convite sem conta presa com o e-mail da sessão (a conta já existia). "erro" = não deu para
 * ler `convites`.
 */
async function conviteDaSessao(admin: ClienteAdmin, ctx: ContextoAceitar): Promise<ConviteDaSessao | null | "erro"> {
  const preso = await admin
    .from("convites")
    .select("id, email, papel, user_id, convidado_por")
    .eq("user_id", ctx.userId)
    .maybeSingle();
  if (preso.error) return "erro";
  if (preso.data) return { linha: preso.data, contaExistente: false };

  const email = emailDaSessao(ctx.claims);
  if (!email) return null;
  const solto = await admin
    .from("convites")
    .select("id, email, papel, user_id, convidado_por")
    .eq("email", email)
    .is("user_id", null)
    .maybeSingle();
  if (solto.error) return "erro";
  return solto.data ? { linha: solto.data, contaExistente: true } : null;
}

/**
 * Quem abriu o link do convite e criou a senha entra na equipe: cria a linha em `membros` com o papel
 * do convite, apaga o convite e grava a auditoria membro_entrou. Chamar de novo depois de entrar
 * devolve o mesmo membro (sem efeito). A sessão que entrou só com a senha não aceita
 * (link_necessario): ver o topo do arquivo.
 */
export async function aceitarConviteLogica(ctx: ContextoAceitar, entrada: EntradaAceitar): Promise<ResultadoAceitar> {
  try {
    const nome = limparNome(entrada.nome);
    if (!nome) return { ok: false, erro: "nome_vazio" };
    if (!ehUuid(ctx.userId)) return SEM_ACESSO;
    const admin = await clienteAdmin();

    const ja = await membroDaConta(admin, ctx.userId);
    if (ja.error) return falha("membros_nao_lidos");

    const convite = await conviteDaSessao(admin, ctx);
    if (convite === "erro") return falha("convite_nao_lido");

    if (ja.data) {
      if (!ja.data.ativo) return SEM_ACESSO;
      if (convite) await admin.from("convites").delete().eq("id", convite.linha.id);
      return { ok: true, membroId: ja.data.id };
    }
    if (!convite) return NAO_ENCONTRADO;
    if (!entrouPorLinkDoEmail(ctx.claims)) return { ok: false, erro: "link_necessario" };
    const c = convite.linha;

    // A conta que já existia: quem a criou pode ter uma sessão aberta. Encerra as outras sessões desta
    // conta antes de ela virar membro (a página já trocou a senha); sem conseguir, não aceita.
    if (convite.contaExistente) {
      if (!ctx.token) return falha("sessoes_nao_encerradas");
      const saida = await admin.auth.admin.signOut(ctx.token, "others");
      if (saida.error) return falha("sessoes_nao_encerradas");
    }

    const criado = await admin
      .from("membros")
      .insert({ user_id: ctx.userId, nome, email: c.email, papel: c.papel, convidado_por: c.convidado_por })
      .select("id")
      .single();
    if (criado.error) {
      if ((criado.error as { code?: string }).code !== "23505") return falha("membro_nao_criado");
      // Dois cliques ao mesmo tempo: o outro já criou. Senão, o e-mail é de outro membro.
      const outro = await membroDaConta(admin, ctx.userId);
      if (outro.data?.ativo) {
        await admin.from("convites").delete().eq("id", c.id);
        return { ok: true, membroId: outro.data.id };
      }
      return emUso("membro");
    }
    const membroId = criado.data.id;

    const apagado = await admin.from("convites").delete().eq("id", c.id).select("id");
    if (apagado.error) console.error("convite_nao_apagado");

    await auditar(admin, {
      acao: "membro_entrou",
      alvo: membroId,
      ator_membro_id: membroId,
      detalhe: { nome, papel: c.papel, ...(convite.contaExistente ? { conta_existente: true } : {}) },
    });
    return { ok: true, membroId };
  } catch {
    return falha("membro_nao_criado");
  }
}
