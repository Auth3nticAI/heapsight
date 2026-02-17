/**
 * Lightweight analytics tracking.
 *
 * Logs events to console in dev. In production, swap the `send` function
 * to forward events to PostHog, Mixpanel, or your own endpoint.
 *
 * Usage:  import { track } from "@/lib/analytics";
 *         track.lessonCompleted("01-hello-world", "space_shooter", 180);
 */

const IS_PROD =
  typeof window !== "undefined" &&
  process.env.NODE_ENV === "production";

function send(event: string, props?: Record<string, unknown>) {
  if (!IS_PROD) {
    // eslint-disable-next-line no-console
    console.debug(`[analytics] ${event}`, props);
    return;
  }

  // Production: POST to your analytics endpoint.
  // Replace this with PostHog, Mixpanel, or a custom API route.
  //
  // Example with PostHog:
  //   posthog.capture(event, props);
  //
  // Example with custom endpoint:
  //   fetch("/api/events", {
  //     method: "POST",
  //     body: JSON.stringify({ event, props, ts: Date.now() }),
  //   }).catch(() => {});
}

export const track = {
  // Onboarding
  onboardingStarted: () => send("onboarding_started"),
  onboardingCompleted: (path: string) =>
    send("onboarding_completed", { path }),

  // Lessons
  lessonStarted: (lessonId: string, path: string) =>
    send("lesson_started", { lesson_id: lessonId, path }),
  lessonCompleted: (
    lessonId: string,
    path: string,
    timeSpentSec: number
  ) =>
    send("lesson_completed", {
      lesson_id: lessonId,
      path,
      time_spent_seconds: timeSpentSec,
    }),

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

  // Conversion
  upgradeViewed: () => send("upgrade_page_viewed"),
  purchaseCompleted: (amount: number) =>
    send("purchase_completed", { amount }),
};
