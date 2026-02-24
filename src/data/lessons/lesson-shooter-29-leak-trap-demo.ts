import type { Lesson } from "@/types/lesson";

export const lessonShooter29: Lesson = {
  id: "shooter-29-leak-trap-demo",
  title: "Leak Trap Demo",
  description: "Demonstrate the heap leak pattern (new without delete) then prove the pool approach has zero leaks. A runLeakTest() function shows the contrast side by side.",
  order: 29,
  xpReward: 100,
  tier: "pro",
  concepts: ["memory leak", "new/delete discipline", "pool immunity"],
  part1: {
    title: "Concept: Leak Trap Demo",
    type: "concept",
    instructions: `# Leak Trap Demo

## Mental Model
The heap leak pattern: allocate with new, forget to delete, memory is gone. Not a crash — worse. A slow death. The process grows until the OS kills it. The pool is immune: nothing is heap-allocated, so nothing can leak.

## What Breaks Without This
A naive enemy system allocates each enemy on the heap. Kill the enemy? The caller forgets to call delete. Three thousand enemies later, the process is 500MB, the game lags, the OS kills it. This is the real cost of convenience.

## The Trap: Early Return
\`\`\`cpp
Enemy* spawnEnemy() {
    Enemy* e = new Enemy();  // heap alloc
    if (gameOver) return nullptr;  // LEAK: e is never deleted
    return e;
}
\`\`\`
The pool fix: if the pool slot check fails, you return INVALID_ID. No heap allocation, no leak.

## Key Concepts
- new without delete = memory leak
- Early returns and exception paths are the most common leak sites
- Pool: slot-based, no heap, no leak possible

## Your Task
Spawn 5 heap-allocated enemies. Clean up all 5. Verify Leaked: 0.

Expected output:
\`\`\`
Allocated: 5
Freed: 5
Leaked: 0
Pattern: leak-trap
\`\`\`

## Beginner Trap
**Deleting the "leaked" object to fix the demo.** The point of the leak trap is to demonstrate what happens when you use new without delete. Fixing it defeats the lesson. Leave the leak, show the counter increasing, then show the pool-based alternative.

## Elite Insight
Memory leak detection tools like Valgrind and AddressSanitizer catch leaks by tracking every allocation. Your allocation counter is a manual version of the same idea — instrument the allocator, verify everything is freed.

## Systems Thinking Connection
RPG (L29) and Platformer (L29) demonstrate the same leak trap. The lesson is universal: heap allocation in the game loop is a bug, and pools are the cure. Every path proves immunity by showing the counter stays at zero.`,
    starterCode: `#include <iostream>
using namespace std;

struct Enemy { int hp; float x, y; };

int allocated = 0;
int freed = 0;

Enemy* spawnEnemy(float x, float y) {
    allocated++;
    return new Enemy{100, x, y};
}

void freeEnemy(Enemy* e) {
    // TODO: delete the enemy and increment freed
    freed++;
}

int main() {
    Enemy* enemies[5];
    for (int i = 0; i < 5; i++) enemies[i] = spawnEnemy(100.0f + i*50.0f, 50.0f);
    for (int i = 0; i < 5; i++) freeEnemy(enemies[i]);
    cout << "Allocated: " << allocated << endl;
    cout << "Freed: "     << freed     << endl;
    cout << "Leaked: "    << allocated - freed << endl;
    cout << "Pattern: leak-trap" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct Enemy { int hp; float x, y; };

int allocated = 0;
int freed = 0;

Enemy* spawnEnemy(float x, float y) {
    allocated++;
    return new Enemy{100, x, y};
}

void freeEnemy(Enemy* e) {
    delete e;
    freed++;
}

int main() {
    Enemy* enemies[5];
    for (int i = 0; i < 5; i++) enemies[i] = spawnEnemy(100.0f + i*50.0f, 50.0f);
    for (int i = 0; i < 5; i++) freeEnemy(enemies[i]);
    cout << "Allocated: " << allocated << endl;
    cout << "Freed: "     << freed     << endl;
    cout << "Leaked: "    << allocated - freed << endl;
    cout << "Pattern: leak-trap" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "prints allocated count", expectedOutput: "Allocated: 5" },
      { id: "t2", description: "prints freed count", expectedOutput: "Freed: 5" },
      { id: "t3", description: "confirms leaked is zero", expectedOutput: "Leaked: 0" },
      { id: "t4", description: "prints pattern tag", expectedOutput: "Pattern: leak-trap" },
    ],
    hints: [
      "In freeEnemy, the two lines are: delete e; and freed++;",
      "The Leaked line is calculated as allocated - freed. Fix freeEnemy so that value reaches 0.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Leak Trap Demo",
    type: "game_builder",
    instructions: `# Build: Leak Trap Demo

## Mental Model
Add a runLeakTest() function that demonstrates the heap approach: allocate 5, delete 5, leaked=0. Then compare to the pool approach: 5 pool slots used, 0 heap ops. The game continues using the pool. Both tests prove the system is clean.

## What's Already Here
Full shooter from L28 with pool_spawns counter, particles, power-ups.

## Your Task

**TODO 1** — Implement runLeakTest() before main():
\`\`\`cpp
struct TestEnemy { int hp; };
void runLeakTest() {
    int alloc = 0, freed = 0;
    TestEnemy* pool[5];
    for (int i = 0; i < 5; i++) { pool[i] = new TestEnemy{100}; alloc++; }
    // TODO 1: add the delete loop here, incrementing freed each time
    cout << "Heap alloc test: " << alloc << " allocated, " << freed << " freed, leaked " << alloc-freed << endl;
}
\`\`\`

**TODO 2** — In main(), after spawnWave, call runLeakTest() then add:
\`\`\`cpp
cout << "Pool test: " << MAX_ENEMIES << " slots used, 0 heap ops" << endl;
cout << "Pattern: leak-trap" << endl;
\`\`\`

## Did It Work?
The startup output shows both tests passing: heap test reports leaked 0, pool test reports 0 heap ops.`,
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

struct TestEnemy { int hp; };
void runLeakTest() {
    int alloc = 0, freed = 0;
    TestEnemy* pool[5];
    for (int i = 0; i < 5; i++) { pool[i] = new TestEnemy{100}; alloc++; }
    // TODO 1: loop i from 0 to 5 calling delete pool[i] and incrementing freed
    cout << "Heap alloc test: " << alloc << " allocated, " << freed << " freed, leaked " << alloc-freed << endl;
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
    runLeakTest();
    // TODO 2: add cout for pool test and pattern tag

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
        DrawText(TextFormat("Pool Spawns: %d", pool_spawns), 10, 160, 16, LIME);
        DrawText("Leak status: CLEAN", 10, 185, 16, GREEN);
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

struct TestEnemy { int hp; };
void runLeakTest() {
    int alloc = 0, freed = 0;
    TestEnemy* pool[5];
    for (int i = 0; i < 5; i++) { pool[i] = new TestEnemy{100}; alloc++; }
    for (int i = 0; i < 5; i++) { delete pool[i]; freed++; }
    cout << "Heap alloc test: " << alloc << " allocated, " << freed << " freed, leaked " << alloc-freed << endl;
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
    runLeakTest();
    cout << "Pool test: " << MAX_ENEMIES << " slots used, 0 heap ops" << endl;
    cout << "Pattern: leak-trap" << endl;

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
        DrawText(TextFormat("Pool Spawns: %d", pool_spawns), 10, 160, 16, LIME);
        DrawText("Leak status: CLEAN", 10, 185, 16, GREEN);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "heap test reports zero leaked", expectedOutput: "leaked 0" },
      { id: "g2", description: "pool test reports zero heap ops", expectedOutput: "0 heap ops" },
      { id: "g3", description: "prints pattern tag", expectedOutput: "Pattern: leak-trap" },
    ],
    hints: [
      "TODO 1: inside the for loop in runLeakTest, the two lines are delete pool[i]; and freed++;",
      "TODO 2: after runLeakTest(), add two cout lines. First prints pool test with MAX_ENEMIES, second prints the pattern tag.",
    ],
    estimatedMinutes: 15,
  },
};