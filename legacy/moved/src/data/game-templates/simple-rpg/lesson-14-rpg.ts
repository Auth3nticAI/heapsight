import type { GameLessonVariant } from "@/types/game";

export const lesson14RPG: GameLessonVariant = {
  lessonId: "rpg-14-dynamic-enemies",

  instructions: `# Dynamic Enemies — The Horde Arrives

## Mental Model

Vector grows as the dungeon demands. 3 enemies? 10? 50? Same code. That's scalability.

Fixed arrays beg for trouble. You declare \\\`Position enemies[4]\\\` and the dungeon designer adds a fifth wave. The fifth enemy writes past the array. The program doesn't crash there — it crashes somewhere random, an hour later, with no obvious connection to the overwrite. Undefined behavior laughs at your debugging skills.

\\\`std::vector\\\` fixes this permanently. Push as many enemies as the dungeon demands. The vector grows. The count updates. The same render loop, the same combat loop, the same alive-flag logic — all unchanged. You write the system once. The data scales freely.

## What Breaks Without This

Without vectors, you pick a MAX_ENEMIES constant. 10? Fine for lesson 14. What about lesson 20 when the dungeon has three rooms and each room spawns 8 enemies? 24 enemies, 10 slots. The 11th spawn silently fails or corrupts memory. You chase a bug that does not exist at the spawn site. You find it six files away. You lose an afternoon.

## The Fix

Replace every fixed enemy array with parallel vectors. \\\`push_back\\\` adds an enemy. \\\`alive[i] = false\\\` removes it logically. \\\`positions.size()\\\` gives the count. The rest is the same code you have been writing since lesson 6.

\\\`\\\`\\\`cpp
vector<Position> positions;
vector<Stats> stats;
vector<bool> alive;

// Spawn — same call every time, any number of times
auto spawnEnemy = [&](int x, int y) {
    positions.push_back({x, y});
    stats.push_back({30, 30, 10});
    alive.push_back(true);
};

spawnEnemy(10, 3);
spawnEnemy(5, 3);
spawnEnemy(15, 3);
spawnEnemy(3, 7);

cout << "Enemies: " << positions.size() << endl; // 4
\\\`\\\`\\\`

## Pattern Insight

Parallel vectors are the structural pattern. Index i refers to the same entity across all vectors simultaneously. positions[2], stats[2], and alive[2] describe the same enemy. Adding a new property to an enemy means adding a new vector — not modifying a struct, not touching existing code. This is the open/closed principle expressed in data layout.

## Scalability Insight

The render loop iterates \\\`positions.size()\\\` enemies. The combat loop iterates \\\`positions.size()\\\` enemies. Neither loop knows or cares how many enemies exist. Spawn 4. Spawn 40. Spawn 400. The loops run the same code on however many elements the vectors hold. That is the meaning of scalable: the system does not change as data changes.

## Your Task

Build the full dynamic enemy system:

1. Declare \\\`vector<Position>\\\`, \\\`vector<Stats>\\\`, \\\`vector<bool> alive\\\`
2. Spawn 4 enemies:
   - Enemy 0: pos(10,3) stats(30,30,10) — adjacent to player
   - Enemy 1: pos(5,3)  stats(30,30,10)
   - Enemy 2: pos(15,3) stats(30,30,10)
   - Enemy 3: pos(10,7) stats(30,30,10)
3. Place player at (10,4)
4. Attack enemy 0 three times (10 damage each). On death: \\\`alive[0] = false\\\`, score += 100
5. Render 20x10 grid: \\\`#\\\` border, \\\`@\\\` player, \\\`E\\\` alive enemies, \\\`.\\\` floor
6. Output \\\`HUD|HP:100|SCORE:100|LIVES:3\\\`
7. Output \\\`GAME_MESSAGE|The horde arrives.\\\`
8. Output \\\`SCORE|100\\\`

## Common Mistake

Forgetting to push to all three vectors in every spawn. If you push to \\\`positions\\\` but skip \\\`stats\\\` or \\\`alive\\\`, the vectors have different sizes. Index 2 in positions has no stats[2]. The loop reads garbage or crashes. Treat the three push_back calls as one atomic operation: they always happen together.

## Elite Insight

The parallel vector layout is Structure-of-Arrays (SoA). When the movement system iterates, it touches only \\\`positions[]\\\`. The stats data never enters the cache. When the combat system iterates, it touches only \\\`stats[]\\\`. Clean separation. Hot data stays hot. This is why Unity DOTS, Bevy ECS, and Unreal Mass Entity all use SoA. Your parallel vectors are the same pattern at dungeon scale.

## Pattern Recognition

Every entity system uses this pattern: spawn adds to all parallel containers, the alive flag gates all processing, the render loop reads current state. You will write this in every game you build. Recognizing it as a pattern — rather than writing new code each time — is the skill that separates junior from senior.

## Skill Reinforcement

- \\\`std::vector\\\` and \\\`push_back\\\` from this lesson
- Alive flags from Lesson 8
- Grid render from Lessons 1-5
- isAdjacent from Lesson 9
- Attack loop from Lesson 8
All combining into one dynamic system.

## Mastery Check

What happens if you use \\\`vector.erase()\\\` to remove a dead enemy instead of the alive flag? Every index after the erased element shifts left by one. Any code holding a reference to those indices now points at the wrong entity. AI targets, loot drop positions, saved indices — all invalidated. The alive flag costs one bool. Index stability costs nothing. That trade is always worth it.`,

  starterCode: `#include <iostream>
#include <vector>
using namespace std;

struct Position { int x, y; };
struct Stats { int hp, maxHp, attack; };

bool isAdjacent(int ax, int ay, int bx, int by) {
    int dx = ax - bx; if (dx < 0) dx = -dx;
    int dy = ay - by; if (dy < 0) dy = -dy;
    return (dx + dy) <= 1;
}

int main() {
    // TODO: Declare vector<Position>, vector<Stats>, vector<bool> alive
    // TODO: Spawn 4 enemies
    // 0: pos(10,3) stats(30,30,10)
    // 1: pos(5,3)  stats(30,30,10)
    // 2: pos(15,3) stats(30,30,10)
    // 3: pos(10,7) stats(30,30,10)

    int playerX = 10, playerY = 4;
    int playerHP = 100;
    int score = 0;

    // TODO: Attack enemy 0 three times (10 dmg each)
    // On HP <= 0: alive[0] = false, score += 100

    // TODO: Render 20x10 grid
    // # border, @ player, E alive enemy, . floor

    cout << "HUD|HP:" << playerHP << "|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|The horde arrives." << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,

  solutionCode: `#include <iostream>
#include <vector>
using namespace std;

struct Position { int x, y; };
struct Stats { int hp, maxHp, attack; };

bool isAdjacent(int ax, int ay, int bx, int by) {
    int dx = ax - bx; if (dx < 0) dx = -dx;
    int dy = ay - by; if (dy < 0) dy = -dy;
    return (dx + dy) <= 1;
}

int main() {
    vector<Position> positions;
    vector<Stats> stats;
    vector<bool> alive;

    // Spawn 4 enemies
    positions.push_back({10, 3}); stats.push_back({30, 30, 10}); alive.push_back(true);
    positions.push_back({5, 3});  stats.push_back({30, 30, 10}); alive.push_back(true);
    positions.push_back({15, 3}); stats.push_back({30, 30, 10}); alive.push_back(true);
    positions.push_back({10, 7}); stats.push_back({30, 30, 10}); alive.push_back(true);

    int playerX = 10, playerY = 4;
    int playerHP = 100;
    int score = 0;

    // Attack enemy 0 (adjacent to player)
    if (isAdjacent(playerX, playerY, positions[0].x, positions[0].y)) {
        for (int hit = 0; hit < 3; hit++) {
            stats[0].hp -= 10;
        }
        if (stats[0].hp <= 0 && alive[0]) {
            alive[0] = false;
            score += 100;
        }
    }

    // Render 20x10 grid
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
                continue;
            }
            if (col == playerX && row == playerY) {
                cout << '@';
                continue;
            }
            bool printed = false;
            for (int i = 0; i < (int)positions.size(); i++) {
                if (alive[i] && col == positions[i].x && row == positions[i].y) {
                    cout << 'E';
                    printed = true;
                    break;
                }
            }
            if (!printed) cout << '.';
        }
        cout << endl;
    }

    cout << "HUD|HP:" << playerHP << "|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|The horde arrives." << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Score is 100 — enemy 0 killed",
      expectedOutput: "SCORE\\|100",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Enemy 1 at (5,3) still alive — E in row 3",
      expectedOutput: "#\\.{4}E",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Player @ at (10,4) in the grid",
      expectedOutput: "#\\.{9}@",
      isPattern: true,
    },
    {
      id: "g4",
      description: "HUD shows HP:100, SCORE:100, LIVES:3",
      expectedOutput: "HUD\\|HP:100\\|SCORE:100\\|LIVES:3",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Game message announces the horde",
      expectedOutput: "GAME_MESSAGE\\|The horde arrives\\.",
      isPattern: true,
    },
  ],

  hints: [
    "Push to all three vectors in each spawn: \`positions.push_back({x,y}); stats.push_back({hp,maxHp,atk}); alive.push_back(true);\` — three lines, one entity.",
    "After the attack loop ends, check \`if (stats[0].hp <= 0 && alive[0])\` to trigger the death. The \`alive[0]\` guard prevents double-triggering if you later add more attacks.",
    "In the render loop, check player position first, then loop enemies. The inner enemy loop can break early when it finds a match — \`break\` exits only the inner for loop, not the outer grid loop.",
  ],

  accumulatedCode: `#include <iostream>
#include <vector>
using namespace std;

// ==============================
// RPG CORE — Lessons 1-14
// Phase 2: Dynamic Collections
// ==============================

struct Position { int x, y; };
struct Stats { int hp, maxHp, attack; };

// Optional components (from L11-L13 composition pattern)
struct Shield { int current; };
struct Speed  { int dx, dy; };

bool isAdjacent(int ax, int ay, int bx, int by) {
    int dx = ax - bx; if (dx < 0) dx = -dx;
    int dy = ay - by; if (dy < 0) dy = -dy;
    return (dx + dy) <= 1;
}

int main() {
    // === PARALLEL VECTOR ENTITY SYSTEM ===
    // Index i refers to the same entity across all vectors
    vector<Position> positions;
    vector<Stats>    stats;
    vector<bool>     alive;

    // Spawn 4 enemies — push_back to all vectors atomically
    positions.push_back({10, 3}); stats.push_back({30, 30, 10}); alive.push_back(true);
    positions.push_back({5, 3});  stats.push_back({30, 30, 10}); alive.push_back(true);
    positions.push_back({15, 3}); stats.push_back({30, 30, 10}); alive.push_back(true);
    positions.push_back({10, 7}); stats.push_back({30, 30, 10}); alive.push_back(true);

    // === PLAYER STATE ===
    int playerX = 10, playerY = 4;
    int playerHP = 100;
    int playerGold = 0;
    int score = 0;

    // === COMBAT ===
    // Attack adjacent enemy 0 three times
    if (isAdjacent(playerX, playerY, positions[0].x, positions[0].y)) {
        for (int hit = 0; hit < 3; hit++) {
            stats[0].hp -= 10;
        }
        if (stats[0].hp <= 0 && alive[0]) {
            alive[0] = false;
            score += 100;
        }
    }

    // === GRID RENDER ===
    // 20x10: # border, @ player, E alive enemy, . floor
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#'; continue;
            }
            if (col == playerX && row == playerY) {
                cout << '@'; continue;
            }
            bool printed = false;
            for (int i = 0; i < (int)positions.size(); i++) {
                if (alive[i] && col == positions[i].x && row == positions[i].y) {
                    cout << 'E'; printed = true; break;
                }
            }
            if (!printed) cout << '.';
        }
        cout << endl;
    }

    // === PROTOCOL OUTPUT ===
    cout << "HUD|HP:" << playerHP << "|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|The horde arrives." << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
};
