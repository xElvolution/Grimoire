"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGrimoireWallet } from "@/lib/wallet";
import type { Agent, Quest } from "@/lib/types";
import { fetchState, postQuest, type QuestResponse } from "@/lib/client";
import {
  buildPromptWithAttachments,
  fileToAttachment,
  type Attachment,
} from "@/lib/readAttachment";
import { detectArtifact, type Artifact, type ProjectArtifact } from "@/lib/extractArtifact";
import AssistantMessage from "@/components/task/AssistantMessage";
import BuildProgressCards from "@/components/task/BuildProgressCards";
import SitePreview from "@/components/task/SitePreview";
import VoiceMic from "@/components/app/VoiceMic";
import { useCredits } from "@/components/providers/CreditsProvider";
import { formatCredits, type TaskModeId } from "@/lib/credits";
import { detectTaskMode, modeLabel, modePrefix } from "@/lib/taskMode";

const STARTERS = [
  "What's my wallet balance?",
  "Build a neon gaming landing page",
  "Trade half my GRIM on 0G",
  "How much have I earned in royalties?",
  "Write a TypeScript debounce hook",
  "Research how TEE-verified AI works on 0G",
];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  displayContent?: string;
  attachments?: string[];
  quest?: Quest;
  meta?: QuestResponse;
  artifact?: Artifact | null;
  error?: string;
};

function lastBuildProject(messages: ChatMessage[]): Record<string, string> | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "assistant") continue;
    if (m.artifact?.type === "project") return m.artifact.files;
    if (m.quest?.artifact?.type === "project" && m.quest.artifact.files) {
      return m.quest.artifact.files;
    }
  }
  return null;
}

function latestProjectArtifact(messages: ChatMessage[]): ProjectArtifact | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "assistant") continue;
    if (m.artifact?.type === "project") return m.artifact;
    if (m.quest?.artifact?.type === "project" && m.quest.artifact.files) {
      return {
        type: "project",
        files: m.quest.artifact.files,
        entry: m.quest.artifact.entry ?? "app/page.tsx",
      };
    }
  }
  return null;
}

function questArtifactToMessage(q: Quest): Artifact | null {
  if (!q.artifact) return null;
  if (q.artifact.type === "project" && q.artifact.files) {
    return {
      type: "project",
      files: q.artifact.files,
      entry: q.artifact.entry ?? "app/page.tsx",
    };
  }
  if (q.artifact.type === "html") {
    return { type: "html", content: q.artifact.content };
  }
  return {
    type: "code",
    language: q.artifact.language ?? "code",
    content: q.artifact.content,
  };
}

function questsToMessages(quests: Quest[]): ChatMessage[] {
  const ordered = [...quests].sort((a, b) => a.createdAt - b.createdAt).slice(-20);
  const msgs: ChatMessage[] = [];
  for (const q of ordered) {
    msgs.push({
      id: `u-${q.id}`,
      role: "user",
      content: q.prompt,
      displayContent: q.prompt.split("\n--- File:")[0]?.trim() || q.prompt,
    });
    if (q.answer || q.artifact) {
      msgs.push({
        id: `a-${q.id}`,
        role: "assistant",
        content: q.answer ?? "",
        quest: q,
        artifact: questArtifactToMessage(q),
      });
    }
  }
  return msgs;
}

