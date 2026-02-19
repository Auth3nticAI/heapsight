"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { getLevelInfo } from "@/lib/lesson-metadata";

// ─── Inline SVG icons ────────────────────────────────────────────────────────

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 3h14v2h-1v2a6 6 0 01-4 5.66V15h2a3 3 0 013 3v1H5v-1a3 3 0 013-3h2v-2.34A6 6 0 016 7V5H5V3zm3 2v2a4 4 0 008 0V5H8z" />
    </svg>
  );
}

function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20V10M18 20V4M6 20v-4" />
    </svg>
  );
}

function ShuffleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 23c-4.97 0-8-3.03-8-7.5 0-3.5 2-6.5 4-8.5.33-.33.83-.15.93.28.3 1.3.87 2.42 1.57 3.22C11.1 7.5 12 4 12 2c0-.55.45-.73.8-.4C15.8 4.2 20 8.5 20 15.5c0 4.47-3.03 7.5-8 7.5z" />
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

// ─── Types ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  userEmail: string;
  totalXp: number;
  userTier: "free" | "pro";
  streakCount: number;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Learn", path: "/learn", icon: HomeIcon },
  { name: "Leaderboard", path: "/leaderboard", icon: TrophyIcon },
  { name: "Paths", path: "/paths", icon: ShuffleIcon },
  { name: "Progress", path: "/progress", icon: BarChartIcon },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function Sidebar({ userEmail, totalXp, userTier, streakCount }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const levelInfo = getLevelInfo(totalXp);
  const displayName = userEmail.split("@")[0] || "User";

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  const handleNavClick = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const SidebarContent = () => (
    <>
      {/* Logo + User Section */}
      <div className="p-5 border-b border-[#1a1a2e]">
        <Link href="/learn" className="block mb-5" onClick={() => setIsOpen(false)}>
          <h1 className="text-xl font-bold text-primary">HeapSight</h1>
          <p className="text-[10px] text-[#555] font-mono mt-0.5">Master C++ Systems</p>
        </Link>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center text-white font-bold text-base shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1">
                <ZapIcon className="h-3 w-3 text-[#fbbf24]" />
                <span className="text-[10px] font-mono font-bold text-[#fbbf24]">{totalXp}</span>
              </div>
              {streakCount > 0 && (
                <>
                  <span className="text-[#2a2a3e]">&middot;</span>
                  <div className="flex items-center gap-1">
                    <FlameIcon className="h-3 w-3 text-[#f97316]" />
                    <span className="text-[10px] font-mono font-bold text-[#f97316]">{streakCount}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          {userTier === "pro" && (
            <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30 shrink-0">
              PRO
            </span>
          )}
        </div>

        {/* Level Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-mono text-[#888]">
              LVL {levelInfo.level} &middot; {levelInfo.title}
            </span>
            <span className="text-[9px] font-mono text-[#555]">
              {levelInfo.xpInLevel}/{levelInfo.xpForNext}
            </span>
          </div>
          <div className="w-full bg-[#1a1a2e] rounded-full h-1.5 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-[#a855f7] to-[#6366f1] transition-all duration-500"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative overflow-hidden text-left ${
                active
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-[#888] hover:bg-[#111118] hover:text-white border border-transparent"
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 transition-transform ${active ? "scale-110" : ""}`} />
              <span className="font-medium text-sm">{item.name}</span>
              {item.badge && (
                <span className="ml-auto text-[8px] bg-[#3b82f6]/20 text-[#60a5fa] px-2 py-0.5 rounded-full border border-[#3b82f6]/30 font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-[#1a1a2e] space-y-1">
        {/* Upgrade CTA (Free users only) */}
        {userTier === "free" && (
          <Link
            href="/upgrade"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#a855f7]/10 to-[#3b82f6]/10 border border-[#a855f7]/30 text-[#a855f7] hover:from-[#a855f7]/20 hover:to-[#3b82f6]/20 transition-all mb-1"
          >
            <SparklesIcon className="h-5 w-5" />
            <span className="font-medium text-sm">Upgrade to Pro</span>
          </Link>
        )}

        <Link
          href="/settings"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3 px-4 py-3 text-[#888] hover:text-white hover:bg-[#111118] rounded-xl transition-colors w-full"
        >
          <SettingsIcon className="h-5 w-5" />
          <span className="text-sm">Settings</span>
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 text-[#888] hover:text-danger hover:bg-danger/10 rounded-xl transition-colors"
        >
          <LogOutIcon className="h-5 w-5" />
          <span className="text-sm">Sign out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0d0d1a] border-r border-[#1a1a2e] h-screen fixed left-0 top-0 z-30">
        <SidebarContent />
      </aside>

      {/* Hamburger Button — hidden on mobile (bottom tabs handle nav) and desktop (sidebar visible) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:block lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#0d0d1a] border border-[#1a1a2e] rounded-xl shadow-lg touch-manipulation hover:bg-[#111118] transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <XIcon className="h-5 w-5 text-white" />
        ) : (
          <MenuIcon className="h-5 w-5 text-white" />
        )}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fade_in"
            onClick={() => setIsOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 w-72 max-w-[85vw] bg-[#0d0d1a] border-r border-[#1a1a2e] h-screen z-50 flex flex-col animate-slide_in_left overflow-hidden">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
