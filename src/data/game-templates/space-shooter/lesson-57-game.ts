import type { GameLessonVariant } from "@/types/game";

export const lesson57SpaceShooter: GameLessonVariant = {
  lessonId: "57-spatial-hash",
  instructions: `# Spatial Hash Grid — Grid-Accelerated Collision for Your Space Shooter

Your collision system checks every bullet against every enemy. With 20 entities, that is 190 pair tests. Most are pointless — a bullet at the top of the screen cannot hit an enemy at the bottom. A spatial hash grid eliminates these wasted checks by partitioning the world into cells and only testing pairs within the same cell.

## What Breaks Without This

Without spatial partitioning, your space shooter slows down as entities increase. 50 entities means 1225 pairs. 100 means 4950. The game gets more interesting and simultaneously slower. That is a death spiral.

## The Fix

Divide the 400x400 world into a 4x4 grid. Cell size = 100. Hash each entity to its cell: \\\`cellIdx = (y/100) * 4 + (x/100)\\\`. Insert all entities. For collision, only check pairs sharing a cell. The narrow phase runs on a fraction of the total pairs.

\\\`\\\`\\\`
clearGrid()
for each entity: insertEntity(hash(x,y))
for each cell with 2+ entities:
  for each pair in cell:
    if bullet vs enemy: narrowPhase()
\\\`\\\`\\\`

## Your Task

1. 4x4 grid, cell size 100, 400x400 world
2. 20 entities spread across the grid (mix of bullets and enemies)
3. Hash all entities into grid cells
4. Print HASH for entity 5: \\\`HASH|entity_5|pos|<x>,<y>|cell|<cx>,<cy>|idx|<i>\\\`
5. Print CELL stats for cell index 10: \\\`CELL|idx|10|count|<n>|pairs_to_test|<p>\\\`
6. Run spatial collision (bullet vs enemy, |dx|<20 && |dy|<20)
7. Print: \\\`SPATIAL_STATS|entities|20|cells_used|<c>|total_pairs|<p>|bruteforce_pairs|190\\\`
8. Print: \\\`COLLISIONS|hits|<h>|cells_checked|<c>|pairs_tested|<p>\\\`

## Beginner Trap

**Common Mistake:** Not clearing the grid before insertion. The grid is rebuilt every frame. If you skip clearGrid(), entities accumulate from previous frames and collision produces garbage results.

## Elite Insight

Quake's spatial partitioning was a uniform grid. Not a quadtree, not a BSP for moving entities. A flat, cache-friendly grid. The simplest structure that solves the problem is almost always the fastest. Fancy data structures impress at conferences. Flat arrays ship games.

## Cross-Path Echo

Database sharding partitions rows across servers by key range. A spatial hash partitions entities across cells by position. Both reduce the search space from "everything" to "nearby." Both trade a small insertion cost for massive query savings.`,
  starterCode: `#include <iostream>
using namespace std;

const int MAX_ENTITIES = 30;
const int GRID_W = 4;
const int GRID_H = 4;
const int CELL_SIZE = 100;
const int MAX_PER_CELL = 10;

int ex[MAX_ENTITIES], ey[MAX_ENTITIES];
int etype[MAX_ENTITIES];
bool ealive[MAX_ENTITIES];
int entityCount = 0;

int grid[GRID_W * GRID_H][MAX_PER_CELL];
int gridCount[GRID_W * GRID_H];

// TODO: Write hashPosition(x, y) — returns (y/CELL_SIZE)*GRID_W + (x/CELL_SIZE)

// TODO: Write clearGrid() — zero all gridCount entries

// TODO: Write insertAll() — insert each alive entity into its cell

// TODO: Write spatialCollision() — for each cell, test bullet vs enemy pairs
//       Hit if |dx|<20 && |dy|<20. Track hits and pairs tested.

int main() {
    // TODO: Spawn 20 entities at positions spread across the grid
    //       Mix of type=1 (bullets) and type=2 (enemies)

    // TODO: Clear grid, insert all, print HASH for entity 5

    // TODO: Print CELL stats for occupied cells

    // TODO: Run spatialCollision, print SPATIAL_STATS and COLLISIONS

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

const int MAX_ENTITIES = 30;
const int GRID_W = 4;
const int GRID_H = 4;
const int CELL_SIZE = 100;
const int MAX_PER_CELL = 10;

int ex[MAX_ENTITIES], ey[MAX_ENTITIES];
int etype[MAX_ENTITIES];
bool ealive[MAX_ENTITIES];
int entityCount = 0;

int grid[GRID_W * GRID_H][MAX_PER_CELL];
int gridCount[GRID_W * GRID_H];

int hashPosition(int x, int y) {
    int cx = x / CELL_SIZE;
    int cy = y / CELL_SIZE;
    return cy * GRID_W + cx;
}

void clearGrid() {
    for (int i = 0; i < GRID_W * GRID_H; i++) {
        gridCount[i] = 0;
    }
}

void insertAll() {
    for (int i = 0; i < entityCount; i++) {
        if (!ealive[i]) continue;
        int idx = hashPosition(ex[i], ey[i]);
        grid[idx][gridCount[idx]] = i;
        gridCount[idx]++;
    }
}

int main() {
    // 20 entities: 8 bullets (type=1), 12 enemies (type=2)
    int positions[][2] = {
        {50,50}, {80,30}, {150,50}, {250,250},
        {270,280}, {290,260}, {350,150}, {370,170},
        {60,70}, {160,160}, {250,50}, {340,340},
        {55,55}, {155,155}, {260,270}, {345,155},
        {85,40}, {165,55}, {275,265}, {355,345}
    };
    int types[] = {1,2,1,2, 1,2,1,2, 2,1,2,1, 1,2,1,2, 2,1,2,1};

    entityCount = 20;
    for (int i = 0; i < entityCount; i++) {
        ex[i] = positions[i][0];
        ey[i] = positions[i][1];
        etype[i] = types[i];
        ealive[i] = true;
    }

    clearGrid();
    insertAll();

    // Print HASH for entity 5
    int cx5 = ex[5] / CELL_SIZE;
    int cy5 = ey[5] / CELL_SIZE;
    int idx5 = hashPosition(ex[5], ey[5]);
    cout << "HASH|entity_5|pos|" << ex[5] << "," << ey[5]
         << "|cell|" << cx5 << "," << cy5 << "|idx|" << idx5 << endl;

    // Print CELL stats
    int totalPairs = 0;
    int cellsUsed = 0;

    for (int i = 0; i < GRID_W * GRID_H; i++) {
        if (gridCount[i] > 0) {
            int pairs = gridCount[i] * (gridCount[i] - 1) / 2;
            cout << "CELL|idx|" << i << "|count|" << gridCount[i]
                 << "|pairs_to_test|" << pairs << endl;
            totalPairs += pairs;
            cellsUsed++;
        }
    }

    // Spatial collision: only bullet vs enemy in same cell
    int hits = 0;
    int pairsTested = 0;
    int cellsChecked = 0;

    for (int c = 0; c < GRID_W * GRID_H; c++) {
        if (gridCount[c] < 2) continue;
        cellsChecked++;
        for (int i = 0; i < gridCount[c]; i++) {
            for (int j = i + 1; j < gridCount[c]; j++) {
                int a = grid[c][i];
                int b = grid[c][j];
                if (etype[a] == etype[b]) continue;
                int bIdx = (etype[a] == 1) ? a : b;
                int eIdx = (etype[a] == 2) ? a : b;
                pairsTested++;
                int dx = ex[bIdx] - ex[eIdx];
                int dy = ey[bIdx] - ey[eIdx];
                if (dx < 0) dx = -dx;
                if (dy < 0) dy = -dy;
                if (dx < 20 && dy < 20) {
                    hits++;
                }
            }
        }
    }

    int bruteForcePairs = entityCount * (entityCount - 1) / 2;
    cout << "SPATIAL_STATS|entities|" << entityCount
         << "|cells_used|" << cellsUsed
         << "|total_pairs|" << totalPairs
         << "|bruteforce_pairs|" << bruteForcePairs << endl;

    cout << "COLLISIONS|hits|" << hits
         << "|cells_checked|" << cellsChecked
         << "|pairs_tested|" << pairsTested << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Entity 5 hash printed", expectedOutput: "HASH\\|entity_5\\|pos\\|\\d+,\\d+\\|cell\\|\\d+,\\d+\\|idx\\|\\d+", isPattern: true },
    { id: "g2", description: "Cell stats printed", expectedOutput: "CELL\\|idx\\|\\d+\\|count\\|\\d+\\|pairs_to_test\\|\\d+", isPattern: true },
    { id: "g3", description: "Spatial stats show 20 entities and 190 brute force", expectedOutput: "SPATIAL_STATS\\|entities\\|20\\|cells_used\\|\\d+\\|total_pairs\\|\\d+\\|bruteforce_pairs\\|190", isPattern: true },
    { id: "g4", description: "Collision results printed", expectedOutput: "COLLISIONS\\|hits\\|\\d+\\|cells_checked\\|\\d+\\|pairs_tested\\|\\d+", isPattern: true },
  ],
  hints: [
    "Hash function: cellIdx = (y/100) * 4 + (x/100). Integer division truncates. Position (290,260) gives cellX=2, cellY=2, idx=10.",
    "For spatial collision, iterate each cell with 2+ entities. For each pair (i,j), check if one is type=1 (bullet) and one is type=2 (enemy). Only then test the narrow phase overlap.",
    "Brute force pairs = n*(n-1)/2 = 20*19/2 = 190. Count total spatial pairs from all cells. The difference is the work you saved.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
const int FIXED_DT = 16;
const int SCREEN_W = 20;
const int SCREEN_H = 10;
const int VIEW_W = 200;
const int VIEW_H = 100;

// Spatial hash grid
const int GRID_W = 4;
const int GRID_H = 4;
const int CELL_SIZE = 100;
const int MAX_PER_CELL = 10;

int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], type[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int freeList[POOL_SIZE];
int freeCount = POOL_SIZE;

int grid[GRID_W * GRID_H][MAX_PER_CELL];
int gridCount[GRID_W * GRID_H];

int score = 0;
int kills = 0;
int wave = 1;
int lives = 3;

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

int spawnFromPool(int px, int py, int pvx, int pvy, int php, int ptype) {
    if (freeCount <= 0) return -1;
    freeCount--;
    int idx = freeList[freeCount];
    x[idx] = px;
    y[idx] = py;
    vx[idx] = pvx;
    vy[idx] = pvy;
    hp[idx] = php;
    type[idx] = ptype;
    alive[idx] = true;
    return idx;
}

void returnToPool(int idx) {
    alive[idx] = false;
    freeList[freeCount] = idx;
    freeCount++;
}

int hashPosition(int wx, int wy) {
    int cx = wx / CELL_SIZE;
    int cy = wy / CELL_SIZE;
    return cy * GRID_W + cx;
}

void clearGrid() {
    for (int i = 0; i < GRID_W * GRID_H; i++) {
        gridCount[i] = 0;
    }
}

void insertAllToGrid(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        int idx = hashPosition(x[i], y[i]);
        if (idx >= 0 && idx < GRID_W * GRID_H && gridCount[idx] < MAX_PER_CELL) {
            grid[idx][gridCount[idx]] = i;
            gridCount[idx]++;
        }
    }
}

void movementSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
}

void spatialCollisionSystem() {
    for (int c = 0; c < GRID_W * GRID_H; c++) {
        if (gridCount[c] < 2) continue;
        for (int i = 0; i < gridCount[c]; i++) {
            for (int j = i + 1; j < gridCount[c]; j++) {
                int a = grid[c][i];
                int b = grid[c][j];
                if (type[a] == type[b]) continue;
                int bIdx = (type[a] == 1) ? a : b;
                int eIdx = (type[a] == 2) ? a : b;
                if (type[bIdx] != 1 || type[eIdx] != 2) continue;
                int dx = x[bIdx] - x[eIdx];
                int dy = y[bIdx] - y[eIdx];
                if (dx < 0) dx = -dx;
                if (dy < 0) dy = -dy;
                if (dx < 18 && dy < 18) {
                    hp[bIdx] = 0;
                    hp[eIdx]--;
                    score += 100;
                    kills++;
                }
            }
        }
    }
}

void cleanupSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (alive[i] && hp[i] <= 0) alive[i] = false;
    }
}

int countAlive(int count) {
    int c = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i]) c++;
    }
    return c;
}

int worldToScreenX(int wx, int camX) {
    return (wx - camX) * SCREEN_W / VIEW_W;
}

int worldToScreenY(int wy, int camY) {
    return (wy - camY) * SCREEN_H / VIEW_H;
}

void processInput(char input, int playerIdx) {
    Action a = mapInput(input);
    if (a == MOVE_UP) y[playerIdx] -= 4;
    else if (a == MOVE_DOWN) y[playerIdx] += 4;
    else if (a == MOVE_LEFT) x[playerIdx] -= 4;
    else if (a == MOVE_RIGHT) x[playerIdx] += 4;
    else if (a == FIRE) {
        spawnFromPool(x[playerIdx], y[playerIdx], 0, -16, 1, 1);
    }
}

void renderSystem(int count, int camX, int camY) {
    char screenGrid[SCREEN_H][SCREEN_W];
    for (int r = 0; r < SCREEN_H; r++)
        for (int c = 0; c < SCREEN_W; c++)
            screenGrid[r][c] = '.';

    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        int sx = worldToScreenX(x[i], camX);
        int sy = worldToScreenY(y[i], camY);
        if (sx >= 0 && sx < SCREEN_W && sy >= 0 && sy < SCREEN_H) {
            if (type[i] == 0) screenGrid[sy][sx] = 'P';
            else if (type[i] == 1) screenGrid[sy][sx] = '|';
            else if (type[i] == 2) screenGrid[sy][sx] = 'V';
        }
    }

    for (int r = 0; r < SCREEN_H; r++) {
        for (int c = 0; c < SCREEN_W; c++) cout << screenGrid[r][c];
        cout << endl;
    }
}

void debugSystem(int frame, int count) {
    int active = countAlive(count);
    cout << "DEBUG|frame|" << frame << "|active|" << active
         << "|pool|" << active << "/" << POOL_SIZE
         << "|fps|60|kills|" << kills << endl;
}

int main() {
    for (int i = 0; i < POOL_SIZE; i++) {
        freeList[i] = i;
        alive[i] = false;
    }

    int playerIdx = spawnFromPool(180, 300, 0, 0, 100, 0);

    spawnFromPool(100, 40, 0, 4, 1, 2);
    spawnFromPool(180, 40, 0, 4, 1, 2);
    spawnFromPool(260, 40, 0, 4, 1, 2);
    int count = 4;

    string frameInputs[] = {"w", " ", "w", "d", "w"};

    for (int frame = 1; frame <= 5; frame++) {
        processInput(frameInputs[frame - 1][0], playerIdx);
        count = (entityCount > count) ? entityCount : count;

        movementSystem(count);

        // Spatial hash broad phase
        clearGrid();
        insertAllToGrid(count);
        spatialCollisionSystem();

        cleanupSystem(count);

        int active = countAlive(count);
        cout << "FRAME|" << frame << "|entities|" << active
             << "|score|" << score << "|lives|" << lives
             << "|wave|" << wave << endl;
        debugSystem(frame, count);
    }

    cout << "SCORE|" << score << endl;
    return 0;
}
`,
};
