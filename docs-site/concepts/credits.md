# Credits & pricing

Grimoire uses an **app credit ledger** denominated in 0G. Tasks deduct credits; funding adds credits.

![Credits and pricing](/banners/grimoire-docs-concepts-credits-banner.png)

## Pricing table

| Detected mode | Credit cost |
| --- | --- |
| Ask | 0.001 0G |
| Summarize | 0.002 0G |
| Code | 0.003 0G |
| Build | 0.005 0G |

Mode is inferred from prompt text on the server. Attachments can push toward summarize mode.

## Check balance

**HTTP**

```http
GET /api/credits?address=0xYourWallet
```

**Response**

```json
{
  "balance": 0.45,
  "treasury": "0x…",
  "signupBonus": 0,
  "ledger": [
    {
      "id": "…",
      "type": "debit",
      "amount": 0.001,
      "balanceAfter": 0.449,
      "note": "ask task",
      "questId": "q_…",
      "at": 1710000000000
    }
  ]
}
```

**SDK**

```ts
const { balance, ledger } = await client.getCredits(wallet);
```

## Fund credits

### Production path

1. Send native 0G to the **treasury address** returned by `GET /api/credits`
2. Call fund with transaction hash:

```http
POST /api/credits
Content-Type: application/json

{
  "address": "0xYourWallet",
  "amount": 0.1,
  "txHash": "0x…"
}
```

The server verifies:

- Transaction exists and succeeded
- `to` is treasury
- `from` matches `address`
- Value ≥ requested amount

### Console

Use the 0G balance pill in the nav to fund from the web UI.

## Ledger entry types

| Type | Meaning |
| --- | --- |
| `fund` | Credits added |
| `debit` | Task cost charged |
| `refund` | Failed task - credits returned |

## Task flow

1. `POST /api/quest` deducts `creditCost` immediately
2. On success → response includes `credits` (remaining) and `creditUsed`
3. On failure after deduction → `refunded` field + restored balance

## Minimum fund

`0.01` 0G minimum per fund request.

## SDK examples

```ts
// Check before task
const { balance } = await client.getCredits(wallet);
if (balance < 0.005) {
  throw new Error("Insufficient credits for build task");
}

await client.createTask("…", { creatorAddress: wallet });
```

See [API credits](/api/credits).
