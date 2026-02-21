import { Lesson } from "@/types/lesson";

export const lessonRPG01: Lesson = {
  id: "rpg-01-boot-dungeon-grid",
  title: "Boot Dungeon Grid",
  description: "Render a 12x10 dungeon grid with walls and a player. The grid is data; the renderer is a nested loop.",
  order: 1,
  xpReward: 50,
  tier: "free",
  concepts: ["grid as data", "nested loops", "dual output", "tile rendering"],
  part1: {
    title: "Concept: Grid as Data",
    type: "concept",
    instructions: `# Boot Dungeon Grid

## Mental Model
A dungeon is a grid. A grid is a 2D array of integers. Each cell holds a tile type: 0 for floor, 1 for wall. The renderer is a nested loop that reads each cell and prints the corresponding character. Change the data; the display changes. This is the first principle of data-driven game design.

## What Breaks Without This
Without a grid, dungeon layout is hardcoded strings. Adding a wall means editing a print statement. Moving the player means manually computing which character to update. It does not scale beyond 10 lines of code. With a grid array, the dungeon is data — movable, saveable, loadable, and renderable by a single loop.

## The Fix: 2D Array as Grid
\`\`\`cpp
const int GRID_W = 12;
const int GRID_H = 10;
int tiles[GRID_H][GRID_W];

// 0 = floor, 1 = wall
// Border cells are walls, interior cells are floor
\`\`\`

The player is stored as two integers: \`player_x\` and \`player_y\`. During the print loop, if the current cell matches the player position, print \`@\` instead of the tile character. The player is not IN the grid — the player is rendered ON TOP of the grid. This separation matters: the grid is world data, the player is entity data.

## Key Concepts
- Grid as data: a 2D array where each cell holds a tile type
- Renderer as loop: nested for-loops read data and produce output
- Entity separate from world: player position is variables, not part of the grid array
- Wall counting: iterate the grid and count cells where tiles[y][x] == 1

## Beginner Trap
**Putting the player character directly into the tiles array.** If you write \`tiles[5][5] = 2\` to mean "player," you mix entity data with world data. When the player moves, you need to restore the old tile value. When you save the dungeon, player position is embedded in the map. Keep them separate: \`tiles[][]\` for the world, \`player_x/player_y\` for the entity.

## Elite Insight
Nethack stores its dungeon as a 2D grid of tile types. The display function reads each cell and maps it to a character. Every roguelike since 1980 follows this pattern. Your grid is the same architecture — at a smaller scale.

## Systems Thinking Connection
This grid-as-data pattern is the RPG equivalent of the Platformer's tilemap collision grid. Both store world geometry as arrays of integers. The Platformer checks \`grid[y][x]\` for collision. Your RPG checks \`tiles[y][x]\` for walls. Different game, same data structure.

## Your Task
Create a 12x10 grid with border walls and 4 interior walls. Place the player at (5, 5). Print the grid dimensions, wall count, and player position.

Expected output:
\`\`\`
Grid: 12x10
Walls: 44
Player: (5, 5)
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
int tiles[GRID_H][GRID_W];
int player_x = 5, player_y = 5;

void initTiles() {
    // TODO: Fill the grid
    // Border cells (y==0, y==GRID_H-1, x==0, x==GRID_W-1) should be 1 (wall)
    // Interior cells should be 0 (floor)
    // Add 4 interior walls: tiles[3][4], tiles[3][5], tiles[6][7], tiles[6][8]
}

int main() {
    initTiles();

    // TODO: Print "Grid: 12x10"

    // TODO: Count walls and print "Walls: 44"

    // TODO: Print "Player: (5, 5)"

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
int tiles[GRID_H][GRID_W];
int player_x = 5, player_y = 5;

void initTiles() {
    for (int y = 0; y < GRID_H; y++) {
        for (int x = 0; x < GRID_W; x++) {
            if (y == 0 || y == GRID_H - 1 || x == 0 || x == GRID_W - 1)
                tiles[y][x] = 1;
            else
                tiles[y][x] = 0;
        }
    }
    tiles[3][4] = 1;
    tiles[3][5] = 1;
    tiles[6][7] = 1;
    tiles[6][8] = 1;
}

int main() {
    initTiles();

    cout << "Grid: " << GRID_W << "x" << GRID_H << endl;

    int wall_count = 0;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            if (tiles[y][x] == 1) wall_count++;
    cout << "Walls: " << wall_count << endl;

    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints grid dimensions", expectedOutput: "Grid: 12x10", isPattern: false },
      { id: "t2", description: "Prints wall count", expectedOutput: "Walls: 44", isPattern: false },
      { id: "t3", description: "Prints player position", expectedOutput: "Player: (5, 5)", isPattern: false },
    ],
    hints: [
      "Use nested loops to fill the grid. Check if y==0, y==GRID_H-1, x==0, or x==GRID_W-1 to identify border cells.",
      "After filling borders, set the 4 interior walls: tiles[3][4]=1, tiles[3][5]=1, tiles[6][7]=1, tiles[6][8]=1.",
      "Count walls by looping through the grid and incrementing a counter when tiles[y][x]==1. Print with cout.",
    ],
    estimatedMinutes: 8
  },
  part2: {
    title: "Build: Boot Dungeon Grid",
    type: "game_builder",
    instructions: `# Build: Boot Dungeon Grid

## Mental Model
The same grid data that produced ASCII output now drives a raylib canvas. Each tile becomes a colored rectangle. Walls are GRAY, floors are DARKGRAY, and the player is GREEN. The renderer is still a nested loop — it just calls DrawRectangle instead of cout. The data doesn't change. Only the output format changes. This is the dual-output pattern: same data, two renderers.

## What Breaks Without This
Without visual rendering, you can't see your dungeon take shape. ASCII output proves the data is correct, but it doesn't feel like a game. The canvas makes the dungeon real — you can see the walls, the floor, and the player. Every lesson from here forward will render to this canvas.

## The Fix: Tile Rendering with Raylib
Each tile at grid position (x, y) renders as a rectangle at pixel position (x*TILE, y*TILE) with size (TILE-1, TILE-1). The 1-pixel gap between tiles creates a grid effect. The player renders on top as a GREEN rectangle at (player_x*TILE, player_y*TILE).

## Key Concepts
- Grid coordinates to pixel coordinates: multiply by TILE size
- TILE-1 pixel size creates visible grid lines
- Player renders on top of tiles, not inside the tile array
- HUD text in the right margin (x=400+) keeps UI separate from game grid

## Your Task
Initialize the tile grid with border walls and 4 interior walls. Render the grid as colored rectangles. Render the player as a GREEN square. Print grid info to cout for test validation.

Expected cout output:
\`\`\`
Grid: 12x10
Player: (5, 5)
Tile: 32px
\`\`\`

## Beginner Trap
**Drawing the player inside the tile loop.** If you check \`if (x == player_x && y == player_y)\` inside the tile loop, you skip drawing the floor tile under the player. Draw ALL tiles first, THEN draw the player on top. Layered rendering: background first, entities second.

## Elite Insight
Every 2D game engine renders in layers: background tiles, then entities, then UI. Unreal, Unity, Godot — all use this pattern. Your nested loop draws the tile layer. The player DrawRectangle draws the entity layer. The DrawText calls draw the UI layer. Same architecture, simplified.

## Mastery Check
Question: Why is the rectangle size TILE-1 instead of TILE?
Answer: The 1-pixel gap between tiles creates visible grid lines, making the dungeon layout easier to read. Without the gap, adjacent tiles blend into a solid block.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
const int TILE = 32;
int tiles[GRID_H][GRID_W];
int player_x = 5, player_y = 5;

void initTiles() {
    // TODO: Fill the grid with border walls (1) and floor (0)
    // TODO: Add 4 interior walls: tiles[3][4], tiles[3][5], tiles[6][7], tiles[6][8]
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);

    initTiles();

    // TODO: Print "Grid: 12x10" using cout
    // TODO: Print "Player: (5, 5)" using cout
    // TODO: Print "Tile: 32px" using cout

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(BLACK);

        // TODO: Render tiles as colored rectangles
        // walls (1) = GRAY, floor (0) = DARKGRAY
        // Each tile at pixel position (x*TILE, y*TILE), size (TILE-1, TILE-1)

        // TODO: Render player as GREEN rectangle at (player_x*TILE, player_y*TILE)

        DrawText("HeapSight RPG", 400, 10, 20, WHITE);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
const int TILE = 32;
int tiles[GRID_H][GRID_W];
int player_x = 5, player_y = 5;

void initTiles() {
    for (int y = 0; y < GRID_H; y++) {
        for (int x = 0; x < GRID_W; x++) {
            if (y == 0 || y == GRID_H - 1 || x == 0 || x == GRID_W - 1)
                tiles[y][x] = 1;
            else
                tiles[y][x] = 0;
        }
    }
    tiles[3][4] = 1;
    tiles[3][5] = 1;
    tiles[6][7] = 1;
    tiles[6][8] = 1;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);

    initTiles();

    cout << "Grid: " << GRID_W << "x" << GRID_H << endl;
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Tile: " << TILE << "px" << endl;

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(BLACK);

        for (int y = 0; y < GRID_H; y++) {
            for (int x = 0; x < GRID_W; x++) {
                Color c = (tiles[y][x] == 1) ? GRAY : DARKGRAY;
                DrawRectangle(x * TILE, y * TILE, TILE - 1, TILE - 1, c);
            }
        }
        DrawRectangle(player_x * TILE, player_y * TILE, TILE - 1, TILE - 1, GREEN);

        DrawText("HeapSight RPG", 400, 10, 20, WHITE);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints grid dimensions", expectedOutput: "Grid: 12x10", isPattern: false },
      { id: "g2", description: "Prints player position", expectedOutput: "Player: (5, 5)", isPattern: false },
      { id: "g3", description: "Prints tile size", expectedOutput: "Tile: 32px", isPattern: false },
    ],
    hints: [
      "Use nested loops: for y from 0 to GRID_H, for x from 0 to GRID_W. Check border conditions to set walls.",
      "For rendering, DrawRectangle(x*TILE, y*TILE, TILE-1, TILE-1, color). Use GRAY for walls, DARKGRAY for floor.",
      "Draw the player AFTER the tile loop: DrawRectangle(player_x*TILE, player_y*TILE, TILE-1, TILE-1, GREEN).",
    ],
    estimatedMinutes: 10
  }
};
