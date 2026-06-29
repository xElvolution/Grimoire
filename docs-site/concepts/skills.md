# Skills

Skills are **reusable methods** stored on 0G Storage. Each skill is a JSON record content-addressed by its root hash (`id`).

![Skills](/banners/grimoire-docs-concepts-skills-banner.png)

## Skill object

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | 0G Storage root hash (`0x` + 64 hex) |
| `name` | string | Display name (derived from prompt) |
| `description` | string | Short summary |
| `category` | string | Research, Writing, Code, Finance, Strategy, General |
| `promptTemplate` | string | Original task text - replayed on reuse |
| `sampleOutput` | string | Truncated answer from mint |
| `creator` | string | Short handle (`0xabc…def`) |
| `creatorAddress` | string | Royalty recipient wallet |
| `model` | string | Model used at mint |
| `provider` | string | 0G Compute provider |
| `verified` | boolean | TEE-verified at creation |
| `rarity` | string | common · rare · epic · legendary |
| `uses` | number | Times orchestrator ran this skill |
| `earnings` | number | Total royalties (0G) |
| `royaltyPerUse` | number | Payment per verified reuse |
| `createdAt` | number | Unix ms timestamp |
| `txHash` | string | Storage upload transaction |

## Mint rules

Not every task creates a skill. The platform checks:

1. **Length** - prompt generally needs ≥ 50 characters
2. **Uniqueness** - word similarity &gt; 0.72 with existing skill → no duplicate mint
3. **Rarity** - common one-offs under 90 chars often skipped unless verified + distinctive
4. **Build artifacts** - projects with files typically mint regardless

### Rarity scoring

Based on prompt length + verification:

| Rarity | Approximate threshold |
| --- | --- |
| common | score ≤ 35 |
| rare | score &gt; 35 |
| epic | score &gt; 60 |
| legendary | score &gt; 80 |

(`score = min(100, prompt.length/2 + (verified ? 30 : 0))`)

### Royalty per use by rarity

| Rarity | `royaltyPerUse` |
| --- | --- |
| common | 0.002 0G |
| rare | 0.005 0G |
| epic | 0.012 0G |
| legendary | 0.030 0G |

## Reuse (orchestrator)

Users do **not** pick skills manually in normal flow. When a new task is similar enough to an existing skill, the orchestrator runs the skill template instead of a fresh solve.

Royalties apply when:

- Skill is reused on verified execution
- Caller wallet ≠ skill creator wallet

## Explicit skill run

`POST /api/skills/{id}/run` runs a skill directly with optional `agentId` and `callerAddress`. The orchestrator path is preferred for most integrations.

## Storage record shape

```json
{
  "kind": "grimoire-skill",
  "name": "Conjure Neon Gaming Landing",
  "category": "Build",
  "promptTemplate": "Build a neon gaming landing page…",
  "creatorAddress": "0x…",
  "verified": true,
  "rarity": "epic",
  "createdAt": 1710000000000
}
```

## SDK

```ts
const skills = await client.listSkills();
const state = await client.getState(wallet); // wallet-scoped skills
```

## Market

Skills can be listed for sale on the Console Market - ownership of the royalty stream, not the skill content itself.
