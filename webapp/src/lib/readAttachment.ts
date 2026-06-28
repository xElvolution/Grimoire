/** Read user attachments in the browser (text-based files). */

const TEXT_EXT = /\.(txt|md|markdown|json|csv|html|htm|ts|tsx|js|jsx|py|sol|xml|yaml|yml|log)$/i;

export type Attachment = {
  id: string;
  name: string;
  size: number;
  kind: "text" | "pdf" | "other";
  preview: string;
  content: string;
};

export function isTextFile(name: string) {
  return TEXT_EXT.test(name);
}

export function isPdfFile(name: string) {
  return /\.pdf$/i.test(name);
}

export async function readTextFile(file: File): Promise<string> {
  return file.text();
}

export async function extractPdfText(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/attach", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Could not read PDF");
  return data.text as string;
}

export async function fileToAttachment(file: File): Promise<Attachment> {
  const id = `${file.name}-${file.size}-${Date.now()}`;
  let content = "";
  let kind: Attachment["kind"] = "other";

  if (isPdfFile(file.name)) {
    kind = "pdf";
    content = await extractPdfText(file);
  } else if (isTextFile(file.name) || file.type.startsWith("text/")) {
    kind = "text";
    content = await readTextFile(file);
  } else {
    throw new Error(`Unsupported file type. Try PDF, TXT, MD, code, or JSON.`);
  }

  const max = 48_000;
  const trimmed = content.length > max;
  if (trimmed) content = content.slice(0, max) + "\n\n[…truncated for length]";

  return {
    id,
    name: file.name,
    size: file.size,
    kind,
    preview: content.slice(0, 120).replace(/\s+/g, " "),
    content,
  };
}

export function buildPromptWithAttachments(prompt: string, attachments: Attachment[]): string {
  if (!attachments.length) return prompt.trim();
  const blocks = attachments.map(
    (a) => `--- File: ${a.name} ---\n${a.content}`
  );
  return `${prompt.trim()}\n\n${blocks.join("\n\n")}`;
}
