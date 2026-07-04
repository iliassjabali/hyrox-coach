# CM3070 Final Project — Master Plan

**Project:** Hyrox Personal Coach — Multi-Model LLM Orchestration for Hybrid-Sport Training
**Student:** Iliass Jabali (230586639)
**Template:** CM3020 Project Idea 1 — Governing Multiple Models Around a Goal
**Stack:** TypeScript + Next.js + Vercel AI SDK + 3 Claude models (Haiku/Sonnet/Opus) + Zod + Vitest
**Report:** LaTeX (Overleaf, IEEE referencing)

> Project tracking is **local in this repo** (this file + `journal.md`) — no Notion.

---

## Status snapshot

- ✅ Proposal video submitted
- ✅ Tutor approved architecture (Reza Rafeh, 2 Jun 2026)
- ✅ Template locked: CM3020 Idea 1
- ✅ Stack locked
- 🎯 Next milestone: **Preliminary Report (10%)** = PDF + 3-5 min prototype video

---

## Phase overview

| Phase | Weeks | Deliverable | Weight |
|---|---|---|---|
| 0. Setup | W3 (now) | repo + Overleaf + Strava export | — |
| 1. Foundation | W3-W4 | Black-box harness running locally | — |
| 2. Lit review + Design | W4-W6 | 2500-word lit review + design draft | — |
| 3. Prototype video + Prelim report | W6-W7 | **Preliminary Report submission** | **10%** |
| 4. Build (core) | W7-W14 | Full system working, classifier evaluated | — |
| 5. User study + Eval | W14-W17 | 5-10 athletes tested, objective metrics done | — |
| 6. Draft report | W17-W18 | **Draft report (formative)** | 0% |
| 7. Final report + video | W18-W21 | **Final submission** | **65%** |
| 8. Exam revision | W21-W22 | **Written exam** | **20%** |

---

## Phase 0 — Setup (this week)

| # | Task | Effort | Dependency | Status |
|---|---|---|---|---|
| 0.1 | Set up local `docs/` hub (this plan, journal, link proposal / Reza email / rubric / mock exam) | 30 min | — | ⬜ |
| 0.2 | Create private GitHub repo `hyrox-coach` with README | 15 min | — | ✅ |
| 0.3 | Create Overleaf project, IEEE template, link to GitHub via git | 30 min | — | ⬜ |
| 0.4 | Install Zotero, set citation style to IEEE, install browser connector | 20 min | — | ⬜ |
| 0.5 | Export Strava last 30 days as CSV | 15 min | — | ⬜ |
| 0.6 | Export Garmin last 30 days as FIT/CSV | 15 min | — | ⬜ |
| 0.7 | Save Reza's email to `docs/` + tag for future reference | 10 min | — | ⬜ |
| 0.8 | Schedule weekly 2-hour project block in calendar | 5 min | — | ⬜ |
| 0.9 | Read Coursera prelim report submission page, note exact deadline | 10 min | — | ⬜ |
| 0.10 | Open project journal entry W3, write what you've done so far | 15 min | — | ⬜ |

---

## Phase 1 — Foundation: prototype harness (W3-W4)

> **Architecture update (2026-06-21):** moved from a flat Next.js app to a
> **Turborepo + pnpm monorepo with a hexagonal `@hyrox/training` bounded context**
> (Drizzle, tRPC). Domain types are pure TS; Zod is used only at boundaries.
> See `docs/superpowers/specs/2026-06-21-trpc-monorepo-hexagonal-design.md`. Some
> task wording below predates this and is being re-mapped onto the layered structure.

