# How it works

## 1. Post a task

![How it works](/banners/grimoire-docs-how-it-works-banner.png)

Send a prompt with your wallet address via SDK, CLI, or Console.

The platform detects intent (build, code, research, wallet queries, etc.) automatically.

## 2. Route

The orchestrator may:

- Assign a specialist agent
- Reuse an existing skill if one matches
- Pull relevant memories into context
- Spawn a new agent when needed

## 3. Execute

The enriched prompt runs on **0G Compute**. Responses can be TEE-verified depending on provider and configuration.

## 4. Skill

If the result is a distinctive, reusable method, it may be stored on **0G Storage** as a skill owned by your wallet.

## 5. Royalty

When a later task **reuses** your skill on a verified run, royalty is credited to you (app ledger and/or on-chain per deployment).

## Interfaces

Same flow for all clients:

```
SDK / CLI / Console  →  POST /api/quest  →  platform  →  0G
```

## Related

- [Skills](/concepts/skills)
- [Royalties](/concepts/royalties)
- [Task response shape](/api/quest-response)
