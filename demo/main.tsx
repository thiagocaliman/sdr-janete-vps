// A demo pública do painel da Janete: o Layout no modo exemplo, com o negócio fictício da demo.
// Roteador por hash (#/app/chat): funciona em hospedagem estática, sem regra de reescrita.
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
import { LayoutExemplo } from "@/features/plataforma/Layout";
import { TelaChat, validarBuscaChat } from "@/features/plataforma/chat";
import { TelaConfiguracao } from "@/features/plataforma/configuracao";
import { TelaContatos, validarBuscaContatos } from "@/features/plataforma/contatos";
import { TelaContexto } from "@/features/plataforma/contexto";
import { TelaDashboard } from "@/features/plataforma/dashboard/TelaDashboard";
import { TelaEquipe } from "@/features/plataforma/equipe";
import { RotaKanban } from "@/features/plataforma/kanban/RotaKanban";
import { validarBuscaKanban } from "@/features/plataforma/kanban/endereco";

import { prepararAbaDemo } from "@/demo/preparar";

prepararAbaDemo();

const queryClient = new QueryClient();

const raiz = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <VooJaneteProvider>
        <Outlet />
      </VooJaneteProvider>
      <Toaster />
    </QueryClientProvider>
  ),
});

const inicio = createRoute({
  getParentRoute: () => raiz,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/app/chat", replace: true });
  },
});

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
  app.addChildren([appInicio, chat, kanban, contatos, contexto, dashboard, equipe, configuracao]),
]);

const router = createRouter({ routeTree: arvore, history: createHashHistory(), defaultPreload: "intent" });

createRoot(document.getElementById("raiz")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
