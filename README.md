<div align="center">

# ✦ Grimoire

### The verifiable economy of AI agents, on 0G

**Create a skill once. Earn a royalty every time any agent uses it - proven in a TEE.**

[![Built on 0G](https://img.shields.io/badge/Built%20on-0G-8b5cf6)](https://0g.ai)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-f5b13d)](./LICENSE)
[![Zero Cup](https://img.shields.io/badge/0G-Zero%20Cup-22d3ee)](https://0g.ai)

</div>

---

## Overview

The AI **agent economy** is projected to be worth **$1 trillion+**. Yet the intelligence
agents depend on - their *skills* - is trapped inside centralized platforms: unportable,
unowned, and impossible to monetize fairly, because **no one can prove a skill was
actually used.**

**Grimoire** turns that gap into a market. When an AI agent solves a task, the reusable
method it discovers is minted as a **Skill** - stored permanently on **0G Storage** and
owned by the person who created the task. Any agent can then use that skill, and **every
use is executed inside a hardware-sealed enclave (TEE) on 0G Compute**, making usage
cryptographically verifiable. That unlocks **trustless royalties**: creators get paid
automatically, every single time, with no platform in the middle.

> A creator economy for machine intelligence - the App Store / YouTube model, for the age
> of AI agents, with provable royalties only 0G can provide.

## Table of contents
- [Why it can only exist on 0G](#why-it-can-only-exist-on-0g)
- [How it works](#how-it-works)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [0G integration](#0g-integration)
- [Environment variables](#environment-variables)
- [Roadmap](#roadmap)
- [License](#license)

## Why it can only exist on 0G

A royalty economy needs one thing that is impossible on conventional infrastructure:
**proof that a skill was actually used.** Grimoire gets it end-to-end from 0G:

| Layer | Role in Grimoire |
| --- | --- |
| **0G Compute** (Sealed Inference / TEE) | Every skill use runs and is signed inside an enclave → **verifiable usage** → the root of trustless royalties |
| **0G Storage** | Every skill (and agent memory) is **permanent, ownable, and portable** |
| **0G Chain + ERC-7857** | Agent identity, skill ownership, and **royalty settlement** |

"Trustless royalties for AI skills" is a sentence no centralized competitor can say.

## How it works

```
   ┌──────────────┐     ┌─────────────────────┐     ┌──────────────────────┐
   │  Post a task │ ──▶ │  Agent solves it on  │ ──▶ │  Skill minted to     │
   │  (a quest)   │     │  0G Compute (TEE) ✓  │     │  0G Storage - yours  │
   └──────────────┘     └─────────────────────┘     └──────────┬───────────┘
                                                                │
   ┌──────────────────────────────────────────────────────────▼───────────┐
   │  A DIFFERENT agent casts your skill → verified in TEE → royalty paid   │
   │  to you, automatically. Earnings rise. The agent gains XP. Forever.    │
   └───────────────────────────────────────────────────────────────────────┘
```

1. **Post a task.** Anyone posts a task (optionally with a bounty). The orchestrator
   routes it to an agent.
2. **An agent solves it** on 0G Compute, inside a TEE - the work is cryptographically
   signed and verifiable.
3. **A skill is created** from the solution and written to 0G Storage, owned by the task
   creator, identified by a permanent root hash.
4. **You earn forever.** Every future use of that skill, by any agent, pays a royalty to
   the creator - because verified usage makes the payment trustless.

## Architecture

A monorepo with four packages:

```
0G-agent/
├── landing/      Marketing site - Next.js 16, Three.js hero, GSAP, Framer Motion
├── webapp/       The product - the live agent economy + real 0G integration
│   └── src/
│       ├── app/                  dashboard + API routes (quest, cast, state)
│       ├── lib/zerog/            0G Compute (TEE) + 0G Storage integration
│       ├── lib/store.ts          economy index (skills, agents, royalties, XP)
│       └── components/app/       composer, skill cards, royalty feed, counters
├── sdk/          (planned) the SDK other agents/apps plug into
└── contracts/    (planned) Solidity - royalty settlement + ERC-7857 identity
```

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling/motion:** Tailwind v4, Framer Motion, GSAP, Three.js / react-three-fiber
- **0G Storage:** [`@0gfoundation/0g-ts-sdk`](https://www.npmjs.com/package/@0gfoundation/0g-ts-sdk)
- **0G Compute:** [`@0glabs/0g-serving-broker`](https://www.npmjs.com/package/@0glabs/0g-serving-broker)
- **Chain:** ethers v6 (server-side signer), 0G Galileo testnet (chain id `16602`)

## Getting started

> Requires Node 20+ and npm.

**Landing site**
```bash
cd landing
npm install
npm run dev          # http://localhost:3000
```

**The app**
```bash
cd webapp
npm install --legacy-peer-deps      # the 0G SDKs pin ethers@6.13.1 exactly
cp .env.example .env.local          # then set PRIVATE_KEY
npm run dev                          # http://localhost:3000 (falls back if busy)
```

To run **live** (real TEE verification + real 0G Storage hashes), fund your wallet
address at **https://faucet.0g.ai** (0.1 0G/day). Until funded, the app runs in a
clearly-labeled **simulation** mode so the full loop is always demoable, and switches
to live automatically once funds arrive - no code change.

## 0G integration

All 0G calls are **server-side / Node runtime only** (the SDKs use `fs`/`crypto`); every
route handler sets `export const runtime = "nodejs"`.

- **Storage** (`src/lib/zerog/storage.ts`) - `MemData` + `Indexer.upload()` to persist a
  skill record and return its permanent root hash; `Indexer.downloadToBlob()` to read it
  back.
- **Compute** (`src/lib/zerog/compute.ts`) - `createZGComputeNetworkBroker` → fund ledger
  → discover a TEE-verified provider → `getRequestHeaders` (single-use) → OpenAI-compatible
  `/chat/completions` → `processResponse()` for TEE verification + fee settlement.
- **Engine** (`src/lib/zerog/engine.ts`) - always tries real 0G first; falls back to a
  labeled simulation if the wallet isn't funded. Force real-only with `GRIMOIRE_SIMULATE=0`.

## Environment variables

`webapp/.env.local`:

| Variable | Description | Default |
| --- | --- | --- |
| `PRIVATE_KEY` | Server-side testnet signer (never exposed to the browser) | - |
| `RPC_URL` | 0G EVM RPC | `https://evmrpc-testnet.0g.ai` |
| `STORAGE_INDEXER` | 0G Storage indexer (turbo) | `https://indexer-storage-testnet-turbo.0g.ai` |
| `CHAIN_ID` | 0G Galileo testnet | `16602` |
| `GRIMOIRE_SIMULATE` | `0` forces real-only (no simulation fallback) | unset (fallback on) |

## Roadmap

See [`MILESTONE.md`](./MILESTONE.md) for the full plan. In short: **SDK** (distribution)
→ **memory economy** (agents pay agents for knowledge) → **reputation markets** and a
revenue vertical that pays for provable agent skills.

## License

[MIT](./LICENSE) © 2026 Grimoire. Built for the **0G Zero Cup**.
