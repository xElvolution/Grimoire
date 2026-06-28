"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Tab = "preview" | "code";

export default function UiPreview({ html, title }: { html: string; title?: string }) {
  const [tab, setTab] = useState<Tab>("preview");

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-void/80 overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 bg-white/[0.02]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
              tab === "preview"
                ? "bg-arcane/20 text-parchment"
                : "text-ash hover:text-parchment"
            }`}
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => setTab("code")}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
              tab === "code"
                ? "bg-arcane/20 text-parchment"
                : "text-ash hover:text-parchment"
            }`}
          >
            Code
          </button>
        </div>
        {title && <span className="text-[10px] text-ash truncate max-w-[40%]">{title}</span>}
      </div>

      {tab === "preview" ? (
        <div className="relative bg-white">
          <iframe
            title="Live preview"
            sandbox="allow-scripts allow-same-origin"
            srcDoc={html}
            className="w-full h-[min(70vh,520px)] border-0"
          />
        </div>
      ) : (
        <pre className="max-h-[min(70vh,520px)] overflow-auto p-4 text-[11px] leading-relaxed font-mono text-parchment/90 bg-void/90">
          {html}
        </pre>
      )}
    </div>
  );
}
