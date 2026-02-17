"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { ALL_LESSONS } from "@/data/lessons";

// ─── Inline SVG Icons ──────────────────────────────────────────────────────

function GearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 16l.75 2.25L8 19l-2.25.75L5 22l-.75-2.25L2 19l2.25-.75L5 16z" />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

// ─── Types ──────────────────────────────────────────────────────────────────

const TEMPLATE_LABELS: Record<string, string> = {
  space_shooter: "Space Shooter",
  platformer: "Platformer",
  simple_rpg: "Simple RPG",
  differential_drive_robot: "Differential Drive Robot",
};

const TEMPLATE_ICONS: Record<string, string> = {
  space_shooter: "\u{1F680}",
  platformer: "\u{1F3C3}",
  simple_rpg: "\u2694\uFE0F",
  differential_drive_robot: "\u{1F916}",
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("profile");

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tier, setTier] = useState<"free" | "pro">("free");
  const [template, setTemplate] = useState<string | null>(null);
  const [totalXp, setTotalXp] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("total_xp, tier, selected_game_template")
        .eq("id", user.id)
        .single();

      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("status")
        .eq("user_id", user.id);

      const completed = progress?.filter((p) => p.status === "completed").length || 0;

      setEmail(user.email || "");
      setDisplayName(user.email?.split("@")[0] || "User");
      setTier(profileData?.tier || "free");
      setTemplate(profileData?.selected_game_template || null);
      setTotalXp(profileData?.total_xp || 0);
      setCompletedCount(completed);
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  const handleSavePassword = async () => {
    setSaveError(null);
    setSaveSuccess(false);

    if (!newPassword) {
      setSaveError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setSaveError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setSaveError("Passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSaveSuccess(true);
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to update password";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, progressRes, streakRes, achievementRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("lesson_progress").select("*").eq("user_id", user.id),
      supabase.from("user_streaks").select("*").eq("user_id", user.id).single(),
      supabase.from("user_achievements").select("*").eq("user_id", user.id),
    ]);

    const exportData = {
      profile: profileRes.data,
      progress: progressRes.data,
      streak: streakRes.data,
      achievements: achievementRes.data,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `heapsight-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      return;
    }
    if (!confirm("This will permanently delete all your progress and data. Continue?")) {
      return;
    }
    alert("Account deletion is not yet available. Please contact support.");
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm font-mono text-[#555] animate-pulse">Loading settings...</p>
      </div>
    );
  }

  const isRobotPath = template === "differential_drive_robot";

  return (
    <>
      {/* Header */}
      <header className="border-b border-[#1a1a2e] px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="lg:hidden pl-12">
            <h1 className="text-xl font-semibold text-white">Settings</h1>
            <p className="text-xs text-[#666] font-mono mt-0.5">Manage your account</p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <GearIcon className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-semibold text-white">Settings</h1>
              <p className="text-xs text-[#666] font-mono mt-0.5">
                Profile, security, and account management
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ─── Main Content ──────────────────────────────────── */}
          <div className="flex-1 space-y-6 min-w-0">
            {/* Profile Section */}
            <section id="profile" className="p-5 rounded-xl border border-[#1a1a2e] bg-surface">
              <h2 className="text-sm font-semibold text-white mb-4">Profile</h2>

              {/* Avatar + Name */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-white truncate">{displayName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ZapIcon className="h-3.5 w-3.5 text-[#fbbf24]" />
                    <span className="text-xs font-mono font-bold text-[#fbbf24]">{totalXp.toLocaleString()} XP</span>
                    <span className="text-[#2a2a3e]">&middot;</span>
                    <span className="text-xs font-mono text-[#888]">{completedCount}/{ALL_LESSONS.length} lessons</span>
                  </div>
                </div>
                {tier === "pro" && (
                  <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30 shrink-0">
                    PRO
                  </span>
                )}
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-bold text-[#888] uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg px-4 py-3 text-sm font-mono text-[#666] cursor-not-allowed"
                />
                <p className="text-[9px] font-mono text-[#555]">
                  Email cannot be changed. Your display name is derived from your email.
                </p>
              </div>
            </section>

            {/* Learning Path */}
            <section id="path" className="p-5 rounded-xl border border-[#1a1a2e] bg-surface">
              <h2 className="text-sm font-semibold text-white mb-4">Learning Path</h2>
              {template ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{TEMPLATE_ICONS[template] || "?"}</span>
                    <div>
                      <p className="text-sm text-white font-semibold">
                        {TEMPLATE_LABELS[template] || template}
                      </p>
                      <p className="text-[10px] font-mono text-[#666]">
                        {isRobotPath ? "C++ Robotics Path" : "C++ Game Dev Path"}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/paths"
                    className="text-[10px] font-mono text-primary hover:text-primary/80 transition-colors"
                  >
                    Switch Path &rarr;
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-[#666] font-mono">No path selected</p>
              )}
            </section>

            {/* Security */}
            <section id="security" className="p-5 rounded-xl border border-[#1a1a2e] bg-surface">
              <h2 className="text-sm font-semibold text-white mb-4">Change Password</h2>

              <div className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-[#888] uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg px-4 py-3 text-sm font-mono text-white placeholder-[#555] focus:border-primary/50 focus:outline-none transition-colors pr-12"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors p-1"
                    >
                      {showNewPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-[#888] uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg px-4 py-3 text-sm font-mono text-white placeholder-[#555] focus:border-primary/50 focus:outline-none transition-colors pr-12"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors p-1"
                    >
                      {showConfirmPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Feedback */}
                {saveError && (
                  <p className="text-xs font-mono text-danger">{saveError}</p>
                )}
                {saveSuccess && (
                  <div className="flex items-center gap-2 text-xs font-mono text-primary">
                    <CheckCircleIcon className="h-4 w-4" />
                    Password updated successfully!
                  </div>
                )}

                {/* Save Button */}
                <button
                  onClick={handleSavePassword}
                  disabled={saving || (!newPassword && !confirmPassword)}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all min-h-[44px] touch-manipulation ${
                    saving || (!newPassword && !confirmPassword)
                      ? "bg-[#1a1a2e] text-[#555] cursor-not-allowed"
                      : "bg-primary text-black hover:bg-primary/90"
                  }`}
                >
                  <SaveIcon className="h-4 w-4" />
                  {saving ? "Saving..." : "Update Password"}
                </button>
              </div>
            </section>

            {/* Danger Zone */}
            <section id="danger" className="p-5 rounded-xl border border-danger/20 bg-surface">
              <h2 className="text-sm font-semibold text-danger mb-4">Danger Zone</h2>

              <div className="space-y-3">
                <button
                  onClick={handleExportData}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#0a0a0f] hover:bg-[#111118] border border-[#2a2a3e] rounded-lg text-sm font-mono text-[#ccc] transition-colors min-h-[44px] touch-manipulation"
                >
                  <span>Export My Data</span>
                  <DownloadIcon className="h-4 w-4 text-[#888]" />
                </button>

                <button
                  onClick={handleDeleteAccount}
                  className="w-full flex items-center justify-between px-4 py-3 bg-danger/5 hover:bg-danger/10 border border-danger/20 rounded-lg text-sm font-mono text-danger transition-colors min-h-[44px] touch-manipulation"
                >
                  <span>Delete My Account</span>
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </section>
          </div>

          {/* ─── Right Sidebar ─────────────────────────────────── */}
          <div className="lg:w-64 shrink-0 space-y-4">
            {/* Quick Nav */}
            <div className="p-4 rounded-xl border border-[#1a1a2e] bg-surface">
              <h3 className="text-[10px] font-mono font-bold text-[#888] uppercase tracking-wider mb-3">
                Settings
              </h3>
              <div className="space-y-0.5">
                {[
                  { id: "profile", label: "Profile" },
                  { id: "path", label: "Learning Path" },
                  { id: "security", label: "Security" },
                  { id: "danger", label: "Data & Privacy" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
                      activeSection === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-[#888] hover:text-white hover:bg-[#111118]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subscription Card */}
            <div className="p-4 rounded-xl border border-[#1a1a2e] bg-surface">
              <h3 className="text-[10px] font-mono font-bold text-[#888] uppercase tracking-wider mb-3">
                Subscription
              </h3>
              {tier === "pro" ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2a1a3e] text-[#a855f7] border border-[#a855f7]/20 font-bold">
                      PRO
                    </span>
                    <span className="text-[10px] font-mono text-[#888]">Active</span>
                  </div>
                  <p className="text-[9px] font-mono text-[#555]">
                    Lifetime access &middot; All lessons unlocked
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1a1a2e] text-[#888] border border-[#2a2a3e] font-bold">
                      FREE
                    </span>
                  </div>
                  <Link
                    href="/upgrade"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-[#a855f7] to-[#6366f1] hover:from-[#9333ea] hover:to-[#4f46e5] text-white font-semibold text-xs rounded-lg transition-all min-h-[40px] touch-manipulation"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    Upgrade to Pro
                  </Link>
                  <p className="text-[9px] font-mono text-[#555] text-center">
                    $67 one-time &middot; Lifetime access
                  </p>
                </div>
              )}
            </div>

            {/* Help */}
            <div className="p-4 rounded-xl border border-[#1a1a2e] bg-surface">
              <h3 className="text-[10px] font-mono font-bold text-[#888] uppercase tracking-wider mb-3">
                Support
              </h3>
              <a
                href="mailto:support@heapsight.com"
                className="block text-xs font-mono text-[#888] hover:text-white transition-colors"
              >
                support@heapsight.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
