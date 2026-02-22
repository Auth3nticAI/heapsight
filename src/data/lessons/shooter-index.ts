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
import { lessonShooter11 } from "./lesson-shooter-11-component-structs-v0";
import { lessonShooter12 } from "./lesson-shooter-12-world-state-struct";
import { lessonShooter13 } from "./lesson-shooter-13-entity-ids-v0";
import { lessonShooter14 } from "./lesson-shooter-14-soa-formalization";
import { lessonShooter15 } from "./lesson-shooter-15-data-layout-milestone";
import { lessonShooter16 } from "./lesson-shooter-16-fixed-timestep-v0";
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
