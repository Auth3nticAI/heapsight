import type { Lesson } from "@/types/lesson";
import { lesson01 } from "./lesson-01-boot-the-system";
import { lesson02 } from "./lesson-02-player-stats";
import { lesson03 } from "./lesson-03-bullet-math";
import { lesson04 } from "./lesson-04-hit-or-miss";
import { lesson05 } from "./lesson-05-damage-function";
import { lesson06 } from "./lesson-06-soa-enemies";
import { lesson07 } from "./lesson-07-spawn-wave-loop";
import { lesson08 } from "./lesson-08-combat-rules";
import { lesson09 } from "./lesson-09-component-mutation";
import { lesson10 } from "./lesson-10-entity-pool-v0";
import { lesson11 } from "./lesson-11-component-structs";
import { lesson12 } from "./lesson-12-extract-components-header";
import { lesson13 } from "./lesson-13-inheritance-trap";
import { lesson14 } from "./lesson-14-dynamic-arrays";
import { lesson15 } from "./lesson-15-multi-system-tick";
import { lesson16 } from "./lesson-16-entity-manager-class";
import { lesson17 } from "./lesson-17-ids-and-free-list";
import { lesson18 } from "./lesson-18-save-snapshot-v0";
import { lesson19 } from "./lesson-19-game-states-v0";
import { lesson20 } from "./lesson-20-spatial-buckets-v0";
import { lesson21 } from "./lesson-21-checkpoint-save-load";
import { lesson22 } from "./lesson-22-error-handling-v0";
import { lesson23 } from "./lesson-23-thread-awareness-v0";
import { lesson24 } from "./lesson-24-lambdas-for-queries";
import { lesson25 } from "./lesson-25-milestone-playable-loop";
import { lesson26 } from "./lesson-26-pointers-data-access";
import { lesson27 } from "./lesson-27-heap-stack-demo";
import { lesson28 } from "./lesson-28-raii-first-pass";
import { lesson29 } from "./lesson-29-unique-ptr-ownership";
import { lesson30 } from "./lesson-30-pool-allocator";
import { lesson31 } from "./lesson-31-template-component-access";
import { lesson32 } from "./lesson-32-type-safe-ids";
import { lesson33 } from "./lesson-33-data-layout-optimization";
import { lesson34 } from "./lesson-34-allocator-awareness";
import { lesson35 } from "./lesson-35-milestone-500-bullets";
import { lesson36 } from "./lesson-36-fixed-timestep";
import { lesson37 } from "./lesson-37-movement-system";
import { lesson38 } from "./lesson-38-spawn-system";
import { lesson39 } from "./lesson-39-damage-system-v2";
import { lesson40 } from "./lesson-40-cleanup-system";
import { lesson41 } from "./lesson-41-collision-basics";
import { lesson42 } from "./lesson-42-system-extraction";
import { lesson43 } from "./lesson-43-data-driven-enemies";
import { lesson44 } from "./lesson-44-debug-overlay";
import { lesson45 } from "./lesson-45-milestone-stable-core";
import { lesson46 } from "./lesson-46-render-protocol";
import { lesson47 } from "./lesson-47-sprite-mapping";
import { lesson48 } from "./lesson-48-input-system";
import { lesson49 } from "./lesson-49-camera-screen-space";
import { lesson50 } from "./lesson-50-milestone-playable";
import { lesson51 } from "./lesson-51-spread-shot";
import { lesson52 } from "./lesson-52-fire-rate";
import { lesson53 } from "./lesson-53-screen-bounds";
import { lesson54 } from "./lesson-54-hit-flash";
import { lesson55 } from "./lesson-55-milestone-visual-feel";
import { lesson56 } from "./lesson-56-collision-resolve";
import { lesson57 } from "./lesson-57-spatial-hash";
import { lesson58 } from "./lesson-58-wave-file-format";
import { lesson59 } from "./lesson-59-enemy-ai-linear";
import { lesson60 } from "./lesson-60-enemy-ai-sine";
import { lesson61 } from "./lesson-61-target-selection";
import { lesson62 } from "./lesson-62-powerups-data";
import { lesson63 } from "./lesson-63-enemy-types-v2";
import { lesson64 } from "./lesson-64-boss-intro";
import { lesson65 } from "./lesson-65-boss-phases";
import { lesson66 } from "./lesson-66-difficulty-curve";
import { lesson67 } from "./lesson-67-score-system";
import { lesson68 } from "./lesson-68-lives-respawn";
import { lesson69 } from "./lesson-69-level-complete";
import { lesson70 } from "./lesson-70-milestone-gameplay-loop";
import { lesson71 } from "./lesson-71-background-loading";
import { lesson72 } from "./lesson-72-job-style-update";
import { lesson73 } from "./lesson-73-determinism";
import { lesson74 } from "./lesson-74-replay-log";
import { lesson75 } from "./lesson-75-milestone-replay";
import { lesson76 } from "./lesson-76-achievement-hooks";
import { lesson77 } from "./lesson-77-stats-screen";
import { lesson78 } from "./lesson-78-memory-profiling";
import { lesson79 } from "./lesson-79-optimization-pass";
import { lesson80 } from "./lesson-80-content-extension";
import { lesson81 } from "./lesson-81-screen-shake";
import { lesson82 } from "./lesson-82-particles";
import { lesson83 } from "./lesson-83-trail-effects";
import { lesson84 } from "./lesson-84-pause-menu";
import { lesson85 } from "./lesson-85-milestone-advanced";
import { lesson86 } from "./lesson-86-audio-sfx";
import { lesson87 } from "./lesson-87-music-loop";
import { lesson88 } from "./lesson-88-settings-menu";
import { lesson89 } from "./lesson-89-accessibility";
import { lesson90 } from "./lesson-90-balance-pass";
import { lesson91 } from "./lesson-91-hud-v2";
import { lesson92 } from "./lesson-92-title-screen";
import { lesson93 } from "./lesson-93-config-file";
import { lesson94 } from "./lesson-94-crash-proofing";
import { lesson95 } from "./lesson-95-milestone-shippable";
import { lesson96 } from "./lesson-96-build-system";
import { lesson97 } from "./lesson-97-unit-tests";
import { lesson98 } from "./lesson-98-readme-docs";
import { lesson99 } from "./lesson-99-final-refactor";
import { lesson100 } from "./lesson-100-milestone-release";

