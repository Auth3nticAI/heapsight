import type { GameLessonVariant } from "@/types/game";

export const lesson41SpaceShooter: GameLessonVariant = {
  lessonId: "41-collision-basics",
  instructions: `# AABB Collision — Bullets Pass Through Enemies

Your bullets fly. Your enemies drift. Nothing happens when they overlap. Without collision detection, the game has no interaction. No hits, no kills, no score. Every entity is a ghost.

## What Breaks Without This

Bullets and enemies occupy the same pixels and nothing registers. The player fires into a wall of enemies and nothing dies. The game loop runs movement, rendering, cleanup — but skips the step that makes it a game. Without AABB testing between bullet-enemy pairs, there is no gameplay.

## The Fix

AABB collision. Four integer comparisons per pair. For each alive bullet, test against each alive enemy. If the bounding boxes overlap, it is a hit. The broad phase is trivial: skip dead entities. One \\\`if (!alive)\\\` check saves the entire inner loop for that entity.

With 5 bullets and 3 enemies, the worst case is 15 tests. But bullet 1 is dead — skip its 3 tests entirely. That is the broad phase. Cheap, effective, and the pattern scales to hundreds of entities with spatial partitioning later.

## Your Task

1. SoA arrays for 5 bullets: \\\`bx[]\\\`, \\\`by[]\\\`, \\\`bw[]\\\`, \\\`bh[]\\\`, \\\`balive[]\\\`
2. SoA arrays for 3 enemies: \\\`ex[]\\\`, \\\`ey[]\\\`, \\\`ew[]\\\`, \\\`eh[]\\\`, \\\`ealive[]\\\`
3. Spawn 5 bullets: x=100,150,200,250,300, y=200, w=6, h=6. Bullet 1 is dead
4. Spawn 3 enemies: x=95,195,295, y=195, w=20, h=20. All alive
5. Write \\\`checkAABB\\\` returning bool
6. Collision loop: alive bullets vs alive enemies. Dead bullets skip entirely (add enemy count to skipped)
7. On hit: \\\`COLLISION|bullet_<b>|enemy_<e>|overlap|true\\\`
8. On miss: \\\`COLLISION|bullet_<b>|enemy_<e>|overlap|false\\\`
9. After all: \\\`COLLISION_STATS|tests|<n>|hits|<n>|skipped|<n>\\\`
10. Print \\\`SCORE|0\\\`

## Beginner Trap

**Common Mistake:** Getting the AABB condition wrong. It is NOT \\\`a.x > b.x && a.x < b.x + b.w\\\`. That tests if a corner is inside b. The correct test checks if the projections on both axes overlap: \\\`a.x < b.x + b.w && a.x + a.w > b.x\\\`. One checks the left edge, the other checks the right edge.

## Elite Insight

The broad phase — skipping dead entities — is the simplest spatial optimization. In a real engine, you would partition space into a grid. Each cell contains entity indices. You only test pairs that share a cell. This reduces O(N*M) to O(K) where K is the number of colocated pairs. But even grid-based broad phase uses AABB for the final narrow phase test.

## Cross-Path Echo

Database query optimizers do the same thing. Before running an expensive join, the optimizer checks if the key ranges even overlap. If table A has keys 1-100 and table B has keys 200-300, skip the join entirely. Broad phase filtering is universal across computing.`,
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
    { id: "g1", description: "Bullet 0 should hit Enemy 0", expectedOutput: "COLLISION\\|bullet_0\\|enemy_0\\|overlap\\|true", isPattern: true },
    { id: "g2", description: "Bullet 2 should hit Enemy 1", expectedOutput: "COLLISION\\|bullet_2\\|enemy_1\\|overlap\\|true", isPattern: true },
    { id: "g3", description: "Bullet 4 should hit Enemy 2", expectedOutput: "COLLISION\\|bullet_4\\|enemy_2\\|overlap\\|true", isPattern: true },
    { id: "g4", description: "Should report collision stats", expectedOutput: "COLLISION_STATS\\|tests\\|12\\|hits\\|3\\|skipped\\|3", isPattern: true },
    { id: "g5", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "Dead bullet 1 skips all 3 enemy tests. That is 3 skipped. The remaining 4 alive bullets test against 3 alive enemies = 12 actual AABB tests.",
    "checkAABB: ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by. All four conditions must be true for overlap.",
    "Bullet 0 at (100,200,6,6) vs Enemy 0 at (95,195,20,20): 100 < 115 and 106 > 95 and 200 < 215 and 206 > 195 — all true, hit.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 600;
const int FIXED_DT = 16;

int x[POOL_SIZE];
int y[POOL_SIZE];
int w[POOL_SIZE];
int h[POOL_SIZE];
int vx[POOL_SIZE];
int vy[POOL_SIZE];
int hp[POOL_SIZE];
int type[POOL_SIZE];
bool alive[POOL_SIZE];

void spawnEnemy(int idx, int px, int py) {
    x[idx] = px;
    y[idx] = py;
    w[idx] = 20;
    h[idx] = 20;
    vx[idx] = 0;
    vy[idx] = 4;
    hp[idx] = 3;
    type[idx] = 2;
    alive[idx] = true;
}

void spawnBullet(int idx, int px, int py) {
    x[idx] = px;
    y[idx] = py;
    w[idx] = 6;
    h[idx] = 6;
    vx[idx] = 0;
    vy[idx] = -16;
    hp[idx] = 1;
    type[idx] = 1;
    alive[idx] = true;
}

bool checkAABB(int ax, int ay, int aw, int ah, int bx, int by, int bw, int bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
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
        if (type[i] == 1 && y[i] < 0) {
            alive[i] = false;
        }
    }
}

int collisionSystem(int count) {
    int hits = 0;
    for (int b = 0; b < count; b++) {
        if (!alive[b] || type[b] != 1) continue;
        for (int e = 0; e < count; e++) {
            if (!alive[e] || type[e] != 2) continue;
            if (checkAABB(x[b], y[b], w[b], h[b], x[e], y[e], w[e], h[e])) {
                hp[b] = 0;
                hp[e]--;
                hits++;
                break;
            }
        }
    }
    return hits;
}

void cleanupSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (alive[i] && hp[i] <= 0) {
            alive[i] = false;
        }
    }
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

    for (int i = 0; i < 5; i++) {
        spawnEnemy(count, 80 + i * 40, 60);
        count++;
    }
    for (int i = 0; i < 5; i++) {
        spawnBullet(count, 200, 300 - i * 4);
        count++;
    }

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
            int hits = collisionSystem(count);
            cleanupSystem(count);
            accumulator -= FIXED_DT;
            stepsThisFrame++;
            totalSteps++;
        }
        int bullets = countByType(count, 1);
        int enemies = countByType(count, 2);
        cout << "FRAME|" << (f + 1) << "|steps|" << stepsThisFrame
             << "|bullets|" << bullets << "|enemies|" << enemies << endl;
    }

    cout << "PIPELINE|movement|formation|bounds|collision|cleanup" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
