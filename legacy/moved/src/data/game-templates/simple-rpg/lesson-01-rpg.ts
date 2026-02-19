import type { GameLessonVariant } from "@/types/game";

export const lesson01RPG: GameLessonVariant = {
  lessonId: "rpg-01-boot-system",

  instructions: `# RPG: Boot the System

## Mental Model

The dungeon is a grid. The grid is characters. Characters are data. You print data. The renderer reads it. That is the entire rendering pipeline. No GPU. No vertex buffers. No shaders. Just \\\`cout\\\` and a parser. Output IS the game.

20 columns. 10 rows. \\\`#\\\` for walls. \\\`.\\\` for floor. Print each row. The dungeon exists.

## What Breaks Without This

Without the grid output the renderer has nothing to parse. The game preview stays black. No dungeon. No world. No game. The dungeon only exists when you print it. Output = existence.

## The Fix

Print the top wall. Print 8 interior rows. Print the bottom wall. Print the protocol lines. In that order. Every row is exactly 20 characters. The renderer expects exactly that.

## Pattern Insight

This is the tilemap pattern. Every grid-based game uses it. Rogue (1980) printed ASCII dungeons to a terminal. The pattern is identical. Data describes tiles. Renderer reads data. Display appears. The medium changed over 40 years. The pattern did not.

## Scalability Insight

Today you hardcode 10 string literals. Tomorrow you fill a \\\`char grid[10][21]\\\` and loop over it. The output does not change. The renderer does not change. Only the source of the data changes. That is good architecture: stable interface, flexible implementation.

## Your Task

Print the complete dungeon with HUD:
- 10 rows of grid (top wall, 8 interior rows, bottom wall)
- \\\`GAME_MESSAGE|Dungeon awaits...\\\`
- \\\`HUD|HP:100|GOLD:0\\\`
- \\\`SCORE|0\\\`

## Common Mistake (Beginner Trap)

Printing the HUD before the grid. The renderer expects the grid first, protocol lines second. Order is part of the protocol. Swap the order and the renderer misinterprets the data.

## Elite Insight (reference real RPGs)

Diablo's dungeon generator procedurally fills a 2D tile array, then renders it. The renderer loops over the array and draws each tile. You are doing the same thing manually. When you move to loops and arrays in lesson 3, you will close that gap. Zelda: Link's Awakening on Game Boy used an 8x8 tile grid per screen. Same pattern. Different hardware.

## Pattern Recognition

Grid = data. Renderer = reader. Protocol = interface contract. You are implementing the interface contract right now. Every protocol line you print is a message from your game logic to your renderer. This separation -- logic produces data, renderer consumes data -- is the core of every game engine ever built.

## Skill Reinforcement

- \\\`cout << "string" << endl;\\\` is your only tool right now
- String literals are exact -- every character matters
- Protocol lines must match the spec exactly: \\\`HUD|HP:100|GOLD:0\\\` not \\\`HUD|hp:100|gold:0\\\`

## Mastery Check

If you changed the floor character from \\\`.\\\` to \\\`~\\\` to represent water, what would you change in your code? Just the string literals. The renderer would need to know \\\`~\\\` means water, but your job is just to output the right characters. Data drives display.`,

  starterCode: `#include <iostream>
using namespace std;

int main() {
    // Print the 20x10 dungeon grid
    // Top wall: ####################
    // Interior rows: #..................# (8 rows)
    // Bottom wall: ####################

    // GAME_MESSAGE|Dungeon awaits...
    // HUD|HP:100|GOLD:0
    // SCORE|0

    return 0;
}`,

  solutionCode: `#include <iostream>
using namespace std;

int main() {
    // Dungeon grid - 20 columns x 10 rows
    cout << "####################" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "####################" << endl;
    // Protocol lines
    cout << "GAME_MESSAGE|Dungeon awaits..." << endl;
    cout << "HUD|HP:100|GOLD:0" << endl;
    cout << "SCORE|0" << endl;

    return 0;
}`,

  tests: [
    {
      id: "g1",
      description: "Outputs the top wall row (20 # characters)",
      expectedOutput: "####################",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Outputs an interior row with floor tiles",
      expectedOutput: "#\\.{18}#",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Outputs the dungeon awaits game message",
      expectedOutput: "GAME_MESSAGE\\|Dungeon awaits\\.\\.\\.",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Outputs HUD with starting HP and gold",
      expectedOutput: "HUD\\|HP:100\\|GOLD:0",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Outputs starting score of 0",
      expectedOutput: "SCORE\\|0",
      isPattern: true,
    },
  ],

  hints: [
    'Top wall: `cout << "####################" << endl;`',
    'Interior row: `cout << "#..................#" << endl;` -- count 18 dots.',
    "You need 8 interior rows. Copy the interior row cout statement 8 times.",
    'After the grid: `cout << "GAME_MESSAGE|Dungeon awaits..." << endl;`',
    'Then HUD: `cout << "HUD|HP:100|GOLD:0" << endl;` and score: `cout << "SCORE|0" << endl;`',
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    // Dungeon grid - 20 columns x 10 rows
    cout << "####################" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "#..................#" << endl;
    cout << "####################" << endl;
    // Protocol lines
    cout << "GAME_MESSAGE|Dungeon awaits..." << endl;
    cout << "HUD|HP:100|GOLD:0" << endl;
    cout << "SCORE|0" << endl;

    return 0;
}`,
};
