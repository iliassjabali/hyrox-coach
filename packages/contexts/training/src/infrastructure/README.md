# infrastructure

Driven adapters implementing the `application/ports/out` interfaces:

- `persistence/` — Drizzle repositories (map rows <-> domain objects)
- `llm/`         — Anthropic adapters (generateObject + zod, then map to domain)
- `csv/`         — Strava/Garmin CSV parsers
- `time/`        — SystemClock (the `Clock` port)

Anything in here may import external libraries. Nothing in `domain/` or
`application/` may import from this folder.
