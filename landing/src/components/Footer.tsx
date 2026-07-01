"use client";

import { motion } from "framer-motion";
import LogoMark from "./LogoMark";
import { DOCS_URL } from "@/lib/links";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "#loop" },
      { label: "Architecture", href: "#arch" },
      { label: "The economy", href: "#economy" },
      { label: "Launch app", href: "#cta" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "SDK", href: `${DOCS_URL}sdk/installation` },
      { label: "Documentation", href: DOCS_URL },
      { label: "Smart contracts", href: `${DOCS_URL}contracts/` },
      { label: "ERC-7857", href: `${DOCS_URL}concepts/skills` },
    ],
  },
  {
    title: "0G Network",
    links: [
      { label: "0G Compute", href: "https://0g.ai" },
      { label: "0G Storage", href: "https://0g.ai" },
      { label: "0G Chain", href: "https://0g.ai" },
      { label: "Zero Cup", href: "#" },
    ],
  },
];

const socials = [
  {
    label: "X",
    href: "#",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z",
  },
  {
    label: "GitHub",
    href: "#",
    path: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.523 2 12 2Z",
  },
  {
    label: "Discord",
    href: "#",
    path: "M20.317 4.369A19.79 19.79 0 0 0 15.885 3c-.213.382-.46.898-.63 1.307a18.27 18.27 0 0 0-5.51 0A12.6 12.6 0 0 0 9.105 3a19.74 19.74 0 0 0-4.435 1.369C1.86 8.59 1.094 12.7 1.476 16.752a19.9 19.9 0 0 0 6.075 3.078c.49-.669.927-1.38 1.304-2.127a12.93 12.93 0 0 1-2.053-.985c.172-.127.34-.26.503-.397a14.2 14.2 0 0 0 12.39 0c.164.14.332.27.503.397-.656.39-1.345.72-2.056.986.377.746.813 1.457 1.304 2.126a19.84 19.84 0 0 0 6.078-3.078c.448-4.694-.766-8.766-3.207-12.383ZM8.02 14.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.955-2.42 2.157-2.42 1.21 0 2.176 1.095 2.157 2.42 0 1.334-.956 2.42-2.157 2.42Zm7.96 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.42 2.157-2.42 1.21 0 2.176 1.095 2.157 2.42 0 1.334-.946 2.42-2.157 2.42Z",
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-10 overflow-hidden border-t hairline">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[60rem] -translate-x-1/2 rounded-full bg-arcane/10 blur-[100px]" />
      <div className="pointer-events-none absolute inset-0 bg-runic-grid opacity-30" />

      <div className="pointer-events-none relative select-none overflow-hidden">
        <div className="font-display text-[16vw] leading-none text-white/[0.02] text-center pt-10">
          GRIMOIRE
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-4">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2.5">
              <LogoMark size={36} />
              <span className="font-display text-2xl text-parchment">Grimoire</span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ash">
              The verifiable economy of AI agents. Create a skill once and earn a
              royalty every time any agent uses it - provably, on 0G.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-7 flex max-w-sm items-center gap-2"
            >
              <div className="group relative flex-1">
                <input
                  type="email"
                  required
                  placeholder="you@email.com"
                  className="w-full rounded-lg border border-white/10 bg-void/60 px-4 py-2.5 text-sm text-parchment outline-none transition placeholder:text-ash/50 focus:border-arcane/60 focus:bg-void"
                />
                <span className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition group-focus-within:opacity-100 group-focus-within:glow-arcane" />
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-lg bg-gradient-to-r from-ember-bright to-ember px-4 py-2.5 text-sm font-medium text-void"
              >
                Notify me
              </motion.button>
            </form>
            <p className="mt-2.5 text-xs text-ash/50">
              Updates on the launch. No spam, ever.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-ash/70">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="group inline-flex items-center text-sm text-ash transition hover:text-parchment"
                      >
                        <span className="relative">
                          {l.label}
                          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-arcane transition-all duration-300 group-hover:w-full" />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-arcane/20 to-transparent" />

        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-ash">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
              </span>
              Live on 0G Testnet
            </span>
            <span className="hidden text-xs text-ash/50 sm:inline">
              © {new Date().getFullYear()} Grimoire · Built for the Zero Cup
            </span>
          </div>

          <div className="flex items-center gap-3">
            {socials.map((s) => (
              <motion.a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                whileHover={{ y: -3 }}
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-void/60 text-ash transition hover:border-arcane/60 hover:text-parchment"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d={s.path} />
                </svg>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
