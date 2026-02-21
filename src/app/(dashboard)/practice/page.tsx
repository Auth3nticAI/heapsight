"use client";

import Link from "next/link";

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

const DAILY_QUESTS = [
  {
    id: "speed_run",
    title: "Speed Run",
    description: "Complete any lesson in under 3 minutes",
    xp: 75,
    icon: "\u26A1",
    difficulty: "Medium",
    locked: true,
  },
  {
    id: "perfect_score",
    title: "Perfect Score",
    description: "Pass all tests on your first try",
    xp: 100,
    icon: "\uD83C\uDFAF",
    difficulty: "Hard",
    locked: true,
  },
  {
    id: "code_review",
    title: "Code Review",
    description: "Find and fix the bug in a code snippet",
    xp: 50,
    icon: "\uD83D\uDD0D",
    difficulty: "Easy",
    locked: true,
  },
];

const WEEKLY_CHALLENGES = [
  {
    id: "memory_maze",
    title: "Memory Maze",
    description: "Navigate through heap allocations without leaking memory",
    xp: 250,
    icon: "\uD83E\uDDE0",
    timeLimit: "15 min",
  },
  {
    id: "pointer_puzzle",
    title: "Pointer Puzzle",
    description: "Solve a chain of pointer dereferences to find the hidden value",
    xp: 300,
    icon: "\uD83E\uDDE9",
    timeLimit: "20 min",
  },
];

export default function PracticePage() {
  return (
    <>
      {/* Header */}
      <header className="border-b border-white/[0.05] px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="lg:hidden md:pl-12">
            <h1 className="text-xl font-semibold text-white">Practice</h1>
            <p className="text-xs text-[#AFBCD5]/50 font-mono mt-0.5">Quick drills &amp; challenges</p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <TargetIcon className="h-6 w-6 text-[#60a5fa]" />
            <div>
              <h1 className="text-xl font-semibold text-white">Practice</h1>
              <p className="text-xs text-[#AFBCD5]/50 font-mono mt-0.5">
                Sharpen your skills with daily quests and weekly challenges
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Welcome Banner */}
        <div className="mb-8 p-6 rounded-xl border border-[#60a5fa]/20 bg-gradient-to-br from-[#0e1a2e] to-[#121228] text-center">
          <div className="text-5xl mb-4">{"\uD83C\uDFAF"}</div>
          <h2 className="text-xl font-bold text-white mb-2">Practice Mode Coming Soon</h2>
          <p className="text-sm text-[#AFBCD5]/70 font-mono max-w-md mx-auto mb-4">
            Daily quests, speed challenges, and code review exercises to reinforce your C++ skills.
          </p>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#246BFD] to-[#0040C3] text-white font-semibold text-sm rounded-lg hover:opacity-90 transition-colors min-h-[44px] touch-manipulation"
          >
            Start a Lesson Instead &rarr;
          </Link>
        </div>

        {/* Daily Quests Preview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Daily Quests</h3>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#246BFD]/20 text-[#246BFD] border border-[#246BFD]/30">
                COMING SOON
              </span>
            </div>
            <span className="text-[9px] font-mono text-[#AFBCD5]/50">Resets daily at midnight</span>
          </div>

          <div className="space-y-3">
            {DAILY_QUESTS.map((quest) => (
              <div
                key={quest.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.05] bg-[#071528] opacity-50"
              >
                <div className="text-2xl shrink-0">{quest.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white">{quest.title}</h4>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
                      quest.difficulty === "Easy"
                        ? "bg-primary/20 text-primary"
                        : quest.difficulty === "Medium"
                        ? "bg-[#fbbf24]/20 text-[#fbbf24]"
                        : "bg-danger/20 text-danger"
                    }`}>
                      {quest.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-[#AFBCD5]/50 font-mono mt-0.5">{quest.description}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-xs font-mono text-[#fbbf24]">+{quest.xp} XP</span>
                  <LockIcon className="h-4 w-4 text-[#AFBCD5]/50" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Challenges Preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Weekly Challenges</h3>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30">
                COMING SOON
              </span>
            </div>
            <span className="text-[9px] font-mono text-[#AFBCD5]/50">New challenge every Monday</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WEEKLY_CHALLENGES.map((challenge) => (
              <div
                key={challenge.id}
                className="p-5 rounded-xl border border-[#a855f7]/20 bg-gradient-to-br from-[#1a0e2e]/40 to-[#0e1a3e]/40 opacity-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{challenge.icon}</span>
                  <div className="flex items-center gap-1 text-[9px] font-mono text-[#AFBCD5]/70">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                    {challenge.timeLimit}
                  </div>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{challenge.title}</h4>
                <p className="text-xs font-mono text-[#AFBCD5]/50 mb-3">{challenge.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#fbbf24]">+{challenge.xp} XP</span>
                  <LockIcon className="h-4 w-4 text-[#AFBCD5]/50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
