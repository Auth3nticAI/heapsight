interface LevelCardProps {
  level: number;
  title: string;
  xpInLevel: number;
  xpForNext: number;
  progress: number;
  totalXp: number;
  streakCount: number;
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  );
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 23c-4.97 0-8-3.03-8-7.5 0-3.5 2-6.5 4-8.5.33-.33.83-.15.93.28.3 1.3.87 2.42 1.57 3.22C11.1 7.5 12 4 12 2c0-.55.45-.73.8-.4C15.8 4.2 20 8.5 20 15.5c0 4.47-3.03 7.5-8 7.5z"/>
    </svg>
  );
}

export default function LevelCard({
  level,
  title,
  xpInLevel,
  xpForNext,
  progress,
  totalXp,
  streakCount,
}: LevelCardProps) {
  return (
    <div className="rounded-xl border border-[#2a1a3e]/50 bg-gradient-to-b from-[#1a1028] to-[#12121a] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gradient-to-r from-[#a855f7] to-[#6366f1] text-white">
            LVL {level}
          </span>
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
      </div>

      <div className="w-full bg-[#1a1a2e] rounded-full h-2 overflow-hidden mb-1.5">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-[#a855f7] to-[#6366f1] transition-all duration-700 relative overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 shimmer-overlay animate-shimmer" />
        </div>
      </div>
      <p className="text-[10px] font-mono text-[#666] text-right mb-4">
        {xpInLevel} / {xpForNext} XP
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ZapIcon className="h-3.5 w-3.5 text-[#fbbf24]" />
          <span className="text-xs font-mono font-bold text-[#fbbf24]">{totalXp}</span>
          <span className="text-[9px] font-mono text-[#666]">XP</span>
        </div>
        {streakCount > 0 && (
          <div className="flex items-center gap-1.5">
            <FlameIcon className="h-3.5 w-3.5 text-[#f97316]" />
            <span className="text-xs font-mono font-bold text-[#f97316]">{streakCount}</span>
            <span className="text-[9px] font-mono text-[#666]">day{streakCount !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>
    </div>
  );
}
