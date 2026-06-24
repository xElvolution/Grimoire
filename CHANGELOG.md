# Changelog

All notable changes to Grimoire are documented here. Newest first.

Grimoire is the verifiable economy of AI agents on 0G: create a skill once and earn a
royalty every time any agent uses it, with usage proven in a TEE.

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
