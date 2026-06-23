# Grimoire — the verifiable economy of AI agents, on 0G

> **Create a skill once. Earn a royalty every time any agent uses it — proven in a TEE.**

## The problem
Every blockchain is racing to launch AI agents, and the agent economy is projected at
**$1T+**. But the intelligence agents rely on — their skills — is trapped: locked in
centralized platforms, unportable, unowned, and impossible to monetize fairly because
**no one can prove a skill was actually used.**

## The solution
Grimoire is a **creator economy for machine intelligence**. When an AI agent solves a
task, the reusable method it discovers becomes a **Skill** — minted on 0G Storage and
owned by the person who created the task. Any agent in the network can then use that
skill, and **every use runs inside a hardware-sealed enclave (TEE) on 0G Compute**, so
usage is cryptographically verifiable. That makes **trustless royalties** possible: the
creator gets paid automatically, every single time, with no platform in the middle.

## Why it can only exist on 0G
A royalty economy needs one impossible thing on normal infra: **proof a skill was
actually used.** Only 0G provides it end to end:
- **0G Compute (Sealed Inference / TEE)** — every skill use is executed and signed inside
  an enclave → verifiable usage → the root of trustless royalties.
- **0G Storage** — every skill (and agent memory) is permanent, ownable, and portable.
- **0G Chain + ERC-7857** — agent identity, skill ownership, and royalty settlement.

"Trustless royalties for AI skills" is a sentence no centralized competitor can say.

## What's built (this submission)
A working full-stack product, not a mockup:
- **Landing site** (`/landing`) — the story, 3D agent-network hero, the flywheel.
- **The app** (`/webapp`) — the live economy:
  - Post a task → an agent solves it on **0G Compute** → a **Skill is minted to 0G Storage**.
  - A *different* agent **casts** the skill → verified use → **royalty paid to the creator**.
  - Gamified: XP, levels, skill rarity, agents with ERC-7857 IDs, a live royalty feed,
    and an economy dashboard (skills minted, total casts, royalties paid, verified share).
- Real 0G integration (`@0gfoundation/0g-ts-sdk` storage, `@0glabs/0g-serving-broker`
  compute). When the wallet is funded, runs live on Galileo testnet with TEE verification;
  otherwise falls back to a clearly-labeled simulation so the loop is always demoable.

## 60-second demo script
1. Open the app. Point at the empty Grimoire and the economy stats at zero.
2. **Post a task** ("Summarize the top 3 risks in a DeFi lending protocol"). Watch the
   live steps: *routing → running in 0G Compute (TEE) → verifying → minting to 0G Storage*.
3. A new **Skill** appears in the Grimoire, owned by you, with its 0G Storage hash and a
   **✓ Verified in TEE** badge.
4. Click **Cast** — a *different* agent (Lyra) uses your skill. The **royalty feed lights
   up**, your **earnings counter ticks up**, the agent gains XP. *"A different agent just
   used my skill and I got paid — provably."*
5. Land the line: **"This is the toll booth on the entire agent economy."**

## Roadmap (across the tournament rounds)
- **R2:** the **SDK** other agents/apps plug into (the network-effect / distribution play).
- **R3:** the **memory economy** — agents pay each other in 0G to access knowledge.
- **R4+:** reputation markets, agent-to-agent hiring, a vertical that pays for provable
  agent skills (legal / finance / research).

## Run it
```bash
cd webapp && npm install --legacy-peer-deps
cp .env.example .env.local   # set PRIVATE_KEY, fund at https://faucet.0g.ai
npm run dev
```

Built for the **0G Zero Cup**. Monorepo: `landing/` · `webapp/` · `sdk/` · `contracts/`.
