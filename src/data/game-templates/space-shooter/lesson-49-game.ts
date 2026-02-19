import type { GameLessonVariant } from "@/types/game";

export const lesson49SpaceShooter: GameLessonVariant = {
  lessonId: "49-camera-screen-space",
  instructions: `# Camera and Screen Space — The World Is Bigger Than the Screen

Your game world extends beyond the visible area. Enemies spawn off-screen. Bullets fly past the viewport edge. The player moves through a space larger than what the terminal can show. Without a camera, you either cram everything into 20 columns or entities teleport between visible and invisible with no logic.

## What Breaks Without This

Without coordinate transforms, you cannot have a scrolling game. Every entity must fit within screen bounds. Large levels are impossible. Boss arenas, exploration, cinematic pans — all require the camera to move independently of the screen. Rendering breaks because world positions do not map to valid screen positions.

## The Fix

Two coordinate spaces with a deterministic transform. World space is where entities live (0-400 x, 0-600 y). Screen space is where they render (20 columns x 10 rows). The camera defines the visible slice. \\\`worldToScreen\\\` converts: \\\`sx = (wx - camX) * SCREEN_W / VIEW_W\\\`. Entities outside [0, SCREEN_W) get clipped. The camera follows the player each frame: \\\`camX = playerX - VIEW_W/2\\\`.

The grid is a 2D char array. Fill with dots. Place visible entities as digits. Place the player as \\\`P\\\`. Print row by row. This is the render system — it only cares about screen coordinates.

## Your Task

1. World space: 400 x 600. Screen: 20 x 10 chars. View: 200 x 100 world units
2. Player at world (180, 300). Camera centers on player
3. Place 5 enemies: (100,260), (250,310), (180,280), (50,200), (350,350)
4. Camera: camX = playerX - VIEW_W/2, camY = playerY - VIEW_H/2
5. Transform each entity: sx = (wx - camX) * SCREEN_W / VIEW_W
6. Print: \\\`CAMERA|pos|<cx>,<cy>|view|20x10\\\`
7. Print: \\\`WORLD_TO_SCREEN|<name>|world|<wx>,<wy>|screen|<sx>,<sy>\\\`
8. Build 10x20 grid, place visible entities as digits (0-4), player as P
9. Print grid (10 rows)
10. Print: \\\`VIEWPORT|visible|<n>|clipped|<n>|total|5\\\`

## Beginner Trap

**Common Mistake:** Swapping rows and columns in the grid array. \\\`grid[row][col]\\\` means \\\`grid[sy][sx]\\\`. If you write \\\`grid[sx][sy]\\\`, the x-axis becomes vertical and the y-axis becomes horizontal. Your entire render is rotated 90 degrees.

## Elite Insight

GPU rendering does the same transform with projection matrices. A 4x4 matrix converts world coordinates to clip space, then the viewport transform maps to pixel coordinates. Your integer formula — \\\`(wx - camX) * screenW / viewW\\\` — is the 2D equivalent of matrix-vector multiplication. The concept scales from terminal to OpenGL.

## Cross-Path Echo

Map applications do the same math. GPS gives world coordinates (latitude, longitude). The viewport is your phone screen. Pinch-to-zoom changes the view dimensions. Pan changes the camera position. Every pixel on screen is a transformed world coordinate. Google Maps is a camera system with tile-based rendering.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int SCREEN_W = 20;
const int SCREEN_H = 10;
const int VIEW_W = 200;
const int VIEW_H = 100;

// TODO: Write worldToScreenX(wx, camX)
//       returns (wx - camX) * SCREEN_W / VIEW_W

// TODO: Write worldToScreenY(wy, camY)
//       returns (wy - camY) * SCREEN_H / VIEW_H

int main() {
    int playerX = 180;
    int playerY = 300;

    // TODO: Compute camera position centered on player

    // Enemy world positions
    int ewx[] = {100, 250, 180, 50, 350};
    int ewy[] = {260, 310, 280, 200, 350};
    string enames[] = {"enemy_0", "enemy_1", "enemy_2", "enemy_3", "enemy_4"};
    int enemyCount = 5;

    // TODO: Print CAMERA line
    // TODO: Transform each enemy, print WORLD_TO_SCREEN
    // TODO: Build and print 10x20 grid with visible entities
    // TODO: Print VIEWPORT summary

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int SCREEN_W = 20;
const int SCREEN_H = 10;
const int VIEW_W = 200;
const int VIEW_H = 100;

int worldToScreenX(int wx, int camX) {
    return (wx - camX) * SCREEN_W / VIEW_W;
}

int worldToScreenY(int wy, int camY) {
    return (wy - camY) * SCREEN_H / VIEW_H;
}

int main() {
    int playerX = 180;
    int playerY = 300;

    int camX = playerX - VIEW_W / 2;
    int camY = playerY - VIEW_H / 2;

    int ewx[] = {100, 250, 180, 50, 350};
    int ewy[] = {260, 310, 280, 200, 350};
    string enames[] = {"enemy_0", "enemy_1", "enemy_2", "enemy_3", "enemy_4"};
    int enemyCount = 5;

    cout << "CAMERA|pos|" << camX << "," << camY << "|view|20x10" << endl;

    char grid[SCREEN_H][SCREEN_W];
    for (int r = 0; r < SCREEN_H; r++)
        for (int c = 0; c < SCREEN_W; c++)
            grid[r][c] = '.';

    int visible = 0;
    int clipped = 0;

    for (int i = 0; i < enemyCount; i++) {
        int sx = worldToScreenX(ewx[i], camX);
        int sy = worldToScreenY(ewy[i], camY);
        cout << "WORLD_TO_SCREEN|" << enames[i] << "|world|" << ewx[i] << "," << ewy[i]
             << "|screen|" << sx << "," << sy << endl;
        if (sx >= 0 && sx < SCREEN_W && sy >= 0 && sy < SCREEN_H) {
            grid[sy][sx] = '0' + i;
            visible++;
        } else {
            clipped++;
        }
    }

    int psx = worldToScreenX(playerX, camX);
    int psy = worldToScreenY(playerY, camY);
    if (psx >= 0 && psx < SCREEN_W && psy >= 0 && psy < SCREEN_H) {
        grid[psy][psx] = 'P';
    }

    for (int r = 0; r < SCREEN_H; r++) {
        for (int c = 0; c < SCREEN_W; c++) {
            cout << grid[r][c];
        }
        cout << endl;
    }

    cout << "VIEWPORT|visible|" << visible << "|clipped|" << clipped
         << "|total|" << enemyCount << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Camera centered on player", expectedOutput: "CAMERA\\|pos\\|80,250\\|view\\|20x10", isPattern: true },
    { id: "g2", description: "Enemy 0 transformed to screen space", expectedOutput: "WORLD_TO_SCREEN\\|enemy_0\\|world\\|100,260\\|screen\\|\\d+,\\d+", isPattern: true },
    { id: "g3", description: "Enemy positions transformed correctly", expectedOutput: "WORLD_TO_SCREEN\\|enemy_\\d+\\|world\\|\\d+,\\d+\\|screen\\|-?\\d+,-?\\d+", isPattern: true },
    { id: "g4", description: "Grid contains player marker", expectedOutput: "P", isPattern: true },
    { id: "g5", description: "Viewport summary with visible and clipped", expectedOutput: "VIEWPORT\\|visible\\|\\d+\\|clipped\\|\\d+\\|total\\|5", isPattern: true },
  ],
  hints: [
    "Camera: camX = 180 - 100 = 80, camY = 300 - 50 = 250. The camera shows world area from (80,250) to (280,350).",
    "Enemy 3 at world(50,200): sx = (50-80)*20/200 = -3. Off-screen left. Enemy 4 at world(350,350): sx = (350-80)*20/200 = 27. Off-screen right. Both clipped.",
    "Player at world(180,300): sx = (180-80)*20/200 = 10, sy = (300-250)*10/100 = 5. Place 'P' at grid[5][10].",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 600;
const int FIXED_DT = 16;
const int SCREEN_W = 20;
const int SCREEN_H = 10;
const int VIEW_W = 200;
const int VIEW_H = 100;

int x[POOL_SIZE];
int y[POOL_SIZE];
int vx[POOL_SIZE];
int vy[POOL_SIZE];
int hp[POOL_SIZE];
int type[POOL_SIZE];
bool alive[POOL_SIZE];

int freeList[POOL_SIZE];
int freeCount = POOL_SIZE;

enum Action { NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE };

Action mapInput(char c) {
    switch (c) {
        case 'w': return MOVE_UP;
        case 's': return MOVE_DOWN;
        case 'a': return MOVE_LEFT;
        case 'd': return MOVE_RIGHT;
        case ' ': return FIRE;
        default: return NONE;
    }
}

int spawnFromPool(int px, int py, int vel, int ehp, int etype) {
    if (freeCount <= 0) return -1;
    freeCount--;
    int idx = freeList[freeCount];
    x[idx] = px;
    y[idx] = py;
    vx[idx] = 0;
    vy[idx] = vel;
    hp[idx] = ehp;
    type[idx] = etype;
    alive[idx] = true;
    return idx;
}

void returnToPool(int idx) {
    alive[idx] = false;
    freeList[freeCount] = idx;
    freeCount++;
}

void movementSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
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
        if (type[i] == 1 && y[i] < 0) alive[i] = false;
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

void cleanupSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (alive[i] && hp[i] <= 0) alive[i] = false;
    }
}

int countByType(int count, int typeVal) {
    int c = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i] && type[i] == typeVal) c++;
    }
    return c;
}

int worldToScreenX(int wx, int camX) {
    return (wx - camX) * SCREEN_W / VIEW_W;
}

int worldToScreenY(int wy, int camY) {
    return (wy - camY) * SCREEN_H / VIEW_H;
}

void processInput(string inputs, int playerIdx) {
    for (int i = 0; i < (int)inputs.size(); i++) {
        Action a = mapInput(inputs[i]);
        if (a == MOVE_UP) y[playerIdx] -= 4;
        else if (a == MOVE_DOWN) y[playerIdx] += 4;
        else if (a == MOVE_LEFT) x[playerIdx] -= 4;
        else if (a == MOVE_RIGHT) x[playerIdx] += 4;
        else if (a == FIRE) {
            spawnFromPool(x[playerIdx], y[playerIdx], -16, 1, 1);
        }
    }
}

void renderSystem(int count, int camX, int camY) {
    char grid[SCREEN_H][SCREEN_W];
    for (int r = 0; r < SCREEN_H; r++)
        for (int c = 0; c < SCREEN_W; c++)
            grid[r][c] = '.';

    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        int sx = worldToScreenX(x[i], camX);
        int sy = worldToScreenY(y[i], camY);
        if (sx >= 0 && sx < SCREEN_W && sy >= 0 && sy < SCREEN_H) {
            if (type[i] == 0) grid[sy][sx] = 'P';
            else if (type[i] == 1) grid[sy][sx] = '|';
            else if (type[i] == 2) grid[sy][sx] = 'V';
        }
    }

    for (int r = 0; r < SCREEN_H; r++) {
        for (int c = 0; c < SCREEN_W; c++) cout << grid[r][c];
        cout << endl;
    }
}

int main() {
    for (int i = 0; i < POOL_SIZE; i++) {
        freeList[i] = i;
        alive[i] = false;
    }

    int playerIdx = spawnFromPool(180, 300, 0, 100, 0);
    int count = 1;

    for (int i = 0; i < 5; i++) {
        spawnFromPool(80 + i * 40, 60, 4, 3, 2);
        count++;
    }

    for (int i = 0; i < 5; i++) {
        spawnFromPool(200, 300 - i * 4, -16, 1, 1);
        count++;
    }

    string inputBuffer = "wwd  w d";
    processInput(inputBuffer, playerIdx);

    int accumulator = 0;
    int totalSteps = 0;
    int frameTimes[] = {16, 32, 16};

    for (int f = 0; f < 3; f++) {
        accumulator += frameTimes[f];
        int stepsThisFrame = 0;
        while (accumulator >= FIXED_DT) {
            movementSystem(count);
            formationSystem(count, totalSteps + 1);
            boundsSystem(count);
            collisionSystem(count);
            cleanupSystem(count);
            accumulator -= FIXED_DT;
            stepsThisFrame++;
            totalSteps++;
        }

        int camX = x[playerIdx] - VIEW_W / 2;
        int camY = y[playerIdx] - VIEW_H / 2;
        renderSystem(count, camX, camY);

        int bullets = countByType(count, 1);
        int enemies = countByType(count, 2);
        cout << "FRAME|" << (f + 1) << "|steps|" << stepsThisFrame
             << "|bullets|" << bullets << "|enemies|" << enemies << endl;
    }

    cout << "PIPELINE|input|spawn|movement|formation|bounds|collision|cleanup|camera|render" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
