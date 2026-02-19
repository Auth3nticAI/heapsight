import type { GameLessonVariant } from "@/types/game";

export const lesson03RPG: GameLessonVariant = {
  lessonId: "rpg-03-movement",

  instructions: `# RPG: Movement Math

## Mental Model

Movement is arithmetic. Right is +1 to X. Down is +1 to Y. Left is -1 to X. Up is -1 to Y. That is the complete movement system. Two integers. Four arithmetic operations. Unlimited directions.

A game tick is: input -> state change -> render. You are simulating 3 ticks manually. Tick 1: right. Tick 2: right. Tick 3: down. After each tick you print the new state. After all ticks you render the final grid.

Position IS state. When state changes, the world changes. That is what makes games dynamic.

## What Breaks Without This

Without state mutation, the hero is frozen. You can spawn a hero. You can display a hero. But without \\\`playerX += 1\\\`, the hero never moves. The dungeon is a painting, not a game. Movement is the transition from static output to interactive simulation.

## The Fix

Apply deltas to the position variables:
\\\`\\\`\\\`cpp
playerX += 1; // move right
playerX += 1; // move right again
playerY += 1; // move down
\\\`\\\`\\\`

After each change, print the grid showing the new \\\`@\\\` position. The hero walks. The dungeon responds.

## Pattern Insight

State + delta = new state. \\\`playerX = 10 + 1 = 11\\\`. The player is now at column 11. The grid renders them at column 11. The render is a pure function of state: given the state, produce output. No memory. No side effects. State in, pixels out.

This is the core of every game update loop. Unity calls it \\\`Update()\\\`. Unreal calls it \\\`Tick()\\\`. You call it three consecutive \\\`cout\\\` blocks. The pattern is identical.

## Scalability Insight

You are printing 4 full grids manually. This is tedious. Soon you will write a \\\`printGrid(playerX, playerY)\\\` function and call it once after each move. The output will be identical. The code will be four lines instead of forty. Functions make repetitive patterns expressible. The pattern does not change. The code does.

## Your Task

Simulate 3 moves from (10, 5) to (12, 6):
1. Print initial grid with \\\`@\\\` at (10, 5), \\\`GAME_MESSAGE|Hero stands ready.\\\`
2. Move right, print grid with \\\`@\\\` at (11, 5), \\\`GAME_MESSAGE|Step 1: moved right.\\\`
3. Move right, print grid with \\\`@\\\` at (12, 5), \\\`GAME_MESSAGE|Step 2: moved right.\\\`
4. Move down, print final grid with \\\`@\\\` at (12, 6), then \\\`HUD|HP:100|GOLD:0\\\`, \\\`SCORE|0\\\`, \\\`GAME_MESSAGE|3 moves completed.\\\`

## Common Mistake (Beginner Trap)

When the player moves from row 5 to row 6, row 5 must go back to being a normal floor row \\\`#..................#\\\`. Beginners forget this and leave \\\`@\\\` in the old row. The grid is redrawn every frame from scratch. The previous frame's \\\`@\\\` does not persist. Each frame is a complete fresh render of the current state.

## Elite Insight (reference real RPGs)

Diablo's movement system updates position each tick and re-renders the visible dungeon area every frame. The dungeon tiles do not store the player position -- that is in the player entity. The renderer combines the dungeon data with the entity data to produce the final frame. You are doing exactly this: the grid rows are dungeon data, the \\\`playerX/playerY\\\` variables are entity data, and your \\\`cout\\\` statements are the renderer. Same architecture. Different scale.

## Pattern Recognition

You are implementing the game loop: input, update, render. Three iterations. Three frames. The fact that the input is hardcoded (\\\`playerX += 1\\\` instead of reading a keypress) does not change the pattern. Simulation is simulation whether the input is live or scripted. Game replays work this way: scripted input, live simulation.

## Skill Reinforcement

- \\\`+= 1\\\` increments a variable by 1 and stores the result back in the variable
- Position is data -- when data changes, the rendered output must reflect the new data
- Each frame is a complete, fresh render -- do not assume anything carries over from the previous frame

## Mastery Check

After your 3-move simulation, the player is at (12, 6). If you added a 4th move going up (\\\`playerY -= 1\\\`), what would the final grid look like? The player would be at (12, 5). Row 6 would go back to \\\`#..................#\\\` and row 5 would show \\\`@\\\` at column 12: \\\`#...........@......#\\\`. Subtraction undoes addition.`,

  starterCode: `#include <iostream>
using namespace std;

int main() {
    // Starting position
    int playerX = 10;
    int playerY = 5;

    // Frame 1: Initial grid with @ at (10, 5)
    // Hint: row 5 = "#.........@........#"
    // Then: GAME_MESSAGE|Hero stands ready.

    // Move 1: playerX += 1  (move right)
    // Frame 2: Grid with @ at (11, 5)
    // Row 5 = "#..........@.......#"
    // Then: GAME_MESSAGE|Step 1: moved right.

    // Move 2: playerX += 1  (move right)
    // Frame 3: Grid with @ at (12, 5)
    // Row 5 = "#...........@......#"
    // Then: GAME_MESSAGE|Step 2: moved right.

    // Move 3: playerY += 1  (move down)
    // Frame 4: Final grid with @ at (12, 6)
    // Row 5 back to normal, Row 6 = "#...........@......#"
    // Then: HUD|HP:100|GOLD:0
    // Then: SCORE|0
    // Then: GAME_MESSAGE|3 moves completed.

    return 0;
}`,

  solutionCode: `#include <iostream>
using namespace std;

int main() {
    // Starting position
    int playerX = 10;
    int playerY = 5;

    // Frame 1: @ at (10, 5)
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
    cout << "GAME_MESSAGE|Hero stands ready." << endl;

    // Move 1: right
    playerX += 1;

    // Frame 2: @ at (11, 5)
    cout << "####################" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..........@.......#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "####################" << endl;
    cout << "GAME_MESSAGE|Step 1: moved right." << endl;

    // Move 2: right
    playerX += 1;

    // Frame 3: @ at (12, 5)
    cout << "####################" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#...........@......#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "####################" << endl;
    cout << "GAME_MESSAGE|Step 2: moved right." << endl;

    // Move 3: down
    playerY += 1;

    // Frame 4: @ at (12, 6)
    cout << "####################" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#...........@......#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "####################" << endl;
    cout << "HUD|HP:100|GOLD:0" << endl;
    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|3 moves completed." << endl;

    return 0;
}`,

  tests: [
    {
      id: "g1",
      description: "Initial frame shows @ at column 10, row 5",
      expectedOutput: "#\\.{9}@\\.{8}#",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Final frame shows @ at column 12, row 6",
      expectedOutput: "#\\.{11}@\\.{6}#",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Outputs HUD after all moves complete",
      expectedOutput: "HUD\\|HP:100\\|GOLD:0",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Outputs the 3 moves completed message",
      expectedOutput: "GAME_MESSAGE\\|3 moves completed\\.",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Outputs score of 0",
      expectedOutput: "SCORE\\|0",
      isPattern: true,
    },
  ],

  hints: [
    "Print the full 10-row grid before and after each move. That is 4 complete grid renders.",
    'Frame 1 row 5 (@ at col 10): `"#.........@........#"` -- 9 dots before @.',
    'Frame 2 row 5 (@ at col 11): `"#..........@.......#"` -- 10 dots before @.',
    'Frame 3 row 5 (@ at col 12): `"#...........@......#"` -- 11 dots before @.',
    "Frame 4: player moved DOWN -- row 5 is back to normal `#..................#`, row 6 gets the @ at col 12.",
    'Frame 4 row 6 (@ at col 12): `"#...........@......#"` -- 11 dots before @.',
    "After frame 4: print HUD, SCORE, then the completion GAME_MESSAGE.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    // Starting position
    int playerX = 10;
    int playerY = 5;

    // Frame 1: @ at (10, 5)
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
    cout << "GAME_MESSAGE|Hero stands ready." << endl;

    // Move 1: right
    playerX += 1;

    // Frame 2: @ at (11, 5)
    cout << "####################" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..........@.......#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "####################" << endl;
    cout << "GAME_MESSAGE|Step 1: moved right." << endl;

    // Move 2: right
    playerX += 1;

    // Frame 3: @ at (12, 5)
    cout << "####################" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#...........@......#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "####################" << endl;
    cout << "GAME_MESSAGE|Step 2: moved right." << endl;

    // Move 3: down
    playerY += 1;

    // Frame 4: @ at (12, 6)
    cout << "####################" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#...........@......#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "####################" << endl;
    cout << "HUD|HP:100|GOLD:0" << endl;
    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|3 moves completed." << endl;

    return 0;
}`,
};
