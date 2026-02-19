import type { Lesson } from "@/types/lesson";

export const lesson17: Lesson = {
  id: "17-ids-and-free-list",
  title: "IDs and Free List",
  description: "Replace linear scan with O(1) free list allocation. Stack of available slots. Push on despawn. Pop on spawn.",
  order: 17,
  xpReward: 150,
  tier: "pro",
  concepts: ["free list", "O(1) allocation", "entity recycling", "generation IDs"],
  part1: {
    title: "Concept: IDs and Free List",
    type: "concept",
    instructions: `# IDs and Free List

Free list = stack of available slots. Push on despawn. Pop on spawn. O(1) both ways. No scanning.

## Mental Model

L10's \`findFreeSlot\` scans the entire array — O(n). With 1000 entities, that is 1000 comparisons per spawn. Free list: maintain a stack of dead slot indices. Spawn = pop from stack. Despawn = push to stack. O(1) always.

## What Breaks

Linear scan at 60fps with frequent spawning: 100 bullets/sec multiplied by scanning 1000 slots = 100,000 comparisons/sec. Free list: 100 pops. That is a 1000x improvement. The difference between smooth gameplay and frame drops during heavy combat.

## The Fix

\`\`\`cpp
int freeStack[MAX];
int freeTop = -1;

// Initialize: push all slots onto free stack
for (int i = MAX - 1; i >= 0; i--) {
    freeStack[++freeTop] = i;
}

// Spawn: pop from stack
int spawn() {
    if (freeTop < 0) return -1; // pool full
    return freeStack[freeTop--];
}

// Despawn: push to stack
void despawn(int id) {
    freeStack[++freeTop] = id;
}
\`\`\`

Initialize all slots as free by pushing them onto the stack. Spawn pops the top. Despawn pushes the freed index back. Two operations each. Constant time guaranteed.

## Performance Insight

Free list pop: 1 array read + 1 decrement. 2 operations. Linear scan: up to N reads + N comparisons. Free list is O(1) guaranteed. At 1000 entities, free list is 500x fewer operations per spawn.

## Memory Insight

Free list: one extra int array (same size as pool) + one int counter. 1000 entities = 4KB overhead. That is nothing. The performance gain is enormous for the memory cost.

## Beginner Trap

Popping from empty free list (pool full) or pushing to a full free list (all slots already free). Always check bounds. \`if (freeTop < 0) return -1;\` on spawn. \`if (freeTop >= MAX - 1) return;\` on despawn. Skipping these checks = stack overflow or underflow = memory corruption.

## Elite Insight

Doom 3's entity system: identical free list pattern. \`idEntityFreeList\`. Same O(1) spawn/despawn. Quake 3 used the same approach for projectile pools. This is not a teaching exercise — this is how shipped AAA games manage entity lifecycles.

## Systems Thinking Connection

L10 gave you a pool with linear scan. This lesson replaces the scan with a stack. Same pool. Same lifecycle. Different allocation strategy. The data layout does not change — only the bookkeeping does. This is the key insight: you can optimize allocation without touching component data.

## Skill Reinforcement

You already know spawn/despawn from L10. You already know array-based stacks from basic data structures. This lesson combines them. The free list IS a stack. The pool IS an array. Together they give you O(1) entity lifecycle management.

## Mastery Check

Why is O(1) allocation critical for games? Because spawn frequency is unpredictable. A boss fight might spawn 200 particles in one frame. O(n) scan with 1000 slots = 200,000 comparisons. O(1) free list = 200 pops. The difference is the difference between 60fps and 30fps.

## Your Task

1. Create an 8-slot pool with a free list stack
2. Initialize all slots as free (push all indices onto the stack)
3. Spawn 5 enemies by popping from the free list
4. Despawn 2 enemies (slots 5 and 3) by pushing back onto the stack
5. Spawn 2 more enemies — observe that freed slots are reused
6. Log freeList size at each step`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX = 8;

// Pool arrays
int enemy_x[MAX];
int enemy_y[MAX];
int enemy_hp[MAX];
bool enemy_alive[MAX];

// Free list (stack of available slot indices)
int freeStack[MAX];
int freeTop = -1;

// TODO: Write initPool() - push all slots onto freeStack (MAX-1 down to 0)
// This ensures slot 0 is on top (popped first? No - slot MAX-1 is pushed first,
// so slot 0 ends up on top)

// TODO: Write spawn(int x, int y, int hp) - pop from freeStack, fill data, return index
// Return -1 if freeTop < 0

// TODO: Write despawn(int id) - push id back onto freeStack, set alive=false

int main() {
    cout << "=== FREE LIST DEMO ===" << endl;

    // Initialize pool
    // Print pool size and freeList size

    // Spawn 5 enemies
    // Print each pop and freeList size

    // Count active
    // Print active count and freeList size

    // Despawn slots 5 and 3
    // Print each push and freeList size

    // Recount active
    // Print active count and freeList size

    // Spawn 2 more - should reuse slots
    // Print each pop with REUSED tag and freeList size

    // Final count
    // Print active count and freeList size

    // Print summary message

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX = 8;

// Pool arrays
int enemy_x[MAX];
int enemy_y[MAX];
int enemy_hp[MAX];
bool enemy_alive[MAX];

// Free list (stack of available slot indices)
int freeStack[MAX];
int freeTop = -1;

void initPool() {
    for (int i = MAX - 1; i >= 0; i--) {
        freeStack[++freeTop] = i;
    }
    for (int i = 0; i < MAX; i++) {
        enemy_alive[i] = false;
    }
}

int spawn(int x, int y, int hp) {
    if (freeTop < 0) return -1;
    int id = freeStack[freeTop--];
    enemy_x[id] = x;
    enemy_y[id] = y;
    enemy_hp[id] = hp;
    enemy_alive[id] = true;
    return id;
}

void despawn(int id) {
    enemy_alive[id] = false;
    freeStack[++freeTop] = id;
}

int main() {
    cout << "=== FREE LIST DEMO ===" << endl;

    initPool();
    cout << "Pool: " << MAX << " slots, freeList size: " << freeTop + 1 << endl;

    cout << "Spawn 5 enemies..." << endl;
    for (int i = 0; i < 5; i++) {
        int id = spawn(60 + i * 60, 40, 30);
        cout << "  pop -> slot " << id << ", freeList: " << freeTop + 1 << endl;
    }

    int active = 0;
    for (int i = 0; i < MAX; i++) {
        if (enemy_alive[i]) active++;
    }
    cout << "Active: " << active << ", freeList: " << freeTop + 1 << endl;

    cout << endl << "Despawn slots 5, 3..." << endl;
    despawn(5);
    cout << "  push slot 5, freeList: " << freeTop + 1 << endl;
    despawn(3);
    cout << "  push slot 3, freeList: " << freeTop + 1 << endl;

    active = 0;
    for (int i = 0; i < MAX; i++) {
        if (enemy_alive[i]) active++;
    }
    cout << "Active: " << active << ", freeList: " << freeTop + 1 << endl;

    cout << endl << "Spawn 2 more..." << endl;
    int id1 = spawn(200, 40, 40);
    cout << "  pop -> slot " << id1 << " (REUSED), freeList: " << freeTop + 1 << endl;
    int id2 = spawn(300, 40, 40);
    cout << "  pop -> slot " << id2 << " (REUSED), freeList: " << freeTop + 1 << endl;

    active = 0;
    for (int i = 0; i < MAX; i++) {
        if (enemy_alive[i]) active++;
    }
    cout << "Active: " << active << ", freeList: " << freeTop + 1 << endl;

    cout << endl << "GAME_MESSAGE|Free list: O(1) spawn and despawn. No scanning." << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Initial freeList should have 8 slots",
        expectedOutput: "freeList size: 8",
      },
      {
        id: "t2",
        description: "After spawning 5, freeList should have 3",
        expectedOutput: "Active: 5, freeList: 3",
      },
      {
        id: "t3",
        description: "After despawning 2, freeList should have 5",
        expectedOutput: "Active: 3, freeList: 5",
      },
      {
        id: "t4",
        description: "Should show REUSED for respawned slots",
        expectedOutput: "REUSED",
      },
      {
        id: "t5",
        description: "Should print O(1) summary message",
        expectedOutput: "GAME_MESSAGE|Free list: O(1) spawn and despawn. No scanning.",
      },
    ],
    hints: [
      "`initPool()`: loop from MAX-1 down to 0, `freeStack[++freeTop] = i;` — this puts slot 0 on top of the stack so it gets popped first.",
      "`spawn()`: check `freeTop < 0` first. Then `int id = freeStack[freeTop--];` — one read, one decrement. Fill component data and set alive=true.",
      "`despawn(id)`: set `alive[id] = false;` then `freeStack[++freeTop] = id;` — the slot is now available for the next spawn.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Game: Free List Entity Manager",
    type: "game_builder",
    instructions: `# Game Builder: Free List Entity Manager

Full game with EntityManager using free list. Multiple spawn/despawn waves. Every spawn is O(1). Every despawn is O(1). The pool never fragments. Slots get reused immediately.

## Mental Model

The free list is the allocation backbone. Every system — movement, damage, cleanup, render — operates on alive entities. The free list only controls which slots are available. It does not touch game logic. Clean separation.

## What Breaks

Without the free list, your L10 pool uses linear scan. Spawn 100 bullets in a bullet-hell frame: 100 scans of potentially 1000 slots. That is 100,000 comparisons in a single frame. The free list reduces this to 100 stack pops. The game stays at 60fps.

## The Fix

Integrate the free list into a full game loop. Wave 1 spawns enemies. Movement system runs. Damage system kills some. Cleanup pushes dead slots back onto the free list. Wave 2 spawns reuse those slots. Render draws the final state.

## Performance Insight

In a bullet-hell game with 500 active bullets and 200 spawns/despawns per frame: linear scan = 200 * 500 = 100,000 operations. Free list = 200 pops + 200 pushes = 400 operations. 250x improvement. That is the difference between shipping and not shipping.

## Memory Insight

The free list adds one int array the same size as the pool. For 1000 entities: 4KB. The component arrays are already 20KB+. The free list is 20% overhead for 1000x better allocation performance.

## Beginner Trap

Forgetting to push despawned slots back onto the free list. If you set \`alive[i] = false\` but do not push \`i\` onto the stack, that slot is lost forever. The pool shrinks by one every despawn. Eventually all slots are "dead" but none are "free". The game stops spawning.

## Elite Insight

Unreal Engine's FActorPool uses a free list internally. Unity DOTS EntityManager uses chunk-based free lists. The scale changes. The pattern does not.

## Systems Thinking Connection

This connects L10 (pool lifecycle) to L17 (O(1) allocation). The pool manages data. The free list manages availability. Together they form a complete entity lifecycle with zero allocation on the hot path.

## Skill Reinforcement

You have written spawn/despawn before. Now you are optimizing the allocation path. Same functions, different internals. This is how real optimization works — change the algorithm, keep the interface.

## Mastery Check

What happens if you spawn when the free list is empty? The pool is full. Return -1. The caller must handle this — skip the spawn, expand the pool, or kill an existing entity to make room. Production engines have policies for this.

## Your Task

1. Build an 8-slot entity pool with free list
2. Spawn Wave 1: 4 enemies at x=60,120,180,240 y=40 hp=30
3. Run moveSystem: all alive enemies move down by 30 (y += 30)
4. Kill enemies at slots 1 and 2 (damageSystem sets hp=0, despawn pushes to free list)
5. Spawn Wave 2: 3 enemies at x=100,200,300 y=40 hp=40 (reuses freed slots)
6. Run moveSystem again: all alive move down by 30
7. Render all alive entities with ENTITY protocol
8. Output HUD, reuse count, and score`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX = 8;

int enemy_x[MAX];
int enemy_y[MAX];
int enemy_hp[MAX];
bool enemy_alive[MAX];

int freeStack[MAX];
int freeTop = -1;

void initPool() {
    for (int i = MAX - 1; i >= 0; i--) {
        freeStack[++freeTop] = i;
    }
    for (int i = 0; i < MAX; i++) {
        enemy_alive[i] = false;
    }
}

int spawn(int x, int y, int hp) {
    if (freeTop < 0) return -1;
    int id = freeStack[freeTop--];
    enemy_x[id] = x;
    enemy_y[id] = y;
    enemy_hp[id] = hp;
    enemy_alive[id] = true;
    return id;
}

void despawn(int id) {
    enemy_alive[id] = false;
    freeStack[++freeTop] = id;
}

void moveSystem(int speed) {
    for (int i = 0; i < MAX; i++) {
        if (enemy_alive[i]) enemy_y[i] += speed;
    }
}

int main() {
    initPool();
    int score = 0;
    int reuseCount = 0;

    // TODO: Wave 1 - spawn 4 enemies
    // x = 60 + i*60, y = 40, hp = 30

    // TODO: Run moveSystem with speed 30

    // TODO: Kill slots 1 and 2 (set hp=0, despawn, score += 100 each)

    // TODO: Wave 2 - spawn 3 enemies at x=100,200,300 y=40 hp=40
    // Track reuse: if returned slot < 4, it was reused

    // TODO: Run moveSystem again with speed 30

    // TODO: Render all alive entities
    // ENTITY|eN|enemy|x|y|22|22|hp

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|Free list active: " << reuseCount << " slots reused, O(1) allocation" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX = 8;

int enemy_x[MAX];
int enemy_y[MAX];
int enemy_hp[MAX];
bool enemy_alive[MAX];

int freeStack[MAX];
int freeTop = -1;

void initPool() {
    for (int i = MAX - 1; i >= 0; i--) {
        freeStack[++freeTop] = i;
    }
    for (int i = 0; i < MAX; i++) {
        enemy_alive[i] = false;
    }
}

int spawn(int x, int y, int hp) {
    if (freeTop < 0) return -1;
    int id = freeStack[freeTop--];
    enemy_x[id] = x;
    enemy_y[id] = y;
    enemy_hp[id] = hp;
    enemy_alive[id] = true;
    return id;
}

void despawn(int id) {
    enemy_alive[id] = false;
    freeStack[++freeTop] = id;
}

void moveSystem(int speed) {
    for (int i = 0; i < MAX; i++) {
        if (enemy_alive[i]) enemy_y[i] += speed;
    }
}

int main() {
    initPool();
    int score = 0;
    int reuseCount = 0;

    // Wave 1: spawn 4 enemies
    for (int i = 0; i < 4; i++) {
        spawn(60 + i * 60, 40, 30);
    }

    // Movement pass 1
    moveSystem(30);

    // Combat: kill slots 1 and 2
    enemy_hp[1] = 0;
    despawn(1);
    score += 100;
    enemy_hp[2] = 0;
    despawn(2);
    score += 100;

    // Wave 2: spawn 3 more (reuse dead slots)
    int wave2x[3] = {100, 200, 300};
    for (int i = 0; i < 3; i++) {
        int id = spawn(wave2x[i], 40, 40);
        if (id < 4) reuseCount++;
    }

    // Movement pass 2
    moveSystem(30);

    // Render system
    for (int i = 0; i < MAX; i++) {
        if (enemy_alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << enemy_x[i] << "|" << enemy_y[i]
                 << "|22|22|" << enemy_hp[i] << endl;
        }
    }

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|Free list active: " << reuseCount << " slots reused, O(1) allocation" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Slot 0: wave 1 enemy moved twice (y=40+30+30=100)",
        expectedOutput: "ENTITY\\|e0\\|enemy\\|60\\|100\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Slot 2: reused wave 2 enemy moved once (y=40+30=70)",
        expectedOutput: "ENTITY\\|e2\\|enemy\\|200\\|70\\|22\\|22\\|40",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Slot 3: wave 1 enemy moved twice (y=100)",
        expectedOutput: "ENTITY\\|e3\\|enemy\\|240\\|100\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g4",
        description: "HUD shows score 200",
        expectedOutput: "HUD\\|HP:100\\|SCORE:200\\|LIVES:3",
        isPattern: true,
      },
      {
        id: "g5",
        description: "Free list message with reuse count",
        expectedOutput: "GAME_MESSAGE\\|Free list active: 2 slots reused, O\\(1\\) allocation",
        isPattern: true,
      },
      {
        id: "g6",
        description: "Score is 200",
        expectedOutput: "SCORE\\|200",
        isPattern: true,
      },
    ],
    hints: [
      "Wave 1 spawns fill slots 0,1,2,3 (popped from top of stack). After moveSystem(30), they are at y=70.",
      "Despawn slots 1 and 2 pushes them back onto the free list. Wave 2 pops slot 2 first (LIFO), then slot 1, then slot 4.",
      "Wave 2 enemies start at y=40. After moveSystem(30), they are at y=70. Wave 1 survivors get moved again: y=70+30=100.",
    ],
    estimatedMinutes: 9,
  },
};
