"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

interface PathOption {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const PATHS: PathOption[] = [
  { id: "differential_drive_robot", name: "Robotics", icon: "\uD83E\uDD16", description: "Program autonomous robots" },
  { id: "space_shooter", name: "Space Shooter", icon: "\uD83D\uDE80", description: "Build arcade space combat" },
  { id: "platformer", name: "Platformer", icon: "\uD83C\uDFC3", description: "Create a 2D platformer" },
  { id: "simple_rpg", name: "Simple RPG", icon: "\u2694\uFE0F", description: "Design RPG mechanics" },
];

interface PathSwitcherProps {
  currentPath: string;
  userTier: "free" | "pro";
  pathProgress: Record<string, number>;
  totalLessons: number;
  onPathChange: (pathId: string) => void;
  onUpgradeClick: () => void;
}

export default function PathSwitcher({
  currentPath,
  userTier,
  pathProgress,
  totalLessons,
  onPathChange,
  onUpgradeClick,
}: PathSwitcherProps) {
  const [switching, setSwitching] = useState(false);

  const handleClick = async (pathId: string) => {
    if (pathId === currentPath || switching) return;

    if (userTier === "free") {
      onUpgradeClick();
      return;
    }

    setSwitching(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("profiles")
        .update({ selected_game_template: pathId })
        .eq("id", user.id);

      // Upsert path_progress for tracking
      await supabase.from("path_progress").upsert(
        {
          user_id: user.id,
          path_template: pathId,
          last_accessed: new Date().toISOString(),
        },
        { onConflict: "user_id,path_template" }
      );

      onPathChange(pathId);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="mb-6 p-4 rounded-xl border border-[#2a2a3e] bg-surface">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-mono font-bold text-[#888] uppercase tracking-wider">
          Learning Path
        </h3>
        {userTier === "pro" ? (
          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-gradient-to-r from-[#a855f7] to-[#6366f1] text-white">
            PRO &mdash; Switch Anytime
          </span>
        ) : (
          <span className="text-[9px] font-mono text-[#555]">
            1 path included
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PATHS.map((path) => {
          const isActive = path.id === currentPath;
          const isLocked = userTier === "free" && !isActive;

          return (
            <button
              key={path.id}
              onClick={() => handleClick(path.id)}
              disabled={switching || isActive}
              className={`
                relative p-3.5 sm:p-3 rounded-xl border-2 transition-all text-left min-h-[100px] sm:min-h-[76px] touch-manipulation
                ${
                  isActive
                    ? "border-primary/50 bg-primary/[0.05]"
                    : isLocked
                    ? "border-[#1a1a2e] bg-[#0e0e14] opacity-50"
                    : "border-[#2a2a3e] bg-[#111118] hover:border-[#3a3a4e] active:scale-[0.98] cursor-pointer"
                }
              `}
            >
              {/* Lock icon for non-active paths (free users) */}
              {isLocked && (
                <svg
                  className="absolute top-2.5 right-2.5 h-4 w-4 text-[#a855f7]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              )}

              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl sm:text-lg">{path.icon}</span>
                <span
                  className={`text-sm sm:text-xs font-semibold truncate ${
                    isActive
                      ? "text-primary"
                      : isLocked
                      ? "text-[#555]"
                      : "text-white"
                  }`}
                >
                  {path.name}
                </span>
              </div>

              {isActive ? (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-[9px] font-mono text-primary/70">Active</span>
                  <span className="text-[10px] sm:text-[9px] font-mono text-[#888]">
                    {pathProgress[path.id] || 0}/{totalLessons}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className={`text-[10px] sm:text-[9px] font-mono truncate ${isLocked ? "text-[#444]" : "text-[#666]"}`}>
                    {path.description}
                  </p>
                  {!isLocked && (pathProgress[path.id] || 0) > 0 && (
                    <span className="text-[10px] sm:text-[9px] font-mono text-[#555] ml-1 shrink-0">
                      {pathProgress[path.id]}/{totalLessons}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {userTier === "free" && (
        <button
          onClick={onUpgradeClick}
          className="w-full mt-2.5 text-[9px] font-mono text-[#555] hover:text-[#a855f7] transition-colors text-center"
        >
          <svg
            className="inline h-3 w-3 mr-1 text-[#a855f7]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Upgrade to Pro to access all 4 learning paths
        </button>
      )}
    </div>
  );
}
