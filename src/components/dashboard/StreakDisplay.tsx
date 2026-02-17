"use client";

import Link from "next/link";

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 23c-4.97 0-8-3.03-8-7.5 0-3.5 2-6.5 4-8.5.33-.33.83-.15.93.28.3 1.3.87 2.42 1.57 3.22C11.1 7.5 12 4 12 2c0-.55.45-.73.8-.4C15.8 4.2 20 8.5 20 15.5c0 4.47-3.03 7.5-8 7.5z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

interface StreakDisplayProps {
  streakCount: number;
  longestStreak: number;
  freezeCount: number;
  tier: "free" | "pro";
}

export default function StreakDisplay({ streakCount, longestStreak, freezeCount, tier }: StreakDisplayProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Streak Fire */}
      <div className="relative group">
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-default ${
            streakCount > 0
              ? "bg-[#1a0e0e] border-[#3a1e1e]"
              : "bg-[#1a1a2e] border-[#2a2a3e]"
          }`}
        >
          <FlameIcon
            className={`h-4 w-4 ${
              streakCount > 0 ? "text-[#f97316] animate-pulse" : "text-[#555]"
            }`}
          />
          <span
            className={`text-sm font-mono font-bold ${
              streakCount > 0 ? "text-[#f97316]" : "text-[#555]"
            }`}
          >
            {streakCount}
          </span>
          <span className="text-[10px] font-mono text-[#888] hidden sm:inline">
            day{streakCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Tooltip */}
        {streakCount > 0 && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
            <p className="text-[10px] font-mono text-[#888]">
              Longest:{" "}
              <span className="text-[#f97316] font-bold">{longestStreak}</span> day
              {longestStreak !== 1 ? "s" : ""}
            </p>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a1a2e] border-l border-t border-[#2a2a3e] rotate-45" />
          </div>
        )}
      </div>

      {/* Streak Freeze (Pro only) */}
      {tier === "pro" && (
        <div className="relative group">
          <div
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border cursor-default ${
              freezeCount > 0
                ? "bg-[#0e1a2e] border-[#1e3a5e] text-[#60a5fa]"
                : "bg-[#1a1a2e] border-[#2a2a3e] text-[#555]"
            }`}
          >
            <ShieldIcon className="h-3.5 w-3.5" />
            <span className="text-[10px] font-mono font-bold">{freezeCount}</span>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
            <p className="text-[10px] font-mono text-[#888]">
              Streak Freeze &mdash; protects your streak if you miss a day
            </p>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a1a2e] border-l border-t border-[#2a2a3e] rotate-45" />
          </div>
        </div>
      )}

      {/* Free users — upgrade tease after 7-day streak */}
      {tier === "free" && streakCount >= 7 && (
        <Link
          href="/upgrade"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-[#a855f7]/30 bg-[#a855f7]/10 text-[#a855f7] hover:bg-[#a855f7]/20 transition-colors"
        >
          <ShieldIcon className="h-3.5 w-3.5" />
          <span className="text-[10px] font-mono font-bold">Get Freeze</span>
        </Link>
      )}
    </div>
  );
}
