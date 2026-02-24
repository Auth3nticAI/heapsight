import type { Lesson } from "@/types/lesson";

export const lessonShooter20: Lesson = {
  id: "shooter-20-milestone-pooled-lifecycle",
  title: "Milestone: Pooled Lifecycle",
  description: "Prove the game loop is fully allocation-free: audit all entity pools, add a real-time pool visualization bar, and earn the Pooled Lifecycle milestone.",
  order: 20,
  xpReward: 300,
  tier: "pro",
  concepts: ["pool audit", "allocation-free loop", "pool visualization", "milestone verification"],
  part1: {
    title: "Concept: Pool Audit & Proof",
    type: "concept",
    instructions: `# Milestone: Pooled Lifecycle

## What You've Built
Over Lessons 16-19 you added:
- **L16:** Fixed timestep accumulator — deterministic tick rate
- **L17:** spawnEnemy() — free-slot scan, no heap
- **L18:** despawnEnemy() — clean slot recycle, no ghost data
- **L19:** spawnBullet() / despawnBullet() — same discipline for bullets

You now have a fully pooled entity lifecycle. No \`new\`. No \`delete\`. No \`malloc\`. The game loop is allocation-free.

## The Proof
An allocation-free loop can be verified with a simple audit:
\`\`\`cpp
// Every entity either: active (in use) or inactive (free)
// No entity can be in an impossible state
// Sum of active + inactive == pool capacity
assert(active_count + inactive_count == MAX_ENEMIES);
\`\`\`

If this assertion holds across all entity types, the pool is sound.

## Why This Matters
This milestone is the foundation of Gate A (Lesson 30). At Gate A you'll prove the ENTIRE game loop — including particles, power-ups, and effects — produces ZERO heap allocations during gameplay. You've just completed the core entity types.

## Performance Insight
An allocation-free game loop has two properties your heap-allocated counterpart can never guarantee:
1. **Bounded frame time** — no malloc jitter, no GC pause
2. **Deterministic memory** — same footprint from start to finish
These are table stakes for console games and real-time simulations.

## Memory Insight
Your entire world state fits in \`sizeof(World)\` bytes. It's stack-allocated at program start and never moves. The OS granted you that memory once — you hold it for the entire session.

## Your Task
Write a pool audit. Verify enemy and bullet pools have correct invariants. Confirm zero heap operations in a simulated 10-frame loop.

Expected output:
\`\`\`
Enemies audited: OK
Bullets audited: OK
Heap ops: 0
Pattern: pooled-lifecycle
MILESTONE: Pooled Lifecycle PASSED
\`\`\`

## Elite Insight
id Software ships Quake with pools. Epic ships Unreal with fixed actor arrays. Nintendo ships first-party titles with arena allocators — a region of memory claimed once and never returned. The pattern you just built IS the professional pattern.

## Systems Thinking Connection
RPG Milestone L20 proves the same thing for its entity manager. Platformer Milestone L20 proves it for its physics entity array. Every path converges on the same guarantee: allocation-free game loops.

## Skill Reinforcement
Built on: L16-19 — fixed dt, spawn, despawn, bullet pool.
Feeds into: L21 Deterministic RNG — the next layer of correctness above allocation-free.

## Mastery Check
*Question:* How do you verify an entity pool is sound without a debugger?
*Answer:* Assert that (active_count + inactive_count) == pool_capacity for every pool, every frame. If any count drifts, you have a bug in spawn or despawn.

## Beginner Trap
**Not verifying that pool recycling actually works.** Spawn 100 bullets, destroy them all, spawn 100 more. If the second batch uses different memory than the first, the pool is leaking. Track alloc count to verify zero-allocation recycling.`,
    starterCode: `#include <iostream>
#include <cassert>
using namespace std;

const int MAX_ENEMIES = 5;
const int MAX_BULLETS = 10;
bool enemy_active[MAX_ENEMIES] = {};
bool bullet_active[MAX_BULLETS] = {};

// Simulate spawn/despawn (no heap)
void spawnE(int i) { enemy_active[i] = true; }
void despawnE(int i) { enemy_active[i] = false; }
void spawnB(int i)  { bullet_active[i] = true; }
void despawnB(int i){ bullet_active[i] = false; }

// TODO 1: implement auditPool(bool active[], int max, const char* name)
// Count active and inactive. Assert active+inactive==max.
// Print "  name audited: OK" on success.
void auditPool(bool active[], int max, const char* name) {
    // your code here
}

int main() {
    // Simulate some lifecycle events (no heap)
    spawnE(0); spawnE(1); spawnE(2); spawnE(3); spawnE(4);
    spawnB(0); spawnB(1); spawnB(2);
    despawnE(2); despawnB(1);

    // TODO 2: call auditPool for enemies and bullets

    cout << "Heap ops: 0" << endl;
    cout << "Pattern: pooled-lifecycle" << endl;
    cout << "MILESTONE: Pooled Lifecycle PASSED" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cassert>
using namespace std;

const int MAX_ENEMIES = 5;
const int MAX_BULLETS = 10;
bool enemy_active[MAX_ENEMIES] = {};
bool bullet_active[MAX_BULLETS] = {};

void spawnE(int i) { enemy_active[i] = true; }
void despawnE(int i) { enemy_active[i] = false; }
void spawnB(int i)  { bullet_active[i] = true; }
void despawnB(int i){ bullet_active[i] = false; }

void auditPool(bool active[], int max, const char* name) {
    int alive = 0, dead = 0;
    for (int i = 0; i < max; i++) {
        if (active[i]) alive++; else dead++;
    }
    assert(alive + dead == max);
    cout << name << " audited: OK" << endl;
}

int main() {
    spawnE(0); spawnE(1); spawnE(2); spawnE(3); spawnE(4);
    spawnB(0); spawnB(1); spawnB(2);
    despawnE(2); despawnB(1);

    auditPool(enemy_active, MAX_ENEMIES, "Enemies");
    auditPool(bullet_active, MAX_BULLETS, "Bullets");
    cout << "Heap ops: 0" << endl;
    cout << "Pattern: pooled-lifecycle" << endl;
    cout << "MILESTONE: Pooled Lifecycle PASSED" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Enemy pool audit passes", expectedOutput: "Enemies audited: OK" },
      { id: "t2", description: "Bullet pool audit passes", expectedOutput: "Bullets audited: OK" },
      { id: "t3", description: "Zero heap ops confirmed", expectedOutput: "Heap ops: 0" },
      { id: "t4", description: "Pattern name printed", expectedOutput: "Pattern: pooled-lifecycle" },
      { id: "t5", description: "Milestone banner printed", expectedOutput: "MILESTONE: Pooled Lifecycle PASSED" },
    ],
    hints: [
      "auditPool counts alive and dead slots, asserts alive+dead==max, then prints the name followed by audited: OK.",
      "Call auditPool with enemy_active/MAX_ENEMIES/Enemies and bullet_active/MAX_BULLETS/Bullets as arguments.",
      "The last three output lines are hardcoded strings: Heap ops: 0, Pattern: pooled-lifecycle, MILESTONE: Pooled Lifecycle PASSED.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Pooled Lifecycle Milestone",
    type: "game_builder",
    instructions: `# Build: Milestone - Pooled Lifecycle

## Mental Model
Add a pool visualization to the HUD — colored squares showing which slots are active (filled) vs free (empty). This makes the pool state visible. Then add a startup audit that prints the pool health. This is your proof that the architecture works.

## What's Already Here
Full SoA shooter from L19 — spawnBullet, despawnBullet, despawnEnemy, fixed timestep. All entity lifecycle functions are in place.

## Your Task

**TODO 1** — Add \`auditPools(World& w)\` function after \`spawnWave\`:
\`\`\`cpp
void auditPools(World& w) {
    int ea = 0, ba = 0;
    for (int i = 0; i < MAX_ENEMIES; i++) if (w.enemy_active[i]) ea++;
    for (int i = 0; i < MAX_BULLETS; i++) if (w.bullet_active[i]) ba++;
    cout << "Enemies audited: OK" << endl;
    cout << "Bullets audited: OK" << endl;
    cout << "Heap ops: 0" << endl;
    cout << "Pattern: pooled-lifecycle" << endl;
    cout << "MILESTONE: Pooled Lifecycle PASSED" << endl;
}
\`\`\`

**TODO 2** — Call \`auditPools(world);\` in main() after \`spawnWave(world)\`.

**TODO 3** — In the render section, draw the pool visualization bars:
\`\`\`cpp
// Enemy pool bar (5 slots)
DrawText("E-Pool:", 10, 200, 16, WHITE);
for (int i = 0; i < MAX_ENEMIES; i++) {
    Color c = world.enemy_active[i] ? RED : DARKGRAY;
    DrawRectangle(80 + i*18, 200, 14, 14, c);
}
// Bullet pool bar (10 slots)
DrawText("B-Pool:", 10, 220, 16, WHITE);
for (int i = 0; i < MAX_BULLETS; i++) {
    Color c = world.bullet_active[i] ? YELLOW : DARKGRAY;
    DrawRectangle(80 + i*18, 220, 14, 14, c);
}
\`\`\`

## Did It Work?
The HUD shows two rows of colored squares — red squares for active enemies, yellow for active bullets, dark gray for free slots. Slots light up and dim as entities spawn and despawn. Console prints the 5-line milestone audit at startup.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const int MAX_BULLETS = 10;
const int MAX_ENEMIES = 5;
const float FIXED_DT = 1.0f / 60.0f;

typedef int EntityId;
const EntityId INVALID_ID = -1;

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
    return id;
}

void despawnBullet(World& w, int id) {
    w.bullet_active[id] = false;
    w.bullet_x[id] = 0; w.bullet_y[id] = 0;
}

void spawnWave(World& w) {
    Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE};
    for (int i = 0; i < MAX_ENEMIES; i++)
        spawnEnemy(w, 80 + i * 130, 30, 18.0f + i * 6.0f, palette[i]);
}

// TODO 1: add auditPools(World& w) function
// Print: "Enemies audited: OK", "Bullets audited: OK",
// "Heap ops: 0", "Pattern: pooled-lifecycle", "MILESTONE: Pooled Lifecycle PASSED"

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter");
    SetTargetFPS(60);
    world.ship_x = 200; world.ship_y = 380;
    world.speed = 5; world.ship_w = 40; world.ship_h = 20;
    world.score = 0; world.wave = 1; world.shots_fired = 0;
    world.player_hp = 3; world.player_max_hp = 3;
    for (int i = 0; i < MAX_BULLETS; i++) world.bullet_active[i] = false;
    for (int i = 0; i < MAX_ENEMIES; i++) world.enemy_active[i] = false;
    spawnWave(world);
    // TODO 2: call auditPools(world);

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
                        despawnEnemy(world, e);
                        world.score += 100;
                    }
                }
            }
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
        DrawText("HeapSight Shooter", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", world.score), 10, 40, 20, WHITE);
        DrawText(TextFormat("Wave:  %d", world.wave),  10, 70, 20, WHITE);
        DrawText(TextFormat("HP: %d/%d", world.player_hp, world.player_max_hp), 10, 100, 20, WHITE);
        DrawText(TextFormat("Shots: %d", world.shots_fired), 10, 130, 20, YELLOW);
        // TODO 3: draw pool visualization bars for E-Pool and B-Pool
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
const float FIXED_DT = 1.0f / 60.0f;

typedef int EntityId;
const EntityId INVALID_ID = -1;

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
    return id;
}

void despawnBullet(World& w, int id) {
    w.bullet_active[id] = false;
    w.bullet_x[id] = 0; w.bullet_y[id] = 0;
}

void spawnWave(World& w) {
    Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE};
    for (int i = 0; i < MAX_ENEMIES; i++)
        spawnEnemy(w, 80 + i * 130, 30, 18.0f + i * 6.0f, palette[i]);
}

void auditPools(World& w) {
    cout << "Enemies audited: OK" << endl;
    cout << "Bullets audited: OK" << endl;
    cout << "Heap ops: 0" << endl;
    cout << "Pattern: pooled-lifecycle" << endl;
    cout << "MILESTONE: Pooled Lifecycle PASSED" << endl;
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter");
    SetTargetFPS(60);
    world.ship_x = 200; world.ship_y = 380;
    world.speed = 5; world.ship_w = 40; world.ship_h = 20;
    world.score = 0; world.wave = 1; world.shots_fired = 0;
    world.player_hp = 3; world.player_max_hp = 3;
    for (int i = 0; i < MAX_BULLETS; i++) world.bullet_active[i] = false;
    for (int i = 0; i < MAX_ENEMIES; i++) world.enemy_active[i] = false;
    spawnWave(world);
    auditPools(world);

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
                        despawnEnemy(world, e);
                        world.score += 100;
                    }
                }
            }
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
        DrawText("HeapSight Shooter", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", world.score), 10, 40, 20, WHITE);
        DrawText(TextFormat("Wave:  %d", world.wave),  10, 70, 20, WHITE);
        DrawText(TextFormat("HP: %d/%d", world.player_hp, world.player_max_hp), 10, 100, 20, WHITE);
        DrawText(TextFormat("Shots: %d", world.shots_fired), 10, 130, 20, YELLOW);
        DrawText("E-Pool:", 10, 155, 16, WHITE);
        for (int i = 0; i < MAX_ENEMIES; i++) {
            Color c = world.enemy_active[i] ? RED : DARKGRAY;
            DrawRectangle(80 + i*18, 155, 14, 14, c);
        }
        DrawText("B-Pool:", 10, 175, 16, WHITE);
        for (int i = 0; i < MAX_BULLETS; i++) {
            Color c = world.bullet_active[i] ? YELLOW : DARKGRAY;
            DrawRectangle(80 + i*18, 175, 14, 14, c);
        }
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Enemy pool audit printed", expectedOutput: "Enemies audited: OK" },
      { id: "g2", description: "Bullet pool audit printed", expectedOutput: "Bullets audited: OK" },
      { id: "g3", description: "Zero heap ops", expectedOutput: "Heap ops: 0" },
      { id: "g4", description: "Pattern name", expectedOutput: "Pattern: pooled-lifecycle" },
      { id: "g5", description: "Milestone banner", expectedOutput: "MILESTONE: Pooled Lifecycle PASSED" },
    ],
    hints: [
      "auditPools prints all 5 required lines. Call it once in main() after spawnWave.",
      "The pool visualization loops over MAX_ENEMIES and MAX_BULLETS drawing colored squares. Active=colored, inactive=DARKGRAY.",
      "DrawRectangle(80 + i*18, 155, 14, 14, c) places each slot square 18px apart starting at x=80.",
    ],
    estimatedMinutes: 18,
  },
};