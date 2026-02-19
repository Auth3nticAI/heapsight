import type { Lesson } from "@/types/lesson";

export const lesson14: Lesson = {
  id: "14-dynamic-arrays",
  title: "Dynamic Arrays",
  description: "Track count vs capacity. Plan growth. Never silently drop entities.",
  order: 14,
  xpReward: 125,
  tier: "pro",
  concepts: ["dynamic sizing", "capacity vs count", "array growth", "exceeding fixed limits"],
  part1: {
    title: "Concept: Dynamic Arrays",
    type: "concept",
    instructions: `# Dynamic Arrays

## Mental Model

Fixed arrays have limits. When your game needs more entities than MAX_ENTITIES, you need dynamic capacity. But dynamic doesn't mean slow — it means planned growth.

Your entity pool from L10 used \`const int POOL_SIZE = 20\`. That works until it doesn't. The moment your game designer says "wave 3 has 24 enemies," your pool silently drops 4. No crash. No error. Enemies just vanish. The player thinks the game is broken.

## What Breaks

Fixed pool of 20 slots. Wave 1 spawns 8. Wave 2 spawns 8. Wave 3 spawns 8. Total needed: 24. Your 20-slot pool is full 4 enemies ago. \`findFreeSlot\` returns -1. Spawn fails silently. Enemies vanish from the wave. The game feels wrong but produces no error.

## The Fix

Track two numbers: \`count\` (how many active) and \`capacity\` (how many slots exist). When count approaches capacity, log a warning. When count equals capacity, you know exactly why spawns fail. For now, use a larger initial capacity and monitor. True dynamic reallocation comes later.

The pattern:

\`\`\`cpp
// Before spawning:
if (count >= capacity) {
    cout << "WARNING: pool full, cannot spawn!" << endl;
    return;
}
\`\`\`

## TargetFile: src/main.cpp

Simulate two scenarios. First: capacity 20, three waves of 8. Watch it fail. Second: capacity 32, same three waves. Watch it succeed. The difference is one number. But that number is the difference between a working game and a broken one.

## Performance Insight

Checking \`count < capacity\` before every spawn: one integer comparison. One CPU cycle. Failing to check: undefined behavior. Buffer overwrite. Data corruption. One cycle of prevention vs hours of debugging.

## Memory Insight

32 Position structs at 8 bytes each = 256 bytes. 32 Health structs at 8 bytes each = 256 bytes. Total pool footprint: ~1KB. Still fits entirely in L1 cache. Doubling capacity from 20 to 32 costs 400 extra bytes. That's nothing.

## Your Task

1. Simulate a pool with capacity 20. Spawn 3 waves of 8 enemies each.
2. Track \`count\` — increment on each successful spawn.
3. When \`count >= capacity\`, print a WARNING with how many enemies were dropped.
4. Then simulate the same scenario with capacity 32.
5. Show that all 24 enemies spawn successfully.

## Beginner Trap

Using \`new int[n]\` for every spawn. That's per-entity allocation — exactly what pools avoid. Pool means pre-allocate capacity once, then fill slots. The capacity number changes. The allocation strategy doesn't.

## Elite Insight

std::vector does exactly this internally. It tracks size (count) and capacity separately. When size hits capacity, it allocates 2x the space, copies, and frees the old buffer. Amortized O(1) insertion. You're learning what vector does under the hood.

## Systems Thinking Connection

Capacity planning is a systems problem. Too small: silent failures. Too large: wasted memory. The right answer depends on your game's spawn patterns. Data drives the decision.

## Skill Reinforcement

This builds directly on L10's entity pool. Same findFreeSlot pattern. Same alive flags. New constraint: what happens when the pool is too small.

## Mastery Check

If your pool has 32 slots and 24 are active, what's your utilization? 75%. How many more enemies can you spawn before hitting capacity? 8. These numbers should be instant.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // === Test 1: Capacity 20 ===
    cout << "=== CAPACITY TEST ===" << endl;
    int capacity1 = 20;
    int count1 = 0;

    cout << "Pool capacity: " << capacity1 << endl;

    // TODO: Wave 1 - spawn 8 enemies
    // If count1 < capacity1, increment count1
    // After wave, print: "Wave 1: spawning 8... count=N/CAP OK"
    cout << "Wave 1: spawning 8... ";

    cout << "Wave 2: spawning 8... ";

    // TODO: Wave 3 - some will be dropped
    // Track how many couldn't spawn
    cout << "Wave 3: spawning 8... ";

    // === Test 2: Capacity 32 ===
    cout << "--- Upgrade to capacity 32 ---" << endl;
    int capacity2 = 32;
    int count2 = 0;

    cout << "Pool capacity: " << capacity2 << endl;

    // TODO: Same 3 waves with larger capacity
    cout << "Wave 1: spawning 8... ";

    cout << "Wave 2: spawning 8... ";

    cout << "Wave 3: spawning 8... ";

    // TODO: Print final message
    // GAME_MESSAGE|All 24 enemies spawned. Capacity planning works.

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    // === Test 1: Capacity 20 ===
    cout << "=== CAPACITY TEST ===" << endl;
    int capacity1 = 20;
    int count1 = 0;

    cout << "Pool capacity: " << capacity1 << endl;

    // Wave 1
    cout << "Wave 1: spawning 8... ";
    for (int i = 0; i < 8; i++) {
        if (count1 < capacity1) count1++;
    }
    cout << "count=" << count1 << "/" << capacity1 << " OK" << endl;

    // Wave 2
    cout << "Wave 2: spawning 8... ";
    for (int i = 0; i < 8; i++) {
        if (count1 < capacity1) count1++;
    }
    cout << "count=" << count1 << "/" << capacity1 << " OK" << endl;

    // Wave 3 - pool full
    cout << "Wave 3: spawning 8... ";
    int dropped = 0;
    for (int i = 0; i < 8; i++) {
        if (count1 < capacity1) {
            count1++;
        } else {
            dropped++;
        }
    }
    cout << "count=" << count1 << "/" << capacity1
         << " WARNING: pool full, " << dropped << " enemies dropped!" << endl;

    // === Test 2: Capacity 32 ===
    cout << "--- Upgrade to capacity 32 ---" << endl;
    int capacity2 = 32;
    int count2 = 0;

    cout << "Pool capacity: " << capacity2 << endl;

    // Wave 1
    cout << "Wave 1: spawning 8... ";
    for (int i = 0; i < 8; i++) {
        if (count2 < capacity2) count2++;
    }
    cout << "count=" << count2 << "/" << capacity2 << " OK" << endl;

    // Wave 2
    cout << "Wave 2: spawning 8... ";
    for (int i = 0; i < 8; i++) {
        if (count2 < capacity2) count2++;
    }
    cout << "count=" << count2 << "/" << capacity2 << " OK" << endl;

    // Wave 3
    cout << "Wave 3: spawning 8... ";
    for (int i = 0; i < 8; i++) {
        if (count2 < capacity2) count2++;
    }
    cout << "count=" << count2 << "/" << capacity2 << " OK" << endl;

    cout << "GAME_MESSAGE|All 24 enemies spawned. Capacity planning works." << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Should show pool full warning",
        expectedOutput: "pool full",
      },
      {
        id: "t2",
        description: "Should show 4 enemies dropped",
        expectedOutput: "4 enemies dropped",
      },
      {
        id: "t3",
        description: "Should show 24 enemies spawned in upgraded pool",
        expectedOutput: "count=24/32 OK",
      },
      {
        id: "t4",
        description: "Should show capacity planning message",
        expectedOutput: "All 24 enemies spawned. Capacity planning works.",
      },
    ],
    hints: [
      "Use a loop for each wave: `for (int i = 0; i < 8; i++) { if (count < capacity) count++; }`",
      "Track `dropped` count in wave 3: `else { dropped++; }` when count >= capacity.",
      "The second test uses capacity2=32 and count2=0. Same logic, bigger pool. All 24 fit.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Dynamic Pool Spawning",
    type: "game_builder",
    instructions: `# Game Builder: Dynamic Pool with Utilization Stats

Your pool is now 32 slots. Spawn 3 waves of 8 enemies. Track utilization. Render everything.

## TargetFile: src/main.cpp

## Your Task

1. Set up a pool of 32 slots with SoA arrays (posX, posY, hp, alive)
2. Spawn wave 1: 8 enemies at x = 40 + i*40, y = 40, hp = 30
3. Spawn wave 2: 8 enemies continuing from the pool
4. Spawn wave 3: 8 enemies continuing from the pool
5. Run moveSystem: all alive enemies move down by 20
6. Render all 24 alive entities
7. Print utilization: \`GAME_MESSAGE|Pool: 24/32 used (75%)\`
8. Print \`SCORE|0\`

Expected entities render as: \`ENTITY|eN|enemy|X|60|22|22|30\`
(y = 40 + 20 from moveSystem = 60)

## Mental Model

This is capacity monitoring in action. You know the pool can handle it because you planned for it. 75% utilization means 8 slots remain for dynamic spawns, powerups, or boss minions.

## Performance Insight

24 entities at 22x22 pixels. Render loop: 24 iterations. Move system: 32 iterations (scans full capacity, skips dead). The dead-slot scan is the cost of simplicity. Free list eliminates it — that's a future lesson.

## Memory Insight

32 slots * (4+4+4+1) bytes per entity = 416 bytes. Your entire game state fits in a single cache line burst. This is why SoA + fixed pool is fast.

## Beginner Trap

Forgetting to check \`alive[i]\` before rendering. Dead slots contain stale data from previous entities. Rendering them shows ghost enemies at wrong positions.

## Elite Insight

75% pool utilization is healthy. Above 90% and you're one burst spawn from dropping entities. Below 50% and you're wasting memory. Monitor utilization in debug builds.

## Systems Thinking Connection

Pool utilization is a runtime metric. In production, you'd log it per frame. Spikes mean your wave design exceeds capacity. Sustained high utilization means you need a bigger pool or faster despawn.

## Skill Reinforcement

Uses findFreeSlot from L10, alive flags from L8, SoA from L6, loops from L7. Everything stacks.

## Mastery Check

If utilization hits 100%, what happens? findFreeSlot returns -1. If you don't check, you write to index -1. Memory corruption. Always guard the return value.`,
    starterCode: `#include <iostream>
using namespace std;

const int CAPACITY = 32;

int posX[CAPACITY];
int posY[CAPACITY];
int hp[CAPACITY];
bool alive[CAPACITY];

int findFreeSlot(bool alive[], int size) {
    for (int i = 0; i < size; i++) {
        if (!alive[i]) return i;
    }
    return -1;
}

void spawnEnemy(int idx, int x, int y, int health,
                int px[], int py[], int h[], bool a[]) {
    px[idx] = x;
    py[idx] = y;
    h[idx] = health;
    a[idx] = true;
}

void moveSystem(int py[], bool alive[], int capacity, int speed) {
    for (int i = 0; i < capacity; i++) {
        if (alive[i]) py[i] += speed;
    }
}

int main() {
    for (int i = 0; i < CAPACITY; i++) alive[i] = false;

    int count = 0;

    // TODO: Spawn wave 1 - 8 enemies at x = 40 + i*40, y = 40, hp = 30

    // TODO: Spawn wave 2 - 8 more enemies

    // TODO: Spawn wave 3 - 8 more enemies

    // TODO: Run moveSystem with speed 20

    // TODO: Render all alive entities
    // ENTITY|eN|enemy|x|y|22|22|hp

    // TODO: Print utilization message and score

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int CAPACITY = 32;

int posX[CAPACITY];
int posY[CAPACITY];
int hp[CAPACITY];
bool alive[CAPACITY];

int findFreeSlot(bool alive[], int size) {
    for (int i = 0; i < size; i++) {
        if (!alive[i]) return i;
    }
    return -1;
}

void spawnEnemy(int idx, int x, int y, int health,
                int px[], int py[], int h[], bool a[]) {
    px[idx] = x;
    py[idx] = y;
    h[idx] = health;
    a[idx] = true;
}

void moveSystem(int py[], bool alive[], int capacity, int speed) {
    for (int i = 0; i < capacity; i++) {
        if (alive[i]) py[i] += speed;
    }
}

int main() {
    for (int i = 0; i < CAPACITY; i++) alive[i] = false;

    int count = 0;

    // Wave 1: 8 enemies
    for (int i = 0; i < 8; i++) {
        int idx = findFreeSlot(alive, CAPACITY);
        if (idx != -1) {
            spawnEnemy(idx, 40 + i * 40, 40, 30, posX, posY, hp, alive);
            count++;
        }
    }

    // Wave 2: 8 more
    for (int i = 0; i < 8; i++) {
        int idx = findFreeSlot(alive, CAPACITY);
        if (idx != -1) {
            spawnEnemy(idx, 40 + (8 + i) * 40, 40, 30, posX, posY, hp, alive);
            count++;
        }
    }

    // Wave 3: 8 more
    for (int i = 0; i < 8; i++) {
        int idx = findFreeSlot(alive, CAPACITY);
        if (idx != -1) {
            spawnEnemy(idx, 40 + (16 + i) * 40, 40, 30, posX, posY, hp, alive);
            count++;
        }
    }

    // Movement
    moveSystem(posY, alive, CAPACITY, 20);

    // Render
    for (int i = 0; i < CAPACITY; i++) {
        if (alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << posX[i] << "|" << posY[i]
                 << "|22|22|" << hp[i] << endl;
        }
    }

    int utilization = (count * 100) / CAPACITY;
    cout << "GAME_MESSAGE|Pool: " << count << "/" << CAPACITY
         << " used (" << utilization << "%)" << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Should render first enemy at y=60",
        expectedOutput: "ENTITY\\|e0\\|enemy\\|40\\|60\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Should render 24 entities (pool not full)",
        expectedOutput: "ENTITY\\|e23\\|enemy",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Should show pool utilization",
        expectedOutput: "GAME_MESSAGE\\|Pool: 24/32 used \\(75%\\)",
        isPattern: true,
      },
      {
        id: "g4",
        description: "Should show score",
        expectedOutput: "SCORE\\|0",
        isPattern: true,
      },
    ],
    hints: [
      "Each wave spawns 8: `for (int i = 0; i < 8; i++) { int idx = findFreeSlot(alive, CAPACITY); ... }`",
      "Guard every spawn: `if (idx != -1)` before calling spawnEnemy. Increment count on success.",
      "Utilization percentage: `(count * 100) / CAPACITY` gives integer division — 75 for 24/32.",
    ],
    estimatedMinutes: 8,
  },
};
