#!/usr/bin/env bash
#
# scaffold-hexagon.sh — generate the hexagonal monorepo structure for hyrox-coach.
#
# Usage:
#   scripts/scaffold-hexagon.sh init                 # monorepo root + @hyrox/config
#   scripts/scaffold-hexagon.sh context <name>       # a hexagonal bounded-context package
#   scripts/scaffold-hexagon.sh context <name> --force
#
# The `context` generator lays down domain / application (ports in+out, use-cases, dto) /
# infrastructure / testing folders with compiling stubs and ONE passing example test,
# wired to respect the dependency rule (domain pure, application -> domain only).
# Replace the Example slice with real domain via TDD.
#
set -euo pipefail

ORG="@hyrox"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log()  { printf '  \033[32m+\033[0m %s\n' "$1"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$1"; }
die()  { printf '  \033[31mx\033[0m %s\n' "$1" >&2; exit 1; }

# write <path> — reads file content from stdin, creates parent dirs, skips if exists.
write() {
  local path="$1"
  if [[ -e "$path" && "${FORCE:-0}" != "1" ]]; then
    warn "skip (exists): ${path#"$ROOT"/}"
    cat >/dev/null
    return
  fi
  mkdir -p "$(dirname "$path")"
  cat >"$path"
  log "${path#"$ROOT"/}"
}

pascal() { # kebab/snake -> PascalCase
  echo "$1" | awk -F'[-_]' '{ for (i=1;i<=NF;i++) printf "%s", toupper(substr($i,1,1)) substr($i,2); print "" }'
}

# ---------------------------------------------------------------------------
# init — monorepo root + shared @hyrox/config
# ---------------------------------------------------------------------------
cmd_init() {
  write "$ROOT/pnpm-workspace.yaml" <<'EOF'
packages:
  - "apps/*"
  - "packages/*"
  - "packages/contexts/*"
EOF

  write "$ROOT/package.json" <<'EOF'
{
  "name": "hyrox-coach",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.0.3",
  "engines": { "node": ">=20" },
  "scripts": {
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "lint": "turbo run lint",
    "build": "turbo run build",
    "dev": "turbo run dev"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "eslint": "^9.17.0",
    "turbo": "^2.3.0",
    "typescript": "^5.7.0",
    "typescript-eslint": "^8.18.0",
    "vitest": "^2.1.0"
  },
  "pnpm": {
    "onlyBuiltDependencies": ["esbuild"]
  }
}
EOF

  write "$ROOT/turbo.json" <<'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**"] },
    "test": { "dependsOn": ["^build"] },
    "typecheck": { "dependsOn": ["^build"] },
    "lint": {},
    "dev": { "cache": false, "persistent": true }
  }
}
EOF

  write "$ROOT/tsconfig.json" <<'EOF'
{
  "comment": "Root config is intentionally standalone — per-package tsconfig extends @hyrox/config/tsconfig/base.json. Each package is the unit of typechecking.",
  "compilerOptions": { "noEmit": true },
  "files": [],
  "exclude": ["node_modules", "**/dist", "**/.next"]
}
EOF

  # ---- @hyrox/config -------------------------------------------------------
  write "$ROOT/packages/config/package.json" <<'EOF'
{
  "name": "@hyrox/config",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./tsconfig/base.json": "./tsconfig/base.json",
    "./eslint/hexagonal.js": "./eslint/hexagonal.js"
  }
}
EOF

  write "$ROOT/packages/config/tsconfig/base.json" <<'EOF'
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true
  }
}
EOF

  write "$ROOT/packages/config/eslint/hexagonal.js" <<'EOF'
// Shared flat ESLint config enforcing the hexagonal dependency rule.
//   domain/      -> imports nothing but domain (no application, no infra, no libs)
//   application/ -> imports domain only (no infra, no framework libs)
//   infrastructure/ -> anything goes
import tseslint from 'typescript-eslint';

const FRAMEWORK_LIBS = [
  'drizzle-orm', 'drizzle-orm/*',
  '@anthropic-ai/*', 'ai', '@ai-sdk/*',
  'next', 'next/*', '@trpc/*', 'react', 'zod',
];

const restrict = (patterns) => ({
  'no-restricted-imports': ['error', { patterns }],
});

