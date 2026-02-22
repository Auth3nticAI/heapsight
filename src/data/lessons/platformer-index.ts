import { Lesson } from "../../types/lesson";
import lessonPlatformer1 from "./lesson-platformer-01-boot-gravity";
import lessonPlatformer2 from "./lesson-platformer-02-jump-impulse";
import lessonPlatformer3 from "./lesson-platformer-03-variable-jump";
import lessonPlatformer4 from "./lesson-platformer-04-left-right-run";
import lessonPlatformer5 from "./lesson-platformer-05-accel-friction";
import lessonPlatformer6 from "./lesson-platformer-06-player-fsm-v0";
import lessonPlatformer7 from "./lesson-platformer-07-air-control";
import lessonPlatformer8 from "./lesson-platformer-08-coyote-time";
import lessonPlatformer9 from "./lesson-platformer-09-jump-buffer";
import lessonPlatformer10 from "./lesson-platformer-10-milestone-micro-platformer";
import lessonPlatformer11 from "./lesson-platformer-11-tile-grid-data";
import lessonPlatformer12 from "./lesson-platformer-12-grid-collision-v0";
import lessonPlatformer13 from "./lesson-platformer-13-horizontal-collision";
import lessonPlatformer14 from "./lesson-platformer-14-collectible-coins";
import lessonPlatformer15 from "./lesson-platformer-15-milestone-mini-level";
import lessonPlatformer16 from "./lesson-platformer-16-struct-extraction";
import lessonPlatformer17 from "./lesson-platformer-17-world-struct";
import lessonPlatformer18 from "./lesson-platformer-18-command-queue-v0";
import lessonPlatformer19 from "./lesson-platformer-19-cleanup-pass-v0";
import lessonPlatformer20 from "./lesson-platformer-20-milestone-two-level-transition";
import lessonPlatformer21 from "./lesson-platformer-21-deterministic-rng-v0";
import lessonPlatformer22 from "./lesson-platformer-22-no-rand-rule";
import lessonPlatformer23 from "./lesson-platformer-23-state-signature-v0";
import lessonPlatformer24 from "./lesson-platformer-24-checkpoint-save-v0";
import lessonPlatformer25 from "./lesson-platformer-25-restart-resume";
import lessonPlatformer26 from "./lesson-platformer-26-entity-pool-v0";
import lessonPlatformer27 from "./lesson-platformer-27-particle-pool-v0";
import lessonPlatformer28 from "./lesson-platformer-28-allocation-counter-v0";
import lessonPlatformer29 from "./lesson-platformer-29-leak-trap-demo";
import lessonPlatformer30 from "./lesson-platformer-30-gate-a-heap-freeze";

export const ALL_PLATFORMER_LESSONS: Lesson[] = ([
  lessonPlatformer1,
  lessonPlatformer2,
  lessonPlatformer3,
  lessonPlatformer4,
  lessonPlatformer5,
  lessonPlatformer6,
  lessonPlatformer7,
  lessonPlatformer8,
  lessonPlatformer9,
  lessonPlatformer10,
  lessonPlatformer11,
  lessonPlatformer12,
  lessonPlatformer13,
  lessonPlatformer14,
  lessonPlatformer15,
  lessonPlatformer16,
  lessonPlatformer17,
  lessonPlatformer18,
  lessonPlatformer19,
  lessonPlatformer20,
  lessonPlatformer21,
  lessonPlatformer22,
  lessonPlatformer23,
  lessonPlatformer24,
  lessonPlatformer25,
  lessonPlatformer26,
  lessonPlatformer27,
  lessonPlatformer28,
  lessonPlatformer29,
  lessonPlatformer30,
] as Lesson[]).sort((a, b) => a.order - b.order);

export function getPlatformerLessonById(id: string): Lesson | undefined {
  return ALL_PLATFORMER_LESSONS.find((l) => l.id === id);
}

export function getNextPlatformerLesson(currentId: string): Lesson | undefined {
  const idx = ALL_PLATFORMER_LESSONS.findIndex((l) => l.id === currentId);
  return idx >= 0 && idx < ALL_PLATFORMER_LESSONS.length - 1
    ? ALL_PLATFORMER_LESSONS[idx + 1]
    : undefined;
}
