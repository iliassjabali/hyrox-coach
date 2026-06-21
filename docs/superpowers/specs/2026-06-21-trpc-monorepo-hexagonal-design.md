# Design — tRPC + Next.js Monorepo with Hexagonal Architecture

**Date:** 2026-06-21
**Project:** Hyrox Personal Coach (CM3070)
**Status:** Approved (user, 2026-06-21)

## Goal

Replace the flat "Next.js skeleton" of Phase 1 with a **Turborepo + pnpm monorepo**
whose business logic lives in a **hexagonal (ports & adapters)** bounded context.
The three Claude agents (Classifier/Coach/Critic) and the orchestrator are modelled
as use cases over driven ports; tRPC is the driving adapter; Drizzle and the
Anthropic client are driven adapters.

## Decisions (locked)

| Decision | Choice |
|---|---|
| Hex ↔ monorepo mapping | **One package per bounded context**, hexagonal folders inside |
| Tooling | **Turborepo + pnpm** workspaces |
| Persistence | **Drizzle ORM**, SQLite (libSQL) local → Postgres deploy |
| Initial scaffold scope | **Full Classifier/Coach/Critic** + orchestrator, end-to-end |
| Validation | **Zod at the boundaries only** (tRPC input, LLM output) — never in `domain/` |
| LLM | Vercel **AI SDK v6** + `@ai-sdk/anthropic` |

## Monorepo layout

```
hyrox-coach/
  apps/web/                      # Next.js App Router — UI + tRPC handler (composition root host)
  packages/
    contexts/training/           # @hyrox/training — the bounded context
      src/domain/                #   pure TS: entities, VOs, domain errors
      src/application/
        ports/in/                #   driving ports (use-case interfaces)
        ports/out/               #   driven ports (repo, llm, clock, run-log)
        use-cases/               #   interactors
        dto/                     #   plain-TS use-case I/O
      src/infrastructure/
        persistence/             #   Drizzle repos (driven adapters)
        llm/                     #   Anthropic Classifier/Coach/Critic adapters
        csv/                     #   Strava CSV parser
        time/                    #   SystemClock
      src/testing/               #   in-memory + fake adapters for app-layer tests
      training.composition.ts    #   factory: bind ports → adapters
    trpc/                        # @hyrox/trpc — routers (driving adapters) + appRouter + context
    db/                          # @hyrox/db — Drizzle schema + client + migrations
    config/                      # @hyrox/config — shared tsconfig / eslint / vitest presets
  turbo.json · pnpm-workspace.yaml · tsconfig.base.json · package.json
```

## Dependency rule (enforced mechanically)

- `domain/` imports **nothing** external (no zod/drizzle/ai-sdk/framework).
- `application/` imports `domain/` only (+ its own ports/dto).
- `infrastructure/` may import everything + external libs.
- Enforced via shared ESLint `no-restricted-imports` per-folder overrides.
- **Swap test:** Anthropic→OpenAI, Drizzle→Prisma, or tRPC→REST must touch zero
  files under `domain/` or `application/`.

## Agents as ports & adapters

| Concern | Port (application/ports/out) | Adapter (infrastructure/llm) | Model |
|---|---|---|---|
| Classify sessions | `ClassifierLlm` | `AnthropicClassifierAdapter` | Haiku |
| Generate plan | `CoachLlm` | `AnthropicCoachAdapter` | Opus |
| Review plan | `CriticLlm` | `AnthropicCriticAdapter` | Sonnet |

Each LLM port returns `{ result, usage }`. Adapters use `generateObject` with a
Zod schema, validate the model JSON, then **map to domain objects**.

## Orchestrator (`CoachAthlete` use case)

`execute()`: load sessions (repo) → classify → generate plan → critic review →
**if rejected: re-coach with feedback, up to N retries → conflict resolution** →
persist plan + aggregated token cost (`RunLog` port) → return plan DTO.

- Transient API retry/backoff → inside LLM adapters (infrastructure).
- Semantic retry (invalid schema / critic rejection) → orchestrator (application).
- Owns the transaction boundary.

## Testing strategy (per layer)

| Layer | How |
|---|---|
| Domain | Plain Vitest, no mocks |
| Application | Vitest + in-memory/fake adapters; deterministic orchestrator paths |
| Infrastructure | SQLite for repos, fixture CSVs, scripted-fake LLM contract tests |
| tRPC / composition | Router integration test with fake context; composition smoke test |

## Scaffolding

A reusable script `scripts/scaffold-hexagon.sh` generates:
- `init` — monorepo root + `@hyrox/config`.
- `context <name>` — a hexagonal bounded-context package with compiling stubs and
  one passing example test (the dev replaces stubs with real domain via TDD).

Documented by the `/scaffold-context` skill.

## Build order (TDD)

1. `scaffold-hexagon.sh init` + `context training`; `pnpm install`; green example test.
2. `apps/web` via `create-next-app`; wire `@hyrox/trpc` handler.
3. Domain (TDD): `WorkoutSession`, `SessionType`, `TrainingLoad`, `WeeklyPlan`, `PlanVerdict`.
4. Out-ports + in-memory fakes.
5. Use cases (TDD): `ClassifySessions`, `GeneratePlan`, `CoachAthlete` (retry/rejection paths).
6. Adapters: Drizzle repos, Anthropic Classifier/Coach/Critic, Strava CSV parser.
7. tRPC routers + composition root; integration test.
8. Eval harness (classifier accuracy, ablation, consistency) per Phase 4.
```
