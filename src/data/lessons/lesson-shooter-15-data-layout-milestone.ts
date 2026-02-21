import type { Lesson } from "@/types/lesson";

export const lessonShooter15: Lesson = {
  id: "shooter-15-data-layout-milestone",
  title: "Data Layout Milestone",
  description: "Add a Color component and see the full ECS in action — each entity carries an ID, position, speed, and color.",
  order: 15,
  xpReward: 100,
  tier: "pro",
  concepts: ["Color component", "ECS milestone", "data-driven rendering", "flat array review"],
  part1: {
    title: "Concept: Every Component Is Just an Array",
    type: "concept",
    instructions: `# Data Layout Milestone

## Mental Model
Step back and look at what you've built. Your enemy system is a full ECS:

| Component | Array | Type |
|-----------|-------|------|
| Position X | \`enemy_x[]\` | \`float\` |
| Position Y | \`enemy_y[]\` | \`float\` |
| Speed | \`enemy_speed[]\` | \`float\` |
| Active | \`enemy_active[]\` | \`bool\` |

You never defined an \`Enemy\` class. You never used inheritance. Each "entity" is just an index shared across flat arrays. This is how professional game engines like Unity DOTS, Bevy, and EnTT store entities.

## Adding Color Is Trivial
A Color component is one more array:

\`\`\`cpp
Color enemy_color[MAX_ENEMIES];
\`\`\`

You set it in \`spawnEnemy\`:

\`\`\`cpp
w.enemy_color[id] = color;
\`\`\`

You read it in the render loop:

\`\`\`cpp
DrawRectangle(..., world.enemy_color[i]);
\`\`\`

One array. One init. One read. That is ECS.

## Key Concepts
- Every component is an array indexed by entity ID
- Adding a component never touches other systems
- The render system reads color the same way movement reads speed
- SoA + entity IDs = the foundation of every modern ECS`,
    starterCode: `#include <iostream>
using namespace std;

// Simulate a Color struct (raylib uses this type)
struct Color { unsigned char r, g, b, a; };
const Color RED    = {230, 41, 55, 255};
const Color ORANGE = {255, 161, 0, 255};
const Color YELLOW = {253, 249, 0, 255};
const Color GREEN  = {0, 228, 48, 255};
const Color BLUE   = {0, 121, 241, 255};

const int MAX = 5;
float enemy_x[MAX];
float enemy_y[MAX];
float enemy_speed[MAX];
Color enemy_color[MAX];
bool  enemy_active[MAX];

int main() {
    // Spawn 5 enemies each with a different color
    Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE};
    for (int i = 0; i < MAX; i++) {
        enemy_x[i] = 80 + i * 140;
        enemy_y[i] = 30;
        enemy_speed[i] = 0.3f + i * 0.1f;
        enemy_color[i] = palette[i];
        enemy_active[i] = true;
    }

    // TODO: Print "Components: 5"  (x, y, speed, color, active)
    // TODO: Print "Entities: 5"
    // TODO: Print "Pattern: ECS"
    // TODO: Print "Layout: SoA"

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct Color { unsigned char r, g, b, a; };
const Color RED    = {230, 41, 55, 255};
const Color ORANGE = {255, 161, 0, 255};
const Color YELLOW = {253, 249, 0, 255};
const Color GREEN  = {0, 228, 48, 255};
const Color BLUE   = {0, 121, 241, 255};

const int MAX = 5;
float enemy_x[MAX];
float enemy_y[MAX];
float enemy_speed[MAX];
Color enemy_color[MAX];
bool  enemy_active[MAX];

int main() {
    Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE};
    for (int i = 0; i < MAX; i++) {
        enemy_x[i] = 80 + i * 140;
        enemy_y[i] = 30;
        enemy_speed[i] = 0.3f + i * 0.1f;
        enemy_color[i] = palette[i];
        enemy_active[i] = true;
    }

    cout << "Components: 5" << endl;
    cout << "Entities: 5" << endl;
    cout << "Pattern: ECS" << endl;
    cout << "Layout: SoA" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Reports 5 components", expectedOutput: "Components: 5" },
      { id: "t2", description: "Prints entity count", expectedOutput: "Entities: 5" },
      { id: "t3", description: "Confirms ECS pattern", expectedOutput: "Pattern: ECS" },
      { id: "t4", description: "Confirms SoA layout", expectedOutput: "Layout: SoA" },
    ],
    hints: [
      "Four cout statements — all plain text, no escaped quotes needed.",
      "Components: 5 because there are 5 arrays: x, y, speed, color, active.",
      "Last two lines: Pattern: ECS and Layout: SoA.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Data Layout Milestone",
    type: "game_builder",
    instructions: `# Build: Data Layout Milestone

## Mental Model
You are adding the final component to your ECS: \`Color\`. Each enemy now has its own color stored in \`w.enemy_color[id]\`. When enemies respawn in a new wave, they can appear in a different tint — making wave progression visually clear.

## What's Already Here
Full SoA shooter from Lesson 14 with per-enemy speeds. New in \`World\`:
- \`Color enemy_color[MAX_ENEMIES];\` declared

And \`spawnEnemy\` now takes a \`Color c\` parameter.

## Your Task
Three TODOs:

1. **TODO 1 — Store color in spawnEnemy:** Inside \`spawnEnemy\`, after setting speed, add: \`w.enemy_color[id] = c;\`

2. **TODO 2 — Pass color in spawnWave:** Update \`spawnWave\` to pass a color per enemy. Use a palette: \`Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE};\` and call \`spawnEnemy(w, 80 + i * 130, 30, 0.3f + i * 0.1f, palette[i]);\`

3. **TODO 3 — Draw with color:** In the render loop, replace the hardcoded \`RED\` in \`DrawRectangle\` with \`world.enemy_color[i]\`.

## Did It Work?
You should see 5 enemies each a different color: red, orange, yellow, green, blue. When a new wave spawns, same colors reset. That is your full ECS — six component arrays, one entity per index.`,
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
    Color enemy_color[MAX_ENEMIES];
    bool  enemy_active[MAX_ENEMIES];
    int score, wave;
    int player_hp, player_max_hp;
};

World world;

EntityId findFreeSlot(bool active[], int max) {
    for (int i = 0; i < max; i++) if (!active[i]) return i;
    return INVALID_ID;
}

EntityId spawnEnemy(World& w, float x, float y, float speed, Color c) {
    EntityId id = findFreeSlot(w.enemy_active, MAX_ENEMIES);
    if (id == INVALID_ID) return INVALID_ID;
    w.enemy_x[id] = x;
    w.enemy_y[id] = y;
    w.enemy_speed[id] = speed;
    // TODO 1: Set w.enemy_color[id] = c;
    w.enemy_active[id] = true;
    return id;
}

void spawnWave(World& w) {
    // TODO 2: Define palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE}
    //         Call spawnEnemy(w, 80 + i * 130, 30, 0.3f + i * 0.1f, palette[i])
    for (int i = 0; i < MAX_ENEMIES; i++) spawnEnemy(w, 80 + i * 130, 30, 0.3f + i * 0.1f, RED);
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
    cout << "Pattern: ECS" << endl;
    cout << "Layout: SoA" << endl;

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
                // TODO 3: Replace RED with world.enemy_color[i]
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
    Color enemy_color[MAX_ENEMIES];
    bool  enemy_active[MAX_ENEMIES];
    int score, wave;
    int player_hp, player_max_hp;
};

World world;

EntityId findFreeSlot(bool active[], int max) {
    for (int i = 0; i < max; i++) if (!active[i]) return i;
    return INVALID_ID;
}

EntityId spawnEnemy(World& w, float x, float y, float speed, Color c) {
    EntityId id = findFreeSlot(w.enemy_active, MAX_ENEMIES);
    if (id == INVALID_ID) return INVALID_ID;
    w.enemy_x[id] = x;
    w.enemy_y[id] = y;
    w.enemy_speed[id] = speed;
    w.enemy_color[id] = c;
    w.enemy_active[id] = true;
    return id;
}

void spawnWave(World& w) {
    Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE};
    for (int i = 0; i < MAX_ENEMIES; i++) spawnEnemy(w, 80 + i * 130, 30, 0.3f + i * 0.1f, palette[i]);
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
    cout << "Pattern: ECS" << endl;
    cout << "Layout: SoA" << endl;

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
                DrawRectangle((int)world.enemy_x[i], (int)world.enemy_y[i], 24, 24, world.enemy_color[i]);

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
      { id: "g2", description: "Confirms ECS pattern", expectedOutput: "Pattern: ECS" },
      { id: "g3", description: "Confirms SoA layout", expectedOutput: "Layout: SoA" },
    ],
    hints: [
      "TODO 1: w.enemy_color[id] = c; — one line after the speed assignment.",
      "TODO 2: Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE}; then spawnEnemy(w, 80 + i * 130, 30, 0.3f + i * 0.1f, palette[i]);",
      "TODO 3: Change the last argument of DrawRectangle from RED to world.enemy_color[i].",
    ],
    estimatedMinutes: 12,
  },
};
