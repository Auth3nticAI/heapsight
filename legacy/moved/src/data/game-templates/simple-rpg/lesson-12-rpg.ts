import type { GameLessonVariant } from "@/types/game";

export const lesson12RPG: GameLessonVariant = {
  lessonId: "rpg-12-headers",

  instructions: `# Header Extraction — Separate Declaration from Definition

## Mental Model

Separate declaration from definition. Headers are contracts. Include guards prevent double declarations.

A header is a contract. \\\`components.h\\\` says: these structs exist with these fields. Any .cpp that includes it can use them. Change the struct in one place — every file that includes it sees the change. Single source of truth.

L11 put Position and Stats in main.cpp. That works for one file. Real dungeons have multiple files: \\\`main.cpp\\\` runs the loop, \\\`combat.cpp\\\` handles attacks, \\\`rendering.cpp\\\` draws the grid. Each needs Position. Each needs Stats. Without a header, you copy-paste the definitions. Change a field — forget to update the copy — the combat system reads garbage for the attack value. Silent. Catastrophic.

## What Breaks Without This

No include guards: including a header twice produces \\\`error: redefinition of 'Position'\\\`. No header at all: ten .cpp files each define their own version of Position — ten maintenance burdens, ten opportunities for mismatch. File A thinks Position has \\\`{x, y}\\\`. File B thinks it has \\\`{x, y, z}\\\`. They exchange Position values across a function call. The third field is stack garbage. No compiler warning. Wrong result every frame.

## The Fix

\\\`\\\`\\\`cpp
// components.h
#pragma once
struct Position { int x, y; };
struct Stats { int hp, maxHp, attack, gold; };
\\\`\\\`\\\`

\\\`\\\`\\\`cpp
// main.cpp
#include "components.h"
// Position and Stats available everywhere that includes this
\\\`\\\`\\\`

One line at the top of every header. \\\`#pragma once\\\` tells the preprocessor: I already included this file — skip it. Problem solved in one token. Every professional C++ codebase uses this.

## Pattern Insight

Every C++ codebase you will ever read uses this pattern. \\\`#include <vector>\\\` is the standard library's header. \\\`#include <iostream>\\\` is another. \\\`#include "components.h"\\\` is yours. Headers are how C++ separates what exists from how it works. Declaration from definition. Interface from implementation. Contract from fulfillment.

## Scalability Insight

Add \\\`combat.cpp\\\`: includes \\\`components.h\\\`, gets Position and Stats. Add \\\`rendering.cpp\\\`: same include, same types. Add \\\`spawning.cpp\\\`: same. One header, unlimited consumers. Add a new field to Stats — change it once — recompile — every file that includes the header sees the update automatically. That organizational leverage is why large C++ projects are possible.

## Your Task

Build the dungeon with a simulated multi-file build:

1. Print the build log showing the include chain:
   - \\\`"Build: compiling components.h..."\\\`
   - \\\`"Build: compiling main.cpp..."\\\`
   - \\\`"Build: linking..."\\\`
   - \\\`"Build: SUCCESS"\\\`
2. Define Position and Stats structs above main (simulating the header include)
3. Player: \\\`Position{10, 5}\\\`, \\\`Stats{100, 100, 10, 0}\\\`
4. Enemy: \\\`Position{10, 3}\\\`, \\\`Stats{30, 30, 5, 0}\\\`, \\\`bool alive = true\\\`
5. Render the 20x10 dungeon grid: \\\`@\\\` at playerPos, \\\`E\\\` at enemyPos if alive, \\\`#\\\` walls, \\\`.\\\` floor
6. Attack 3 times: deal \\\`playerStats.attack\\\` damage to \\\`enemyStats.hp\\\`. Set alive=false at zero.
7. Output \\\`"HUD|HP:100|ATK:10|GOLD:0"\\\` from struct fields
8. Output \\\`"GAME_MESSAGE|Build verified: components shared."\\\`
9. Output \\\`"SCORE|0"\\\`

## Common Mistake

Thinking the build log changes the game. It does not. The build log is pure output — four cout statements before any game logic. Architecture changes never change runtime behavior. Moving Position to a header does not change how Position works. It changes who can use it. Organizational changes are invisible to the running game.

## Elite Insight (Skyrim/Diablo/Zelda)

Bethesda ships Creation Kit SDK headers to modders. Read-only declarations of engine types and functions. Modders write C++ that calls engine functions without seeing a single line of engine source code. The header is the API. The source is the secret. Your \\\`components.h\\\` is the API contract for your dungeon. The principle scales from a student dungeon to a AAA engine SDK.

## Pattern Recognition

Build log first. Game output second. This is the pattern every CI/CD system uses. GitHub Actions prints compile output before test results. TeamCity separates build from test phases. You are reading CI output every time you push code. Understanding the two-phase structure — compile then run — turns noise into signal.

## Skill Reinforcement

Position and Stats from L11 unchanged. Grid rendering from L1. Combat from L5-L6. Lifecycle flags from L8. Loot state from L9-L10. Architecture is additive. Headers add a new layer without replacing anything below. The dungeon works the same. The organization improves.

## Mastery Check

Why does \\\`#pragma once\\\` go at the top of the header, not at the bottom? Because the preprocessor processes the file top-to-bottom. If it sees \\\`#pragma once\\\` first, it registers the file as included before reading any definitions. If the file is included again — directly or indirectly — the preprocessor skips it entirely. Putting it at the bottom would paste the definitions twice before the guard fired. Top. Always.`,

  starterCode: `#include <iostream>
using namespace std;

// Simulating: include/components.h with #pragma once
// TODO: Define struct Position { int x, y; };
// TODO: Define struct Stats { int hp, maxHp, attack, gold; };

int main() {
    // TODO: Print build log
    // "Build: compiling components.h..."
    // "Build: compiling main.cpp..."
    // "Build: linking..."
    // "Build: SUCCESS"

    // TODO: Player Position{10, 5} and Stats{100, 100, 10, 0}
    // TODO: Enemy Position{10, 3} and Stats{30, 30, 5, 0}
    bool alive = true;

    // TODO: Render 20x10 dungeon grid
    // # walls, . floor, @ at playerPos, E at enemyPos if alive

    // TODO: Attack 3 times (playerStats.attack damage each)
    // When enemyStats.hp <= 0: alive = false

    // TODO: Print "HUD|HP:100|ATK:10|GOLD:0"
    // TODO: Print "GAME_MESSAGE|Build verified: components shared."
    // TODO: Print "SCORE|0"

    return 0;
}
`,

  solutionCode: `#include <iostream>
using namespace std;

// Simulating: include/components.h
// #pragma once
struct Position { int x, y; };
struct Stats { int hp, maxHp, attack, gold; };

int main() {
    cout << "Build: compiling components.h..." << endl;
    cout << "Build: compiling main.cpp..." << endl;
    cout << "Build: linking..." << endl;
    cout << "Build: SUCCESS" << endl;

    Position playerPos = {10, 5};
    Stats playerStats = {100, 100, 10, 0};

    Position enemyPos = {10, 3};
    Stats enemyStats = {30, 30, 5, 0};
    bool alive = true;

    // Render 20x10 dungeon grid
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == playerPos.x && row == playerPos.y) {
                cout << '@';
            } else if (alive && col == enemyPos.x && row == enemyPos.y) {
                cout << 'E';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }

    // Combat: 3 attacks using struct fields
    for (int i = 0; i < 3; i++) {
        enemyStats.hp -= playerStats.attack;
        if (enemyStats.hp <= 0 && alive) {
            enemyStats.hp = 0;
            alive = false;
        }
    }

    cout << "HUD|HP:" << playerStats.hp << "|ATK:" << playerStats.attack
         << "|GOLD:" << playerStats.gold << endl;
    cout << "GAME_MESSAGE|Build verified: components shared." << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Build log shows SUCCESS",
      expectedOutput: "Build: SUCCESS",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Build log shows compiling components.h",
      expectedOutput: "Build: compiling components\\.h\\.\\.\\.",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Grid renders @ at player row 5, col 10",
      expectedOutput: "#\\.{9}@\\.{9}#",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Grid renders E at enemy row 3, col 10",
      expectedOutput: "#\\.{9}E\\.{9}#",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Game message confirms build and shared components",
      expectedOutput: "GAME_MESSAGE\\|Build verified: components shared\\.",
      isPattern: true,
    },
  ],

  hints: [
    "Print the four build log lines at the very top of main — before any struct instantiation or game logic. Order: components.h → main.cpp → linking → SUCCESS.",
    "Structs defined before main simulate the preprocessor pasting components.h content. The game logic is identical to L11.",
    "The grid render loop is two nested for loops (row 0-9, col 0-19). Check walls first, then player @, then enemy E (only if alive), then floor dot.",
    "HUD format: \\\`cout << \"HUD|HP:\" << playerStats.hp << \"|ATK:\" << playerStats.attack << \"|GOLD:\" << playerStats.gold << endl;\\\`",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

// ==============================
// RPG CORE — L12: Header Extraction
// components.h pattern: declare once, include everywhere
// ==============================

// Simulating: include/components.h
// #pragma once
struct Position { int x, y; };
struct Stats { int hp, maxHp, attack, gold; };

// isAdjacent: combat range check (L7)
bool isAdjacent(int ax, int ay, int bx, int by) {
    int dx = ax - bx;
    int dy = ay - by;
    if (dx < 0) dx = -dx;
    if (dy < 0) dy = -dy;
    return (dx + dy) <= 1;
}

int main() {
    // === BUILD LOG (simulated multi-file compile) ===
    cout << "Build: compiling components.h..." << endl;
    cout << "Build: compiling main.cpp..." << endl;
    cout << "Build: linking..." << endl;
    cout << "Build: SUCCESS" << endl;

    // === PLAYER ===
    Position playerPos = {10, 5};
    Stats playerStats = {100, 100, 10, 0};

    // === ENEMY ===
    Position enemyPos = {10, 3};
    Stats enemyStats = {30, 30, 5, 0};
    bool alive = true;

    // === GOLD (loot drop — from L9) ===
    int goldX = 0, goldY = 0;
    bool goldActive = false;
    int goldValue = 25;

    // === GRID RENDER ===
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == playerPos.x && row == playerPos.y) {
                cout << '@';
            } else if (alive && col == enemyPos.x && row == enemyPos.y) {
                cout << 'E';
            } else if (goldActive && col == goldX && row == goldY) {
                cout << 'G';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }

    // === COMBAT (3 attacks using struct fields) ===
    for (int i = 0; i < 3; i++) {
        enemyStats.hp -= playerStats.attack;
        if (enemyStats.hp <= 0 && alive) {
            enemyStats.hp = 0;
            alive = false;
            goldX = enemyPos.x;
            goldY = enemyPos.y;
            goldActive = true;
        }
    }

    // === PROTOCOL OUTPUT ===
    cout << "HUD|HP:" << playerStats.hp << "|ATK:" << playerStats.attack
         << "|GOLD:" << playerStats.gold << endl;
    cout << "GAME_MESSAGE|Build verified: components shared." << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
};