export default tseslint.config(
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tseslint.parser },
  },
  {
    files: ['**/domain/**/*.ts'],
    rules: restrict([
      { group: ['**/application/**', '**/infrastructure/**'],
        message: 'domain/ must not import application or infrastructure' },
      ...FRAMEWORK_LIBS.map((g) => ({ group: [g],
        message: 'domain/ must stay pure — no framework/library imports' })),
    ]),
  },
  {
    files: ['**/application/**/*.ts'],
    rules: restrict([
      { group: ['**/infrastructure/**'],
        message: 'application/ must not import infrastructure — depend on a port' },
      ...FRAMEWORK_LIBS.map((g) => ({ group: [g],
        message: 'application/ must not import framework/library code — define a port' })),
    ]),
  },
);
EOF

  printf '\nInitialised monorepo root. Next:\n  scripts/scaffold-hexagon.sh context training\n  pnpm install && pnpm test\n'
}

# ---------------------------------------------------------------------------
# context <name> — a hexagonal bounded-context package
# ---------------------------------------------------------------------------
cmd_context() {
  local name="${1:-}"
  [[ -n "$name" ]] || die "usage: scaffold-hexagon.sh context <name>"
  [[ "$name" =~ ^[a-z][a-z0-9-]*$ ]] || die "context name must be kebab-case (e.g. 'training')"
  local pascal; pascal="$(pascal "$name")"
  local base="$ROOT/packages/contexts/$name"

  # ---- package manifest + tooling -----------------------------------------
  write "$base/package.json" <<EOF
{
  "name": "$ORG/$name",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./testing": "./src/testing/index.ts",
    "./composition": "./$name.composition.ts"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "lint": "eslint ."
  },
  "devDependencies": {
    "$ORG/config": "workspace:*"
  }
}
EOF

  write "$base/tsconfig.json" <<'EOF'
{
  "extends": "@hyrox/config/tsconfig/base.json",
  "include": ["src", "*.ts"]
}
EOF

  write "$base/vitest.config.ts" <<'EOF'
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
EOF

  write "$base/eslint.config.js" <<'EOF'
import hexagonal from '@hyrox/config/eslint/hexagonal.js';
export default hexagonal;
EOF

  # ---- domain (pure) -------------------------------------------------------
  write "$base/src/domain/errors.ts" <<'EOF'
// Domain errors — thrown by entities/use-cases, never HTTP errors.
export class DomainError extends Error {}

export class InvalidExample extends DomainError {}

export class ExampleNotFound extends DomainError {
  constructor(id: string) {
    super(`Example not found: ${id}`);
  }
}
EOF

  write "$base/src/domain/example.ts" <<'EOF'
// Example domain — replace with the real aggregate (e.g. WorkoutSession).
// Pure TS: no zod, no drizzle, no ai-sdk, no framework imports.
import { InvalidExample } from './errors';

export class ExampleId {
  private constructor(public readonly value: string) {}

  static of(value: string): ExampleId {
    if (!value.trim()) throw new InvalidExample('ExampleId must not be empty');
    return new ExampleId(value);
  }
}

export class Example {
  private constructor(
    public readonly id: ExampleId,
    public readonly label: string,
  ) {}

  static create(id: ExampleId, label: string): Example {
    if (!label.trim()) throw new InvalidExample('label must not be empty');
    return new Example(id, label);
  }
}
EOF

  # ---- application: ports (in + out), use-cases, dto -----------------------
  write "$base/src/application/ports/in/create-example.port.ts" <<'EOF'
// Driving port — what the outside world calls into the application.
export interface CreateExampleInput {
  id: string;
  label: string;
}

export interface CreateExampleOutput {
  id: string;
  label: string;
}

export interface CreateExample {
  execute(input: CreateExampleInput): Promise<CreateExampleOutput>;
}
EOF

  write "$base/src/application/ports/out/example-repository.port.ts" <<'EOF'
// Driven port — what the application calls out to. Returns DOMAIN objects, never rows.
import type { Example, ExampleId } from '../../../domain/example';

export interface ExampleRepository {
  save(example: Example): Promise<void>;
  findById(id: ExampleId): Promise<Example | null>;
}
EOF

  write "$base/src/application/dto/index.ts" <<'EOF'
// App-level DTOs (plain TS). Re-export use-case I/O shapes here as they grow.
export type {} from '../ports/in/create-example.port';
EOF

  write "$base/src/application/use-cases/create-example.use-case.ts" <<'EOF'
import { Example, ExampleId } from '../../domain/example';
import type {
  CreateExample,
  CreateExampleInput,
  CreateExampleOutput,
} from '../ports/in/create-example.port';
import type { ExampleRepository } from '../ports/out/example-repository.port';

// Interactor: input DTO -> domain -> port -> output DTO. Depends on ports only.
export class CreateExampleUseCase implements CreateExample {
  constructor(private readonly examples: ExampleRepository) {}

