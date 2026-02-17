"use client";

import { useEffect, useState } from "react";
import { ALL_LESSONS } from "@/data/lessons";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LessonStatus } from "@/types/lesson";
import { ROBOT_LESSON_TITLES } from "@/data/game-templates/differential-drive-robot/lesson-titles";
import PaywallModal from "@/components/PaywallModal";
import { getLessonMeta, getDifficultyStars, getLevelInfo } from "@/lib/lesson-metadata";
import { ACHIEVEMENTS, getRarityColor, getRarityGradient } from "@/lib/achievements";
import { getUserAchievementIds } from "@/lib/achievement-manager";
import ContinueFAB from "@/components/dashboard/ContinueFAB";
import StreakDisplay from "@/components/dashboard/StreakDisplay";
import LeaderboardPreview from "@/components/dashboard/LeaderboardPreview";
import ProTeaser from "@/components/dashboard/ProTeaser";

// ─── Inline SVG icons ───────────────────────────────────────────────────────
function FlameIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 23c-4.97 0-8-3.03-8-7.5 0-3.5 2-6.5 4-8.5.33-.33.83-.15.93.28.3 1.3.87 2.42 1.57 3.22C11.1 7.5 12 4 12 2c0-.55.45-.73.8-.4C15.8 4.2 20 8.5 20 15.5c0 4.47-3.03 7.5-8 7.5z"/>
    </svg>
  );
}

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

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  );
}

