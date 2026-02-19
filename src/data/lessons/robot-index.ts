import type { Lesson } from "@/types/lesson";
import { lessonRobot01 } from "./lesson-robot-01-render-robot";
import { lessonRobot02 } from "./lesson-robot-02-pose-state";
import { lessonRobot03 } from "./lesson-robot-03-motion-integration";
import { lessonRobot04 } from "./lesson-robot-04-fixed-update";
import { lessonRobot05 } from "./lesson-robot-05-obstacle-collision";
import { lessonRobot06 } from "./lesson-robot-06-goal-point";
import { lessonRobot07 } from "./lesson-robot-07-distance-function";
import { lessonRobot08 } from "./lesson-robot-08-control-loop";
import { lessonRobot09 } from "./lesson-robot-09-reset";
import { lessonRobot10 } from "./lesson-robot-10-milestone-interactive-sim";
import { lessonRobot11 } from "./lesson-robot-11-struct-pose";
import { lessonRobot12 } from "./lesson-robot-12-world-class";
import { lessonRobot13 } from "./lesson-robot-13-robot-class";
import { lessonRobot14 } from "./lesson-robot-14-oop-trap";
import { lessonRobot15 } from "./lesson-robot-15-vector-obstacles";
import { lessonRobot16 } from "./lesson-robot-16-save-load-pose";
import { lessonRobot17 } from "./lesson-robot-17-spatial-query";
import { lessonRobot18 } from "./lesson-robot-18-sensor-interface";
import { lessonRobot19 } from "./lesson-robot-19-component-refs";
import { lessonRobot20 } from "./lesson-robot-20-milestone-20";
import { lessonRobot21 } from "./lesson-robot-21-sensor-buffer-leak";
import { lessonRobot22 } from "./lesson-robot-22-manual-delete";
import { lessonRobot23 } from "./lesson-robot-23-raii";
import { lessonRobot24 } from "./lesson-robot-24-unique-ptr-modules";
import { lessonRobot25 } from "./lesson-robot-25-pool-allocator";
import { lessonRobot26 } from "./lesson-robot-26-smart-ptr-patterns";
import { lessonRobot27 } from "./lesson-robot-27-memory-layout";
import { lessonRobot28 } from "./lesson-robot-28-allocation-tracking";
import { lessonRobot29 } from "./lesson-robot-29-deterministic-alloc";
import { lessonRobot30 } from "./lesson-robot-30-milestone-memory";
import { lessonRobot31 } from "./lesson-robot-31-fixed-timestep";
import { lessonRobot32 } from "./lesson-robot-32-accumulator";
import { lessonRobot33 } from "./lesson-robot-33-noise-injection";
import { lessonRobot34 } from "./lesson-robot-34-seed-reproducibility";
import { lessonRobot35 } from "./lesson-robot-35-system-extraction";
import { lessonRobot36 } from "./lesson-robot-36-dt-validation";
import { lessonRobot37 } from "./lesson-robot-37-state-reset";
import { lessonRobot38 } from "./lesson-robot-38-trace-logging";
import { lessonRobot39 } from "./lesson-robot-39-test-harness";
import { lessonRobot40 } from "./lesson-robot-40-milestone-deterministic";
import { lessonRobot41 } from "./lesson-robot-41-range-ray";
import { lessonRobot42 } from "./lesson-robot-42-lidar-fan";
import { lessonRobot43 } from "./lesson-robot-43-noise-model";
import { lessonRobot44 } from "./lesson-robot-44-imu";
import { lessonRobot45 } from "./lesson-robot-45-odometry";
import { lessonRobot46 } from "./lesson-robot-46-sensor-packet";
import { lessonRobot47 } from "./lesson-robot-47-csv-logging";
import { lessonRobot48 } from "./lesson-robot-48-playback";
import { lessonRobot49 } from "./lesson-robot-49-sensor-fusion-intro";
import { lessonRobot50 } from "./lesson-robot-50-milestone-sensor";
import { lessonRobot51 } from "./lesson-robot-51-occupancy-grid";
import { lessonRobot52 } from "./lesson-robot-52-raycast-mapping";
import { lessonRobot53 } from "./lesson-robot-53-grid-save-load";
import { lessonRobot54 } from "./lesson-robot-54-beacon-correction";
import { lessonRobot55 } from "./lesson-robot-55-particle-filter";
import { lessonRobot56 } from "./lesson-robot-56-resampling";
import { lessonRobot57 } from "./lesson-robot-57-grid-update";
import { lessonRobot58 } from "./lesson-robot-58-localization-error";
import { lessonRobot59 } from "./lesson-robot-59-map-compare";
import { lessonRobot60 } from "./lesson-robot-60-milestone-mapping";
import { lessonRobot61 } from "./lesson-robot-61-grid-graph";
import { lessonRobot62 } from "./lesson-robot-62-bfs";
import { lessonRobot63 } from "./lesson-robot-63-a-star";
import { lessonRobot64 } from "./lesson-robot-64-path-smoothing";
import { lessonRobot65 } from "./lesson-robot-65-pid-controller";
import { lessonRobot66 } from "./lesson-robot-66-pid-tuning";
import { lessonRobot67 } from "./lesson-robot-67-pure-pursuit";
import { lessonRobot68 } from "./lesson-robot-68-replan";
import { lessonRobot69 } from "./lesson-robot-69-dynamic-obstacles";
import { lessonRobot70 } from "./lesson-robot-70-milestone-autonomy";
import { lessonRobot71 } from "./lesson-robot-71-threaded-mapping";
import { lessonRobot72 } from "./lesson-robot-72-determinism-toggle";
import { lessonRobot73 } from "./lesson-robot-73-loop-closure";
import { lessonRobot74 } from "./lesson-robot-74-sensor-fusion-adv";
import { lessonRobot75 } from "./lesson-robot-75-failure-modes";
import { lessonRobot76 } from "./lesson-robot-76-optimization-pass";
import { lessonRobot77 } from "./lesson-robot-77-performance-metrics";
import { lessonRobot78 } from "./lesson-robot-78-stress-test";
import { lessonRobot79 } from "./lesson-robot-79-advanced-recovery";
import { lessonRobot80 } from "./lesson-robot-80-milestone-advanced";
import { lessonRobot81 } from "./lesson-robot-81-visualization-polish";
import { lessonRobot82 } from "./lesson-robot-82-replay-compare";
import { lessonRobot83 } from "./lesson-robot-83-config-system";
import { lessonRobot84 } from "./lesson-robot-84-scenario-runner";
import { lessonRobot85 } from "./lesson-robot-85-assist-mode";
import { lessonRobot86 } from "./lesson-robot-86-ui-overlay";
import { lessonRobot87 } from "./lesson-robot-87-data-export";
import { lessonRobot88 } from "./lesson-robot-88-benchmark-suite";
import { lessonRobot89 } from "./lesson-robot-89-final-polish";
import { lessonRobot90 } from "./lesson-robot-90-milestone-polished";
import { lessonRobot91 } from "./lesson-robot-91-mode-select";
import { lessonRobot92 } from "./lesson-robot-92-tutorial-prompts";
import { lessonRobot93 } from "./lesson-robot-93-crash-proof";
import { lessonRobot94 } from "./lesson-robot-94-unit-tests-planner";
import { lessonRobot95 } from "./lesson-robot-95-unit-tests-pid";
import { lessonRobot96 } from "./lesson-robot-96-build-system";
import { lessonRobot97 } from "./lesson-robot-97-readme";
import { lessonRobot98 } from "./lesson-robot-98-final-refactor";
import { lessonRobot99 } from "./lesson-robot-99-release-prep";
import { lessonRobot100 } from "./lesson-robot-100-release-v1";

