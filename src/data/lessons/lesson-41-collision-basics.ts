import type { Lesson } from "@/types/lesson";

export const lesson41: Lesson = {
  id: "41-collision-basics",
  title: "Collision Basics",
  description: "Implement AABB collision detection between all entity pairs.",
  order: 41,
  xpReward: 175,
  tier: "pro",
  concepts: ["AABB collision", "broad phase", "pair testing", "overlap detection"],
  part1: {
    title: "Concept: AABB Collision Detection",
    type: "concept",
    instructions: `# AABB Collision — Four Comparisons, Zero Ambiguity

Two axis-aligned rectangles overlap when all four of these are true simultaneously:

\\\`\\\`\\\`
a.x < b.x + b.w
a.x + a.w > b.x
a.y < b.y + b.h
a.y + a.h > b.y
\\\`\\\`\\\`

If any one fails, the rectangles do not overlap. This is the cheapest collision test that exists. No square roots. No trigonometry. Four comparisons and a boolean AND. Every 2D game engine uses AABB as the first pass.

## Why AABB

Circle-circle tests need a square root (or squared distance comparison). Polygon tests need separating axis theorem. AABB is four integer comparisons. On a modern CPU, this is one cycle. When you are testing thousands of pairs per frame, the cost of each individual test matters. AABB is the broad phase filter that eliminates 99% of pairs before you ever run an expensive check.

## Pair Testing

With N entities, naive all-pairs is N*(N-1)/2 tests. Four rectangles means 6 unique pairs. This is O(N^2). For small N it is fine. For large N you need spatial partitioning — grids, quadtrees. But the per-pair test is always AABB.

## Your Task

1. Create 4 rectangles as parallel arrays: \\\`rx[4]\\\`, \\\`ry[4]\\\`, \\\`rw[4]\\\`, \\\`rh[4]\\\`
2. Initialize:
   - Rect 0: x=10, y=10, w=50, h=50
   - Rect 1: x=40, y=40, w=50, h=50 (overlaps 0)
   - Rect 2: x=200, y=200, w=30, h=30 (isolated)
   - Rect 3: x=220, y=210, w=40, h=40 (overlaps 2)
3. Write \\\`bool checkAABB(int ax, int ay, int aw, int ah, int bx, int by, int bw, int bh)\\\` — returns true if overlapping
4. Test all unique pairs (i < j). Print each result: \\\`COLLISION|<i>|<j>|<true/false>\\\`
5. Count total collisions and print: \\\`COLLISION_MATRIX|pairs_tested|6|collisions|2\\\`

Expected output:
\\\`\\\`\\\`
COLLISION|0|1|true
COLLISION|0|2|false
COLLISION|0|3|false
COLLISION|1|2|false
COLLISION|1|3|false
COLLISION|2|3|true
COLLISION_MATRIX|pairs_tested|6|collisions|2
\\\`\\\`\\\`

Rect 0 and 1 overlap (40 < 10+50 and 40+50 > 10, same for y). Rect 2 and 3 overlap (220 < 200+30 and 220+40 > 200, same for y). All other pairs are too far apart.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Write checkAABB(ax, ay, aw, ah, bx, by, bw, bh)
//       Return true if two rectangles overlap
//       a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y

int main() {
    const int COUNT = 4;
    int rx[] = {10, 40, 200, 220};
    int ry[] = {10, 40, 200, 210};
    int rw[] = {50, 50, 30, 40};
    int rh[] = {50, 50, 30, 40};

    // TODO: Test all unique pairs (i < j)
    // Print COLLISION|<i>|<j>|<true/false>
    // Count collisions
    // Print COLLISION_MATRIX summary

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

bool checkAABB(int ax, int ay, int aw, int ah, int bx, int by, int bw, int bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

int main() {
    const int COUNT = 4;
    int rx[] = {10, 40, 200, 220};
    int ry[] = {10, 40, 200, 210};
    int rw[] = {50, 50, 30, 40};
    int rh[] = {50, 50, 30, 40};

    int pairsTested = 0;
    int collisions = 0;

    for (int i = 0; i < COUNT; i++) {
        for (int j = i + 1; j < COUNT; j++) {
            bool hit = checkAABB(rx[i], ry[i], rw[i], rh[i], rx[j], ry[j], rw[j], rh[j]);
            cout << "COLLISION|" << i << "|" << j << "|" << (hit ? "true" : "false") << endl;
            pairsTested++;
            if (hit) collisions++;
        }
    }

    cout << "COLLISION_MATRIX|pairs_tested|" << pairsTested << "|collisions|" << collisions << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Rect 0 and 1 should overlap", expectedOutput: "COLLISION|0|1|true" },
      { id: "t2", description: "Rect 0 and 2 should not overlap", expectedOutput: "COLLISION|0|2|false" },
      { id: "t3", description: "Rect 2 and 3 should overlap", expectedOutput: "COLLISION|2|3|true" },
      { id: "t4", description: "Should report 6 pairs tested and 2 collisions", expectedOutput: "COLLISION_MATRIX|pairs_tested|6|collisions|2" },
    ],
    hints: [
      "AABB overlap requires ALL four conditions true: a.x < b.x+b.w AND a.x+a.w > b.x AND a.y < b.y+b.h AND a.y+a.h > b.y.",
      "Use nested loops with j starting at i+1 to avoid testing a pair twice. 4 rects = 6 unique pairs.",
      "Rect 0 (10,10,50,50) vs Rect 1 (40,40,50,50): 10 < 90 yes, 60 > 40 yes, 10 < 90 yes, 60 > 40 yes — overlap.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: AABB Collision System",
    type: "game_builder",
    instructions: `# Game Builder: Bullet-Enemy Collision

Wire AABB collision into your space shooter. Every frame, test each alive bullet against each alive enemy. Skip dead entities — that is your broad phase. Count tests, hits, and skips.

## Your Task
1. SoA arrays for bullets (5): \\\`bx[]\\\`, \\\`by[]\\\`, \\\`bw[]\\\`, \\\`bh[]\\\`, \\\`balive[]\\\`
2. SoA arrays for enemies (3): \\\`ex[]\\\`, \\\`ey[]\\\`, \\\`ew[]\\\`, \\\`eh[]\\\`, \\\`ealive[]\\\`
3. Spawn 5 bullets: x=100,150,200,250,300, y=200, w=6, h=6. Bullet 1 (index 1) is dead (alive=false)
4. Spawn 3 enemies: x=95,195,295, y=195, w=20, h=20. All alive
5. Write \\\`checkAABB(ax, ay, aw, ah, bx, by, bw, bh)\\\` returning bool
6. Write collision loop: for each alive bullet, for each alive enemy, test AABB. Track tests, hits, skipped
7. On hit print: \\\`COLLISION|bullet_<b>|enemy_<e>|overlap|true\\\`
8. On miss print: \\\`COLLISION|bullet_<b>|enemy_<e>|overlap|false\\\`
9. Skip dead bullets entirely (increment skipped counter per dead bullet by enemy count)
10. After all tests print: \\\`COLLISION_STATS|tests|<n>|hits|<n>|skipped|<n>\\\`
11. Print: \\\`SCORE|0\\\`

Bullet 0 at (100,200) vs Enemy 0 at (95,195,20,20): 100 < 115 yes, 106 > 95 yes, 200 < 215 yes, 206 > 195 yes — hit.
Bullet 1 is dead — skip 3 tests.
Bullet 2 at (200,200) vs Enemy 1 at (195,195,20,20): hit.
Bullet 4 at (300,200) vs Enemy 2 at (295,195,20,20): hit.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Write checkAABB(ax, ay, aw, ah, bx, by, bw, bh)

int main() {
    const int BULLET_COUNT = 5;
    const int ENEMY_COUNT = 3;

    int bx[] = {100, 150, 200, 250, 300};
    int by[] = {200, 200, 200, 200, 200};
    int bw[] = {6, 6, 6, 6, 6};
    int bh[] = {6, 6, 6, 6, 6};
    bool balive[] = {true, false, true, true, true};

    int ex[] = {95, 195, 295};
    int ey[] = {195, 195, 195};
    int ew[] = {20, 20, 20};
    int eh[] = {20, 20, 20};
    bool ealive[] = {true, true, true};

    // TODO: For each bullet:
    //   If not alive, add ENEMY_COUNT to skipped, continue
    //   For each alive enemy, test AABB
    //   Print COLLISION line for each test
    //   Track tests, hits, skipped

    // TODO: Print COLLISION_STATS
    // TODO: Print SCORE|0

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

bool checkAABB(int ax, int ay, int aw, int ah, int bx, int by, int bw, int bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

int main() {
    const int BULLET_COUNT = 5;
    const int ENEMY_COUNT = 3;

    int bx[] = {100, 150, 200, 250, 300};
    int by[] = {200, 200, 200, 200, 200};
    int bw[] = {6, 6, 6, 6, 6};
    int bh[] = {6, 6, 6, 6, 6};
    bool balive[] = {true, false, true, true, true};

    int ex[] = {95, 195, 295};
    int ey[] = {195, 195, 195};
    int ew[] = {20, 20, 20};
    int eh[] = {20, 20, 20};
    bool ealive[] = {true, true, true};

    int tests = 0;
    int hits = 0;
    int skipped = 0;

    for (int b = 0; b < BULLET_COUNT; b++) {
        if (!balive[b]) {
            skipped += ENEMY_COUNT;
            continue;
        }
        for (int e = 0; e < ENEMY_COUNT; e++) {
            if (!ealive[e]) {
                skipped++;
                continue;
            }
            tests++;
            bool hit = checkAABB(bx[b], by[b], bw[b], bh[b], ex[e], ey[e], ew[e], eh[e]);
            cout << "COLLISION|bullet_" << b << "|enemy_" << e << "|overlap|" << (hit ? "true" : "false") << endl;
            if (hit) hits++;
        }
    }

    cout << "COLLISION_STATS|tests|" << tests << "|hits|" << hits << "|skipped|" << skipped << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Bullet 0 should hit Enemy 0", expectedOutput: "COLLISION\\|bullet_0\\|enemy_0\\|overlap\\|true", isPattern: true },
      { id: "t2", description: "Bullet 2 should hit Enemy 1", expectedOutput: "COLLISION\\|bullet_2\\|enemy_1\\|overlap\\|true", isPattern: true },
      { id: "t3", description: "Bullet 4 should hit Enemy 2", expectedOutput: "COLLISION\\|bullet_4\\|enemy_2\\|overlap\\|true", isPattern: true },
      { id: "t4", description: "Should report collision stats with skipped tests", expectedOutput: "COLLISION_STATS\\|tests\\|12\\|hits\\|3\\|skipped\\|3", isPattern: true },
      { id: "t5", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
    ],
    hints: [
      "Dead bullet 1 skips all 3 enemy tests. That is 3 skipped. The remaining 4 alive bullets each test 3 alive enemies = 12 actual tests.",
      "checkAABB: ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by. All four conditions must be true.",
      "Bullets near enemies (within 20px) will hit. Bullet 0 at x=100 vs Enemy 0 at x=95,w=20: 100 < 115 and 106 > 95 — overlap on x axis.",
    ],
    estimatedMinutes: 10,
  },
};
