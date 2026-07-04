# Project Journal

One paragraph per week. This is the source for **exam Q3 ("lessons learned")** —
keep it honest and current: what you did, what blocked you, what you learned, what's next.

> Tip: run `/journal` to append a new week's entry from a template.

---

## Week 3 (Setup + Foundation)

> Draft facts recorded as work happened — expand the reflective parts in your own voice for the exam.

_What I did:_ Created the private GitHub repo `hyrox-coach` with project docs (AGENTS.md
feature catalogue, CLAUDE.md, this journal, the 22-week plan). Decided the build
architecture (brainstormed + spec'd): a Turborepo + pnpm **monorepo** with a **hexagonal
`@hyrox/training` bounded context** (domain / application ports & use-cases / infrastructure
adapters), Drizzle for persistence, tRPC as the driving adapter, the three Claude models
(Haiku/Opus/Sonnet) as driven adapters behind ports. Wrote a reusable scaffold script
(`scripts/scaffold-hexagon.sh`) + a `/scaffold-context` skill. Began the domain layer with
TDD throughout: domain (`SessionType`, `WorkoutSession`, `WeeklyPlan`, `PlanVerdict`,
Banister `TRIMP`), the application layer (`ClassifySessions` + the `CoachAthlete`
orchestrator with classify→coach→critic, retry on critic rejection, and token-cost
tracking), and the infrastructure adapters (Strava CSV parser, `SystemClock`, the three
Anthropic Haiku/Opus/Sonnet adapters behind an injectable seam, and Drizzle+libSQL
repositories). Wired it together: `@hyrox/trpc` (router + composition root) and a Next.js
`apps/web` with a coaching demo page and safety disclaimer. **48 tests green** (red→green
each), 4 typecheck + 3 lint tasks pass, `next build` succeeds, dependency rule enforced by
ESLint.

_Blockers / surprises:_ The `.gitignore` `out/` pattern (meant for Next.js build output)
silently ignored the `application/ports/out/` directory — caught it before it caused a
broken clone; fixed by root-anchoring the build-output patterns.

_Lessons / decisions:_ In hexagonal TS, the "Zod schemas as contracts" idea from the
proposal becomes **domain types**, with Zod validating only at the boundaries (tRPC input,
LLM output). Keeps the domain pure and the swap test intact.

_Next week:_ Run the system against real Strava data with an API key; add ACWR + the
fitness/fatigue model to `TrainingLoad`; build the labelled set + the evaluation harness
(classifier accuracy, ablation with/without Critic, consistency) — the graded core; richer
plan UI + CSV upload; deploy to Vercel.

---

## Week 4 (Preliminary report + evaluation harness)

_What I did:_ Assembled the full preliminary report in LaTeX (`cm3070-prelim-final/`):
introduction, literature review, design, and the new feature-prototype chapter, plus a
TikZ architecture diagram drawn inline in the design chapter (ingest → feature-eng →
Classifier/Coach/Critic under the orchestrator band, with the reject/revise feedback loop).
Built the **objective-evaluation harness** on top of the already-TDD'd metric functions
(`accuracy`, `confusionMatrix`, `consistency`): four runnable scripts under
`src/evaluation/runners/` (`run-accuracy`, `run-consistency`, `run-ablation`,
`run-prompt-variants`), wired as `pnpm eval:*` via `tsx`, with a dependency-free `.env`
loader, a labelled-CSV loader, and a committed synthetic fixture so the harness runs
end-to-end without private data. Made the Coach adapter's system prompt injectable
(red→green test) so the prompt-variant ablation can compare minimal/Hyrox/safety prompts on
identical inputs. **52 tests green** (was 51), typecheck clean, runners verified under `tsx`
(env guard + CSV parse) short of the live LLM call.

_Blockers / surprises:_ The Vercel AI SDK's `anthropic()` provider authenticates only with
an `ANTHROPIC_API_KEY` from the Console — a Claude Pro/Max subscription cannot drive SDK
calls. So producing the real Chapter-4 numbers is gated on buying a small amount of API
credit (the whole eval costs well under \$1). Also reconciled the report prose: the design
chapter described richer schemas (`intensityZone`, `durationMinutes`, `hybrid`/`strength`
labels) than the prototype actually implements (`{day, type, focus}`; labels
run/sled/burpees/mixed), so Chapter 4's accuracy + consistency subsections were rewritten to
match what the runners actually measure.

_Lessons / decisions:_ Eval runners are I/O glue around pure, already-tested metric
functions — keeping the network at the edge (runners) and the metrics pure keeps the graded
core unit-testable. The labelled set stays gitignored (health data); a synthetic fixture
gives reproducibility for the marker.

_Next week:_ Buy API credit, run `pnpm eval:all` on a real labelled set, fill the six `XX`
placeholders in Chapter 4, trim the report to <6000 words, verify citations, and record the
3–5 min MP4 prototype demo.

---

## Week 5 (True model tiers, streaming demo, report finalisation)

_Done:_ Switched the pipeline from the Vercel AI Gateway (whose free tier only granted
Haiku) to a **direct Anthropic Console key**, so the three roles now run on their true design
tiers — **Classifier = Haiku, Coach = Opus, Critic = Sonnet**. Added a model-resolution seam
(`resolveModels`): route through the gateway when `AI_GATEWAY_API_KEY` is set, otherwise the
direct `anthropic()` provider, with `EVAL_*_MODEL` overrides for cheap runs (both paths
TDD'd). Hardened structured output: Opus intermittently returns the plan as a JSON *string*
inside the `sessions` field (Haiku never did), which failed schema validation and crashed the
run — fixed with a `z.preprocess` recovery in the Coach adapter plus a bounded `retryOnError`
on schema-generation failures. Finalised the **preliminary report**: filled all six Chapter-4
`XX` placeholders with real harness numbers (synthetic labelled set; Coach/Critic on a Haiku
feasibility substitution, flagged honestly), added the confusion-matrix table and the TikZ
architecture figure, wrote the AI-use declaration, trimmed the body to <6000 words, and got
Turnitin similarity down to ~2% (structural: headings/references). Built the **streaming
demo**: added a `reviewing` stage to `CoachProgress` and an SSE route so the Next.js page
renders the pipeline live (classify → coach → critic-reject-with-reasons → re-coach →
approve), then restyled the UI (CSS module: agent pills, timeline with status dots, result
card with weekday badges + session-type chips). **61 tests green**, typecheck clean; the
true-tier web demo verified end-to-end in the browser (accepted after 2 attempts, ~9k tokens).

_Blockers / surprises:_ The Opus double-stringification was subtle — the plan *content* was
valid, only its serialisation was wrong — so the fix belongs in the adapter/orchestrator
(reliability layer), not the prompt. Confirmed the residual Turnitin similarity is structural
and declined to fabricate reference entries to push it lower (academic integrity).

_Lessons / decisions:_ Model choice is a first-class design variable — swapping Haiku→Opus for
the Coach changed the *failure mode*, not just output quality, which is itself evidence for
the graded three-tier argument. Keeping retries/recovery in the orchestrator (agents stay
pure) paid off again.

_Next week:_ Record + upload the 3–5 min MP4 demo; verify the 12 references in Zotero;
optionally re-run `pnpm eval:all` on the true Opus/Sonnet tiers to replace the Haiku
feasibility figures in Chapter 4.

---
