"use client";

import { useEffect, useState, useCallback } from "react";
import { ALL_LESSONS } from "@/data/lessons";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LessonStatus } from "@/types/lesson";

interface LessonCard {
  id: string;
  title: string;
  description: string;
  order: number;
  xpReward: number;
  concepts: string[];
  status: LessonStatus;
}

export default function LearnPage() {
  const [lessons, setLessons] = useState<LessonCard[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadProgress = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email || "");

      // Fetch user profile
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("total_xp")
        .eq("id", user.id)
        .single();

      if (profile) setTotalXp(profile.total_xp);

      // Fetch lesson progress
      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, status")
        .eq("user_id", user.id);

      const progressMap = new Map<string, string>();
      if (progress) {
        progress.forEach((p) => progressMap.set(p.lesson_id, p.status));
      }

      const cards: LessonCard[] = ALL_LESSONS.map((lesson, i) => {
        const savedStatus = progressMap.get(lesson.id);
        let status: LessonStatus;

        if (savedStatus === "completed") {
          status = "completed";
        } else if (savedStatus === "in_progress") {
          status = "in_progress";
        } else if (i === 0) {
          status = "available";
        } else {
          // Available if previous lesson is completed
          const prevLesson = ALL_LESSONS[i - 1];
          const prevStatus = progressMap.get(prevLesson.id);
          status = prevStatus === "completed" ? "available" : "locked";
        }

        return {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          order: lesson.order,
          xpReward: lesson.xpReward,
          concepts: lesson.concepts,
          status,
        };
      });

      setLessons(cards);
      setCompletedCount(cards.filter((c) => c.status === "completed").length);
      setLoading(false);
    };

    loadProgress();
  }, [router]);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm font-mono text-[#555] animate-pulse">
          Loading lessons...
        </p>
      </main>
    );
  }

  const STATUS_STYLES: Record<
    LessonStatus,
    { border: string; badge: string; badgeText: string; hoverable: boolean }
  > = {
    completed: {
      border: "border-primary/30",
      badge: "bg-primary/20 text-primary",
      badgeText: "COMPLETED",
      hoverable: true,
    },
    in_progress: {
      border: "border-warning/30",
      badge: "bg-warning/20 text-warning",
      badgeText: "IN PROGRESS",
      hoverable: true,
    },
    available: {
      border: "border-[#2a2a3e]",
      badge: "bg-[#1a1a2e] text-[#888]",
      badgeText: "AVAILABLE",
      hoverable: true,
    },
    locked: {
      border: "border-[#1a1a2e]",
      badge: "bg-[#111] text-[#444]",
      badgeText: "LOCKED",
      hoverable: false,
    },
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-[#1a1a2e] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">HeapSight</h1>
            <p className="text-xs text-[#666] font-mono mt-0.5">
              Learn C++ by Building a Game
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-mono text-primary font-semibold">
                  {totalXp} XP
                </div>
                <div className="text-[10px] font-mono text-[#555]">
                  {completedCount}/{ALL_LESSONS.length} lessons
                </div>
              </div>
              {/* Progress ring */}
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#1a1a2e"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#00ff88"
                    strokeWidth="3"
                    strokeDasharray={`${(completedCount / ALL_LESSONS.length) * 100}, 100`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-[#888]">
                  {Math.round((completedCount / ALL_LESSONS.length) * 100)}%
                </span>
              </div>
            </div>
            <div className="w-px h-8 bg-[#1a1a2e]" />
            <div className="text-right">
              <div className="text-[10px] font-mono text-[#555]">
                {userEmail}
              </div>
              <button
                onClick={handleLogout}
                className="text-[10px] font-mono text-[#444] hover:text-danger transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Skill Tree */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-lg font-semibold text-white mb-1">
          C++ Fundamentals
        </h2>
        <p className="text-xs text-[#666] font-mono mb-6">
          Master the basics. Build towards understanding memory bugs.
        </p>

        <div className="space-y-3">
          {lessons.map((lesson) => {
            const styles = STATUS_STYLES[lesson.status];
            const content = (
              <div
                className={`
                  flex items-center gap-4 p-4 rounded-xl border bg-surface transition-all
                  ${styles.border}
                  ${styles.hoverable ? "hover:bg-[#111118] cursor-pointer" : "opacity-50 cursor-not-allowed"}
                `}
              >
                {/* Order number */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold
                    ${lesson.status === "completed" ? "bg-primary/20 text-primary" : "bg-[#1a1a2e] text-[#555]"}
                  `}
                >
                  {lesson.status === "completed" ? "\u2713" : lesson.order}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {lesson.title}
                    </h3>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${styles.badge}`}
                    >
                      {styles.badgeText}
                    </span>
                  </div>
                  <p className="text-xs text-[#666] mt-0.5 truncate">
                    {lesson.description}
                  </p>
                  <div className="flex gap-1.5 mt-1.5">
                    {lesson.concepts.map((c) => (
                      <span
                        key={c}
                        className="text-[8px] font-mono bg-[#1a1a2e] text-[#555] px-1.5 py-0.5 rounded"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* XP */}
                <div className="shrink-0 text-right">
                  <div
                    className={`text-xs font-mono ${
                      lesson.status === "completed"
                        ? "text-primary"
                        : "text-[#444]"
                    }`}
                  >
                    +{lesson.xpReward} XP
                  </div>
                </div>
              </div>
            );

            if (lesson.status === "locked") {
              return <div key={lesson.id}>{content}</div>;
            }

            return (
              <Link key={lesson.id} href={`/lesson/${lesson.id}`}>
                {content}
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center border border-[#1a1a2e] rounded-xl p-6 bg-surface">
          <p className="text-sm text-[#666]">
            More lessons coming soon. Master these fundamentals first.
          </p>
          <Link
            href="/"
            className="inline-block mt-3 text-xs font-mono text-primary hover:text-primary/80 transition-colors"
          >
            Watch the crash demo &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
