import type { GameLessonVariant } from "@/types/game";

export const lesson17SpaceShooter: GameLessonVariant = {
  lessonId: "17-ids-and-free-list",
  instructions: `# Free List Entity Manager — O(1) Spawn/Despawn

L10 gave you a pool with linear scan. Every spawn walks the entire alive array looking for a dead slot. That is O(n). With 1000 entities, that is 1000 comparisons per spawn. At 100 spawns per second, that is 100,000 wasted comparisons every second. The free list eliminates all of them.

## What Breaks Without This

Linear scan allocation at scale. Bullet-hell games spawn hundreds of projectiles per frame. Each spawn scans the full pool. Frame time spikes. The game stutters during the most intense moments — exactly when smooth performance matters most.

## The Fix

Maintain a stack of available slot indices. \\\`freeStack[]\\\` holds every dead slot index. \\\`freeTop\\\` tracks the top. Spawn = pop: \\\`freeStack[freeTop--]\\\`. Despawn = push: \\\`freeStack[++freeTop] = id\\\`. Two operations. O(1). Always.

Initialize by pushing all slots onto the stack. When the game starts, every slot is free. As enemies spawn, slots pop off. As enemies die, slots push back. The stack size tells you exactly how many slots are available at any moment.

The free list does not change your component arrays. Same \\\`enemy_x[]\\\`, \\\`enemy_y[]\\\`, \\\`enemy_hp[]\\\`, \\\`enemy_alive[]\\\`. Same movement system. Same render system. Only the allocation path changes. This is targeted optimization — change what is slow, leave what works.

## Your Task

1. Build an 8-slot pool with free list (\\\`freeStack[]\\\` + \\\`freeTop\\\`)
2. \\\`initPool()\\\` pushes all slots onto the stack and sets all alive=false
3. \\\`spawn(x, y, hp)\\\` pops from freeStack, fills component data, returns slot index
4. \\\`despawn(id)\\\` sets alive=false and pushes id back onto freeStack
5. Wave 1: spawn 4 enemies at x=60,120,180,240 y=40 hp=30
6. Run moveSystem (speed=30) — all alive enemies move down
7. Kill slots 1 and 2 via despawn (+100 score each)
8. Wave 2: spawn 3 enemies at x=100,200,300 y=40 hp=40 (track reused slots)
9. Run moveSystem again (speed=30)
10. Render all alive entities, output HUD and score

## Beginner Trap

**Common Mistake:** Setting \\\`alive[id] = false\\\` without pushing \\\`id\\\` back onto the free list. The slot is dead but not free. It can never be reused. The pool leaks capacity one despawn at a time until no slots remain.

## Elite Insight

Doom 3 uses \\\`idEntityFreeList\\\` — same stack-based pattern. Quake 3 Arena pools projectiles identically. The data structure is a solved problem. Every shipped engine uses some form of free list for hot-path allocation.

## Systems Thinking Connection

The free list replaces L10's linear scan without changing any other system. Movement, damage, render — all untouched. This is the power of clean interfaces. The allocation strategy is an implementation detail hidden behind spawn/despawn.

## Cross-Path Echo

Every game path needs O(1) allocation. Platformers pool platform tiles and particles. RPGs pool spell effects and inventory items. The free list pattern is universal because allocation on the hot path is always the bottleneck.`,
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

    // TODO: Kill slots 1 and 2 (despawn, score += 100 each)

    // TODO: Wave 2 - spawn 3 enemies at x=100,200,300 y=40 hp=40
    // If returned slot < 4, it was reused — increment reuseCount

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
    despawn(1);
    score += 100;
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
      description: "Slot 0: wave 1 survivor at y=100 hp=30",
      expectedOutput: "ENTITY\\|e0\\|enemy\\|60\\|100\\|22\\|22\\|30",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Slot 1: reused wave 2 enemy at y=70 hp=40",
      expectedOutput: "ENTITY\\|e1\\|enemy\\|200\\|70\\|22\\|22\\|40",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Slot 2: reused wave 2 enemy at y=70 hp=40",
      expectedOutput: "ENTITY\\|e2\\|enemy\\|100\\|70\\|22\\|22\\|40",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Slot 3: wave 1 survivor at y=100 hp=30",
      expectedOutput: "ENTITY\\|e3\\|enemy\\|240\\|100\\|22\\|22\\|30",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Slot 4: wave 2 new enemy at y=70 hp=40",
      expectedOutput: "ENTITY\\|e4\\|enemy\\|300\\|70\\|22\\|22\\|40",
      isPattern: true,
    },
    {
      id: "g6",
      description: "HUD shows score 200",
      expectedOutput: "HUD\\|HP:100\\|SCORE:200\\|LIVES:3",
      isPattern: true,
    },
    {
      id: "g7",
      description: "Free list message with 2 reused slots",
      expectedOutput: "GAME_MESSAGE\\|Free list active: 2 slots reused",
      isPattern: true,
    },
    {
      id: "g8",
      description: "Score is 200",
      expectedOutput: "SCORE\\|200",
      isPattern: true,
    },
  ],
  hints: [
    "Wave 1 spawns pop slots 0,1,2,3 from the free list (LIFO: 0 is on top after init). After moveSystem(30), all are at y=70.",
    "Despawning slots 1 and 2 pushes them back: freeStack is now [..., 2, 1]. Wave 2 pops 2 first, then 1, then 4. Slots 2 and 1 are reused.",
    "Wave 2 enemies start at y=40. After moveSystem(30), they are at y=70. Wave 1 survivors (slots 0,3) were already at y=70, now move to y=100.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

// === L17: Free List Entity Manager ===
// L10: Pool lifecycle | L17: O(1) allocation via free list

const int MAX = 8;

// --- Component arrays (SoA layout, L6) ---
int enemy_x[MAX];
int enemy_y[MAX];
int enemy_hp[MAX];
bool enemy_alive[MAX];

// --- Free list (L17: replaces L10 linear scan) ---
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

// --- System functions (L9: reference-based mutation) ---
void moveSystem(int speed) {
    for (int i = 0; i < MAX; i++) {
        if (enemy_alive[i]) enemy_y[i] += speed;
    }
}

void damageSystem(int targetIdx, int damage, int& score) {
    enemy_hp[targetIdx] -= damage;
    if (enemy_hp[targetIdx] < 0) enemy_hp[targetIdx] = 0;
    if (enemy_hp[targetIdx] <= 0) {
        despawn(targetIdx);
        score += 100;
    }
}

int main() {
    initPool();
    int score = 0;
    int reuseCount = 0;

    // --- Wave 1: spawn 4 enemies (L17: free list pop) ---
    for (int i = 0; i < 4; i++) {
        spawn(60 + i * 60, 40, 30);
    }

    // --- Movement system (L9) ---
    moveSystem(30);

    // --- Combat: kill slots 1, 2 (L17: despawn pushes to free list) ---
    despawn(1);
    score += 100;
    despawn(2);
    score += 100;

    // --- Wave 2: reuse dead slots (L17: free list reuse) ---
    int wave2x[3] = {100, 200, 300};
    for (int i = 0; i < 3; i++) {
        int id = spawn(wave2x[i], 40, 40);
        if (id < 4) reuseCount++;
    }

    // --- Movement system pass 2 ---
    moveSystem(30);

    // --- Render system (L8: conditional filtering) ---
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
};
