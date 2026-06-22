"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Agent } from "@/lib/types";
import { postQuest, type QuestResponse } from "@/lib/client";

const STEPS = [
  "Routing task to agent…",
  "Running inside 0G Compute (TEE)…",
  "Verifying the response…",
  "Minting skill to 0G Storage…",
  "Done.",
];

const EXAMPLES = [
  "Summarize the top 3 risks in a DeFi lending protocol",
  "Write a cold outreach email to a crypto VC",
  "Draft a function that debounces an async call in TypeScript",
  "Compare three L1s for an AI agent app",
];

export default function QuestComposer({
  agents,
  onSolved,
}: {
  agents: Agent[];
  onSolved: () => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [agentId, setAgentId] = useState(agents[0]?.id ?? "arden");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<QuestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) return;
    setStep(0);
    const id = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 2)), 700);
    return () => clearInterval(id);
  }, [loading]);

  async function submit() {
    if (prompt.trim().length < 4) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await postQuest(prompt, 0, agentId);
      setStep(STEPS.length - 1);
      setResult(res);
      onSolved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl glass rune-border p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-parchment">Post a task</h2>
        <span className="text-[11px] text-ash">an agent solves it · a skill is born</span>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe a task. The agent that solves it creates a reusable skill you own…"
        rows={3}
        className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-void/60 px-4 py-3 text-sm text-parchment outline-none transition placeholder:text-ash/40 focus:border-arcane/60"
      />

      <div className="mt-2 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => setPrompt(ex)}
            className="rounded-full border border-white/5 bg-white/[0.02] px-2.5 py-1 text-[11px] text-ash hover:text-parchment hover:border-arcane/40 transition"
          >
            {ex}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs text-ash">
          Agent
          <select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="rounded-lg border border-white/10 bg-void/60 px-2 py-1.5 text-parchment outline-none"
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.avatar} {a.name} · Lv{a.level}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={submit}
          disabled={loading || prompt.trim().length < 4}
          className="rounded-xl bg-gradient-to-r from-ember-bright to-ember px-6 py-2.5 text-sm font-medium text-void hover:scale-[1.02] disabled:opacity-50 transition"
        >
          {loading ? "Solving…" : "Solve & create skill"}
        </button>
      </div>

      {/* live solving steps */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-1.5 overflow-hidden"
          >
            {STEPS.slice(0, -1).map((s, i) => (
              <div
                key={s}
                className={`flex items-center gap-2 text-xs ${
                  i <= step ? "text-parchment" : "text-ash/30"
                }`}
              >
                <span className={i < step ? "text-emerald" : "text-arcane-bright"}>
                  {i < step ? "✓" : i === step ? "◌" : "·"}
                </span>
                {s}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-white/10 bg-void/50 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-parchment">
                {result.skill.name}
              </span>
              {result.skill.verified ? (
                <span className="rounded-full bg-emerald/10 border border-emerald/30 px-2 py-0.5 text-[10px] text-emerald">
                  ✓ Verified in TEE
                </span>
              ) : (
                <span className="rounded-full bg-ember/10 border border-ember/30 px-2 py-0.5 text-[10px] text-ember-bright">
                  Simulated
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-ash line-clamp-3">{result.skill.sampleOutput}</p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-ash/70 font-mono">
              <span>0G Storage: {result.quest.rootHash?.slice(0, 14)}…</span>
              <span className="text-arcane-bright">minted to {result.skill.creator}</span>
            </div>
            {result.note && (
              <p className="mt-2 text-[11px] text-ember-bright/80">{result.note}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-3 text-xs text-blood">{error}</p>}
    </div>
  );
}
