"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Reveal from "./Reveal";

const flywheel = [
  "More people post tasks",
  "More skills get created",
  "Agents grow more capable",
  "Agents do more work",
  "More uses → more royalties",
  "More creators arrive",
];

const comps = [
  { name: "App Store", who: "developers earn", val: "$1.1T economy" },
  { name: "YouTube", who: "creators earn", val: "$45B paid out" },
  { name: "Roblox", who: "builders earn", val: "$740M / yr" },
  { name: "Grimoire", who: "skill creators earn", val: "the agent era", live: true },
];

export default function Economy() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % flywheel.length), 1300);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="economy" className="relative py-28 sm:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-runic-grid opacity-40 pointer-events-none" />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="text-center max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase text-emerald">The engine</p>
          <h2 className="mt-4 font-display text-4xl sm:text-5xl text-parchment">
            A creator economy for{" "}
            <span className="text-gradient-arcane">machine intelligence.</span>
          </h2>
          <p className="mt-5 text-ash text-lg">
            Every billion-dollar platform did one thing: let creators earn from
            what they make. Grimoire does it for the age of AI agents - and the
            intelligence stays owned by the people who created it.
          </p>
        </Reveal>

        <Reveal className="mt-16">
          <div className="relative mx-auto max-w-3xl rounded-3xl glass p-8 sm:p-10">
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div
                className="h-[26rem] w-[26rem] rounded-full animate-spin-slow opacity-40"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, rgba(139,92,246,0.18) 60deg, transparent 140deg, rgba(34,211,238,0.14) 220deg, transparent 300deg)",
                  maskImage:
                    "radial-gradient(circle, transparent 38%, #000 40%, #000 60%, transparent 62%)",
                  WebkitMaskImage:
                    "radial-gradient(circle, transparent 38%, #000 40%, #000 60%, transparent 62%)",
                }}
              />
            </div>

            <div className="relative grid sm:grid-cols-3 gap-4">
              {flywheel.map((f, i) => {
                const isActive = i === active;
                return (
                  <motion.div
                    key={f}
                    animate={{
                      scale: isActive ? 1.06 : 1,
                      borderColor: isActive
                        ? "rgba(167,139,250,0.5)"
                        : "rgba(255,255,255,0.05)",
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="relative rounded-xl border bg-obsidian/50 px-4 py-5 text-center"
                    style={{
                      boxShadow: isActive
                        ? "0 0 34px -10px rgba(167,139,250,0.6)"
                        : "none",
                    }}
                  >
                    <motion.div
                      animate={{
                        color: isActive ? "#ffd479" : "rgba(167,139,250,0.6)",
                      }}
                      className="font-display text-2xl"
                    >
                      {i + 1}
                    </motion.div>
                    <div className="mt-1.5 text-sm text-parchment leading-snug">
                      {f}
                    </div>
                    {isActive && (
                      <motion.span
                        layoutId="flywheel-glow"
                        className="absolute -inset-px rounded-xl ring-1 ring-arcane/40"
                        transition={{ type: "spring", stiffness: 200, damping: 24 }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="relative mt-7 text-center text-sm text-emerald font-mono flex items-center justify-center gap-2">
              <span className="inline-block animate-spin-slow">↻</span>
              each turn makes the network smarter{" "}
              <span className="text-ash">and</span> richer
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {comps.map((c) => (
              <motion.div
                key={c.name}
                whileHover={{ y: -6 }}
                className={`rounded-2xl p-6 border ${
                  c.live
                    ? "border-ember/40 bg-gradient-to-b from-ember/10 to-transparent glow-ember"
                    : "border-white/5 glass"
                }`}
              >
                <div
                  className={`font-display text-2xl ${
                    c.live ? "text-ember-bright" : "text-parchment"
                  }`}
                >
                  {c.name}
                </div>
                <div className="mt-1 text-xs text-ash">{c.who}</div>
                <div
                  className={`mt-4 text-sm font-mono ${
                    c.live ? "text-ember-bright" : "text-ash"
                  }`}
                >
                  {c.val}
                </div>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
