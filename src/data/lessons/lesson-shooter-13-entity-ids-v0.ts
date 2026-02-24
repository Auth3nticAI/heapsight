import type { Lesson } from "@/types/lesson";

export const lessonShooter13: Lesson = {
  id: "shooter-13-entity-ids-v0",
  title: "Entity IDs v0",
  description: "Reference entities by integer ID instead of by pointer — the foundation of formal ECS.",
  order: 13,
  xpReward: 100,
  tier: "pro",
  concepts: ["entity IDs", "handle pattern", "ID-based reference", "ECS foundation"],
  part1: {
    title: "Concept: Entities Are Just IDs",
    type: "concept",
    instructions: `# Entity IDs v0

## Mental Model
In a real ECS, an "entity" is nothing but an integer — a handle that indexes into component arrays. \`entity 3\` means: look at index 3 of \`enemy_x[]\`, index 3 of \`enemy_y[]\`, index 3 of \`enemy_active[]\`. The entity carries no data itself. It's a key, not an object. This decoupling is what makes ECS so powerful: systems query components by ID, components store data in flat arrays, and nothing owns anything.

## What Breaks Without This
With object-style code (enemies as objects with methods), you can't easily "attach" new behaviors. You'd need inheritance or templates. With ID-based entities, adding a new component array is three lines: declare the array, initialize the slot, process it in a new system. The ID is shared; the data lives in separate arrays.

## The Fix: typedef int EntityId
The simplest possible entity ID:

\`\`\`cpp
typedef int EntityId;
const EntityId INVALID_ID = -1;

// Entity 0 = slot 0 in all component arrays
// Entity 1 = slot 1 in all component arrays
// etc.

EntityId findFreeSlot(bool active[], int max) {
    for (int i = 0; i < max; i++) {
        if (!active[i]) return i;  // Return index as ID
    }
    return INVALID_ID;
}
\`\`\`

Usage:

\`\`\`cpp
EntityId id = findFreeSlot(world.enemy_active, MAX_ENEMIES);
if (id != INVALID_ID) {
    world.enemy_x[id] = 200.0f;
    world.enemy_y[id] = 50.0f;
    world.enemy_active[id] = true;
}
\`\`\`

The ID \`is\` the array index. Simple, fast, zero overhead.

## Key Concepts
- \`typedef int EntityId\` — give the type a meaningful name
- \`INVALID_ID = -1\` — sentinel for "no entity found"
- \`findFreeSlot\` scans \`active[]\` and returns the first false index
- The ID is the index — no separate lookup table needed

## Your Task
Implement findFreeSlot and use it to spawn two entities. Print their IDs and verify they're distinct.

## Beginner Trap
**Using array index as an entity reference.** When entity at index 5 is removed and index 6 shifts down to index 5, every reference to "entity 6" now points to entity 5. Use stable integer IDs that never change for a given entity.

## Elite Insight
Unity ECS uses generation counters with entity IDs — each reused slot increments a version number. If your stored version does not match the current slot version, the reference is stale. Your integer ID system is the simplified foundation.

## Systems Thinking Connection
The RPG (L13) and Crawler (L32) solve the same identity problem. Stable entity IDs are the prerequisite for any system that stores references — save/load, combat targeting, AI behavior all require entities to have persistent identities.`,
    starterCode: `#include <iostream>
using namespace std;

typedef int EntityId;
const EntityId INVALID_ID = -1;
const int MAX_ENEMIES = 5;

bool enemy_active[MAX_ENEMIES] = {false, false, false, false, false};

// TODO: Write EntityId findFreeSlot(bool active[], int max)
//   Loop from 0 to max-1. If active[i] is false, return i.
//   If none found, return INVALID_ID.

int main() {
    // TODO: Call findFreeSlot to get first available ID, set it active, print it
    // Expected: "Spawned entity 0"
    // TODO: Call findFreeSlot again for second entity, set it active, print it
    // Expected: "Spawned entity 1"
    // TODO: Print "Active IDs: 0, 1"
    // TODO: Print "System: ECS"

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

typedef int EntityId;
const EntityId INVALID_ID = -1;
const int MAX_ENEMIES = 5;

bool enemy_active[MAX_ENEMIES] = {false, false, false, false, false};

EntityId findFreeSlot(bool active[], int max) {
    for (int i = 0; i < max; i++) {
        if (!active[i]) return i;
    }
    return INVALID_ID;
}

int main() {
    EntityId id0 = findFreeSlot(enemy_active, MAX_ENEMIES);
    enemy_active[id0] = true;
    cout << "Spawned entity " << id0 << endl;

    EntityId id1 = findFreeSlot(enemy_active, MAX_ENEMIES);
    enemy_active[id1] = true;
    cout << "Spawned entity " << id1 << endl;

    cout << "Active IDs: " << id0 << ", " << id1 << endl;
    cout << "System: ECS" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Spawns first entity at slot 0", expectedOutput: "Spawned entity 0" },
      { id: "t2", description: "Spawns second entity at slot 1", expectedOutput: "Spawned entity 1" },
      { id: "t3", description: "Reports active IDs", expectedOutput: "Active IDs: 0, 1" },
      { id: "t4", description: "Reports system type", expectedOutput: "System: ECS" },
    ],
    hints: [
      "EntityId findFreeSlot(bool active[], int max) { for (int i=0;i<max;i++) if (!active[i]) return i; return INVALID_ID; }",
      "After getting id0, set enemy_active[id0] = true before calling findFreeSlot again — otherwise you'd get 0 twice.",
      "cout << \"Active IDs: \" << id0 << \", \" << id1 << endl;",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Entity IDs v0",
    type: "game_builder",
    instructions: `# Build: Entity IDs v0

## Mental Model
The \`World\` struct from Lesson 12 already stores entities in arrays. Now you make the ID pattern explicit. \`spawnEnemy(World& w)\` uses \`findFreeSlot\` to find the next open slot, sets the data, and returns the \`EntityId\`. The caller doesn't need to know WHICH slot — it just knows it has entity \`id\`.

## What's Already Here
Full World struct shooter from Lesson 12. New additions at file scope:
- \`typedef int EntityId;\` and \`const EntityId INVALID_ID = -1;\`
- \`findFreeSlot(bool active[], int max)\` function
- \`spawnEnemy(World& w)\` stub that uses findFreeSlot

## Your Task
Two TODOs:

1. **TODO 1 — Complete spawnEnemy:** The function calls \`findFreeSlot\` and gets \`id\`. Fill in the rest: set \`w.enemy_x[id]\`, \`w.enemy_y[id]\`, \`w.enemy_active[id] = true\`, and \`return id\`.

2. **TODO 2 — Replace spawnWave:** Update \`spawnWave\` to call \`spawnEnemy(w)\` in a loop instead of directly setting array values. This proves the ID system works end-to-end.`,
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
    bool  enemy_active[MAX_ENEMIES];
    int score, wave;
    int player_hp, player_max_hp;
};

World world;

EntityId findFreeSlot(bool active[], int max) {
    for (int i = 0; i < max; i++) if (!active[i]) return i;
    return INVALID_ID;
}

EntityId spawnEnemy(World& w, float x, float y) {
    EntityId id = findFreeSlot(w.enemy_active, MAX_ENEMIES);
    if (id == INVALID_ID) return INVALID_ID;
    // TODO 1: Set w.enemy_x[id]=x, w.enemy_y[id]=y, w.enemy_active[id]=true, return id
    return INVALID_ID;
}

void spawnWave(World& w) {
    // TODO 2: Replace direct array writes with calls to spawnEnemy(w, x, y)
    // for (int i = 0; i < MAX_ENEMIES; i++) spawnEnemy(w, 80 + i * 130, 30);
    for (int i = 0; i < MAX_ENEMIES; i++) {
        w.enemy_x[i] = 80 + i * 130;
        w.enemy_y[i] = 30;
        w.enemy_active[i] = true;
    }
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
    cout << "Entities: ECS" << endl;
    cout << "Wave: " << world.wave << endl;

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
    bool  enemy_active[MAX_ENEMIES];
    int score, wave;
    int player_hp, player_max_hp;
};

World world;

EntityId findFreeSlot(bool active[], int max) {
    for (int i = 0; i < max; i++) if (!active[i]) return i;
    return INVALID_ID;
}

EntityId spawnEnemy(World& w, float x, float y) {
    EntityId id = findFreeSlot(w.enemy_active, MAX_ENEMIES);
    if (id == INVALID_ID) return INVALID_ID;
    w.enemy_x[id] = x;
    w.enemy_y[id] = y;
    w.enemy_active[id] = true;
    return id;
}

void spawnWave(World& w) {
    for (int i = 0; i < MAX_ENEMIES; i++) spawnEnemy(w, 80 + i * 130, 30);
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
    cout << "Entities: ECS" << endl;
    cout << "Wave: " << world.wave << endl;

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
    tests: [
      { id: "g1", description: "Prints ship position", expectedOutput: "Ship: (200, 380)" },
      { id: "g2", description: "Prints ECS entity system", expectedOutput: "Entities: ECS" },
      { id: "g3", description: "Prints starting wave", expectedOutput: "Wave: 1" },
    ],
    hints: [
      "TODO 1: w.enemy_x[id] = x; w.enemy_y[id] = y; w.enemy_active[id] = true; return id;",
      "TODO 2: Replace the loop body with: spawnEnemy(w, 80 + i * 130, 30); Remove the old direct assignments.",
      "Make sure to zero-init enemy_active before spawnWave: for (int i=0;i<MAX_ENEMIES;i++) world.enemy_active[i]=false;",
    ],
    estimatedMinutes: 12,
  },
};
