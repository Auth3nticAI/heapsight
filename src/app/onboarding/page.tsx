"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { GAME_TEMPLATES } from "@/data/templates-info";
import type { GameTemplate } from "@/types/game";

const TEMPLATE_ICONS: Record<string, string> = {
  rocket: "\uD83D\uDE80",
  runner: "\uD83C\uDFC3",
  sword: "\u2694\uFE0F",
  robot: "\uD83E\uDD16",
};

const PATH_DETAILS: Record<string, { tagline: string; bestFor: string }> = {
  space_shooter: {
    tagline: "Learn ECS & Data-Oriented Design",
    bestFor: "Game devs, engine programmers",
  },
  platformer: {
    tagline: "Master State Machines & Physics",
    bestFor: "Gameplay programmers, indie devs",
  },
  simple_rpg: {
    tagline: "Build Data-Driven Systems",
    bestFor: "System designers, tool developers",
  },
  differential_drive_robot: {
    tagline: "Program Real-Time Embedded Systems",
    bestFor: "Robotics engineers, embedded devs",
  },
};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<GameTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Not authenticated");
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email,
            selected_game_template: selected,
            onboarding_completed: true,
          },
          { onConflict: "id" }
        );

      if (profileError) {
        throw new Error(`Profile update failed: ${profileError.message}`);
      }

      const { error: gameError } = await supabase
        .from("user_games")
        .upsert(
          {
            user_id: user.id,
            template: selected,
            current_lesson_id: "lesson-01",
            accumulated_code:
              "// Your project will be built here, lesson by lesson\n",
          },
          {
            onConflict: "user_id,template",
            ignoreDuplicates: false,
          }
        );

      if (gameError) {
        throw new Error(`Game setup failed: ${gameError.message}`);
      }

      router.push("/learn");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      console.error("Setup error:", err);
      setError(message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-3xl w-full">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-[#555]">
              Step {step} of 2
            </span>
            <span className="text-[10px] font-mono text-[#555]">
              {step === 1 ? "50" : "100"}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-[#00cc6e] rounded-full transition-all duration-500"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
        </div>

        {/* ─── Step 1: Welcome ─────────────────────────────────── */}
        {step === 1 && (
          <div className="animate-slide_up">
            <div className="text-center mb-10">
              <div className="text-5xl mb-4">{"\uD83D\uDC4B"}</div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Welcome to HeapSight
              </h1>
              <p className="text-base text-[#888] max-w-xl mx-auto">
                Learn C++ by building real games and robots. Earn achievements,
                compete on leaderboards, and master 4 industry paradigms.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
              {[
                {
                  icon: "\uD83D\uDD25",
                  title: "Daily Streaks",
                  desc: "Build a coding habit",
                },
                {
                  icon: "\uD83C\uDFC6",
                  title: "15 Achievements",
                  desc: "Common to Legendary",
                },
                {
                  icon: "\uD83C\uDFAE",
                  title: "Real Projects",
                  desc: "Playable games & robots",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="p-4 rounded-xl border border-[#2a2a3e] bg-surface text-center"
                >
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <h3 className="text-sm font-semibold text-white mb-0.5">
                    {f.title}
                  </h3>
                  <p className="text-[10px] font-mono text-[#666]">{f.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm min-h-[48px]"
            >
              Get Started &rarr;
            </button>
          </div>
        )}

        {/* ─── Step 2: Choose Path ─────────────────────────────── */}
        {step === 2 && (
          <div className="animate-slide_up">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">
                Choose Your First Path
              </h1>
              <p className="text-sm text-[#888]">
                Don&apos;t worry &mdash; you can switch between all 4 paths
                anytime.
              </p>
            </div>

            {/* Game Development */}
            <div className="mb-6">
              <h3 className="text-xs font-mono text-[#555] uppercase tracking-wider mb-3">
                Game Development
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {GAME_TEMPLATES.filter((t) => t.category === "game").map(
                  (template) => {
                    const details = PATH_DETAILS[template.id];
                    return (
                      <button
                        key={template.id}
                        onClick={() => setSelected(template.id)}
                        className={`p-5 rounded-xl border-2 transition-all text-left min-h-[140px] touch-manipulation ${
                          selected === template.id
                            ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                            : "border-[#2a2a3e] bg-surface hover:border-[#3a3a4e]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-3xl shrink-0">
                            {TEMPLATE_ICONS[template.icon] || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-white mb-0.5">
                              {template.name}
                            </h3>
                            {details && (
                              <p className="text-xs text-primary/80 mb-1.5">
                                {details.tagline}
                              </p>
                            )}
                            <p className="text-[10px] text-[#888] mb-2 line-clamp-2">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                  template.difficulty === "beginner"
                                    ? "bg-primary/20 text-primary"
                                    : template.difficulty === "intermediate"
                                    ? "bg-warning/20 text-warning"
                                    : "bg-danger/20 text-danger"
                                }`}
                              >
                                {template.difficulty}
                              </span>
                              {details && (
                                <span className="text-[9px] font-mono text-[#555]">
                                  {details.bestFor}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Robotics */}
            <div className="mb-8">
              <h3 className="text-xs font-mono text-[#555] uppercase tracking-wider mb-3">
                Robotics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {GAME_TEMPLATES.filter((t) => t.category === "robot").map(
                  (template) => {
                    const details = PATH_DETAILS[template.id];
                    return (
                      <button
                        key={template.id}
                        onClick={() => setSelected(template.id)}
                        className={`p-5 rounded-xl border-2 transition-all text-left min-h-[140px] touch-manipulation ${
                          selected === template.id
                            ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                            : "border-[#2a2a3e] bg-surface hover:border-[#3a3a4e]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-3xl shrink-0">
                            {TEMPLATE_ICONS[template.icon] || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-white mb-0.5">
                              {template.name}
                            </h3>
                            {details && (
                              <p className="text-xs text-primary/80 mb-1.5">
                                {details.tagline}
                              </p>
                            )}
                            <p className="text-[10px] text-[#888] mb-2 line-clamp-2">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                  template.difficulty === "beginner"
                                    ? "bg-primary/20 text-primary"
                                    : template.difficulty === "intermediate"
                                    ? "bg-warning/20 text-warning"
                                    : "bg-danger/20 text-danger"
                                }`}
                              >
                                {template.difficulty}
                              </span>
                              {details && (
                                <span className="text-[9px] font-mono text-[#555]">
                                  {details.bestFor}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 border border-[#2a2a3e] text-[#888] text-sm font-mono rounded-lg hover:border-[#3a3a4e] hover:text-white transition-colors min-h-[48px]"
              >
                &larr; Back
              </button>
              <button
                onClick={handleContinue}
                disabled={!selected || loading}
                className="flex-1 py-3.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm min-h-[48px]"
              >
                {loading
                  ? "Setting up..."
                  : `Start Building ${
                      selected
                        ? GAME_TEMPLATES.find((t) => t.id === selected)?.name
                        : "..."
                    }`}
              </button>
            </div>

            {error && (
              <p className="text-danger text-xs font-mono bg-danger/10 border border-danger/20 rounded-lg px-3 py-2 mt-4 text-center">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
