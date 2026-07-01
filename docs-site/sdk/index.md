# SDK

`@grimoire/sdk` is the TypeScript client for the Grimoire HTTP API.

![SDK](/banners/grimoire-docs-sdk-overview-banner.png)

## Install

```bash
npm install @grimoire/sdk
```

See [Installation](/sdk/installation) for monorepo and local linking.

## Configure

```ts
import { GrimoireClient } from "@grimoire/sdk";

const client = new GrimoireClient({
  baseUrl: "https://app.heygrimoire.xyz",
});
```

## Methods

| Method | Description |
| --- | --- |
| `createTask(prompt, opts)` | Post a task |
| `getCredits(address)` | Credit balance |
| `fundCredits(address, amount)` | Add credits |
| `listSkills()` | Network skills |
| `getState(address?)` | Economy snapshot |
| `getBrain()` | Graph statistics |
| `writeMemory(...)` | Store memory |
| `consolidateMemory(...)` | Distill memory |
| `linkAgents(...)` | Link agents |

## Errors

`GrimoireError` includes `status` when the API returns an error (e.g. `402` insufficient credits).

## Next

- [Installation](/sdk/installation)
- [Quick start](/sdk/quickstart)
- [createTask](/sdk/create-task)
- [Types](/sdk/types)
