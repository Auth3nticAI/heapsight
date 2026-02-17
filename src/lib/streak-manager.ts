import { createClient } from "@/lib/supabase-browser";

export interface StreakResult {
  current_streak: number;
  longest_streak: number;
  is_new_milestone: boolean;
  milestone: number | null;
}

const STREAK_MILESTONES = [7, 14, 30, 60, 100, 365];

/**
 * Call the database function to update the user's streak after lesson completion.
 * Returns the updated streak data + milestone info.
 */
export async function updateStreakOnCompletion(
  userId: string
): Promise<StreakResult | null> {
  const supabase = createClient();

  // Call the PL/pgSQL function that handles consecutive-day logic
  const { error } = await supabase.rpc("update_user_streak", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Streak update failed:", error);
    return null;
  }

  // Fetch the updated streak
  const { data } = await supabase
    .from("user_streaks")
    .select("current_streak, longest_streak")
    .eq("user_id", userId)
    .single();

  if (!data) return null;

  const milestone =
    STREAK_MILESTONES.find((m) => data.current_streak === m) || null;

  return {
    current_streak: data.current_streak,
    longest_streak: data.longest_streak,
    is_new_milestone: milestone !== null,
    milestone,
  };
}

/**
 * Return a motivational string based on the current streak count.
 */
export function getStreakMotivation(streak: number): string {
  if (streak === 0) return "Start your streak today!";
  if (streak === 1) return "Great start! Come back tomorrow.";
  if (streak < 7) return `${streak} days! Keep going!`;
  if (streak < 30) return `${streak}-day streak! You're on fire!`;
  if (streak < 100) return `${streak} days! Unstoppable!`;
  return `${streak}-day legend!`;
}
