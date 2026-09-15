# warden-frontend

Web extension and/or web dApp for [Warden](https://github.com/Osok-Labs/warden-contracts) smart
accounts — account creation, signer/policy management, and the client-side flows the new policies
need that don't work as "just call the contract."

> **Status: read-only account viewer running.** `web-app/` (Next.js) reads a Warden smart account's
> live state straight from Stellar testnet via a simulated, unsigned contract call — no wallet
> needed for that — and shows `warden-backend`'s indexed events alongside it. Account *creation*
> (the wallet-signed deploy flow) isn't built yet — see [Status](#status).

## Status

| Piece | State |
|---|---|
| Read account state (`web-app`) | ✅ `Client.from()` (`@stellar/stellar-sdk/contract`) downloads the deployed contract's spec and simulates a `get_context_rule`/`get_context_rules_count` call server-side — no wallet, no generated bindings package yet (see below) |
| Show indexed events (`web-app`) | ✅ Fetches `warden-backend`'s `/events`; degrades to "no events yet" if the indexer isn't running rather than failing the page |
| Create an account | ⬜ Not started — needs wallet integration (Freighter or similar) to sign a real deploy transaction |
| Policy setup UIs (time-window, approval-delay, etc.) | ⬜ Not started — those policies don't exist in `warden-contracts` yet either |
| Browser extension (`extension/`) | ⬜ Not started |
| Generated TS bindings (`shared/`) | ⬜ Not started — `web-app` currently hand-types the couple of contract methods it calls; see [Interfaces this repo consumes](#interfaces-this-repo-consumes) |

## Running the web app

```sh
cd web-app
npm install
npm run dev
# http://localhost:3000
```

Defaults to Stellar testnet and the demo account in
`warden-contracts/deployments/testnet.json`. Copy `env.example` to `.env.local` to override; see
that file for each variable. Run `warden-backend`'s indexer locally (see that repo) to populate the
"Indexed events" section — the page works without it, just with that section empty.

## Why a separate repo

Same reasoning as [`warden-backend`](https://github.com/Osok-Labs/warden-backend): this changes
weekly, contracts should change rarely and deliberately. Wallet-specific signing flows require
separate client integration per wallet — that integration work lives here, not in the contracts.

## Responsibilities mapped to the new policies

| Policy | Client responsibility |
|---|---|
| **time-window-policy setup UI** | The contract only understands UTC ledger timestamps. "9am–5pm in the user's local timezone" gets converted into the UTC-relative `window_start_offset` / `period_seconds` params *here*, before signing the `install` call — a client responsibility by design, not a gap to fix later, since Soroban doesn't expose timezone data on-chain. |
| **approval-delay-policy two-phase flow UI** | The proposer's client constructs and signs the exact call once (establishing the context digest), then a co-approver needs a "pending approvals" inbox (fed by `warden-backend`'s indexer data) to review and sign `approve`. Re-submitting the *original* call a second time after approval must produce a byte-identical encoded context — getting that exactly right is this repo's job, and it's a genuinely rough UX to design around (the proposer effectively submits the same transaction twice), not a solved problem yet. |
| **call-count-limit-policy / spending-limit-policy dashboards** | "3 of 5 automated calls used today," backed by the API's indexed policy state, not recomputed client-side from raw events. |
| **session-key creation flow** | Install `session-policy` plus a `CallContract` rule with a fresh ephemeral signer scoped to one dApp. This is the existing Latch v1 shape, unchanged here. |

## Repository structure

```
warden-frontend/
├── web-app/     # ✅ dApp / account viewer (Next.js) -- see Status above
├── extension/   # browser extension signing surface -- not started
└── shared/      # generated contract bindings, shared UI components -- not started
```

## Interfaces this repo consumes

| From | Artifact |
|---|---|
| `warden-contracts` | Deployed addresses, generated TS bindings from Soroban contract specs |
| `warden-backend` | Versioned REST/RPC API — account state, transaction history, approval-queue status |

Not wired up yet: `web-app` currently calls `contract.Client.from()`, which fetches the contract's
spec straight from its on-chain Wasm at runtime rather than depending on a generated bindings
package — that's why `WardenSmartAccountContract` in `src/lib/warden.ts` is hand-typed. Fine for a
couple of read methods; worth replacing once there's a real `stellar contract bindings typescript`
package to depend on instead.

## Assumptions stated up front

Tech stack, now locked in for this milestone: TypeScript, Next.js (App Router) for `web-app`. Swap
either without changing the repo boundaries or interfaces above; those are the parts that are
expensive to change later, not the framework choice.

## Suggested next step

Wallet-integrated account creation (Freighter or similar) — the read side proved the RPC/testnet
pipeline works end-to-end; the write side needs real transaction signing, which is a meaningfully
different piece of work, not an extension of what's here.

## Related repos

Part of the Warden project — [`warden-contracts`](https://github.com/Osok-Labs/warden-contracts)
(the Soroban contracts this repo's bindings are generated from) and
[`warden-backend`](https://github.com/Osok-Labs/warden-backend) (the API this repo consumes).

## License

[MIT](./LICENSE)
