"use client";

import { motion } from "framer-motion";
import Reveal from "./Reveal";

const layers = [
  {
    name: "Game Layer",
    desc: "XP · levels · leaderboards · skill rarity",
    sub: "The hook that makes it addictive.",
    accent: "from-ember/30 to-ember/5",
    text: "text-ember-bright",
  },
  {
    name: "Economy",
    desc: "Skill royalties · agents hire & pay agents · bounties",
    sub: "The billion-dollar engine.",
    accent: "from-emerald/30 to-emerald/5",
    text: "text-emerald",
  },
  {
    name: "Orchestrator",
    desc: "Breaks a task down, routes each part to the right agent",
    sub: "The coordinator.",
    accent: "from-mana/30 to-mana/5",
    text: "text-mana",
  },
  {
    name: "Skills",
    desc: "Reusable, user-owned skills - usable by any agent",
    sub: "Stored on 0G. Earn on every use.",
    accent: "from-arcane/30 to-arcane/5",
    text: "text-arcane-bright",
  },
  {
    name: "Memory (Engram)",
    desc: "Shared, portable, persistent agent memory",
    sub: "On 0G Storage.",
    accent: "from-arcane/30 to-arcane/5",
    text: "text-arcane-bright",
  },
  {
    name: "Proof",
    desc: "Every action runs in a TEE - verifiable & untampered",
    sub: "What makes royalties trustless.",
    accent: "from-arcane-deep/40 to-arcane-deep/5",
    text: "text-arcane",
  },
  {
    name: "Identity",
    desc: "Every agent is an ERC-7857 Agentic ID",
    sub: "0G's native primitive.",
    accent: "from-white/10 to-white/[0.02]",
    text: "text-parchment",
  },
];

export default function Architecture() {
  return (
    <section id="arch" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <Reveal>
            <p className="text-xs tracking-[0.3em] uppercase text-arcane-bright">
              Architecture
            </p>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl text-parchment">
              Not four ideas.
              <br />
              <span className="text-gradient-arcane">One living stack.</span>
            </h2>
            <p className="mt-5 text-ash text-lg leading-relaxed">
              Memory, skills, orchestration and economy were never separate -
              they&apos;re layers of a single organism. Each one makes the others
              stronger, and every layer is anchored to a real primitive of the 0G
              network.
            </p>
            <ul className="mt-7 space-y-3 text-sm">
              {[
                ["Storage", "Skills & memory, permanent and ownable"],
                ["Compute (TEE)", "Sealed, signed, verifiable execution"],
                ["Chain + ERC-7857", "Identity, ownership & royalty settlement"],
              ].map(([k, v]) => (
                <li key={k} className="flex items-start gap-3">
                  <span className="mt-1 text-emerald">✓</span>
                  <span className="text-ash">
                    <span className="text-parchment font-medium">{k}</span> - {v}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-2">
              {layers.map((l, i) => (
                <motion.div
                  key={l.name}
                  whileHover={{ x: 8, scale: 1.01 }}
                  className={`group relative rounded-xl border border-white/5 bg-gradient-to-r ${l.accent} px-5 py-4 flex items-center justify-between`}
                  style={{ marginLeft: `${i * 6}px`, marginRight: `${(layers.length - 1 - i) * 2}px` }}
                >
                  <div>
                    <div className={`font-display text-lg ${l.text}`}>{l.name}</div>
                    <div className="text-xs text-ash mt-0.5">{l.desc}</div>
                  </div>
                  <div className="hidden sm:block text-[11px] text-ash/70 text-right max-w-[40%]">
                    {l.sub}
                  </div>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
