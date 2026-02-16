"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import GameCanvas from "@/components/GameCanvas";
import HeapArena, { HeapPhase } from "@/components/HeapArena";
import CodeDisplay from "@/components/CodeDisplay";
import ReplayController from "@/components/ReplayController";
import WaitlistModal from "@/components/WaitlistModal";

type AppState =
  | "attract"
  | "crashing"
  | "replaying"
  | "diagnosed"
  | "fixed"
  | "waitlist";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("attract");
  const [replayTime, setReplayTime] = useState(4.0);
  const [showModal, setShowModal] = useState(false);
  const fixTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derive component props from app state
  const isFixed = appState === "fixed" || appState === "waitlist";
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
      case "waitlist":
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
    // Show waitlist modal after 3s of clean running
    fixTimerRef.current = setTimeout(() => {
      setAppState("waitlist");
      setShowModal(true);
    }, 3000);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (fixTimerRef.current) clearTimeout(fixTimerRef.current);
    };
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
              {appState === "fixed" || appState === "waitlist"
                ? "HeapSight: Crash eliminated."
                : "HeapSight"}
            </h1>
            <p className="text-xs text-[#888] font-mono mt-0.5">
              See Your Heap Come Alive. Fix Crashes in 18 Seconds.
            </p>
          </div>

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
          {(appState === "fixed" || appState === "waitlist") &&
            "targetLock nullified before delete. No more SEGFAULT."}
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
                <Link
                  href="/signup"
                  className="mt-2 inline-block px-6 py-2.5 bg-primary text-black font-semibold text-sm rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Start Learning C++ &rarr;
                </Link>
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

      {/* Waitlist Modal */}
      <WaitlistModal isOpen={showModal} onClose={handleCloseModal} />
    </main>
  );
}
