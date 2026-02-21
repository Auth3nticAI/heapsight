"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

// ─── Inline SVG icons ────────────────────────────────────────────────────────
function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 3h14v2h-1v2a6 6 0 01-4 5.66V15h2a3 3 0 013 3v1H5v-1a3 3 0 013-3h2v-2.34A6 6 0 016 7V5H5V3zm3 2v2a4 4 0 008 0V5H8z" />
    </svg>
  );
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 23c-4.97 0-8-3.03-8-7.5 0-3.5 2-6.5 4-8.5.33-.33.83-.15.93.28.3 1.3.87 2.42 1.57 3.22C11.1 7.5 12 4 12 2c0-.55.45-.73.8-.4C15.8 4.2 20 8.5 20 15.5c0 4.47-3.03 7.5-8 7.5z" />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────
type Tab = "week" | "all_time" | "streak";

interface LeaderEntry {
  id: string;
  display: string;
  score: number;
  rank: number;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function Leaderboard() {
  const [tab, setTab] = useState<Tab>("week");
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLeaders() {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let entries: LeaderEntry[] = [];

      if (tab === "all_time") {
        const { data } = await supabase
          .from("profiles")
          .select("id, email, total_xp")
          .order("total_xp", { ascending: false })
          .limit(10);

        entries =
          data?.map((p, i) => ({
            id: p.id,
            display: (p.email as string)?.split("@")[0] || "Anonymous",
            score: p.total_xp || 0,
            rank: i + 1,
          })) || [];

        // Find user rank if not in top 10
        if (user && !entries.find((e) => e.id === user.id)) {
          const { count } = await supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .gt("total_xp", entries[entries.length - 1]?.score || 0);
          if (count !== null) setMyRank(count + 1);
        }
      } else if (tab === "streak") {
        const { data } = await supabase
          .from("user_streaks")
          .select("user_id, current_streak")
          .order("current_streak", { ascending: false })
          .limit(10);

        if (data && data.length > 0) {
          const userIds = data.map((s) => s.user_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, email")
            .in("id", userIds);

          const profileMap = new Map(
            profiles?.map((p) => [p.id, (p.email as string)?.split("@")[0] || "Anonymous"])
          );

          entries = data.map((s, i) => ({
            id: s.user_id,
            display: profileMap.get(s.user_id) || "Anonymous",
            score: s.current_streak,
            rank: i + 1,
          }));
        }
      } else {
        // Week — use weekly_leaderboard view
        const { data } = await supabase
          .from("weekly_leaderboard" as string)
          .select("id, display_name, weekly_xp")
          .limit(10);

        if (data) {
          entries = (data as { id: string; display_name: string; weekly_xp: number }[]).map(
            (r, i) => ({
              id: r.id,
              display: r.display_name || "Anonymous",
              score: r.weekly_xp || 0,
              rank: i + 1,
            })
          );
        }
      }

      if (!cancelled) {
        setLeaders(entries);
        setLoading(false);
      }
    }

    fetchLeaders();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const TABS: { id: Tab; label: string }[] = [
    { id: "week", label: "This Week" },
    { id: "all_time", label: "All Time" },
    { id: "streak", label: "Streaks" },
  ];

  const MEDALS = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];

  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#071528] p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <TrophyIcon className="h-5 w-5 text-[#fbbf24]" />
        <h2 className="text-lg font-bold text-white">Leaderboard</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-colors min-h-[44px] ${
              tab === t.id
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-white/[0.05] text-[#AFBCD5]/70 border-white/[0.08] hover:border-white/[0.15]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center text-[#AFBCD5]/50 py-8 text-sm font-mono animate-pulse">
          Loading...
        </div>
      ) : leaders.length === 0 ? (
        <div className="text-center text-[#AFBCD5]/50 py-8 text-sm font-mono">
          No data yet. Be the first!
        </div>
      ) : (
        <div className="space-y-2">
          {leaders.map((leader) => (
            <div
              key={leader.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                leader.rank <= 3
                  ? "bg-gradient-to-r from-[#1a1a0e]/60 to-[#1a160e]/60 border border-[#fbbf24]/20"
                  : "bg-[#040B10] hover:bg-white/[0.04]"
              }`}
            >
              {/* Rank */}
              <div className="w-8 text-center shrink-0">
                {leader.rank <= 3 ? (
                  <span className="text-2xl">{MEDALS[leader.rank - 1]}</span>
                ) : (
                  <span className="text-lg font-bold text-[#AFBCD5]/50 font-mono">
                    {leader.rank}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center text-white font-bold text-sm shrink-0">
                {leader.display.charAt(0).toUpperCase()}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate font-mono">
                  {leader.display}
                </p>
              </div>

              {/* Score */}
              <div className="flex items-center gap-1 shrink-0">
                {tab === "streak" ? (
                  <>
                    <FlameIcon className="h-4 w-4 text-[#f97316]" />
                    <span className="text-base font-bold text-[#f97316] font-mono">
                      {leader.score}
                    </span>
                    <span className="text-[9px] text-[#AFBCD5]/70 font-mono">
                      days
                    </span>
                  </>
                ) : (
                  <>
                    <ZapIcon className="h-4 w-4 text-[#fbbf24]" />
                    <span className="text-base font-bold text-[#fbbf24] font-mono">
                      {leader.score}
                    </span>
                    <span className="text-[9px] text-[#AFBCD5]/70 font-mono">XP</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User's rank if not in top 10 */}
      {myRank && myRank > 10 && (
        <div className="mt-4 pt-4 border-t border-white/[0.05]">
          <p className="text-sm text-[#AFBCD5]/70 text-center font-mono">
            You&apos;re ranked #{myRank}
          </p>
        </div>
      )}
    </div>
  );
}
