import type { Lesson } from "@/types/lesson";

export const lessonShooter12: Lesson = {
  id: "shooter-12-world-state-struct",
  title: "World State Struct",
  description: "Group all game state into a single World struct — one observable root for the entire simulation.",
  order: 12,
  xpReward: 100,
  tier: "pro",
  concepts: ["struct nesting", "World struct", "single state root", "observability"],
  part1: {
    title: "Concept: Single State Root",
    type: "concept",
    instructions: `# World State Struct

## Mental Model
Your game state is currently scattered across file-scope globals: \`ship_pos\`, \`score\`, \`wave\`, \`bullet_active[]\`, \`enemy_x[]\`... To test, save, replay, or print the full state, you have to know about every individual variable. A \`World\` struct wraps all of it under one name. Want to print everything? \`printState(world)\`. Want to save? \`serialize(world)\`. The struct makes the boundary explicit.

## What Breaks Without This
With scattered globals, there's no single "ground truth" for game state. Functions that modify state have hidden dependencies on global variables. Saving state means remembering every variable. Replaying state means resetting every variable individually. The \`World\` struct eliminates all of that.

## The Fix: Aggregate Into World
Nest your component types and arrays inside one struct:

\`\`\`cpp
struct World {
    // Player
    float ship_x, ship_y;
    int ship_w, ship_h, speed;

    // Bullets
    int bullet_x[MAX_BULLETS];
    int bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];

    // Enemies
    float enemy_x[MAX_ENEMIES];
    float enemy_y[MAX_ENEMIES];
    bool enemy_active[MAX_ENEMIES];

    // Game state
    int score;
    int wave;
};

World world;  // One global — the entire simulation
\`\`\`

Access members through the world:

\`\`\`cpp
world.ship_x = 200.0f;
world.score += 100;
world.bullet_active[i] = true;
\`\`\`

Pass it to functions by reference so they can modify it:

\`\`\`cpp
void spawnWave(World& w) {
    for (int i = 0; i < MAX_ENEMIES; i++) {
        w.enemy_x[i] = 80 + i * 130;
        w.enemy_y[i] = 30;
        w.enemy_active[i] = true;
    }
}
\`\`\`

## Key Concepts
- \`struct World\` wraps all simulation state — one global, not many
- Access via \`world.field\` — dot notation throughout
- Pass by reference \`World& w\` to let functions modify state
- Single observable root: print/save/restore with one function call

## Your Task
Define a World struct with ship, bullet count, and score. Initialize and print it.

## Beginner Trap
**Storing game state in global variables.** Globals hide dependencies — any function can read or write any state at any time. A single World struct makes every dependency explicit: functions that take World& declare what they touch.

## Elite Insight
Carmack advocated for "functional-style" game code where each system takes the world state as input and produces a new state. A single state root makes this practical — the entire game state lives in one place.

## Systems Thinking Connection
The RPG wraps all game state in a WorldState struct. The Platformer uses a GameState struct. The Crawler uses a DungeonState struct. Every path converges on the same pattern: one struct owns all gameplay data.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_BULLETS = 10;
const int MAX_ENEMIES = 5;

// TODO: Define struct World with these fields:
//   float ship_x, ship_y;
//   bool bullet_active[MAX_BULLETS];
//   bool enemy_active[MAX_ENEMIES];
//   int score;
//   int wave;

// TODO: void printState(World& w) that prints:
//   "Ship: (200, 380)"
//   "Score: 0"
//   "Wave: 1"

int main() {
    // TODO: Declare World world;
    // TODO: Initialize world.ship_x=200, world.ship_y=380, world.score=0, world.wave=1
    // TODO: Initialize all bullet_active to false, all enemy_active to false
    // TODO: Call printState(world)

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_BULLETS = 10;
const int MAX_ENEMIES = 5;

struct World {
    float ship_x, ship_y;
    bool bullet_active[MAX_BULLETS];
    bool enemy_active[MAX_ENEMIES];
    int score;
    int wave;
};

void printState(World& w) {
    cout << "Ship: (" << (int)w.ship_x << ", " << (int)w.ship_y << ")" << endl;
    cout << "Score: " << w.score << endl;
    cout << "Wave: " << w.wave << endl;
}

int main() {
    World world;
    world.ship_x = 200.0f;
    world.ship_y = 380.0f;
    world.score = 0;
    world.wave = 1;
    for (int i = 0; i < MAX_BULLETS; i++) world.bullet_active[i] = false;
    for (int i = 0; i < MAX_ENEMIES; i++) world.enemy_active[i] = false;

    printState(world);

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints ship position from world", expectedOutput: "Ship: (200, 380)" },
      { id: "t2", description: "Prints score from world", expectedOutput: "Score: 0" },
      { id: "t3", description: "Prints wave from world", expectedOutput: "Wave: 1" },
    ],
    hints: [
      "struct World { float ship_x, ship_y; bool bullet_active[MAX_BULLETS]; bool enemy_active[MAX_ENEMIES]; int score; int wave; };",
      "void printState(World& w) — the & means pass by reference, so w is the actual world, not a copy.",
      "Initialize: world.ship_x = 200.0f; world.score = 0; world.wave = 1; then loop to false-init arrays.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: World State Struct",
    type: "game_builder",
    instructions: `# Build: World State Struct

## Mental Model
All your game state moves inside one \`World\` struct. The loose globals become \`world.ship_x\`, \`world.score\`, \`world.bullet_active[i]\`. The \`spawnWave\` function takes \`World&\` instead of accessing globals. Gameplay is identical — the architecture is cleaner.

## What's Already Here
The \`World\` struct definition is at the top with all arrays and values. A global \`world\` instance replaces the individual globals. The \`spawnWave\` function signature has been updated to take \`World& w\`.

## Your Task
Three TODOs — migrate the remaining code to use \`world.\` prefix:

1. **TODO 1 — Init:** In main, initialize \`world.ship_x = 200\`, \`world.ship_y = 380\`, \`world.speed = 5\`, \`world.ship_w = 40\`, \`world.ship_h = 20\`, \`world.score = 0\`, \`world.wave = 1\`, \`world.player_hp = 3\`, \`world.player_max_hp = 3\`. Also init bullet/enemy arrays.

2. **TODO 2 — cout:** Update the three startup cout lines to read from \`world.\` fields.

3. **TODO 3 — Verify the struct is used throughout:** The input, movement, fire, collision, wave, and render systems all already use \`world.\` prefix in this starter. Confirm by clicking Run — same game, same HUD, struct-backed.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const int MAX_BULLETS = 10;
const int MAX_ENEMIES = 5;

struct Position { float x; float y; };
struct Velocity { float vx; float vy; };
struct Health   { int hp; int max_hp; };

struct World {
    // Ship
    float ship_x, ship_y;
    int ship_w, ship_h, speed;
    // Bullets
    int  bullet_x[MAX_BULLETS];
    int  bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];
    // Enemies
    float enemy_x[MAX_ENEMIES];
    float enemy_y[MAX_ENEMIES];
    bool  enemy_active[MAX_ENEMIES];
    // State
    int score, wave;
    int player_hp, player_max_hp;
};

World world;

void spawnWave(World& w) {
    for (int i = 0; i < MAX_ENEMIES; i++) {
        w.enemy_x[i] = 80 + i * 130;
        w.enemy_y[i] = 30;
        w.enemy_active[i] = true;
    }
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter");
    SetTargetFPS(60);

    // TODO 1: Initialize world fields here
    // world.ship_x = 200; world.ship_y = 380; world.speed = 5;
    // world.ship_w = 40;  world.ship_h = 20;
    // world.score = 0;    world.wave = 1;
    // world.player_hp = 3; world.player_max_hp = 3;
    // for (int i = 0; i < MAX_BULLETS; i++) world.bullet_active[i] = false;
    // spawnWave(world);

    // TODO 2: Update these cout lines to read from world fields
    cout << "Ship: (200, 380)" << endl;
    cout << "HP: 3/3" << endl;
    cout << "Wave: 1" << endl;

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
                if (hit) {
                    world.bullet_active[b] = false;
                    world.enemy_active[e] = false;
                    world.score += 100;
                }
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

struct Position { float x; float y; };
struct Velocity { float vx; float vy; };
struct Health   { int hp; int max_hp; };

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

void spawnWave(World& w) {
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
    spawnWave(world);

    cout << "Ship: (" << (int)world.ship_x << ", " << (int)world.ship_y << ")" << endl;
    cout << "HP: " << world.player_hp << "/" << world.player_max_hp << endl;
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
                if (hit) {
                    world.bullet_active[b] = false;
                    world.enemy_active[e] = false;
                    world.score += 100;
                }
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
      { id: "g1", description: "Prints ship position from world struct", expectedOutput: "Ship: (200, 380)" },
      { id: "g2", description: "Prints player health from world struct", expectedOutput: "HP: 3/3" },
      { id: "g3", description: "Prints wave from world struct", expectedOutput: "Wave: 1" },
    ],
    hints: [
      "Uncomment TODO 1 block: world.ship_x = 200; world.ship_y = 380; world.speed = 5; world.ship_w = 40; world.ship_h = 20; world.score = 0; world.wave = 1; world.player_hp = 3; world.player_max_hp = 3;",
      "TODO 2: cout << \"Ship: (\" << (int)world.ship_x << \", \" << (int)world.ship_y << \")\" << endl; etc.",
      "The game loop already uses world. prefix throughout — just init and cout are your TODOs.",
    ],
    estimatedMinutes: 12,
  },
};
