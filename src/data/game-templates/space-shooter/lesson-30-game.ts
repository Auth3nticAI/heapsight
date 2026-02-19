import type { GameLessonVariant } from "@/types/game";

export const lesson30SpaceShooter: GameLessonVariant = {
  lessonId: "30-pool-allocator",
  instructions: `# MILESTONE 30: Pool Allocator v1 — When new/delete Stalls Your Frame

You are calling \\\`new\\\` every time an enemy spawns and \\\`delete\\\` every time one dies. At 60 FPS with 20 enemies spawning and dying per second, that is 40 heap operations per second hitting the OS allocator. The allocator locks, searches free lists, fragments memory, and your frame time spikes from 4ms to 12ms. Players see the stutter. This is the most common performance bug in amateur game engines.

## What Breaks Without This

Per-frame allocation. The OS allocator is not designed for real-time workloads. It has to maintain metadata, coalesce free blocks, and sometimes call into the kernel. One allocation can take microseconds or milliseconds depending on fragmentation. In a hot path running every frame, that variance is unacceptable. You need deterministic allocation time.

## The Fix

Pre-allocate a fixed array of MAX_ENTITIES at startup. Maintain a free list — a stack of available indices. \\\`poolAlloc()\\\` pops the top index in O(1). \\\`poolFree()\\\` pushes it back in O(1). Zero heap calls after initialization. The entire entity pool lives in one contiguous block — good for the cache line, good for the prefetcher, good for frame time stability.

The free list is a stack stored in an integer array. \\\`freeCount\\\` is the stack pointer. Alloc decrements it and reads \\\`freeList[freeCount]\\\`. Free writes to \\\`freeList[freeCount]\\\` and increments. Two integer operations. No branching except the empty check. This is as fast as allocation gets.

When an enemy dies, you mark it not-alive and push its index back. When a new wave spawns, those same indices get reused. The entity array slots get overwritten with fresh data. Same memory, new content. The pool never grows, never shrinks, never fragments.

## Your Task

1. Define \\\`EntityPool\\\` struct: \\\`entities[MAX_ENTITIES]\\\`, \\\`freeList[MAX_ENTITIES]\\\`, \\\`freeCount\\\`
2. Write \\\`initPool()\\\` — fill freeList with 0..MAX-1, set all entities to not alive, freeCount = MAX
3. Write \\\`poolAlloc()\\\` — decrement freeCount, return \\\`freeList[freeCount]\\\`, print \\\`POOL|alloc|<idx>\\\`
4. Write \\\`poolFree()\\\` — mark entity dead, write idx to \\\`freeList[freeCount]\\\`, increment freeCount, print \\\`POOL|free|<idx>\\\`
5. Spawn wave 1: 3 enemies at (100,40), (200,40), (300,40) with 30hp each
6. Render all alive entities after wave 1
7. Kill second enemy (free its pool slot)
8. Spawn wave 2: 2 enemies at (400,40) and (500,40) — watch the freed slot get recycled
9. Render all alive entities after wave 2
10. Print \\\`POOL|available|<freeCount>\\\`

## Beginner Trap

**Common Mistake:** Rendering by iterating only up to the number of allocated entities. The pool has gaps — a freed slot at index 6 sits between alive entities at 7 and 5. You must iterate the full array and check the alive flag. The alive flag is your filter, not the index range.

## Elite Insight

This is the same allocator architecture used in Quake. Fixed pool, free list, O(1) alloc and free. The only difference in production engines is adding generations (version counters) to detect stale handles. The core data structure is identical.

## Cross-Path Echo

Database connection pools work the same way. Pre-allocate N connections at startup, hand them out on request, return them when done. The pattern — pre-allocate, reuse, never allocate in the hot path — applies everywhere performance matters.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 8;

struct Entity {
    string id;
    string type;
    int x, y, hp;
    bool alive;
};

struct EntityPool {
    Entity entities[MAX_ENTITIES];
    int freeList[MAX_ENTITIES];
    int freeCount;
};

void renderEntity(Entity e) {
    if (!e.alive) return;
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.hp << endl;
}

// TODO: initPool — set up free list and clear all entities

// TODO: poolAlloc — return next free index, print "POOL|alloc|<idx>"

// TODO: poolFree — mark dead and return index, print "POOL|free|<idx>"

int main() {
    EntityPool pool;
    // TODO: Init pool

    // TODO: Spawn wave of 3 enemies

    // TODO: Render all alive

    // TODO: Kill second enemy, free its slot

    // TODO: Spawn 2 more enemies

    // TODO: Render all alive

    // TODO: Print pool available count

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 8;

struct Entity {
    string id;
    string type;
    int x, y, hp;
    bool alive;
};

struct EntityPool {
    Entity entities[MAX_ENTITIES];
    int freeList[MAX_ENTITIES];
    int freeCount;
};

void renderEntity(Entity e) {
    if (!e.alive) return;
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.hp << endl;
}

void initPool(EntityPool& pool) {
    for (int i = 0; i < MAX_ENTITIES; i++) {
        pool.freeList[i] = i;
        pool.entities[i].alive = false;
    }
    pool.freeCount = MAX_ENTITIES;
}

int poolAlloc(EntityPool& pool) {
    if (pool.freeCount <= 0) return -1;
    pool.freeCount--;
    int idx = pool.freeList[pool.freeCount];
    cout << "POOL|alloc|" << idx << endl;
    return idx;
}

void poolFree(EntityPool& pool, int idx) {
    pool.entities[idx].alive = false;
    pool.freeList[pool.freeCount] = idx;
    pool.freeCount++;
    cout << "POOL|free|" << idx << endl;
}

int main() {
    EntityPool pool;
    initPool(pool);

    int idx1 = poolAlloc(pool);
    pool.entities[idx1] = {"e7", "enemy", 100, 40, 30, true};

    int idx2 = poolAlloc(pool);
    pool.entities[idx2] = {"e6", "enemy", 200, 40, 30, true};

    int idx3 = poolAlloc(pool);
    pool.entities[idx3] = {"e5", "enemy", 300, 40, 30, true};

    for (int i = 0; i < MAX_ENTITIES; i++) {
        renderEntity(pool.entities[i]);
    }

    poolFree(pool, idx2);

    int idx4 = poolAlloc(pool);
    pool.entities[idx4] = {"e6", "enemy", 400, 40, 30, true};

    int idx5 = poolAlloc(pool);
    pool.entities[idx5] = {"e4", "enemy", 500, 40, 30, true};

    for (int i = 0; i < MAX_ENTITIES; i++) {
        renderEntity(pool.entities[i]);
    }

    cout << "POOL|available|" << pool.freeCount << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should allocate first enemy at index 7", expectedOutput: "POOL\\|alloc\\|7", isPattern: true },
    { id: "g2", description: "Should allocate second enemy at index 6", expectedOutput: "POOL\\|alloc\\|6", isPattern: true },
    { id: "g3", description: "Should allocate third enemy at index 5", expectedOutput: "POOL\\|alloc\\|5", isPattern: true },
    { id: "g4", description: "Should render wave 1 enemy at slot 7", expectedOutput: "ENTITY\\|e7\\|enemy\\|100\\|40\\|30", isPattern: true },
    { id: "g5", description: "Should free index 6 on enemy kill", expectedOutput: "POOL\\|free\\|6", isPattern: true },
    { id: "g6", description: "Should reuse freed slot 6 for wave 2", expectedOutput: "POOL\\|free\\|6.*POOL\\|alloc\\|6", isPattern: true },
    { id: "g7", description: "Should allocate wave 2 enemy at index 4", expectedOutput: "POOL\\|alloc\\|4", isPattern: true },
    { id: "g8", description: "Should render recycled slot with new position", expectedOutput: "ENTITY\\|e6\\|enemy\\|400\\|40\\|30", isPattern: true },
    { id: "g9", description: "Should render new enemy at slot 4", expectedOutput: "ENTITY\\|e4\\|enemy\\|500\\|40\\|30", isPattern: true },
    { id: "g10", description: "Should show 4 available slots", expectedOutput: "POOL\\|available\\|4", isPattern: true },
  ],
  hints: [
    "Initialize the free list as a stack: indices 0 through 7, with freeCount = 8. First alloc pops index 7 off the top.",
    "poolFree pushes the freed index back onto the stack. The next poolAlloc returns that same index — memory reuse with zero heap calls.",
    "Iterate the full MAX_ENTITIES array when rendering, not just allocated count. Check `alive` flag to skip dead/empty slots.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 8;

struct Entity {
    string id;
    string type;
    int x, y, hp;
    bool alive;
};

struct EntityPool {
    Entity entities[MAX_ENTITIES];
    int freeList[MAX_ENTITIES];
    int freeCount;
};

void renderEntity(Entity e) {
    if (!e.alive) return;
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.hp << endl;
}

void initPool(EntityPool& pool) {
    for (int i = 0; i < MAX_ENTITIES; i++) {
        pool.freeList[i] = i;
        pool.entities[i].alive = false;
    }
    pool.freeCount = MAX_ENTITIES;
}

int poolAlloc(EntityPool& pool) {
    if (pool.freeCount <= 0) return -1;
    pool.freeCount--;
    int idx = pool.freeList[pool.freeCount];
    cout << "POOL|alloc|" << idx << endl;
    return idx;
}

void poolFree(EntityPool& pool, int idx) {
    pool.entities[idx].alive = false;
    pool.freeList[pool.freeCount] = idx;
    pool.freeCount++;
    cout << "POOL|free|" << idx << endl;
}

int main() {
    EntityPool pool;
    initPool(pool);
    int idx1 = poolAlloc(pool);
    pool.entities[idx1] = {"e7", "enemy", 100, 40, 30, true};
    int idx2 = poolAlloc(pool);
    pool.entities[idx2] = {"e6", "enemy", 200, 40, 30, true};
    int idx3 = poolAlloc(pool);
    pool.entities[idx3] = {"e5", "enemy", 300, 40, 30, true};
    for (int i = 0; i < MAX_ENTITIES; i++) renderEntity(pool.entities[i]);
    poolFree(pool, idx2);
    int idx4 = poolAlloc(pool);
    pool.entities[idx4] = {"e6", "enemy", 400, 40, 30, true};
    int idx5 = poolAlloc(pool);
    pool.entities[idx5] = {"e4", "enemy", 500, 40, 30, true};
    for (int i = 0; i < MAX_ENTITIES; i++) renderEntity(pool.entities[i]);
    cout << "POOL|available|" << pool.freeCount << endl;
    return 0;
}
`,
};
