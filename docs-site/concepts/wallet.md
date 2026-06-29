# Wallet & credits

Grimoire uses **wallet address as identity**. Two balance types matter: app credits (task payments) and on-chain 0G (gas, funding, royalties).

![Wallet](/banners/grimoire-docs-concepts-wallet-banner.png)

## Wallet address (`creatorAddress`)

Every write operation scopes to a 42-character hex address:

```ts
creatorAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"
```

| Scoped to wallet | Description |
| --- | --- |
| Skills | `creatorAddress` receives royalties |
| Credits | Per-wallet app ledger |
| Quests | Task history |
| Royalties | Earnings feed |

Console users connect via Privy. SDK/CLI pass the address directly - your app must verify ownership.

## App credits

Internal ledger denominated in 0G. **Required for every task.**

### Check balance

```bash
grimoire credits --wallet 0x…
```

```ts
const { balance, treasury } = await client.getCredits(wallet);
```

### Fund flow

1. Get `treasury` from credits endpoint
2. Send native 0G to treasury on Galileo testnet
3. Confirm with `txHash`:

```ts
await client.fundCredits(wallet, 0.1, "0xTransactionHash…");
```

Or fund from Console - 0G pill in the nav bar.

### Task pricing

| Mode | Cost |
| --- | --- |
| ask | 0.001 0G |
| summarize | 0.002 0G |
| code | 0.003 0G |
| build | 0.005 0G |

Credits deducted before execution. Failed tasks refund automatically.

Constants: `MIN_FUND = 0.01`, `SIGNUP_BONUS = 0`.

See [Credits & pricing](/concepts/credits).

## On-chain balances

### Wallet snapshot

Natural-language tasks return live data:

| Prompt | Returns |
| --- | --- |
| "what's my balance" | App credits + native 0G + token balances |
| "how much have I earned" | Royalty totals + top skills |
| "my skills" | Skills you minted |
| "swap ETH for GRIM" | Trade guidance + balances |

Powered by `fetchWalletSnapshot()` - Galileo RPC + app ledger.

### Native 0G uses

- Gas for on-chain txs
- Treasury deposits → app credits
- Royalty payments to creators

## Credits vs on-chain

| | App credits | On-chain 0G |
| --- | --- | --- |
| **Stored** | Grimoire server ledger | Galileo blockchain |
| **Check** | `/api/credits` | Wallet snapshot tasks |
| **Spend on** | Tasks | Gas, treasury fund, royalties |
| **API field** | `credits` in state/quest | `walletSnapshot` in direct tasks |

## Galileo testnet

| | Value |
| --- | --- |
| Chain ID | `16602` |
| RPC | `https://evmrpc-testnet.0g.ai` |
| Explorer | https://chainscan-galileo.0g.ai |
| Faucet | https://faucet.0g.ai |

## Security note

The HTTP API does not verify wallet signatures today. Treat `creatorAddress` as trusted input from your authentication layer.

[Authentication](/api/authentication)
