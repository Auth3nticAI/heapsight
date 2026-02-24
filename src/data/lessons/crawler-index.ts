import type { Lesson } from "@/types/lesson";
import { lessonCrawler1 } from "./lesson-crawler-01-boot-dungeon-3d";
import { lessonCrawler2 } from "./lesson-crawler-02-look-around";
import { lessonCrawler3 } from "./lesson-crawler-03-wasd-walk";
import { lessonCrawler4 } from "./lesson-crawler-04-wall-collision";
import { lessonCrawler5 } from "./lesson-crawler-05-multi-room-dungeon";
import { lessonCrawler6 } from "./lesson-crawler-06-floor-ceiling";
import { lessonCrawler7 } from "./lesson-crawler-07-minimap-overlay";
import { lessonCrawler8 } from "./lesson-crawler-08-door-mechanics";
import { lessonCrawler9 } from "./lesson-crawler-09-items-on-ground";
import { lessonCrawler10 } from "./lesson-crawler-10-milestone-explorable-dungeon";
import { lessonCrawler11 } from "./lesson-crawler-11-ray-wall-intersection";
import { lessonCrawler12 } from "./lesson-crawler-12-interaction-system";
import { lessonCrawler13 } from "./lesson-crawler-13-push-blocks";
import { lessonCrawler14 } from "./lesson-crawler-14-pressure-plates";
import { lessonCrawler15 } from "./lesson-crawler-15-milestone-puzzle-room";
import { lessonCrawler16 } from "./lesson-crawler-16-sphere-collision";
import { lessonCrawler17 } from "./lesson-crawler-17-slope-detection";
import { lessonCrawler18 } from "./lesson-crawler-18-moving-platforms";
import { lessonCrawler19 } from "./lesson-crawler-19-key-lock-system";
import { lessonCrawler20 } from "./lesson-crawler-20-milestone-multi-floor";
import { lessonCrawler21 } from "./lesson-crawler-21-ambient-light";
import { lessonCrawler22 } from "./lesson-crawler-22-point-light";
import { lessonCrawler23 } from "./lesson-crawler-23-multiple-lights";
import { lessonCrawler24 } from "./lesson-crawler-24-torch-flicker";
import { lessonCrawler25 } from "./lesson-crawler-25-milestone-atmospheric-dungeon";
import { lessonCrawler26 } from "./lesson-crawler-26-fog";
import { lessonCrawler27 } from "./lesson-crawler-27-color-zones";
import { lessonCrawler28 } from "./lesson-crawler-28-dynamic-light";
import { lessonCrawler29 } from "./lesson-crawler-29-alloc-counter";
import { lessonCrawler30 } from "./lesson-crawler-30-gate-a-heap-freeze";
import { lessonCrawler31 } from "./lesson-crawler-31-billboard-sprites";
import { lessonCrawler32 } from "./lesson-crawler-32-enemy-on-grid";
import { lessonCrawler33 } from "./lesson-crawler-33-enemy-facing";
import { lessonCrawler34 } from "./lesson-crawler-34-enemy-ai-patrol";
import { lessonCrawler35 } from "./lesson-crawler-35-milestone-living-dungeon";
import { lessonCrawler36 } from "./lesson-crawler-36-line-of-sight";
import { lessonCrawler37 } from "./lesson-crawler-37-chase-behavior";
import { lessonCrawler38 } from "./lesson-crawler-38-first-person-combat";
import { lessonCrawler39 } from "./lesson-crawler-39-enemy-attack";
import { lessonCrawler40 } from "./lesson-crawler-40-milestone-combat-dungeon";
import { lessonCrawler41 } from "./lesson-crawler-41-room-templates";
import { lessonCrawler42 } from "./lesson-crawler-42-corridor-generation";
import { lessonCrawler43 } from "./lesson-crawler-43-bsp-dungeon-v0";
import { lessonCrawler44 } from "./lesson-crawler-44-door-placement";
import { lessonCrawler45 } from "./lesson-crawler-45-milestone-random-dungeon";
import { lessonCrawler46 } from "./lesson-crawler-46-entity-placement";
import { lessonCrawler47 } from "./lesson-crawler-47-difficulty-scaling";
import { lessonCrawler48 } from "./lesson-crawler-48-loot-tables";
import { lessonCrawler49 } from "./lesson-crawler-49-multi-level-dungeon";
import { lessonCrawler50 } from "./lesson-crawler-50-milestone-roguelike-core";
import { lessonCrawler51 } from "./lesson-crawler-51-frustum-culling-v0";
import { lessonCrawler52 } from "./lesson-crawler-52-cell-visibility";
import { lessonCrawler53 } from "./lesson-crawler-53-fog-of-war";
import { lessonCrawler54 } from "./lesson-crawler-54-spatial-hashing";
import { lessonCrawler55 } from "./lesson-crawler-55-milestone-optimized-renderer";
import { lessonCrawler56 } from "./lesson-crawler-56-astar-pathfinding";
import { lessonCrawler57 } from "./lesson-crawler-57-sound-propagation";
import { lessonCrawler58 } from "./lesson-crawler-58-particle-system";
import { lessonCrawler59 } from "./lesson-crawler-59-projectiles";
import { lessonCrawler60 } from "./lesson-crawler-60-milestone-rich-3d-world";
import { lessonCrawler61 } from "./lesson-crawler-61-save-file-v0";
import { lessonCrawler62 } from "./lesson-crawler-62-load-and-resume";
import { lessonCrawler63 } from "./lesson-crawler-63-deterministic-rng";
import { lessonCrawler64 } from "./lesson-crawler-64-state-signature";
import { lessonCrawler65 } from "./lesson-crawler-65-milestone-save-resume";
import { lessonCrawler66 } from "./lesson-crawler-66-input-recording";
import { lessonCrawler67 } from "./lesson-crawler-67-replay-playback";
import { lessonCrawler68 } from "./lesson-crawler-68-replay-verification";
import { lessonCrawler69 } from "./lesson-crawler-69-replay-speed-control";
import { lessonCrawler70 } from "./lesson-crawler-70-gate-b-replay-determinism";

