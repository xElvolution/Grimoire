"use client";

export default function VoiceMic({
  listening,
  disabled,
  onClick,
}: {
  listening: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={listening ? "Stop listening" : "Voice input"}
      aria-label={listening ? "Stop voice input" : "Start voice input"}
      className={`shrink-0 h-11 w-11 rounded-full flex items-center justify-center transition disabled:opacity-40 ${
        listening
          ? "bg-parchment text-void shadow-lg shadow-arcane/30"
          : "bg-transparent text-ash hover:bg-white/[0.06] hover:text-parchment"
      }`}
    >
      {listening ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 11a7 7 0 0 1-14 0M12 18v3"
          />
        </svg>
      )}
    </button>
  );
}
