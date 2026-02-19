import Link from "next/link";

interface ProUpsellCardProps {
  completedCount: number;
  freeLimit: number;
}

export default function ProUpsellCard({ completedCount, freeLimit }: ProUpsellCardProps) {
  const progress = Math.min((completedCount / freeLimit) * 100, 100);
  const isNearLimit = completedCount >= freeLimit - 1;

  return (
    <div className="rounded-xl border border-[#a855f7]/20 bg-gradient-to-b from-[#1a0e2e]/60 to-[#12121a] p-4 relative overflow-hidden">
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#a855f7]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <svg className="h-3.5 w-3.5 text-[#a855f7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <span className="text-[10px] font-mono font-bold text-[#a855f7] uppercase tracking-wider">
            HeapSight Pro
          </span>
        </div>

        <p className="text-[10px] font-mono text-[#888] mb-3">
          Unlock all 100 lessons, AI tutor, GitHub export & portfolio
        </p>

        {/* Free lesson usage bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-mono text-[#666]">Free lessons</span>
            <span className={`text-[9px] font-mono font-bold ${isNearLimit ? "text-[#f97316]" : "text-[#666]"}`}>
              {Math.min(completedCount, freeLimit)}/{freeLimit}
            </span>
          </div>
          <div className="w-full bg-[#1a1a2e] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-700 ${
                isNearLimit
                  ? "bg-gradient-to-r from-[#f97316] to-[#ef4444]"
                  : "bg-gradient-to-r from-[#a855f7] to-[#6366f1]"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Link
          href="/upgrade"
          className="flex items-center justify-center w-full bg-gradient-to-r from-[#a855f7] to-[#6366f1] hover:from-[#9333ea] hover:to-[#4f46e5] text-white font-semibold px-4 py-2.5 rounded-lg transition-all text-xs"
        >
          Try Pro &mdash; $29/mo
        </Link>
      </div>
    </div>
  );
}
