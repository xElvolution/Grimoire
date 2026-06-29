# SDK errors

All failed HTTP responses throw `GrimoireError` with `message` and optional `status`.

![SDK errors](/banners/grimoire-docs-sdk-errors-banner.png)

```ts
import { GrimoireError } from "@grimoire/sdk";

catch (e) {
  if (e instanceof GrimoireError) {
    console.log(e.status, e.message);
  }
}
```

## Status codes

| Status | Endpoint | Cause | Action |
| --- | --- | --- | --- |
| **400** | Any | Invalid body - short prompt, bad address format, missing fields | Fix request payload |
| **401** | `POST /api/quest` | No valid `creatorAddress` | Pass `0x` + 40 hex chars |
| **402** | `POST /api/quest` | Insufficient credits | Fund via treasury + `fundCredits` |
| **404** | `POST /api/memory/consolidate` | No episodic memory to consolidate | Write episodic memory first |
| **404** | `POST /api/skills/{id}/run` | Skill ID not found | Use `listSkills()` |
| **500** | `POST /api/quest` | 0G Compute unavailable or storage upload failed | Credits refunded; retry or check server logs |

## Quest failure response (not thrown)

When inference fails, `POST /api/quest` returns **200** with `quest.status === "failed"`:

```json
{
  "quest": { "status": "failed", "failureReason": "…" },
  "refunded": 0.001,
  "credits": 0.449,
  "error": "0G Compute error message"
}
```

The SDK treats this as success - check `quest.status` in your app.

## Credit errors

```json
{
  "error": "Insufficient credits. This task costs 0.005 0G. Fund credits in the nav.",
  "creditCost": 0.005,
  "balance": 0.002
}
```

Status `402`.

## Fund errors

| Message | Fix |
| --- | --- |
| `Minimum fund is 0.01 0G` | Increase `amount` |
| `Transaction not found` | Wait for tx confirmation |
| `Send 0G to the treasury address` | Wrong `to` address |
| `Transaction sender mismatch` | `address` must match tx `from` |
| `Transaction value too low` | `amount` ≤ on-chain value |

## Server configuration

If every task fails with compute errors, the Grimoire API server needs 0G Compute credentials configured. That is server-side - SDK users only need a reachable API URL and funded credits.

## Retry guidance

| Scenario | Retry? |
| --- | --- |
| 402 insufficient credits | No - fund first |
| 500 compute timeout | Yes - after 30s |
| Failed quest + refunded | Yes - may succeed on retry |
| Duplicate skill (no mint) | N/A - answer still returned |
