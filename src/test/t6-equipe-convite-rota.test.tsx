import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

// Task C7 (spec 2.2 e 2.4; decisões 1, 2 e 15): a rota /convite. Quem chega pelo link (com a sessão
// do Supabase que o link cria) escolhe o nome e a senha (auth.updateUser), a tela chama o
// aceitarConvite e vai direto para /app, sem onboarding. A conta que já existia (criada sem convite)
// troca a senha antiga; a sessão que entrou só com a senha não vê o formulário. Cliente do Supabase e
// função de servidor falsos: nada vai à rede.

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

import { CHAVES } from "@/features/plataforma/dados/chaves";
import type { ClienteSupabase } from "@/features/plataforma/dados/colunas";
import { ConviteConta, linkComErro, textoDoAceite, type RespostaAceitar } from "@/features/plataforma/equipe/ConviteConta";
import { claimsDoToken, entrouPorLinkDoEmail } from "@/features/plataforma/equipe/entrada";
import { Route as RotaConvite } from "@/routes/_conta/convite";

const UID = "b0000000-0000-4000-8000-0000000000b1";

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

/** Um token de acesso falso (JWT), com o payload em base64url; a assinatura não importa para a tela. */
function tokenCom(payload: Record<string, unknown>): string {
  const base64url = (texto: string) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(texto)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  return `${base64url(JSON.stringify({ alg: "ES256", typ: "JWT" }))}.${base64url(JSON.stringify(payload))}.assinatura`;
}

interface Opcoes {
  sessao?: boolean;
  membro?: { id: string; ativo: boolean } | null;
  erroSenha?: { code?: string; message?: string } | null;
  /** A conta que já existia (criada sem convite): a sessão sem `invited_at`. */
  contaExistente?: boolean;
  /** Os jeitos de entrar do token (o amr). null = sessão sem token legível. Padrão: o link do e-mail ("otp"). */
  amr?: string[] | null;
}

function clienteFalso(o: Opcoes = {}) {
  const { sessao = true, membro = null, erroSenha = null, contaExistente = false, amr = ["otp"] } = o;
  const updateUser = vi.fn(async (_d: unknown) => ({ data: {}, error: erroSenha }));
  const usuario = { id: UID, email: "bia@x.com", ...(contaExistente ? {} : { invited_at: "2026-11-01T00:00:00Z" }) };
  const accessToken =
    amr === null ? undefined : tokenCom({ sub: UID, email: "bia@x.com", amr: amr.map((method) => ({ method, timestamp: 1 })) });
  const consulta = {
    select: () => consulta,
    eq: () => consulta,
    maybeSingle: async () => ({
      data: membro
        ? { ...membro, nome: "Bia", email: "bia@x.com", papel: "atendente", user_id: UID, criado_em: "2026-11-01T00:00:00Z", vistos: {} }
        : null,
      error: null,
    }),
  };
  const cliente = {
    auth: {
      getSession: async () => ({
        data: { session: sessao ? { user: usuario, access_token: accessToken } : null },
        error: null,
      }),
      updateUser,
    },
    from: () => consulta,
  };
  return { cliente: cliente as unknown as ClienteSupabase, updateUser };
}

async function montar(cliente: ClienteSupabase, aceitar: (nome: string) => Promise<RespostaAceitar>) {
  const queryClient = new QueryClient();
  queryClient.setQueryData(CHAVES.eu, null);
  const raiz = createRootRoute({ component: () => <Outlet /> });
  const convite = createRoute({
    getParentRoute: () => raiz,
    path: "/convite",
    component: () => <ConviteConta cliente={cliente} aceitar={aceitar} />,
  });
  const app = createRoute({ getParentRoute: () => raiz, path: "/app", component: () => <h1>Plataforma</h1> });
  const entrar = createRoute({ getParentRoute: () => raiz, path: "/entrar", component: () => <h1>Entrar</h1> });
  const router = createRouter({
    routeTree: raiz.addChildren([convite, app, entrar]),
    history: createMemoryHistory({ initialEntries: ["/convite"] }),
  });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { router, queryClient };
}

const preencher = (nome: string, senha: string) => {
  fireEvent.change(screen.getByLabelText("Seu nome"), { target: { value: nome } });
  fireEvent.change(screen.getByLabelText("Senha"), { target: { value: senha } });
};

const enviar = async () => {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Entrar na equipe" }));
    for (let i = 0; i < 10; i += 1) await Promise.resolve();
  });
};

