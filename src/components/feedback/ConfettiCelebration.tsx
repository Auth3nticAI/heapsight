"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

type CelebrationType = "streak" | "level" | "daily_goal";

interface ConfettiCelebrationProps {
  trigger: boolean;
  type: CelebrationType;
  detail?: string; // e.g. "7-day streak!" or "+50 Bonus XP"
  onDone?: () => void;
}

const MESSAGES: Record<CelebrationType, { text: string; gradient: string }> = {
  streak: {
    text: "Streak Extended!",
    gradient: "from-[#f97316] to-[#ea580c]",
  },
  level: {
    text: "Level Up!",
    gradient: "from-[#a855f7] to-[#7c3aed]",
  },
  daily_goal: {
    text: "Daily Goal Complete!",
    gradient: "from-primary to-[#00cc6e]",
  },
};

export default function ConfettiCelebration({
  trigger,
  type,
  detail,
  onDone,
}: ConfettiCelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    setVisible(true);

    // Fire a confetti pattern based on type
    if (type === "streak") {
      const opts = {
        origin: { y: 0.7 },
        colors: ["#f97316", "#fb923c", "#fdba74", "#fbbf24"],
      };
      confetti({ ...opts, particleCount: 50, spread: 26, startVelocity: 55 });
      confetti({ ...opts, particleCount: 40, spread: 60 });
      confetti({
        ...opts,
        particleCount: 70,
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
    } else if (type === "level") {
      const colors = ["#a855f7", "#c084fc", "#e9d5ff"];
      confetti({
        particleCount: 80,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 80,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
      });
    } else if (type === "daily_goal") {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#00ff88", "#10b981", "#34d399"],
      });
    }

    const timer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [trigger, type, onDone]);

  if (!visible) return null;

  const msg = MESSAGES[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div
        className={`bg-gradient-to-br ${msg.gradient} text-white px-8 py-6 rounded-2xl shadow-2xl animate-bounce_in`}
      >
        <p className="text-2xl font-bold mb-1 text-center">{msg.text}</p>
        {detail && (
          <p className="text-sm text-white/80 text-center">{detail}</p>
        )}
      </div>
    </div>
  );
}
