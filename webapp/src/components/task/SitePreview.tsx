"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  SandpackProvider,
  SandpackPreview,
  useSandpack,
} from "@codesandbox/sandpack-react";
import {
  prepareSandpackFiles,
  type ProjectArtifact,
} from "@/lib/extractArtifact";
import { downloadProjectZip, downloadSingleFile } from "@/lib/exportProject";

type Tab = "preview" | "code" | "files";

const SANDPACK_SETUP = {
  entry: "/index.tsx",
  environment: "create-react-app" as const,
  dependencies: {
    react: "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^11.11.17",
  },
  devDependencies: {
    "@types/react": "^18.2.0",
    typescript: "^5.0.0",
  },
};

const SANDPACK_OPTS = {
  autorun: true,
  recompileMode: "immediate" as const,
  externalResources: ["https://cdn.tailwindcss.com"],
  showOpenInCodeSandbox: false,
};

function isCsbAppUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(".csb.app");
  } catch {
    return false;
  }
}

function LiveSitePreview({
  onLiveUrl,
}: {
  onLiveUrl: (url: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { listen } = useSandpack();

  useEffect(() => {
    const unsub = listen((msg) => {
      if (msg.type === "urlchange" && msg.url && isCsbAppUrl(msg.url)) {
        onLiveUrl(msg.url);
      }
    });
    return unsub;
  }, [listen, onLiveUrl]);

  useEffect(() => {
    const poll = () => {
      const iframe = containerRef.current?.querySelector("iframe");
      if (iframe?.src && isCsbAppUrl(iframe.src)) {
        onLiveUrl(iframe.src);
      }
    };
    const id = setInterval(poll, 400);
    return () => clearInterval(id);
  }, [onLiveUrl]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 [&_.sp-preview-actions]:!hidden [&_.sp-preview-iframe]:!rounded-none"
    >
      <SandpackPreview
        showNavigator={false}
        showRefreshButton
        showRestartButton={false}
        showOpenInCodeSandbox={false}
        showSandpackErrorOverlay
        style={{ height: "100%", minHeight: 480 }}
      />
    </div>
  );
}

export default function SitePreview({
  project,
  title,
  compact,
  onExpand,
}: {
  project: ProjectArtifact;
  title?: string;
  compact?: boolean;
  onExpand?: () => void;
}) {
  const [tab, setTab] = useState<Tab>("preview");
  const [selectedFile, setSelectedFile] = useState(project.entry);
  const [exporting, setExporting] = useState(false);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);

  const sandpackFiles = useMemo(() => prepareSandpackFiles(project), [project.files]);
  const fileList = useMemo(() => Object.keys(project.files).sort(), [project.files]);
  const codeFile =
    project.files["app/page.tsx"] ??
    project.files[Object.keys(project.files).find((k) => /page\.tsx$/i.test(k)) ?? ""] ??
    "";

  async function onExportZip() {
    setExporting(true);
    try {
      await downloadProjectZip(project.files, title ?? "grimoire-site");
    } finally {
      setExporting(false);
    }
  }

  function onExportFile(path: string) {
    downloadSingleFile(project.files[path], path.replace(/\//g, "-"));
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={onExpand}
        className="mt-3 w-full rounded-xl border border-arcane/30 bg-arcane/10 p-4 text-left hover:bg-arcane/15 transition group"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-parchment">Live preview ready</p>
            <p className="text-[11px] text-ash mt-0.5">
              {Object.keys(project.files).length} files · click to open hosted preview
            </p>
          </div>
          <span className="text-mana text-sm group-hover:translate-x-0.5 transition-transform">
            →
          </span>
        </div>
      </button>
    );
  }

  return (
    <SandpackProvider
      theme="dark"
      files={sandpackFiles}
      customSetup={SANDPACK_SETUP}
      options={SANDPACK_OPTS}
    >
      <div className="rounded-xl border border-white/10 bg-void/80 overflow-hidden flex flex-col min-h-[min(70vh,560px)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2 bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-1">
            {(["preview", "code", "files"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition ${
                  tab === t
                    ? "bg-arcane/20 text-parchment"
                    : "text-ash hover:text-parchment"
                }`}
              >
                {t === "preview" ? "Live site" : t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {liveUrl && tab === "preview" && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-mana hover:text-parchment hover:border-arcane/40 transition"
              >
                Open live site ↗
              </a>
            )}
            {title && (
              <span className="text-[10px] text-ash truncate max-w-[100px] hidden sm:inline">
                {title}
              </span>
            )}
            <button
              type="button"
              onClick={onExportZip}
              disabled={exporting}
              className="rounded-lg bg-gradient-to-r from-arcane to-arcane-deep px-3 py-1 text-[11px] font-medium text-white disabled:opacity-50"
            >
              {exporting ? "…" : "↓ Export ZIP"}
            </button>
          </div>
        </div>

        {tab === "preview" && (
          <div className="relative flex-1 min-h-[480px] bg-zinc-950">
            <LiveSitePreview onLiveUrl={setLiveUrl} />
          </div>
        )}

        {tab === "code" && (
          <div className="flex-1 min-h-[480px] overflow-auto">
            <div className="border-b border-white/10 px-3 py-1.5 text-[10px] font-mono text-ash">
              app/page.tsx
            </div>
            <pre className="p-4 text-[11px] leading-relaxed font-mono text-parchment/90">
              {codeFile}
            </pre>
          </div>
        )}

        {tab === "files" && (
          <div className="flex flex-1 min-h-[400px]">
            <div className="w-48 shrink-0 border-r border-white/10 bg-void/90 overflow-y-auto">
              {fileList.map((path) => (
                <button
                  key={path}
                  type="button"
                  onClick={() => setSelectedFile(path)}
                  className={`block w-full text-left px-3 py-2 text-[11px] font-mono truncate ${
                    selectedFile === path
                      ? "bg-arcane/15 text-parchment"
                      : "text-ash hover:text-parchment hover:bg-white/[0.03]"
                  }`}
                >
                  {path}
                </button>
              ))}
            </div>
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
                <span className="text-[10px] font-mono text-ash">{selectedFile}</span>
                <button
                  type="button"
                  onClick={() => onExportFile(selectedFile)}
                  className="text-[10px] text-mana hover:text-parchment"
                >
                  Download file
                </button>
              </div>
              <pre className="flex-1 overflow-auto p-4 text-[11px] leading-relaxed font-mono text-parchment/90">
                {project.files[selectedFile] ?? ""}
              </pre>
            </div>
          </div>
        )}
      </div>
    </SandpackProvider>
  );
}
