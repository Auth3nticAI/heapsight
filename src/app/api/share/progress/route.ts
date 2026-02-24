import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const supabase = getServiceClient();

  const [profileRes, streakRes, progressRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("total_xp, selected_game_template, email")
      .eq("id", userId)
      .single(),
    supabase
      .from("user_streaks")
      .select("current_streak, longest_streak")
      .eq("user_id", userId)
      .single(),
    supabase
      .from("lesson_progress")
      .select("status")
      .eq("user_id", userId),
  ]);

  if (!profileRes.data) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const completedLessons =
    progressRes.data?.filter((p) => p.status === "completed").length || 0;
  // Only expose the email prefix (before @) as the display name
  const displayName =
    (profileRes.data.email || "").split("@")[0] || "User";

  return NextResponse.json({
    displayName,
    totalXp: profileRes.data.total_xp || 0,
    template: profileRes.data.selected_game_template || null,
    completedLessons,
    currentStreak: streakRes.data?.current_streak || 0,
    longestStreak: streakRes.data?.longest_streak || 0,
  });
}
