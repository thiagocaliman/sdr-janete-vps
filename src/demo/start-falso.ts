// "@tanstack/react-start" na demo: não há servidor. Toda função de servidor responde que não está
// disponível, sem chamar rede. O modo exemplo das telas não usa estas funções.
type Construtor = {
  middleware: (..._: unknown[]) => Construtor;
  inputValidator: (..._: unknown[]) => Construtor;
  validator: (..._: unknown[]) => Construtor;
  client: (..._: unknown[]) => Construtor;
  server: (..._: unknown[]) => Construtor;
  handler: (..._: unknown[]) => (..._: unknown[]) => Promise<{ ok: false; erro: "falha"; mensagem: string }>;
};

function construtor(): Construtor {
  const c: Construtor = {
    middleware: () => c,
    inputValidator: () => c,
    validator: () => c,
    client: () => c,
    server: () => c,
    handler: () => async () => ({ ok: false, erro: "falha", mensagem: "Indisponível na demo." }),
  };
  return c;
}

export const createServerFn = (..._: unknown[]) => construtor();
export const createMiddleware = (..._: unknown[]) => construtor();
export const createCsrfMiddleware = (..._: unknown[]) => construtor();
export const createStart = (..._: unknown[]) => ({});

/** "@tanstack/react-start/server" na demo: não há pedido. */
export const getRequest = () => {
  throw new Error("Indisponível na demo.");
};
