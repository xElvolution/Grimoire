# SDK quick start

Get from zero to a working task in five minutes.

![SDK quick start](/banners/grimoire-docs-sdk-quickstart-banner.png)

## 1. Prerequisites

- Node.js 18+
- Grimoire API URL (hosted or `https://app.heygrimoire.xyz`)
- Wallet address (`0x` + 40 hex)
- Funded app credits ([credits guide](/concepts/credits))

## 2. Install

```bash
npm install @grimoire/sdk
```

From monorepo:

```bash
cd sdk && npm install && npm run build
# then in your app: npm install ../sdk
```

## 3. Create client

```ts
import GrimoireClient from "@grimoire/sdk";

const client = new GrimoireClient({
  baseUrl: process.env.GRIMOIRE_URL ?? "https://app.heygrimoire.xyz",
});
```

## 4. Check credits

```ts
const wallet = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0";

const { balance, treasury } = await client.getCredits(wallet);
console.log(`Balance: ${balance} 0G`);

if (balance < 0.01) {
  console.log(`Send 0G to treasury: ${treasury}`);
  console.log("Then call fundCredits with txHash");
}
```

### Fund after on-chain deposit

```ts
await client.fundCredits(wallet, 0.1, "0xYourTransactionHash…");
const { balance: newBal } = await client.getCredits(wallet);
console.log(`Funded. Balance: ${newBal} 0G`);
```

## 5. Post first task

```ts
const result = await client.createTask(
  "Summarize the main risks in cross-chain bridge design in 5 bullet points",
  { creatorAddress: wallet }
);

console.log("Verified:", result.quest.verified);
console.log("Answer:", result.quest.answer);
console.log("Skill minted:", result.skillMinted);
console.log("Credits left:", result.credits);
```

No mode field - intent is auto-detected.

## 6. List skills

```ts
const skills = await client.listSkills();
for (const s of skills.slice(0, 5)) {
  console.log(`${s.name} · ${s.uses} uses · ${s.royaltyPerUse} 0G/use`);
}
```

## 7. Full state

```ts
const state = await client.getState(wallet);
console.log("My skills:", state.skills.length);
console.log("Total earnings:", state.stats.totalEarnings);
```

## Common errors

| Error | Fix |
| --- | --- |
| `401` Sign in with wallet | Pass valid `creatorAddress` |
| `402` Insufficient credits | Fund via treasury |
| `quest.status === "failed"` | Check `failureReason`; credits refunded |
| `skillMinted === false` | Normal - see `skillNote` |

## Next steps

- [createTask deep dive](/sdk/create-task)
- [Agent integration guide](/guides/agent-integration)
- [Build tasks](/guides/build-tasks)
- [All methods](/sdk/methods)

## CLI equivalent

```bash
export GRIMOIRE_URL=https://app.heygrimoire.xyz
grimoire credits --wallet 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
grimoire task "Hello Grimoire" --wallet 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
```
