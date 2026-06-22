import { router } from '../trpc';
import { trainingRouter } from './training.router';

export const appRouter = router({
  training: trainingRouter,
});

export type AppRouter = typeof appRouter;
