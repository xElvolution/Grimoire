# HTTP API

REST interface used by the SDK, CLI, and custom integrations.

![HTTP API](/banners/grimoire-docs-api-overview-banner.png)

Base URL: your Grimoire API host (e.g. `https://app.heygrimoire.xyz`).

## Authentication

Write endpoints require `creatorAddress` - a valid `0x` wallet. Credits and results are scoped to that address.

## Primary endpoint

`POST /api/quest` - post a task. See [Task response](/api/quest-response).

## Content type

JSON request and response bodies. Errors: `{ "error": "message" }`.

## Status codes

| Code | Meaning |
| --- | --- |
| `200` | Success |
| `400` | Invalid request |
| `401` | Missing or invalid wallet |
| `402` | Insufficient credits |
| `500` | Server error |

## Example

```bash
curl -s -X POST "$GRIMOIRE_URL/api/quest" \
  -H 'content-type: application/json' \
  -d '{"prompt":"Your task","creatorAddress":"0x…","agentId":"auto"}'
```

[Endpoints](/api/rest) · [SDK](/sdk/installation)
