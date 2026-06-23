# Grimoire — Contracts

On-chain backbone for the Grimoire economy, on **0G Chain (Galileo testnet, chain id 16602)**.

| Contract | Purpose |
| --- | --- |
| [`SkillRegistry.sol`](./src/SkillRegistry.sol) | Skill ownership keyed by 0G Storage root hash + **royalty settlement** (`useSkill` pays the creator and tallies verified uses). |
| [`AgentRegistry.sol`](./src/AgentRegistry.sol) | Minimal **ERC-7857-style "Agentic ID"** registry: agents are on-chain identities with an owner, a 0G metadata pointer (their mind), a specialty, reputation, and **lineage** (`spawnedBy`) — so *agents that spawn agents* is recorded on-chain. |
| [`RoyaltyVault.sol`](./src/RoyaltyVault.sol) | Pull-payment royalty accumulation — payers credit creators, creators withdraw when they like (safer for high-frequency settlement). |
| [`MemoryRegistry.sol`](./src/MemoryRegistry.sol) | Sovereign agent memory on 0G: owned memory root hashes with per-grantee read access. **Revoke = the agent forgets**, enforced on-chain. |
| [`SkillMarketplace.sol`](./src/SkillMarketplace.sol) | List & buy ownership (the royalty stream) of a skill; settlement pays the seller directly, no custody. |
| [`GrimToken.sol`](./src/GrimToken.sol) | `$GRIM` ERC-20 — stake to publish skills, pay for use, curation rewards. |

## How it fits the app
- When a skill is minted (`/api/quest`), its 0G Storage root hash is registered via
  `registerSkill(rootHash, royaltyPerUse)`.
- When a skill is used (`/api/skills/[id]/run`) and the run is **TEE-verified**,
  `useSkill(rootHash)` is called with the royalty as `msg.value`, settling payment to
  the creator on-chain. (TEE verification is the off-chain proof; this is the on-chain settlement.)
- When an agent is **spawned**, `mintAgent(metadata, specialty, parentId)` records the new
  Agentic ID and its lineage.

## Build & test
Requires [Foundry](https://book.getfoundry.sh/getting-started/installation).
```bash
forge build
forge test        # add tests under test/
```

## Deploy to 0G Galileo testnet
Fund your deployer at https://faucet.0g.ai, then:
```bash
export PRIVATE_KEY=0x...      # funded testnet key

forge create src/SkillRegistry.sol:SkillRegistry \
  --rpc-url https://evmrpc-testnet.0g.ai \
  --private-key $PRIVATE_KEY --broadcast

forge create src/AgentRegistry.sol:AgentRegistry \
  --rpc-url https://evmrpc-testnet.0g.ai \
  --private-key $PRIVATE_KEY --broadcast
```
Then set the deployed addresses in `webapp/.env.local`:
```bash
SKILL_REGISTRY_ADDRESS=0x...
AGENT_REGISTRY_ADDRESS=0x...
```

Explorer: https://chainscan-galileo.0g.ai

## Design notes
- `SkillRegistry.useSkill` forwards the full `msg.value` to the creator and reverts on
  underpayment or a failed transfer — no funds are ever held by the contract.
- `AgentRegistry` is intentionally minimal (no full ERC-721 transfer hooks) to stay
  dependency-free and auditable for the hackathon; production would extend ERC-7857 with
  a verified-usage oracle gating `setReputation`.

MIT © 2026 Grimoire.
