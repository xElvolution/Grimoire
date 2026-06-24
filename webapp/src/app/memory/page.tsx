"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Nav from "@/components/app/Nav";
import {
  fetchMemory,
  writeMemory,
  setMemoryAccess,
  type MemoryState,
} from "@/lib/client";

export default function MemoryPage() {
  const [state, setState] = useState<MemoryState | null>(null);
  const [agentId, setAgentId] = useState("arden");
  const [label, setLabel] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const s = await fetchMemory();
      setState(s);
      if (s.agents[0] && !s.agents.find((a) => a.id === agentId)) {
        setAgentId(s.agents[0].id);
      }
    } catch {
      /* ignore */
    }
  }, [agentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function save() {
    if (content.trim().length < 3) return;
    setSaving(true);
    try {
      await writeMemory(agentId, label, content);
      setLabel("");
      setContent("");
      await refresh();
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  async function toggle(id: string, agent: string, granted: boolean) {
    try {
      await setMemoryAccess(id, agent, granted);
      await refresh();
    } catch {
      /* ignore */
    }
  }

  const agents = state?.agents ?? [];
  const agentName = (id: string) => agents.find((a) => a.id === id)?.name ?? id;

  return (
    <div className="min-h-screen bg-runic-grid">
      <Nav />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <h1 className="font-display text-3xl text-parchment">Engram - agent memory</h1>
        <p className="mt-1 text-sm text-ash">
          Persistent, portable, verifiable memory on 0G Storage. You own it - and you
          control who can read it. Revoke an agent and it forgets.
        </p>

        {/* write memory */}
        <div className="mt-6 rounded-2xl glass rune-border p-6">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-ash">
              Agent
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="rounded-lg border border-white/10 bg-void/60 px-2 py-1.5 text-parchment outline-none"
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.avatar} {a.name}
                  </option>
                ))}
              </select>
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="label (e.g. user preferences)"
              className="flex-1 min-w-[10rem] rounded-lg border border-white/10 bg-void/60 px-3 py-1.5 text-sm text-parchment outline-none placeholder:text-ash/40 focus:border-arcane/60"
            />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="What should this agent remember? (stored permanently on 0G)"
            className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-void/60 px-4 py-3 text-sm text-parchment outline-none placeholder:text-ash/40 focus:border-arcane/60"
          />
          <div className="mt-3 flex justify-end">
            <button
              onClick={save}
              disabled={saving || content.trim().length < 3}
              className="rounded-xl bg-gradient-to-r from-ember-bright to-ember px-6 py-2.5 text-sm font-medium text-void hover:scale-[1.02] disabled:opacity-50 transition"
            >
              {saving ? "Writing to 0G…" : "Commit to memory"}
            </button>
          </div>
        </div>

        {/* memory list */}
        <div className="mt-8 space-y-4">
          {state?.memories.length === 0 && (
            <div className="rounded-2xl glass p-12 text-center text-sm text-ash">
              No memories yet. Commit one above - it&apos;s written to 0G Storage and
              owned by the agent.
            </div>
          )}
          <AnimatePresence initial={false}>
            {state?.memories.map((m) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl glass p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg text-parchment">
                        {m.label}
                      </span>
                      {m.verified ? (
                        <span className="rounded-full bg-emerald/10 border border-emerald/30 px-2 py-0.5 text-[10px] text-emerald">
                          ✓ on 0G
                        </span>
                      ) : (
                        <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-ash">
                          local
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-ash">
                      owned by {agentName(m.agentId)}
                    </div>
                  </div>
                  {m.txHash && (
                    <a
                      href={`https://chainscan-galileo.0g.ai/tx/${m.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-[10px] text-mana hover:underline"
                    >
                      tx ↗
                    </a>
                  )}
                </div>

                <p className="mt-2 text-sm text-ash">{m.content}</p>

                <div className="mt-3 font-mono text-[10px] text-ash/50">
                  0G: {m.id.slice(0, 18)}…{m.id.slice(-6)}
                </div>

                {/* access control */}
                <div className="mt-4 border-t hairline pt-3">
                  <div className="text-[11px] text-ash mb-2">
                    Read access - click to grant / revoke:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {agents.map((a) => {
                      const owner = a.id === m.agentId;
                      const granted = m.grantedTo.includes(a.id);
                      return (
                        <button
                          key={a.id}
                          disabled={owner}
                          onClick={() => toggle(m.id, a.id, !granted)}
                          className={`rounded-full px-2.5 py-1 text-[11px] border transition ${
                            granted
                              ? "border-emerald/40 bg-emerald/10 text-emerald"
                              : "border-white/10 bg-white/[0.02] text-ash hover:text-parchment"
                          } ${owner ? "opacity-60 cursor-default" : ""}`}
                        >
                          {a.avatar} {a.name}
                          {owner ? " (owner)" : granted ? " ✓" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
