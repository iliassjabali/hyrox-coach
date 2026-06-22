import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, createProductionContext } from '@hyrox/trpc';

// tRPC HTTP handler — the driving adapter's transport. createProductionContext is the
// composition root (real Drizzle + Anthropic adapters).
const handler = (req: Request): Promise<Response> =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createProductionContext(),
  });

export { handler as GET, handler as POST };
