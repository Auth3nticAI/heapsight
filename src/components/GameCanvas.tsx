"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  createGameState,
  updateGameState,
  renderGame,
  GameState,
  CANVAS_W,
  CANVAS_H,
} from "@/lib/game-engine";

interface GameCanvasProps {
  isFixed: boolean;
  isPaused: boolean;
  onCrash: () => void;
  onReset: () => void;
  speed: number;
}

export default function GameCanvas({
  isFixed,
  isPaused,
  onCrash,
  onReset,
  speed,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createGameState());
  const prevPhaseRef = useRef<string>("playing");
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Store callbacks in refs to avoid effect re-runs
  const onCrashRef = useRef(onCrash);
  const onResetRef = useRef(onReset);
  onCrashRef.current = onCrash;
  onResetRef.current = onReset;

  const isFixedRef = useRef(isFixed);
  const isPausedRef = useRef(isPaused);
  const speedRef = useRef(speed);
  isFixedRef.current = isFixed;
  isPausedRef.current = isPaused;
  speedRef.current = speed;

  // Reset game when isFixed changes
  useEffect(() => {
    stateRef.current = createGameState();
    prevPhaseRef.current = "playing";
    lastTimeRef.current = 0;
  }, [isFixed]);

  const loop = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }

    let dt = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    // Clamp dt to prevent huge jumps
    dt = Math.min(dt, 0.05);
    dt *= speedRef.current;

    if (!isPausedRef.current) {
      const prevPhase = stateRef.current.phase;
      updateGameState(stateRef.current, dt, isFixedRef.current);

      // Detect phase transitions
      if (prevPhase === "playing" && stateRef.current.phase === "crashing") {
        onCrashRef.current();
      }
      if (
        prevPhaseRef.current !== "playing" &&
        stateRef.current.phase === "playing" &&
        stateRef.current.elapsed === 0
      ) {
        onResetRef.current();
      }
      prevPhaseRef.current = stateRef.current.phase;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        renderGame(ctx, stateRef.current);
      }
    }

    animRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [loop]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className={`rounded-lg border border-[#1a1a2e] ${
          stateRef.current.phase === "crashing" ? "animate-shake" : ""
        }`}
        style={{
          background: "#0d0d1a",
          imageRendering: "pixelated",
        }}
      />
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none rounded-lg"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        }}
      />
    </div>
  );
}
