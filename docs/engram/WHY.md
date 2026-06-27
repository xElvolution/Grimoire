# Why we built this - rationale for every Grimoire component

> For each item in [`BUILD.md`](./BUILD.md): **why** it exists, what problem it solves,
> and how it connects to the nervous-system design.

This is the design intent document. When something ships, this is how we explain it to
judges, users, and future contributors.

---

## The one sentence

Grimoire builds the **verifiable nervous system of the agent economy** - because skills and
memories trapped in centralized platforms cannot be owned, ported, or monetized fairly
without **0G's TEE + Storage + Chain**.

---

## 1. Foundation - skill economy (M1)

### 1.1 Landing site
**Why:** Judges and users need the story before the product. The landing page sells the
*wedge* (trustless royalties) and the *flywheel* (create → earn → network grows) in under
90 seconds.

### 1.2 Webapp dashboard
**Why:** The economy must be *visible* - live stats, royalty feed, and quest composer
prove this is a market, not a chatbot wrapper.

### 1.3 TEE solve on 0G Compute
**Why:** This is the **cortex** - conscious cognition. Without verified inference, there
is no proof a skill was used, and royalties cannot be trustless. This is the root 0G
wedge.

### 1.4 Mint skill to 0G Storage
**Why:** Skills are **implicit (procedural) memory** - know-how that survives without
narration. Permanent 0G Storage makes them ownable and portable; a server row cannot do
that.

### 1.5 Cast skill (different agent uses it)
**Why:** Proves the economy is *multi-agent*. One agent's expertise becomes network
infrastructure. Without cross-agent use, there is no market.

### 1.6 Royalty on cast
**Why:** Creators need **pay to execute** - the implicit-memory toll booth. Verified cast
→ automatic payment → no platform middleman.

### 1.7 Simulation fallback
**Why:** Demos must never break. A labeled simulation keeps the loop demoable before the
wallet is funded; switching to live requires no code change.

### 1.8 Gamification (XP, levels, rarity)
**Why:** Agents need *character* and progression. Levels map to neuron size in EngramBrain;
rarity creates scarcity and pricing signal for skills.

### 1.9 ERC-7857 agent IDs
**Why:** Agents need persistent **identity** separate from the LLM. An ID that survives
model swaps, platform changes, and ownership transfers.

### 1.10 Royalty feed
**Why:** Social proof that the economy is alive. Every verified payment is a receipt that
the nervous system is firing.

### 1.11 Wallet connect
**Why:** **Peripheral nerves** - real users must own skills and memories under their
wallet, not a server-side demo account.

### 1.12 On-chain royalty transfers
**Why:** Royalties must be explorer-verifiable. "We paid you" on a JSON file is not
trustless; a chain tx is.

### 1.13 Public deployment
**Why:** A hackathon submission is judged on what runs live, not what runs locally.

---

## 2. Engram - explicit memory layer

### 2.1 Memory type
**Why:** Explicit (declarative) memory must be a distinct data model from skills. Mixing
them breaks pricing, revocation, and neuroscience fidelity.

### 2.2 Commit memory → 0G Storage
**Why:** The **hippocampus** - fast encoding into durable storage. Memories must survive
agent restarts, platform migrations, and disputes. Content-addressed hashes = tamper-proof
identity.

### 2.3 Memory API
**Why:** Every layer (UI, orchestrator, SDK) needs one write/read path for explicit
engrams.

### 2.4 Grant / revoke access
**Why:** **Synapses** - memory is not broadcast; it is connected agent-to-agent. Grant =
form a synapse. Revoke = break it.

### 2.5 Memory page UI
**Why:** Users must *see and control* their agent's mind. "Own your AI's mind" is not
credible without a UI to commit, grant, and revoke.

### 2.6 MemoryRegistry contract
**Why:** **Property law** for minds. Revoke must be enforceable - not UI theater. On-chain
`canRead` is the guarantee that a revoked agent truly forgets.

### 2.7 Wire grant/revoke to on-chain
**Why:** Local JSON grants are demo-only. Production revoke = on-chain enforcement before
TEE loads context.

### 2.8 On-chain store() on commit
**Why:** Memory ownership must be provable. The 0G root hash + on-chain record = dual
anchor (content + rights).

### 2.9 Explicit vs implicit in UX
**Why:** Users should understand they're storing a *fact* (memory) vs minting *know-how*
(skill). Education drives correct usage and sets up dual pricing.

