"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { ALL_RPG_LESSONS } from "@/data/lessons/rpg-index";
import { ALL_PLATFORMER_LESSONS } from "@/data/lessons/platformer-index";
import { ALL_CRAWLER_LESSONS } from "@/data/lessons/crawler-index";
import { ALL_SHOOTER_LESSONS } from "@/data/lessons/shooter-index";
import { getLevelInfo } from "@/lib/lesson-metadata";

// ─── Inline SVG Icons ──────────────────────────────────────────────────────


function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 23c-4.97 0-8-3.03-8-7.5 0-3.5 2-6.5 4-8.5.33-.33.83-.15.93.28.3 1.3.87 2.42 1.57 3.22C11.1 7.5 12 4 12 2c0-.55.45-.73.8-.4C15.8 4.2 20 8.5 20 15.5c0 4.47-3.03 7.5-8 7.5z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 16l.75 2.25L8 19l-2.25.75L5 22l-.75-2.25L2 19l2.25-.75L5 16z" />
    </svg>
  );
}

function GearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

// ─── Constants ──────────────────────────────────────────────────────────────

const TEMPLATE_LABELS: Record<string, string> = {
  space_shooter: "Space Shooter",
  platformer: "Platformer",
  simple_rpg: "Simple RPG",
  dungeon_crawler: "Dungeon Crawler",
};

const TEMPLATE_ICONS: Record<string, string> = {
  space_shooter: "\u{1F680}",
  platformer: "\u{1F3C3}",
  simple_rpg: "\u2694\uFE0F",
  dungeon_crawler: "\u{1F3F0}",
};

// ─── Component ──────────────────────────────────────────────────────────────

interface ProfileData {
  email: string;
  tier: "free" | "pro";
  totalXp: number;
  template: string | null;
  completedCount: number;
  currentStreak: number;
  longestStreak: number;
}

