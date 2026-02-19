import type { Lesson } from "@/types/lesson";

export const lesson40: Lesson = {
  id: "40-cleanup-system",
  title: "Cleanup System",
  description: "Remove off-screen bullets and dead entities from the active set.",
  order: 40,
  xpReward: 175,
  tier: "pro",
  concepts: ["entity cleanup", "bounds checking", "dead entity removal", "system ordering", "pool recycling"],
  part1: {
    title: "Concept: Entity Cleanup Patterns",
    type: "concept",
    instructions: `# Entity Cleanup Patterns — The Last System in the Pipeline

After movement, some entities go off-screen. After damage, some die. These entities still occupy array slots. Their \\\`alive\\\` flag might already be false, but their pool slots are not recycled. Without cleanup, the pool drains. Eventually \\\`freeCount\\\` hits zero and no new entities can spawn. The game freezes — not from a crash, but from resource exhaustion.

## System Ordering

Cleanup must run after all other systems. If cleanup runs before damage, a dying enemy gets removed before the damage system can process its death event. If cleanup runs before movement, an entity moving off-screen is not caught. The correct pipeline order is:

\\\`\\\`\\\`
spawn → movement → collision → damage → cleanup → render
\\\`\\\`\\\`

Cleanup is the drain at the bottom of the pipeline. Everything flows through, and cleanup catches what is no longer needed.

## Two Cleanup Conditions

1. **Off-screen**: position is outside game bounds (y < 0 or y > 400). Bullets that fly past the top or enemies that fall below the bottom.
2. **Dead**: hp <= 0. Entities killed by the damage system.

Both conditions set \\\`alive = false\\\` and return the index to the pool freeList.

## Your Task

1. Create arrays for 6 entities: \\\`x[6]\\\`, \\\`y[6]\\\`, \\\`hp[6]\\\`, \\\`alive[6]\\\`, \\\`type[6]\\\` (1=bullet, 2=enemy)
2. Pool: \\\`freeList[6]\\\`, \\\`freeCount = 0\\\` (all slots in use)
3. Initialize:
   - Entity 0: bullet, y=-10, hp=1 (off-screen)
   - Entity 1: bullet, y=200, hp=1 (normal)
   - Entity 2: bullet, y=450, hp=1 (off-screen)
   - Entity 3: enemy, y=100, hp=0 (dead)
   - Entity 4: enemy, y=200, hp=5 (normal)
   - Entity 5: enemy, y=-20, hp=3 (off-screen)
4. Write \\\`cleanupSystem\\\` that checks each alive entity:
   - If y < 0 or y > 400: set alive=false, add to freeList, print: \\\`CLEANUP|entity|<i>|reason|offscreen\\\`
   - If hp <= 0: set alive=false, add to freeList, print: \\\`CLEANUP|entity|<i>|reason|dead\\\`
5. Run cleanup once
6. Print: \\\`POOL|active|<alive_count>|free|<freeCount>|total|6\\\`

Expected output:
\\\`\\\`\\\`
CLEANUP|entity|0|reason|offscreen
CLEANUP|entity|2|reason|offscreen
CLEANUP|entity|3|reason|dead
CLEANUP|entity|5|reason|offscreen
POOL|active|2|free|4|total|6
\\\`\\\`\\\`

Entities 0, 2, and 5 are off-screen. Entity 3 has hp=0. Entities 1 and 4 survive.`,
    starterCode: `#include <iostream>
using namespace std;

const int COUNT = 6;

int x[COUNT];
int y[COUNT];
int hp[COUNT];
bool alive[COUNT];
int type[COUNT];  // 1=bullet, 2=enemy

int freeList[COUNT];
int freeCount = 0;

// TODO: Write cleanupSystem()
//       For each alive entity:
//         If y < 0 or y > 400: mark dead, recycle to pool, print reason=offscreen
//         If hp <= 0: mark dead, recycle to pool, print reason=dead

int main() {
    // Initialize entities
    x[0]=100; y[0]=-10;  hp[0]=1; type[0]=1; alive[0]=true;
    x[1]=100; y[1]=200;  hp[1]=1; type[1]=1; alive[1]=true;
    x[2]=100; y[2]=450;  hp[2]=1; type[2]=1; alive[2]=true;
    x[3]=150; y[3]=100;  hp[3]=0; type[3]=2; alive[3]=true;
    x[4]=150; y[4]=200;  hp[4]=5; type[4]=2; alive[4]=true;
    x[5]=150; y[5]=-20;  hp[5]=3; type[5]=2; alive[5]=true;

    // TODO: Run cleanupSystem

    // TODO: Count alive entities and print POOL status

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int COUNT = 6;

int x[COUNT];
int y[COUNT];
int hp[COUNT];
bool alive[COUNT];
int type[COUNT];

int freeList[COUNT];
int freeCount = 0;

void cleanupSystem() {
    for (int i = 0; i < COUNT; i++) {
        if (!alive[i]) continue;
        if (y[i] < 0 || y[i] > 400) {
            alive[i] = false;
            freeList[freeCount] = i;
            freeCount++;
            cout << "CLEANUP|entity|" << i << "|reason|offscreen" << endl;
        } else if (hp[i] <= 0) {
            alive[i] = false;
            freeList[freeCount] = i;
            freeCount++;
            cout << "CLEANUP|entity|" << i << "|reason|dead" << endl;
        }
    }
}

int main() {
    x[0]=100; y[0]=-10;  hp[0]=1; type[0]=1; alive[0]=true;
    x[1]=100; y[1]=200;  hp[1]=1; type[1]=1; alive[1]=true;
    x[2]=100; y[2]=450;  hp[2]=1; type[2]=1; alive[2]=true;
    x[3]=150; y[3]=100;  hp[3]=0; type[3]=2; alive[3]=true;
    x[4]=150; y[4]=200;  hp[4]=5; type[4]=2; alive[4]=true;
    x[5]=150; y[5]=-20;  hp[5]=3; type[5]=2; alive[5]=true;

    cleanupSystem();

    int aliveCount = 0;
    for (int i = 0; i < COUNT; i++) {
        if (alive[i]) aliveCount++;
    }
    cout << "POOL|active|" << aliveCount << "|free|" << freeCount << "|total|" << COUNT << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Entity 0 cleaned up as offscreen", expectedOutput: "CLEANUP|entity|0|reason|offscreen" },
      { id: "t2", description: "Entity 2 cleaned up as offscreen", expectedOutput: "CLEANUP|entity|2|reason|offscreen" },
      { id: "t3", description: "Entity 3 cleaned up as dead", expectedOutput: "CLEANUP|entity|3|reason|dead" },
      { id: "t4", description: "Entity 5 cleaned up as offscreen", expectedOutput: "CLEANUP|entity|5|reason|offscreen" },
      { id: "t5", description: "Pool shows 2 active, 4 free", expectedOutput: "POOL|active|2|free|4|total|6" },
    ],
    hints: [
      "Check bounds first (y < 0 or y > 400), then check hp <= 0. An entity that is both off-screen and dead should be cleaned up as offscreen since the bounds check comes first.",
      "To recycle: `freeList[freeCount] = i; freeCount++;` This pushes the index onto the freeList stack. The spawn system will pop from it later.",
      "Only check entities where `alive[i]` is true. Entity 3 has hp=0 but is still alive — the damage system set hp but cleanup has not run yet.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Cleanup & Pool Recycling",
    type: "game_builder",
    instructions: `# Game Builder: Cleanup & Pool Recycling

Build the cleanupSystem that sweeps dead and off-screen entities, recycles their pool slots, and reports what was removed. This system runs last in the pipeline. Without it, the pool drains and the game stops spawning.

## Your Task
1. SoA arrays for 20 entities: x[], y[], vx[], vy[], hp[], type[] (1=bullet, 2=enemy), alive[]
2. Pool: freeList[20], freeCount starts at 20
3. Write \\\`spawnFromPool(px, py, velx, vely, ehp, etype)\\\` — pops from freeList
4. Write \\\`returnToPool(idx)\\\` — pushes idx onto freeList, sets alive=false
5. Spawn 8 bullets: x=50..190 (spacing 20), y=350, vx=0, vy=-80
6. Spawn 5 enemies: x=60..180 (spacing 30), y=20, vx=0, vy=8, hp=10
7. Write \\\`cleanupSystem(count, frame)\\\`:
   - If y < 0 or y > 400: returnToPool, count as offscreen
   - If hp <= 0 and alive: returnToPool, count as dead
   - Print: \\\`CLEANUP|frame|<f>|offscreen|<n>|dead|<n>|recycled|<total>\\\`
8. Write \\\`movementSystem(count)\\\`: x += vx, y += vy for alive entities
9. Write \\\`damageSystem(count)\\\`: bullets vs enemies, abs(dx)<15 && abs(dy)<15, apply 10 damage, despawn bullet
10. Run 5 frames: spawn, movement, damage, then cleanup each frame
11. After each frame: \\\`POOL_STATE|frame|<f>|active|<alive>|free|<freeCount>|total|20\\\`
12. After all frames: \\\`CLEANUP_SUMMARY|total_recycled|<n>|offscreen|<n>|killed|<n>\\\`

## Beginner Trap

**Common Mistake:** Running cleanup before damage. If cleanup removes a dead enemy before the damage system logs the kill, you lose the event. Cleanup must be the last system in the pipeline. The order is spawn, movement, damage, cleanup. Never rearrange it.

## Elite Insight

Pool recycling is a stack push. \\\`freeList[freeCount] = idx; freeCount++;\\\` One store, one increment. The next spawn pops from the same stack. This means recently freed slots are reused first — hot in cache, already touched this frame. The pool is a natural LRU cache without any LRU bookkeeping.

## Cross-Path Echo

Garbage collection in managed languages does the same sweep. Mark phase flags unreachable objects. Sweep phase reclaims their memory. The cleanup system is a manual GC pass — you control when it runs, what it checks, and how it reclaims. Zero pause time ambiguity.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_ENTITIES = 20;

int x[MAX_ENTITIES];
int y[MAX_ENTITIES];
int vx[MAX_ENTITIES];
int vy[MAX_ENTITIES];
int hp[MAX_ENTITIES];
int type[MAX_ENTITIES];  // 0=none, 1=bullet, 2=enemy
bool alive[MAX_ENTITIES];

int freeList[MAX_ENTITIES];
int freeCount = MAX_ENTITIES;

// TODO: Write spawnFromPool(px, py, velx, vely, ehp, etype) — pop from freeList

// TODO: Write returnToPool(idx) — push idx onto freeList, set alive=false

// TODO: Write movementSystem(count) — x += vx, y += vy for alive entities

// TODO: Write damageSystem(count) — bullet vs enemy collision
//       abs(dx)<15 && abs(dy)<15, apply 10 damage, despawn bullet

// TODO: Write cleanupSystem(count, frame) — check offscreen and dead
//       Return slots to pool, print CLEANUP summary

int main() {
    for (int i = 0; i < MAX_ENTITIES; i++) {
        freeList[i] = i;
        alive[i] = false;
    }

    // TODO: Spawn 8 bullets: x=50,70,90,...190, y=350, vy=-80
    // TODO: Spawn 5 enemies: x=60,90,120,150,180, y=20, vy=8, hp=10

    // TODO: Run 5 frames: movement -> damage -> cleanup
    //       Print POOL_STATE after each frame

    // TODO: Print CLEANUP_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_ENTITIES = 20;

int x[MAX_ENTITIES];
int y[MAX_ENTITIES];
int vx[MAX_ENTITIES];
int vy[MAX_ENTITIES];
int hp[MAX_ENTITIES];
int type[MAX_ENTITIES];
bool alive[MAX_ENTITIES];

int freeList[MAX_ENTITIES];
int freeCount = MAX_ENTITIES;

int totalOffscreen = 0;
int totalKilled = 0;
int totalRecycled = 0;

int spawnFromPool(int px, int py, int velx, int vely, int ehp, int etype) {
    if (freeCount <= 0) return -1;
    freeCount--;
    int idx = freeList[freeCount];
    x[idx] = px;
    y[idx] = py;
    vx[idx] = velx;
    vy[idx] = vely;
    hp[idx] = ehp;
    type[idx] = etype;
    alive[idx] = true;
    return idx;
}

void returnToPool(int idx) {
    alive[idx] = false;
    freeList[freeCount] = idx;
    freeCount++;
}

void movementSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
}

void damageSystem(int count) {
    for (int b = 0; b < count; b++) {
        if (!alive[b] || type[b] != 1) continue;
        for (int e = 0; e < count; e++) {
            if (!alive[e] || type[e] != 2) continue;
            int dx = x[b] - x[e];
            int dy = y[b] - y[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            if (dx < 15 && dy < 15) {
                hp[e] -= 10;
                alive[b] = false;
                break;
            }
        }
    }
}

void cleanupSystem(int count, int frame) {
    int offscreen = 0;
    int dead = 0;

    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (y[i] < 0 || y[i] > 400) {
            returnToPool(i);
            offscreen++;
        } else if (hp[i] <= 0) {
            returnToPool(i);
            dead++;
        }
    }

    int recycled = offscreen + dead;
    totalOffscreen += offscreen;
    totalKilled += dead;
    totalRecycled += recycled;

    cout << "CLEANUP|frame|" << frame
         << "|offscreen|" << offscreen
         << "|dead|" << dead
         << "|recycled|" << recycled << endl;
}

int main() {
    for (int i = 0; i < MAX_ENTITIES; i++) {
        freeList[i] = i;
        alive[i] = false;
    }

    for (int i = 0; i < 8; i++) {
        spawnFromPool(50 + i * 20, 350, 0, -80, 1, 1);
    }

    for (int i = 0; i < 5; i++) {
        spawnFromPool(60 + i * 30, 20, 0, 8, 10, 2);
    }

    int count = MAX_ENTITIES;

    for (int frame = 1; frame <= 5; frame++) {
        movementSystem(count);
        damageSystem(count);
        cleanupSystem(count, frame);

        int activeCount = 0;
        for (int i = 0; i < count; i++) {
            if (alive[i]) activeCount++;
        }
        cout << "POOL_STATE|frame|" << frame
             << "|active|" << activeCount
             << "|free|" << freeCount
             << "|total|" << MAX_ENTITIES << endl;
    }

    cout << "CLEANUP_SUMMARY|total_recycled|" << totalRecycled
         << "|offscreen|" << totalOffscreen
         << "|killed|" << totalKilled << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should show cleanup events per frame", expectedOutput: "CLEANUP\\|frame\\|\\d+\\|offscreen\\|\\d+\\|dead\\|\\d+\\|recycled\\|\\d+", isPattern: true },
      { id: "t2", description: "Should show pool state per frame", expectedOutput: "POOL_STATE\\|frame\\|\\d+\\|active\\|\\d+\\|free\\|\\d+\\|total\\|20", isPattern: true },
      { id: "t3", description: "Bullets should go offscreen (vy=-80)", expectedOutput: "CLEANUP\\|frame\\|\\d+\\|offscreen\\|[1-9]", isPattern: true },
      { id: "t4", description: "Should show cleanup summary", expectedOutput: "CLEANUP_SUMMARY\\|total_recycled\\|\\d+\\|offscreen\\|\\d+\\|killed\\|\\d+", isPattern: true },
      { id: "t5", description: "Pool total should always be 20", expectedOutput: "POOL_STATE\\|frame\\|5\\|active\\|\\d+\\|free\\|\\d+\\|total\\|20", isPattern: true },
    ],
    hints: [
      "Bullets at vy=-80 from y=350 reach y=270 after frame 1, y=190 after frame 2, y=110 after frame 3, y=30 after frame 4, y=-50 after frame 5. They go offscreen at frame 5.",
      "returnToPool pushes the index back: `freeList[freeCount] = idx; freeCount++;` This is the reverse of spawnFromPool's pop. The pool is a stack.",
      "cleanupSystem checks offscreen first (y < 0 or y > 400), then dead (hp <= 0). Count each category separately, sum for recycled total. Track globals for the final summary.",
    ],
    estimatedMinutes: 10,
  },
};
