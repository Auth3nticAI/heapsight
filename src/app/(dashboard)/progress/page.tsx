"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { ACHIEVEMENTS, getRarityColor, getRarityGradient } from "@/lib/achievements";
import { getUserAchievementIds } from "@/lib/achievement-manager";
import { getLevelInfo } from "@/lib/lesson-metadata";
import { ALL_RPG_LESSONS } from "@/data/lessons/rpg-index";
import { ALL_PLATFORMER_LESSONS } from "@/data/lessons/platformer-index";
import { ALL_CRAWLER_LESSONS } from "@/data/lessons/crawler-index";
import { ALL_SHOOTER_LESSONS } from "@/data/lessons/shooter-index";
import { ALL_ROGUELIKE_LESSONS } from "@/data/lessons/roguelike-index";
import Link from "next/link";


function FlameIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 23c-4.97 0-8-3.03-8-7.5 0-3.5 2-6.5 4-8.5.33-.33.83-.15.93.28.3 1.3.87 2.42 1.57 3.22C11.1 7.5 12 4 12 2c0-.55.45-.73.8-.4C15.8 4.2 20 8.5 20 15.5c0 4.47-3.03 7.5-8 7.5z" />
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

interface StatsData {
  totalXp: number;
  completedLessons: number;
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
  template: string | null;
}

