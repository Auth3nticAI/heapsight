"use client";

import { useRouter } from "next/navigation";

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}

interface ContinueFABProps {
  nextLesson: {
    id: string;
    order: number;
    title: string;
  } | null;
}

export default function ContinueFAB({ nextLesson }: ContinueFABProps) {
  const router = useRouter();

  if (!nextLesson) return null;

  return (
    <button
      onClick={() => router.push(`/lesson/${nextLesson.id}`)}
      className="lg:hidden fixed bottom-20 right-4 z-40 group active:scale-95 transition-transform touch-manipulation"
      aria-label={`Continue to Lesson ${nextLesson.order}: ${nextLesson.title}`}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />

      {/* Button body */}
      <div className="relative bg-gradient-to-r from-primary to-[#00cc6e] rounded-full shadow-2xl shadow-primary/40 flex items-center gap-3 px-5 py-3.5 min-h-[56px]">
        <PlayIcon className="h-5 w-5 text-black" />
        <div className="text-left">
          <div className="text-[9px] font-mono text-black/60 font-semibold">Continue</div>
          <div className="text-sm text-black font-bold whitespace-nowrap">
            Lesson {nextLesson.order}
          </div>
        </div>
      </div>
    </button>
  );
}