export const ALL_SPACE_SHOOTER_LESSONS: Lesson[] = [
  lesson01, lesson02, lesson03, lesson04, lesson05,
  lesson06, lesson07, lesson08, lesson09, lesson10,
  lesson11, lesson12, lesson13, lesson14, lesson15,
  lesson16, lesson17, lesson18, lesson19, lesson20,
  lesson21, lesson22, lesson23, lesson24, lesson25,
  lesson26, lesson27, lesson28, lesson29, lesson30,
  lesson31, lesson32, lesson33, lesson34, lesson35,
  lesson36, lesson37, lesson38, lesson39, lesson40,
  lesson41, lesson42, lesson43, lesson44, lesson45,
  lesson46, lesson47, lesson48, lesson49, lesson50,
  lesson51, lesson52, lesson53, lesson54, lesson55,
  lesson56, lesson57, lesson58, lesson59, lesson60,
  lesson61, lesson62, lesson63, lesson64, lesson65,
  lesson66, lesson67, lesson68, lesson69, lesson70,
  lesson71, lesson72, lesson73, lesson74, lesson75,
  lesson76, lesson77, lesson78, lesson79, lesson80,
  lesson81, lesson82, lesson83, lesson84, lesson85,
  lesson86, lesson87, lesson88, lesson89, lesson90,
  lesson91, lesson92, lesson93, lesson94, lesson95,
  lesson96, lesson97, lesson98, lesson99, lesson100,
].sort((a, b) => a.order - b.order);

export function getSpaceShooterLessonById(id: string): Lesson | undefined {
  return ALL_SPACE_SHOOTER_LESSONS.find((l) => l.id === id);
}

export function getNextSpaceShooterLesson(currentId: string): Lesson | undefined {
  const idx = ALL_SPACE_SHOOTER_LESSONS.findIndex((l) => l.id === currentId);
  return idx >= 0 && idx < ALL_SPACE_SHOOTER_LESSONS.length - 1
    ? ALL_SPACE_SHOOTER_LESSONS[idx + 1]
    : undefined;
}
