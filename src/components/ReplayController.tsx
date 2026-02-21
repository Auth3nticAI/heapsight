"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface ReplayControllerProps {
  isActive: boolean;
  onTimeUpdate: (time: number) => void;
  onComplete: () => void;
}

const REPLAY_START = 4.0; // Start replay at T=4s
const REPLAY_END = 6.5; // End at T=6.5s (just past crash)
const REPLAY_DURATION = REPLAY_END - REPLAY_START;
const PLAYBACK_SPEED = 0.25;

interface KeyFrame {
  time: number;
  label: string;
  color: string;
}

const KEY_FRAMES: KeyFrame[] = [
  { time: 4.0, label: "Enemy spawned", color: "#00ff88" },
  { time: 5.0, label: "Target locked", color: "#ffaa00" },
  { time: 5.5, label: "Enemy killed", color: "#ffaa00" },
  { time: 5.5, label: "Memory freed", color: "#ff0040" },
  { time: 6.0, label: "Pointer access", color: "#ff0040" },
  { time: 6.0, label: "SEGFAULT", color: "#ff0040" },
];

export default function ReplayController({
  isActive,
  onTimeUpdate,
  onComplete,
}: ReplayControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(REPLAY_START);
  const animRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const play = useCallback(() => {
    setIsPlaying(true);
    lastFrameRef.current = 0;
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const seek = useCallback(
    (time: number) => {
      setCurrentTime(time);
      onTimeUpdate(time);
    },
    [onTimeUpdate]
  );

  const stepForward = useCallback(() => {
    const next = Math.min(currentTime + 0.1, REPLAY_END);
    seek(next);
  }, [currentTime, seek]);

  const stepBackward = useCallback(() => {
    const prev = Math.max(currentTime - 0.1, REPLAY_START);
    seek(prev);
  }, [currentTime, seek]);

  // Auto-play when activated
  useEffect(() => {
    if (isActive) {
      setCurrentTime(REPLAY_START);
      onTimeUpdate(REPLAY_START);
      // Small delay before auto-playing
      const timer = setTimeout(() => play(), 500);
      return () => clearTimeout(timer);
    } else {
      setIsPlaying(false);
      setCurrentTime(REPLAY_START);
    }
  }, [isActive, play, onTimeUpdate]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !isActive) {
      cancelAnimationFrame(animRef.current);
      return;
    }

    const tick = (timestamp: number) => {
      if (lastFrameRef.current === 0) {
        lastFrameRef.current = timestamp;
      }

      const dt = ((timestamp - lastFrameRef.current) / 1000) * PLAYBACK_SPEED;
      lastFrameRef.current = timestamp;

      setCurrentTime((prev) => {
        const next = prev + dt;
        if (next >= REPLAY_END) {
          setIsPlaying(false);
          onCompleteRef.current();
          return REPLAY_END;
        }
        onTimeUpdate(next);
        return next;
      });

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, isActive, onTimeUpdate]);

  if (!isActive) return null;

  const progress =
    ((currentTime - REPLAY_START) / REPLAY_DURATION) * 100;

  return (
    <div className="w-full bg-[#071528] rounded-lg border border-white/[0.05] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-mono text-[#AFBCD5]/50 uppercase tracking-wider">
          Crash Replay
        </h3>
        <span className="text-xs font-mono text-warning">
          {PLAYBACK_SPEED}x speed
        </span>
      </div>

      {/* Timeline bar */}
      <div className="relative mb-2">
        <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${progress}%`,
              background:
                currentTime >= 6.0
                  ? "linear-gradient(90deg, #00ff88, #ffaa00, #ff0040)"
                  : currentTime >= 5.5
                  ? "linear-gradient(90deg, #00ff88, #ffaa00)"
                  : "#00ff88",
            }}
          />
        </div>

        {/* Scrub input */}
        <input
          type="range"
          min={REPLAY_START}
          max={REPLAY_END}
          step={0.01}
          value={currentTime}
          onChange={(e) => seek(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {/* Keyframe markers */}
        <div className="absolute top-0 left-0 w-full h-2 pointer-events-none">
          {KEY_FRAMES.map((kf, i) => (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
              style={{
                left: `${((kf.time - REPLAY_START) / REPLAY_DURATION) * 100}%`,
                backgroundColor: kf.color,
              }}
            />
          ))}
        </div>
      </div>

      {/* Keyframe labels */}
      <div className="flex justify-between mb-3 relative h-4">
        {KEY_FRAMES.filter((_, i) => i % 2 === 0).map((kf, i) => (
          <span
            key={i}
            className="text-[9px] font-mono absolute -translate-x-1/2"
            style={{
              left: `${((kf.time - REPLAY_START) / REPLAY_DURATION) * 100}%`,
              color: kf.color,
              opacity: currentTime >= kf.time ? 1 : 0.3,
            }}
          >
            {kf.label}
          </span>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={stepBackward}
          className="w-8 h-8 rounded bg-white/[0.05] border border-white/[0.08] text-[#AFBCD5]/50 hover:text-white hover:border-white/[0.15] transition-colors flex items-center justify-center text-xs font-mono"
        >
          &lt;
        </button>

        <button
          onClick={isPlaying ? pause : play}
          className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors flex items-center justify-center text-sm font-mono"
        >
          {isPlaying ? "||" : "\u25B6"}
        </button>

        <button
          onClick={stepForward}
          className="w-8 h-8 rounded bg-white/[0.05] border border-white/[0.08] text-[#AFBCD5]/50 hover:text-white hover:border-white/[0.15] transition-colors flex items-center justify-center text-xs font-mono"
        >
          &gt;
        </button>

        {/* Timestamp */}
        <span className="ml-4 text-sm font-mono tabular-nums">
          <span className="text-[#AFBCD5]/50">T+</span>
          <span
            className={currentTime >= 6.0 ? "text-danger" : "text-[#e0e0e0]"}
          >
            {currentTime.toFixed(1)}s
          </span>
          {currentTime >= 6.0 && (
            <span className="text-danger ml-2 animate-pulse">(CRASH)</span>
          )}
        </span>
      </div>
    </div>
  );
}
