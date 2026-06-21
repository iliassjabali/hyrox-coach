# AGENTS.md

Feature catalogue and agent architecture for **Hyrox Personal Coach**. This is the
single source of truth for *what the system does*. For *how to work in the repo*
(commands, conventions, workflow) see [`CLAUDE.md`](./CLAUDE.md). For *the project
roadmap* see [`docs/plan.md`](./docs/plan.md).

> Status legend — ✅ done · 🔨 in progress · ⬜ planned. Update as features land.
>
> **Build status (2026-06-21):** Turborepo+pnpm monorepo scaffolded; `@hyrox/training`
> bounded context live with the hexagonal layout and the dependency rule enforced by
> ESLint. Domain modelling underway (TDD). Architecture: see
> [`docs/superpowers/specs/2026-06-21-trpc-monorepo-hexagonal-design.md`](./docs/superpowers/specs/2026-06-21-trpc-monorepo-hexagonal-design.md).

---

## 1. System overview

```
                    ┌─────────────────────────────────────────────┐
  Strava / Garmin   │                ORCHESTRATOR                  │
  CSV / OAuth  ───▶ │  (retries · backoff · conflict resolution)  │
                    │                                             │
                    │   ① Classifier ─▶ ② Coach ─▶ ③ Critic       │
                    │      (Haiku)       (Opus)      (Sonnet)      │
                    └──────────┬──────────────────────┬───────────┘
                               │                      │
              schema-validated │ (Zod)                │ approved plan
                               ▼                      ▼
                         Persistence            Next.js frontend
                       (SQLite/Postgres)     (plan · history · cost)
```

The pipeline turns raw workout history into a **safety-validated weekly plan**.
Every hop is validated against a Zod schema; invalid LLM output triggers a retry.

---

## 2. The three agents

| # | Agent | Model | Why this model | Input | Output schema |
|---|-------|-------|----------------|-------|---------------|
| ① | **Classifier** | `claude-haiku` | High-volume, low-complexity labelling — cheapest/fastest tier | `WorkoutSession[]` | `ClassifierOutput` |
| ② | **Coach** | `claude-opus` | Hardest reasoning step: synthesise plan from history — most capable tier | classified sessions + athlete profile | `CoachOutput` |
| ③ | **Critic** | `claude-sonnet` | Plausibility/safety checking — balanced capability/cost | `CoachOutput` | `CriticOutput` |

**Model-role rationale is a graded design point** (Reza approved 3 models in
distinct roles). Document any model swap and its justification here.

---

## 3. Feature catalogue

### 3.1 Data ingestion
- ⬜ CSV import (Strava export → `WorkoutSession[]`)
- ⬜ Garmin import (FIT/CSV)
- ⬜ Strava OAuth (replaces manual CSV upload) — Phase 4
- ⬜ Garmin Connect integration — Phase 4

### 3.2 Feature engineering (`WorkoutSession` enrichment)
- ⬜ Pace zones
- ⬜ Heart-rate zones
- ⬜ TRIMP (training impulse)
- ⬜ ACWR (acute:chronic workload ratio)
- ⬜ Training monotony
- ⬜ Fitness / fatigue (Banister impulse-response) model

### 3.3 Domain model + contracts
Domain types are pure TS (in `domain/`); **Zod validates only at the boundaries**
(tRPC input, LLM output) and maps into these.
- ✅ `SessionType` — VO: run | sled | burpees | mixed (case-insensitive)
- ✅ `WorkoutSession` — entity with factory invariants (id, duration, distance, HR)
- ⬜ `TrainingLoad` — VO/service: TRIMP, ACWR
- ⬜ `WeeklyPlan` — entity (Coach result, domain form)
- ⬜ `PlanVerdict` — VO (Critic result: accept/reject + reasons + fixes)
- ⬜ `ClassifierOutput` / `CoachOutput` / `CriticOutput` — Zod schemas at the LLM boundary

### 3.4 Orchestration
- ⬜ Pipeline runner: `Classifier → Coach → Critic`
- ⬜ Schema validation + retry on invalid LLM output
- ⬜ Exponential backoff on transient API errors
- ⬜ Conflict resolution when Critic rejects Coach output
- ⬜ Per-request cost tracking (logged to DB)

### 3.5 Persistence
- ⬜ Athlete profile store
- ⬜ Session history store
- ⬜ Run/cost log
- ⬜ SQLite (dev) → Postgres (deploy) — Phase 4

### 3.6 Frontend (Next.js)
- ⬜ CSV upload → see agent outputs
- ⬜ Weekly plan render (from `CoachOutput`)
- ⬜ Session history view
- ⬜ Visible safety disclaimer ("training aid, not medical advice")

### 3.7 Evaluation harness *(the graded core — lead with objective metrics)*
- ⬜ Classifier accuracy + confusion matrix on a hand-labelled set (20 → 50+ sessions)
- ⬜ Ablation: same input with/without Critic, compare outputs
- ⬜ Consistency: same input run ×5, measure output variance
- ⬜ Prompt-variant ablation: 3 Coach prompt variants compared
- ⬜ Cost/latency reporting per agent and per run

### 3.8 Safety, ethics & study (Phase 5)
- ⬜ Informed-consent form
- ⬜ Data-storage policy (encryption, retention, deletion)
- ⬜ In-app medical disclaimer
- ⬜ User study: 5–10 athletes, 4-week trial, Likert questionnaire

---

## 4. Data flow (one request)

1. Athlete data in (CSV/OAuth) → parsed into `WorkoutSession[]`.
2. Feature engineering enriches each session (zones, TRIMP, ACWR…).
3. **Classifier (Haiku)** labels each session → `ClassifierOutput` (validated).
4. **Coach (Opus)** reads labelled history + profile → `CoachOutput` weekly plan (validated).
5. **Critic (Sonnet)** reviews the plan → `CoachOutput` accepted, or rejected with fixes → orchestrator retries/repairs.
6. Approved plan + cost/latency persisted → rendered in the frontend.

---

## 5. Conventions for agent code

- **Schemas are the contract.** Every agent's I/O is a Zod schema in one place;
  agents never hand-parse free text — validate, then retry on failure.
- **Prompts are versioned.** Coach/Critic prompts are A/B tested; keep variants
  and their eval results traceable (needed for the prompt-variant ablation).
- **Determinism for tests.** LLM calls are env-gated; unit tests run against
  fixtures/stubs, integration tests hit real Claude behind a flag.
- **Cost is a first-class metric**, logged per request — it appears in the report.

---

## 6. Pointers

- Roadmap & task board → [`docs/plan.md`](./docs/plan.md)
- Weekly project journal (exam Q3 source) → [`docs/journal.md`](./docs/journal.md)
- Working commands & repo conventions → [`CLAUDE.md`](./CLAUDE.md)
