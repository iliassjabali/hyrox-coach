// Eval 4 — Prompt-variant comparison.
// Classifies the history once, then for each Coach system-prompt variant runs
// Coach -> Critic K times and reports the Critic's approval rate per variant.
// Usage: pnpm eval:prompts [labelled.csv] [K]
/* eslint-disable no-console */
import { AnthropicClassifierAdapter } from '../../infrastructure/llm/anthropic-classifier.adapter';
import { AnthropicCoachAdapter } from '../../infrastructure/llm/anthropic-coach.adapter';
import { AnthropicCriticAdapter } from '../../infrastructure/llm/anthropic-critic.adapter';
import { WorkoutSession } from '../../domain/workout-session';
import {
  requireApiKey,
  loadLabelledCsv,
  defaultLabelledPath,
  evalModels,
  logModels,
  COACH_PROMPT_VARIANTS,
  pct,
  writeResult,
  banner,
} from '../eval-shared';

const WEEK_STARTING = new Date('2026-06-29T00:00:00Z');

async function main(): Promise<void> {
  requireApiKey();
  const path = defaultLabelledPath();
  const k = Number(process.argv[3] ?? 4);
  const { raw } = loadLabelledCsv(path);

  banner('Eval 4 — Prompt-variant comparison');
  console.log(`history: ${path} (${raw.length} sessions), runs per variant: ${k}`);
  const m = evalModels();
  logModels(m);

  // Classify once, then reuse the classified sessions for every variant/run.
  const { classifications } = await new AnthropicClassifierAdapter(undefined, m.classifier).classify(raw);
  const typeById = new Map(classifications.map((c) => [c.id, c.type]));
  const sessions = raw.map((s) =>
    WorkoutSession.create({
      id: s.id,
      date: s.date,
      type: typeById.get(s.id)!,
      durationSeconds: s.durationSeconds,
      ...(s.distanceMeters !== undefined ? { distanceMeters: s.distanceMeters } : {}),
      ...(s.averageHeartRate !== undefined ? { averageHeartRate: s.averageHeartRate } : {}),
    }),
  );

  const critic = new AnthropicCriticAdapter(undefined, m.critic);
  const results: { variant: string; approvalRate: number; approvals: number; runs: number }[] = [];

  for (const variant of COACH_PROMPT_VARIANTS) {
    const coach = new AnthropicCoachAdapter(undefined, m.coach, variant.system);
    let approvals = 0;
    let completed = 0;
    let failures = 0;
    for (let i = 0; i < k; i += 1) {
      try {
        const { plan } = await coach.generatePlan({ sessions, weekStartingOn: WEEK_STARTING });
        const { verdict } = await critic.review({ plan, sessions });
        completed += 1;
        if (verdict.isAccepted) approvals += 1;
      } catch (e) {
        failures += 1;
        console.log(`  variant "${variant.key}" run ${i + 1}/${k}: FAILED (${e instanceof Error ? e.message : e})`);
      }
    }
    const approvalRate = approvals / (completed || 1);
    results.push({ variant: variant.key, approvalRate, approvals, runs: completed });
    console.log(`variant "${variant.key}": Critic approval ${approvals}/${completed} (${pct(approvalRate)}), failures=${failures}`);
  }

  const out = writeResult('prompt-variants', { history: path, runsPerVariant: k, results });
  console.log(`\nwrote ${out}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
