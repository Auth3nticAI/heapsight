import type { GameLessonVariant } from "@/types/game";
import { lesson01SimpleRpg } from "./lesson-01-game";
import { lesson02SimpleRpg } from "./lesson-02-game";
import { lesson03SimpleRpg } from "./lesson-03-game";
import { lesson04SimpleRpg } from "./lesson-04-game";
import { lesson05SimpleRpg } from "./lesson-05-game";
import { lesson06SimpleRpg } from "./lesson-06-game";
import { lesson07SimpleRpg } from "./lesson-07-game";
import { lesson08SimpleRpg } from "./lesson-08-game";
import { lesson09SimpleRpg } from "./lesson-09-game";
import { lesson10SimpleRpg } from "./lesson-10-game";
import { lesson11SimpleRpg } from "./lesson-11-game";
import { lesson12SimpleRpg } from "./lesson-12-game";
import { lesson13SimpleRpg } from "./lesson-13-game";
import { lesson14SimpleRpg } from "./lesson-14-game";
import { lesson15SimpleRpg } from "./lesson-15-game";
import { lesson16SimpleRpg } from "./lesson-16-game";
import { lesson17SimpleRpg } from "./lesson-17-game";
import { lesson18SimpleRpg } from "./lesson-18-game";
import { lesson19SimpleRpg } from "./lesson-19-game";
import { lesson20SimpleRpg } from "./lesson-20-game";
import { lesson21SimpleRpg } from "./lesson-21-game";
import { lesson22SimpleRpg } from "./lesson-22-game";
import { lesson23SimpleRpg } from "./lesson-23-game";
import { lesson24SimpleRpg } from "./lesson-24-game";
import { lesson25SimpleRpg } from "./lesson-25-game";

export const simpleRpgVariants: Record<string, GameLessonVariant> = {
  "01-boot-the-system": lesson01SimpleRpg,
  "02-player-stats": lesson02SimpleRpg,
  "03-bullet-math": lesson03SimpleRpg,
  "04-hit-or-miss": lesson04SimpleRpg,
  "05-damage-function": lesson05SimpleRpg,
  "06-soa-enemies": lesson06SimpleRpg,
  "07-spawn-wave-loop": lesson07SimpleRpg,
  "08-combat-rules": lesson08SimpleRpg,
  "09-component-mutation": lesson09SimpleRpg,
  "10-entity-pool-v0": lesson10SimpleRpg,
  "11-component-structs": lesson11SimpleRpg,
  "12-extract-components-header": lesson12SimpleRpg,
  "13-inheritance-trap": lesson13SimpleRpg,
  "14-dynamic-arrays": lesson14SimpleRpg,
  "15-multi-system-tick": lesson15SimpleRpg,
  "16-entity-manager-class": lesson16SimpleRpg,
  "17-ids-and-free-list": lesson17SimpleRpg,
  "18-save-snapshot-v0": lesson18SimpleRpg,
  "19-game-states-v0": lesson19SimpleRpg,
  "20-spatial-buckets-v0": lesson20SimpleRpg,
  "21-checkpoint-save-load": lesson21SimpleRpg,
  "22-error-handling-v0": lesson22SimpleRpg,
  "23-thread-awareness-v0": lesson23SimpleRpg,
  "24-lambdas-for-queries": lesson24SimpleRpg,
  "25-milestone-playable-loop": lesson25SimpleRpg,
};
