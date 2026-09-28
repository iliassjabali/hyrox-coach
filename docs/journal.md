# Project Journal

One paragraph per week, aligned to the **CM3070 Coursera 22-week Topic schedule**. This is
the source for **exam Q3 ("lessons learned")**, kept honest: weeks with dated repository or
Coursera evidence are written in full; weeks without dated activity are marked minimally
rather than padded. Week-commencing dates are anchored to the Coursera deadlines (proposal
18 May, preliminary report 29 Jun, exam 15 Sep, final report 28 Sep), so course weeks map
to roughly one calendar week each.

**Dated milestones (Coursera):** Project proposal 100% (due 18 May) · Preliminary report
68.33% (submitted 29 Jun 08:16) · Draft report 74% (submitted 19 Aug 11:02) · Online exam,
Inspera (15 Sep) · Final report due 28 Sep (81.30% weight).

> Tip: run `/journal` to append or update an entry.

---

## Week 1 (Topic 1 – Project concept) · w/c 27 Apr 2026

_Topic phase; predates the repository (first created 21 Jun). No dated repository or Coursera activity recorded. The project concept — a multi-model Claude orchestration system, later realised as the Hyrox Personal Coach under CM3020 Project Idea 1 — was settled across the Topic 1–2 period and carried into the Project proposal (Week 4)._

---

## Week 2 (Topic 1 – Project concept, cont.) · w/c 4 May 2026

_Topic phase; no dated activity recorded. Continued shaping the concept and reviewing prior work ahead of the proposal._

---

## Week 3 (Topic 2 – Project proposal) · w/c 11 May 2026

_Topic phase; no dated repository activity (the repo did not yet exist). Drafted the Project proposal — project concept and previous work._

---

## Week 4 (Topic 2 – Project proposal, cont.) · w/c 18 May 2026

_What I did:_ Submitted the **Project proposal** (project concept, previous work) on Coursera — graded **100%**. This fixed the scope: a validated multi-agent pipeline built on CM3020 Project Idea 1, with model selection, integration and rigorous evaluation as the contribution (no model training).

_Next topic:_ Background research (Topic 3).

---

## Week 5 (Topic 3 – Background research) · w/c 25 May 2026

_Topic phase; no dated repository or Coursera activity recorded. Literature and market background for the report's later Introduction and Literature Review chapters was gathered in this Topic 3 period._

---

## Week 6 (Topic 3 – Background research, cont.) · w/c 1 Jun 2026

_Topic phase; no dated activity recorded. Continued background research._

---

## Week 7 (Topic 4 – Design and planning) · w/c 8 Jun 2026

_Topic phase; no dated repository activity yet. The hexagonal architecture and three-agent (Haiku/Opus/Sonnet) design that the repo later implemented was worked out during this Topic 4 period._

---

## Week 8 (Topic 4 – Design and planning, cont.) · w/c 15 Jun 2026

_Topic phase; no dated activity recorded. Finalised the design ahead of the build sprint that began the following week._

---

## Week 9 (Topic 5 – Planning and evaluation) · w/c 22 Jun 2026

_What I did:_ Created the repository (21–22 Jun) and completed the build sprint. Scaffolded the private `hyrox-coach` monorepo and meta-layer (`AGENTS.md`, `CLAUDE.md`, the 22-week `docs/plan.md`, this journal, three project skills), and a reusable hexagonal scaffolder (`scripts/scaffold-hexagon.sh`) with an ESLint-enforced dependency rule (`domain/` imports only `domain/`, `application/` only `domain/`). Built the domain test-first — `SessionType` (4), `WorkoutSession` (6), `PlanVerdict` (5), `WeeklyPlan` (5), Banister `TRIMP` (5) — then the application layer (`ClassifySessions`; the `CoachAthlete` orchestrator: classify → persist → (Coach → Critic)* with semantic retry on rejection, `maxAttempts=3`, token-cost tracking) and the infrastructure adapters (`SystemClock`, `parseStravaCsv`, three Anthropic adapters behind a `structured-llm-call` seam, Drizzle+libSQL repositories), plus `@hyrox/trpc` and a Next.js `apps/web` demo page with a "training aid, not medical advice" disclaimer. 48 tests green; typecheck, lint and `next build` all pass.

