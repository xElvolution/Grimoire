# Types & errors

## Main types

![SDK types](/banners/grimoire-docs-sdk-types-banner.png)

```ts
import type {
  Skill,
  Agent,
  Quest,
  TaskResult,
  GrimoireState,
  RoyaltyEvent,
  CreditState,
  Rarity,
  GrimoireError,
} from "@grimoire/sdk";
```

## Skill

Key fields: `id`, `name`, `category`, `promptTemplate`, `rarity`, `royaltyPerUse`, `uses`, `earnings`, `verified`, `creatorAddress`.

## TaskResult

Returned by `createTask()`. Includes `quest`, `skill`, `skillMinted`, `credits`, `onchain`, `artifact`.

The HTTP API may return additional fields (`usedSkill`, `reflex`, `firedMemories`, …). See [Task response](/api/quest-response).

## GrimoireError

```ts
try {
  await client.createTask(prompt, { creatorAddress: wallet });
} catch (e) {
  if (e instanceof GrimoireError) {
    console.error(e.message, e.status);
  }
}
```

## Rarity

`common` | `rare` | `epic` | `legendary` - affects royalty rate at mint.
