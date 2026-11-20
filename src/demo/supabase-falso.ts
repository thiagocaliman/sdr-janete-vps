// O cliente do Supabase na demo: um falso que não chama rede nenhuma. A conta é a do dono fictício
// da demo (o topo mostra o nome dele); sair não faz nada. Qualquer leitura do banco volta vazia.
import { DONO_DEMO } from "./negocio";

const USUARIO = {
  id: "demo-dono",
  email: DONO_DEMO.email,
  user_metadata: { nome: DONO_DEMO.nome },
};

const SESSAO = { user: USUARIO, access_token: "demo", refresh_token: "demo", expires_in: 3600, token_type: "bearer" };

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

export const supabase = {
  auth: {
    getUser: async () => ({ data: { user: USUARIO }, error: null }),
    getSession: async () => ({ data: { session: SESSAO }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signOut: async () => vazio,
    signInWithPassword: async () => ({ data: null, error: { message: "Na demo não há login." } }),
    updateUser: async () => ({ data: null, error: { message: "Na demo não dá para trocar a senha." } }),
  },
  from: () => consultaVazia(),
  rpc: () => consultaVazia(),
  channel: () => canal,
  removeChannel: async () => "ok",
  storage: { from: () => ({ createSignedUrl: async () => vazio, upload: async () => vazio }) },
  functions: { invoke: async () => vazio },
} as never;
