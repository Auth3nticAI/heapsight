"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { ALL_SPACE_SHOOTER_LESSONS } from "@/data/lessons";
import { ALL_RPG_LESSONS } from "@/data/lessons/rpg-index";
import { ALL_PLATFORMER_LESSONS } from "@/data/lessons/platformer-index";
import { ALL_ROBOT_LESSONS } from "@/data/lessons/robot-index";

const TEMPLATE_LESSON_COUNTS: Record<string, number> = {
  space_shooter: ALL_SPACE_SHOOTER_LESSONS.length,
  platformer: ALL_PLATFORMER_LESSONS.length,
  simple_rpg: ALL_RPG_LESSONS.length,
  differential_drive_robot: ALL_ROBOT_LESSONS.length,
};
import PaywallModal from "@/components/PaywallModal";
import { getPathDifficulty } from "@/data/templates-info";

const MAX_STARS = 4;

function DifficultyStars({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: MAX_STARS }, (_, i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${i < level ? "text-[#fbbf24]" : "text-[#2a2a3e]"}`}
          viewBox="0 0 24 24"
          fill={i < level ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

function ShuffleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
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

const PATHS = [
  {
    id: "space_shooter",
    name: "Space Shooter",
    icon: "\uD83D\uDE80",
    paradigm: "ECS Architecture",
    description: "Learn Entity Component System patterns used in Unity DOTS and Unreal Mass Entity. Build a space shooter with enemies, bullets, and powerups.",
    skills: ["ECS Pattern", "Spatial Partitioning", "Collision Detection", "Particle Systems"],
    color: "from-[#3b82f6]/20 to-[#1d4ed8]/20",
    border: "border-[#3b82f6]/30",
    accent: "text-[#60a5fa]",
    bestFor: "Game developers targeting Unity/Unreal",
  },
  {
    id: "platformer",
    name: "Platformer",
    icon: "\uD83C\uDFC3",
    paradigm: "Finite State Machines",
    description: "Master state machines for character controllers, enemy AI, and game flow. Build a platformer with jumping, running, and physics.",
    skills: ["FSM Design", "Physics Simulation", "Input Handling", "Level Design"],
    color: "from-[#10b981]/20 to-[#059669]/20",
    border: "border-[#10b981]/30",
    accent: "text-[#34d399]",
    bestFor: "Character controller & game feel engineers",
  },
  {
    id: "simple_rpg",
    name: "Simple RPG",
    icon: "\u2694\uFE0F",
    paradigm: "Data-Driven OOP",
    description: "Build data-driven systems like Diablo's architecture. Inventory, stats, abilities, and combat using object-oriented patterns.",
    skills: ["OOP Design", "Data-Driven Systems", "Inventory Systems", "Combat Mechanics"],
    color: "from-[#f59e0b]/20 to-[#d97706]/20",
    border: "border-[#f59e0b]/30",
    accent: "text-[#fbbf24]",
    bestFor: "RPG & systems programming enthusiasts",
  },
  {
    id: "differential_drive_robot",
    name: "Differential Drive Robot",
    icon: "\uD83E\uDD16",
    paradigm: "Embedded Systems",
    description: "Program a differential drive robot with sensors, PID control, and path planning. Real-time embedded programming patterns.",
    skills: ["PID Control", "Sensor Fusion", "Path Planning", "Real-Time Systems"],
    color: "from-[#a855f7]/20 to-[#7c3aed]/20",
    border: "border-[#a855f7]/30",
    accent: "text-[#c084fc]",
    bestFor: "Robotics engineers & embedded devs",
  },
];

export default function PathsPage() {
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<"free" | "pro">("free");
  const [pathProgress, setPathProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("selected_game_template, tier")
        .eq("id", user.id)
        .single();

      setCurrentPath(profile?.selected_game_template || null);
      setUserTier(profile?.tier || "free");

      const { data: allProgress } = await supabase
        .from("lesson_progress")
        .select("status, path")
        .eq("user_id", user.id);

      const counts: Record<string, number> = {};
      allProgress?.forEach((p) => {
        if (p.status === "completed" && p.path) {
          counts[p.path] = (counts[p.path] || 0) + 1;
        }
      });
      setPathProgress(counts);
      setLoading(false);
    }
    load();
  }, []);

  const handleSwitch = async (pathId: string) => {
    if (pathId === currentPath) return;
    if (userTier === "free" && currentPath && pathId !== currentPath) {
      setShowPaywall(true);
      return;
    }

    setSwitching(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ selected_game_template: pathId })
      .eq("id", user.id);

    await supabase.from("user_games").upsert(
      { user_id: user.id, template_id: pathId },
      { onConflict: "user_id" }
    );

    router.push("/learn");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm font-mono text-[#555] animate-pulse">Loading paths...</p>
      </div>
    );
  }

  return (
    <>
      <header className="border-b border-[#1a1a2e] px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="lg:hidden pl-12">
            <h1 className="text-xl font-semibold text-white">Learning Paths</h1>
            <p className="text-xs text-[#666] font-mono mt-0.5">Choose your paradigm</p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <ShuffleIcon className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-semibold text-white">Learning Paths</h1>
              <p className="text-xs text-[#666] font-mono mt-0.5">
                4 industry paradigms &middot; 25 lessons each &middot; Not reskins, genuinely different architectures
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Info */}
        <div className="mb-6 p-4 rounded-xl border border-primary/20 bg-gradient-to-r from-[#0a1a12]/40 to-[#0e1a18]/40">
          <p className="text-xs font-mono text-[#888]">
            Each path teaches the same 25 C++ concepts through a different paradigm.
            {userTier === "pro"
              ? " As a Pro member, you can switch paths anytime."
              : " Free users start with one path. Upgrade to Pro to switch anytime."}
          </p>
        </div>

        {/* Path Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PATHS.map((path) => {
            const isCurrent = path.id === currentPath;
            const progress = pathProgress[path.id] || 0;
            const totalLessons = TEMPLATE_LESSON_COUNTS[path.id] ?? 100;
            const progressPct = Math.round((progress / totalLessons) * 100);
            const isLocked = userTier === "free" && !isCurrent && currentPath !== null;

            return (
              <div
                key={path.id}
                className={`
                  rounded-xl border p-5 transition-all relative overflow-hidden
                  ${isCurrent
                    ? `bg-gradient-to-br ${path.color} ${path.border} ring-2 ring-primary/30`
                    : isLocked
                    ? "bg-surface border-[#1a1a2e] opacity-60"
                    : "bg-surface border-[#2a2a3e] hover:border-[#4a4a5e]"
                  }
                `}
              >
                {/* Current badge */}
                {isCurrent && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-primary/20 text-primary px-2 py-0.5 rounded text-[9px] font-mono font-bold border border-primary/30">
                    <CheckIcon className="h-3 w-3" />
                    ACTIVE
                  </div>
                )}

                {/* Lock badge */}
                {isLocked && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#a855f7]/20 text-[#a855f7] px-2 py-0.5 rounded text-[9px] font-mono font-bold border border-[#a855f7]/30">
                    <LockIcon className="h-3 w-3" />
                    PRO
                  </div>
                )}

                {/* Content */}
                <div className="text-3xl mb-3">{path.icon}</div>
                <h3 className="text-base font-bold text-white mb-0.5">{path.name}</h3>
                <p className={`text-[10px] font-mono ${path.accent} mb-1`}>{path.paradigm}</p>

                {/* Difficulty */}
                {(() => {
                  const diff = getPathDifficulty(path.id);
                  return (
                    <div className="flex items-center gap-2 mb-3">
                      <DifficultyStars level={diff.level} />
                      <span className="text-[9px] font-mono text-[#888]">{diff.label}</span>
                    </div>
                  );
                })()}

                <p className="text-xs text-[#888] mb-4 leading-relaxed">{path.description}</p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {path.skills.map((skill) => (
                    <span key={skill} className="text-[8px] font-mono bg-[#1a1a2e] text-[#666] px-2 py-0.5 rounded">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Best For */}
                <p className="text-[9px] font-mono text-[#555] mb-4">
                  Best for: <span className="text-[#888]">{path.bestFor}</span>
                </p>

                {/* Progress Bar */}
                {progress > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono text-[#888]">Progress</span>
                      <span className="text-[9px] font-mono text-[#888]">{progress}/{totalLessons} ({progressPct}%)</span>
                    </div>
                    <div className="w-full bg-[#1a1a2e] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action */}
                {isCurrent ? (
                  <button
                    onClick={() => router.push("/learn")}
                    className="w-full py-2.5 rounded-lg bg-primary/10 text-primary text-sm font-semibold border border-primary/30 hover:bg-primary/20 transition-colors min-h-[44px] touch-manipulation"
                  >
                    Continue Learning &rarr;
                  </button>
                ) : isLocked ? (
                  <button
                    onClick={() => setShowPaywall(true)}
                    className="w-full py-2.5 rounded-lg bg-[#a855f7]/10 text-[#a855f7] text-sm font-semibold border border-[#a855f7]/30 hover:bg-[#a855f7]/20 transition-colors min-h-[44px] touch-manipulation"
                  >
                    Unlock with Pro
                  </button>
                ) : (
                  <button
                    onClick={() => handleSwitch(path.id)}
                    disabled={switching}
                    className="w-full py-2.5 rounded-lg bg-[#1a1a2e] text-white text-sm font-semibold border border-[#2a2a3e] hover:bg-[#222230] transition-colors min-h-[44px] touch-manipulation disabled:opacity-50"
                  >
                    {switching ? "Switching..." : "Switch to This Path"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </>
  );
}
