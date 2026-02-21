"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { ALL_RPG_LESSONS } from "@/data/lessons/rpg-index";
import { ALL_PLATFORMER_LESSONS } from "@/data/lessons/platformer-index";
import { ALL_CRAWLER_LESSONS } from "@/data/lessons/crawler-index";
import { ALL_SHOOTER_LESSONS } from "@/data/lessons/shooter-index";

const TEMPLATE_LESSON_COUNTS: Record<string, number> = {
  space_shooter: ALL_SHOOTER_LESSONS.length,
  platformer: ALL_PLATFORMER_LESSONS.length,
  simple_rpg: ALL_RPG_LESSONS.length,
  dungeon_crawler: ALL_CRAWLER_LESSONS.length,
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
          className={`h-3.5 w-3.5 ${i < level ? "text-[#fbbf24]" : "text-[#ffffff12]"}`}
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
    description: "Build a space shooter with ECS architecture. Learn data-oriented design patterns used in Unity DOTS and Unreal.",
    skills: ["ECS Pattern", "Spatial Partitioning", "Collision Detection", "Particle Systems"],
    accent: "text-[#818cf8]",
    bestFor: "Game developers targeting Unity/Unreal",
    iconBg: "from-purple-500/25 to-indigo-600/25",
    progressBarColor: "bg-indigo-500",
    progressGlow: "0 0 8px rgba(99,102,241,0.6)",
  },
  {
    id: "platformer",
    name: "Platformer",
    icon: "\uD83C\uDFC3",
    paradigm: "Finite State Machines",
    description: "Build a platformer with physics and state machines. Master character controllers, input handling, and game feel.",
    skills: ["FSM Design", "Physics Simulation", "Input Handling", "Level Design"],
    accent: "text-[#fb923c]",
    bestFor: "Character controller & game feel engineers",
    iconBg: "from-orange-500/25 to-amber-500/25",
    progressBarColor: "bg-orange-500",
    progressGlow: "0 0 8px rgba(249,115,22,0.6)",
  },
  {
    id: "simple_rpg",
    name: "Simple RPG",
    icon: "\u2694\uFE0F",
    paradigm: "Data-Driven OOP",
    description: "Build an RPG with data-driven architecture. Inventory, stats, combat, and quest systems using design patterns.",
    skills: ["OOP Design", "Data-Driven Systems", "Inventory Systems", "Combat Mechanics"],
    accent: "text-[#34d399]",
    bestFor: "RPG & systems programming enthusiasts",
    iconBg: "from-emerald-500/25 to-green-600/25",
    progressBarColor: "bg-emerald-500",
    progressGlow: "0 0 8px rgba(16,185,129,0.6)",
  },
  {
    id: "dungeon_crawler",
    name: "Dungeon Crawler",
    icon: "\uD83C\uDFF0",
    paradigm: "3D Spatial Engineering",
    description: "Build a first-person 3D dungeon crawler. Cameras, raycasting, lighting, and procedural generation.",
    skills: ["3D Camera Math", "Raycasting", "Spatial Data Structures", "First-Person Rendering"],
    accent: "text-[#2dd4bf]",
    bestFor: "3D game devs & graphics programmers",
    iconBg: "from-teal-500/25 to-cyan-500/25",
    progressBarColor: "bg-teal-500",
    progressGlow: "0 0 8px rgba(20,184,166,0.6)",
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
      { user_id: user.id, template: pathId },
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
      <header className="border-b border-[#ffffff08] px-4 sm:px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <div className="md:pl-12 lg:pl-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Learning Paths
            </h1>
            <p className="text-xs text-[#555] font-mono mt-1 hidden lg:block">
              4 industry paradigms &middot; 100 lessons each &middot; Genuinely different architectures
            </p>
            <p className="text-xs text-[#555] font-mono mt-1 lg:hidden">Choose your paradigm</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <p className="text-xs font-mono text-[#444] mb-6">
          Each path teaches C++ through a fundamentally different paradigm.{" "}
          {userTier === "pro"
            ? "As a Pro member, you can switch paths anytime."
            : "Free users start with one path. Upgrade to Pro to switch anytime."}
        </p>

        {/* Path Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PATHS.map((path) => {
            const isCurrent = path.id === currentPath;
            const progress = pathProgress[path.id] || 0;
            const totalLessons = TEMPLATE_LESSON_COUNTS[path.id] ?? 100;
            const progressPct = Math.round((progress / totalLessons) * 100);
            const isLocked = userTier === "free" && !isCurrent && currentPath !== null;

            return (
              <div key={path.id} className="relative rounded-2xl group flex flex-col overflow-hidden">
                {/* Gradient border overlay — fades in on hover, stays on active */}
                <div
                  className={`absolute inset-0 rounded-2xl transition-opacity duration-300 bg-gradient-to-br from-teal-500/40 to-purple-500/30
                    ${isCurrent ? "opacity-100" : isLocked ? "opacity-0" : "opacity-0 group-hover:opacity-60"}
                  `}
                />
                {/* Baseline border */}
                <div className="absolute inset-0 rounded-2xl border border-[#ffffff0f]" />
                {/* Active card glow */}
                {isCurrent && (
                  <div className="absolute inset-0 rounded-2xl shadow-[0_0_24px_rgba(45,212,191,0.10)] pointer-events-none" />
                )}

                {/* Inner card */}
                <div className={`relative m-[1px] rounded-[14px] bg-[#09091a] flex flex-col pt-5 px-5 pb-6 flex-1
                  ${isLocked ? "opacity-55" : ""}
                `}>
                  {/* Active badge */}
                  {isCurrent && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#2dd4bf]/15 text-[#2dd4bf] px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border border-[#2dd4bf]/25">
                      <CheckIcon className="h-3 w-3" />
                      ACTIVE
                    </div>
                  )}

                  {/* Lock badge */}
                  {isLocked && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#a855f7]/15 text-[#a855f7] px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border border-[#a855f7]/25">
                      <LockIcon className="h-3 w-3" />
                      PRO
                    </div>
                  )}

                  {/* Icon with gradient bg */}
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${path.iconBg} flex items-center justify-center text-2xl mb-4 border border-[#ffffff08]`}>
                    {path.icon}
                  </div>

                  {/* Title / paradigm / difficulty */}
                  <div className="h-[80px]">
                    <h3 className="text-base font-bold text-white mb-0.5">{path.name}</h3>
                    <p className={`text-[10px] font-mono ${path.accent} mb-1.5`}>{path.paradigm}</p>
                    {(() => {
                      const diff = getPathDifficulty(path.id);
                      return (
                        <div className="flex items-center gap-2">
                          <DifficultyStars level={diff.level} />
                          <span className="text-[9px] font-mono text-[#666]">{diff.label}</span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#777] mb-4 leading-relaxed line-clamp-3 h-[60px] overflow-hidden">
                    {path.description}
                  </p>

                  {/* Skills */}
                  <div className="flex gap-1.5 mb-4 h-[22px] overflow-hidden">
                    {path.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="text-[8px] font-mono bg-[#ffffff08] text-[#ffffff55] px-2 py-0.5 rounded-full border border-[#ffffff08] whitespace-nowrap">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Best For */}
                  <p className="text-[9px] font-mono text-[#444] mb-4">
                    Best for: <span className="text-[#777]">{path.bestFor}</span>
                  </p>

                  {/* Progress + Button */}
                  <div className="mt-auto">
                    {progress > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-mono text-[#666]">Progress</span>
                          <span className="text-[9px] font-mono text-[#666]">{progress}/{totalLessons} ({progressPct}%)</span>
                        </div>
                        <div className="w-full bg-[#ffffff08] rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${path.progressBarColor} transition-all duration-500`}
                            style={{ width: `${progressPct}%`, boxShadow: path.progressGlow }}
                          />
                        </div>
                      </div>
                    )}

                    {isCurrent ? (
                      <button
                        onClick={() => router.push("/learn")}
                        className="w-full py-2.5 rounded-xl bg-[#2dd4bf]/10 text-[#2dd4bf] text-sm font-semibold border border-[#2dd4bf]/20 hover:bg-[#2dd4bf]/15 hover:shadow-[0_0_12px_rgba(45,212,191,0.10)] transition-all min-h-[44px] touch-manipulation"
                      >
                        Continue Learning &rarr;
                      </button>
                    ) : isLocked ? (
                      <button
                        onClick={() => setShowPaywall(true)}
                        className="w-full py-2.5 rounded-xl bg-[#a855f7]/10 text-[#a855f7] text-sm font-semibold border border-[#a855f7]/20 hover:bg-[#a855f7]/15 transition-all min-h-[44px] touch-manipulation"
                      >
                        Unlock with Pro
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSwitch(path.id)}
                        disabled={switching}
                        className="w-full py-2.5 rounded-xl bg-[#ffffff08] text-[#aaaaaa] text-sm font-semibold border border-[#ffffff12] hover:bg-[#ffffff12] hover:text-white transition-all min-h-[44px] touch-manipulation disabled:opacity-50"
                      >
                        {switching ? "Switching..." : "Switch to This Path"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </>
  );
}
