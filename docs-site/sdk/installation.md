# SDK installation

Install `@grimoire/sdk` and connect to your Grimoire API deployment.

![SDK installation](/banners/grimoire-docs-sdk-installation-banner.png)

## npm

```bash
npm install @grimoire/sdk
```

## Monorepo

```bash
cd sdk
npm install
npm run build
```

Link locally in another package:

```json
{
  "dependencies": {
    "@grimoire/sdk": "file:../sdk"
  }
}
```

## Configure client

```ts
import { GrimoireClient } from "@grimoire/sdk";

const client = new GrimoireClient({
  baseUrl: "https://heygrimoire.xyz",
});
```

Replace the URL with your Grimoire API host.

## Requirements

- Node 18+ (native `fetch`)
- Wallet address for `creatorAddress` on write endpoints
- Grimoire API reachable from your environment

## Verify install

```ts
import { GrimoireClient } from "@grimoire/sdk";
const client = new GrimoireClient({ baseUrl: "https://heygrimoire.xyz" });
const skills = await client.listSkills();
console.log(skills.length);
```

## Next

- [Quick start](/sdk/quickstart)
- [createTask](/sdk/create-task)
- [Types](/sdk/types)
