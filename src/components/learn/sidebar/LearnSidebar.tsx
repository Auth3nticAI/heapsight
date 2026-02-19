import LevelCard from "./LevelCard";
import DailyGoalCard from "./DailyGoalCard";
import ProUpsellCard from "./ProUpsellCard";
import PathProgressCard from "./PathProgressCard";
import type { PathLesson } from "@/components/learn/LessonPath";

interface LearnSidebarProps {
  level: number;
  title: string;
  xpInLevel: number;
  xpForNext: number;
  progress: number;
  totalXp: number;
  streakCount: number;
  completedToday: boolean;
  userTier: "free" | "pro";
  completedCount: number;
  freeLimit: number;
  lessons: PathLesson[];
  template: string;
  totalLessons: number;
  isRobotPath: boolean;
}

export default function LearnSidebar({
  level,
  title,
  xpInLevel,
  xpForNext,
  progress,
  totalXp,
  streakCount,
  completedToday,
  userTier,
  completedCount,
  freeLimit,
  lessons,
  template,
  totalLessons,
  isRobotPath,
}: LearnSidebarProps) {
  return (
    <aside className="hidden lg:block w-[280px] shrink-0">
      <div className="sticky top-6 space-y-4">
        <LevelCard
          level={level}
          title={title}
          xpInLevel={xpInLevel}
          xpForNext={xpForNext}
          progress={progress}
          totalXp={totalXp}
          streakCount={streakCount}
        />

        <DailyGoalCard
          completedToday={completedToday}
          streakCount={streakCount}
        />

        {userTier === "free" && (
          <ProUpsellCard
            completedCount={completedCount}
            freeLimit={freeLimit}
          />
        )}

        <PathProgressCard
          lessons={lessons}
          template={template}
          completedCount={completedCount}
          totalLessons={totalLessons}
          isRobotPath={isRobotPath}
        />
      </div>
    </aside>
  );
}
