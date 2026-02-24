import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface ShareData {
  displayName: string;
  totalXp: number;
  template: string | null;
  completedLessons: number;
  currentStreak: number;
  longestStreak: number;
}

const TEMPLATE_NAMES: Record<string, string> = {
  space_shooter: "Space Shooter",
  platformer: "Platformer",
  simple_rpg: "RPG",
  dungeon_crawler: "Dungeon Crawler",
};

const TEMPLATE_ICONS: Record<string, string> = {
  space_shooter: "\uD83D\uDE80",
  platformer: "\uD83C\uDFC3",
  simple_rpg: "\u2694\uFE0F",
  dungeon_crawler: "\uD83C\uDFF0",
};

async function getShareData(userId: string): Promise<ShareData | null> {
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

  if (!profileRes.data) return null;

  return {
    displayName: (profileRes.data.email || "").split("@")[0] || "User",
    totalXp: profileRes.data.total_xp || 0,
    template: profileRes.data.selected_game_template || null,
    completedLessons:
      progressRes.data?.filter((p) => p.status === "completed").length || 0,
    currentStreak: streakRes.data?.current_streak || 0,
    longestStreak: streakRes.data?.longest_streak || 0,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  const data = await getShareData(userId);

  if (!data) {
    return { title: "Progress | HeapSight" };
  }

  const pathName = data.template
    ? TEMPLATE_NAMES[data.template] || data.template
    : "C++";
  const description = `${data.displayName} has completed ${data.completedLessons} lessons and earned ${data.totalXp.toLocaleString()} XP on the ${pathName} path!`;

  return {
    title: `${data.displayName}'s C++ Progress on HeapSight`,
    description,
    openGraph: {
      title: `${data.displayName}'s C++ Progress on HeapSight`,
      description,
      siteName: "HeapSight",
    },
    twitter: {
      card: "summary",
      title: `${data.displayName}'s C++ Progress on HeapSight`,
      description,
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const data = await getShareData(userId);

  if (!data) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-sm font-mono text-[#AFBCD5]/50 mb-4">
            User not found.
          </p>
          <Link href="/" className="text-primary text-sm hover:underline">
            Go to HeapSight
          </Link>
        </div>
      </main>
    );
  }

  const pathName = data.template
    ? TEMPLATE_NAMES[data.template] || data.template
    : "C++";
  const pathIcon = data.template
    ? TEMPLATE_ICONS[data.template] || "\uD83C\uDFAE"
    : "\uD83C\uDFAE";

  const shareUrl = `https://heapsight.com/share/${userId}`;
  const twitterText = encodeURIComponent(
    `I've completed ${data.completedLessons} C++ lessons on @HeapSight! \uD83C\uDFAE\n${shareUrl}`
  );
  const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#071528] p-8 text-center">
          {/* Avatar placeholder */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#246BFD] to-[#0040C3] flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
            {data.displayName.charAt(0).toUpperCase()}
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">
            {data.displayName}
          </h1>
          <p className="text-sm text-[#AFBCD5]/70 font-mono mb-6">
            {pathIcon}{" "}
            <span className="text-primary">{pathName}</span> path on HeapSight
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              {
                label: "XP Earned",
                value: data.totalXp.toLocaleString(),
                icon: "\u26A1",
              },
              {
                label: "Lessons",
                value: data.completedLessons.toString(),
                icon: "\u2713",
              },
              {
                label: "Streak",
                value: `${data.currentStreak}d`,
                icon: "\uD83D\uDD25",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]"
              >
                <div className="text-xl mb-1">{stat.icon}</div>
                <p className="text-lg font-bold text-white font-mono">
                  {stat.value}
                </p>
                <p className="text-[9px] font-mono text-[#AFBCD5]/60 uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Share buttons */}
          <div className="flex gap-3 mb-6">
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-3 bg-[#1d9bf0]/10 border border-[#1d9bf0]/30 text-[#1d9bf0] text-xs font-semibold rounded-lg hover:bg-[#1d9bf0]/20 transition-colors text-center"
            >
              Share on X
            </a>
            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-3 bg-[#0077b5]/10 border border-[#0077b5]/30 text-[#0077b5] text-xs font-semibold rounded-lg hover:bg-[#0077b5]/20 transition-colors text-center"
            >
              Share on LinkedIn
            </a>
          </div>

          <Link
            href="/signup"
            className="block w-full py-3 bg-gradient-to-r from-[#246BFD] to-[#0040C3] text-white font-bold rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            Start Learning C++ for Free &rarr;
          </Link>
        </div>

        <p className="text-center mt-4 text-[10px] font-mono text-[#AFBCD5]/40">
          Powered by{" "}
          <Link href="/" className="text-primary hover:underline">
            HeapSight
          </Link>{" "}
          &mdash; Learn C++ by building real games
        </p>
      </div>
    </main>
  );
}
