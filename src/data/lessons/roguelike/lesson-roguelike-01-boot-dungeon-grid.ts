import { Lesson } from "@/types/lesson";

export const lessonRoguelike1: Lesson = {
  id: "roguelike-1-boot-dungeon-grid",
  title: "Boot Dungeon Grid",
  description: "A 40x30 grid rendered as all walls with one carved room — your first procedurally generated dungeon.",
  order: 1,
  xpReward: 50,
  tier: "free",
  concepts: ["grid as data", "2D arrays", "tile types", "raylib rendering"],
  part1: {
    title: "Concept: The Dungeon Is a Grid",
    type: "concept",
    instructions: `# Boot Dungeon Grid

## Mental Model
A dungeon is not a picture. It is a 2D array of integers. Each cell holds a number: 0 means wall, 1 means floor. The rendering loop reads the array and draws colored rectangles. Change the array, change the dungeon. This is the foundation of every procedural generation algorithm.

## What Breaks Without This
Without a grid data structure, you have no dungeon. You could hardcode DrawRectangle calls for every tile, but that means no procedural generation — every dungeon is hand-crafted. The entire Roguelike path depends on algorithms that READ and WRITE this grid. No grid, no generation.

## The Fix: 2D Array as Dungeon
Declare a 2D array: ```cpp
int dungeon[MAP_H][MAP_W];
```

Every cell starts as 0 (wall). To carve a room, set a rectangular region to 1 (floor). That's it — the simplest possible dungeon generation. Later lessons will replace this manual carving with BSP trees, cellular automata, and wave function collapse. But the data structure stays the same: a 2D array of tile types.

The key insight: the grid IS the dungeon. There are no level files. No tile maps loaded from disk. The algorithm writes numbers into the array, and the renderer draws them. Change the algorithm, change the dungeon.

## Key Concepts
- 2D array `int dungeon[MAP_H][MAP_W]` stores tile types
- 0 = wall (drawn as black/dark), 1 = floor (drawn as gray)
- Carving a room = setting a rectangular region to 1
- The grid is the single source of truth for dungeon layout

## Performance Insight
A 40x30 grid is 1200 integers = 4800 bytes. That fits entirely in L1 cache. The render loop reads every cell once per frame — a single linear scan. This is as cache-friendly as it gets. Even a 200x200 dungeon (160KB) fits in L2 cache on any modern CPU.

## Memory Insight
The dungeon array lives on the stack at file scope. No heap allocation. No `new`. No `delete`. The array exists for the lifetime of the program. This is the simplest possible memory model — and it's exactly what we want for a roguelike where the dungeon persists until the player descends to the next floor.

## Your Task
Create a 10x8 grid. Initialize all cells to 0 (wall). Then carve a room from (2,2) to (7,5) by setting those cells to 1 (floor). Print the grid using `#` for walls and `.` for floors.

Expected output:
```
Dungeon: 10x8
##########
##########
##......##
##......##
##......##
##......##
##########
##########
```

## Beginner Trap
**Using `x` as the row index and `y` as the column index.** In a 2D array, `dungeon[y][x]` is the correct access pattern — row first, column second. If you write `dungeon[x][y]`, your room will be rotated 90 degrees and may go out of bounds. Always think: `dungeon[row][col]` where row = y and col = x.

## Elite Insight
Spelunky stores its dungeon as a 2D grid of room templates. Derek Yu's generation algorithm writes template indices into a 4x4 grid, then each template expands into a 10x8 tile grid. Two layers of grids — macro and micro. Your single grid is the micro layer. By Lesson 34, you'll have room templates too.

## Systems Thinking Connection
This 2D grid is the roguelike equivalent of the Platformer's tile map. Both store level geometry as integer arrays. The Platformer loads its grid from a file; the Roguelike generates its grid from an algorithm. Same data structure, completely different content pipeline.

## Skill Reinforcement
This lesson establishes the dungeon grid that every future lesson builds on. Lesson 2 adds seed-driven randomness to room placement. Lessons 3-5 replace manual carving with BSP tree generation.

## Mastery Check
Question: Why use integers (0, 1) instead of characters ('#', '.') for the grid?
Answer: Because algorithms operate on numbers, not characters. Later you'll have tile types 0-5 (wall, floor, corridor, stairs, trap, water). Integers support arithmetic comparisons, switch statements, and bitwise operations that characters don't. The character representation is purely for display.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAP_W = 10;
const int MAP_H = 8;

int dungeon[MAP_H][MAP_W];

int main() {
    // Initialize all cells to wall (0)
    for (int y = 0; y < MAP_H; y++) {
        for (int x = 0; x < MAP_W; x++) {
            dungeon[y][x] = 0;
        }
    }

    // TODO: Carve a room from (2,2) to (7,5)
    // Set dungeon[y][x] = 1 for x in [2..7] and y in [2..5]

    cout << "Dungeon: " << MAP_W << "x" << MAP_H << endl;

    // Render grid
    for (int y = 0; y < MAP_H; y++) {
        for (int x = 0; x < MAP_W; x++) {
            cout << (dungeon[y][x] == 1 ? '.' : '#');
        }
        cout << endl;
    }

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAP_W = 10;
const int MAP_H = 8;

int dungeon[MAP_H][MAP_W];

int main() {
    // Initialize all cells to wall (0)
    for (int y = 0; y < MAP_H; y++) {
        for (int x = 0; x < MAP_W; x++) {
            dungeon[y][x] = 0;
        }
    }

    // Carve a room from (2,2) to (7,5)
    for (int y = 2; y <= 5; y++) {
        for (int x = 2; x <= 7; x++) {
            dungeon[y][x] = 1;
        }
    }

    cout << "Dungeon: " << MAP_W << "x" << MAP_H << endl;

    // Render grid
    for (int y = 0; y < MAP_H; y++) {
        for (int x = 0; x < MAP_W; x++) {
            cout << (dungeon[y][x] == 1 ? '.' : '#');
        }
        cout << endl;
    }

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints dungeon dimensions", expectedOutput: "Dungeon: 10x8" },
      { id: "t2", description: "Top row is all walls", expectedOutput: "##########" },
      { id: "t3", description: "Room row shows floor tiles", expectedOutput: "##......##" },
    ],
    hints: [
      "You need a nested for loop to set cells in a rectangular region to 1.",
      "The outer loop goes from y=2 to y=5 (inclusive). The inner loop goes from x=2 to x=7 (inclusive).",
      "Write: for (int y = 2; y <= 5; y++) { for (int x = 2; x <= 7; x++) { dungeon[y][x] = 1; } }",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Your First Dungeon",
    type: "game_builder",
    instructions: `# Build: Your First Dungeon

## Mental Model
The console grid was proof of concept. Now you'll render the same dungeon data with raylib — colored rectangles on a black canvas. Walls stay black (the background). Floors are dark gray rectangles. The grid data is identical; only the output changes from text to pixels.

## What Breaks Without This
A text-mode dungeon is invisible in the game canvas. Students need to SEE the dungeon rendered as colored tiles to understand how procedural generation works. Without visual rendering, the feedback loop is broken — you can't tell if your algorithm produced a good dungeon.

## The Fix: Raylib Grid Renderer
Loop over the dungeon array. For each cell, if it's a floor (1), draw a dark gray rectangle at `(x * TILE_SIZE, y * TILE_SIZE)`. Walls stay as the black background. The TILE_SIZE constant (16 pixels) maps grid coordinates to screen coordinates.

You also need a 40x30 dungeon with a carved room, plus cout output for test verification. Both outputs come from the same dungeon array — the grid is the single source of truth.

## Key Concepts
- TILE_SIZE maps grid coords to pixel coords
- Only draw floor tiles — walls are the black background
- cout output for tests, DrawRectangle for visuals
- InitWindow/CloseWindow bracket the game loop

## Performance Insight
40x30 = 1200 tiles. At 16x16 pixels each, we're drawing ~600 rectangles per frame (only floors). At 60 FPS that's 36,000 draw calls per second — trivial for raylib's batched renderer. You won't hit performance limits until hundreds of thousands of draw calls.

## Memory Insight
The dungeon array at file scope means it's allocated once when the program starts. The game loop only reads it — no allocation, no mutation during rendering. This separation of generation (write) and rendering (read) is fundamental to roguelike architecture.

## Your Task
Create a 40x30 dungeon grid. Initialize all cells to walls (0). Carve a room from (5,5) to (15,12). Print the room dimensions and floor count via cout. Then render the dungeon with raylib — dark gray rectangles for floors on a black background.

Expected cout output:
```
Dungeon: 40x30
Room: (5,5)-(15,12)
Floor tiles: 88
```

**Click Run** to see your first dungeon rendered in the canvas!

## Did It Work?
You should see a black canvas with a dark gray rectangle in the upper-left area. That's your room — carved from the wall grid by your code. Every roguelike dungeon you'll ever build starts exactly like this.

## Beginner Trap
**Forgetting the game loop.** Without `while (!WindowShouldClose())`, the window opens and immediately closes. The game loop keeps the window alive and redraws every frame. Even though the dungeon is static right now, the loop is required.

## Elite Insight
Brogue's dungeon renderer is essentially this same pattern — read a 2D array, draw colored tiles. Brian Walker's innovation was in the generation algorithms that FILL the grid, not in the renderer that READS it. Your renderer is nearly complete; the generation is what the next 9 lessons will build.

## Mastery Check
Question: Why do we use ClearBackground(BLACK) and only draw floor tiles, instead of drawing both wall and floor tiles?
Answer: Walls ARE the background. Drawing 1200 black rectangles on a black background wastes draw calls. By only drawing floors (~200 tiles in a typical dungeon), we cut draw calls by 80%. This optimization scales — a 200x200 dungeon with sparse rooms saves thousands of draw calls per frame.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 640;
const int SCREEN_H = 480;
const int MAP_W = 40;
const int MAP_H = 30;
const int TILE_SIZE = 16;

int dungeon[MAP_H][MAP_W];

int main() {
    // Initialize all cells to wall (0)
    for (int y = 0; y < MAP_H; y++) {
        for (int x = 0; x < MAP_W; x++) {
            dungeon[y][x] = 0;
        }
    }

    // TODO: Carve a room from (5,5) to (15,12)
    // Set dungeon[y][x] = 1 for x in [5..15] and y in [5..12]

    // TODO: Count floor tiles
    int floor_count = 0;
    // Loop over the grid and count cells equal to 1

    cout << "Dungeon: " << MAP_W << "x" << MAP_H << endl;
    cout << "Room: (5,5)-(15,12)" << endl;
    cout << "Floor tiles: " << floor_count << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(BLACK);

        // TODO: Render dungeon - draw DARKGRAY rectangles for floor tiles
        // For each cell where dungeon[y][x] == 1, draw:
        // DrawRectangle(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE - 1, TILE_SIZE - 1, DARKGRAY);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 640;
const int SCREEN_H = 480;
const int MAP_W = 40;
const int MAP_H = 30;
const int TILE_SIZE = 16;

int dungeon[MAP_H][MAP_W];

int main() {
    // Initialize all cells to wall (0)
    for (int y = 0; y < MAP_H; y++) {
        for (int x = 0; x < MAP_W; x++) {
            dungeon[y][x] = 0;
        }
    }

    // Carve a room from (5,5) to (15,12)
    for (int y = 5; y <= 12; y++) {
        for (int x = 5; x <= 15; x++) {
            dungeon[y][x] = 1;
        }
    }

    // Count floor tiles
    int floor_count = 0;
    for (int y = 0; y < MAP_H; y++) {
        for (int x = 0; x < MAP_W; x++) {
            if (dungeon[y][x] == 1) floor_count++;
        }
    }

    cout << "Dungeon: " << MAP_W << "x" << MAP_H << endl;
    cout << "Room: (5,5)-(15,12)" << endl;
    cout << "Floor tiles: " << floor_count << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(BLACK);

        // Render dungeon
        for (int y = 0; y < MAP_H; y++) {
            for (int x = 0; x < MAP_W; x++) {
                if (dungeon[y][x] == 1) {
                    DrawRectangle(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE - 1, TILE_SIZE - 1, DARKGRAY);
                }
            }
        }

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints dungeon dimensions", expectedOutput: "Dungeon: 40x30" },
      { id: "g2", description: "Prints room coordinates", expectedOutput: "Room: (5,5)-(15,12)" },
      { id: "g3", description: "Prints floor tile count", expectedOutput: "Floor tiles: 88" },
    ],
    hints: [
      "Carving the room uses the same nested loop pattern from Part 1 — just with different coordinates.",
      "To count floors, loop over the entire grid and increment floor_count whenever dungeon[y][x] == 1. The room is 11 wide (5 to 15) and 8 tall (5 to 12) = 88 tiles.",
      "For rendering, add a nested loop inside the game loop: if (dungeon[y][x] == 1) DrawRectangle(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE - 1, TILE_SIZE - 1, DARKGRAY);",
    ],
    estimatedMinutes: 12,
  },
};