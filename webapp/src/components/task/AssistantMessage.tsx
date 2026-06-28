"use client";

import type { Quest } from "@/lib/types";
import type { QuestResponse } from "@/lib/client";
import type { Artifact } from "@/lib/extractArtifact";
import { stripArtifactForDisplay, projectFromStored } from "@/lib/extractArtifact";
import UiPreview from "./UiPreview";
import SitePreview from "./SitePreview";
import CodeArtifact from "./CodeArtifact";
import OrchestrationTrail from "./OrchestrationTrail";

function metaFromQuest(quest: Quest): QuestResponse {
  return {
    quest,
    skill: null,
    skillMinted: Boolean(quest.skillId && !quest.usedExisting),
    spawnedAgent: null,
    simulated: !quest.verified,
    reflex: quest.reflex,
  };
}

function artifactFromQuest(q: Quest): Artifact | null {
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
  if (q.artifact.type === "code") {
    return {
      type: "code",
      language: q.artifact.language ?? "code",
      content: q.artifact.content,
    };
  }
  return null;
}

export default function AssistantMessage({
  content,
  artifact,
  quest,
  meta,
  agents,
  expanded,
  onToggleExpand,
  suppressProjectPreview = false,
  onOpenPreview,
}: {
  content: string;
  artifact?: Artifact | null;
  quest?: Quest;
  meta?: QuestResponse;
  agents: { id: string; name: string }[];
  expanded: boolean;
  onToggleExpand: () => void;
  suppressProjectPreview?: boolean;
  onOpenPreview?: () => void;
}) {
  const resolved =
    artifact ??
    (quest ? artifactFromQuest(quest) : null) ??
    (quest?.artifact ? projectFromStored(quest.artifact) : null);

  const displayText = stripArtifactForDisplay(content, resolved);
  const projectArtifact = resolved?.type === "project" ? resolved : null;
  const htmlArtifact = resolved?.type === "html" ? resolved : null;
  const codeArtifact = resolved?.type === "code" ? resolved : null;
  const agentName = quest?.agentId
    ? agents.find((a) => a.id === quest.agentId)?.name
    : undefined;

  return (
    <>
      {quest && (
        <OrchestrationTrail
          quest={quest}
          meta={meta ?? metaFromQuest(quest)}
          agentName={agentName}
        />
      )}

      {projectArtifact && !suppressProjectPreview && (
        <SitePreview
          project={projectArtifact}
          title={quest?.mode === "build" ? "Your site" : undefined}
        />
      )}

      {projectArtifact && suppressProjectPreview && (
        <>
          <div className="hidden lg:block">
            <SitePreview
              project={projectArtifact}
              title={quest?.mode === "build" ? "Your site" : undefined}
              compact
              onExpand={onOpenPreview}
            />
          </div>
          <div className="lg:hidden">
            <SitePreview
              project={projectArtifact}
              title={quest?.mode === "build" ? "Your site" : undefined}
            />
          </div>
        </>
      )}

      {htmlArtifact && !projectArtifact && (
        <UiPreview html={htmlArtifact.content} title="Preview" />
      )}

      {codeArtifact && !projectArtifact && !htmlArtifact && (
        <CodeArtifact code={codeArtifact.content} language={codeArtifact.language} />
      )}

      {displayText && (
        <p className="text-sm text-parchment whitespace-pre-wrap leading-relaxed mt-3">
          {displayText}
        </p>
      )}

      {meta && (
        <button
          type="button"
          onClick={onToggleExpand}
          className="mt-2 text-[10px] text-ash hover:text-parchment"
        >
          {expanded ? "Hide details" : "Details"}
        </button>
      )}
      {expanded && meta && (
        <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-ash space-y-1">
          {meta.skillNote && <p>{meta.skillNote}</p>}
          {meta.skill && <p className="text-ember-bright">{meta.skill.name}</p>}
          {meta.onchain?.url && (
            <a
              href={meta.onchain.url}
              target="_blank"
              rel="noreferrer"
              className="text-mana hover:underline"
            >
              On-chain tx ↗
            </a>
          )}
        </div>
      )}
    </>
  );
}
