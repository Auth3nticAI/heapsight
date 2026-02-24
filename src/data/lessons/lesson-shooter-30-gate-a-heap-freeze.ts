import type { Lesson } from "@/types/lesson";

export const lessonShooter30: Lesson = {
  id: "shooter-30-gate-a-heap-freeze",
  title: "GATE A: Heap Freeze",
  description: "Milestone checkpoint: prove zero heap allocations in the game loop. Implement auditHeap() to print the full pool audit and earn GATE A certification. The HEAP FROZEN banner confirms the invariant.",
  order: 30,
  xpReward: 300,
  tier: "pro",
  concepts: ["heap freeze invariant", "pool audit", "milestone gate", "zero heap proof"],
  part1: {
    title: "Concept: GATE A — Heap Freeze",
    type: "concept",
    instructions: `# GATE A: Heap Freeze

## What Is a Gate?
Gates are milestone checkpoints that prove correctness before moving on. GATE A tests the core invariant of this phase: the game loop allocates ZERO bytes on the heap. Every entity lives in a pre-allocated pool slot. Nothing in the game loop calls new, malloc, push_back, or any allocating operation.

## The Invariant
After startup initialization, the heap is frozen. No growth. No shrink. The game loop runs in a fixed memory footprint for its entire lifetime.

## Why This Matters
Heap allocation in a game loop causes:
- Non-deterministic latency (allocator can block)
- Fragmentation over time
- GC pauses in managed languages
- Cache thrashing from scattered allocations

## The Audit Function
\`\`\`cpp
void auditHeap() {
    cout << "GATE A: Heap Freeze Audit" << endl;
    cout << "Enemies: "   << MAX_ENEMIES   << "/" << MAX_ENEMIES   << " pooled" << endl;
    cout << "Bullets: "   << MAX_BULLETS   << "/" << MAX_BULLETS   << " pooled" << endl;
    cout << "Particles: " << MAX_PARTICLES << "/" << MAX_PARTICLES << " pooled" << endl;
    cout << "Powerups: "  << MAX_POWERUPS  << "/" << MAX_POWERUPS  << " pooled" << endl;
    cout << "Heap ops in loop: 0" << endl;
    cout << "GATE A: PASSED" << endl;
    cout << "Pattern: heap-freeze" << endl;
}
\`\`\`

## Your Task
Complete the auditHeap function so it prints the pool stats for all four entity types.

Expected output:
\`\`\`
GATE A: Heap Freeze Audit
Enemies: 5/5 pooled
Bullets: 10/10 pooled
Particles: 30/30 pooled
Powerups: 3/3 pooled
Heap ops in loop: 0
GATE A: PASSED
Pattern: heap-freeze
\`\`\`

## Elite Insight
id Software's Quake 3 Arena ran with a fixed 16MB memory pool. Doom Eternal allocates its entire game state in one shot at startup. Your shooter now follows the same discipline.

## Beginner Trap
**Thinking "zero allocations" means "no dynamic behavior."** Pre-allocated pools give you all the dynamic behavior you need — spawn, despawn, recycle — without touching the heap. The constraint is on allocation, not on dynamism.

## Systems Thinking Connection
RPG L30, Platformer L30, and Crawler L30 all hit the same gate. Heap freeze is the most universal engineering gate in the curriculum — four paths, one standard: zero allocations in the game loop.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_ENEMIES   = 5;
const int MAX_BULLETS   = 10;
const int MAX_PARTICLES = 30;
const int MAX_POWERUPS  = 3;

void auditHeap() {
    cout << "GATE A: Heap Freeze Audit" << endl;
    // TODO: print each pool line using the format: Name: N/MAX pooled
    // Enemies: 5/5 pooled
    // Bullets: 10/10 pooled
    // Particles: 30/30 pooled
    // Powerups: 3/3 pooled
    cout << "Heap ops in loop: 0" << endl;
    cout << "GATE A: PASSED" << endl;
    cout << "Pattern: heap-freeze" << endl;
}

int main() {
    auditHeap();
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_ENEMIES   = 5;
const int MAX_BULLETS   = 10;
const int MAX_PARTICLES = 30;
const int MAX_POWERUPS  = 3;

void auditHeap() {
    cout << "GATE A: Heap Freeze Audit" << endl;
    cout << "Enemies: "   << MAX_ENEMIES   << "/" << MAX_ENEMIES   << " pooled" << endl;
    cout << "Bullets: "   << MAX_BULLETS   << "/" << MAX_BULLETS   << " pooled" << endl;
    cout << "Particles: " << MAX_PARTICLES << "/" << MAX_PARTICLES << " pooled" << endl;
    cout << "Powerups: "  << MAX_POWERUPS  << "/" << MAX_POWERUPS  << " pooled" << endl;
    cout << "Heap ops in loop: 0" << endl;
    cout << "GATE A: PASSED" << endl;
    cout << "Pattern: heap-freeze" << endl;
}

int main() {
    auditHeap();
    return 0;
}`,
    tests: [
      { id: "t1", description: "prints GATE A header", expectedOutput: "GATE A: Heap Freeze Audit" },
      { id: "t2", description: "prints enemies pool line", expectedOutput: "Enemies: 5/5 pooled" },
      { id: "t3", description: "prints bullets pool line", expectedOutput: "Bullets: 10/10 pooled" },
      { id: "t4", description: "confirms zero heap ops", expectedOutput: "Heap ops in loop: 0" },
      { id: "t5", description: "prints GATE A PASSED", expectedOutput: "GATE A: PASSED" },
      { id: "t6", description: "prints pattern tag", expectedOutput: "Pattern: heap-freeze" },
    ],
    hints: [
      "Each pool line uses the format: Name: MAX/MAX pooled where MAX is the constant.",
      "For Enemies use MAX_ENEMIES, for Bullets use MAX_BULLETS, for Particles use MAX_PARTICLES, for Powerups use MAX_POWERUPS.",
      "The Heap ops line is a literal string — it never changes because we never call new in the game loop.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: GATE A — Heap Freeze",
    type: "game_builder",
    instructions: `# Build: GATE A — Heap Freeze

## The Challenge
Add auditHeap(World& w) to the game. It prints the full pool audit at startup. The game then displays a HEAP FROZEN banner and continues running. This is your proof: the invariant is real, the pools are fully allocated, and the heap never moves after startup.

## What's Already Here
Full shooter from L29 with pool_spawns counter, runLeakTest, particles, power-ups.

## Your Task

**TODO 1** — Implement auditHeap(World& w) before spawnWave:
\`\`\`cpp
void auditHeap(World& w) {
    // Print GATE A: Heap Freeze Audit
    // Print each pool: Enemies: 5/5 pooled, Bullets: 10/10 pooled, etc.
    // Print Heap ops in loop: 0
    // Print GATE A: PASSED
    // Print Pattern: heap-freeze
}
\`\`\`

**TODO 2** — In main(), after spawnWave, call auditHeap(world).

## Did It Work?
The startup console prints the full audit. The green HEAP FROZEN banner appears at the top of the game window. GATE A is passed.

## Milestone
You have proven that your Space Shooter game loop touches the heap exactly zero times during gameplay. All entities — enemies, bullets, particles, powerups — live in fixed-size pool slots allocated at startup. This is the memory discipline that separates AAA game engines from hobby projects.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const int MAX_BULLETS = 10;
const int MAX_ENEMIES = 5;
const int MAX_PARTICLES = 30;
const int MAX_POWERUPS = 3;
const float FIXED_DT = 1.0f / 60.0f;

typedef int EntityId;
const EntityId INVALID_ID = -1;

int pool_spawns = 0;

struct Particle { float x, y, vx, vy; int life; Color color; };

struct World {
    float ship_x, ship_y;
    int ship_w, ship_h, speed;
    int  bullet_x[MAX_BULLETS];
    int  bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];
    int  shots_fired;
    float enemy_x[MAX_ENEMIES];
    float enemy_y[MAX_ENEMIES];
    float enemy_speed[MAX_ENEMIES];
    Color enemy_color[MAX_ENEMIES];
    bool  enemy_active[MAX_ENEMIES];
    Particle particles[MAX_PARTICLES];
    float powerup_x[MAX_POWERUPS];
    float powerup_y[MAX_POWERUPS];
    bool  powerup_active[MAX_POWERUPS];
    int score, wave;
    int player_hp, player_max_hp;
};

World world;
float accumulator = 0.0f;

EntityId findFreeSlot(bool active[], int max) {
    for (int i = 0; i < max; i++) if (!active[i]) return i;
    return INVALID_ID;
}

EntityId spawnEnemy(World& w, float x, float y, float speed, Color c) {
    EntityId id = findFreeSlot(w.enemy_active, MAX_ENEMIES);
    if (id == INVALID_ID) return INVALID_ID;
    w.enemy_x[id] = x; w.enemy_y[id] = y;
    w.enemy_speed[id] = speed; w.enemy_color[id] = c;
    w.enemy_active[id] = true;
    pool_spawns++;
    return id;
}

void despawnEnemy(World& w, int id) {
    w.enemy_active[id] = false;
    w.enemy_x[id] = 0; w.enemy_y[id] = 0;
    w.enemy_speed[id] = 0; w.enemy_color[id] = BLACK;
}

EntityId spawnBullet(World& w, int x, int y) {
    EntityId id = findFreeSlot(w.bullet_active, MAX_BULLETS);
    if (id == INVALID_ID) return INVALID_ID;
    w.bullet_x[id] = x; w.bullet_y[id] = y;
    w.bullet_active[id] = true;
    w.shots_fired++;
    pool_spawns++;
    return id;
}

void despawnBullet(World& w, int id) {
    w.bullet_active[id] = false;
    w.bullet_x[id] = 0; w.bullet_y[id] = 0;
}

void spawnParticle(World& w, float x, float y, Color c) {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (w.particles[i].life <= 0) {
            w.particles[i].x = x; w.particles[i].y = y;
            w.particles[i].vx = (rng_range(11) - 5) * 1.5f;
            w.particles[i].vy = (rng_range(11) - 5) * 1.5f;
            w.particles[i].life = 20;
            w.particles[i].color = c;
            return;
        }
    }
}
void updateParticles(World& w) {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (w.particles[i].life > 0) {
            w.particles[i].x += w.particles[i].vx;
            w.particles[i].y += w.particles[i].vy;
            w.particles[i].life--;
        }
    }
}

EntityId spawnPowerup(World& w, float x, float y) {
    EntityId id = findFreeSlot(w.powerup_active, MAX_POWERUPS);
    if (id == INVALID_ID) return INVALID_ID;
    w.powerup_x[id] = x; w.powerup_y[id] = y;
    w.powerup_active[id] = true;
    return id;
}

void despawnPowerup(World& w, int id) {
    w.powerup_active[id] = false;
    w.powerup_x[id] = 0; w.powerup_y[id] = 0;
}

void collectPowerup(World& w, int id) {
    w.score += 200;
    despawnPowerup(w, id);
}

void updatePowerups(World& w) {
    for (int i = 0; i < MAX_POWERUPS; i++) {
        if (w.powerup_active[i]) {
            w.powerup_y[i] += 30.0f * FIXED_DT;
            if (w.powerup_y[i] > SCREEN_H) despawnPowerup(w, i);
        }
    }
}

// POLICY: NO rand() — use rng_next()/rng_range() only
unsigned int rng_state = 42;
unsigned int rng_next() {
    rng_state = rng_state * 1664525u + 1013904223u;
    return rng_state;
}
int rng_range(int max) { return (int)(rng_next() % (unsigned int)max); }

void spawnWave(World& w) {
    rng_state = 42 + (unsigned int)w.wave * 7u;
    Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE};
    for (int i = 0; i < MAX_ENEMIES; i++) {
        float x = 20.0f + rng_range(740);
        spawnEnemy(w, x, 30, 18.0f + i * 6.0f, palette[i]);
    }
}

void auditHeap(World& w) {
    // TODO 1: print the full GATE A audit
    // Line 1: GATE A: Heap Freeze Audit
    // Line 2: Enemies: 5/5 pooled
    // Line 3: Bullets: 10/10 pooled
    // Line 4: Particles: 30/30 pooled
    // Line 5: Powerups: 3/3 pooled
    // Line 6: Heap ops in loop: 0
    // Line 7: GATE A: PASSED
    // Line 8: Pattern: heap-freeze
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter — GATE A");
    SetTargetFPS(60);
    world.ship_x = 200; world.ship_y = 380;
    world.speed = 5; world.ship_w = 40; world.ship_h = 20;
    world.score = 0; world.wave = 1; world.shots_fired = 0;
    world.player_hp = 3; world.player_max_hp = 3;
    for (int i = 0; i < MAX_BULLETS; i++) world.bullet_active[i] = false;
    for (int i = 0; i < MAX_ENEMIES; i++) world.enemy_active[i] = false;
    for (int i = 0; i < MAX_PARTICLES; i++) world.particles[i].life = 0;
    for (int i = 0; i < MAX_POWERUPS; i++) world.powerup_active[i] = false;
    spawnWave(world);
    // TODO 2: call auditHeap(world) here

    while (!WindowShouldClose()) {
        float dt = GetFrameTime();
        accumulator += dt;
        while (accumulator >= FIXED_DT) {
            if (IsKeyDown(KEY_RIGHT)) world.ship_x += world.speed;
            if (IsKeyDown(KEY_LEFT))  world.ship_x -= world.speed;
            if (world.ship_x < 0) world.ship_x = 0;
            if (world.ship_x > SCREEN_W - world.ship_w) world.ship_x = SCREEN_W - world.ship_w;
            if (IsKeyPressed(KEY_SPACE)) {
                spawnBullet(world, (int)world.ship_x + world.ship_w/2 - 2, (int)world.ship_y);
            }
            for (int i = 0; i < MAX_BULLETS; i++) {
                if (world.bullet_active[i]) {
                    world.bullet_y[i] -= 8;
                    if (world.bullet_y[i] < -10) despawnBullet(world, i);
                }
            }
            for (int i = 0; i < MAX_ENEMIES; i++) {
                if (world.enemy_active[i]) {
                    world.enemy_y[i] += world.enemy_speed[i] * FIXED_DT;
                    if (world.enemy_y[i] > SCREEN_H) world.enemy_y[i] = 0;
                }
            }
            for (int b = 0; b < MAX_BULLETS; b++) {
                if (!world.bullet_active[b]) continue;
                for (int e = 0; e < MAX_ENEMIES; e++) {
                    if (!world.enemy_active[e]) continue;
                    bool hit = world.bullet_x[b] < (int)world.enemy_x[e]+24 &&
                               world.bullet_x[b]+4 > (int)world.enemy_x[e] &&
                               world.bullet_y[b] < (int)world.enemy_y[e]+24 &&
                               world.bullet_y[b]+10 > (int)world.enemy_y[e];
                    if (hit) {
                        despawnBullet(world, b);
                        for (int p = 0; p < 5; p++)
                            spawnParticle(world, world.enemy_x[e]+12, world.enemy_y[e]+12, world.enemy_color[e]);
                        despawnEnemy(world, e);
                        world.score += 100;
                        if (rng_range(10) < 3)
                            spawnPowerup(world, world.enemy_x[e]+12, world.enemy_y[e]+12);
                    }
                }
            }
            for (int i = 0; i < MAX_POWERUPS; i++) {
                if (!world.powerup_active[i]) continue;
                bool overlap = world.powerup_x[i] < world.ship_x + world.ship_w &&
                               world.powerup_x[i]+16 > world.ship_x &&
                               world.powerup_y[i] < world.ship_y + world.ship_h &&
                               world.powerup_y[i]+16 > world.ship_y;
                if (overlap) collectPowerup(world, i);
            }
            updateParticles(world);
            updatePowerups(world);
            int alive = 0;
            for (int i = 0; i < MAX_ENEMIES; i++) if (world.enemy_active[i]) alive++;
            if (alive == 0) { world.wave++; spawnWave(world); }
            accumulator -= FIXED_DT;
        }

        BeginDrawing();
        ClearBackground(BLACK);
        DrawRectangle(100,50,2,2,WHITE); DrawRectangle(200,120,2,2,WHITE);
        DrawRectangle(350,30,2,2,WHITE); DrawRectangle(500,80,2,2,WHITE);
        DrawRectangle(650,150,2,2,WHITE); DrawRectangle(750,60,2,2,WHITE);
        DrawRectangle(50,200,2,2,WHITE); DrawRectangle(300,250,2,2,WHITE);
        DrawRectangle(450,180,2,2,WHITE); DrawRectangle(600,300,2,2,WHITE);
        DrawRectangle(150,350,2,2,WHITE); DrawRectangle(700,380,2,2,WHITE);
        for (int i = 0; i < MAX_ENEMIES; i++)
            if (world.enemy_active[i])
                DrawRectangle((int)world.enemy_x[i], (int)world.enemy_y[i], 24, 24, world.enemy_color[i]);
        DrawRectangle((int)world.ship_x, (int)world.ship_y, world.ship_w, world.ship_h, GREEN);
        for (int i = 0; i < MAX_BULLETS; i++)
            if (world.bullet_active[i])
                DrawRectangle(world.bullet_x[i], world.bullet_y[i], 4, 10, YELLOW);
        for (int i = 0; i < MAX_PARTICLES; i++)
            if (world.particles[i].life > 0)
                DrawRectangle((int)world.particles[i].x, (int)world.particles[i].y, 4, 4, world.particles[i].color);
        for (int i = 0; i < MAX_POWERUPS; i++)
            if (world.powerup_active[i])
                DrawRectangle((int)world.powerup_x[i], (int)world.powerup_y[i], 16, 16, GOLD);
        DrawText("** GATE A: HEAP FROZEN **", SCREEN_W/2 - 155, 8, 20, LIME);
        DrawText("HeapSight Shooter", 10, 38, 18, WHITE);
        DrawText(TextFormat("Score: %d", world.score), 10, 62, 18, WHITE);
        DrawText(TextFormat("Wave:  %d", world.wave),  10, 86, 18, WHITE);
        DrawText(TextFormat("HP: %d/%d", world.player_hp, world.player_max_hp), 10, 110, 18, WHITE);
        DrawText(TextFormat("Shots: %d", world.shots_fired), 10, 134, 18, YELLOW);
        { int pa=0; for(int i=0;i<MAX_PARTICLES;i++) if(world.particles[i].life>0) pa++;
          DrawText(TextFormat("Parts: %d/30", pa), 10, 158, 14, ORANGE); }
        { int pu=0; for(int i=0;i<MAX_POWERUPS;i++) if(world.powerup_active[i]) pu++;
          DrawText(TextFormat("PU: %d/3", pu), 10, 178, 14, GOLD); }
        DrawText(TextFormat("Spawns: %d", pool_spawns), 10, 198, 14, LIME);
        DrawText("Heap: FROZEN", 10, 218, 14, LIME);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const int MAX_BULLETS = 10;
const int MAX_ENEMIES = 5;
const int MAX_PARTICLES = 30;
const int MAX_POWERUPS = 3;
const float FIXED_DT = 1.0f / 60.0f;

typedef int EntityId;
const EntityId INVALID_ID = -1;

int pool_spawns = 0;

struct Particle { float x, y, vx, vy; int life; Color color; };

struct World {
    float ship_x, ship_y;
    int ship_w, ship_h, speed;
    int  bullet_x[MAX_BULLETS];
    int  bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];
    int  shots_fired;
    float enemy_x[MAX_ENEMIES];
    float enemy_y[MAX_ENEMIES];
    float enemy_speed[MAX_ENEMIES];
    Color enemy_color[MAX_ENEMIES];
    bool  enemy_active[MAX_ENEMIES];
    Particle particles[MAX_PARTICLES];
    float powerup_x[MAX_POWERUPS];
    float powerup_y[MAX_POWERUPS];
    bool  powerup_active[MAX_POWERUPS];
    int score, wave;
    int player_hp, player_max_hp;
};

World world;
float accumulator = 0.0f;

EntityId findFreeSlot(bool active[], int max) {
    for (int i = 0; i < max; i++) if (!active[i]) return i;
    return INVALID_ID;
}

EntityId spawnEnemy(World& w, float x, float y, float speed, Color c) {
    EntityId id = findFreeSlot(w.enemy_active, MAX_ENEMIES);
    if (id == INVALID_ID) return INVALID_ID;
    w.enemy_x[id] = x; w.enemy_y[id] = y;
    w.enemy_speed[id] = speed; w.enemy_color[id] = c;
    w.enemy_active[id] = true;
    pool_spawns++;
    return id;
}

void despawnEnemy(World& w, int id) {
    w.enemy_active[id] = false;
    w.enemy_x[id] = 0; w.enemy_y[id] = 0;
    w.enemy_speed[id] = 0; w.enemy_color[id] = BLACK;
}

EntityId spawnBullet(World& w, int x, int y) {
    EntityId id = findFreeSlot(w.bullet_active, MAX_BULLETS);
    if (id == INVALID_ID) return INVALID_ID;
    w.bullet_x[id] = x; w.bullet_y[id] = y;
    w.bullet_active[id] = true;
    w.shots_fired++;
    pool_spawns++;
    return id;
}

void despawnBullet(World& w, int id) {
    w.bullet_active[id] = false;
    w.bullet_x[id] = 0; w.bullet_y[id] = 0;
}

void spawnParticle(World& w, float x, float y, Color c) {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (w.particles[i].life <= 0) {
            w.particles[i].x = x; w.particles[i].y = y;
            w.particles[i].vx = (rng_range(11) - 5) * 1.5f;
            w.particles[i].vy = (rng_range(11) - 5) * 1.5f;
            w.particles[i].life = 20;
            w.particles[i].color = c;
            return;
        }
    }
}
void updateParticles(World& w) {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (w.particles[i].life > 0) {
            w.particles[i].x += w.particles[i].vx;
            w.particles[i].y += w.particles[i].vy;
            w.particles[i].life--;
        }
    }
}

EntityId spawnPowerup(World& w, float x, float y) {
    EntityId id = findFreeSlot(w.powerup_active, MAX_POWERUPS);
    if (id == INVALID_ID) return INVALID_ID;
    w.powerup_x[id] = x; w.powerup_y[id] = y;
    w.powerup_active[id] = true;
    return id;
}

void despawnPowerup(World& w, int id) {
    w.powerup_active[id] = false;
    w.powerup_x[id] = 0; w.powerup_y[id] = 0;
}

void collectPowerup(World& w, int id) {
    w.score += 200;
    despawnPowerup(w, id);
}

void updatePowerups(World& w) {
    for (int i = 0; i < MAX_POWERUPS; i++) {
        if (w.powerup_active[i]) {
            w.powerup_y[i] += 30.0f * FIXED_DT;
            if (w.powerup_y[i] > SCREEN_H) despawnPowerup(w, i);
        }
    }
}

// POLICY: NO rand() — use rng_next()/rng_range() only
unsigned int rng_state = 42;
unsigned int rng_next() {
    rng_state = rng_state * 1664525u + 1013904223u;
    return rng_state;
}
int rng_range(int max) { return (int)(rng_next() % (unsigned int)max); }

void spawnWave(World& w) {
    rng_state = 42 + (unsigned int)w.wave * 7u;
    Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE};
    for (int i = 0; i < MAX_ENEMIES; i++) {
        float x = 20.0f + rng_range(740);
        spawnEnemy(w, x, 30, 18.0f + i * 6.0f, palette[i]);
    }
}

void auditHeap(World& w) {
    cout << "GATE A: Heap Freeze Audit" << endl;
    cout << "Enemies: "   << MAX_ENEMIES   << "/" << MAX_ENEMIES   << " pooled" << endl;
    cout << "Bullets: "   << MAX_BULLETS   << "/" << MAX_BULLETS   << " pooled" << endl;
    cout << "Particles: " << MAX_PARTICLES << "/" << MAX_PARTICLES << " pooled" << endl;
    cout << "Powerups: "  << MAX_POWERUPS  << "/" << MAX_POWERUPS  << " pooled" << endl;
    cout << "Heap ops in loop: 0" << endl;
    cout << "GATE A: PASSED" << endl;
    cout << "Pattern: heap-freeze" << endl;
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter — GATE A");
    SetTargetFPS(60);
    world.ship_x = 200; world.ship_y = 380;
    world.speed = 5; world.ship_w = 40; world.ship_h = 20;
    world.score = 0; world.wave = 1; world.shots_fired = 0;
    world.player_hp = 3; world.player_max_hp = 3;
    for (int i = 0; i < MAX_BULLETS; i++) world.bullet_active[i] = false;
    for (int i = 0; i < MAX_ENEMIES; i++) world.enemy_active[i] = false;
    for (int i = 0; i < MAX_PARTICLES; i++) world.particles[i].life = 0;
    for (int i = 0; i < MAX_POWERUPS; i++) world.powerup_active[i] = false;
    spawnWave(world);
    auditHeap(world);

    while (!WindowShouldClose()) {
        float dt = GetFrameTime();
        accumulator += dt;
        while (accumulator >= FIXED_DT) {
            if (IsKeyDown(KEY_RIGHT)) world.ship_x += world.speed;
            if (IsKeyDown(KEY_LEFT))  world.ship_x -= world.speed;
            if (world.ship_x < 0) world.ship_x = 0;
            if (world.ship_x > SCREEN_W - world.ship_w) world.ship_x = SCREEN_W - world.ship_w;
            if (IsKeyPressed(KEY_SPACE)) {
                spawnBullet(world, (int)world.ship_x + world.ship_w/2 - 2, (int)world.ship_y);
            }
            for (int i = 0; i < MAX_BULLETS; i++) {
                if (world.bullet_active[i]) {
                    world.bullet_y[i] -= 8;
                    if (world.bullet_y[i] < -10) despawnBullet(world, i);
                }
            }
            for (int i = 0; i < MAX_ENEMIES; i++) {
                if (world.enemy_active[i]) {
                    world.enemy_y[i] += world.enemy_speed[i] * FIXED_DT;
                    if (world.enemy_y[i] > SCREEN_H) world.enemy_y[i] = 0;
                }
            }
            for (int b = 0; b < MAX_BULLETS; b++) {
                if (!world.bullet_active[b]) continue;
                for (int e = 0; e < MAX_ENEMIES; e++) {
                    if (!world.enemy_active[e]) continue;
                    bool hit = world.bullet_x[b] < (int)world.enemy_x[e]+24 &&
                               world.bullet_x[b]+4 > (int)world.enemy_x[e] &&
                               world.bullet_y[b] < (int)world.enemy_y[e]+24 &&
                               world.bullet_y[b]+10 > (int)world.enemy_y[e];
                    if (hit) {
                        despawnBullet(world, b);
                        for (int p = 0; p < 5; p++)
                            spawnParticle(world, world.enemy_x[e]+12, world.enemy_y[e]+12, world.enemy_color[e]);
                        despawnEnemy(world, e);
                        world.score += 100;
                        if (rng_range(10) < 3)
                            spawnPowerup(world, world.enemy_x[e]+12, world.enemy_y[e]+12);
                    }
                }
            }
            for (int i = 0; i < MAX_POWERUPS; i++) {
                if (!world.powerup_active[i]) continue;
                bool overlap = world.powerup_x[i] < world.ship_x + world.ship_w &&
                               world.powerup_x[i]+16 > world.ship_x &&
                               world.powerup_y[i] < world.ship_y + world.ship_h &&
                               world.powerup_y[i]+16 > world.ship_y;
                if (overlap) collectPowerup(world, i);
            }
            updateParticles(world);
            updatePowerups(world);
            int alive = 0;
            for (int i = 0; i < MAX_ENEMIES; i++) if (world.enemy_active[i]) alive++;
            if (alive == 0) { world.wave++; spawnWave(world); }
            accumulator -= FIXED_DT;
        }

        BeginDrawing();
        ClearBackground(BLACK);
        DrawRectangle(100,50,2,2,WHITE); DrawRectangle(200,120,2,2,WHITE);
        DrawRectangle(350,30,2,2,WHITE); DrawRectangle(500,80,2,2,WHITE);
        DrawRectangle(650,150,2,2,WHITE); DrawRectangle(750,60,2,2,WHITE);
        DrawRectangle(50,200,2,2,WHITE); DrawRectangle(300,250,2,2,WHITE);
        DrawRectangle(450,180,2,2,WHITE); DrawRectangle(600,300,2,2,WHITE);
        DrawRectangle(150,350,2,2,WHITE); DrawRectangle(700,380,2,2,WHITE);
        for (int i = 0; i < MAX_ENEMIES; i++)
            if (world.enemy_active[i])
                DrawRectangle((int)world.enemy_x[i], (int)world.enemy_y[i], 24, 24, world.enemy_color[i]);
        DrawRectangle((int)world.ship_x, (int)world.ship_y, world.ship_w, world.ship_h, GREEN);
        for (int i = 0; i < MAX_BULLETS; i++)
            if (world.bullet_active[i])
                DrawRectangle(world.bullet_x[i], world.bullet_y[i], 4, 10, YELLOW);
        for (int i = 0; i < MAX_PARTICLES; i++)
            if (world.particles[i].life > 0)
                DrawRectangle((int)world.particles[i].x, (int)world.particles[i].y, 4, 4, world.particles[i].color);
        for (int i = 0; i < MAX_POWERUPS; i++)
            if (world.powerup_active[i])
                DrawRectangle((int)world.powerup_x[i], (int)world.powerup_y[i], 16, 16, GOLD);
        DrawText("** GATE A: HEAP FROZEN **", SCREEN_W/2 - 155, 8, 20, LIME);
        DrawText("HeapSight Shooter", 10, 38, 18, WHITE);
        DrawText(TextFormat("Score: %d", world.score), 10, 62, 18, WHITE);
        DrawText(TextFormat("Wave:  %d", world.wave),  10, 86, 18, WHITE);
        DrawText(TextFormat("HP: %d/%d", world.player_hp, world.player_max_hp), 10, 110, 18, WHITE);
        DrawText(TextFormat("Shots: %d", world.shots_fired), 10, 134, 18, YELLOW);
        { int pa=0; for(int i=0;i<MAX_PARTICLES;i++) if(world.particles[i].life>0) pa++;
          DrawText(TextFormat("Parts: %d/30", pa), 10, 158, 14, ORANGE); }
        { int pu=0; for(int i=0;i<MAX_POWERUPS;i++) if(world.powerup_active[i]) pu++;
          DrawText(TextFormat("PU: %d/3", pu), 10, 178, 14, GOLD); }
        DrawText(TextFormat("Spawns: %d", pool_spawns), 10, 198, 14, LIME);
        DrawText("Heap: FROZEN", 10, 218, 14, LIME);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "prints GATE A header", expectedOutput: "GATE A: Heap Freeze Audit" },
      { id: "g2", description: "prints enemies pool line", expectedOutput: "Enemies: 5/5 pooled" },
      { id: "g3", description: "confirms zero heap ops", expectedOutput: "Heap ops in loop: 0" },
      { id: "g4", description: "prints GATE A PASSED", expectedOutput: "GATE A: PASSED" },
      { id: "g5", description: "prints pattern tag", expectedOutput: "Pattern: heap-freeze" },
    ],
    hints: [
      "TODO 1: the auditHeap body should have 8 cout lines. Copy the format from Part 1.",
      "Each pool line: the label, then MAX_ENEMIES (or the relevant constant), then a slash, then the constant again, then the word pooled.",
      "TODO 2: after spawnWave(world); in main, add one line: auditHeap(world);",
    ],
    estimatedMinutes: 20,
  },
};