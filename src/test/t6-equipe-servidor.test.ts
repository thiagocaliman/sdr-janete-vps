import { beforeEach, describe, expect, it, vi } from "vitest";

// Task C7 (spec de ligar as telas ao banco, 2.4, segundo bloco): a lógica das funções de servidor da
// Equipe, com um Supabase falso. O cliente do usuário responde eh_admin e a linha de membros; o
// supabaseAdmin responde por tabela e operação, e o Auth (inviteUserByEmail, generateLink,
// deleteUser, signInWithOtp) é vi.fn. Nada vai à rede nem ao banco.

type Passo = [string, ...unknown[]];
type Consulta = { tabela: string; passos: Passo[] };
type Resposta = { data: unknown; error: unknown };

const estado = vi.hoisted(() => ({ admin: null as unknown }));

vi.mock("@/integrations/supabase/client.server", () => ({
  get supabaseAdmin() {
    if (!estado.admin) throw new Error("o supabaseAdmin não devia ser usado neste caso");
    return estado.admin;
  },
}));

import {
  aceitarConviteLogica,
  cancelarConviteLogica,
  contaJaExiste,
  convidarMembroLogica,
  enderecoDoConvite,
  entrouPorLinkDoEmail,
  limparNome,
  linkDoConviteLogica,
  normalizarEmail,
  reenviarConviteLogica,
  type ContextoAceitar,
  type ContextoComOrigem,
} from "@/features/plataforma/equipe/equipe.server";

const USUARIO = "a0000000-0000-4000-8000-000000000001";
const ADMIN = "9d1c7a20-0000-4000-8000-000000000001";
const CONVITE = "c0000000-0000-4000-8000-0000000000c1";
const CONVIDADO = "b0000000-0000-4000-8000-0000000000b1";
const NOVO_MEMBRO = "9d1c7a20-0000-4000-8000-0000000000aa";
const ORIGEM = "https://janete.exemplo.app";
const REDIRECT = "https://janete.exemplo.app/convite";

function contexto(papel: { admin?: boolean } = {}): ContextoComOrigem {
  const admin = papel.admin ?? true;
  const consulta = {
    select: () => consulta,
    eq: () => consulta,
    maybeSingle: async () => ({ data: admin ? { id: ADMIN } : null, error: null }),
  };
  return {
    supabase: {
      rpc: async (nome: string) => (nome === "eh_admin" ? { data: admin, error: null } : { data: null, error: { message: "?" } }),
      from: () => consulta,
    },
    userId: USUARIO,
    origem: ORIGEM,
  } as unknown as ContextoComOrigem;
}

/** O id do que a consulta filtra (eq) e a operação (o 1º passo: select, insert, update, delete). */
const op = (c: Consulta) => c.passos[0]?.[0];
const temEq = (c: Consulta, coluna: string, valor?: unknown) =>
  c.passos.some((p) => p[0] === "eq" && p[1] === coluna && (valor === undefined || p[2] === valor));

function criarAdmin(responder: (c: Consulta) => Resposta | undefined) {
  const consultas: Consulta[] = [];
  const from = (tabela: string) => {
    const c: Consulta = { tabela, passos: [] };
    let anotado = false;
    const resposta = () => {
      if (!anotado) {
        anotado = true;
        consultas.push(c);
      }
      return responder(c) ?? { data: null, error: null };
    };
    const construtor: Record<string, unknown> = new Proxy(
      {},
      {
        get(_alvo, prop) {
          if (prop === "then") {
            const r = resposta();
            return (ok: (v: unknown) => unknown, falhou: (e: unknown) => unknown) => Promise.resolve(r).then(ok, falhou);
          }
          if (prop === "maybeSingle" || prop === "single") {
            return async () => {
              c.passos.push([String(prop)]);
              return resposta();
            };
          }
          return (...args: unknown[]) => {
            c.passos.push([String(prop), ...args]);
            return construtor;
          };
        },
      },
    );
    return construtor;
  };
  const auth = {
    admin: {
      inviteUserByEmail: vi.fn(async (_email: string, _o: unknown) => ({ data: { user: { id: CONVIDADO } }, error: null as unknown })),
      generateLink: vi.fn(async (_o: unknown) => ({
        data: { user: { id: CONVIDADO }, properties: { action_link: "https://auth.exemplo/verify?token=1" } },
        error: null as unknown,
      })),
      deleteUser: vi.fn(async (_id: string) => ({ data: {}, error: null as unknown })),
      getUserById: vi.fn(async (id: string) => ({ data: { user: { id, email: "bia@x.com" } as unknown }, error: null as unknown })),
      signOut: vi.fn(async (_jwt: string, _escopo?: string) => ({ data: null, error: null as unknown })),
    },
    signInWithOtp: vi.fn(async (_o: unknown) => ({ data: {}, error: null as unknown })),
  };
  const admin = { from, auth };
  estado.admin = admin;
  return { admin, consultas, auth };
}

const auditorias = (consultas: Consulta[]) =>
  consultas.filter((c) => c.tabela === "auditoria" && op(c) === "insert").map((c) => c.passos[0]![1]);

beforeEach(() => {
  estado.admin = null;
});

