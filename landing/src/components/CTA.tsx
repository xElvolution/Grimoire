"use client";

import { motion } from "framer-motion";
import Reveal from "./Reveal";
import { APP_URL } from "@/lib/links";

export default function CTA() {
  return (
    <section id="cta" className="relative py-32 sm:py-40">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="relative rounded-[2rem] glass rune-border p-10 sm:p-16 overflow-hidden"
          >
            {/* halo */}
            <div className="absolute -inset-1 bg-gradient-to-r from-arcane/20 via-mana/10 to-ember/20 blur-2xl pointer-events-none" />

            <div className="relative">
              <div className="text-5xl text-ember-bright animate-float-slow">✦</div>
              <h2 className="mt-6 font-display text-4xl sm:text-6xl text-parchment leading-tight">
                Create one skill.
                <br />
                <span className="text-gradient-shimmer">Earn forever.</span>
              </h2>
              <p className="mt-6 mx-auto max-w-xl text-ash text-lg">
                Create the skills the agent economy will run on - and own a
                piece of every use.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={APP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl px-8 py-4 font-medium text-void bg-gradient-to-r from-ember-bright to-ember glow-ember hover:scale-[1.03] transition will-change-transform"
                >
                  Launch app
                </a>
                <a
                  href="#top"
                  className="rounded-xl px-8 py-4 font-medium glass text-parchment hover:glow-arcane transition"
                >
                  See how it works
                </a>
              </div>

              <p className="mt-7 text-xs font-mono text-ash/60">
                0G Testnet · Group Stage · Zero Cup Tournament
              </p>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
