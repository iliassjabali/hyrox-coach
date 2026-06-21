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
TDD: `SessionType`, `WorkoutSession`, `WeeklyPlan`, `PlanVerdict`, and `TrainingLoad`
(Banister TRIMP), then the first application slice — the `ClassifySessions` use case with
its `ClassifierLlm`/`SessionRepository` ports and in-memory fakes (red → green, 29 tests
passing, dependency rule enforced by ESLint).

_Blockers / surprises:_ The `.gitignore` `out/` pattern (meant for Next.js build output)
silently ignored the `application/ports/out/` directory — caught it before it caused a
broken clone; fixed by root-anchoring the build-output patterns.

_Lessons / decisions:_ In hexagonal TS, the "Zod schemas as contracts" idea from the
proposal becomes **domain types**, with Zod validating only at the boundaries (tRPC input,
LLM output). Keeps the domain pure and the swap test intact.

_Next week:_ TDD the remaining use cases (`GeneratePlan`, `CoachAthlete` orchestrator with
retry + critic-rejection), add ACWR to `TrainingLoad`, then scaffold `apps/web` +
`@hyrox/db` + `@hyrox/trpc` and wire the Anthropic adapters; delete the generated `Example`
placeholder once the real composition is in place.

---
