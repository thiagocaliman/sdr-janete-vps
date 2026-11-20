// O cliente do Supabase na demo: um falso que não chama rede nenhuma. Entrar e criar conta aceitam
// qualquer e-mail e senha e só guardam o nome e o e-mail na aba (a senha não fica em lugar nenhum).
// Na demo do painel, quem não entrou é o dono fictício. Qualquer leitura do banco volta vazia.
import { DONO_DEMO } from "./negocio";

const CHAVE = "janete-demo:conta";

interface ContaDemo {
  nome: string;
  email: string;
}

function lerConta(): ContaDemo | null {
  try {
    const bruto = sessionStorage.getItem(CHAVE);
    return bruto ? (JSON.parse(bruto) as ContaDemo) : null;
  } catch {
    return null;
  }
}

function gravarConta(c: ContaDemo | null): void {
  try {
    if (c) sessionStorage.setItem(CHAVE, JSON.stringify({ nome: c.nome, email: c.email }));
    else sessionStorage.removeItem(CHAVE);
  } catch {
    // sem sessionStorage: vale só nesta página
  }
}

/** true quando alguém entrou ou criou conta nesta aba. */
export function contaDemoAtiva(): boolean {
  return lerConta() !== null;
}

function usuario() {
  const c = lerConta() ?? { nome: DONO_DEMO.nome, email: DONO_DEMO.email };
  return { id: "demo-usuario", email: c.email, user_metadata: { nome: c.nome }, identities: [{ id: "demo" }] };
}

function sessao() {
  return { user: usuario(), access_token: "demo", refresh_token: "demo", expires_in: 3600, token_type: "bearer" };
}

const vazio = { data: null, error: null };

function consultaVazia(): unknown {
  const alvo = () => consulta;
  const consulta: Record<string | symbol, unknown> = new Proxy(alvo, {
    get(_, prop) {
      if (prop === "then") return (ok: (v: unknown) => unknown) => Promise.resolve({ data: [], error: null, count: 0 }).then(ok);
      return consulta;
    },
    apply() {
      return consulta;
    },
  }) as unknown as Record<string | symbol, unknown>;
  return consulta;
}

const canal = {
  on: () => canal,
  subscribe: () => canal,
  unsubscribe: async () => "ok",
};

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const supabase = {
  auth: {
    getUser: async () => ({ data: { user: usuario() }, error: null }),
    getSession: async () => ({ data: { session: sessao() }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signOut: async () => {
      gravarConta(null);
      return vazio;
    },
    signInWithPassword: async ({ email }: { email: string; password: string }) => {
      await esperar(500);
      const antes = lerConta();
      const nome = antes && antes.email === email ? antes.nome : email.split("@")[0] || "Você";
      gravarConta({ nome, email });
      return { data: { user: usuario(), session: sessao() }, error: null };
    },
    signUp: async ({ email, options }: { email: string; password: string; options?: { data?: { nome?: string } } }) => {
      await esperar(500);
      gravarConta({ nome: options?.data?.nome?.trim() || email.split("@")[0] || "Você", email });
      return { data: { user: usuario(), session: sessao() }, error: null };
    },
    updateUser: async () => ({ data: null, error: { message: "Na demo não dá para trocar a senha." } }),
  },
  from: () => consultaVazia(),
  rpc: () => consultaVazia(),
  channel: () => canal,
  removeChannel: async () => "ok",
  storage: { from: () => ({ createSignedUrl: async () => vazio, upload: async () => vazio }) },
  functions: { invoke: async () => vazio },
} as never;
