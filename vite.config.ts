// Configuração do build: TanStack Start (React com renderização no servidor) compilado para um
// servidor Node (Nitro, preset node_server), com Tailwind 4 e o atalho "@" para src/.
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  // As variáveis VITE_* (URL e chave pública do Supabase) entram no código do navegador.
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const define = Object.fromEntries(
    Object.entries(env).map(([chave, valor]) => [`import.meta.env.${chave}`, JSON.stringify(valor)]),
  );

  return {
    define,
    css: { transformer: "lightningcss" },
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
    server: { host: "::", port: 8080 },
    plugins: [
      tailwindcss(),
      tanstackStart({
        // Código de servidor nunca vai para o navegador.
        importProtection: { behavior: "error", client: { files: ["**/server/**"], specifiers: ["server-only"] } },
        server: { entry: "server" },
      }),
      ...(command === "build" ? [nitro({ preset: "node_server" })] : []),
      viteReact(),
    ],
  };
});
