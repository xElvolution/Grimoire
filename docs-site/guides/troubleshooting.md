# Troubleshooting

Common issues when integrating with Grimoire SDK, CLI, or HTTP API.

![Troubleshooting](/banners/grimoire-docs-guide-troubleshooting-banner.png)

## Authentication & wallet

### `Sign in with your wallet to post tasks`

**Cause:** Missing or invalid `creatorAddress`.

**Fix:** Pass exactly `0x` + 40 hex characters:

```ts
creatorAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"
```

### Royalties not credited when I reuse my own skill

**Expected:** Self-use skips royalty payment. Another wallet must run your skill for you to earn.

---

## Credits

### `Insufficient credits` (402)

**Fix:**

1. `GET /api/credits?address=0x…` → note `treasury`
2. Send native 0G to treasury on Galileo
3. `POST /api/credits` with `txHash`
4. Or use Console nav pill to fund

### Task cost higher than expected

Build tasks cost **0.005** vs ask **0.001**. Mode is auto-detected from prompt wording.

### Credits deducted but no answer

Check response - if `refunded` is present, credits were restored. If `quest.status === "failed"`, see compute section below.

---

## Tasks & inference

### Every task fails with compute error

**Cause:** Grimoire API server cannot reach 0G Compute.

**Fix (server operator):** Configure compute credentials on the API host. SDK users need a working API deployment.

### Build task returns questions instead of code

**Cause:** Prompt too vague - clarification mode.

**Fix:** Add style, audience, sections:

- Bad: `build me a website`
- Good: `build a dark neon gaming landing page with hero, features, pricing, framer-motion animations`

### No skill minted after successful task

**Normal** for many tasks. Mint requires:

- Prompt ≥ 50 chars (often ≥ 90 for common rarity)
- No duplicate skill (similarity &lt; 0.72)
- Verified + distinctive enough

Check `skillNote` in response for exact reason.

### `simulated: true` in response

Server fell back or misconfigured - production should always show `simulated: false` with live compute.

---

## SDK & CLI

### `No fetch - pass fetch in config`

Node &lt; 18 or missing global fetch. Upgrade Node or pass `fetch` in `GrimoireClient` config.

### CLI `Unknown command`

```bash
grimoire help
grimoire task "prompt" --wallet 0x…
```

`GRIMOIRE_URL` must point to running API.

### `listSkills()` returns empty

Network may have no skills yet, or API URL wrong. Try `GET /api/state` without address for network skills.

---

## Memory & Engram

### Consolidate returns 404

No episodic memory for agent. Create one with `POST /api/memory` first.

### Memories not appearing in task context

Similarity threshold - memory must score &gt; 0.08 vs prompt. Write specific labels/content related to future tasks.

---

## Docs site

### Page 404 locally

```bash
cd docs-site && rm -rf .vitepress/cache && npm run dev
```

### Search missing new pages

Rebuild after adding markdown files.

---

## Getting help

1. Reproduce with minimal `curl` or CLI command
2. Capture status code + `error` field
3. Check `credits`, `refunded`, `skillNote` in quest response

Related: [SDK errors](/sdk/errors), [Credits API](/api/credits)
