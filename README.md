# Vergura — Creative Engineering Platform

Controlled AI creative production on top of the [KIE](https://kie.ai) API.
Brand-locked presets, budgeted generation, and a review gate between what a
model produces and what ships.

**Milestone 1 covers static creatives (images).** Video shares the same job
orchestration and is the next step — see [Roadmap](#roadmap).

## The problem this solves

Raw model access gives you a prompt box and a bill. That is not a production
process. This platform adds the three things a professional pipeline needs:

| Requirement | How it works |
| --- | --- |
| **Control** | Presets lock the model, the bracketing prompt language, and any parameters operators must not touch. Locks are enforced server-side in `compose()`, not hidden in the UI. |
| **Visibility** | Every job records the exact resolved prompt, the exact input JSON sent to KIE, the task ID, credits consumed, duration, failure codes, and full version lineage. |
| **Editing** | Prompts are editable per run within preset bounds, re-runs create linked versions, and versions are compared side by side before anything is approved. |

## Architecture

Generation is asynchronous: KIE returns a `taskId` immediately and the result
arrives minutes later. Everything here is shaped by that.

```
operator ──▶ compose()  ──▶ budget check ──▶ persist row ──▶ POST /jobs/createTask
                │                                  │
          preset locks                        (row exists before the API call,
          applied here                         so failed submits stay visible)
                                                   │
                        ┌──────────────────────────┴───────────────┐
                        ▼                                          ▼
             GET /jobs/recordInfo                        POST /api/webhooks/kie
             (polled every 4s by the queue,              (used when PUBLIC_BASE_URL
              and on each job-detail open)                is configured)
                        └──────────────┬───────────────────────────┘
                                       ▼
                          success ──▶ review gate ──▶ library
```

### Key modules

| Path | Responsibility |
| --- | --- |
| `lib/kie/models.ts` | Registry of image models and their field schemas, transcribed from docs.kie.ai. Drives the form, validation, and what a preset may lock. |
| `lib/kie/client.ts` | KIE adapter — `createTask` / `getTask`, plus a mock driver so the platform runs without a key. |
| `lib/kie/parse.ts` | Pure response parsing. Kept separate so it is unit-testable. |
| `lib/domain/compose.ts` | **The control layer.** Merges operator input with preset locks. Precedence: model defaults → operator params (only if whitelisted) → locked params. |
| `lib/domain/submit.ts` | Budget guardrail, persistence, submission, and polling. |
| `lib/db/schema.sql` | Postgres schema. Idempotent. |

### Preset precedence

An operator supplies only the variable middle of the prompt:

```
locked_prefix + operator_prompt + locked_suffix + "Avoid: " + negative_prompt
```

Each parameter is one of **locked** (pinned, shown greyed out), **free**
(operator sets it per run), or **model default** (not exposed). Attempts to set
a non-whitelisted key are dropped and reported back rather than silently
ignored. These models expose no negative-prompt field, so `negative_prompt` is
appended to the prompt text instead of being dropped.

### Budget guardrail

Submissions are blocked when the estimate exceeds a campaign's remaining
credits, counting both spent and in-flight commitments. The estimate is a
planning figure only — actual spend always comes from KIE's `creditsConsumed`.

## Setup

```bash
npm install
cp .env.example .env.local     # fill in DATABASE_URL and KIE_API_KEY
npm run db:migrate             # applies lib/db/schema.sql
npm run dev
```

Without `DATABASE_URL` the app renders a setup screen instead of crashing.
Without `KIE_API_KEY` it runs a **mock driver** that simulates
`queuing → generating → success` over ~12s, so the whole workflow is
explorable before any credits are spent. A banner always shows which mode you
are in.

### Verifying the live integration

```bash
npm run kie:smoke              # spends a small number of credits
```

This submits one 1K image, polls to completion, and prints the raw response.
Use it to confirm the one part of the contract the docs do not specify — see
below.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` / `start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm test` | Control-layer unit tests — no DB, no network |
| `npm run db:migrate` | Apply the schema |
| `npm run kie:smoke` | Live end-to-end KIE check |

## KIE integration notes

- Base `https://api.kie.ai`, auth `Authorization: Bearer <key>`. **Server-side
  only** — the key is never sent to the browser.
- `POST /api/v1/jobs/createTask` → `{ data: { taskId } }`. HTTP 200 means the
  task was *created*, not completed.
- `GET /api/v1/jobs/recordInfo?taskId=…` → `state` ∈ `waiting` `queuing`
  `generating` `success` `fail`, plus `creditsConsumed`, `costTime`,
  `failCode` / `failMsg`, `progress`.
- Rate limits: ~20 new tasks / 10s, 100+ concurrent.

> **Unverified:** `resultJson` is a JSON *string* whose inner shape is not
> documented on any model page. `extractUrls()` walks every variant KIE is
> known to emit (`resultUrls`, nested `url` keys, doubly-encoded strings, bare
> arrays) and is covered by tests — but confirm it against a real task with
> `npm run kie:smoke` before trusting it in production. If a job completes with
> no assets parsed, the job page shows the raw response so you can see the real
> shape.

Webhooks are optional. Set `PUBLIC_BASE_URL` to receive callbacks at
`/api/webhooks/kie`; otherwise the queue polls every 4 seconds. Set
`KIE_WEBHOOK_SECRET` whenever callbacks are enabled — KIE does not sign them,
so the route checks a `?token=` shared secret.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Production status: in-flight, awaiting review, spend, campaign budgets |
| `/generate` | Prompt editor with live resolved-prompt preview and visible locks |
| `/jobs` | Live queue, polling while anything is in flight |
| `/jobs/[id]` | Assets, version lineage, exact request sent, review + re-run |
| `/library` | Approved assets only |
| `/presets` | Brand control authoring |
| `/campaigns` | Briefs and budget envelopes |

## Roadmap

- **Video ads** — `kling-2.6/text-to-video`, `sora-2/*`, and Veo. The Market
  models reuse `createTask`/`recordInfo` unchanged; Veo needs an adapter for
  its legacy `/api/v1/veo/generate` endpoint and `successFlag` 0/1/2/3
  convention.
- **Auth** — there is currently no authentication. Add it before exposing this
  beyond a trusted network.
- **Asset rehosting** — KIE result URLs are treated as durable; mirror them to
  your own storage if you need long-term retention.
- **Audit trail** — job lineage is recorded, but there is no per-user actor
  history yet.

> **Note:** This project targets a modified Next.js 16. Before changing
> framework APIs, read the bundled guides in `node_modules/next/dist/docs/` —
> see [`AGENTS.md`](AGENTS.md).