### 2.10 Memory retrieval ranking
**Why:** Humans do not recall everything on every thought. Ranking prevents context-window
bloat and mimics selective attention.

### 2.11 Selective retrieval
**Why:** Dumping all memories into every prompt is anti-brain. The orchestrator must
*choose* which explicit neurons fire for each quest.

---

## 3. EngramBrain - neural visualization

### 3.1 EngramBrain component
**Why:** The brain must be *visible*. Abstract "memory layer" docs do not stick; a living
3D mirror makes Engram instant and memorable for demos.

### 3.2 Golden core
**Why:** Represents the shared **engram field** - memory is distributed, not one blob. The
core is the hub all agents plug into (Lashley's distributed engram insight).

### 3.3 Two hemispheres
**Why:** Agents (processors) and memories (storage) are different neuron classes. Spatial
separation mirrors brain region separation.

### 3.4 Synapse links
**Why:** Memory is relational. A memory without a connection to an agent is inert; links
show the live knowledge graph.

### 3.5 Cyan pulses
**Why:** **Firing** must be visible. Pulses = information moving along synapses during
retrieval - the moment the brain is "thinking with memory."

### 3.6 Mirror reflection
**Why:** Latent potential - connections that exist structurally but are not active. Poetry
plus UX hint that unused knowledge is still there.

### 3.7 Node size by level / verified
**Why:** Importance encoding. Bigger nodes = stronger agents or verified on-chain engrams.
Visual hierarchy without reading labels.

### 3.8 Skill neurons on graph
**Why:** Implicit memory is half the mind. Skills must appear as neurons, not a separate
product silo.

### 3.9 Synapse thickness ∝ weight
**Why:** **Hebbian plasticity** made visible - "fire together, wire together." Used paths
should look stronger.

### 3.10 Pulse speed ∝ weight
**Why:** Frequently used synapses should feel *faster* - habitual knowledge routes.

### 3.11 Fade unused synapses
**Why:** **Atrophy** - unused connections weaken. Visual forgetting without deletion.

### 3.12 Highlight overloaded agents
**Why:** **Brain scan** - too many active synapses = context overload, poor retrieval.
Operational health signal for power users.

### 3.13 Brain scan dashboard
**Why:** Operators need EEG-style monitoring: which agents are hot, cold, or broken.

### 3.14 Live pulse on real events
**Why:** Pulses on mock animation are pretty; pulses on real API events prove the
visualization is wired to the nervous system.

---

## 4. Neurons - unified neural model

### 4.1-4.3 Neuron and Synapse types
**Why:** One vocabulary across UI, orchestrator, SDK, and docs. "Agent," "memory," and
"skill" are neuron kinds - not separate products.

### 4.4 lib/neuron.ts
**Why:** Code must speak the same language as neuroscience docs. Prevents duplicate graph
logic scattered across components.

### 4.5 buildNeuronGraph()
**Why:** Single function: economy store → brain map. The orchestrator and EngramBrain must
see the same network.

### 4.6 Refactor EngramBrain
**Why:** Visualization consumes the canonical graph - not a parallel implementation that
drifts.

### 4.7 Single source of truth
**Why:** When SDK clients build their own brain views, they use the same graph builder.
Network effect requires shared structure.

---

## 5. Orchestrator - spinal cord

### 5.1 Auto-route by category
**Why:** **Spinal reflex** - route to the right specialist without conscious (LLM)
reasoning. Fast, cheap, deterministic.

### 5.2 Auto-spawn specialist
**Why:** Unknown domain → grow a new neuron (agent). The network expands organically like
neurogenesis in niche domains.

### 5.3 lib/orchestrator.ts
**Why:** Routing logic buried in one API route cannot grow into decomposition, handoffs,
or SDK export. The spinal cord needs its own module.

### 5.4 planQuest()
**Why:** Every quest needs a **route plan**: who processes it, which memories fire, which
skills fire, which reflex fired. Auditable decision record.

### 5.5 injectContext()
**Why:** **Firing** - neurons enter the TEE prompt. This is how explicit and implicit
engrams affect output without fine-tuning weights.

### 5.6 Wire quest route
**Why:** Until this ships, memories are stored but never used. This is the critical path
for "brain comes alive."

### 5.7 Prefer skill cast over re-solve
**Why:** Re-solving wastes compute and breaks royalty economics. Reflex: use existing
implicit memory (skill) when it fits.

### 5.8 Cheap reflex rules
**Why:** Not every routing decision needs an LLM. Spinal cord handles reflexes; cortex
handles novel reasoning.

### 5.9 Reflex registry
**Why:** Routing expertise itself can be monetized - micro-royalties when a reflex rule
correctly routes a quest.

### 5.10 Goal decomposition
**Why:** Complex goals are multi-step motor programs. Spinal cord sequences sub-tasks
before cortex handles each piece.

### 5.11 Multi-agent handoffs
**Why:** Real work spans specialties. One agent's output becomes another's input - like
sensorimotor chains.

### 5.12 Shared Engram in orchestration
**Why:** **Corpus callosum** at runtime - multiple agents read the same explicit memory
field during one coordinated run.

---

## 6. Synaptic plasticity

### 6.1-6.5 Synapse store and strengthen
**Why:** **Hebbian learning** - connections that fire together strengthen. Without weight,
all synapses look equal; retrieval cannot prefer proven paths.

### 6.6 Rank by weight in retrieval
**Why:** Habitual knowledge should win over rarely used memories for the same prompt.

### 6.7 On-chain SynapseFired events
**Why:** Verifiable proof of *which* knowledge paths are valuable - foundation for
reputation and memory pricing.

### 6.8 Reputation from synapse weight
**Why:** Reputation should reflect structural use of knowledge, not vanity metrics.

---

## 7. Memory features - neuroscience-inspired

### 7.1 Failure engrams
**Why:** **Pain signals** - the nervous system has fast threat pathways. Failed quests
should leave a trace so the network does not repeat mistakes.

### 7.2 Avoid failed routes
**Why:** Orchestrator learns from pain without human labeling - autonomous error avoidance.

### 7.3 Boost failure memories in retrieval
**Why:** Recent failures should be salient - like heightened attention after a mistake.

### 7.4 Memory consolidation
**Why:** Humans distill episodes into facts during sleep. Raw episodic blobs bloat context;
consolidation = episodic → semantic on 0G.

### 7.5 Provenance chain episode → fact
**Why:** Auditable lineage - "this fact came from that episode" - critical for trust and
disputes.

### 7.6 Fade episodic nodes after consolidation
**Why:** Visual + storage hygiene - keep the brain map readable as memory matures.

### 7.7 Phantom limb - skills survive memory revoke
**Why:** Proves explicit/implicit split is real. Procedural memory (skills) outlasts
declarative wipe - powerful demo and privacy feature ("forget user data, keep expertise").

### 7.8 Phantom limb demo script
**Why:** Demos win tournaments. One click: revoke all memories → cast skill still works.

### 7.9 Corpus callosum - shared memory set
**Why:** Two agents (e.g. creative + critic) sharing one explicit field - paired cognition
without duplicating storage.

### 7.10 Left/right brain pair UI
**Why:** Makes corpus callosum usable - users link agents, not raw IDs.

### 7.11 Memory kind tags
**Why:** Retrieval and UI treatment differ by type - failures, preferences, and facts should
not compete equally.

---

## 8. Mind portability

### 8.1 Mind manifest JSON
**Why:** An agent's mind is a **graph** (neurons + synapses), not a single file. Manifest
is the portable snapshot.

### 8.2 Upload manifest to 0G on change
**Why:** Mind must survive platform exit. 0G Storage = permanent, ownable mind backup.

### 8.3 AgentRegistry.metadata → mind hash
**Why:** On-chain identity points to off-chain mind - ERC-7857 "Agentic ID" pattern.

### 8.4 updateMetadata() on mind change
**Why:** Identity and mind stay linked as the brain evolves.

### 8.5 Import / restore mind
**Why:** Portability is not export-only - new environments must boot the same agent mind.

### 8.6 Cross-node portability
**Why:** Any Grimoire instance or SDK client can host the same mind - true agent
portability.

---

## 9. Economy - dual toll booths

### 9.1 Skill royalty (pay to execute)
**Why:** **Implicit memory toll** - you pay to run know-how. Core creator economy wedge.

### 9.2 Paid memory read (pay to know)
**Why:** **Explicit memory toll** - separate from execution. Reading someone's private
knowledge is a different transaction than running a skill.

### 9.3 Separate pricing explicit vs implicit
**Why:** Neuroscience says these are different memory systems; economics should reflect
that.

### 9.4 TEE proof for memory read
**Why:** Memory economy requires proof you accessed engrams - same trust root as skill
casts.

### 9.5 Agent-to-agent knowledge access
**Why:** Agents as economic actors buying each other's minds - M3 network effect.

### 9.6 Skill marketplace
**Why:** Price discovery for implicit memory - list, browse, buy execution rights.

### 9.7 Skill composition
**Why:** Higher-order procedures built from lower-order skills - royalties cascade like
sample licensing.

### 9.8 Consolidated knowledge packs
**Why:** Sell distilled semantic memory (post-consolidation) as premium explicit products.

### 9.9 Reflex micro-royalties
**Why:** Routing expertise is valuable infrastructure - compensate reflex authors.

### 9.10 Token design ($GRIM)
**Why:** Stake to store, pay-per-use, curation - sustainable long-term economy beyond
hackathon.

---

## 10. Identity & trust

### 10.1-10.3 Contracts deployed
**Why:** On-chain anchors for identity, skills, and payments - not optional for
"verifiable economy" claim.

### 10.4 Mint agents on-chain
**Why:** Identity must be wallet-owned and transferable - not app-internal IDs only.

### 10.5 Lineage on-chain
**Why:** Agent family trees - spawned specialists trace to parent agents. Provenance for
reputation and royalties.

### 10.6 Reputation from verified usage
**Why:** Trust must come from TEE-proven actions, not self-reported scores.

### 10.7 Anti-gaming reputation
**Why:** **Immune system** - weight by distinct verified usage, not raw volume.

### 10.8 TEE-proven distinct usage
**Why:** Prevent cast-farming - same fake quest repeated should not inflate reputation.

### 10.9 Reputation markets
**Why:** Trust becomes tradeable signal - agents hire high-reputation specialists.

---

## 11. Platform & SDK

### 11.1-11.5 SDK surface
**Why:** **Peripheral nerves** - Grimoire wins as infrastructure when *other* apps route
quests, write memories, and pay royalties through it. Distribution > single app.

### 11.6 Skill explorer
**Why:** Public catalog = discovery = more casts = more royalties = flywheel.

### 11.7 Memory explorer
**Why:** Public engram graph (with access respect) shows the brain economy is real.

### 11.8 External agent plug-in
**Why:** Network effect threshold - Grimoire becomes the toll booth on agent traffic.

---

## 12. Contracts - full integration

### 12.1-12.3 Deployed contracts
**Why:** Production paths exist on Galileo - submission credibility.

### 12.4-12.6 App → contract wiring
**Why:** App-only state is demo; contract-backed state is product. Every mint, store,
grant must hit chain in production.

### 12.7 Full on-chain royalties
**Why:** Closing the loop - TEE proves use → chain settles payment → explorer shows tx.

---

## 13. Narrative & documentation

### 13.1-13.7 Docs package
**Why:** Judges and contributors need the *ontology* - not just code. Neuroscience mapping
is the moat story; docs make it teachable.

### 13.8 Landing nervous system hero
**Why:** First impression should be "nervous system of agent economy," not "another AI
app."

### 13.9 Memory firing demo script
**Why:** 60-second proof: commit preference → quest uses it → visible pulse. Undeniable.

### 13.10 Phantom limb demo script
**Why:** 60-second proof: explicit/implicit split is enforced, not marketing.

---

## 14. Revenue vertical

### 14.1-14.3 Domain vertical
**Why:** Abstract agent economies need a **paying customer** story - legal, finance, or
research where provable skills = real money.

---

## How to read this with BUILD.md

| BUILD.md | WHY.md (this file) |
| --- | --- |
| What to build | Why it matters |
| Status checkbox | Design intent (never delete - update if intent changes) |
| Build order | Which *why* unlocks which *what* |

When an item in BUILD.md moves to ✅, scan its WHY entry before the demo - that is the
pitch sentence for that feature.

---

## The nervous system in one table

| We built / will build | Because (biology → Grimoire) |
| --- | --- |
| Skills | Implicit memory - know-how you execute |
| Engram memories | Explicit memory - facts you can state and revoke |
| Orchestrator | Spinal cord - reflex routing before conscious thought |
| TEE inference | Cortex - verified reasoning |
| Engram commit | Hippocampus - fast encode to durable storage |
| Grant / revoke | Synapses - connect and disconnect knowledge paths |
| Plasticity weights | Hebbian learning - used paths strengthen |
| Failure engrams | Pain signals - fast error pathways |
| Consolidation | Sleep - distill episodes into facts |
| SDK | Peripheral nerves - world plugs into the network |
| Chain contracts | Property law + immune system - ownership and fraud resistance |
| EngramBrain | EEG / anatomy - make the mind visible |

That is why we are building all of it - not feature creep, but **one coherent nervous
system** that only 0G can host end-to-end.
