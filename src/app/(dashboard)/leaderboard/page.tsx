"use client";

import Leaderboard from "@/components/community/Leaderboard";

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 3h14v2h-1v2a6 6 0 01-4 5.66V15h2a3 3 0 013 3v1H5v-1a3 3 0 013-3h2v-2.34A6 6 0 016 7V5H5V3zm3 2v2a4 4 0 008 0V5H8z" />
    </svg>
  );
}

export default function LeaderboardPage() {
  return (
    <>
      {/* Header */}
      <header className="border-b border-[#1a1a2e] px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="lg:hidden md:pl-12">
            <h1 className="text-xl font-semibold text-white">Leaderboard</h1>
            <p className="text-xs text-[#666] font-mono mt-0.5">Compete globally</p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <TrophyIcon className="h-6 w-6 text-[#fbbf24]" />
            <div>
              <h1 className="text-xl font-semibold text-white">Leaderboard</h1>
              <p className="text-xs text-[#666] font-mono mt-0.5">
                See how you rank against other C++ learners
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Info Banner */}
        <div className="mb-6 p-4 rounded-xl border border-[#fbbf24]/20 bg-gradient-to-r from-[#1a1a0e]/40 to-[#1a160e]/40">
          <div className="flex items-start gap-3">
            <span className="text-3xl shrink-0">{"\uD83C\uDFC6"}</span>
            <div>
              <p className="text-sm font-semibold text-white mb-1">Climb the Ranks</p>
              <p className="text-xs font-mono text-[#888]">
                Complete lessons, earn XP, and maintain streaks to climb the leaderboard.
                Top 3 get medals. Rankings reset weekly for &quot;This Week&quot; tab.
              </p>
            </div>
          </div>
        </div>

        {/* Full Leaderboard */}
        <Leaderboard />

        {/* Tips */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: "\u26A1", title: "Earn XP", desc: "Complete lessons to earn 25-100 XP each" },
            { icon: "\uD83D\uDD25", title: "Build Streaks", desc: "Daily coding builds your streak count" },
            { icon: "\uD83C\uDFC5", title: "Get Medals", desc: "Top 3 each week earn medal badges" },
          ].map((tip) => (
            <div key={tip.title} className="p-4 rounded-xl border border-[#1a1a2e] bg-surface text-center">
              <div className="text-2xl mb-2">{tip.icon}</div>
              <p className="text-xs font-semibold text-white mb-1">{tip.title}</p>
              <p className="text-[9px] font-mono text-[#666]">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
