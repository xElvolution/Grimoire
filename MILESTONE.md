# Grimoire - Milestones & Roadmap

This document tracks what has been built and the plan across the **0G Zero Cup** tournament
(six knockout rounds, group stage → champion). The strategy: ship a real, working slice
each round and deepen it toward the full vision - *the verifiable economy of AI agents.*

**Actionable checklist:** [TODO.md](./TODO.md)

---

## Status legend
✅ done · 🚧 in progress · ⏳ planned

---

## M0 - Foundation & concept lock ✅
- ✅ Defined the wedge: a **creator economy for AI skills** with **trustless royalties**
  enabled only by 0G (TEE-verified usage + permanent storage).
- ✅ Competitive analysis (differentiated from Ghast AI: a closed single-user assistant vs.
  Grimoire's open multi-agent economy).
- ✅ Mapped the exact 0G SDK surface (storage + compute) from official repos.

## M1 - Group Stage submission ✅  *(this submission)*
**Goal: a working, real, end-to-end product + a story that makes the Top 32 cut.**

- ✅ **Landing site** - Next.js 16, Three.js agent-network hero, GSAP scroll animations,
  Framer Motion, professional footer, production build passing.
- ✅ **The app (webapp)** - the live economy:
  - ✅ Post a task → solve on **0G Compute (TEE)** → mint a **Skill to 0G Storage**.
  - ✅ Cast a skill (a *different* agent uses it) → verified → **royalty to the creator**.
  - ✅ Gamified dashboard: XP, levels, skill rarity, ERC-7857 agents, live royalty feed,
    economy stats (skills minted, casts, royalties paid, verified share).
- ✅ **Real 0G integration** - `@0gfoundation/0g-ts-sdk` (storage) +
  `@0glabs/0g-serving-broker` (compute), real-first with labeled simulation fallback.
- ✅ End-to-end loop verified (skill minted → cast → royalty paid).
- ✅ Production builds green for both apps; repo published.

### M1 - remaining before the deadline 🚧
- 🚧 Fund the testnet wallet → flip the app to **live** TEE + real 0G Storage hashes.
- 🚧 Real **on-chain royalty transfers** (ethers) with explorer links.
- 🚧 **Deploy** both apps (public URLs) and submit.

### M1 stretch (shipped early) ✅
- ✅ **Privy sign-in** - persistent wallet/session; skills and royalties scoped to the connected address.
- ✅ **Selective skill minting** - every task gets an answer; only distinctive, reusable methods become skills.
- ✅ **GrimoireBrain (v1)** - live 3D map of agents, skills, and memory on Dashboard + Memory pages.
- ✅ Wallet-scoped economy UI - no personal earnings or “yours” labels without a connected address.

## M2 - Round of 32 ⏳
**Goal: turn the product into a platform.**
- ⏳ `@grimoire/sdk` - a tiny SDK so *any* agent/app can read & write skills and pay
  royalties through Grimoire (the distribution / network-effect play).
- ⏳ Public **skill explorer** - browse every skill, its 0G provenance, usage, earnings.
- 🚧 **Privy wallet** - sign-in with email, social, or external wallet; users own skills under their address. *(v1 shipped)*

## M3 - Round of 16 ⏳
**Goal: the memory + knowledge economy.**
- 🚧 **Engram** memory layer - shared, portable, verifiable agent memory on 0G Storage. *(write + access control shipped; on-chain registry next)*
- ⏳ Agent-to-agent **paid knowledge access** (agents pay in 0G to use each other's skills).
- ⏳ Skill **composition** (combine skills into higher-order skills; royalties cascade).

### The Brain - multi-agent simulation engine ⏳
**Goal: the living center of Grimoire - not a chart, but a sandbox where agents rehearse outcomes.**

The Brain is Grimoire's **predictive swarm layer**: many autonomous agents with memory and
skills interact inside a digital sandbox, and the UI surfaces **emergent behavior** -
who adopts which skill, how royalties flow, what gets reused - before it happens on-chain.

**Pipeline (Grimoire-native):**
1. **Seed** - tasks, skills, and Engram memories already on 0G Storage.
2. **Knowledge graph** - entities (agents, skills, creators, memories) and edges (ownership, cast, grant/revoke).
3. **Agent sandbox** - ERC-7857 agents with personas, XP, and Engram context run in parallel.
4. **Simulation** - agents select skills, cast, pay royalties; orchestrator routes new tasks; outcomes evolve over steps.
5. **Insight surface** - the Brain UI shows live simulation state: adoption, earnings, verified casts, and predicted trajectories - grounded in TEE proofs, not mock stats.

**M3 deliverables:**
- ⏳ Graph index over skills + memories + agents (built from live `.data` / 0G roots).
- ⏳ Lightweight **simulation loop** (server-side): N agents × M steps, skill selection, royalty events.
- ⏳ **Brain v2** - visualization driven by *simulation state*, not static layout (pulses = real casts; nodes = real assets).
- ⏳ **Query panel** - ask the sandbox “what if agent X casts skill Y?” and show projected royalties / adoption.
- ⏳ Wire **MemoryRegistry** on-chain for grant/revoke aligned with graph edges.

**Why it wins on 0G:** simulation runs on verifiable agent actions; stored skills/memories are permanent seeds; every cast in the sandbox can mirror a real TEE-verified cast in production.

## M4 - Quarter Finals ⏳
**Goal: trust & coordination.**
- ⏳ **ERC-7857** agent identities minted on-chain; reputation derived from verified usage.
- ⏳ **Orchestrator** that decomposes a goal and hires multiple agents that share memory.
- ⏳ Anti-gaming: usage-weighted reputation + TEE-proven distinct usage.

## M5 - Semi Finals ⏳
**Goal: a revenue vertical.**
- ⏳ Target one high-value domain where provable agent skills are worth real money
  (legal / finance / research) and ship a focused, paying use case.

## M6 - Final ⏳
**Goal: the champion narrative.**
- ⏳ Token design for the skill economy (stake to store, pay-per-use, curation rewards).
- ⏳ Polished public launch + the full "toll booth on the agent economy" pitch.

---

## Definition of done (every round)
1. It **works live** end-to-end (no mock at the finish line).
2. It uses 0G **for real** (Compute and/or Storage), verifiably.
3. It is **deployed** with a public URL.
4. The **demo** tells the whole story in under 90 seconds.
