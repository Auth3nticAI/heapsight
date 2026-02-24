import type { Lesson } from "@/types/lesson";

export const lessonShooter8: Lesson = {
  id: "shooter-08-collision-v0",
  title: "Collision v0",
  description: "Detect bullet-enemy collisions with nested loops and AABB overlap — your first batch detection system.",
  order: 8,
  xpReward: 50,
  tier: "free",
  concepts: ["nested loops", "AABB collision", "batch detection", "deactivation"],
  part1: {
    title: "Concept: AABB Overlap Test",
    type: "concept",
    instructions: `# Collision v0

## Mental Model
Two rectangles overlap when they're close enough on BOTH axes at the same time. If they're separated on either axis — even just one — there's no collision. This is called **Axis-Aligned Bounding Box** (AABB) collision detection: the cheapest, most widely-used collision test in games.

## What Breaks Without This
Without collision detection, bullets fly straight through enemies. The player has no feedback, no satisfaction, no reason to aim. Collision is the moment the game becomes interactive — it's the bridge between input and consequence.

## The Fix: AABB Overlap
Two rectangles A and B overlap if:
- A's left edge < B's right edge
- A's right edge > B's left edge
- A's top edge < B's bottom edge
- A's bottom edge > B's top edge

In code:

\`\`\`cpp
bool overlap(int ax, int ay, int aw, int ah,
             int bx, int by, int bw, int bh) {
    return ax < bx + bw &&
           ax + aw > bx &&
           ay < by + bh &&
           ay + ah > by;
}
\`\`\`

For bullets vs enemies, you check every bullet against every enemy — a **nested loop**:

\`\`\`cpp
for (int b = 0; b < MAX_BULLETS; b++) {
    if (!bullet_active[b]) continue;
    for (int e = 0; e < MAX_ENEMIES; e++) {
        if (!enemy_active[e]) continue;
        // check overlap between bullet b and enemy e
    }
}
\`\`\`

When a hit is found: deactivate the bullet AND the enemy.

## Key Concepts
- AABB: four comparisons, two axes, no square roots
- Nested loops: every bullet checked against every enemy
- \`continue\` skips inactive entities — no wasted checks
- On hit: deactivate both — each entity handles its own lifecycle

## Your Task
Test the AABB formula with a bullet at (100, 100) size 4x10 and an enemy at (98, 98) size 24x24. Print whether they overlap.

## Beginner Trap
**Checking collision after moving both the bullet and enemy, then using the old positions for rendering.** Always resolve collision with the current positions, not the pre-move positions. Move, collide, render — in that order.

## Elite Insight
AABB overlap (Axis-Aligned Bounding Box) is the fastest 2D collision test: four comparisons, no square roots. Every 2D game engine uses AABB as the broadphase check before more expensive narrow-phase tests.

## Systems Thinking Connection
The RPG checks grid adjacency for combat. The Platformer checks tile overlap for collision. Your AABB overlap test is the continuous-space version — same "do these rectangles overlap?" question, but with floating-point coordinates.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Bullet at (100, 100), size 4x10
    int bx = 100, by = 100, bw = 4, bh = 10;

    // Enemy at (98, 98), size 24x24
    int ex = 98, ey = 98, ew = 24, eh = 24;

    // AABB overlap test
    bool hit = bx < ex + ew &&
               bx + bw > ex &&
               by < ey + eh &&
               by + bh > ey;

    // TODO: Print "Bullet: (100, 100)"
    // TODO: Print "Enemy: (98, 98)"
    // TODO: Print "Hit: yes" if hit is true, "Hit: no" if false
    // TODO: Print "Method: AABB"

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int bx = 100, by = 100, bw = 4, bh = 10;
    int ex = 98, ey = 98, ew = 24, eh = 24;

    bool hit = bx < ex + ew &&
               bx + bw > ex &&
               by < ey + eh &&
               by + bh > ey;

    cout << "Bullet: (100, 100)" << endl;
    cout << "Enemy: (98, 98)" << endl;
    cout << "Hit: " << (hit ? "yes" : "no") << endl;
    cout << "Method: AABB" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints bullet position", expectedOutput: "Bullet: (100, 100)" },
      { id: "t2", description: "Prints enemy position", expectedOutput: "Enemy: (98, 98)" },
      { id: "t3", description: "Detects hit", expectedOutput: "Hit: yes" },
      { id: "t4", description: "Prints method", expectedOutput: "Method: AABB" },
    ],
    hints: [
      "The AABB formula is already written — just fill in the print statements.",
      "For the ternary: cout << (hit ? \"yes\" : \"no\") — the parentheses around the ternary are important.",
      "Last line is literal: cout << \"Method: AABB\" << endl;",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Collision v0",
    type: "game_builder",
    instructions: `# Build: Collision v0

## Mental Model
You now have bullets flying upward and enemies descending. The missing piece: what happens when they meet? You'll add a nested loop that checks every active bullet against every active enemy using AABB. When they overlap, both deactivate — bullet consumed, enemy destroyed.

## What's Already Here
Everything from Lesson 7 — ship, bullet array (fire/move/draw), enemy array (spawn/move/draw). The collision system is the only missing piece.

## Your Task
One TODO — the collision system. After the bullet movement loop and before BeginDrawing, add a nested loop:

\`\`\`cpp
for (int b = 0; b < MAX_BULLETS; b++) {
    if (!bullet_active[b]) continue;
    for (int e = 0; e < MAX_ENEMIES; e++) {
        if (!enemy_active[e]) continue;
        // AABB: does bullet b overlap enemy e?
        bool hit = bullet_x[b] < (int)enemy_x[e] + 24 &&
                   bullet_x[b] + 4 > (int)enemy_x[e] &&
                   bullet_y[b] < (int)enemy_y[e] + 24 &&
                   bullet_y[b] + 10 > (int)enemy_y[e];
        if (hit) {
            bullet_active[b] = false;
            enemy_active[e] = false;
        }
    }
}
\`\`\`

## Did It Work?
Shoot at the red enemies. When a yellow bullet touches a red square, both disappear. That's collision detection — the moment your game stops being a pretty animation and starts being a game.`,
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
    cout << "Collision: AABB" << endl;

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

        // TODO: Add collision detection here
        // Nested loop: for each active bullet, check against each active enemy
        // Use AABB: if bullet rect overlaps enemy rect, deactivate both
        // Bullet size: 4x10. Enemy size: 24x24.

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
    cout << "Collision: AABB" << endl;

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

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints ship position", expectedOutput: "Ship: (200, 380)" },
      { id: "g2", description: "Prints enemy count", expectedOutput: "Enemies: 5" },
      { id: "g3", description: "Prints collision method", expectedOutput: "Collision: AABB" },
    ],
    hints: [
      "The outer loop iterates bullets (b), inner loop iterates enemies (e). Use continue to skip inactive ones.",
      "AABB: bullet_x[b] < (int)enemy_x[e]+24 && bullet_x[b]+4 > (int)enemy_x[e] && bullet_y[b] < (int)enemy_y[e]+24 && bullet_y[b]+10 > (int)enemy_y[e]",
      "On hit: bullet_active[b] = false; enemy_active[e] = false; — deactivate both.",
    ],
    estimatedMinutes: 12,
  },
};