describe("/convite", () => {
  it("a rota fica em _conta, só no navegador", () => {
    expect(RotaConvite.options.ssr).toBe(false);
    expect(RotaConvite.options.component).toBe(ConviteConta);
  });

  it("com a sessão do link: pede nome e senha, grava a senha, aceita e vai direto para /app", async () => {
    const { cliente, updateUser } = clienteFalso();
    const aceitar = vi.fn(async () => ({ ok: true, membroId: "m1" }));
    const { router, queryClient } = await montar(cliente, aceitar);
    expect(await screen.findByRole("heading", { name: "Entre na equipe" })).toBeTruthy();
    expect(screen.getByText("Você foi convidado com bia@x.com. Escolha o nome que a equipe vai ver e a sua senha.")).toBeTruthy();
    expect(screen.getByPlaceholderText("Crie uma senha")).toBeTruthy();

    preencher("  Bia   Souza ", "senha-forte-1");
    await enviar();
    expect(updateUser).toHaveBeenCalledWith({ password: "senha-forte-1", data: { nome: "Bia Souza" } });
    expect(aceitar).toHaveBeenCalledWith("Bia Souza");
    // a senha nova antes de aceitar (na conta que já existia, o servidor encerra as outras sessões depois dela)
    expect(updateUser.mock.invocationCallOrder[0]!).toBeLessThan(aceitar.mock.invocationCallOrder[0]!);
    expect(await screen.findByRole("heading", { name: "Plataforma" })).toBeTruthy();
    expect(router.state.location.pathname).toBe("/app");
    // o Eu "sem acesso" em cache saiu: a guarda de /app relê
    expect(queryClient.getQueryData(CHAVES.eu)).toBeUndefined();
  });

  it("nome vazio e senha curta: os erros nos campos, sem ir ao servidor", async () => {
    const { cliente, updateUser } = clienteFalso();
    const aceitar = vi.fn(async () => ({ ok: true }));
    await montar(cliente, aceitar);
    await screen.findByRole("heading", { name: "Entre na equipe" });
    preencher("  ", "curta");
    await enviar();
    expect(screen.getByText("Escreva o seu nome.")).toBeTruthy();
    expect(screen.getByText("Use pelo menos 8 caracteres.")).toBeTruthy();
    expect(updateUser).not.toHaveBeenCalled();
    expect(aceitar).not.toHaveBeenCalled();
  });

  it("as recusas do aceitarConvite com o texto da tela; tentar de novo aceita a mesma senha (same_password)", async () => {
    const { cliente, updateUser } = clienteFalso({ erroSenha: { code: "same_password" } });
    const aceitar = vi
      .fn<(nome: string) => Promise<RespostaAceitar>>()
      .mockResolvedValueOnce({ ok: false, erro: "nao_encontrado" })
      .mockResolvedValueOnce({ ok: false, erro: "falha" })
      .mockResolvedValueOnce({ ok: true, membroId: "m1" });
    await montar(cliente, aceitar);
    await screen.findByRole("heading", { name: "Entre na equipe" });
    preencher("Bia", "senha-forte-1");
    await enviar();
    expect(screen.getByText(textoDoAceite("nao_encontrado"))).toBeTruthy();
    expect(textoDoAceite("nao_encontrado")).toBe("Não achamos o seu convite. Ele pode ter sido cancelado. Peça um convite novo ao admin.");
    await enviar();
    expect(screen.getByText("Não deu para entrar agora. Confira a internet e tente de novo.")).toBeTruthy();
    await enviar();
    expect(await screen.findByRole("heading", { name: "Plataforma" })).toBeTruthy();
    expect(updateUser).toHaveBeenCalledTimes(3);
  });

  it("os textos das outras recusas", () => {
    expect(textoDoAceite("sem_acesso")).toBe("Sua conta está desativada. Fale com o admin da sua equipe.");
    expect(textoDoAceite("email_em_uso")).toBe("Esse e-mail já está na equipe com outra conta. Fale com o admin da sua equipe.");
    expect(textoDoAceite("link_necessario")).toBe(
      "Para entrar na equipe, abra o link que chegou no seu e-mail. Se ele já foi usado ou venceu, peça ao admin para reenviar o convite.",
    );
  });

  it("a conta que já existia (criada sem convite): pede uma senha nova e diz que a antiga deixa de valer", async () => {
    const { cliente, updateUser } = clienteFalso({ contaExistente: true });
    const aceitar = vi.fn(async () => ({ ok: true, membroId: "m1" }));
    await montar(cliente, aceitar);
    expect(await screen.findByRole("heading", { name: "Entre na equipe" })).toBeTruthy();
    expect(
      screen.getByText(
        "Você foi convidado com bia@x.com. Escolha o nome que a equipe vai ver e uma senha nova: a antiga deixa de valer, e a sua conta sai dos outros aparelhos.",
      ),
    ).toBeTruthy();
    expect(screen.getByPlaceholderText("Crie uma senha nova")).toBeTruthy();
    preencher("Bia", "senha-nova-1");
    await enviar();
    expect(updateUser).toHaveBeenCalledWith({ password: "senha-nova-1", data: { nome: "Bia" } });
    expect(aceitar).toHaveBeenCalledWith("Bia");
    expect(await screen.findByRole("heading", { name: "Plataforma" })).toBeTruthy();
  });

  it("a sessão que entrou só com a senha: sem formulário, sem trocar a senha; manda abrir o link do e-mail", async () => {
    const { cliente, updateUser } = clienteFalso({ contaExistente: true, amr: ["password"] });
    const aceitar = vi.fn(async () => ({ ok: true, membroId: "m1" }));
    await montar(cliente, aceitar);
    expect(await screen.findByRole("heading", { name: "Abra o link do seu e-mail" })).toBeTruthy();
    expect(screen.getByText(textoDoAceite("link_necessario"))).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Entrar na equipe" })).toBeNull();
    expect(updateUser).not.toHaveBeenCalled();
    expect(aceitar).not.toHaveBeenCalled();
  });

  it("o token que não dá para ler: mostra o formulário (o servidor decide); a recusa link_necessario vira o texto", async () => {
    const { cliente } = clienteFalso({ amr: null });
    const aceitar = vi.fn(async () => ({ ok: false, erro: "link_necessario" }));
    await montar(cliente, aceitar);
    await screen.findByRole("heading", { name: "Entre na equipe" });
    preencher("Bia", "senha-forte-1");
    await enviar();
    expect(screen.getByText(textoDoAceite("link_necessario"))).toBeTruthy();
  });

  it("claimsDoToken lê o payload em base64url (com acento) e devolve null no que não é token", () => {
    const token = `x.${btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify({ email: "joão@x.com", amr: ["otp"] }))))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")}.y`;
    expect(claimsDoToken(token)).toEqual({ email: "joão@x.com", amr: ["otp"] });
    expect(entrouPorLinkDoEmail(claimsDoToken(token))).toBe(true);
    expect(claimsDoToken("abc")).toBeNull();
    expect(claimsDoToken("a.%%%.c")).toBeNull();
    expect(claimsDoToken(`a.${btoa("[1,2]")}.c`)).toBeNull();
    expect(claimsDoToken(undefined)).toBeNull();
  });

  it("senha fraca recusada pelo Auth: o erro no campo da senha, sem aceitar", async () => {
    const { cliente } = clienteFalso({ erroSenha: { code: "weak_password", message: "weak" } });
    const aceitar = vi.fn(async () => ({ ok: true }));
    await montar(cliente, aceitar);
    await screen.findByRole("heading", { name: "Entre na equipe" });
    preencher("Bia", "senha-fraca");
    await enviar();
    expect(screen.getByText("Esta senha é fraca. Use pelo menos 8 caracteres, misturando letras, números e símbolos.")).toBeTruthy();
    expect(aceitar).not.toHaveBeenCalled();
  });

  it("sem sessão: o link não vale mais, com o caminho para Entrar", async () => {
    const { cliente } = clienteFalso({ sessao: false });
    await montar(cliente, vi.fn());
    expect(await screen.findByRole("heading", { name: "Este link não vale mais" })).toBeTruthy();
    expect(screen.getByText("Abra o link do convite que chegou no seu e-mail. Se ele venceu, peça ao admin para reenviar.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Entrar" }).getAttribute("href")).toBe("/entrar");
  });

  it("o link vencido (o Supabase devolve #error=...): o texto do convite vencido", async () => {
    window.history.replaceState(null, "", "/convite#error=access_denied&error_code=otp_expired");
    const { cliente } = clienteFalso({ sessao: false });
    await montar(cliente, vi.fn());
    expect(
      await screen.findByText("O link do convite venceu ou já foi usado. Peça ao admin para reenviar o convite."),
    ).toBeTruthy();
    expect(linkComErro("https://x.app/convite#error=access_denied&error_code=otp_expired")).toBe(true);
    expect(linkComErro("https://x.app/convite?error=x")).toBe(true);
    expect(linkComErro("https://x.app/convite#access_token=abc&type=invite")).toBe(false);
  });

  it("quem já entrou (já é membro ativo) vai direto para /app", async () => {
    const { cliente } = clienteFalso({ membro: { id: "m1", ativo: true } });
    const { router } = await montar(cliente, vi.fn());
    expect(await screen.findByRole("heading", { name: "Plataforma" })).toBeTruthy();
    expect(router.state.location.pathname).toBe("/app");
  });
});
