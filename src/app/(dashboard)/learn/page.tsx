"use client";

import { useEffect, useState } from "react";
import { ALL_RPG_LESSONS } from "@/data/lessons/rpg-index";
import { ALL_PLATFORMER_LESSONS } from "@/data/lessons/platformer-index";
import { ALL_CRAWLER_LESSONS } from "@/data/lessons/crawler-index";
import { ALL_SHOOTER_LESSONS } from "@/data/lessons/shooter-index";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LessonStatus } from "@/types/lesson";
import { CRAWLER_LESSON_TITLES } from "@/data/game-templates/dungeon-crawler/lesson-titles";
import PaywallModal from "@/components/PaywallModal";
import { getLessonMeta, getLevelInfo } from "@/lib/lesson-metadata";
import { getUserAchievementIds } from "@/lib/achievement-manager";
import ContinueFAB from "@/components/dashboard/ContinueFAB";
import StreakDisplay from "@/components/dashboard/StreakDisplay";
import LessonPath from "@/components/learn/LessonPath";
import type { PathLesson } from "@/components/learn/LessonPath";
import LearnSidebar from "@/components/learn/sidebar/LearnSidebar";
import { getPathDifficulty } from "@/data/templates-info";

// ─── Inline SVG icons (header only) ─────────────────────────────────────────
function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  );
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

// ─── Types ──────────────────────────────────────────────────────────────────
interface StreakData {
  current_streak: number;
  longest_streak: number;
}

const TEMPLATE_LABELS: Record<string, string> = {
  space_shooter: "Space Shooter",
  platformer: "Platformer",
  simple_rpg: "Simple RPG",
  dungeon_crawler: "Dungeon Crawler",
};

