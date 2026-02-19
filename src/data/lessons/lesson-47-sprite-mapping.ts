import type { Lesson } from "@/types/lesson";

export const lesson47: Lesson = {
  id: "47-sprite-mapping",
  title: "Sprite Mapping",
  description: "Map different entity types to different ASCII characters for visual identification.",
  order: 47,
  xpReward: 175,
  tier: "pro",
  concepts: ["sprite mapping", "lookup table", "entity rendering", "visual identity", "char mapping"],
  part1: {
    title: "Concept: Lookup Tables for Sprite Mapping",
    type: "concept",
    instructions: `# Lookup Tables — Data Replaces Logic

A switch statement with 7 cases is 7 branches. Each branch is a potential misprediction. A lookup table is one array access. Zero branches. The CPU does not guess. It loads.

## What Breaks Without This

Every time you add a new entity type, you edit a switch statement. You add a case. You forget the break. Or you copy-paste and leave the wrong character. The switch grows linearly with entity types. At 20 types, it is a maintenance nightmare. At 50 types, it is unmaintainable.

## The Fix

A lookup table maps an integer key to a value in O(1). If your entity types are sequential integers (0, 1, 2, 3...), the table is a plain array. \\\`char sprites[] = {'.', '*', 'E', 'P'}\\\`. Access: \\\`sprites[type]\\\`. One instruction. No branching.

When keys are strings, you use a function that maps names to values. This is still a lookup — the function encapsulates the mapping. The caller does not care whether the implementation is a switch, an array, or a hash map. It asks for a character and gets one.

## Your Task

1. Write \\\`char getSprite(int type)\\\` using an array lookup: index 0 = \\\`'.'\\\`, 1 = \\\`'*'\\\` (bullet), 2 = \\\`'E'\\\` (enemy), 3 = \\\`'P'\\\` (player), 4 = \\\`'+'\\\` (particle)
2. Write \\\`const char* getTypeName(int type)\\\` returning: 0 = "empty", 1 = "bullet", 2 = "enemy", 3 = "player", 4 = "particle"
3. Test all 5 mappings. Print: \\\`MAP|<type_int>|<name>|<sprite_char>\\\`
4. Show that adding a new type (5 = "powerup", \\\`'$'\\\`) requires only extending the arrays
5. Print: \\\`MAP|5|powerup|$\\\`
6. Print: \\\`LOOKUP|types|6|method|array\\\`

No switch statements. No if-else chains. Data drives the mapping.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Write getSprite(type) — array lookup returning char
//       0='.', 1='*', 2='E', 3='P', 4='+'

// TODO: Write getTypeName(type) — returns const char* name
//       0="empty", 1="bullet", 2="enemy", 3="player", 4="particle"

int main() {
    // TODO: Loop through types 0-4, print MAP|<type>|<name>|<char>

    // TODO: Extend to type 5 = "powerup" = '$'
    // TODO: Print MAP|5|powerup|$

    // TODO: Print LOOKUP|types|6|method|array

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

char spriteTable[] = {'.', '*', 'E', 'P', '+', '$'};
const char* nameTable[] = {"empty", "bullet", "enemy", "player", "particle", "powerup"};

char getSprite(int type) {
    if (type >= 0 && type < 6) return spriteTable[type];
    return '?';
}

const char* getTypeName(int type) {
    if (type >= 0 && type < 6) return nameTable[type];
    return "unknown";
}

int main() {
    for (int i = 0; i <= 4; i++) {
        cout << "MAP|" << i << "|" << getTypeName(i) << "|" << getSprite(i) << endl;
    }

    cout << "MAP|5|" << getTypeName(5) << "|" << getSprite(5) << endl;

    cout << "LOOKUP|types|6|method|array" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should map type 0 to empty and dot", expectedOutput: "MAP|0|empty|.", isPattern: false },
      { id: "t2", description: "Should map type 1 to bullet and asterisk", expectedOutput: "MAP|1|bullet|*", isPattern: false },
      { id: "t3", description: "Should map type 3 to player and P", expectedOutput: "MAP|3|player|P", isPattern: false },
      { id: "t4", description: "Should map type 5 to powerup and dollar", expectedOutput: "MAP|5|powerup|$", isPattern: false },
      { id: "t5", description: "Should report 6 types with array method", expectedOutput: "LOOKUP|types|6|method|array", isPattern: false },
    ],
    hints: [
      "Declare arrays at global scope: `char spriteTable[] = {'.', '*', 'E', 'P', '+', '$'};` — index matches type integer.",
      "getSprite just returns spriteTable[type] after a bounds check. getTypeName returns nameTable[type]. Both are O(1) lookups.",
      "Adding type 5 means adding one element to each array. No new switch cases, no new if-else branches. The function does not change.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Sprite Mapping System",
    type: "game_builder",
    instructions: `# Game Builder: Sprite Mapping System

Build a sprite mapping system that assigns unique ASCII characters to every entity type in your game. Render a scene with 7 different entity types, each with its own visual identity.

## Your Task
1. Define sprite map function: \\\`char getSprite(int type)\\\`
   - 0 = \\\`'.'\\\` (empty), 1 = \\\`'|'\\\` (bullet), 2 = \\\`'v'\\\` (basic enemy), 3 = \\\`'>'\\\` (fast enemy)
   - 4 = \\\`'#'\\\` (tank enemy), 5 = \\\`'W'\\\` (boss), 6 = \\\`'@'\\\` (player), 7 = \\\`'+'\\\` (particle)
2. Define name map: \\\`const char* getTypeName(int type)\\\`
3. Screen buffer: \\\`char grid[10][20]\\\`, clear with \\\`'.'\\\`
4. Create 7 entities (one of each type 1-7):
   - bullet at (180, 140), basic at (60, 20), fast at (140, 40)
   - tank at (40, 60), boss at (180, 20), player at (180, 160), particle at (100, 100)
5. Scale to grid (divide by 20), plot each with its mapped sprite
6. Print: \\\`SPRITE|<name>|<char>|at|<gridX>,<gridY>\\\` for each entity
7. Print grid as \\\`ROW|<y>|<20 characters>\\\`
8. Print: \\\`SPRITE_MAP|types|7|unique_chars|7\\\``,
    starterCode: `#include <iostream>
using namespace std;

const int WIDTH = 20;
const int HEIGHT = 10;

char grid[HEIGHT][WIDTH];

// TODO: Write getSprite(type) — lookup table for 8 types (0-7)
//       0='.', 1='|', 2='v', 3='>', 4='#', 5='W', 6='@', 7='+'

// TODO: Write getTypeName(type) — returns name string

// TODO: Write clearScreen() — fill grid with '.'

// TODO: Write plotEntity(x, y, ch) — bounds-checked grid write

int main() {
    // TODO: Define 7 entities with world positions and types
    // TODO: Clear screen, plot each entity with its sprite
    // TODO: Print SPRITE line for each entity
    // TODO: Print grid rows
    // TODO: Print SPRITE_MAP summary

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int WIDTH = 20;
const int HEIGHT = 10;

char grid[HEIGHT][WIDTH];

char spriteTable[] = {'.', '|', 'v', '>', '#', 'W', '@', '+'};
const char* nameTable[] = {"empty", "bullet", "basic", "fast", "tank", "boss", "player", "particle"};

char getSprite(int type) {
    if (type >= 0 && type < 8) return spriteTable[type];
    return '?';
}

const char* getTypeName(int type) {
    if (type >= 0 && type < 8) return nameTable[type];
    return "unknown";
}

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
    int worldX[] = {180, 60, 140, 40, 180, 180, 100};
    int worldY[] = {140, 20, 40, 60, 20, 160, 100};
    int types[] =  {1,   2,  3,   4,  5,   6,   7};

    clearScreen();

    for (int i = 0; i < 7; i++) {
        int gx = worldX[i] / 20;
        int gy = worldY[i] / 20;
        char ch = getSprite(types[i]);
        plotEntity(gx, gy, ch);
        cout << "SPRITE|" << getTypeName(types[i]) << "|" << ch << "|at|" << gx << "," << gy << endl;
    }

    for (int r = 0; r < HEIGHT; r++) {
        cout << "ROW|" << r << "|";
        for (int c = 0; c < WIDTH; c++) {
            cout << grid[r][c];
        }
        cout << endl;
    }

    cout << "SPRITE_MAP|types|7|unique_chars|7" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should map bullet sprite", expectedOutput: "SPRITE\\|bullet\\|\\|\\|at\\|9,7", isPattern: true },
      { id: "t2", description: "Should map boss sprite", expectedOutput: "SPRITE\\|boss\\|W\\|at\\|9,1", isPattern: true },
      { id: "t3", description: "Should map player sprite", expectedOutput: "SPRITE\\|player\\|@\\|at\\|9,8", isPattern: true },
      { id: "t4", description: "Grid should show boss W in row 1", expectedOutput: "ROW\\|1\\|.........W..........", isPattern: true },
      { id: "t5", description: "Grid should show player @ in row 8", expectedOutput: "ROW\\|8\\|.........@..........", isPattern: true },
      { id: "t6", description: "Should report 7 types with 7 unique chars", expectedOutput: "SPRITE_MAP\\|types\\|7\\|unique_chars\\|7", isPattern: true },
    ],
    hints: [
      "Sprite table: index 0='.', 1='|', 2='v', 3='>', 4='#', 5='W', 6='@', 7='+'. getSprite returns spriteTable[type] after bounds check.",
      "World-to-grid: divide by 20. Bullet (180,140) -> grid (9,7). Boss (180,20) -> grid (9,1). Player (180,160) -> grid (9,8).",
      "Print SPRITE lines before the grid. Loop through all 7 entities, get their sprite and grid position, output the SPRITE line, then plot to grid.",
    ],
    estimatedMinutes: 10,
  },
};