_Blockers / surprises:_ The `.gitignore` `out/` pattern (for Next.js output) was unanchored and would also have swallowed the `application/ports/out/` source directory — caught and fixed by root-anchoring to `/out/`.

_Lessons / decisions:_ The proposal's "Zod schemas as contracts" became pure domain types, with Zod validating only at the boundaries; the ESLint rule enforces it. Reliability was split by layer on purpose: semantic retry-on-critic-rejection in the application orchestrator, transient API retry/backoff in the infrastructure adapters.

_Next week:_ Finish the objective-evaluation metrics and submit the Preliminary report.

---

## Week 10 (Topic 5 – Preliminary report) · w/c 29 Jun 2026

_What I did:_ Submitted the **Preliminary report** on Coursera on **29 Jun at 08:16** — graded **68.33%** (12.50% weight); the Topic 1–5 and Ethics checklists were all complete (100%). The report was a four-chapter LaTeX document (introduction, literature review, design, feature-prototype) with a TikZ architecture figure; its Chapter-4 numbers came from a **Haiku feasibility substitution** for the Coach and Critic (classifier accuracy 62.5%, 10/16, on a synthetic 16-session fixture), flagged honestly. In the same window (committed to the repo on 4 Jul) I largely completed the core development ahead of the Topic 6 schedule: the three pure metric functions (`accuracy`, `confusionMatrix`, `consistency`, 6 tests) and the four `pnpm eval:*` harness runners; the `resolveModels()` seam putting the three roles on their true tiers (Classifier `claude-haiku-4-5`, Coach `claude-opus-4-8`, Critic `claude-sonnet-4-6`) with gateway-vs-direct routing; a `z.preprocess` fix for Opus double-stringifying the plan's `sessions` field plus a bounded `retryOnError`; and the SSE streaming demo (a `reviewing` stage and a restyled timeline UI). 64 tests green across the monorepo (61 `@hyrox/training`, 3 `@hyrox/trpc`).

_Blockers / surprises:_ The report earned 68.33% — solid but with clear room to improve, which set the agenda for the Draft report. The written feedback praised the report structure, the template explanation, the critically-analysed literature and the architecture diagram, and asked for a summary table of the literature findings, a more detailed workplan, and clearer evaluation criteria with formulas. The Vercel AI Gateway tier available granted Haiku only, so the intended paid Opus/Sonnet numbers needed a direct Console key; the prelim therefore shipped feasibility figures. Note the provenance gap: the LaTeX was committed to git on 4 Jul, five days after the 29 Jun Coursera submission — the repo history lags the actual authoring.

_Lessons / decisions:_ Model choice is a first-class design variable — swapping the Coach from Haiku to Opus changed the *failure mode* (double-stringified `sessions`), not just quality. Keeping recovery in the orchestrator/adapter layer kept the agents pure.

_Next topic:_ Development (Topic 6), then write up toward the Draft report.

---

## Week 11 (Topic 6 – Development) · w/c 6 Jul 2026

_Topic phase; no separate dated repository activity — the core development (harness, true tiers, streaming) was completed early, in Weeks 9–10 (last commit 4 Jul). This period began turning that work into report prose toward the Draft report (submitted 19 Aug)._

---

## Week 12 (Topic 6 – Development, cont.) · w/c 13 Jul 2026

_Topic phase; no dated repository or Coursera activity recorded. Continued drafting the report write-up; the test suite stood at 64 from Week 10._

---

## Week 13 (Topic 7 – Testing and iteration) · w/c 20 Jul 2026

_Topic phase; no dated repository activity recorded. The implemented pipeline and its 64-test suite from Week 10 were the basis for the evaluation written up later; work this period fed the Draft report._

---

## Week 14 (Topic 7 – Testing and iteration, cont.) · w/c 27 Jul 2026

_Topic phase; no dated activity recorded._

---

## Week 15 (Topic 8 – Academic writing) · w/c 3 Aug 2026

_Topic phase; no dated repository activity recorded. The Academic-writing topic is where the full report prose (the 502-line `draft-report.md` mirror and the six LaTeX chapters) was developed, culminating in the Week 17 restructure._

