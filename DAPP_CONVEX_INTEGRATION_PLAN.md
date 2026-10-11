# DAPP + DaEconomy integration plan (safe branch)

Branch: `safe/dapp-convex-integration`

## Current IDA architecture verified

- IDA boots through `src/main.tsx` -> `CloudGate` -> `DaApps`.
- `src/CloudGate.tsx` uses Supabase for IDA account/session and cloud-state synchronization.
- DAPP UI currently lives in `src/App.tsx` (`DappStore`, `DAPP_CATALOG`).
- DAPP installation/uninstallation is currently local UI state persisted in IDA's desktop/taskbar/folder state. It does not enforce paid ownership.
- Shared DAPP ratings currently use existing Supabase RPC endpoints. Preserve this unless intentionally migrated separately.
- The package currently has Supabase, React, Vite, and TypeScript dependencies; it does not currently include Convex.

## Required integration rules

1. Do not replace IDA's existing Supabase sign-in or cloud-state system just to add DaEconomy authentication.
2. DAPP's DaEconomy authentication must be isolated from IDA's existing session and must not clear or overwrite IDA local/cloud state.
3. Do not ship client-only prices or trust client-provided user IDs, prices, balances, or treasury IDs for purchases.
4. The backend must authenticate the buyer, read the canonical server-side item price, and atomically debit the buyer and credit the existing `DaGov` account. Free items must not charge.
5. Ownership must be a durable server-side entitlement. Uninstall removes the local installation only; reinstalling an owned item must not charge again.
6. Preserve the existing catalog and rating behavior while wiring real ownership and purchase status.
7. Do not deploy, seed, run purchase tests against production, or alter existing accounts until the backend URL, auth linkage, and an isolated development deployment are verified.

## Catalog prices requested by the owner (not yet wired or live)

| App | Price |
|---|---:|
| DaEconomy | Free |
| DaCourt | Free |
| DaMusic | Free |
| DaScope | 1,000 DaCoins |
| DaNotes | Free |
| DaTV | Free |
| DaDrift | 500 DaCoins |
| Bad-Time | 800 DaCoins |
| Daculator | 200 DaCoins |
| DaRaw | Free |
| DaWord | 500 DaCoins |
| DaExcelent | 900 DaCoins |

## Blockers before safe implementation

- Obtain/read the actual DaEconomy Convex backend source and generated API types, including `convex/auth.ts`, `convex/http.ts`, `convex/schema.ts`, and `convex/dapp.ts`.
- Verify that Convex Auth can authenticate existing DaEconomy accounts without creating duplicate `users` or `economyUsers` records.
- Confirm the exact development Convex deployment URL and that it contains no production data.
- Confirm the server-side purchase and entitlement APIs and their transaction-log behavior.
- Then implement the DAPP-only Convex client/auth boundary and connect catalog, ownership, purchase, and reinstall flows. Keep the change on this branch for build/review before any merge or deployment.
