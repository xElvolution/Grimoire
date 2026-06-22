"use client";

import { motion } from "framer-motion";

const links = [
  { label: "The Loop", href: "#loop" },
  { label: "Architecture", href: "#arch" },
  { label: "Economy", href: "#economy" },
  { label: "0G", href: "#zerog" },
];

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <nav className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5 group">
          <span className="relative grid place-items-center w-9 h-9 rounded-lg glass glow-arcane">
            <span className="text-ember-bright text-lg font-display">✦</span>
          </span>
          <span className="font-display text-xl tracking-wide text-parchment group-hover:text-glow-arcane transition">
            Grimoire
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-ash">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hover:text-parchment transition relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-arcane hover:after:w-full after:transition-all"
            >
              {l.label}
            </a>
          ))}
        </div>

        <a
          href="#cta"
          className="rounded-lg px-4 py-2 text-sm font-medium glass rune-border text-parchment hover:glow-arcane transition"
        >
          Launch app
        </a>
      </nav>
    </motion.header>
  );
}
