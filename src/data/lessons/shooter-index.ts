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
