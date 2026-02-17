"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import GameCanvas from "@/components/GameCanvas";
import HeapArena, { HeapPhase } from "@/components/HeapArena";
import CodeDisplay from "@/components/CodeDisplay";
import ReplayController from "@/components/ReplayController";

type AppState = "attract" | "crashing" | "replaying" | "diagnosed" | "fixed";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("attract");
  const [replayTime, setReplayTime] = useState(4.0);
  const [authedEmail, setAuthedEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setAuthedEmail(user.email || "User");
    });
  }, []);

  // Derive component props from app state
  const isFixed = appState === "fixed";
  const isReplaying = appState === "replaying";
  const gameSpeed = isReplaying ? 0.25 : 1.0;

  const heapPhase: HeapPhase = (() => {
    switch (appState) {
      case "attract":
        return "running";
      case "crashing":
        return "crash";
      case "replaying":
        return "running";
      case "diagnosed":
        return "diagnosed";
      case "fixed":
        return "fixed";
      default:
        return "idle";
    }
  })();

  const handleCrash = useCallback(() => {
    if (appState === "attract") {
      setAppState("crashing");
    }
  }, [appState]);

  const handleReset = useCallback(() => {
    if (appState === "crashing") {
      setAppState("attract");
    }
  }, [appState]);

  const handleShowMeWhy = useCallback(() => {
    setAppState("replaying");
    setReplayTime(4.0);
  }, []);

  const handleReplayTimeUpdate = useCallback((time: number) => {
    setReplayTime(time);
  }, []);

  const handleReplayComplete = useCallback(() => {
    setAppState("diagnosed");
  }, []);

  const handleFixIt = useCallback(() => {
    setAppState("fixed");
  }, []);

  // CTA button text and handler
  const ctaConfig = (() => {
    switch (appState) {
      case "attract":
      case "crashing":
        return {
          text: "SHOW ME WHY THIS IS CRASHING",
          onClick: handleShowMeWhy,
          visible: true,
          color: "bg-warning text-black hover:bg-warning/90",
          glow: appState === "crashing",
        };
      case "diagnosed":
        return {
          text: "FIX IT WITH ONE CLICK",
          onClick: handleFixIt,
          visible: true,
          color: "bg-primary text-black hover:bg-primary/90",
          glow: true,
        };
      default:
        return { text: "", onClick: () => {}, visible: false, color: "", glow: false };
    }
  })();

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-[#1a1a2e] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">
              {isFixed ? "HeapSight: Crash eliminated." : "HeapSight"}
            </h1>
            <p className="text-xs text-[#888] font-mono mt-0.5">
              See Your Heap Come Alive. Fix Crashes in 18 Seconds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status badge */}
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-mono ${
                isFixed
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : appState === "crashing"
                  ? "bg-danger/10 text-danger border border-danger/30 animate-pulse"
                  : "bg-[#1a1a2e] text-[#666] border border-[#2a2a3e]"
              }`}
            >
              {isFixed ? "RUNNING CLEAN" : appState === "crashing" ? "CRASHED" : "LIVE"}
            </div>

            {authedEmail ? (
              <Link
                href="/learn"
                className="px-3 py-1.5 bg-primary text-black text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 border border-[#2a2a3e] text-[#888] text-xs font-mono rounded-lg hover:border-primary/40 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero section */}
      <div className="max-w-6xl mx-auto px-6 pt-6 pb-2">
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-1">
          {isFixed
            ? "Clean! No leaks. No crashes."
            : "See Why Your Code Crashes. Fix It in 18 Seconds."}
        </h2>
        <p className="text-sm text-[#666] mb-4">
          {appState === "attract" && "Watch your C++ heap come alive. No more mysterious segfaults."}
          {appState === "crashing" && "use-after-free detected at targetLock->position"}
          {appState === "replaying" && "HeapSight replaying crash sequence at 0.25x..."}
          {appState === "diagnosed" && "Dangling pointer found. Ready to fix."}
          {isFixed && "targetLock nullified before delete. No more SEGFAULT."}
        </p>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Game + CTA */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <GameCanvas
                isFixed={isFixed}
                isPaused={false}
                onCrash={handleCrash}
                onReset={handleReset}
                speed={gameSpeed}
              />

              {/* "0 LEAKS / 0 CRASHES" badge overlay when fixed */}
              {isFixed && (
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className="px-2 py-1 bg-primary/20 border border-primary/40 rounded text-[10px] font-mono text-primary">
                    0 LEAKS
                  </span>
                  <span className="px-2 py-1 bg-primary/20 border border-primary/40 rounded text-[10px] font-mono text-primary">
                    0 CRASHES
                  </span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            {ctaConfig.visible && (
              <button
                onClick={ctaConfig.onClick}
                className={`
                  px-8 py-3 rounded-lg font-semibold text-sm tracking-wide
                  transition-all duration-200
                  ${ctaConfig.color}
                  ${ctaConfig.glow ? "animate-glow_green shadow-lg" : ""}
                `}
              >
                {ctaConfig.text}
              </button>
            )}

            {isFixed && (
              <>
                <p className="text-xs text-primary/60 font-mono animate-pulse">
                  Game running clean. No crashes detected.
                </p>
                {authedEmail ? (
                  <div className="mt-2 text-center">
                    <p className="text-sm text-[#888] mb-2">Welcome back! Continue learning.</p>
                    <Link
                      href="/learn"
                      className="inline-block px-6 py-2.5 bg-primary text-black font-semibold text-sm rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Go to Dashboard &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className="mt-2 text-center">
                    <Link
                      href="/signup"
                      className="inline-block px-6 py-2.5 bg-primary text-black font-semibold text-sm rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Start Learning C++ for Free &rarr;
                    </Link>
                    <p className="text-xs text-[#555] mt-2">
                      Already have an account?{" "}
                      <Link href="/login" className="text-primary/70 hover:text-primary transition-colors">
                        Sign In
                      </Link>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right column: Code Display */}
          <div
            className={`transition-opacity duration-500 ${
              appState === "attract" ? "opacity-30" : "opacity-100"
            }`}
          >
            <CodeDisplay variant={isFixed ? "fixed" : "buggy"} />
          </div>
        </div>

        {/* Heap Arena */}
        <div className="mt-6">
          <HeapArena
            phase={heapPhase}
            elapsedTime={isReplaying ? replayTime : appState === "crashing" ? 6.5 : 5.0}
            showPointers={
              appState === "crashing" ||
              appState === "diagnosed" ||
              appState === "replaying"
            }
          />
        </div>

        {/* Replay Controller */}
        <div className="mt-4">
          <ReplayController
            isActive={isReplaying}
            onTimeUpdate={handleReplayTimeUpdate}
            onComplete={handleReplayComplete}
          />
        </div>
      </div>

      {/* ─── Gamification Showcase ────────────────────────────────── */}
      <section className="border-t border-[#1a1a2e] bg-[#0a0a12]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-4 py-1.5 rounded-full mb-4 text-xs font-mono">
              Streaks &middot; Achievements &middot; Leaderboards
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Gamification That Makes C++ Addictive
            </h2>
            <p className="text-sm text-[#888] max-w-xl mx-auto">
              We studied Duolingo, SoloLearn, and Brilliant to build the most
              engaging C++ learning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-xl border border-[#2a2a3e] bg-surface text-center">
              <div className="text-5xl mb-4">{"\uD83D\uDD25"}</div>
              <h3 className="text-lg font-bold text-white mb-2">Daily Streaks</h3>
              <p className="text-xs text-[#888] mb-4 font-mono">
                Build a coding habit. Don&apos;t break the chain. Users with 7+
                day streaks are 5x more likely to finish their path.
              </p>
              <div className="bg-[#f97316]/10 border border-[#f97316]/30 rounded-lg p-2.5 text-[#f97316] text-xs font-mono font-bold">
                Streak milestones at 7, 14, 30, 100 days
              </div>
            </div>
            <div className="p-6 rounded-xl border border-[#2a2a3e] bg-surface text-center">
              <div className="text-5xl mb-4">{"\uD83C\uDFC6"}</div>
              <h3 className="text-lg font-bold text-white mb-2">15 Achievements</h3>
              <p className="text-xs text-[#888] mb-4 font-mono">
                Unlock badges from Common to Legendary. Each badge earns bonus XP
                and bragging rights.
              </p>
              <div className="flex justify-center gap-3 text-3xl">
                {"\uD83C\uDFAF"} {"\uD83D\uDCDA"} {"\uD83D\uDC8E"} {"\uD83D\uDC51"}
              </div>
            </div>
            <div className="p-6 rounded-xl border border-[#2a2a3e] bg-surface text-center">
              <div className="text-5xl mb-4">{"\uD83D\uDCCA"}</div>
              <h3 className="text-lg font-bold text-white mb-2">Compete Globally</h3>
              <p className="text-xs text-[#888] mb-4 font-mono">
                See how you rank. Weekly XP, all-time XP, and streak leaderboards.
                Top 3 get medals.
              </p>
              <div className="text-3xl">
                {"\uD83E\uDD47"} {"\uD83E\uDD48"} {"\uD83E\uDD49"}
              </div>
            </div>
          </div>

          {/* 4 paths showcase */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-white mb-2">
              4 Industry Paradigms, 100+ Lessons
            </h3>
            <p className="text-xs text-[#888] font-mono">
              Not reskins &mdash; genuinely different architectures
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: "\uD83D\uDE80", name: "Space Shooter", paradigm: "ECS Architecture" },
              { icon: "\uD83C\uDFC3", name: "Platformer", paradigm: "State Machines" },
              { icon: "\u2694\uFE0F", name: "Simple RPG", paradigm: "Data-Driven OOP" },
              { icon: "\uD83E\uDD16", name: "Robotics", paradigm: "Embedded Systems" },
            ].map((p) => (
              <div key={p.name} className="p-4 rounded-xl border border-[#2a2a3e] bg-surface text-center">
                <div className="text-3xl mb-2">{p.icon}</div>
                <p className="text-sm font-semibold text-white">{p.name}</p>
                <p className="text-[9px] font-mono text-primary/70 mt-0.5">{p.paradigm}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { n: "4", label: "Paradigms" },
              { n: "100+", label: "Lessons" },
              { n: "15", label: "Achievements" },
              { n: "50", label: "Levels" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-primary mb-0.5 font-mono">{s.n}</div>
                <div className="text-[10px] text-[#666] font-mono">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            {authedEmail ? (
              <Link href="/learn" className="inline-block px-8 py-3 bg-primary text-black font-bold text-sm rounded-lg hover:bg-primary/90 transition-colors">
                Go to Dashboard &rarr;
              </Link>
            ) : (
              <div>
                <Link href="/signup" className="inline-block px-8 py-3 bg-primary text-black font-bold text-sm rounded-lg hover:bg-primary/90 transition-colors mb-3">
                  Start Learning C++ for Free &rarr;
                </Link>
                <p className="text-[10px] text-[#555] font-mono">
                  5 lessons free &middot; No credit card required
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-[#1a1a2e] px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-[#555]">
          <span>&copy; 2026 HeapSight. Learn C++ the fun way.</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
            <Link href="/upgrade" className="hover:text-[#a855f7] transition-colors">Pro</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
