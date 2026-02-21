"use client";

import Link from "next/link";

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 16l.75 2.25L8 19l-2.25.75L5 22l-.75-2.25L2 19l2.25-.75L5 16z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

interface ProTeaserProps {
  completedCount: number;
  isCrawlerPath?: boolean;
  nextLockedLessons: Array<{
    number: number;
    title: string;
    description: string;
  }>;
}

export default function ProTeaser({
  completedCount,
  nextLockedLessons,
}: ProTeaserProps) {
  if (completedCount < 3) return null;

  return (
    <div className="mb-6 rounded-xl border border-[#a855f7]/30 bg-gradient-to-br from-[#1a0e2e]/80 to-[#0e1a3e]/80 p-5 overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-[#a855f7]/5 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Congrats */}
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <CheckIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-0.5">
              You&apos;ve mastered the basics!
            </h3>
            <p className="text-xs font-mono text-[#a855f7]">
              {completedCount} free lessons completed. Ready for more?
            </p>
          </div>
        </div>

        {/* Preview next locked lessons */}
        {nextLockedLessons.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] font-mono font-bold text-[#a855f7]/80 uppercase tracking-wider mb-2">
              Next up with Pro
            </p>
            <div className="space-y-2">
              {nextLockedLessons.slice(0, 3).map((lesson) => (
                <div
                  key={lesson.number}
                  className="bg-[#0a0a0f]/60 border border-[#2a2a3e] rounded-lg p-3 relative overflow-hidden"
                >
                  {/* Blur overlay */}
                  <div className="absolute inset-0 backdrop-blur-[2px] bg-[#0a0a0f]/40 flex items-center justify-center z-10">
                    <LockIcon className="h-4 w-4 text-[#a855f7]" />
                  </div>
                  {/* Content visible through blur */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#a855f7] font-mono">
                      #{lesson.number}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-white">{lesson.title}</p>
                      <p className="text-[9px] font-mono text-[#666] mt-0.5">
                        {lesson.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <Link
          href="/upgrade"
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#a855f7] to-[#6366f1] hover:from-[#9333ea] hover:to-[#4f46e5] text-white font-semibold px-5 py-3.5 rounded-xl transition-all shadow-lg shadow-[#a855f7]/20 min-h-[48px] touch-manipulation"
        >
          <SparklesIcon className="h-5 w-5" />
          <span className="text-sm">Unlock All Lessons &mdash; $29/mo</span>
        </Link>

        <p className="text-[9px] text-center text-[#a855f7]/60 font-mono mt-2">
          Or $199/year (save 43%). Cancel anytime.
        </p>
      </div>
    </div>
  );
}
