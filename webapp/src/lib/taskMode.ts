import type { TaskModeId } from "./credits";

const BUILD_RE =
  /\b(build|create|make|design)\s+(me\s+)?(a\s+)?(website|site|landing|page|portfolio|homepage|web\s*app|ui)\b/i;
const BUILD_ALT =
  /\b(build|create|make)\s+(me\s+)?(a\s+)?(developer\s+)?(portfolio|gaming|saas|pricing|marketplace)\b/i;
const CODE_RE =
  /\b(write|implement|fix|debug|refactor)\s+(a\s+)?(function|hook|component|script|code|api|class|module)\b/i;

export function detectTaskMode(prompt: string, hasAttachments = false): TaskModeId {
  const p = prompt.trim();
  const lower = p.toLowerCase();

  if (hasAttachments && !/(build|create|make|code|write|implement)/i.test(p)) {
    if (/summarize|summary|bullet|extract|action items|tldr|key takeaway/i.test(lower)) {
      return "summarize";
    }
    if (p.length < 60) return "summarize";
  }

  if (
    BUILD_RE.test(p) ||
    BUILD_ALT.test(p) ||
    /\blanding\s+page\b/i.test(p) ||
    /\bportfolio\s+website\b/i.test(p)
  ) {
    return "build";
  }

  if (
    CODE_RE.test(p) ||
    /\b(typescript|javascript|python|rust|solidity)\b/i.test(lower) ||
    /\.(ts|tsx|js|jsx|py)(\s|$)/i.test(p)
  ) {
    return "code";
  }

  if (/summarize|summary|bullet points|key takeaway|tldr|extract the/i.test(lower)) {
    return "summarize";
  }

  return "ask";
}

export function modePrefix(mode: TaskModeId): string {
  switch (mode) {
    case "build":
      return "Build: ";
    case "code":
      return "Write clean production-ready code. Task: ";
    case "summarize":
      return "Summarize with bullet points and key takeaways. Content: ";
    default:
      return "";
  }
}

export function modeLabel(_mode: TaskModeId): string {
  return "Working";
}

/** Vague build requests get clarifying questions first (Claude-style). */
export function needsBuildClarification(prompt: string): boolean {
  const p = prompt.trim();
  if (
    /portfolio|gaming|saas|pricing|landing|dark|minimal|developer|agency|ecommerce|blog|dashboard|neon|corporate|marketplace|fintech|crypto/i.test(
      p
    )
  ) {
    return false;
  }
  if (p.length > 55) return false;
  return /\b(build|make|create|design)\s+(me\s+)?(a\s+)?(website|site|page|app)\b/i.test(p);
}
