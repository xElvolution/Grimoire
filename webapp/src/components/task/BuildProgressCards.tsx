"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { id: "plan", label: "Planning layout", detail: "Pages & sections" },
  { id: "hero", label: "Hero section", detail: "Copy, CTA, motion" },
  { id: "landing", label: "Landing page", detail: "Next.js + TypeScript" },
  { id: "motion", label: "Animations", detail: "Framer Motion" },
  { id: "sections", label: "Features & pricing", detail: "Reusable sections" },
  { id: "polish", label: "Final polish", detail: "Responsive & spacing" },
];

/** v0-style progress - advances once, stays on last step (no looping replay). */
export default function BuildProgressCards({
  compact = false,
  panel = false,
}: {
  compact?: boolean;
  panel?: boolean;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
    const t = setInterval(() => {
      setActive((a) => Math.min(a + 1, STEPS.length - 1));
    }, 2800);
    return () => clearInterval(t);
  }, []);

  const step = STEPS[active];

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-[11px] text-ash">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-arcane-bright animate-pulse" />
        <span className="text-parchment">{step.label}</span>
      </div>
    );
  }

  if (panel) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="max-w-sm"
          >
            <p className="text-sm text-parchment font-medium">{step.label}</p>
            <p className="mt-1 text-xs text-ash">{step.detail}</p>
          </motion.div>
        </AnimatePresence>
        <div className="mt-8 flex gap-1.5 w-full max-w-xs">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                i <= active ? "bg-arcane" : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <p className="mt-4 text-[10px] text-ash">Building your site…</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-void/60 px-5 py-4 w-full max-w-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <p className="text-sm text-parchment">{step.label}</p>
          <p className="text-[11px] text-ash mt-0.5">{step.detail}</p>
        </motion.div>
      </AnimatePresence>
      <div className="mt-3 flex gap-1">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= active ? "bg-arcane" : "bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