export const ALL_ROBOT_LESSONS: Lesson[] = [
  lessonRobot01, lessonRobot02, lessonRobot03, lessonRobot04, lessonRobot05,
  lessonRobot06, lessonRobot07, lessonRobot08, lessonRobot09, lessonRobot10,
  lessonRobot11, lessonRobot12, lessonRobot13, lessonRobot14, lessonRobot15,
  lessonRobot16, lessonRobot17, lessonRobot18, lessonRobot19, lessonRobot20,
  lessonRobot21, lessonRobot22, lessonRobot23, lessonRobot24, lessonRobot25,
  lessonRobot26, lessonRobot27, lessonRobot28, lessonRobot29, lessonRobot30,
  lessonRobot31, lessonRobot32, lessonRobot33, lessonRobot34, lessonRobot35,
  lessonRobot36, lessonRobot37, lessonRobot38, lessonRobot39, lessonRobot40,
  lessonRobot41, lessonRobot42, lessonRobot43, lessonRobot44, lessonRobot45,
  lessonRobot46, lessonRobot47, lessonRobot48, lessonRobot49, lessonRobot50,
  lessonRobot51, lessonRobot52, lessonRobot53, lessonRobot54, lessonRobot55,
  lessonRobot56, lessonRobot57, lessonRobot58, lessonRobot59, lessonRobot60,
  lessonRobot61, lessonRobot62, lessonRobot63, lessonRobot64, lessonRobot65,
  lessonRobot66, lessonRobot67, lessonRobot68, lessonRobot69, lessonRobot70,
  lessonRobot71, lessonRobot72, lessonRobot73, lessonRobot74, lessonRobot75,
  lessonRobot76, lessonRobot77, lessonRobot78, lessonRobot79, lessonRobot80,
  lessonRobot81, lessonRobot82, lessonRobot83, lessonRobot84, lessonRobot85,
  lessonRobot86, lessonRobot87, lessonRobot88, lessonRobot89, lessonRobot90,
  lessonRobot91, lessonRobot92, lessonRobot93, lessonRobot94, lessonRobot95,
  lessonRobot96, lessonRobot97, lessonRobot98, lessonRobot99, lessonRobot100,
].sort((a, b) => a.order - b.order);

export function getRobotLessonById(id: string): Lesson | undefined {
  return ALL_ROBOT_LESSONS.find((l) => l.id === id);
}

export function getNextRobotLesson(currentId: string): Lesson | undefined {
  const idx = ALL_ROBOT_LESSONS.findIndex((l) => l.id === currentId);
  return idx >= 0 && idx < ALL_ROBOT_LESSONS.length - 1
    ? ALL_ROBOT_LESSONS[idx + 1]
    : undefined;
}
