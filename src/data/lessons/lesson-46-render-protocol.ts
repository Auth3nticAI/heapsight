import type { Lesson } from "@/types/lesson";

export const lesson46: Lesson = {
  id: "46-render-protocol",
  title: "Render Protocol",
  description: "Define a text-based render protocol for drawing game frames as ASCII grids.",
  order: 46,
  xpReward: 175,
  tier: "pro",
  concepts: ["render protocol", "ASCII rendering", "grid buffer", "screen coordinates", "draw commands"],
  part1: {
    title: "Concept: Text-Based Rendering",
    type: "concept",
    instructions: `# Text-Based Rendering — Seeing the Invisible

You have been running simulations blind. Entities move, collide, die — and you see nothing but numbers. A render system changes that. It takes world state and produces a visual frame. In AAA engines, that means millions of triangles. Here, it means a character grid. The principle is identical: read entity positions, write pixels.

## What Breaks Without This

Without rendering, debugging is guesswork. You print coordinates and try to imagine where entities are. Two entities at (120,60) and (122,58) — are they overlapping? You cannot tell from numbers alone. A visual frame makes spatial bugs obvious. Rendering is not decoration. It is a debugging tool.

## The Fix

A screen buffer is a 2D array of characters. \\\`char grid[HEIGHT][WIDTH]\\\`. Each frame: clear the grid to \\\`'.'\\\`, plot entities at their positions, print the grid row by row. That is the entire render pipeline. Clear, plot, present.

\\\`clearGrid()\\\` fills every cell with \\\`'.'\\\`. \\\`plotChar(grid, x, y, ch)\\\` writes a character at a position if it is in bounds. \\\`drawLine()\\\` iterates between two points and plots characters along the path. These three functions are enough to visualize any 2D game state.

## Your Task

1. Define constants: \\\`WIDTH = 20\\\`, \\\`HEIGHT = 10\\\`
2. Declare \\\`char grid[HEIGHT][WIDTH]\\\`
3. Write \\\`clearGrid(grid)\\\` — fill every cell with \\\`'.'\\\`
4. Write \\\`plotChar(grid, x, y, ch)\\\` — if x and y are in bounds, set \\\`grid[y][x] = ch\\\`
5. Write \\\`drawHLine(grid, x1, x2, y, ch)\\\` — draw a horizontal line of characters from x1 to x2 at row y
6. Clear the grid
7. Plot \\\`'P'\\\` at (10, 8), \\\`'E'\\\` at (5, 2), \\\`'*'\\\` at (10, 5)
8. Draw a horizontal line of \\\`'-'\\\` from x=0 to x=19 at y=9
9. Print each row: \\\`ROW|<y>|<row_string>\\\`
10. Print: \\\`RENDER|chars_plotted|23|grid_size|20x10\\\`

The grid is your framebuffer. Every game frame, you clear it and redraw.`,
    starterCode: `#include <iostream>
using namespace std;

const int WIDTH = 20;
const int HEIGHT = 10;

char grid[HEIGHT][WIDTH];

// TODO: Write clearGrid(grid) — fill with '.'

// TODO: Write plotChar(grid, x, y, ch) — bounds-check then set

// TODO: Write drawHLine(grid, x1, x2, y, ch) — horizontal line

int main() {
    // TODO: Clear the grid
    // TODO: Plot 'P' at (10,8), 'E' at (5,2), '*' at (10,5)
    // TODO: Draw horizontal line of '-' from x=0 to x=19 at y=9
    // TODO: Print each row as ROW|<y>|<characters>
    // TODO: Print RENDER summary

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int WIDTH = 20;
const int HEIGHT = 10;

char grid[HEIGHT][WIDTH];

void clearGrid() {
    for (int r = 0; r < HEIGHT; r++) {
        for (int c = 0; c < WIDTH; c++) {
            grid[r][c] = '.';
        }
    }
}

void plotChar(int x, int y, char ch) {
    if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
        grid[y][x] = ch;
    }
}

void drawHLine(int x1, int x2, int y, char ch) {
    for (int x = x1; x <= x2; x++) {
        plotChar(x, y, ch);
    }
}

int main() {
    clearGrid();

    plotChar(10, 8, 'P');
    plotChar(5, 2, 'E');
    plotChar(10, 5, '*');
    drawHLine(0, 19, 9, '-');

    for (int r = 0; r < HEIGHT; r++) {
        cout << "ROW|" << r << "|";
        for (int c = 0; c < WIDTH; c++) {
            cout << grid[r][c];
        }
        cout << endl;
    }

    cout << "RENDER|chars_plotted|23|grid_size|20x10" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Row 2 should show enemy at position 5", expectedOutput: "ROW\\|2\\|.....E..............", isPattern: true },
      { id: "t2", description: "Row 5 should show bullet at position 10", expectedOutput: "ROW\\|5\\|..........\\*.........", isPattern: true },
      { id: "t3", description: "Row 8 should show player at position 10", expectedOutput: "ROW\\|8\\|..........P.........", isPattern: true },
      { id: "t4", description: "Row 9 should be a line of dashes", expectedOutput: "ROW\\|9\\|--------------------", isPattern: true },
      { id: "t5", description: "Should print render summary", expectedOutput: "RENDER\\|chars_plotted\\|23\\|grid_size\\|20x10", isPattern: true },
    ],
    hints: [
      "clearGrid uses two nested loops: outer for rows (0 to HEIGHT-1), inner for columns (0 to WIDTH-1). Set each cell to '.'.",
      "plotChar must check bounds before writing: x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT. Grid is indexed as grid[y][x] — row first, then column.",
      "chars_plotted = 3 individual characters (P, E, *) + 20 dash characters in the horizontal line = 23 total.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Game: Render Protocol",
    type: "game_builder",
    instructions: `# Game Builder: Render Protocol

Build the render system for your space shooter. Define a screen buffer, plot entities onto it, and print the visual frame. This is the first time you see your game.

## Your Task
1. Screen buffer: \\\`char grid[10][20]\\\` (HEIGHT=10, WIDTH=20)
2. \\\`clearScreen()\\\` fills grid with \\\`'.'\\\`
3. \\\`plotEntity(x, y, ch)\\\` places a character at grid position (bounds-checked)
4. Create 3 entities: player at world pos (190, 160), enemy at world pos (90, 20), bullet at world pos (190, 100)
5. Scale world coordinates to grid: \\\`gridX = worldX / 20\\\`, \\\`gridY = worldY / 20\\\`
6. Map: player \\\`'P'\\\`, enemy \\\`'E'\\\`, bullet \\\`'*'\\\`
7. Clear screen, plot all 3 entities
8. Print grid: \\\`ROW|<y>|<20 characters>\\\`
9. Print: \\\`RENDER|entities_drawn|3|grid_size|20x10\\\``,
    starterCode: `#include <iostream>
using namespace std;

const int WIDTH = 20;
const int HEIGHT = 10;

char grid[HEIGHT][WIDTH];

// TODO: Write clearScreen() — fill grid with '.'

// TODO: Write plotEntity(x, y, ch) — bounds-check, then grid[y][x] = ch

int main() {
    // TODO: Define 3 entities with world positions
    //       player at (190, 160), enemy at (90, 20), bullet at (190, 100)

    // TODO: Scale world coords to grid: gridX = worldX / 20, gridY = worldY / 20

    // TODO: Clear screen, plot entities with P, E, *

    // TODO: Print grid rows as ROW|<y>|<characters>

    // TODO: Print RENDER summary

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int WIDTH = 20;
const int HEIGHT = 10;

char grid[HEIGHT][WIDTH];

void clearScreen() {
    for (int r = 0; r < HEIGHT; r++) {
        for (int c = 0; c < WIDTH; c++) {
            grid[r][c] = '.';
        }
    }
}

void plotEntity(int x, int y, char ch) {
    if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
        grid[y][x] = ch;
    }
}

int main() {
    int worldX[] = {190, 90, 190};
    int worldY[] = {160, 20, 100};
    char sprite[] = {'P', 'E', '*'};

    clearScreen();

    int drawn = 0;
    for (int i = 0; i < 3; i++) {
        int gx = worldX[i] / 20;
        int gy = worldY[i] / 20;
        plotEntity(gx, gy, sprite[i]);
        drawn++;
    }

    for (int r = 0; r < HEIGHT; r++) {
        cout << "ROW|" << r << "|";
        for (int c = 0; c < WIDTH; c++) {
            cout << grid[r][c];
        }
        cout << endl;
    }

    cout << "RENDER|entities_drawn|" << drawn << "|grid_size|20x10" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Row 0 should be empty dots", expectedOutput: "ROW\\|0\\|\\.{20}", isPattern: true },
      { id: "t2", description: "Row 1 should show enemy E at grid position 4", expectedOutput: "ROW\\|1\\|....E...............", isPattern: true },
      { id: "t3", description: "Row 5 should show bullet * at grid position 9", expectedOutput: "ROW\\|5\\|.........\\*...........", isPattern: true },
      { id: "t4", description: "Row 8 should show player P at grid position 9", expectedOutput: "ROW\\|8\\|.........P..........", isPattern: true },
      { id: "t5", description: "Should report 3 entities drawn", expectedOutput: "RENDER\\|entities_drawn\\|3\\|grid_size\\|20x10", isPattern: true },
    ],
    hints: [
      "clearScreen is two nested loops setting every cell to '.'. plotEntity checks bounds before writing to grid[y][x].",
      "Scale world to grid: gridX = worldX / 20, gridY = worldY / 20. Player at (190,160) maps to grid (9,8). Enemy at (90,20) maps to (4,1). Bullet at (190,100) maps to (9,5).",
      "Print each row by looping through grid[r][0..WIDTH-1] and outputting each character. No spaces between characters.",
    ],
    estimatedMinutes: 8,
  },
};
