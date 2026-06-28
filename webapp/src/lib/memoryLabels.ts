import type { MemoryKind } from "./types";

/** Plain-language labels for memory UI (internal kinds stay technical in API). */
export const MEMORY_KIND_LABEL: Record<MemoryKind, string> = {
  preference: "Preference",
  episodic: "Story / event",
  semantic: "Fact",
  failure: "Lesson learned",
};

export function memoryKindLabel(kind?: MemoryKind): string {
  if (!kind) return "Note";
  return MEMORY_KIND_LABEL[kind] ?? kind;
}