---

## Week 16 (Topic 8 – Academic writing, cont.) · w/c 10 Aug 2026

_Topic phase; no dated activity recorded. Continued the report write-up ahead of the Draft-report deadline._

---

## Week 17 (Topic 9 – Your project and your career / Draft report) · w/c 17 Aug 2026

_What I did:_ Submitted the **Draft report** on Coursera on **19 Aug at 11:02** — graded **74%** (up from the preliminary 68.33%). The rubric breakdown (74/100) was weakest on Rubric 15 (5/10), Rubric 2 (2/5) and Rubric 12 (3/5); the grader praised the engineering and the honest negative findings (the 25% consistency), and set five priorities for the final report: evaluate on a larger real-athlete dataset and complete the user study; implement HR/pace zones and ACWR; extend the evaluation beyond a single model family; reformat the references into a consistent academic style; and move lengthy source code out of the main report to GitHub or Drive. Over 18–19 Aug I restructured the report from four chapters into a full six-chapter draft (a 20-file working-tree change, +873/−188): the feature-prototype chapter split into Implementation, Evaluation and Conclusion. The Evaluation chapter presents the harness re-run on the **true Opus/Sonnet tiers** — classifier accuracy 56.25% (9/16), consistency 25% type- and full-plan (one of five runs failed schema validation), the Critic intervening on all 8 ablation runs (37.5% rejected, 62.5% revised, mean 2.5 attempts), 0% one-shot prompt-variant approval, cost 61,326/18,412 tokens (a cycle under $0.10). I added a Conclusion, the `draft-report.md` mirror, reworked `references.bib`, added a `Makefile` and Dockerised `compile.sh`, and an `assertUsableBaseUrl()` guard with three tests.

_Blockers / surprises:_ The Claude Code CLI harness leaks `ANTHROPIC_BASE_URL` without a `/v1` segment, so `@ai-sdk/anthropic` appended `/messages` and every live call 404'd — one ablation run silently produced `completed: 0`; the new guard fails loudly. The true-tier eval figures live in the **gitignored** `data/eval-results/` JSONs, and this restructure is still **uncommitted** — so a marker cannot reproduce Chapter 5 from the committed repo. The user study (ethics/consent, recruitment, trial) has not started, so half of Objective 3 is unmet.

_Lessons / decisions:_ Moving from the Haiku feasibility substitution to the true tiers changed the failure *mode*, not just output quality — evidence for the three-tier argument. Every Chapter-5 figure still comes from one 16-session synthetic fixture, not real athlete data.

_Next week:_ Commit and push the restructured report + eval so it is reproducible; run `texcount -inc` to confirm the word limit (a naive `wc -w` on `draft-report.md` is ~9,600, above the 9,500 limit); begin the user study; build the specified-but-unbuilt feature engineering (pace/HR zones, ACWR) and live Strava/Garmin ingestion.

---

## Week 18 (Topic 9 – Your project and your career, cont.) · w/c 24 Aug 2026

_Topic phase; no dated repository or Coursera activity recorded after the 19 Aug draft submission._

---

## Week 19 (Topic 10 – Completing your project) · w/c 31 Aug 2026

_Topic phase; no dated activity recorded. Completion work (final report, remaining Topic 6–10 checklists) is still outstanding on Coursera._

---

## Week 20 (Topic 10 – Completing your project, cont.) · w/c 7 Sep 2026

_Topic phase; no dated activity recorded._

---

## Week 21 (Exam revision) · w/c 14 Sep 2026

_Milestone: the online exam (Inspera Exam Portal) was scheduled for **15 Sep**. No repository activity; exam performance is not something the repo records._

---

## Week 22 (Final submissions) · w/c 21 Sep 2026

_What I did (in progress, as of 27 Sep):_ The **Final report is due 28 Sep** (81.30% weight) and is **not yet submitted**; Topic 6–10 checklists also remain outstanding on Coursera. The six-chapter report restructure and the evaluation code from Week 17 are still **uncommitted and unpushed** — the immediate task is to commit and push them so the public repo matches the report, confirm the word count under the limit, and complete the final submission.

_Next week:_ Submit the final report and finish the outstanding checklists.

---
