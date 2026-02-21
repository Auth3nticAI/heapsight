"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 3h14v2h-1v2a6 6 0 01-4 5.66V15h2a3 3 0 013 3v1H5v-1a3 3 0 013-3h2v-2.34A6 6 0 016 7V5H5V3zm3 2v2a4 4 0 008 0V5H8z" />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

interface LeaderEntry {
  id: string;
  display: string;
  score: number;
  rank: number;
}

export default function LeaderboardPreview() {
  const [topThree, setTopThree] = useState<LeaderEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data } = await supabase
        .from("weekly_leaderboard" as string)
        .select("id, display_name, weekly_xp")
        .limit(3);

      if (cancelled) return;

      if (data) {
        const entries = (data as { id: string; display_name: string; weekly_xp: number }[]).map(
          (r, i) => ({
            id: r.id,
            display: r.display_name || "Anonymous",
            score: r.weekly_xp || 0,
            rank: i + 1,
          })
        );
        setTopThree(entries);

        // Determine user rank
        if (user) {
          const userIdx = entries.findIndex((e) => e.id === user.id);
          if (userIdx >= 0) {
            setMyRank(userIdx + 1);
          } else {
            // Not in top 3 — estimate weekly rank from leaderboard view
            const { data: fullBoard } = await supabase
              .from("weekly_leaderboard" as string)
              .select("id, weekly_xp")
              .limit(100);
            if (fullBoard && !cancelled) {
              const idx = (fullBoard as { id: string; weekly_xp: number }[])
                .findIndex((r) => r.id === user.id);
              if (idx >= 0) setMyRank(idx + 1);
            }
          }
        }
      }

      if (!cancelled) setLoading(false);
    }

    fetch();
    return () => { cancelled = true; };
  }, []);

  const MEDALS = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];

  if (loading) {
    return (
      <div className="rounded-xl border border-white/[0.05] bg-[#071528] p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrophyIcon className="h-4 w-4 text-[#fbbf24]" />
          <h3 className="text-sm font-semibold text-white">Top Learners</h3>
        </div>
        <p className="text-xs font-mono text-[#555] animate-pulse">Loading...</p>
      </div>
    );
  }

  if (topThree.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#071528] p-4">
      {/* User rank pill if top 3 */}
      {myRank && myRank <= 3 && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-gradient-to-r from-[#1a1a0e]/60 to-[#1a160e]/60 border border-[#fbbf24]/20 flex items-center gap-2">
          <span className="text-2xl">{MEDALS[myRank - 1]}</span>
          <span className="text-sm font-bold text-white">
            You&apos;re #{myRank} This Week!
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrophyIcon className="h-4 w-4 text-[#fbbf24]" />
          <h3 className="text-sm font-semibold text-white">Top Learners This Week</h3>
        </div>
        <a
          href="#leaderboard"
          className="text-[10px] font-mono text-primary hover:text-primary/80 transition-colors"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("leaderboard")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          View All &rarr;
        </a>
      </div>

      {/* Top 3 */}
      <div className="space-y-1.5">
        {topThree.map((leader) => (
          <div
            key={leader.id}
            className={`flex items-center gap-2.5 p-2.5 rounded-lg ${
              leader.rank <= 3
                ? "bg-gradient-to-r from-[#1a1a0e]/40 to-transparent"
                : "bg-[#040B10]"
            }`}
          >
            <span className="text-lg w-6 text-center shrink-0">
              {MEDALS[leader.rank - 1]}
            </span>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center text-white font-bold text-[10px] shrink-0">
              {leader.display.charAt(0).toUpperCase()}
            </div>
            <span className="flex-1 text-xs font-mono text-white truncate">
              {leader.display}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <ZapIcon className="h-3 w-3 text-[#fbbf24]" />
              <span className="text-xs font-bold text-[#fbbf24] font-mono">{leader.score}</span>
            </div>
          </div>
        ))}
      </div>

      {/* User's rank if not in top 3 */}
      {myRank && myRank > 3 && (
        <div className="mt-3 pt-3 border-t border-white/[0.05]">
          <p className="text-[10px] text-[#888] text-center font-mono">
            You&apos;re ranked <span className="text-white font-semibold">#{myRank}</span> this week
          </p>
        </div>
      )}
    </div>
  );
}
