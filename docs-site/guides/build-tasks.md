# Build tasks

Build mode generates **multi-file Next.js 15** projects via 0G Compute TEE.

![Build tasks](/banners/grimoire-docs-guide-build-tasks-banner.png)

## Triggering build mode

Prompts containing build intent are detected automatically:

- "build a landing page"
- "create a portfolio site"
- "design a SaaS homepage"
- "make me a website with …"

**Cost:** 0.005 0G per build task.

## Clarification vs full build

Short vague prompts get **clarifying questions** instead of code:

| Prompt | Result |
| --- | --- |
| "build me a website" | Questions about style, audience, sections |
| "build a dark neon gaming landing page with hero and pricing" | Full project files |

Clarification keywords that skip the vague check: `portfolio`, `gaming`, `saas`, `neon`, `dark`, `minimal`, `dashboard`, `developer`, etc.

## Output format

Successful builds return:

```json
{
  "artifact": {
    "type": "project",
    "entry": "app/page.tsx",
    "files": {
      "app/page.tsx": "…",
      "app/layout.tsx": "…",
      "app/globals.css": "…",
      "components/HeroSection.tsx": "…",
      "package.json": "…"
    }
  }
}
```

### Expected stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS v4 (`@import "tailwindcss"`)
- framer-motion for animations
- No `@types/tailwindcss` in package.json

### Design rules (server-enforced in prompt)

- Explicit dark backgrounds (`bg-zinc-950`) - no white-on-white
- Hero full viewport with motion animations
- Features section with cards
- Real copy - no lorem ipsum
- Responsive layout

## Skill minting

Build artifacts **typically mint skills** even when text-only tasks would not:

```json
{
  "skillMinted": true,
  "skillNote": "Build distilled into a reusable skill - stored on 0G, others can run it and you earn royalties."
}
```

## Console preview

The Grimoire Console renders build artifacts in Sandpack at `/task`.

## SDK example

```ts
const result = await client.createTask(
  "Build a minimal developer portfolio with dark theme, project grid, and contact section",
  { creatorAddress: wallet }
);

if (result.artifact?.type === "project") {
  const files = result.artifact.files;
  // deploy or preview
}
```

## Tips for better builds

1. Name the audience (gaming, SaaS, portfolio)
2. Specify color mood (neon, minimal, corporate)
3. List sections (hero, features, pricing, footer)
4. Mention animations if desired

See [Tasks & routing](/concepts/tasks).
