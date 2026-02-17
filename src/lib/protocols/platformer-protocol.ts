/**
 * Platformer Path Protocol — Finite State Machines & Physics
 *
 * Paradigm: State-driven behavior, physics simulation
 *
 * Protocol lines:
 *   STATE|entity_id|state_name              → set entity state
 *   PLAYER|x|y|vx|vy|onGround|facing       → player snapshot (creates frame)
 *   PLATFORM|x|y|width|height               → define a platform
 *   ENEMY|id|x|y|state                      → define/update enemy
 *   PHYSICS|param|value                      → set physics parameter
 *   TRANSITION|from|to|condition             → log state transition
 *   GAME_MESSAGE|text                        → display message
 *   LEVEL_COMPLETE                           → end
 */

export type PlayerState =
  | "idle"
  | "running"
  | "jumping"
  | "falling"
  | "wall_slide"
  | "attacking"
  | "crouching";

export interface PlatformerPlayer {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  state: PlayerState;
  onGround: boolean;
  facingRight: boolean;
}

export interface PlatformerPlatform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlatformerEnemy {
  id: string;
  x: number;
  y: number;
  state: string;
}

export interface StateTransition {
  from: string;
  to: string;
  condition: string;
}

export interface PlatformerFrame {
  player: PlatformerPlayer;
  platforms: PlatformerPlatform[];
  enemies: PlatformerEnemy[];
  transitions: StateTransition[];
  physics: Record<string, number>;
  message: string;
  levelComplete: boolean;
}

export function parsePlatformerOutput(output: string): PlatformerFrame[] {
  const lines = output.trim().split("\n");
  const frames: PlatformerFrame[] = [];

  let player: PlatformerPlayer = {
    x: 100,
    y: 400,
    velocityX: 0,
    velocityY: 0,
    state: "idle",
    onGround: true,
    facingRight: true,
  };

  const platforms: PlatformerPlatform[] = [];
  const enemies = new Map<string, PlatformerEnemy>();
  const transitions: StateTransition[] = [];
  const physics: Record<string, number> = {};
  let message = "";
  let levelComplete = false;

  for (const line of lines) {
    if (line.startsWith("STATE|")) {
      const parts = line.substring(6).split("|");
      if (parts[0] === "player" && parts[1]) {
        player = { ...player, state: parts[1] as PlayerState };
      }
    } else if (line.startsWith("PLAYER|")) {
      const parts = line.substring(7).split("|");
      if (parts.length >= 6) {
        player = {
          x: parseFloat(parts[0]) || 0,
          y: parseFloat(parts[1]) || 0,
          velocityX: parseFloat(parts[2]) || 0,
          velocityY: parseFloat(parts[3]) || 0,
          onGround: parts[4] === "1",
          facingRight: parts[5] === "right",
          state: player.state,
        };
        // Each PLAYER line creates a frame
        frames.push({
          player: { ...player },
          platforms: [...platforms],
          enemies: Array.from(enemies.values()),
          transitions: [...transitions],
          physics: { ...physics },
          message,
          levelComplete,
        });
      }
    } else if (line.startsWith("PLATFORM|")) {
      const parts = line.substring(9).split("|");
      if (parts.length >= 4) {
        platforms.push({
          x: parseFloat(parts[0]) || 0,
          y: parseFloat(parts[1]) || 0,
          width: parseFloat(parts[2]) || 0,
          height: parseFloat(parts[3]) || 0,
        });
      }
    } else if (line.startsWith("ENEMY|")) {
      const parts = line.substring(6).split("|");
      if (parts.length >= 4) {
        enemies.set(parts[0], {
          id: parts[0],
          x: parseFloat(parts[1]) || 0,
          y: parseFloat(parts[2]) || 0,
          state: parts[3],
        });
      }
    } else if (line.startsWith("PHYSICS|")) {
      const parts = line.substring(8).split("|");
      if (parts.length >= 2) {
        physics[parts[0]] = parseFloat(parts[1]) || 0;
      }
    } else if (line.startsWith("TRANSITION|")) {
      const parts = line.substring(11).split("|");
      if (parts.length >= 3) {
        transitions.push({
          from: parts[0],
          to: parts[1],
          condition: parts[2],
        });
      }
    } else if (line.startsWith("GAME_MESSAGE|")) {
      message += line.substring(13) + "\n";
    } else if (line === "LEVEL_COMPLETE") {
      levelComplete = true;
      if (frames.length > 0) {
        frames[frames.length - 1].levelComplete = true;
      }
    }
  }

  // If no PLAYER frames but we have data, create one
  if (frames.length === 0 && (platforms.length > 0 || message || levelComplete)) {
    frames.push({
      player,
      platforms,
      enemies: Array.from(enemies.values()),
      transitions,
      physics,
      message,
      levelComplete,
    });
  }

  return frames;
}
