export type HtmlArtifact = { type: "html"; content: string };
export type CodeArtifact = { type: "code"; language: string; content: string };
export type ProjectArtifact = {
  type: "project";
  files: Record<string, string>;
  entry: string;
};
export type Artifact = HtmlArtifact | CodeArtifact | ProjectArtifact;

const DEFAULT_LAYOUT = `import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-zinc-950 text-zinc-100">{children}</body>
    </html>
  );
}
`;

const DEFAULT_GLOBALS = `@import "tailwindcss";
`;

const DEFAULT_PACKAGE = `{
  "name": "grimoire-site",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "framer-motion": "^12.0.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/react": "^19",
    "@types/node": "^20",
    "tailwindcss": "^4"
  }
}
`;

function wrapHtml(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>${body}</body>
</html>`;
}

export function extractProject(text: string): ProjectArtifact | null {
  const files: Record<string, string> = {};

  const blockRe =
    /```(?:tsx|typescript|jsx|javascript|css|json)?\s*(?:file:\s*|filename:\s*)?([^\n`]+)\n([\s\S]*?)```/gi;
  for (const m of text.matchAll(blockRe)) {
    const path = m[1].trim().replace(/^["'`]|["'`]$/g, "");
    const content = m[2].trim();
    if (!path || !content) continue;
    if (/\.(tsx|ts|jsx|js|css|json|md)$/i.test(path)) {
      files[normalizePath(path)] = content;
    }
  }

  const headerRe = /#{2,3}\s*(?:File:\s*)?([^\n]+\.(tsx|ts|jsx|js|css|json))\s*\n```(\w+)?\n([\s\S]*?)```/gi;
  for (const m of text.matchAll(headerRe)) {
    files[normalizePath(m[1].trim())] = m[4].trim();
  }

  if (Object.keys(files).length === 0) {
    const single = text.match(/```(?:tsx|jsx)\s*\n([\s\S]*?)```/);
    if (single) {
      const code = single[1].trim();
      if (code.includes("export default") || code.includes("function ")) {
        files["app/page.tsx"] = code.startsWith('"use client"')
          ? code
          : `"use client";\n\n${code}`;
      }
    }
  }

  if (Object.keys(files).length === 0) return null;

  return {
    type: "project",
    files: normalizeProjectFiles(files),
    entry: files["app/page.tsx"] ? "app/page.tsx" : Object.keys(files)[0],
  };
}

export function normalizePath(p: string): string {
  return p.replace(/^\/+/, "").replace(/\\/g, "/");
}

export function normalizeProjectFiles(raw: Record<string, string>): Record<string, string> {
  const files: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    files[normalizePath(k)] = v;
  }

  if (!files["app/page.tsx"] && !files["pages/index.tsx"]) {
    const pageKey = Object.keys(files).find((k) => /page\.tsx$/i.test(k));
    if (pageKey) files["app/page.tsx"] = files[pageKey];
  }

  if (!files["app/layout.tsx"]) files["app/layout.tsx"] = DEFAULT_LAYOUT;
  if (!files["app/globals.css"]) files["app/globals.css"] = DEFAULT_GLOBALS;
  if (!files["package.json"]) files["package.json"] = DEFAULT_PACKAGE;
  else files["package.json"] = sanitizePackageJson(files["package.json"]);

  if (files["app/page.tsx"] && !files["app/page.tsx"].includes('"use client"')) {
    if (
      files["app/page.tsx"].includes("framer-motion") ||
      files["app/page.tsx"].includes("motion.")
    ) {
      files["app/page.tsx"] = `"use client";\n\n${files["app/page.tsx"]}`;
    }
  }

  return files;
}

function sanitizePackageJson(raw: string): string {
  try {
    const pkg = JSON.parse(raw) as {
      devDependencies?: Record<string, string>;
      dependencies?: Record<string, string>;
    };
    if (pkg.devDependencies) {
      delete pkg.devDependencies["@types/tailwindcss"];
      delete pkg.devDependencies["tailwindcss"];
      delete pkg.devDependencies["@types/node"];
    }
    if (pkg.dependencies) {
      delete pkg.dependencies["next"];
    }
    return JSON.stringify(pkg, null, 2);
  } catch {
    return DEFAULT_PACKAGE;
  }
}

function sanitizeForPreview(code: string, renameDefaultToApp = false): string {
  let out = code
    .replace(/^["']use client["'];?\s*/gm, "")
    .replace(/import\s+Image\s+from\s+["']next\/image["'];?\s*/g, "")
    .replace(/import\s+Link\s+from\s+["']next\/link["'];?\s*/g, "")
    .replace(/<Link\s+/g, "<a ")
    .replace(/<\/Link>/g, "</a>")
    .replace(/<Image\s+/g, "<img ")
    .replace(/\s+alt=/g, " alt=");

  if (renameDefaultToApp) {
    out = out.replace(/export default function \w+/, "export default function App");
  }
  return out;
}

function rewritePreviewImports(code: string, sandpackPath: string): string {
  const inComponents = sandpackPath.startsWith("components/");

  let out = code
    .replace(/from\s+["'](?:\.\.\/)+components\/([^"']+)["']/g, 'from "./components/$1"')
    .replace(/from\s+["']@\/components\/([^"']+)["']/g, 'from "./components/$1"')
    .replace(/from\s+["']@\/([^"']+)["']/g, 'from "./$1"')
    .replace(/from\s+["']\.\/app\/([^"']+)["']/g, 'from "./$1"');

  if (inComponents) {
    out = out
      .replace(/from\s+["'](?:\.\.\/)+components\/([^"']+)["']/g, 'from "./$1"')
      .replace(/from\s+["']\.\/components\/([^"']+)["']/g, 'from "./$1"');
  }

  return out;
}

const SANDPACK_SKIP = new Set([
  "package.json",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "tsconfig.json",
  "postcss.config.js",
  "postcss.config.mjs",
  "tailwind.config.js",
  "tailwind.config.ts",
]);

const SANDPACK_PACKAGE_JSON = `{
  "name": "grimoire-preview",
  "private": true,
  "main": "/index.tsx",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^11.11.17"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0"
  }
}`;

const SANDPACK_TS_CONFIG = `{
  "compilerOptions": {
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "strict": false,
    "skipLibCheck": true
  }
}`;

function sandpackComponentPath(path: string): string | null {
  const p = normalizePath(path);
  if (SANDPACK_SKIP.has(p) || p.endsWith(".md")) return null;

  if (p === "app/globals.css" || p === "styles/globals.css") return "styles.css";
  if (p === "app/layout.tsx" || /\/layout\.tsx$/i.test(p)) return null;

  if (
    p === "app/page.tsx" ||
    p === "pages/index.tsx" ||
    /(^|\/)app\/page\.tsx$/i.test(p)
  ) {
    return "App.tsx";
  }

  if (!/\.(tsx|jsx)$/i.test(p)) return null;

  if (p.startsWith("app/components/")) return p.replace(/^app\//, "");
  if (p.startsWith("components/")) return p;

  const base = p.split("/").pop() ?? p;
  if (base === "page.tsx") return "App.tsx";
  return `components/${base}`;
}

export function prepareSandpackFiles(project: ProjectArtifact): Record<string, string> {
  const out: Record<string, string> = {};

  for (const [path, content] of Object.entries(project.files)) {
    const mapped = sandpackComponentPath(path);
    if (!mapped) continue;

    if (mapped === "styles.css") {
      out["/styles.css"] =
        content.includes("@import") ? "/* Tailwind loaded via CDN in preview */" : content;
      continue;
    }

    const renameDefault = mapped === "App.tsx";
    const outPath = `/${mapped}`;
    if (out[outPath] && !renameDefault) continue;
    const sanitized = sanitizeForPreview(content, renameDefault);
    out[outPath] = rewritePreviewImports(sanitized, mapped);
  }

  if (!out["/App.tsx"]) {
    const entry = project.files[project.entry];
    if (entry) {
      const sanitized = sanitizeForPreview(entry, true);
      out["/App.tsx"] = rewritePreviewImports(sanitized, "App.tsx");
    }
  }

  if (!out["/styles.css"]) {
    out["/styles.css"] =
      "body { margin: 0; min-height: 100vh; background: #09090b; color: #fafafa; }";
  }

  out["/index.tsx"] = `
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const el = document.getElementById("root");
if (el) {
  createRoot(el).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
`;

  out["/public/index.html"] = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Preview</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

  out["/package.json"] = SANDPACK_PACKAGE_JSON;
  out["/tsconfig.json"] = SANDPACK_TS_CONFIG;

  return out;
}

export function toSandpackFiles(files: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(files)) {
    out[`/${normalizePath(k)}`] = v;
  }
  return out;
}

export function extractHtml(text: string): string | null {
  const trimmed = text.trim();
  const mdBlocks = [...trimmed.matchAll(/```(?:html|htm)?\s*([\s\S]*?)```/gi)];
  for (const m of mdBlocks) {
    const inner = m[1].trim();
    if (/<!DOCTYPE/i.test(inner) || /<html[\s>]/i.test(inner)) return inner;
    if (/<(div|body|main|section|header|nav|footer|article)/i.test(inner)) {
      return wrapHtml(inner);
    }
  }
  const doc = trimmed.match(/<!DOCTYPE[\s\S]*?<\/html\s*>/i);
  if (doc) return doc[0];
  const html = trimmed.match(/<html[\s\S]*?<\/html\s*>/i);
  if (html) return html[0];
  if (/^<(div|section|main|header|body)/i.test(trimmed)) return wrapHtml(trimmed);
  return null;
}

export function extractCode(text: string): CodeArtifact | null {
  const m = text.match(/```(\w+)?\s*([\s\S]*?)```/);
  if (!m) return null;
  const lang = (m[1] || "text").toLowerCase();
  if (["html", "htm", "tsx", "jsx"].includes(lang)) return null;
  return { type: "code", language: lang, content: m[2].trim() };
}

export function detectArtifact(text: string, mode?: string): Artifact | null {
  if (mode === "build") {
    const project = extractProject(text);
    if (project) return project;
  }
  const html = extractHtml(text);
  if (html) return { type: "html", content: html };
  if (mode === "code") {
    const code = extractCode(text);
    if (code) return code;
  }
  return null;
}

export function stripArtifactForDisplay(text: string, artifact: Artifact | null): string {
  if (!artifact) return text;
  if (artifact.type === "project") return "";
  if (artifact.type === "html") {
    const withoutBlocks = text.replace(/```[\s\S]*?```/g, "").replace(/#{2,3}\s*File:[^\n]+/g, "").trim();
    if (withoutBlocks.length < 80) return "";
    return withoutBlocks;
  }
  return text.replace(/```[\s\S]*?```/g, "").trim();
}

export function projectFromStored(
  artifact?: { type: string; content?: string; language?: string; files?: Record<string, string> }
): ProjectArtifact | null {
  if (!artifact) return null;
  if (artifact.type === "project" && artifact.files) {
    return {
      type: "project",
      files: normalizeProjectFiles(artifact.files),
      entry: "app/page.tsx",
    };
  }
  return null;
}
