import type { PathLesson } from "@/components/learn/LessonPath";

interface PhaseInfo {
  title: string;
  icon: string;
  start: number;
  end: number;
}

const RPG_PHASES: PhaseInfo[] = [
  { title: "Feel-First Dungeon", icon: "\u2694\uFE0F", start: 1, end: 10 },
  { title: "Data Ownership",     icon: "\uD83D\uDDC4\uFE0F", start: 11, end: 20 },
  { title: "Determinism",        icon: "\uD83C\uDFAF", start: 21, end: 30 },
  { title: "Systems Architecture",icon: "\uD83C\uDFD7\uFE0F", start: 31, end: 40 },
  { title: "Progression",        icon: "\uD83D\uDCE6", start: 41, end: 50 },
  { title: "Quests & Narrative",  icon: "\uD83D\uDCDC", start: 51, end: 60 },
  { title: "Replay & Save",      icon: "\uD83D\uDCBE", start: 61, end: 70 },
  { title: "Performance",        icon: "\u26A1",       start: 71, end: 80 },
  { title: "Polish",             icon: "\u2728",       start: 81, end: 90 },
  { title: "Ship",               icon: "\uD83D\uDE80", start: 91, end: 100 },
];

function getGenericPhases(label: string): PhaseInfo[] {
  const icons = ["\u2694\uFE0F", "\uD83D\uDDC4\uFE0F", "\uD83C\uDFAF", "\uD83C\uDFD7\uFE0F", "\uD83D\uDCE6", "\uD83D\uDCDC", "\uD83D\uDCBE", "\u26A1", "\u2728", "\uD83D\uDE80"];
  return Array.from({ length: 10 }, (_, i) => ({
    title: `${label} Phase ${i + 1}`,
    icon: icons[i],
    start: i * 10 + 1,
    end: (i + 1) * 10,
  }));
}

interface PathProgressCardProps {
  lessons: PathLesson[];
  template: string;
  completedCount: number;
  totalLessons: number;
  isRobotPath: boolean;
}

export default function PathProgressCard({
  lessons,
  template,
  completedCount,
  totalLessons,
  isRobotPath,
}: PathProgressCardProps) {
  const phases = template === "simple_rpg"
    ? RPG_PHASES
    : getGenericPhases(
        template === "platformer" ? "Platformer" :
        template === "differential_drive_robot" ? "Robotics" :
        "Space Shooter"
      );

  return (
    <div className="rounded-xl border border-[#1f2937] bg-[#12121a] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-white">
          {isRobotPath ? "Robotics" : "Game Dev"} Progress
        </span>
        <span className="text-[9px] font-mono text-[#888]">{completedCount}/{totalLessons}</span>
      </div>

      {/* Overall bar */}
      <div className="w-full bg-[#1a1a2e] rounded-full h-2 overflow-hidden mb-4">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-primary via-[#00cc6e] to-[#00aa55] transition-all duration-700"
          style={{ width: `${(completedCount / totalLessons) * 100}%` }}
        />
      </div>

      {/* Per-phase rows */}
      <div className="space-y-2">
        {phases.map((phase, i) => {
          const phaseCompleted = lessons.filter(
            (l) => l.order >= phase.start && l.order <= phase.end && l.status === "completed"
          ).length;
          const phaseTotal = lessons.filter(
            (l) => l.order >= phase.start && l.order <= phase.end
          ).length;
          const phaseDone = phaseCompleted === phaseTotal && phaseTotal > 0;

          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs shrink-0 w-5 text-center" aria-hidden="true">{phase.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="w-full bg-[#1a1a2e] rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${
                      phaseDone ? "bg-primary" : phaseCompleted > 0 ? "bg-[#3b82f6]" : "bg-[#1a1a2e]"
                    }`}
                    style={{ width: phaseTotal > 0 ? `${(phaseCompleted / phaseTotal) * 100}%` : "0%" }}
                  />
                </div>
              </div>
              <span className={`text-[9px] font-mono shrink-0 w-8 text-right ${
                phaseDone ? "text-primary" : "text-[#555]"
              }`}>
                {phaseCompleted}/{phaseTotal}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
