import type { Lesson } from "@/types/lesson";
import { lessonRPG00 } from "./lesson-rpg-00-test-wasm";
import { lessonRPG01 } from "./lesson-rpg-01-boot-dungeon-grid";
import { lessonRPG02 } from "./lesson-rpg-02-player-intent";
import { lessonRPG03 } from "./lesson-rpg-03-command-resolution";
import { lessonRPG04 } from "./lesson-rpg-04-wall-collision";
import { lessonRPG05 } from "./lesson-rpg-05-turn-pipeline";
import { lessonRPG06 } from "./lesson-rpg-06-enemy-on-grid";
import { lessonRPG07 } from "./lesson-rpg-07-combat-intent";
import { lessonRPG08 } from "./lesson-rpg-08-damage-resolution";
import { lessonRPG09 } from "./lesson-rpg-09-death-and-cleanup";
import { lessonRPG10 } from "./lesson-rpg-10-milestone-micro-dungeon";
import { lessonRPG11 } from "./lesson-rpg-11-world-state-struct";
import { lessonRPG12 } from "./lesson-rpg-12-types-and-coordinates";
import { lessonRPG13 } from "./lesson-rpg-13-entity-ids-v0";
import { lessonRPG14 } from "./lesson-rpg-14-soa-components-v0";
import { lessonRPG15 } from "./lesson-rpg-15-milestone-stable-update-order";

export const ALL_RPG_LESSONS: Lesson[] = [
  lessonRPG00,
  lessonRPG01,
  lessonRPG02,
  lessonRPG03,
  lessonRPG04,
  lessonRPG05,
  lessonRPG06,
  lessonRPG07,
  lessonRPG08,
  lessonRPG09,
  lessonRPG10,
  lessonRPG11,
  lessonRPG12,
  lessonRPG13,
  lessonRPG14,
  lessonRPG15,
].sort((a, b) => a.order - b.order);

export function getRPGLessonById(id: string): Lesson | undefined {
  return ALL_RPG_LESSONS.find((l) => l.id === id);
}

export function getNextRPGLesson(currentId: string): Lesson | undefined {
  const idx = ALL_RPG_LESSONS.findIndex((l) => l.id === currentId);
  return idx >= 0 && idx < ALL_RPG_LESSONS.length - 1
    ? ALL_RPG_LESSONS[idx + 1]
    : undefined;
}
