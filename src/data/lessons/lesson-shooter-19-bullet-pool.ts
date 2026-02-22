import type { Lesson } from "@/types/lesson";

export const lessonShooter19: Lesson = {
  id: "shooter-19-bullet-pool",
  title: "Bullet Pool",
  description: "Extract spawnBullet() and despawnBullet() so bullets use the same pool discipline as enemies — zero heap, clean slot recycling.",
  order: 19,
  xpReward: 100,
  tier: "pro",
  concepts: ["bullet pool", "pool discipline", "spawnBullet", "despawnBullet", "shots fired counter"],
  part1: {
    title: "Concept: Bullet Pool Discipline",
    type: "concept",
    instructions: `# Bullet Pool

## Mental Model
Bullets fire and expire dozens of times per second. Without pooling, each shot is a heap allocation and each expiry is a free — thousands of mallocs per minute. With a fixed bullet pool: one static array, slot reuse, zero heap pressure. The pool discipline is identical to the enemy pool — just faster.

## What Breaks Without This
Using \`vector<Bullet>\` with \`push_back\` on fire and \`erase\` on expiry produces O(N) element shifts on every bullet death PLUS potential heap reallocation. Fire 20 bullets in a burst — vector may resize 4-5 times, copying all data each time. The frame spikes. Your fixed 60fps becomes 55fps on the fire frame.

## The Fix: Explicit Bullet Pool Functions
\`\`\`cpp
EntityId spawnBullet(World& w, int x, int y) {
    EntityId id = findFreeSlot(w.bullet_active, MAX_BULLETS);
    if (id == INVALID_ID) return INVALID_ID;
    w.bullet_x[id] = x;  w.bullet_y[id] = y;
    w.bullet_active[id] = true;
    return id;
}

void despawnBullet(World& w, int id) {
    w.bullet_active[id] = false;
    w.bullet_x[id] = 0;  w.bullet_y[id] = 0;
}
\`\`\`

Same pattern as enemies. Same symmetry: spawn writes in, despawn zeroes out.

## Key Concepts
- Both entity types (bullets, enemies) use the identical pool discipline
- \`MAX_BULLETS = 10\` sets the hard cap on simultaneous shots
- Pool full = no shot fired. This is the correct behavior — not a crash, not an alloc
- \`shots_fired\` counter tracks total over the session (across many pool reuses)

## Performance Insight
10 bullet slots * 3 fields * 4 bytes = 120 bytes total. This fits in one cache line. The bullet pool is trivially cache-hot. Vector<Bullet> with 10 elements is heap-allocated — pointer dereference + cache miss on every access.

## Memory Insight
The bullet pool and enemy pool share the same World struct. Total World size stays constant throughout gameplay. No growth. No shrink. Deterministic memory from startup to shutdown.

## Your Task
Simulate 3 shots fired, 1 expired, then print pool state.

Expected output:
\`\`\`
Bullet pool: 10 slots
Shots fired: 3
In flight: 2
Recycled: 1
Pattern: bullet-pool
\`\`\`

## Beginner Trap
Don't use a global \`int bullet_count\` that you increment/decrement. Count the live bullets from the active[] array each time you need the count. Array is the source of truth — a counter goes stale.

## Elite Insight
Doom (1993) uses a \`thinker_t\` array for all game objects including projectiles. Quake 3's \`bg_pmove.c\` preallocates projectile slots. Minecraft's Java code is the anti-example: arrow entities heap-allocate and cause notable GC pauses at high arrow counts.

## Systems Thinking Connection
RPG Lesson 19 applies the same pool discipline to spell effects. Platformer Lesson 35 uses it for coin/pickup entities. The bullet pool is the archetype.

## Skill Reinforcement
Built on: L18 Despawn & Recycle — bullets need the same clean-on-death discipline.
Feeds into: L20 Milestone — prove the entire lifecycle runs with zero heap.

## Mastery Check
*Question:* Player fires rapidly. MAX_BULLETS=10, 10 slots active. What happens on the 11th fire?
*Answer:* findFreeSlot returns INVALID_ID. spawnBullet returns INVALID_ID. No bullet created. No crash. The player's rapid-fire is silently capped.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_BULLETS = 10;
int bx[MAX_BULLETS] = {};
int by[MAX_BULLETS] = {};
bool ba[MAX_BULLETS] = {};
int shots_fired = 0;

int findFreeSlot() {
    for (int i = 0; i < MAX_BULLETS; i++) if (!ba[i]) return i;
    return -1;
}

// TODO 1: implement spawnBullet(int x, int y)
// Find free slot, write x/y/active, increment shots_fired, return slot id
int spawnBullet(int x, int y) {
    return -1;
}

// TODO 2: implement despawnBullet(int id)
// Set ba[id]=false, zero bx[id] and by[id]
void despawnBullet(int id) {}

int main() {
    spawnBullet(100, 400);
    spawnBullet(200, 400);
    spawnBullet(300, 400);
    // TODO 3: despawn bullet at slot 1 (simulating it leaving the screen)

    int in_flight = 0, recycled = 0;
    for (int i = 0; i < MAX_BULLETS; i++) {
        if (ba[i]) in_flight++; else recycled++;
    }
    cout << "Bullet pool: " << MAX_BULLETS << " slots" << endl;
    cout << "Shots fired: " << shots_fired << endl;
    cout << "In flight: " << in_flight << endl;
    cout << "Recycled: " << recycled << endl;
    cout << "Pattern: bullet-pool" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_BULLETS = 10;
int bx[MAX_BULLETS] = {};
int by[MAX_BULLETS] = {};
bool ba[MAX_BULLETS] = {};
int shots_fired = 0;

int findFreeSlot() {
    for (int i = 0; i < MAX_BULLETS; i++) if (!ba[i]) return i;
    return -1;
}

int spawnBullet(int x, int y) {
    int id = findFreeSlot();
    if (id < 0) return -1;
    bx[id] = x; by[id] = y; ba[id] = true;
    shots_fired++;
    return id;
}

void despawnBullet(int id) {
    ba[id] = false;
    bx[id] = 0; by[id] = 0;
}

int main() {
    spawnBullet(100, 400);
    spawnBullet(200, 400);
    spawnBullet(300, 400);
    despawnBullet(1);

    int in_flight = 0, recycled = 0;
    for (int i = 0; i < MAX_BULLETS; i++) {
        if (ba[i]) in_flight++; else recycled++;
    }
    cout << "Bullet pool: " << MAX_BULLETS << " slots" << endl;
    cout << "Shots fired: " << shots_fired << endl;
    cout << "In flight: " << in_flight << endl;
    cout << "Recycled: " << recycled << endl;
    cout << "Pattern: bullet-pool" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Pool size reported", expectedOutput: "Bullet pool: 10 slots" },
      { id: "t2", description: "Shots fired counter works", expectedOutput: "Shots fired: 3" },
      { id: "t3", description: "In-flight count after despawn", expectedOutput: "In flight: 2" },
      { id: "t4", description: "Recycled count correct", expectedOutput: "Recycled: 1" },
      { id: "t5", description: "Pattern name printed", expectedOutput: "Pattern: bullet-pool" },
    ],
    hints: [
      "spawnBullet: findFreeSlot, write x/y/active, increment shots_fired, return id.",
      "despawnBullet: set ba[id]=false, zero bx[id] and by[id].",
      "Call despawnBullet(1) after the 3 spawns to simulate a bullet leaving the screen.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Bullet Pool",
    type: "game_builder",
    instructions: `# Build: Bullet Pool

## Mental Model
Extract bullet spawn/despawn into dedicated functions — matching the enemy pool pattern exactly. The game loop becomes symmetric: spawn is a write-in, despawn is a zero-out, the pool array is the source of truth.

## What's Already Here
Full SoA shooter from L18 with despawnEnemy(). The bullet handling is still inline:
\`\`\`cpp
// Fire: manually find free slot and set fields
// Expire: world.bullet_active[i] = false;
\`\`\`
You'll extract these into \`spawnBullet()\` and \`despawnBullet()\`, and add a \`shots_fired\` counter.

## Your Task

**TODO 1** — Add to World struct: \`int shots_fired;\` (initialize to 0 in main)

**TODO 2** — Add \`spawnBullet(World& w, int x, int y)\` after \`despawnEnemy\`:
\`\`\`cpp
EntityId spawnBullet(World& w, int x, int y) {
    EntityId id = findFreeSlot(w.bullet_active, MAX_BULLETS);
    if (id == INVALID_ID) return INVALID_ID;
    w.bullet_x[id] = x;  w.bullet_y[id] = y;
    w.bullet_active[id] = true;
    w.shots_fired++;
    return id;
}
\`\`\`

**TODO 3** — Add \`despawnBullet(World& w, int id)\`:
\`\`\`cpp
void despawnBullet(World& w, int id) {
    w.bullet_active[id] = false;
    w.bullet_x[id] = 0;  w.bullet_y[id] = 0;
}
\`\`\`

**TODO 4** — In the game loop, replace inline bullet fire code with \`spawnBullet(world, ...)\` call, and replace \`world.bullet_active[i] = false\` (in both bounds-check and collision) with \`despawnBullet(world, i)\`.

## Did It Work?
The HUD shows "Shots: N" incrementing on every spacebar press. Bullets still move and expire correctly. Console shows pool stats at startup.`,
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
    // TODO 1: add shots_fired int field here
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

// TODO 2: add spawnBullet(World& w, int x, int y)
// TODO 3: add despawnBullet(World& w, int id)

void spawnWave(World& w) {
    Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE};
    for (int i = 0; i < MAX_ENEMIES; i++)
        spawnEnemy(w, 80 + i * 130, 30, 18.0f + i * 6.0f, palette[i]);
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
    cout<<"Bullet pool: "<<MAX_BULLETS<<" slots"<<endl;
    cout<<"Shots fired: "<<world.shots_fired<<endl;
    { int b=0; for(int i=0;i<MAX_BULLETS;i++) if(world.bullet_active[i]) b++;
      cout<<"In flight: "<<b<<endl;
      cout<<"Recycled: "<<(MAX_BULLETS-b)<<endl; }
    cout<<"Pattern: bullet-pool"<<endl;

    while (!WindowShouldClose()) {
        float dt = GetFrameTime();
        accumulator += dt;
        while (accumulator >= FIXED_DT) {
            if (IsKeyDown(KEY_RIGHT)) world.ship_x += world.speed;
            if (IsKeyDown(KEY_LEFT))  world.ship_x -= world.speed;
            if (world.ship_x < 0) world.ship_x = 0;
            if (world.ship_x > SCREEN_W - world.ship_w) world.ship_x = SCREEN_W - world.ship_w;
            if (IsKeyPressed(KEY_SPACE)) {
                // TODO 4a: replace this inline block with spawnBullet(world, x, y)
                for (int i = 0; i < MAX_BULLETS; i++) {
                    if (!world.bullet_active[i]) {
                        world.bullet_x[i] = (int)world.ship_x + world.ship_w/2 - 2;
                        world.bullet_y[i] = (int)world.ship_y;
                        world.bullet_active[i] = true; break;
                    }
                }
            }
            for (int i = 0; i < MAX_BULLETS; i++) {
                if (world.bullet_active[i]) {
                    world.bullet_y[i] -= 8;
                    // TODO 4b: replace world.bullet_active[i]=false with despawnBullet(world,i)
                    if (world.bullet_y[i] < -10) world.bullet_active[i] = false;
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
                        // TODO 4c: replace world.bullet_active[b]=false with despawnBullet(world,b)
                        world.bullet_active[b] = false;
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
        { int e=0; for(int i=0;i<MAX_ENEMIES;i++) if(world.enemy_active[i]) e++;
          DrawText(TextFormat("Enemies: %d/5", e), 10, 160, 20, SKYBLUE); }
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
    cout<<"Bullet pool: "<<MAX_BULLETS<<" slots"<<endl;
    cout<<"Shots fired: "<<world.shots_fired<<endl;
    { int b=0; for(int i=0;i<MAX_BULLETS;i++) if(world.bullet_active[i]) b++;
      cout<<"In flight: "<<b<<endl;
      cout<<"Recycled: "<<(MAX_BULLETS-b)<<endl; }
    cout<<"Pattern: bullet-pool"<<endl;

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
        { int e=0; for(int i=0;i<MAX_ENEMIES;i++) if(world.enemy_active[i]) e++;
          DrawText(TextFormat("Enemies: %d/5", e), 10, 160, 20, SKYBLUE); }
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Bullet pool size reported", expectedOutput: "Bullet pool: 10 slots" },
      { id: "g2", description: "Zero shots at startup", expectedOutput: "Shots fired: 0" },
      { id: "g3", description: "Zero in flight at startup", expectedOutput: "In flight: 0" },
      { id: "g4", description: "All recycled at startup", expectedOutput: "Recycled: 10" },
      { id: "g5", description: "Pattern name printed", expectedOutput: "Pattern: bullet-pool" },
    ],
    hints: [
      "Add shots_fired to World struct and initialize to 0 in main.",
      "spawnBullet uses findFreeSlot(w.bullet_active, MAX_BULLETS). despawnBullet sets active=false and zeroes x/y.",
      "Replace the inline fire block with one spawnBullet call. Two places need despawnBullet: screen bounds + collision.",
    ],
    estimatedMinutes: 18,
  },
};