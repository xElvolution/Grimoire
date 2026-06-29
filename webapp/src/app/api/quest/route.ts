import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { solve } from "@/lib/zerog/engine";
import { uploadJSON } from "@/lib/zerog/storage";
import { planQuest, injectContext, injectWalletContext, formatUserFacingAnswer } from "@/lib/orchestrator";
import { detectDirectTask, runDirectTask } from "@/lib/taskDirect";
import { fetchWalletSnapshot, formatWalletSnapshot } from "@/lib/walletState";
import { publishMindManifest } from "@/lib/mind";
import { categorize, deriveName, royaltyForRarity, shouldMintSkill, rarityFor } from "@/lib/skillMint";
import { taskCost, SIGNUP_BONUS, type TaskModeId } from "@/lib/credits";
import { detectTaskMode, needsBuildClarification } from "@/lib/taskMode";
import { detectArtifact } from "@/lib/extractArtifact";
import {
  settleSkillUse,
  registerSkillOnChain,
  mintAgentOnChain,
  claimSkillOnChain,
  mintGrimOnChain,
} from "@/lib/contracts/onchain";
import type { Skill, Quest } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUILD_SUFFIX = `

IMPORTANT - Build a complete Next.js 15 App Router site with TypeScript, Tailwind CSS v4, and framer-motion animations.

Output ONLY code files using this exact format for EACH file:
\`\`\`tsx file:app/page.tsx
"use client";
// your code
\`\`\`

Required files (every import must have a matching file):
- app/page.tsx - composes all sections (imports only, minimal logic)
- app/layout.tsx
- app/globals.css - @import "tailwindcss";
- components/HeroSection.tsx, components/FeaturesSection.tsx, components/PricingSection.tsx, components/Footer.tsx (at minimum)
- package.json - next, react, react-dom, framer-motion only (no @types/tailwindcss)

Design rules (critical):
- Match the user's theme: gaming = dark bg (#09090b), neon purple/cyan accents, gradients, bold typography, game imagery placeholders
- NEVER white text on white background - always explicit bg-zinc-950 or similar on body/sections
- Hero: full viewport, animated headline, CTA buttons, motion.div entrance animations
- Features: 3-6 cards with icons, hover states
- Real copy - no lorem ipsum
- Fully responsive, polished spacing

Code rules:
- Use "use client" on components that use framer-motion
- No markdown explanation - only file blocks
- Each section uses motion with whileInView or initial/animate
- Export every component file that app/page.tsx imports`;

const CLARIFY_SUFFIX = `

The user wants a website but hasn't given enough detail yet.
Respond as a friendly build assistant:
- Ask 2-3 specific questions (style, audience, must-have sections).
- Offer 2-3 concrete direction options they can pick (e.g. dark minimal portfolio, bold gaming neon, clean SaaS).
- Do NOT output code files. Do NOT refuse or suggest external website builders.
- Keep it short and conversational.`;