describe("ajudantes", () => {
  it("normalizarEmail: apara, minúsculo e recusa o que não tem x@y.zz", () => {
    expect(normalizarEmail("  Bia@Empresa.COM ")).toBe("bia@empresa.com");
    expect(normalizarEmail("bia@empresa")).toBeNull();
    expect(normalizarEmail("")).toBeNull();
    expect(normalizarEmail(`${"a".repeat(250)}@x.com`)).toBeNull();
  });

  it("enderecoDoConvite: origem + /convite, só http(s)", () => {
    expect(enderecoDoConvite("https://janete.exemplo.app")).toBe(REDIRECT);
    expect(enderecoDoConvite("https://janete.exemplo.app/qualquer")).toBe(REDIRECT);
    expect(enderecoDoConvite("javascript:alert(1)")).toBeNull();
    expect(enderecoDoConvite("")).toBeNull();
  });

  it("contaJaExiste reconhece o código e o texto do Auth", () => {
    expect(contaJaExiste({ code: "email_exists" })).toBe(true);
    expect(contaJaExiste({ message: "A user with this email address has already been registered" })).toBe(true);
    expect(contaJaExiste({ code: "over_email_send_rate_limit", message: "rate limit" })).toBe(false);
    expect(contaJaExiste(null)).toBe(false);
  });

  it("limparNome junta os espaços, corta em 80 e recusa vazio", () => {
    expect(limparNome("  Ana   Paula ")).toBe("Ana Paula");
    expect(limparNome("   ")).toBeNull();
    expect(limparNome("x".repeat(100))).toHaveLength(80);
  });

  it("entrouPorLinkDoEmail: só os jeitos de entrar que pedem o e-mail, nos dois formatos do amr", () => {
    const comMetodo = (...metodos: string[]) => ({ amr: metodos.map((method) => ({ method, timestamp: 1 })) });
    // o link do e-mail no fluxo implícito (o deste app) e os nomes do fluxo PKCE
    for (const metodo of ["otp", "magiclink", "invite", "recovery", "email/signup"]) {
      expect(entrouPorLinkDoEmail(comMetodo(metodo))).toBe(true);
    }
    expect(entrouPorLinkDoEmail({ amr: ["otp"] })).toBe(true);
    expect(entrouPorLinkDoEmail(comMetodo("token_refresh", "otp"))).toBe(true);
    // a senha (também a do cadastro com confirmação automática) e o resto não servem
    expect(entrouPorLinkDoEmail(comMetodo("password"))).toBe(false);
    expect(entrouPorLinkDoEmail(comMetodo("password", "token_refresh"))).toBe(false);
    expect(entrouPorLinkDoEmail(comMetodo("email_change"))).toBe(false);
    expect(entrouPorLinkDoEmail({ amr: ["password"] })).toBe(false);
    expect(entrouPorLinkDoEmail({ amr: "otp" })).toBe(false);
    expect(entrouPorLinkDoEmail({ amr: [{ metodo: "otp" }, null, 3] })).toBe(false);
    expect(entrouPorLinkDoEmail({})).toBe(false);
    expect(entrouPorLinkDoEmail(null)).toBe(false);
    expect(entrouPorLinkDoEmail(undefined)).toBe(false);
  });
});

describe("convidarMembro", () => {
  it("sem admin: sem_acesso, sem tocar no supabaseAdmin", async () => {
    expect(await convidarMembroLogica(contexto({ admin: false }), { email: "bia@x.com", papel: "atendente" })).toEqual({
      ok: false,
      erro: "sem_acesso",
    });
  });

  it("e-mail sem formato: email_invalido", async () => {
    criarAdmin(() => undefined);
    expect(await convidarMembroLogica(contexto(), { email: "bia@", papel: "atendente" })).toEqual({ ok: false, erro: "email_invalido" });
  });

  it("o próprio e-mail: proprio_membro; de outro membro: email_em_uso (membro); de outro convite: email_em_uso (convite)", async () => {
    criarAdmin((c) => (c.tabela === "membros" ? { data: { id: ADMIN }, error: null } : undefined));
    expect(await convidarMembroLogica(contexto(), { email: "eu@x.com", papel: "admin" })).toEqual({ ok: false, erro: "proprio_membro" });

    criarAdmin((c) => (c.tabela === "membros" ? { data: { id: "outro" }, error: null } : undefined));
    expect(await convidarMembroLogica(contexto(), { email: "ana@x.com", papel: "admin" })).toEqual({
      ok: false,
      erro: "email_em_uso",
      mensagem: "membro",
    });

    criarAdmin((c) => (c.tabela === "convites" && op(c) === "select" ? { data: { id: CONVITE }, error: null } : undefined));
    expect(await convidarMembroLogica(contexto(), { email: "ana@x.com", papel: "admin" })).toEqual({
      ok: false,
      erro: "email_em_uso",
      mensagem: "convite",
    });
  });

  it("grava o convite em minúsculas, manda o e-mail com redirectTo = origem + /convite, prende o usuário e audita", async () => {
    const { consultas, auth } = criarAdmin((c) => {
      if (c.tabela === "convites" && op(c) === "insert") return { data: { id: CONVITE }, error: null };
      if (c.tabela === "convites" && op(c) === "update") return { data: [{ id: CONVITE }], error: null };
      if (c.tabela === "auditoria") return { data: [{ id: 1 }], error: null };
      return undefined;
    });
    const r = await convidarMembroLogica(contexto(), { email: " Bia@Empresa.com ", papel: "atendente" });
    expect(r).toEqual({ ok: true, conviteId: CONVITE });

    const insert = consultas.find((c) => c.tabela === "convites" && op(c) === "insert")!;
    expect(insert.passos[0]![1]).toEqual({ email: "bia@empresa.com", papel: "atendente", convidado_por: ADMIN });
    expect(auth.admin.inviteUserByEmail).toHaveBeenCalledWith("bia@empresa.com", { redirectTo: REDIRECT });
    const preso = consultas.find((c) => c.tabela === "convites" && op(c) === "update")!;
    expect(preso.passos[0]![1]).toEqual({ user_id: CONVIDADO });
    expect(temEq(preso, "id", CONVITE)).toBe(true);
    expect(auditorias(consultas)).toEqual([
      { acao: "membro_convidado", alvo: CONVITE, ator_membro_id: ADMIN, detalhe: { email: "bia@empresa.com", papel: "atendente" } },
    ]);
  });

  it("o e-mail que não sai: o convite fica e volta o aviso email_nao_enviado", async () => {
    const { auth, consultas } = criarAdmin((c) =>
      c.tabela === "convites" && op(c) === "insert" ? { data: { id: CONVITE }, error: null } : undefined,
    );
    auth.admin.inviteUserByEmail.mockResolvedValueOnce({ data: { user: null } as never, error: { status: 500, message: "Error sending invite email" } });
    const r = await convidarMembroLogica(contexto(), { email: "bia@x.com", papel: "atendente" });
    expect(r).toEqual({ ok: true, conviteId: CONVITE, aviso: "email_nao_enviado" });
    expect(consultas.some((c) => c.tabela === "convites" && op(c) === "delete")).toBe(false);
  });

  it("a conta que já existe (criada sem convite): o convite fica sem conta presa e vai o link de acesso dela", async () => {
    const { auth, consultas } = criarAdmin((c) => {
      if (c.tabela === "convites" && op(c) === "insert") return { data: { id: CONVITE }, error: null };
      if (c.tabela === "auditoria") return { data: [{ id: 1 }], error: null };
      return undefined;
    });
    auth.admin.inviteUserByEmail.mockResolvedValueOnce({ data: { user: null } as never, error: { code: "email_exists", status: 422 } });
    expect(await convidarMembroLogica(contexto(), { email: "Bia@X.com", papel: "atendente" })).toEqual({ ok: true, conviteId: CONVITE });
    // o link de entrada da conta que já existe, sem criar outra
    expect(auth.signInWithOtp).toHaveBeenCalledWith({
      email: "bia@x.com",
      options: { emailRedirectTo: REDIRECT, shouldCreateUser: false },
    });
    // o convite fica (sem apagar) e sem conta presa (sem update de user_id)
    expect(consultas.some((c) => c.tabela === "convites" && op(c) === "delete")).toBe(false);
    expect(consultas.some((c) => c.tabela === "convites" && op(c) === "update")).toBe(false);
    expect(auditorias(consultas)).toEqual([
      {
        acao: "membro_convidado",
        alvo: CONVITE,
        ator_membro_id: ADMIN,
        detalhe: { email: "bia@x.com", papel: "atendente", conta_existente: true },
      },
    ]);
  });

  it("a conta que já existe e o link de acesso que não sai: o convite fica e volta o aviso email_nao_enviado", async () => {
    const { auth, consultas } = criarAdmin((c) =>
      c.tabela === "convites" && op(c) === "insert" ? { data: { id: CONVITE }, error: null } : undefined,
    );
    auth.admin.inviteUserByEmail.mockResolvedValueOnce({ data: { user: null } as never, error: { code: "email_exists", status: 422 } });
    auth.signInWithOtp.mockResolvedValueOnce({ data: {}, error: { status: 429 } });
    expect(await convidarMembroLogica(contexto(), { email: "bia@x.com", papel: "admin" })).toEqual({
      ok: true,
      conviteId: CONVITE,
      aviso: "email_nao_enviado",
    });
    expect(consultas.some((c) => c.tabela === "convites" && op(c) === "delete")).toBe(false);
    expect(auditorias(consultas)).toEqual([
      {
        acao: "membro_convidado",
        alvo: CONVITE,
        ator_membro_id: ADMIN,
        detalhe: { email: "bia@x.com", papel: "admin", email_enviado: false, conta_existente: true },
      },
    ]);
  });

  it("dois admins ao mesmo tempo: o unique de convites.email vira email_em_uso (convite)", async () => {
    criarAdmin((c) => (c.tabela === "convites" && op(c) === "insert" ? { data: null, error: { code: "23505" } } : undefined));
    expect(await convidarMembroLogica(contexto(), { email: "bia@x.com", papel: "atendente" })).toEqual({
      ok: false,
      erro: "email_em_uso",
      mensagem: "convite",
    });
  });
});

