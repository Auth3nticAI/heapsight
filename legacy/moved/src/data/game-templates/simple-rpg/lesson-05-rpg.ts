import type { GameLessonVariant } from "@/types/game";

export const lesson05RPG: GameLessonVariant = {
  lessonId: "rpg-05-enemy",
  instructions: `# Basic Enemy — Same Pattern, Different Character

Player has position. Enemy has position. Same pattern. Different character. That is all an enemy is. Two integers and a symbol. The renderer does not distinguish. It reads coordinates. It places glyphs. The dungeon populates itself from data.

## Mental Model

The player entity: \\\`playerX\\\`, \\\`playerY\\\`, symbol \\\`@\\\`. The enemy entity: \\\`enemyX\\\`, \\\`enemyY\\\`, \\\`enemyHP\\\`, symbol \\\`E\\\`. The grid renderer loops over all cells. For each cell, it checks every entity's position. If a cell matches an entity position, it draws that entity's symbol. Otherwise it draws floor or wall. The render loop does not know about player or enemy. It knows about positions and characters.

## What Breaks Without This

A dungeon with no antagonist is a maze. Mazes are solved once and forgotten. An enemy gives the space stakes. The player must navigate around it, approach it, or engage it. The spatial relationship between the two entities is where gameplay lives. Without an enemy, there is no relationship. Without a relationship, there is no tension. Without tension, there is no game.

## The Fix

Add three variables for the enemy: \\\`enemyX\\\`, \\\`enemyY\\\`, \\\`enemyHP\\\`. Extend the grid render loop with an additional branch that places \\\`E\\\` when the current cell matches the enemy position. Keep the player check as well. Both entities coexist in the same grid. The render loop handles them both in a single pass.

\\\`\\\`\\\`cpp
} else if (row == enemyY && col == enemyX) {
    line += 'E';
} else if (row == playerY && col == playerX) {
    line += '@';
} else {
    line += '.';
}
\\\`\\\`\\\`

## Pattern Insight

There is a pattern here. Every entity in the game world is a bundle of position data plus identity data. The player bundle: position, HP, gold. The enemy bundle: position, HP. A chest would be: position, gold value. A trap would be: position, damage value. They all share the position component. They differ in what else they carry. This is the beginning of the Entity-Component pattern used in modern game engines. Unity's GameObjects. Unreal's Actors. Same idea at industrial scale.

## Scalability Insight

Two entities: two manual checks in the render loop. Ten enemies: you need a loop. A hundred enemies: you definitely need a data structure. When you get there, you will have an array of enemy structs. The render loop will iterate the array and check each enemy's position. But the logic inside each check is identical to what you are writing now. The single-enemy version is the correct starting point. Generalize when the repetition demands it.

## Your Task

1. Player at (3, 3), HP=20, Gold=0
2. Enemy at (15, 5), HP=30
3. Render the 20x10 grid with \\\`@\\\` at player position and \\\`E\\\` at enemy position
4. Print \\\`HUD|HP:20|GOLD:0\\\`
5. Print \\\`GAME_MESSAGE|An enemy lurks nearby...\\\`

The grid: row 0 and row 9 are all \\\`#\\\`. Rows 1-8 have \\\`#\\\` at columns 0 and 19, \\\`.\\\` elsewhere. Place entity symbols at their respective positions.

## Common Mistake

Forgetting that the enemy check must come before the player check in the if-else chain. With two entities at different positions it does not matter today. But if you put the player check first and then later have a scenario where they share a cell, the enemy becomes invisible. Establish the priority order now: enemy check first, player check second, floor last.

## Elite Insight

Nethack renders every monster as a letter. \\\`k\\\` is kobold. \\\`g\\\` is goblin. \\\`D\\\` is dragon. The player is always \\\`@\\\`. The render loop scans the map grid. For each occupied cell, it looks up the entity in a list and finds its display character. Your \\\`E\\\` is exactly Nethack's monster rendering at its conceptual core. Thirty-five years of the most complex roguelike ever made, reduced to: position plus character.

## Pattern Recognition

The HUD output is also data-driven. \\\`HUD|HP:20|GOLD:0\\\` reads directly from \\\`playerHP\\\` and \\\`playerGold\\\`. When those variables change (after combat, after picking up gold), the HUD changes automatically. The display is always a snapshot of the current state. You never update the HUD manually. You update the data. The display follows.

## Skill Reinforcement

You have: grid rendering (lesson 3), bounds checking (lesson 4), and now multiple entities (lesson 5). Three capabilities. One program. The skills compose. Each lesson's concept becomes a reusable tool for the next. The pattern of skills mirrors the pattern of entities — same structure, accumulated capability.

## Mastery Check

Why does the enemy need HP at this stage when it does not take damage yet? Because data should be declared with all its relevant state, even before all behavior is implemented. The HP variable is a placeholder for the combat system arriving in lesson 6. Declaring it now means the data structure is already correct. Adding behavior to correct data is easy. Retrofitting correct data onto incorrect structure is painful.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Player
    int playerX = 3;
    int playerY = 3;
    int playerHP = 20;
    int playerGold = 0;

    // Enemy
    int enemyX = 15;
    int enemyY = 5;
    int enemyHP = 30;

    // Render 20x10 grid with '@' at player and 'E' at enemy

    // HUD|HP:20|GOLD:0

    // GAME_MESSAGE|An enemy lurks nearby...

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Player
    int playerX = 3;
    int playerY = 3;
    int playerHP = 20;
    int playerGold = 0;

    // Enemy
    int enemyX = 15;
    int enemyY = 5;
    int enemyHP = 30;

    // Render 20x10 grid
    for (int row = 0; row < 10; row++) {
        string line = "";
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                line += '#';
            } else if (row == enemyY && col == enemyX) {
                line += 'E';
            } else if (row == playerY && col == playerX) {
                line += '@';
            } else {
                line += '.';
            }
        }
        cout << line << endl;
    }

    cout << "HUD|HP:" << playerHP << "|GOLD:" << playerGold << endl;
    cout << "GAME_MESSAGE|An enemy lurks nearby..." << endl;

    return 0;
}
`,
  tests: [
    {
      id: "g1",
      description: "Grid should render player symbol @",
      expectedOutput: "@",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Grid should render enemy symbol E",
      expectedOutput: "E",
      isPattern: true,
    },
    {
      id: "g3",
      description: "HUD should display player HP and gold",
      expectedOutput: "HUD\\|HP:20\\|GOLD:0",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Game message should announce lurking enemy",
      expectedOutput: "GAME_MESSAGE\\|An enemy lurks nearby\\.\\.\\.",
      isPattern: true,
    },
  ],
  hints: [
    "Declare enemy variables: `int enemyX = 15; int enemyY = 5; int enemyHP = 30;`",
    "Add `else if (row == enemyY && col == enemyX) { line += 'E'; }` before the player check in the render loop.",
    "After the grid, print the HUD: `cout << \"HUD|HP:\" << playerHP << \"|GOLD:\" << playerGold << endl;`",
    "End with: `cout << \"GAME_MESSAGE|An enemy lurks nearby...\" << endl;`",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Player
    int playerX = 3;
    int playerY = 3;
    int playerHP = 20;
    int playerGold = 0;

    // Enemy
    int enemyX = 15;
    int enemyY = 5;
    int enemyHP = 30;

    // Render 20x10 grid
    for (int row = 0; row < 10; row++) {
        string line = "";
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                line += '#';
            } else if (row == enemyY && col == enemyX) {
                line += 'E';
            } else if (row == playerY && col == playerX) {
                line += '@';
            } else {
                line += '.';
            }
        }
        cout << line << endl;
    }

    cout << "HUD|HP:" << playerHP << "|GOLD:" << playerGold << endl;
    cout << "GAME_MESSAGE|An enemy lurks nearby..." << endl;

    return 0;
}
`,
};