const TRADE_SUFFIX = `

The user wants to trade or swap tokens on 0G using their connected wallet.
Use the wallet snapshot in context. Explain concrete steps with their actual balances.
Do NOT refuse. Do NOT suggest leaving Grimoire. If a specific DEX route isn't available yet, say what you CAN do now (balances, Market for skills, fund credits) and what you'll route when live.`;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const prompt: string = body.prompt;
  const bounty = Number(body.bounty) || 0;
  const requestedAgent: string = body.agentId || "auto";
  const hasAttachments = typeof body.prompt === "string" && body.prompt.includes("--- File:");
  const walletAddress: string | undefined =
    typeof body.creatorAddress === "string" && /^0x[a-fA-F0-9]{40}$/.test(body.creatorAddress)
      ? body.creatorAddress
      : undefined;

  if (!walletAddress) {
    return NextResponse.json(
      { error: "Sign in with your wallet to post tasks and mint skills." },
      { status: 401 }
    );
  }

  const creator = `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 4) {
    return NextResponse.json({ error: "A task description is required." }, { status: 400 });
  }

  const trimmedForSolve = prompt.trim();
  const detectedMode = detectTaskMode(trimmedForSolve, hasAttachments);
  const clarifyBuild = detectedMode === "build" && needsBuildClarification(trimmedForSolve);
  const mode: TaskModeId = clarifyBuild ? "ask" : detectedMode;
  const creditCost = taskCost(mode);
  const createdAt = Date.now();
  const questId = `q_${createdAt}`;

  // First time we see this wallet: mint a 100 GRIM welcome bonus on-chain.
  // Fire-and-forget so it never blocks task posting.
  if (db.isFirstTimeAddress(walletAddress)) {
    mintGrimOnChain(walletAddress, 100).catch(() => {});
  }
  db.ensureCredits(walletAddress, SIGNUP_BONUS);
  if (!db.deductCredits(walletAddress, creditCost, {
    mode,
    questId,
    note: `${mode} task`,
  })) {
    return NextResponse.json(
      {
        error: `Insufficient credits. This task costs ${creditCost} 0G. Fund credits in the nav.`,
        creditCost,
        balance: db.getCredits(walletAddress),
      },
      { status: 402 }
    );
  }

  let solvePrompt = trimmedForSolve;
  if (clarifyBuild) {
    solvePrompt = trimmedForSolve + CLARIFY_SUFFIX;
  } else if (detectedMode === "build") {
    solvePrompt = trimmedForSolve + BUILD_SUFFIX;
  }
  const { key: category } = categorize(trimmedForSolve);

  const route = planQuest({
    prompt: trimmedForSolve,
    requestedAgent,
    agents: db.agents(),
    skills: db.skills(),
    memories: db.memories(),
    synapses: db.synapses(),
    agentForCategory: db.agentForCategory.bind(db),
    spawnAgent: db.spawnAgent.bind(db),
    topAgent: db.topAgent.bind(db),
  });

  let spawnedAgent: { id: string; name: string; specialty: string; erc7857: string; by?: string } | null = null;
  if (route.spawnedAgent) {
    spawnedAgent = {
      id: route.spawnedAgent.id,
      name: route.spawnedAgent.name,
      specialty: route.spawnedAgent.specialty,
      erc7857: route.spawnedAgent.erc7857,
      by: route.spawnedAgent.spawnedBy,
    };
    // fire-and-forget: mint the new agent on AgentRegistry; don't block the response
    const spawned = route.spawnedAgent;
    mintAgentOnChain(spawned.id, spawned.specialty, 0)
      .then((res) => {
        if (res) db.setAgentOnChain(spawned.id, res.onChainId, res.txHash);
      })
      .catch(() => {});
  }

  const firedMemoryIds = route.memories.map((m) => m.id);
  const firedSkillIds = route.contextSkills.map((s) => s.id);
  const creatorAddress = walletAddress;

  const directKind = detectDirectTask(trimmedForSolve);
  if (directKind) {
    const direct = await runDirectTask(directKind, walletAddress);
    db.recordNeuronFire(route.agentId, firedMemoryIds, firedSkillIds);
    const quest: Quest = {
      id: questId,
      prompt: trimmedForSolve,
      bounty,
      status: "solved",
      creator,
      agentId: route.agentId,
      answer: direct.answer,
      verified: true,
      createdAt,
      firedMemoryIds,
      firedSkillIds,
      reflex: route.reflex,
      mode: detectedMode,
      creditCost,
    };
    db.addQuest(quest);
    return NextResponse.json({
      quest,
      skill: null,
      skillMinted: false,
      skillNote: "Wallet query - no skill minted.",
      spawnedAgent,
      simulated: false,
      firedMemories: route.memories,
      firedSkills: route.contextSkills,
      reflex: route.reflex,
      directTask: direct.kind,
      credits: db.getCredits(walletAddress),
      ledger: db.creditLedgerForAddress(walletAddress),
      creditUsed: creditCost,
    });
  }

  let walletBlock = "";
  try {
    walletBlock = formatWalletSnapshot(await fetchWalletSnapshot(walletAddress));
  } catch {
    /* optional */
  }

  let result: Awaited<ReturnType<typeof solve>>;
  let usedExisting = false;
  let royaltyTx: string | undefined;
  let onchain: { txHash: string; url: string; method?: string } | null = null;

  try {
    const withWallet = injectWalletContext(solvePrompt, walletBlock);
    const tradeBoost =
      /\b(swap|trade|exchange|defi)\b/i.test(trimmedForSolve) ? TRADE_SUFFIX : "";

    if (route.castSkill) {
      const enriched = injectContext(
        withWallet + tradeBoost,
        route.memories,
        route.contextSkills
      );
      result = await solve(enriched || route.castSkill.promptTemplate);
      usedExisting = true;

      const selfCast =
        !!route.castSkill.creatorAddress &&
        route.castSkill.creatorAddress.toLowerCase() === walletAddress.toLowerCase();
      if (result.verified && !result.simulated && route.castSkill.creatorAddress && !selfCast) {
        const settled = await settleSkillUse(
          route.castSkill.id,
          route.castSkill.royaltyPerUse,
          route.castSkill.creatorAddress
        );
        if (settled) {
          onchain = settled;
          royaltyTx = settled.txHash;
        }
      }
      db.recordUse(route.castSkill.id, route.agentId, royaltyTx, result.verified, {
        callerAddress: walletAddress,
      });
      firedSkillIds.push(route.castSkill.id);
    } else {
      const enriched = injectContext(
        withWallet + tradeBoost,
        route.memories,
        route.contextSkills
      );
      result = await solve(enriched);
    }
  } catch (e) {
    db.refundCredits(walletAddress, creditCost, { questId, note: "Task failed - refunded" });
    const reason = (e as Error).message;
    db.addFailureMemory(route.agentId, trimmedForSolve, reason);
    const quest: Quest = {
      id: questId,
      prompt: trimmedForSolve,
      bounty,
      status: "failed",
      creator,
      agentId: route.agentId,
      createdAt,
      firedMemoryIds,
      firedSkillIds,
      reflex: route.reflex,
      failureReason: reason,
      mode: detectedMode,
      creditCost,
    };
    db.addQuest(quest);
    db.recordNeuronFire(route.agentId, firedMemoryIds, firedSkillIds);

    return NextResponse.json({
      quest,
      skill: null,
      skillMinted: false,
      skillNote: "Quest failed - failure engram committed.",
      spawnedAgent,
      simulated: false,
      firedMemories: route.memories,
      reflex: route.reflex,
      error: reason,
      credits: db.getCredits(walletAddress),
      ledger: db.creditLedgerForAddress(walletAddress),
      refunded: creditCost,
    });
  }

  db.recordNeuronFire(route.agentId, firedMemoryIds, firedSkillIds);

  const rawAnswer = result.answer;
  const artifactDetected = detectArtifact(
    rawAnswer,
    detectedMode === "build" && !clarifyBuild ? "build" : mode
  );
  const displayAnswer = formatUserFacingAnswer(rawAnswer);
  const artifact = artifactDetected
    ? artifactDetected.type === "project"
      ? {
          type: "project" as const,
          content: artifactDetected.files["app/page.tsx"] ?? "",
          files: artifactDetected.files,
          entry: artifactDetected.entry,
        }
      : artifactDetected.type === "html"
        ? { type: "html" as const, content: artifactDetected.content }
        : { type: "code" as const, content: artifactDetected.content, language: artifactDetected.language }
    : undefined;

  const mintDecision =
    artifact && !usedExisting
      ? {
          mint: true,
          rarity: rarityFor(trimmedForSolve, result.verified),
          reason: `Build distilled into a reusable skill - stored on 0G, others can run it and you earn royalties.`,
        }
      : shouldMintSkill(trimmedForSolve, result.verified, db.skills());

  let skill: Skill | null = usedExisting ? route.castSkill ?? null : null;
  let rootHash = "";
  let txHash: string | undefined;
  let skillOnchain: unknown = null;

  if (!usedExisting && mintDecision.mint) {
    const record = {
      kind: "grimoire-skill",
      name: deriveName(trimmedForSolve, category),
      description: `A reusable ${category.toLowerCase()} skill distilled from a verified method.`,
      category,
      promptTemplate: trimmedForSolve,
      sampleOutput: displayAnswer.slice(0, 2000),
      creator,
      creatorAddress,
      model: result.model,
      provider: result.provider,
      verified: result.verified,
      rarity: mintDecision.rarity,
      createdAt,
    };

    const up = await uploadJSON(record);
    rootHash = up.rootHash;
    txHash = up.txHash;

    const royaltyPerUse = royaltyForRarity(mintDecision.rarity);
    skill = {
      id: rootHash,
      name: record.name,
      description: record.description,
      category,
      promptTemplate: trimmedForSolve,
      sampleOutput: displayAnswer.slice(0, 2000),
      creator,
      creatorAddress,
      model: result.model,
      provider: result.provider,
      verified: result.verified,
      rarity: mintDecision.rarity,
      uses: 0,
      earnings: 0,
      royaltyPerUse,
      createdAt,
      txHash,
    };
    db.addSkill(skill);

    if (result.verified && !result.simulated) {
      skillOnchain = await registerSkillOnChain(rootHash, royaltyPerUse, creatorAddress);
      // fire-and-forget: also claim this skill on the Marketplace so the
      // creator owns its royalty stream and can list it for sale later.
      claimSkillOnChain(rootHash)
        .then((res) => {
          if (res) db.setSkillMarketTx(rootHash, "claim", res.txHash);
        })
        .catch(() => {});
    }
  }

  const agent = db.getAgent(route.agentId);
  if (agent) {
    await publishMindManifest(agent, db.memories(), db.skills(), db.synapses());
  }

  const quest: Quest = {
    id: questId,
    prompt: trimmedForSolve,
    bounty,
    status: "solved",
    creator,
    agentId: route.agentId,
    answer: displayAnswer,
    skillId: skill?.id ?? route.castSkill?.id,
    usedExisting,
    verified: result.verified,
    rootHash: skill?.id ?? route.castSkill?.id,
    txHash: txHash ?? royaltyTx,
    createdAt,
    firedMemoryIds,
    firedSkillIds,
    reflex: route.reflex,
    mode: detectedMode,
    artifact,
    creditCost,
  };
  db.addQuest(quest);

  return NextResponse.json({
    quest,
    skill,
    skillMinted: !!skill && !usedExisting,
    skillNote: usedExisting
      ? `Ran existing skill "${route.castSkill?.name}" with ${firedMemoryIds.length} memory(s). Royalty paid to creator.`
      : mintDecision.reason,
    spawnedAgent,
    simulated: result.simulated,
    note: result.note,
    firedMemories: route.memories,
    firedSkills: route.contextSkills,
    castSkill: usedExisting ? route.castSkill : null,
    usedSkill: usedExisting ? route.castSkill : null,
    reflex: route.reflex,
    onchain,
    skillOnchain,
    credits: db.getCredits(walletAddress),
    ledger: db.creditLedgerForAddress(walletAddress),
    creditUsed: creditCost,
    artifact,
  });
}
