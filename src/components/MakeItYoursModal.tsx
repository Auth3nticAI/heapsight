"use client";

interface MakeItYoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  milestoneTitle: string;
  suggestions: string[];
}

export default function MakeItYoursModal({
  isOpen,
  onClose,
  prompt,
  milestoneTitle,
  suggestions,
}: MakeItYoursModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 bg-[#071528] border border-white/[0.10] rounded-2xl p-5 sm:p-6 max-w-sm w-full mx-4 animate-modal_in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <div className="text-5xl mb-3">{"\uD83C\uDFA8"}</div>
          <h2 className="text-xl font-bold text-white">Make It Yours!</h2>
          <p className="text-sm text-primary font-mono mt-1">{milestoneTitle}</p>
        </div>

        <p className="text-xs text-[#AFBCD5]/70 font-mono leading-relaxed mb-4">
          {prompt}
        </p>

        <div className="space-y-2 mb-5">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-2.5 bg-[#040B10] rounded-lg border border-white/[0.05]"
            >
              <span className="text-primary text-xs mt-0.5 shrink-0">&#9679;</span>
              <span className="text-xs font-mono text-[#AFBCD5]/80">{s}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gradient-to-r from-[#246BFD] to-[#0040C3] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity min-h-[44px] touch-manipulation"
        >
          Got It!
        </button>
        <button
          onClick={onClose}
          className="w-full mt-2 py-2 text-[#AFBCD5]/50 text-xs font-mono hover:text-[#AFBCD5] transition-colors min-h-[44px] touch-manipulation"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
