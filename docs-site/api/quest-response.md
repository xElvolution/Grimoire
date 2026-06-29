# Task response

Complete field reference for `POST /api/quest` - also returned by SDK `createTask()` and CLI `grimoire task`.

![Task response](/banners/grimoire-docs-api-task-response-banner.png)

## Top-level response

| Field | Type | Description |
| --- | --- | --- |
| `quest` | object | Task record - always present |
| `skill` | object \| null | Minted or reused skill |
| `skillMinted` | boolean | New skill created this request |
| `skillNote` | string | Human-readable mint/reuse explanation |
| `spawnedAgent` | object \| null | New specialist agent if spawned |
| `simulated` | boolean | `false` when 0G Compute is live |
| `note` | string | Optional compute provider note |
| `firedMemories` | array | Memory objects injected |
| `firedSkills` | array | Context skills (not necessarily reused) |
| `castSkill` | object \| null | Skill whose template was executed |
| `usedSkill` | object \| null | Alias for `castSkill` |
| `reflex` | string | Orchestrator routing kind |
| `directTask` | string | Wallet query kind if direct path |
| `onchain` | object \| null | Royalty settlement tx |
| `skillOnchain` | object \| null | Skill registration tx on mint |
| `credits` | number | Balance after task |
| `creditUsed` | number | Amount deducted |
| `ledger` | array | Recent credit ledger entries |
| `refunded` | number | Credits returned on failure |
| `error` | string | Error message on failure |
| `artifact` | object | Duplicated at top level when present |

---

## `quest` object

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | `q_{timestamp}` |
| `prompt` | string | Original user prompt |
| `answer` | string | Display answer (artifacts stripped from text) |
| `status` | string | `solved` \| `failed` |
| `creator` | string | Short handle `0xabc…def` |
| `agentId` | string | Agent that solved |
| `bounty` | number | Bounty field (reserved) |
| `verified` | boolean | TEE verification |
| `skillId` | string | Minted or reused skill root hash |
| `usedExisting` | boolean | Reused existing skill |
| `rootHash` | string | Storage root hash |
| `txHash` | string | Storage or royalty tx |
| `createdAt` | number | Unix ms |
| `firedMemoryIds` | string[] | Memory ids used |
| `firedSkillIds` | string[] | Skill ids in context |
| `reflex` | string | Same as top-level |
| `mode` | string | Detected mode: ask, build, code, summarize |
| `creditCost` | number | Cost charged |
| `failureReason` | string | On failed tasks |
| `artifact` | object | Build/code/html artifact |

### Credit costs by `mode`

| mode | creditCost |
| --- | --- |
| ask | 0.001 |
| summarize | 0.002 |
| code | 0.003 |
| build | 0.005 |

---

## `reflex` values

| Value | Meaning |
| --- | --- |
| `category-match` | Agent matched by task category |
| `spawn` | New agent spawned for category |
| `skill-cast` | Existing skill similarity ≥ 0.62 |
| `manual` | Explicit `agentId` requested |
| `blocked` | Failed approach avoided |

---

## `directTask` values

When prompt matches wallet queries (no TEE):

| Value | Trigger examples |
| --- | --- |
| `balance` | "what's my balance", "show wallet" |
| `earnings` | "how much have I earned", "royalties" |
| `my-skills` | "my skills", "skills I created" |
| `trade-info` | "swap", "trade", "buy grim" |

---

## `artifact` types

### Project (build)

```json
{
  "type": "project",
  "content": "…",
  "files": {
    "app/page.tsx": "…",
    "app/layout.tsx": "…",
    "components/HeroSection.tsx": "…",
    "package.json": "…"
  },
  "entry": "app/page.tsx"
}
```

### Code

```json
{
  "type": "code",
  "content": "export function useDebounce…",
  "language": "typescript"
}
```

### HTML

```json
{
  "type": "html",
  "content": "<!DOCTYPE html>…"
}
```

---

## `skill` object (when minted or reused)

See [Skills concept](/concepts/skills) for full field list.

Key fields: `id`, `name`, `rarity`, `royaltyPerUse`, `uses`, `earnings`, `creatorAddress`.

---

## `onchain` object

```json
{
  "txHash": "0x…",
  "url": "https://chainscan-galileo.0g.ai/tx/0x…",
  "method": "settleSkillUse"
}
```

Present when skill reused by different wallet and royalty settled on-chain.

---

## Example: solved ask

```json
{
  "quest": {
    "id": "q_1710000000000",
    "prompt": "Explain 0G decentralized storage",
    "answer": "0G Storage provides…",
    "status": "solved",
    "verified": true,
    "mode": "ask",
    "creditCost": 0.001
  },
  "skillMinted": false,
  "skillNote": "One-off tasks don't become skills…",
  "simulated": false,
  "credits": 0.449,
  "creditUsed": 0.001
}
```

## Example: failed with refund

```json
{
  "quest": {
    "status": "failed",
    "failureReason": "0G Compute timeout"
  },
  "refunded": 0.005,
  "error": "0G Compute timeout",
  "credits": 0.45
}
```

## Example: skill reuse + royalty

```json
{
  "usedSkill": {
    "id": "0xabc…",
    "name": "Neon Gaming Landing",
    "royaltyPerUse": 0.012
  },
  "skillMinted": false,
  "onchain": {
    "txHash": "0x…",
    "url": "https://chainscan-galileo.0g.ai/tx/0x…"
  }
}
```
