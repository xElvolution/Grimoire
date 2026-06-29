# Contracts

On-chain contracts on **0G Galileo** testnet (chain ID `16602`).

![Contracts](/banners/grimoire-docs-contracts-banner.png)

Explorer: https://chainscan-galileo.0g.ai

Solidity sources live in the repository `contracts/` directory.

## Contract overview

| Contract | Purpose |
| --- | --- |
| `SkillRegistry` | Register skills by 0G Storage root hash; track creator and royalty rate |
| `AgentRegistry` | Agent identity (ERC-7857 style manifests); lineage when agents spawn |
| `MemoryRegistry` | Memory root hashes; grant/revoke read access between agents |
| `RoyaltyVault` | Accumulate and withdraw royalty payments |
| `SkillMarketplace` | List and trade skill ownership (royalty stream rights) |
| `GrimToken` | `$GRIM` ERC-20 token |

## How the API uses contracts

### Skill mint (`POST /api/quest`)

When a new skill is minted and execution is verified:

```
uploadJSON(skill) → rootHash
registerSkillOnChain(rootHash, royaltyPerUse, creatorAddress)
```

Response may include `skillOnchain` with registration details.

### Skill reuse

When orchestrator reuses a skill and caller ≠ creator:

```
settleSkillUse(skillId, royaltyPerUse, creatorAddress)
```

Response `onchain` field:

```json
{
  "txHash": "0x…",
  "url": "https://chainscan-galileo.0g.ai/tx/0x…"
}
```

Self-use skips settlement.

### Memory store (`POST /api/memory`)

```
uploadJSON(memory) → rootHash
storeMemoryOnChain(rootHash, label)
```

Memory object may include `onChainId`.

### Agent manifests

After skill/memory changes, `publishMindManifest()` updates agent identity on Storage linked to AgentRegistry.

## Royalty rates

On-chain `royaltyPerUse` matches off-chain rarity table:

| Rarity | Per use |
| --- | --- |
| common | 0.002 0G |
| rare | 0.005 0G |
| epic | 0.012 0G |
| legendary | 0.030 0G |

## Credit treasury

App credits use a separate **treasury address** (`CREDIT_TREASURY`) for funding - not the RoyaltyVault. See [Credits API](/api/credits).

## Marketplace

`SkillMarketplace` enables trading ownership of royalty streams:

- Seller lists skill ownership fraction
- Buyer pays on-chain
- Future royalties route per listing terms

Console Market UI at `/market`.

## When contracts are optional

The platform operates with off-chain ledger when contract signer is not configured:

- Skills still upload to Storage
- Royalties tracked in app database
- `onchain` fields null in API responses

Production deployments should enable on-chain settlement for verifiable royalties.

## Operator configuration

Contract deployment and signer configuration are handled by platform operators - not covered in public integration docs.

Integrators only need:

- Galileo RPC for funding credits
- Explorer links from API responses

## Related

- [Royalties concept](/concepts/royalties)
- [Skills concept](/concepts/skills)
- [Wallet & credits](/concepts/wallet)
