// Eval 2 — Output consistency.
// Runs the full Classifier -> Coach -> Critic pipeline N times on one fixed
// athlete history and reports how stable the resulting weekly plan is across
// runs (modal-plan fraction). Usage: pnpm eval:consistency [labelled.csv] [N]
/* eslint-disable no-console */
import { AnthropicClassifierAdapter } from '../../infrastructure/llm/anthropic-classifier.adapter';
import { AnthropicCoachAdapter } from '../../infrastructure/llm/anthropic-coach.adapter';
import { AnthropicCriticAdapter } from '../../infrastructure/llm/anthropic-critic.adapter';
import { CoachAthleteUseCase } from '../../application/use-cases/coach-athlete.use-case';
import { InMemorySessionRepository, InMemoryRunLog } from '../../testing/index';
import { SystemClock } from '../../infrastructure/time/system-clock';
import { consistency } from '../classifier-metrics';
import {
  requireApiKey,
  loadLabelledCsv,
  defaultLabelledPath,
  evalModels,
  logModels,
  planTypeSignature,
  planFullSignature,
  pct,
  writeResult,
  banner,
} from '../eval-shared';

const WEEK_STARTING = new Date('2026-06-29T00:00:00Z');

async function main(): Promise<void> {
  requireApiKey();
  const path = defaultLabelledPath();
  const n = Number(process.argv[3] ?? 5);
  const { raw } = loadLabelledCsv(path);

  banner('Eval 2 — Output consistency');
  console.log(`history: ${path} (${raw.length} sessions), runs: ${n}`);
  const m = evalModels();
  logModels(m);

  const typeSignatures: string[] = [];
  const fullSignatures: string[] = [];
  let totalCost = { inputTokens: 0, outputTokens: 0 };
  let failures = 0;

  for (let i = 0; i < n; i += 1) {
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
      typeSignatures.push(planTypeSignature(out.plan.sessions));
      fullSignatures.push(planFullSignature(out.plan.sessions));
      totalCost = {
        inputTokens: totalCost.inputTokens + out.cost.inputTokens,
        outputTokens: totalCost.outputTokens + out.cost.outputTokens,
      };
      console.log(`run ${i + 1}/${n}: ${out.plan.sessions.length} sessions, accepted=${out.accepted}, attempts=${out.attempts}`);
    } catch (e) {
      failures += 1;
      console.log(`run ${i + 1}/${n}: FAILED (${e instanceof Error ? e.message : e})`);
    }
  }

  const completed = typeSignatures.length;
  const typeConsistency = consistency(typeSignatures);
  const fullConsistency = consistency(fullSignatures);
  const uniqueTypePlans = new Set(typeSignatures).size;

  console.log(`\nCompleted runs: ${completed}/${n} (schema/pipeline failures: ${failures})`);
  console.log(`Session-type stability (day->type identical, modal fraction of completed): ${pct(typeConsistency)}`);
  console.log(`Full-plan stability (day->type->focus identical): ${pct(fullConsistency)}`);
  console.log(`Distinct session-type plans across ${completed} completed runs: ${uniqueTypePlans}`);
  console.log(`Total token cost: in=${totalCost.inputTokens} out=${totalCost.outputTokens}`);

  const out = writeResult('consistency', {
    history: path,
    runs: n,
    completed,
    failures,
    models: m,
    typeConsistency,
    fullConsistency,
    distinctTypePlans: uniqueTypePlans,
    typeSignatures,
    totalCost,
  });
  console.log(`\nwrote ${out}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
