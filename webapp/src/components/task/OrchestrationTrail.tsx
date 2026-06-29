"use client";

import type { QuestResponse } from "@/lib/client";
import type { Quest } from "@/lib/types";
import Link from "next/link";
import { REFLEX_LABEL } from "@/lib/reflexLabels";

type Step = { label: string; detail?: string; tone?: "done" | "active" | "muted" };

const DIRECT_LABEL: Record<string, string> = {
  balance: "Wallet balance lookup",
  earnings: "Royalty earnings lookup",
  "my-skills": "Your skills in Library",
  "trade-info": "Trade / DeFi routing",
};

function buildSteps(quest: Quest, meta: QuestResponse): Step[] {
  const steps: Step[] = [];

  steps.push({
    label: "Task received",
    detail: quest.prompt.slice(0, 80) + (quest.prompt.length > 80 ? "…" : ""),
    tone: "done",
  });

  if (meta.reflex) {
    steps.push({
      label: REFLEX_LABEL[meta.reflex] ?? meta.reflex.replace(/-/g, " "),
      tone: "done",
    });
  }

  if (meta.directTask) {
    steps.push({
      label: DIRECT_LABEL[meta.directTask] ?? "Wallet action",
      detail: "Live chain + app ledger",
      tone: "active",
    });
    return steps;
  }

  if (meta.firedMemories?.length) {
    steps.push({
      label: `Memory × ${meta.firedMemories.length}`,
      detail: meta.firedMemories.map((m) => m.label).join(", "),
      tone: "done",
    });
  }

  const reused = meta.usedSkill ?? meta.castSkill;
  if (reused) {
    steps.push({
      label: `Ran skill: ${reused.name}`,
      detail: "Paid royalty to creator · method reused from Library",
      tone: "active",
    });
  } else if (meta.firedSkills?.length) {
    steps.push({
      label: "Similar skills consulted",
      detail: meta.firedSkills.map((s) => s.name).join(", "),
      tone: "muted",
    });
  }

  if (!reused) {
    steps.push({
      label: quest.verified ? "Solved in 0G Compute (TEE)" : "Solved on 0G Compute",
      detail: quest.verified ? "Cryptographically verified inference" : "Inference completed",
      tone: "done",
    });
  }

  if (meta.skillMinted && meta.skill) {
    steps.push({
      label: `New skill learned: ${meta.skill.name}`,
      detail: "Stored on 0G Storage · others can run it · you earn royalties",
      tone: "active",
    });
  } else if (meta.skillNote && !reused) {
    steps.push({
      label: "Skill distillation",
      detail: meta.skillNote,
      tone: "muted",
    });
  }

  return steps;
}

export default function OrchestrationTrail({
  quest,
  meta,
  agentName,
}: {
  quest: Quest;
  meta: QuestResponse;
  agentName?: string;
}) {
  const steps = buildSteps(quest, meta);

  return (
    <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-parchment">How Grimoire solved this</span>
        {agentName && <span className="text-[10px] text-ash">{agentName}</span>}
      </div>
      <ol className="px-3 py-2 space-y-2">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-2 text-[11px]">
            <span
              className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                step.tone === "active"
                  ? "bg-mana"
                  : step.tone === "muted"
                    ? "bg-ash/40"
                    : "bg-emerald"
              }`}
            />
            <div className="min-w-0">
              <div className="text-parchment">{step.label}</div>
              {step.detail && <div className="text-ash mt-0.5 leading-snug">{step.detail}</div>}
            </div>
          </li>
        ))}
      </ol>
      {meta.skillMinted && meta.skill && (
        <div className="px-3 py-2 border-t border-white/10 flex gap-3 text-[10px]">
          <Link href="/library" className="text-mana hover:underline">
            View in Library →
          </Link>
          <Link href="/market" className="text-ash hover:text-parchment">
            List on Market
          </Link>
        </div>
      )}
    </div>
  );
}