export default function AccountPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const [profileRes, progressRes, streakRes] = await Promise.all([
        supabase.from("profiles").select("total_xp, selected_game_template, tier").eq("id", user.id).single(),
        supabase.from("lesson_progress").select("status").eq("user_id", user.id),
        supabase.from("user_streaks").select("current_streak, longest_streak").eq("user_id", user.id).single(),
      ]);

      const completedCount = progressRes.data?.filter((p) => p.status === "completed").length || 0;

      setProfile({
        email: user.email || "",
        tier: profileRes.data?.tier || "free",
        totalXp: profileRes.data?.total_xp || 0,
        template: profileRes.data?.selected_game_template || null,
        completedCount,
        currentStreak: streakRes.data?.current_streak || 0,
        longestStreak: streakRes.data?.longest_streak || 0,
      });
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm font-mono text-[#AFBCD5]/50 animate-pulse">Loading...</p>
      </div>
    );
  }

  const displayName = profile.email.split("@")[0] || "User";
  const levelInfo = getLevelInfo(profile.totalXp);
  const pathLessons =
    profile.template === "simple_rpg" ? ALL_RPG_LESSONS :
    profile.template === "platformer" ? ALL_PLATFORMER_LESSONS :
    profile.template === "dungeon_crawler" ? ALL_CRAWLER_LESSONS :
    ALL_SHOOTER_LESSONS;
  const freeCount = pathLessons.filter((l) => l.tier === "free").length;
  const isCrawlerPath = profile.template === "dungeon_crawler";

  return (
    <>
      {/* Header */}
      <header className="border-b border-white/[0.05] px-4 sm:px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <div className="md:pl-12 lg:pl-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Account
            </h1>
            <p className="text-xs text-[#AFBCD5]/50 font-mono mt-1 hidden lg:block">
              Your profile, stats, and subscription
            </p>
            <p className="text-xs text-[#AFBCD5]/50 font-mono mt-1 lg:hidden">Your profile overview</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Profile Card */}
        <section className="p-5 rounded-2xl border border-white/[0.08] bg-[#071528]">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#246BFD] to-[#0040C3] flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-white truncate">{displayName}</p>
              <p className="text-xs font-mono text-[#AFBCD5]/50 truncate">{profile.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-gradient-to-r from-[#246BFD] to-[#0040C3] text-white">
                  LVL {levelInfo.level}
                </span>
                <span className="text-[10px] font-mono text-[#AFBCD5]/70">{levelInfo.title}</span>
              </div>
            </div>
            {profile.tier === "pro" && (
              <span className="text-[8px] font-mono font-bold px-2 py-1 rounded bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30 shrink-0">
                PRO
              </span>
            )}
          </div>

          {/* Level Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono text-[#AFBCD5]/70">Level Progress</span>
              <span className="text-[9px] font-mono text-[#AFBCD5]/50">
                {levelInfo.xpInLevel}/{levelInfo.xpForNext} XP
              </span>
            </div>
            <div className="w-full bg-white/[0.05] rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-[#246BFD] to-[#0040C3] transition-all duration-500"
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="p-3 rounded-xl bg-[#071528] border border-white/[0.08] text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ZapIcon className="h-3.5 w-3.5 text-[#fbbf24]" />
              </div>
              <p className="text-sm sm:text-base font-bold text-white font-mono">{profile.totalXp.toLocaleString()}</p>
              <p className="text-[8px] font-mono text-[#AFBCD5]/50 uppercase">Total XP</p>
            </div>
            <div className="p-3 rounded-xl bg-[#071528] border border-white/[0.08] text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <FlameIcon className="h-3.5 w-3.5 text-[#f97316]" />
              </div>
              <p className="text-base font-bold text-white font-mono">{profile.currentStreak}</p>
              <p className="text-[8px] font-mono text-[#AFBCD5]/50 uppercase">Streak</p>
            </div>
            <div className="p-3 rounded-xl bg-[#071528] border border-white/[0.08] text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-sm">{"\u2713"}</span>
              </div>
              <p className="text-base font-bold text-white font-mono">{profile.completedCount}/{pathLessons.length}</p>
              <p className="text-[8px] font-mono text-[#AFBCD5]/50 uppercase">Lessons</p>
            </div>
          </div>
        </section>

        {/* Learning Path */}
        <section className="p-5 rounded-2xl border border-white/[0.08] bg-[#071528]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Learning Path</h2>
            <Link
              href="/paths"
              className="text-[10px] font-mono text-primary hover:text-primary/80 transition-colors"
            >
              Switch Path &rarr;
            </Link>
          </div>
          {profile.template ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#071528] border border-white/[0.08] flex items-center justify-center">
                <span className="text-2xl">{TEMPLATE_ICONS[profile.template] || "?"}</span>
              </div>
              <div>
                <p className="text-sm text-white font-semibold">
                  {TEMPLATE_LABELS[profile.template] || profile.template}
                </p>
                <p className="text-[10px] font-mono text-[#AFBCD5]/50">
                  {isCrawlerPath ? "C++ Dungeon Crawler Path" : "C++ Game Dev Path"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#AFBCD5]/50 font-mono">No path selected</p>
          )}
        </section>

        {/* Subscription */}
        <section className="p-5 rounded-2xl border border-white/[0.08] bg-[#071528]">
          <h2 className="text-sm font-semibold text-white mb-4">Subscription</h2>
          {profile.tier === "pro" ? (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#246BFD]/10 flex items-center justify-center shrink-0">
                <SparklesIcon className="h-5 w-5 text-[#a855f7]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#246BFD]/10 text-[#a855f7] border border-[#a855f7]/20 font-bold">
                    PRO
                  </span>
                  <span className="text-xs text-white font-semibold">All lessons unlocked</span>
                </div>
                <p className="text-[10px] font-mono text-[#AFBCD5]/50">
                  Lifetime access &middot; No subscription
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#071528] text-[#AFBCD5]/70 border border-white/[0.08] font-bold">
                  FREE
                </span>
                <span className="text-xs text-[#ccc]">{freeCount} lessons unlocked</span>
              </div>
              <Link
                href="/upgrade"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#246BFD] to-[#0040C3] hover:from-[#246BFD]/90 hover:to-[#0040C3]/90 text-white font-semibold text-sm rounded-xl transition-all min-h-[44px] touch-manipulation"
              >
                <SparklesIcon className="h-4 w-4" />
                Upgrade to Pro &mdash; $67
              </Link>
              <p className="text-[10px] font-mono text-[#AFBCD5]/50 text-center">
                One-time payment &middot; Lifetime access
              </p>
            </div>
          )}
        </section>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/settings"
            className="flex items-center justify-center gap-2 p-4 rounded-xl border border-white/[0.08] bg-white/[0.05] hover:bg-white/[0.08] transition-colors min-h-[44px] touch-manipulation"
          >
            <GearIcon className="h-5 w-5 text-[#AFBCD5]/70" />
            <span className="text-sm font-semibold text-white">Edit Settings</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 p-4 rounded-xl border border-red-600/20 bg-red-600/10 hover:bg-red-600/15 transition-colors min-h-[44px] touch-manipulation"
          >
            <LogOutIcon className="h-5 w-5 text-danger" />
            <span className="text-sm font-semibold text-danger">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
