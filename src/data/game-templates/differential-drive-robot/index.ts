import type { GameLessonVariant } from "@/types/game";
import { lesson01Robot } from "./lesson-01-robot";
import { lesson02Robot } from "./lesson-02-robot";
import { lesson03Robot } from "./lesson-03-robot";
import { lesson04Robot } from "./lesson-04-robot";
import { lesson05Robot } from "./lesson-05-robot";
import { lesson06Robot } from "./lesson-06-robot";
import { lesson07Robot } from "./lesson-07-robot";
import { lesson08Robot } from "./lesson-08-robot";
import { lesson09Robot } from "./lesson-09-robot";
import { lesson10Robot } from "./lesson-10-robot";
import { lesson11Robot } from "./lesson-11-robot";
import { lesson12Robot } from "./lesson-12-robot";
import { lesson13Robot } from "./lesson-13-robot";
import { lesson14Robot } from "./lesson-14-robot";
import { lesson15Robot } from "./lesson-15-robot";
import { lesson16Robot } from "./lesson-16-robot";
import { lesson17Robot } from "./lesson-17-robot";
import { lesson18Robot } from "./lesson-18-robot";
import { lesson19Robot } from "./lesson-19-robot";
import { lesson20Robot } from "./lesson-20-robot";
import { lesson21Robot } from "./lesson-21-robot";
import { lesson22Robot } from "./lesson-22-robot";
import { lesson23Robot } from "./lesson-23-robot";
import { lesson24Robot } from "./lesson-24-robot";
import { lesson25Robot } from "./lesson-25-robot";

export const differentialDriveRobotVariants: Record<string, GameLessonVariant> = {
  "01-hello-world": lesson01Robot,
  "02-variables": lesson02Robot,
  "03-functions": lesson03Robot,
  "04-structs": lesson04Robot,
  "05-pointers": lesson05Robot,
  "06-arrays": lesson06Robot,
  "07-loops": lesson07Robot,
  "08-conditionals": lesson08Robot,
  "09-references": lesson09Robot,
  "10-dynamic-memory": lesson10Robot,
  "11-strings": lesson11Robot,
  "12-input": lesson12Robot,
  "13-enums": lesson13Robot,
  "14-headers": lesson14Robot,
  "15-collision": lesson15Robot,
  "16-game-loop": lesson16Robot,
  "17-entity-management": lesson17Robot,
  "18-score-system": lesson18Robot,
  "19-difficulty": lesson19Robot,
  "20-effects": lesson20Robot,
  "21-save-load": lesson21Robot,
  "22-memory-leaks": lesson22Robot,
  "23-smart-pointers": lesson23Robot,
  "24-debugging": lesson24Robot,
  "25-final-polish": lesson25Robot,
};
