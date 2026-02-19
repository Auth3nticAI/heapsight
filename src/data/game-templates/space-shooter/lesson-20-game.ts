import type { GameLessonVariant } from "@/types/game";

export const lesson20SpaceShooter: GameLessonVariant = {
  lessonId: "20-spatial-buckets-v0",
  instructions: `# Spatial Buckets v0 — Collision Optimization

Every bullet checks every enemy. Every enemy checks every bullet. That is O(n\u00B2). With 50 bullets and 50 enemies, that is 2500 checks per frame. At 60fps, 150,000 checks per second. Your game stutters. Your frame budget is gone. The collision system is the bottleneck.

## What Breaks Without This

Without spatial partitioning, collision is brute force. The cost scales quadratically. Double the entities, quadruple the checks. At 100 enemies, the game drops frames. At 200, it freezes. The architecture does not scale.

## The Fix

Divide the screen into horizontal buckets. Each entity belongs to exactly one bucket based on its x position. Collision only checks entities within the same bucket. If 8 enemies spread across 4 buckets with 2 per bucket, brute force needs 28 pair checks. Buckets need 4. That is 85% fewer checks.

The function \\\`getBucket(int x, int bucketWidth)\\\` returns \\\`x / bucketWidth\\\`. One integer division. O(1) per entity. O(n) total. The collision within each bucket is k\u00B2 where k is the bucket population. Total work: O(n + sum(k\u00B2)). When entities are evenly distributed, this is dramatically less than O(n\u00B2).

## Your Task

1. Place 8 enemies at x positions: 30, 80, 130, 170, 210, 250, 310, 360
2. Assign each enemy to a bucket using \\\`getBucket\\\`
3. Count entities per bucket
4. Render the player at (180,220) and all enemies at y=60, size 16x16, hp=50
5. Calculate brute force pairs (n*(n-1)/2 = 28) vs bucketed pairs (sum of k*(k-1)/2 per bucket = 4)
6. Output SCORE|0
7. Output GAME_MESSAGE showing pairs comparison and reduction percentage

## Performance Insight

Bucket assignment: one division per entity. O(n). Collision per bucket: k\u00B2 where k \u2248 n/numBuckets. Total: O(n + n\u00B2/buckets). With 4 buckets: 25% of brute force. The overhead of maintaining bucket counts is negligible — 4 integers, 16 bytes.

## Memory Insight

4 bucket count integers = 16 bytes on the stack. No heap allocation. No dynamic resizing. The spatial index costs almost nothing in memory.

## Beginner Trap

**Common Mistake:** Forgetting that entities on bucket boundaries cannot collide across buckets. Entity at x=99 is in bucket 0. Entity at x=100 is in bucket 1. If they are 1 pixel apart, the bucket system misses the collision. Solution: check adjacent buckets too (L57). For now, accept this tradeoff.

## Elite Insight

Production engines use 2D spatial hashing: \\\`hash(x/cellSize, y/cellSize)\\\` maps to a bucket. Your 1D buckets are the foundation. Same principle, extended to two dimensions. Uniform grids, quad trees, BVH trees — all spatial partitioning structures follow this divide-and-conquer pattern.

## Systems Thinking Connection

This is data-oriented collision optimization. The entities do not change. The positions do not change. Only the algorithm changes — from O(n\u00B2) brute force to O(n \u00D7 k) bucketed. Same data, different access pattern, 85% less work. Architecture decisions dominate performance.

## Skill Reinforcement

You already know arrays, loops, and integer math. Bucket assignment is \\\`x / width\\\`. Counting is \\\`bucketCounts[b]++\\\`. Pair counting is \\\`k*(k-1)/2\\\`. No new syntax. New algorithmic thinking.

## Mastery Check

Can you explain why 4 buckets with 2 enemies each produces 4 pairs instead of 28? Each bucket checks 2*(2-1)/2 = 1 pair. 4 buckets \u00D7 1 pair = 4 total. Brute force checks 8*(8-1)/2 = 28. The bucket structure eliminates cross-bucket comparisons entirely.`,
  starterCode: `#include <iostream>
using namespace std;

const int NUM_ENEMIES = 8;
const int SCREEN_WIDTH = 400;
const int NUM_BUCKETS = 4;
const int BUCKET_WIDTH = SCREEN_WIDTH / NUM_BUCKETS;

int getBucket(int x, int bucketWidth) {
    return x / bucketWidth;
}

int main() {
    int enemy_x[NUM_ENEMIES] = {30, 80, 130, 170, 210, 250, 310, 360};
    int bucketCounts[NUM_BUCKETS] = {0, 0, 0, 0};

    cout << "ENTITY|hero|player|180|220|24|24|100" << endl;

    // TODO: Render each enemy as ENTITY and assign to buckets
    // ENTITY|eN|enemy|x|60|16|16|50

    // TODO: Calculate brute force pairs and bucketed pairs
    // TODO: Calculate reduction percentage

    // TODO: Output SCORE|0
    // TODO: Output GAME_MESSAGE with pairs comparison

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

const int NUM_ENEMIES = 8;
const int SCREEN_WIDTH = 400;
const int NUM_BUCKETS = 4;
const int BUCKET_WIDTH = SCREEN_WIDTH / NUM_BUCKETS;

int getBucket(int x, int bucketWidth) {
    return x / bucketWidth;
}

int main() {
    int enemy_x[NUM_ENEMIES] = {30, 80, 130, 170, 210, 250, 310, 360};
    int bucketCounts[NUM_BUCKETS] = {0, 0, 0, 0};

    cout << "ENTITY|hero|player|180|220|24|24|100" << endl;

    for (int i = 0; i < NUM_ENEMIES; i++) {
        int b = getBucket(enemy_x[i], BUCKET_WIDTH);
        bucketCounts[b]++;
        cout << "ENTITY|e" << i << "|enemy|" << enemy_x[i] << "|60|16|16|50" << endl;
    }

    int bruteForcePairs = NUM_ENEMIES * (NUM_ENEMIES - 1) / 2;
    int bucketedPairs = 0;
    for (int i = 0; i < NUM_BUCKETS; i++) {
        bucketedPairs += bucketCounts[i] * (bucketCounts[i] - 1) / 2;
    }
    int reduction = 100 - (bucketedPairs * 100 / bruteForcePairs);

    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|Buckets: " << bucketedPairs << " pairs vs "
         << bruteForcePairs << " brute force (" << reduction << "% reduction)" << endl;

    return 0;
}
`,
  tests: [
    {
      id: "g1",
      description: "Should render hero entity",
      expectedOutput: "ENTITY\\|hero\\|player\\|180\\|220\\|24\\|24\\|100",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Should render first enemy at x=30",
      expectedOutput: "ENTITY\\|e0\\|enemy\\|30\\|60\\|16\\|16\\|50",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Should render last enemy at x=360",
      expectedOutput: "ENTITY\\|e7\\|enemy\\|360\\|60\\|16\\|16\\|50",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Should output score",
      expectedOutput: "SCORE\\|0",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Should show 85% reduction message",
      expectedOutput: "GAME_MESSAGE\\|Buckets: 4 pairs vs 28 brute force \\(85% reduction\\)",
      isPattern: true,
    },
  ],
  hints: [
    "Loop through enemies: `cout << \"ENTITY|e\" << i << \"|enemy|\" << enemy_x[i] << \"|60|16|16|50\" << endl;` and `bucketCounts[getBucket(enemy_x[i], BUCKET_WIDTH)]++`.",
    "Brute force: `8*7/2 = 28`. Each bucket has 2 enemies: `4 * (2*1/2) = 4`.",
    "Reduction: `100 - (4 * 100 / 28)` = 85%. Integer division gives exact result here.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

const int NUM_ENEMIES = 8;
const int SCREEN_WIDTH = 400;
const int NUM_BUCKETS = 4;
const int BUCKET_WIDTH = SCREEN_WIDTH / NUM_BUCKETS;

// --- Spatial bucket assignment (L20) ---
int getBucket(int x, int bucketWidth) {
    return x / bucketWidth;
}

// --- Pair counting for collision optimization ---
int countBucketedPairs(int bucketCounts[], int numBuckets) {
    int pairs = 0;
    for (int i = 0; i < numBuckets; i++) {
        pairs += bucketCounts[i] * (bucketCounts[i] - 1) / 2;
    }
    return pairs;
}

int main() {
    int enemy_x[NUM_ENEMIES] = {30, 80, 130, 170, 210, 250, 310, 360};
    int bucketCounts[NUM_BUCKETS] = {0, 0, 0, 0};

    cout << "ENTITY|hero|player|180|220|24|24|100" << endl;

    for (int i = 0; i < NUM_ENEMIES; i++) {
        int b = getBucket(enemy_x[i], BUCKET_WIDTH);
        bucketCounts[b]++;
        cout << "ENTITY|e" << i << "|enemy|" << enemy_x[i] << "|60|16|16|50" << endl;
    }

    int bruteForcePairs = NUM_ENEMIES * (NUM_ENEMIES - 1) / 2;
    int bucketedPairs = countBucketedPairs(bucketCounts, NUM_BUCKETS);
    int reduction = 100 - (bucketedPairs * 100 / bruteForcePairs);

    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|Buckets: " << bucketedPairs << " pairs vs "
         << bruteForcePairs << " brute force (" << reduction << "% reduction)" << endl;

    return 0;
}
`,
};
