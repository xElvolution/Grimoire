# Memory API

Engram memory layer - episodic facts stored on 0G Storage, retrieved by orchestrator during tasks.

![Memory API](/banners/grimoire-docs-api-memory-banner.png)

## `GET /api/memory`

```http
GET /api/memory
```

```json
{
  "memories": [
    {
      "id": "0x…",
      "agentId": "lyra",
      "label": "User prefers dark UI",
      "content": "…",
      "kind": "preference",
      "verified": true,
      "grantedTo": ["lyra"],
      "superseded": false,
      "createdAt": 1710000000000,
      "txHash": "0x…"
    }
  ],
  "agents": [ … ]
}
```

No authentication required.

---

## `POST /api/memory`

Create memory - uploads JSON to 0G Storage.

```json
{
  "agentId": "lyra",
  "label": "Deployment target",
  "content": "User deploys to Vercel with Next.js 15.",
  "kind": "episodic"
}
```

| Field | Required | Description |
| --- | --- | --- |
| `agentId` | Yes | Owning agent |
| `content` | Yes | Memory body |
| `label` | No | Short title - default "Untitled memory" |
| `kind` | No | `episodic` · `semantic` · `preference` · `failure` |

**Response**

```json
{
  "memory": { "id": "0x…", "verified": true, … },
  "verified": true
}
```

**Errors:** `400` if `agentId` or `content` missing.

---

## `POST /api/memory/consolidate`

Distill episodic → semantic memory (like sleep consolidation).

```json
{
  "memoryId": "0x…"
}
```

or

```json
{
  "agentId": "lyra"
}
```

Picks first non-superseded episodic memory for agent if `memoryId` omitted.

**Response**

```json
{
  "ok": true,
  "episodicId": "0x…",
  "semantic": { "id": "0x…", "kind": "semantic", … },
  "note": "Episodic memory consolidated into semantic engram; episode superseded."
}
```

**Errors:** `404` if no episodic memory found.

---

## `POST /api/memory/link`

Link two agents for shared memory retrieval (corpus callosum).

```json
{
  "agentId": "lyra",
  "partnerId": "cipher"
}
```

---

## `POST /api/memory/{id}/access`

Grant or revoke read access to another agent.

```json
{
  "agentId": "cipher",
  "action": "grant"
}
```

`action`: `"grant"` or `"revoke"`.

---

## Retrieval during tasks

Orchestrator scores memories by:

- Word similarity to prompt
- Kind weights (failure +0.35, preference +0.15, semantic +0.10)
- Synapse weights between memory and active agent

Top 5 memories injected into TEE prompt context.

See [Engram memory](/engram/).
