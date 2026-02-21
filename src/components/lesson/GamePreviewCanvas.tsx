"use client";

import { useEffect, useRef } from "react";
import { useLessonStore } from "@/store/lesson-store";

const ENTITY_COLORS: Record<string, string> = {
  player: "#00ff88",
  enemy: "#ff0040",
  projectile: "#ffaa00",
  platform: "#555555",
  item: "#6366f1",
  npc: "#00aaff",
};

export default function GamePreviewCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameFrame = useLessonStore((s) => s.gameFrame);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!gameFrame) {
      // Empty state
      ctx.fillStyle = "#333";
      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.fillText("Run your code to see the game", canvas.width / 2, canvas.height / 2);
      ctx.textAlign = "start";
      return;
    }

    // Draw grid
    ctx.strokeStyle = "#071528";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw entities
    for (const entity of gameFrame.entities) {
      const color = ENTITY_COLORS[entity.type] || "#ffffff";

      // Entity body
      ctx.fillStyle = color;
      if (entity.type === "player") {
        // Triangle for player
        ctx.beginPath();
        ctx.moveTo(entity.x + entity.width / 2, entity.y);
        ctx.lineTo(entity.x, entity.y + entity.height);
        ctx.lineTo(entity.x + entity.width, entity.y + entity.height);
        ctx.closePath();
        ctx.fill();
      } else if (entity.type === "projectile") {
        // Circle for projectile
        ctx.beginPath();
        ctx.arc(
          entity.x + entity.width / 2,
          entity.y + entity.height / 2,
          entity.width / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      } else {
        ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
      }

      // Health bar
      if (entity.health !== undefined && entity.health > 0) {
        const barWidth = entity.width;
        const barHeight = 3;
        const barY = entity.y - 6;
        ctx.fillStyle = "#ff0040";
        ctx.fillRect(entity.x, barY, barWidth, barHeight);
        ctx.fillStyle = "#00ff88";
        ctx.fillRect(entity.x, barY, (entity.health / 100) * barWidth, barHeight);
      }

      // Label
      ctx.fillStyle = "#888";
      ctx.font = "8px monospace";
      ctx.fillText(entity.id, entity.x, entity.y - 8);
    }

    // Score
    if (gameFrame.score > 0) {
      ctx.fillStyle = "#00ff88";
      ctx.font = "14px monospace";
      ctx.fillText(`Score: ${gameFrame.score}`, 10, 20);
    }

    // Messages
    if (gameFrame.message) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "13px monospace";
      const lines = gameFrame.message.trim().split("\n");
      const startY = gameFrame.entities.length > 0 ? canvas.height - lines.length * 18 - 10 : 60;
      lines.forEach((line, i) => {
        ctx.fillText(line, 10, startY + i * 18);
      });
    }

    // Game over overlay
    if (gameFrame.gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ff0040";
      ctx.font = "bold 20px monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
      ctx.textAlign = "start";
    }
  }, [gameFrame]);

  return (
    <div className="h-full flex flex-col rounded-lg border border-[#2e2e42] bg-surface overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#16162e] border-b border-[#2e2e42]">
        <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">
          Game Preview
        </span>
        {gameFrame && gameFrame.entities.length > 0 && (
          <span className="text-[10px] font-mono text-primary">
            {gameFrame.entities.length} entities
          </span>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={380}
          height={280}
          className="border border-[#2e2e42] rounded max-w-full h-auto"
          aria-label="Game preview showing entity positions and states"
          role="img"
        />
      </div>
    </div>
  );
}