export default function ProgressPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, streakRes, progressRes, activityRes] = await Promise.all([
        supabase.from("profiles").select("total_xp, selected_game_template").eq("id", user.id).single(),
        supabase.from("user_streaks").select("current_streak, longest_streak").eq("user_id", user.id).single(),
        supabase.from("lesson_progress").select("status").eq("user_id", user.id),
        supabase.from("daily_activity").select("activity_date").eq("user_id", user.id),
      ]);

      const completed = progressRes.data?.filter((p) => p.status === "completed").length || 0;
      const ids = await getUserAchievementIds(user.id);

      setStats({
        totalXp: profileRes.data?.total_xp || 0,
        completedLessons: completed,
        currentStreak: streakRes.data?.current_streak || 0,
        longestStreak: streakRes.data?.longest_streak || 0,
        totalDaysActive: activityRes.data?.length || 0,
        template: profileRes.data?.selected_game_template || null,
      });
      setUnlockedIds(ids);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm font-mono text-[#AFBCD5]/50 animate-pulse">Loading progress...</p>
      </div>
    );
  }

  if (!stats) return null;

  const levelInfo = getLevelInfo(stats.totalXp);
  const unlockedCount = unlockedIds.size;
  const totalAchievements = ACHIEVEMENTS.length;

  return (
    <>
      {/* Header */}
      <header className="border-b border-white/[0.05] px-4 sm:px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <div className="md:pl-12 lg:pl-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Progress
            </h1>
            <p className="text-xs text-[#AFBCD5]/50 font-mono mt-1 hidden lg:block">
              Detailed statistics, achievements, and streak history
            </p>
            <p className="text-xs text-[#AFBCD5]/50 font-mono mt-1 lg:hidden">Your stats &amp; achievements</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            {
              label: "Total XP",
              value: stats.totalXp.toLocaleString(),
              icon: <ZapIcon className="h-5 w-5 text-[#fbbf24]" />,
            },
            {
              label: "Lessons Done",
              value: `${stats.completedLessons}/${
                stats.template === "simple_rpg" ? ALL_RPG_LESSONS.length :
                stats.template === "platformer" ? ALL_PLATFORMER_LESSONS.length :
                stats.template === "dungeon_crawler" ? ALL_CRAWLER_LESSONS.length :
                stats.template === "roguelike" ? ALL_ROGUELIKE_LESSONS.length :
                ALL_SHOOTER_LESSONS.length
              }`,
              icon: <span className="text-xl">{"\u2713"}</span>,
            },
            {
              label: "Current Streak",
              value: `${stats.currentStreak} day${stats.currentStreak !== 1 ? "s" : ""}`,
              icon: <FlameIcon className="h-5 w-5 text-[#f97316]" />,
            },
            {
              label: "Days Active",
              value: stats.totalDaysActive.toString(),
              icon: <span className="text-xl">{"\uD83D\uDCC5"}</span>,
            },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-2xl border border-white/[0.08] bg-[#071528]">
              <div className="flex items-center gap-2 mb-2">{stat.icon}</div>
              <p className="text-lg font-bold text-white font-mono">{stat.value}</p>
              <p className="text-[9px] font-mono text-[#AFBCD5]/60 uppercase">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Level Progress */}
        <div className="mb-8 p-5 rounded-2xl border border-white/[0.08] bg-[#071528]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#246BFD] to-[#0040C3] text-white">
                LVL {levelInfo.level}
              </span>
              <span className="text-base font-bold text-white">{levelInfo.title}</span>
            </div>
            <span className="text-xs font-mono text-[#AFBCD5]/60 shrink-0">
              {levelInfo.xpInLevel}/{levelInfo.xpForNext} XP
            </span>
          </div>
          <div className="w-full bg-white/[0.05] rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-[#246BFD] to-[#0040C3] transition-all duration-700 relative overflow-hidden"
              style={{ width: `${levelInfo.progress}%` }}
            >
              <div className="absolute inset-0 shimmer-overlay animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Streak History */}
        <div className="mb-8 p-5 rounded-2xl border border-white/[0.08] bg-[#071528]">
          <div className="flex items-center gap-2 mb-4">
            <FlameIcon className="h-5 w-5 text-[#f97316]" />
            <h3 className="text-sm font-semibold text-white">Streak Stats</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-[#f97316] font-mono">{stats.currentStreak}</p>
              <p className="text-[9px] font-mono text-[#AFBCD5]/60 uppercase">Current Streak</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-mono">{stats.longestStreak}</p>
              <p className="text-[9px] font-mono text-[#AFBCD5]/60 uppercase">Longest Streak</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#246BFD] font-mono">{stats.totalDaysActive}</p>
              <p className="text-[9px] font-mono text-[#AFBCD5]/60 uppercase">Total Days</p>
            </div>
          </div>

          {/* Streak milestones */}
          <div className="mt-4 pt-4 border-t border-white/[0.05]">
            <p className="text-[9px] font-mono text-[#AFBCD5]/60 mb-2">MILESTONES</p>
            <div className="flex flex-wrap gap-2">
              {[7, 14, 30, 60, 100, 365].map((milestone) => {
                const reached = stats.longestStreak >= milestone;
                return (
                  <div
                    key={milestone}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${
                      reached
                        ? "bg-[#f97316]/10 text-[#f97316] border-[#f97316]/30"
                        : "bg-white/[0.03] text-[#AFBCD5]/40 border-white/[0.05]"
                    }`}
                  >
                    {milestone}d {reached ? "\u2713" : ""}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* All Achievements */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              Achievements ({unlockedCount}/{totalAchievements})
            </h3>
            <span className="text-[9px] font-mono text-[#AFBCD5]/50">
              {Math.round((unlockedCount / totalAchievements) * 100)}% complete
            </span>
          </div>

          {/* Achievement progress bar */}
          <div className="w-full bg-white/[0.05] rounded-full h-2 overflow-hidden mb-6">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] transition-all duration-500"
              style={{ width: `${(unlockedCount / totalAchievements) * 100}%` }}
            />
          </div>

          {/* Group by category */}
          {(["learning", "streak", "mastery"] as const).map((category) => {
            const categoryAchievements = ACHIEVEMENTS.filter((a) => a.category === category);
            const categoryLabel = category === "learning" ? "Learning" : category === "streak" ? "Streak" : "Mastery";

            return (
              <div key={category} className="mb-6">
                <h4 className="text-xs font-mono font-bold text-[#AFBCD5]/70 uppercase tracking-wider mb-3">
                  {categoryLabel}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoryAchievements.map((achievement) => {
                    const unlocked = unlockedIds.has(achievement.id);
                    return (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-xl border transition-all ${
                          unlocked
                            ? `bg-gradient-to-br ${getRarityGradient(achievement.rarity)} ${getRarityColor(achievement.rarity)}`
                            : "bg-[#071528] border-white/[0.05] opacity-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`text-2xl ${unlocked ? "" : "grayscale"}`}>
                            {achievement.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold truncate ${unlocked ? "text-white" : "text-[#AFBCD5]/50"}`}>
                              {achievement.title}
                            </p>
                            <p className="text-[9px] font-mono text-[#AFBCD5]/70 mt-0.5">
                              {achievement.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`text-[8px] font-mono font-bold uppercase ${
                                unlocked ? "text-[#fbbf24]" : "text-[#AFBCD5]/50"
                              }`}>
                                {achievement.rarity}
                              </span>
                              <span className="text-[8px] font-mono text-[#AFBCD5]/50">
                                +{achievement.xp_reward} XP
                              </span>
                              {unlocked && (
                                <span className="text-[8px] font-mono text-primary font-bold">{"\u2713"} Unlocked</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA if missing achievements */}
        {unlockedCount < totalAchievements && (
          <div className="mt-6 text-center">
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#246BFD] hover:bg-[#0040C3] text-white font-semibold text-sm rounded-xl transition-colors min-h-[44px] touch-manipulation"
            >
              Continue Learning to Unlock More &rarr;
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
