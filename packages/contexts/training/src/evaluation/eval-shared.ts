// Shared helpers for the objective-evaluation runners (CM3070 Chapter 4).
//
// These scripts make LIVE Claude calls via the Vercel AI SDK, which reads
// ANTHROPIC_API_KEY from the environment. They are deliberately kept OUT of the
// unit-test suite (no network in tests) and are run on demand via `pnpm eval:*`.
//
// Athlete data is sensitive: real labelled sets live under the gitignored data/
// directory. A small synthetic fixture is committed so the harness runs
// end-to-end without any private data.

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SessionType } from '../domain/session-type';
import { MODELS } from '../infrastructure/llm/models';
import type { Labelled } from './classifier-metrics';
import type { RawSessionInput } from '../application/dto/raw-session-input';

const HERE = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Repo root + env loading (dependency-free; Node has no dotenv built in here).
// ---------------------------------------------------------------------------

export function repoRoot(): string {
  let dir = HERE;
  for (let i = 0; i < 8; i += 1) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) return dir;
    dir = resolve(dir, '..');
  }
  return resolve(HERE, '../../../../..');
}

// Loads KEY=VALUE pairs from the repo-root .env into process.env (without
// overwriting anything already set). No-ops if .env is absent.
export function loadEnv(): void {
  const envPath = join(repoRoot(), '.env');
  if (!existsSync(envPath)) return;
  for (const rawLine of readFileSync(envPath, 'utf8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

export function requireApiKey(): void {
  loadEnv();
  if (!process.env['AI_GATEWAY_API_KEY'] && !process.env['ANTHROPIC_API_KEY']) {
    throw new Error(
      'No LLM credentials found. Set AI_GATEWAY_API_KEY (Vercel AI Gateway) or ' +
        'ANTHROPIC_API_KEY in the repo-root .env (see .env.example). With the gateway, ' +
        'calls route via Vercel; with the Anthropic key they go direct to the Console.',
    );
  }
}

// ---------------------------------------------------------------------------
// Labelled dataset loading.
// ---------------------------------------------------------------------------

export interface LabelledDataset {
  raw: RawSessionInput[];
  labels: Labelled[];
}

// CSV columns: id,date,durationSeconds[,distanceMeters][,averageHeartRate],label
// `label` must be one of: run | sled | burpees | mixed.
export function loadLabelledCsv(path: string): LabelledDataset {
  const text = readFileSync(path, 'utf8').trim();
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 2) throw new Error(`labelled CSV has no data rows: ${path}`);

  const header = lines[0]!.split(',').map((h) => h.trim());
  const col = (name: string): number => header.indexOf(name);
  for (const required of ['id', 'date', 'durationSeconds', 'label']) {
    if (col(required) === -1) throw new Error(`labelled CSV missing column "${required}": ${path}`);
  }

  const raw: RawSessionInput[] = [];
  const labels: Labelled[] = [];
  for (const line of lines.slice(1)) {
    const cells = line.split(',').map((c) => c.trim());
    const id = cells[col('id')]!;
    const date = new Date(cells[col('date')]!);
    const durationSeconds = Number(cells[col('durationSeconds')]);
    const distance = col('distanceMeters') !== -1 ? cells[col('distanceMeters')] : '';
    const hr = col('averageHeartRate') !== -1 ? cells[col('averageHeartRate')] : '';

    const session: RawSessionInput = { id, date, durationSeconds };
    if (distance) session.distanceMeters = Number(distance);
    if (hr) session.averageHeartRate = Number(hr);

    raw.push(session);
    labels.push({ id, type: SessionType.of(cells[col('label')]!) });
  }
  return { raw, labels };
}

// Per-role model ids, overridable via env so a single harness can run either the
// true design tiers (Haiku/Opus/Sonnet) or a substitute (e.g. Haiku across roles
// for a $0 feasibility run when paid tiers are unavailable).
export interface EvalModels {
  classifier: string;
  coach: string;
  critic: string;
}

export function evalModels(): EvalModels {
  return {
    classifier: process.env['EVAL_CLASSIFIER_MODEL'] ?? MODELS.classifier,
    coach: process.env['EVAL_COACH_MODEL'] ?? MODELS.coach,
    critic: process.env['EVAL_CRITIC_MODEL'] ?? MODELS.critic,
  };
}

export function logModels(m: EvalModels): void {
  // eslint-disable-next-line no-console
  console.log(`models: classifier=${m.classifier} coach=${m.coach} critic=${m.critic}`);
}

export function defaultLabelledPath(): string {
  // CLI arg wins; then an env override; then the committed synthetic fixture.
  // A "-" or empty positional arg means "use the default" (lets callers pass a
  // run count without naming a path).
  const arg = process.argv[2];
  if (arg && arg !== '-') return arg;
  const env = process.env['EVAL_LABELLED'];
  if (env) return env;
  return join(HERE, 'fixtures', 'labelled-sessions.example.csv');
}

// ---------------------------------------------------------------------------
// Coach prompt variants (for the prompt-variant ablation).
// ---------------------------------------------------------------------------

export const COACH_PROMPT_VARIANTS: { key: string; system: string }[] = [
  {
    key: 'minimal',
    system: 'Produce a one-week Hyrox training plan. Each session has a day (0=Mon..6=Sun), a type (run|sled|burpees|mixed) and a short focus.',
  },
  {
    key: 'hyrox',
    system:
      'You are a Hyrox coach. Given recent training history, produce a balanced, ' +
      'progressive weekly plan. Each session has a day (0=Mon..6=Sun), a type ' +
      '(run|sled|burpees|mixed) and a short focus.',
  },
  {
    key: 'safety',
    system:
      'You are a Hyrox coach. Given recent training history, produce a balanced, ' +
      'progressive weekly plan. Each session has a day (0=Mon..6=Sun), a type ' +
      '(run|sled|burpees|mixed) and a short focus. Prioritise athlete safety: avoid ' +
      'consecutive maximum-intensity days, include adequate recovery, and progress ' +
      'training load gradually rather than in large jumps.',
  },
];

// ---------------------------------------------------------------------------
// Output helpers.
// ---------------------------------------------------------------------------

// A stable string for a weekly plan, used as the consistency signature.
export function planTypeSignature(sessions: { day: number; type: string }[]): string {
  return [...sessions]
    .sort((a, b) => a.day - b.day)
    .map((s) => `${s.day}:${s.type}`)
    .join('|');
}

export function planFullSignature(
  sessions: { day: number; type: string; focus: string }[],
): string {
  return [...sessions]
    .sort((a, b) => a.day - b.day)
    .map((s) => `${s.day}:${s.type}:${s.focus.toLowerCase().trim()}`)
    .join('|');
}

export function pct(n: number, digits = 1): string {
  return `${(n * 100).toFixed(digits)}%`;
}

// Writes a JSON result under the gitignored data/eval-results/ directory and
// returns the path. Aggregate metrics only — never raw athlete data.
export function writeResult(name: string, data: unknown): string {
  const dir = join(repoRoot(), 'data', 'eval-results');
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `${name}.json`);
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return path;
}

export function banner(title: string): void {
  // eslint-disable-next-line no-console
  console.log(`\n=== ${title} ===`);
}
