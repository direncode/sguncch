# Participatory Data Estate

> A reusable Latent Ocean primitive for turning raw human submissions into a typed, auditable, dynamically crystallized data estate.

---

## Subsection Title & Description

**Title:** *Participatory Data Estate — A Crystallization Primitive for Living Organizational Knowledge*

**One-line:** I rebuilt an ossified student-government platform into a general **submit → moderate → thin → crystallize** pipeline with a transparent allocation ledger, then folded it back into the Latent Ocean engine as a first-class primitive for any organization whose data is authored by its members.

**Sub-tagline for hover / hero card:** *The piece of the Latent Ocean that lets the ocean refill itself.*

---

## Portfolio Copy (drop-in markdown)

### The problem

Most "knowledge bases" are graveyards: someone dumps PDFs, no one classifies them, the index rots, and the allocation decisions made on top of that data happen in private spreadsheets. The people the data is *about* never see the pipeline and can't contribute to it without filing a ticket.

A **data estate** should be the opposite: continuously authored by its constituents, typed at ingest, and transparent at the point of allocation. That requires a pipeline, not a folder.

### What I built

A four-stage participatory crystallization pipeline, extracted from a governance platform and generalized into a Latent Ocean primitive.

```
  ┌──────────┐   ┌───────────┐   ┌────────────┐   ┌──────────────┐   ┌───────────────┐
  │  SUBMIT  │──▶│ MODERATE  │──▶│   THIN     │──▶│ CRYSTALLIZE  │──▶│ ALLOCATE      │
  │  (any)   │   │ (gated)   │   │  (BTUT)    │   │  (TCD-JEPA)  │   │ (open ledger) │
  └──────────┘   └───────────┘   └────────────┘   └──────────────┘   └───────────────┘
       │              │                │                  │                   │
       ▼              ▼                ▼                  ▼                   ▼
  rate-limited    pending →       dedup hash +       chunked + typed    append-only
  public intake   approved /      keyword bucket     embeddings +        approval_log
  + file / URL /  rejected with   + AI category      H0/H1/H2 modules   + public budget
  scrape / PDF    reason + log    confidence                             read, gated write
```

Everything downstream of **Submit** is observable. Everything upstream of **Allocate** is typed.

### The pipeline, stage by stage

#### 1. Submit — permissive, rate-limited, hash-identified

A single public endpoint (`POST /api/codex/submit`) accepts typed text, uploaded files, scraped URLs, crawled portals, and extracted PDF text through a common `createDocument()` contract. Each submission is:

- **Rate-limited per client IP** (5/min) so the estate can't be flooded.
- **Hashed (SHA-256)** on full text so identical resubmissions are collapsed at the storage layer.
- **Logged** with `logApprovalAction(id, 'submitted', actor)` before it ever touches moderation.

The submission is *never* directly visible — it enters the estate with `status = 'pending'` and sits behind a gate.

#### 2. Moderate — AI pre-analysis, human gate, immutable trail

Moderation is a two-step: a pre-analysis agent produces a *recommendation*, and an authorized moderator produces a *decision*. Both are logged.

- **`POST /api/codex/analyze`** — Grok returns `{ category, confidence, summary, keyProvisions[], similarDocs[] }`, including duplicate / near-duplicate detection against the already-approved corpus.
- **`POST /api/codex/approve`** / **`POST /api/codex/reject`** — status transitions `pending → approved | rejected`, each writing an entry to `approval_log (document_id, action, performed_by, reason, performed_at)`.

The `approval_log` is append-only and publicly readable via `GET /api/codex/audit?document_id=…`. Every piece of data in the estate can be traced back to the human who admitted it and the reason they gave.

#### 3. Thin — BTUT-style reduction before crystallization

Before anything becomes a permanent module, it's thinned. I used a hybrid keyword-plus-AI bucketing layer that runs over the full approved set and collapses it into a small number of typed buckets by score:

```js
// lib/scroll.js (excerpt)
const CATEGORIES = [
  { id: 'laws',        keywords: ['law','statute','act','regulation','compliance',...] },
  { id: 'policies',    keywords: ['policy','bylaw','constitution','charter','resolution',...] },
  { id: 'resources',   keywords: [...] },
  { id: 'academic',    keywords: [...] },
  { id: 'budget',      keywords: [...] },
  { id: 'student-life',keywords: [...] },
]
// multi-word phrases score 3×, single tokens score 1×; highest score wins; fallback = 'general'
```

This is the *BTUT thinning* layer in miniature: cheap, deterministic, domain-lexicon driven, runs before the expensive embedding pass. It's where you get to say "this chunk of raw input is a *law* and not a *resource*" without paying a model call per document.

#### 4. Crystallize — TCD-JEPA into typed modules

Approval is where raw text becomes a structured module in the estate:

1. Text is cut into **700-char chunks with 100-char overlap** via `chunkText()`.
2. Each chunk is embedded (1536-dim xAI `v1` embedding) and written to `document_chunks(embedding vector(1536))`.
3. A pgvector index (`match_document_chunks(query_embedding, threshold, limit)`) makes the chunks queryable.
4. A tsvector GIN index (`search_document_chunks_fts`) gives a deterministic fallback when the vector path is unavailable.
5. The parent document is stamped with `approved_by`, `approved_at`, and its typed `category`.

