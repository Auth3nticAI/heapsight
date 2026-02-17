/**
 * Space Shooter Path Protocol — Entity Component System (ECS)
 *
 * Paradigm: Data-oriented design, composition over inheritance
 *
 * Protocol lines:
 *   ENTITY|id|type|x|y                    → create entity with Position
 *   COMPONENT|entity_id|Velocity|vx|vy    → attach Velocity component
 *   COMPONENT|entity_id|Health|hp         → attach Health component
 *   COMPONENT|entity_id|Sprite|name       → attach Sprite component
 *   SYSTEM|SystemName|update              → run a system (snapshots frame)
 *   EVENT|type|data...                    → game event
 *   SCORE|value                           → update score
 *   GAME_MESSAGE|text                     → display message
 *   GAME_OVER                             → end
 */

export interface ECSComponent {
  type: string;
  data: Record<string, number | string>;
}

export interface ECSEntity {
  id: string;
  type: string;
  components: Record<string, Record<string, number | string>>;
}

export interface SpaceShooterFrame {
  entities: ECSEntity[];
  events: Array<{ type: string; data: string[] }>;
  score: number;
  message: string;
  gameOver: boolean;
}

export function parseSpaceShooterOutput(output: string): SpaceShooterFrame[] {
  const lines = output.trim().split("\n");
  const frames: SpaceShooterFrame[] = [];

  const entities = new Map<string, ECSEntity>();
  let score = 0;
  let message = "";
  let gameOver = false;
  const events: Array<{ type: string; data: string[] }> = [];

  for (const line of lines) {
    if (line.startsWith("ENTITY|")) {
      const parts = line.substring(7).split("|");
      if (parts.length >= 4) {
        const [id, type, x, y] = parts;
        entities.set(id, {
          id,
          type,
          components: {
            Position: { x: parseFloat(x) || 0, y: parseFloat(y) || 0 },
          },
        });
      }
    } else if (line.startsWith("COMPONENT|")) {
      const parts = line.substring(10).split("|");
      const [entityId, compType, ...values] = parts;
      const entity = entities.get(entityId);
      if (entity && compType) {
        if (compType === "Velocity" && values.length >= 2) {
          entity.components.Velocity = {
            vx: parseFloat(values[0]) || 0,
            vy: parseFloat(values[1]) || 0,
          };
        } else if (compType === "Health" && values.length >= 1) {
          entity.components.Health = { hp: parseFloat(values[0]) || 0 };
        } else if (compType === "Sprite" && values.length >= 1) {
          entity.components.Sprite = { name: values[0] };
        } else {
          // Generic component
          const data: Record<string, number | string> = {};
          values.forEach((v, i) => {
            const num = parseFloat(v);
            data[`v${i}`] = isNaN(num) ? v : num;
          });
          entity.components[compType] = data;
        }
      }
    } else if (line.startsWith("SYSTEM|")) {
      // System tick → snapshot a frame
      frames.push({
        entities: Array.from(entities.values()).map((e) => ({
          ...e,
          components: { ...e.components },
        })),
        events: [...events],
        score,
        message,
        gameOver,
      });
      events.length = 0;
    } else if (line.startsWith("EVENT|")) {
      const parts = line.substring(6).split("|");
      events.push({ type: parts[0], data: parts.slice(1) });
    } else if (line.startsWith("SCORE|")) {
      score = parseInt(line.substring(6)) || 0;
    } else if (line.startsWith("GAME_MESSAGE|")) {
      message += line.substring(13) + "\n";
    } else if (line === "GAME_OVER") {
      gameOver = true;
    }
  }

  // Final frame if we have entities but no trailing SYSTEM
  if (entities.size > 0 && (frames.length === 0 || events.length > 0 || gameOver)) {
    frames.push({
      entities: Array.from(entities.values()),
      events: [...events],
      score,
      message,
      gameOver,
    });
  }

  return frames;
}
