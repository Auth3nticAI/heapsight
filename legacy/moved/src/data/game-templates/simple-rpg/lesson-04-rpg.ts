import type { GameLessonVariant } from "@/types/game";

export const lesson04RPG: GameLessonVariant = {
  lessonId: "rpg-04-bounds",
  instructions: `# Bounds Check — The Player Walks Into the Void

Rules create reality. Without bounds, the player walks into the void. There is nothing stopping them. The grid is just data. Data does not enforce itself. You enforce it. One \\\`if\\\` statement per direction. That is all a wall is: a conditional.

## Mental Model

The grid is 20 columns wide, 10 rows tall. Column 0 and column 19 are wall columns. Row 0 and row 9 are wall rows. The player lives at positions where x is 1 through 18 and y is 1 through 8. Every time the player tries to move, you compute where they would land. You check that position against the wall boundaries. If it fails the check, you reject the move. The player stays where they are. The wall did its job.

## What Breaks Without This

Without bounds checking, the player moves to x=0 and you write \\\`@\\\` into the wall column. The visual breaks — the border is corrupted. But more than that, your position variables now hold values that have no meaning in the game world. If the player reaches x=-1, you are indexing an array that does not exist. Some compilers let this happen silently. The program reads garbage memory and uses it as game state. The dungeon does not just look wrong. It behaves wrong in ways that are almost impossible to debug.

## The Fix

Compute the candidate position before applying it. Check if it violates the boundary. If it does, reject the move and leave the position unchanged. If it does not, apply it. The order matters: check first, mutate second. Never the other way around.

\\\`\\\`\\\`cpp
int newX = playerX + dx;
if (newX <= 0 || newX >= 19) {
    // Rejected. Position unchanged.
} else {
    playerX = newX;  // Accepted.
}
\\\`\\\`\\\`

This is validate-before-mutate. It appears in every system where data integrity matters. SQL transactions use it. File systems use it. Network protocols use it. Game movement uses it.

## Pattern Insight

There is a pattern here. Every action in a game is a proposed state change that must pass validation before it is applied. The player proposes moving left. The game checks if left is a legal destination. If yes, the proposal becomes reality. If no, it is discarded. This is the Command pattern in embryonic form: an intention that may or may not be executed depending on context.

## Scalability Insight

Right now you check hardcoded boundaries: x <= 0, x >= 19. In a real dungeon game, the level is loaded from a file as a 2D array of tile types. The check becomes \\\`grid[newY][newX] == WALL_TILE\\\`. The structure is identical. The data source changes. Skyrim checks \\\`navmesh.isWalkable(x, y, z)\\\`. Same pattern. More dimensions. More data. Same shape.

## Your Task

1. Start at playerX=1, playerY=1
2. Attempt four moves in order: left, right, up, down
3. Left (dx=-1): newX=0, wall — print \\\`Move left: BLOCKED\\\`
4. Right (dx=+1): newX=2, interior — apply, print \\\`Move right: OK\\\`
5. Up (dy=-1): newY=0, wall — print \\\`Move up: BLOCKED\\\`
6. Down (dy=+1): newY=2, interior — apply, print \\\`Move down: OK\\\`
7. Render the 20x10 grid with \\\`@\\\` at (2, 2)
8. Print \\\`HUD|HP:20|GOLD:0\\\`
9. Print \\\`GAME_MESSAGE|Walls are solid.\\\`

## Common Mistake

Using \\\`x < 0\\\` instead of \\\`x <= 0\\\`. Column 0 is a wall. A player at x=0 is in the wall. The check must use \\\`<=\\\` on the lower bound and \\\`>=\\\` on the upper bound. Off-by-one in boundary conditions is the most common mistake in grid games.

## Elite Insight

The Legend of Zelda uses bounds checks for room transitions. When Link's x position reaches 255 (the right edge of a room), the engine loads the adjacent room and resets Link to x=0. The bounds check is not just collision — it is a world transition trigger. Every dungeon game from Rogue to Elden Ring builds on this exact mechanism.

## Pattern Recognition

Chess validates piece moves against board bounds before checking piece-specific rules. Sokoban checks wall collision before checking whether a box can be pushed. Roguelikes check passability before rolling for traps. The shape is always the same: is this destination legal, and if so, apply the move.

## Skill Reinforcement

You have variables from lesson 2. You have grid rendering from lesson 3. Now you are adding the validation layer. Variables hold the state. The conditional decides whether the state changes. The grid render shows the result. Three layers composing into a working system.

## Mastery Check

Why do we validate before mutating rather than mutating and then checking? Because once you write \\\`playerX = 0\\\`, the invalid state exists in memory. To recover you must remember the old value and restore it. Validate-before-mutate means the variable is only ever in a state the game considers valid. The old value is never overwritten unless the new value is confirmed good.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int playerX = 1;
    int playerY = 1;
    int playerHP = 20;
    int playerGold = 0;

    // Attempt 4 moves with bounds checking
    // Left (dx=-1): BLOCKED if newX <= 0
    // Right (dx=+1): OK (newX=2 is interior)
    // Up (dy=-1): BLOCKED if newY <= 0
    // Down (dy=+1): OK (newY=2 is interior)

    // Render 20x10 grid: '#' for walls, '.' for floor, '@' for player

    // HUD|HP:20|GOLD:0

    // GAME_MESSAGE|Walls are solid.

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int playerX = 1;
    int playerY = 1;
    int playerHP = 20;
    int playerGold = 0;

    // Move left: BLOCKED
    int newX = playerX - 1;
    if (newX <= 0) {
        cout << "Move left: BLOCKED" << endl;
    } else {
        playerX = newX;
        cout << "Move left: OK" << endl;
    }

    // Move right: OK
    newX = playerX + 1;
    if (newX >= 19) {
        cout << "Move right: BLOCKED" << endl;
    } else {
        playerX = newX;
        cout << "Move right: OK" << endl;
    }

    // Move up: BLOCKED
    int newY = playerY - 1;
    if (newY <= 0) {
        cout << "Move up: BLOCKED" << endl;
    } else {
        playerY = newY;
        cout << "Move up: OK" << endl;
    }

    // Move down: OK
    newY = playerY + 1;
    if (newY >= 9) {
        cout << "Move down: BLOCKED" << endl;
    } else {
        playerY = newY;
        cout << "Move down: OK" << endl;
    }

    // Render 20x10 grid
    for (int row = 0; row < 10; row++) {
        string line = "";
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                line += '#';
            } else if (row == playerY && col == playerX) {
                line += '@';
            } else {
                line += '.';
            }
        }
        cout << line << endl;
    }

    cout << "HUD|HP:" << playerHP << "|GOLD:" << playerGold << endl;
    cout << "GAME_MESSAGE|Walls are solid." << endl;

    return 0;
}
`,
  tests: [
    {
      id: "g1",
      description: "Left move should be blocked at wall boundary",
      expectedOutput: "Move left: BLOCKED",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Right move should succeed into interior",
      expectedOutput: "Move right: OK",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Up move should be blocked at wall boundary",
      expectedOutput: "Move up: BLOCKED",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Player @ should appear at position (2,2) in the grid",
      expectedOutput: "##\\.@",
      isPattern: true,
    },
  ],
  hints: [
    "Compute `newX = playerX + dx` before the `if` check. Only update `playerX = newX` inside the `else` branch.",
    "Wall boundaries: left wall is x <= 0, right wall is x >= 19, top wall is y <= 0, bottom wall is y >= 9.",
    "Render with a nested for loop: outer over rows 0-9, inner over cols 0-19. Build a string per row and print it.",
    "The player ends at (2,2) after the two successful moves. Check `row == playerY && col == playerX` to place '@'.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int playerX = 1;
    int playerY = 1;
    int playerHP = 20;
    int playerGold = 0;

    // Move left: BLOCKED
    int newX = playerX - 1;
    if (newX <= 0) {
        cout << "Move left: BLOCKED" << endl;
    } else {
        playerX = newX;
        cout << "Move left: OK" << endl;
    }

    // Move right: OK
    newX = playerX + 1;
    if (newX >= 19) {
        cout << "Move right: BLOCKED" << endl;
    } else {
        playerX = newX;
        cout << "Move right: OK" << endl;
    }

    // Move up: BLOCKED
    int newY = playerY - 1;
    if (newY <= 0) {
        cout << "Move up: BLOCKED" << endl;
    } else {
        playerY = newY;
        cout << "Move up: OK" << endl;
    }

    // Move down: OK
    newY = playerY + 1;
    if (newY >= 9) {
        cout << "Move down: BLOCKED" << endl;
    } else {
        playerY = newY;
        cout << "Move down: OK" << endl;
    }

    // Render 20x10 grid
    for (int row = 0; row < 10; row++) {
        string line = "";
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                line += '#';
            } else if (row == playerY && col == playerX) {
                line += '@';
            } else {
                line += '.';
            }
        }
        cout << line << endl;
    }

    cout << "HUD|HP:" << playerHP << "|GOLD:" << playerGold << endl;
    cout << "GAME_MESSAGE|Walls are solid." << endl;

    return 0;
}
`,
};
