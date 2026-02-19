import type { Lesson } from "@/types/lesson";
import { lessonRPG01 } from "./lesson-rpg-01-boot-dungeon-grid";
import { lessonRPG02 } from "./lesson-rpg-02-player-spawn-rules";
import { lessonRPG03 } from "./lesson-rpg-03-input-to-intent";
import { lessonRPG04 } from "./lesson-rpg-04-intent-to-move";
import { lessonRPG05 } from "./lesson-rpg-05-walls-and-bounds";
import { lessonRPG06 } from "./lesson-rpg-06-enemy-spawn";
import { lessonRPG07 } from "./lesson-rpg-07-turn-pipeline-v0";
import { lessonRPG08 } from "./lesson-rpg-08-melee-attack-v0";
import { lessonRPG09 } from "./lesson-rpg-09-hp-and-death";
import { lessonRPG10 } from "./lesson-rpg-10-milestone-micro-dungeon";
import { lessonRPG11 } from "./lesson-rpg-11-world-state-struct";
import { lessonRPG12 } from "./lesson-rpg-12-types-and-coordinates";
import { lessonRPG13 } from "./lesson-rpg-13-entity-ids-v0";
import { lessonRPG14 } from "./lesson-rpg-14-soa-components-v0";
import { lessonRPG15 } from "./lesson-rpg-15-milestone-stable-update-order";
import { lessonRPG16 } from "./lesson-rpg-16-command-queue-v0";
import { lessonRPG17 } from "./lesson-rpg-17-resolve-commands-pass";
import { lessonRPG18 } from "./lesson-rpg-18-combat-pass-v0";
import { lessonRPG19 } from "./lesson-rpg-19-cleanup-pass-v0";
import { lessonRPG20 } from "./lesson-rpg-20-milestone-two-room-transition";
import { lessonRPG21 } from "./lesson-rpg-21-deterministic-rng-v0";
import { lessonRPG22 } from "./lesson-rpg-22-no-rand-rule";
import { lessonRPG23 } from "./lesson-rpg-23-state-signature-v0";
import { lessonRPG24 } from "./lesson-rpg-24-save-file-v0";
import { lessonRPG25 } from "./lesson-rpg-25-milestone-restart-resume";
import { lessonRPG26 } from "./lesson-rpg-26-inventory-v0";
import { lessonRPG27 } from "./lesson-rpg-27-items-v0-as-ids";
import { lessonRPG28 } from "./lesson-rpg-28-loot-drop-deterministic";
import { lessonRPG29 } from "./lesson-rpg-29-allocation-counter-v0";
import { lessonRPG30 } from "./lesson-rpg-30-gate-a-heap-freeze";
import { lessonRPG31 } from "./lesson-rpg-31-input-module-split";
import { lessonRPG32 } from "./lesson-rpg-32-render-module-split";
import { lessonRPG33 } from "./lesson-rpg-33-world-loading-v0";
import { lessonRPG34 } from "./lesson-rpg-34-enemy-ai-v0";
import { lessonRPG35 } from "./lesson-rpg-35-milestone-multi-enemy-arena";
import { lessonRPG36 } from "./lesson-rpg-36-damage-tables";
import { lessonRPG37 } from "./lesson-rpg-37-combat-event-log";
import { lessonRPG38 } from "./lesson-rpg-38-ui-overlay-v0";
import { lessonRPG39 } from "./lesson-rpg-39-error-handling-discipline";
import { lessonRPG40 } from "./lesson-rpg-40-milestone-systems-stable-dungeon";
import { lessonRPG41 } from "./lesson-rpg-41-item-tables-parse";
import { lessonRPG42 } from "./lesson-rpg-42-equipment-slots";
import { lessonRPG43 } from "./lesson-rpg-43-consumables";
import { lessonRPG44 } from "./lesson-rpg-44-gold-economy-rules";
import { lessonRPG45 } from "./lesson-rpg-45-milestone-inventory-loop";
import { lessonRPG46 } from "./lesson-rpg-46-shop-state-v0";
import { lessonRPG47 } from "./lesson-rpg-47-shop-buy-command";
import { lessonRPG48 } from "./lesson-rpg-48-loot-tables";
import { lessonRPG49 } from "./lesson-rpg-49-status-effects-v0";
import { lessonRPG50 } from "./lesson-rpg-50-milestone-midgame-slice";
import { lessonRPG51 } from "./lesson-rpg-51-npc-entities-v0";
import { lessonRPG52 } from "./lesson-rpg-52-interaction-command";
import { lessonRPG53 } from "./lesson-rpg-53-dialogue-data-v0";
import { lessonRPG54 } from "./lesson-rpg-54-quest-struct-v0";
import { lessonRPG55 } from "./lesson-rpg-55-milestone-accept-complete-quest";
import { lessonRPG56 } from "./lesson-rpg-56-quest-state-machine";
import { lessonRPG57 } from "./lesson-rpg-57-rewards-pipeline";
import { lessonRPG58 } from "./lesson-rpg-58-xp-and-level-v0";
import { lessonRPG59 } from "./lesson-rpg-59-skill-points-v0";
import { lessonRPG60 } from "./lesson-rpg-60-milestone-town-dungeon-loop";
import { lessonRPG61 } from "./lesson-rpg-61-save-v1-versioned";
import { lessonRPG62 } from "./lesson-rpg-62-save-checksum";
import { lessonRPG63 } from "./lesson-rpg-63-load-migration-rules";
import { lessonRPG64 } from "./lesson-rpg-64-replay-log-v0";
import { lessonRPG65 } from "./lesson-rpg-65-milestone-replay-short-run";
import { lessonRPG66 } from "./lesson-rpg-66-replay-playback-pipeline";
import { lessonRPG67 } from "./lesson-rpg-67-determinism-pitfalls";
import { lessonRPG68 } from "./lesson-rpg-68-state-signature-end-of-run";
import { lessonRPG69 } from "./lesson-rpg-69-replay-verification-test";
import { lessonRPG70 } from "./lesson-rpg-70-gate-b-replay-determinism";
import { lessonRPG71 } from "./lesson-rpg-71-profiling-timers-v0";
import { lessonRPG72 } from "./lesson-rpg-72-hot-path-cleanup";
import { lessonRPG73 } from "./lesson-rpg-73-spatial-queries-v0";
import { lessonRPG74 } from "./lesson-rpg-74-pool-discipline-audit";
import { lessonRPG75 } from "./lesson-rpg-75-milestone-stress-dungeon";
import { lessonRPG76 } from "./lesson-rpg-76-command-pattern-formalization";
import { lessonRPG77 } from "./lesson-rpg-77-observer-for-ui-only";
import { lessonRPG78 } from "./lesson-rpg-78-strategy-as-data-tables";
import { lessonRPG79 } from "./lesson-rpg-79-factory-for-spawn-recipes";
import { lessonRPG80 } from "./lesson-rpg-80-milestone-modular-content-pack";
import { lessonRPG81 } from "./lesson-rpg-81-hud-v2-layout";
import { lessonRPG82 } from "./lesson-rpg-82-combat-feedback";
import { lessonRPG83 } from "./lesson-rpg-83-animation-timing-v0";
import { lessonRPG84 } from "./lesson-rpg-84-menu-flow";
import { lessonRPG85 } from "./lesson-rpg-85-milestone-beta-quality";
import { lessonRPG86 } from "./lesson-rpg-86-accessibility-assist-mode";
import { lessonRPG87 } from "./lesson-rpg-87-difficulty-curve-tables";
import { lessonRPG88 } from "./lesson-rpg-88-crash-proofing-content";
import { lessonRPG89 } from "./lesson-rpg-89-refactor-hygiene";
import { lessonRPG90 } from "./lesson-rpg-90-milestone-public-beta";
import { lessonRPG91 } from "./lesson-rpg-91-build-id-version-stamping";
import { lessonRPG92 } from "./lesson-rpg-92-unit-tests-rng";
import { lessonRPG93 } from "./lesson-rpg-93-unit-tests-save";
import { lessonRPG94 } from "./lesson-rpg-94-unit-tests-combat";
import { lessonRPG95 } from "./lesson-rpg-95-gate-c-zero-warnings";
import { lessonRPG96 } from "./lesson-rpg-96-readme-quickstart";
import { lessonRPG97 } from "./lesson-rpg-97-screenshot-capture";
import { lessonRPG98 } from "./lesson-rpg-98-final-content-pass";
import { lessonRPG99 } from "./lesson-rpg-99-release-checklist-tag";
import { lessonRPG100 } from "./lesson-rpg-100-ship-milestone";