describe("linkDoConvite", () => {
  const convite = (user_id: string | null) => ({ id: CONVITE, email: "bia@x.com", papel: "atendente", user_id, convidado_por: ADMIN });

  it("convite com usuário: magiclink com o mesmo redirectTo, sem mandar e-mail", async () => {
    const { auth } = criarAdmin((c) => (c.tabela === "convites" && op(c) === "select" ? { data: convite(CONVIDADO), error: null } : undefined));
    const r = await linkDoConviteLogica(contexto(), { conviteId: CONVITE });
    expect(r).toEqual({ ok: true, link: "https://auth.exemplo/verify?token=1" });
    expect(auth.admin.generateLink).toHaveBeenCalledWith({ type: "magiclink", email: "bia@x.com", options: { redirectTo: REDIRECT } });
    expect(auth.admin.inviteUserByEmail).not.toHaveBeenCalled();
  });

  it("convite sem usuário (o e-mail falhou antes): o tipo invite cria e prende o usuário", async () => {
    const { auth, consultas } = criarAdmin((c) => {
      if (c.tabela === "convites" && op(c) === "select") return { data: convite(null), error: null };
      if (c.tabela === "convites" && op(c) === "update") return { data: [{ id: CONVITE }], error: null };
      return undefined;
    });
    expect(await linkDoConviteLogica(contexto(), { conviteId: CONVITE })).toMatchObject({ ok: true });
    expect(auth.admin.generateLink).toHaveBeenCalledWith({ type: "invite", email: "bia@x.com", options: { redirectTo: REDIRECT } });
    expect(consultas.find((c) => c.tabela === "convites" && op(c) === "update")!.passos[0]![1]).toEqual({ user_id: CONVIDADO });
  });

  it("convite sem conta presa e e-mail que já tem conta (criada sem convite): o magiclink dessa conta, sem prender", async () => {
    const { auth, consultas } = criarAdmin((c) =>
      c.tabela === "convites" && op(c) === "select" ? { data: convite(null), error: null } : undefined,
    );
    auth.admin.generateLink.mockResolvedValueOnce({ data: { user: null, properties: {} } as never, error: { code: "email_exists", status: 422 } });
    expect(await linkDoConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: true, link: "https://auth.exemplo/verify?token=1" });
    expect(auth.admin.generateLink).toHaveBeenNthCalledWith(1, { type: "invite", email: "bia@x.com", options: { redirectTo: REDIRECT } });
    expect(auth.admin.generateLink).toHaveBeenNthCalledWith(2, { type: "magiclink", email: "bia@x.com", options: { redirectTo: REDIRECT } });
    expect(consultas.some((c) => c.tabela === "convites" && op(c) === "update")).toBe(false);
    // confere se a conta não é de um membro: pelo e-mail antes de gerar o link, pela conta depois
    const buscas = consultas.filter((c) => c.tabela === "membros" && op(c) === "select");
    expect(temEq(buscas[0]!, "email", "bia@x.com")).toBe(true);
    expect(temEq(buscas[1]!, "user_id", CONVIDADO)).toBe(true);
  });

  it("o convite sem conta presa de quem já entrou pelo e-mail: sai antes de gerar qualquer link, e o convite que sobrou é apagado", async () => {
    const { auth, consultas } = criarAdmin((c) => {
      if (c.tabela === "convites" && op(c) === "select") return { data: convite(null), error: null };
      if (c.tabela === "membros" && op(c) === "select") return { data: { id: NOVO_MEMBRO }, error: null };
      if (c.tabela === "convites" && op(c) === "delete") return { data: [{ id: CONVITE }], error: null };
      return undefined;
    });
    expect(await linkDoConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: false, erro: "nao_encontrado" });
    // nenhum link: o magiclink trocaria o token de acesso da conta do membro
    expect(auth.admin.generateLink).not.toHaveBeenCalled();
    expect(temEq(consultas.find((c) => c.tabela === "membros" && op(c) === "select")!, "email", "bia@x.com")).toBe(true);
    expect(consultas.some((c) => c.tabela === "convites" && op(c) === "delete" && temEq(c, "id", CONVITE))).toBe(true);
  });

  it("a conta do e-mail que já é membro com outro e-mail na equipe: nenhum link (o admin entraria como ela), o convite sai", async () => {
    const { auth, consultas } = criarAdmin((c) => {
      if (c.tabela === "convites" && op(c) === "select") return { data: convite(null), error: null };
      if (c.tabela === "membros" && op(c) === "select" && temEq(c, "user_id")) return { data: { id: NOVO_MEMBRO }, error: null };
      if (c.tabela === "convites" && op(c) === "delete") return { data: [{ id: CONVITE }], error: null };
      return undefined;
    });
    auth.admin.generateLink.mockResolvedValueOnce({ data: { user: null, properties: {} } as never, error: { code: "email_exists" } });
    expect(await linkDoConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: false, erro: "nao_encontrado" });
    expect(auth.admin.generateLink).toHaveBeenNthCalledWith(2, { type: "magiclink", email: "bia@x.com", options: { redirectTo: REDIRECT } });
    expect(consultas.some((c) => c.tabela === "convites" && op(c) === "delete" && temEq(c, "id", CONVITE))).toBe(true);
  });

  it("o magiclink da conta que já existia que falha, ou vem sem conta ou sem link: link_nao_gerado; membros que não lê: membros_nao_lidos", async () => {
    const existe = { data: { user: null, properties: {} } as never, error: { code: "email_exists" } };
    let { auth } = criarAdmin((c) => (c.tabela === "convites" && op(c) === "select" ? { data: convite(null), error: null } : undefined));
    auth.admin.generateLink.mockResolvedValueOnce(existe).mockResolvedValueOnce({ data: { user: null, properties: {} } as never, error: { status: 500 } });
    expect(await linkDoConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: false, erro: "falha", mensagem: "link_nao_gerado" });

    ({ auth } = criarAdmin((c) => (c.tabela === "convites" && op(c) === "select" ? { data: convite(null), error: null } : undefined)));
    auth.admin.generateLink.mockResolvedValueOnce(existe).mockResolvedValueOnce({ data: { user: { id: CONVIDADO }, properties: {} } as never, error: null });
    expect(await linkDoConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: false, erro: "falha", mensagem: "link_nao_gerado" });

    // membros que não lê: antes do link (pelo e-mail) e depois dele (pela conta)
    ({ auth } = criarAdmin((c) => {
      if (c.tabela === "convites" && op(c) === "select") return { data: convite(null), error: null };
      if (c.tabela === "membros") return { data: null, error: { message: "x" } };
      return undefined;
    }));
    expect(await linkDoConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: false, erro: "falha", mensagem: "membros_nao_lidos" });
    expect(auth.admin.generateLink).not.toHaveBeenCalled();

    ({ auth } = criarAdmin((c) => {
      if (c.tabela === "convites" && op(c) === "select") return { data: convite(null), error: null };
      if (c.tabela === "membros" && temEq(c, "user_id")) return { data: null, error: { message: "x" } };
      return undefined;
    }));
    auth.admin.generateLink.mockResolvedValueOnce(existe);
    expect(await linkDoConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: false, erro: "falha", mensagem: "membros_nao_lidos" });
    expect(auth.admin.generateLink).toHaveBeenCalledTimes(2);
  });

  it("o magiclink de outra conta (o e-mail mudou de dono) não serve: email_em_uso (conta)", async () => {
    const { auth } = criarAdmin((c) => (c.tabela === "convites" ? { data: convite(CONVIDADO), error: null } : undefined));
    auth.admin.generateLink.mockResolvedValueOnce({ data: { user: { id: "outra" }, properties: { action_link: "x" } }, error: null });
    expect(await linkDoConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: false, erro: "email_em_uso", mensagem: "conta" });
  });

  it("convite de quem já é membro (o aceitar não apagou o convite): apaga o convite e não gera link nenhum", async () => {
    const { auth, consultas } = criarAdmin((c) => {
      if (c.tabela === "convites" && op(c) === "select") return { data: convite(CONVIDADO), error: null };
      if (c.tabela === "membros" && op(c) === "select") return { data: { id: NOVO_MEMBRO }, error: null };
      if (c.tabela === "convites" && op(c) === "delete") return { data: [{ id: CONVITE }], error: null };
      return undefined;
    });
    expect(await linkDoConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: false, erro: "nao_encontrado" });
    expect(auth.admin.generateLink).not.toHaveBeenCalled();
    const busca = consultas.find((c) => c.tabela === "membros" && op(c) === "select")!;
    expect(temEq(busca, "user_id", CONVIDADO)).toBe(true);
    const apagou = consultas.find((c) => c.tabela === "convites" && op(c) === "delete")!;
    expect(temEq(apagou, "id", CONVITE)).toBe(true);
  });

  it("id que não é uuid ou convite que não existe: nao_encontrado; sem admin: sem_acesso", async () => {
    criarAdmin(() => undefined);
    expect(await linkDoConviteLogica(contexto(), { conviteId: "x" })).toEqual({ ok: false, erro: "nao_encontrado" });
    expect(await linkDoConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: false, erro: "nao_encontrado" });
    expect(await linkDoConviteLogica(contexto({ admin: false }), { conviteId: CONVITE })).toEqual({ ok: false, erro: "sem_acesso" });
  });
});

