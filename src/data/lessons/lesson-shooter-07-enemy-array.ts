import type { Lesson } from "@/types/lesson";

export const lessonShooter7: Lesson = {
  id: "shooter-07-enemy-array",
  title: "Enemy Array",
  description: "Spawn 5 enemies in formation using parallel arrays — your first taste of Structure of Arrays.",
  order: 7,
  xpReward: 50,
  tier: "pro",
  concepts: ["parallel arrays", "SoA (implicit)", "initialization loops", "formation spawning"],
  part1: {
    title: "Concept: Parallel Arrays Track Multiple Properties",
    type: "concept",
    instructions: `# Enemy Array

## Mental Model
You already have bullet arrays. Enemies need more data than bullets — they have an x position, a y position, AND an active flag. Instead of one big array of "enemy objects," you use **three separate arrays** that line up index-by-index. Enemy 0's data lives at index 0 in all three arrays. This is called **Structure of Arrays** (SoA) — and it's how professional game engines store entities.

## What Breaks Without This
If you store enemies as objects (AoS — Array of Structs), the CPU loads one enemy's full record to read just its x position. With three separate enemies, it loads three records — most of which it doesn't need yet. With SoA, ALL x positions sit next to each other in memory. Reading all five enemy x values loads one cache line. The CPU handles it in a single memory access.

## The Fix: Parallel Arrays
Three arrays, same index = one enemy:

\`\`\`cpp
const int MAX_ENEMIES = 5;
float enemy_x[MAX_ENEMIES];
float enemy_y[MAX_ENEMIES];
bool enemy_active[MAX_ENEMIES];
\`\`\`

Spawn 5 enemies in a row across the top:

\`\`\`cpp
for (int i = 0; i < MAX_ENEMIES; i++) {
    enemy_x[i] = 100 + i * 140;  // spaced 140px apart
    enemy_y[i] = 50;
    enemy_active[i] = true;
}
\`\`\`

Count active enemies with the same pattern you used for bullets:

\`\`\`cpp
int active = 0;
for (int i = 0; i < MAX_ENEMIES; i++) {
    if (enemy_active[i]) active++;
}
\`\`\`

## Key Concepts
- Parallel arrays: enemy 0's data is at index 0 in EVERY array
- SoA separates properties — all x's together, all y's together
- Same for-loop pattern works on any parallel array set
- The CPU loves contiguous memory — SoA is cache-friendly

## Your Task
Spawn 5 enemies in formation and count them. Print the results.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    const int MAX_ENEMIES = 5;
    float enemy_x[MAX_ENEMIES];
    float enemy_y[MAX_ENEMIES];
    bool enemy_active[MAX_ENEMIES];

    // Spawn 5 enemies in a row at y=50, spaced 140px apart starting at x=100
    for (int i = 0; i < MAX_ENEMIES; i++) {
        enemy_x[i] = 100 + i * 140;
        enemy_y[i] = 50;
        enemy_active[i] = true;
    }

    // TODO: Count active enemies using a for-loop (same pattern as bullet counting)
    // TODO: Print "Enemies: 5" using MAX_ENEMIES
    // TODO: Print "Active: 5" using your count variable
    // TODO: Print "Layout: SoA"

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    const int MAX_ENEMIES = 5;
    float enemy_x[MAX_ENEMIES];
    float enemy_y[MAX_ENEMIES];
    bool enemy_active[MAX_ENEMIES];

    for (int i = 0; i < MAX_ENEMIES; i++) {
        enemy_x[i] = 100 + i * 140;
        enemy_y[i] = 50;
        enemy_active[i] = true;
    }

    int active = 0;
    for (int i = 0; i < MAX_ENEMIES; i++) {
        if (enemy_active[i]) active++;
    }

    cout << "Enemies: " << MAX_ENEMIES << endl;
    cout << "Active: " << active << endl;
    cout << "Layout: SoA" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints enemy pool size", expectedOutput: "Enemies: 5" },
      { id: "t2", description: "Prints active count", expectedOutput: "Active: 5" },
      { id: "t3", description: "Prints layout type", expectedOutput: "Layout: SoA" },
    ],
    hints: [
      "int active = 0; then loop: if (enemy_active[i]) active++;",
      "cout << \"Enemies: \" << MAX_ENEMIES << endl; — use the constant, not the literal 5",
      "Last line: cout << \"Layout: SoA\" << endl;",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Enemy Array",
    type: "game_builder",
    instructions: `# Build: Enemy Array

## Mental Model
Your bullets already live in parallel arrays. Now enemies do too. Five enemies spawn in formation at the top of the screen and descend slowly. Your ship and bullets are already working — you're adding a new ECS component: the enemy.

## What's Already Here
Everything from Lesson 6 — ship movement, bullet array (fire/move/draw). New at file scope:
- \`enemy_x[MAX_ENEMIES]\`, \`enemy_y[MAX_ENEMIES]\`, \`enemy_active[MAX_ENEMIES]\` — three parallel arrays
- \`enemy_count = 5\` tracks how many enemies exist

## Your Task
Complete three TODOs:

1. **TODO 1 — Spawn:** Before the game loop, use a for-loop to initialize all 5 enemies. Set \`enemy_x[i] = 100 + i * 140\` (spaces them evenly), \`enemy_y[i] = 50\`, \`enemy_active[i] = true\`.

2. **TODO 2 — Move:** In the game loop, loop through all enemies. If active, add 0.5 to \`enemy_y[i]\` (slow descent). If \`enemy_y[i] > SCREEN_H\`, reset it to 0 and move it to a random-ish position (or just reset to y=0 to keep it simple).

3. **TODO 3 — Draw:** Loop through all enemies. If active, draw a red rectangle: \`DrawRectangle((int)enemy_x[i], (int)enemy_y[i], 24, 24, RED)\`.

## Did It Work?
You should see 5 red squares descending from the top, evenly spaced. Your ship and bullets still work. This is the first time your game has both a player AND enemies on screen.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const int MAX_BULLETS = 10;
const int MAX_ENEMIES = 5;

// Ship
int ship_x = 200;
int ship_y = 380;
int ship_w = 40;
int ship_h = 20;
int speed = 5;

// Bullet arrays
int bullet_x[MAX_BULLETS];
int bullet_y[MAX_BULLETS];
bool bullet_active[MAX_BULLETS];

// Enemy arrays (parallel: index i = enemy i)
float enemy_x[MAX_ENEMIES];
float enemy_y[MAX_ENEMIES];
bool enemy_active[MAX_ENEMIES];
int enemy_count = 5;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter");
    SetTargetFPS(60);

    for (int i = 0; i < MAX_BULLETS; i++) bullet_active[i] = false;

    // TODO 1: Spawn 5 enemies in formation
    // for (int i = 0; i < MAX_ENEMIES; i++) {
    //     enemy_x[i] = 100 + i * 140;
    //     enemy_y[i] = 50;
    //     enemy_active[i] = true;
    // }

    cout << "Ship: (" << ship_x << ", " << ship_y << ")" << endl;
    cout << "Enemies: " << enemy_count << endl;
    cout << "Fire: SPACE" << endl;

    while (!WindowShouldClose()) {
        // Ship movement
        if (IsKeyDown(KEY_RIGHT)) ship_x += speed;
        if (IsKeyDown(KEY_LEFT)) ship_x -= speed;
        if (ship_x < 0) ship_x = 0;
        if (ship_x > SCREEN_W - ship_w) ship_x = SCREEN_W - ship_w;

        // Fire bullets
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

        // Move bullets
        for (int i = 0; i < MAX_BULLETS; i++) {
            if (bullet_active[i]) {
                bullet_y[i] -= 8;
                if (bullet_y[i] < -10) bullet_active[i] = false;
            }
        }

        // TODO 2: Move enemies downward
        // for (int i = 0; i < MAX_ENEMIES; i++) {
        //     if (enemy_active[i]) {
        //         enemy_y[i] += 0.5f;
        //         if (enemy_y[i] > SCREEN_H) enemy_y[i] = 0;
        //     }
        // }

        BeginDrawing();
        ClearBackground(BLACK);

        // Stars
        DrawRectangle(100, 50, 2, 2, WHITE);
        DrawRectangle(200, 120, 2, 2, WHITE);
        DrawRectangle(350, 30, 2, 2, WHITE);
        DrawRectangle(500, 80, 2, 2, WHITE);
        DrawRectangle(650, 150, 2, 2, WHITE);
        DrawRectangle(750, 60, 2, 2, WHITE);
        DrawRectangle(50, 200, 2, 2, WHITE);
        DrawRectangle(300, 250, 2, 2, WHITE);
        DrawRectangle(450, 180, 2, 2, WHITE);
        DrawRectangle(600, 300, 2, 2, WHITE);
        DrawRectangle(150, 350, 2, 2, WHITE);
        DrawRectangle(700, 380, 2, 2, WHITE);

        // TODO 3: Draw active enemies as red rectangles
        // for (int i = 0; i < MAX_ENEMIES; i++) {
        //     if (enemy_active[i]) DrawRectangle((int)enemy_x[i], (int)enemy_y[i], 24, 24, RED);
        // }

        // Ship
        DrawRectangle(ship_x, ship_y, ship_w, ship_h, GREEN);

        // Bullets
        for (int i = 0; i < MAX_BULLETS; i++) {
            if (bullet_active[i]) DrawRectangle(bullet_x[i], bullet_y[i], 4, 10, YELLOW);
        }

        DrawText("HeapSight Shooter", 10, 10, 20, WHITE);

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

// Ship
int ship_x = 200;
int ship_y = 380;
int ship_w = 40;
int ship_h = 20;
int speed = 5;

// Bullet arrays
int bullet_x[MAX_BULLETS];
int bullet_y[MAX_BULLETS];
bool bullet_active[MAX_BULLETS];

// Enemy arrays
float enemy_x[MAX_ENEMIES];
float enemy_y[MAX_ENEMIES];
bool enemy_active[MAX_ENEMIES];
int enemy_count = 5;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter");
    SetTargetFPS(60);

    for (int i = 0; i < MAX_BULLETS; i++) bullet_active[i] = false;

    for (int i = 0; i < MAX_ENEMIES; i++) {
        enemy_x[i] = 100 + i * 140;
        enemy_y[i] = 50;
        enemy_active[i] = true;
    }

    cout << "Ship: (" << ship_x << ", " << ship_y << ")" << endl;
    cout << "Enemies: " << enemy_count << endl;
    cout << "Fire: SPACE" << endl;

    while (!WindowShouldClose()) {
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
            if (bullet_active[i]) {
                bullet_y[i] -= 8;
                if (bullet_y[i] < -10) bullet_active[i] = false;
            }
        }

        for (int i = 0; i < MAX_ENEMIES; i++) {
            if (enemy_active[i]) {
                enemy_y[i] += 0.5f;
                if (enemy_y[i] > SCREEN_H) enemy_y[i] = 0;
            }
        }

        BeginDrawing();
        ClearBackground(BLACK);

        DrawRectangle(100, 50, 2, 2, WHITE);
        DrawRectangle(200, 120, 2, 2, WHITE);
        DrawRectangle(350, 30, 2, 2, WHITE);
        DrawRectangle(500, 80, 2, 2, WHITE);
        DrawRectangle(650, 150, 2, 2, WHITE);
        DrawRectangle(750, 60, 2, 2, WHITE);
        DrawRectangle(50, 200, 2, 2, WHITE);
        DrawRectangle(300, 250, 2, 2, WHITE);
        DrawRectangle(450, 180, 2, 2, WHITE);
        DrawRectangle(600, 300, 2, 2, WHITE);
        DrawRectangle(150, 350, 2, 2, WHITE);
        DrawRectangle(700, 380, 2, 2, WHITE);

        for (int i = 0; i < MAX_ENEMIES; i++) {
            if (enemy_active[i]) DrawRectangle((int)enemy_x[i], (int)enemy_y[i], 24, 24, RED);
        }

        DrawRectangle(ship_x, ship_y, ship_w, ship_h, GREEN);

        for (int i = 0; i < MAX_BULLETS; i++) {
            if (bullet_active[i]) DrawRectangle(bullet_x[i], bullet_y[i], 4, 10, YELLOW);
        }

        DrawText("HeapSight Shooter", 10, 10, 20, WHITE);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints ship position", expectedOutput: "Ship: (200, 380)" },
      { id: "g2", description: "Prints enemy count", expectedOutput: "Enemies: 5" },
      { id: "g3", description: "Prints fire control", expectedOutput: "Fire: SPACE" },
    ],
    hints: [
      "TODO 1: for (int i = 0; i < MAX_ENEMIES; i++) { enemy_x[i] = 100 + i * 140; enemy_y[i] = 50; enemy_active[i] = true; }",
      "TODO 2: for (int i = 0; i < MAX_ENEMIES; i++) { if (enemy_active[i]) { enemy_y[i] += 0.5f; if (enemy_y[i] > SCREEN_H) enemy_y[i] = 0; } }",
      "TODO 3: for (int i = 0; i < MAX_ENEMIES; i++) { if (enemy_active[i]) DrawRectangle((int)enemy_x[i], (int)enemy_y[i], 24, 24, RED); }",
    ],
    estimatedMinutes: 10,
  },
};
