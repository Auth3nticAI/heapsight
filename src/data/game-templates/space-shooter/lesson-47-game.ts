import type { GameLessonVariant } from "@/types/game";

export const lesson47SpaceShooter: GameLessonVariant = {
  lessonId: "47-sprite-mapping",
  instructions: `# Sprite Mapping — One Lookup Replaces a Hundred Conditionals

Every entity type needs a unique visual. Without a mapping system, you write if-else chains that grow with every new type. One type, one branch. Twenty types, twenty branches. A lookup table replaces all of them with a single array access. The sprite table is data. Data scales. Logic does not.

## What Breaks Without This

You add a new enemy type. You forget to update the render switch. The new enemy renders as a dot — invisible. The player cannot see it. They take damage from an entity they cannot see. Bug report: "I died for no reason." Root cause: a missing case in a switch statement. A lookup table makes this impossible. If the type has an index, it has a sprite. No case to forget.

## The Fix

\\\`char spriteTable[] = {'.', '|', 'v', '>', '#', 'W', '@', '+'}\\\`. Index 0 is empty. Index 1 is bullet. Index 6 is player. \\\`getSprite(type)\\\` returns \\\`spriteTable[type]\\\` in one instruction. No branching. No switch. No risk of a missing case.

The name table works the same way. \\\`const char* nameTable[] = {"empty", "bullet", "basic", "fast", "tank", "boss", "player", "particle"}\\\`. One array per attribute. This is the same SoA principle applied to metadata. Type index is the universal key across all tables.

When you render, you iterate entities, get \\\`getSprite(type[i])\\\`, and plot it on the grid. The render system does not know what a boss looks like. It does not know what a bullet looks like. It asks the sprite table. The table answers. This decoupling means you can change every visual in the game by editing one array.

## Your Task

1. Sprite map function \\\`getSprite(type)\\\`: 0=\\\`'.'\\\`, 1=\\\`'|'\\\` (bullet), 2=\\\`'v'\\\` (basic), 3=\\\`'>'\\\` (fast), 4=\\\`'#'\\\` (tank), 5=\\\`'W'\\\` (boss), 6=\\\`'@'\\\` (player), 7=\\\`'+'\\\` (particle)
2. Name map \\\`getTypeName(type)\\\`: returns string name for each type
3. Screen buffer: \\\`char grid[10][20]\\\`, cleared with \\\`'.'\\\`
4. Create 7 entities (one per active type 1-7):
   - bullet at world (180, 140), basic at (60, 20), fast at (140, 40)
   - tank at (40, 60), boss at (180, 20), player at (180, 160), particle at (100, 100)
5. Scale to grid (worldPos / 20), plot each with its mapped sprite
6. Print per entity: \\\`SPRITE|<name>|<char>|at|<gridX>,<gridY>\\\`
7. Print grid: \\\`ROW|<y>|<20 characters>\\\`
8. Print: \\\`SPRITE_MAP|types|7|unique_chars|7\\\`

Seven entity types. Seven unique characters. One lookup table. Zero conditionals in the render path.

## Beginner Trap

**Common Mistake:** Using the same character for multiple entity types. If basic and fast enemies both render as \\\`'E'\\\`, you cannot visually distinguish them during gameplay. Each type must have a unique sprite character. The lookup table enforces this — if two entries share a character, you see the conflict in the data immediately.

## Elite Insight

This is a texture atlas in miniature. AAA engines map entity types to sprite sheet coordinates using the same lookup pattern. The table maps an integer ID to rendering data — here it is a char, in Unreal it is a material instance, in Unity it is a Sprite reference. The architecture is identical. Data-driven rendering scales from ASCII to 4K.

## Cross-Path Echo

HTTP status codes are a lookup table. 200 maps to "OK". 404 maps to "Not Found". The server does not use a switch statement for 50+ status codes — it uses a table. DNS is a lookup table. IP routing is a lookup table. The pattern appears everywhere because O(1) access to keyed data is a fundamental building block.`,
  starterCode: `#include <iostream>
using namespace std;

const int WIDTH = 20;
const int HEIGHT = 10;

char grid[HEIGHT][WIDTH];

// TODO: Write getSprite(type) — lookup table for 8 types (0-7)
//       0='.', 1='|', 2='v', 3='>', 4='#', 5='W', 6='@', 7='+'

// TODO: Write getTypeName(type) — returns const char* name for each type

// TODO: Write clearScreen() — fill grid with '.'

// TODO: Write plotEntity(x, y, ch) — bounds-checked write to grid[y][x]

int main() {
    // TODO: Define 7 entities with world positions and types
    //       bullet(180,140), basic(60,20), fast(140,40), tank(40,60)
    //       boss(180,20), player(180,160), particle(100,100)

    // TODO: Clear screen
    // TODO: For each entity: scale to grid, get sprite, plot, print SPRITE line
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
    { id: "g1", description: "Should map bullet to pipe character", expectedOutput: "SPRITE\\|bullet\\|\\|\\|at\\|9,7", isPattern: true },
    { id: "g2", description: "Should map boss to W character", expectedOutput: "SPRITE\\|boss\\|W\\|at\\|9,1", isPattern: true },
    { id: "g3", description: "Should map player to @ character", expectedOutput: "SPRITE\\|player\\|@\\|at\\|9,8", isPattern: true },
    { id: "g4", description: "Grid row 1 should show boss W", expectedOutput: "ROW\\|1\\|.........W..........", isPattern: true },
    { id: "g5", description: "Grid row 8 should show player @", expectedOutput: "ROW\\|8\\|.........@..........", isPattern: true },
    { id: "g6", description: "Should report 7 types with 7 unique chars", expectedOutput: "SPRITE_MAP\\|types\\|7\\|unique_chars\\|7", isPattern: true },
  ],
  hints: [
    "Define spriteTable as a char array: {'.', '|', 'v', '>', '#', 'W', '@', '+'}. getSprite returns spriteTable[type] with a bounds check.",
    "World-to-grid mapping: divide world coordinates by 20. Bullet (180,140) becomes grid (9,7). Boss (180,20) becomes (9,1). Player (180,160) becomes (9,8).",
    "Print SPRITE lines during the entity loop, before printing the grid. Plot each entity to the grid in the same loop to avoid iterating twice.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 600;
const int FIXED_DT = 16;
const int SCREEN_W = 20;
const int SCREEN_H = 10;

int x[POOL_SIZE];
int y[POOL_SIZE];
int vx[POOL_SIZE];
int vy[POOL_SIZE];
int hp[POOL_SIZE];
int type[POOL_SIZE];
bool alive[POOL_SIZE];

char grid[SCREEN_H][SCREEN_W];

// Sprite mapping tables
char spriteTable[] = {'.', '|', 'v', '>', '#', 'W', '@', '+'};
const char* nameTable[] = {"empty", "bullet", "basic", "fast", "tank", "boss", "player", "particle"};

char getSprite(int t) {
    if (t >= 0 && t < 8) return spriteTable[t];
    return '?';
}

const char* getTypeName(int t) {
    if (t >= 0 && t < 8) return nameTable[t];
    return "unknown";
}

void clearScreen() {
    for (int r = 0; r < SCREEN_H; r++) {
        for (int c = 0; c < SCREEN_W; c++) {
            grid[r][c] = '.';
        }
    }
}

void plotEntity(int px, int py, char ch) {
    if (px >= 0 && px < SCREEN_W && py >= 0 && py < SCREEN_H) {
        grid[py][px] = ch;
    }
}

void spawnEnemy(int idx, int px, int py, int etype) {
    x[idx] = px;
    y[idx] = py;
    vx[idx] = 0;
    vy[idx] = 4;
    hp[idx] = 3;
    type[idx] = etype;
    alive[idx] = true;
}

void spawnBullet(int idx, int px, int py) {
    x[idx] = px;
    y[idx] = py;
    vx[idx] = 0;
    vy[idx] = -16;
    hp[idx] = 1;
    type[idx] = 1;
    alive[idx] = true;
}

int movementSystem(int count) {
    int moved = 0;
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        x[i] += vx[i];
        y[i] += vy[i];
        moved++;
    }
    return moved;
}

void formationSystem(int count, int step) {
    int offsets[] = {0, 10, 0, -10, 0};
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] < 2 || type[i] > 5) continue;
        x[i] += offsets[(i + step) % 5];
    }
}

void boundsSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (type[i] == 1 && y[i] < 0) {
            alive[i] = false;
        }
    }
}

int collisionSystem(int count) {
    int checks = 0;
    for (int b = 0; b < count; b++) {
        if (!alive[b] || type[b] != 1) continue;
        for (int e = 0; e < count; e++) {
            if (!alive[e] || type[e] < 2 || type[e] > 5) continue;
            checks++;
            bool overlapX = x[b] < x[e] + 18 && x[b] + 6 > x[e];
            bool overlapY = y[b] < y[e] + 18 && y[b] + 6 > y[e];
            if (overlapX && overlapY) {
                hp[b] = 0;
                hp[e]--;
                break;
            }
        }
    }
    return checks;
}

int damageSystem(int count) {
    int damaged = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i] && hp[i] <= 0) {
            alive[i] = false;
            damaged++;
        }
    }
    return damaged;
}

int cleanupSystem(int count) {
    int cleaned = 0;
    for (int i = 0; i < count; i++) {
        if (!alive[i] && type[i] != 0) {
            type[i] = 0;
            cleaned++;
        }
    }
    return cleaned;
}

int renderSystem(int count) {
    clearScreen();
    int rendered = 0;
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        int gx = x[i] / 20;
        int gy = y[i] / 20;
        plotEntity(gx, gy, getSprite(type[i]));
        rendered++;
    }
    return rendered;
}

int countByType(int count, int typeVal) {
    int c = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i] && type[i] == typeVal) c++;
    }
    return c;
}

int main() {
    int count = 0;

    // Spawn enemies with different types
    spawnEnemy(count, 60, 20, 2);  count++;  // basic
    spawnEnemy(count, 140, 40, 3); count++;  // fast
    spawnEnemy(count, 40, 60, 4);  count++;  // tank
    spawnEnemy(count, 180, 20, 5); count++;  // boss

    // Spawn player entity
    x[count] = 180; y[count] = 160; vx[count] = 0; vy[count] = 0;
    hp[count] = 10; type[count] = 6; alive[count] = true;
    count++;

    // Spawn bullets
    spawnBullet(count, 180, 140); count++;

    // Spawn particle
    x[count] = 100; y[count] = 100; vx[count] = 0; vy[count] = 0;
    hp[count] = 1; type[count] = 7; alive[count] = true;
    count++;

    // Render one frame
    int rendered = renderSystem(count);
    for (int r = 0; r < SCREEN_H; r++) {
        cout << "ROW|" << r << "|";
        for (int c = 0; c < SCREEN_W; c++) {
            cout << grid[r][c];
        }
        cout << endl;
    }

    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        int gx = x[i] / 20;
        int gy = y[i] / 20;
        cout << "SPRITE|" << getTypeName(type[i]) << "|" << getSprite(type[i])
             << "|at|" << gx << "," << gy << endl;
    }

    cout << "SPRITE_MAP|types|7|unique_chars|7" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
