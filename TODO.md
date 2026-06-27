# Grimoire - plan & to-do

Actionable checklist derived from [MILESTONE.md](./MILESTONE.md).  
Legend: `[ ]` planned · `[~]` in progress · `[x]` done

---

## Immediate - unblock local dev & submission

- [~] **Fix `node_modules`** - clean reinstall in `webapp/` (`rm -rf node_modules && npm install --legacy-peer-deps`); resolves `next: command not found`.
- [ ] **Verify dev server** - `cd webapp && npm run dev` (default port 3000; use `-p 3002` only if needed).
- [ ] **Verify production build** - `cd webapp && npm run build` (clear stale `.next/lock` if build hangs).
- [ ] **Privy env on Vercel** - set `NEXT_PUBLIC_PRIVY_APP_ID` in project settings (local: `webapp/.env.local`).
- [ ] **Deploy webapp** - push latest to Vercel; confirm public URL matches submission.
- [ ] **Deploy landing** - production build + public URL for judges.
- [ ] **90-second demo script** - task → TEE answer → selective skill mint → cast → royalty feed.

---

## M1 - Group Stage (deadline)

### Remaining before deadline

- [ ] **Fund testnet wallet** - `PRIVATE_KEY` with Galileo ETH; flip app from simulation to **live** TEE + real 0G Storage roots.
- [ ] **Real on-chain royalties** - wire ethers transfers + explorer links in UI (contracts in `contracts/deployments.json`).
- [ ] **Submit** - update [SUBMISSION.md](./SUBMISSION.md) with live URLs, tx hashes, demo video if required.

### Shipped early (M1 stretch) ✅

- [x] Privy sign-in - wallet/session; economy scoped to connected address.
- [x] Selective skill minting - every task gets an answer; only distinctive methods become skills.
- [x] GrimoireBrain v1 - 3D map on Dashboard + Memory (static layout, live data).
- [x] Wallet-scoped UI - no fake “your earnings” without address match.

---

## M2 - Round of 32 (platform)

- [ ] **`@grimoire/sdk`** - tiny SDK so any agent/app can read/write skills and pay royalties.
- [ ] **Public skill explorer** - browse skills, 0G provenance, usage, earnings.
- [x] **Privy wallet v1** - email, social, external wallet; skills tied to address.

---

## M3 - Round of 16 (memory + knowledge economy)

### Engram

- [~] **Engram memory layer** - shared, portable, verifiable agent memory on 0G Storage (write + access control shipped).
- [ ] **On-chain MemoryRegistry** - grant/revoke from webapp APIs (`0xe44820a4…` in deployments).
- [ ] **Paid knowledge access** - agents pay in 0G to use each other's skills/memories.
- [ ] **Skill composition** - combine skills into higher-order skills; royalties cascade.

### The Brain - multi-agent simulation engine

**Goal:** living center of Grimoire - agents rehearse outcomes in a sandbox; UI shows emergent behavior (adoption, royalties, reuse) before on-chain execution.

**Pipeline:**

1. [ ] **Seed** - tasks, skills, Engram memories from 0G Storage / `.data`.
2. [ ] **Knowledge graph** - entities (agents, skills, creators, memories) + edges (ownership, cast, grant/revoke).
3. [ ] **Agent sandbox** - ERC-7857 agents with personas, XP, Engram context in parallel.
4. [ ] **Simulation loop** - server-side N agents × M steps; skill selection, casts, royalty events.
5. [ ] **Insight surface** - Brain UI driven by simulation state (not static layout).

**Deliverables:**

- [ ] Graph index over skills + memories + agents.
- [ ] Lightweight simulation loop (server-side).
- [ ] **Brain v2** - pulses = real casts; nodes = real assets; trajectories from sim.
- [ ] **Query panel** - “what if agent X casts skill Y?” → projected royalties / adoption.
- [ ] Wire MemoryRegistry on-chain aligned with graph edges.

---

## M4 - Quarter Finals (trust & coordination)

- [ ] **ERC-7857 on-chain** - agent identities minted; reputation from verified usage.
- [ ] **Orchestrator** - decompose goals; hire multiple agents with shared memory.
- [ ] **Anti-gaming** - usage-weighted reputation + TEE-proven distinct usage.

---

## M5 - Semi Finals (revenue vertical)

- [ ] Pick one high-value domain (legal / finance / research).
- [ ] Ship focused, paying use case with provable agent skills.

---

## M6 - Final (champion narrative)

- [ ] **Token design** - stake to store, pay-per-use, curation rewards ($GRIM groundwork in contracts).
- [ ] **Public launch** - polished story: toll booth on the agent economy.

---

## Definition of done (every round)

- [ ] Works **live** end-to-end (no mock at the finish line).
- [ ] Uses 0G **for real** (Compute and/or Storage), verifiably.
- [ ] **Deployed** with a public URL.
- [ ] **Demo** tells the whole story in under 90 seconds.

---

## Repo map (where work lands)

| Area | Path |
| --- | --- |
| App | `webapp/` |
| Landing | `landing/` |
| SDK | `sdk/` |
| Contracts | `contracts/` |
| Brain UI | `webapp/src/components/brain/` |
| Quest / skills API | `webapp/src/app/api/` |
| 0G integration | `webapp/src/lib/zerog/` |
| Milestone detail | [MILESTONE.md](./MILESTONE.md) |
| Submission copy | [SUBMISSION.md](./SUBMISSION.md) |
