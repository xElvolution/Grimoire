# API endpoints

Complete HTTP API reference for the Grimoire platform API (webapp server).

![All endpoints](/banners/grimoire-docs-api-rest-banner.png)

Base URL: your deployment (e.g. `https://heygrimoire.xyz` or `https://heygrimoire.xyz`).

---

## State & brain

### `GET /api/state`

Platform snapshot.

| Query | Description |
| --- | --- |
| `address` | Optional `0x` wallet - scopes skills, royalties, quests, credits |

**Without address:** network skills, agents, royalties (top 20), network stats.

**With address:** wallet-scoped data + `network` subsection with global view.

```json
{
  "walletConnected": true,
  "skills": [],
  "quests": [],
  "agents": [],
  "royalties": [],
  "credits": 0.45,
  "creator": { "address": "0x…", "earnings": 0, "skillsOwned": 0 },
  "stats": {
    "totalSkills": 0,
    "totalUses": 0,
    "totalEarnings": 0,
    "totalQuests": 42,
    "verifiedShare": 1
  },
  "network": { "skills": [], "stats": {}, "royalties": [] }
}
```

### `GET /api/brain`

Neuron graph for Engram UI.

```json
{
  "graph": { "nodes": [], "links": [] },
  "synapses": [],
  "health": [],
  "stats": {
    "neurons": 120,
    "synapses": 85,
    "memories": 15,
    "skills": 8,
    "agents": 6
  }
}
```

---

## Tasks

### `POST /api/quest`

[Full documentation](/api/post-task)

Primary task endpoint - orchestration + inference + skill mint.

---

## Credits

### `GET /api/credits?address=0x…`

[Full documentation](/api/credits)

### `POST /api/credits`

Fund credits with treasury deposit + `txHash`.

---

## Skills

### `POST /api/skills/{id}/run`

Explicit skill execution (orchestrator usually handles reuse).

```json
{
  "agentId": "lyra",
  "callerAddress": "0x…"
}
```

**Response**

```json
{
  "ok": true,
  "result": {
    "verified": true,
    "simulated": false,
    "answer": "…",
    "provider": "0G",
    "model": "…"
  },
  "royalty": { "amount": 0.005, "to": "0x…" },
  "onchain": { "txHash": "0x…", "url": "…" },
  "skill": {},
  "firedMemories": []
}
```

**Errors:** `404` skill not found, `500` inference failure.

Does **not** deduct app credits (unlike `/api/quest`).

---

## Memory

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/memory` | List memories + agents |
| POST | `/api/memory` | Create memory on Storage |
| POST | `/api/memory/consolidate` | Episodic → semantic |
| POST | `/api/memory/link` | Link agents |
| POST | `/api/memory/{id}/access` | Grant/revoke access |

[Memory API details](/api/memory)

---

## Market

### `GET /api/market`

Skill ownership listings.

### `POST /api/market`

Create listing - skill royalty stream sale.

---

## Attachments

### `POST /api/attach`

Multipart file upload for task context. Returns extracted text to embed in quest `prompt`.

---

## Status code summary

| Code | Meaning |
| --- | --- |
| 200 | Success (including failed quests with refund) |
| 400 | Bad request |
| 401 | Quest without wallet |
| 402 | Insufficient credits |
| 404 | Resource not found |
| 500 | Server / compute error |
