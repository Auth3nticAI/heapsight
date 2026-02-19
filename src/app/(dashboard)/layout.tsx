"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import Sidebar from "@/components/layout/Sidebar";
import DashboardBottomNav from "@/components/mobile/DashboardBottomNav";

interface UserData {
  email: string;
  totalXp: number;
  tier: "free" | "pro";
  streakCount: number;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("total_xp, tier, selected_game_template")
        .eq("id", authUser.id)
        .single();

      if (!profile?.selected_game_template) {
        router.push("/onboarding");
        return;
      }

      const { data: streakData } = await supabase
        .from("user_streaks")
        .select("current_streak")
        .eq("user_id", authUser.id)
        .single();

      setUser({
        email: authUser.email || "",
        totalXp: profile.total_xp ?? 0,
        tier: profile.tier || "free",
        streakCount: streakData?.current_streak || 0,
      });
      setLoading(false);
    }

    loadUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm font-mono text-[#555] animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        userEmail={user.email}
        totalXp={user.totalXp}
        userTier={user.tier}
        streakCount={user.streakCount}
      />

      <div className="flex-1 lg:ml-64 pb-20 lg:pb-0 overflow-x-hidden">
        {children}
      </div>

      <DashboardBottomNav />
    </div>
  );
}
