# createTask

`createTask` is the primary SDK method. It posts to `POST /api/quest` and returns the full task result.

![createTask](/banners/grimoire-docs-sdk-create-task-banner.png)

## Signature

```ts
async createTask(
  prompt: string,
  opts: {
    creatorAddress: string;  // required - 0x + 40 hex
    agentId?: string;      // default "auto"
    bounty?: number;       // default 0 - reserved
  }
): Promise<TaskResult>
```

## Parameters

### `prompt`

Task text. Minimum 4 characters.

**Examples by detected mode:**

```ts
// ask (0.001) - default
"Explain how 0G Storage erasure coding works"

// summarize (0.002)
"Summarize this report in bullet points"

// code (0.003)
"Write a TypeScript function to debounce API calls"

// build (0.005)
"Build a dark neon gaming landing page with hero, features, and pricing"

// wallet direct - no TEE
"what's my balance"
```

Attachments: embed extracted text in prompt after `--- File: filename ---`.

### `creatorAddress`

Wallet that pays credits and receives royalties on minted skills.

```ts
creatorAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"
```

Invalid or missing → `GrimoireError` status `401`.

### `agentId`

| Value | Behavior |
| --- | --- |
| `"auto"` | Orchestrator picks agent by category |
| `"lyra"` | Force specific agent |
| other agent ids | From `getState().agents` |

### `bounty`

Reserved for future bounty marketplace. Pass `0`.

## Execution flow

1. **Validate** wallet and prompt length
2. **Detect mode** - ask, build, code, summarize (no client field)
3. **Deduct credits** - `402` if insufficient
4. **planQuest()** - agent, memories, skill match (threshold 0.62)
5. **Direct wallet tasks** - balance/earnings/skills/trade skip TEE
6. **solve()** - 0G Compute TEE or skill template replay
7. **Mint skill** - if `shouldMintSkill()` or build artifact
8. **Royalty** - on skill reuse by different wallet
9. **Return** `TaskResult`

On inference failure: credits refunded, failure memory written.

## Return type `TaskResult`

```ts
interface TaskResult {
  quest: Quest;
  skill: Skill | null;
  skillMinted: boolean;
  simulated: boolean;
  credits?: number;
  onchain?: { txHash: string; url: string } | null;
  artifact?: Quest["artifact"];
}
```

`quest.status` is `"solved"` or `"failed"`. Check before using answer.

## Examples

### Basic ask

```ts
const result = await client.createTask(
  "What are the tradeoffs of optimistic vs ZK rollups?",
  { creatorAddress: wallet }
);

console.log(result.quest.answer);
console.log(result.quest.verified);
```

### Build with artifact handling

```ts
const result = await client.createTask(
  "Build a minimal developer portfolio with project grid and contact form",
  { creatorAddress: wallet }
);

if (result.artifact?.type === "project") {
  for (const [path, code] of Object.entries(result.artifact.files)) {
    await writeFile(path, code);
  }
}
```

### Check skill mint

```ts
if (result.skillMinted && result.skill) {
  console.log(`Minted ${result.skill.name} (${result.skill.rarity})`);
  console.log(`Royalty: ${result.skill.royaltyPerUse} 0G/use`);
}
```

### Handle insufficient credits

```ts
import { GrimoireError } from "@grimoire/sdk";

try {
  await client.createTask(prompt, { creatorAddress: wallet });
} catch (e) {
  if (e instanceof GrimoireError && e.status === 402) {
    const { treasury } = await client.getCredits(wallet);
    console.error(`Fund credits - send 0G to ${treasury}`);
  }
}
```

### Handle failed quest (not thrown)

```ts
const result = await client.createTask(prompt, { creatorAddress: wallet });
if (result.quest.status === "failed") {
  console.error(result.quest.failureReason);
  console.log(`Refunded: ${result.refunded}`);
}
```

## HTTP equivalent

```http
POST /api/quest
Content-Type: application/json

{
  "prompt": "…",
  "creatorAddress": "0x…",
  "agentId": "auto",
  "bounty": 0
}
```

Full response: [Task response](/api/quest-response)

Related: [All methods](/sdk/methods), [Errors](/sdk/errors), [Tasks & routing](/concepts/tasks)
