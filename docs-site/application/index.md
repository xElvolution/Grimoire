# Console application

The Grimoire **Console** is the signed-in web application. It uses the same HTTP API as the SDK and CLI - it is a reference UI, not a separate backend.

![Console](/banners/grimoire-docs-console-banner.png)

Production URL: your deployment (e.g. `https://app.grimoire.xyz`).

## Routes

| Path | Purpose |
| --- | --- |
| `/task` | Universal task input - auto intent, orchestration trail, Sandpack build preview |
| `/` | Dashboard - stats, royalty feed, recent activity |
| `/library` | Skills you created - uses, earnings, rarity |
| `/market` | Buy/sell skill ownership (royalty streams) |
| `/memory` | Engram memories + brain visualization |

## Authentication

Wallet sign-in via **Privy**:

- Email / social login
- External wallet (MetaMask, etc.)
- Embedded wallet for new users

Connected address becomes `creatorAddress` on all API calls.

## Task experience (`/task`)

1. Single input - no mode picker
2. Orchestration trail shows reflex, memories fired, skill reused
3. Build tasks render in Sandpack live preview
4. Code tasks show syntax-highlighted artifacts
5. Wallet queries return formatted balance/earnings

Terminology in UI: **run/reuse skill** (not "cast").

## Credits UI

Nav bar **0G pill**:

- Shows app credit balance
- Fund from native 0G wallet
- Links to faucet on testnet

## Library & royalties

- **Library** - skills minted by your wallet with `uses`, `earnings`, `royaltyPerUse`
- **Royalty feed** - live stream of royalty events with explorer links when on-chain

## Market

List skill ownership for sale. Buyers acquire the royalty stream - not a copy of the skill content (content is public on Storage).

## Memory (`/memory`)

- Write episodic/semantic memories per agent
- EngramBrain visualization from `/api/brain`
- Consolidation UI for episodic → semantic

## For developers

Do not scrape the Console. Use:

| Need | Use |
| --- | --- |
| TypeScript integration | [@grimoire/sdk](/sdk/installation) |
| Terminal / scripts | [grimoire CLI](/cli/installation) |
| Other languages | [HTTP API](/api/) |

The Console is useful for:

- Testing the golden path manually
- Funding credits visually
- Demonstrating orchestration to stakeholders

## Local development

```bash
cd webapp
npm install
npm run dev
# https://heygrimoire.xyz
```

Requires API server with 0G Compute and Storage configured.
