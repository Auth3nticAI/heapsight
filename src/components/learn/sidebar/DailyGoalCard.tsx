interface DailyGoalCardProps {
  completedToday: boolean;
  streakCount: number;
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
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

export default function DailyGoalCard({ completedToday, streakCount }: DailyGoalCardProps) {
  return (
    <div className={`rounded-xl border p-4 ${
      completedToday
        ? "border-primary/20 bg-gradient-to-b from-[#0a1a12] to-[#0e1a18]"
        : "border-[#1a2a3a] bg-gradient-to-b from-[#0e1a2a] to-[#12121a]"
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
          completedToday ? "bg-primary/20" : "bg-[#1a2a4a]"
        }`}>
          {completedToday ? (
            <span className="text-primary text-sm">{"\u2713"}</span>
          ) : (
            <TargetIcon className="h-4 w-4 text-[#60a5fa]" />
          )}
        </div>
        <span className="text-xs font-semibold text-white">
          {completedToday ? "Goal Complete!" : "Daily Goal"}
        </span>
      </div>

      {!completedToday ? (
        <>
          <p className="text-[10px] font-mono text-[#666] mb-2">
            Complete 1 lesson for +50 bonus XP
          </p>
          <div className="w-full bg-[#1a2a4a] rounded-full h-1.5 overflow-hidden mb-2">
            <div className="h-1.5 rounded-full bg-[#1a2a4a]" style={{ width: "0%" }} />
          </div>
          <p className="text-[9px] font-mono text-[#555] text-right">0/1</p>
        </>
      ) : (
        <p className="text-[10px] font-mono text-[#666]">
          Come back tomorrow to keep your streak.
        </p>
      )}

      {streakCount > 0 && !completedToday && (
        <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-[#60a5fa]/80">
          <FlameIcon className="h-3 w-3 text-[#f97316]" />
          <span>Keep your {streakCount}-day streak!</span>
        </div>
      )}
    </div>
  );
}
