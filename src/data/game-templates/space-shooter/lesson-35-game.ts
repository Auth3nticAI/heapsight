import type { GameLessonVariant } from "@/types/game";

export const lesson35SpaceShooter: GameLessonVariant = {
  lessonId: "35-milestone-500-bullets",
  instructions: `# 500 Bullets No Stutter — Your Pool Either Scales or It Doesn't

This is the milestone. 500 bullets. 50 enemies. 3 frames. One pre-allocated pool. No dynamic allocation during simulation. Every entity lives in flat SoA arrays sized at spawn time. The pool is 600 slots. You use 550. That is 91% utilization with headroom for particle bursts.

The architecture is simple. Parallel arrays for x, y, hp, type, alive. One index maps to one entity across all arrays. Systems iterate the entire pool with a single for-loop per pass. No pointer chasing. No vtable dispatch. No heap allocation in the hot path. This is how you ship 60fps on constrained hardware.

## What Breaks Without This

Allocate 500 bullets with \\\`new\\\` each frame and your frame time spikes to milliseconds. The allocator fragments the heap. Cache lines load garbage between your entities. The CPU stalls waiting for memory. You drop frames. The player sees stutter. One allocation in the hot path and you lose.

## The Fix

Pre-allocate everything. SoA layout means the movement system touches x[] and y[] in sequence — two cache lines, perfectly linear. The collision system reads x[], y[], type[], alive[] — four linear scans. No indirection. No branching on polymorphic types. The data tells the CPU exactly what comes next.

\\\`moveSystem()\\\` iterates 550 entities. Bullets get y -= 16. Enemies get y += 8. One conditional per entity. \\\`collisionSystem()\\\` is O(bullets * enemies) — that is 25,000 checks per frame in the worst case. AABB overlap: bullet 6x6, enemy 18x18. On a hit, bullet hp goes to 0, enemy hp decrements. \\\`cleanupSystem()\\\` sweeps once: anything with hp <= 0 gets alive = false. The slot stays allocated. Next spawn reuses it.

## Your Task

1. Declare SoA arrays of size 600: \\\`x[]\\\`, \\\`y[]\\\`, \\\`hp[]\\\`, \\\`type[]\\\` (0=empty, 1=bullet, 2=enemy), \\\`alive[]\\\`
2. Spawn 50 enemies in a 10x5 grid starting at (40,40) with 32px spacing — \\\`type=2\\\`, \\\`hp=3\\\`
3. Spawn 500 bullets: \\\`x = (i % 50) * 8\\\`, \\\`y = 300 + (i / 50) * 4\\\` — \\\`type=1\\\`, \\\`hp=1\\\`
4. Run 3 frames. Each frame: moveSystem, collisionSystem (returns check count), cleanupSystem
5. After each frame print: \\\`FRAME|<n>|entities|<alive>|bullets|<count>|enemies|<count>|collisions_checked|<checks>\\\`
6. After all frames: \\\`PERF|total_entities|550|frames|3|pool_size|600|utilization|91%\\\`
7. Final: \\\`MILESTONE_35|PASS|500 bullets processed across 3 frames\\\`

## Beginner Trap

**Common Mistake:** Using \\\`type\\\` as a variable name conflicts with some standard library macros on certain compilers. If you get a cryptic error, rename to \\\`etype\\\` or use a namespace. In this lesson \\\`type\\\` as a global array is fine in practice, but know the risk.

## Elite Insight

This is the same memory layout used in particle systems across the industry. Unreal's Niagara, Unity's VFX Graph, and every custom engine particle system uses SoA pools. You just built the same architecture at a smaller scale. The pattern does not change — only the entity count.

## Cross-Path Echo

Database column stores (Parquet, Arrow) use the same SoA principle. Instead of rows of mixed-type records, they store columns of homogeneous data. The performance win is identical: sequential memory access beats random access everywhere, from game engines to data warehouses.`,
  starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 600;

// SoA entity arrays
int x[POOL_SIZE];
int y[POOL_SIZE];
int hp[POOL_SIZE];
int type[POOL_SIZE];   // 0=empty, 1=bullet, 2=enemy
bool alive[POOL_SIZE];

// TODO: Write spawnEnemy(index, px, py) — sets type=2, hp=3, alive=true

// TODO: Write spawnBullet(index, px, py) — sets type=1, hp=1, alive=true

// TODO: Write moveSystem(count) — bullets y-=16, enemies y+=8

// TODO: Write collisionSystem(count) — check each bullet vs each enemy
//       AABB: bullet 6x6, enemy 18x18
//       On hit: bullet hp=0, enemy hp--
//       Return total collision checks performed

// TODO: Write cleanupSystem(count) — set alive=false for hp<=0

// TODO: Write countByType(count, typeVal) — count alive entities of given type

int main() {
    int count = 0;

    // Spawn 50 enemies in 10x5 grid at (40,40) with 32px spacing
    // Spawn 500 bullets: x = (i%50)*8, y = 300 + (i/50)*4

    // Run 3 frames: move, collide, cleanup, print diagnostics

    // Print PERF summary
    // Print MILESTONE_35 pass message

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 600;

int x[POOL_SIZE];
int y[POOL_SIZE];
int hp[POOL_SIZE];
int type[POOL_SIZE];
bool alive[POOL_SIZE];

void spawnEnemy(int idx, int px, int py) {
    x[idx] = px;
    y[idx] = py;
    hp[idx] = 3;
    type[idx] = 2;
    alive[idx] = true;
}

void spawnBullet(int idx, int px, int py) {
    x[idx] = px;
    y[idx] = py;
    hp[idx] = 1;
    type[idx] = 1;
    alive[idx] = true;
}

void moveSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (type[i] == 1) y[i] -= 16;
        if (type[i] == 2) y[i] += 8;
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

    for (int row = 0; row < 5; row++) {
        for (int col = 0; col < 10; col++) {
            spawnEnemy(count, 40 + col * 32, 40 + row * 32);
            count++;
        }
    }

    for (int i = 0; i < 500; i++) {
        spawnBullet(count, (i % 50) * 8, 300 + (i / 50) * 4);
        count++;
    }

    for (int frame = 1; frame <= 3; frame++) {
        moveSystem(count);
        int checks = collisionSystem(count);
        cleanupSystem(count);
        int bullets = countByType(count, 1);
        int enemies = countByType(count, 2);
        int aliveCount = bullets + enemies;
        cout << "FRAME|" << frame << "|entities|" << aliveCount
             << "|bullets|" << bullets << "|enemies|" << enemies
             << "|collisions_checked|" << checks << endl;
    }

    cout << "PERF|total_entities|550|frames|3|pool_size|600|utilization|91%" << endl;
    cout << "MILESTONE_35|PASS|500 bullets processed across 3 frames" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Frame 1: Should process entities and report stats", expectedOutput: "FRAME\\|1\\|entities\\|\\d+\\|bullets\\|\\d+\\|enemies\\|\\d+\\|collisions_checked\\|\\d+", isPattern: true },
    { id: "g2", description: "Frame 2: Should process entities and report stats", expectedOutput: "FRAME\\|2\\|entities\\|\\d+\\|bullets\\|\\d+\\|enemies\\|\\d+\\|collisions_checked\\|\\d+", isPattern: true },
    { id: "g3", description: "Frame 3: Should process entities and report stats", expectedOutput: "FRAME\\|3\\|entities\\|\\d+\\|bullets\\|\\d+\\|enemies\\|\\d+\\|collisions_checked\\|\\d+", isPattern: true },
    { id: "g4", description: "Should report pool performance summary", expectedOutput: "PERF\\|total_entities\\|550\\|frames\\|3\\|pool_size\\|600\\|utilization\\|91%", isPattern: true },
    { id: "g5", description: "Should pass milestone", expectedOutput: "MILESTONE_35\\|PASS\\|500 bullets processed across 3 frames", isPattern: true },
  ],
  hints: [
    "Spawn enemies at indices 0-49 using nested loops (5 rows x 10 cols). Spawn bullets at indices 50-549. Total count = 550.",
    "collisionSystem: outer loop finds alive bullets, inner loop finds alive enemies. AABB overlap with bullet 6x6 and enemy 18x18. On hit, set bullet hp=0 and decrement enemy hp, then break inner loop.",
    "cleanupSystem sweeps all indices: if alive and hp <= 0, set alive = false. countByType counts alive entities matching the given type value.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 600;

int x[POOL_SIZE];
int y[POOL_SIZE];
int hp[POOL_SIZE];
int type[POOL_SIZE];
bool alive[POOL_SIZE];

void spawnEnemy(int idx, int px, int py) {
    x[idx] = px;
    y[idx] = py;
    hp[idx] = 3;
    type[idx] = 2;
    alive[idx] = true;
}

void spawnBullet(int idx, int px, int py) {
    x[idx] = px;
    y[idx] = py;
    hp[idx] = 1;
    type[idx] = 1;
    alive[idx] = true;
}

void moveSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (type[i] == 1) y[i] -= 16;
        if (type[i] == 2) y[i] += 8;
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
    for (int row = 0; row < 5; row++) {
        for (int col = 0; col < 10; col++) {
            spawnEnemy(count, 40 + col * 32, 40 + row * 32);
            count++;
        }
    }
    for (int i = 0; i < 500; i++) {
        spawnBullet(count, (i % 50) * 8, 300 + (i / 50) * 4);
        count++;
    }
    for (int frame = 1; frame <= 3; frame++) {
        moveSystem(count);
        int checks = collisionSystem(count);
        cleanupSystem(count);
        int bullets = countByType(count, 1);
        int enemies = countByType(count, 2);
        int aliveCount = bullets + enemies;
        cout << "FRAME|" << frame << "|entities|" << aliveCount
             << "|bullets|" << bullets << "|enemies|" << enemies
             << "|collisions_checked|" << checks << endl;
    }
    cout << "PERF|total_entities|550|frames|3|pool_size|600|utilization|91%" << endl;
    cout << "MILESTONE_35|PASS|500 bullets processed across 3 frames" << endl;
    return 0;
}
`,
};