// ─── Component ──────────────────────────────────────────────────────────────
export default function LearnPage() {
  const [lessons, setLessons] = useState<PathLesson[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [template, setTemplate] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<"free" | "pro">("free");
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [completedToday, setCompletedToday] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadProgress = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("total_xp, selected_game_template, tier")
        .eq("id", user.id)
        .single();

      if (!profile?.selected_game_template) return;

      setTotalXp(profile.total_xp ?? 0);
      setTemplate(profile.selected_game_template);
      setUserTier(profile.tier || "free");

      const isCrawler = profile.selected_game_template === "dungeon_crawler";

      const { data: streakData } = await supabase
        .from("user_streaks")
        .select("current_streak, longest_streak")
        .eq("user_id", user.id)
        .single();

      if (streakData) setStreak(streakData);

      const today = new Date().toISOString().split("T")[0];
      const { data: todayActivity } = await supabase
        .from("daily_activity")
        .select("lessons_completed")
        .eq("user_id", user.id)
        .eq("activity_date", today)
        .single();

      if (todayActivity && todayActivity.lessons_completed > 0) {
        setCompletedToday(true);
      }

      await getUserAchievementIds(user.id);

      const currentPath = profile.selected_game_template;
      const { data: allProgress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, status, part1_status, part2_status, path")
        .eq("user_id", user.id);

      const progressMap = new Map<string, { status: string; p1: string; p2: string }>();
      if (allProgress) {
        const filtered = allProgress.filter((p) => p.path === currentPath || !p.path);
        filtered.forEach((p) =>
            progressMap.set(p.lesson_id, {
              status: p.status,
              p1: p.part1_status || "not_started",
              p2: p.part2_status || "not_started",
            })
          );
      }

      const tmpl = profile.selected_game_template;
      const activeLessons =
        tmpl === "simple_rpg" ? ALL_RPG_LESSONS :
        tmpl === "platformer" ? ALL_PLATFORMER_LESSONS :
        tmpl === "dungeon_crawler" ? ALL_CRAWLER_LESSONS :
        tmpl === "space_shooter" ? ALL_SHOOTER_LESSONS :
        ALL_SHOOTER_LESSONS;

      const cards: PathLesson[] = activeLessons.map((lesson, i) => {
        const saved = progressMap.get(lesson.id);
        let status: LessonStatus;

        if (saved?.status === "completed") {
          status = "completed";
        } else if (saved?.status === "in_progress") {
          status = "in_progress";
        } else if (i === 0) {
          status = "available";
        } else {
          const prevLesson = activeLessons[i - 1];
          const prevSaved = progressMap.get(prevLesson.id);
          status = prevSaved?.status === "completed" ? "available" : "locked";
        }

        const crawlerInfo = isCrawler ? CRAWLER_LESSON_TITLES[lesson.id] : null;
        const meta = getLessonMeta(lesson.id);

        return {
          id: lesson.id,
          title: crawlerInfo?.title || lesson.title,
          description: crawlerInfo?.description || lesson.description,
          order: lesson.order,
          xpReward: lesson.xpReward,
          tier: lesson.tier,
          status,
          part1Done: saved?.p1 === "completed",
          part2Done: saved?.p2 === "completed",
          minutes: meta.minutes,
        };
      });

      setLessons(cards);
      setCompletedCount(cards.filter((c) => c.status === "completed").length);
      setLoading(false);
    };

    loadProgress();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm font-mono text-[#555] animate-pulse">Loading lessons...</p>
      </div>
    );
  }

  const isCrawlerPath = template === "dungeon_crawler";
  const totalLessons = lessons.length || 100;
  const freeCount = lessons.filter((l) => l.tier === "free").length;
  const levelInfo = getLevelInfo(totalXp);

  const currentLesson =
    lessons.find((l) => l.status === "in_progress") ||
    lessons.find((l) => l.status === "available" && (l.tier === "free" || userTier === "pro"));

  return (
    <>
      {/* ─── Header Bar ─────────────────────────────────────────────── */}
      <header className="border-b border-[#ffffff08] px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="lg:hidden md:pl-12">
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">HeapSight</h1>
            <p className="text-xs text-[#555] font-mono mt-0.5">
              Learn C++ by Building {template ? TEMPLATE_LABELS[template] || "a Project" : "a Project"}
            </p>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Learn</h2>
            <p className="text-xs text-[#555] font-mono mt-0.5">
              {template ? TEMPLATE_LABELS[template] : "Select a path"}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-[#ffffff08] px-3 py-1.5 rounded-full border border-[#ffffff10]">
              <ZapIcon className="h-4 w-4 text-[#fbbf24]" />
              <span className="text-sm font-mono font-bold text-[#fbbf24]">{totalXp}</span>
              <span className="text-[10px] font-mono text-gray-500">XP</span>
            </div>
            <StreakDisplay
              streakCount={streak?.current_streak || 0}
              longestStreak={streak?.longest_streak || 0}
              freezeCount={0}
              tier={userTier}
            />
            <div className="flex items-center gap-2">
              <div className="relative w-9 h-9">
                <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ffffff10" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#00ff88" strokeWidth="3" strokeDasharray={`${(completedCount / totalLessons) * 100}, 100`} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-[#888]">
                  {Math.round((completedCount / totalLessons) * 100)}%
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#555]">{completedCount}/{totalLessons}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Two-Column Layout ──────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex gap-8">
        {/* ─── Center Column: Lesson Path ───────────────────────────── */}
        <div className="flex-1 min-w-0 max-w-[600px] mx-auto lg:mx-0">

          {/* Mobile-only: compact daily goal banner */}
          <div className="lg:hidden mb-4">
            {!completedToday ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-[#ffffff10] bg-[#09091a]">
                <div className="h-8 w-8 rounded-full bg-[#ffffff08] flex items-center justify-center shrink-0">
                  <TargetIcon className="h-4 w-4 text-[#60a5fa]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white">Daily Goal: 0/1</p>
                  <p className="text-[9px] font-mono text-[#666] truncate">Complete 1 lesson for +50 XP</p>
                </div>
                {streak && streak.current_streak > 0 && (
                  <div className="flex items-center gap-1 shrink-0">
                    <FlameIcon className="h-3.5 w-3.5 text-[#f97316]" />
                    <span className="text-[10px] font-mono font-bold text-[#f97316]">{streak.current_streak}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-teal-500/20 bg-teal-900/10">
                <div className="h-8 w-8 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                  <span className="text-teal-400 text-sm">{"\u2713"}</span>
                </div>
                <p className="text-xs font-semibold text-white">Daily Goal Complete!</p>
              </div>
            )}
          </div>

          {/* Path Title */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-semibold text-white">
                  {isCrawlerPath ? "C++ Dungeon Crawler Path" : "C++ Game Dev Path"}
                </h2>
                {template && (() => {
                  const diff = getPathDifficulty(template);
                  return (
                    <span className="flex items-center gap-1.5 text-[9px] font-mono text-gray-400 bg-[#ffffff08] px-2 py-0.5 rounded-full border border-[#ffffff10]">
                      <span className="inline-flex gap-0.5">
                        {Array.from({ length: 4 }, (_, i) => (
                          <svg
                            key={i}
                            className={`h-2.5 w-2.5 ${i < diff.level ? "text-[#fbbf24]" : "text-[#ffffff12]"}`}
                            viewBox="0 0 24 24"
                            fill={i < diff.level ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </span>
                      {diff.label}
                    </span>
                  );
                })()}
              </div>
              <p className="text-xs text-[#666] font-mono">
                100 lessons &middot; {userTier === "pro" ? "all unlocked" : `${freeCount} free`} &middot; Each lesson: concept + {isCrawlerPath ? "crawler builder" : "game builder"}
              </p>
            </div>
            {template && (
              <Link href="/paths" className="text-[10px] font-mono bg-teal-600/10 text-teal-400 px-2.5 py-1 rounded-lg border border-teal-500/20 hover:bg-teal-600/20 transition-colors shrink-0">
                {TEMPLATE_LABELS[template]} &rarr;
              </Link>
            )}
          </div>

          {/* Lesson Path (Duolingo-style skill tree) */}
          <LessonPath
            lessons={lessons}
            userTier={userTier}
            template={template || "space_shooter"}
            onPaywallClick={() => setShowPaywall(true)}
          />
        </div>

        {/* ─── Right Sidebar (sticky, desktop only) ─────────────────── */}
        <LearnSidebar
          level={levelInfo.level}
          title={levelInfo.title}
          xpInLevel={levelInfo.xpInLevel}
          xpForNext={levelInfo.xpForNext}
          progress={levelInfo.progress}
          totalXp={totalXp}
          streakCount={streak?.current_streak || 0}
          completedToday={completedToday}
          userTier={userTier}
          completedCount={completedCount}
          freeLimit={freeCount}
          lessons={lessons}
          template={template || "space_shooter"}
          totalLessons={totalLessons}
          isCrawlerPath={isCrawlerPath}
        />
      </div>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

      {/* Mobile FAB */}
      <ContinueFAB
        nextLesson={currentLesson ? { id: currentLesson.id, order: currentLesson.order, title: currentLesson.title } : null}
      />
    </>
  );
}
