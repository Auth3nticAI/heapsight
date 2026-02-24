import type { Lesson } from "@/types/lesson";
import { lessonShooter1 } from "./lesson-shooter-01-boot-starfield";
import { lessonShooter2 } from "./lesson-shooter-02-ship-position";
import { lessonShooter3 } from "./lesson-shooter-03-ship-moves";
import { lessonShooter4 } from "./lesson-shooter-04-screen-bounds";
import { lessonShooter5 } from "./lesson-shooter-05-first-bullet";
import { lessonShooter6 } from "./lesson-shooter-06-bullet-array";
import { lessonShooter7 } from "./lesson-shooter-07-enemy-array";
import { lessonShooter8 } from "./lesson-shooter-08-collision-v0";
import { lessonShooter9 } from "./lesson-shooter-09-score-counter";
import { lessonShooter10 } from "./lesson-shooter-10-micro-shooter";
import { lessonShooter11 } from "./lesson-shooter-11-god-object-refactor";
import { lessonShooter12 } from "./lesson-shooter-12-world-state-struct";
import { lessonShooter13 } from "./lesson-shooter-13-entity-ids-v0";
import { lessonShooter14 } from "./lesson-shooter-14-soa-formalization";
import { lessonShooter15 } from "./lesson-shooter-15-data-layout-milestone";
import { lessonShooter16 } from "./lesson-shooter-16-professional-split";
import { lessonShooter17 } from "./lesson-shooter-17-spawn-function";
import { lessonShooter18 } from "./lesson-shooter-18-despawn-recycle";
import { lessonShooter19 } from "./lesson-shooter-19-bullet-pool";
import { lessonShooter20 } from "./lesson-shooter-20-milestone-pooled-lifecycle";
import { lessonShooter21 } from "./lesson-shooter-21-deterministic-rng-v0";
import { lessonShooter22 } from "./lesson-shooter-22-no-rand-rule";
import { lessonShooter23 } from "./lesson-shooter-23-state-signature-v0";
import { lessonShooter24 } from "./lesson-shooter-24-save-snapshot-v0";
import { lessonShooter25 } from "./lesson-shooter-25-milestone-restart-resume";
import { lessonShooter26 } from "./lesson-shooter-26-particle-pool-v0";
import { lessonShooter27 } from "./lesson-shooter-27-powerup-entities-v0";
import { lessonShooter28 } from "./lesson-shooter-28-allocation-counter-v0";
import { lessonShooter29 } from "./lesson-shooter-29-leak-trap-demo";
import { lessonShooter30 } from "./lesson-shooter-30-gate-a-heap-freeze";
import { lessonShooter31 } from "./lesson-shooter-31-input-module-split";
import { lessonShooter32 } from "./lesson-shooter-32-render-module-split";
import { lessonShooter33 } from "./lesson-shooter-33-movement-system-split";
import { lessonShooter34 } from "./lesson-shooter-34-collision-system-split";
import { lessonShooter35 } from "./lesson-shooter-35-gate-b-system-pipeline";
import { lessonShooter36 } from "./lesson-shooter-36-spatial-grid-v0";
import { lessonShooter37 } from "./lesson-shooter-37-wave-spawner-v0";
import { lessonShooter38 } from "./lesson-shooter-38-hud-system-v0";
import { lessonShooter39 } from "./lesson-shooter-39-error-handling";
import { lessonShooter40 } from "./lesson-shooter-40-milestone-modular-shooter";
import { lessonShooter41 } from "./lesson-shooter-41-wave-table-parse";
import { lessonShooter42 } from "./lesson-shooter-42-enemy-types-v0";
import { lessonShooter43 } from "./lesson-shooter-43-powerup-system";
import { lessonShooter44 } from "./lesson-shooter-44-spread-shot";
import { lessonShooter45 } from "./lesson-shooter-45-milestone-wave-loop";
import { lessonShooter46 } from "./lesson-shooter-46-score-multiplier";
import { lessonShooter47 } from "./lesson-shooter-47-difficulty-curve-v0";
import { lessonShooter48 } from "./lesson-shooter-48-background-scrolling";
import { lessonShooter49 } from "./lesson-shooter-49-lives-system";
import { lessonShooter50 } from "./lesson-shooter-50-milestone-midgame-slice";
import { lessonShooter51 } from "./lesson-shooter-51-component-flags";
import { lessonShooter52 } from "./lesson-shooter-52-system-ordering-rules";
import { lessonShooter53 } from "./lesson-shooter-53-enemy-ai-linear";
import { lessonShooter54 } from "./lesson-shooter-54-enemy-ai-wave-pattern";
import { lessonShooter55 } from "./lesson-shooter-55-milestone-smart-enemies";
import { lessonShooter56 } from "./lesson-shooter-56-boss-entity-v0";
import { lessonShooter57 } from "./lesson-shooter-57-boss-attack-patterns";
import { lessonShooter58 } from "./lesson-shooter-58-shield-component";
import { lessonShooter59 } from "./lesson-shooter-59-entity-tags-v0";
import { lessonShooter60 } from "./lesson-shooter-60-milestone-ecs-engine";
import { lessonShooter61 } from "./lesson-shooter-61-save-v1-versioned";
import { lessonShooter62 } from "./lesson-shooter-62-save-checksum";
import { lessonShooter63 } from "./lesson-shooter-63-load-migration";
import { lessonShooter64 } from "./lesson-shooter-64-input-log-v0";
import { lessonShooter65 } from "./lesson-shooter-65-milestone-replay-a-run";
import { lessonShooter66 } from "./lesson-shooter-66-replay-playback-pipeline";
import { lessonShooter67 } from "./lesson-shooter-67-determinism-pitfalls";
import { lessonShooter68 } from "./lesson-shooter-68-state-signature-at-end";
import { lessonShooter69 } from "./lesson-shooter-69-replay-verification-test";
import { lessonShooter70 } from "./lesson-shooter-70-gate-b-replay-determinism";
import { lessonShooter71 } from "./lesson-shooter-71-profiling-timers";
import { lessonShooter72 } from "./lesson-shooter-72-hot-path-audit";
import { lessonShooter73 } from "./lesson-shooter-73-spatial-grid-tuning";
import { lessonShooter74 } from "./lesson-shooter-74-pool-stats";
import { lessonShooter75 } from "./lesson-shooter-75-milestone-stress-test";
import { lessonShooter76 } from "./lesson-shooter-76-simd-ready-layout";
import { lessonShooter77 } from "./lesson-shooter-77-batch-rendering";
import { lessonShooter78 } from "./lesson-shooter-78-prefetch-hints";
import { lessonShooter79 } from "./lesson-shooter-79-memory-layout-report";
import { lessonShooter80 } from "./lesson-shooter-80-milestone-perf-report";
import { lessonShooter81 } from "./lesson-shooter-81-hud-v2-layout";
import { lessonShooter82 } from "./lesson-shooter-82-screen-shake-v0";
import { lessonShooter83 } from "./lesson-shooter-83-particle-burst";
import { lessonShooter84 } from "./lesson-shooter-84-sprite-animation-v0";
import { lessonShooter85 } from "./lesson-shooter-85-milestone-juiced-shooter";
import { lessonShooter86 } from "./lesson-shooter-86-difficulty-config";
import { lessonShooter87 } from "./lesson-shooter-87-assist-mode";
import { lessonShooter88 } from "./lesson-shooter-88-crash-proofing";
import { lessonShooter89 } from "./lesson-shooter-89-dead-code-cleanup";
import { lessonShooter90 } from "./lesson-shooter-90-milestone-public-beta";
import { lessonShooter91 } from "./lesson-shooter-91-build-id";
import { lessonShooter92 } from "./lesson-shooter-92-tests-rng";
import { lessonShooter93 } from "./lesson-shooter-93-tests-pools";
import { lessonShooter94 } from "./lesson-shooter-94-tests-collision";
import { lessonShooter95 } from "./lesson-shooter-95-gate-c-zero-warnings";
import { lessonShooter96 } from "./lesson-shooter-96-readme-quickstart";
import { lessonShooter97 } from "./lesson-shooter-97-screenshot-capture";
import { lessonShooter98 } from "./lesson-shooter-98-final-content-pass";
import { lessonShooter99 } from "./lesson-shooter-99-release-checklist";
import { lessonShooter100 } from "./lesson-shooter-100-ship-export-ready";

