import type { Lesson } from "@/types/lesson";

export const lessonShooter11: Lesson = {
  id: "shooter-11-component-structs-v0",
  title: "Component Structs v0",
  description: "Define Position, Velocity, and Health as POD structs — the first step toward formal ECS components.",
  order: 11,
  xpReward: 100,
  tier: "pro",
  concepts: ["struct", "POD types", "member access", "component data model"],
  part1: {
    title: "Concept: Structs Group Related Data",
    type: "concept",
    instructions: `# Component Structs v0

## Mental Model
Right now your game state is a pile of parallel arrays: \`enemy_x[]\`, \`enemy_y[]\`, \`enemy_active[]\`. These are related — they all describe the same enemy — but they're disconnected at the type level. A \`struct\` bundles related fields into a named type. It's not a class — no methods, no inheritance, no virtual dispatch. Just data, packed together.

## What Breaks Without This
Parallel arrays work but they don't communicate intent. When you see \`float enemy_x[100]\` and \`float enemy_y[100]\`, you have to mentally link them. A \`struct Position { float x, y; };\` makes the relationship explicit in the type system. It also lets you pass a single \`Position\` to a function instead of two separate floats.

## The Fix: POD Structs
Plain Old Data (POD) structs have no constructors, no virtual functions, no inheritance. They're pure data containers:

\`\`\`cpp
struct Position {
    float x;
    float y;
};

struct Velocity {
    float vx;
    float vy;
};

struct Health {
    int hp;
    int max_hp;
};
\`\`\`

Access members with dot notation:

\`\`\`cpp
Position pos;
pos.x = 100.0f;
pos.y = 200.0f;

Velocity vel;
vel.vx = 0.0f;
vel.vy = 1.5f;
\`\`\`

In ECS, structs become components. Each entity has a Position component, a Velocity component, a Health component. The parallel arrays STAY — but now they hold structs instead of loose floats.

## Key Concepts
- \`struct Name { type field; };\` — defines a new type
- POD: no methods, no inheritance, just data
- Dot notation: \`pos.x\`, \`vel.vy\`, \`hp.max_hp\`
- Structs can be stored in arrays: \`Position positions[100];\`

## Your Task
Define the three component structs. Create one of each, set values, and print them.

## Beginner Trap
**Adding methods to component structs.** Components should be plain data (POD types) — no constructors, no methods, no inheritance. Behavior belongs in systems, not in data. If your Position struct has a move() method, you have mixed data and logic.

## Elite Insight
Every ECS framework enforces "components are data, systems are behavior." EnTT, flecs, and Unity DOTS all use plain structs for components. Methods on components create hidden dependencies between data and logic.

## Systems Thinking Connection
The RPG uses plain structs for entities too — no methods, just fields. The Crawler stores entities as position + sprite data. POD component structs are the foundation of data-oriented design across all game architectures.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Define struct Position { float x; float y; };
// TODO: Define struct Velocity { float vx; float vy; };
// TODO: Define struct Health { int hp; int max_hp; };

int main() {
    // TODO: Create a Position named pos, set x=400, y=380
    // TODO: Create a Velocity named vel, set vx=0, vy=-8
    // TODO: Create a Health named hp, set hp=3, max_hp=3

    // TODO: Print "Pos: (400, 380)"  using (int) casts on pos.x, pos.y
    // TODO: Print "Vel: (0, -8)"     using (int) casts on vel.vx, vel.vy
    // TODO: Print "HP: 3/3"          using hp.hp and hp.max_hp

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct Position {
    float x;
    float y;
};

struct Velocity {
    float vx;
    float vy;
};

struct Health {
    int hp;
    int max_hp;
};

int main() {
    Position pos;
    pos.x = 400.0f;
    pos.y = 380.0f;

    Velocity vel;
    vel.vx = 0.0f;
    vel.vy = -8.0f;

    Health hp;
    hp.hp = 3;
    hp.max_hp = 3;

    cout << "Pos: (" << (int)pos.x << ", " << (int)pos.y << ")" << endl;
    cout << "Vel: (" << (int)vel.vx << ", " << (int)vel.vy << ")" << endl;
    cout << "HP: " << hp.hp << "/" << hp.max_hp << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints position", expectedOutput: "Pos: (400, 380)" },
      { id: "t2", description: "Prints velocity", expectedOutput: "Vel: (0, -8)" },
      { id: "t3", description: "Prints health", expectedOutput: "HP: 3/3" },
    ],
    hints: [
      "struct Position { float x; float y; }; — note the semicolon after the closing brace.",
      "Access with dot: pos.x = 400.0f; Cast to int for printing: (int)pos.x",
      "HP uses int members directly — no cast needed: hp.hp << \"/\" << hp.max_hp",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Component Structs v0",
    type: "game_builder",
    instructions: `# Build: Component Structs v0

## Mental Model
You're not changing gameplay — you're changing the data model underneath. The three component structs (Position, Velocity, Health) are defined at the top of the file. Your game's global state now uses a \`Position\` for the ship instead of loose \`ship_x\`/\`ship_y\` variables. The rendering and logic are identical — only the data representation changes.

## What's Already Here
Full Micro Shooter from Lesson 10. Three new struct definitions added at file scope: \`Position\`, \`Velocity\`, \`Health\`.

## Your Task
Four TODOs:

1. **TODO 1 — Ship as struct:** Replace the \`ship_x\`/\`ship_y\` float variables with \`Position ship_pos\`. Initialize \`ship_pos.x = 200\`, \`ship_pos.y = 380\` in the init section.

2. **TODO 2 — Ship velocity:** Add \`Velocity ship_vel\`. Initialize \`ship_vel.vx = 0\`, \`ship_vel.vy = 0\`. Apply it in the game loop: \`ship_pos.x += ship_vel.vx\` each frame (not currently used for movement, but the struct is there for Phase 2).

3. **TODO 3 — Player health:** Add \`Health player_hp\`. Initialize \`player_hp.hp = 3\`, \`player_hp.max_hp = 3\`. Display on HUD: \`DrawText(TextFormat("HP: %d/%d", player_hp.hp, player_hp.max_hp), 10, 100, 20, WHITE)\`.

4. **TODO 4 — Update ship movement:** Replace \`ship_x += speed\`/\`ship_x -= speed\` with \`ship_pos.x += speed\`/\`ship_pos.x -= speed\`. Update bounds checks and DrawRectangle to use \`ship_pos.x\`, \`ship_pos.y\`.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const int MAX_BULLETS = 10;
const int MAX_ENEMIES = 5;

// Component structs
struct Position { float x; float y; };
struct Velocity { float vx; float vy; };
struct Health   { int hp; int max_hp; };

// Ship — using loose vars for now, TODOs will migrate them to structs
int ship_x = 200;
int ship_y = 380;
int ship_w = 40;
int ship_h = 20;
int speed = 5;

// TODO 1: Add: Position ship_pos; (initialized in main: ship_pos.x=200, ship_pos.y=380)
// TODO 2: Add: Velocity ship_vel; (initialized: vx=0, vy=0)
// TODO 3: Add: Health player_hp; (initialized: hp=3, max_hp=3)

// Bullet arrays
int bullet_x[MAX_BULLETS];
int bullet_y[MAX_BULLETS];
bool bullet_active[MAX_BULLETS];

// Enemy arrays
float enemy_x[MAX_ENEMIES];
float enemy_y[MAX_ENEMIES];
bool enemy_active[MAX_ENEMIES];

int score = 0;
int wave = 1;

void spawnWave() {
    for (int i = 0; i < MAX_ENEMIES; i++) {
        enemy_x[i] = 80 + i * 130;
        enemy_y[i] = 30;
        enemy_active[i] = true;
    }
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter");
    SetTargetFPS(60);

    for (int i = 0; i < MAX_BULLETS; i++) bullet_active[i] = false;
    spawnWave();

    // TODO: Initialize ship_pos, ship_vel, player_hp here

    cout << "Ship: (" << ship_x << ", " << ship_y << ")" << endl;
    cout << "HP: 3/3" << endl;
    cout << "Wave: " << wave << endl;

    while (!WindowShouldClose()) {
        // TODO 4: Replace ship_x/ship_y with ship_pos.x/ship_pos.y below
        if (IsKeyDown(KEY_RIGHT)) ship_x += speed;
        if (IsKeyDown(KEY_LEFT)) ship_x -= speed;
        if (ship_x < 0) ship_x = 0;
        if (ship_x > SCREEN_W - ship_w) ship_x = SCREEN_W - ship_w;

        if (IsKeyPressed(KEY_SPACE)) {
            for (int i = 0; i < MAX_BULLETS; i++) {
                if (!bullet_active[i]) {
                    bullet_x[i] = ship_x + ship_w/2 - 2;
                    bullet_y[i] = ship_y;
                    bullet_active[i] = true;
                    break;
                }
            }
        }

        for (int i = 0; i < MAX_BULLETS; i++) {
            if (bullet_active[i]) { bullet_y[i] -= 8; if (bullet_y[i] < -10) bullet_active[i] = false; }
        }

        for (int i = 0; i < MAX_ENEMIES; i++) {
            if (enemy_active[i]) { enemy_y[i] += 0.5f; if (enemy_y[i] > SCREEN_H) enemy_y[i] = 0; }
        }

        for (int b = 0; b < MAX_BULLETS; b++) {
            if (!bullet_active[b]) continue;
            for (int e = 0; e < MAX_ENEMIES; e++) {
                if (!enemy_active[e]) continue;
                bool hit = bullet_x[b] < (int)enemy_x[e]+24 && bullet_x[b]+4 > (int)enemy_x[e] &&
                           bullet_y[b] < (int)enemy_y[e]+24 && bullet_y[b]+10 > (int)enemy_y[e];
                if (hit) { bullet_active[b] = false; enemy_active[e] = false; score += 100; }
            }
        }

        int alive = 0;
        for (int i = 0; i < MAX_ENEMIES; i++) if (enemy_active[i]) alive++;
        if (alive == 0) { wave++; spawnWave(); }

        BeginDrawing();
        ClearBackground(BLACK);

        DrawRectangle(100, 50, 2, 2, WHITE); DrawRectangle(200, 120, 2, 2, WHITE);
        DrawRectangle(350, 30, 2, 2, WHITE); DrawRectangle(500, 80, 2, 2, WHITE);
        DrawRectangle(650, 150, 2, 2, WHITE); DrawRectangle(750, 60, 2, 2, WHITE);
        DrawRectangle(50, 200, 2, 2, WHITE); DrawRectangle(300, 250, 2, 2, WHITE);
        DrawRectangle(450, 180, 2, 2, WHITE); DrawRectangle(600, 300, 2, 2, WHITE);
        DrawRectangle(150, 350, 2, 2, WHITE); DrawRectangle(700, 380, 2, 2, WHITE);

        for (int i = 0; i < MAX_ENEMIES; i++)
            if (enemy_active[i]) DrawRectangle((int)enemy_x[i], (int)enemy_y[i], 24, 24, RED);

        // TODO 4: Change to DrawRectangle((int)ship_pos.x, (int)ship_pos.y, ship_w, ship_h, GREEN)
        DrawRectangle(ship_x, ship_y, ship_w, ship_h, GREEN);

        for (int i = 0; i < MAX_BULLETS; i++)
            if (bullet_active[i]) DrawRectangle(bullet_x[i], bullet_y[i], 4, 10, YELLOW);

        DrawText("HeapSight Shooter", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", score), 10, 40, 20, WHITE);
        DrawText(TextFormat("Wave: %d", wave), 10, 70, 20, WHITE);
        // TODO 3: DrawText(TextFormat("HP: %d/%d", player_hp.hp, player_hp.max_hp), 10, 100, 20, WHITE)

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

struct Position { float x; float y; };
struct Velocity { float vx; float vy; };
struct Health   { int hp; int max_hp; };

Position ship_pos;
Velocity ship_vel;
Health   player_hp;
int ship_w = 40;
int ship_h = 20;
int speed = 5;

int bullet_x[MAX_BULLETS];
int bullet_y[MAX_BULLETS];
bool bullet_active[MAX_BULLETS];

float enemy_x[MAX_ENEMIES];
float enemy_y[MAX_ENEMIES];
bool enemy_active[MAX_ENEMIES];

int score = 0;
int wave = 1;

void spawnWave() {
    for (int i = 0; i < MAX_ENEMIES; i++) {
        enemy_x[i] = 80 + i * 130;
        enemy_y[i] = 30;
        enemy_active[i] = true;
    }
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter");
    SetTargetFPS(60);

    ship_pos.x = 200.0f; ship_pos.y = 380.0f;
    ship_vel.vx = 0.0f;  ship_vel.vy = 0.0f;
    player_hp.hp = 3;    player_hp.max_hp = 3;

    for (int i = 0; i < MAX_BULLETS; i++) bullet_active[i] = false;
    spawnWave();

    cout << "Ship: (" << (int)ship_pos.x << ", " << (int)ship_pos.y << ")" << endl;
    cout << "HP: " << player_hp.hp << "/" << player_hp.max_hp << endl;
    cout << "Wave: " << wave << endl;

    while (!WindowShouldClose()) {
        if (IsKeyDown(KEY_RIGHT)) ship_pos.x += speed;
        if (IsKeyDown(KEY_LEFT)) ship_pos.x -= speed;
        if (ship_pos.x < 0) ship_pos.x = 0;
        if (ship_pos.x > SCREEN_W - ship_w) ship_pos.x = SCREEN_W - ship_w;

        if (IsKeyPressed(KEY_SPACE)) {
            for (int i = 0; i < MAX_BULLETS; i++) {
                if (!bullet_active[i]) {
                    bullet_x[i] = (int)ship_pos.x + ship_w/2 - 2;
                    bullet_y[i] = (int)ship_pos.y;
                    bullet_active[i] = true;
                    break;
                }
            }
        }

        for (int i = 0; i < MAX_BULLETS; i++) {
            if (bullet_active[i]) { bullet_y[i] -= 8; if (bullet_y[i] < -10) bullet_active[i] = false; }
        }

        for (int i = 0; i < MAX_ENEMIES; i++) {
            if (enemy_active[i]) { enemy_y[i] += 0.5f; if (enemy_y[i] > SCREEN_H) enemy_y[i] = 0; }
        }

        for (int b = 0; b < MAX_BULLETS; b++) {
            if (!bullet_active[b]) continue;
            for (int e = 0; e < MAX_ENEMIES; e++) {
                if (!enemy_active[e]) continue;
                bool hit = bullet_x[b] < (int)enemy_x[e]+24 && bullet_x[b]+4 > (int)enemy_x[e] &&
                           bullet_y[b] < (int)enemy_y[e]+24 && bullet_y[b]+10 > (int)enemy_y[e];
                if (hit) { bullet_active[b] = false; enemy_active[e] = false; score += 100; }
            }
        }

        int alive = 0;
        for (int i = 0; i < MAX_ENEMIES; i++) if (enemy_active[i]) alive++;
        if (alive == 0) { wave++; spawnWave(); }

        BeginDrawing();
        ClearBackground(BLACK);

        DrawRectangle(100, 50, 2, 2, WHITE); DrawRectangle(200, 120, 2, 2, WHITE);
        DrawRectangle(350, 30, 2, 2, WHITE); DrawRectangle(500, 80, 2, 2, WHITE);
        DrawRectangle(650, 150, 2, 2, WHITE); DrawRectangle(750, 60, 2, 2, WHITE);
        DrawRectangle(50, 200, 2, 2, WHITE); DrawRectangle(300, 250, 2, 2, WHITE);
        DrawRectangle(450, 180, 2, 2, WHITE); DrawRectangle(600, 300, 2, 2, WHITE);
        DrawRectangle(150, 350, 2, 2, WHITE); DrawRectangle(700, 380, 2, 2, WHITE);

        for (int i = 0; i < MAX_ENEMIES; i++)
            if (enemy_active[i]) DrawRectangle((int)enemy_x[i], (int)enemy_y[i], 24, 24, RED);

        DrawRectangle((int)ship_pos.x, (int)ship_pos.y, ship_w, ship_h, GREEN);

        for (int i = 0; i < MAX_BULLETS; i++)
            if (bullet_active[i]) DrawRectangle(bullet_x[i], bullet_y[i], 4, 10, YELLOW);

        DrawText("HeapSight Shooter", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", score), 10, 40, 20, WHITE);
        DrawText(TextFormat("Wave: %d", wave), 10, 70, 20, WHITE);
        DrawText(TextFormat("HP: %d/%d", player_hp.hp, player_hp.max_hp), 10, 100, 20, WHITE);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints ship position using struct", expectedOutput: "Ship: (200, 380)" },
      { id: "g2", description: "Prints player health", expectedOutput: "HP: 3/3" },
      { id: "g3", description: "Prints starting wave", expectedOutput: "Wave: 1" },
    ],
    hints: [
      "Add at file scope: Position ship_pos; Velocity ship_vel; Health player_hp; Then in main: ship_pos.x = 200.0f; ship_pos.y = 380.0f;",
      "Replace ship_x with ship_pos.x and ship_y with ship_pos.y throughout. Bullet spawn: bullet_x[i] = (int)ship_pos.x + ship_w/2 - 2;",
      "HUD: DrawText(TextFormat(\"HP: %d/%d\", player_hp.hp, player_hp.max_hp), 10, 100, 20, WHITE);",
    ],
    estimatedMinutes: 15,
  },
};
