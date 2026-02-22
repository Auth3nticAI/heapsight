import type { Lesson } from "@/types/lesson";

export const lessonShooter17: Lesson = {
  id: "shooter-17-spawn-function",
  title: "Spawn Function",
  description: "Implement findFreeSlot() and spawnEnemy() to place entities into a fixed pool without any heap allocation.",
  order: 17,
  xpReward: 100,
  tier: "pro",
  concepts: ["free-slot scan", "object pooling", "fixed array", "entity spawning"],
  part1: {
    title: "Concept: The Free-Slot Scan",
    type: "concept",
    instructions: `# Spawn Function

## Mental Model
Every entity in your game lives in a fixed-size array. 'Spawning' means finding an inactive slot and writing data into it. No heap. No \`new\`. No memory management. The CPU does one linear scan — done.

## What Breaks Without This
The naive approach uses \`vector.push_back()\`. That heap-allocates on spawn, possibly triggers a reallocation (copies all data), and then you need \`erase()\` on death. Three heap operations per spawn/despawn cycle. At 60fps with 30 enemies that's thousands of allocations per minute — and potential frame spikes every time the vector resizes.

## The Fix: Linear Free-Slot Scan
\`\`\`cpp
int findFreeSlot(bool active[], int max) {
    for (int i = 0; i < max; i++)
        if (!active[i]) return i;  // first inactive slot
    return -1;  // pool full
}

int spawnEnemy(float x, float y, float speed) {
    int id = findFreeSlot(enemy_active, MAX_ENEMIES);
    if (id == -1) return -1;  // pool full, skip
    enemy_x[id] = x;   enemy_y[id] = y;
    enemy_speed[id] = speed;
    enemy_active[id] = true;
    return id;
}
\`\`\`

O(N) scan. N is always small (5-100 enemies). No heap. Slot reuse is automatic — kill an enemy, its slot immediately becomes available for the next spawn.

## Key Concepts
- \`active[]\` bool array is the free-list — one bit per slot
- \`findFreeSlot\` scans left-to-right, returns first dead slot
- Pool full? Return -1 and skip — graceful degradation
- Slot IDs are stable: enemy at slot 2 stays at slot 2 until it dies

## Performance Insight
5 active[] comparisons = ~5 cycles. Vector push_back with reallocation = thousands of cycles plus a cache-miss copy of the entire array. The pool wins by orders of magnitude and the code is simpler.

## Memory Insight
A fixed pool allocates once at program start. The \`active[]\` array is a shadow allocation map — 1 byte per slot. When an entity dies, you zero its active flag. No destructor. No free(). The memory was never given back to the OS and never will be.

## Your Task
Simulate a 5-slot pool. Spawn two entities, kill one, spawn again to show slot reuse.

Expected output:
\`\`\`
Pool: 5 slots
Spawn 0 -> slot 0
Spawn 1 -> slot 1
Kill slot 1
Next free: 1
Pattern: free-slot
\`\`\`

## Beginner Trap
Don't use \`std::vector\` as a substitute. A vector hides heap allocation behind a clean API. The whole point of this pattern is NO heap in the game loop — ever.

## Elite Insight
id Software's Quake entity table uses exactly this pattern. Entities are slots in a fixed array. \`G_Spawn()\` scans \`g_entities[]\` for an inactive entry. Doom 3 has \`idEntityAllocator\` doing the same thing with a 64-bit bitmask free-list for O(1) slot finding.

## Systems Thinking Connection
RPG Lesson 14 uses the same free-slot scan for its entity manager. Platformer Lesson 35 uses it for the cleanup system. The pattern is universal — fixed pool, linear scan, index reuse.

## Skill Reinforcement
Built on: L16 Fixed Timestep — the pool tick is now deterministic.
Feeds into: L18 Despawn & Recycle — learn how to safely return slots to the pool.

## Mastery Check
*Question:* Pool has 5 slots, all active. You kill slot 2. Next call to findFreeSlot returns what?
*Answer:* 2 — the scan finds the first inactive slot left-to-right.`,
    starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 5;
bool active[POOL_SIZE] = { false };

// TODO 1: Implement findFreeSlot — scan active[], return first false index
// Return -1 if all slots are occupied.
int findFreeSlot() {
    // TODO: for loop over POOL_SIZE
    return -1;
}

int spawn(int item_id) {
    // TODO 2: call findFreeSlot(), if valid set active[slot]=true and return slot
    return -1;
}

int main() {
    cout << "Pool: " << POOL_SIZE << " slots" << endl;
    int s0 = spawn(0);
    cout << "Spawn 0 -> slot " << s0 << endl;
    int s1 = spawn(1);
    cout << "Spawn 1 -> slot " << s1 << endl;
    // TODO 3: set active[s1] = false to kill slot 1
    cout << "Kill slot " << s1 << endl;
    int s2 = findFreeSlot();
    cout << "Next free: " << s2 << endl;
    cout << "Pattern: free-slot" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 5;
bool active[POOL_SIZE] = { false };

int findFreeSlot() {
    for (int i = 0; i < POOL_SIZE; i++)
        if (!active[i]) return i;
    return -1;
}

int spawn(int item_id) {
    int slot = findFreeSlot();
    if (slot == -1) return -1;
    active[slot] = true;
    return slot;
}

int main() {
    cout << "Pool: " << POOL_SIZE << " slots" << endl;
    int s0 = spawn(0);
    cout << "Spawn 0 -> slot " << s0 << endl;
    int s1 = spawn(1);
    cout << "Spawn 1 -> slot " << s1 << endl;
    active[s1] = false;
    cout << "Kill slot " << s1 << endl;
    int s2 = findFreeSlot();
    cout << "Next free: " << s2 << endl;
    cout << "Pattern: free-slot" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Pool size reported", expectedOutput: "Pool: 5 slots" },
      { id: "t2", description: "First entity spawns at slot 0", expectedOutput: "Spawn 0 -> slot 0" },
      { id: "t3", description: "Second entity spawns at slot 1", expectedOutput: "Spawn 1 -> slot 1" },
      { id: "t4", description: "Kill reported", expectedOutput: "Kill slot 1" },
      { id: "t5", description: "Slot 1 reused after kill", expectedOutput: "Next free: 1" },
      { id: "t6", description: "Pattern name printed", expectedOutput: "Pattern: free-slot" },
    ],
    hints: [
      "findFreeSlot loops from 0 to POOL_SIZE-1 and returns the index where active[i] is false.",
      "spawn() calls findFreeSlot(), sets active[slot]=true, and returns the slot index.",
      "Set active[s1]=false to kill it. findFreeSlot will return 1 on the next call since it scans left-to-right.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Build: Spawn Function",
    type: "game_builder",
    instructions: `# Build: Spawn Function

## Mental Model
The game already has \`findFreeSlot\` and \`spawnEnemy\` — but now YOU build the body. Understanding the internals means you can adapt the pattern for bullets, particles, power-ups, and any future entity type.

## What's Already Here
Full SoA shooter from Lesson 16 with fixed timestep. The function SIGNATURES exist:
- \`EntityId findFreeSlot(bool active[], int max)\`
- \`EntityId spawnEnemy(World& w, float x, float y, float speed, Color c)\`
Both function BODIES are stubbed out with TODOs.

## Your Task

**TODO 1** — Implement \`findFreeSlot\`:
\`\`\`cpp
EntityId findFreeSlot(bool active[], int max) {
    for (int i = 0; i < max; i++)
        if (!active[i]) return i;
    return INVALID_ID;
}
\`\`\`

**TODO 2** — Implement \`spawnEnemy\`:
\`\`\`cpp
EntityId spawnEnemy(World& w, float x, float y, float speed, Color c) {
    EntityId id = findFreeSlot(w.enemy_active, MAX_ENEMIES);
    if (id == INVALID_ID) return INVALID_ID;
    w.enemy_x[id] = x;  w.enemy_y[id] = y;
    w.enemy_speed[id] = speed;  w.enemy_color[id] = c;
    w.enemy_active[id] = true;
    return id;
}
\`\`\`

## Did It Work?
The HUD shows "Enemies: N/5" — you can watch the count change as enemies are killed and new waves spawn. The console prints the pool state at startup.`,
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
    // TODO 1: scan active[] and return first index where active[i] == false
    // If no free slot found, return INVALID_ID
    return INVALID_ID;
}

EntityId spawnEnemy(World& w, float x, float y, float speed, Color c) {
    // TODO 2: call findFreeSlot(w.enemy_active, MAX_ENEMIES)
    // If valid, write x/y/speed/color/active into the slot and return id
    return INVALID_ID;
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
    { int alive=0; for(int i=0;i<MAX_ENEMIES;i++) if(world.enemy_active[i]) alive++;
      cout<<"Pool: "<<MAX_ENEMIES<<" slots"<<endl;
      cout<<"Spawned: "<<alive<<endl;
      cout<<"Pattern: free-slot"<<endl; }

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
                    if (hit) { world.bullet_active[b]=false; world.enemy_active[e]=false; world.score+=100; }
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
        DrawText("Fixed DT", 10, 160, 20, GRAY);
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
    { int alive=0; for(int i=0;i<MAX_ENEMIES;i++) if(world.enemy_active[i]) alive++;
      cout<<"Pool: "<<MAX_ENEMIES<<" slots"<<endl;
      cout<<"Spawned: "<<alive<<endl;
      cout<<"Pattern: free-slot"<<endl; }

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
                    if (hit) { world.bullet_active[b]=false; world.enemy_active[e]=false; world.score+=100; }
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
        DrawText("Fixed DT", 10, 160, 20, GRAY);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Pool size printed at startup", expectedOutput: "Pool: 5 slots" },
      { id: "g2", description: "Spawned count printed", expectedOutput: "Spawned: 5" },
      { id: "g3", description: "Pattern name printed", expectedOutput: "Pattern: free-slot" },
    ],
    hints: [
      "findFreeSlot: for (int i=0; i<max; i++) if (!active[i]) return i; then return INVALID_ID.",
      "spawnEnemy: get id from findFreeSlot. If INVALID_ID return early. Otherwise write all fields and set active[id]=true.",
      "The HUD Enemies counter uses the same active[] scan you just implemented.",
    ],
    estimatedMinutes: 15,
  },
};