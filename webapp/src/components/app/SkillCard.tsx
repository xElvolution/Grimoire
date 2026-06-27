"use client";

import { motion } from "framer-motion";
import type { Skill } from "@/lib/types";
import { RARITY_META } from "@/lib/skills";
import { skillCreatorLabel, skillIsOwnedBy } from "@/lib/skillOwner";
import Counter from "./Counter";

const RARITY_RING: Record<string, string> = {
  common: "border-white/10",
  rare: "border-mana/40",
  epic: "border-arcane/50",
  legendary: "border-ember/50 glow-ember",
};

export default function SkillCard({
  skill,
  onCast,
  casting,
  viewerAddress,
}: {
  skill: Skill;
  onCast: (id: string) => void;
  casting: boolean;
  viewerAddress?: string | null;
}) {
  const rarity = RARITY_META[skill.rarity];
  const owned = skillIsOwnedBy(skill, viewerAddress);

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      className={`relative rounded-2xl border bg-obsidian/40 p-5 ${RARITY_RING[skill.rarity]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-mono uppercase tracking-wider ${rarity.color}`}>
              {rarity.label}
            </span>
            <span className="text-ash/40">·</span>
            <span className="text-[11px] text-ash">{skill.category}</span>
          </div>
          <h3 className="mt-1 font-display text-lg text-parchment truncate">{skill.name}</h3>
        </div>
        {skill.verified ? (
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald/10 border border-emerald/30 px-2 py-0.5 text-[10px] text-emerald">
            ✓ TEE
          </span>
        ) : (
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-ash">
            sim
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-ash line-clamp-2">{skill.description}</p>

      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div>
            <div className="font-mono text-parchment">
              <Counter value={skill.uses} />
            </div>
            <div className="text-[10px] text-ash">uses</div>
          </div>
          <div>
            <div className="font-mono text-ember-bright">
              <Counter value={skill.earnings} decimals={3} suffix=" 0G" />
            </div>
            <div className="text-[10px] text-ash">
              earned by {skillCreatorLabel(skill, viewerAddress)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="font-mono text-[10px] text-ash/60 truncate max-w-[55%]">
          {skill.creatorAddress
            ? skill.creatorAddress.slice(0, 10) + "…" + skill.creatorAddress.slice(-4)
            : skill.id.slice(0, 10) + "…"}
        </span>
        <button
          onClick={() => onCast(skill.id)}
          disabled={casting}
          className="rounded-lg bg-gradient-to-r from-arcane to-arcane-deep px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 transition"
        >
          {casting ? "Casting…" : `Cast (+${skill.royaltyPerUse} 0G)`}
        </button>
      </div>

      {owned && (
        <span className="mt-2 inline-block rounded-full bg-ember/10 border border-ember/30 px-2 py-0.5 text-[9px] text-ember-bright">
          your skill
        </span>
      )}
    </motion.div>
  );
}
