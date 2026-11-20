// As demos públicas da Janete (roteador por hash, para hospedagem estática, sem regra de reescrita):
// - painel (janete-demo): o painel no modo exemplo, com o negócio fictício da demo;
// - cadastro (janete-demo-cadastro): Criar conta, Entrar e as 6 etapas do onboarding, simuladas, e
//   depois o mesmo painel.
// Nada vai para servidor nenhum: login, chaves e conexão são simulados no navegador.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { StrictMode, useCallback } from "react";
import { createRoot } from "react-dom/client";

import "@/styles.css";
import { VooJaneteProvider } from "@/components/janete/VooJanete";
import { Toaster } from "@/components/ui/sonner";
import { CriarConta, Entrar, PalcoConta } from "@/features/conta";
import { Onboarding } from "@/features/onboarding/Onboarding";
import { onboardingConcluido } from "@/features/onboarding/estado";
import { LayoutExemplo } from "@/features/plataforma/Layout";
import { TelaChat, validarBuscaChat } from "@/features/plataforma/chat";
import { TelaConfiguracao } from "@/features/plataforma/configuracao";
import { TelaContatos, validarBuscaContatos } from "@/features/plataforma/contatos";
import { TelaContexto } from "@/features/plataforma/contexto";
import { TelaDashboard } from "@/features/plataforma/dashboard/TelaDashboard";
import { TelaEquipe } from "@/features/plataforma/equipe";
import { RotaKanban } from "@/features/plataforma/kanban/RotaKanban";
import { validarBuscaKanban } from "@/features/plataforma/kanban/endereco";

import { criarDadosOnboardingDemo } from "@/demo/onboarding-falso";
import { MODO_DEMO, prepararAbaDemo } from "@/demo/preparar";
import { contaDemoAtiva } from "@/demo/supabase-falso";

prepararAbaDemo();

const queryClient = new QueryClient();

const raiz = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <VooJaneteProvider>
        <Outlet />
      </VooJaneteProvider>
      <Toaster />
      <SeloDemo />
    </QueryClientProvider>
  ),
});

/** O selo fixo da demo: lembra que nada é enviado nem salvo. Não pega clique. */
function SeloDemo() {
  return (
    <div
      role="note"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "max(10px, env(safe-area-inset-bottom, 0px))",
        transform: "translateX(-50%)",
        zIndex: 2147483000,
        pointerEvents: "none",
        padding: "5px 12px",
        borderRadius: 999,
        background: "rgba(17, 17, 17, 0.78)",
        color: "#fff",
        font: "500 12px/1.3 system-ui, sans-serif",
        whiteSpace: "nowrap",
        maxWidth: "calc(100vw - 32px)",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      Demonstração: dados fictícios, nada é enviado nem salvo
    </div>
  );
}

/**
 * O "/" da demo, como o do app: sem conta, a tela de entrada (no cadastro, Criar conta); com conta e o
 * onboarding aberto, o onboarding; senão, o painel.
 */
const inicio = createRoute({
  getParentRoute: () => raiz,
  path: "/",
  beforeLoad: () => {
    if (MODO_DEMO === "painel") throw redirect({ to: "/app/chat", replace: true });
    if (!contaDemoAtiva()) throw redirect({ to: "/criar-conta", replace: true });
    if (!onboardingConcluido()) throw redirect({ to: "/onboarding", replace: true });
    throw redirect({ to: "/app/chat", replace: true });
  },
});

const conta = createRoute({
  getParentRoute: () => raiz,
  id: "_conta",
  component: () => (
    <PalcoConta>
      <Outlet />
    </PalcoConta>
  ),
});
const entrar = createRoute({ getParentRoute: () => conta, path: "/entrar", component: Entrar });
const criarConta = createRoute({ getParentRoute: () => conta, path: "/criar-conta", component: CriarConta });

const dadosOnboarding = criarDadosOnboardingDemo();
function PaginaOnboarding() {
  const navigate = useNavigate();
  return <Onboarding dados={dadosOnboarding} aoConcluir={() => void navigate({ to: "/app", replace: true })} />;
}
const onboarding = createRoute({ getParentRoute: () => raiz, path: "/onboarding", component: PaginaOnboarding });

const app = createRoute({ getParentRoute: () => raiz, path: "/app", component: () => <LayoutExemplo /> });

const appInicio = createRoute({
  getParentRoute: () => app,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/app/chat", replace: true });
  },
});

function PaginaChat() {
  const { conversa } = useSearch({ strict: false }) as { conversa?: string };
  return <TelaChat conversaInicial={conversa} />;
}
const chat = createRoute({ getParentRoute: () => app, path: "/chat", validateSearch: validarBuscaChat, component: PaginaChat });

function PaginaKanban() {
  const { contato } = useSearch({ strict: false }) as { contato?: string };
  return <RotaKanban contato={contato} />;
}
const kanban = createRoute({ getParentRoute: () => app, path: "/kanban", validateSearch: validarBuscaKanban, component: PaginaKanban });

function PaginaContatos() {
  const { contato } = useSearch({ strict: false }) as { contato?: string };
  const navigate = useNavigate();
  const irPara = useCallback(
    (id: string | null, opcoes?: { substituir?: boolean }) => {
      void navigate({
        to: "/app/contatos",
        search: { contato: id ?? undefined } as never,
        resetScroll: false,
        replace: opcoes?.substituir === true,
      });
    },
    [navigate],
  );
  return <TelaContatos contatoId={contato ?? null} irPara={irPara} />;
}
const contatos = createRoute({ getParentRoute: () => app, path: "/contatos", validateSearch: validarBuscaContatos, component: PaginaContatos });

const contexto = createRoute({ getParentRoute: () => app, path: "/contexto", component: TelaContexto });
const dashboard = createRoute({ getParentRoute: () => app, path: "/dashboard", component: TelaDashboard });
const equipe = createRoute({ getParentRoute: () => app, path: "/equipe", component: TelaEquipe });
const configuracao = createRoute({ getParentRoute: () => app, path: "/configuracao", component: TelaConfiguracao });

const arvore = raiz.addChildren([
  inicio,
  conta.addChildren([entrar, criarConta]),
  onboarding,
  app.addChildren([appInicio, chat, kanban, contatos, contexto, dashboard, equipe, configuracao]),
]);

const router = createRouter({ routeTree: arvore, history: createHashHistory(), defaultPreload: "intent" });

createRoot(document.getElementById("raiz")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
