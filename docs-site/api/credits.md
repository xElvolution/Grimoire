# Credits API

App credit ledger - separate from native 0G wallet balance.

![Credits API](/banners/grimoire-docs-api-credits-banner.png)

## `GET /api/credits`

```http
GET /api/credits?address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
```

**Response**

```json
{
  "balance": 0.45,
  "treasury": "0x…",
  "signupBonus": 0,
  "ledger": [
    {
      "id": "cl_…",
      "type": "debit",
      "amount": 0.001,
      "balanceAfter": 0.449,
      "note": "ask task",
      "questId": "q_…",
      "mode": "ask",
      "at": 1710000000000
    },
    {
      "id": "cl_…",
      "type": "fund",
      "amount": 0.5,
      "balanceAfter": 0.5,
      "note": "Deposited 0.5000 0G",
      "txHash": "0x…",
      "at": 1710000000000
    }
  ]
}
```

| Field | Description |
| --- | --- |
| `balance` | Current app credits |
| `treasury` | Send native 0G here to fund |
| `signupBonus` | Applied on first `ensureCredits` |
| `ledger` | Recent entries for this wallet |

**Errors:** `400` if `address` missing or invalid.

---

## `POST /api/credits`

Fund credits after on-chain deposit.

```http
POST /api/credits
Content-Type: application/json
```

```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
  "amount": 0.1,
  "txHash": "0xabcdef…"
}
```

### Verification steps (server)

1. Fetch transaction and receipt from Galileo RPC
2. Receipt status must be success
3. `tx.to` must equal treasury address
4. `tx.from` must equal `address`
5. `tx.value` ≥ `amount` (99% tolerance)

**Success response**

```json
{
  "balance": 0.55,
  "credited": 0.1,
  "txHash": "0x…",
  "ledger": []
}
```

### Dev funding

When server has `GRIMOIRE_DEV_FUND=1`, POST without `txHash` credits immediately:

```json
{ "address": "0x…", "amount": 0.5 }
```

Response includes `"dev": true`.

Production deployments should not expose dev fund.

---

## Pricing reference

| Mode | Cost |
| --- | --- |
| ask | 0.001 0G |
| summarize | 0.002 0G |
| code | 0.003 0G |
| build | 0.005 0G |

Constants: `MIN_FUND = 0.01`, `SIGNUP_BONUS = 0`.

See [Credits & pricing](/concepts/credits).
