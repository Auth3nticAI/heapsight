import type { Lesson } from "@/types/lesson";

export const lessonShooter14: Lesson = {
  id: "shooter-14-soa-formalization",
  title: "SoA Formalization",
  description: "Name the pattern: Structure of Arrays — and prove it by adding a new component in three lines.",
  order: 14,
  xpReward: 100,
  tier: "pro",
  concepts: ["SoA vs AoS", "cache locality", "component extensibility", "data-driven design"],
  part1: {
    title: "Concept: SoA vs AoS",
    type: "concept",
    instructions: `# SoA Formalization

## Mental Model
You've been using SoA since Lesson 6 without naming it. Now you name it. **Structure of Arrays (SoA)** stores each property in its own flat array:

\`\`\`cpp
float enemy_x[MAX];     // all x positions
float enemy_y[MAX];     // all y positions
float enemy_speed[MAX]; // all speeds
bool  enemy_active[MAX];// all flags
\`\`\`

The alternative — **Array of Structs (AoS)** — packs all properties of one entity together:

\`\`\`cpp
struct Enemy { float x, y, speed; bool active; };
Enemy enemies[MAX]; // all of enemy 0 together, then all of enemy 1...
\`\`\`

## Why It Matters: Cache Lines
Your CPU loads memory in 64-byte chunks called **cache lines**. When a movement system reads all enemy y-positions, it only needs \`enemy_y[]\`. With SoA, those 5 floats (20 bytes) fit in a single cache line. With AoS, loading enemy 0's position also loads its speed, active flag, and padding — wasted bytes. Then enemy 1 is another cache line, enemy 2 another...

For a small shooter it doesn't matter. For 10,000 bullets updating every frame, SoA vs AoS can be the difference between 60fps and 20fps.

## Adding a Component Is Trivial
SoA's killer advantage: adding a new property to all enemies takes exactly 3 edits:

1. Add the array: \`float enemy_speed[MAX_ENEMIES];\`
2. Initialize it in spawn: \`w.enemy_speed[id] = 0.5f;\`
3. Use it in the system: \`enemy_y[i] += enemy_speed[i];\`

No touching other arrays. No restructuring structs. No inheritance. The data layout stays flat.

## Key Concepts
- SoA: each property has its own array, indexed by entity ID
- AoS: each entity has its own struct, properties packed together
- SoA wins when systems read one property across many entities
- Adding a component = one array + one init + one read

## Beginner Trap
**Iterating through all components when you only need positions.** If Position, Velocity, HP, and Color are in one struct, loading one entity loads all four fields into cache. SoA keeps Position[] contiguous — iterating positions never touches HP data.

## Elite Insight
Mike Acton (Insomniac Games) demonstrated that SoA layouts can be 10-100x faster than AoS for batch processing. Cache efficiency is the single biggest performance factor in entity-heavy games. Your formalization makes this explicit.

## Systems Thinking Connection
The RPG (L14) formalizes SoA for dungeon entities. The Crawler stores entities as parallel arrays. All paths discover that memory layout determines iteration speed — the same data, reorganized, runs dramatically faster.`,
    starterCode: `#include <iostream>
using namespace std;

// AoS version — enemy as struct
struct EnemyAoS { float x, y, speed; bool active; };

// SoA version — each property in its own array
const int MAX = 5;
float enemy_x[MAX];
float enemy_y[MAX];
float enemy_speed[MAX];
bool  enemy_active[MAX];

int main() {
    // Initialize 5 SoA enemies with different speeds
    for (int i = 0; i < MAX; i++) {
        enemy_x[i] = 80 + i * 140;
        enemy_y[i] = 30;
        enemy_speed[i] = 0.3f + i * 0.1f;  // 0.3, 0.4, 0.5, 0.6, 0.7
        enemy_active[i] = true;
    }

    // TODO: Print "Components: SoA"
    // TODO: Print "Enemies: 5"
    // TODO: Print "Speeds: 5"  (number of speed values initialized)
    // TODO: Print "Layout: flat arrays"

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct EnemyAoS { float x, y, speed; bool active; };

const int MAX = 5;
float enemy_x[MAX];
float enemy_y[MAX];
float enemy_speed[MAX];
bool  enemy_active[MAX];

int main() {
    for (int i = 0; i < MAX; i++) {
        enemy_x[i] = 80 + i * 140;
        enemy_y[i] = 30;
        enemy_speed[i] = 0.3f + i * 0.1f;
        enemy_active[i] = true;
    }

    cout << "Components: SoA" << endl;
    cout << "Enemies: " << MAX << endl;
    cout << "Speeds: " << MAX << endl;
    cout << "Layout: flat arrays" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Reports component layout", expectedOutput: "Components: SoA" },
      { id: "t2", description: "Prints enemy count", expectedOutput: "Enemies: 5" },
      { id: "t3", description: "Prints speed count", expectedOutput: "Speeds: 5" },
      { id: "t4", description: "Confirms flat array layout", expectedOutput: "Layout: flat arrays" },
    ],
    hints: [
      "Add four cout statements — the strings are all plain text, no inner quotes needed.",
      "Use MAX for both Enemies and Speeds — it is the same constant.",
      "Last line: cout << \"Layout: flat arrays\" << endl;",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: SoA Formalization",
    type: "game_builder",
    instructions: `# Build: SoA Formalization

## Mental Model
You will prove SoA is extensible by adding one new component: \`enemy_speed\`. Currently all enemies share the same hardcoded speed (0.5f). After this lesson each enemy has its OWN speed value stored in \`w.enemy_speed[id]\`. The movement system reads from the array — no other code changes.

## What's Already Here
Full ECS shooter from Lesson 13. New in the \`World\` struct:
- \`float enemy_speed[MAX_ENEMIES];\` — declared but not yet initialized

And \`spawnEnemy\` now takes a \`speed\` parameter (already added to the signature).

## Your Task
Three TODOs:

1. **TODO 1 — Initialize speed in spawnEnemy:** Inside \`spawnEnemy\`, after setting x and y, add: \`w.enemy_speed[id] = speed;\`

2. **TODO 2 — Pass speeds in spawnWave:** Update \`spawnWave\` to call \`spawnEnemy(w, 80 + i * 130, 30, 0.3f + i * 0.1f)\` — giving each enemy a unique speed (0.3, 0.4, 0.5, 0.6, 0.7).

3. **TODO 3 — Use speed in movement:** In the enemy movement loop, replace the hardcoded \`0.5f\` with \`world.enemy_speed[i]\`.

## Did It Work?
You should see 5 enemies descending at noticeably different speeds — the rightmost enemy moves fastest. That is SoA in action: one new array, three small edits, entirely new behavior.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const int MAX_BULLETS = 10;
const int MAX_ENEMIES = 5;

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
    bool  enemy_active[MAX_ENEMIES];
    int score, wave;
    int player_hp, player_max_hp;
};

World world;

EntityId findFreeSlot(bool active[], int max) {
    for (int i = 0; i < max; i++) if (!active[i]) return i;
    return INVALID_ID;
}

EntityId spawnEnemy(World& w, float x, float y, float speed) {
    EntityId id = findFreeSlot(w.enemy_active, MAX_ENEMIES);
    if (id == INVALID_ID) return INVALID_ID;
    w.enemy_x[id] = x;
    w.enemy_y[id] = y;
    // TODO 1: Set w.enemy_speed[id] = speed;
    w.enemy_active[id] = true;
    return id;
}

void spawnWave(World& w) {
    // TODO 2: Call spawnEnemy with unique speed per enemy
    // for (int i = 0; i < MAX_ENEMIES; i++) spawnEnemy(w, 80 + i * 130, 30, 0.3f + i * 0.1f);
    for (int i = 0; i < MAX_ENEMIES; i++) spawnEnemy(w, 80 + i * 130, 30, 0.5f);
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

    cout << "Ship: (" << (int)world.ship_x << ", " << (int)world.ship_y << ")" << endl;
    cout << "Components: SoA" << endl;
    cout << "Layout: flat arrays" << endl;

    while (!WindowShouldClose()) {
        if (IsKeyDown(KEY_RIGHT)) world.ship_x += world.speed;
        if (IsKeyDown(KEY_LEFT))  world.ship_x -= world.speed;
        if (world.ship_x < 0) world.ship_x = 0;
        if (world.ship_x > SCREEN_W - world.ship_w) world.ship_x = SCREEN_W - world.ship_w;

        if (IsKeyPressed(KEY_SPACE)) {
            for (int i = 0; i < MAX_BULLETS; i++) {
                if (!world.bullet_active[i]) {
                    world.bullet_x[i] = (int)world.ship_x + world.ship_w/2 - 2;
                    world.bullet_y[i] = (int)world.ship_y;
                    world.bullet_active[i] = true;
                    break;
                }
            }
        }

        for (int i = 0; i < MAX_BULLETS; i++) {
            if (world.bullet_active[i]) {
                world.bullet_y[i] -= 8;
                if (world.bullet_y[i] < -10) world.bullet_active[i] = false;
            }
        }

        for (int i = 0; i < MAX_ENEMIES; i++) {
            if (world.enemy_active[i]) {
                // TODO 3: Replace 0.5f with world.enemy_speed[i]
                world.enemy_y[i] += 0.5f;
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
                DrawRectangle((int)world.enemy_x[i], (int)world.enemy_y[i], 24, 24, RED);

        DrawRectangle((int)world.ship_x, (int)world.ship_y, world.ship_w, world.ship_h, GREEN);

        for (int i = 0; i < MAX_BULLETS; i++)
            if (world.bullet_active[i])
                DrawRectangle(world.bullet_x[i], world.bullet_y[i], 4, 10, YELLOW);

        DrawText("HeapSight Shooter", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", world.score), 10, 40, 20, WHITE);
        DrawText(TextFormat("Wave:  %d", world.wave),  10, 70, 20, WHITE);
        DrawText(TextFormat("HP: %d/%d", world.player_hp, world.player_max_hp), 10, 100, 20, WHITE);

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
    bool  enemy_active[MAX_ENEMIES];
    int score, wave;
    int player_hp, player_max_hp;
};

World world;

EntityId findFreeSlot(bool active[], int max) {
    for (int i = 0; i < max; i++) if (!active[i]) return i;
    return INVALID_ID;
}

EntityId spawnEnemy(World& w, float x, float y, float speed) {
    EntityId id = findFreeSlot(w.enemy_active, MAX_ENEMIES);
    if (id == INVALID_ID) return INVALID_ID;
    w.enemy_x[id] = x;
    w.enemy_y[id] = y;
    w.enemy_speed[id] = speed;
    w.enemy_active[id] = true;
    return id;
}

void spawnWave(World& w) {
    for (int i = 0; i < MAX_ENEMIES; i++) spawnEnemy(w, 80 + i * 130, 30, 0.3f + i * 0.1f);
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

    cout << "Ship: (" << (int)world.ship_x << ", " << (int)world.ship_y << ")" << endl;
    cout << "Components: SoA" << endl;
    cout << "Layout: flat arrays" << endl;

    while (!WindowShouldClose()) {
        if (IsKeyDown(KEY_RIGHT)) world.ship_x += world.speed;
        if (IsKeyDown(KEY_LEFT))  world.ship_x -= world.speed;
        if (world.ship_x < 0) world.ship_x = 0;
        if (world.ship_x > SCREEN_W - world.ship_w) world.ship_x = SCREEN_W - world.ship_w;

        if (IsKeyPressed(KEY_SPACE)) {
            for (int i = 0; i < MAX_BULLETS; i++) {
                if (!world.bullet_active[i]) {
                    world.bullet_x[i] = (int)world.ship_x + world.ship_w/2 - 2;
                    world.bullet_y[i] = (int)world.ship_y;
                    world.bullet_active[i] = true;
                    break;
                }
            }
        }

        for (int i = 0; i < MAX_BULLETS; i++) {
            if (world.bullet_active[i]) {
                world.bullet_y[i] -= 8;
                if (world.bullet_y[i] < -10) world.bullet_active[i] = false;
            }
        }

        for (int i = 0; i < MAX_ENEMIES; i++) {
            if (world.enemy_active[i]) {
                world.enemy_y[i] += world.enemy_speed[i];
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
                DrawRectangle((int)world.enemy_x[i], (int)world.enemy_y[i], 24, 24, RED);

        DrawRectangle((int)world.ship_x, (int)world.ship_y, world.ship_w, world.ship_h, GREEN);

        for (int i = 0; i < MAX_BULLETS; i++)
            if (world.bullet_active[i])
                DrawRectangle(world.bullet_x[i], world.bullet_y[i], 4, 10, YELLOW);

        DrawText("HeapSight Shooter", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", world.score), 10, 40, 20, WHITE);
        DrawText(TextFormat("Wave:  %d", world.wave),  10, 70, 20, WHITE);
        DrawText(TextFormat("HP: %d/%d", world.player_hp, world.player_max_hp), 10, 100, 20, WHITE);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints ship position", expectedOutput: "Ship: (200, 380)" },
      { id: "g2", description: "Reports SoA layout", expectedOutput: "Components: SoA" },
      { id: "g3", description: "Confirms flat array layout", expectedOutput: "Layout: flat arrays" },
    ],
    hints: [
      "TODO 1: Add w.enemy_speed[id] = speed; after the y assignment — one line.",
      "TODO 2: Change the loop body to: spawnEnemy(w, 80 + i * 130, 30, 0.3f + i * 0.1f);",
      "TODO 3: Replace 0.5f with world.enemy_speed[i] — values were set in spawnWave.",
    ],
    estimatedMinutes: 10,
  },
};
