import type { GameLessonVariant } from "@/types/game";

export const lesson12SpaceShooter: GameLessonVariant = {
  lessonId: "12-extract-components-header",
  instructions: `# Struct Definitions Copy-Pasted Everywhere

You defined Position, Velocity, Health in main.cpp. Works fine. Now you need a spawning.cpp with spawn functions. And a systems.cpp with movement and damage. Each file needs the struct definitions. Copy-paste them? Now you have three copies. Change one field. Forget the others. Build compiles. Data corrupts at runtime.

## What Breaks Without This

File A thinks Health has {current, max}. File B was edited last week and still has {hp, maxHp}. They both compile separately. The linker stitches them together. At runtime, file A writes to offset 0 thinking it's "current". File B reads offset 0 thinking it's "hp". Same memory, different interpretations. Silent corruption. The bug manifests five functions later as an enemy with 2 billion HP.

## The Fix

One header file. One source of truth. \`#pragma once\` at the top. Every .cpp that needs these structs writes \`#include "components.h"\`. Change the struct once \u2192 every file sees the change. Mismatch impossible. The preprocessor handles the copy-paste for you, perfectly, every time.

In this exercise, we simulate the multi-file build. We print a build log showing which files exist, what they contain, and that the includes resolve correctly. Then we use the structs to run the game scene. The build log is the lesson. The game scene is the proof.

## Your Task

1. Print build log showing components.h content and main.cpp including it
2. Print build success
3. Define Position, Velocity, Health structs (simulating the header include)
4. Spawn 5 enemies using struct arrays: x=60,120,180,240,300 y=40 dx=0 dy=2 hp=30/30
5. Run 2 movement ticks
6. Kill enemies 1 and 3 (30 damage each, +100 score per kill)
7. Render surviving enemies with ENTITY protocol
8. Output HUD, message, score

## Beginner Trap

**Common Mistake:** Thinking \`#include\` does something at runtime. It does not. The preprocessor runs before compilation. \`#include "components.h"\` literally pastes the file's text into your .cpp. After preprocessing, the compiler sees one big file. Headers are a source-code organization tool with zero runtime cost.

## Elite Insight

Google's C++ codebase has 350 million lines of code. Without headers, every file would need its own copy of every type definition. Headers make this possible. Build systems (Bazel, CMake) track which headers changed and only recompile affected files. This is incremental compilation. Headers are the unit of change tracking.

## Systems Thinking Connection

L11 created the structs. L12 extracts them. The code is identical. The architecture is different. This distinction matters at scale. A 10-file project with copy-pasted structs is manageable. A 100-file project is not. Headers scale. Copy-paste doesn't.

## Cross-Path Echo

Every project path extracts components to headers at the same point. The Platformer path moves Rect and Physics to headers. The RPG path moves Item and Inventory. Same lesson, same pattern, different domain data.`,
  starterCode: `#include <iostream>
using namespace std;

// Simulating: include/components.h with #pragma once
// TODO: Define struct Position { int x, y; };
// TODO: Define struct Velocity { int dx, dy; };
// TODO: Define struct Health { int current, max; };

int main() {
    // Build log
    cout << "=== BUILD LOG ===" << endl;
    cout << "[1/3] components.h: Position, Velocity, Health" << endl;
    cout << "[2/3] main.cpp: #include \\"components.h\\"" << endl;
    cout << "[3/3] Build: SUCCESS" << endl;
    cout << endl;

    const int MAX = 5;

    // TODO: Create component arrays
    // Position pos[MAX]; Velocity vel[MAX]; Health hp[MAX]; bool alive[MAX];

    int score = 0;

    // TODO: Spawn 5 enemies
    // x = 60 + i*60, y = 40, dx = 0, dy = 2, hp = 30/30

    // TODO: Movement - 2 ticks

    // TODO: Damage enemies 1 and 3 (30 damage each, +100 score)

    // TODO: Render alive enemies
    // ENTITY|eN|enemy|pos.x|pos.y|22|22|hp.current

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|Header build verified - components shared" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

// Simulating: include/components.h
// #pragma once
struct Position { int x, y; };
struct Velocity { int dx, dy; };
struct Health { int current, max; };

int main() {
    // Build log
    cout << "=== BUILD LOG ===" << endl;
    cout << "[1/3] components.h: Position, Velocity, Health" << endl;
    cout << "[2/3] main.cpp: #include \\"components.h\\"" << endl;
    cout << "[3/3] Build: SUCCESS" << endl;
    cout << endl;

    const int MAX = 5;

    Position pos[MAX];
    Velocity vel[MAX];
    Health hp[MAX];
    bool alive[MAX];

    int score = 0;

    // Spawn 5 enemies
    for (int i = 0; i < MAX; i++) {
        pos[i] = {60 + i * 60, 40};
        vel[i] = {0, 2};
        hp[i] = {30, 30};
        alive[i] = true;
    }

    // Movement - 2 ticks
    for (int tick = 0; tick < 2; tick++) {
        for (int i = 0; i < MAX; i++) {
            if (alive[i]) {
                pos[i].x += vel[i].dx;
                pos[i].y += vel[i].dy;
            }
        }
    }

    // Damage enemies 1 and 3
    hp[1].current -= 30;
    if (hp[1].current <= 0) { hp[1].current = 0; alive[1] = false; }
    score += 100;

    hp[3].current -= 30;
    if (hp[3].current <= 0) { hp[3].current = 0; alive[3] = false; }
    score += 100;

    // Render alive enemies
    for (int i = 0; i < MAX; i++) {
        if (alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << pos[i].x << "|" << pos[i].y
                 << "|22|22|" << hp[i].current << endl;
        }
    }

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|Header build verified - components shared" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Build should succeed", expectedOutput: "Build: SUCCESS" },
    { id: "g2", description: "Enemy0 at (60,44) after 2 ticks", expectedOutput: "ENTITY\\|e0\\|enemy\\|60\\|44\\|22\\|22\\|30", isPattern: true },
    { id: "g3", description: "Enemy1 should NOT render (killed)", expectedOutput: "^(?!.*ENTITY\\|e1\\|)", isPattern: true },
    { id: "g4", description: "Enemy2 at (180,44)", expectedOutput: "ENTITY\\|e2\\|enemy\\|180\\|44\\|22\\|22\\|30", isPattern: true },
    { id: "g5", description: "Enemy4 at (300,44)", expectedOutput: "ENTITY\\|e4\\|enemy\\|300\\|44\\|22\\|22\\|30", isPattern: true },
    { id: "g6", description: "HUD shows score 200", expectedOutput: "HUD\\|HP:100\\|SCORE:200\\|LIVES:3", isPattern: true },
    { id: "g7", description: "Header build verified message", expectedOutput: "GAME_MESSAGE\\|Header build verified - components shared", isPattern: true },
    { id: "g8", description: "Score is 200", expectedOutput: "SCORE\\|200", isPattern: true },
  ],
  hints: [
    "The structs are identical to L11. Define them before main. The build log is just cout statements simulating compiler output.",
    "Game logic is the same as L11 Part 2: spawn 5, move 2 ticks (dy=2, so y goes 40->42->44), damage 2, render survivors.",
    "Escape quotes in build log output: `cout << \"[2/3] main.cpp: #include \\\"components.h\\\"\" << endl;`",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

// === L12: Header extraction ===
// In a real project, these structs live in include/components.h
// with #pragma once at the top.
// Every .cpp file that needs them writes: #include "components.h"
// Single source of truth. No copy-paste. No mismatch.

// --- include/components.h (simulated) ---
// #pragma once
struct Position { int x, y; };
struct Velocity { int dx, dy; };
struct Health { int current, max; };

const int POOL_SIZE = 20;

// --- Component arrays (SoA with structs, L11) ---
Position enemy_pos[POOL_SIZE];
Velocity enemy_vel[POOL_SIZE];
Health enemy_hp[POOL_SIZE];
bool enemy_alive[POOL_SIZE];

// --- Pool management (L10) ---
int findFreeSlot(bool alive[], int size) {
    for (int i = 0; i < size; i++) {
        if (!alive[i]) return i;
    }
    return -1;
}

void spawnEnemy(int idx, Position p, Velocity v, Health h,
                Position pos[], Velocity vel[], Health hp[], bool alive[]) {
    pos[idx] = p;
    vel[idx] = v;
    hp[idx] = h;
    alive[idx] = true;
}

void despawnEnemy(int idx, bool alive[]) {
    alive[idx] = false;
}

// --- System functions (L9 + L11) ---
void moveSystem(Position pos[], Velocity vel[], bool alive[], int count) {
    for (int i = 0; i < count; i++) {
        if (alive[i]) {
            pos[i].x += vel[i].dx;
            pos[i].y += vel[i].dy;
        }
    }
}

void damageSystem(Health hp[], bool alive[], int targetIdx, int damage) {
    hp[targetIdx].current -= damage;
    if (hp[targetIdx].current < 0) hp[targetIdx].current = 0;
    if (hp[targetIdx].current <= 0) alive[targetIdx] = false;
}

int main() {
    // Initialize pool
    for (int i = 0; i < POOL_SIZE; i++) {
        enemy_alive[i] = false;
    }

    int score = 0;

    // Spawn 5 enemies
    for (int i = 0; i < 5; i++) {
        int idx = findFreeSlot(enemy_alive, POOL_SIZE);
        spawnEnemy(idx, {60 + i * 60, 40}, {0, 2}, {30, 30},
                   enemy_pos, enemy_vel, enemy_hp, enemy_alive);
    }

    // Movement: 2 ticks
    moveSystem(enemy_pos, enemy_vel, enemy_alive, POOL_SIZE);
    moveSystem(enemy_pos, enemy_vel, enemy_alive, POOL_SIZE);

    // Combat: kill enemies 1 and 3
    damageSystem(enemy_hp, enemy_alive, 1, 30);
    score += 100;
    damageSystem(enemy_hp, enemy_alive, 3, 30);
    score += 100;

    // Render
    for (int i = 0; i < POOL_SIZE; i++) {
        if (enemy_alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << enemy_pos[i].x << "|" << enemy_pos[i].y
                 << "|22|22|" << enemy_hp[i].current << endl;
        }
    }

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|Header build verified - components shared" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
};
