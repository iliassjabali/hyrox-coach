---
name: scaffold-context
description: Use when adding a new hexagonal bounded context (or initialising the monorepo) in hyrox-coach. Runs scripts/scaffold-hexagon.sh to generate the ports-and-adapters structure with a passing example slice.
---

# Scaffold a Hexagonal Bounded Context

Generate the hexagonal (ports & adapters) structure for this monorepo using
`scripts/scaffold-hexagon.sh`. Use it to bootstrap the monorepo once, then to add
each new bounded context with an identical, dependency-rule-correct skeleton.

Read `docs/superpowers/specs/2026-06-21-trpc-monorepo-hexagonal-design.md` and the
`clean-hexagonal-architecture` skill before generating — they define the layer
rules this script encodes.

## Commands

```bash
# one-time: monorepo root (pnpm-workspace, turbo.json, tsconfig base, @hyrox/config)
scripts/scaffold-hexagon.sh init

# add a bounded context (kebab-case name)
scripts/scaffold-hexagon.sh context training

# overwrite existing files
scripts/scaffold-hexagon.sh context training --force
```

## What `context <name>` produces

A `packages/contexts/<name>/` package (`@hyrox/<name>`) with:

- `src/domain/` — pure TS entity + domain errors (no zod/drizzle/ai-sdk).
- `src/application/ports/in|out`, `use-cases/`, `dto/` — driving + driven ports,
  one interactor, app DTOs.
- `src/infrastructure/{persistence,llm,csv,time}/` — empty driven-adapter homes.
- `src/testing/` — in-memory fake repository honoring the port.
- `<name>.composition.ts` — composition-root factory binding ports → adapters.
- A **passing** Vitest example test (`CreateExampleUseCase`).

The `Example` slice is a placeholder demonstrating all layers — replace it with the
real domain via TDD (red → green → refactor).

## Steps when invoked

1. Confirm the context name (kebab-case) and whether the monorepo root exists yet
   (run `init` first if `pnpm-workspace.yaml` is missing).
2. Run the relevant command(s).
3. Run `pnpm install` then `pnpm --filter @hyrox/<name> test` and confirm the
   example test is green before handing back.
4. Remind the user the `Example` slice is a placeholder to be replaced via TDD; the
   dependency rule is enforced by `@hyrox/config/eslint/hexagonal.js`.

Do not hand-edit generated files to "fix" a layering complaint — a complaint means
the code belongs in a different layer. Move it.
