import type { GameLessonVariant } from "@/types/game";

export const lesson46SpaceShooter: GameLessonVariant = {
  lessonId: "46-render-protocol",
  instructions: `# Render Protocol — Numbers Are Not Debugging

You have been flying blind. Entities spawn, move, collide, die — and all you see is pipe-delimited text. That changes now. A render system reads entity positions and writes them into a visual buffer. In production engines, that buffer holds millions of pixels. Here, it holds 200 characters. The architecture is the same: clear, plot, present.

## What Breaks Without This

Without visual output, spatial bugs are invisible. Two entities at (118,62) and (120,60) — are they colliding? You cannot tell from numbers. But plot them on a grid and the overlap is obvious. Rendering is not a feature. It is the most powerful debugging tool you have. Every commercial engine has a debug render mode for exactly this reason.

## The Fix

A screen buffer is a 2D char array. \\\`char grid[HEIGHT][WIDTH]\\\`. The render pipeline has three steps. \\\`clearScreen()\\\` fills every cell with \\\`'.'\\\`. \\\`plotEntity()\\\` writes a character at a grid position after bounds-checking. The presentation loop prints each row as a string. That is the entire render system.

World coordinates and grid coordinates are different scales. Your game world might be 400x200 pixels. Your grid is 20x10 characters. Dividing world position by 20 maps pixels to grid cells. This lossy projection is the same principle as screen resolution — you are mapping a continuous space to a discrete grid.

## Your Task

1. Screen buffer: \\\`char grid[10][20]\\\` (HEIGHT=10, WIDTH=20)
2. \\\`clearScreen()\\\` fills every cell with \\\`'.'\\\`
3. \\\`plotEntity(x, y, ch)\\\` writes character at grid[y][x] after bounds check
4. Define 3 entities with world positions: player at (190, 160), enemy at (90, 20), bullet at (190, 100)
5. Scale world to grid: \\\`gridX = worldX / 20\\\`, \\\`gridY = worldY / 20\\\`
6. Map characters: player = \\\`'P'\\\`, enemy = \\\`'E'\\\`, bullet = \\\`'*'\\\`
7. Clear screen, plot all 3 entities onto the grid
8. Print each row: \\\`ROW|<y>|<20 characters>\\\`
9. Print: \\\`RENDER|entities_drawn|3|grid_size|20x10\\\`

This is the first time you see your game. The player is at the bottom. The enemy is at the top. The bullet is in between. The spatial relationships that were invisible in numbers are now obvious at a glance.

## Beginner Trap

**Common Mistake:** Swapping x and y when indexing the grid. Arrays are row-major: \\\`grid[row][col]\\\` means \\\`grid[y][x]\\\`, not \\\`grid[x][y]\\\`. If your entities appear transposed, you have the indices backwards. This is the single most common 2D rendering bug.

## Elite Insight

Every GPU framebuffer works this way. \\\`glClear()\\\` is your \\\`clearScreen()\\\`. Fragment shaders are your \\\`plotEntity()\\\`. \\\`SwapBuffers()\\\` is your print loop. The abstraction layers change but the pipeline does not: clear the buffer, write pixels, present the frame. ASCII rendering teaches the same mental model that scales to Vulkan.

## Cross-Path Echo

Terminal User Interfaces (TUIs) like htop, vim, and tmux use the same character grid approach. ncurses provides \\\`mvaddch(y, x, ch)\\\` — the same function signature as your plotEntity. The terminal is a character framebuffer. You are writing a game engine for it.`,
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
    { id: "g1", description: "Row 0 should be all dots", expectedOutput: "ROW\\|0\\|\\.{20}", isPattern: true },
    { id: "g2", description: "Row 1 should show enemy E at grid column 4", expectedOutput: "ROW\\|1\\|....E...............", isPattern: true },
    { id: "g3", description: "Row 5 should show bullet at grid column 9", expectedOutput: "ROW\\|5\\|.........\\*...........", isPattern: true },
    { id: "g4", description: "Row 8 should show player P at grid column 9", expectedOutput: "ROW\\|8\\|.........P..........", isPattern: true },
    { id: "g5", description: "Should report 3 entities drawn on 20x10 grid", expectedOutput: "RENDER\\|entities_drawn\\|3\\|grid_size\\|20x10", isPattern: true },
  ],
  hints: [
    "clearScreen fills every cell with '.'. plotEntity checks x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT before writing grid[y][x] = ch.",
    "World-to-grid scaling: player (190,160) -> grid (9,8). Enemy (90,20) -> grid (4,1). Bullet (190,100) -> grid (9,5). Integer division truncates.",
    "Print each row by iterating grid[r][0] through grid[r][WIDTH-1]. Output characters directly with no spaces between them.",
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

void spawnEnemy(int idx, int px, int py) {
    x[idx] = px;
    y[idx] = py;
    vx[idx] = 0;
    vy[idx] = 4;
    hp[idx] = 3;
    type[idx] = 2;
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
        if (!alive[i] || type[i] != 2) continue;
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
            if (!alive[e] || type[e] != 2) continue;
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
        char ch = '.';
        if (type[i] == 1) ch = '*';
        if (type[i] == 2) ch = 'E';
        plotEntity(gx, gy, ch);
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
    int ex[] = {40, 80, 120, 160, 200};
    for (int i = 0; i < 5; i++) {
        spawnEnemy(count, ex[i], 20);
        count++;
    }
    int bx[] = {120, 160, 200};
    for (int i = 0; i < 3; i++) {
        spawnBullet(count, bx[i], 280);
        count++;
    }

    for (int frame = 1; frame <= 3; frame++) {
        movementSystem(count);
        collisionSystem(count);
        damageSystem(count);
        cleanupSystem(count);
        int rendered = renderSystem(count);

        for (int r = 0; r < SCREEN_H; r++) {
            cout << "ROW|" << r << "|";
            for (int c = 0; c < SCREEN_W; c++) {
                cout << grid[r][c];
            }
            cout << endl;
        }
        cout << "RENDER|frame|" << frame << "|entities_drawn|" << rendered
             << "|grid_size|" << SCREEN_W << "x" << SCREEN_H << endl;
    }
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
