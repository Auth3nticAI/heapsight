"use client";

import { useState, useRef, useEffect } from "react";
import type { LessonStatus } from "@/types/lesson";

interface LessonTooltipProps {
  title: string;
  description: string;
  order: number;
  xpReward: number;
  status: LessonStatus;
  tier: "free" | "pro";
  userTier: "free" | "pro";
  minutes: number;
  part1Done: boolean;
  part2Done: boolean;
  children: React.ReactNode;
}

export default function LessonTooltip({
  title,
  description,
  order,
  xpReward,
  status,
  tier,
  userTier,
  minutes,
  part1Done,
  part2Done,
  children,
}: LessonTooltipProps) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState<"above" | "below">("above");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const isTierLocked = tier === "pro" && userTier === "free";

  // Determine whether tooltip should appear above or below, and clamp horizontally
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (show && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setPosition(rect.top < 200 ? "below" : "above");

      // Clamp tooltip so it doesn't overflow viewport edges on narrow screens
      const tooltipW = Math.min(224, window.innerWidth - 24); // w-56 = 224px, 12px margin each side
      const centerX = rect.left + rect.width / 2;
      let offsetX = 0;
      const leftEdge = centerX - tooltipW / 2;
      const rightEdge = centerX + tooltipW / 2;
      if (leftEdge < 12) offsetX = 12 - leftEdge;
      if (rightEdge > window.innerWidth - 12) offsetX = window.innerWidth - 12 - rightEdge;
      setTooltipStyle(offsetX !== 0 ? { transform: `translateX(calc(-50% + ${offsetX}px))` } : {});
    }
  }, [show]);

  const handleEnter = () => {
    clearTimeout(timeoutRef.current);
    setShow(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setShow(false), 150);
  };

  // Mobile: show on tap, hide after delay
  const handleTap = () => {
    if (show) {
      setShow(false);
    } else {
      setShow(true);
      timeoutRef.current = setTimeout(() => setShow(false), 3000);
    }
  };

  const statusLabel = isTierLocked
    ? "Locked (Pro)"
    : status === "completed"
    ? "Completed"
    : status === "in_progress"
    ? "In Progress"
    : status === "available"
    ? "Available"
    : "Locked";

  const statusColor = isTierLocked
    ? "text-[#a855f7]"
    : status === "completed"
    ? "text-[#22c55e]"
    : status === "in_progress"
    ? "text-[#3b82f6]"
    : status === "available"
    ? "text-[#10b981]"
    : "text-[#6b7280]";

  return (
    <div
      ref={wrapperRef}
      className="relative inline-flex flex-col items-center"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStart={handleTap}
    >
      {children}

      {show && (
        <div
          className={`
            absolute z-50 w-[calc(100vw-24px)] sm:w-56 max-w-[224px] p-3 rounded-lg border border-white/[0.08] bg-[#040B10]/95 backdrop-blur-sm
            shadow-xl pointer-events-none
            ${position === "above" ? "bottom-full mb-3" : "top-full mt-3"}
            left-1/2
          `}
          style={tooltipStyle.transform ? tooltipStyle : { transform: "translateX(-50%)" }}
        >
          {/* Arrow */}
          <div
            className={`
              absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-[#040B10] border-white/[0.08] rotate-45
              ${position === "above"
                ? "bottom-[-5px] border-r border-b"
                : "top-[-5px] border-l border-t"
              }
            `}
          />

          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-[#AFBCD5]/70">Lesson {order}</span>
            <span className={`text-[9px] font-mono font-bold ${statusColor}`}>{statusLabel}</span>
          </div>

          <h4 className="text-xs font-semibold text-white mb-1 leading-tight">{title}</h4>
          <p className="text-[10px] text-[#AFBCD5]/70 leading-relaxed mb-2 line-clamp-2">{description}</p>

          <div className="flex items-center gap-3 text-[9px] font-mono text-[#666]">
            <span>~{minutes}m</span>
            <span className="text-[#fbbf24]">+{xpReward} XP</span>
            <div className="flex items-center gap-1.5 ml-auto">
              <div className={`w-1.5 h-1.5 rounded-full ${part1Done ? "bg-[#22c55e]" : "bg-white/[0.08]"}`} />
              <div className={`w-1.5 h-1.5 rounded-full ${part2Done ? "bg-[#22c55e]" : "bg-white/[0.08]"}`} />
            </div>
          </div>

          {status === "locked" && !isTierLocked && (
            <p className="mt-2 text-[9px] font-mono text-[#555] border-t border-[#1f2937] pt-1.5">
              Complete the previous lesson to unlock.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
