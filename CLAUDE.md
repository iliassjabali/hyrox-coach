# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Hyrox Personal Coach** — a multi-model LLM orchestration system that turns an
athlete's training history into a safety-validated weekly Hyrox plan, using three
Claude models in distinct agent roles (Classifier=Haiku, Coach=Opus, Critic=Sonnet).
This is the **CM3070 Final Project** (University of London, Iliass Jabali).

- **Full feature catalogue & architecture:** [`AGENTS.md`](./AGENTS.md) — read this first.
- **22-week roadmap & task board:** [`docs/plan.md`](./docs/plan.md)
- **Weekly project journal:** [`docs/journal.md`](./docs/journal.md)

## Stack

TypeScript · Next.js · Vercel AI SDK · Anthropic Claude (Haiku/Sonnet/Opus) · Zod · Vitest

## Monorepo

Turborepo + pnpm workspaces. Packages live under `apps/*` and `packages/*`
(bounded contexts under `packages/contexts/*`). Internal packages ship raw TS
(no build step) and are referenced as `@hyrox/<name>` (`workspace:*`).

## Commands

```bash
pnpm install                              # install all workspace deps
pnpm test                                 # turbo: test every package
pnpm typecheck                            # turbo: tsc --noEmit every package
pnpm lint                                 # turbo: eslint every package
pnpm dev                                  # turbo: run dev servers

pnpm --filter @hyrox/training test        # test one package
pnpm --filter @hyrox/training test:watch  # watch mode
pnpm --filter @hyrox/training exec vitest run src/path/to.test.ts   # single file

# scaffold (see /scaffold-context skill)
scripts/scaffold-hexagon.sh init          # one-time monorepo root
scripts/scaffold-hexagon.sh context <name>  # new hexagonal bounded context
```

The dependency rule is enforced by `@hyrox/config/eslint/hexagonal.js`: `domain/`
imports nothing external, `application/` imports `domain/` only. `pnpm lint` fails CI on violation.

## Architecture (big picture)

The system is a **validated agent pipeline**, not a single prompt:

```
ingest → feature-engineer → Classifier(Haiku) → Coach(Opus) → Critic(Sonnet) → persist → render
```

Key invariants when working in this codebase:

1. **Zod schemas are the contract between agents.** `WorkoutSession`,
   `ClassifierOutput`, `CoachOutput`, `CriticOutput` live in one schema module.
   Agents return schema-validated objects; the orchestrator retries on invalid output.
2. **The orchestrator owns reliability** — retries, exponential backoff, and the
   conflict-resolution logic for when the Critic rejects the Coach's plan. Agents
   stay pure (prompt in → validated object out).
3. **Model choice per agent is a deliberate, graded design decision.** Don't swap
   a model without recording the rationale in `AGENTS.md`.
4. **Cost & latency are tracked per request** and surface in the evaluation — treat
   them as product features, not afterthoughts.
5. **The evaluation harness is the graded core** (classifier accuracy, ablation,
   consistency, prompt-variant comparison). Lead with objective metrics; the user
   study is supplementary (per tutor feedback).

## Project-specific rules (academic context)

- **Athlete data is sensitive health data.** Never commit Strava/Garmin exports or
  any personal data — they are gitignored (`data/`, `*.fit`, `*.tcx`). Handle under
  informed consent only.
- **Never commit secrets.** `ANTHROPIC_API_KEY` and all keys go in `.env` (gitignored);
  this repo becomes public at final submission and markers review the code.
- **References must be real and IEEE-formatted** — never invent citations for the report.
- **Keep the weekly journal current** (`docs/journal.md`) — it is the source for an exam question.
- **AI assistance is permitted** for this project; follow the module's AI-use
  declaration requirements when submitting.

## Workflow

Follow the global workflow in `~/.claude/CLAUDE.md`: spec → TDD (write failing
Vitest tests first) → implementation. For NestJS/TS structural work invoke the
relevant domain skills. Prefer parallel subagents for independent tasks.

## Helper skills (this repo)

Local `/`-commands in `.claude/skills/`:

- `/project-status` — summarise roadmap progress from `docs/plan.md`
- `/journal` — append a weekly project-journal entry
- `/rubric-check` — run the 14-item CM3070 rubric self-check before a submission
