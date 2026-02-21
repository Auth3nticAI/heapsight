import type { Lesson } from "@/types/lesson";

export const lessonShooter9: Lesson = {
  id: "shooter-09-score-counter",
  title: "Score Counter",
  description: "Track kills with a score variable and display it on the HUD — observable game state.",
  order: 9,
  xpReward: 50,
  tier: "pro",
  concepts: ["game state variable", "DrawText", "integer formatting", "HUD"],
  part1: {
    title: "Concept: Observable Game State",
    type: "concept",
    instructions: `# Score Counter

## Mental Model
A score is just an integer that increments when something happens. What makes it powerful is that it's **observable** — the player can see it change in real time. Observable state is a core principle of game design: if a system's output isn't visible, players can't react to it. The score bridges the collision system (something happened) with the player's perception (I did something good).

## What Breaks Without This
Without a score, kills are silent. The enemy disappears, but the player gets no reward signal. No score means no goal, no progression, no reason to keep playing. The score is the minimal feedback loop — action → consequence → reward.

## The Fix: One Integer, One Display
The score lives at file scope (like all game state):

\`\`\`cpp
int score = 0;
\`\`\`

It increments in the collision system when a hit is confirmed:

\`\`\`cpp
if (hit) {
    bullet_active[b] = false;
    enemy_active[e] = false;
    score += 100;  // 100 points per kill
}
\`\`\`

It displays in the render pass using \`DrawText\` with \`TextFormat\`:

\`\`\`cpp
DrawText(TextFormat("Score: %d", score), 10, 40, 20, WHITE);
\`\`\`

\`TextFormat\` works like \`printf\` — \`%d\` is replaced by the integer value.

## Key Concepts
- Score is game state — declare at file scope, not inside main
- Increment on the event (collision confirmed), not on draw
- \`DrawText(TextFormat("Score: %d", score), x, y, size, color)\` renders it
- Observable state: the player sees it change, learns cause and effect

## Your Task
Simulate scoring: start at 0, add 100 for 3 kills. Print the score after each kill.`,
    starterCode: `#include <iostream>
using namespace std;

int score = 0;

int main() {
    cout << "Score: " << score << endl;

    // TODO: Simulate 3 kills by adding 100 each time, printing score after each
    // After kill 1: score += 100; cout << "Score: " << score << endl;
    // After kill 2: same
    // After kill 3: same
    // TODO: Print "Kills: 3"

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int score = 0;

int main() {
    cout << "Score: " << score << endl;

    score += 100;
    cout << "Score: " << score << endl;

    score += 100;
    cout << "Score: " << score << endl;

    score += 100;
    cout << "Score: " << score << endl;

    cout << "Kills: 3" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints initial score", expectedOutput: "Score: 0" },
      { id: "t2", description: "Prints score after kill 1", expectedOutput: "Score: 100" },
      { id: "t3", description: "Prints score after kill 2", expectedOutput: "Score: 200" },
      { id: "t4", description: "Prints score after kill 3", expectedOutput: "Score: 300" },
      { id: "t5", description: "Prints kill count", expectedOutput: "Kills: 3" },
    ],
    hints: [
      "score += 100 adds 100 to score. Do this 3 times, printing score after each.",
      "Each print: cout << \"Score: \" << score << endl;",
      "Last line: cout << \"Kills: 3\" << endl; — literal, not computed.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Score Counter",
    type: "game_builder",
    instructions: `# Build: Score Counter

## Mental Model
You have collision working — enemies disappear when hit. Now make the player FEEL it. Add a score that increments on every kill and displays on the HUD. This is the first time your game has a goal.

## What's Already Here
Everything from Lesson 8 — ship, bullets, 5 enemies, AABB collision. One new variable at file scope: \`int score = 0;\`.

## Your Task
Two TODOs — minimal scaffolding this time, you know the patterns:

1. **TODO 1:** In the collision system (inside the \`if (hit)\` block), add \`score += 100;\` after deactivating the bullet and enemy.

2. **TODO 2:** In the render pass after drawing bullets, add a DrawText call to display the score. Use \`TextFormat("Score: %d", score)\` as the text, position (10, 40), size 20, color WHITE.

## Did It Work?
Shoot an enemy — the score jumps by 100. Shoot all 5 — score reads 500. The HUD updates instantly every frame.`,
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
int enemy_count = 5;

int score = 0;  // TODO 1: increment this on kill

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
                    // TODO 1: Add 100 to score here
                }
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
        // TODO 2: Draw score using DrawText(TextFormat("Score: %d", score), 10, 40, 20, WHITE)

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

int score = 0;

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

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints ship position", expectedOutput: "Ship: (200, 380)" },
      { id: "g2", description: "Prints enemy count", expectedOutput: "Enemies: 5" },
      { id: "g3", description: "Prints initial score", expectedOutput: "Score: 0" },
    ],
    hints: [
      "TODO 1: Inside if (hit), after deactivating bullet and enemy, add: score += 100;",
      "TODO 2: DrawText(TextFormat(\"Score: %d\", score), 10, 40, 20, WHITE); — TextFormat works like printf.",
      "Make sure the DrawText call is inside BeginDrawing/EndDrawing but after the game logic.",
    ],
    estimatedMinutes: 10,
  },
};
