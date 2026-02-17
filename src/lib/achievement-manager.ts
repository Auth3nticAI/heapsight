/**
 * Achievement Manager — client-side
 * Checks unlock criteria against user stats and awards new badges.
 */

import { createClient } from "@/lib/supabase-browser";
import { ACHIEVEMENTS, type Achievement } from "./achievements";

export async function checkAndUnlockAchievements(
  userId: string
): Promise<Achievement[]> {
  const supabase = createClient();

  // Gather stats in parallel
  const [profileRes, progressRes, streakRes, dailyRes, unlockedRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("total_xp")
        .eq("id", userId)
        .single(),
      supabase
        .from("lesson_progress")
        .select("lesson_id, path")
        .eq("user_id", userId)
        .eq("status", "completed"),
      supabase
        .from("user_streaks")
        .select("current_streak")
        .eq("user_id", userId)
        .single(),
      supabase
        .from("daily_activity")
        .select("activity_date")
        .eq("user_id", userId)
        .gte("lessons_completed", 1),
      supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", userId),
    ]);

  const totalXP = profileRes.data?.total_xp || 0;
  const currentStreak = streakRes.data?.current_streak || 0;
  const dailyGoalsCompleted = dailyRes.data?.length || 0;
  const unlockedIds = new Set(
    unlockedRes.data?.map((a) => a.achievement_id) || []
  );

  // Group completed lessons by path
  const lessonsByPath: Record<string, number> = {};
  let totalLessons = 0;
  progressRes.data?.forEach((p) => {
    totalLessons++;
    const path = p.path || "";
    lessonsByPath[path] = (lessonsByPath[path] || 0) + 1;
  });
  const pathsCompleted = Object.values(lessonsByPath).filter(
    (c) => c >= 25
  ).length;

  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) continue;

    let unlocked = false;
    const { type, threshold, path } = achievement.unlock_criteria;

    switch (type) {
      case "lessons_completed":
        unlocked = totalLessons >= threshold;
        break;
      case "streak_days":
        unlocked = currentStreak >= threshold;
        break;
      case "total_xp":
        unlocked = totalXP >= threshold;
        break;
      case "path_completed":
        if (path) {
          unlocked = (lessonsByPath[path] || 0) >= 25;
        } else {
          unlocked = pathsCompleted >= threshold;
        }
        break;
      case "daily_goals":
        unlocked = dailyGoalsCompleted >= threshold;
        break;
    }

    if (unlocked) {
      // Idempotent unlock + XP award via server-side RPC
      const { data: awardResult, error: awardError } = await supabase.rpc(
        "award_achievement_xp",
        { p_achievement_id: achievement.id, p_xp_amount: achievement.xp_reward }
      );

      if (awardError) {
        // Fallback: insert with onConflict guard, then award XP separately
        const { error: insertError } = await supabase
          .from("user_achievements")
          .insert({ user_id: userId, achievement_id: achievement.id })
          .select();

        // Only award XP if insert succeeded (not a duplicate)
        if (!insertError) {
          await supabase.rpc("increment_xp", { xp_amount: achievement.xp_reward });
          newlyUnlocked.push(achievement);
        }
        continue;
      }

      const isNew = awardResult?.[0]?.is_new_unlock ?? false;
      if (isNew) {
        newlyUnlocked.push(achievement);
      }
    }
  }

  return newlyUnlocked;
}

export async function getUserAchievementIds(
  userId: string
): Promise<Set<string>> {
  const supabase = createClient();
  const { data } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  return new Set(data?.map((a) => a.achievement_id) || []);
}
