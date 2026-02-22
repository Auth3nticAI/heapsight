import type { Lesson } from "@/types/lesson";

export const lessonShooter18: Lesson = {
  id: "shooter-18-despawn-recycle",
  title: "Despawn & Recycle",
  description: "Add despawnEnemy() to clean slots on death — zeroing stale data so recycled slots are safe for the next entity.",
  order: 18,
  xpReward: 100,
  tier: "pro",
  concepts: ["despawn", "slot recycling", "ghost data prevention", "pool symmetry"],
  part1: {
    title: "Concept: Despawn & Recycle",
    type: "concept",
    instructions: `# Despawn & Recycle

## Mental Model
Spawning writes data INTO a slot. Despawning writes it BACK to zero. The slot's active flag drops to false and it re-enters the free pool. No memory freed. No destructor. Just a flag flip and a data wipe.

## What Breaks Without This
If you only flip \`active[id] = false\` without resetting the data, stale values linger in the arrays. The next entity spawned into that slot inherits the previous entity's position, speed, and color — a ghost. Hard to debug, impossible to reproduce deterministically.

## The Fix: Explicit Despawn
\`\`\`cpp
void despawnEnemy(World& w, int id) {
    w.enemy_active[id] = false;
    // Reset to safe defaults — no ghost data
    w.enemy_x[id] = 0;  w.enemy_y[id] = 0;
    w.enemy_speed[id] = 0;
    w.enemy_color[id] = BLACK;
}
\`\`\`
The zero-reset is cheap: a handful of writes. The protection: no surprise from stale data when the slot is reused. Production engines call this "entity recycling."

## Key Concepts
- Active flag false = slot available for reuse
- Data reset prevents ghost values in reused slots
- Despawn is the inverse of spawn — symmetry is by design
- Pool size stays constant — no memory allocated or freed

## Performance Insight
Resetting 4-5 fields per entity despawn costs ~5 memory writes. Vector erase() costs O(N) element shifts plus possible heap operation. The pool despawn is asymptotically free.

## Memory Insight
The slot's memory is never returned to the OS. The allocator (your array) has permanent ownership. "Recycling" is just a bookkeeping update — the bits are already there, waiting to be overwritten.

## Your Task
Simulate spawn → despawn → recycle. Show that slots are reused cleanly.

Expected output:
\`\`\`
Pool: 5 slots
Active: 3
Recycled: 2
Pattern: recycle
\`\`\`

## Beginner Trap
Don't call \`delete\` or \`free()\` on a pool entity. The data lives in a static array — it was never heap allocated. Calling delete on it is undefined behavior and will crash.

## Elite Insight
Unreal Engine's \`AActor\` uses a similar pattern: \`Destroy()\` marks the actor pending kill, then the tick loop recycles it. Unity's \`ObjectPool<T>\` calls \`actionOnReturn\` to reset state before returning to pool. Both are this exact despawn-then-reset pattern.

## Systems Thinking Connection
RPG Lesson 18 uses the same despawn for killed monsters. Platformer Lesson 35 (Cleanup System) does a pass each frame resetting dead entities. Every game that pools entities has a despawn function.

## Skill Reinforcement
Built on: L17 Spawn Function — despawn is the inverse of spawn.
Feeds into: L19 Bullet Pool — bullets need fast spawn AND despawn every frame.

## Mastery Check
*Question:* Why reset entity data on despawn instead of on the NEXT spawn?
*Answer:* Stale data can be read before the next spawn overwrites it — e.g., a debug display or a collision check on a "dead" slot. Zeroing on despawn guarantees clean state immediately.`,
    starterCode: `#include <iostream>
using namespace std;

const int POOL = 5;
float ex[POOL] = {};
float ey[POOL] = {};
bool  ea[POOL] = {};

int findFreeSlot() {
    for (int i = 0; i < POOL; i++) if (!ea[i]) return i;
    return -1;
}

int spawn(float x, float y) {
    int id = findFreeSlot();
    if (id < 0) return -1;
    ex[id]=x; ey[id]=y; ea[id]=true;
    return id;
}

// TODO 1: implement despawn(int id) — set ea[id]=false, zero ex[id] and ey[id]
void despawn(int id) {
    // your code here
}

int main() {
    // Spawn 5, then despawn 2
    for (int i = 0; i < 5; i++) spawn(i * 50.0f, 10.0f);
    // TODO 2: despawn slots 1 and 3

    int alive = 0;
    for (int i = 0; i < POOL; i++) if (ea[i]) alive++;
    cout << "Pool: " << POOL << " slots" << endl;
    cout << "Active: " << alive << endl;
    // TODO 3: count recycled (despawned) slots and print "Recycled: N"
    cout << "Pattern: recycle" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int POOL = 5;
float ex[POOL] = {};
float ey[POOL] = {};
bool  ea[POOL] = {};

int findFreeSlot() {
    for (int i = 0; i < POOL; i++) if (!ea[i]) return i;
    return -1;
}

int spawn(float x, float y) {
    int id = findFreeSlot();
    if (id < 0) return -1;
    ex[id]=x; ey[id]=y; ea[id]=true;
    return id;
}

void despawn(int id) {
    ea[id] = false;
    ex[id] = 0; ey[id] = 0;
}

int main() {
    for (int i = 0; i < 5; i++) spawn(i * 50.0f, 10.0f);
    despawn(1);
    despawn(3);

    int alive = 0, recycled = 0;
    for (int i = 0; i < POOL; i++) {
        if (ea[i]) alive++; else recycled++;
    }
    cout << "Pool: " << POOL << " slots" << endl;
    cout << "Active: " << alive << endl;
    cout << "Recycled: " << recycled << endl;
    cout << "Pattern: recycle" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Pool size reported", expectedOutput: "Pool: 5 slots" },
      { id: "t2", description: "Active count after 2 despawns", expectedOutput: "Active: 3" },
      { id: "t3", description: "Recycled count correct", expectedOutput: "Recycled: 2" },
      { id: "t4", description: "Pattern name printed", expectedOutput: "Pattern: recycle" },
    ],
    hints: [
      "despawn() sets ea[id]=false and zeros the position. Implement it like the inverse of spawn().",
      "Call despawn(1) and despawn(3) in main() after the initial spawn loop.",
      "Count recycled slots: for each i where !ea[i], increment recycled counter.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Build: Despawn & Recycle",
    type: "game_builder",
    instructions: `# Build: Despawn & Recycle

## Mental Model
Add \`despawnEnemy()\` to the game. Call it in the collision handler instead of just flipping the active flag. The slot is then clean for immediate reuse by the next wave.

## What's Already Here
Full SoA shooter from L17 (spawn function implemented). The collision handler currently does:
\`\`\`cpp
if (hit) { world.bullet_active[b]=false; world.enemy_active[e]=false; world.score+=100; }
\`\`\`
It only flips the active flag — stale data lingers. You'll replace the enemy deactivation with a proper despawn call.

## Your Task

**TODO 1** — Add \`despawnEnemy(World& w, int id)\` below \`spawnEnemy\`:
\`\`\`cpp
void despawnEnemy(World& w, int id) {
    w.enemy_active[id] = false;
    w.enemy_x[id] = 0;  w.enemy_y[id] = 0;
    w.enemy_speed[id] = 0;
    w.enemy_color[id] = BLACK;
}
\`\`\`

**TODO 2** — In the collision handler, replace:
\`\`\`cpp
world.enemy_active[e] = false;
\`\`\`
with:
\`\`\`cpp
despawnEnemy(world, e);
\`\`\`

## Did It Work?
Behavior looks identical from the outside — but slots are now cleaned on death. The HUD "Enemies:" counter still shows the live count. The console prints pool stats at startup.`,
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

// TODO 1: add despawnEnemy(World& w, int id)
// Set active=false, zero x/y/speed, reset color to BLACK

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
    world.score = 0; world.wave = 1;
    world.player_hp = 3; world.player_max_hp = 3;
    for (int i = 0; i < MAX_BULLETS; i++) world.bullet_active[i] = false;
    for (int i = 0; i < MAX_ENEMIES; i++) world.enemy_active[i] = false;
    spawnWave(world);
    { int a=0,r=0; for(int i=0;i<MAX_ENEMIES;i++){if(world.enemy_active[i])a++;else r++;}
      cout<<"Pool: "<<MAX_ENEMIES<<" slots"<<endl;
      cout<<"Active: "<<a<<endl;
      cout<<"Recycled: "<<r<<endl;
      cout<<"Pattern: recycle"<<endl; }

    while (!WindowShouldClose()) {
        float dt = GetFrameTime();
        accumulator += dt;
        while (accumulator >= FIXED_DT) {
            if (IsKeyDown(KEY_RIGHT)) world.ship_x += world.speed;
            if (IsKeyDown(KEY_LEFT))  world.ship_x -= world.speed;
            if (world.ship_x < 0) world.ship_x = 0;
            if (world.ship_x > SCREEN_W - world.ship_w) world.ship_x = SCREEN_W - world.ship_w;
            if (IsKeyPressed(KEY_SPACE)) {
                for (int i = 0; i < MAX_BULLETS; i++) {
                    if (!world.bullet_active[i]) {
                        world.bullet_x[i] = (int)world.ship_x + world.ship_w/2 - 2;
                        world.bullet_y[i] = (int)world.ship_y;
                        world.bullet_active[i] = true; break;
                    }
                }
            }
            for (int i = 0; i < MAX_BULLETS; i++) {
                if (world.bullet_active[i]) { world.bullet_y[i] -= 8; if (world.bullet_y[i] < -10) world.bullet_active[i] = false; }
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
                        world.bullet_active[b] = false;
                        // TODO 2: replace world.enemy_active[e]=false with despawnEnemy(world, e)
                        world.enemy_active[e] = false;
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
        { int e=0; for(int i=0;i<MAX_ENEMIES;i++) if(world.enemy_active[i]) e++;
          DrawText(TextFormat("Enemies: %d/5", e), 10, 130, 20, SKYBLUE); }
        DrawText("Recycle ON", 10, 160, 20, GREEN);
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
    w.enemy_speed[id] = 0;
    w.enemy_color[id] = BLACK;
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
    world.score = 0; world.wave = 1;
    world.player_hp = 3; world.player_max_hp = 3;
    for (int i = 0; i < MAX_BULLETS; i++) world.bullet_active[i] = false;
    for (int i = 0; i < MAX_ENEMIES; i++) world.enemy_active[i] = false;
    spawnWave(world);
    { int a=0,r=0; for(int i=0;i<MAX_ENEMIES;i++){if(world.enemy_active[i])a++;else r++;}
      cout<<"Pool: "<<MAX_ENEMIES<<" slots"<<endl;
      cout<<"Active: "<<a<<endl;
      cout<<"Recycled: "<<r<<endl;
      cout<<"Pattern: recycle"<<endl; }

    while (!WindowShouldClose()) {
        float dt = GetFrameTime();
        accumulator += dt;
        while (accumulator >= FIXED_DT) {
            if (IsKeyDown(KEY_RIGHT)) world.ship_x += world.speed;
            if (IsKeyDown(KEY_LEFT))  world.ship_x -= world.speed;
            if (world.ship_x < 0) world.ship_x = 0;
            if (world.ship_x > SCREEN_W - world.ship_w) world.ship_x = SCREEN_W - world.ship_w;
            if (IsKeyPressed(KEY_SPACE)) {
                for (int i = 0; i < MAX_BULLETS; i++) {
                    if (!world.bullet_active[i]) {
                        world.bullet_x[i] = (int)world.ship_x + world.ship_w/2 - 2;
                        world.bullet_y[i] = (int)world.ship_y;
                        world.bullet_active[i] = true; break;
                    }
                }
            }
            for (int i = 0; i < MAX_BULLETS; i++) {
                if (world.bullet_active[i]) { world.bullet_y[i] -= 8; if (world.bullet_y[i] < -10) world.bullet_active[i] = false; }
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
        { int e=0; for(int i=0;i<MAX_ENEMIES;i++) if(world.enemy_active[i]) e++;
          DrawText(TextFormat("Enemies: %d/5", e), 10, 130, 20, SKYBLUE); }
        DrawText("Recycle ON", 10, 160, 20, GREEN);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Pool size printed", expectedOutput: "Pool: 5 slots" },
      { id: "g2", description: "Active count at startup", expectedOutput: "Active: 5" },
      { id: "g3", description: "Recycled count at startup", expectedOutput: "Recycled: 0" },
      { id: "g4", description: "Pattern name printed", expectedOutput: "Pattern: recycle" },
    ],
    hints: [
      "Add despawnEnemy() after spawnEnemy() — same parameters, opposite effect.",
      "In the collision handler, replace world.enemy_active[e]=false with despawnEnemy(world, e).",
      "The console output is printed at init time before any gameplay — 5 active, 0 recycled.",
    ],
    estimatedMinutes: 12,
  },
};