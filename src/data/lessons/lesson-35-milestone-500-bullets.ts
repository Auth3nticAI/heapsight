import type { Lesson } from "@/types/lesson";

export const lesson35: Lesson = {
  id: "35-milestone-500-bullets",
  title: "Milestone: 500 Bullets",
  description: "Prove your systems handle 500 simultaneous bullets without stutter.",
  order: 35,
  xpReward: 300,
  tier: "pro",
  concepts: ["performance testing", "batch processing", "SoA iteration", "pool allocation", "system pipeline"],
  part1: {
    title: "Concept: Performance Measurement",
    type: "concept",
    instructions: `# Measuring Performance — Why Guessing Fails

You cannot optimize what you cannot measure. "It feels fast" is not engineering. C++ gives you \\\`<chrono>\\\` for microsecond-precise timing.

## The Problem

Two approaches to processing 500 elements:
1. **Naive:** Allocate each element individually in a loop
2. **Pre-allocated:** Fill a pre-sized array

Both produce the same result. One can be 10-100x faster. Without measurement, you would never know which — or by how much.

## How chrono Works

\\\`\\\`\\\`
auto start = chrono::high_resolution_clock::now();
// ... work ...
auto end = chrono::high_resolution_clock::now();
auto elapsed = chrono::duration_cast<chrono::microseconds>(end - start).count();
\\\`\\\`\\\`

\\\`high_resolution_clock::now()\\\` captures a timestamp. Subtracting two timestamps gives a duration. \\\`duration_cast<microseconds>\\\` converts to a human-readable number.

## Your Task

1. Create a pre-allocated array of 500 ints
2. Measure the time to fill all 500 elements with their index value (array[i] = i)
3. Measure the time to sum all 500 elements
4. Print the timing for each phase in microseconds
5. Print the total sum to verify correctness (should be 124750)

Expected output format:
\\\`\\\`\\\`
FILL|count|500|time_us|<number>
SUM|result|124750|time_us|<number>
PERF|total_elements|500|phases|2
\\\`\\\`\\\`

The exact microsecond values will vary per machine — that is the point. You are measuring, not guessing.`,
    starterCode: `#include <iostream>
#include <chrono>
using namespace std;

int main() {
    const int COUNT = 500;
    int data[COUNT];

    // TODO: Record start time using chrono::high_resolution_clock

    // TODO: Fill array with index values (data[i] = i)

    // TODO: Record end time, calculate elapsed microseconds

    // TODO: Print FILL|count|500|time_us|<elapsed>

    // TODO: Record start time for sum phase

    // TODO: Sum all elements in the array

    // TODO: Record end time, calculate elapsed microseconds

    // TODO: Print SUM|result|124750|time_us|<elapsed>

    // TODO: Print PERF|total_elements|500|phases|2

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <chrono>
using namespace std;

int main() {
    const int COUNT = 500;
    int data[COUNT];

    auto startFill = chrono::high_resolution_clock::now();
    for (int i = 0; i < COUNT; i++) {
        data[i] = i;
    }
    auto endFill = chrono::high_resolution_clock::now();
    auto fillTime = chrono::duration_cast<chrono::microseconds>(endFill - startFill).count();

    cout << "FILL|count|500|time_us|" << fillTime << endl;

    auto startSum = chrono::high_resolution_clock::now();
    long long total = 0;
    for (int i = 0; i < COUNT; i++) {
        total += data[i];
    }
    auto endSum = chrono::high_resolution_clock::now();
    auto sumTime = chrono::duration_cast<chrono::microseconds>(endSum - startSum).count();

    cout << "SUM|result|" << total << "|time_us|" << sumTime << endl;
    cout << "PERF|total_elements|500|phases|2" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should fill 500 elements and report timing", expectedOutput: "FILL\\|count\\|500\\|time_us\\|\\d+", isPattern: true },
      { id: "t2", description: "Should sum to 124750 and report timing", expectedOutput: "SUM\\|result\\|124750\\|time_us\\|\\d+", isPattern: true },
      { id: "t3", description: "Should print performance summary", expectedOutput: "PERF|total_elements|500|phases|2" },
    ],
    hints: [
      "Use `auto start = chrono::high_resolution_clock::now();` to capture a timestamp before each phase.",
      "Use `chrono::duration_cast<chrono::microseconds>(end - start).count()` to get elapsed time as an integer.",
      "Sum of 0..499 = 499 * 500 / 2 = 124750. Use `long long` for the accumulator to avoid overflow.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Game: 500 Bullets Stress Test",
    type: "game_builder",
    instructions: `# Game Builder: 500 Bullets Stress Test

This is a milestone. You will pre-allocate a pool of 600 entities, spawn 500 bullets and 50 enemies, then run 3 simulation frames processing movement, collision, and cleanup. This proves your SoA + pool architecture scales.

## Your Task
1. Pre-allocate SoA arrays of size 600: \\\`x[600]\\\`, \\\`y[600]\\\`, \\\`hp[600]\\\`, \\\`type[600]\\\` (0=empty, 1=bullet, 2=enemy), \\\`alive[600]\\\`
2. Spawn 50 enemies in a grid: 10 columns x 5 rows, starting at (40,40), spacing 32px apart
3. Spawn 500 bullets spread across the screen: x = (i % 50) * 8, y = 300 + (i / 50) * 4
4. Run 3 simulation frames. Each frame:
   - Move all bullets up by 16 (y -= 16)
   - Move all enemies down by 8 (y += 8)
   - Check collisions: each bullet vs each enemy (AABB with width=6, height=6 for bullets, width=18, height=18 for enemies)
   - Mark dead entities (bullet hp=0 on hit, enemy hp decremented)
   - Cleanup: mark entities with hp <= 0 as not alive
5. After each frame print: \\\`FRAME|<n>|entities|<alive_count>|bullets|<bullet_count>|enemies|<enemy_count>|collisions_checked|<checks>\\\`
6. After all frames print: \\\`PERF|total_entities|550|frames|3|pool_size|600|utilization|91%\\\`
7. Print: \\\`MILESTONE_35|PASS|500 bullets processed across 3 frames\\\``,
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
//       Return number of collision checks performed

// TODO: Write cleanupSystem(count) — set alive=false for hp<=0

// TODO: Write countByType(count, typeVal) — count alive entities of given type

int main() {
    int count = 0;

    // Spawn 50 enemies in grid formation
    // Spawn 500 bullets in spread pattern

    // Run 3 frames: move, collide, cleanup, print stats

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
      { id: "t1", description: "Should process frame 1", expectedOutput: "FRAME\\|1\\|entities\\|\\d+\\|bullets\\|\\d+\\|enemies\\|\\d+\\|collisions_checked\\|\\d+", isPattern: true },
      { id: "t2", description: "Should process frame 2", expectedOutput: "FRAME\\|2\\|entities\\|\\d+\\|bullets\\|\\d+\\|enemies\\|\\d+\\|collisions_checked\\|\\d+", isPattern: true },
      { id: "t3", description: "Should process frame 3", expectedOutput: "FRAME\\|3\\|entities\\|\\d+\\|bullets\\|\\d+\\|enemies\\|\\d+\\|collisions_checked\\|\\d+", isPattern: true },
      { id: "t4", description: "Should show performance summary", expectedOutput: "PERF\\|total_entities\\|550\\|frames\\|3\\|pool_size\\|600\\|utilization\\|91%", isPattern: true },
      { id: "t5", description: "Should pass milestone", expectedOutput: "MILESTONE_35|PASS|500 bullets processed across 3 frames" },
    ],
    hints: [
      "Spawn enemies first (indices 0-49), then bullets (indices 50-549). Total count = 550.",
      "collisionSystem checks each alive bullet against each alive enemy. Use AABB: bullet 6x6, enemy 18x18.",
      "cleanupSystem marks entities with hp <= 0 as not alive. Bullets die on hit (hp=0), enemies take 3 hits (hp starts at 3).",
    ],
    estimatedMinutes: 15,
  },
};