describe("reenviarConvite", () => {
  const convite = (user_id: string | null) => ({ id: CONVITE, email: "bia@x.com", papel: "atendente", user_id, convidado_por: ADMIN });

  it("manda um link novo, grava enviado_em e audita convite_reenviado", async () => {
    const { auth, consultas } = criarAdmin((c) => {
      if (c.tabela === "convites" && op(c) === "select") return { data: convite(CONVIDADO), error: null };
      if (c.tabela === "convites" && op(c) === "update") return { data: [{ id: CONVITE }], error: null };
      return undefined;
    });
    expect(await reenviarConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: true });
    expect(auth.admin.inviteUserByEmail).toHaveBeenCalledWith("bia@x.com", { redirectTo: REDIRECT });
    const marcado = consultas.find((c) => c.tabela === "convites" && op(c) === "update")!;
    expect(Object.keys(marcado.passos[0]![1] as object)).toEqual(["enviado_em"]);
    expect(auditorias(consultas)).toEqual([
      { acao: "convite_reenviado", alvo: CONVITE, ator_membro_id: ADMIN, detalhe: { email: "bia@x.com" } },
    ]);
  });

  it("a conta do convite que já abriu um link e não terminou recebe um link de entrada (sem criar conta)", async () => {
    const { auth } = criarAdmin((c) => {
      if (c.tabela === "convites" && op(c) === "select") return { data: convite(CONVIDADO), error: null };
      if (c.tabela === "convites" && op(c) === "update") return { data: [{ id: CONVITE }], error: null };
      return undefined;
    });
    auth.admin.inviteUserByEmail.mockResolvedValueOnce({ data: { user: null } as never, error: { code: "email_exists" } });
    expect(await reenviarConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: true });
    expect(auth.signInWithOtp).toHaveBeenCalledWith({
      email: "bia@x.com",
      options: { emailRedirectTo: REDIRECT, shouldCreateUser: false },
    });
  });

  it("o convite sem conta presa (a conta criada sem convite): recebe o link de entrada e grava enviado_em", async () => {
    const { auth, consultas } = criarAdmin((c) => {
      if (c.tabela === "convites" && op(c) === "select") return { data: convite(null), error: null };
      if (c.tabela === "convites" && op(c) === "update") return { data: [{ id: CONVITE }], error: null };
      return undefined;
    });
    auth.admin.inviteUserByEmail.mockResolvedValueOnce({ data: { user: null } as never, error: { code: "email_exists" } });
    expect(await reenviarConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: true });
    expect(auth.signInWithOtp).toHaveBeenCalledWith({
      email: "bia@x.com",
      options: { emailRedirectTo: REDIRECT, shouldCreateUser: false },
    });
    const marcado = consultas.find((c) => c.tabela === "convites" && op(c) === "update")!;
    expect(Object.keys(marcado.passos[0]![1] as object)).toEqual(["enviado_em"]);
  });

  it("a conta presa ao convite foi trocada por outra com o mesmo e-mail: email_em_uso (conta), sem link de entrada", async () => {
    const existe = { data: { user: null } as never, error: { code: "email_exists" } };
    // a conta presa não existe mais (404)
    let { auth } = criarAdmin((c) => (c.tabela === "convites" ? { data: convite(CONVIDADO), error: null } : undefined));
    auth.admin.inviteUserByEmail.mockResolvedValueOnce(existe);
    auth.admin.getUserById.mockResolvedValueOnce({ data: { user: null }, error: { status: 404 } });
    expect(await reenviarConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: false, erro: "email_em_uso", mensagem: "conta" });
    expect(auth.signInWithOtp).not.toHaveBeenCalled();

    // a conta presa existe, mas com outro e-mail
    ({ auth } = criarAdmin((c) => (c.tabela === "convites" ? { data: convite(CONVIDADO), error: null } : undefined)));
    auth.admin.inviteUserByEmail.mockResolvedValueOnce(existe);
    auth.admin.getUserById.mockResolvedValueOnce({ data: { user: { id: CONVIDADO, email: "outra@x.com" } }, error: null });
    expect(await reenviarConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: false, erro: "email_em_uso", mensagem: "conta" });
    expect(auth.signInWithOtp).not.toHaveBeenCalled();

    // não deu para conferir (falha que não é 404): falha, sem link
    ({ auth } = criarAdmin((c) => (c.tabela === "convites" ? { data: convite(CONVIDADO), error: null } : undefined)));
    auth.admin.inviteUserByEmail.mockResolvedValueOnce(existe);
    auth.admin.getUserById.mockResolvedValueOnce({ data: { user: null }, error: { status: 500 } });
    expect(await reenviarConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({
      ok: false,
      erro: "falha",
      mensagem: "convite_nao_reenviado",
    });
    expect(auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it("o convite sem conta presa de quem já entrou (o aceitar não apagou o convite): apaga o convite, sem link de entrada", async () => {
    const { auth, consultas } = criarAdmin((c) => {
      if (c.tabela === "convites" && op(c) === "select") return { data: convite(null), error: null };
      if (c.tabela === "membros" && op(c) === "select") return { data: { id: NOVO_MEMBRO }, error: null };
      if (c.tabela === "convites" && op(c) === "delete") return { data: [{ id: CONVITE }], error: null };
      return undefined;
    });
    auth.admin.inviteUserByEmail.mockResolvedValueOnce({ data: { user: null } as never, error: { code: "email_exists" } });
    expect(await reenviarConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: false, erro: "nao_encontrado" });
    expect(auth.signInWithOtp).not.toHaveBeenCalled();
    const busca = consultas.find((c) => c.tabela === "membros" && op(c) === "select")!;
    expect(temEq(busca, "email", "bia@x.com")).toBe(true);
    expect(consultas.some((c) => c.tabela === "convites" && op(c) === "delete" && temEq(c, "id", CONVITE))).toBe(true);
  });

  it("o e-mail que não sai: aviso, sem mexer no enviado_em nem auditar", async () => {
    const { auth, consultas } = criarAdmin((c) => (c.tabela === "convites" ? { data: convite(CONVIDADO), error: null } : undefined));
    auth.admin.inviteUserByEmail.mockResolvedValueOnce({ data: { user: null } as never, error: { status: 500 } });
    expect(await reenviarConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: true, aviso: "email_nao_enviado" });
    expect(consultas.some((c) => op(c) === "update")).toBe(false);
    expect(auditorias(consultas)).toEqual([]);
  });

  it("convite de quem já é membro: apaga o convite, não manda e-mail nem link de entrada", async () => {
    const { auth, consultas } = criarAdmin((c) => {
      if (c.tabela === "convites" && op(c) === "select") return { data: convite(CONVIDADO), error: null };
      if (c.tabela === "membros" && op(c) === "select") return { data: { id: NOVO_MEMBRO }, error: null };
      if (c.tabela === "convites" && op(c) === "delete") return { data: [{ id: CONVITE }], error: null };
      return undefined;
    });
    expect(await reenviarConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: false, erro: "nao_encontrado" });
    expect(auth.admin.inviteUserByEmail).not.toHaveBeenCalled();
    expect(auth.signInWithOtp).not.toHaveBeenCalled();
    expect(consultas.some((c) => c.tabela === "convites" && op(c) === "delete")).toBe(true);
  });

  it("o convite aceito ou cancelado no meio (update com 0 linhas): nao_encontrado", async () => {
    criarAdmin((c) => {
      if (c.tabela === "convites" && op(c) === "select") return { data: convite(CONVIDADO), error: null };
      if (c.tabela === "convites" && op(c) === "update") return { data: [], error: null };
      return undefined;
    });
    expect(await reenviarConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: false, erro: "nao_encontrado" });
  });
});

