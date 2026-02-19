"use client";

import { usePathname, useRouter } from "next/navigation";

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

function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20V10M18 20V4M6 20v-4" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const NAV_ITEMS = [
  { path: "/learn",       label: "Learn",       icon: HomeIcon },
  { path: "/leaderboard", label: "Leaderboard", icon: TrophyIcon },
  { path: "/paths",       label: "Paths",       icon: ShuffleIcon },
  { path: "/progress",    label: "Progress",    icon: BarChartIcon },
  { path: "/settings",    label: "Profile",     icon: UserIcon },
];

export default function DashboardBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#0d0d1a]/95 backdrop-blur-sm border-t border-[#1a1a2e]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center h-14">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[48px] transition-colors touch-manipulation ${
                active ? "text-primary" : "text-[#555] active:text-[#888]"
              }`}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] font-mono leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