The chunk set *is* the crystallized module: bounded in size, typed by parent, addressable by vector or keyword, and permanently linked back to the audit trail.

### Typed crystallization: H0 / H1 / H2

Generalizing the governance-specific categories into the Latent Ocean's module-type lattice:

| Type | Role                                | Examples from the governance instance                                       | Mutability                 |
| ---- | ----------------------------------- | --------------------------------------------------------------------------- | -------------------------- |
| **H0** | Stable substrate                  | Constitution, statutes, honor code, FERPA / Title IX, bylaws                | Versioned, rarely changes  |
| **H1** | Cyclic activity                   | Funding requests, budget allocations, policy discussions, meeting minutes   | Recurring, periodic        |
| **H2** | Gaps & pending signal             | Rejected submissions, `status='pending'` queue, unfilled keyword buckets    | Transient, diagnostic      |

The same categorizer emits all three. **H0** is the estate's floor, **H1** is the estate's pulse, **H2** is the estate's to-do list — and because every submission is logged, the ratio of H1→H0 promotion and H0 coverage gaps is observable directly from the database, not guessed at.

### Transparent Allocation Ledger

Where most platforms hide the spending, this estate puts it on the wire.

- **`/budget-transparency`** renders the full allocation table (org, category, approved, spent, utilization %) with no auth required.
- Categories (`events`, `travel`, `merch`, `supplies`, `wellness`, `food`, `marketing`, `technology`, `emergency`, `other`) are the H1 type system for the finance side of the estate.
- `POST /api/validate-budget` scores every request along urgency (0–25) + priority alignment (0–20) + availability (0–20) + duplication penalty (−30) + impact (0–15) + price reasonableness (−20…+10). The *scoring rubric itself* is in the repo, not in a trustee's head.
- Writes are admin-gated; reads are public. Same shape as the `approval_log`.

This is the estate's **outward-facing face**: the H1 pulse rendered as a live, line-itemized, reason-annotated public ledger.

### Dynamic & updatable by construction

Three properties make this a *living* estate, not a static export:

1. **Continuous intake** — the submit endpoint is always on, rate-limited rather than closed.
2. **Hybrid storage with auto-migration** — Supabase is primary, flat-file is fallback (`.data/documents.json`, `.data/chunks.json`, `.data/approval_log.json`), and `autoMigrateCodexTables()` reconciles the two so the estate can survive a backend outage or a greenfield deploy without losing its trail.
3. **Redundant search** — vector → FTS → substring. The estate answers queries even when half its infrastructure is missing.

None of this is governance-specific. Swap the `CATEGORIES` lexicon and the H0/H1/H2 mapping and the same pipeline runs a product research estate, a policy-research org, a DAO's proposal queue, or a nonprofit's grant ledger.

---

## Suggested diagrams & screenshots

Priority order for the portfolio page:

1. **Hero diagram — the five-box pipeline** (reproduce the Submit → Moderate → Thin → Crystallize → Allocate ASCII above as a clean SVG). This is the primitive in one image.
2. **H0 / H1 / H2 lattice** — a three-column figure: stable substrate (constitution icon), cyclic pulse (budget cycle icon), gap queue (pending tray icon). Label each with one real example from the repo.
3. **`approval_log` row animation** — a short GIF / lottie: a pending document moves through `submitted → analyzed → approved`, each step dropping a new row into the log. Emphasizes append-only + visibility.
4. **The Scroll — categorized view** — screenshot of `/scroll` with the category buckets (Laws, Policies, Resources, Academic, Budget, Student-Life) and count badges. Caption: *every chip is a crystallized H0 module*.
5. **Budget Transparency ledger** — screenshot of `/budget-transparency` with org / approved / spent / utilization. Caption: *H1 cycle, rendered publicly, scored by a rubric that lives in the repo.*
6. **Schema snippet** — small code card showing `governance_documents`, `document_chunks(embedding vector(1536))`, and `approval_log` side by side. Sells the "typed + indexed + auditable" story in ~15 lines.

---

## What this adds to the core Latent Ocean engine

- **Participatory intake primitive** — rate-limited, hash-dedup'd `submit()` contract that any Latent Ocean domain can mount without writing its own form handler.
- **Moderation gate with AI pre-analysis** — pluggable `analyze → approve/reject` pattern where the AI recommends and a human decides, and both are logged.
- **BTUT-style cheap thinner** — a keyword-lexicon categorizer that runs before the embedding pass and lets a domain declare its own H0/H1/H2 type lattice without retraining anything.
- **TCD-JEPA crystallization adapter** — `chunkText + embed + index` pipeline that turns approved submissions into addressable modules with both vector and FTS paths.
- **Immutable audit ledger** — `approval_log` schema and `GET /audit` endpoint as a reusable transparency substrate for *any* mutation in the estate, not just document approvals.
- **Public allocation ledger** — pattern for exposing H1 cyclic activity (budgets, grants, proposals, spend) with an in-repo scoring rubric, turning "who decided what" into a queryable artifact.
- **Graceful degradation** — Supabase-primary / file-fallback / auto-migrating storage so Latent Ocean instances stay live through infrastructure gaps.
- **Domain-swappability** — every domain-specific piece (category lexicon, scoring rubric, H0/H1/H2 mapping, seed registry) is a config, not a fork.
