// Build das demos públicas da Janete, como sites estáticos, sem banco, sem WhatsApp e sem IA. Não
// entra no build do app (vite.config.ts).
//   vite build --config vite.demo.config.ts                  → suaagenc.ia.br/janete-demo (o painel)
//   vite build --config vite.demo.config.ts --mode cadastro  → suaagenc.ia.br/janete-demo-cadastro
//                                                              (criar conta, entrar e o onboarding)
// Troca módulos pelos da demo: os dados de exemplo (o negócio fictício de voo panorâmico), o Contexto
// de exemplo, a lista de modelos e o cliente do Supabase (um falso, que não chama nada).
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";

const src = path.resolve(__dirname, "src");
const TROCAS: Record<string, string> = {
  [path.join(src, "features/plataforma/exemplo/dados.ts")]: path.join(src, "demo/exemplo-dados.ts"),
  [path.join(src, "features/plataforma/contexto/dados.ts")]: path.join(src, "demo/contexto-dados.ts"),
  [path.join(src, "integrations/supabase/client.ts")]: path.join(src, "demo/supabase-falso.ts"),
  [path.join(src, "features/servidor/listar-modelos.functions.ts")]: path.join(src, "demo/listar-modelos-falso.ts"),
};

const VAZIO = "\0janete-demo-servidor-vazio";

function trocarModulos(BASE: string): Plugin {
  return {
    name: "janete-demo-trocas",
    enforce: "pre",
    async resolveId(fonte, importador, opcoes) {
      // Não há servidor na demo: o TanStack Start (e o getRequest dele) vira um falso.
      if (/^@tanstack\/react-start(\/.*)?$/.test(fonte)) return path.join(src, "demo/start-falso.ts");
      if (!importador || importador.startsWith(path.join(src, "demo"))) return null;
      // Só caminhos do projeto (o "@/" já chega aqui trocado pelo caminho inteiro).
      if (!fonte.startsWith(".") && !fonte.startsWith("@/") && !path.isAbsolute(fonte)) return null;
      const r = await this.resolve(fonte, importador, { ...opcoes, skipSelf: true });
      if (!r) return null;
      // No Windows o disco ignora maiúsculas: "./Rio" achava rio.ts antes de Rio.tsx.
      const pedido = path.basename(fonte);
      const real = fs.existsSync(r.id) ? fs.realpathSync.native(r.id) : r.id;
      const achado = path.basename(real).replace(/\.[^.]+$/, "");
      if (fonte.startsWith(".") && achado !== pedido && achado.toLowerCase() === pedido.toLowerCase()) {
        const tsx = path.resolve(path.dirname(importador), `${fonte}.tsx`);
        if (fs.existsSync(tsx)) return tsx;
      }
      // Código de servidor (*.server.ts) não vai para a página pública: vira um módulo vazio.
      if (/\.server\.tsx?$/.test(r.id)) return VAZIO;
      const troca = TROCAS[path.normalize(r.id)];
      return troca ?? null;
    },
    load(id) {
      return id === VAZIO ? "export {};" : null;
    },
    // As imagens do public/ citadas no código como "/brand/..." ganham o prefixo da demo.
    transform(codigo, id) {
      if (!path.normalize(id).startsWith(src) || !/\.(tsx?|jsx?)$/.test(id)) return null;
      let novo = codigo.replace(/(["'`])\/(brand|logos|fonts)\//g, `$1${BASE}$2/`);
      // O cartão do Contexto no Dashboard do exemplo: a demo tem os 8 campos, na versão 3.
      novo = novo.replace("{ preenchidos: 6, total: 8, versao: 6 }", "{ preenchidos: 8, total: 8, versao: 3 }");
      return novo === codigo ? null : { code: novo, map: null };
    },
  };
}

export default defineConfig(({ mode }) => {
  const cadastro = mode === "cadastro";
  const pasta = cadastro ? "janete-demo-cadastro" : "janete-demo";
  const BASE = `/${pasta}/`;
  return {
    root: path.resolve(__dirname, "demo"),
    base: BASE,
    publicDir: path.resolve(__dirname, "public"),
    css: { transformer: "lightningcss" },
    resolve: { alias: { "@": src } },
    define: {
      "process.env": "{}",
      "import.meta.env.VITE_DEMO_MODO": JSON.stringify(cadastro ? "cadastro" : "painel"),
    },
    plugins: [trocarModulos(BASE), tailwindcss(), viteReact()],
    build: { outDir: path.resolve(__dirname, `dist-demo/${pasta}`), emptyOutDir: true },
  };
});
