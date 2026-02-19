import type { GameLessonVariant } from "@/types/game";

export const lesson07RPG: GameLessonVariant = {
  lessonId: "rpg-07-range",

  instructions: `# Attack Range — Proximity Gates Action

## Mental Model

Proximity gates actions. That is how every RPG works. Zelda: sword swings have range. Diablo: melee vs ranged. Distance is a game rule. Game rules live in code.

The player can only attack when adjacent. Adjacent means within one tile in any direction -- including diagonal. The check is two comparisons: \\\`abs(px - ex) <= 1\\\` AND \\\`abs(py - ey) <= 1\\\`. Both must be true. That boolean is the gate. The attack is behind the gate.

## What Breaks Without This

Without a range check, the player can attack from any tile. The grid becomes decorative. Movement becomes optional. There is no reason to approach the enemy. Combat has no tension. Distance is the source of tactical decisions. Remove it and you remove the game.

## The Fix

Write \\\`bool isAdjacent(int px, int py, int ex, int ey)\\\`. Return true when both axes are within 1. Then wrap the attack call in \\\`if (isAdjacent(...))\\\`. If it returns false, print something like "Too far!" or simply skip the attack. The gate is the fix.

## Pattern Insight

There is a pattern here: range gates action. It is parameterizable. Range 1 = sword. Range 5 = bow. Range 8 = fireball. The threshold is the weapon. Data drives the game. One function, one parameter, infinite weapons. Every combat system in every game answers the same question: is the target within reach?

## Scalability Insight

Right now the range is hardcoded as 1. The next step is to pass range as a parameter: \\\`bool isInRange(int px, int py, int ex, int ey, int range)\\\`. Swords have range 1. Spears have range 2. Ranged weapons have range 5. The function does not change. The data changes. That is data-driven design.

## Your Task

Player starts at (5,5). Enemy at (15,5). Simulate 9 moves right so player reaches (14,5). Check \\\`isAdjacent\\\`. Attack if true. Render the grid with \\\`@\\\` at (14,5) and \\\`E\\\` at (15,5). Print \\\`GAME_MESSAGE|In range! Attack!\\\` and \\\`HUD|HP:30|GOLD:0\\\`.

The full protocol:
\\\`\\\`\\\`
####################
#..................#
#..................#
#..................#
#..................#
#........@E....#
#..................#
#..................#
#..................#
####################
GAME_MESSAGE|In range! Attack!
HUD|HP:30|GOLD:0
\\\`\\\`\\\`

## Common Mistake (Beginner Trap)

Using \\\`== 1\\\` instead of \\\`<= 1\\\`. If the player stands on the same tile as the enemy (\\\`abs == 0\\\`), \\\`== 1\\\` would return false. The player cannot attack from their own tile. That is wrong. Use \\\`<= 1\\\`. Cover zero distance too.

## Elite Insight (Zelda/Skyrim/Diablo)

Diablo's melee attack stores range as a property of the weapon. Swords: range 1. Mauls: range 1 but with area effect. Bows: range 40. The underlying check is always: compute distance, compare to threshold. Your \\\`isAdjacent\\\` function is that check at its simplest. Skyrim uses capsule-capsule intersection for melee range, but the question is identical: is the target within reach?

## Pattern Recognition

Spatial queries are everywhere: collision detection, line of sight, sound propagation, aggro radius, pick-up range. The pattern is always: compute a distance metric, compare to a threshold, return a boolean. \\\`isAdjacent\\\` is the simplest spatial query. Master this pattern and the rest are variations on the same theme.

## Skill Reinforcement

- \\\`abs()\\\` from \\\`<cstdlib>\\\` -- include it at the top
- \\\`bool\\\` functions return \\\`true\\\` or \\\`false\\\`
- \\\`&&\\\` requires both conditions true -- one failing closes the gate
- Grid rows are built column by column: col 0 = wall, col 1-18 = floor or entity, col 19 = wall

## Mastery Check

Why exactly 9 moves? Player at x=5, enemy at x=15. Adjacency requires \\\`abs(px - ex) <= 1\\\`, meaning player must reach x=14 at minimum. From 5 to 14 is 9 steps. Distance minus 1 equals minimum moves. That arithmetic is the movement budget of every tactical RPG. XCOM, Fire Emblem, Final Fantasy Tactics -- all built on this same math.`,

  starterCode: `#include <iostream>
#include <cstdlib>
#include <string>
using namespace std;

int attack(int damage, int targetHp) {
    int hp = targetHp - damage;
    if (hp < 0) hp = 0;
    return hp;
}

// TODO: Write isAdjacent(int px, int py, int ex, int ey)
// Returns true if abs(px-ex) <= 1 AND abs(py-ey) <= 1

int main() {
    int playerX = 5, playerY = 5;
    int playerHp = 30, playerGold = 0;
    int enemyX = 15, enemyY = 5;
    int enemyHp = 30;

    // TODO: Simulate 9 moves right (playerX++)

    // TODO: If isAdjacent, call attack(10, enemyHp)

    // TODO: Render the 20x10 grid
    // Row 0: "####################"
    // Rows 1-4: "#..................#"
    // Row 5: build with @ at playerX, E at enemyX
    // Rows 6-8: "#..................#"
    // Row 9: "####################"

    // TODO: cout << "GAME_MESSAGE|In range! Attack!" << endl;
    // TODO: cout << "HUD|HP:" << playerHp << "|GOLD:" << playerGold << endl;

    return 0;
}
`,

  solutionCode: `#include <iostream>
#include <cstdlib>
#include <string>
using namespace std;

int attack(int damage, int targetHp) {
    int hp = targetHp - damage;
    if (hp < 0) hp = 0;
    return hp;
}

bool isAdjacent(int px, int py, int ex, int ey) {
    return abs(px - ex) <= 1 && abs(py - ey) <= 1;
}

int main() {
    int playerX = 5, playerY = 5;
    int playerHp = 30, playerGold = 0;
    int enemyX = 15, enemyY = 5;
    int enemyHp = 30;

    // Simulate 9 moves right
    for (int i = 0; i < 9; i++) {
        playerX++;
    }

    // Range check and attack
    if (isAdjacent(playerX, playerY, enemyX, enemyY)) {
        enemyHp = attack(10, enemyHp);
    }

    // Render grid (20x10)
    cout << "####################" << endl;
    for (int row = 1; row <= 8; row++) {
        if (row == playerY) {
            string line = "";
            for (int col = 0; col < 20; col++) {
                if (col == 0 || col == 19) {
                    line += '#';
                } else if (col == playerX) {
                    line += '@';
                } else if (col == enemyX) {
                    line += 'E';
                } else {
                    line += '.';
                }
            }
            cout << line << endl;
        } else {
            cout << "#..................#" << endl;
        }
    }
    cout << "####################" << endl;

    cout << "GAME_MESSAGE|In range! Attack!" << endl;
    cout << "HUD|HP:" << playerHp << "|GOLD:" << playerGold << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Player @ appears at column 14 on row 5 after 9 moves right",
      expectedOutput: "#\\.{8}@E\\.{4}#",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Grid has top wall row of 20 hash characters",
      expectedOutput: "####################",
      isPattern: true,
    },
    {
      id: "g3",
      description: "GAME_MESSAGE confirms attack is in range",
      expectedOutput: "GAME_MESSAGE\\|In range! Attack!",
      isPattern: true,
    },
    {
      id: "g4",
      description: "HUD shows player HP and gold",
      expectedOutput: "HUD\\|HP:30\\|GOLD:0",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Interior rows without entities have wall-dot-wall pattern",
      expectedOutput: "#\\.{18}#",
      isPattern: true,
    },
  ],

  hints: [
    "Move the player: `for (int i = 0; i < 9; i++) { playerX++; }` -- player goes from x=5 to x=14.",
    "Check range and attack: `if (isAdjacent(playerX, playerY, enemyX, enemyY)) { enemyHp = attack(10, enemyHp); }`",
    "Build row 5 with a for loop over columns 0-19. Use '#' at 0 and 19, '@' at playerX, 'E' at enemyX, '.' elsewhere.",
    "Output order matters: full grid first, then GAME_MESSAGE, then HUD.",
  ],

  accumulatedCode: `#include <iostream>
#include <cstdlib>
#include <string>
using namespace std;

// --- Combat system ---
int attack(int damage, int targetHp) {
    int hp = targetHp - damage;
    if (hp < 0) hp = 0;
    return hp;
}

// --- Range system ---
bool isAdjacent(int px, int py, int ex, int ey) {
    return abs(px - ex) <= 1 && abs(py - ey) <= 1;
}

int main() {
    // --- Player state ---
    int playerX = 5, playerY = 5;
    int playerHp = 30, playerGold = 0;

    // --- Enemy state ---
    int enemyX = 15, enemyY = 5;
    int enemyHp = 30;

    // --- Movement: 9 steps right ---
    for (int i = 0; i < 9; i++) {
        if (playerX + 1 < 19) playerX++;  // bounds check: stay inside walls
    }

    // --- Attack if in range ---
    if (isAdjacent(playerX, playerY, enemyX, enemyY)) {
        enemyHp = attack(10, enemyHp);
    }

    // --- Grid render (20x10) ---
    cout << "####################" << endl;
    for (int row = 1; row <= 8; row++) {
        if (row == playerY) {
            string line = "";
            for (int col = 0; col < 20; col++) {
                if (col == 0 || col == 19) {
                    line += '#';
                } else if (col == playerX) {
                    line += '@';
                } else if (col == enemyX) {
                    line += 'E';
                } else {
                    line += '.';
                }
            }
            cout << line << endl;
        } else {
            cout << "#..................#" << endl;
        }
    }
    cout << "####################" << endl;

    // --- Protocol ---
    cout << "GAME_MESSAGE|In range! Attack!" << endl;
    cout << "HUD|HP:" << playerHp << "|GOLD:" << playerGold << endl;

    return 0;
}
`,
};