export const ALL_CRAWLER_LESSONS: Lesson[] = [
  lessonCrawler1,
  lessonCrawler2,
  lessonCrawler3,
  lessonCrawler4,
  lessonCrawler5,
  lessonCrawler6,
  lessonCrawler7,
  lessonCrawler8,
  lessonCrawler9,
  lessonCrawler10,
  lessonCrawler11,
  lessonCrawler12,
  lessonCrawler13,
  lessonCrawler14,
  lessonCrawler15,
  lessonCrawler16,
  lessonCrawler17,
  lessonCrawler18,
  lessonCrawler19,
  lessonCrawler20,
  lessonCrawler21,
  lessonCrawler22,
  lessonCrawler23,
  lessonCrawler24,
  lessonCrawler25,
  lessonCrawler26,
  lessonCrawler27,
  lessonCrawler28,
  lessonCrawler29,
  lessonCrawler30,
  lessonCrawler31,
  lessonCrawler32,
  lessonCrawler33,
  lessonCrawler34,
  lessonCrawler35,
  lessonCrawler36,
  lessonCrawler37,
  lessonCrawler38,
  lessonCrawler39,
  lessonCrawler40,
  lessonCrawler41,
  lessonCrawler42,
  lessonCrawler43,
  lessonCrawler44,
  lessonCrawler45,
  lessonCrawler46,
  lessonCrawler47,
  lessonCrawler48,
  lessonCrawler49,
  lessonCrawler50,
  lessonCrawler51,
  lessonCrawler52,
  lessonCrawler53,
  lessonCrawler54,
  lessonCrawler55,
  lessonCrawler56,
  lessonCrawler57,
  lessonCrawler58,
  lessonCrawler59,
  lessonCrawler60,
  lessonCrawler61,
  lessonCrawler62,
  lessonCrawler63,
  lessonCrawler64,
  lessonCrawler65,
  lessonCrawler66,
  lessonCrawler67,
  lessonCrawler68,
  lessonCrawler69,
  lessonCrawler70,
].sort((a, b) => a.order - b.order);

export function getCrawlerLessonById(id: string): Lesson | undefined {
  return ALL_CRAWLER_LESSONS.find((l) => l.id === id);
}

export function getNextCrawlerLesson(currentId: string): Lesson | undefined {
  const idx = ALL_CRAWLER_LESSONS.findIndex((l) => l.id === currentId);
  return idx >= 0 && idx < ALL_CRAWLER_LESSONS.length - 1
    ? ALL_CRAWLER_LESSONS[idx + 1]
    : undefined;
}