function StarIcon({ className, filled }: { className?: string; filled: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}

// ─── Types ──────────────────────────────────────────────────────────────────
interface LessonCard {
  id: string;
  title: string;
  description: string;
  order: number;
  xpReward: number;
  tier: "free" | "pro";
  concepts: string[];
  status: LessonStatus;
  part1Done: boolean;
  part2Done: boolean;
}

interface StreakData {
  current_streak: number;
  longest_streak: number;
}

const TEMPLATE_LABELS: Record<string, string> = {
  space_shooter: "Space Shooter",
  platformer: "Platformer",
  simple_rpg: "Simple RPG",
  differential_drive_robot: "Differential Drive Robot",
};

// ─── Component ──────────────────────────────────────────────────────────────
export default function LearnPage() {
  const [lessons, setLessons] = useState<LessonCard[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [template, setTemplate] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<"free" | "pro">("free");
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [completedToday, setCompletedToday] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<Set<string>>(new Set());
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

      const isRobot = profile.selected_game_template === "differential_drive_robot";

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

      const achieveIds = await getUserAchievementIds(user.id);
      setUnlockedAchievementIds(achieveIds);

      const currentPath = profile.selected_game_template;
      const { data: allProgress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, status, part1_status, part2_status, path")
        .eq("user_id", user.id);

      const progressMap = new Map<string, { status: string; p1: string; p2: string }>();
      if (allProgress) {
        allProgress
          .filter((p) => p.path === currentPath || !p.path)
          .forEach((p) =>
            progressMap.set(p.lesson_id, {
              status: p.status,
              p1: p.part1_status || "not_started",
              p2: p.part2_status || "not_started",
            })
          );
      }

      const cards: LessonCard[] = ALL_LESSONS.map((lesson, i) => {
        const saved = progressMap.get(lesson.id);
        let status: LessonStatus;

        if (saved?.status === "completed") {
          status = "completed";
        } else if (saved?.status === "in_progress") {
          status = "in_progress";
        } else if (i === 0) {
          status = "available";
        } else {
          const prevLesson = ALL_LESSONS[i - 1];
          const prevStatus = progressMap.get(prevLesson.id);
          const isPro = (profile.tier || "free") === "pro";
          status = prevStatus?.status === "completed" ? "available" : isPro ? "available" : "locked";
        }

        const robotInfo = isRobot ? ROBOT_LESSON_TITLES[lesson.id] : null;

        return {
          id: lesson.id,
          title: robotInfo?.title || lesson.title,
          description: robotInfo?.description || lesson.description,
          order: lesson.order,
          xpReward: lesson.xpReward,
          tier: lesson.tier,
          concepts: lesson.concepts,
          status,
          part1Done: saved?.p1 === "completed",
          part2Done: saved?.p2 === "completed",
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

  const isRobotPath = template === "differential_drive_robot";
  const freeCount = ALL_LESSONS.filter((l) => l.tier === "free").length;
  const levelInfo = getLevelInfo(totalXp);

  const currentLesson =
    lessons.find((l) => l.status === "in_progress") ||
    lessons.find((l) => l.status === "available" && (l.tier === "free" || userTier === "pro"));

  const completedList = lessons.filter((l) => l.status === "completed");
  const activeList = lessons.filter((l) => l.status !== "completed");

  const renderLessonCard = (lesson: LessonCard) => {
    const isTierLocked = lesson.tier === "pro" && userTier === "free";
    const isLocked = lesson.status === "locked" || isTierLocked;
    const meta = getLessonMeta(lesson.id);
    const stars = getDifficultyStars(meta.difficulty);

    const colorScheme = isTierLocked
      ? { border: "border-[#1a1a2e]", bg: "", numberBg: "bg-[#1a1a2e]", numberText: "text-[#444]", xpText: "text-[#333]" }
      : lesson.status === "completed"
      ? { border: "border-primary/30", bg: "bg-primary/[0.03]", numberBg: "bg-primary/20", numberText: "text-primary", xpText: "text-primary" }
      : lesson.status === "in_progress"
      ? { border: "border-[#60a5fa]/30", bg: "bg-[#60a5fa]/[0.03]", numberBg: "bg-[#60a5fa]/20", numberText: "text-[#60a5fa]", xpText: "text-[#60a5fa]" }
      : lesson.status === "available"
      ? { border: "border-[#2a2a3e]", bg: "", numberBg: "bg-[#1a1a2e]", numberText: "text-[#888]", xpText: "text-[#555]" }
      : { border: "border-[#1a1a2e]", bg: "", numberBg: "bg-[#1a1a2e]", numberText: "text-[#444]", xpText: "text-[#333]" };

    const cardContent = (
      <div
        className={`
          flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border bg-surface transition-all min-h-[72px] touch-manipulation
          ${colorScheme.border} ${colorScheme.bg}
          ${isLocked && !isTierLocked ? "opacity-40 cursor-not-allowed" : "hover:bg-[#111118] cursor-pointer"}
        `}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${colorScheme.numberBg} ${colorScheme.numberText}`}
        >
          {lesson.status === "completed" && !isTierLocked ? "\u2713" : lesson.order}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm shrink-0" aria-hidden="true">{meta.icon}</span>
            <h3 className={`text-sm font-semibold truncate ${isLocked ? "text-[#555]" : "text-white"}`}>
              {lesson.title}
            </h3>
            {isTierLocked ? (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#2a1a3e] text-[#a855f7]">PRO</span>
            ) : lesson.status === "completed" ? (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary">COMPLETED</span>
            ) : lesson.status === "in_progress" ? (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#60a5fa]/20 text-[#60a5fa]">IN PROGRESS</span>
            ) : lesson.status === "available" ? (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1a1a2e] text-[#888]">AVAILABLE</span>
            ) : (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#111] text-[#444]">LOCKED</span>
            )}
          </div>
          <p className={`text-xs mt-0.5 truncate ${isLocked ? "text-[#444]" : "text-[#666]"}`}>
            {lesson.description}
          </p>
          {!isLocked && (
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3].map((s) => (
                  <StarIcon key={s} className={`h-3 w-3 ${s <= stars ? "text-[#fbbf24]" : "text-[#2a2a3e]"}`} filled={s <= stars} />
                ))}
              </div>
              <span className="flex items-center gap-1 text-[9px] font-mono text-[#555]">
                <ClockIcon className="h-3 w-3" />
                {meta.minutes}m
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${lesson.part1Done ? "bg-primary" : "bg-[#2a2a3e]"}`} />
                  <span className="text-[8px] font-mono text-[#555]">Concept</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${lesson.part2Done ? "bg-primary" : "bg-[#2a2a3e]"}`} />
                  <span className="text-[8px] font-mono text-[#555]">{isRobotPath ? "Robot" : "Game"}</span>
                </div>
              </div>
              <div className="hidden sm:flex gap-1">
                {lesson.concepts.slice(0, 3).map((c) => (
                  <span key={c} className="text-[8px] font-mono bg-[#1a1a2e] text-[#555] px-1.5 py-0.5 rounded">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 text-right">
          {isTierLocked ? (
            <div className="flex flex-col items-center gap-0.5">
              <LockIcon className="h-4 w-4 text-[#a855f7]" />
              <span className="text-[8px] font-mono text-[#a855f7]">Unlock</span>
            </div>
          ) : (
            <div className={`text-xs font-mono ${colorScheme.xpText}`}>+{lesson.xpReward} XP</div>
          )}
        </div>
      </div>
    );

    if (isTierLocked) {
      return (
        <button key={lesson.id} onClick={() => setShowPaywall(true)} className="w-full text-left">
          {cardContent}
        </button>
      );
    }

    if (lesson.status === "locked") {
      return <div key={lesson.id}>{cardContent}</div>;
    }

    return (
      <Link key={lesson.id} href={`/lesson/${lesson.id}`}>
        {cardContent}
      </Link>
    );
  };

  return (
    <>
      {/* ─── Header Bar ─────────────────────────────────────────────── */}
      <header className="border-b border-[#1a1a2e] px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="lg:hidden pl-12">
            <h1 className="text-xl font-semibold text-white">HeapSight</h1>
            <p className="text-xs text-[#666] font-mono mt-0.5">
              Learn C++ by Building {template ? TEMPLATE_LABELS[template] || "a Project" : "a Project"}
            </p>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-white">Learn</h2>
            <p className="text-xs text-[#666] font-mono mt-0.5">
              {template ? TEMPLATE_LABELS[template] : "Select a path"}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-[#1a1a0e] px-3 py-1.5 rounded-full border border-[#3a3a1e]">
              <ZapIcon className="h-4 w-4 text-[#fbbf24]" />
              <span className="text-sm font-mono font-bold text-[#fbbf24]">{totalXp}</span>
              <span className="text-[10px] font-mono text-[#888]">XP</span>
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
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1a1a2e" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#00ff88" strokeWidth="3" strokeDasharray={`${(completedCount / ALL_LESSONS.length) * 100}, 100`} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-[#888]">
                  {Math.round((completedCount / ALL_LESSONS.length) * 100)}%
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#555]">{completedCount}/{ALL_LESSONS.length}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Level Progress Bar */}
        <div className="mb-6 p-4 rounded-xl border border-[#2a1a3e]/50 bg-gradient-to-r from-[#1a1028] to-[#12182a]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gradient-to-r from-[#a855f7] to-[#6366f1] text-white">
                LVL {levelInfo.level}
              </span>
              <span className="text-sm font-semibold text-white">{levelInfo.title}</span>
            </div>
            <span className="text-[10px] font-mono text-[#888]">{levelInfo.xpInLevel} / {levelInfo.xpForNext} XP</span>
          </div>
          <div className="w-full bg-[#1a1a2e] rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-[#a855f7] to-[#6366f1] transition-all duration-700 relative overflow-hidden"
              style={{ width: `${levelInfo.progress}%` }}
            >
              <div className="absolute inset-0 shimmer-overlay animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Leaderboard Preview */}
        <div className="mb-6">
          <LeaderboardPreview />
        </div>

        {/* Daily Goal Banner */}
        <div className="mb-6 animate-slide_up">
          {!completedToday ? (
            <div className="p-4 rounded-xl border border-[#1a2a3a] bg-gradient-to-r from-[#0e1a2a] to-[#121228]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#1a2a4a] flex items-center justify-center shrink-0">
                    <TargetIcon className="h-5 w-5 text-[#60a5fa]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Today&apos;s Goal</p>
                    <p className="text-xs font-mono text-[#666]">Complete 1 lesson for +50 bonus XP</p>
                  </div>
                </div>
                <div className="relative w-12 h-12 shrink-0">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#1a2a4a" strokeWidth="4" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-mono text-white">0/1</span>
                </div>
              </div>
              {streak && streak.current_streak > 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-xs font-mono text-[#60a5fa]/80">
                  <FlameIcon className="h-3.5 w-3.5 text-[#f97316]" />
                  <span>Keep your {streak.current_streak}-day streak alive!</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-primary/20 bg-gradient-to-r from-[#0a1a12] to-[#0e1a18]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-primary text-lg">{"\u2713"}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Daily Goal Complete!</p>
                    <p className="text-xs font-mono text-[#666]">Come back tomorrow to keep your streak alive.</p>
                  </div>
                </div>
                <div className="relative w-12 h-12 shrink-0">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#0a3a1a" strokeWidth="4" />
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#00ff88" strokeWidth="4" strokeDasharray="125.6 125.6" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-mono text-primary">{"\u2713"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Continue Learning CTA */}
        {currentLesson && (
          <Link href={`/lesson/${currentLesson.id}`} className="block mb-6">
            <div className="p-5 rounded-xl border-2 border-primary/40 bg-gradient-to-r from-[#0a1a12] to-[#0e1a18] hover:border-primary/60 transition-all group">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono text-primary/70 uppercase tracking-wider mb-1">
                    {currentLesson.status === "in_progress" ? "Continue Learning" : "Up Next"}
                  </p>
                  <h3 className="text-lg font-bold text-white truncate">
                    Lesson {currentLesson.order}: {currentLesson.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs font-mono text-[#888]">
                      <ClockIcon className="h-3.5 w-3.5" />
                      ~{getLessonMeta(currentLesson.id).minutes} min
                    </span>
                    <span className="flex items-center gap-1 text-xs font-mono text-[#888]">
                      <ZapIcon className="h-3.5 w-3.5 text-[#fbbf24]" />
                      +{currentLesson.xpReward} XP
                    </span>
                  </div>
                </div>
                <div className="shrink-0 h-12 w-12 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowRightIcon className="h-6 w-6 text-black" />
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Pro Teaser */}
        {userTier === "free" && (
          <ProTeaser
            completedCount={completedCount}
            nextLockedLessons={
              lessons
                .filter((l) => l.tier === "pro" && l.status === "locked")
                .slice(0, 3)
                .map((l) => ({ number: l.order, title: l.title, description: l.description }))
            }
          />
        )}

        {/* Path Milestone Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-[#888]">
              {isRobotPath ? "Robotics Path" : "Game Dev Path"} Progress
            </span>
            <span className="text-[10px] font-mono text-[#888]">{completedCount}/25+ lessons</span>
          </div>
          <div className="w-full bg-[#1a1a2e] rounded-full h-2.5 overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-primary via-[#00cc6e] to-[#00aa55] transition-all duration-700 relative overflow-hidden"
              style={{ width: `${(completedCount / ALL_LESSONS.length) * 100}%` }}
            >
              <div className="absolute inset-0 shimmer-overlay animate-shimmer" />
            </div>
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[9px] font-mono text-[#444]">Beginner</span>
            <span className="text-[9px] font-mono text-[#444]">Intermediate</span>
            <span className="text-[9px] font-mono text-[#444]">Advanced</span>
            <span className="text-[9px] font-mono text-[#a855f7]">Master+</span>
          </div>
        </div>

        {/* Achievement Showcase */}
        {unlockedAchievementIds.size > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#888]">Achievements</h3>
              <Link href="/progress" className="text-[9px] font-mono text-primary hover:text-primary/80 transition-colors">
                View All &rarr;
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {ACHIEVEMENTS.filter((a) => unlockedAchievementIds.has(a.id)).map((achievement) => (
                <div
                  key={achievement.id}
                  className={`shrink-0 bg-gradient-to-br ${getRarityGradient(achievement.rarity)} border ${getRarityColor(achievement.rarity)} rounded-lg p-3 min-w-[110px] max-w-[130px]`}
                >
                  <div className="text-2xl mb-1.5">{achievement.icon}</div>
                  <p className="text-[10px] font-semibold text-white truncate">{achievement.title}</p>
                  <p className="text-[8px] font-mono text-[#888] uppercase mt-0.5">{achievement.rarity}</p>
                </div>
              ))}
              {(() => {
                const nextLocked = ACHIEVEMENTS.find((a) => !unlockedAchievementIds.has(a.id));
                if (!nextLocked) return null;
                return (
                  <div className="shrink-0 bg-[#1a1a2e] border border-[#2a2a3e] border-dashed rounded-lg p-3 min-w-[110px] max-w-[130px] opacity-50">
                    <div className="text-2xl mb-1.5 grayscale">{nextLocked.icon}</div>
                    <p className="text-[10px] font-semibold text-[#555] truncate">{nextLocked.title}</p>
                    <p className="text-[8px] font-mono text-[#444] mt-0.5">{nextLocked.description}</p>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Path Title */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">
              {isRobotPath ? "C++ Robotics Path" : "C++ Game Dev Path"}
            </h2>
            <p className="text-xs text-[#666] font-mono">
              25+ lessons &middot; {userTier === "pro" ? "all unlocked" : `${freeCount} free`} &middot; Each lesson: concept + {isRobotPath ? "robot builder" : "game builder"}
            </p>
          </div>
          {template && (
            <Link href="/paths" className="text-[10px] font-mono bg-primary/10 text-primary px-2.5 py-1 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors">
              {TEMPLATE_LABELS[template]} &rarr;
            </Link>
          )}
        </div>

        {/* Lesson Sections */}
        <div className="space-y-6">
          {activeList.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-[#888]">Up Next</h3>
                <span className="text-[9px] font-mono text-[#555]">{activeList.length} lesson{activeList.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="space-y-3">{activeList.map(renderLessonCard)}</div>
            </div>
          )}

          {completedList.length > 0 && (
            <div>
              <button onClick={() => setShowCompleted(!showCompleted)} className="w-full flex items-center justify-between mb-3 min-h-[44px] group">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#888]">Completed</h3>
                  <span className="text-[9px] font-mono text-primary/70">{completedList.length} lesson{completedList.length !== 1 ? "s" : ""}</span>
                </div>
                <span className="text-[#555] text-xs font-mono group-hover:text-[#888] transition-colors">
                  {showCompleted ? "\u25B2 Hide" : "\u25BC Show"}
                </span>
              </button>
              {showCompleted && (
                <div className="space-y-3 animate-slide_up">{completedList.map(renderLessonCard)}</div>
              )}
            </div>
          )}
        </div>
      </div>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

      {/* Mobile FAB */}
      <ContinueFAB
        nextLesson={currentLesson ? { id: currentLesson.id, order: currentLesson.order, title: currentLesson.title } : null}
      />
    </>
  );
}
