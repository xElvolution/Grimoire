# Grimoire - master build list

> Everything to build for the full nervous system of the agent economy - compiled from
> product roadmap, Engram neuroscience design, and neuron architecture discussions.

**Companion doc:** after each item ships, its rationale lives in [`WHY.md`](./WHY.md).

**Status legend:** ✅ built · 🚧 partial / in progress · ⏳ planned

---

## How to use this doc

1. Pick a phase - build in order where dependencies matter (see [Build order](#build-order)).
2. Mark items ✅ in this file when shipped.
3. Confirm [`WHY.md`](./WHY.md) has the rationale entry (update if we learn something new).

---

## 1. Foundation - skill economy (M1)

| # | Item | Status | Layer |
| --- | --- | --- | --- |
| 1.1 | Landing site - story, 3D hero, flywheel narrative | ✅ | Product |
| 1.2 | Webapp - quest composer, dashboard, economy stats | ✅ | Product |
| 1.3 | Post task → TEE solve on 0G Compute | ✅ | Cortex |
| 1.4 | Mint skill to 0G Storage from solved quest | ✅ | Implicit memory |
| 1.5 | Cast skill (different agent) → verified use | ✅ | Implicit memory |
| 1.6 | Royalty payment to skill creator on cast | ✅ / 🚧 | Economy |
| 1.7 | Simulation fallback when wallet unfunded (labeled) | ✅ | Cortex |
| 1.8 | Gamification - XP, levels, skill rarity | ✅ | Product |
| 1.9 | ERC-7857-style agent IDs in app | ✅ | Identity |
| 1.10 | Live royalty feed | ✅ | Economy |
| 1.11 | Wallet connect for creators | 🚧 | Peripheral nerves |
| 1.12 | Real on-chain royalty transfers + explorer links | 🚧 | Economy |
| 1.13 | Public deployment (landing + webapp URLs) | 🚧 | Product |

---

## 2. Engram - explicit memory layer

| # | Item | Status | Layer |
| --- | --- | --- | --- |
| 2.1 | `Memory` type - label, content, agentId, grantedTo | ✅ | Explicit memory |
| 2.2 | Commit memory → 0G Storage (permanent root hash) | ✅ | Hippocampus |
| 2.3 | Memory API - GET / POST | ✅ | Hippocampus |
| 2.4 | Grant / revoke read access per agent | ✅ | Synapses |
| 2.5 | Memory page UI - commit, list, access toggles | ✅ | Product |
| 2.6 | `MemoryRegistry` contract - store, grant, revoke on-chain | ✅ | Property law |
| 2.7 | Wire app grant/revoke to on-chain `MemoryRegistry` | ⏳ | Property law |
| 2.8 | On-chain `store()` when memory committed to 0G | ⏳ | Property law |
| 2.9 | Explicit vs implicit separation enforced in UX copy | ✅ | Design |
| 2.10 | Memory retrieval ranking (keyword / embedding) | ⏳ | Retrieval |
| 2.11 | Selective retrieval - never dump all memories into prompt | ⏳ | Retrieval |

---

## 3. EngramBrain - neural visualization

| # | Item | Status | Layer |
| --- | --- | --- | --- |
| 3.1 | `EngramBrain` 3D component - agents ↔ memories | ✅ | Visualization |
| 3.2 | Golden core - shared engram field | ✅ | Visualization |
| 3.3 | Agent hemisphere + memory hemisphere layout | ✅ | Visualization |
| 3.4 | Synapse links - owner + grantedTo | ✅ | Synapses |
| 3.5 | Cyan pulses along active synapses | ✅ | Firing |
| 3.6 | Mirror reflection below (latent connections) | ✅ | Visualization |
| 3.7 | Node size ∝ agent level / memory verified | ✅ | Visualization |
| 3.8 | Skill neurons on the graph (third node type) | ⏳ | Visualization |
| 3.9 | Synapse line thickness ∝ plasticity weight | 🚧 | Plasticity |
| 3.10 | Pulse speed ∝ synapse weight | ✅ | Plasticity |
| 3.11 | Dim / fade unused synapses (atrophy) | ⏳ | Plasticity |
| 3.12 | Highlight overloaded agents (too many active synapses) | 🚧 | Brain scan |
| 3.13 | Brain scan dashboard - agent health monitor page | ✅ | Brain scan |
| 3.14 | Live pulse on actual quest / memory retrieval events | ⏳ | Firing |

---

## 4. Neurons - unified neural model

| # | Item | Status | Layer |
| --- | --- | --- | --- |
| 4.1 | `NeuronKind` - agent, memory, skill, core | ⏳ | Neurons |
| 4.2 | `Neuron` type - id, kind, label, metadata | ⏳ | Neurons |
| 4.3 | `Synapse` type - from, to, kind, weight, lastFired | ⏳ | Synapses |
| 4.4 | `lib/neuron.ts` - types + graph builder | ✅ | Neurons |
| 4.5 | `buildNeuronGraph()` - agents + memories + skills → graph | ✅ | Neurons |
| 4.6 | Refactor `EngramBrain` to consume `buildNeuronGraph()` | ✅ | Neurons |
| 4.7 | Single source of truth for brain map (UI + orchestrator + SDK) | ✅ | Neurons |

---

## 5. Orchestrator - spinal cord

| # | Item | Status | Layer |
| --- | --- | --- | --- |
| 5.1 | Basic auto-route by category (`categorize()` → agent) | ✅ | Spinal reflex |
| 5.2 | Auto-spawn agent when no specialist exists | ✅ | Spinal reflex |
| 5.3 | `lib/orchestrator.ts` - extracted spinal cord module | ✅ | Spinal cord |
| 5.4 | `planQuest()` - returns RoutePlan (agent, memories, skills, reflex kind) | ✅ | Spinal cord |
| 5.5 | `injectContext()` - fire neurons into TEE prompt | ✅ | Firing |
| 5.6 | Wire quest route: plan → inject → solve | ✅ | Firing |
| 5.7 | Prefer existing skill cast over re-solving same task | ✅ | Spinal reflex |
| 5.8 | Cheap reflex rules before LLM (keyword / specialty match) | ⏳ | Spinal reflex |
| 5.9 | Reflex registry - fast routing rules (optional micro-royalty) | ⏳ | Spinal reflex |
| 5.10 | Goal decomposition - break quest into sub-tasks | ⏳ | Spinal cord |
| 5.11 | Multi-agent handoffs - coordinate agents on one goal | ⏳ | Spinal cord |
| 5.12 | Shared Engram field across agents in one orchestration run | ⏳ | Corpus callosum |

---

## 6. Synaptic plasticity - Hebbian learning

| # | Item | Status | Layer |
| --- | --- | --- | --- |
| 6.1 | `synapses[]` in economy store | ✅ | Plasticity |
| 6.2 | `strengthenSynapse()` on memory used in quest | ✅ | Plasticity |
| 6.3 | `strengthenSynapse()` on skill cast | ✅ | Plasticity |
| 6.4 | Default weight 1.0, increment on each fire | ✅ | Plasticity |
| 6.5 | `lastFired` timestamp per synapse | ✅ | Plasticity |
| 6.6 | Retrieval ranks by synapse weight (used paths win) | ✅ | Plasticity |
| 6.7 | On-chain `SynapseFired` events for reputation | ⏳ | Property law |
| 6.8 | Reputation derived from synapse weight / verified fires | ⏳ | Trust |

---

## 7. Memory features - neuroscience-inspired

| # | Item | Status | Layer |
| --- | --- | --- | --- |
| 7.1 | **Failure engrams** - auto-commit memory on quest failure | ✅ | Pain signals |
| 7.2 | Orchestrator avoids routing to failed approach / broken skill | ✅ | Pain signals |
| 7.3 | Boost failure memories in retrieval ranking | ✅ | Pain signals |
| 7.4 | **Memory consolidation** - episodic → semantic distillation | ✅ | Consolidation |
| 7.5 | Provenance chain: raw episode hash → distilled fact hash | ✅ | Consolidation |
| 7.6 | Episodic nodes fade in UI after consolidation | ✅ | Consolidation |
| 7.9 | **Corpus callosum** - link two agents to shared memory set | ✅ | Corpus callosum |
| 7.11 | Memory kind tag - `failure`, `episodic`, `semantic`, `preference` | ✅ | Explicit memory |

---

## 8. Mind portability - canonical brain on 0G

| # | Item | Status | Layer |
| --- | --- | --- | --- |
| 8.1 | Mind manifest JSON - neurons + synapses list | ✅ | Portability |
| 8.2 | Upload mind manifest to 0G on every mind change | ✅ | Portability |
| 8.3 | `AgentRegistry.metadata` points to mind root hash | 🚧 | Identity |
| 8.4 | `updateMetadata()` on-chain when mind changes | ⏳ | Identity |
| 8.5 | Import / restore agent mind from 0G manifest | ⏳ | Portability |
| 8.6 | Portable mind across Grimoire nodes / SDK clients | ⏳ | Portability |

---

## 9. Economy - dual toll booths

| # | Item | Status | Layer |
| --- | --- | --- | --- |
| 9.1 | Skill royalty per cast (implicit - pay to **execute**) | ✅ / 🚧 | Economy |
| 9.2 | Paid explicit memory read - pay to **know** (M3) | ⏳ | Economy |
| 9.3 | Separate pricing for explicit vs implicit access | ⏳ | Economy |
| 9.4 | TEE proof for memory read (what was accessed) | ⏳ | Immune system |
| 9.5 | Agent-to-agent paid knowledge access | ⏳ | Economy |
| 9.6 | Skill marketplace listing (forSale, price) | 🚧 | Economy |
| 9.7 | **Skill composition** - combine skills; royalties cascade | ⏳ | Economy |
| 9.8 | Consolidated knowledge packs (sell distilled semantic memories) | ⏳ | Economy |
| 9.9 | Reflex registry micro-royalties on routing rules | ⏳ | Economy |
| 9.10 | Token design - stake to store, pay-per-use, curation ($GRIM) | ⏳ | Economy |

---

## 10. Identity & trust - on-chain agents

| # | Item | Status | Layer |
| --- | --- | --- | --- |
| 10.1 | `AgentRegistry` contract deployed | ✅ | Identity |
| 10.2 | `SkillRegistry` contract deployed | ✅ | Identity |
| 10.3 | `RoyaltyVault` contract deployed | ✅ | Economy |
| 10.4 | Mint ERC-7857 agents on-chain from app | ⏳ | Identity |
| 10.5 | Agent lineage - spawnedBy on-chain | 🚧 | Identity |
| 10.6 | Reputation score from verified usage | ⏳ | Trust |
| 10.7 | Anti-gaming - usage-weighted reputation | ⏳ | Immune system |
| 10.8 | TEE-proven distinct usage (no duplicate cast fraud) | ⏳ | Immune system |
| 10.9 | Reputation markets (M4+) | ⏳ | Trust |

---

## 11. Platform & SDK - peripheral nerves

| # | Item | Status | Layer |
| --- | --- | --- | --- |
| 11.1 | `@grimoire/sdk` package scaffold | 🚧 | Peripheral nerves |
| 11.2 | SDK - `createSkill()`, cast, royalties | ⏳ | Peripheral nerves |
| 11.3 | SDK - `writeMemory()`, `grantAccess()`, `revokeAccess()` | 🚧 | Peripheral nerves |
| 11.4 | SDK - `planQuest()` / orchestrator client | 🚧 | Spinal cord |
| 11.5 | SDK - `buildNeuronGraph()` for external visualizations | ⏳ | Neurons |
| 11.6 | Public **skill explorer** - browse skills, provenance, earnings | ⏳ | Product |
| 11.7 | Public **memory explorer** - browse engrams, access graph | ⏳ | Product |
| 11.8 | Any external agent plugs in via SDK (network effect) | ⏳ | Peripheral nerves |

---

## 12. Contracts - full on-chain integration

| # | Item | Status | Layer |
| --- | --- | --- | --- |
| 12.1 | `MemoryRegistry` deployed | ✅ | Property law |
| 12.2 | `SkillMarketplace` deployed | ✅ | Economy |
| 12.3 | `GrimToken ($GRIM)` deployed | ✅ | Economy |
| 12.4 | App writes skill mints through `SkillRegistry` | ⏳ | Property law |
| 12.5 | App writes memory store through `MemoryRegistry` | ⏳ | Property law |
| 12.6 | Grant/revoke maps agent ID → wallet address on-chain | ⏳ | Property law |
| 12.7 | Royalty settlement fully on-chain in production path | 🚧 | Economy |

---

## 13. Narrative & documentation

| # | Item | Status | Layer |
| --- | --- | --- | --- |
| 13.1 | `docs/engram/README.md` - neuroscience deep dive | ✅ | Docs |
| 13.2 | Explicit vs implicit memory documentation | ✅ | Docs |
| 13.3 | Nervous system map (orchestrator = spinal cord) | ✅ | Docs |
| 13.4 | Architecture + nervous system + neuron Mermaid diagrams | ✅ | Docs |
| 13.5 | `building-neurons.md` - implementation guide | ✅ | Docs |
| 13.6 | `BUILD.md` - this master list | ✅ | Docs |
| 13.7 | `WHY.md` - rationale for every build item | ✅ | Docs |
| 13.8 | Landing - "nervous system of the agent economy" hero section | ⏳ | Narrative |
| 13.9 | Demo script - memory commit → quest fires memory → bullet points | ⏳ | Narrative |
| 13.10 | Phantom limb demo script - revoke memories, skill still works | ⏳ | Narrative |

---

## 14. Revenue vertical (M5+)

| # | Item | Status | Layer |
| --- | --- | --- | --- |
| 14.1 | Pick vertical - legal / finance / research | ⏳ | Product |
| 14.2 | Focused paying use case with provable agent skills | ⏳ | Product |
| 14.3 | Domain-specific agent spawn + memory packs | ⏳ | Product |

---

## Build order

Recommended sequence - each phase unlocks the next:

```
Phase A  ✅  M1 foundation - skills, TEE, storage, basic Engram UI
Phase B  ✅  Neurons (4.x) + Orchestrator (5.3-5.6) - brain comes alive
Phase C  ✅  Plasticity (6.x) + EngramBrain visuals (3.9-3.11 partial)
Phase D  ✅  Failure engrams + consolidation (7.x partial)
Phase E  🚧  Mind manifest on 0G (8.x) - publish on quest/cast; on-chain metadata pending
Phase F  →   On-chain wiring (12.x) + paid memory access (9.2-9.4)
Phase G  →   SDK full surface (11.x) + explorers
Phase H  →   Multi-agent orchestrator (5.10-5.12) + skill composition (9.7)
Phase I  →   Trust / anti-gaming (10.x) + token economy (9.10)
Phase J  →   Revenue vertical (14.x) + public launch narrative (13.8-13.10)
```

**The critical path:** Phase B - without orchestrator + injectContext, memories are stored
but never fired. That is the moment the nervous system becomes real.

---

## Quick counts

| Status | Count |
| --- | --- |
| ✅ Built / documented | ~35 |
| 🚧 Partial | ~10 |
| ⏳ Planned | ~75 |
| **Total tracked** | **~110** |

Update this table when items ship.