  async execute(input: CreateExampleInput): Promise<CreateExampleOutput> {
    const example = Example.create(ExampleId.of(input.id), input.label);
    await this.examples.save(example);
    return { id: example.id.value, label: example.label };
  }
}
EOF

  write "$base/src/application/use-cases/create-example.use-case.test.ts" <<'EOF'
import { describe, expect, it } from 'vitest';
import { CreateExampleUseCase } from './create-example.use-case';
import { InMemoryExampleRepository } from '../../testing/in-memory-example.repository';

describe('CreateExampleUseCase', () => {
  it('creates and persists an example', async () => {
    const repo = new InMemoryExampleRepository();
    const useCase = new CreateExampleUseCase(repo);

    const output = await useCase.execute({ id: 'e1', label: 'hello' });

    expect(output).toEqual({ id: 'e1', label: 'hello' });
    expect(await repo.findById((await import('../../domain/example')).ExampleId.of('e1'))).not.toBeNull();
  });

  it('rejects an empty label (domain invariant)', async () => {
    const useCase = new CreateExampleUseCase(new InMemoryExampleRepository());
    await expect(useCase.execute({ id: 'e1', label: '' })).rejects.toThrow();
  });
});
EOF

  # ---- infrastructure (driven adapters live here) -------------------------
  for d in persistence llm csv time; do
    write "$base/src/infrastructure/$d/.gitkeep" <<'EOF'
EOF
  done
  write "$base/src/infrastructure/README.md" <<'EOF'
# infrastructure

Driven adapters implementing the `application/ports/out` interfaces:

- `persistence/` — Drizzle repositories (map rows <-> domain objects)
- `llm/`         — Anthropic adapters (generateObject + zod, then map to domain)
- `csv/`         — Strava/Garmin CSV parsers
- `time/`        — SystemClock (the `Clock` port)

Anything in here may import external libraries. Nothing in `domain/` or
`application/` may import from this folder.
EOF

  # ---- testing (in-memory fakes for application-layer tests) ---------------
  write "$base/src/testing/in-memory-example.repository.ts" <<'EOF'
import type { Example, ExampleId } from '../domain/example';
import type { ExampleRepository } from '../application/ports/out/example-repository.port';

// In-memory fake honoring the port contract — for application-layer tests.
export class InMemoryExampleRepository implements ExampleRepository {
  private readonly store = new Map<string, Example>();

  async save(example: Example): Promise<void> {
    this.store.set(example.id.value, example);
  }

  async findById(id: ExampleId): Promise<Example | null> {
    return this.store.get(id.value) ?? null;
  }
}
EOF

  write "$base/src/testing/index.ts" <<'EOF'
export { InMemoryExampleRepository } from './in-memory-example.repository';
EOF

  # ---- public barrel -------------------------------------------------------
  write "$base/src/index.ts" <<'EOF'
// Public API of the context. Consumers import from here, never deep paths.
export * from './domain/example';
export * from './domain/errors';
export type {
  CreateExample,
  CreateExampleInput,
  CreateExampleOutput,
} from './application/ports/in/create-example.port';
export type { ExampleRepository } from './application/ports/out/example-repository.port';
export { CreateExampleUseCase } from './application/use-cases/create-example.use-case';
EOF

  # ---- composition root helper --------------------------------------------
  write "$base/$name.composition.ts" <<EOF
// Composition root for the $name context.
// Binds driven ports to concrete adapters and returns ready-to-use use cases.
// The host (apps/web tRPC context, or a test) supplies the adapters.
import { CreateExampleUseCase } from './src/application/use-cases/create-example.use-case';
import type { ExampleRepository } from './src/application/ports/out/example-repository.port';

export interface ${pascal}Ports {
  exampleRepository: ExampleRepository;
}

export function build${pascal}(ports: ${pascal}Ports) {
  return {
    createExample: new CreateExampleUseCase(ports.exampleRepository),
  };
}

export type ${pascal} = ReturnType<typeof build${pascal}>;
EOF

  printf '\nScaffolded context %s (%s/%s). Next:\n  pnpm install\n  pnpm --filter %s/%s test\n' \
    "$name" "$ORG" "$name" "$ORG" "$name"
}

# ---------------------------------------------------------------------------
main() {
  local cmd="${1:-}"; shift || true
  # parse --force flag from remaining args
  local args=()
  for a in "$@"; do
    if [[ "$a" == "--force" ]]; then FORCE=1; else args+=("$a"); fi
  done
  case "$cmd" in
    init)    cmd_init ;;
    context) cmd_context "${args[@]:-}" ;;
    ""|-h|--help)
      sed -n '2,16p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' ;;
    *) die "unknown command: $cmd (try: init | context <name>)" ;;
  esac
}

main "$@"