| # | Task | Effort | Dependency | Status |
|---|---|---|---|---|
| 1.0 | Monorepo scaffold + `@hyrox/training` hexagon + scaffold script/skill | — | 0.2 | ✅ |
| 1.1 | Next.js app (`apps/web`) builds with tRPC handler + demo page; Tailwind + Vercel deploy still TODO | 1 hr | 0.2 | 🔨 |
| 1.2 | Vercel AI SDK + @ai-sdk/anthropic + Zod installed | 15 min | 1.1 | ✅ |
| 1.3 | Domain model: SessionType, WorkoutSession, WeeklyPlan, PlanVerdict, TRIMP done (TDD); LLM-boundary Zod schemas next | 1.5 hr | 1.2 | 🔨 |
| 1.4 | Strava CSV parser → `RawSessionInput[]` done; pace/HR zones + ACWR still TODO | 3 hr | 1.3, 0.5 | 🔨 |
| 1.5 | Vitest setup + first tests (domain) | 30 min | 1.4 | ✅ |
| 1.6 | Classifier: `ClassifierLlm` port + `ClassifySessions` use case + Anthropic Haiku adapter | 1 hr | 1.3 | ✅ |
| 1.7 | Coach: `CoachLlm` port + Anthropic Opus adapter | 1 hr | 1.3 | ✅ |
| 1.8 | Critic: `CriticLlm` port + Anthropic Sonnet adapter | 1 hr | 1.3 | ✅ |
| 1.9 | `CoachAthlete` orchestrator: Classify → Coach → Critic with retry + critic-rejection + cost | 2 hr | 1.6-1.8 | ✅ |
| 1.10 | Real Claude Haiku call (AnthropicClassifierAdapter via AI SDK) | 1 hr | 1.9 | ✅ |
| 1.11 | Real Claude Opus call (AnthropicCoachAdapter) | 1 hr | 1.9 | ✅ |
| 1.12 | Real Claude Sonnet call (AnthropicCriticAdapter) | 1 hr | 1.9 | ✅ |
| 1.13 | Next.js page: generate plan from sample data, see agent output + cost | 2 hr | 1.10-1.12 | ✅ |
| 1.14 | Manually label 20 sessions by Hyrox-relevant type (run, sled, burpees, mixed) | 1 hr | 0.5 | ⬜ |
| 1.15 | Eval metrics: `accuracy` + `confusionMatrix` + `consistency` implemented (TDD); needs labelled set to run | 2 hr | 1.10, 1.14 | 🔨 |
| 1.16 | Project journal entry W4 | 15 min | — | ⬜ |

---

## Phase 2 — Literature review + Design draft (W4-W6)

**Research question (proposed):**
> *"How do existing multi-agent LLM orchestration systems and AI-based fitness coaching applications address structured reasoning over personal training data, and what gaps remain for hybrid-sport athletes?"*

