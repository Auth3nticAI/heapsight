"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface LevelUpCelebrationProps {
  level: number;
  title: string;
  onClose: () => void;
}

export default function LevelUpCelebration({
  level,
  title,
  onClose,
}: LevelUpCelebrationProps) {
  useEffect(() => {
    const colors = ["#a855f7", "#c084fc", "#e9d5ff", "#fbbf24"];
    const end = Date.now() + 3000;

    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        setTimeout(onClose, 500);
        return;
      }
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none">
      <div className="bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-white px-8 sm:px-12 py-6 sm:py-8 rounded-3xl shadow-2xl animate-bounce_in border-4 border-[#a78bfa] mx-4">
        <div className="text-center">
          {/* Star icon */}
          <div className="text-5xl sm:text-6xl mb-4 animate-pulse_subtle">&#10024;</div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-2">Level {level}!</h2>
          <p className="text-xl sm:text-2xl text-purple-200 mb-4">{title}</p>
          <div className="bg-[#1a1040]/50 rounded-lg px-6 py-3">
            <p className="text-sm text-purple-200 font-mono">
              You&apos;re getting stronger!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
