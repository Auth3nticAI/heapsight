import type { GameLessonVariant } from "@/types/game";

export const lesson11RPG: GameLessonVariant = {
  lessonId: "rpg-11-components",

  instructions: `# Component Structs — Data Takes Shape

## Mental Model

Structs group related data. A position is x and y. Stats are hp, attack, gold. Group what belongs together.

You have been writing \\\`int playerX, playerY, playerHP, playerGold\\\`. Seven loose variables floating in main. Which go together? No compiler knows. Now wrap them: \\\`struct Position { int x, y; };\\\` says these two travel together. \\\`struct Stats { int hp, maxHp, attack, gold; };\\\` says these four belong to the same entity. The type system enforces the grouping. \\\`movePlayer(playerPos)\\\` is self-documenting. \\\`movePlayer(playerX, playerHP)\\\` compiles, runs horribly, no error.

## What Breaks Without This

Seven loose ints. Pass the wrong one to a function — silent bug. Add a second enemy — fourteen more variables. Miss one initialization — ghost enemy with garbage stats. With structs: \\\`Position e2pos = {12, 3}; Stats e2stats = {30, 30, 5, 0};\\\`. Two lines. Every field covered. Aggregate initialization makes missing a field a compile error.

## The Fix

\\\`\\\`\\\`cpp
struct Position { int x, y; };
struct Stats { int hp, maxHp, attack, gold; };

Position playerPos = {10, 5};
Stats playerStats = {100, 100, 10, 0};

Position enemyPos = {10, 3};
Stats enemyStats = {30, 30, 5, 0};
\\\`\\\`\\\`

Two pairs instead of seven variables. \\\`playerPos.x\\\` reads like documentation. \\\`playerStats.attack\\\` is impossible to confuse with \\\`playerStats.hp\\\`. The compiler catches the mix-up that your eyes would miss.

## Pattern Insight

Every ECS system you will ever read uses this pattern. Unity DOTS: \\\`struct Translation : IComponentData { float3 Value; }\\\`. Unreal: \\\`FVector Location\\\`. EnTT: \\\`struct Position { float x, y; };\\\`. The names change. The shape is always the same. Small, focused structs. One concept per struct. Group what moves together in memory and in meaning.

## Scalability Insight

Ten enemies: \\\`Position enemyPos[10]; Stats enemyStats[10];\\\`. Movement iterates only Position. Combat iterates only Stats. Each system touches exactly the data it needs. No wasted cache lines dragging in gold values during a pathfinding loop.

## Your Task

Build the dungeon with struct-organized data:

1. Define \\\`struct Position { int x, y; };\\\` and \\\`struct Stats { int hp, maxHp, attack, gold; };\\\`
2. Player: \\\`Position{10, 5}\\\`, \\\`Stats{100, 100, 10, 0}\\\`
3. Enemy: \\\`Position{10, 3}\\\`, \\\`Stats{30, 30, 5, 0}\\\`, \\\`bool alive = true\\\`
4. Render the 20x10 dungeon grid: \\\`@\\\` at playerPos, \\\`E\\\` at enemyPos if alive, \\\`#\\\` walls, \\\`.\\\` floor
5. Attack 3 times: deal \\\`playerStats.attack\\\` damage to \\\`enemyStats.hp\\\`. Set alive=false when hp reaches 0.
6. Output \\\`"HUD|HP:100|ATK:10|GOLD:0"\\\` from struct fields
7. Output \\\`"GAME_MESSAGE|Structs bring order."\\\`
8. Output \\\`"SCORE|0"\\\`

## Common Mistake

One giant \\\`Entity { int x, y, hp, maxHp, attack, gold, alive... }\\\` struct. That drags every field into every cache line. Movement needs x and y. Combat needs hp and attack. Gold pickup needs gold. No system needs everything. Small focused structs win every time.

## Elite Insight (Skyrim/Diablo/Zelda)

Skyrim's actor system stores position, stats, inventory, and faction in separate component tables. Diablo stores monster position separately from monster stats so the pathfinding system never loads damage values. Zelda keeps Link's world coordinates separate from his heart containers. These are the same two structs you are about to write. At production scale.

## Pattern Recognition

Grid renders from Position. HUD renders from Stats. Combat modifies Stats. Movement modifies Position. Four operations. Two structs. Each operation touches exactly one struct. This is low coupling. This is why ECS architecture replaced OOP in every major game engine after 2010.

## Skill Reinforcement

Grid rendering (L1), entity lifecycle flags (L8), combat (L5-L6), loot and pickup (L9-L10). All carried forward unchanged. The only difference is the container. Same ints. Better names. Same game. Better architecture.

## Mastery Check

What is the difference between \\\`Position playerPos = {10, 5};\\\` and \\\`int playerX = 10; int playerY = 5;\\\`? Both are two ints on the stack. The struct version enforces that x and y travel together. You cannot pass \\\`playerPos.x\\\` to a function expecting a \\\`Position\\\` — the compiler will complain. That enforcement catches in thirty seconds what a raw-variable bug might hide for days.`,

  starterCode: `#include <iostream>
using namespace std;

// TODO: Define struct Position { int x, y; };
// TODO: Define struct Stats { int hp, maxHp, attack, gold; };

int main() {
    // TODO: Player Position{10, 5} and Stats{100, 100, 10, 0}

    // TODO: Enemy Position{10, 3} and Stats{30, 30, 5, 0}
    bool alive = true;

    // TODO: Render 20x10 grid
    // # walls on border, . floor, @ at playerPos, E at enemyPos if alive

    // TODO: Attack 3 times (playerStats.attack damage each)
    // When enemyStats.hp <= 0: alive = false

    // TODO: Print "HUD|HP:100|ATK:10|GOLD:0"
    // TODO: Print "GAME_MESSAGE|Structs bring order."
    // TODO: Print "SCORE|0"

    return 0;
}
`,

  solutionCode: `#include <iostream>
using namespace std;

struct Position { int x, y; };
struct Stats { int hp, maxHp, attack, gold; };

int main() {
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
    cout << "GAME_MESSAGE|Structs bring order." << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Grid renders with @ at player row 5, col 10",
      expectedOutput: "#\\.{9}@\\.{9}#",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Grid renders with E at enemy row 3, col 10",
      expectedOutput: "#\\.{9}E\\.{9}#",
      isPattern: true,
    },
    {
      id: "g3",
      description: "HUD shows HP, ATK, GOLD from struct fields",
      expectedOutput: "HUD\\|HP:100\\|ATK:10\\|GOLD:0",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Game message confirms structs are in use",
      expectedOutput: "GAME_MESSAGE\\|Structs bring order\\.",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Top wall is 20 hash characters",
      expectedOutput: "####################",
      isPattern: true,
    },
  ],

  hints: [
    "Define both structs before main. Aggregate-initialize: \\\`Position playerPos = {10, 5};\\\` — first value is x, second is y.",
    "Grid render order: check walls first (row 0, row 9, col 0, col 19), then player @, then enemy E (only if alive), then floor dot.",
    "Combat: \\\`enemyStats.hp -= playerStats.attack;\\\` — three attacks of 10 damage each reduces 30 hp to exactly 0.",
    "HUD string: \\\`cout << \"HUD|HP:\" << playerStats.hp << \"|ATK:\" << playerStats.attack << \"|GOLD:\" << playerStats.gold << endl;\\\`",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

// ==============================
// RPG CORE — L11: Component Structs
// Position and Stats replace loose variables
// ==============================

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
    cout << "GAME_MESSAGE|Structs bring order." << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
};
