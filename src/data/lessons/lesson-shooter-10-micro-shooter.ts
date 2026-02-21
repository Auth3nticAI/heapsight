import type { Lesson } from "@/types/lesson";

export const lessonShooter10: Lesson = {
  id: "shooter-10-micro-shooter",
  title: "Micro Shooter Milestone",
  description: "Ship, enemies, bullets, collisions, score, and wave respawning — your first complete game loop.",
  order: 10,
  xpReward: 50,
  tier: "pro",
  concepts: ["functions", "spawnWave", "complete game loop", "milestone"],
  part1: {
    title: "Concept: Functions Wrap Reusable Logic",
    type: "concept",
    instructions: `# Micro Shooter Milestone

## Mental Model
You have all the pieces: movement, bullets, enemies, collision, score. What's missing is **wave logic** — when all enemies are dead, spawn a new wave. To do this cleanly, you wrap the spawn logic in a **function**. A function is a named block of code you can call anytime, from anywhere.

## What Breaks Without This
Without a spawn function, you'd repeat the enemy initialization code in multiple places — inside \`main\` for the first wave, and again after all enemies die. When you change anything (the number of enemies, their starting positions), you'd have to find and update every copy. Functions let you write it once and call it everywhere.

## The Fix: Functions
A function is declared BEFORE \`main\` and called inside it:

\`\`\`cpp
// Declared before main — no return value (void), no parameters
void spawnWave() {
    for (int i = 0; i < MAX_ENEMIES; i++) {
        enemy_x[i] = 100 + i * 140;
        enemy_y[i] = 30;
        enemy_active[i] = true;
    }
}

int main() {
    // ...
    spawnWave();  // Call it once at start
    // ...
    while (!WindowShouldClose()) {
        // Check if all enemies are dead
        int alive = 0;
        for (int i = 0; i < MAX_ENEMIES; i++) {
            if (enemy_active[i]) alive++;
        }
        if (alive == 0) spawnWave();  // Call it again for next wave
    }
}
\`\`\`

The function accesses file-scope arrays directly — no parameters needed.

## Key Concepts
- \`void functionName()\` — declares a function with no return value
- Call it with \`functionName();\` — parentheses required
- Functions see file-scope variables directly
- Declare functions ABOVE \`main\` so the compiler sees them first

## Your Task
Write a \`countActive\` function that counts active enemies. Call it and print the result.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_ENEMIES = 5;
bool enemy_active[MAX_ENEMIES] = {true, false, true, true, false};

// TODO: Write a void function called countActive that:
//   - counts how many enemies are active (loop + counter)
//   - prints "Active: N" using that counter
//   - prints "Wave: ready" if 0 are active, nothing otherwise
// Then call it from main

int main() {
    cout << "Enemies: " << MAX_ENEMIES << endl;
    // TODO: Call countActive() here
    cout << "Game: running" << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_ENEMIES = 5;
bool enemy_active[MAX_ENEMIES] = {true, false, true, true, false};

void countActive() {
    int count = 0;
    for (int i = 0; i < MAX_ENEMIES; i++) {
        if (enemy_active[i]) count++;
    }
    cout << "Active: " << count << endl;
    if (count == 0) cout << "Wave: ready" << endl;
}

int main() {
    cout << "Enemies: " << MAX_ENEMIES << endl;
    countActive();
    cout << "Game: running" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints enemy pool size", expectedOutput: "Enemies: 5" },
      { id: "t2", description: "Prints active count", expectedOutput: "Active: 3" },
      { id: "t3", description: "Prints game state", expectedOutput: "Game: running" },
    ],
    hints: [
      "void countActive() { ... } — declare above main. Loop and count, then print.",
      "With {true, false, true, true, false}, 3 are active. The if (count == 0) branch won't trigger here.",
      "Call it with: countActive(); — just the function name with parentheses.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Micro Shooter Milestone",
    type: "game_builder",
    instructions: `# Build: Micro Shooter Milestone

## This Is Your First Complete Game
Every system you built over the last 10 lessons comes together here. Ship + bullets + enemies + collision + score + wave spawning = a playable space shooter.

## What's Already Here
Everything from Lesson 9. One addition: a \`spawnWave()\` function stub declared at file scope (above main), and a \`wave\` counter.

## Your Tasks
Three TODOs to complete the game loop:

1. **TODO 1 — Complete spawnWave():** The function stub is there. Fill in the loop body: set \`enemy_x[i]\`, \`enemy_y[i]\`, \`enemy_active[i]\` for each enemy. Spread them across the top (\`x = 80 + i * 130\`, \`y = 30\`).

2. **TODO 2 — Count alive enemies:** Inside the game loop (after collision), count how many enemies are still active. If \`alive == 0\`, increment \`wave\` and call \`spawnWave()\`.

3. **TODO 3 — Display wave on HUD:** After the score DrawText, add another DrawText to show the current wave: \`DrawText(TextFormat("Wave: %d", wave), 10, 70, 20, WHITE)\`.

## Did It Work?
Shoot all 5 enemies — they respawn immediately as Wave 2. Shoot those — Wave 3. The score keeps climbing. The game never ends. You built a real arcade loop.`,
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

// Enemy arrays
float enemy_x[MAX_ENEMIES];
float enemy_y[MAX_ENEMIES];
bool enemy_active[MAX_ENEMIES];

int score = 0;
int wave = 1;

// TODO 1: Complete this function — spawn all enemies in a row
void spawnWave() {
    for (int i = 0; i < MAX_ENEMIES; i++) {
        // Set enemy_x[i], enemy_y[i], enemy_active[i]
    }
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter");
    SetTargetFPS(60);

    for (int i = 0; i < MAX_BULLETS; i++) bullet_active[i] = false;
    spawnWave();

    cout << "Ship: (" << ship_x << ", " << ship_y << ")" << endl;
    cout << "Wave: " << wave << endl;
    cout << "Score: " << score << endl;

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

        for (int b = 0; b < MAX_BULLETS; b++) {
            if (!bullet_active[b]) continue;
            for (int e = 0; e < MAX_ENEMIES; e++) {
                if (!enemy_active[e]) continue;
                bool hit = bullet_x[b] < (int)enemy_x[e] + 24 &&
                           bullet_x[b] + 4 > (int)enemy_x[e] &&
                           bullet_y[b] < (int)enemy_y[e] + 24 &&
                           bullet_y[b] + 10 > (int)enemy_y[e];
                if (hit) {
                    bullet_active[b] = false;
                    enemy_active[e] = false;
                    score += 100;
                }
            }
        }

        // TODO 2: Count alive enemies. If 0, wave++ and call spawnWave()

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
        DrawText(TextFormat("Score: %d", score), 10, 40, 20, WHITE);
        // TODO 3: DrawText for wave number

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

    cout << "Ship: (" << ship_x << ", " << ship_y << ")" << endl;
    cout << "Wave: " << wave << endl;
    cout << "Score: " << score << endl;

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

        for (int b = 0; b < MAX_BULLETS; b++) {
            if (!bullet_active[b]) continue;
            for (int e = 0; e < MAX_ENEMIES; e++) {
                if (!enemy_active[e]) continue;
                bool hit = bullet_x[b] < (int)enemy_x[e] + 24 &&
                           bullet_x[b] + 4 > (int)enemy_x[e] &&
                           bullet_y[b] < (int)enemy_y[e] + 24 &&
                           bullet_y[b] + 10 > (int)enemy_y[e];
                if (hit) {
                    bullet_active[b] = false;
                    enemy_active[e] = false;
                    score += 100;
                }
            }
        }

        int alive = 0;
        for (int i = 0; i < MAX_ENEMIES; i++) {
            if (enemy_active[i]) alive++;
        }
        if (alive == 0) {
            wave++;
            spawnWave();
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
        DrawText(TextFormat("Score: %d", score), 10, 40, 20, WHITE);
        DrawText(TextFormat("Wave: %d", wave), 10, 70, 20, WHITE);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints ship position", expectedOutput: "Ship: (200, 380)" },
      { id: "g2", description: "Prints starting wave", expectedOutput: "Wave: 1" },
      { id: "g3", description: "Prints starting score", expectedOutput: "Score: 0" },
    ],
    hints: [
      "TODO 1: enemy_x[i] = 80 + i * 130; enemy_y[i] = 30; enemy_active[i] = true;",
      "TODO 2: int alive = 0; for (...) if (enemy_active[i]) alive++; if (alive == 0) { wave++; spawnWave(); }",
      "TODO 3: DrawText(TextFormat(\"Wave: %d\", wave), 10, 70, 20, WHITE);",
    ],
    estimatedMinutes: 15,
  },
};
