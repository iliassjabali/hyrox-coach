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
