"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import Nav from "@/components/app/Nav";
import {
  fetchBrain,
  fetchMemory,
  fetchState,
  type BrainState,
} from "@/lib/client";

const GrimoireBrain = dynamic(() => import("@/components/brain/GrimoireBrain"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] w-full rounded-2xl border border-arcane/20 bg-void/80 animate-pulse" />
  ),
});

const STATUS_COLOR: Record<string, string> = {
  healthy: "text-emerald",
  overload: "text-ember-bright",
  atrophy: "text-ash",
  hyperconnected: "text-mana",
};

export default function BrainPage() {
  const [brain, setBrain] = useState<BrainState | null>(null);
  const [skills, setSkills] = useState<Awaited<ReturnType<typeof fetchState>>["network"]["skills"]>([]);
  const [memories, setMemories] = useState<Awaited<ReturnType<typeof fetchMemory>>["memories"]>([]);
  const [agents, setAgents] = useState<Awaited<ReturnType<typeof fetchMemory>>["agents"]>([]);

  const refresh = useCallback(async () => {
    try {
      const [b, mem, econ] = await Promise.all([
        fetchBrain(),
        fetchMemory(),
        fetchState(),
      ]);
      setBrain(b);
      setMemories(mem.memories);
      setAgents(mem.agents);
      setSkills(econ.network.skills);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="min-h-screen bg-runic-grid">
      <Nav />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <h1 className="font-display text-3xl text-parchment">Brain scan</h1>
        <p className="mt-1 text-sm text-ash max-w-xl">
          EEG-style health monitor - overload, atrophy, and hyperconnected agents in the
          neural mirror.
        </p>

        {brain && (
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-ash">
            <span>{brain.stats.neurons} neurons</span>
            <span>{brain.stats.synapses} synapse links</span>
            <span>{brain.synapses.length} plasticity weights tracked</span>
          </div>
        )}

        <div className="mt-6">
          <GrimoireBrain
            skills={skills}
            memories={memories}
            agents={agents}
            synapses={brain?.synapses ?? []}
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(brain?.health ?? []).map((h) => {
            const agent = agents.find((a) => a.id === h.agentId);
            return (
              <div key={h.agentId} className="rounded-2xl glass p-4">
                <div className="flex items-center gap-2">
                  <span>{agent?.avatar}</span>
                  <span className="font-display text-parchment">{agent?.name ?? h.agentId}</span>
                  <span className={`text-[10px] uppercase ${STATUS_COLOR[h.status] ?? "text-ash"}`}>
                    {h.status}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-ash">
                  <span>memories: {h.memoryCount}</span>
                  <span>skills: {h.skillCount}</span>
                  <span>synapses: {h.synapseCount}</span>
                  <span>failures: {h.failureCount}</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