export const ALL_RPG_LESSONS: Lesson[] = [
  lessonRPG01, lessonRPG02, lessonRPG03, lessonRPG04, lessonRPG05,
  lessonRPG06, lessonRPG07, lessonRPG08, lessonRPG09, lessonRPG10,
  lessonRPG11, lessonRPG12, lessonRPG13, lessonRPG14, lessonRPG15,
  lessonRPG16, lessonRPG17, lessonRPG18, lessonRPG19, lessonRPG20,
  lessonRPG21, lessonRPG22, lessonRPG23, lessonRPG24, lessonRPG25,
  lessonRPG26, lessonRPG27, lessonRPG28, lessonRPG29, lessonRPG30,
  lessonRPG31, lessonRPG32, lessonRPG33, lessonRPG34, lessonRPG35,
  lessonRPG36, lessonRPG37, lessonRPG38, lessonRPG39, lessonRPG40,
  lessonRPG41, lessonRPG42, lessonRPG43, lessonRPG44, lessonRPG45,
  lessonRPG46, lessonRPG47, lessonRPG48, lessonRPG49, lessonRPG50,
  lessonRPG51, lessonRPG52, lessonRPG53, lessonRPG54, lessonRPG55,
  lessonRPG56, lessonRPG57, lessonRPG58, lessonRPG59, lessonRPG60,
  lessonRPG61, lessonRPG62, lessonRPG63, lessonRPG64, lessonRPG65,
  lessonRPG66, lessonRPG67, lessonRPG68, lessonRPG69, lessonRPG70,
  lessonRPG71, lessonRPG72, lessonRPG73, lessonRPG74, lessonRPG75,
  lessonRPG76, lessonRPG77, lessonRPG78, lessonRPG79, lessonRPG80,
  lessonRPG81, lessonRPG82, lessonRPG83, lessonRPG84, lessonRPG85,
  lessonRPG86, lessonRPG87, lessonRPG88, lessonRPG89, lessonRPG90,
  lessonRPG91, lessonRPG92, lessonRPG93, lessonRPG94, lessonRPG95,
  lessonRPG96, lessonRPG97, lessonRPG98, lessonRPG99, lessonRPG100,
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
