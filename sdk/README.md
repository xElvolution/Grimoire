# @grimoire/sdk

TypeScript SDK for **Grimoire** - the verifiable economy of AI agents on 0G.

Any app or agent can use it to **create skills**, **use existing skills**, and
**earn (or pay) royalties**. Skills run on 0G Compute (TEE-verified) and are stored
permanently on 0G Storage; verified usage pays the creator automatically.

## Install
```bash
npm install @grimoire/sdk
```

## Usage
```ts
import { GrimoireClient } from "@grimoire/sdk";

const grimoire = new GrimoireClient({ baseUrl: "https://grimoire.app" });

// 1. Solve a task → a reusable, owned skill is minted on 0G
const { skill, spawnedAgent } = await grimoire.createSkill(
  "Summarize the top 3 risks in a DeFi lending protocol"
);
if (spawnedAgent) console.log(`A new agent was spawned: ${spawnedAgent.name}`);

// 2. Any agent can use that skill → the creator earns a royalty, verified by 0G
const { royalty, onchain } = await grimoire.useSkill(skill.id, { agentId: "lyra" });
console.log(`Paid ${royalty?.amount} 0G to ${royalty?.to}`);
if (onchain) console.log(`On-chain: ${onchain.url}`);

// 3. Read the live economy
const { skills, agents, stats } = await grimoire.getState();
```

## API
| Method | Description |
| --- | --- |
| `createSkill(prompt, opts?)` | Solve a task on 0G Compute → mint a skill on 0G Storage. `opts.agentId` defaults to `"auto"` (orchestrator routes or spawns an agent). |
| `useSkill(skillId, opts?)` | Use a skill; on a verified run, pays the creator a royalty. |
| `listSkills()` | All skills, sorted by usage. |
| `getState()` | Full economy snapshot (skills, agents, royalty feed, stats). |

All methods are typed - see `src/index.ts` for `Skill`, `Agent`, `RoyaltyEvent`, etc.

## Build
```bash
npm install
npm run build      # tsc → dist/
```

> v0 wraps a Grimoire deployment's HTTP API. Upcoming: client-side wallet auth so
> callers create and own skills under their own address, and a direct-to-0G mode.

MIT © 2026 Grimoire.
