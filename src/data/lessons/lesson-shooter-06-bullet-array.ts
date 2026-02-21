import type { Lesson } from "@/types/lesson";

export const lessonShooter6: Lesson = {
  id: "shooter-06-bullet-array",
  title: "Bullet Array",
  description: "Fire multiple bullets using arrays and for-loops — your first fixed-size collection.",
  order: 6,
  xpReward: 50,
  tier: "pro",
  concepts: ["arrays", "for-loops", "MAX constant", "batch processing"],
  part1: {
    title: "Concept: Arrays Hold Multiple Values",
    type: "concept",
    instructions: `# Bullet Array

## Mental Model
In Lesson 5, you had ONE bullet. One position, one bool. But real games need dozens of bullets on screen at once. An **array** lets you store multiple values under one name. Instead of \`bullet_x1\`, \`bullet_x2\`, \`bullet_x3\`... you write \`bullet_x[0]\`, \`bullet_x[1]\`, \`bullet_x[2]\`. The number in brackets picks which one.

## What Breaks Without This
With only one bullet, the player has to wait for it to fly off-screen before firing again. That feels terrible. With an array of bullets, you can fire as fast as you want — each press grabs the next available slot.

## The Fix: Arrays and For-Loops
An array creates space for multiple values:

\`\`\`cpp
const int MAX_BULLETS = 10;
int bullet_x[MAX_BULLETS];
int bullet_y[MAX_BULLETS];
bool bullet_active[MAX_BULLETS];
\`\`\`

This creates 10 bullet positions and 10 active flags. To set the first bullet's x: \`bullet_x[0] = 100;\`. Arrays count from 0, so the 10 slots are [0] through [9].

A **for-loop** lets you process every bullet in one sweep:

\`\`\`cpp
for (int i = 0; i < MAX_BULLETS; i++) {
    if (bullet_active[i]) {
        bullet_y[i] -= 8;
    }
}
\`\`\`

This loop starts at \`i = 0\`, checks \`i < MAX_BULLETS\`, runs the body, then does \`i++\` (adds 1 to i). It processes all 10 bullets in 3 lines of code.

## Key Concepts
- \`int arr[5]\` creates an array of 5 ints: arr[0] through arr[4]
- Arrays count from 0 — the first element is [0], not [1]
- \`for (int i = 0; i < count; i++)\` loops from 0 to count-1
- Use a \`MAX\` constant so you never hardcode the array size

## Your Task
Create an array of 5 bullets. Set them all to inactive except bullet 0 and bullet 2. Use a for-loop to count active bullets and print the results.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    const int MAX_BULLETS = 5;
    bool bullet_active[MAX_BULLETS];

    // Set all bullets to inactive first
    for (int i = 0; i < MAX_BULLETS; i++) {
        bullet_active[i] = false;
    }

    // Activate bullet 0 and bullet 2
    bullet_active[0] = true;
    bullet_active[2] = true;

    // TODO: Count active bullets using a for-loop
    //       Create int active_count = 0;
    //       Loop through all bullets: if bullet_active[i] is true, add 1 to active_count
    // TODO: Print "Bullets: 5" (total array size using MAX_BULLETS)
    // TODO: Print "Active: 2" (using active_count)
    // TODO: Print "Pool: array"

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    const int MAX_BULLETS = 5;
    bool bullet_active[MAX_BULLETS];

    for (int i = 0; i < MAX_BULLETS; i++) {
        bullet_active[i] = false;
    }

    bullet_active[0] = true;
    bullet_active[2] = true;

    int active_count = 0;
    for (int i = 0; i < MAX_BULLETS; i++) {
        if (bullet_active[i]) active_count++;
    }

    cout << "Bullets: " << MAX_BULLETS << endl;
    cout << "Active: " << active_count << endl;
    cout << "Pool: array" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints total bullet count", expectedOutput: "Bullets: 5" },
      { id: "t2", description: "Prints active count", expectedOutput: "Active: 2" },
      { id: "t3", description: "Prints pool type", expectedOutput: "Pool: array" },
    ],
    hints: [
      "Create int active_count = 0; before the counting loop. Inside: if (bullet_active[i]) active_count++;",
      "Print MAX_BULLETS for total: cout << \"Bullets: \" << MAX_BULLETS << endl;",
      "The last line is literal: cout << \"Pool: array\" << endl;",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Bullet Array",
    type: "game_builder",
    instructions: `# Build: Bullet Array

## Mental Model
You just learned that arrays store multiple values. Now you'll replace the single bullet from Lesson 5 with an array of 10 bullets. Each press of SPACE finds the first inactive bullet, activates it, and sends it flying. Multiple bullets can be on screen at the same time.

## What's Already Here
The starter code has your ship movement from Lesson 5 — left/right arrows with screen clamping. The single bullet variables have been replaced with arrays:
- \`bullet_x[MAX_BULLETS]\`, \`bullet_y[MAX_BULLETS]\` — positions for each bullet
- \`bullet_active[MAX_BULLETS]\` — which bullets are currently flying
- All bullets start inactive (the initialization loop sets them all to false)

## Your Task
Complete three TODOs:

1. **TODO 1 — Fire:** When SPACE is pressed, find the first inactive bullet (loop through, check \`!bullet_active[i]\`). Set its x to center of ship, y to ship_y, active to true, then \`break\` (stop looking — you only fire one bullet per press).

2. **TODO 2 — Move:** Loop through ALL bullets. If active, subtract 8 from its y. If it goes above the screen (\`bullet_y[i] < -10\`), set it back to inactive.

3. **TODO 3 — Draw:** Loop through ALL bullets. If active, draw it with \`DrawRectangle(bullet_x[i], bullet_y[i], 4, 10, YELLOW)\`.

## Did It Work?
Press SPACE rapidly — you should see multiple yellow bullets flying upward at the same time. Each bullet is independent. When one flies off-screen, its slot becomes available for the next shot.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const int MAX_BULLETS = 10;

// Ship
int ship_x = 200;
int ship_y = 300;
int ship_w = 40;
int ship_h = 20;
int speed = 5;

// Bullet arrays
int bullet_x[MAX_BULLETS];
int bullet_y[MAX_BULLETS];
bool bullet_active[MAX_BULLETS];

int star_count = 12;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter");
    SetTargetFPS(60);

    // Initialize all bullets to inactive
    for (int i = 0; i < MAX_BULLETS; i++) {
        bullet_active[i] = false;
    }

    cout << "Ship: (" << ship_x << ", " << ship_y << ")" << endl;
    cout << "Bullets: " << MAX_BULLETS << endl;
    cout << "Fire: SPACE" << endl;

    while (!WindowShouldClose()) {
        // Ship movement
        if (IsKeyDown(KEY_RIGHT)) ship_x += speed;
        if (IsKeyDown(KEY_LEFT)) ship_x -= speed;
        if (ship_x < 0) ship_x = 0;
        if (ship_x > SCREEN_W - ship_w) ship_x = SCREEN_W - ship_w;

        // TODO 1: Fire a bullet when SPACE is pressed
        // if (IsKeyPressed(KEY_SPACE)) {
        //     Loop i from 0 to MAX_BULLETS:
        //       if (!bullet_active[i]) {
        //           bullet_x[i] = ship_x + ship_w/2 - 2;
        //           bullet_y[i] = ship_y;
        //           bullet_active[i] = true;
        //           break;  // Only fire one bullet per press
        //       }
        // }

        // TODO 2: Move active bullets upward
        // Loop i from 0 to MAX_BULLETS:
        //   if (bullet_active[i]) {
        //       bullet_y[i] -= 8;
        //       if (bullet_y[i] < -10) bullet_active[i] = false;
        //   }

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

        // Ship
        DrawRectangle(ship_x, ship_y, ship_w, ship_h, GREEN);

        // TODO 3: Draw active bullets
        // Loop i from 0 to MAX_BULLETS:
        //   if (bullet_active[i]) DrawRectangle(bullet_x[i], bullet_y[i], 4, 10, YELLOW);

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

// Ship
int ship_x = 200;
int ship_y = 300;
int ship_w = 40;
int ship_h = 20;
int speed = 5;

// Bullet arrays
int bullet_x[MAX_BULLETS];
int bullet_y[MAX_BULLETS];
bool bullet_active[MAX_BULLETS];

int star_count = 12;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter");
    SetTargetFPS(60);

    for (int i = 0; i < MAX_BULLETS; i++) {
        bullet_active[i] = false;
    }

    cout << "Ship: (" << ship_x << ", " << ship_y << ")" << endl;
    cout << "Bullets: " << MAX_BULLETS << endl;
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
      { id: "g1", description: "Prints ship position", expectedOutput: "Ship: (200, 300)" },
      { id: "g2", description: "Prints bullet pool size", expectedOutput: "Bullets: 10" },
      { id: "g3", description: "Prints fire control", expectedOutput: "Fire: SPACE" },
    ],
    hints: [
      "TODO 1: Inside if (IsKeyPressed(KEY_SPACE)), loop through bullets. When you find one where !bullet_active[i], set its position and active=true, then break.",
      "TODO 2: for (int i = 0; i < MAX_BULLETS; i++) { if (bullet_active[i]) { bullet_y[i] -= 8; if (bullet_y[i] < -10) bullet_active[i] = false; } }",
      "TODO 3: Same loop pattern: for (int i = 0; i < MAX_BULLETS; i++) { if (bullet_active[i]) DrawRectangle(...); }",
    ],
    estimatedMinutes: 10,
  },
};
