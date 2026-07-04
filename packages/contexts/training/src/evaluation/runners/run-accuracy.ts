// Eval 1 — Classifier accuracy.
// Classifies a labelled session set with the live Haiku Classifier and reports
// overall accuracy + a confusion matrix. Usage: pnpm eval:accuracy [labelled.csv]
/* eslint-disable no-console */
import { AnthropicClassifierAdapter } from '../../infrastructure/llm/anthropic-classifier.adapter';
import { accuracy, confusionMatrix } from '../classifier-metrics';
import type { Labelled } from '../classifier-metrics';
import {
  requireApiKey,
  loadLabelledCsv,
  defaultLabelledPath,
  pct,
  writeResult,
  banner,
} from '../eval-shared';

const TYPES = ['run', 'sled', 'burpees', 'mixed'] as const;

async function main(): Promise<void> {
  requireApiKey();
  const path = defaultLabelledPath();
  const { raw, labels } = loadLabelledCsv(path);

  banner('Eval 1 — Classifier accuracy');
  console.log(`labelled set: ${path} (${labels.length} sessions)`);

  const classifier = new AnthropicClassifierAdapter();
  const { classifications } = await classifier.classify(raw);
  const predictions: Labelled[] = classifications.map((c) => ({ id: c.id, type: c.type }));

  const acc = accuracy(predictions, labels);
  const matrix = confusionMatrix(predictions, labels);

  console.log(`\nOverall accuracy: ${pct(acc)} (${Math.round(acc * labels.length)}/${labels.length})`);
  console.log('\nConfusion matrix (rows = actual, cols = predicted):');
  console.log(['actual\\pred', ...TYPES].join('\t'));
  for (const actual of TYPES) {
    console.log([actual, ...TYPES.map((p) => matrix[actual][p])].join('\t'));
  }

  const out = writeResult('accuracy', {
    labelledSet: path,
    n: labels.length,
    accuracy: acc,
    confusionMatrix: matrix,
  });
  console.log(`\nwrote ${out}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
