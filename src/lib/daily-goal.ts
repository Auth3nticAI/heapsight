import { createClient } from "@/lib/supabase-browser";

export interface DailyActivityResult {
  lessonsToday: number;
  xpToday: number;
  goalJustCompleted: boolean; // true if this call pushed lessons from 0 → 1
}

/**
 * Increment the daily activity counters after a lesson is completed.
 * Uses an atomic RPC to avoid race conditions from concurrent completions.
 * Returns whether the daily goal (1 lesson) was just achieved.
 */
export async function recordLessonCompletion(
  userId: string,
  xpEarned: number
): Promise<DailyActivityResult> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("record_lesson_completion", {
    p_user_id: userId,
    p_xp: xpEarned,
  });

  if (error || !data || data.length === 0) {
    // Fallback: return safe defaults so the UI doesn't break
    console.error("record_lesson_completion RPC failed:", error);
    return { lessonsToday: 1, xpToday: xpEarned, goalJustCompleted: true };
  }

  const row = data[0] as { lessons_today: number; xp_today: number };

  return {
    lessonsToday: row.lessons_today,
    xpToday: row.xp_today,
    goalJustCompleted: row.lessons_today === 1,
  };
}
