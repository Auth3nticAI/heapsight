import type { Lesson } from "@/types/lesson";

export const lesson57: Lesson = {
  id: "57-spatial-hash",
  title: "Spatial Hash Grid",
  description: "Replace O(n^2) collision with spatial hash grid for O(n) broad phase.",
  order: 57,
  xpReward: 200,
  tier: "pro",
  concepts: ["spatial partitioning", "hash grid", "broad phase", "collision optimization"],
  part1: {
    title: "Concept: Spatial Hash Grid",
    type: "concept",
    instructions: `# Spatial Hash Grid — O(n^2) Kills Your Frame Rate

You have 100 entities. Brute-force collision checks every pair. That is 100*99/2 = 4950 pair tests per frame. At 1000 entities, it is 499500. The frame budget is 16ms. You are dead.

## What Breaks Without This

Without spatial partitioning, collision detection scales quadratically. Double the entity count, quadruple the work. A space shooter with 200 bullets and 50 enemies means 12,500 pair tests. Most of those pairs are nowhere near each other. You are testing a bullet at the top of the screen against an enemy at the bottom. Pure waste.

## The Fix

Divide the world into a grid of cells. Hash each entity's position to a cell index:

\\\`\\\`\\\`
cellX = x / cellSize
cellY = y / cellSize
cellIdx = cellY * gridWidth + cellX
\\\`\\\`\\\`

Insert every entity into its cell. For collision, only test entities in the same cell. If 100 entities spread across 10 cells, that is roughly 10 entities per cell. Each cell tests 10*9/2 = 45 pairs. Total: 450 pair tests instead of 4950. An order of magnitude saved.

The hash grid is a broad phase. It quickly eliminates pairs that cannot possibly collide. The narrow phase (actual overlap test) runs only on pairs that share a cell.

## Your Task

1. Create a 4x4 grid over a 400x400 world. Cell size = 100
2. Hash function: \\\`cellIdx = (y/100) * 4 + (x/100)\\\`
3. Insert 8 entities at known positions into the grid
4. Count entities per cell
5. Calculate pairs per cell: \\\`n*(n-1)/2\\\`
6. Sum total spatial pairs vs brute force pairs
7. Print: \\\`HASH|entity_0|pos|50,50|cell|0,0|idx|0\\\`
8. Print: \\\`CELL|idx|0|count|2|pairs_to_test|1\\\`
9. Print: \\\`SPATIAL_STATS|entities|8|cells_used|4|total_pairs|6|bruteforce_pairs|28\\\`

Expected output:
\\\`\\\`\\\`
HASH|entity_0|pos|50,50|cell|0,0|idx|0
HASH|entity_1|pos|80,30|cell|0,0|idx|0
HASH|entity_2|pos|150,50|cell|1,0|idx|1
HASH|entity_3|pos|250,250|cell|2,2|idx|10
HASH|entity_4|pos|270,280|cell|2,2|idx|10
HASH|entity_5|pos|290,260|cell|2,2|idx|10
HASH|entity_6|pos|350,150|cell|3,1|idx|7
HASH|entity_7|pos|370,170|cell|3,1|idx|7
CELL|idx|0|count|2|pairs_to_test|1
CELL|idx|1|count|1|pairs_to_test|0
CELL|idx|7|count|2|pairs_to_test|1
CELL|idx|10|count|3|pairs_to_test|3
SPATIAL_STATS|entities|8|cells_used|4|total_pairs|5|bruteforce_pairs|28
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Using floating point division for the cell index. Integer division truncates, which is what you want. \\\`150 / 100 = 1\\\`, not 1.5. If you use float division and floor, you get the same result but slower. Integers are free.

## Elite Insight

Cell size should roughly match your largest entity. Too small and entities span multiple cells, requiring multi-cell insertion. Too large and too many entities land in the same cell, reducing the benefit. The sweet spot is when most cells contain 2-5 entities.

## Cross-Path Echo

Database indexing is the same idea. A B-tree partitions keys into ranges so queries skip irrelevant rows. A spatial hash partitions positions into cells so collision skips irrelevant pairs. Both trade memory for speed. Both turn O(n) scans into O(1) lookups.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_ENTITIES = 20;
const int GRID_W = 4;
const int GRID_H = 4;
const int CELL_SIZE = 100;
const int MAX_PER_CELL = 10;

int ex[MAX_ENTITIES], ey[MAX_ENTITIES];
int entityCount = 0;

// Grid: each cell stores indices of entities in it
int grid[GRID_W * GRID_H][MAX_PER_CELL];
int gridCount[GRID_W * GRID_H];

// TODO: Write hashPosition(x, y) — returns cell index: (y/CELL_SIZE)*GRID_W + (x/CELL_SIZE)

// TODO: Write clearGrid() — set all gridCount to 0

// TODO: Write insertEntity(entityIdx) — hash position, add to grid cell

// TODO: Write printCellStats() — for each non-empty cell, print CELL line
//       pairs_to_test = count*(count-1)/2

int main() {
    // 8 entities at known positions
    int positions[][2] = {
        {50,50}, {80,30}, {150,50}, {250,250},
        {270,280}, {290,260}, {350,150}, {370,170}
    };
    entityCount = 8;

    for (int i = 0; i < entityCount; i++) {
        ex[i] = positions[i][0];
        ey[i] = positions[i][1];
    }

    clearGrid();

    // TODO: Insert all entities and print HASH lines
    // TODO: Print CELL stats for non-empty cells
    // TODO: Calculate and print SPATIAL_STATS

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_ENTITIES = 20;
const int GRID_W = 4;
const int GRID_H = 4;
const int CELL_SIZE = 100;
const int MAX_PER_CELL = 10;

int ex[MAX_ENTITIES], ey[MAX_ENTITIES];
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

void insertEntity(int entityIdx) {
    int idx = hashPosition(ex[entityIdx], ey[entityIdx]);
    grid[idx][gridCount[idx]] = entityIdx;
    gridCount[idx]++;
}

int main() {
    int positions[][2] = {
        {50,50}, {80,30}, {150,50}, {250,250},
        {270,280}, {290,260}, {350,150}, {370,170}
    };
    entityCount = 8;

    for (int i = 0; i < entityCount; i++) {
        ex[i] = positions[i][0];
        ey[i] = positions[i][1];
    }

    clearGrid();

    for (int i = 0; i < entityCount; i++) {
        insertEntity(i);
        int cx = ex[i] / CELL_SIZE;
        int cy = ey[i] / CELL_SIZE;
        int idx = hashPosition(ex[i], ey[i]);
        cout << "HASH|entity_" << i << "|pos|" << ex[i] << "," << ey[i]
             << "|cell|" << cx << "," << cy << "|idx|" << idx << endl;
    }

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

    int bruteForcePairs = entityCount * (entityCount - 1) / 2;
    cout << "SPATIAL_STATS|entities|" << entityCount
         << "|cells_used|" << cellsUsed
         << "|total_pairs|" << totalPairs
         << "|bruteforce_pairs|" << bruteForcePairs << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Entity 0 hashed to cell 0,0", expectedOutput: "HASH\\|entity_0\\|pos\\|50,50\\|cell\\|0,0\\|idx\\|0", isPattern: true },
      { id: "t2", description: "Entity 5 hashed to cell 2,2", expectedOutput: "HASH\\|entity_5\\|pos\\|290,260\\|cell\\|2,2\\|idx\\|10", isPattern: true },
      { id: "t3", description: "Cell 10 has 3 entities, 3 pairs", expectedOutput: "CELL\\|idx\\|10\\|count\\|3\\|pairs_to_test\\|3", isPattern: true },
      { id: "t4", description: "Spatial stats show reduction", expectedOutput: "SPATIAL_STATS\\|entities\\|8\\|cells_used\\|4\\|total_pairs\\|5\\|bruteforce_pairs\\|28", isPattern: true },
    ],
    hints: [
      "The hash function is integer division: cellX = x / CELL_SIZE, cellY = y / CELL_SIZE. The index is cellY * GRID_W + cellX. For position (250,250): cellX=2, cellY=2, idx=10.",
      "Insert means: compute the cell index, then store the entity index in grid[cellIdx][gridCount[cellIdx]], and increment gridCount[cellIdx].",
      "Pairs per cell is the combination formula: n*(n-1)/2. A cell with 3 entities has 3 pairs. A cell with 1 entity has 0 pairs.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Spatial Hash Collision",
    type: "game_builder",
    instructions: `# Game Builder: Spatial Hash Collision — Grid-Accelerated Hit Detection

Brute-force collision is a ticking bomb. Your space shooter has 20 entities. That is 190 pair tests. With a spatial hash grid, you partition the world into cells and only test pairs within the same cell. The reduction is dramatic. This is the broad phase that every real game engine uses.

## What Breaks Without This

Without spatial partitioning, adding 10 more enemies doubles your collision cost. At 100 entities, you hit 4950 pairs. At 200, it is 19900. The frame budget does not grow. The entity count does. Without a broad phase, your game slows down as it gets more interesting.

## The Fix

4x4 grid. 400x400 world. Cell size 100. Hash every entity to its cell. For collision, iterate cells. Within each cell, test all pairs. Skip cells with 0 or 1 entities. The narrow phase (AABB overlap) only runs on spatially close pairs.

\\\`\\\`\\\`
for each cell:
  for i = 0 to cell.count - 1:
    for j = i+1 to cell.count - 1:
      narrowPhase(cell[i], cell[j])
\\\`\\\`\\\`

## Your Task

1. 4x4 grid, cell size 100, world 400x400
2. 20 entities with known positions (mix of bullets type=1 and enemies type=2)
3. Hash all entities into grid cells
4. Print HASH line for entity 5: \\\`HASH|entity_5|pos|<x>,<y>|cell|<cx>,<cy>|idx|<i>\\\`
5. For cell with index 10, print: \\\`CELL|idx|10|count|<n>|pairs_to_test|<p>\\\`
6. Run collision only within cells (bullet vs enemy, |dx|<20 && |dy|<20)
7. Print: \\\`SPATIAL_STATS|entities|20|cells_used|<c>|total_pairs|<p>|bruteforce_pairs|190\\\`
8. Print: \\\`COLLISIONS|hits|<h>|cells_checked|<c>|pairs_tested|<p>\\\`

## Beginner Trap

**Common Mistake:** Forgetting to clear the grid each frame. If you insert entities without clearing, the grid accumulates stale data. Always clear before insert. One frame, one grid state.

## Elite Insight

Quake used a uniform grid for its spatial partitioning. Not an octree, not a BSP for dynamic entities. A flat grid with fixed cell size. Simple, cache-friendly, and fast. Complexity is the enemy of performance. The dumbest data structure that solves your problem is usually the fastest.

## Cross-Path Echo

CDN edge caching partitions the internet by geography. Requests route to the nearest edge server, not to origin. Spatial hashing partitions your game world by position. Collision queries route to the nearest cell, not to every entity. Both are spatial locality optimizations.`,
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
//       Hit if |dx|<20 && |dy|<20. Return total hits and pairs tested.

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
                // Only bullet vs enemy
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
      { id: "t1", description: "Entity 5 hash printed", expectedOutput: "HASH\\|entity_5\\|pos\\|\\d+,\\d+\\|cell\\|\\d+,\\d+\\|idx\\|\\d+", isPattern: true },
      { id: "t2", description: "Cell stats printed", expectedOutput: "CELL\\|idx\\|\\d+\\|count\\|\\d+\\|pairs_to_test\\|\\d+", isPattern: true },
      { id: "t3", description: "Spatial stats show reduction", expectedOutput: "SPATIAL_STATS\\|entities\\|20\\|cells_used\\|\\d+\\|total_pairs\\|\\d+\\|bruteforce_pairs\\|190", isPattern: true },
      { id: "t4", description: "Collision results printed", expectedOutput: "COLLISIONS\\|hits\\|\\d+\\|cells_checked\\|\\d+\\|pairs_tested\\|\\d+", isPattern: true },
    ],
    hints: [
      "Hash function: cellIdx = (y/100) * 4 + (x/100). Integer division truncates. Position (290,260) gives cellX=2, cellY=2, idx=10.",
      "For spatial collision, iterate each cell. For each pair (i,j) in the cell, check if one is a bullet and one is an enemy. Only then test overlap.",
      "Brute force pairs = n*(n-1)/2 = 20*19/2 = 190. Spatial pairs will be much less. The reduction is the whole point of the broad phase.",
    ],
    estimatedMinutes: 10,
  },
};
