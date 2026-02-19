import type { Lesson } from "@/types/lesson";

export const lesson30: Lesson = {
  id: "30-pool-allocator",
  title: "Pool Allocator v1",
  description: "Build a fixed-size pool that recycles entity memory without per-frame allocation.",
  order: 30,
  xpReward: 150,
  tier: "pro",
  concepts: ["pool allocator", "free list", "memory reuse", "allocation avoidance", "fixed-size pool"],
  part1: {
    title: "Concept: Pool Allocator",
    type: "concept",
    instructions: `# Pool Allocator

Every call to \\\`new\\\` asks the OS for memory. Every call to \\\`delete\\\` gives it back. In a game running at 60 FPS, spawning and destroying dozens of entities per frame, this constant allocation and deallocation is slow and fragments memory.

The fix: **pre-allocate everything up front**, then hand out slots from a pool.

## How It Works
1. Create a fixed array of N items at startup — one \\\`new\\\` call, done
2. Maintain a **free list** — an array of available indices
3. \\\`alloc()\\\` pops the next free index and returns it
4. \\\`free(idx)\\\` pushes the index back onto the free list
5. After init, **zero heap allocations** happen during gameplay

## Your Task
1. Create an \\\`IntPool\\\` struct with: \\\`data[8]\\\` (the pool), \\\`freeList[8]\\\` (available indices), and \\\`freeCount\\\` (how many are free)
2. Write \\\`initPool()\\\` — fill freeList with indices 0-7, set freeCount to 8
3. Write \\\`poolAlloc()\\\` — if freeCount > 0, decrement freeCount, return the index from freeList[freeCount], set data[idx] = 0. If empty, return -1
4. Write \\\`poolFree(idx)\\\` — put idx back in freeList[freeCount], increment freeCount
5. Allocate 3 slots, assign values 10, 20, 30. Print each: \\\`"ALLOC|<idx>|<value>"\\\`
6. Free the middle slot. Print \\\`"FREE|<idx>"\\\`
7. Allocate one more slot, assign value 40. Print \\\`"ALLOC|<idx>|<value>"\\\`
8. Print \\\`"POOL|available|<freeCount>"\\\`

Expected output:
\\\`\\\`\\\`
ALLOC|7|10
ALLOC|6|20
ALLOC|5|30
FREE|6
ALLOC|6|40
POOL|available|5
\\\`\\\`\\\``,
    starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 8;

struct IntPool {
    int data[POOL_SIZE];
    int freeList[POOL_SIZE];
    int freeCount;
};

// TODO: initPool — fill freeList with 0..7, set freeCount = POOL_SIZE

// TODO: poolAlloc — pop from freeList, return index (or -1 if empty)

// TODO: poolFree — push index back onto freeList

int main() {
    IntPool pool;
    // TODO: Init pool

    // TODO: Allocate 3 slots, assign values 10, 20, 30

    // TODO: Free the middle slot

    // TODO: Allocate one more with value 40

    // TODO: Print pool available count

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 8;

struct IntPool {
    int data[POOL_SIZE];
    int freeList[POOL_SIZE];
    int freeCount;
};

void initPool(IntPool& pool) {
    for (int i = 0; i < POOL_SIZE; i++) {
        pool.freeList[i] = i;
        pool.data[i] = 0;
    }
    pool.freeCount = POOL_SIZE;
}

int poolAlloc(IntPool& pool) {
    if (pool.freeCount <= 0) return -1;
    pool.freeCount--;
    int idx = pool.freeList[pool.freeCount];
    pool.data[idx] = 0;
    return idx;
}

void poolFree(IntPool& pool, int idx) {
    pool.freeList[pool.freeCount] = idx;
    pool.freeCount++;
}

int main() {
    IntPool pool;
    initPool(pool);

    int a = poolAlloc(pool);
    pool.data[a] = 10;
    cout << "ALLOC|" << a << "|" << pool.data[a] << endl;

    int b = poolAlloc(pool);
    pool.data[b] = 20;
    cout << "ALLOC|" << b << "|" << pool.data[b] << endl;

    int c = poolAlloc(pool);
    pool.data[c] = 30;
    cout << "ALLOC|" << c << "|" << pool.data[c] << endl;

    poolFree(pool, b);
    cout << "FREE|" << b << endl;

    int d = poolAlloc(pool);
    pool.data[d] = 40;
    cout << "ALLOC|" << d << "|" << pool.data[d] << endl;

    cout << "POOL|available|" << pool.freeCount << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should allocate first slot", expectedOutput: "ALLOC|7|10" },
      { id: "t2", description: "Should allocate second slot", expectedOutput: "ALLOC|6|20" },
      { id: "t3", description: "Should allocate third slot", expectedOutput: "ALLOC|5|30" },
      { id: "t4", description: "Should free middle slot", expectedOutput: "FREE|6" },
      { id: "t5", description: "Should reuse freed slot", expectedOutput: "ALLOC|6|40" },
      { id: "t6", description: "Should show 5 available", expectedOutput: "POOL|available|5" },
    ],
    hints: [
      "The free list is a stack. `alloc()` pops from the top (decrement freeCount, read freeList[freeCount]). `free()` pushes back (write freeList[freeCount], increment).",
      "Initialize freeList as {0, 1, 2, 3, 4, 5, 6, 7}. The first alloc returns index 7 (top of stack), then 6, then 5.",
      "After freeing index 6, it goes back on top. The next alloc returns 6 again — that is memory reuse without any heap allocation.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Game: Entity Pool",
    type: "game_builder",
    instructions: `# Game Builder: Entity Pool Allocator

Build a fixed-size entity pool that recycles memory for your space shooter entities.

## Your Task
1. Define an \\\`EntityPool\\\` struct with: \\\`entities[MAX_ENTITIES]\\\` (Entity array), \\\`freeList[MAX_ENTITIES]\\\`, and \\\`freeCount\\\`
2. Write \\\`initPool()\\\` to set up the free list (indices 0 to MAX-1) and mark all entities as not alive
3. Write \\\`poolAlloc()\\\` that pops from freeList and returns the index (-1 if full)
4. Write \\\`poolFree()\\\` that marks entity as not alive and pushes index back to freeList
5. Spawn a wave of 3 enemies from the pool. Print \\\`"POOL|alloc|<idx>"\\\` for each
6. Kill enemy at index 1 (second spawned). Print \\\`"POOL|free|<idx>"\\\`
7. Spawn 2 more enemies from the pool. Print alloc diagnostics
8. Render all alive entities. Print \\\`"POOL|available|<freeCount>"\\\`

Expected output:
\\\`\\\`\\\`
POOL|alloc|7
POOL|alloc|6
POOL|alloc|5
ENTITY|e7|enemy|100|40|30
ENTITY|e6|enemy|200|40|30
ENTITY|e5|enemy|300|40|30
POOL|free|6
POOL|alloc|6
POOL|alloc|4
ENTITY|e7|enemy|100|40|30
ENTITY|e6|enemy|400|40|30
ENTITY|e5|enemy|300|40|30
ENTITY|e4|enemy|500|40|30
POOL|available|4
\\\`\\\`\\\``,
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
      { id: "g3", description: "Should render first wave of enemies", expectedOutput: "ENTITY\\|e7\\|enemy\\|100\\|40\\|30", isPattern: true },
      { id: "g4", description: "Should free index 6", expectedOutput: "POOL\\|free\\|6", isPattern: true },
      { id: "g5", description: "Should reuse freed index 6", expectedOutput: "POOL\\|free\\|6.*POOL\\|alloc\\|6", isPattern: true },
      { id: "g6", description: "Should allocate new enemy at index 4", expectedOutput: "POOL\\|alloc\\|4", isPattern: true },
      { id: "g7", description: "Should render recycled slot with new data", expectedOutput: "ENTITY\\|e6\\|enemy\\|400\\|40\\|30", isPattern: true },
      { id: "g8", description: "Should show 4 available slots", expectedOutput: "POOL\\|available\\|4", isPattern: true },
    ],
    hints: [
      "The free list is a stack. Initialize with indices 0-7. First alloc pops index 7 (top), then 6, then 5.",
      "When you free index 6, it goes back on top of the stack. Next alloc returns 6 again — same memory slot, new entity data.",
      "After 3 allocs, 1 free, then 2 allocs: 8 - 3 + 1 - 2 = 4 available slots.",
    ],
    estimatedMinutes: 10,
  },
};
