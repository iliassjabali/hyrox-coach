import { initTRPC } from '@trpc/server';
import type { Training } from '@hyrox/training/composition';

// The tRPC context holds the wired training use cases (composition root output).
export interface TrpcContext {
  training: Training;
}

const t = initTRPC.context<TrpcContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
