// Simple deterministic seeded RNG
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export interface Entity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  health: number;
  alive: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export type GamePhase = "playing" | "crashing" | "frozen";

export interface GameState {
  player: Entity;
  enemies: Entity[];
  bullets: Entity[];
  particles: Particle[];
  targetLock: Entity | null;
  targetLockStale: boolean; // true when targetLock points to dead entity
  elapsed: number;
  phase: GamePhase;
  crashProgress: number; // 0-1 during crash effect
  nextEnemySpawn: number;
  nextBulletTime: number;
  nextEntityId: number;
  rng: () => number;
}

const CANVAS_W = 400;
const CANVAS_H = 600;
const CRASH_TIME = 6.0;
const CRASH_DURATION = 2.0;
const TOTAL_CYCLE = CRASH_TIME + CRASH_DURATION;

export function createGameState(): GameState {
  const rng = seededRandom(42);
  return {
    player: {
      id: 0,
      x: CANVAS_W / 2,
      y: CANVAS_H - 60,
      vx: 0,
      vy: 0,
      width: 30,
      height: 30,
      health: 100,
      alive: true,
    },
    enemies: [],
    bullets: [],
    particles: [],
    targetLock: null,
    targetLockStale: false,
    elapsed: 0,
    phase: "playing",
    crashProgress: 0,
    nextEnemySpawn: 0.5,
    nextBulletTime: 0.3,
    nextEntityId: 1,
    rng,
  };
}

export function updateGameState(
  state: GameState,
  dt: number,
  isFixed: boolean
): void {
  if (state.phase === "frozen") {
    state.crashProgress += dt / CRASH_DURATION;
    if (state.crashProgress >= 1) {
      // Reset the loop
      const newState = createGameState();
      Object.assign(state, newState);
    }
    return;
  }

  if (state.phase === "crashing") {
    state.crashProgress += dt / CRASH_DURATION;
    if (state.crashProgress >= 1) {
      state.phase = "frozen";
      state.crashProgress = 0;
    }
    return;
  }

  // --- PLAYING phase ---
  state.elapsed += dt;

  // Spawn enemies
  if (state.elapsed >= state.nextEnemySpawn) {
    const x = 40 + state.rng() * (CANVAS_W - 80);
    const enemy: Entity = {
      id: state.nextEntityId++,
      x,
      y: -20,
      vx: (state.rng() - 0.5) * 40,
      vy: 60 + state.rng() * 40,
      width: 24,
      height: 24,
      health: 1,
      alive: true,
    };
    state.enemies.push(enemy);

    // Set targetLock to this enemy around T=3.5s
    if (state.elapsed >= 3.5 && !state.targetLock) {
      state.targetLock = enemy;
    }

    state.nextEnemySpawn = state.elapsed + 0.8 + state.rng() * 0.7;
  }

  // Auto-fire bullets
  if (state.elapsed >= state.nextBulletTime) {
    const bullet: Entity = {
      id: state.nextEntityId++,
      x: state.player.x,
      y: state.player.y - 15,
      vx: 0,
      vy: -350,
      width: 4,
      height: 12,
      health: 1,
      alive: true,
    };
    state.bullets.push(bullet);
    state.nextBulletTime = state.elapsed + 0.3;
  }

  // Move player (auto-pilot: track nearest enemy)
  const nearestEnemy = state.enemies
    .filter((e) => e.alive)
    .reduce<Entity | null>((nearest, e) => {
      if (!nearest) return e;
      const dCur = Math.abs(nearest.x - state.player.x);
      const dNew = Math.abs(e.x - state.player.x);
      return dNew < dCur ? e : nearest;
    }, null);

  if (nearestEnemy) {
    const dx = nearestEnemy.x - state.player.x;
    state.player.vx = Math.sign(dx) * Math.min(Math.abs(dx) * 3, 200);
  } else {
    state.player.vx *= 0.9;
  }

  state.player.x += state.player.vx * dt;
  state.player.x = Math.max(20, Math.min(CANVAS_W - 20, state.player.x));

  // Move enemies
  for (const e of state.enemies) {
    if (!e.alive) continue;
    e.x += e.vx * dt;
    e.y += e.vy * dt;

    // Bounce off walls
    if (e.x < 10 || e.x > CANVAS_W - 10) e.vx *= -1;

    // Remove if off screen
    if (e.y > CANVAS_H + 30) e.alive = false;
  }

  // Move bullets
  for (const b of state.bullets) {
    if (!b.alive) continue;
    b.y += b.vy * dt;
    if (b.y < -20) b.alive = false;
  }

  // Collision detection: bullets vs enemies
  for (const b of state.bullets) {
    if (!b.alive) continue;
    for (const e of state.enemies) {
      if (!e.alive) continue;
      if (
        Math.abs(b.x - e.x) < (b.width + e.width) / 2 &&
        Math.abs(b.y - e.y) < (b.height + e.height) / 2
      ) {
        b.alive = false;
        e.health -= 1;
        if (e.health <= 0) {
          e.alive = false;

          // Spawn explosion particles
          for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = 80 + state.rng() * 60;
            state.particles.push({
              x: e.x,
              y: e.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 0.6,
              maxLife: 0.6,
              color: state.rng() > 0.5 ? "#ff0040" : "#ffaa00",
              size: 3 + state.rng() * 4,
            });
          }

          // Handle targetLock clearing
          if (isFixed && state.targetLock === e) {
            state.targetLock = null;
          }
          // In buggy mode: targetLock still references the dead entity
          if (!isFixed && state.targetLock === e) {
            state.targetLockStale = true;
          }
        }
        break;
      }
    }
  }

  // Clean up dead entities
  state.enemies = state.enemies.filter((e) => e.alive);
  state.bullets = state.bullets.filter((b) => b.alive);

  // Update particles
  for (const p of state.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    p.vy += 120 * dt; // gravity
  }
  state.particles = state.particles.filter((p) => p.life > 0);

  // THE BUG: try to access targetLock after it's been freed
  if (!isFixed && state.elapsed >= CRASH_TIME && state.targetLockStale) {
    // Simulate crash!
    state.phase = "crashing";
    state.crashProgress = 0;
    return;
  }
}

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  const w = CANVAS_W;
  const h = CANVAS_H;

  // Clear
  ctx.fillStyle = "#040B10";
  ctx.fillRect(0, 0, w, h);

  if (state.phase === "crashing" || state.phase === "frozen") {
    renderCrashEffect(ctx, state, w, h);
    return;
  }

  // Star field background
  ctx.fillStyle = "#ffffff15";
  const rng2 = seededRandom(7);
  for (let i = 0; i < 40; i++) {
    const sx = rng2() * w;
    const sy = (rng2() * h + state.elapsed * 20) % h;
    ctx.fillRect(sx, sy, 1.5, 1.5);
  }

  // Draw player ship (triangle)
  ctx.fillStyle = "#00ff88";
  ctx.beginPath();
  ctx.moveTo(state.player.x, state.player.y - 15);
  ctx.lineTo(state.player.x - 12, state.player.y + 10);
  ctx.lineTo(state.player.x + 12, state.player.y + 10);
  ctx.closePath();
  ctx.fill();

  // Engine glow
  ctx.fillStyle = "#00ff8844";
  ctx.beginPath();
  ctx.arc(state.player.x, state.player.y + 12, 6, 0, Math.PI * 2);
  ctx.fill();

  // Draw enemies
  for (const e of state.enemies) {
    if (!e.alive) continue;
    ctx.fillStyle = "#ff0040";
    ctx.fillRect(e.x - e.width / 2, e.y - e.height / 2, e.width, e.height);

    // Target lock indicator
    if (state.targetLock === e) {
      ctx.strokeStyle = "#ffaa00";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        e.x - e.width / 2 - 4,
        e.y - e.height / 2 - 4,
        e.width + 8,
        e.height + 8
      );

      // "LOCKED" text
      ctx.fillStyle = "#ffaa00";
      ctx.font = "9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("LOCKED", e.x, e.y - e.height / 2 - 8);
    }
  }

  // Draw bullets
  ctx.fillStyle = "#00ff88";
  for (const b of state.bullets) {
    if (!b.alive) continue;
    ctx.fillRect(b.x - b.width / 2, b.y - b.height / 2, b.width, b.height);
  }

  // Draw particles
  for (const p of state.particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // HUD
  ctx.fillStyle = "#e0e0e080";
  ctx.font = "11px monospace";
  ctx.textAlign = "left";
  ctx.fillText(`T+${state.elapsed.toFixed(1)}s`, 10, 20);
  ctx.fillText(`Enemies: ${state.enemies.length}`, 10, 36);

  if (state.targetLock) {
    ctx.fillStyle = state.targetLockStale ? "#ff0040" : "#ffaa00";
    ctx.fillText(
      state.targetLockStale ? "targetLock: STALE!" : "targetLock: active",
      10,
      52
    );
  }
}

