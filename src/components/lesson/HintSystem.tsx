"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";

interface Hint {
  id: string;
  hint_level: number;
  hint_text: string;
  hint_code?: string;
  unlock_after_seconds: number;
}

interface HintSystemProps {
  lessonId: string;
  userId: string;
  sessionStartTime: number;
  onHintUsed?: (hintLevel: number) => void;
}

export default function HintSystem({
  lessonId,
  userId,
  sessionStartTime,
  onHintUsed,
}: HintSystemProps) {
  const [hints, setHints] = useState<Hint[]>([]);
  const [currentHintLevel, setCurrentHintLevel] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [availableHintLevel, setAvailableHintLevel] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const loadHints = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("lesson_hints")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("hint_level", { ascending: true });

    if (!error && data && data.length > 0) {
      setHints(data);
    }
    setLoaded(true);
  }, [lessonId]);

  useEffect(() => {
    loadHints();
  }, [loadHints]);

  useEffect(() => {
    if (hints.length === 0) return;

    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);
      const unlockable = hints
        .filter((h) => h.unlock_after_seconds <= timeSpent)
        .sort((a, b) => b.hint_level - a.hint_level)[0];

      if (unlockable && unlockable.hint_level > availableHintLevel) {
        setAvailableHintLevel(unlockable.hint_level);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [hints, sessionStartTime, availableHintLevel]);

  const handleShowHint = async (level: number) => {
    setCurrentHintLevel(level);
    setShowHint(true);

    const timeBeforeHint = Math.floor(
      (Date.now() - sessionStartTime) / 1000
    );

    const supabase = createClient();
    supabase
      .from("hint_usage")
      .insert({
        user_id: userId,
        lesson_id: lessonId,
        hint_level: level,
        time_before_hint_seconds: timeBeforeHint,
      })
      .then(() => {});

    onHintUsed?.(level);
  };

  // Don't render if no DB hints loaded
  if (loaded && hints.length === 0) return null;
  if (!loaded) return null;

  const currentHint = hints.find((h) => h.hint_level === currentHintLevel);
  const nextLevel = Math.min(currentHintLevel + 1, availableHintLevel);

  return (
    <div className="space-y-2">
      {/* Hint trigger */}
      {availableHintLevel > 0 && !showHint && (
        <button
          onClick={() => handleShowHint(nextLevel)}
          className="flex items-center gap-2 text-xs font-mono text-[#AFBCD5]/60 hover:text-warning border border-white/[0.08] hover:border-warning/30 bg-[#071528] rounded-xl px-3 py-2 transition-all"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18h6" />
            <path d="M10 22h4" />
            <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 019 14" />
          </svg>
          <span>
            {currentHintLevel === 0
              ? "Stuck? Get a guided hint"
              : `Get hint ${nextLevel} of ${hints.length}`}
          </span>
        </button>
      )}

      {/* Hint display */}
      {showHint && currentHint && (
        <div className="bg-warning/5 border border-warning/20 rounded-xl p-3 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-warning"
              >
                <path d="M9 18h6" />
                <path d="M10 22h4" />
                <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 019 14" />
              </svg>
              <span className="text-xs font-mono text-warning">
                Hint {currentHintLevel}/{hints.length}
              </span>
              <span className="text-[9px] font-mono text-[#AFBCD5]/50">
                {currentHintLevel === 1 && "Gentle nudge"}
                {currentHintLevel === 2 && "More guidance"}
                {currentHintLevel === 3 && "Showing the way"}
              </span>
            </div>
            <button
              onClick={() => setShowHint(false)}
              className="text-[#AFBCD5]/50 hover:text-white text-sm leading-none transition-colors"
              aria-label="Close hint"
            >
              &times;
            </button>
          </div>

          <div className="text-xs font-mono text-[#AFBCD5] leading-relaxed bg-[#040B10] border border-white/[0.08] rounded-lg p-2.5">
            {currentHint.hint_text}
          </div>

          {currentHint.hint_code && (
            <pre className="text-xs font-mono text-[#e0e0e0] bg-[#040B10] border border-white/[0.08] rounded-lg p-2.5 overflow-x-auto">
              <code>{currentHint.hint_code}</code>
            </pre>
          )}

          <div className="flex items-center gap-2 pt-1">
            {currentHintLevel < hints.length &&
              currentHintLevel < availableHintLevel && (
                <button
                  onClick={() => handleShowHint(currentHintLevel + 1)}
                  className="text-[10px] font-mono text-warning hover:text-warning/80 transition-colors"
                >
                  Need more help? &rarr; Hint {currentHintLevel + 1}
                </button>
              )}
            <button
              onClick={() => setShowHint(false)}
              className="text-[10px] font-mono text-[#AFBCD5]/50 hover:text-[#999] transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
