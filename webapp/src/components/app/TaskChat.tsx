"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useGrimoireWallet } from "@/lib/wallet";
import type { Agent, Quest } from "@/lib/types";
import { fetchState, postQuest, type QuestResponse } from "@/lib/client";

const EXAMPLES = [
  "Summarize the top 3 risks in a DeFi lending protocol",
  "Draft a TypeScript debounce utility with typed cancellation",
  "Compare three L1 chains for AI agent deployments",
];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  quest?: Quest;
  meta?: QuestResponse;
  error?: string;
};

function questsToMessages(quests: Quest[]): ChatMessage[] {
  const ordered = [...quests].sort((a, b) => a.createdAt - b.createdAt).slice(-20);
  const msgs: ChatMessage[] = [];
  for (const q of ordered) {
    msgs.push({
      id: `u-${q.id}`,
      role: "user",
      content: q.prompt,
    });
    if (q.answer) {
      msgs.push({
        id: `a-${q.id}`,
        role: "assistant",
        content: q.answer,
        quest: q,
      });
    }
  }
  return msgs;
}

export default function TaskChat({ agents }: { agents: Agent[] }) {
  const { address, isConnected } = useGrimoireWallet();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [agentId, setAgentId] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadHistory = useCallback(async () => {
    if (!address) return;
    try {
      const state = await fetchState(address);
      const history = questsToMessages(state.quests ?? []);
      if (history.length) setMessages(history);
    } catch {
      /* ignore */
    }
  }, [address]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function submit() {
    if (!isConnected || !address || prompt.trim().length < 4 || loading) return;

    const userText = prompt.trim();
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: userText,
    };
    setMessages((m) => [...m, userMsg]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await postQuest(userText, 0, agentId, address);
      const assistantMsg: ChatMessage = {
        id: `a-${res.quest.id}`,
        role: "assistant",
        content: res.quest.answer ?? "No answer returned.",
        quest: res.quest,
        meta: res,
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Something went wrong. Try again.",
          error: (e as Error).message,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
        <h1 className="font-display text-2xl text-parchment">Tasks</h1>
        <p className="mt-2 text-sm text-ash max-w-md">
          Sign in to post tasks. An agent solves on 0G Compute - you get an answer, and a
          skill is minted when the method is reusable.
        </p>
        <p className="mt-4 text-xs text-ash">
          Use the wallet button in the header to connect.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* message thread */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && !loading && (
            <div className="py-12 text-center">
              <h2 className="font-display text-xl text-parchment">What do you need solved?</h2>
              <p className="mt-2 text-sm text-ash">
                Ask anything. You always get an answer - skills are minted only when unique.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setPrompt(ex)}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-ash hover:text-parchment hover:border-arcane/40 transition"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-arcane/20 border border-arcane/30 text-parchment"
                    : "bg-void/60 border border-white/10"
                }`}
              >
                {msg.role === "assistant" && msg.quest && (
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px]">
                    {msg.quest.verified ? (
                      <span className="text-emerald">Verified TEE</span>
                    ) : (
                      <span className="text-ash">Simulated</span>
                    )}
                    {msg.quest.agentId && (
                      <span className="text-ash">
                        · {agents.find((a) => a.id === msg.quest?.agentId)?.name ?? msg.quest.agentId}
                      </span>
                    )}
                    {msg.meta?.skill && (
                      <span className="text-ember-bright">· Skill minted</span>
                    )}
                    {msg.meta?.castSkill && (
                      <span className="text-ember-bright">· Used existing skill</span>
                    )}
                  </div>
                )}
                <p className="text-sm text-parchment whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
                {msg.error && (
                  <p className="mt-2 text-xs text-blood">{msg.error}</p>
                )}
                {msg.meta && (
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(expandedId === msg.id ? null : msg.id)
                    }
                    className="mt-2 text-[10px] text-ash hover:text-parchment"
                  >
                    {expandedId === msg.id ? "Hide details" : "Details"}
                  </button>
                )}
                {expandedId === msg.id && msg.meta && (
                  <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-ash space-y-1">
                    {msg.meta.skillNote && <p>{msg.meta.skillNote}</p>}
                    {msg.meta.skill && (
                      <p className="text-ember-bright">{msg.meta.skill.name}</p>
                    )}
                    {msg.meta.spawnedAgent && (
                      <p>New agent: {msg.meta.spawnedAgent.name}</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-void/60 border border-white/10 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-ash">
                  <span className="h-2 w-2 rounded-full bg-arcane-bright animate-pulse" />
                  Solving on 0G Compute…
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* input bar */}
      <div className="shrink-0 border-t hairline bg-void/80 backdrop-blur-xl px-4 sm:px-6 py-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-ash">
            <label className="flex items-center gap-2">
              Agent
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="rounded-lg border border-white/10 bg-void/60 px-2 py-1 text-parchment outline-none"
              >
                <option value="auto">Auto-route</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.avatar} {a.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Describe your task…"
              rows={2}
              disabled={loading}
              className="flex-1 resize-none rounded-xl border border-white/10 bg-void/60 px-4 py-3 text-sm text-parchment outline-none placeholder:text-ash/40 focus:border-arcane/50 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={submit}
              disabled={loading || prompt.trim().length < 4}
              className="shrink-0 rounded-xl bg-gradient-to-r from-ember-bright to-ember px-5 py-3 text-sm font-medium text-void hover:scale-[1.02] disabled:opacity-50 transition"
            >
              {loading ? "…" : "Send"}
            </button>
          </div>
          <p className="mt-2 text-[10px] text-ash/60">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
