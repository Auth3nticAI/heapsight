import type { GameFrame } from "@/types/game";

export function parseGameOutput(output: string): GameFrame {
  const frame: GameFrame = {
    entities: [],
    score: 0,
    message: "",
    gameOver: false,
  };

  const lines = output.trim().split("\n");

  for (const line of lines) {
    if (line.startsWith("ENTITY|")) {
      const parts = line.substring(7).split("|");
      if (parts.length >= 6) {
        frame.entities.push({
          id: parts[0],
          type: parts[1],
          x: parseFloat(parts[2]) || 0,
          y: parseFloat(parts[3]) || 0,
          width: parseFloat(parts[4]) || 10,
          height: parseFloat(parts[5]) || 10,
          health: parts[6] ? parseFloat(parts[6]) : undefined,
        });
      }
    } else if (line.startsWith("GAME_MESSAGE|")) {
      frame.message += line.substring(13) + "\n";
    } else if (line.startsWith("SCORE|")) {
      frame.score = parseInt(line.substring(6)) || 0;
    } else if (line.startsWith("GAME_OVER")) {
      frame.gameOver = true;
    }
  }

  return frame;
}
