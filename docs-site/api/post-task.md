# Post a task

`POST /api/quest` is the primary endpoint. One call runs orchestration, inference, optional skill mint, and royalty settlement.

![Post a task](/banners/grimoire-docs-api-post-task-banner.png)

## Request

```http
POST /api/quest
Content-Type: application/json
```

```json
{
  "prompt": "Build a dark neon gaming landing page with hero, features, and pricing",
  "creatorAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
  "agentId": "auto",
  "bounty": 0
}
```

| Field | Required | Description |
| --- | --- | --- |
| `prompt` | Yes | Task text. Min 4 chars. Attachments embed as `--- File:` blocks in prompt string |
| `creatorAddress` | Yes | Wallet - credits, royalties, skill ownership |
| `agentId` | No | Agent id or `"auto"` (default) |
| `bounty` | No | Reserved - default `0` |

## Success flow

1. Validate wallet → `401` if missing
2. Detect mode → ask / build / code / summarize
3. Deduct credits → `402` if insufficient
4. `planQuest()` - agent, memories, skill match
5. Direct wallet tasks skip TEE (balance, earnings, my-skills, trade-info)
6. `solve()` via 0G Compute TEE (or skill template replay)
7. Optional skill mint → 0G Storage upload
8. Optional on-chain royalty on skill reuse

## Response shapes

### Solved task

```json
{
  "quest": {
    "id": "q_1710000000000",
    "prompt": "…",
    "answer": "…",
    "status": "solved",
    "verified": true,
    "mode": "build",
    "creditCost": 0.005,
    "artifact": { "type": "project", "files": { "app/page.tsx": "…" }, "entry": "app/page.tsx" }
  },
  "skill": { "id": "0x…", "name": "…", "royaltyPerUse": 0.012 },
  "skillMinted": true,
  "skillNote": "Distinctive epic skill distilled…",
  "simulated": false,
  "reflex": "category-match",
  "firedMemories": [],
  "firedSkills": [],
  "credits": 0.445,
  "creditUsed": 0.005,
  "ledger": []
}
```

### Skill reuse

When orchestrator matches existing skill (`reflex` includes skill-cast):

```json
{
  "castSkill": { "id": "0x…", "name": "…" },
  "usedSkill": { "id": "0x…", "name": "…" },
  "skillMinted": false,
  "skillNote": "Ran existing skill… Royalty paid to creator.",
  "onchain": { "txHash": "0x…", "url": "https://chainscan-galileo.0g.ai/tx/0x…" }
}
```

### Wallet direct task

```json
{
  "directTask": "balance",
  "skillMinted": false,
  "skillNote": "Wallet query - no skill minted."
}
```

### Failed task (credits refunded)

```json
{
  "quest": { "status": "failed", "failureReason": "…" },
  "refunded": 0.001,
  "error": "…",
  "credits": 0.449
}
```

## Error responses

| Status | Body |
| --- | --- |
| 400 | `{ "error": "A task description is required." }` |
| 401 | `{ "error": "Sign in with your wallet to post tasks and mint skills." }` |
| 402 | `{ "error": "Insufficient credits…", "creditCost", "balance" }` |

## Mode detection examples

| Prompt | Mode | Cost |
| --- | --- | --- |
| "What is 0G Storage?" | ask | 0.001 |
| "Summarize this doc in bullets" | summarize | 0.002 |
| "Write a React useDebounce hook" | code | 0.003 |
| "Build a SaaS pricing page with dark theme" | build | 0.005 |

## Attachments

Upload files via `POST /api/attach`, then include returned text in `prompt`:

```
Summarize the attached report

--- File: report.pdf ---
(extracted text)
```

## SDK equivalent

```ts
await client.createTask(prompt, { creatorAddress: wallet });
```

Full field reference: [Task response](/api/quest-response).
