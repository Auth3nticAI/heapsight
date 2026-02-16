"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import GameCanvas from "@/components/GameCanvas";
import MemoryArena, { MemoryPhase } from "@/components/MemoryArena";
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

  const memoryPhase: MemoryPhase = (() => {
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
    // Show waitlist modal after 4s of clean running
    fixTimerRef.current = setTimeout(() => {
      setAppState("waitlist");
      setShowModal(true);
    }, 4000);
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
          text: "SHOW ME WHY",
          onClick: handleShowMeWhy,
          visible: true,
          color: "bg-warning text-black hover:bg-warning/90",
          glow: appState === "crashing",
        };
      case "diagnosed":
        return {
          text: "FIX IT",
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
            <h1 className="text-lg font-semibold text-white">
              {appState === "fixed" || appState === "waitlist"
                ? "HeapSight: Crash eliminated."
                : "HeapSight: See Inside Your Heap. Fix Crashes in 18 Seconds."}
            </h1>
            <p className="text-xs text-[#666] font-mono mt-0.5">
              {appState === "attract" && "Watch the SEGFAULT. Then find out why."}
              {appState === "crashing" && "use-after-free detected at targetLock->position"}
              {appState === "replaying" && "HeapSight replaying crash sequence at 0.25x..."}
              {appState === "diagnosed" && "Dangling pointer found. Ready to fix."}
              {(appState === "fixed" || appState === "waitlist") &&
                "targetLock nullified before delete. No more SEGFAULT."}
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

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Game + CTA */}
          <div className="flex flex-col items-center gap-4">
            <GameCanvas
              isFixed={isFixed}
              isPaused={false}
              onCrash={handleCrash}
              onReset={handleReset}
              speed={gameSpeed}
            />

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
              <p className="text-xs text-primary/60 font-mono animate-pulse">
                Game running clean. No crashes detected.
              </p>
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

        {/* Memory Arena */}
        <div className="mt-6">
          <MemoryArena
            phase={memoryPhase}
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
