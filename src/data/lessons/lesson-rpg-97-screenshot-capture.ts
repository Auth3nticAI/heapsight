import { Lesson } from "@/types/lesson";

export const lessonRPG97: Lesson = {
  id: "rpg-97-screenshot-capture",
  title: "Screenshot Capture",
  description: "Render the game state to a character buffer instead of cout. Capture a snapshot of the dungeon for documentation or replay.",
  order: 97,
  xpReward: 100,
  tier: "pro",
  concepts: ["render to buffer", "screenshot capture", "string buffer", "visual documentation", "output redirection"],
  part1: {
    title: "Concept: Rendering to a Buffer",
    type: "concept",
    instructions: `# Screenshot Capture

## Mental Model

Your render function writes directly to cout. That works for playing,
but you can't capture a screenshot, compare frames, or embed output
in a README. Fix: render to a character buffer, then decide what to
do with the result. The render function becomes a pure function of state.

## What Breaks Without This

Without buffer rendering:
- No screenshot capture for documentation
- No frame comparison for visual regression tests
- No headless rendering for automated testing
- Output is ephemeral — once printed, it's gone

## The Fix

Render to a fixed-size char array:

\`\`\`cpp
const int SW = 10, SH = 5;
char screen[SH][SW + 1]; // +1 for null terminator

void clearScreen(char scr[][SW+1], int h) {
    for (int y = 0; y < h; y++) {
        for (int x = 0; x < SW; x++) scr[y][x] = '.';
        scr[y][SW] = '\0';
    }
}
\`\`\`

## Key Concepts

- **Character buffer**: 2D char array with null terminators
- **clearScreen**: fill with '.', null-terminate each row
- **renderToBuffer**: place entities on the grid
- **printScreen**: loop rows, cout each as a string

## Performance Insight

A 10x5 buffer is 55 bytes. Clearing and filling is under a microsecond.
Buffer rendering is faster than direct cout because you batch output.

## Memory Insight

Stack-allocated 2D array. Fixed size, no heap. You know exactly how
much memory rendering costs: SW * SH + SH bytes.

## Your Task

Write clearScreen and printScreen. Clear a 10x5 grid, place one
character, print it.

## Beginner Trap

\`\`\`cpp
// BAD: Using std::string for screen buffer
string screen_line; // Heap allocation per line!
// FIX: Fixed char array — zero heap
char screen[5][11];
\`\`\`

## Elite Insight

Dwarf Fortress renders to an internal tile buffer, then draws to
screen. This separation enables headless testing, automated
screenshots, and accessibility overlays.

## Systems Thinking Connection

Buffer rendering connects to the event queue (L77): events tell
WHAT changed, the buffer shows the CURRENT state. Snapshot + events
= full replay visualization.

## Skill Reinforcement

- 2D arrays from L06
- Null termination from L11 (strings)
- Loop iteration from L07

## Mastery Check

You pass when a 10x5 grid prints with '@' at position (2,1).`,
    starterCode: `#include <iostream>
using namespace std;

const int SW = 10, SH = 5;

// TODO: clearScreen(char scr[][SW+1], int h)
// Fill with '.', null-terminate each row

// TODO: printScreen(const char scr[][SW+1], int h)
// Print each row with cout

int main() {
    char screen[SH][SW + 1];
    // TODO: clearScreen, place '@' at (2,1), printScreen
    // Print BUFFER_TEST|PASS
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int SW = 10, SH = 5;

void clearScreen(char scr[][SW+1], int h) {
    for (int y = 0; y < h; y++) {
        for (int x = 0; x < SW; x++) scr[y][x] = '.';
        scr[y][SW] = 0;
    }
}

void printScreen(const char scr[][SW+1], int h) {
    for (int y = 0; y < h; y++) cout << scr[y] << endl;
}

int main() {
    char screen[SH][SW + 1];
    clearScreen(screen, SH);
    screen[1][2] = '@';
    printScreen(screen, SH);
    cout << "BUFFER_TEST|PASS" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "First row is dots", expectedOutput: "..........", isPattern: false },
      { id: "t2", description: "Player visible", expectedOutput: "..@.......", isPattern: false },
      { id: "t3", description: "Buffer test passes", expectedOutput: "BUFFER_TEST|PASS", isPattern: false },
    ],
    hints: [
      "clearScreen: inner loop fills with '.', then set scr[y][SW] = 0 for null terminator.",
      "Place '@' with screen[1][2] = '@' (row 1, column 2).",
      "printScreen loops y from 0 to h, printing scr[y] as a C string.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Build: Dungeon Screenshot",
    type: "game_builder",
    instructions: `# Build: Render to Buffer and Print

## Mental Model

Part 1 proved basic buffer rendering. Now build a full dungeon
screenshot: clear the grid, draw border walls (#), place a player
(@) and an enemy (E), then print the buffer as a captured screenshot.

## What Breaks Without This

Without full buffer rendering:
- Borders aren't visible
- Multiple entities can't be placed
- The "screenshot" is just dots

## The Fix

clearScreen, drawBorders (#), renderToBuffer (place @ and E),
printScreen (output rows).

## Key Concepts

- **drawBorders**: set row 0, row h-1, col 0, col w-1 to #
- **Entity placement**: scr[py][px] = '@', scr[ey][ex] = 'E'
- **Order matters**: clear first, then borders, then entities
- **Print as screenshot**: the buffer IS the screenshot

## Performance Insight

Clear: 50 writes. Borders: 26 writes. Entities: 2 writes. Print: 5
cout calls. Total: under 5 microseconds.

## Memory Insight

55-byte stack buffer. Zero heap. The entire renderer fits in a
single cache line.

## Your Task

1. Write clearScreen (fill with '.', null-terminate)
2. Write drawBorders (# on edges)
3. Write renderToBuffer (clear, borders, place @ and E)
4. Print the grid and SCREENSHOT|captured

## Beginner Trap

\`\`\`cpp
// BAD: Drawing borders after entities
scr[py][px] = '@';
drawBorders(scr, w, h); // Overwrites @ if it's on an edge!
// FIX: Always draw borders BEFORE entities
\`\`\`

## Elite Insight

Game engines use render targets (offscreen buffers) for post-processing,
minimaps, and screenshot capture. Your char buffer is the ASCII
equivalent of a render target.

## Mastery Check

You pass when the grid shows # borders, @ at (2,1), E at (7,3),
and SCREENSHOT|captured prints.`,
    starterCode: `#include <iostream>
using namespace std;

const int SW = 10;
const int SH = 5;

// TODO: clearScreen(char scr[][SW+1], int h) — fill with '.', null-terminate
// TODO: drawBorders(char scr[][SW+1], int w, int h) — '#' on edges
// TODO: renderToBuffer(char scr[][SW+1], int px, int py, int ex, int ey)
//   clearScreen, drawBorders, place '@' at (px,py), 'E' at (ex,ey)
// TODO: printScreen(const char scr[][SW+1], int h) — print each row

int main() {
    char screen[SH][SW + 1];
    // TODO: renderToBuffer(screen, 2, 1, 7, 3)
    // TODO: printScreen(screen, SH)
    // TODO: Print SCREENSHOT|captured
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int SW = 10;
const int SH = 5;

void clearScreen(char scr[][SW+1], int h) {
    for (int y = 0; y < h; y++) {
        for (int x = 0; x < SW; x++) scr[y][x] = '.';
        scr[y][SW] = 0;
    }
}

void drawBorders(char scr[][SW+1], int w, int h) {
    for (int x = 0; x < w; x++) { scr[0][x] = '#'; scr[h-1][x] = '#'; }
    for (int y = 0; y < h; y++) { scr[y][0] = '#'; scr[y][w-1] = '#'; }
}

void renderToBuffer(char scr[][SW+1], int px, int py, int ex, int ey) {
    clearScreen(scr, SH);
    drawBorders(scr, SW, SH);
    scr[py][px] = '@';
    scr[ey][ex] = 'E';
}

void printScreen(const char scr[][SW+1], int h) {
    for (int y = 0; y < h; y++) cout << scr[y] << endl;
}

int main() {
    char screen[SH][SW + 1];
    renderToBuffer(screen, 2, 1, 7, 3);
    printScreen(screen, SH);
    cout << "SCREENSHOT|captured" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Top border", expectedOutput: "##########", isPattern: false },
      { id: "g2", description: "Player visible", expectedOutput: "#.@.....#", isPattern: false },
      { id: "g3", description: "Enemy visible", expectedOutput: "#......E.#", isPattern: false },
      { id: "g4", description: "Screenshot captured", expectedOutput: "SCREENSHOT|captured", isPattern: false },
    ],
    hints: [
      "clearScreen fills every cell with '.' and null-terminates each row at index SW.",
      "drawBorders sets row 0 and row h-1 to '#', and column 0 and column w-1 to '#'.",
      "renderToBuffer calls clearScreen, drawBorders, then places @ and E at their coordinates.",
    ],
    estimatedMinutes: 10,
  },
};