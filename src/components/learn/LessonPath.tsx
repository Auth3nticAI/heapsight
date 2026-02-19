"use client";

import { useEffect, useRef } from "react";
import PhaseHeader from "./PhaseHeader";
import LessonNode, { isMilestoneLesson, isGateLesson } from "./LessonNode";
import LessonTooltip from "./LessonTooltip";
import PathConnector from "./PathConnector";
import type { LessonStatus } from "@/types/lesson";

// ─── Phase definitions ──────────────────────────────────────────────────────
const RPG_PHASES = [
  { id: "phase-1",  title: "Feel-First Dungeon",  icon: "\u2694\uFE0F", lessons: [1, 10],  description: "One room, grid-based, deterministic, fun" },
  { id: "phase-2",  title: "Data Ownership",       icon: "\uD83D\uDDC4\uFE0F", lessons: [11, 20], description: "SoA, IDs, stable iteration, command queue" },
  { id: "phase-3",  title: "Determinism",           icon: "\uD83C\uDFAF", lessons: [21, 30], description: "RNG discipline, state signatures, Heap Freeze" },
  { id: "phase-4",  title: "Systems Architecture",  icon: "\uD83C\uDFD7\uFE0F", lessons: [31, 40], description: "Modules, data-driven behavior, file I/O" },
  { id: "phase-5",  title: "Progression",           icon: "\uD83D\uDCE6", lessons: [41, 50], description: "Inventory, equipment, shop, economy" },
  { id: "phase-6",  title: "Quests & Narrative",    icon: "\uD83D\uDCDC", lessons: [51, 60], description: "Quest state machines, dialogue, events" },
  { id: "phase-7",  title: "Replay & Save",         icon: "\uD83D\uDCBE", lessons: [61, 70], description: "Versioned saves, replay, Determinism Gate" },
  { id: "phase-8",  title: "Performance",            icon: "\u26A1", lessons: [71, 80], description: "Profiling, spatial queries, patterns as data" },
  { id: "phase-9",  title: "Polish",                 icon: "\u2728", lessons: [81, 90], description: "HUD, feedback, accessibility, crash-proofing" },
  { id: "phase-10", title: "Ship",                   icon: "\uD83D\uDE80", lessons: [91, 100], description: "Tests, docs, build system, Zero Warnings, release" },
];

// Generic phases for non-RPG paths (10 lessons per phase)
function getGenericPhases(pathLabel: string) {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `phase-${i + 1}`,
    title: `${pathLabel} Phase ${i + 1}`,
    icon: ["\u2694\uFE0F", "\uD83D\uDDC4\uFE0F", "\uD83C\uDFAF", "\uD83C\uDFD7\uFE0F", "\uD83D\uDCE6", "\uD83D\uDCDC", "\uD83D\uDCBE", "\u26A1", "\u2728", "\uD83D\uDE80"][i],
    lessons: [i * 10 + 1, (i + 1) * 10] as [number, number],
    description: `Lessons ${i * 10 + 1}\u2013${(i + 1) * 10}`,
  }));
}

// ─── Sine-wave offset for the snaking path ──────────────────────────────────
const AMPLITUDE_DESKTOP = 60;
const AMPLITUDE_MOBILE = 30;
const NODE_SPACING = 80;

function getOffsetX(globalIndex: number, mobile: boolean): number {
  const amp = mobile ? AMPLITUDE_MOBILE : AMPLITUDE_DESKTOP;
  return Math.cos(globalIndex * Math.PI / 2) * amp;
}

// ─── Types ──────────────────────────────────────────────────────────────────
export interface PathLesson {
  id: string;
  title: string;
  description: string;
  order: number;
  xpReward: number;
  tier: "free" | "pro";
  status: LessonStatus;
  part1Done: boolean;
  part2Done: boolean;
  minutes: number;
}

