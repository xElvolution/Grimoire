"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGrimoireWallet } from "@/lib/wallet";
import type { Agent } from "@/lib/types";
import { postQuest, type QuestResponse } from "@/lib/client";

const STEPS = [
  "Routing task to agent…",
  "Running inside 0G Compute (TEE)…",
  "Verifying the response…",
  "Evaluating if a skill should be minted…",
  "Done.",
];

const EXAMPLES = [
  "Summarize the top 3 risks in a DeFi lending protocol with verifiable attestation criteria",
  "Design a reusable framework for comparing L1 chains for AI agent deployments",
  "Draft a production-grade TypeScript debounce utility with typed async cancellation",
  "Compare three L1s for an AI agent app with TEE, storage, and fee tradeoffs",
];

export default function QuestComposer({
  agents,
  onSolved,
  walletConnected = false,
}: {
  agents: Agent[];
  onSolved: () => void;
  walletConnected?: boolean;
}) {
  const { address } = useGrimoireWallet();
  const [prompt, setPrompt] = useState("");
  const [agentId, setAgentId] = useState("auto");
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
    if (!walletConnected || !address) return;
    if (prompt.trim().length < 4) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await postQuest(prompt, 0, agentId, address);
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
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl text-parchment">Post a task</h2>
        <span className="text-[11px] text-ash text-right">
          {walletConnected && address
            ? "answer always · skill only if reusable"
            : "sign in to post tasks"}
        </span>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe a substantial task. You always get an answer - a skill is minted only if the method is unique and reusable."
        rows={3}
        className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-void/60 px-4 py-3 text-sm text-parchment outline-none transition placeholder:text-ash/40 focus:border-arcane/60"
      />

      <div className="mt-2 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setPrompt(ex)}
            className="rounded-full border border-white/5 bg-white/[0.02] px-2.5 py-1 text-[11px] text-ash hover:text-parchment hover:border-arcane/40 transition text-left"
          >
            {ex.length > 52 ? ex.slice(0, 52) + "…" : ex}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs text-ash">
          Agent
          <select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="rounded-lg border border-white/10 bg-void/60 px-2 py-1.5 text-parchment outline-none"
          >
            <option value="auto">✨ Auto - orchestrator routes / spawns</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.avatar} {a.name} · {a.specialty} · Lv{a.level}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={submit}
          disabled={loading || !walletConnected || prompt.trim().length < 4}
          className="rounded-xl bg-gradient-to-r from-ember-bright to-ember px-6 py-2.5 text-sm font-medium text-void hover:scale-[1.02] disabled:opacity-50 transition"
        >
          {!walletConnected ? "Sign in first" : loading ? "Solving…" : "Solve task"}
        </button>
      </div>

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

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-white/10 bg-void/50 p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-parchment">Answer</span>
              {result.quest.verified ? (
                <span className="rounded-full bg-emerald/10 border border-emerald/30 px-2 py-0.5 text-[10px] text-emerald">
                  ✓ TEE
                </span>
              ) : (
                <span className="rounded-full bg-ember/10 border border-ember/30 px-2 py-0.5 text-[10px] text-ember-bright">
                  sim
                </span>
              )}
            </div>
            <p className="text-sm text-ash whitespace-pre-wrap">{result.quest.answer}</p>

            {result.skill ? (
              <div className="rounded-lg border border-ember/30 bg-ember/5 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ember-bright font-medium">
                    ✦ Skill minted: {result.skill.name}
                  </span>
                  <span className="text-[10px] text-ash uppercase">{result.skill.rarity}</span>
                </div>
                <p className="mt-1 text-[11px] text-ash">{result.skillNote}</p>
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                <span className="text-xs text-ash">No skill minted</span>
                <p className="mt-1 text-[11px] text-ash/80">{result.skillNote}</p>
              </div>
            )}

            {result.spawnedAgent && (
              <div className="rounded-lg border border-mana/30 bg-mana/5 px-3 py-2 text-xs">
                <span className="text-mana">⌬ New agent spawned</span>{" "}
                <span className="text-parchment">{result.spawnedAgent.name}</span>
                <span className="text-ash"> · {result.spawnedAgent.specialty}</span>
              </div>
            )}

            {result.reflex && (
              <div className="text-[11px] text-ash">
                Spinal reflex: <span className="text-mana">{result.reflex}</span>
              </div>
            )}

            {result.firedMemories && result.firedMemories.length > 0 && (
              <div className="rounded-lg border border-cyan/30 bg-cyan/5 px-3 py-2">
                <div className="text-xs text-cyan-300 font-medium">
                  ⚡ {result.firedMemories.length} memory neuron(s) fired
                </div>
                <ul className="mt-1 space-y-0.5 text-[11px] text-ash">
                  {result.firedMemories.map((m) => (
                    <li key={m.id}>
                      [{m.kind ?? "memory"}] {m.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.castSkill && (
              <div className="rounded-lg border border-ember/20 bg-ember/5 px-3 py-2 text-xs text-ember-bright">
                Cast implicit skill: {result.castSkill.name}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-3 text-xs text-blood">{error}</p>}
    </div>
  );
}
