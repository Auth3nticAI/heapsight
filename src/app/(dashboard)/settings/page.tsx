"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { ALL_RPG_LESSONS } from "@/data/lessons/rpg-index";
import { ALL_PLATFORMER_LESSONS } from "@/data/lessons/platformer-index";
import { ALL_CRAWLER_LESSONS } from "@/data/lessons/crawler-index";
import { ALL_SHOOTER_LESSONS } from "@/data/lessons/shooter-index";

// ─── Inline SVG Icons ──────────────────────────────────────────────────────


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
  dungeon_crawler: "Dungeon Crawler",
};

const TEMPLATE_ICONS: Record<string, string> = {
  space_shooter: "\u{1F680}",
  platformer: "\u{1F3C3}",
  simple_rpg: "\u2694\uFE0F",
  dungeon_crawler: "\u{1F3F0}",
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
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [proTrialUntil, setProTrialUntil] = useState<string | null>(null);
  const [referralCopied, setReferralCopied] = useState(false);
  const [shareUserId, setShareUserId] = useState<string | null>(null);
  const [shareProgressCopied, setShareProgressCopied] = useState(false);

  // Manage / Cancel modal
  const [showManageModal, setShowManageModal] = useState(false);
  const [cancelStep, setCancelStep] = useState<"manage" | "questionnaire" | "confirmed">("manage");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelFeedback, setCancelFeedback] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelEndsAt, setCancelEndsAt] = useState<string | null>(null);

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
        .select("total_xp, tier, selected_game_template, referral_code, pro_trial_until")
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
      setProTrialUntil(profileData?.pro_trial_until || null);
      setShareUserId(user.id);

      // Load or generate referral code
      if (profileData?.referral_code) {
        setReferralCode(profileData.referral_code);
      } else {
        const res = await fetch("/api/referral/generate-code", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setReferralCode(data.code || null);
        }
      }

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

  const handleCopyReferral = () => {
    if (!referralCode) return;
    const link = `https://heapsight.com/ref/${referralCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2000);
    });
  };

  const handleCopyShareProgress = () => {
    if (!shareUserId) return;
    const link = `https://heapsight.com/share/${shareUserId}`;
    navigator.clipboard.writeText(link).then(() => {
      setShareProgressCopied(true);
      setTimeout(() => setShareProgressCopied(false), 2000);
    });
  };

  const closeModal = () => {
    setShowManageModal(false);
    setCancelStep("manage");
    setCancelReason("");
    setCancelFeedback("");
    setCancelError(null);
    setCancelLoading(false);
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    setCancelError(null);
    try {
      const res = await fetch("/api/polar/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason, feedback: cancelFeedback }),
      });
      const data = await res.json();
      if (data.success) {
        setCancelEndsAt(data.endsAt ?? null);
        setCancelStep("confirmed");
      } else {
        setCancelError(data.detail ? `${data.error}: ${data.detail}` : (data.error || "Cancellation failed"));
      }
    } catch (err) {
      setCancelError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setCancelLoading(false);
    }
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm font-mono text-[#AFBCD5]/50 animate-pulse">Loading settings...</p>
      </div>
    );
  }

  const trialActive = proTrialUntil ? new Date(proTrialUntil) > new Date() : false;
  const effectiveTier = tier === "pro" || trialActive ? "pro" : "free";
  const isCrawlerPath = template === "dungeon_crawler";
  const pathLessonCount =
    template === "simple_rpg" ? ALL_RPG_LESSONS.length :
    template === "platformer" ? ALL_PLATFORMER_LESSONS.length :
    template === "dungeon_crawler" ? ALL_CRAWLER_LESSONS.length :
    ALL_SHOOTER_LESSONS.length;

  return (
    <>
      {/* Header */}
      <header className="border-b border-white/[0.05] px-4 sm:px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <div className="md:pl-12 lg:pl-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-xs text-[#AFBCD5]/50 font-mono mt-1 hidden lg:block">
              Profile, security, and account management
            </p>
            <p className="text-xs text-[#AFBCD5]/50 font-mono mt-1 lg:hidden">Manage your account</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ─── Main Content ──────────────────────────────────── */}
          <div className="flex-1 space-y-6 min-w-0">
            {/* Profile Section */}
            <section id="profile" className="p-5 rounded-2xl border border-white/[0.08] bg-[#071528]">
              <h2 className="text-sm font-semibold text-white mb-4">Profile</h2>

              {/* Avatar + Name */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#246BFD] to-[#0040C3] flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-white truncate">{displayName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ZapIcon className="h-3.5 w-3.5 text-[#fbbf24]" />
                    <span className="text-xs font-mono font-bold text-[#fbbf24]">{totalXp.toLocaleString()} XP</span>
                    <span className="text-[#AFBCD5]/30">&middot;</span>
                    <span className="text-xs font-mono text-[#AFBCD5]/70">{completedCount}/{pathLessonCount} lessons</span>
                  </div>
                </div>
                {effectiveTier === "pro" && (
                  <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30 shrink-0">
                    {trialActive && tier !== "pro" ? "TRIAL" : "PRO"}
                  </span>
                )}
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-bold text-[#AFBCD5]/70 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-[#071528] border border-white/[0.08] rounded-xl px-4 py-3 text-base sm:text-sm font-mono text-[#AFBCD5]/60 cursor-not-allowed"
                />
                <p className="text-[9px] font-mono text-[#AFBCD5]/50">
                  Email cannot be changed. Your display name is derived from your email.
                </p>
              </div>
            </section>

            {/* Learning Path */}
            <section id="path" className="p-5 rounded-2xl border border-white/[0.08] bg-[#071528]">
              <h2 className="text-sm font-semibold text-white mb-4">Learning Path</h2>
              {template ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{TEMPLATE_ICONS[template] || "?"}</span>
                    <div>
                      <p className="text-sm text-white font-semibold">
                        {TEMPLATE_LABELS[template] || template}
                      </p>
                      <p className="text-[10px] font-mono text-[#AFBCD5]/50">
                        {isCrawlerPath ? "C++ Dungeon Crawler Path" : "C++ Game Dev Path"}
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
                <p className="text-xs text-[#AFBCD5]/50 font-mono">No path selected</p>
              )}
            </section>

            {/* Refer a Friend */}
            <section id="referral" className="p-5 rounded-2xl border border-white/[0.08] bg-[#071528]">
              <h2 className="text-sm font-semibold text-white mb-1">Invite Friends, Get Pro Free</h2>
              <p className="text-[10px] font-mono text-[#AFBCD5]/50 mb-4">
                Share your link. When a friend signs up, you both get 7 days of Pro access.
              </p>

              {trialActive && tier !== "pro" && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2.5 bg-[#a855f7]/10 border border-[#a855f7]/20 rounded-lg">
                  <svg className="h-4 w-4 text-[#a855f7] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                  </svg>
                  <p className="text-[10px] font-mono text-[#a855f7]">
                    Pro trial active &middot; Expires {new Date(proTrialUntil!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              )}

              {referralCode ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={`heapsight.com/ref/${referralCode}`}
                      className="flex-1 px-3 py-2.5 bg-[#040B10] border border-white/[0.08] rounded-xl text-sm font-mono text-[#AFBCD5]/80 focus:outline-none min-w-0"
                    />
                    <button
                      onClick={handleCopyReferral}
                      className={`px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all min-w-[64px] ${
                        referralCopied
                          ? "bg-[#9CD323]/20 border border-[#9CD323]/30 text-[#9CD323]"
                          : "bg-[#246BFD] hover:bg-[#0040C3] text-white"
                      }`}
                    >
                      {referralCopied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-[9px] font-mono text-[#AFBCD5]/40">
                    Your code: <span className="text-[#AFBCD5]/60">{referralCode}</span>
                  </p>
                </div>
              ) : (
                <p className="text-[10px] font-mono text-[#AFBCD5]/40 animate-pulse">
                  Generating your referral link...
                </p>
              )}
            </section>

            {/* Share Progress */}
            <section id="share" className="p-5 rounded-2xl border border-white/[0.08] bg-[#071528]">
              <h2 className="text-sm font-semibold text-white mb-1">Share Your Progress</h2>
              <p className="text-[10px] font-mono text-[#AFBCD5]/50 mb-4">
                Share a public link showing your XP, lessons completed, and streak. No login required to view.
              </p>
              {shareUserId ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={`https://heapsight.com/share/${shareUserId}`}
                      className="flex-1 px-3 py-2.5 bg-[#040B10] border border-white/[0.08] rounded-xl text-sm font-mono text-[#AFBCD5]/80 focus:outline-none min-w-0"
                    />
                    <button
                      onClick={handleCopyShareProgress}
                      className={`px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all min-w-[64px] ${
                        shareProgressCopied
                          ? "bg-[#9CD323]/20 border border-[#9CD323]/30 text-[#9CD323]"
                          : "bg-[#246BFD] hover:bg-[#0040C3] text-white"
                      }`}
                    >
                      {shareProgressCopied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`https://heapsight.com/share/${shareUserId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono text-primary hover:underline"
                    >
                      Preview your share page &rarr;
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] font-mono text-[#AFBCD5]/40 animate-pulse">Loading...</p>
              )}
            </section>

            {/* Security */}
            <section id="security" className="p-5 rounded-2xl border border-white/[0.08] bg-[#071528]">
              <h2 className="text-sm font-semibold text-white mb-4">Change Password</h2>

              <div className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-[#AFBCD5]/70 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#071528] border border-white/[0.08] rounded-xl px-4 py-3 text-base sm:text-sm font-mono text-white placeholder-[#AFBCD5]/30 focus:border-[#246BFD]/40 focus:outline-none transition-colors pr-12"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AFBCD5]/50 hover:text-white transition-colors p-1"
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
                  <label className="block text-[10px] font-mono font-bold text-[#AFBCD5]/70 uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#071528] border border-white/[0.08] rounded-xl px-4 py-3 text-base sm:text-sm font-mono text-white placeholder-[#AFBCD5]/30 focus:border-[#246BFD]/40 focus:outline-none transition-colors pr-12"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AFBCD5]/50 hover:text-white transition-colors p-1"
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
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all min-h-[44px] touch-manipulation ${
                    saving || (!newPassword && !confirmPassword)
                      ? "bg-white/[0.05] text-[#AFBCD5]/60 cursor-not-allowed"
                      : "bg-[#246BFD] hover:bg-[#0040C3] text-white"
                  }`}
                >
                  <SaveIcon className="h-4 w-4" />
                  {saving ? "Saving..." : "Update Password"}
                </button>
              </div>
            </section>

            {/* Danger Zone */}
            <section id="danger" className="p-5 rounded-2xl border border-red-600/20 bg-[#071528]">
              <h2 className="text-sm font-semibold text-danger mb-4">Danger Zone</h2>

              <div className="space-y-3">
                <button
                  onClick={handleExportData}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.05] hover:bg-white/[0.08] border border-[#ffffff15] rounded-xl text-sm font-mono text-[#AFBCD5] transition-colors min-h-[44px] touch-manipulation"
                >
                  <span>Export My Data</span>
                  <DownloadIcon className="h-4 w-4 text-[#AFBCD5]/70" />
                </button>

                <button
                  onClick={handleDeleteAccount}
                  className="w-full flex items-center justify-between px-4 py-3 bg-red-600/10 hover:bg-red-600/15 border border-red-600/20 rounded-xl text-sm font-mono text-red-400 transition-colors min-h-[44px] touch-manipulation"
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
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#071528]">
              <h3 className="text-[10px] font-mono font-bold text-[#AFBCD5]/70 uppercase tracking-wider mb-3">
                Settings
              </h3>
              <div className="space-y-0.5">
                {[
                  { id: "profile", label: "Profile" },
                  { id: "path", label: "Learning Path" },
                  { id: "referral", label: "Refer a Friend" },
                  { id: "share", label: "Share Progress" },
                  { id: "security", label: "Security" },
                  { id: "danger", label: "Data & Privacy" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-mono transition-colors min-h-[44px] ${
                      activeSection === item.id
                        ? "bg-[#246BFD]/15 text-[#246BFD]"
                        : "text-[#AFBCD5]/60 hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subscription Card */}
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#071528]">
              <h3 className="text-[10px] font-mono font-bold text-[#AFBCD5]/70 uppercase tracking-wider mb-3">
                Subscription
              </h3>
              {effectiveTier === "pro" ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#246BFD]/10 text-[#a855f7] border border-[#a855f7]/20 font-bold">
                      {trialActive && tier !== "pro" ? "TRIAL" : "PRO"}
                    </span>
                    <span className="text-[10px] font-mono text-[#AFBCD5]/70">Active</span>
                  </div>
                  <p className="text-[9px] font-mono text-[#AFBCD5]/50">
                    {trialActive && tier !== "pro"
                      ? `Referral trial · expires ${new Date(proTrialUntil!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                      : "Pro subscription · All lessons unlocked"}
                  </p>
                  {cancelEndsAt ? (
                    <p className="text-[9px] font-mono text-orange-400/80 leading-relaxed">
                      Canceling &middot; Pro access until{" "}
                      {new Date(cancelEndsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  ) : tier === "pro" ? (
                    <button
                      onClick={() => { setCancelStep("manage"); setShowManageModal(true); }}
                      className="w-full mt-1 py-2 border border-white/[0.16] rounded-xl text-xs font-mono text-[#AFBCD5]/70 hover:bg-white/[0.05] hover:text-white transition-colors min-h-[36px]"
                    >
                      Manage Subscription &rarr;
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#071528] text-[#AFBCD5]/70 border border-white/[0.08] font-bold">
                      FREE
                    </span>
                  </div>
                  <Link
                    href="/upgrade"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-[#246BFD] to-[#0040C3] hover:from-[#246BFD]/90 hover:to-[#0040C3]/90 text-white font-semibold text-xs rounded-xl transition-all min-h-[40px] touch-manipulation"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    Upgrade to Pro
                  </Link>
                  <p className="text-[9px] font-mono text-[#AFBCD5]/50 text-center">
                    $67 one-time &middot; Lifetime access
                  </p>
                </div>
              )}
            </div>

            {/* Help */}
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#071528]">
              <h3 className="text-[10px] font-mono font-bold text-[#AFBCD5]/70 uppercase tracking-wider mb-3">
                Support
              </h3>
              <a
                href="mailto:support@heapsight.com"
                className="block text-xs font-mono text-[#AFBCD5]/70 hover:text-white transition-colors"
              >
                support@heapsight.com
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* ─── Manage / Cancel Subscription Modal ──────────────── */}
      {showManageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-[#071528] border border-white/[0.16] rounded-xl w-full max-w-md">

            {/* ── Step 1: Manage ── */}
            {cancelStep === "manage" && (
              <>
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.08]">
                  <h2 className="text-sm font-semibold text-white">Manage Subscription</h2>
                  <button
                    onClick={closeModal}
                    className="text-[#AFBCD5]/50 hover:text-white transition-colors text-xl leading-none w-8 h-8 flex items-center justify-center"
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-[#040B10] rounded-xl border border-white/[0.05]">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#246BFD]/10 text-[#a855f7] border border-[#a855f7]/20 font-bold shrink-0">
                      PRO
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium">Pro Subscription</p>
                      <p className="text-[10px] font-mono text-[#AFBCD5]/50">All lessons unlocked &middot; Active</p>
                    </div>
                  </div>
                  <p className="text-[11px] font-mono text-[#AFBCD5]/60 leading-relaxed">
                    You can cancel your subscription at any time. You&rsquo;ll keep Pro access
                    until the end of your current billing period.
                  </p>
                  <button
                    onClick={() => setCancelStep("questionnaire")}
                    className="w-full py-2.5 text-sm font-mono text-red-400 border border-red-600/30 hover:bg-red-600/10 rounded-xl transition-colors min-h-[40px]"
                  >
                    Cancel Subscription
                  </button>
                </div>
              </>
            )}

            {/* ── Step 2: Questionnaire ── */}
            {cancelStep === "questionnaire" && (
              <>
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.08]">
                  <h2 className="text-sm font-semibold text-white">Before you go&hellip;</h2>
                  <button
                    onClick={closeModal}
                    className="text-[#AFBCD5]/50 hover:text-white transition-colors text-xl leading-none w-8 h-8 flex items-center justify-center"
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-xs font-mono text-[#AFBCD5]/70">
                    Mind telling us why you&rsquo;re canceling?
                  </p>
                  <div className="space-y-1">
                    {[
                      { value: "too_expensive", label: "Too expensive" },
                      { value: "not_enough_content", label: "Not enough content" },
                      { value: "better_alternative", label: "Found a better alternative" },
                      { value: "completed", label: "Completed what I needed" },
                      { value: "technical_issues", label: "Technical issues" },
                      { value: "other", label: "Other" },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name="cancel-reason"
                          value={opt.value}
                          checked={cancelReason === opt.value}
                          onChange={(e) => setCancelReason(e.target.value)}
                          className="w-4 h-4 accent-[#246BFD] shrink-0"
                        />
                        <span className="text-xs font-mono text-[#AFBCD5]/80 group-hover:text-white transition-colors">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-[#AFBCD5]/50 uppercase tracking-wider mb-2">
                      Anything else? (optional)
                    </label>
                    <textarea
                      value={cancelFeedback}
                      onChange={(e) => setCancelFeedback(e.target.value)}
                      rows={3}
                      placeholder="Your feedback helps us improve..."
                      className="w-full bg-[#040B10] border border-white/[0.08] rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-[#AFBCD5]/30 focus:border-[#246BFD]/40 focus:outline-none transition-colors resize-none"
                    />
                  </div>
                  {cancelError && (
                    <p className="text-[10px] font-mono text-red-400/90 leading-relaxed">{cancelError}</p>
                  )}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={closeModal}
                      disabled={cancelLoading}
                      className="flex-1 py-2.5 border border-white/[0.16] rounded-xl text-xs font-mono text-[#AFBCD5]/70 hover:bg-white/[0.05] hover:text-white transition-colors min-h-[40px] disabled:opacity-50"
                    >
                      Keep My Subscription
                    </button>
                    <button
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-semibold transition-colors min-h-[40px] disabled:opacity-60"
                    >
                      {cancelLoading ? "Canceling..." : "Cancel Subscription"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── Step 3: Confirmed ── */}
            {cancelStep === "confirmed" && (
              <>
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.08]">
                  <h2 className="text-sm font-semibold text-white">Subscription Canceled</h2>
                  <button
                    onClick={closeModal}
                    className="text-[#AFBCD5]/50 hover:text-white transition-colors text-xl leading-none w-8 h-8 flex items-center justify-center"
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>
                <div className="p-6 space-y-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <CheckCircleIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-white">You&rsquo;re all set</p>
                    <p className="text-xs font-mono text-[#AFBCD5]/60 leading-relaxed">
                      Your subscription has been canceled. You&rsquo;ll keep Pro access until{" "}
                      <span className="text-white font-semibold">
                        {cancelEndsAt
                          ? new Date(cancelEndsAt).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "the end of your billing period"}
                      </span>
                      .
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-full py-2.5 border border-white/[0.16] rounded-xl text-xs font-mono text-[#AFBCD5]/70 hover:bg-white/[0.05] hover:text-white transition-colors min-h-[40px]"
                  >
                    Close
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
}
