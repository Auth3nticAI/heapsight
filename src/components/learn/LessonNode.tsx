"use client";

import Link from "next/link";
import type { LessonStatus } from "@/types/lesson";

interface LessonNodeProps {
  id: string;
  order: number;
  title: string;
  xpReward: number;
  status: LessonStatus;
  tier: "free" | "pro";
  userTier: "free" | "pro";
  isMilestone: boolean;
  isGate: boolean;
  isCurrent: boolean;
  offsetX: number;
  onLockedTierClick?: () => void;
}

const MILESTONE_LESSONS = new Set([10, 15, 20, 25, 30, 35, 40, 50, 65, 70, 75, 80, 90, 95, 100]);
const GATE_LESSONS: Record<number, string> = {
  30: "Heap Freeze",
  70: "Replay Gate",
  95: "Zero Warnings",
};

export function isMilestoneLesson(order: number) {
  return MILESTONE_LESSONS.has(order);
}

export function isGateLesson(order: number) {
  return order in GATE_LESSONS;
}

export function getGateLabel(order: number) {
  return GATE_LESSONS[order] ?? null;
}

export default function LessonNode({
  id,
  order,
  title,
  xpReward,
  status,
  tier,
  userTier,
  isMilestone,
  isGate,
  isCurrent,
  offsetX,
  onLockedTierClick,
}: LessonNodeProps) {
  const isTierLocked = tier === "pro" && userTier === "free";
  const isLocked = status === "locked" || isTierLocked;

  // Sizes — must be static strings for Tailwind JIT (no dynamic sm:${var})
  const sizeClasses =
    isMilestone || isGate
      ? "w-[60px] h-[60px] sm:w-[72px] sm:h-[72px]"
      : isCurrent
      ? "w-[52px] h-[52px] sm:w-16 sm:h-16"
      : "w-12 h-12 sm:w-14 sm:h-14";

  // Colors by status
  let bg: string;
  let border: string;
  let text: string;
  let shadow: string = "";
  let animation: string = "";

  if (isTierLocked) {
    bg = "bg-[#374151]";
    border = "border-[#4b5563]";
    text = "text-[#6b7280]";
  } else if (status === "completed") {
    bg = "bg-[#22c55e]";
    border = "border-[#4ade80]";
    text = "text-white";
    shadow = "shadow-[0_0_16px_rgba(34,197,94,0.3)]";
  } else if (status === "in_progress") {
    bg = "bg-[#3b82f6]";
    border = "border-[#60a5fa]";
    text = "text-white";
    shadow = "shadow-[0_0_12px_rgba(59,130,246,0.3)]";
  } else if (status === "available") {
    bg = "bg-[#10b981]";
    border = "border-[#34d399]";
    text = "text-white";
    shadow = "shadow-[0_0_16px_rgba(16,185,129,0.4)]";
    if (isCurrent) animation = "animate-pulse";
  } else {
    // locked
    bg = "bg-[#374151]";
    border = "border-[#4b5563]";
    text = "text-[#6b7280]";
  }

  // Gate override — amber accent
  if (isGate && !isLocked && status !== "completed") {
    bg = "bg-[#f59e0b]";
    border = "border-[#fbbf24]";
    text = "text-black";
    shadow = "shadow-[0_0_16px_rgba(245,158,11,0.3)]";
  }

  const nodeContent = (
    <div
      className={`
        relative flex items-center justify-center rounded-full
        border-2 transition-all duration-200
        ${sizeClasses}
        ${bg} ${border} ${text} ${shadow} ${animation}
        ${!isLocked ? "hover:scale-110 cursor-pointer" : "opacity-50 cursor-default"}
      `}
      title={isLocked ? "Complete the previous lesson first" : `${order}. ${title} (+${xpReward} XP)`}
    >
      {/* Inner content */}
      {status === "completed" ? (
        <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M5 13l4 4L19 7" />
        </svg>
      ) : isLocked ? (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      ) : (
        <span className={`font-bold font-mono ${isMilestone || isGate ? "text-lg sm:text-xl" : "text-sm sm:text-base"}`}>
          {order}
        </span>
      )}

      {/* Milestone star badge */}
      {isMilestone && status === "completed" && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#8b5cf6] border-2 border-background flex items-center justify-center">
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
      )}

      {/* Gate shield badge */}
      {isGate && !isLocked && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#f59e0b] border-2 border-background flex items-center justify-center">
          <svg className="w-3 h-3 text-black" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
      )}

      {/* PRO lock badge */}
      {isTierLocked && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#2a1a3e] text-[#a855f7] border border-[#a855f7]/30">
          PRO
        </div>
      )}
    </div>
  );

  // Current lesson label
  const currentLabel = isCurrent && !isLocked && status !== "completed" ? (
    <div className="mt-1.5 text-[10px] font-mono font-bold text-primary uppercase tracking-wider animate-pulse">
      {status === "in_progress" ? "Continue" : "Start"}
    </div>
  ) : null;

  // Wrapper with offset positioning
  const wrapperStyle = { transform: `translateX(${offsetX}px)` };

  if (isTierLocked && onLockedTierClick) {
    return (
      <div className="flex flex-col items-center" style={wrapperStyle}>
        <button onClick={onLockedTierClick} className="outline-none">
          {nodeContent}
        </button>
        {currentLabel}
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="flex flex-col items-center" style={wrapperStyle}>
        {nodeContent}
        {currentLabel}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center" style={wrapperStyle}>
      <Link href={`/lesson/${id}`}>
        {nodeContent}
      </Link>
      {currentLabel}
    </div>
  );
}