describe("cancelarConvite", () => {
  it("apaga o convite, apaga a conta do Auth que ainda não entrou e audita", async () => {
    const { auth, consultas } = criarAdmin((c) => {
      if (c.tabela === "convites" && op(c) === "select")
        return { data: { id: CONVITE, email: "bia@x.com", papel: "atendente", user_id: CONVIDADO, convidado_por: ADMIN }, error: null };
      if (c.tabela === "convites" && op(c) === "delete") return { data: [{ id: CONVITE }], error: null };
      return undefined;
    });
    expect(await cancelarConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: true });
    expect(auth.admin.deleteUser).toHaveBeenCalledWith(CONVIDADO);
    expect(auditorias(consultas)).toEqual([
      { acao: "convite_cancelado", alvo: CONVITE, ator_membro_id: ADMIN, detalhe: { email: "bia@x.com" } },
    ]);
  });

  it("a conta que já virou membro não é apagada", async () => {
    const { auth } = criarAdmin((c) => {
      if (c.tabela === "convites" && op(c) === "select")
        return { data: { id: CONVITE, email: "bia@x.com", papel: "atendente", user_id: CONVIDADO, convidado_por: ADMIN }, error: null };
      if (c.tabela === "convites" && op(c) === "delete") return { data: [{ id: CONVITE }], error: null };
      if (c.tabela === "membros") return { data: { id: NOVO_MEMBRO }, error: null };
      return undefined;
    });
    expect(await cancelarConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: true });
    expect(auth.admin.deleteUser).not.toHaveBeenCalled();
  });

  it("o convite sem conta presa (a conta já existia): apaga só o convite, nunca a conta", async () => {
    const { auth } = criarAdmin((c) => {
      if (c.tabela === "convites" && op(c) === "select")
        return { data: { id: CONVITE, email: "bia@x.com", papel: "atendente", user_id: null, convidado_por: ADMIN }, error: null };
      if (c.tabela === "convites" && op(c) === "delete") return { data: [{ id: CONVITE }], error: null };
      return undefined;
    });
    expect(await cancelarConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: true });
    expect(auth.admin.deleteUser).not.toHaveBeenCalled();
  });

  it("delete com 0 linhas: nao_encontrado, sem auditoria", async () => {
    const { consultas } = criarAdmin((c) => {
      if (c.tabela === "convites" && op(c) === "select")
        return { data: { id: CONVITE, email: "bia@x.com", papel: "atendente", user_id: null, convidado_por: ADMIN }, error: null };
      if (c.tabela === "convites" && op(c) === "delete") return { data: [], error: null };
      return undefined;
    });
    expect(await cancelarConviteLogica(contexto(), { conviteId: CONVITE })).toEqual({ ok: false, erro: "nao_encontrado" });
    expect(auditorias(consultas)).toEqual([]);
  });
});

