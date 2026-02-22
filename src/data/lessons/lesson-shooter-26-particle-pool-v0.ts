import type { Lesson } from "@/types/lesson";

export const lessonShooter26: Lesson = {
  id: "shooter-26-particle-pool-v0",
  title: "Particle Pool v0",
  description: "Add explosion particles — a 30-slot pool where life counts down automatically. Kill an enemy and 5 colored dots burst outward, no heap allocation.",
  order: 26,
  xpReward: 100,
  tier: "pro",
  concepts: ["particle pool", "TTL counter", "visual effects", "zero heap effects"],
  part1: {
    title: "Concept: Particle Pool",
    type: "concept",
    instructions: `# Particle Pool v0

## Mental Model
Explosions are transient: they exist for 20 frames then vanish. The naive approach heap-allocates each particle on spawn and frees it on expiry — thousands of allocs per combat session. The particle POOL pre-allocates all particles at startup. Spawn writes into a free slot. Expiry zeros the slot. Zero heap during gameplay.

## What Breaks Without This
At 60fps with 5 enemies and 3 particles per kill: 300 kills per minute = 900 particle allocations per minute. Each allocation has overhead. At high particle counts, frame spikes appear every time the allocator needs to defragment. GC-enabled languages (Java, C#) pause visibly. C++ with raw new/delete has unpredictable latency.

## The Fix: Particle Pool
\`\`\`cpp
struct Particle {
    float x, y;
    float vx, vy;
    int life;       // frames remaining (0 = dead)
    Color color;
};

const int MAX_PARTICLES = 30;
Particle particles[MAX_PARTICLES] = {};

void spawnParticle(float x, float y, float vx, float vy, Color c) {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (particles[i].life <= 0) {
            particles[i] = {x, y, vx, vy, 20, c};
            return;
        }
    }
    // Pool full: skip (no crash, no alloc)
}

void updateParticles() {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (particles[i].life > 0) {
            particles[i].x += particles[i].vx;
            particles[i].y += particles[i].vy;
            particles[i].life--;
        }
    }
}
\`\`\`
Note: \`life\` doubles as the active flag — no separate bool needed. life > 0 = alive.

## Key Concepts
- \`life\` counter is both active flag and TTL (time-to-live)
- Spawn finds first slot with life <= 0
- Update decrements life each tick; life reaching 0 = automatic despawn
- Max particle count caps visual effect density — budget your effect slots

## Performance Insight
30 particles * 6 fields * 4 bytes = 720 bytes. Fits in two cache lines. All particle updates process in order with no pointer chasing. SIMD-friendly layout for the bold.

## Memory Insight
Particles live in a static array. The particle pool is part of the world's deterministic memory footprint. No runtime allocation ever.

## Your Task
Simulate spawning 5 particles at an explosion point. Track active count as they expire.

Expected output:
\`\`\`
Particle pool: 30 slots
Spawned: 5
Alive after 10 ticks: 5
Alive after 20 ticks: 0
Pattern: particle-pool
\`\`\`

## Beginner Trap
Don't use a vector<Particle> with push_back/erase. Particle effects are the most allocation-intensive part of most games — exactly where you need the pool the most.

## Elite Insight
Quake 3's \`CG_AddTrailJunctions\` uses a fixed particle array. Doom Eternal's particle system pre-allocates 100K particles. Unity's Particle System component (VFX Graph) uses compute buffers — GPU-side pools that skip CPU allocation entirely.

## Systems Thinking Connection
RPG Lesson 26 uses a similar pool for spell effect sprites. Platformer Lesson 35 uses it for jump dust. The particle pool is the universal visual effects budget.

## Skill Reinforcement
Built on: L25 Milestone — pool discipline confirmed for bullets and enemies. Now extends to effects.
Feeds into: L28 Allocation Counter — prove particle pool contributes zero heap ops.

## Mastery Check
*Question:* 30-slot particle pool is full. An enemy dies. What happens?
*Answer:* spawnParticle scans all 30 slots, finds none with life <= 0, returns without spawning. No crash. The explosion is silently skipped — acceptable behavior over allocating.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_PARTICLES = 30;

struct Particle {
    float x, y;
    float vx, vy;
    int life;
};

Particle particles[MAX_PARTICLES] = {};

// TODO 1: implement spawnParticle(float x, float y, float vx, float vy)
// Find first slot with life <= 0, set x/y/vx/vy and life=20
void spawnParticle(float x, float y, float vx, float vy) {
    // your code here
}

// TODO 2: implement updateParticles()
// For each alive particle: add vx to x, add vy to y, decrement life
void updateParticles() {
    // your code here
}

int countAlive() {
    int c = 0;
    for (int i = 0; i < MAX_PARTICLES; i++) if (particles[i].life > 0) c++;
    return c;
}

int main() {
    cout << "Particle pool: " << MAX_PARTICLES << " slots" << endl;
    // Spawn 5 particles
    for (int i = 0; i < 5; i++) spawnParticle(400, 200, (i-2)*2.0f, -3.0f);
    cout << "Spawned: " << countAlive() << endl;
    // TODO 3: tick 10 times and print alive count
    for (int t = 0; t < 10; t++) updateParticles();
    cout << "Alive after 10 ticks: " << countAlive() << endl;
    // TODO 4: tick 10 more times and print alive count (should be 0)
    for (int t = 0; t < 10; t++) updateParticles();
    cout << "Alive after 20 ticks: " << countAlive() << endl;
    cout << "Pattern: particle-pool" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_PARTICLES = 30;

struct Particle {
    float x, y;
    float vx, vy;
    int life;
};

Particle particles[MAX_PARTICLES] = {};

void spawnParticle(float x, float y, float vx, float vy) {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (particles[i].life <= 0) {
            particles[i].x = x; particles[i].y = y;
            particles[i].vx = vx; particles[i].vy = vy;
            particles[i].life = 20;
            return;
        }
    }
}

void updateParticles() {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (particles[i].life > 0) {
            particles[i].x += particles[i].vx;
            particles[i].y += particles[i].vy;
            particles[i].life--;
        }
    }
}

int countAlive() {
    int c = 0;
    for (int i = 0; i < MAX_PARTICLES; i++) if (particles[i].life > 0) c++;
    return c;
}

int main() {
    cout << "Particle pool: " << MAX_PARTICLES << " slots" << endl;
    for (int i = 0; i < 5; i++) spawnParticle(400, 200, (i-2)*2.0f, -3.0f);
    cout << "Spawned: " << countAlive() << endl;
    for (int t = 0; t < 10; t++) updateParticles();
    cout << "Alive after 10 ticks: " << countAlive() << endl;
    for (int t = 0; t < 10; t++) updateParticles();
    cout << "Alive after 20 ticks: " << countAlive() << endl;
    cout << "Pattern: particle-pool" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Pool size reported", expectedOutput: "Particle pool: 30 slots" },
      { id: "t2", description: "Spawn count correct", expectedOutput: "Spawned: 5" },
      { id: "t3", description: "Still alive at tick 10", expectedOutput: "Alive after 10 ticks: 5" },
      { id: "t4", description: "All dead at tick 20", expectedOutput: "Alive after 20 ticks: 0" },
      { id: "t5", description: "Pattern name printed", expectedOutput: "Pattern: particle-pool" },
    ],
    hints: [
      "spawnParticle: find first slot with life<=0, set x/y/vx/vy and life=20, then return.",
      "updateParticles: for each slot with life>0, add vx to x, vy to y, decrement life.",
      "After 20 ticks, life reaches 0 on all 5 particles. countAlive returns 0.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Particle Pool v0",
    type: "game_builder",
    instructions: `# Build: Particle Pool v0

## Mental Model
When an enemy dies, spawn 5 particles at the explosion point using rng_range for random velocities. Particles drift and fade over 20 ticks. The particle pool is part of the World struct — deterministic memory, zero heap.

## What's Already Here
Full shooter from L25 with save/load, state sig, seeded RNG. You will ADD a particle system.

## Your Task

**TODO 1** — Add Particle array to World struct (after enemy fields):
\`\`\`cpp
struct Particle { float x, y, vx, vy; int life; Color color; };
// In World:
Particle particles[MAX_PARTICLES];
\`\`\`
And add \`const int MAX_PARTICLES = 30;\` near the other constants.

**TODO 2** — Add particle functions after despawnBullet:
\`\`\`cpp
void spawnParticle(World& w, float x, float y, Color c) {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (w.particles[i].life <= 0) {
            w.particles[i].x = x;  w.particles[i].y = y;
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
\`\`\`

**TODO 3** — Call particle system:
- In collision handler, after despawnEnemy: spawn 5 particles at enemy position
- In update loop (inside fixed-step while): call updateParticles(world)
- In render: draw all alive particles as 4x4 colored rectangles

**TODO 4** — Add startup cout:
\`\`\`cpp
cout << "Particle pool: " << MAX_PARTICLES << " slots" << endl;
cout << "Pattern: particle-pool" << endl;
\`\`\`

## Did It Work?
Kill an enemy — a burst of colored dots explodes outward from the kill point and fades over 20 frames. The effect is pooled: no allocation on kill.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const int MAX_BULLETS = 10;
const int MAX_ENEMIES = 5;
// TODO 1a: add MAX_PARTICLES = 30
const float FIXED_DT = 1.0f / 60.0f;

typedef int EntityId;
const EntityId INVALID_ID = -1;

// TODO 1b: add Particle struct

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
    // TODO 1c: add Particle particles[MAX_PARTICLES];
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

// TODO 2: add spawnParticle(World& w, float x, float y, Color c)
// and updateParticles(World& w)

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
    // TODO 1d: initialize particles[i].life = 0
    spawnWave(world);
    cout << "Particle pool: 0 slots" << endl;  // fix this
    cout << "Pattern: particle-pool" << endl;

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
                        // TODO 3a: spawn 5 particles at enemy position
                        despawnEnemy(world, e);
                        world.score += 100;
                    }
                }
            }
            // TODO 3b: call updateParticles(world)
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
        // TODO 3c: draw alive particles as 4x4 rectangles
        DrawText("HeapSight Shooter", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", world.score), 10, 40, 20, WHITE);
        DrawText(TextFormat("Wave:  %d", world.wave),  10, 70, 20, WHITE);
        DrawText(TextFormat("HP: %d/%d", world.player_hp, world.player_max_hp), 10, 100, 20, WHITE);
        DrawText(TextFormat("Shots: %d", world.shots_fired), 10, 130, 20, YELLOW);
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
const float FIXED_DT = 1.0f / 60.0f;

typedef int EntityId;
const EntityId INVALID_ID = -1;

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
    spawnWave(world);
    cout << "Particle pool: " << MAX_PARTICLES << " slots" << endl;
    cout << "Pattern: particle-pool" << endl;

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
                    }
                }
            }
            updateParticles(world);
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
        DrawText("HeapSight Shooter", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", world.score), 10, 40, 20, WHITE);
        DrawText(TextFormat("Wave:  %d", world.wave),  10, 70, 20, WHITE);
        DrawText(TextFormat("HP: %d/%d", world.player_hp, world.player_max_hp), 10, 100, 20, WHITE);
        DrawText(TextFormat("Shots: %d", world.shots_fired), 10, 130, 20, YELLOW);
        { int pa=0; for(int i=0;i<MAX_PARTICLES;i++) if(world.particles[i].life>0) pa++;
          DrawText(TextFormat("Parts: %d/30", pa), 10, 160, 16, ORANGE); }
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Particle pool size printed", expectedOutput: "Particle pool: 30 slots" },
      { id: "g2", description: "Pattern name printed", expectedOutput: "Pattern: particle-pool" },
    ],
    hints: [
      "Add Particle struct and particles[MAX_PARTICLES] to World. Initialize all life=0 in main.",
      "In collision handler, after despawnEnemy, loop 5 times calling spawnParticle at enemy center.",
      "Call updateParticles(world) inside the fixed-step while loop. Render particles as 4x4 rectangles.",
    ],
    estimatedMinutes: 18,
  },
};