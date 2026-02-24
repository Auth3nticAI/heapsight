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
import { lessonRPG16 } from "./lesson-rpg-16-command-queue-formalized";
import { lessonRPG17 } from "./lesson-rpg-17-resolve-pass-isolated";
import { lessonRPG18 } from "./lesson-rpg-18-combat-pass-isolated";
import { lessonRPG19 } from "./lesson-rpg-19-cleanup-pass-isolated";
import { lessonRPG20 } from "./lesson-rpg-20-milestone-room-transition";
import { lessonRPG21 } from "./lesson-rpg-21-deterministic-rng-v0";
import { lessonRPG22 } from "./lesson-rpg-22-no-rand-rule";
import { lessonRPG23 } from "./lesson-rpg-23-state-signature-v0";
import { lessonRPG24 } from "./lesson-rpg-24-save-file-v0";
import { lessonRPG25 } from "./lesson-rpg-25-milestone-restart-resume";
import { lessonRPG26 } from "./lesson-rpg-26-inventory-v0";
import { lessonRPG27 } from "./lesson-rpg-27-items-as-ids";
import { lessonRPG28 } from "./lesson-rpg-28-loot-drop-deterministic";
import { lessonRPG29 } from "./lesson-rpg-29-allocation-counter";
import { lessonRPG30 } from "./lesson-rpg-30-gate-a-heap-freeze";
import { lessonRPG31 } from "./lesson-rpg-31-input-module-split";
import { lessonRPG32 } from "./lesson-rpg-32-render-module-split";
import { lessonRPG33 } from "./lesson-rpg-33-world-loading";
import { lessonRPG34 } from "./lesson-rpg-34-enemy-ai-table";
import { lessonRPG35 } from "./lesson-rpg-35-multi-enemy-arena";
import { lessonRPG36 } from "./lesson-rpg-36-damage-tables";
import { lessonRPG37 } from "./lesson-rpg-37-combat-event-log";
import { lessonRPG38 } from "./lesson-rpg-38-hud-overlay";
import { lessonRPG39 } from "./lesson-rpg-39-error-handling";
import { lessonRPG40 } from "./lesson-rpg-40-systems-stable-dungeon";
import { lessonRPG41 } from "./lesson-rpg-41-item-table-parse";
import { lessonRPG42 } from "./lesson-rpg-42-equipment-slots";
import { lessonRPG43 } from "./lesson-rpg-43-consumables";
import { lessonRPG44 } from "./lesson-rpg-44-gold-economy";
import { lessonRPG45 } from "./lesson-rpg-45-milestone-inventory-loop";
import { lessonRPG46 } from "./lesson-rpg-46-shop-state";
import { lessonRPG47 } from "./lesson-rpg-47-shop-buy-command";
import { lessonRPG48 } from "./lesson-rpg-48-loot-tables";
import { lessonRPG49 } from "./lesson-rpg-49-status-effects";
import { lessonRPG50 } from "./lesson-rpg-50-milestone-midgame-slice";

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
  lessonRPG16,
  lessonRPG17,
  lessonRPG18,
  lessonRPG19,
  lessonRPG20,
  lessonRPG21,
  lessonRPG22,
  lessonRPG23,
  lessonRPG24,
  lessonRPG25,
  lessonRPG26,
  lessonRPG27,
  lessonRPG28,
  lessonRPG29,
  lessonRPG30,
  lessonRPG31,
  lessonRPG32,
  lessonRPG33,
  lessonRPG34,
  lessonRPG35,
  lessonRPG36,
  lessonRPG37,
  lessonRPG38,
  lessonRPG39,
  lessonRPG40,
  lessonRPG41,
  lessonRPG42,
  lessonRPG43,
  lessonRPG44,
  lessonRPG45,
  lessonRPG46,
  lessonRPG47,
  lessonRPG48,
  lessonRPG49,
  lessonRPG50,
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
