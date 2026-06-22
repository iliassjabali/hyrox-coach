import { z } from 'zod';
import type { RawSessionInput } from '@hyrox/training';
import { router, publicProcedure } from '../trpc';

const rawSession = z.object({
  id: z.string().min(1),
  date: z.coerce.date(),
  durationSeconds: z.number().int().positive(),
  distanceMeters: z.number().nonnegative().optional(),
  averageHeartRate: z.number().optional(),
});

// Map zod output (T | undefined optionals) to the exact-optional domain DTO.
const toRaw = (s: z.infer<typeof rawSession>): RawSessionInput => ({
  id: s.id,
  date: s.date,
  durationSeconds: s.durationSeconds,
  ...(s.distanceMeters !== undefined ? { distanceMeters: s.distanceMeters } : {}),
  ...(s.averageHeartRate !== undefined ? { averageHeartRate: s.averageHeartRate } : {}),
});

export const trainingRouter = router({
  classifySessions: publicProcedure
    .input(z.object({ sessions: z.array(rawSession) }))
    .mutation(({ ctx, input }) =>
      ctx.training.classifySessions.execute({ sessions: input.sessions.map(toRaw) }),
    ),

  coachAthlete: publicProcedure
    .input(
      z.object({
        sessions: z.array(rawSession),
        weekStartingOn: z.coerce.date(),
        maxAttempts: z.number().int().positive().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.training.coachAthlete.execute({
        sessions: input.sessions.map(toRaw),
        weekStartingOn: input.weekStartingOn,
        ...(input.maxAttempts !== undefined ? { maxAttempts: input.maxAttempts } : {}),
      }),
    ),
});
