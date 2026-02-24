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
import lessonPlatformer31 from "./lesson-platformer-31-input-module-split";
import lessonPlatformer32 from "./lesson-platformer-32-render-module-split";
import lessonPlatformer33 from "./lesson-platformer-33-physics-module-split";
import lessonPlatformer34 from "./lesson-platformer-34-collision-module-split";
import lessonPlatformer35 from "./lesson-platformer-35-system-pipeline-gate";
import lessonPlatformer36 from "./lesson-platformer-36-fixed-timestep-accumulator";
import lessonPlatformer37 from "./lesson-platformer-37-one-way-platforms";
import lessonPlatformer38 from "./lesson-platformer-38-moving-platforms";
import lessonPlatformer39 from "./lesson-platformer-39-error-handling";
import lessonPlatformer40 from "./lesson-platformer-40-robust-physics-gate";
import lessonPlatformer41 from "./lesson-platformer-41-dash-mechanic";
import lessonPlatformer42 from "./lesson-platformer-42-wall-slide";
import lessonPlatformer43 from "./lesson-platformer-43-wall-jump";
import lessonPlatformer44 from "./lesson-platformer-44-double-jump";
import lessonPlatformer45 from "./lesson-platformer-45-movement-toolkit-gate";
import lessonPlatformer46 from "./lesson-platformer-46-hazard-tiles";
import lessonPlatformer47 from "./lesson-platformer-47-enemy-patrol";
import lessonPlatformer48 from "./lesson-platformer-48-stomp-kill";
import lessonPlatformer49 from "./lesson-platformer-49-knockback";
import lessonPlatformer50 from "./lesson-platformer-50-midgame-slice-gate";
import lessonPlatformer51 from "./lesson-platformer-51-enemy-types-data-driven";
import lessonPlatformer52 from "./lesson-platformer-52-projectile-enemies";
import lessonPlatformer53 from "./lesson-platformer-53-hitbox-hurtbox-split";
import lessonPlatformer54 from "./lesson-platformer-54-invulnerability-frames";
import lessonPlatformer55 from "./lesson-platformer-55-milestone-combat-system";
import lessonPlatformer56 from "./lesson-platformer-56-boss-entity-v0";
import lessonPlatformer57 from "./lesson-platformer-57-boss-attack-patterns";
import lessonPlatformer58 from "./lesson-platformer-58-pickup-items";
import lessonPlatformer59 from "./lesson-platformer-59-score-timer-hud";
import lessonPlatformer60 from "./lesson-platformer-60-milestone-complete-combat";
import lessonPlatformer61 from "./lesson-platformer-61-save-v1-versioned";
import lessonPlatformer62 from "./lesson-platformer-62-save-checksum";
import lessonPlatformer63 from "./lesson-platformer-63-load-migration";
import lessonPlatformer64 from "./lesson-platformer-64-input-log-v0";
import lessonPlatformer65 from "./lesson-platformer-65-milestone-replay-a-run";
import lessonPlatformer66 from "./lesson-platformer-66-replay-playback";
import lessonPlatformer67 from "./lesson-platformer-67-determinism-pitfalls";
import lessonPlatformer68 from "./lesson-platformer-68-state-signature-verify";
import lessonPlatformer69 from "./lesson-platformer-69-replay-verification-test";
import lessonPlatformer70 from "./lesson-platformer-70-gate-b-replay-determinism";
import lessonPlatformer71 from "./lesson-platformer-71-profiling-timers";
import lessonPlatformer72 from "./lesson-platformer-72-hot-path-audit";
import lessonPlatformer73 from "./lesson-platformer-73-spatial-grid-entities";
import lessonPlatformer74 from "./lesson-platformer-74-pool-stats";
import lessonPlatformer75 from "./lesson-platformer-75-milestone-stress-test";
import lessonPlatformer76 from "./lesson-platformer-76-slope-collision-v0";
import lessonPlatformer77 from "./lesson-platformer-77-camera-deadzone";
import lessonPlatformer78 from "./lesson-platformer-78-parallax-background";
import lessonPlatformer79 from "./lesson-platformer-79-config-file";
import lessonPlatformer80 from "./lesson-platformer-80-milestone-performance-report";
import lessonPlatformer81 from "./lesson-platformer-81-hud-v2-layout";
import lessonPlatformer82 from "./lesson-platformer-82-screen-shake";
import lessonPlatformer83 from "./lesson-platformer-83-particle-effects";
import lessonPlatformer84 from "./lesson-platformer-84-sprite-animation-v0";
import lessonPlatformer85 from "./lesson-platformer-85-milestone-juiced-platformer";
import lessonPlatformer86 from "./lesson-platformer-86-difficulty-config";
import lessonPlatformer87 from "./lesson-platformer-87-assist-mode";
import lessonPlatformer88 from "./lesson-platformer-88-crash-proofing";
import lessonPlatformer89 from "./lesson-platformer-89-dead-code-cleanup";
import lessonPlatformer90 from "./lesson-platformer-90-milestone-public-beta";
import lessonPlatformer91 from "./lesson-platformer-91-build-id-version";
import lessonPlatformer92 from "./lesson-platformer-92-unit-tests-physics";
import lessonPlatformer93 from "./lesson-platformer-93-unit-tests-collision";
import lessonPlatformer94 from "./lesson-platformer-94-unit-tests-level-parse";
import lessonPlatformer95 from "./lesson-platformer-95-gate-c-zero-warnings";
import lessonPlatformer96 from "./lesson-platformer-96-readme-quickstart";
import lessonPlatformer97 from "./lesson-platformer-97-screenshot-capture";
import lessonPlatformer98 from "./lesson-platformer-98-final-content-pass";
import lessonPlatformer99 from "./lesson-platformer-99-release-checklist";
import lessonPlatformer100 from "./lesson-platformer-100-ship-export-ready";

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
  lessonPlatformer31,
  lessonPlatformer32,
  lessonPlatformer33,
  lessonPlatformer34,
  lessonPlatformer35,
  lessonPlatformer36,
  lessonPlatformer37,
  lessonPlatformer38,
  lessonPlatformer39,
  lessonPlatformer40,
  lessonPlatformer41,
  lessonPlatformer42,
  lessonPlatformer43,
  lessonPlatformer44,
  lessonPlatformer45,
  lessonPlatformer46,
  lessonPlatformer47,
  lessonPlatformer48,
  lessonPlatformer49,
  lessonPlatformer50,
  lessonPlatformer51,
  lessonPlatformer52,
  lessonPlatformer53,
  lessonPlatformer54,
  lessonPlatformer55,
  lessonPlatformer56,
  lessonPlatformer57,
  lessonPlatformer58,
  lessonPlatformer59,
  lessonPlatformer60,
  lessonPlatformer61,
  lessonPlatformer62,
  lessonPlatformer63,
  lessonPlatformer64,
  lessonPlatformer65,
  lessonPlatformer66,
  lessonPlatformer67,
  lessonPlatformer68,
  lessonPlatformer69,
  lessonPlatformer70,
  lessonPlatformer71,
  lessonPlatformer72,
  lessonPlatformer73,
  lessonPlatformer74,
  lessonPlatformer75,
  lessonPlatformer76,
  lessonPlatformer77,
  lessonPlatformer78,
  lessonPlatformer79,
  lessonPlatformer80,
  lessonPlatformer81,
  lessonPlatformer82,
  lessonPlatformer83,
  lessonPlatformer84,
  lessonPlatformer85,
  lessonPlatformer86,
  lessonPlatformer87,
  lessonPlatformer88,
  lessonPlatformer89,
  lessonPlatformer90,
  lessonPlatformer91,
  lessonPlatformer92,
  lessonPlatformer93,
  lessonPlatformer94,
  lessonPlatformer95,
  lessonPlatformer96,
  lessonPlatformer97,
  lessonPlatformer98,
  lessonPlatformer99,
  lessonPlatformer100,
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
