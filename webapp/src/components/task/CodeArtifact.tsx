"use client";

export default function CodeArtifact({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  return (
    <div className="mt-3 rounded-xl border border-white/10 overflow-hidden">
      <div className="border-b border-white/10 px-3 py-1.5 text-[10px] font-mono text-ash bg-white/[0.02]">
        {language}
      </div>
      <pre className="max-h-[min(60vh,400px)] overflow-auto p-4 text-[11px] leading-relaxed font-mono text-parchment/90 bg-void/90">
        {code}
      </pre>
    </div>
  );
}
