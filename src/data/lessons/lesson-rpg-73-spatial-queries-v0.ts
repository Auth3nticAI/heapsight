import { Lesson } from "@/types/lesson";

export const lessonRPG73: Lesson = {
  id: "rpg-73-spatial-queries-v0",
  title: "Spatial Queries v0",
  description: "Use a grid-based spatial index to find nearby entities without scanning the entire array — O(neighbors) instead of O(all).",
  order: 73,
  xpReward: 100,
  tier: "pro",
  concepts: ["spatial indexing", "grid buckets", "neighbor queries", "O(1) lookup", "proximity search"],
  part1: {
    title: "Concept: Grid Spatial Index",
    type: "concept",
    instructions: `# Spatial Queries v0

## Mental Model

Finding entities adjacent to the player requires scanning every entity:
\`for (int i = 0; i < count; i++) if (dist(player, entity[i]) <= 1)\`.
With 50 entities, that's 50 distance checks per query. With 5 queries
per turn, that's 250 checks. A grid index reduces each query to 4 lookups.

## What Breaks Without This

Without spatial indexing:
- Every proximity query scans all entities: O(N)
- Combat range checks become the bottleneck at scale
- Multiple queries per turn multiply the cost
- Performance degrades linearly with entity count

## The Fix

Store which entity occupies each grid cell. Query neighbors by
checking 4 adjacent cells — O(4) regardless of entity count:

\`\`\`cpp
const int W = 10, H = 10;
int grid[H][W];  // -1 = empty, else entity index

void buildIndex(const World& w, int g[H][W]) {
    for (int y = 0; y < H; y++)
        for (int x = 0; x < W; x++) g[y][x] = -1;
    for (int i = 0; i < w.active_count; i++)
        g[w.py[i]][w.px[i]] = i;
}
\`\`\`

## Key Concepts

- **Cell-entity mapping**: grid[y][x] stores entity index or -1
- **Rebuild per turn**: clear + place, no stale data
- **O(4) neighbor query**: check up/down/left/right cells
- **One entity per cell**: simplification for grid-based RPGs

## Performance Insight

Building the index is O(W*H + entities). Each query is O(4).
For a 10x10 grid with 50 entities, this is dramatically faster
than brute force. The index pays for itself after 2-3 queries.

## Memory Insight

The grid is a fixed 10x10 int array = 400 bytes. Stack allocated.
Rebuilt every turn. Zero heap, zero lifetime management.

## Your Task

Write \`buildSpatialIndex\` that fills a grid from entity positions.
Then look up a specific cell to verify an entity is there.

## Beginner Trap

\`\`\`cpp
// BAD: Two entities at the same cell
grid[y][x] = i;  // Overwrites previous entity!
// For grid RPGs, enforce one entity per cell
\`\`\`

## Elite Insight

Dwarf Fortress uses spatial indexing for pathfinding, combat range,
and item lookup across 300x300+ grids with thousands of entities.
Same pattern, bigger scale.

## Systems Thinking Connection

Spatial indexing connects to combat (L08/L18): melee range checks
use neighbor queries instead of full scans. It also connects to
the cleanup pass — dead entities must be removed from the index.

## Skill Reinforcement

- 2D array indexing from L06
- Entity parallel arrays from L14
- Active count from L72 (swap-and-pop)

## Mastery Check

You pass when INDEX_BUILT prints the entity count and LOOKUP
correctly finds entity 0 at position (1,1).`,
    starterCode: `#include <iostream>
using namespace std;

const int W = 10, H = 10, MAX_E = 16;
struct World { int px[MAX_E]; int py[MAX_E]; int active_count; };

void initWorld(World& w) {
    w.active_count = 4;
    int xs[] = {1, 3, 5, 7}; int ys[] = {1, 2, 3, 4};
    for (int i = 0; i < 4; i++) { w.px[i] = xs[i]; w.py[i] = ys[i]; }
}

// TODO: Write buildSpatialIndex(const World& w, int grid[H][W])
// Clear grid to -1, then set grid[py[i]][px[i]] = i for each entity

int main() {
    World world; initWorld(world);
    int grid[H][W];

    // TODO: Call buildSpatialIndex
    // Print INDEX_BUILT|entities=<active_count>
    // Look up grid[1][1] and print LOOKUP|x=1|y=1|entity=<value>

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int W = 10, H = 10, MAX_E = 16;
struct World { int px[MAX_E]; int py[MAX_E]; int active_count; };

void initWorld(World& w) {
    w.active_count = 4;
    int xs[] = {1, 3, 5, 7}; int ys[] = {1, 2, 3, 4};
    for (int i = 0; i < 4; i++) { w.px[i] = xs[i]; w.py[i] = ys[i]; }
}

void buildSpatialIndex(const World& w, int grid[H][W]) {
    for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) grid[y][x] = -1;
    for (int i = 0; i < w.active_count; i++) grid[w.py[i]][w.px[i]] = i;
}

int main() {
    World world; initWorld(world);
    int grid[H][W];
    buildSpatialIndex(world, grid);
    cout << "INDEX_BUILT|entities=" << world.active_count << endl;
    cout << "LOOKUP|x=1|y=1|entity=" << grid[1][1] << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Index built with 4 entities", expectedOutput: "INDEX_BUILT|entities=4", isPattern: false },
      { id: "t2", description: "Lookup finds entity 0 at (1,1)", expectedOutput: "LOOKUP|x=1|y=1|entity=0", isPattern: false },
    ],
    hints: [
      "buildSpatialIndex needs two loops: first clear the grid to -1, then place each entity at grid[py[i]][px[i]] = i.",
      "Use nested for loops to clear: for y 0..H, for x 0..W, grid[y][x] = -1.",
      "After building, grid[1][1] should equal 0 because entity 0 is at position (1,1).",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Spatial Neighbor Query",
    type: "game_builder",
    instructions: `# Build: Grid-Based Spatial Index

## Mental Model

Part 1 built the index. Now use it: query neighbors around a point
with 4 directional lookups, compare with brute-force scan to verify
correctness. The brute force counts every check; the spatial version
always checks exactly 4 cells.

## What Breaks Without This

Without verification:
- Spatial index bugs go undetected
- Off-by-one in grid coords silently miss entities
- Brute force is the ground truth for correctness

## The Fix

Write \`queryNeighbors\` (4-directional grid lookup) and
\`bruteForceNeighbors\` (full scan with Manhattan distance). Compare
results to prove the spatial index is correct.

## Key Concepts

- **Direction arrays**: dx[] = {0,0,-1,1}, dy[] = {-1,1,0,0}
- **Bounds checking**: skip out-of-range cells
- **Manhattan distance**: |dx| + |dy| for grid proximity
- **Verification pattern**: compare fast path against known-correct slow path

## Performance Insight

queryNeighbors always checks 4 cells. bruteForceNeighbors checks
all N entities. With 50 entities, that's 4 vs 50 checks per query.
Over 5 queries per turn, spatial saves 230 checks.

## Memory Insight

Results arrays are stack-allocated with a fixed max. No dynamic
allocation needed. The grid index itself is also stack-allocated.

## Your Task

1. \`buildSpatialIndex\` — fill grid from entity positions
2. \`queryNeighbors(grid, cx, cy, results, max)\` — check 4 adjacent cells
3. \`bruteForceNeighbors(world, cx, cy, results, max, checks)\` — scan all, Manhattan dist == 1
4. Compare results at (3,3): both should find 2 neighbors

## Beginner Trap

\`\`\`cpp
// BAD: checking grid[x][y] instead of grid[y][x]
// Row-major: first index is row (y), second is column (x)
\`\`\`

## Elite Insight

Production engines often use spatial hashing for non-grid worlds.
The principle is identical: partition space into buckets, query
only the relevant buckets. Grid indexing is spatial hashing with
bucket size = 1.

## Mastery Check

You pass when MATCH confirms spatial and brute-force find the
same 2 neighbors at (3,3).`,
    starterCode: `#include <iostream>
using namespace std;

const int W = 10, H = 10, MAX_E = 16;
struct World { int px[MAX_E]; int py[MAX_E]; int active_count; };

void initWorld(World& w) {
    w.active_count = 6;
    int xs[] = {1, 3, 4, 3, 7, 2}; int ys[] = {1, 2, 3, 4, 3, 3};
    for (int i = 0; i < 6; i++) { w.px[i] = xs[i]; w.py[i] = ys[i]; }
}

// TODO: Write buildSpatialIndex(const World& w, int grid[H][W])

// TODO: Write queryNeighbors(int grid[H][W], int cx, int cy, int results[], int max)
// Check 4 adjacent cells, return count of found entities

// TODO: Write bruteForceNeighbors(const World& w, int cx, int cy, int results[], int max, int& checks)
// Scan all entities, check Manhattan distance == 1, return count

int main() {
    World world; initWorld(world);
    int grid[H][W];

    // TODO: Build index, print INDEX_BUILT|entities=N
    // TODO: Query neighbors at (3,3), print QUERY|cx=3|cy=3|neighbors=N
    // TODO: Brute force at (3,3), print BRUTE|cx=3|cy=3|neighbors=N|checks=C
    // TODO: Compare and print MATCH|spatial==brute or MISMATCH

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int W = 10, H = 10, MAX_E = 16;
struct World { int px[MAX_E]; int py[MAX_E]; int active_count; };

void initWorld(World& w) {
    w.active_count = 6;
    int xs[] = {1, 3, 4, 3, 7, 2}; int ys[] = {1, 2, 3, 4, 3, 3};
    for (int i = 0; i < 6; i++) { w.px[i] = xs[i]; w.py[i] = ys[i]; }
}

void buildSpatialIndex(const World& w, int grid[H][W]) {
    for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) grid[y][x] = -1;
    for (int i = 0; i < w.active_count; i++) grid[w.py[i]][w.px[i]] = i;
}

int queryNeighbors(int grid[H][W], int cx, int cy, int results[], int max) {
    int count = 0;
    int dx[] = {0, 0, -1, 1}; int dy[] = {-1, 1, 0, 0};
    for (int d = 0; d < 4; d++) {
        int nx = cx + dx[d], ny = cy + dy[d];
        if (nx >= 0 && nx < W && ny >= 0 && ny < H && grid[ny][nx] >= 0) {
            if (count < max) results[count++] = grid[ny][nx];
        }
    }
    return count;
}

int bruteForceNeighbors(const World& w, int cx, int cy, int results[], int max, int& checks) {
    int count = 0; checks = 0;
    for (int i = 0; i < w.active_count; i++) {
        checks++;
        int dist = abs(w.px[i] - cx) + abs(w.py[i] - cy);
        if (dist == 1 && count < max) results[count++] = i;
    }
    return count;
}

int main() {
    World world; initWorld(world);
    int grid[H][W];
    buildSpatialIndex(world, grid);
    cout << "INDEX_BUILT|entities=" << world.active_count << endl;
    int sr[MAX_E], br[MAX_E];
    int sn = queryNeighbors(grid, 3, 3, sr, MAX_E);
    cout << "QUERY|cx=3|cy=3|neighbors=" << sn << endl;
    int checks = 0;
    int bn = bruteForceNeighbors(world, 3, 3, br, MAX_E, checks);
    cout << "BRUTE|cx=3|cy=3|neighbors=" << bn << "|checks=" << checks << endl;
    if (sn == bn) cout << "MATCH|spatial==brute" << endl;
    else cout << "MISMATCH" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Index built", expectedOutput: "INDEX_BUILT|entities=6", isPattern: false },
      { id: "g2", description: "Spatial query finds 2 neighbors", expectedOutput: "QUERY|cx=3|cy=3|neighbors=2", isPattern: false },
      { id: "g3", description: "Brute force matches", expectedOutput: "BRUTE|cx=3|cy=3|neighbors=2|checks=6", isPattern: false },
      { id: "g4", description: "Results match", expectedOutput: "MATCH|spatial==brute", isPattern: false },
    ],
    hints: [
      "buildSpatialIndex clears grid to -1, then sets grid[py[i]][px[i]] = i for each active entity.",
      "queryNeighbors uses dx/dy direction arrays to check 4 adjacent cells. Bounds-check before accessing grid.",
      "bruteForceNeighbors scans all entities with abs(px-cx)+abs(py-cy)==1. Pass checks by reference to count iterations.",
    ],
    estimatedMinutes: 15,
  },
};