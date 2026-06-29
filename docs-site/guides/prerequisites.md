# Prerequisites

What you need before integrating with Grimoire.

![Prerequisites](/banners/grimoire-docs-guide-prerequisites-banner.png)

## For SDK or CLI users

| Requirement | Details |
| --- | --- |
| **API URL** | Hosted Grimoire API (e.g. `https://heygrimoire.xyz`) or local development server |
| **Wallet address** | 42-character hex (`0x` + 40 chars) passed as `creatorAddress` |
| **App credits** | Tasks consume credits from the app ledger - fund before posting |
| **Node 18+** | For TypeScript SDK and CLI |

## Wallet address

Every write operation scopes data to `creatorAddress`:

- Skills you mint belong to this wallet
- Royalties are credited to this wallet
- Credit balance is per wallet
- Quest history is associated with this wallet

The SDK and CLI do not sign transactions for you - they pass the address to the API. Your application is responsible for wallet ownership.

## App credits vs on-chain 0G

| | App credits | On-chain 0G |
| --- | --- | --- |
| **Used for** | Posting tasks | Gas, treasury deposits, royalties |
| **Check balance** | `GET /api/credits` | Wallet snapshot tasks |
| **Fund** | Deposit to treasury + `txHash`, or Console UI | Galileo faucet / transfer |

### Task pricing (app credits)

| Detected mode | Cost per task |
| --- | --- |
| Ask (default) | 0.001 0G |
| Summarize | 0.002 0G |
| Code | 0.003 0G |
| Build | 0.005 0G |

Mode is detected from prompt text - you do not send a mode field.

## Network (Galileo testnet)

| | Value |
| --- | --- |
| Chain ID | `16602` |
| RPC | `https://evmrpc-testnet.0g.ai` |
| Explorer | https://chainscan-galileo.0g.ai |
| Faucet | https://faucet.0g.ai |

## Next

- [SDK installation](/sdk/installation)
- [CLI installation](/cli/installation)
- [Fund credits](/api/credits)
