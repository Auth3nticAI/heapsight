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

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="6 3 20 12 6 21 6 3" />
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

interface BottomNavProps {
  onContinue: () => void;
  continueLessonTitle?: string;
}

export default function BottomNav({ onContinue, continueLessonTitle }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Continue FAB */}
      <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <button
          onClick={onContinue}
          className="bg-gradient-to-r from-[#246BFD] to-[#0040C3] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-primary/40 active:scale-95 transition-transform touch-manipulation"
          aria-label={continueLessonTitle ? `Continue: ${continueLessonTitle}` : "Continue learning"}
        >
          <PlayIcon className="h-6 w-6 ml-0.5" />
        </button>
      </div>

      {/* Nav bar */}
      <nav className="bg-[#040B10]/95 backdrop-blur-sm border-t border-white/[0.05] safe-area-bottom">
        <div className="flex items-center h-16">
          {/* Learn */}
          <button
            onClick={() => router.push("/learn")}
            className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[48px] transition-colors touch-manipulation ${
              pathname === "/learn" ? "text-primary" : "text-[#AFBCD5]/50 active:text-[#AFBCD5]/70"
            }`}
            aria-label="Learn"
            aria-current={pathname === "/learn" ? "page" : undefined}
          >
            <HomeIcon className="h-5 w-5" />
            <span className="text-[10px] font-mono">Learn</span>
          </button>

          {/* Spacer for FAB */}
          <div className="w-20" />

          {/* Account */}
          <button
            onClick={() => router.push("/account")}
            className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[48px] transition-colors touch-manipulation ${
              pathname === "/account" ? "text-primary" : "text-[#AFBCD5]/50 active:text-[#AFBCD5]/70"
            }`}
            aria-label="Account"
            aria-current={pathname === "/account" ? "page" : undefined}
          >
            <UserIcon className="h-5 w-5" />
            <span className="text-[10px] font-mono">Account</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
