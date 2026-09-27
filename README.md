# Hyrox Personal Coach

**Multi-Model LLM Orchestration for Hybrid-Sport Training**

A personal AI coaching system for [Hyrox](https://hyrox.com) athletes that ingests
training data (Strava / Garmin), reasons over it with a pipeline of specialised
Claude models, and produces a validated weekly training plan.
---

## What it does

The system orchestrates **three Claude models in distinct agent roles**:

| Agent | Model | Responsibility |
|-------|-------|----------------|
| **Classifier** | Claude Haiku | Label each workout session by Hyrox-relevant type (run, sled, burpees, mixed) |
| **Coach** | Claude Opus | Generate a personalised weekly training plan from classified history |
| **Critic** | Claude Sonnet | Validate the plan for plausibility & safety; reject/repair unsafe output |

An **orchestrator** runs `Classifier → Coach → Critic` with schema validation
(Zod), retries, and conflict resolution. See [`AGENTS.md`](./AGENTS.md) for the
full feature catalogue and architecture.

## Tech stack

TypeScript · Next.js · Vercel AI SDK · Anthropic Claude (Haiku / Sonnet / Opus) · Zod · Vitest

## Status

Active development — see [`docs/plan.md`](./docs/plan.md) for the 22-week roadmap
and [`docs/journal.md`](./docs/journal.md) for the weekly project journal.

## Getting started

> Setup commands are added as the app is scaffolded. See [`CLAUDE.md`](./CLAUDE.md)
> for the canonical command list.

```bash
# (once scaffolded)
npm install
cp .env.example .env   # add ANTHROPIC_API_KEY
npm run dev
npm test
```

## Ethics & data

This is a **training aid, not medical advice.** Athlete data is personal/health
data: it is never committed to the repo (see `.gitignore`), is stored with
informed consent, and is deletable on request. See `docs/plan.md` (Phase 5) for
the consent and data-storage policy.

## Licence

[MIT](./LICENSE)
