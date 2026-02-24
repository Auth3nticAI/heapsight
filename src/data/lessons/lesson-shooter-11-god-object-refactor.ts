import type { Lesson } from "@/types/lesson";

export const lessonShooter11: Lesson = {
  id: "shooter-11-god-object-refactor",
  title: "God Object Refactor",
  description: "Move all scattered globals into a single struct World. Same gameplay, cleaner data layout. The first step toward data-oriented design.",
  order: 11,
  xpReward: 100,
  tier: "pro",
  concepts: ["struct", "god object", "refactoring", "data layout", "aggregate state"],
  part1: {
    title: "Concept: The God Object Problem",
    type: "concept",
    instructions: `# God Object Refactor

## Mental Model
Your Micro Shooter works \`\` ship moves, bullets fly, enemies die, waves respawn. But look at the file scope: \`ship_x\`, \`ship_y\`, \`ship_w\`, \`ship_h\`, \`speed\`, \`bullet_x[]\`, \`bullet_y[]\`, \`bullet_active[]\`, \`enemy_x[]\`, \`enemy_y[]\`, \`enemy_active[]\`, \`score\`, \`wave\`. That's 13 mutable variables scattered across file scope. Every function reaches into this global soup. This is the **God Object** anti-pattern \`\` not one class that does everything, but one scope that owns everything.

## What Breaks Without This
Want to add a second player? You'd need \`ship2_x\`, \`ship2_y\`, \`ship2_w\`... and duplicate every function. Want to reset the game? Manually set all 13 variables back. Want to save game state? List every variable and write them one by one. Scattered globals make every future feature harder.

## The Fix: Group State Into a Struct
A \`struct World\` groups all mutable game state into one named container:
\`\`\`cpp
struct World {
    int ship_x = 200, ship_y = 380;
    int ship_w = 40, ship_h = 20;
    int speed = 5;
    int score = 0;
    int wave = 1;
};
World world;
\`\`\`

Now every function accesses \`world.ship_x\` instead of bare \`ship_x\`. The behavior is identical \`\` only the data layout changes.

## Key Concepts
- \`struct World\` is just a named group of fields. No methods, no inheritance.
- Default member initializers set starting values at declaration
- Constants (\`SCREEN_W\`, \`MAX_BULLETS\`) stay as globals \`\` they are not mutable state
- Functions stay separate: \`spawnWave()\` is not a method on World

## Beginner Trap
**Putting methods on the struct.** \`world.update()\` creates a god class. Keep World as pure data. Functions operate ON the struct, not INSIDE it.

## Elite Insight
This is exactly how ECS frameworks work. EnTT, flecs, and Unity DOTS separate data (components/structs) from behavior (systems/functions). Your World struct is a prototype component store.

## Systems Thinking Connection
The RPG groups player, enemy, and combat state into a World struct. The Platformer groups player physics. Every path hits this refactoring step.

## Your Task
Define \`struct World\` with ship position, score, and wave. Create a global instance and print its fields.

Expected output:
\`\`\`
Ship: (200, 380)
Score: 0
Wave: 1
Struct: World
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_ENEMIES = 5;

// TODO: Define struct World with:
//   int ship_x = 200, ship_y = 380;
//   int score = 0;
//   int wave = 1;
// Then declare: World world;

int main() {
    int ship_x = 200, ship_y = 380;
    int score = 0;
    int wave = 1;
    cout << "Ship: (" << ship_x << ", " << ship_y << ")" << endl;
    cout << "Score: " << score << endl;
    cout << "Wave: " << wave << endl;
    // TODO: Print "Struct: World"
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_ENEMIES = 5;

struct World {
    int ship_x = 200, ship_y = 380;
    int score = 0;
    int wave = 1;
};
World world;

int main() {
    cout << "Ship: (" << world.ship_x << ", " << world.ship_y << ")" << endl;
    cout << "Score: " << world.score << endl;
    cout << "Wave: " << world.wave << endl;
    cout << "Struct: World" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Ship position from struct", expectedOutput: "Ship: (200, 380)", isPattern: false },
      { id: "t2", description: "Score from struct", expectedOutput: "Score: 0", isPattern: false },
      { id: "t3", description: "Wave from struct", expectedOutput: "Wave: 1", isPattern: false },
      { id: "t4", description: "Struct confirmed", expectedOutput: "Struct: World", isPattern: false },
    ],
    hints: [
      "struct World { int ship_x = 200, ship_y = 380; int score = 0; int wave = 1; }; goes before main().",
      "World world; declares a global instance. Access with world.ship_x, world.score, etc.",
      "Replace the local variables with world. accesses: cout << world.ship_x. Add cout << \"Struct: World\" << endl;",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: God Object Refactor",
    type: "game_builder",
    instructions: `# Build: God Object Refactor

## Mental Model
Your L10 Micro Shooter has 13 mutable globals scattered at file scope. Every function reaches in and grabs what it needs. This works \`\` but it does not scale. Your task: move all mutable entity state into a single \`struct World\` without changing the gameplay.

## What's Already Here
The complete Micro Shooter from Lesson 10: ship, bullets, enemies, collision, score, wave spawning. All working, all using bare globals.

## Step 1: Define the struct
Above the \`spawnWave\` function, replace the scattered globals with:
\`\`\`cpp
struct World {
    int ship_x = 200, ship_y = 380;
    int ship_w = 40, ship_h = 20;
    int speed = 5;
    int bullet_x[MAX_BULLETS];
    int bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];
    float enemy_x[MAX_ENEMIES];
    float enemy_y[MAX_ENEMIES];
    bool enemy_active[MAX_ENEMIES];
    int score = 0;
    int wave = 1;
};
World world;
\`\`\`

Delete the old global declarations (ship_x, ship_y, bullet_x[], etc.).

## Step 2: Prefix every access with \`world.\`
In \`spawnWave()\`:
- \`enemy_x[i]\` becomes \`world.enemy_x[i]\`
- \`enemy_active[i]\` becomes \`world.enemy_active[i]\`

In \`main()\`:
- \`ship_x\` becomes \`world.ship_x\` everywhere
- \`bullet_x[i]\` becomes \`world.bullet_x[i]\`
- \`score\` becomes \`world.score\`
- etc. for every mutable variable

## Step 3: Add struct confirmation
After the Wave cout, add:
\`\`\`cpp
cout << "Struct: world" << endl;
\`\`\`

**Click Run** \`\` the game should behave identically to L10. Same ship, same bullets, same enemies. The only change is the data layout.

## Did It Work?
Ship moves with arrow keys. Space fires bullets. Enemies drift down. Collision works. Waves respawn. Score climbs. If anything breaks, you missed a \`world.\` prefix somewhere \`\` the compiler error will tell you exactly where.

Expected cout output:
\`\`\`
Ship: (200, 380)
Wave: 1
Score: 0
Struct: world
\`\`\``,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const int MAX_BULLETS = 10;
const int MAX_ENEMIES = 5;

// TODO 1: Replace these scattered globals with struct World { ... }; World world;
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

// TODO 2: Update to use world.enemy_x[i], world.enemy_y[i], etc.
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
    // TODO 3: cout << "Struct: world" << endl;

    while (!WindowShouldClose()) {
        // TODO 4: Replace all ship_x/ship_y with world.ship_x/world.ship_y
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
    solutionCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const int MAX_BULLETS = 10;
const int MAX_ENEMIES = 5;

struct World {
    int ship_x = 200, ship_y = 380;
    int ship_w = 40, ship_h = 20;
    int speed = 5;
    int bullet_x[MAX_BULLETS];
    int bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];
    float enemy_x[MAX_ENEMIES];
    float enemy_y[MAX_ENEMIES];
    bool enemy_active[MAX_ENEMIES];
    int score = 0;
    int wave = 1;
};
World world;

void spawnWave() {
    for (int i = 0; i < MAX_ENEMIES; i++) {
        world.enemy_x[i] = 80 + i * 130;
        world.enemy_y[i] = 30;
        world.enemy_active[i] = true;
    }
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter");
    SetTargetFPS(60);

    for (int i = 0; i < MAX_BULLETS; i++) world.bullet_active[i] = false;
    spawnWave();

    cout << "Ship: (" << world.ship_x << ", " << world.ship_y << ")" << endl;
    cout << "Wave: " << world.wave << endl;
    cout << "Score: " << world.score << endl;
    cout << "Struct: world" << endl;

    while (!WindowShouldClose()) {
        if (IsKeyDown(KEY_RIGHT)) world.ship_x += world.speed;
        if (IsKeyDown(KEY_LEFT)) world.ship_x -= world.speed;
        if (world.ship_x < 0) world.ship_x = 0;
        if (world.ship_x > SCREEN_W - world.ship_w) world.ship_x = SCREEN_W - world.ship_w;

        if (IsKeyPressed(KEY_SPACE)) {
            for (int i = 0; i < MAX_BULLETS; i++) {
                if (!world.bullet_active[i]) {
                    world.bullet_x[i] = world.ship_x + world.ship_w/2 - 2;
                    world.bullet_y[i] = world.ship_y;
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
                bool hit = world.bullet_x[b] < (int)world.enemy_x[e] + 24 &&
                           world.bullet_x[b] + 4 > (int)world.enemy_x[e] &&
                           world.bullet_y[b] < (int)world.enemy_y[e] + 24 &&
                           world.bullet_y[b] + 10 > (int)world.enemy_y[e];
                if (hit) {
                    world.bullet_active[b] = false;
                    world.enemy_active[e] = false;
                    world.score += 100;
                }
            }
        }

        int alive = 0;
        for (int i = 0; i < MAX_ENEMIES; i++) {
            if (world.enemy_active[i]) alive++;
        }
        if (alive == 0) {
            world.wave++;
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
            if (world.enemy_active[i]) DrawRectangle((int)world.enemy_x[i], (int)world.enemy_y[i], 24, 24, RED);
        }

        DrawRectangle(world.ship_x, world.ship_y, world.ship_w, world.ship_h, GREEN);

        for (int i = 0; i < MAX_BULLETS; i++) {
            if (world.bullet_active[i]) DrawRectangle(world.bullet_x[i], world.bullet_y[i], 4, 10, YELLOW);
        }

        DrawText("HeapSight Shooter", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", world.score), 10, 40, 20, WHITE);
        DrawText(TextFormat("Wave: %d", world.wave), 10, 70, 20, WHITE);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints ship position", expectedOutput: "Ship: (200, 380)", isPattern: false },
      { id: "g2", description: "Prints starting wave", expectedOutput: "Wave: 1", isPattern: false },
      { id: "g3", description: "Prints starting score", expectedOutput: "Score: 0", isPattern: false },
      { id: "g4", description: "Struct confirmed", expectedOutput: "Struct: world", isPattern: false },
    ],
    hints: [
      "Define struct World { int ship_x = 200; ... }; World world; above spawnWave. Delete the old global variables.",
      "Replace every bare ship_x with world.ship_x, score with world.score, etc. The compiler error will list every missed reference.",
      "Add cout << \"Struct: world\" << endl; after the Wave cout line.",
    ],
    estimatedMinutes: 15,
  },
};
