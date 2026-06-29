export const REFLEX_LABEL: Record<string, string> = {
  "skill-cast": "Reused an existing skill",
  spawn: "Spawned a specialist agent",
  "category-match": "Matched a specialist agent",
  manual: "Routed to agent",
  blocked: "Avoided a failed approach",
};

export function reflexLabel(reflex?: string): string {
  if (!reflex) return "";
  return REFLEX_LABEL[reflex] ?? reflex.replace(/-/g, " ");
}
