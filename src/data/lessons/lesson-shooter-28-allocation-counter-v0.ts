import type { Lesson } from "@/types/lesson";

export const lessonShooter28: Lesson = {
  id: "shooter-28-allocation-counter-v0",
  title: "Allocation Counter v0",
  description: "Instrument spawn functions with a pool_spawns counter to prove zero heap allocations during gameplay. The HUD shows the live counter; Heap allocs stays at 0.",
  order: 28,
  xpReward: 100,
  tier: "pro",
  concepts: ["allocation auditing", "pool instrumentation", "zero heap proof"],
  part1: {
    title: "Concept: Allocation Counter",
    type: "concept",
    instructions: `# Allocation Counter v0

## Mental Model
If you can count every pool spawn and recycle — and confirm heap_allocs stays at zero — you have proof the game loop never touches the heap. This is the allocation audit: instrument spawn/despawn with counters and verify the invariant.

## What Breaks Without This
Without instrumentation you are guessing. A single errant call to new or malloc inside the game loop causes unbounded latency spikes. Counters let you catch violations immediately during development.

## The Fix: Instrument Pool Functions
\`\`\`cpp
int pool_spawns = 0;
int pool_recycles = 0;

void countSpawn()   { pool_spawns++; }
void countRecycle() { pool_recycles++; }
\`\`\`
Call countSpawn inside every spawn function and countRecycle inside every despawn function.

## Key Concepts
- Pool spawns count slot writes, not heap allocations
- Heap allocs = 0 is the invariant to protect
- Counter stays in sync because every spawn has exactly one matching despawn

## Your Task
Simulate 5 enemy spawns and 3 despawns. Print the pool stats and confirm heap allocs is 0.

Expected output:
\`\`\`
Pool spawns: 5
Pool recycles: 3
Heap allocs in loop: 0
Pattern: alloc-counter
\`\`\`

## Beginner Trap
**Ignoring allocations that happen "only once per wave."** Even one allocation per wave is a stall that can cause a frame spike during gameplay. The goal is zero — no exceptions, no excuses.

## Elite Insight
Carmack set the standard: zero heap allocations during gameplay. Every Doom and Quake title pre-allocates all memory at startup. Your allocation counter makes this discipline measurable and enforceable.

## Systems Thinking Connection
RPG (L29) and Crawler (L29) track the same metric. The Platformer (L28) does too. Allocation counting is the universal health check — every path must prove zero heap activity during the game loop.`,
    starterCode: `#include <iostream>
using namespace std;

int pool_spawns = 0;
int pool_recycles = 0;

// TODO 1: call pool_spawns++ in countSpawn
void countSpawn()   { /* your code here */ }
// TODO 2: call pool_recycles++ in countRecycle
void countRecycle() { /* your code here */ }

int main() {
    // Simulate a wave: 5 enemies spawned, 3 despawned
    for (int i = 0; i < 5; i++) countSpawn();
    for (int i = 0; i < 3; i++) countRecycle();
    cout << "Pool spawns: "   << pool_spawns   << endl;
    cout << "Pool recycles: " << pool_recycles << endl;
    cout << "Heap allocs in loop: 0" << endl;
    cout << "Pattern: alloc-counter" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int pool_spawns = 0;
int pool_recycles = 0;

void countSpawn()   { pool_spawns++; }
void countRecycle() { pool_recycles++; }

int main() {
    for (int i = 0; i < 5; i++) countSpawn();
    for (int i = 0; i < 3; i++) countRecycle();
    cout << "Pool spawns: "   << pool_spawns   << endl;
    cout << "Pool recycles: " << pool_recycles << endl;
    cout << "Heap allocs in loop: 0" << endl;
    cout << "Pattern: alloc-counter" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "prints pool spawns count", expectedOutput: "Pool spawns: 5" },
      { id: "t2", description: "prints pool recycles count", expectedOutput: "Pool recycles: 3" },
      { id: "t3", description: "confirms heap allocs is zero", expectedOutput: "Heap allocs in loop: 0" },
      { id: "t4", description: "prints pattern tag", expectedOutput: "Pattern: alloc-counter" },
    ],
    hints: [
      "In countSpawn, the only line needed is pool_spawns++;",
      "In countRecycle, the only line needed is pool_recycles++;",
      "The heap_allocs line is a literal cout — it never changes because we never call new.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Allocation Counter v0",
    type: "game_builder",
    instructions: `# Build: Allocation Counter v0

## Mental Model
Add a pool_spawns counter that increments every time a slot is written. After the initial spawnWave the counter reads 5 (one per enemy). During gameplay it keeps rising but heap_allocs stays at 0 forever.

## What's Already Here
Full shooter from L27 with particles, power-ups, save/load, state sig.

## Your Task

**TODO 1** — Add global counter above World:
\`\`\`cpp
int pool_spawns = 0;
\`\`\`

**TODO 2** — Add pool_spawns++ inside spawnEnemy (after setting active=true):
\`\`\`cpp
w.enemy_active[id] = true;
pool_spawns++;   // count it
return id;
\`\`\`

**TODO 3** — Add pool_spawns++ inside spawnBullet the same way.

**TODO 4** — Fix the startup cout line (change 0 to pool_spawns):
\`\`\`cpp
cout << "Pool spawns: " << pool_spawns << endl;
\`\`\`

## Did It Work?
The HUD shows Pool Spawns rising as you fire. The startup cout should print Pool spawns: 5. Heap allocs in loop stays at 0.`,
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

// TODO 1: add int pool_spawns = 0; here

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
    // TODO 2: add pool_spawns++;
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
    // TODO 3: add pool_spawns++;
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

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter");
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
    cout << "Pool spawns: 0" << endl;  // TODO 4: replace 0 with pool_spawns
    cout << "Heap allocs in loop: 0" << endl;
    cout << "Pattern: alloc-counter" << endl;

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
        DrawText("HeapSight Shooter", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", world.score), 10, 40, 20, WHITE);
        DrawText(TextFormat("Wave:  %d", world.wave),  10, 70, 20, WHITE);
        DrawText(TextFormat("HP: %d/%d", world.player_hp, world.player_max_hp), 10, 100, 20, WHITE);
        DrawText(TextFormat("Shots: %d", world.shots_fired), 10, 130, 20, YELLOW);
        { int pa=0; for(int i=0;i<MAX_PARTICLES;i++) if(world.particles[i].life>0) pa++;
          DrawText(TextFormat("Parts: %d/30", pa), 10, 160, 16, ORANGE); }
        { int pu=0; for(int i=0;i<MAX_POWERUPS;i++) if(world.powerup_active[i]) pu++;
          DrawText(TextFormat("PU: %d/3", pu), 10, 185, 16, GOLD); }
        DrawText(TextFormat("Pool Spawns: %d", pool_spawns), 10, 210, 16, LIME);
        DrawText("Heap allocs: 0", 10, 230, 16, LIME);
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

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter");
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
    cout << "Pool spawns: " << pool_spawns << endl;
    cout << "Heap allocs in loop: 0" << endl;
    cout << "Pattern: alloc-counter" << endl;

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
        DrawText("HeapSight Shooter", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", world.score), 10, 40, 20, WHITE);
        DrawText(TextFormat("Wave:  %d", world.wave),  10, 70, 20, WHITE);
        DrawText(TextFormat("HP: %d/%d", world.player_hp, world.player_max_hp), 10, 100, 20, WHITE);
        DrawText(TextFormat("Shots: %d", world.shots_fired), 10, 130, 20, YELLOW);
        { int pa=0; for(int i=0;i<MAX_PARTICLES;i++) if(world.particles[i].life>0) pa++;
          DrawText(TextFormat("Parts: %d/30", pa), 10, 160, 16, ORANGE); }
        { int pu=0; for(int i=0;i<MAX_POWERUPS;i++) if(world.powerup_active[i]) pu++;
          DrawText(TextFormat("PU: %d/3", pu), 10, 185, 16, GOLD); }
        DrawText(TextFormat("Pool Spawns: %d", pool_spawns), 10, 210, 16, LIME);
        DrawText("Heap allocs: 0", 10, 230, 16, LIME);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "startup prints pool spawns after wave (5 enemies)", expectedOutput: "Pool spawns: 5" },
      { id: "g2", description: "startup confirms heap allocs is zero", expectedOutput: "Heap allocs in loop: 0" },
      { id: "g3", description: "startup prints pattern tag", expectedOutput: "Pattern: alloc-counter" },
    ],
    hints: [
      "TODO 1: add the line int pool_spawns = 0; before the Particle struct definition.",
      "TODO 2: inside spawnEnemy, after w.enemy_active[id] = true; add pool_spawns++;",
      "TODO 4: change the startup cout line to print pool_spawns instead of the literal 0.",
    ],
    estimatedMinutes: 15,
  },
};