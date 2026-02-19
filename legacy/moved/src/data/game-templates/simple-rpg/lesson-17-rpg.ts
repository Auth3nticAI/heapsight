import type { GameLessonVariant } from "@/types/game";

export const lesson17RPG: GameLessonVariant = {
  lessonId: "rpg-17-free-list",

  instructions: `# Free List — Wave Recycling

## Mental Model

Object pooling pattern. Dead slots go on the free list. New spawns reuse them. No allocator call. O(1).

The dungeon spawns enemies in waves. When enemies die their slot index is pushed onto a stack. When the next wave needs a new enemy the engine pops from that stack. The slot that most recently died is the slot that most immediately lives again. LIFO. Cache-friendly. Zero overhead.

There is a deeper truth here. The free list does not know about enemies. It knows about indices. The pool does not know about game objects. It knows about memory slots. Separating the allocator from the thing being allocated is the pattern. You can use this free list for bullets, particles, sound voices, network packets — anything with a fixed maximum count and frequent churn.

## What Breaks Without This

Without the free list, every wave spawn scans the entire pool for the first dead slot. Fifty enemies? Fifty scans per wave. Five hundred? The spawn loop becomes the bottleneck. The frame drops when the boss wave hits. Players notice. They always notice. The free list eliminates the scan entirely. Pop. Done. One operation.

## The Fix

Push on death. Pop on spawn. The stack top is always the next available slot:

\\\`\\\`\\\`cpp
void despawnEnemy(int id) {
    alive[id] = false;
    freeList[freeTop++] = id; // push
}

int spawnEnemy(int x, int y) {
    int id;
    if (freeTop > 0) {
        id = freeList[--freeTop]; // pop
    } else {
        id = nextId++;            // fresh slot
    }
    alive[id] = true;
    ex[id] = x; ey[id] = y;
    return id;
}
\\\`\\\`\\\`

Two functions. One integer (freeTop). The pool handles ten thousand enemies as efficiently as ten.

## Pattern Insight

This is the Object Pool pattern from Game Programming Patterns (Nystrom, 2014). The pool pre-allocates all objects. The free list tracks which are available. The pattern is so common it has been in the C standard library since 1972. \\\`malloc\\\` maintains a free list of heap blocks. Your EntityManager maintains a free list of entity slots. Same data structure. Different domain.

## Scalability Insight

Add one integer per slot — a generation counter. Increment it every time the slot is reused. Encode the slot index and generation into a single 64-bit handle. Now you can detect stale handles: if someone holds a reference to entity 7 generation 3 but the slot is now occupied by entity 7 generation 4, the reference is invalid. This is the generational index pattern. It is how Bitsquid (now Autodesk Stingray) implemented handles in 2011. Your free list is step one.

## Your Task

Two-wave dungeon with free list recycling:

1. Initialize pool: \\\`bool alive[8]\\\`, \\\`int ex[8]\\\`, \\\`int ey[8]\\\`, all zeroed. \\\`freeTop = 0\\\`, \\\`nextId = 0\\\`.
2. Implement \\\`spawnEnemy(x, y)\\\`: pop from freeList if available (print \\\`REUSED slot N\\\`), else use \\\`nextId++\\\`. Set alive, position. Return id.
3. Implement \\\`despawnEnemy(id)\\\`: set \\\`alive[id] = false\\\`, push id to freeList.
4. Wave 1: spawn 4 enemies at (3,2), (8,2), (14,2), (17,2). Render. Print \\\`HUD|WAVE:1|ALIVE:4\\\`.
5. Kill ids 1 and 3 (despawn). Render. Print \\\`HUD|WAVE:1|ALIVE:2\\\`.
6. Wave 2: spawn 2 enemies at (6,7) and (15,7). Render. Print \\\`HUD|WAVE:2|ALIVE:4\\\`.
7. Print \\\`GAME_MESSAGE|Slots recycled efficiently\\\`.

## Common Mistake (Beginner Trap)

Forgetting to pre-decrement when popping. \\\`id = freeList[--freeTop]\\\` not \\\`id = freeList[freeTop--]\\\`. Post-decrement reads the slot at the current top then decrements. Pre-decrement decrements first then reads. You want pre-decrement: subtract one, then use the new top as the index. Post-decrement reads the slot one past the valid top — a bounds overrun.

## Elite Insight (Skyrim, Diablo, Zelda)

Diablo III's monster engine manages thousands of active monsters across an open world. Each monster type has its own pool. Each pool has its own free list. When a monster dies, its slot is immediately available for the next spawn trigger — a doorway opened, a new room entered, a scripted event. The latency between death and respawn is zero allocation time because the slot was never returned to the heap. Your two-wave dungeon demonstrates the same mechanic at lesson scale.

## Pattern Recognition

You have implemented the core of every entity manager in every production game engine. Unity's ECS. Unreal's actor pool. id Tech's entity system. The free list is not a detail. It is the architecture. The names change: slot, handle, entity, actor, object. The structure does not: pool + free list + alive flag. Master this. You will use it forever.

## Skill Reinforcement

- Stack semantics for free list: push on death, pop on birth
- LIFO order: last freed is first reused — intentional, not accidental
- Pool size is fixed: \\\`nextId\\\` only advances when the free list is empty
- Render reads only alive slots: dead slots are invisible to the world

## Mastery Check

What happens if you despawn an entity that is already dead? You push its index onto the free list twice. The next two spawns get the same index. Two entities share one slot. Catastrophic aliasing. Production systems guard against this with an assertion: \\\`assert(alive[id])\\\` before despawn. Add that guard to your EntityManager before it causes you grief.`,

  starterCode: `#include <iostream>
using namespace std;

const int MAX = 8;

bool alive[MAX];
int ex[MAX], ey[MAX];
int freeList[MAX];
int freeTop = 0;
int nextId = 0;

int spawnEnemy(int x, int y) {
    // TODO: pop from freeList if available, print "REUSED slot N"
    // else use nextId++
    // Set alive, position, return id
    return -1;
}

void despawnEnemy(int id) {
    // TODO: mark dead, push to freeList
}

int countAlive() {
    int n = 0;
    for (int i = 0; i < MAX; i++) if (alive[i]) n++;
    return n;
}

void renderGrid() {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else {
                char cell = '.';
                for (int i = 0; i < MAX; i++) {
                    if (alive[i] && ex[i] == col && ey[i] == row) {
                        cell = 'E'; break;
                    }
                }
                cout << cell;
            }
        }
        cout << endl;
    }
}

int main() {
    // Wave 1: spawn 4 at (3,2),(8,2),(14,2),(17,2)
    // Render + HUD|WAVE:1|ALIVE:4

    // Despawn ids 1 and 3
    // Render + HUD|WAVE:1|ALIVE:2

    // Wave 2: spawn 2 at (6,7),(15,7) — reuses slots
    // Render + HUD|WAVE:2|ALIVE:4
    // GAME_MESSAGE|Slots recycled efficiently

    return 0;
}
`,

  solutionCode: `#include <iostream>
using namespace std;

const int MAX = 8;

bool alive[MAX];
int ex[MAX], ey[MAX];
int freeList[MAX];
int freeTop = 0;
int nextId = 0;

int spawnEnemy(int x, int y) {
    int id;
    if (freeTop > 0) {
        id = freeList[--freeTop];
        cout << "REUSED slot " << id << endl;
    } else {
        id = nextId++;
    }
    alive[id] = true;
    ex[id] = x;
    ey[id] = y;
    return id;
}

void despawnEnemy(int id) {
    alive[id] = false;
    freeList[freeTop++] = id;
}

int countAlive() {
    int n = 0;
    for (int i = 0; i < MAX; i++) if (alive[i]) n++;
    return n;
}

void renderGrid() {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else {
                char cell = '.';
                for (int i = 0; i < MAX; i++) {
                    if (alive[i] && ex[i] == col && ey[i] == row) {
                        cell = 'E'; break;
                    }
                }
                cout << cell;
            }
        }
        cout << endl;
    }
}

int main() {
    // Wave 1: spawn 4 enemies
    int a = spawnEnemy(3, 2);   // id 0
    int b = spawnEnemy(8, 2);   // id 1
    int c = spawnEnemy(14, 2);  // id 2
    int d = spawnEnemy(17, 2);  // id 3

    renderGrid();
    cout << "HUD|WAVE:1|ALIVE:" << countAlive() << endl;

    // Kill ids 1 and 3
    despawnEnemy(b); // push 1 -> freeList[0]
    despawnEnemy(d); // push 3 -> freeList[1]

    renderGrid();
    cout << "HUD|WAVE:1|ALIVE:" << countAlive() << endl;

    // Wave 2: reuse slots (LIFO: pops 3, then 1)
    int e = spawnEnemy(6, 7);  // REUSED slot 3
    int f = spawnEnemy(15, 7); // REUSED slot 1

    renderGrid();
    cout << "HUD|WAVE:2|ALIVE:" << countAlive() << endl;
    cout << "GAME_MESSAGE|Slots recycled efficiently" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Wave 1 initial HUD shows 4 alive enemies",
      expectedOutput: "HUD\\|WAVE:1\\|ALIVE:4",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Wave 1 after kills HUD shows 2 alive enemies",
      expectedOutput: "HUD\\|WAVE:1\\|ALIVE:2",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Wave 2 HUD shows 4 alive enemies after recycled spawns",
      expectedOutput: "HUD\\|WAVE:2\\|ALIVE:4",
      isPattern: true,
    },
    {
      id: "g4",
      description: "REUSED slot 3 printed — LIFO pops last-despawned slot first",
      expectedOutput: "REUSED slot 3",
      isPattern: true,
    },
    {
      id: "g5",
      description: "GAME_MESSAGE announces efficient slot recycling",
      expectedOutput: "GAME_MESSAGE\\|Slots recycled efficiently",
      isPattern: true,
    },
  ],

  hints: [
    "Despawn b then d — that order pushes 1 first, then 3. freeTop becomes 2. Pop returns 3 first (freeTop goes to 1), then 1 (freeTop goes to 0). LIFO.",
    "The REUSED messages print inside spawnEnemy. They appear in the output stream before the HUD lines that follow the spawn calls.",
    "renderGrid only draws \\\`E\\\` where \\\`alive[i]\\\` is true. After despawning b and d, only ids 0 and 2 are alive — two E markers on the second grid.",
    "Three grid renders total: after wave 1 spawn, after wave 1 kills, after wave 2 spawn. Each followed by its HUD line.",
    "Pre-decrement when popping: \\\`id = freeList[--freeTop]\\\`. Decrement first, then index. Post-decrement (\\\`freeTop--\\\`) reads past the valid stack top.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

// ==============================
// RPG CORE — Lessons 1-17
// Free List Entity Manager
// ==============================

// === FREE LIST POOL ===
// Pool: fixed array of slots (alive flag + position)
// Free list: stack of available slot indices
// spawn() = O(1) pop. despawn() = O(1) push.

const int MAX_ENEMIES = 8;

bool alive[MAX_ENEMIES];
int ex[MAX_ENEMIES], ey[MAX_ENEMIES];
int enemyHP[MAX_ENEMIES];

int freeList[MAX_ENEMIES];
int freeTop = 0;
int nextId = 0;

// === UTILITY: isAdjacent ===
bool isAdjacent(int ax, int ay, int bx, int by) {
    int dx = ax - bx; if (dx < 0) dx = -dx;
    int dy = ay - by; if (dy < 0) dy = -dy;
    return (dx + dy) <= 1;
}

// === ENTITY MANAGER ===
int spawnEnemy(int x, int y, int hp = 30) {
    int id;
    if (freeTop > 0) {
        id = freeList[--freeTop]; // O(1) pop
    } else {
        id = nextId++;            // fresh slot
    }
    alive[id] = true;
    ex[id] = x; ey[id] = y;
    enemyHP[id] = hp;
    return id;
}

void despawnEnemy(int id) {
    alive[id] = false;
    freeList[freeTop++] = id; // O(1) push
}

int countAlive() {
    int n = 0;
    for (int i = 0; i < MAX_ENEMIES; i++) if (alive[i]) n++;
    return n;
}

// === GRID RENDER ===
// 20x10 dungeon. # border. . floor. E = alive enemy.
void renderGrid(int px = -1, int py = -1, int playerGold = 0) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (px == col && py == row) {
                cout << '@';
            } else {
                char cell = '.';
                for (int i = 0; i < MAX_ENEMIES; i++) {
                    if (alive[i] && ex[i] == col && ey[i] == row) {
                        cell = 'E'; break;
                    }
                }
                cout << cell;
            }
        }
        cout << endl;
    }
}

int main() {
    // Wave 1
    int a = spawnEnemy(3, 2);
    int b = spawnEnemy(8, 2);
    int c = spawnEnemy(14, 2);
    int d = spawnEnemy(17, 2);
    renderGrid();
    cout << "HUD|WAVE:1|ALIVE:" << countAlive() << endl;

    // Kill two
    despawnEnemy(b);
    despawnEnemy(d);
    renderGrid();
    cout << "HUD|WAVE:1|ALIVE:" << countAlive() << endl;

    // Wave 2: reuse dead slots
    spawnEnemy(6, 7);
    spawnEnemy(15, 7);
    renderGrid();
    cout << "HUD|WAVE:2|ALIVE:" << countAlive() << endl;
    cout << "GAME_MESSAGE|Slots recycled efficiently" << endl;

    return 0;
}
`,
};
