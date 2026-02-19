import type { Lesson } from "@/types/lesson";

export const lesson20: Lesson = {
  id: "20-spatial-buckets-v0",
  title: "Spatial Buckets v0",
  description: "Divide screen into buckets. Assign entities by position. Collision cost drops from O(n\u00B2) to O(n \u00D7 bucket_size).",
  order: 20,
  xpReward: 125,
  tier: "pro",
  concepts: ["spatial partitioning", "bucket sort", "collision optimization", "O(n) binning"],
  part1: {
    title: "Concept: Spatial Buckets v0",
    type: "concept",
    instructions: `# Spatial Buckets v0

Divide the screen into buckets. Each entity goes in its bucket based on position. Collision only checks within the same bucket. O(n\u00B2) becomes O(n \u00D7 bucket_size).

## Mental Model

The screen is 400 pixels wide. Split it into 4 buckets of 100px each. Bucket 0: x in [0,99]. Bucket 1: x in [100,199]. Bucket 2: x in [200,299]. Bucket 3: x in [300,399]. Assignment is one integer division per entity: \\\`bucket = x / bucketWidth\\\`.

## What Breaks

Without spatial partitioning, collision checks every bullet against every enemy. 100 bullets \u00D7 100 enemies = 10,000 checks per frame. At 60fps = 600,000 checks/sec. Stuttering. Frame drops. Death spiral.

## The Fix

Divide screen into 4 horizontal buckets (0-99, 100-199, 200-299, 300-399). Assign each enemy to its bucket based on x position. Count entities per bucket. Compare brute force pair count vs bucketed pair count.

\\\`\\\`\\\`cpp
int getBucket(int x, int bucketWidth) {
    return x / bucketWidth;
}
\\\`\\\`\\\`

Brute force pairs: n*(n-1)/2. Bucketed pairs: sum of k*(k-1)/2 per bucket where k = count in that bucket.

## Performance Insight

Bucket assignment: one division per entity. O(n). Collision per bucket: k\u00B2 where k \u2248 n/numBuckets. Total: O(n + n\u00B2/buckets). With 4 buckets: 25% of brute force. With 16 buckets: 6.25%. Linear cost to assign, quadratic cost contained per bucket.

## Memory Insight

4 bucket count ints = 16 bytes. Bucket arrays for indices = small. Negligible overhead for massive collision savings.

## Beginner Trap

Entities on bucket boundaries. Entity at x=99 is in bucket 0, entity at x=100 is in bucket 1. They can't collide across buckets. Fix: check adjacent buckets too (lesson 57). For now, accept the boundary limitation.

## Elite Insight

Spatial hashing in production: hash(x/cellSize, y/cellSize) \u2192 bucket. Your buckets are a 1D version. L57 extends to 2D grid. Same principle, more dimensions.

## Systems Thinking Connection

10 enemies. Brute force collision: 10\u00D710 = 100 pairs. 4 buckets with ~2-3 enemies each: 4\u00D7(3\u00D73) = 36 pairs max. Better. 16 buckets: even fewer pairs. Partitioning trades O(n\u00B2) for O(n \u00D7 k) where k = entities per bucket. This is the fundamental insight behind every spatial acceleration structure in games.

## Skill Reinforcement

You know arrays, loops, and integer math. Bucket assignment is just \\\`x / width\\\`. Counting is just incrementing an array element. No new syntax. New way of thinking about data organization.

## Mastery Check

Why is bucket assignment O(n)? One division per entity. No comparisons between entities. Why does collision drop? Each bucket has k \u2248 n/buckets entities. k\u00B2 << n\u00B2 when buckets > 1.

## Your Task

1. Write \\\`getBucket(int x, int bucketWidth)\\\` \u2014 returns x / bucketWidth
2. Place 8 enemies at specific x positions
3. Assign each to a bucket, print assignment
4. Count entities per bucket
5. Calculate brute force pairs vs bucketed pairs
6. Print reduction percentage`,
    starterCode: `#include <iostream>
using namespace std;

const int NUM_ENEMIES = 8;
const int SCREEN_WIDTH = 400;
const int NUM_BUCKETS = 4;
const int BUCKET_WIDTH = SCREEN_WIDTH / NUM_BUCKETS;

// TODO: Write getBucket(int x, int bucketWidth) - returns x / bucketWidth

int main() {
    int enemy_x[NUM_ENEMIES] = {30, 80, 130, 170, 210, 250, 310, 360};
    int bucketCounts[NUM_BUCKETS] = {0, 0, 0, 0};

    cout << "=== SPATIAL BUCKETS ===" << endl;
    cout << "Screen width: " << SCREEN_WIDTH << ", "
         << NUM_BUCKETS << " buckets (width " << BUCKET_WIDTH << " each)" << endl;
    cout << NUM_ENEMIES << " enemies placed:" << endl;

    // TODO: For each enemy, compute bucket, print assignment, increment count

    // TODO: Print bucket counts array

    // TODO: Calculate brute force pairs: n*(n-1)/2
    // TODO: Calculate bucketed pairs: sum of k*(k-1)/2 per bucket
    // TODO: Calculate reduction percentage
    // TODO: Print GAME_MESSAGE with reduction

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

    cout << "=== SPATIAL BUCKETS ===" << endl;
    cout << "Screen width: " << SCREEN_WIDTH << ", "
         << NUM_BUCKETS << " buckets (width " << BUCKET_WIDTH << " each)" << endl;
    cout << NUM_ENEMIES << " enemies placed:" << endl;

    for (int i = 0; i < NUM_ENEMIES; i++) {
        int b = getBucket(enemy_x[i], BUCKET_WIDTH);
        cout << "  e" << i << " at x=" << enemy_x[i] << "  -> bucket " << b << endl;
        bucketCounts[b]++;
    }

    cout << endl;
    cout << "Bucket counts: [" << bucketCounts[0];
    for (int i = 1; i < NUM_BUCKETS; i++) {
        cout << ", " << bucketCounts[i];
    }
    cout << "]" << endl;

    int bruteForcePairs = NUM_ENEMIES * (NUM_ENEMIES - 1) / 2;
    int bucketedPairs = 0;
    for (int i = 0; i < NUM_BUCKETS; i++) {
        bucketedPairs += bucketCounts[i] * (bucketCounts[i] - 1) / 2;
    }

    int reduction = 100 - (bucketedPairs * 100 / bruteForcePairs);

    cout << "Brute force pairs: " << bruteForcePairs << " (" << NUM_ENEMIES << "*" << (NUM_ENEMIES - 1) << "/2)" << endl;
    cout << "Bucketed pairs: " << bucketedPairs << " (" << NUM_BUCKETS << " * " << bucketCounts[0] << "*" << (bucketCounts[0] - 1) << "/2)" << endl;
    cout << "Reduction: " << reduction << "%" << endl;
    cout << "GAME_MESSAGE|Spatial buckets: " << reduction << "% fewer collision checks" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Should assign e0 at x=30 to bucket 0",
        expectedOutput: "e0 at x=30  -> bucket 0",
      },
      {
        id: "t2",
        description: "Should assign e2 at x=130 to bucket 1",
        expectedOutput: "e2 at x=130 -> bucket 1",
      },
      {
        id: "t3",
        description: "Should show bucket counts [2, 2, 2, 2]",
        expectedOutput: "Bucket counts: [2, 2, 2, 2]",
      },
      {
        id: "t4",
        description: "Should show brute force pairs as 28",
        expectedOutput: "Brute force pairs: 28",
      },
      {
        id: "t5",
        description: "Should show bucketed pairs as 4",
        expectedOutput: "Bucketed pairs: 4",
      },
      {
        id: "t6",
        description: "Should show 85% reduction",
        expectedOutput: "Reduction: 85%",
      },
      {
        id: "t7",
        description: "Should show GAME_MESSAGE with reduction",
        expectedOutput: "GAME_MESSAGE\\|Spatial buckets: 85% fewer collision checks",
        isPattern: true,
      },
    ],
    hints: [
      "`getBucket` is just integer division: `return x / bucketWidth;` — 30/100 = 0, 130/100 = 1, 310/100 = 3.",
      "Brute force pairs: `n*(n-1)/2` = 8*7/2 = 28. Each bucket has 2 enemies, so bucketed pairs: 4 * (2*1/2) = 4.",
      "Reduction: `100 - (bucketedPairs * 100 / bruteForcePairs)` = 100 - (4*100/28) = 100 - 14 = 85%.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Spatial Bucket Collision",
    type: "game_builder",
    instructions: `# Game Builder: Spatial Buckets in Action

Apply spatial bucketing to the space shooter. Enemies are assigned to buckets by x position. Show the collision check reduction. This is how real games handle hundreds of entities without frame drops.

## Your Task

1. Place 8 enemies across the screen
2. Assign each to a spatial bucket using \\\`getBucket\\\`
3. Render all enemies as ENTITY protocol
4. Calculate brute force vs bucketed pair counts
5. Show the reduction percentage
6. Output SCORE and GAME_MESSAGE

Expected output:
\\\`\\\`\\\`
ENTITY|hero|player|180|220|24|24|100
ENTITY|e0|enemy|30|60|16|16|50
ENTITY|e1|enemy|80|60|16|16|50
ENTITY|e2|enemy|130|60|16|16|50
ENTITY|e3|enemy|170|60|16|16|50
ENTITY|e4|enemy|210|60|16|16|50
ENTITY|e5|enemy|250|60|16|16|50
ENTITY|e6|enemy|310|60|16|16|50
ENTITY|e7|enemy|360|60|16|16|50
SCORE|0
GAME_MESSAGE|Buckets: 4 pairs vs 28 brute force (85% reduction)
\\\`\\\`\\\``,
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

    // TODO: Calculate brute force and bucketed pairs

    // TODO: Output SCORE and GAME_MESSAGE with reduction

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
        description: "Should render e0 enemy at x=30",
        expectedOutput: "ENTITY\\|e0\\|enemy\\|30\\|60\\|16\\|16\\|50",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Should render e7 enemy at x=360",
        expectedOutput: "ENTITY\\|e7\\|enemy\\|360\\|60\\|16\\|16\\|50",
        isPattern: true,
      },
      {
        id: "g4",
        description: "Should show bucketed vs brute force reduction",
        expectedOutput: "GAME_MESSAGE\\|Buckets: 4 pairs vs 28 brute force \\(85% reduction\\)",
        isPattern: true,
      },
    ],
    hints: [
      "Loop through enemies: render ENTITY and increment `bucketCounts[getBucket(enemy_x[i], BUCKET_WIDTH)]`.",
      "Brute force: `8*7/2 = 28`. Bucketed: 4 buckets with 2 each = `4 * (2*1/2)` = 4.",
      "Reduction: `100 - (4 * 100 / 28)` = 85%.",
    ],
    estimatedMinutes: 8,
  },
};