describe("aceitarConvite", () => {
  // as claims de quem abriu o link do e-mail (o fluxo implícito grava "otp" no amr)
  const PELO_LINK = { email: "bia@x.com", amr: [{ method: "otp", timestamp: 1 }] };
  const SO_SENHA = { email: "bia@x.com", amr: [{ method: "password", timestamp: 1 }] };
  const TOKEN = "cabeca.corpo.assinatura";
  const ctxConvidado = (claims: ContextoAceitar["claims"] = PELO_LINK, token: string | null = TOKEN): ContextoAceitar => ({
    ...contexto({ admin: false }),
    userId: CONVIDADO,
    claims,
    token,
  });
  const conviteDoConvidado = { id: CONVITE, email: "bia@x.com", papel: "admin", user_id: CONVIDADO, convidado_por: ADMIN };

  it("cria o membro com o papel do convite, apaga o convite e audita membro_entrou", async () => {
    const { consultas, auth } = criarAdmin((c) => {
      if (c.tabela === "convites" && op(c) === "select") return { data: conviteDoConvidado, error: null };
      if (c.tabela === "membros" && op(c) === "insert") return { data: { id: NOVO_MEMBRO }, error: null };
      if (c.tabela === "convites" && op(c) === "delete") return { data: [{ id: CONVITE }], error: null };
      return undefined;
    });
    expect(await aceitarConviteLogica(ctxConvidado(), { nome: "  Bia   Souza " })).toEqual({ ok: true, membroId: NOVO_MEMBRO });

    const buscas = consultas.filter((c) => c.tabela === "convites" && op(c) === "select");
    // O convite preso à conta é achado pelo usuário da sessão (o que o convite criou); achou, não
    // procura pelo e-mail.
    expect(buscas).toHaveLength(1);
    expect(temEq(buscas[0]!, "user_id", CONVIDADO)).toBe(true);
    expect(temEq(buscas[0]!, "email")).toBe(false);
    const insert = consultas.find((c) => c.tabela === "membros" && op(c) === "insert")!;
    expect(insert.passos[0]![1]).toEqual({
      user_id: CONVIDADO,
      nome: "Bia Souza",
      email: "bia@x.com",
      papel: "admin",
      convidado_por: ADMIN,
    });
    expect(consultas.some((c) => c.tabela === "convites" && op(c) === "delete" && temEq(c, "id", CONVITE))).toBe(true);
    expect(auditorias(consultas)).toEqual([
      { acao: "membro_entrou", alvo: NOVO_MEMBRO, ator_membro_id: NOVO_MEMBRO, detalhe: { nome: "Bia Souza", papel: "admin" } },
    ]);
    // a conta que o próprio convite criou não tem sessão de mais ninguém: não encerra nada
    expect(auth.admin.signOut).not.toHaveBeenCalled();
  });

  it("nome vazio: nome_vazio, sem ir ao banco", async () => {
    expect(await aceitarConviteLogica(ctxConvidado(), { nome: "   " })).toEqual({ ok: false, erro: "nome_vazio" });
  });

  it("sem convite (cancelado, ou ninguém convidou este e-mail): nao_encontrado", async () => {
    criarAdmin(() => undefined);
    expect(await aceitarConviteLogica(ctxConvidado(), { nome: "Bia" })).toEqual({ ok: false, erro: "nao_encontrado" });
  });

  it("o convite preso à conta, mas a sessão entrou só com a senha: link_necessario, sem criar o membro", async () => {
    const { consultas } = criarAdmin((c) =>
      c.tabela === "convites" && op(c) === "select" ? { data: conviteDoConvidado, error: null } : undefined,
    );
    expect(await aceitarConviteLogica(ctxConvidado(SO_SENHA), { nome: "Bia" })).toEqual({ ok: false, erro: "link_necessario" });
    expect(consultas.some((c) => c.tabela === "membros" && op(c) === "insert")).toBe(false);
    expect(consultas.some((c) => c.tabela === "convites" && op(c) === "delete")).toBe(false);
  });

  it("a conta que já existia (criada sem convite): acha o convite sem conta presa pelo e-mail da sessão, encerra as outras sessões e cria o membro", async () => {
    const conviteSolto = { ...conviteDoConvidado, user_id: null, papel: "atendente" };
    let encerrouAntes = false;
    const r0 = criarAdmin((c) => {
      if (c.tabela === "convites" && op(c) === "select")
        return temEq(c, "email") ? { data: conviteSolto, error: null } : { data: null, error: null };
      if (c.tabela === "membros" && op(c) === "insert") {
        encerrouAntes = r0.auth.admin.signOut.mock.calls.length === 1;
        return { data: { id: NOVO_MEMBRO }, error: null };
      }
      if (c.tabela === "convites" && op(c) === "delete") return { data: [{ id: CONVITE }], error: null };
      if (c.tabela === "auditoria") return { data: [{ id: 1 }], error: null };
      return undefined;
    });
    const { consultas, auth } = r0;
    const r = await aceitarConviteLogica(ctxConvidado({ ...PELO_LINK, email: " Bia@X.com " }), { nome: "Bia" });
    expect(r).toEqual({ ok: true, membroId: NOVO_MEMBRO });
    // as outras sessões desta conta saem antes de ela virar membro, com o token do próprio pedido
    expect(auth.admin.signOut).toHaveBeenCalledWith(TOKEN, "others");
    expect(encerrouAntes).toBe(true);

    const buscas = consultas.filter((c) => c.tabela === "convites" && op(c) === "select");
    expect(temEq(buscas[0]!, "user_id", CONVIDADO)).toBe(true);
    // pelo e-mail da sessão (aparado e minúsculo), só no convite que não tem conta presa
    expect(temEq(buscas[1]!, "email", "bia@x.com")).toBe(true);
    expect(buscas[1]!.passos.some((p) => p[0] === "is" && p[1] === "user_id" && p[2] === null)).toBe(true);
    const insert = consultas.find((c) => c.tabela === "membros" && op(c) === "insert")!;
    expect(insert.passos[0]![1]).toEqual({
      user_id: CONVIDADO,
      nome: "Bia",
      email: "bia@x.com",
      papel: "atendente",
      convidado_por: ADMIN,
    });
    expect(consultas.some((c) => c.tabela === "convites" && op(c) === "delete" && temEq(c, "id", CONVITE))).toBe(true);
    expect(auditorias(consultas)).toEqual([
      {
        acao: "membro_entrou",
        alvo: NOVO_MEMBRO,
        ator_membro_id: NOVO_MEMBRO,
        detalhe: { nome: "Bia", papel: "atendente", conta_existente: true },
      },
    ]);
  });

  it("a conta que já existia e a sessão que entrou com a senha (quem criou a conta sabe a senha): link_necessario", async () => {
    const conviteSolto = { ...conviteDoConvidado, user_id: null };
    const { consultas } = criarAdmin((c) =>
      c.tabela === "convites" && op(c) === "select" && temEq(c, "email") ? { data: conviteSolto, error: null } : undefined,
    );
    expect(await aceitarConviteLogica(ctxConvidado(SO_SENHA), { nome: "Bia" })).toEqual({ ok: false, erro: "link_necessario" });
    expect(consultas.some((c) => c.tabela === "membros" && op(c) === "insert")).toBe(false);
    expect(consultas.some((c) => c.tabela === "convites" && op(c) === "delete")).toBe(false);
  });

  it("a conta que já existia sem o token do pedido, ou com o encerramento das outras sessões falhando: não aceita", async () => {
    const conviteSolto = { ...conviteDoConvidado, user_id: null };
    const responder = (c: Consulta) =>
      c.tabela === "convites" && op(c) === "select" && temEq(c, "email") ? { data: conviteSolto, error: null } : undefined;

    let { auth, consultas } = criarAdmin(responder);
    expect(await aceitarConviteLogica(ctxConvidado(PELO_LINK, null), { nome: "Bia" })).toEqual({
      ok: false,
      erro: "falha",
      mensagem: "sessoes_nao_encerradas",
    });
    expect(auth.admin.signOut).not.toHaveBeenCalled();
    expect(consultas.some((c) => c.tabela === "membros" && op(c) === "insert")).toBe(false);

    ({ auth, consultas } = criarAdmin(responder));
    auth.admin.signOut.mockResolvedValueOnce({ data: null, error: { status: 500 } });
    expect(await aceitarConviteLogica(ctxConvidado(), { nome: "Bia" })).toEqual({
      ok: false,
      erro: "falha",
      mensagem: "sessoes_nao_encerradas",
    });
    expect(consultas.some((c) => c.tabela === "membros" && op(c) === "insert")).toBe(false);
    expect(consultas.some((c) => c.tabela === "convites" && op(c) === "delete")).toBe(false);
  });

  it("o convite sem conta presa e a conta que já é membro: ativo devolve o membro e apaga o convite; desativado, sem_acesso", async () => {
    const conviteSolto = { ...conviteDoConvidado, user_id: null };
    let { consultas, auth } = criarAdmin((c) => {
      if (c.tabela === "membros" && op(c) === "select") return { data: { id: NOVO_MEMBRO, ativo: true }, error: null };
      if (c.tabela === "convites" && op(c) === "select" && temEq(c, "email")) return { data: conviteSolto, error: null };
      return undefined;
    });
    expect(await aceitarConviteLogica(ctxConvidado(), { nome: "Bia" })).toEqual({ ok: true, membroId: NOVO_MEMBRO });
    expect(consultas.some((c) => c.tabela === "convites" && op(c) === "delete" && temEq(c, "id", CONVITE))).toBe(true);
    expect(consultas.some((c) => c.tabela === "membros" && op(c) === "insert")).toBe(false);
    expect(auth.admin.signOut).not.toHaveBeenCalled();

    ({ consultas } = criarAdmin((c) => {
      if (c.tabela === "membros" && op(c) === "select") return { data: { id: NOVO_MEMBRO, ativo: false }, error: null };
      if (c.tabela === "convites" && op(c) === "select" && temEq(c, "email")) return { data: conviteSolto, error: null };
      return undefined;
    }));
    expect(await aceitarConviteLogica(ctxConvidado(), { nome: "Bia" })).toEqual({ ok: false, erro: "sem_acesso" });
    expect(consultas.some((c) => c.tabela === "convites" && op(c) === "delete")).toBe(false);
  });

  it("a leitura do convite pelo e-mail que falha: falha convite_nao_lido", async () => {
    criarAdmin((c) =>
      c.tabela === "convites" && op(c) === "select" && temEq(c, "email") ? { data: null, error: { message: "x" } } : undefined,
    );
    expect(await aceitarConviteLogica(ctxConvidado(), { nome: "Bia" })).toEqual({ ok: false, erro: "falha", mensagem: "convite_nao_lido" });
  });

  it("sem e-mail no token: não procura o convite pelo e-mail (nao_encontrado)", async () => {
    const { consultas } = criarAdmin(() => undefined);
    expect(await aceitarConviteLogica(ctxConvidado({ amr: PELO_LINK.amr }), { nome: "Bia" })).toEqual({
      ok: false,
      erro: "nao_encontrado",
    });
    expect(consultas.filter((c) => c.tabela === "convites" && op(c) === "select")).toHaveLength(1);
  });

  it("já é membro ativo: devolve o mesmo membro (pode chamar de novo); desativado: sem_acesso", async () => {
    criarAdmin((c) => (c.tabela === "membros" ? { data: { id: NOVO_MEMBRO, ativo: true }, error: null } : undefined));
    expect(await aceitarConviteLogica(ctxConvidado(), { nome: "Bia" })).toEqual({ ok: true, membroId: NOVO_MEMBRO });
    criarAdmin((c) => (c.tabela === "membros" ? { data: { id: NOVO_MEMBRO, ativo: false }, error: null } : undefined));
    expect(await aceitarConviteLogica(ctxConvidado(), { nome: "Bia" })).toEqual({ ok: false, erro: "sem_acesso" });
  });

  it("o e-mail já é de outro membro (23505 sem membro desta conta): email_em_uso", async () => {
    criarAdmin((c) => {
      if (c.tabela === "convites" && op(c) === "select") return { data: conviteDoConvidado, error: null };
      if (c.tabela === "membros" && op(c) === "insert") return { data: null, error: { code: "23505" } };
      return undefined;
    });
    expect(await aceitarConviteLogica(ctxConvidado(), { nome: "Bia" })).toEqual({ ok: false, erro: "email_em_uso", mensagem: "membro" });
  });
});
