# warden-frontend

Web extension and/or web dApp for Warden accounts — account creation, signer/policy management,
and the client-side flows the new policies need that don't work as "just call the contract."

> **Status: design phase, no code yet.** Depends on `warden-contracts` for generated bindings and
> `warden-backend`'s API for indexed state.

## Why a separate repo

Same reasoning as `warden-backend`: this changes weekly, contracts should change rarely and
deliberately. Wallet-specific signing flows require separate client integration per wallet — that
integration work lives here, not in the contracts.

## Responsibilities mapped to the new policies

- **Time-window policy setup UI** — the contract only understands UTC ledger timestamps.
  "9am–5pm in the user's local timezone" gets converted into the UTC-relative
  `window_start_offset` / `period_seconds` params *here*, before signing the `install` call. This
  is a client responsibility by design, not a gap to fix later — Soroban doesn't expose timezone
  data on-chain.
- **Approval-delay two-phase flow UI** — the proposer's client constructs and signs the exact call
  once (establishing the context digest), then a co-approver needs a "pending approvals" inbox
  (fed by `warden-backend`'s indexer data) to review and sign `approve`. Re-submitting the
  *original* call a second time after approval must produce a byte-identical encoded context —
  getting that exactly right is this repo's job, and it's a genuinely rough UX to design around
  (the proposer effectively submits the same transaction twice), not a solved problem yet.
- **Call-count / spending-limit dashboards** — "3 of 5 automated calls used today," backed by the
  API's indexed policy state, not recomputed client-side from raw events.
- **Session-key creation flow** — install `session-policy` + a `CallContract` rule with a fresh
  ephemeral signer scoped to one dApp. This is the existing Latch v1 shape, unchanged here.

## Target layout

```
warden-frontend/
├── extension/   # browser extension signing surface
├── web-app/     # dApp / account management UI
└── shared/      # generated contract bindings, shared UI components
```

## Interfaces this repo consumes

| From | Artifact |
|---|---|
| `warden-contracts` | Deployed addresses, generated TS bindings from Soroban contract specs |
| `warden-backend` | Versioned REST/RPC API — account state, transaction history, approval-queue status |

## Assumptions stated up front

No tech stack was locked in during design — these specs assume a TypeScript frontend. Swap it
without changing the repo boundaries or interfaces above; those are the parts that are expensive
to change later, not the framework choice.

## Suggested next step

Minimal app that can create an account and read its state back through `warden-backend`'s
indexer — no new-policy UI yet. That exercises all three repos' interface boundaries before any
of the new policies are built.
