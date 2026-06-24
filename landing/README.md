# Grimoire - Landing Page

The marketing front door for **Grimoire**, a self-running, verifiable economy of AI
agents on **0G**. *Heroes go on quests, cast spells, and remember. The humans who
author the spells earn forever - every time any agent casts them.*

## Stack
- **Next.js 16** (App Router) · React 19 · TypeScript
- **Tailwind v4** (CSS-first theme in `globals.css`)
- **Three.js + react-three-fiber + drei + postprocessing** - the 3D agent-network hero
- **GSAP + @gsap/react** (ScrollTrigger reveals)
- **Framer Motion** (UI transitions)

## Run
```bash
npm install
npm run dev      # http://localhost:3000 (falls back to 3001 if busy)
npm run build    # production build
```

## Structure
```
src/
  app/
    layout.tsx        fonts (Cinzel / Space Grotesk / JetBrains Mono) + metadata
    page.tsx          assembles all sections
    globals.css       arcane × machine design system (Tailwind v4 @theme)
  components/
    AgentNetwork.tsx  3D constellation of agents, glowing edges, travelling pulses
    Navbar.tsx        fixed glass nav
    Hero.tsx          headline + 3D canvas + stat strip
    LoopSection.tsx   the 4-step flywheel (Quest -> Cast -> Mint -> Earn)
    Architecture.tsx  the unified layer stack
    Economy.tsx       the flywheel + creator-economy comparables
    ZeroGSection.tsx  why it can only exist on 0G (the moat)
    CTA.tsx           Enter the Guild
    Footer.tsx
    Reveal.tsx        GSAP scroll-reveal wrapper
```

## Design language
Arcane spellbook meets machine intelligence: deep void black, arcane violet,
mana cyan, ember gold. Fonts: Cinzel (display/runic), Space Grotesk (body),
JetBrains Mono (code/onchain).

Part of the Grimoire monorepo - see `../webapp` (the dApp), `../sdk`, `../contracts`.
