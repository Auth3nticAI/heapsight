import { Lesson } from "@/types/lesson";

export const lessonRPG01: Lesson = {
  id: "rpg-01-boot-dungeon-grid",
  title: "Boot Dungeon Grid",
  description: "Render a 10x10 ASCII dungeon room to stdout. The grid is data; the print loop is the renderer.",
  order: 1,
  xpReward: 50,
  tier: "free",
  concepts: ["cout", "grid as data", "nested loops", "output protocol"],
  part1: {
    title: "Concept: Boot Dungeon Grid",
    type: "concept",
    instructions: `# Boot Dungeon Grid

## Mental Model

A dungeon is a grid. A grid is a 2D array of tiles. Each tile has a value — floor, wall, empty. The renderer is a nested loop: for every row, for every column, print the tile character. The display is a pure function of the grid data. Change the data; the display changes. This is the first principle of data-driven game design.

## What Breaks Without This

Without a grid, dungeon layout is hardcoded strings. Adding a wall means editing a print statement. Moving the player means manually computing which string to update. It does not scale beyond 10 lines of code. With a grid array, the dungeon is data — movable, saveable, loadable, and renderable by a single loop.

## The Fix: 2D Array as Grid

\`\`\`cpp
const int W = 10, H = 10;
char grid[H][W];

// Fill with floor
for (int y = 0; y < H; y++)
    for (int x = 0; x < W; x++)
        grid[y][x] = '.';

// Add border walls
for (int x = 0; x < W; x++) { grid[0][x] = '#'; grid[H-1][x] = '#'; }
for (int y = 0; y < H; y++) { grid[y][0] = '#'; grid[y][W-1] = '#'; }
\`\`\`

## Key Concepts

- **2D array** — \`char grid[H][W]\` stores the dungeon. Row-major: \`grid[y][x]\` is row y, column x.
- **Nested loop** — outer loop over rows (y), inner loop over columns (x). Prints one row per outer iteration.
- **Tile characters** — \`'#'\` for wall, \`'.'\` for floor, \`'@'\` for player.
- **Output protocol** — the game renderer reads stdout line-by-line. \`GRID_ROW|y|row_string\` format feeds the visual renderer.

## Performance Insight

A 10x10 grid is 100 bytes. Even a 256x256 dungeon is 64 KB — trivially fits in L1 cache. Rendering is a sequential memory read: 100 cache-friendly accesses. The bottleneck is cout, not the grid.

## Memory Insight

\`char grid[10][10]\` is 100 bytes on the stack. Stack allocation is free — a single register add at function entry. The array is contiguous in memory, row-major. \`grid[1][0]\` is at address \`grid + 10\` — exactly one row offset.

## Your Task

Initialize a 10x10 dungeon grid with floor tiles (\`'.'\`) and border walls (\`'#'\`). Render it row by row using the GRID_ROW output protocol.

Expected output:
\`\`\`
DUNGEON|rpg-v0
GRID_ROW|0|##########
GRID_ROW|1|#........#
...
GRID_ROW|9|##########
TURN|0
GAME_MESSAGE|Dungeon grid initialized.
\`\`\`

## Beginner Trap

**Row vs column confusion.** \`grid[y][x]\` — first index is the row (y), second is the column (x). Reversing them (\`grid[x][y]\`) transposes the grid — walls appear on the wrong sides.

## Elite Insight

Rogue (1980) stored the dungeon as a 2D char array. Nethack does the same. Dwarf Fortress uses the same principle at vastly larger scale. The 2D grid is the oldest and most proven game data structure. Your code follows the same pattern used by 40+ years of game development.

## Systems Thinking Connection

The Space Shooter stores entities in flat arrays. The RPG stores the dungeon in a 2D grid. Different data structure, same principle: game state is data in memory. The renderer reads the data and draws it. Change the data; the display updates. This is the foundation of every system that follows.

## Skill Reinforcement

This lesson establishes the grid that every future lesson builds on. L02 will place the player on this grid. L05 will use it for collision detection. L20 will load different grids from data files. Get the indexing right here — it propagates everywhere.

## Mastery Check

Question: Why is \`char grid[H][W]\` preferred over \`string grid[H]\`?
Answer: A char array is a flat memory block — cache-efficient, trivially serializable, zero overhead. A string is a heap-allocated object with a pointer, length, and capacity. For a game grid accessed thousands of times per frame, the char array is the correct choice.`,
    starterCode: `#include <iostream>
using namespace std;

const int W = 10;
const int H = 10;

int main() {
    char grid[H][W];

    // TODO: Fill grid with floor tiles '.'
    // Use nested loops: for y 0..H, for x 0..W

    // TODO: Set border walls to '#'
    // Row 0 and row H-1: all '#'
    // Column 0 and column W-1: all '#'

    cout << "DUNGEON|rpg-v0" << endl;

    // TODO: Render grid using GRID_ROW|y|row protocol
    // For each row y, print "GRID_ROW|" << y << "|" then each char

    cout << "TURN|0" << endl;
    cout << "GAME_MESSAGE|Dungeon grid initialized." << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int W = 10;
const int H = 10;

int main() {
    char grid[H][W];

    for (int y = 0; y < H; y++)
        for (int x = 0; x < W; x++)
            grid[y][x] = '.';

    for (int x = 0; x < W; x++) {
        grid[0][x] = '#';
        grid[H-1][x] = '#';
    }
    for (int y = 0; y < H; y++) {
        grid[y][0] = '#';
        grid[y][W-1] = '#';
    }

    cout << "DUNGEON|rpg-v0" << endl;

    for (int y = 0; y < H; y++) {
        cout << "GRID_ROW|" << y << "|";
        for (int x = 0; x < W; x++) cout << grid[y][x];
        cout << endl;
    }

    cout << "TURN|0" << endl;
    cout << "GAME_MESSAGE|Dungeon grid initialized." << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Dungeon header", expectedOutput: "DUNGEON|rpg-v0", isPattern: false },
      { id: "t2", description: "Top wall row", expectedOutput: "GRID_ROW|0|##########", isPattern: false },
      { id: "t3", description: "Interior row", expectedOutput: "GRID_ROW|1|#........#", isPattern: false },
      { id: "t4", description: "Bottom wall row", expectedOutput: "GRID_ROW|9|##########", isPattern: false },
    ],
    hints: [
      "Fill the grid with dots first: nested loops, grid[y][x] = \'.\'.",
      "Then overwrite the border: row 0, row H-1, column 0, column W-1 with \'#\'.",
      "Print with GRID_ROW|y| prefix, then loop x printing each character — no spaces between chars.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Dungeon Grid Renderer",
    type: "game_builder",
    instructions: `# Build: Dungeon Grid Renderer

## Mental Model

The dungeon grid is the visual foundation of the entire RPG. This build extends the basic grid with the game builder output protocol: DUNGEON header, GRID_ROW lines for the renderer, a hero ENTITY placed at tile (1,1), and HUD elements (TURN, HP, GOLD). The renderer reads these lines to draw the dungeon on screen.

## What Breaks Without This

Without the full output protocol, the game renderer has nothing to draw. The grid exists in memory but isn't communicated to the display. The ENTITY line tells the renderer where to draw the hero sprite. The GRID_ROW lines tell it where walls and floors are. Missing any of these means a broken display.

## The Fix: Full Output Protocol

\`\`\`cpp
cout << "DUNGEON|rpg-v0" << endl;
for (int y = 0; y < H; y++) {
    cout << "GRID_ROW|" << y << "|";
    for (int x = 0; x < W; x++) cout << grid[y][x];
    cout << endl;
}
cout << "ENTITY|hero|player|" << px*TILE << "|" << py*TILE << "|24|24" << endl;
cout << "TURN|0" << endl;
cout << "HP|100" << endl;
cout << "GOLD|0" << endl;
\`\`\`

## Key Concepts

- **DUNGEON header** — identifies the game type for the renderer.
- **GRID_ROW protocol** — each row is a separate line with y-index and the full row string.
- **ENTITY lines** — pixel coordinates = tile * TILE_SIZE. TILE = 24 pixels.
- **HUD elements** — TURN, HP, GOLD printed after grid for overlay display.

## Performance Insight

The entire render is sequential string output. No computation besides grid access. The cout calls are the bottleneck — in a real engine you'd write to a buffer and flush once. For our console game, this is negligible.

## Memory Insight

Grid + two player position ints = 104 bytes total. The ENTITY line computes pixel coords on the fly: \`px * 24\`. No additional memory for rendering — it's a pure projection of existing data.

## Your Task

Build the complete dungeon renderer: grid with player at (1,1), hero ENTITY line at pixel (24,24), and HUD with HP=100, GOLD=0.

## Beginner Trap

**Forgetting to place the player glyph on the grid before rendering.** If you print ENTITY but don't set \`grid[py][px] = \'@\'\`, the grid shows dots where the player should be. The ENTITY line is for the sprite renderer; the grid glyph is for the ASCII display.

## Elite Insight

Professional game engines separate the world data from the render data. Your grid IS the world data. The print loop IS the renderer. They're cleanly separated: change the grid, the render updates automatically. This is the Model-View pattern — the oldest and most reliable UI architecture.

## Mastery Check

Question: Why are pixel coordinates \`px * TILE\` instead of just \`px\`?
Answer: Tiles are logical coordinates (0-9). Pixels are screen coordinates. TILE = 24 means each tile is 24x24 pixels on screen. Multiplying converts from game space to screen space. This separation lets you change tile size without touching game logic.`,
    starterCode: `#include <iostream>
using namespace std;

const int W = 10, H = 10, TILE = 24;

int main() {
    char grid[H][W];
    for (int y = 0; y < H; y++)
        for (int x = 0; x < W; x++)
            grid[y][x] = '.';
    for (int x = 0; x < W; x++) { grid[0][x] = '#'; grid[H-1][x] = '#'; }
    for (int y = 0; y < H; y++) { grid[y][0] = '#'; grid[y][W-1] = '#'; }

    int px = 1, py = 1;
    // TODO: Place player glyph on grid

    // TODO: Print DUNGEON header

    // TODO: Print GRID_ROW lines

    // TODO: Print ENTITY line for hero at pixel (px*TILE, py*TILE) size 24x24
    // TODO: Print TURN|0
    // TODO: Print HP|100
    // TODO: Print GOLD|0
    // TODO: Print GAME_MESSAGE|Dungeon grid initialized.

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int W = 10, H = 10, TILE = 24;

int main() {
    char grid[H][W];
    for (int y = 0; y < H; y++)
        for (int x = 0; x < W; x++)
            grid[y][x] = '.';
    for (int x = 0; x < W; x++) { grid[0][x] = '#'; grid[H-1][x] = '#'; }
    for (int y = 0; y < H; y++) { grid[y][0] = '#'; grid[y][W-1] = '#'; }

    int px = 1, py = 1;
    grid[py][px] = '@';

    cout << "DUNGEON|rpg-v0" << endl;

    for (int y = 0; y < H; y++) {
        cout << "GRID_ROW|" << y << "|";
        for (int x = 0; x < W; x++) cout << grid[y][x];
        cout << endl;
    }

    cout << "ENTITY|hero|player|" << px * TILE << "|" << py * TILE << "|24|24" << endl;
    cout << "TURN|0" << endl;
    cout << "HP|100" << endl;
    cout << "GOLD|0" << endl;
    cout << "GAME_MESSAGE|Dungeon grid initialized." << endl;

    return 0;
}`,
    tests: [
      { id: "g1", description: "Top border wall row", expectedOutput: "GRID_ROW|0|##########", isPattern: false },
      { id: "g2", description: "Player on grid row 1", expectedOutput: "GRID_ROW|1|#@.......#", isPattern: false },
      { id: "g3", description: "Hero entity at pixel 24,24", expectedOutput: "ENTITY|hero|player|24|24|24|24", isPattern: false },
      { id: "g4", description: "HP display", expectedOutput: "HP|100", isPattern: false },
      { id: "g5", description: "Game message", expectedOutput: "GAME_MESSAGE|Dungeon grid initialized.", isPattern: false },
    ],
    hints: [
      "Place the player: grid[py][px] = \'@\' before printing the grid.",
      "ENTITY format: ENTITY|hero|player|px*TILE|py*TILE|24|24 where TILE=24.",
      "Print grid rows first, then ENTITY, then TURN, HP, GOLD, GAME_MESSAGE.",
    ],
    estimatedMinutes: 10,
  },
};