interface LessonPathProps {
  lessons: PathLesson[];
  userTier: "free" | "pro";
  template: string;
  onPaywallClick: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function LessonPath({
  lessons,
  userTier,
  template,
  onPaywallClick,
}: LessonPathProps) {
  const phases = template === "simple_rpg"
    ? RPG_PHASES
    : getGenericPhases(
        template === "platformer" ? "Platformer" :
        template === "differential_drive_robot" ? "Robotics" :
        "Space Shooter"
      );

  const currentLessonId =
    lessons.find((l) => l.status === "in_progress")?.id ??
    lessons.find((l) => l.status === "available")?.id ??
    null;

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current lesson on mount
  useEffect(() => {
    if (!currentLessonId || !containerRef.current) return;
    const timer = setTimeout(() => {
      const el = containerRef.current?.querySelector("[data-current-lesson]");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [currentLessonId]);

  const phaseGroups = phases.map((phase) => {
    const [start, end] = phase.lessons;
    const phaseLessons = lessons.filter((l) => l.order >= start && l.order <= end);
    const completedInPhase = phaseLessons.filter((l) => l.status === "completed").length;
    return { phase, lessons: phaseLessons, completedInPhase };
  });

  const renderNode = (lesson: PathLesson, offsetX: number) => (
    <LessonTooltip
      title={lesson.title}
      description={lesson.description}
      order={lesson.order}
      xpReward={lesson.xpReward}
      status={lesson.status}
      tier={lesson.tier}
      userTier={userTier}
      minutes={lesson.minutes}
      part1Done={lesson.part1Done}
      part2Done={lesson.part2Done}
    >
      <LessonNode
        id={lesson.id}
        order={lesson.order}
        title={lesson.title}
        xpReward={lesson.xpReward}
        status={lesson.status}
        tier={lesson.tier}
        userTier={userTier}
        isMilestone={isMilestoneLesson(lesson.order)}
        isGate={isGateLesson(lesson.order)}
        isCurrent={lesson.id === currentLessonId}
        offsetX={offsetX}
        onLockedTierClick={onPaywallClick}
      />
    </LessonTooltip>
  );

  return (
    <div ref={containerRef} className="relative flex flex-col items-center py-4 overflow-x-clip">
      {phaseGroups.map((group, gi) => {
        if (group.lessons.length === 0) return null;

        const globalOffset = phases
          .slice(0, gi)
          .reduce((sum, p) => {
            const [s, e] = p.lessons;
            return sum + lessons.filter((l) => l.order >= s && l.order <= e).length;
          }, 0);

        return (
          <div key={group.phase.id} className="w-full">
            <PhaseHeader
              icon={group.phase.icon}
              title={group.phase.title}
              description={group.phase.description}
              phaseNumber={gi + 1}
              completedCount={group.completedInPhase}
              totalCount={group.lessons.length}
            />

            <div className="flex flex-col items-center">
              {group.lessons.map((lesson, li) => {
                const globalIndex = globalOffset + li;
                const offsetDesktop = getOffsetX(globalIndex, false);
                const offsetMobile = getOffsetX(globalIndex, true);
                const prevLesson = li > 0
                  ? group.lessons[li - 1]
                  : (gi > 0 ? phaseGroups[gi - 1]?.lessons.at(-1) : null);
                const prevGlobalIndex = globalIndex - 1;
                const prevOffsetDesktop = prevLesson ? getOffsetX(prevGlobalIndex, false) : 0;
                const prevOffsetMobile = prevLesson ? getOffsetX(prevGlobalIndex, true) : 0;
                const connectorCompleted = prevLesson?.status === "completed";

                const isCurrent = lesson.id === currentLessonId;

                return (
                  <div
                    key={lesson.id}
                    className="flex flex-col items-center"
                    {...(isCurrent ? { "data-current-lesson": "" } : {})}
                  >
                    {(li > 0 || gi > 0) && (
                      <>
                        <div className="hidden sm:block">
                          <PathConnector
                            fromOffsetX={prevOffsetDesktop}
                            toOffsetX={offsetDesktop}
                            completed={!!connectorCompleted}
                            height={NODE_SPACING}
                          />
                        </div>
                        <div className="sm:hidden">
                          <PathConnector
                            fromOffsetX={prevOffsetMobile}
                            toOffsetX={offsetMobile}
                            completed={!!connectorCompleted}
                            height={44}
                          />
                        </div>
                      </>
                    )}

                    {/* Desktop node with tooltip */}
                    <div className="hidden sm:flex flex-col items-center">
                      {renderNode(lesson, offsetDesktop)}
                    </div>
                    {/* Mobile node with tooltip */}
                    <div className="sm:hidden flex flex-col items-center">
                      {renderNode(lesson, offsetMobile)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
