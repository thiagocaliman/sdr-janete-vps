// "Trocar senha" (GavetaSenha): confere a senha atual entrando de novo com ela e só então grava a nova.
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GavetaSenha, type AuthSenha } from "@/features/plataforma/GavetaSenha";

function authFalso(opcoes: { senhaAtual?: string; erroTroca?: unknown } = {}) {
  const senhaAtual = opcoes.senhaAtual ?? "antiga123";
  return {
    getUser: vi.fn(async () => ({ data: { user: { email: "dona@exemplo.com" } }, error: null })),
    signInWithPassword: vi.fn(async ({ password }: { email: string; password: string }) => ({
      error: password === senhaAtual ? null : { code: "invalid_credentials", message: "Invalid login credentials", status: 400 },
    })),
    updateUser: vi.fn(async () => ({ error: opcoes.erroTroca ?? null })),
  } satisfies AuthSenha;
}

function preencher(atual: string, nova: string, confirma = nova) {
  fireEvent.change(screen.getByLabelText("Senha atual"), { target: { value: atual } });
  fireEvent.change(screen.getByLabelText("Senha nova"), { target: { value: nova } });
  fireEvent.change(screen.getByLabelText("Repita a senha nova"), { target: { value: confirma } });
  fireEvent.click(screen.getByRole("button", { name: "Salvar senha nova" }));
}

describe("trocar senha", () => {
  it("com a senha atual certa, grava a nova e avisa", async () => {
    const auth = authFalso();
    render(<GavetaSenha aberta aoFechar={() => {}} auth={auth} />);
    preencher("antiga123", "novinha456");
    await screen.findByText("Senha trocada");
    expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: "dona@exemplo.com", password: "antiga123" });
    expect(auth.updateUser).toHaveBeenCalledWith({ password: "novinha456" });
  });

  it("com a senha atual errada, não grava nada", async () => {
    const auth = authFalso();
    render(<GavetaSenha aberta aoFechar={() => {}} auth={auth} />);
    preencher("errada", "novinha456");
    await screen.findByText("A senha atual não confere.");
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  it("confere tamanho, repetição e senha igual à atual antes de falar com o servidor", async () => {
    const auth = authFalso();
    render(<GavetaSenha aberta aoFechar={() => {}} auth={auth} />);
    preencher("antiga123", "curta");
    expect(await screen.findByText("Use pelo menos 8 caracteres.")).toBeTruthy();
    preencher("antiga123", "novinha456", "outra4567");
    expect(await screen.findByText("As duas senhas não são iguais.")).toBeTruthy();
    preencher("antiga123", "antiga123");
    expect(await screen.findByText("A senha nova precisa ser diferente da atual.")).toBeTruthy();
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it("senha nova recusada pelo servidor por ser fraca: o aviso vai no campo da nova", async () => {
    const auth = authFalso({ erroTroca: { code: "weak_password", name: "AuthWeakPasswordError", reasons: [] } });
    render(<GavetaSenha aberta aoFechar={() => {}} auth={auth} />);
    preencher("antiga123", "12345678");
    await waitFor(() => expect(screen.getByText(/Esta senha é fraca/)).toBeTruthy());
    expect(screen.queryByText("Senha trocada")).toBeNull();
  });
});
