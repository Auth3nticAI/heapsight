"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface EnhancedConfettiProps {
  trigger: boolean;
  type?: "lesson" | "achievement" | "streak" | "level" | "perfect";
}

export default function EnhancedConfetti({ trigger, type = "lesson" }: EnhancedConfettiProps) {
  useEffect(() => {
    if (!trigger) return;

    // Track timers/frames for cleanup on unmount
    const timers: ReturnType<typeof setInterval>[] = [];
    let cancelled = false;

    const patterns: Record<string, () => void> = {
      lesson: () => {
        const count = 200;
        const defaults = {
          origin: { y: 0.7 },
          colors: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"],
        };

        confetti({ ...defaults, particleCount: Math.floor(count * 0.25), spread: 26, startVelocity: 55 });
        confetti({ ...defaults, particleCount: Math.floor(count * 0.2), spread: 60 });
        confetti({ ...defaults, particleCount: Math.floor(count * 0.35), spread: 100, decay: 0.91, scalar: 0.8 });
        confetti({ ...defaults, particleCount: Math.floor(count * 0.1), spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        confetti({ ...defaults, particleCount: Math.floor(count * 0.1), spread: 120, startVelocity: 45 });
      },

      perfect: () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const colors = ["#fbbf24", "#fcd34d", "#fef3c7", "#fde047"];

        (function frame() {
          if (cancelled || Date.now() > animationEnd) return;
          confetti({
            particleCount: 50 * ((animationEnd - Date.now()) / duration),
            startVelocity: 30,
            spread: 360,
            origin: { x: Math.random(), y: Math.random() - 0.2 },
            colors,
            shapes: ["star"],
          });
          requestAnimationFrame(frame);
        })();
      },

      streak: () => {
        const defaults = {
          origin: { y: 0.7 },
          colors: ["#f97316", "#fb923c", "#fdba74", "#fbbf24"],
          shapes: ["circle" as const],
        };

        confetti({ ...defaults, particleCount: 50, spread: 26, startVelocity: 55 });
        confetti({ ...defaults, particleCount: 40, spread: 60 });
        confetti({ ...defaults, particleCount: 70, spread: 100, decay: 0.91, scalar: 0.8 });
        confetti({ ...defaults, particleCount: 20, spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        confetti({ ...defaults, particleCount: 20, spread: 120, startVelocity: 45 });
      },

      achievement: () => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#a855f7", "#c084fc", "#e9d5ff"],
        });
      },

      level: () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const colors = ["#a855f7", "#c084fc", "#e9d5ff", "#fbbf24"];

        const interval = setInterval(() => {
          if (cancelled || Date.now() > animationEnd) {
            clearInterval(interval);
            return;
          }
          confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors });
          confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors });
        }, 100);
        timers.push(interval);
      },
    };

    patterns[type]?.();

    return () => {
      cancelled = true;
      timers.forEach((t) => clearInterval(t));
    };
  }, [trigger, type]);

  return null;
}