export const ALL_SHOOTER_LESSONS: Lesson[] = [
  lessonShooter1,
  lessonShooter2,
  lessonShooter3,
  lessonShooter4,
  lessonShooter5,
  lessonShooter6,
  lessonShooter7,
  lessonShooter8,
  lessonShooter9,
  lessonShooter10,
  lessonShooter11,
  lessonShooter12,
  lessonShooter13,
  lessonShooter14,
  lessonShooter15,
  lessonShooter16,
  lessonShooter17,
  lessonShooter18,
  lessonShooter19,
  lessonShooter20,
  lessonShooter21,
  lessonShooter22,
  lessonShooter23,
  lessonShooter24,
  lessonShooter25,
  lessonShooter26,
  lessonShooter27,
  lessonShooter28,
  lessonShooter29,
  lessonShooter30,
  lessonShooter31,
  lessonShooter32,
  lessonShooter33,
  lessonShooter34,
  lessonShooter35,
  lessonShooter36,
  lessonShooter37,
  lessonShooter38,
  lessonShooter39,
  lessonShooter40,
  lessonShooter41,
  lessonShooter42,
  lessonShooter43,
  lessonShooter44,
  lessonShooter45,
  lessonShooter46,
  lessonShooter47,
  lessonShooter48,
  lessonShooter49,
  lessonShooter50,
  lessonShooter51,
  lessonShooter52,
  lessonShooter53,
  lessonShooter54,
  lessonShooter55,
  lessonShooter56,
  lessonShooter57,
  lessonShooter58,
  lessonShooter59,
  lessonShooter60,
  lessonShooter61,
  lessonShooter62,
  lessonShooter63,
  lessonShooter64,
  lessonShooter65,
  lessonShooter66,
  lessonShooter67,
  lessonShooter68,
  lessonShooter69,
  lessonShooter70,
  lessonShooter71,
  lessonShooter72,
  lessonShooter73,
  lessonShooter74,
  lessonShooter75,
  lessonShooter76,
  lessonShooter77,
  lessonShooter78,
  lessonShooter79,
  lessonShooter80,
  lessonShooter81,
  lessonShooter82,
  lessonShooter83,
  lessonShooter84,
  lessonShooter85,
  lessonShooter86,
  lessonShooter87,
  lessonShooter88,
  lessonShooter89,
  lessonShooter90,
  lessonShooter91,
  lessonShooter92,
  lessonShooter93,
  lessonShooter94,
  lessonShooter95,
  lessonShooter96,
  lessonShooter97,
  lessonShooter98,
  lessonShooter99,
  lessonShooter100,
].sort((a, b) => a.order - b.order);

export function getShooterLessonById(id: string): Lesson | undefined {
  return ALL_SHOOTER_LESSONS.find((l) => l.id === id);
}

export function getNextShooterLesson(currentId: string): Lesson | undefined {
  const idx = ALL_SHOOTER_LESSONS.findIndex((l) => l.id === currentId);
  return idx >= 0 && idx < ALL_SHOOTER_LESSONS.length - 1
    ? ALL_SHOOTER_LESSONS[idx + 1]
    : undefined;
}
