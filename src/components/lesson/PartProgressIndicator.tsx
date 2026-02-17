"use client";

import { useLessonStore } from "@/store/lesson-store";
import type { LessonPart } from "@/types/lesson";

interface PartProgressIndicatorProps {
  part1: LessonPart;
  part2: LessonPart;
}

export default function PartProgressIndicator({
  part1,
  part2,
}: PartProgressIndicatorProps) {
  const currentPart = useLessonStore((s) => s.currentPart);
  const part1Completed = useLessonStore((s) => s.part1Completed);
  const part2Completed = useLessonStore((s) => s.part2Completed);
  const setCurrentPart = useLessonStore((s) => s.setCurrentPart);

  const parts = [
    { num: 1 as const, label: part1.title, est: part1.estimatedMinutes, done: part1Completed },
    { num: 2 as const, label: part2.title, est: part2.estimatedMinutes, done: part2Completed },
  ];

  return (
    <div className="flex items-center gap-1">
      {parts.map((p, i) => {
        const isActive = currentPart === p.num;
        const canClick = p.num === 1 || part1Completed;

        return (
          <div key={p.num} className="flex items-center gap-1">
            {i > 0 && (
              <svg width="12" height="12" viewBox="0 0 12 12" className="text-[#333] mx-0.5">
                <path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            )}
            <button
              onClick={() => canClick && setCurrentPart(p.num)}
              disabled={!canClick}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                isActive
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : p.done
                  ? "bg-primary/5 text-primary/60 border border-primary/10"
                  : canClick
                  ? "text-[#666] hover:text-[#999] border border-transparent"
                  : "text-[#333] border border-transparent cursor-not-allowed"
              }`}
            >
              {p.done ? (
                <svg width="12" height="12" viewBox="0 0 12 12" className="text-primary">
                  <path d="M2 6l3 3 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              ) : (
                <span className={`w-4 h-4 rounded-full border text-[9px] flex items-center justify-center ${
                  isActive ? "border-primary text-primary" : "border-[#444] text-[#444]"
                }`}>
                  {p.num}
                </span>
              )}
              <span>{p.label}</span>
              <span className={`text-[9px] ${isActive ? "text-primary/50" : "text-[#444]"}`}>
                {p.est}m
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