**Lit review structure (Matt's 4 rules):**
1. Anchor to research question
2. Show critical ability (call out weaknesses)
3. Synthesize
4. Bridge to your project

**Two-branch coverage (per Reza):**

| Branch A: LLM Orchestration | Branch B: AI Fitness |
|---|---|
| ReAct (Yao et al., 2022) | Strava training plans |
| Reflexion (Shinn et al., 2023) | Garmin Coach + Firstbeat |
| Multi-Agent Debate (Du et al., 2023) | Humango / Athletica |
| AutoGen (Wu et al., 2023) | Generic LLM coach apps |
| LangGraph docs (industry) | TSS / TRIMP limitations papers |

| # | Task | Effort | Dependency | Status |
|---|---|---|---|---|
| 2.1 | Write research question, post in tutor forum for feedback | 1 hr | — | ⬜ |
| 2.2 | Search Scholar + arXiv for branch A (orchestration): ReAct, Reflexion, Du, AutoGen | 3 hr | 0.4 | ⬜ |
| 2.3 | Search for branch B (AI fitness): Strava ML, Garmin Firstbeat, Humango/Athletica, TSS/TRIMP papers | 2 hr | 0.4 | ⬜ |
| 2.4 | Add all sources to Zotero, tag by branch | 1 hr | 2.2, 2.3 | ⬜ |
| 2.5 | Read + take notes on top 4 orchestration papers (Yao, Shinn, Du, Wu) | 6 hr | 2.4 | ⬜ |
| 2.6 | Read + take notes on top 4 fitness sources | 4 hr | 2.4 | ⬜ |
| 2.7 | Draft branch A subsection (~1000 words) with critique per paper | 4 hr | 2.5 | ⬜ |
| 2.8 | Draft branch B subsection (~1000 words) with critique per source | 3 hr | 2.6 | ⬜ |
| 2.9 | Draft synthesis + bridge-to-project paragraph (~500 words) | 2 hr | 2.7, 2.8 | ⬜ |
| 2.10 | Post in forum: "is this lit review structure on track?" with synthesis | 30 min | 2.9 | ⬜ |
| 2.11 | Iterate based on forum feedback | 2 hr | 2.10 | ⬜ |
| 2.12 | Forum check: confirm industry sources acceptable | 15 min | — | ⬜ |
| 2.13 | Project journal entries W5 + W6 | 30 min | — | ⬜ |

---

## Phase 3 — Preliminary Report + Prototype Video (W6-W7) 🎯 10%

| # | Task | Effort | Dependency | Status |
|---|---|---|---|---|
| 3.1 | LaTeX: write Introduction section (~500 words) | 2 hr | — | ⬜ |
| 3.2 | LaTeX: paste lit review into report, format citations | 2 hr | 2.11 | ⬜ |
| 3.3 | Draw architecture diagram (Excalidraw or TikZ) | 2 hr | 1.9 | ⬜ |
| 3.4 | LaTeX: Design section (~1500 words) — model role rationale, Zod schemas, orchestrator flow | 4 hr | 3.3 | ⬜ |
| 3.5 | LaTeX: Feature prototype section (~1500 words) — what built, what stubbed, eval results | 3 hr | 1.15 | ⬜ |
| 3.6 | Create Gantt chart (Mermaid or LaTeX `pgfgantt`) for full 22 weeks | 2 hr | — | ⬜ |
| 3.7 | Add Gantt to report appendix | 30 min | 3.6 | ⬜ |
| 3.8 | Add word counts at front of report | 15 min | 3.1-3.5 | ⬜ |
| 3.9 | Reference check: every citation real, IEEE-formatted, complete | 1 hr | 3.2 | ⬜ |
| 3.10 | DEI paragraph (acknowledge explicitly even if minimal) | 1 hr | — | ⬜ |
| 3.11 | Self-edit pass: read whole report out loud, fix flow | 2 hr | 3.1-3.10 | ⬜ |
| 3.12 | Export final PDF, check word count per section under limits | 30 min | 3.11 | ⬜ |
| 3.13 | **Prototype video script** (3-step: demo, purpose, limitations) | 1 hr | 1.15 | ⬜ |
| 3.14 | Screen-record the prototype running on real Strava data | 1 hr | 3.13 | ⬜ |
| 3.15 | Edit + voiceover, export MP4 3-5 min | 1.5 hr | 3.14 | ⬜ |
| 3.16 | Submit PDF + MP4 to Coursera | 30 min | 3.12, 3.15 | ⬜ |
| 3.17 | Project journal entry W7 | 15 min | — | ⬜ |

---

## Phase 4 — Build the real system (W7-W14)

| # | Task | Effort | Dependency | Status |
|---|---|---|---|---|
| 4.1 | Strava OAuth integration (replace CSV upload) | 4 hr | 1.13 | ⬜ |
| 4.2 | Garmin connection (Garmin Connect IQ or unofficial library) | 6 hr | 1.13 | ⬜ |
| 4.3 | SQLite or Postgres for storing athlete data + sessions | 3 hr | 4.1 | ⬜ |
| 4.4 | Improve feature engineering: ACWR, monotony, fitness/fatigue model | 6 hr | 4.3 | ⬜ |
| 4.5 | Coach agent: prompt iteration — at least 3 versions A/B tested | 5 hr | 1.11 | ⬜ |
| 4.6 | Critic agent: define plausibility/safety rules in prompt | 4 hr | 1.12 | ⬜ |
| 4.7 | Add conflict resolution logic when Critic rejects Coach output | 3 hr | 4.6 | ⬜ |
| 4.8 | Retry logic with exponential backoff | 2 hr | 1.9 | ⬜ |
| 4.9 | Cost tracking per request, logged to DB | 2 hr | 4.3 | ⬜ |
| 4.10 | Frontend: render weekly plan from Coach output | 4 hr | 4.1 | ⬜ |
| 4.11 | Frontend: history view of athlete sessions | 3 hr | 4.3 | ⬜ |
| 4.12 | Unit test suite: 20+ tests across parser, orchestrator, agents | 6 hr | — | ⬜ |
| 4.13 | Integration test: end-to-end with real Claude calls (env-gated) | 3 hr | 4.12 | ⬜ |
| 4.14 | Ablation harness: same input, with/without Critic, compare outputs | 4 hr | 4.7 | ⬜ |
| 4.15 | Classifier accuracy: scale labelled set to 50+ sessions | 3 hr | 1.14 | ⬜ |
| 4.16 | Consistency metric: run same input 5 times, measure output variance | 3 hr | 4.5 | ⬜ |
| 4.17 | Prompt-variant ablation: 3 Coach prompt variants, compare quality | 4 hr | 4.5 | ⬜ |
| 4.18 | Reza-update artifact: working demo + 1-page summary (only if real blocker) | — | — | ⬜ |
| 4.19 | Project journal entries W8-W14 | weekly | — | ⬜ |

---

## Phase 5 — User study + objective evaluation (W14-W17)

| # | Task | Effort | Dependency | Status |
|---|---|---|---|---|
| 5.1 | Draft consent form (informed consent, data use, retention, withdrawal) | 2 hr | — | ⬜ |
| 5.2 | Forum check: confirm consent form template adequate | 15 min | 5.1 | ⬜ |
| 5.3 | Data storage policy doc: password-protected folder, encryption, deletion timeline | 1 hr | — | ⬜ |
| 5.4 | App UI: visible disclaimer "Training aid only, not medical advice" | 30 min | 4.10 | ⬜ |
| 5.5 | Recruit 5-10 Hyrox athletes (MSCA Slack, Casablanca clubs, Hyrox Morocco FB) | 3 hr | 5.1 | ⬜ |
| 5.6 | Collect signed consent forms | — | 5.5 | ⬜ |
| 5.7 | Onboard each athlete: Strava connect, baseline questionnaire | 2 hr each | 5.6 | ⬜ |
| 5.8 | 4-week trial period — athletes use the app weekly | 4 weeks | 5.7 | ⬜ |
| 5.9 | Likert questionnaire post-trial (plan usefulness, trust, would-pay) | 2 hr | 5.8 | ⬜ |
| 5.10 | Collect + analyse responses, anonymise data | 4 hr | 5.9 | ⬜ |
| 5.11 | Write Evaluation chapter section on user study (~1000 words) | 3 hr | 5.10 | ⬜ |
| 5.12 | Write Evaluation chapter section on objective metrics (~2000 words) | 5 hr | 4.14-4.17 | ⬜ |
| 5.13 | Project journal entries W14-W17 | weekly | — | ⬜ |

---

## Phase 6 — Draft report (W17-W18) 🎯 formative, 0%

| # | Task | Effort | Dependency | Status |
|---|---|---|---|---|
| 6.1 | LaTeX: full report structure (Intro, Lit, Design, Implementation, Eval, Conclusion) | 4 hr | — | ⬜ |
| 6.2 | Polish Intro chapter (~1500 words) | 3 hr | 3.1 | ⬜ |
| 6.3 | Expand lit review to final length (~3500-4500 words) | 6 hr | 2.11 | ⬜ |
| 6.4 | Polish Design chapter (~2500 words) | 4 hr | 3.4 | ⬜ |
| 6.5 | Write Implementation chapter (~3000 words) | 8 hr | 4.x | ⬜ |
| 6.6 | Paste Evaluation chapter (5.11, 5.12) | 1 hr | 5.11, 5.12 | ⬜ |
| 6.7 | Write Conclusion + Future Work (~1000 words) | 3 hr | 6.6 | ⬜ |
| 6.8 | Add Self-Reflection section (~1500 words) — what went wrong, how worked around | 4 hr | journal | ⬜ |
| 6.9 | Add DEI section (~500-1000 words) — bias in training data, accessibility | 2 hr | — | ⬜ |
| 6.10 | Full reference pass, no fakes, IEEE complete | 2 hr | 6.x | ⬜ |
| 6.11 | Word counts per chapter on front page | 15 min | 6.x | ⬜ |
| 6.12 | Submit draft report | 30 min | 6.1-6.11 | ⬜ |
| 6.13 | Project journal entry W18 | 15 min | — | ⬜ |

---

## Phase 7 — Final submission (W18-W21) 🎯 65%

| # | Task | Effort | Dependency | Status |
|---|---|---|---|---|
| 7.1 | Read draft report feedback when it arrives | 1 hr | 6.12 | ⬜ |
| 7.2 | Address every feedback point, track in changelog | 8 hr | 7.1 | ⬜ |
| 7.3 | Make GitHub repo public, add full README with run instructions | 2 hr | — | ⬜ |
| 7.4 | Add LICENSE, .gitignore, docs/ folder | 1 hr | 7.3 | ⬜ |
| 7.5 | Final code cleanup, dead code removal, comments | 6 hr | — | ⬜ |
| 7.6 | Final eval run, freeze metrics, update report | 3 hr | 4.14-4.17, 5.10 | ⬜ |
| 7.7 | Final report proofread (out loud, twice) | 4 hr | 7.2 | ⬜ |
| 7.8 | Final video script (5 min — full project, results, demo) | 2 hr | — | ⬜ |
| 7.9 | Record final video | 2 hr | 7.8 | ⬜ |
| 7.10 | Submit final report PDF + video MP4 + GitHub link | 1 hr | 7.x | ⬜ |
| 7.11 | Project journal entry W21 | 15 min | — | ⬜ |

---

## Phase 8 — Exam (W21-W22) 🎯 20%

| # | Task | Effort | Dependency | Status |
|---|---|---|---|---|
| 8.1 | Re-read mock exam, write rough answers to all 4 questions | 4 hr | — | ⬜ |
| 8.2 | Re-read project journal, extract "lessons learned" themes | 2 hr | journal | ⬜ |
| 8.3 | Re-read your own report, especially Self-Reflection chapter | 2 hr | 7.10 | ⬜ |
| 8.4 | Prepare answer template: template flexibility, DEI, aims vs outcomes, 3 lessons learned, lit review reflection, time allocation | 4 hr | 8.1-8.3 | ⬜ |
| 8.5 | Mock exam under timed conditions | 3 hr | 8.4 | ⬜ |
| 8.6 | Sit exam | — | — | ⬜ |

---

## LaTeX report structure (lives in Overleaf)

```
cm3070-final-report/
├── main.tex
├── references.bib
├── chapters/
│   ├── 00-abstract.tex
│   ├── 01-introduction.tex
│   ├── 02-literature-review.tex
│   ├── 03-design.tex
│   ├── 04-implementation.tex
│   ├── 05-evaluation.tex
│   ├── 06-self-reflection.tex
│   ├── 07-dei.tex
│   ├── 08-conclusion.tex
│   └── 09-appendix-gantt.tex
├── figures/
│   ├── architecture.pdf
│   ├── gantt.pdf
│   └── eval-confusion-matrix.pdf
└── README.md
```

### main.tex skeleton

```latex
\documentclass[11pt,a4paper]{report}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage[margin=2.5cm]{geometry}
\usepackage{graphicx}
\usepackage{hyperref}
\usepackage{cite}
\usepackage{listings}
\usepackage{xcolor}
\usepackage{pgfgantt}
\usepackage{booktabs}

\title{Hyrox Personal Coach: \\ Multi-Model LLM Orchestration for Hybrid-Sport Training}
\author{Iliass Jabali \\ Student No. 230586639 \\ CM3070 Final Project \\ University of London}
\date{\today}

\begin{document}
\maketitle
\tableofcontents

\chapter*{Word Counts}
\begin{itemize}
  \item Introduction: XXX
  \item Literature Review: XXX
  \item Design: XXX
  \item Feature Prototype: XXX
  \item Total: XXX
\end{itemize}

\input{chapters/01-introduction}
\input{chapters/02-literature-review}
\input{chapters/03-design}
\input{chapters/04-implementation}
\input{chapters/05-evaluation}
\input{chapters/06-self-reflection}
\input{chapters/07-dei}
\input{chapters/08-conclusion}

\bibliographystyle{IEEEtran}
\bibliography{references}

\appendix
\input{chapters/09-appendix-gantt}

\end{document}
```

---

## Standing rules (UoL CM3070)

- **Referencing:** IEEE only (one variant, no confusion)
- **No fake references** — Ali flagged this is serious
- **Word limits, not page limits** — lit review = 2500 words for prelim
- **GitHub repo:** public at final submission, viewable until results released
- **AI use is permitted** — declare AI assistance per the module's AI-use policy when submitting
- **DEI is a learning objective** — must address explicitly
- **API keys:** never share — markers review code on GitHub
- **Forums first** — busiest of any UoL module, 15:1 student-to-tutor ratio
- **Hard-coded data is fine** in prototype if data pipeline isn't the focus
- **Project journal** — one paragraph per week, used for exam Q3

---

## Reza's feedback (banked, 2 Jun 2026)

- ✅ Three Claude models in different agent roles = fits template
- ✅ Orchestrator + routing + validation + evaluation = sufficient technical depth
- ✅ Evaluation plan appropriate
- ✅ Ethics approach reasonable
- ⚠️ **Lead with objective metrics** (classifier accuracy, consistency, ablation studies); user study is supplementary
- ⚠️ **Lit review must cover both** LLM agent orchestration AND AI-based fitness coaching, focused on architectural differentiation
- ⚠️ Ethics: informed consent, secure storage, clear limitations on coaching/health advice
- Note: this feedback is preliminary; final judgement on submitted materials

---

## Rubric criteria (14 items, for self-check before every submission)

1. Template clearly stated, connection evident throughout
2. Report clear, well formatted, coherent
3. Displays knowledge of area (lit review)
4. Critically evaluates previous work
5. Proper citation and referencing
6. Design clear and high quality
7. Project concept justified by domain
8. Work plan detailed and feasible
9. Evaluation strategy appropriate
10. Feature prototype high quality
11. Feature prototype technically challenging
12. Demonstration effective
13. Evaluates prototype + shows improvements
14. Innovation and excellence (exceptional criteria)

---

## What to do TODAY

1. ✅ GitHub repo `hyrox-coach` created (private) with README, AGENTS.md, CLAUDE.md, docs/
2. Create Overleaf project, paste the LaTeX skeleton above
3. Export Strava CSV
4. Open `docs/journal.md` entry W3, write one sentence per setup task done

Then start Phase 1.
