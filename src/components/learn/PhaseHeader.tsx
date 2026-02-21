interface PhaseHeaderProps {
  icon: string;
  title: string;
  description: string;
  phaseNumber: number;
  completedCount: number;
  totalCount: number;
}

export default function PhaseHeader({
  icon,
  title,
  description,
  phaseNumber,
  completedCount,
  totalCount,
}: PhaseHeaderProps) {
  const allDone = completedCount === totalCount && totalCount > 0;

  return (
    <div className="relative py-6">
      {/* Horizontal line */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-[#1f2937]" />

      {/* Center pill */}
      <div className="relative mx-auto w-fit flex flex-col items-center gap-1 bg-background px-5 py-2 rounded-xl border border-[#1f2937]">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            {icon}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Phase {phaseNumber}
          </span>
          {allDone && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary">
              CLEAR
            </span>
          )}
        </div>
        <span className="text-sm font-semibold text-white">{title}</span>
        <span className="text-[10px] font-mono text-[#666]">{description}</span>
        <div className="flex items-center gap-1 mt-0.5">
          {Array.from({ length: totalCount }, (_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i < completedCount ? "bg-primary" : "bg-white/[0.08]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
