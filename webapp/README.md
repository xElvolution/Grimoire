# Grimoire - webapp (the dApp)

The Grimoire product: post a task → an AI agent solves it on **0G Compute (TEE)** →
the reusable method is minted as a **Skill** on **0G Storage**, owned by you → any
agent can cast that skill, and **every verified use pays you a royalty**.

## The loop (real, end-to-end)
1. **Post a task** (`/api/quest`) → `solve()` runs it on 0G Compute (verified in a TEE
   when the wallet is funded) → the skill record is uploaded to 0G Storage → indexed.
2. **Cast a skill** (`/api/skills/[id]/run`) → a *different* agent re-runs the skill's
   recipe on 0G Compute → on a verified use, a **royalty** is paid to the creator,
   XP is awarded, and the live feed updates.

## Stack
- Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Framer Motion
- **0G Storage:** `@0gfoundation/0g-ts-sdk` (MemData + Indexer)
- **0G Compute (TEE):** `@0glabs/0g-serving-broker` (createZGComputeNetworkBroker)
- **ethers 6.13.1** (server-side signer)

## Run
```bash
npm install --legacy-peer-deps      # 0G SDKs pin ethers@6.13.1 exactly
cp .env.example .env.local          # then set PRIVATE_KEY (a throwaway testnet key)
# fund the address at https://faucet.0g.ai  (0.1 0G/day) to go live
npm run dev                         # http://localhost:3000 (falls back if busy)
```

## Live vs simulated
`src/lib/zerog/engine.ts` always tries **real** 0G Compute first. If the wallet
isn't funded / no provider is up, it falls back to a clearly-labeled **simulation**
(`verified:false`, shown as "Simulated" in the UI) so the economy is demoable. The
moment the wallet is funded it goes **live automatically** - no code change.
Set `GRIMOIRE_SIMULATE=0` to force real-only.

## Layout
```
src/
  app/
    page.tsx                  the dashboard (composer, skill grid, royalty feed, agents)
    api/
      state/route.ts          GET the full economy state
      quest/route.ts          POST a task -> solve -> mint skill on 0G
      skills/[id]/run/route.ts POST cast a skill -> verify -> royalty
  lib/
    zerog/config.ts           network endpoints + key
    zerog/storage.ts          0G Storage upload/download (JSON)
    zerog/compute.ts          0G Compute TEE inference + processResponse
    zerog/engine.ts           real-first, simulation-fallback solve()
    store.ts                  file-backed economy index (.data/, gitignored)
    skills.ts                 skill naming / category / rarity / royalty
    types.ts, client.ts       shared types + browser fetch helpers
  components/app/             Counter, QuestComposer, SkillCard, RoyaltyFeed
```

0G calls are **server-side / Node runtime only** (`export const runtime = "nodejs"`).
Part of the Grimoire monorepo - see `../landing`, `../sdk`, `../contracts`.
