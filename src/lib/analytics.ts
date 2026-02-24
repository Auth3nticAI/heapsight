/**
 * Lightweight analytics tracking — backed by PostHog.
 *
 * Usage:  import { track } from "@/lib/analytics";
 *         track.lessonCompleted("01-hello-world", "space_shooter", 180);
 */

import { posthog } from "./posthog";

function send(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug(`[analytics] ${event}`, props);
  }

  posthog.capture(event, props);
}

export const track = {
  // Onboarding
  onboardingStarted: () => send("onboarding_started"),
  onboardingCompleted: (path: string) =>
    send("onboarding_completed", { path }),

  // Lessons
  lessonStarted: (lessonId: string, path: string, lessonNumber?: number, tier?: string) =>
    send("lesson_started", { lesson_id: lessonId, path, lesson_number: lessonNumber, tier }),
  lessonCompleted: (
    lessonId: string,
    path: string,
    timeSpentSec: number,
    lessonNumber?: number,
    xpEarned?: number,
  ) =>
    send("lesson_completed", {
      lesson_id: lessonId,
      path,
      time_spent_seconds: timeSpentSec,
      lesson_number: lessonNumber,
      xp_earned: xpEarned,
    }),
  paywallHit: (lessonId: string, lessonNumber?: number, path?: string) =>
    send("paywall_hit", { lesson_id: lessonId, lesson_number: lessonNumber, path }),
  codeCompiled: (lessonId: string) =>
    send("code_compiled", { lesson_id: lessonId }),

  // Gamification
  streakExtended: (days: number, milestone: boolean) =>
    send("streak_extended", { days, milestone }),
  achievementUnlocked: (achievementId: string, rarity: string) =>
    send("achievement_unlocked", { achievement_id: achievementId, rarity }),
  levelUp: (newLevel: number, title: string) =>
    send("level_up", { level: newLevel, title }),
  dailyGoalCompleted: () => send("daily_goal_completed"),

  // Social
  leaderboardViewed: (tab: string) =>
    send("leaderboard_viewed", { tab }),
  pathSwitched: (fromPath: string, toPath: string) =>
    send("path_switched", { from_path: fromPath, to_path: toPath }),
  pathSelected: (path: string) =>
    send("path_selected", { path }),

  // Conversion
  upgradeViewed: () => send("upgrade_page_viewed"),
  upgradeClicked: (plan: "monthly" | "yearly") =>
    send("upgrade_clicked", { plan }),
  purchaseCompleted: (amount: number) =>
    send("purchase_completed", { amount }),
  paymentCompleted: (plan: string) =>
    send("payment_completed", { plan }),
};
