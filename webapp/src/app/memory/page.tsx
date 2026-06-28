"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Nav from "@/components/app/Nav";
import {
  fetchMemory,
  fetchState,
  fetchBrain,
  writeMemory,
  setMemoryAccess,
  consolidateMemory,
  linkAgents,
  type MemoryState,
  type BrainState,
} from "@/lib/client";
import { memoryKindLabel } from "@/lib/memoryLabels";

const GrimoireBrain = dynamic(() => import("@/components/brain/GrimoireBrain"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] sm:h-[400px] w-full rounded-2xl border border-arcane/20 bg-void/80 animate-pulse" />
  ),
});

export default function MemoryPage() {
  const [state, setState] = useState<MemoryState | null>(null);
  const [networkSkills, setNetworkSkills] = useState<
    Awaited<ReturnType<typeof fetchState>>["network"]["skills"]
  >([]);
  const [royalties, setRoyalties] = useState<
    Awaited<ReturnType<typeof fetchState>>["network"]["royalties"]
  >([]);
  const [brain, setBrain] = useState<BrainState | null>(null);
  const [linkPartner, setLinkPartner] = useState("lyra");
  const [memoryKind, setMemoryKind] = useState<"episodic" | "semantic" | "preference">("preference");
  const [agentId, setAgentId] = useState("arden");
  const [label, setLabel] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [mem, econ, b] = await Promise.all([
        fetchMemory(),
        fetchState(),
        fetchBrain(),
      ]);
      setState(mem);
      setBrain(b);
      setNetworkSkills(econ.network.skills);
      setRoyalties(econ.network.royalties);
      if (mem.agents[0] && !mem.agents.find((a) => a.id === agentId)) {
        setAgentId(mem.agents[0].id);
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
      await writeMemory(agentId, label, content, memoryKind);
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

  async function doLink() {
    try {
      await linkAgents(agentId, linkPartner);
      await refresh();
    } catch {
      /* ignore */
    }
  }

  async function doConsolidate(memoryId: string) {
    try {
      await consolidateMemory(memoryId);
      await refresh();
    } catch {
      /* ignore */
    }
  }

  const agents = state?.agents ?? [];
  const memories = state?.memories ?? [];
  const agentName = (id: string) => agents.find((a) => a.id === id)?.name ?? id;

  return (
    <div className="min-h-screen bg-runic-grid">
      <Nav />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-parchment">Memory</h1>
            <p className="mt-1 text-sm text-ash max-w-xl">
              Notes your agents can read when solving tasks. Saved on 0G. Remove access
              and they stop using that note.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <GrimoireBrain
            skills={networkSkills}
            memories={memories}
            agents={agents}
            royalties={royalties}
            synapses={brain?.synapses ?? []}
            selectedId={selectedId}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          {/* write panel */}
          <div className="lg:col-span-2 rounded-2xl glass rune-border p-6">
            <h2 className="font-display text-lg text-parchment">Save a note</h2>
            <p className="mt-1 text-[11px] text-ash">
              Pick an agent and write what it should remember for future tasks.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
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
              placeholder="Title (e.g. User preferences)"
              className="flex-1 min-w-[10rem] rounded-lg border border-white/10 bg-void/60 px-3 py-1.5 text-sm text-parchment outline-none placeholder:text-ash/40 focus:border-arcane/60"
            />
            <label className="flex items-center gap-2 text-xs text-ash">
              Type
              <select
                value={memoryKind}
                onChange={(e) => setMemoryKind(e.target.value as typeof memoryKind)}
                className="rounded-lg border border-white/10 bg-void/60 px-2 py-1.5 text-parchment outline-none"
              >
                <option value="preference">Preference</option>
                <option value="episodic">Story / event</option>
                <option value="semantic">Fact</option>
              </select>
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ash">
            <span>Share notes with another agent:</span>
            <select
              value={linkPartner}
              onChange={(e) => setLinkPartner(e.target.value)}
              className="rounded-lg border border-white/10 bg-void/60 px-2 py-1 text-parchment outline-none"
            >
              {agents.filter((a) => a.id !== agentId).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.avatar} {a.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={doLink}
              className="rounded-lg border border-mana/30 px-2 py-1 text-mana hover:bg-mana/10"
            >
              Share access
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="What should this agent remember?"
            className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-void/60 px-4 py-3 text-sm text-parchment outline-none placeholder:text-ash/40 focus:border-arcane/60"
          />
          <div className="mt-3 flex justify-end">
            <button
              onClick={save}
              disabled={saving || content.trim().length < 3}
              className="rounded-xl bg-gradient-to-r from-ember-bright to-ember px-6 py-2.5 text-sm font-medium text-void hover:scale-[1.02] disabled:opacity-50 transition"
            >
              {saving ? "Saving…" : "Save note"}
            </button>
          </div>
        </div>

        {/* memory list */}
          <div className="lg:col-span-3 space-y-3">
            {memories.length === 0 && (
              <div className="rounded-2xl glass p-10 text-center text-sm text-ash">
                No notes yet. Save one above - it will be used on future tasks.
            </div>
          )}
          <AnimatePresence initial={false}>
              {memories.map((m) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedId(m.id)}
                  className={`rounded-2xl glass p-5 cursor-pointer transition ${
                    selectedId === m.id
                      ? "ring-1 ring-arcane/50 glow-arcane"
                      : "hover:border-arcane/30"
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg text-parchment">
                        {m.label}
                      </span>
                      {m.verified ? (
                        <span className="rounded-full bg-emerald/10 border border-emerald/30 px-2 py-0.5 text-[10px] text-emerald">
                          ✓ saved on 0G
                        </span>
                      ) : (
                        <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-ash">
                          local
                        </span>
                      )}
                      {m.kind && (
                        <span className="rounded-full bg-arcane/10 border border-arcane/30 px-2 py-0.5 text-[10px] text-arcane-bright">
                          {memoryKindLabel(m.kind)}
                        </span>
                      )}
                      {m.superseded && (
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-ash">
                          replaced by summary
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-ash">
                        Saved by {agentName(m.agentId)}
                      </div>
                  </div>
                  {m.txHash && (
                    <a
                      href={`https://chainscan-galileo.0g.ai/tx/${m.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      className="shrink-0 text-[10px] text-mana hover:underline"
                    >
                      tx ↗
                    </a>
                  )}
                </div>

                  <p className="mt-2 text-sm text-ash line-clamp-2">{m.content}</p>

                <div className="mt-3 font-mono text-[10px] text-ash/50">
                  0G: {m.id.slice(0, 18)}…{m.id.slice(-6)}
                </div>

                <div className="mt-4 border-t hairline pt-3 flex flex-wrap gap-2">
                  {m.kind === "episodic" && !m.superseded && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        doConsolidate(m.id);
                      }}
                      className="rounded-full px-2.5 py-1 text-[11px] border border-ember/30 text-ember-bright hover:bg-ember/10"
                    >
                      Summarize to a short fact
                    </button>
                  )}
                </div>

                <div className="mt-3 border-t hairline pt-3">
                  <div className="text-[11px] text-ash mb-2">
                      Which agents can read this?
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {agents.map((a) => {
                      const owner = a.id === m.agentId;
                      const granted = m.grantedTo.includes(a.id);
                      return (
                        <button
                          key={a.id}
                          disabled={owner}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggle(m.id, a.id, !granted);
                            }}
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
        </div>
      </main>
    </div>
  );
}
