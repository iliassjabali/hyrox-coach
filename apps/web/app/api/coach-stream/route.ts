import { createProductionContext } from '@hyrox/trpc';

// Node runtime: the orchestrator uses the AI SDK + Drizzle adapters.
export const runtime = 'nodejs';

interface RawSession {
  id: string;
  date: string;
  durationSeconds: number;
  distanceMeters?: number;
  averageHeartRate?: number;
}

// Streams the Classify -> Coach -> Critic pipeline as Server-Sent Events so the UI
// can show live stage progress instead of one long blocking request.
export async function POST(req: Request): Promise<Response> {
  const body = (await req.json()) as { sessions: RawSession[]; weekStartingOn: string };
  const sessions = body.sessions.map((s) => ({ ...s, date: new Date(s.date) }));
  const weekStartingOn = new Date(body.weekStartingOn);

  const ctx = await createProductionContext();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown): void =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      try {
        const result = await ctx.training.coachAthlete.execute({
          sessions,
          weekStartingOn,
          onProgress: (event) => send({ kind: 'progress', event }),
        });
        send({ kind: 'result', result });
      } catch (err) {
        send({ kind: 'error', message: err instanceof Error ? err.message : 'Something went wrong' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