export default function TaskChat({ agents }: { agents: Agent[] }) {
  const { address, isConnected } = useGrimoireWallet();
  const {
    balance,
    canAfford,
    setBalanceFromServer,
    notifyDebit,
    costFor,
  } = useCredits();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [agentId, setAgentId] = useState("auto");
  const [activeTaskMode, setActiveTaskMode] = useState<TaskModeId>("ask");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [attachBusy, setAttachBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewPanelOpen, setPreviewPanelOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  async function onPickFiles(files: FileList | null) {
    if (!files?.length) return;
    setAttachBusy(true);
    try {
      const next: Attachment[] = [];
      for (const file of Array.from(files)) {
        next.push(await fileToAttachment(file));
      }
      setAttachments((a) => [...a, ...next]);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setAttachBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function toggleVoice() {
    const SR =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;
    if (!SR) {
      alert("Voice input needs Chrome or Edge.");
      return;
    }
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (ev: SpeechRecognitionEvent) => {
      const text = Array.from(ev.results)
        .map((r) => r[0]?.transcript ?? "")
        .join("");
      setPrompt(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }

  async function submit() {
    const base = prompt.trim();
    if (!isConnected || !address || loading) return;
    if (base.length < 2 && attachments.length === 0) return;

    const inferredMode = detectTaskMode(base, attachments.length > 0);
    const cost = costFor(inferredMode);
    if (!canAfford(inferredMode)) {
      alert(
        `Insufficient balance. This task costs ${formatCredits(cost)} 0G. You have ${formatCredits(balance)} 0G. Fund your balance in the nav.`
      );
      return;
    }

    setActiveTaskMode(inferredMode);

    const userVisible =
      base ||
      (attachments.length === 1
        ? `📎 ${attachments[0].name}`
        : `📎 ${attachments.length} files`);

    let taskBody = `${modePrefix(inferredMode)}${base || "Use the attached file(s)."}`;
    const prevProject = inferredMode === "build" ? lastBuildProject(messages) : null;
    if (prevProject) {
      const summary = Object.keys(prevProject)
        .map((k) => `--- ${k} ---\n${prevProject[k]}`)
        .join("\n\n");
      taskBody = `Update this Next.js site. Change request: ${base}\n\nCurrent project files:\n${summary}`;
    }

    const fullPrompt = buildPromptWithAttachments(taskBody, attachments);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: fullPrompt,
      displayContent: userVisible,
      attachments: attachments.map((a) => a.name),
    };
    setMessages((m) => [...m, userMsg]);
    setPrompt("");
    setAttachments([]);
    setLoading(true);

    try {
      const res = await postQuest(fullPrompt, 0, agentId, address, inferredMode);
      const artifact: Artifact | null = res.artifact
        ? res.artifact.type === "project" && res.artifact.files
          ? {
              type: "project",
              files: res.artifact.files,
              entry: res.artifact.entry ?? "app/page.tsx",
            }
          : res.artifact.type === "html"
            ? { type: "html", content: res.artifact.content }
            : {
                type: "code",
                language: res.artifact.language ?? "code",
                content: res.artifact.content,
              }
        : detectArtifact(res.quest.answer ?? "", inferredMode);

      const assistantMsg: ChatMessage = {
        id: `a-${res.quest.id}`,
        role: "assistant",
        content: res.quest.answer ?? "Done.",
        quest: res.quest,
        meta: res,
        artifact,
      };
      setMessages((m) => [...m, assistantMsg]);
      if (res.quest.mode && ["ask", "build", "code", "summarize"].includes(res.quest.mode)) {
        setActiveTaskMode(res.quest.mode as TaskModeId);
      }
      if (res.credits != null) {
        setBalanceFromServer(res.credits, res.ledger);
      }
      if (res.creditUsed) {
        notifyDebit(res.creditUsed, inferredMode);
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: (e as Error).message,
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

  const inferredMode = detectTaskMode(prompt, attachments.length > 0);
  const canSend =
    !loading &&
    (prompt.trim().length >= 2 || attachments.length > 0) &&
    canAfford(inferredMode);
  const taskCostNow = costFor(inferredMode);
  const latestProject = latestProjectArtifact(messages);
  const showBuildPanel =
    latestProject !== null || (loading && activeTaskMode === "build");

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
        <h1 className="font-display text-3xl text-parchment">What should Grimoire do?</h1>
        <p className="mt-3 text-sm text-ash max-w-md">
          Build sites, research, code, check your wallet, trade on 0G, summarize files - one
          agent that finds a way and learns reusable skills. Sign in to start.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
      <div className="flex flex-col flex-1 min-h-0 min-w-0">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className={`mx-auto space-y-6 ${showBuildPanel ? "max-w-2xl" : "max-w-3xl"}`}>
          {messages.length === 0 && !loading && (
            <div className="py-12 text-center">
              <h2 className="font-display text-2xl sm:text-3xl text-parchment">
                What should Grimoire do?
              </h2>
              <p className="mt-3 text-sm text-ash max-w-lg mx-auto">
                Post any task - build, research, wallet balance, trade, code, summarize.
                Grimoire routes through memory, skills, and TEE; reusable methods become
                skills others cast (you earn royalties).
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {STARTERS.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setPrompt(ex)}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-ash hover:text-parchment hover:border-arcane/40 transition"
                  >
                    {ex.length > 52 ? ex.slice(0, 52) + "…" : ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[96%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-arcane/15 border border-arcane/25 text-parchment max-w-[85%]"
                    : "w-full bg-void/50 border border-white/10"
                }`}
              >
                {msg.role === "user" && msg.attachments?.length ? (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {msg.attachments.map((n) => (
                      <span
                        key={n}
                        className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-ash"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                ) : null}

                {msg.role === "assistant" ? (
                  <AssistantMessage
                    content={msg.content}
                    artifact={msg.artifact}
                    quest={msg.quest}
                    meta={msg.meta}
                    agents={agents}
                    expanded={expandedId === msg.id}
                    onToggleExpand={() =>
                      setExpandedId(expandedId === msg.id ? null : msg.id)
                    }
                    suppressProjectPreview={showBuildPanel}
                    onOpenPreview={() => setPreviewPanelOpen(true)}
                  />
                ) : (
                  <p className="text-sm leading-relaxed">{msg.displayContent ?? msg.content}</p>
                )}

                {msg.error && msg.role === "assistant" && !msg.quest && (
                  <p className="mt-2 text-xs text-blood">{msg.error}</p>
                )}
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex justify-start w-full">
              {activeTaskMode === "build" ? (
                showBuildPanel ? (
                  <div className="lg:hidden w-full">
                    <BuildProgressCards />
                  </div>
                ) : (
                  <BuildProgressCards />
                )
              ) : (
                <div className="rounded-2xl bg-void/60 border border-white/10 px-5 py-4">
                  <div className="flex items-center gap-3 text-sm text-ash">
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-arcane-bright animate-bounce [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-arcane-bright animate-bounce [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-arcane-bright animate-bounce [animation-delay:300ms]" />
                    </span>
                    Working on it…
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="shrink-0 border-t hairline bg-void/90 backdrop-blur-xl px-4 sm:px-6 py-4">
        <div className={`mx-auto ${showBuildPanel ? "max-w-2xl" : "max-w-3xl"}`}>
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 flex flex-wrap gap-2"
              >
                {attachments.map((a) => (
                  <span
                    key={a.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-ash"
                  >
                    {a.name}
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((list) => list.filter((x) => x.id !== a.id))
                      }
                      className="text-ash hover:text-parchment"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] text-ash">
              {modeLabel(inferredMode)} ·{" "}
              <span className="text-parchment font-mono">{formatCredits(taskCostNow)} 0G</span>
              {!canAfford(inferredMode) && (
                <span className="text-blood ml-2">· insufficient balance</span>
              )}
            </span>
            <span className="text-[11px] text-ash font-mono">
              balance {formatCredits(balance)} 0G
            </span>
          </div>

          <div className="flex items-end gap-1 rounded-2xl border border-white/10 bg-void/60 p-2 shadow-lg shadow-black/20">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt,.md,.markdown,.json,.csv,.html,.htm,.ts,.tsx,.js,.jsx,.py"
              multiple
              className="hidden"
              onChange={(e) => onPickFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={attachBusy || loading}
              title="Attach file"
              className="shrink-0 h-10 w-10 rounded-xl flex items-center justify-center text-ash hover:text-parchment hover:bg-white/[0.06] disabled:opacity-40 transition"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Build, research, wallet, trade, code, attach files…"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-parchment outline-none placeholder:text-ash/50 disabled:opacity-60 min-h-[44px] max-h-32"
            />
            <VoiceMic listening={listening} disabled={loading} onClick={toggleVoice} />
            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              className="shrink-0 h-10 w-10 rounded-xl bg-parchment text-void flex items-center justify-center hover:opacity-90 disabled:opacity-30 transition"
              aria-label="Send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.4 20.6l17.2-8.6L3.4 3.4l2.5 7.4 7.1 1-7.1 1-2.5 7.4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      </div>

      {showBuildPanel && previewPanelOpen && (
        <aside className="hidden lg:flex flex-col w-[min(46%,600px)] shrink-0 border-l border-white/10 bg-void/60 min-h-0">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-void/90 shrink-0">
            <span className="text-sm font-medium text-parchment">Live preview</span>
            <div className="flex items-center gap-2">
              {loading && activeTaskMode === "build" && <BuildProgressCards compact />}
              <button
                type="button"
                onClick={() => setPreviewPanelOpen(false)}
                className="rounded-md px-2 py-1 text-[10px] text-ash hover:text-parchment border border-white/10"
              >
                Close
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {loading && activeTaskMode === "build" && !latestProject ? (
              <BuildProgressCards panel />
            ) : latestProject ? (
              <div className="flex-1 min-h-0 overflow-y-auto p-3">
                <SitePreview project={latestProject} title="Your site" />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-sm text-ash">
                Describe a landing page - live preview appears here while you build.
              </div>
            )}
          </div>
        </aside>
      )}

      {showBuildPanel && !previewPanelOpen && (
        <button
          type="button"
          onClick={() => setPreviewPanelOpen(true)}
          className="hidden lg:flex fixed right-4 bottom-24 z-30 items-center gap-2 rounded-full border border-arcane/40 bg-void/95 px-4 py-2 text-xs text-parchment shadow-lg hover:bg-arcane/10 transition"
        >
          <span className="h-2 w-2 rounded-full bg-emerald animate-pulse" />
          Open live preview
        </button>
      )}
    </div>
  );
}
