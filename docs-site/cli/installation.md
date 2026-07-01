# CLI installation

Install the `grimoire` CLI and point it at your API URL.

![CLI installation](/banners/grimoire-docs-cli-installation-banner.png)

## Build from monorepo

```bash
cd cli
npm install
npm run build
```

The CLI depends on `@grimoire/sdk` via `file:../sdk`. Build the SDK first if you changed it:

```bash
cd ../sdk && npm run build && cd ../cli && npm run build
```

## Run

```bash
node dist/index.js help
```

## Global command (optional)

```bash
npm link
grimoire help
```

## Environment

| Variable | Description |
| --- | --- |
| `GRIMOIRE_URL` | API base URL |

```bash
export GRIMOIRE_URL=https://app.heygrimoire.xyz
```

## Requirements

- Node 18+
- Wallet address for `--wallet` on task and credit commands

## Next

- [Commands](/cli/commands)
