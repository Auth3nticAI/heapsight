"use client";

import Link from "next/link";

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 16l.75 2.25L8 19l-2.25.75L5 22l-.75-2.25L2 19l2.25-.75L5 16z" />
    </svg>
  );
}

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 01-1 1H9a1 1 0 01-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
      <path d="M9 21h6" />
    </svg>
  );
}

function RocketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 3 0 3 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-3 0-3" />
    </svg>
  );
}

interface UpgradeBannerProps {
  completedCount: number;
  freeLimit: number;
}

export default function UpgradeBanner({ completedCount, freeLimit }: UpgradeBannerProps) {
  const progress = Math.min((completedCount / freeLimit) * 100, 100);
  const isNearLimit = completedCount >= freeLimit - 1;

  return (
    <div className="mb-6 rounded-xl border border-[#a855f7]/20 bg-gradient-to-br from-[#1a0e2e]/60 via-[#12121a] to-[#0e1a3e]/60 p-5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#a855f7]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#6366f1]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="h-4 w-4 text-[#a855f7]" />
          <span className="text-xs font-mono font-bold text-[#a855f7] uppercase tracking-wider">
            Upgrade to Pro
          </span>
        </div>

        {/* Free lesson progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-[#888]">
              Free lessons used
            </span>
            <span className={`text-[10px] font-mono font-bold ${isNearLimit ? "text-[#f97316]" : "text-[#888]"}`}>
              {Math.min(completedCount, freeLimit)}/{freeLimit}
            </span>
          </div>
          <div className="w-full bg-white/[0.05] rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${
                isNearLimit
                  ? "bg-gradient-to-r from-[#f97316] to-[#ef4444]"
                  : "bg-gradient-to-r from-[#a855f7] to-[#6366f1]"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {isNearLimit && (
            <p className="text-[9px] font-mono text-[#f97316] mt-1">
              {completedCount >= freeLimit
                ? "You've completed all free lessons!"
                : "Almost at the free limit!"}
            </p>
          )}
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 bg-[#040B10]/50 rounded-lg p-2.5 border border-white/[0.05]">
            <BrainIcon className="h-4 w-4 text-[#a855f7] shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-white">AI Tutor</p>
              <p className="text-[8px] font-mono text-[#666]">Error explanations</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#040B10]/50 rounded-lg p-2.5 border border-white/[0.05]">
            <RocketIcon className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-white">100 Lessons/Path</p>
              <p className="text-[8px] font-mono text-[#666]">400 total</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/upgrade"
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#a855f7] to-[#6366f1] hover:from-[#9333ea] hover:to-[#4f46e5] text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-lg shadow-[#a855f7]/20 min-h-[44px] touch-manipulation"
        >
          <span className="text-sm">Start Pro &mdash; $29/mo</span>
        </Link>

        <p className="text-[9px] text-center text-[#a855f7]/60 font-mono mt-2">
          Or $199/year (save 43%) &middot; Cancel anytime
        </p>
      </div>
    </div>
  );
}
