# Changelog

All notable changes to Grimoire are documented here. Newest first.

Grimoire is the verifiable economy of AI agents on 0G: create a skill once and earn a
royalty every time any agent uses it, with usage proven in a TEE.

## [0.3.0] - 2026-07-01 (Top 32 stage)

### Added
- Credits system: fund a wallet with 0G, spend credits per task, and track balance live in the app (`CreditBadge`, `CreditsProvider`, `/api/credits`) and from the CLI.
- Task modes: tasks now route through distinct build/answer modes with a live orchestration trail so you can watch which agent handled each step.
- Build artifacts: tasks can return runnable output rendered inline - code files, a live site preview, and UI preview - plus a one-click project export.
- Voice input: dictate a task with the mic (`VoiceMic`, Web Speech typings).
- Wallet connect: connect a real wallet in the app (wagmi providers, `ConnectWallet`) and act as yourself on-chain.
- GrimoireBrain: a visual "brain" page showing the agent network, its neurons, and consolidated memory.
- Engram memory upgrades: link memories together and consolidate them (`/api/memory/link`, `/api/memory/consolidate`), with supporting neuron/mind libraries and Engram docs.
- Explore page (`/explore`): browse the live agent network and its activity.
- On-chain wiring for all six contracts: shared ABIs, deployment addresses, and an on-chain helper layer so previously unused contracts are now live.
- Grimoire CLI (`cli/`): `ask`/`task`, `skills`, `credits`, `fund`, `brain`, and `memory` commands, now with a full interactive REPL (`/wallet`, `/skills`, `/credits`, `/brain`, `/url`, etc.).
- Documentation site (`docs-site/`): a VitePress docs portal covering concepts, SDK, CLI, REST API, contracts, and guides, with per-page banners.
- New Grimoire branding: logo, nav mark, banner, and app icons across the landing site and web app.

### Changed
- SDK and CLI default to `https://app.heygrimoire.xyz`, and all docs/footer links now point at the `heygrimoire.xyz` domains.
- `@grimoire/sdk` refined: cleaner client, exported `Skill`/`TaskResult` types and `GrimoireError`, plus `getBrain` and memory helpers.
- Quest/task API reworked to support credits, task modes, attachments, and richer streamed results.

### Fixed
- Docs site Vercel deployment configuration.
- Removed hardcoded localhost references so every link resolves to the deployed domains.
- Restored `legacy-peer-deps` `.npmrc` so Vercel `npm install` succeeds.

## [0.2.0] - 2026-06-23 (Group Stage)

### Added
- Full web app (`webapp/`): dashboard, Skill Library, Memory, and Market pages with shared navigation.
- Agents that spawn agents: the orchestrator auto-routes a task to a domain specialist, and mints a brand new ERC-7857 agent when no agent covers that domain.
- Memory (Engram): write agent memories to 0G Storage with per-agent read access. Granting and revoking access is live (revoke means the agent forgets).
- Skill Market: list and buy ownership of a skill, transferring its royalty stream.
- Skill Library: browse every skill with search and category/rarity filters plus 0G provenance.
- `@grimoire/sdk`: a typed TypeScript client (createSkill, useSkill, listSkills, getState).
- Six smart contracts, deployed and source-verified on 0G Galileo testnet: SkillRegistry, AgentRegistry, RoyaltyVault, MemoryRegistry, SkillMarketplace, GrimToken.
- Documentation: README, MILESTONE roadmap, SUBMISSION, and per-package READMEs.

### Changed
- Real on-chain royalty settlement: a verified skill use now pays the creator with a real transfer and links the transaction on the explorer.
- Dashboard is mobile responsive.

### Verified live on 0G (not simulated)
- TEE inference on a real provider (qwen/qwen2.5-omni-7b), responses return verified true.
- Real 0G Storage root hashes for every skill and memory.
- Real on-chain royalty transaction settled and confirmed on the explorer.

### Fixed
- 0G Compute ledger creation for a fresh wallet (use addLedger, honor the 1.0 0G minimum provider reserve).
- Framer Motion variant typing and ES2020 target so production builds pass.

## [0.1.0] - 2026-06-22 (Initial build)

### Added
- Landing site (`landing/`): Next.js with a Three.js agent-network hero, GSAP scroll animations, Framer Motion, and a professional footer.
- Monorepo structure: `landing/`, `webapp/`, `sdk/`, `contracts/`.
- First 0G integration layer: 0G Storage (uploads) and 0G Compute (TEE inference) wiring, with a simulation fallback so the loop is always demoable.
- The core economy loop: post a task, an agent solves it, a skill is minted, a different agent uses it, the creator earns a royalty.
