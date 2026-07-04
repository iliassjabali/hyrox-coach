// Eval 3 — Critic ablation.
// Runs the full pipeline R times on a fixed history and measures how often the
// Critic intervenes on the Coach's draft (rejects outright vs. forces a revision).
// "Without Critic" = the raw Coach draft would have been shown as-is; "with
// Critic" = drafts the Critic flags are revised or withheld.
// Usage: pnpm eval:ablation [labelled.csv] [R]
/* eslint-disable no-console */
import { AnthropicClassifierAdapter } from '../../infrastructure/llm/anthropic-classifier.adapter';
import { AnthropicCoachAdapter } from '../../infrastructure/llm/anthropic-coach.adapter';
import { AnthropicCriticAdapter } from '../../infrastructure/llm/anthropic-critic.adapter';
import { CoachAthleteUseCase } from '../../application/use-cases/coach-athlete.use-case';
import { InMemorySessionRepository, InMemoryRunLog } from '../../testing/index';
import { SystemClock } from '../../infrastructure/time/system-clock';
import {
  requireApiKey,
  loadLabelledCsv,
  defaultLabelledPath,
  evalModels,
  logModels,
  pct,
  writeResult,
  banner,
} from '../eval-shared';

const WEEK_STARTING = new Date('2026-06-29T00:00:00Z');

async function main(): Promise<void> {
  requireApiKey();
  const path = defaultLabelledPath();
  const r = Number(process.argv[3] ?? 8);
  const { raw } = loadLabelledCsv(path);

  banner('Eval 3 — Critic ablation');
  console.log(`history: ${path} (${raw.length} sessions), runs: ${r}`);
  const m = evalModels();
  logModels(m);

  let flagged = 0; // critic intervened on the first draft (revised or rejected)
  let rejectedOutright = 0; // never accepted within maxAttempts
  let revised = 0; // accepted only after >= 1 revision
  let totalAttempts = 0;
  let completed = 0;
  let failures = 0;

  for (let i = 0; i < r; i += 1) {
    const useCase = new CoachAthleteUseCase(
      new AnthropicClassifierAdapter(undefined, m.classifier),
      new AnthropicCoachAdapter(undefined, m.coach),
      new AnthropicCriticAdapter(undefined, m.critic),
      new InMemorySessionRepository(),
      new InMemoryRunLog(),
      new SystemClock(),
    );
    try {
      const out = await useCase.execute({ sessions: raw, weekStartingOn: WEEK_STARTING });
      completed += 1;
      totalAttempts += out.attempts;
      const intervened = out.attempts > 1 || !out.accepted;
      if (intervened) flagged += 1;
      if (!out.accepted) rejectedOutright += 1;
      else if (out.attempts > 1) revised += 1;
      console.log(`run ${i + 1}/${r}: accepted=${out.accepted}, attempts=${out.attempts}, criticIntervened=${intervened}`);
    } catch (e) {
      failures += 1;
      console.log(`run ${i + 1}/${r}: FAILED (${e instanceof Error ? e.message : e})`);
    }
  }

  const denom = completed || 1;
  const flaggedRate = flagged / denom;
  const rejectRate = rejectedOutright / denom;
  const reviseRate = revised / denom;

  console.log(`\nCompleted runs: ${completed}/${r} (failures: ${failures})`);
  console.log(`Drafts the Critic flagged (would have surfaced an unreviewed draft without it): ${flagged}/${completed} (${pct(flaggedRate)})`);
  console.log(`Critic rejected outright: ${pct(rejectRate)}`);
  console.log(`Critic revised (accepted after >=1 revision): ${pct(reviseRate)}`);
  console.log(`Mean attempts per completed run: ${(totalAttempts / denom).toFixed(2)}`);

  const out = writeResult('ablation', {
    history: path,
    runs: r,
    completed,
    failures,
    models: m,
    flaggedRate,
    rejectRate,
    reviseRate,
    meanAttempts: totalAttempts / denom,
  });
  console.log(`\nwrote ${out}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
