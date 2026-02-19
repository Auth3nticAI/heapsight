import type { GameLessonVariant } from "@/types/game";

export const lesson02RPG: GameLessonVariant = {
  lessonId: "rpg-02-player-spawn",

  instructions: `# RPG: Player Spawn

## Mental Model

Two ints. That is all a hero needs to exist in a dungeon. \\\`playerX\\\` is the column. \\\`playerY\\\` is the row. The grid is 20 columns wide and 10 rows tall. The hero lives at one intersection. Two numbers. One hero.

The grid is data. The player is data. The renderer reads both. When the renderer reaches row \\\`playerY\\\`, at column \\\`playerX\\\`, it places \\\`@\\\`. Everywhere else it places the tile character. That is all entity rendering is.

## What Breaks Without This

Without position variables, the player is not data. They are a magic string buried in one hardcoded row. You cannot move them. You cannot check if they hit a wall. You cannot compare their position to an enemy position. Data is the prerequisite for logic. Variables make data manipulable.

## The Fix

Declare the position:
\\\`\\\`\\\`cpp
int playerX = 10;
int playerY = 5;
\\\`\\\`\\\`

Then build row 5 with \\\`@\\\` at column 10. Print the position with the variables so the output reflects the data:
\\\`\\\`\\\`cpp
cout << "Player at (" << playerX << ", " << playerY << ")" << endl;
\\\`\\\`\\\`

## Pattern Insight

This is separation of data from display. The position is stored in variables. The display reads the variables. Change \\\`playerX = 10\\\` to \\\`playerX = 5\\\` and the player appears in a different column. The display code does not change. The data changes. The display responds. That is data-driven rendering.

## Scalability Insight

Today you hardcode row 5 with \\\`@\\\` baked in. In lesson 3, you will compute the player row dynamically using \\\`playerX\\\` and \\\`playerY\\\`. The output will be identical. But the code will work for any position, not just (10, 5). Variables make the code general. General code is reusable code.

## Your Task

Print the dungeon grid with the player at (10, 5), then the HUD:
- Full 20x10 grid with \\\`@\\\` at row 5, column 10
- \\\`GAME_MESSAGE|Hero enters the dungeon.\\\`
- \\\`HUD|HP:100|GOLD:0\\\`
- \\\`SCORE|0\\\`

## Common Mistake (Beginner Trap)

Confusing X and Y. In grids, X is the column (left-right) and Y is the row (up-down). \\\`playerX = 10\\\` means column 10. \\\`playerY = 5\\\` means row 5. Row 5 is the 6th row from the top (0-indexed). Column 10 is the 11th character from the left. Count from zero.

## Elite Insight (reference real RPGs)

Zelda: A Link to the Past stores Link's position as a 16-bit integer for sub-tile precision. The renderer converts it to tile coordinates for the tilemap lookup, then to pixel coordinates for the sprite blit. Three coordinate systems. One entity. Your two ints are the simplest form of the same chain. When you add sub-tile movement later, you will add more precision. The pattern scales.

## Pattern Recognition

Variable = named storage. Position = two named integers. Rendering = reading named storage and placing characters. This pattern exists in every game engine. Unity calls it \\\`Transform.position\\\`. Unreal calls it \\\`FVector Location\\\`. You call it \\\`playerX, playerY\\\`. Different names. Same concept.

## Skill Reinforcement

- Variables store values that your program can reference and change
- \\\`int x = 10;\\\` creates an integer variable named \\\`x\\\` with value \\\`10\\\`
- \\\`cout << x << endl;\\\` prints the value stored in \\\`x\\\`, not the letter x

## Mastery Check

If you added a second player at (5, 3), what new variables would you declare? \\\`int player2X = 5;\\\` and \\\`int player2Y = 3;\\\`. Which row would change in the grid? Row 3 would need \\\`@\\\` at column 5. Two entities = two positions = two changed rows.`,

  starterCode: `#include <iostream>
using namespace std;

int main() {
    // Declare player position
    int playerX = 10;
    int playerY = 5;

    // Print the 20x10 dungeon grid
    // Place @ at row 5, column 10
    // Remember: row 5 = "#.........@........#"

    // GAME_MESSAGE|Hero enters the dungeon.

    // HUD|HP:100|GOLD:0

    // SCORE|0

    return 0;
}`,

  solutionCode: `#include <iostream>
using namespace std;

int main() {
    // Player position
    int playerX = 10;
    int playerY = 5;

    // Dungeon grid with player at (10, 5)
    cout << "####################" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#.........@........#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "####################" << endl;
    // Protocol lines
    cout << "GAME_MESSAGE|Hero enters the dungeon." << endl;
    cout << "HUD|HP:100|GOLD:0" << endl;
    cout << "SCORE|0" << endl;

    return 0;
}`,

  tests: [
    {
      id: "g1",
      description: "Grid contains the @ player character",
      expectedOutput: "@",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Player row places @ at column 10 (9 dots, @, 8 dots)",
      expectedOutput: "#\\.{9}@\\.{8}#",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Outputs hero entrance game message",
      expectedOutput: "GAME_MESSAGE\\|Hero enters the dungeon\\.",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Outputs HUD with HP 100 and GOLD 0",
      expectedOutput: "HUD\\|HP:100\\|GOLD:0",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Outputs starting score",
      expectedOutput: "SCORE\\|0",
      isPattern: true,
    },
  ],

  hints: [
    "Player is at row 5, column 10. Rows are 0-indexed from the top.",
    'Row 5 with player: `cout << "#.........@........#" << endl;` -- 9 dots before @, 8 dots after.',
    "All other interior rows remain `#..................#`.",
    'After the grid: GAME_MESSAGE, then HUD, then SCORE.',
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    // Player position
    int playerX = 10;
    int playerY = 5;

    // Dungeon grid with player at (10, 5)
    cout << "####################" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#.........@........#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "####################" << endl;
    // Protocol lines
    cout << "GAME_MESSAGE|Hero enters the dungeon." << endl;
    cout << "HUD|HP:100|GOLD:0" << endl;
    cout << "SCORE|0" << endl;

    return 0;
}`,
};
