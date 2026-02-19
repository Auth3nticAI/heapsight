import type { Lesson } from "@/types/lesson";

export const lesson10: Lesson = {
  id: "10-entity-pool-v0",
  title: "Entity Pool v0",
  description: "Fixed-size pool with slot reuse. No allocation in the game loop. Deterministic. Cache-friendly.",
  order: 10,
  xpReward: 150,
  tier: "pro",
  concepts: ["object pooling", "slot reuse", "spawn/despawn", "deterministic allocation"],
  part1: {
    title: "Concept: Entity Pool v0",
    type: "concept",
    instructions: `# Entity Pool v0

A pool is the simplest entity system. Fixed-size array. Alive flag per slot. Spawn = find dead slot, set alive. Despawn = set alive=false. No malloc. No free. No fragmentation. Deterministic frame time because allocation cost is constant: one linear scan.

## Why Pooling

Without pooling, you allocate every spawn and deallocate every death. \`malloc\` is 100-1000 nanoseconds. 50 bullets spawning per frame = 50 mallocs = up to 50 microseconds of allocation. In a 16ms frame budget, that's noticeable. With a pool: 50 array writes = 50 nanoseconds. 1000x faster.

## The Pool Pattern

Fixed arrays. Alive flags. Three functions:

\`\`\`cpp
int findFreeSlot(bool alive[], int size) {
    for (int i = 0; i < size; i++) {
        if (!alive[i]) return i;
    }
    return -1;  // pool full
}
\`\`\`

\`\`\`cpp
void spawnEnemy(int idx, int x, int y, int hp,
                int ex[], int ey[], int ehp[], bool alive[]) {
    ex[idx] = x;
    ey[idx] = y;
    ehp[idx] = hp;
    alive[idx] = true;
}
\`\`\`

\`\`\`cpp
void despawnEnemy(int idx, bool alive[]) {
    alive[idx] = false;
}
\`\`\`

Spawn finds a dead slot. Writes data. Sets alive. Despawn clears the flag. The slot is now available for reuse. No memory allocated. No memory freed.

## Slot Reuse

Spawn 5 enemies (slots 0-4). Kill slots 1 and 3. Spawn 3 more. findFreeSlot returns 1 first (dead), then 3 (dead), then 5 (never used). Two slots reused. One new slot consumed. Total active: 6 out of 20.

## Memory

20-slot pool: 20*(4+4+4+1) = 260 bytes. All on stack. All contiguous. All in L1 cache.

## Beginner Trap

Not checking if pool is full. \`findFreeSlot\` returns -1 when full. Spawning to index -1 = writing before the array = memory corruption = crash. Always check: \`if (idx == -1) return;\`

## Elite Insight

Every game engine has an entity pool. Unity: EntityManager. Unreal: FActorPool. Your 20-slot array IS the same concept. Scale it to 10,000 slots and add a free list \u2014 that's production.

## Phase 1 Complete

L6 introduced SoA arrays. L8 added alive flags. L9 added reference mutation. L10 combines them into a pool. This is the capstone. Everything from here builds on this pattern. You just built ECS v0. Entities = indices. Components = parallel arrays. Systems = functions over arrays. The pool manages the lifecycle.

## Performance

Pool allocation: O(n) scan. Worst case: full pool, scan all slots. Real case: most slots alive, scan is short. Future optimization: free list = O(1). That's lesson 17.

## Mastery Check

Why is pool allocation faster than new/delete? Pool: array write (1ns). new: system call to allocator (100-1000ns). Pool wins by 100-1000x.

## Your Task

1. Write \`findFreeSlot(bool alive[], int size)\` \u2014 return first index where alive is false, or -1
2. Write \`spawnEnemy\` \u2014 set x, y, hp, alive=true at given index
3. Write \`despawnEnemy\` \u2014 set alive=false at given index
4. Spawn 5 enemies, kill 2 (slots 1,3), spawn 3 more (observe reuse)
5. Track and display the reuse count
6. Render final pool state with ENTITY protocol`,
    starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 20;

// Pool arrays
int enemy_x[POOL_SIZE];
int enemy_y[POOL_SIZE];
int enemy_hp[POOL_SIZE];
bool enemy_alive[POOL_SIZE];

// TODO: Write findFreeSlot(bool alive[], int size)
// Linear scan for first false. Return index or -1 if full.

// TODO: Write spawnEnemy(int idx, int x, int y, int hp,
//       int ex[], int ey[], int ehp[], bool alive[])
// Set all component data and alive = true

// TODO: Write despawnEnemy(int idx, bool alive[])
// Set alive[idx] = false

int main() {
    // Initialize pool - all dead
    for (int i = 0; i < POOL_SIZE; i++) {
        enemy_alive[i] = false;
    }

    int reuse_count = 0;

    cout << "=== POOL STATUS: " << POOL_SIZE << " slots ===" << endl;

    // TODO: Spawn 5 enemies at x = 60 + i*60, y = 40, hp = 30
    // Use findFreeSlot + spawnEnemy for each
    // Print: "  Slot N: spawned at (X, Y) hp=HP"
    cout << "Spawning 5 enemies..." << endl;


    // Count active
    int active = 0;
    for (int i = 0; i < POOL_SIZE; i++) {
        if (enemy_alive[i]) active++;
    }
    cout << "Pool: " << active << "/" << POOL_SIZE << " active" << endl;

    // TODO: Kill enemies at slots 1 and 3
    // Print: "  Slot N: despawned"
    cout << endl << "--- Killing enemies at slots 1, 3 ---" << endl;


    // Recount active
    active = 0;
    for (int i = 0; i < POOL_SIZE; i++) {
        if (enemy_alive[i]) active++;
    }
    cout << "Pool: " << active << "/" << POOL_SIZE << " active" << endl;

    // TODO: Spawn 3 more enemies with hp=40
    // x positions: 100, 200, 300 and y=40
    // If slot was previously used (index < 5), print "REUSED"
    // Track reuse_count
    cout << endl << "--- Spawning 3 more enemies ---" << endl;


    // Final active count
    active = 0;
    for (int i = 0; i < POOL_SIZE; i++) {
        if (enemy_alive[i]) active++;
    }
    cout << "Pool: " << active << "/" << POOL_SIZE << " active" << endl;
    cout << "Reuse count: " << reuse_count << endl;

    // TODO: Render final pool state
    // Loop all POOL_SIZE, if alive, output ENTITY|eN|enemy|x|y|22|22|hp
    cout << endl << "=== FINAL POOL STATE ===" << endl;


    cout << "GAME_MESSAGE|Pool efficiency: " << reuse_count
         << " slots reused, 0 allocations needed" << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 20;

// Pool arrays
int enemy_x[POOL_SIZE];
int enemy_y[POOL_SIZE];
int enemy_hp[POOL_SIZE];
bool enemy_alive[POOL_SIZE];

int findFreeSlot(bool alive[], int size) {
    for (int i = 0; i < size; i++) {
        if (!alive[i]) return i;
    }
    return -1;
}

void spawnEnemy(int idx, int x, int y, int hp,
                int ex[], int ey[], int ehp[], bool alive[]) {
    ex[idx] = x;
    ey[idx] = y;
    ehp[idx] = hp;
    alive[idx] = true;
}

void despawnEnemy(int idx, bool alive[]) {
    alive[idx] = false;
}

int main() {
    // Initialize pool - all dead
    for (int i = 0; i < POOL_SIZE; i++) {
        enemy_alive[i] = false;
    }

    int reuse_count = 0;

    cout << "=== POOL STATUS: " << POOL_SIZE << " slots ===" << endl;

    // Spawn 5 enemies
    cout << "Spawning 5 enemies..." << endl;
    for (int i = 0; i < 5; i++) {
        int idx = findFreeSlot(enemy_alive, POOL_SIZE);
        int x = 60 + i * 60;
        spawnEnemy(idx, x, 40, 30, enemy_x, enemy_y, enemy_hp, enemy_alive);
        cout << "  Slot " << idx << ": spawned at (" << x << ", 40) hp=30" << endl;
    }

    // Count active
    int active = 0;
    for (int i = 0; i < POOL_SIZE; i++) {
        if (enemy_alive[i]) active++;
    }
    cout << "Pool: " << active << "/" << POOL_SIZE << " active" << endl;

    // Kill enemies at slots 1 and 3
    cout << endl << "--- Killing enemies at slots 1, 3 ---" << endl;
    despawnEnemy(1, enemy_alive);
    cout << "  Slot 1: despawned" << endl;
    despawnEnemy(3, enemy_alive);
    cout << "  Slot 3: despawned" << endl;

    // Recount active
    active = 0;
    for (int i = 0; i < POOL_SIZE; i++) {
        if (enemy_alive[i]) active++;
    }
    cout << "Pool: " << active << "/" << POOL_SIZE << " active" << endl;

    // Spawn 3 more enemies - observe slot reuse
    cout << endl << "--- Spawning 3 more enemies ---" << endl;
    int newX[3] = {100, 200, 300};
    for (int i = 0; i < 3; i++) {
        int idx = findFreeSlot(enemy_alive, POOL_SIZE);
        if (idx < 5) {
            cout << "  Slot " << idx << ": REUSED - spawned at ("
                 << newX[i] << ", 40) hp=40" << endl;
            reuse_count++;
        } else {
            cout << "  Slot " << idx << ": spawned at ("
                 << newX[i] << ", 40) hp=40" << endl;
        }
        spawnEnemy(idx, newX[i], 40, 40, enemy_x, enemy_y, enemy_hp, enemy_alive);
    }

    // Final active count
    active = 0;
    for (int i = 0; i < POOL_SIZE; i++) {
        if (enemy_alive[i]) active++;
    }
    cout << "Pool: " << active << "/" << POOL_SIZE << " active" << endl;
    cout << "Reuse count: " << reuse_count << endl;

    // Render final pool state
    cout << endl << "=== FINAL POOL STATE ===" << endl;
    for (int i = 0; i < POOL_SIZE; i++) {
        if (enemy_alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << enemy_x[i] << "|" << enemy_y[i]
                 << "|22|22|" << enemy_hp[i] << endl;
        }
    }

    cout << "GAME_MESSAGE|Pool efficiency: " << reuse_count
         << " slots reused, 0 allocations needed" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Should show 5/20 active after initial spawn",
        expectedOutput: "5/20 active",
      },
      {
        id: "t2",
        description: "Should show 3/20 active after killing 2",
        expectedOutput: "3/20 active",
      },
      {
        id: "t3",
        description: "Should show REUSED for slot reuse",
        expectedOutput: "REUSED",
      },
      {
        id: "t4",
        description: "Should show 6/20 active after respawn",
        expectedOutput: "6/20 active",
      },
      {
        id: "t5",
        description: "Should report 2 slots reused",
        expectedOutput: "2 slots reused",
      },
    ],
    hints: [
      "`findFreeSlot` does a linear scan: `for (int i = 0; i < size; i++) { if (!alive[i]) return i; }` \u2014 return -1 if nothing found.",
      "`spawnEnemy` writes all component data to the given index and sets `alive[idx] = true`. That's it. No allocation.",
      "To detect reuse, check if the returned slot index is less than 5 (the range of the first spawn wave). Slots 1 and 3 were killed, so findFreeSlot returns them first.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Game: Entity Pool Lifecycle",
    type: "game_builder",
    instructions: `# Game Builder: Full Pool Lifecycle

This is the capstone. Everything clicks together. SoA arrays. Alive flags. System functions. Loops. Conditionals. References. All combined into a working entity pool.

## The Lifecycle

1. **Spawn Wave 1** \u2014 5 enemies enter the field using findFreeSlot
2. **Movement** \u2014 moveSystem advances all alive enemies down by 30
3. **Combat** \u2014 damageSystem kills enemies at slots 1 and 3 (score +100 each)
4. **Spawn Wave 2** \u2014 3 more enemies spawn, reusing dead slots
5. **Render** \u2014 draw all alive entities with ENTITY protocol
6. **HUD** \u2014 show HP, score, lives

## System Functions

You have all the tools from previous lessons:
- \`findFreeSlot\` \u2014 linear scan for dead slot
- \`spawnEnemy\` \u2014 write to slot, set alive
- \`despawnEnemy\` \u2014 clear alive flag
- \`moveSystem\` \u2014 add speed to all enemy_y
- \`damageSystem\` \u2014 damage target, kill if hp <= 0

## Expected Output

\`\`\`
ENTITY|e0|enemy|60|70|22|22|30
ENTITY|e1|enemy|100|70|22|22|40
ENTITY|e2|enemy|180|70|22|22|30
ENTITY|e3|enemy|200|70|22|22|40
ENTITY|e4|enemy|300|70|22|22|30
ENTITY|e5|enemy|300|70|22|22|40
HUD|HP:100|SCORE:200|LIVES:3
GAME_MESSAGE|Phase 1 complete: pool active with 2 reused slots
SCORE|200
\`\`\`

Note: Wave 2 enemies also get moved by moveSystem (it runs on all alive enemies after wave 2 spawns). All alive entities end at y=70 (40+30).

## Your Task

1. Spawn wave 1: 5 enemies at x=60,120,180,240,300, y=40, hp=30
2. Kill slots 1 and 3 via despawnEnemy, add 100 score each
3. Spawn wave 2: 3 enemies at x=100,200,300, y=40, hp=40 (reuses slots 1,3 then uses 5)
4. Run moveSystem with speed=30 on all alive enemies
5. Render all alive entities
6. Output HUD, message, score`,
    starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 20;

int enemy_x[POOL_SIZE];
int enemy_y[POOL_SIZE];
int enemy_hp[POOL_SIZE];
bool enemy_alive[POOL_SIZE];

int findFreeSlot(bool alive[], int size) {
    for (int i = 0; i < size; i++) {
        if (!alive[i]) return i;
    }
    return -1;
}

void spawnEnemy(int idx, int x, int y, int hp,
                int ex[], int ey[], int ehp[], bool alive[]) {
    ex[idx] = x;
    ey[idx] = y;
    ehp[idx] = hp;
    alive[idx] = true;
}

void despawnEnemy(int idx, bool alive[]) {
    alive[idx] = false;
}

void moveSystem(int ey[], bool alive[], int count, int speed) {
    for (int i = 0; i < count; i++) {
        if (alive[i]) ey[i] += speed;
    }
}

int main() {
    for (int i = 0; i < POOL_SIZE; i++) {
        enemy_alive[i] = false;
    }

    int score = 0;

    // TODO: Spawn Wave 1 - 5 enemies
    // x = 60 + i*60, y = 40, hp = 30

    // TODO: Kill enemies at slots 1 and 3 (despawnEnemy)
    // Add 100 score per kill

    // TODO: Spawn Wave 2 - 3 enemies (reuse dead slots)
    // x positions: 100, 200, 300, y = 40, hp = 40

    // TODO: Run moveSystem with speed 30

    // TODO: Render all alive entities
    // ENTITY|eN|enemy|x|y|22|22|hp

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|Phase 1 complete: pool active with 2 reused slots" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 20;

int enemy_x[POOL_SIZE];
int enemy_y[POOL_SIZE];
int enemy_hp[POOL_SIZE];
bool enemy_alive[POOL_SIZE];

int findFreeSlot(bool alive[], int size) {
    for (int i = 0; i < size; i++) {
        if (!alive[i]) return i;
    }
    return -1;
}

void spawnEnemy(int idx, int x, int y, int hp,
                int ex[], int ey[], int ehp[], bool alive[]) {
    ex[idx] = x;
    ey[idx] = y;
    ehp[idx] = hp;
    alive[idx] = true;
}

void despawnEnemy(int idx, bool alive[]) {
    alive[idx] = false;
}

void moveSystem(int ey[], bool alive[], int count, int speed) {
    for (int i = 0; i < count; i++) {
        if (alive[i]) ey[i] += speed;
    }
}

int main() {
    for (int i = 0; i < POOL_SIZE; i++) {
        enemy_alive[i] = false;
    }

    int score = 0;

    // Wave 1: spawn 5 enemies
    for (int i = 0; i < 5; i++) {
        int idx = findFreeSlot(enemy_alive, POOL_SIZE);
        spawnEnemy(idx, 60 + i * 60, 40, 30,
                   enemy_x, enemy_y, enemy_hp, enemy_alive);
    }

    // Combat: kill slots 1 and 3
    despawnEnemy(1, enemy_alive);
    score += 100;
    despawnEnemy(3, enemy_alive);
    score += 100;

    // Wave 2: spawn 3 more (reuses slots 1, 3, then 5)
    int wave2x[3] = {100, 200, 300};
    for (int i = 0; i < 3; i++) {
        int idx = findFreeSlot(enemy_alive, POOL_SIZE);
        spawnEnemy(idx, wave2x[i], 40, 40,
                   enemy_x, enemy_y, enemy_hp, enemy_alive);
    }

    // Movement system: all alive enemies move down
    moveSystem(enemy_y, enemy_alive, POOL_SIZE, 30);

    // Render system
    for (int i = 0; i < POOL_SIZE; i++) {
        if (enemy_alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << enemy_x[i] << "|" << enemy_y[i]
                 << "|22|22|" << enemy_hp[i] << endl;
        }
    }

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|Phase 1 complete: pool active with 2 reused slots" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Enemy0 should render at y=70 with hp=30",
        expectedOutput: "ENTITY\\|e0\\|enemy\\|60\\|70\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Slot 1 reused: enemy at (100,70) hp=40",
        expectedOutput: "ENTITY\\|e1\\|enemy\\|100\\|70\\|22\\|22\\|40",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Slot 3 reused: enemy at (200,70) hp=40",
        expectedOutput: "ENTITY\\|e3\\|enemy\\|200\\|70\\|22\\|22\\|40",
        isPattern: true,
      },
      {
        id: "g4",
        description: "Slot 5 used: new enemy at (300,70) hp=40",
        expectedOutput: "ENTITY\\|e5\\|enemy\\|300\\|70\\|22\\|22\\|40",
        isPattern: true,
      },
      {
        id: "g5",
        description: "Should show Phase 1 complete message",
        expectedOutput: "GAME_MESSAGE\\|Phase 1 complete: pool active with 2 reused slots",
        isPattern: true,
      },
      {
        id: "g6",
        description: "Score should be 200",
        expectedOutput: "SCORE\\|200",
        isPattern: true,
      },
    ],
    hints: [
      "Spawn wave 1 in a loop: `int idx = findFreeSlot(enemy_alive, POOL_SIZE); spawnEnemy(idx, 60 + i * 60, 40, 30, ...);`",
      "After despawning slots 1 and 3, findFreeSlot will return 1 first (lowest dead index), then 3, then 5.",
      "moveSystem runs AFTER wave 2 spawns, so all alive enemies (including wave 2) move from y=40 to y=70.",
    ],
    estimatedMinutes: 10,
  },
};
