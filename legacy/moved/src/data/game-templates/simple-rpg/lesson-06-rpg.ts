import type { GameLessonVariant } from "@/types/game";

export const lesson06RPG: GameLessonVariant = {
  lessonId: "rpg-06-attack",
  instructions: `# Attack Action — The Command Pattern Seed

Attack is a function. Damage is data. The function transforms data. That is the Command pattern seed. One function call takes a target HP value and a damage amount. It subtracts. It clamps. It returns the new HP. The caller stores the result. The display reads the result. The enemy weakens. Three calls and the enemy is gone.

## Mental Model

Before the attack function exists, damage calculation lives at the call site. Every place the player attacks, you write the subtraction and clamp again. Three attacks means three copies. When the damage formula changes — and it always changes — you change it in three places. One copy is old. You have introduced a bug by copying.

The function solves this. Write the subtraction and clamp once. Name it \\\`attack\\\`. Call it from every place damage is dealt. When the formula changes, change one function. Every call site updates automatically. The rule lives in exactly one place. This is the most important software engineering principle you will encounter: one source of truth.

## What Breaks Without This

Without the attack function, combat logic leaks everywhere. The player attack and the enemy counterattack both inline their damage math. A poison effect inlines its damage math. A trap inlines its damage math. Each is slightly different because they were written at different times by people who did not coordinate. The goblin takes 12 damage from the sword. The trap deals 12 damage but the goblin survives because the two damage systems have different clamping behavior. The game is inconsistent. Players notice inconsistency. Inconsistency destroys trust in the game's rules.

## The Fix

\\\`\\\`\\\`cpp
int attack(int damage, int targetHp) {
    int newHp = targetHp - damage;
    if (newHp < 0) newHp = 0;
    return newHp;
}
\\\`\\\`\\\`

This function is the single source of truth for how damage is applied. Every damage source in the game — player attack, enemy attack, traps, poison, environmental hazards — calls this function. The rule is the same for everyone. The game is consistent.

## Pattern Insight

Attack is a function. Damage is data. The function transforms data. That is the Command pattern seed. A command is an action packaged as data. In its simplest form, a command is a function call: action name plus parameters. \\\`attack(10, enemyHP)\\\` is a command. \\\`heal(15, playerHP)\\\` is a command. \\\`block(5, incomingDamage)\\\` is a command. Each command takes current state and returns new state. The game's verb system is a collection of these functions. You are writing the first one.

## Scalability Insight

Diablo II's damage formula accounts for character level, weapon damage range, skill modifiers, enemy armor, resistance types, blocking, and critical hit multipliers. The implementation is hundreds of lines. The call site is still one line: \\\`newHp = calculateDamage(attacker, defender, weapon, skill);\\\`. Your three-line \\\`attack\\\` function is the same structure. The interface is stable regardless of complexity inside. Callers do not need to know how damage is calculated. They just call the function.

## Your Task

1. Define \\\`int attack(int damage, int targetHp)\\\` above main
2. Define \\\`void renderGrid(int playerX, int playerY, int enemyX, int enemyY, int enemyHP)\\\` — only place \\\`E\\\` when enemyHP > 0
3. Player at (5, 5), damage=10. Enemy at (6, 5), HP=30.
4. Round 1: attack → HP=20. Render grid. Print \\\`HUD|HP:20|GOLD:0\\\`
5. Round 2: attack → HP=10. Render grid. Print \\\`HUD|HP:20|GOLD:0\\\`
6. Round 3: attack → HP=0. Enemy defeated. Render grid (E gone). Print \\\`GAME_MESSAGE|Victory!\\\` and \\\`SCORE|100\\\`

## Common Mistake

Forgetting to clamp HP at zero. Without the clamp, three attacks of 10 damage on a 30 HP enemy works perfectly. But if the enemy had 25 HP, the third attack would produce -5. The defeat check \\\`if (enemyHP == 0)\\\` never triggers. The enemy survives at -5 HP. The clamping is mandatory. Negative HP is not a game state. It is a bug.

## Elite Insight

Zelda: A Link to the Past stores every enemy's HP in a single byte (0-255). The sword damage function subtracts and clamps. The death check is \\\`if (hp == 0)\\\`. That is the entire combat system for every enemy in the game — 42 enemy types, same function. Your \\\`attack\\\` function is mechanically identical to what shipped in 1991.

## Pattern Recognition

The renderGrid function uses the same data-driven principle as the combat function. It reads entity state (positions, HP) and produces output. It does not own the data. It reads it. Combat functions read entity data and return new data. Both functions are pure transformations: input state → output. This pattern — read data, transform, output result — is the core of functional programming and appears in every well-structured game codebase.

## Skill Reinforcement

Lessons 1-5 gave you output, variables, grid rendering, bounds validation, and multiple entities. Lesson 6 adds functions. Functions are the mechanism that prevents code duplication as the system grows. Every concept from lessons 1-5 can be extracted into a function: \\\`bool isValidPosition(int x, int y)\\\`, \\\`void renderGrid(...)\\\`, \\\`int attack(int damage, int hp)\\\`. Functions turn concepts into reusable tools.

## Mastery Check

Why does \\\`attack\\\` return the new HP rather than taking a pointer to HP and modifying it directly? Because functions that return values are testable, composable, and have no hidden effects. You can write \\\`if (attack(10, 5) == 0)\\\` without storing an intermediate. You can chain: \\\`hp = attack(fireBonus, attack(10, hp))\\\`. Functions that modify memory through pointers require you to track what changed and when. Return values make the data flow explicit.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

// Define int attack(int damage, int targetHp)
// Returns targetHp - damage, clamped to minimum 0

// Define void renderGrid(int playerX, int playerY, int enemyX, int enemyY, int enemyHP)
// Render 20x10 grid. Only place 'E' when enemyHP > 0.

int main() {
    int playerX = 5;
    int playerY = 5;
    int playerHP = 20;
    int playerGold = 0;
    int playerDamage = 10;

    int enemyX = 6;
    int enemyY = 5;
    int enemyHP = 30;

    int score = 0;

    // Round 1: attack, renderGrid, print HUD

    // Round 2: attack, renderGrid, print HUD

    // Round 3: attack, renderGrid, print HUD
    // If enemyHP == 0: print GAME_MESSAGE|Victory! and SCORE|100

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int attack(int damage, int targetHp) {
    int newHp = targetHp - damage;
    if (newHp < 0) newHp = 0;
    return newHp;
}

void renderGrid(int playerX, int playerY, int enemyX, int enemyY, int enemyHP) {
    for (int row = 0; row < 10; row++) {
        string line = "";
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                line += '#';
            } else if (enemyHP > 0 && row == enemyY && col == enemyX) {
                line += 'E';
            } else if (row == playerY && col == playerX) {
                line += '@';
            } else {
                line += '.';
            }
        }
        cout << line << endl;
    }
}

int main() {
    int playerX = 5;
    int playerY = 5;
    int playerHP = 20;
    int playerGold = 0;
    int playerDamage = 10;

    int enemyX = 6;
    int enemyY = 5;
    int enemyHP = 30;

    int score = 0;

    // Round 1
    enemyHP = attack(playerDamage, enemyHP);
    renderGrid(playerX, playerY, enemyX, enemyY, enemyHP);
    cout << "HUD|HP:" << playerHP << "|GOLD:" << playerGold << endl;

    // Round 2
    enemyHP = attack(playerDamage, enemyHP);
    renderGrid(playerX, playerY, enemyX, enemyY, enemyHP);
    cout << "HUD|HP:" << playerHP << "|GOLD:" << playerGold << endl;

    // Round 3
    enemyHP = attack(playerDamage, enemyHP);
    renderGrid(playerX, playerY, enemyX, enemyY, enemyHP);
    cout << "HUD|HP:" << playerHP << "|GOLD:" << playerGold << endl;

    if (enemyHP == 0) {
        score = 100;
        cout << "GAME_MESSAGE|Victory!" << endl;
        cout << "SCORE|" << score << endl;
    }

    return 0;
}
`,
  tests: [
    {
      id: "g1",
      description: "Grid should show E at enemy position during combat",
      expectedOutput: "E",
      isPattern: true,
    },
    {
      id: "g2",
      description: "HUD should appear after each combat round",
      expectedOutput: "HUD\\|HP:20\\|GOLD:0",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Victory message should print after enemy defeat",
      expectedOutput: "GAME_MESSAGE\\|Victory!",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Score should be 100 after victory",
      expectedOutput: "SCORE\\|100",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Player @ should be visible throughout combat",
      expectedOutput: "@",
      isPattern: true,
    },
  ],
  hints: [
    "Write the `attack` function above main: returns `targetHp - damage` clamped to 0 with `if (newHp < 0) newHp = 0;`",
    "Write `renderGrid` above main: only place 'E' when `enemyHP > 0`. When HP is 0, that cell renders as '.'.",
    "Each round: `enemyHP = attack(playerDamage, enemyHP);` then `renderGrid(...)` then print the HUD.",
    "After the third round, check `if (enemyHP == 0)` and print the victory message and score.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

int attack(int damage, int targetHp) {
    int newHp = targetHp - damage;
    if (newHp < 0) newHp = 0;
    return newHp;
}

void renderGrid(int playerX, int playerY, int enemyX, int enemyY, int enemyHP) {
    for (int row = 0; row < 10; row++) {
        string line = "";
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                line += '#';
            } else if (enemyHP > 0 && row == enemyY && col == enemyX) {
                line += 'E';
            } else if (row == playerY && col == playerX) {
                line += '@';
            } else {
                line += '.';
            }
        }
        cout << line << endl;
    }
}

int main() {
    int playerX = 5;
    int playerY = 5;
    int playerHP = 20;
    int playerGold = 0;
    int playerDamage = 10;

    int enemyX = 6;
    int enemyY = 5;
    int enemyHP = 30;

    int score = 0;

    // Round 1
    enemyHP = attack(playerDamage, enemyHP);
    renderGrid(playerX, playerY, enemyX, enemyY, enemyHP);
    cout << "HUD|HP:" << playerHP << "|GOLD:" << playerGold << endl;

    // Round 2
    enemyHP = attack(playerDamage, enemyHP);
    renderGrid(playerX, playerY, enemyX, enemyY, enemyHP);
    cout << "HUD|HP:" << playerHP << "|GOLD:" << playerGold << endl;

    // Round 3
    enemyHP = attack(playerDamage, enemyHP);
    renderGrid(playerX, playerY, enemyX, enemyY, enemyHP);
    cout << "HUD|HP:" << playerHP << "|GOLD:" << playerGold << endl;

    if (enemyHP == 0) {
        score = 100;
        cout << "GAME_MESSAGE|Victory!" << endl;
        cout << "SCORE|" << score << endl;
    }

    return 0;
}
`,
};
