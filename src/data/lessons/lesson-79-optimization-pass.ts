import type { Lesson } from "@/types/lesson";

export const lesson79: Lesson = {
  id: "79-optimization-pass",
  title: "Optimization Pass",
  description: "Measure frame time before and after optimization to prove improvement.",
  order: 79,
  xpReward: 200,
  tier: "pro",
  concepts: ["optimization", "profiling", "frame time", "before/after comparison"],
  part1: {
    title: "Concept: Optimization Pass",
    type: "concept",
    instructions: `# Optimization Pass — Measure, Optimize, Measure Again

The first rule of optimization: do not optimize without measuring. The second rule: measure again after you change something. Gut feelings about performance are wrong more often than they are right. The "slow" function might be 2% of frame time. The "fast" function might be called 10,000 times and dominate the profile. Measure first. Then optimize the bottleneck. Then measure to prove the optimization worked.

## What Breaks Without This

Without measurement, you optimize the wrong thing. You spend a week rewriting the rendering system and gain 0.5ms. Meanwhile the collision system burns 12ms per frame because it checks every bullet against every enemy — N*M pair checks. A spatial hash would cut that to N+M. But you never measured, so you never found the real bottleneck.

## The Fix

Count the work. For collision detection, the work unit is "pair checks." Brute force checks every bullet against every enemy: N bullets times M enemies = N*M checks. A spatial hash divides the world into cells and only checks entities in the same cell. If entities are evenly distributed across a 4x4 grid, each cell has N/16 bullets and M/16 enemies. Total checks drop from N*M to 16 * (N/16 * M/16) = N*M/16.

\\\`\\\`\\\`
// Brute force: 50 bullets * 20 enemies = 1000 checks
// Spatial hash (4x4): ~16 * (3 * 1) = ~48 checks
// Real world: ~120 checks (uneven distribution)
\\\`\\\`\\\`

The speedup is dramatic. But you only know it is dramatic because you counted the checks before and after.

## Your Task

1. Simulate brute force collision: N=50 bullets, M=20 enemies
   - Total checks = N * M = 1000
2. Simulate spatial hash collision: 4x4 grid (16 cells)
   - Distribute entities across cells (not perfectly even)
   - Count actual checks per cell, sum them
   - Total should be approximately 120 checks
3. Calculate speedup: bruteForce / spatialHash
4. Calculate frame time: assume 1 check = 1 time unit, target = 16ms (60fps)
   - Brute: 1000 checks -> simulate as 16.7ms
   - Spatial: 120 checks -> simulate as 2.0ms
5. Print: \\\`OPTIMIZE|bruteforce|checks|1000|time_units|1000\\\`
6. Print: \\\`OPTIMIZE|spatial_hash|checks|120|time_units|120\\\`
7. Print: \\\`OPTIMIZE|speedup|8.3x|checks_saved|880\\\`
8. Print: \\\`FRAME_TIME|before|16.7ms|after|2.0ms|target|16.0ms|status|PASS\\\`

Expected output:
\\\`\\\`\\\`
OPTIMIZE|bruteforce|checks|1000|time_units|1000
OPTIMIZE|spatial_hash|checks|120|time_units|120
OPTIMIZE|speedup|8.3x|checks_saved|880
FRAME_TIME|before|16.7ms|after|2.0ms|target|16.0ms|status|PASS
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Assuming spatial hashing is always faster. With very few entities (5 bullets, 3 enemies), brute force does 15 checks. Spatial hash has overhead: computing cell indices, maintaining bucket lists. For small N, brute force wins. The optimization only pays off when N*M exceeds the hash overhead. Always measure both paths.

## Elite Insight

John Carmack's Quake engines used BSP trees for spatial partitioning — a more sophisticated version of spatial hashing. The principle is identical: avoid checking pairs that cannot possibly collide because they are in different regions of space. Every spatial optimization is a variant of "skip the work you do not need to do."

## Cross-Path Echo

Database query optimization follows the same pattern. A full table scan checks every row (brute force). An indexed query checks only matching rows (spatial hash). The database query planner measures both and picks the cheaper one. EXPLAIN ANALYZE is the database equivalent of counting collision checks. Measure the plan before you commit to it.`,
    starterCode: `#include <iostream>
using namespace std;

const int NUM_BULLETS = 50;
const int NUM_ENEMIES = 20;
const int GRID_SIZE = 4;
const int NUM_CELLS = GRID_SIZE * GRID_SIZE;

// TODO: Write bruteForceChecks(numBullets, numEnemies)
//   Return numBullets * numEnemies

// TODO: Write spatialHashChecks(numBullets, numEnemies, gridSize)
//   Simulate distribution of entities across grid cells
//   Not perfectly even: some cells have more entities
//   Count checks per cell: bulletsInCell * enemiesInCell
//   Sum across all cells, return total

// TODO: Write printResults(bruteChecks, spatialChecks)
//   Print OPTIMIZE lines for both methods
//   Calculate speedup: bruteChecks * 10 / spatialChecks (for one decimal)
//   Calculate checks_saved: bruteChecks - spatialChecks

// TODO: Write printFrameTime(bruteChecks, spatialChecks)
//   Before: bruteChecks * 167 / 10000 -> format as XX.Xms
//   After: spatialChecks * 167 / 10000 -> format as X.Xms
//   Target: 16.0ms. Status: PASS if after < target, else FAIL

int main() {
    // TODO: Calculate brute force checks
    // TODO: Calculate spatial hash checks (target ~120)
    // TODO: Print results and frame time

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int NUM_BULLETS = 50;
const int NUM_ENEMIES = 20;
const int GRID_SIZE = 4;
const int NUM_CELLS = GRID_SIZE * GRID_SIZE;

int bruteForceChecks(int numBullets, int numEnemies) {
    return numBullets * numEnemies;
}

int spatialHashChecks(int numBullets, int numEnemies, int gridSize) {
    int cells = gridSize * gridSize;

    // Simulate non-uniform distribution
    // Bullets per cell (50 across 16 cells, not even)
    int bpc[] = {5, 4, 3, 2, 4, 3, 5, 2, 3, 4, 2, 3, 4, 2, 3, 1};
    // Enemies per cell (20 across 16 cells, not even)
    int epc[] = {2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 0, 1};

    int total = 0;
    for (int c = 0; c < cells; c++) {
        total += bpc[c] * epc[c];
    }
    return total;
}

void printResults(int bruteChecks, int spatialChecks) {
    cout << "OPTIMIZE|bruteforce|checks|" << bruteChecks
         << "|time_units|" << bruteChecks << endl;
    cout << "OPTIMIZE|spatial_hash|checks|" << spatialChecks
         << "|time_units|" << spatialChecks << endl;

    int speedupTenths = bruteChecks * 10 / spatialChecks;
    int saved = bruteChecks - spatialChecks;
    cout << "OPTIMIZE|speedup|" << speedupTenths / 10 << "." << speedupTenths % 10
         << "x|checks_saved|" << saved << endl;
}

void printFrameTime(int bruteChecks, int spatialChecks) {
    // Scale: 1000 checks = 16.7ms, so checks * 167 / 10000
    int beforeTenths = bruteChecks * 167 / 1000;
    int afterTenths = spatialChecks * 167 / 1000;
    int targetTenths = 160;

    string status = (afterTenths < targetTenths) ? "PASS" : "FAIL";

    cout << "FRAME_TIME|before|" << beforeTenths / 10 << "." << beforeTenths % 10
         << "ms|after|" << afterTenths / 10 << "." << afterTenths % 10
         << "ms|target|16.0ms|status|" << status << endl;
}

int main() {
    int brute = bruteForceChecks(NUM_BULLETS, NUM_ENEMIES);
    int spatial = spatialHashChecks(NUM_BULLETS, NUM_ENEMIES, GRID_SIZE);

    printResults(brute, spatial);
    printFrameTime(brute, spatial);

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Brute force checks", expectedOutput: "OPTIMIZE\\|bruteforce\\|checks\\|1000\\|time_units\\|1000", isPattern: true },
      { id: "t2", description: "Spatial hash checks", expectedOutput: "OPTIMIZE\\|spatial_hash\\|checks\\|120\\|time_units\\|120", isPattern: true },
      { id: "t3", description: "Speedup calculated", expectedOutput: "OPTIMIZE\\|speedup\\|8\\.3x\\|checks_saved\\|880", isPattern: true },
      { id: "t4", description: "Frame time comparison", expectedOutput: "FRAME_TIME\\|before\\|16\\.7ms\\|after\\|2\\.0ms\\|target\\|16\\.0ms\\|status\\|PASS", isPattern: true },
    ],
    hints: [
      "Brute force is simple: 50 * 20 = 1000. The spatial hash distributes entities across 16 cells. Define arrays for bullets-per-cell and enemies-per-cell that sum to 50 and 20 respectively.",
      "For the spatial hash, the per-cell check count is bullets_in_cell * enemies_in_cell. Sum across all 16 cells. Target total is 120. Adjust the distribution arrays until the sum matches.",
      "Speedup = 1000 * 10 / 120 = 83 -> 8.3x. Frame time: 1000 * 167 / 1000 = 167 -> 16.7ms. 120 * 167 / 1000 = 20 -> 2.0ms. After < target (160) so status is PASS.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Game: Optimization Pass",
    type: "game_builder",
    instructions: `# Game Builder: Optimization Pass — Brute Force vs Spatial Hash

This is the optimization workflow: measure, change, measure. Your collision system checks every bullet against every enemy. With 50 bullets and 20 enemies, that is 1000 pair checks per frame. A spatial hash reduces that to approximately 120 by only checking entities in the same grid cell. The speedup is 8.3x. But you only know that because you counted.

## What Breaks Without This

Without measurement, optimization is superstition. You "feel" the game is slow. You rewrite something. It might be faster. You do not know. Maybe it is slower — the rewrite introduced a cache miss pattern. Counting work units removes guesswork. The numbers do not lie.

## The Fix

Two implementations of the same function. Brute force iterates all pairs. Spatial hash buckets entities into grid cells and only checks within cells. Run both. Count checks. Compare. The optimization that saves the most checks wins. The frame time comparison proves it hits the 60fps target.

\\\`\\\`\\\`
// Brute: for each bullet, for each enemy -> N*M
// Spatial: for each cell, for each bullet in cell, for each enemy in cell
// Compare: checks_before / checks_after = speedup
\\\`\\\`\\\`

## Your Task

1. Brute force: 50 bullets * 20 enemies = 1000 checks
2. Spatial hash: 4x4 grid, ~120 total checks
3. Print: \\\`OPTIMIZE|bruteforce|checks|1000|time_units|1000\\\`
4. Print: \\\`OPTIMIZE|spatial_hash|checks|120|time_units|120\\\`
5. Print: \\\`OPTIMIZE|speedup|8.3x|checks_saved|880\\\`
6. Print: \\\`FRAME_TIME|before|16.7ms|after|2.0ms|target|16.0ms|status|PASS\\\`

## Beginner Trap

**Common Mistake:** Building the spatial hash but never benchmarking it against brute force. The hash has overhead — cell computation, bucket management. For small entity counts, brute force is faster because it has no overhead. Always compare both paths with your actual entity count.

## Elite Insight

Spatial hashing is O(N+M) average case for collision detection when entities are uniformly distributed. Brute force is O(N*M). But big-O hides constants. The spatial hash has higher constant factors — hash computation, bucket traversal, cache misses from pointer chasing. Profile with real data, not theoretical complexity.

## Cross-Path Echo

Web API caching is the same optimization. Without cache: every request hits the database (brute force). With cache: only cache misses hit the database (spatial hash). Cache hit ratio is the speedup metric. Your checks_saved is the cache hit count. Same pattern, different domain.`,
    starterCode: `#include <iostream>
using namespace std;

const int NUM_BULLETS = 50;
const int NUM_ENEMIES = 20;
const int GRID_SIZE = 4;
const int NUM_CELLS = GRID_SIZE * GRID_SIZE;

// TODO: Write bruteForceChecks(numBullets, numEnemies)
//   Return numBullets * numEnemies

// TODO: Write spatialHashChecks(numBullets, numEnemies, gridSize)
//   Distribute entities across cells (non-uniform)
//   Sum per-cell checks. Target ~120 total.

// TODO: Write printResults(bruteChecks, spatialChecks)
//   OPTIMIZE lines for both, speedup, checks_saved

// TODO: Write printFrameTime(bruteChecks, spatialChecks)
//   Scale to ms, compare against 16.0ms target

int main() {
    // TODO: Calculate both check counts
    // TODO: Print optimization results and frame time comparison

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int NUM_BULLETS = 50;
const int NUM_ENEMIES = 20;
const int GRID_SIZE = 4;
const int NUM_CELLS = GRID_SIZE * GRID_SIZE;

int bruteForceChecks(int numBullets, int numEnemies) {
    return numBullets * numEnemies;
}

int spatialHashChecks(int numBullets, int numEnemies, int gridSize) {
    int cells = gridSize * gridSize;

    // Non-uniform distribution across 16 cells
    int bpc[] = {5, 4, 3, 2, 4, 3, 5, 2, 3, 4, 2, 3, 4, 2, 3, 1};
    int epc[] = {2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 0, 1};

    int total = 0;
    for (int c = 0; c < cells; c++) {
        total += bpc[c] * epc[c];
    }
    return total;
}

void printResults(int bruteChecks, int spatialChecks) {
    cout << "OPTIMIZE|bruteforce|checks|" << bruteChecks
         << "|time_units|" << bruteChecks << endl;
    cout << "OPTIMIZE|spatial_hash|checks|" << spatialChecks
         << "|time_units|" << spatialChecks << endl;

    int speedupTenths = bruteChecks * 10 / spatialChecks;
    int saved = bruteChecks - spatialChecks;
    cout << "OPTIMIZE|speedup|" << speedupTenths / 10 << "." << speedupTenths % 10
         << "x|checks_saved|" << saved << endl;
}

void printFrameTime(int bruteChecks, int spatialChecks) {
    int beforeTenths = bruteChecks * 167 / 1000;
    int afterTenths = spatialChecks * 167 / 1000;
    int targetTenths = 160;

    string status = (afterTenths < targetTenths) ? "PASS" : "FAIL";

    cout << "FRAME_TIME|before|" << beforeTenths / 10 << "." << beforeTenths % 10
         << "ms|after|" << afterTenths / 10 << "." << afterTenths % 10
         << "ms|target|16.0ms|status|" << status << endl;
}

int main() {
    int brute = bruteForceChecks(NUM_BULLETS, NUM_ENEMIES);
    int spatial = spatialHashChecks(NUM_BULLETS, NUM_ENEMIES, GRID_SIZE);

    printResults(brute, spatial);
    printFrameTime(brute, spatial);

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Brute force checks counted", expectedOutput: "OPTIMIZE\\|bruteforce\\|checks\\|1000\\|time_units\\|1000", isPattern: true },
      { id: "t2", description: "Spatial hash checks counted", expectedOutput: "OPTIMIZE\\|spatial_hash\\|checks\\|120\\|time_units\\|120", isPattern: true },
      { id: "t3", description: "Speedup computed", expectedOutput: "OPTIMIZE\\|speedup\\|8\\.3x\\|checks_saved\\|880", isPattern: true },
      { id: "t4", description: "Frame time passes target", expectedOutput: "FRAME_TIME\\|before\\|16\\.7ms\\|after\\|2\\.0ms\\|target\\|16\\.0ms\\|status\\|PASS", isPattern: true },
    ],
    hints: [
      "Brute force = 50 * 20 = 1000. For spatial hash, define two arrays representing bullets-per-cell and enemies-per-cell across 16 cells. Arrays must sum to 50 and 20 respectively.",
      "Per-cell checks = bullets_in_cell * enemies_in_cell. Sum across all 16 cells to get total. Adjust arrays so the total is exactly 120. Example: cell with 5 bullets and 2 enemies = 10 checks.",
      "Speedup: 1000*10/120 = 83 -> 8.3x. Frame time scaling: 1000*167/1000=167 -> 16.7ms, 120*167/1000=20 -> 2.0ms. 2.0 < 16.0 so status is PASS.",
    ],
    estimatedMinutes: 10,
  },
};
