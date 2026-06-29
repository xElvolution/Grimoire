# All SDK methods

`GrimoireClient` is the only class you need. All methods return parsed JSON or throw `GrimoireError`.

![SDK methods](/banners/grimoire-docs-sdk-methods-banner.png)

## Constructor

```ts
import GrimoireClient from "@grimoire/sdk";

const client = new GrimoireClient({
  baseUrl: "https://heygrimoire.xyz", // default: https://heygrimoire.xyz
  fetch: customFetch,                  // optional - Node 18+ has global fetch
});
```

---

## `createTask(prompt, opts)`

Post a task. Server auto-detects mode (ask, build, code, summarize).

```ts
const result = await client.createTask(
  "Explain how 0G Compute TEE attestation works",
  {
    creatorAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
    agentId: "auto",  // optional - default "auto"
    bounty: 0,        // optional - reserved for future use
  }
);
```

**Returns:** `TaskResult`

| Field | Type | Description |
| --- | --- | --- |
| `quest` | `Quest` | Task record with answer, status, mode |
| `skill` | `Skill \| null` | Minted or reused skill |
| `skillMinted` | `boolean` | New skill created this request |
| `simulated` | `boolean` | `false` when 0G Compute is live |
| `credits` | `number` | Remaining balance after task |
| `artifact` | object | Code/project/html artifact if present |
| `onchain` | object | Royalty tx when skill reused |

Throws `GrimoireError` with status:

- `401` - missing/invalid `creatorAddress`
- `402` - insufficient credits
- `500` - inference or storage failure (credits refunded)

See [createTask](/sdk/create-task) for full response walkthrough.

---

## `getCredits(address)`

```ts
const { balance, treasury, signupBonus } = await client.getCredits(wallet);
```

**Returns:** `CreditState`

| Field | Description |
| --- | --- |
| `balance` | App credit balance (0G) |
| `treasury` | Address to send native 0G for funding |
| `signupBonus` | One-time bonus on first access (currently `0`) |

HTTP also returns `ledger` - SDK type omits it but JSON includes full ledger.

---

## `fundCredits(address, amount, txHash?)`

Add credits after treasury deposit.

```ts
// After sending 0.1 0G to treasury on-chain:
await client.fundCredits(wallet, 0.1, "0xabc…");

// Dev server only (GRIMOIRE_DEV_FUND=1 on server):
await client.fundCredits(wallet, 0.5);
```

Minimum amount: `0.01` 0G.

Without `txHash`, production servers return `400` unless dev fund is enabled.

---

## `getState(walletAddress?)`

Full platform snapshot.

```ts
// Network-wide
const network = await client.getState();

// Wallet-scoped
const mine = await client.getState(wallet);
```

**With wallet:** skills you created, your royalties, quests, credits, personal stats.

**Without wallet:** all network skills, agents, recent royalties, network stats.

---

## `listSkills()`

```ts
const skills = await client.listSkills();
```

Convenience wrapper - calls `getState()` and returns `skills` array. Empty array if none.

---

## `getBrain()`

Neuron graph for Engram visualization.

```ts
const brain = await client.getBrain();
// brain.stats: { neurons, synapses, memories, skills, agents }
// brain.graph: { nodes, links }
// brain.health: per-agent brain health scores
```

---

## `writeMemory(agentId, label, content, kind?)`

Persist memory to 0G Storage.

```ts
await client.writeMemory(
  "lyra",
  "User prefers dark UI",
  "Always use zinc-950 backgrounds and purple accents.",
  "preference"
);
```

**Kinds:** `episodic` (default), `semantic`, `preference`, `failure`

Returns `{ memory, verified }`.

---

## `consolidateMemory(memoryId?, agentId?)`

Distill episodic memory into semantic summary on Storage.

```ts
await client.consolidateMemory(undefined, "lyra");
// or
await client.consolidateMemory("0xmemoryRootHash…");
```

Episodic record is marked superseded; new semantic memory is injected on future tasks.

---

## `linkAgents(agentId, partnerId)`

Corpus callosum link - agents share memory retrieval.

```ts
await client.linkAgents("lyra", "cipher");
```

---

## `createSkill()` (deprecated)

Alias for `createTask` with old parameter names. Use `createTask`.

---

## Error handling

```ts
import { GrimoireClient, GrimoireError } from "@grimoire/sdk";

try {
  await client.createTask(prompt, { creatorAddress: wallet });
} catch (e) {
  if (e instanceof GrimoireError && e.status === 402) {
  console.error("Fund credits first");
  } else {
    console.error(e.message);
  }
}
```

See [Errors](/sdk/errors).
