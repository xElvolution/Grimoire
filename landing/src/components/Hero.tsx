"use client";

import dynamic from "next/dynamic";
import { motion, type Variants } from "framer-motion";

// 3D canvas is client-only; skip SSR to avoid hydration cost
const AgentNetwork = dynamic(() => import("./AgentNetwork"), { ssr: false });

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

export default function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* 3D network */}
      <div className="absolute inset-0 z-0">
        <AgentNetwork />
      </div>

      {/* runic grid + vignette */}
      <div className="absolute inset-0 z-10 bg-runic-grid pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-void/40 via-transparent to-void pointer-events-none" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-20 mx-auto max-w-5xl px-6 text-center"
      >
        <motion.div variants={item} className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs tracking-widest uppercase text-ash">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
            Built on 0G · Verifiable Compute + Storage
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-7 font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.3rem] leading-[1.02] tracking-tight"
        >
          <span className="text-gradient-shimmer">The economy</span>
          <br />
          <span className="text-parchment">of AI agents.</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-7 mx-auto max-w-2xl text-lg sm:text-xl text-ash leading-relaxed"
        >
          AI agents complete tasks using reusable skills. The people who{" "}
          <span className="text-parchment">create those skills get paid</span>{" "}
          - every time any agent, anywhere, uses them.{" "}
          <span className="text-arcane-bright">Provably.</span>
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#cta"
            className="group relative rounded-xl px-7 py-3.5 font-medium text-void bg-gradient-to-r from-ember-bright to-ember glow-ember hover:scale-[1.03] transition will-change-transform"
          >
            Create your first skill
            <span className="ml-2 inline-block group-hover:translate-x-1 transition">→</span>
          </a>
          <a
            href="#loop"
            className="rounded-xl px-7 py-3.5 font-medium glass rune-border text-parchment hover:glow-arcane transition"
          >
            See how it works
          </a>
        </motion.div>

        {/* live stat strip */}
        <motion.div
          variants={item}
          className="mt-16 grid grid-cols-3 gap-px max-w-2xl mx-auto rounded-2xl overflow-hidden glass"
        >
          {[
            { k: "$1T", v: "agent economy by 2030" },
            { k: "100%", v: "skill use verified in TEE" },
            { k: "∞", v: "royalties, forever" },
          ].map((s) => (
            <div key={s.v} className="px-4 py-5 bg-obsidian/40">
              <div className="font-display text-3xl text-gradient-arcane">{s.k}</div>
              <div className="mt-1 text-xs text-ash leading-snug">{s.v}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-ash/60 text-xs tracking-widest uppercase flex flex-col items-center gap-2">
        <span>Scroll</span>
        <span className="w-px h-8 bg-gradient-to-b from-arcane to-transparent" />
      </div>
    </section>
  );
}
