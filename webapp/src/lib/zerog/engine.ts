/**
 * Inference engine: always tries REAL 0G Compute (TEE) first.
 * If the wallet isn't funded yet / no provider is up, and simulation is allowed,
 * it falls back to a clearly-labeled simulated result (verified:false, simulated:true)
 * so the economy loop is demoable. The moment the wallet is funded, it goes live
 * automatically - no code change. Set GRIMOIRE_SIMULATE=0 to force real-only.
 */

import { extractTaskPrompt } from "@/lib/orchestrator";
import { runInference } from "./compute";

export type SolveResult = {
  answer: string;
  model: string;
  provider: string;
  verified: boolean;
  chatID?: string;
  simulated: boolean;
  note?: string;
};

const ALLOW_SIM = process.env.GRIMOIRE_SIMULATE !== "0";

export async function solve(prompt: string): Promise<SolveResult> {
  try {
    const r = await runInference(prompt);
    return { ...r };
  } catch (e) {
    if (!ALLOW_SIM) throw e;
    return simulate(prompt, (e as Error).message);
  }
}

function simulate(prompt: string, reason: string): SolveResult {
  if (isBuildPrompt(prompt)) {
    return simulateBuild(prompt, reason);
  }
  const trimmed = extractTaskPrompt(prompt).replace(/\s+/g, " ");
  const answer =
    `Approach: break the task into clear sub-steps, apply the relevant method, ` +
    `and return a structured result.\n\nFor "${trimmed.slice(0, 120)}${
      trimmed.length > 120 ? "…" : ""
    }", the method yields a concise, reusable solution that another agent can replay ` +
    `on similar inputs.`;
  return {
    answer,
    model: "grimoire-sim",
    provider: "simulated",
    verified: false,
    simulated: true,
    note: `Simulated - fund the wallet at faucet.0g.ai to run on 0G Compute (TEE). (${reason.slice(0, 80)})`,
  };
}

function isBuildPrompt(prompt: string): boolean {
  return (
    prompt.includes("file:app/page.tsx") ||
    prompt.includes("Next.js 15 App Router") ||
    /^Build:\s/i.test(extractTaskPrompt(prompt))
  );
}

function simulateBuild(prompt: string, reason: string): SolveResult {
  const topic = extractTaskPrompt(prompt)
    .replace(/^Build:\s*/i, "")
    .replace(/^Update this Next\.js site\. Change request:\s*/i, "")
    .slice(0, 80)
    .trim() || "your product";

  const isGaming = /game|gaming|esports|play/i.test(topic);

  const headline = isGaming
    ? "Level Up Your Game"
    : topic.charAt(0).toUpperCase() + topic.slice(1);

  const sub = isGaming
    ? "Epic battles. Neon worlds. Play without limits."
    : "Built with Next.js, Tailwind, and Framer Motion.";

  const answer = `\`\`\`tsx file:app/page.tsx
"use client";

import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import PricingSection from "../components/PricingSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
\`\`\`

\`\`\`tsx file:app/layout.tsx
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-zinc-950 text-zinc-100">{children}</body>
    </html>
  );
}
\`\`\`

\`\`\`css file:app/globals.css
@import "tailwindcss";
\`\`\`

\`\`\`tsx file:components/HeroSection.tsx
"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-zinc-950 to-cyan-500/10" />
      <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-violet-600/30 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-4xl text-center"
      >
        <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
          ${isGaming ? "Next-gen gaming" : "Grimoire build"}
        </p>
        <h1 className="mt-4 font-bold text-5xl sm:text-7xl tracking-tight bg-gradient-to-r from-white via-violet-200 to-cyan-300 bg-clip-text text-transparent">
          ${headline}
        </h1>
        <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto">${sub}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-full bg-violet-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30"
          >
            ${isGaming ? "Play now" : "Get started"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            className="rounded-full border border-zinc-700 px-8 py-3 text-sm font-semibold text-zinc-300"
          >
            Learn more
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}
\`\`\`

\`\`\`tsx file:components/FeaturesSection.tsx
"use client";

import { motion } from "framer-motion";

const FEATURES = [
  { title: "${isGaming ? "Cross-platform" : "Fast"}", desc: "${isGaming ? "Play on any device, anywhere." : "Optimized performance out of the box."}" },
  { title: "${isGaming ? "Ranked modes" : "Secure"}", desc: "${isGaming ? "Compete in seasonal ladders." : "Built with modern best practices."}" },
  { title: "${isGaming ? "Live events" : "Scalable"}", desc: "${isGaming ? "Weekly tournaments and rewards." : "Grows with your audience."}" },
];

export default function FeaturesSection() {
  return (
    <section className="px-6 py-20 border-t border-zinc-800">
      <div className="mx-auto max-w-5xl grid gap-6 sm:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-violet-500/40 transition"
          >
            <h3 className="text-lg font-semibold text-white">{f.title}</h3>
            <p className="mt-2 text-sm text-zinc-400">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
\`\`\`

\`\`\`tsx file:components/PricingSection.tsx
"use client";

import { motion } from "framer-motion";

export default function PricingSection() {
  return (
    <section className="px-6 py-20 border-t border-zinc-800">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mx-auto max-w-md rounded-2xl border border-violet-500/30 bg-zinc-900/80 p-8 text-center"
      >
        <p className="text-sm text-violet-400 font-medium">Pro</p>
        <p className="mt-2 text-4xl font-bold text-white">$12<span className="text-lg text-zinc-500">/mo</span></p>
        <p className="mt-4 text-sm text-zinc-400">Everything you need to launch.</p>
        <button className="mt-6 w-full rounded-full bg-violet-600 py-3 text-sm font-semibold text-white">
          Start free trial
        </button>
      </motion.div>
    </section>
  );
}
\`\`\`

\`\`\`tsx file:components/Footer.tsx
export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 px-6 py-8 text-center text-sm text-zinc-500">
      © ${new Date().getFullYear()} Grimoire · Built on 0G
    </footer>
  );
}
\`\`\`

\`\`\`json file:package.json
{
  "name": "grimoire-site",
  "private": true,
  "scripts": { "dev": "next dev", "build": "next build", "start": "next start" },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "framer-motion": "^12.0.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/react": "^19",
    "@types/node": "^20",
    "tailwindcss": "^4"
  }
}
\`\`\``;

  return {
    answer,
    model: "grimoire-sim-build",
    provider: "simulated",
    verified: false,
    simulated: true,
    note: `Simulated build preview - fund the wallet at faucet.0g.ai for real TEE generation. (${reason.slice(0, 60)})`,
  };
}