function renderCrashEffect(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  w: number,
  h: number
): void {
  const p = state.crashProgress;
  const rng = seededRandom(Math.floor(p * 1000));

  // Phase 1: Screen tear (0 - 0.3)
  if (p < 0.3) {
    const intensity = p / 0.3;
    ctx.fillStyle = "#040B10";
    ctx.fillRect(0, 0, w, h);

    // Horizontal tears
    for (let y = 0; y < h; y += 4) {
      const offset = (rng() - 0.5) * 60 * intensity;
      ctx.fillStyle = rng() > 0.7 ? "#ff004040" : "#12121a";
      ctx.fillRect(offset, y, w, 3);
    }
  }

  // Phase 2: Pixel noise (0.3 - 0.6)
  if (p >= 0.3 && p < 0.6) {
    for (let i = 0; i < 200; i++) {
      const x = rng() * w;
      const y = rng() * h;
      const s = 2 + rng() * 8;
      const colors = ["#ff0040", "#00ff88", "#ffaa00", "#040B10", "#ffffff"];
      ctx.fillStyle = colors[Math.floor(rng() * colors.length)];
      ctx.fillRect(x, y, s, s);
    }
  }

  // Phase 3: SEGFAULT overlay (0.4+)
  if (p >= 0.4) {
    const alpha = Math.min((p - 0.4) / 0.2, 1);
    ctx.fillStyle = `rgba(10, 10, 15, ${alpha * 0.85})`;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = `rgba(255, 0, 64, ${alpha})`;
    ctx.font = "bold 36px monospace";
    ctx.textAlign = "center";
    ctx.fillText("SEGFAULT", w / 2, h / 2 - 30);

    ctx.fillStyle = `rgba(255, 170, 0, ${alpha * 0.8})`;
    ctx.font = "14px monospace";
    ctx.fillText("Signal 11: use-after-free", w / 2, h / 2 + 10);
    ctx.fillText("targetLock->position", w / 2, h / 2 + 32);

    // Blinking cursor
    if (Math.floor(state.crashProgress * 4) % 2 === 0) {
      ctx.fillStyle = `rgba(255, 0, 64, ${alpha})`;
      ctx.fillRect(w / 2 + 90, h / 2 + 20, 8, 16);
    }
  }
}

export { CANVAS_W, CANVAS_H, CRASH_TIME, TOTAL_CYCLE };
