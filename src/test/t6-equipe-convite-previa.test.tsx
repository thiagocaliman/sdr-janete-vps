import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, RouterProvider, createMemoryHistory, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

// O link do convite resiste ao robô de prévia (WhatsApp, Telegram, antivírus de e-mail): o link leva à
// página /convite com o token_hash, e o código de uso único só é gasto no clique em "Abrir convite".

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

import { CHAVES } from "@/features/plataforma/dados/chaves";
import type { ClienteSupabase } from "@/features/plataforma/dados/colunas";
import { codigoDoLink, ConviteConta } from "@/features/plataforma/equipe/ConviteConta";
import { linkDoConviteSeguro } from "@/features/plataforma/equipe/equipe.server";

const UID = "b0000000-0000-4000-8000-0000000000b1";

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

function token(): string {
  const b = (t: string) => btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${b('{"alg":"ES256"}')}.${b(JSON.stringify({ sub: UID, amr: [{ method: "otp", timestamp: 1 }] }))}.x`;
}

function clienteFalso(erroVerificar: unknown = null) {
  let logado = false;
  const verifyOtp = vi.fn(async (_p: unknown) => {
    if (!erroVerificar) logado = true;
    return { data: {}, error: erroVerificar };
  });
  const getSession = vi.fn(async () => ({
    data: { session: logado ? { user: { id: UID, email: "bia@x.com", invited_at: "2026-11-01" }, access_token: token() } : null },
    error: null,
  }));
  const consulta = { select: () => consulta, eq: () => consulta, maybeSingle: async () => ({ data: null, error: null }) };
  const cliente = { auth: { verifyOtp, getSession, updateUser: vi.fn() }, from: () => consulta };
  return { cliente: cliente as unknown as ClienteSupabase, verifyOtp, getSession };
}

function montar(cliente: ClienteSupabase) {
  const queryClient = new QueryClient();
  queryClient.setQueryData(CHAVES.eu, null);
  const raiz = createRootRoute({ component: () => <Outlet /> });
  const convite = createRoute({
    getParentRoute: () => raiz,
    path: "/convite",
    component: () => <ConviteConta cliente={cliente} aceitar={vi.fn()} />,
  });
  const router = createRouter({ routeTree: raiz.addChildren([convite]), history: createMemoryHistory({ initialEntries: ["/convite"] }) });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("linkDoConviteSeguro", () => {
  it("leva à página /convite com o token_hash e o tipo, e não ao /verify do Supabase", () => {
    const link = linkDoConviteSeguro("https://app.exemplo/convite", {
      action_link: "https://app.exemplo/auth/v1/verify?token=abc&type=invite",
      hashed_token: "h123",
      verification_type: "invite",
    });
    expect(link).toBe("https://app.exemplo/convite?token_hash=h123&type=invite");
  });

  it("magiclink também; outro tipo ou sem hash fica com o action_link", () => {
    expect(linkDoConviteSeguro("https://a.b/convite", { hashed_token: "h", verification_type: "magiclink" })).toBe(
      "https://a.b/convite?token_hash=h&type=magiclink",
    );
    expect(linkDoConviteSeguro("https://a.b/convite", { action_link: "x", verification_type: "invite" })).toBe("x");
    expect(linkDoConviteSeguro("https://a.b/convite", { action_link: "x", hashed_token: "h", verification_type: "recovery" })).toBe("x");
    expect(linkDoConviteSeguro("https://a.b/convite", null)).toBeNull();
  });
});

describe("codigoDoLink", () => {
  it("lê o token_hash e o tipo do endereço", () => {
    expect(codigoDoLink("https://a.b/convite?token_hash=h&type=invite")).toEqual({ tokenHash: "h", tipoLink: "invite" });
    expect(codigoDoLink("https://a.b/convite?token_hash=h&type=recovery")).toBeNull();
    expect(codigoDoLink("https://a.b/convite")).toBeNull();
  });
});

describe("/convite com o link novo", () => {
  it("abrir a página (o que o robô de prévia faz) não gasta o código", async () => {
    window.history.replaceState(null, "", "/convite?token_hash=h123&type=invite");
    const { cliente, verifyOtp } = clienteFalso();
    montar(cliente);
    expect(await screen.findByRole("heading", { name: "Você recebeu um convite" })).toBeTruthy();
    expect(verifyOtp).not.toHaveBeenCalled();
  });

  it("o clique em Abrir convite usa o código, limpa o endereço e mostra o formulário", async () => {
    window.history.replaceState(null, "", "/convite?token_hash=h123&type=invite");
    const { cliente, verifyOtp } = clienteFalso();
    montar(cliente);
    const botao = await screen.findByRole("button", { name: "Abrir convite" });
    await act(async () => {
      fireEvent.click(botao);
      for (let i = 0; i < 10; i += 1) await Promise.resolve();
    });
    expect(verifyOtp).toHaveBeenCalledWith({ token_hash: "h123", type: "invite" });
    expect(window.location.search).toBe("");
    expect(await screen.findByRole("heading", { name: "Entre na equipe" })).toBeTruthy();
  });

  it("o código já usado ou vencido: o texto do convite vencido", async () => {
    window.history.replaceState(null, "", "/convite?token_hash=h123&type=invite");
    const { cliente } = clienteFalso({ code: "otp_expired", message: "expired" });
    montar(cliente);
    const botao = await screen.findByRole("button", { name: "Abrir convite" });
    await act(async () => {
      fireEvent.click(botao);
      for (let i = 0; i < 10; i += 1) await Promise.resolve();
    });
    expect(
      await screen.findByText("O link do convite venceu ou já foi usado. Peça ao admin para reenviar o convite."),
    ).toBeTruthy();
  });
});
