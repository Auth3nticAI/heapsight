"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import type { Achievement } from "@/lib/achievements";
import { getRarityColor, getRarityGradient } from "@/lib/achievements";

interface AchievementUnlockedProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const RARITY_CONFETTI: Record<
  string,
  { particleCount: number; spread: number; colors: string[] }
> = {
  common: { particleCount: 50, spread: 60, colors: ["#9ca3af", "#d1d5db"] },
  rare: { particleCount: 100, spread: 70, colors: ["#3b82f6", "#60a5fa"] },
  epic: {
    particleCount: 150,
    spread: 90,
    colors: ["#a855f7", "#c084fc", "#e9d5ff"],
  },
  legendary: {
    particleCount: 200,
    spread: 120,
    colors: ["#fbbf24", "#fcd34d", "#fef3c7"],
  },
};

export default function AchievementUnlocked({
  achievement,
  onClose,
}: AchievementUnlockedProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!achievement) {
      setShow(false);
      return;
    }

    setShow(true);

    const cfg = RARITY_CONFETTI[achievement.rarity] || RARITY_CONFETTI.common;
    confetti({ ...cfg, origin: { y: 0.6 } });

    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [achievement, onClose]);

  if (!achievement || !show) return null;

  const rarityColor = getRarityColor(achievement.rarity);
  const rarityGrad = getRarityGradient(achievement.rarity);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade_in">
      <div
        className={`bg-surface bg-gradient-to-br ${rarityGrad} border-2 ${rarityColor} rounded-2xl p-8 max-w-md mx-4 shadow-2xl animate-bounce_in`}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <span className="text-6xl">{achievement.icon}</span>
        </div>

        {/* Headline */}
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Achievement Unlocked!
        </h2>

        {/* Title */}
        <div
          className={`text-xl font-semibold text-center mb-2 ${rarityColor.split(" ")[0]}`}
        >
          {achievement.title}
        </div>

        {/* Description */}
        <p className="text-[#999] text-center mb-4 text-sm font-mono">
          {achievement.description}
        </p>

        {/* XP reward */}
        <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-lg py-2 px-4 text-center">
          <span className="text-[#fbbf24] font-bold text-lg font-mono">
            +{achievement.xp_reward} XP
          </span>
        </div>

        {/* Rarity badge */}
        <div className="mt-4 text-center">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase border font-mono ${rarityColor}`}
          >
            {achievement.rarity}
          </span>
        </div>
      </div>
    </div>
  );
}
