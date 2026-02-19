import type { GameLessonVariant } from "@/types/game";

export const lesson40SpaceShooter: GameLessonVariant = {
  lessonId: "40-cleanup-system",
  instructions: `# Cleanup System — The Pool Drains Dry

You spawn entities. They move. They collide. They take damage. Some die. Some fly off-screen. But nothing reclaims their slots. The pool freeList shrinks every frame. After enough spawns, freeCount hits zero. The spawn system returns -1. No more enemies. No more bullets. The game suffocates on its own dead entities.

## What Breaks Without This

Without cleanup, every entity that dies or leaves the screen permanently occupies a pool slot. A bullet that flies past y=0 is invisible but still alive in memory. A dead enemy with hp=0 sits in its slot forever. The pool is finite. When it fills, the game cannot spawn. Waves stop. Bullets stop. The player sees an empty screen with no enemies and no way to fire. The game is over, but not because the player lost.

## The Fix

The cleanup system runs last in the pipeline. It sweeps all entities and checks two conditions. First: is the entity off-screen? \\\`y < 0\\\` or \\\`y > 400\\\` means the entity has left the playfield. Second: is the entity dead? \\\`hp <= 0\\\` means the damage system killed it. Either condition triggers recycling.

Recycling is a stack push. \\\`freeList[freeCount] = idx; freeCount++;\\\` One store, one increment. The slot is now available for the next spawn. The data in the arrays is stale but does not matter — the next spawn overwrites it completely.

Cleanup must run after damage. If cleanup runs first, it removes dead entities before the damage system processes their death events. The pipeline order is: spawn, movement, formation, bounds, damage, cleanup. Cleanup is always last. Always.

## Your Task

1. SoA arrays for 20 entities: x[], y[], vx[], vy[], hp[], type[] (1=bullet, 2=enemy), alive[]
2. Pool: freeList[20], freeCount starts at 20
3. Write \\\`spawnFromPool(px, py, velx, vely, ehp, etype)\\\` -- pops from freeList
4. Write \\\`returnToPool(idx)\\\` -- pushes idx onto freeList, sets alive=false
5. Spawn 8 bullets: x=50,70,90,...190, y=350, vx=0, vy=-80
6. Spawn 5 enemies: x=60,90,120,150,180, y=20, vx=0, vy=8, hp=10
7. Write \\\`cleanupSystem(count, frame)\\\`:
   - If y < 0 or y > 400: returnToPool, count as offscreen
   - If hp <= 0 and alive: returnToPool, count as dead
   - Print: \\\`CLEANUP|frame|<f>|offscreen|<n>|dead|<n>|recycled|<total>\\\`
8. Write \\\`movementSystem(count)\\\`: x += vx, y += vy for alive entities
9. Write \\\`damageSystem(count)\\\`: bullets vs enemies, abs(dx)<15 && abs(dy)<15, apply 10 damage, despawn bullet
10. Run 5 frames: movement, damage, then cleanup each frame
11. After each frame: \\\`POOL_STATE|frame|<f>|active|<alive>|free|<freeCount>|total|20\\\`
12. After all frames: \\\`CLEANUP_SUMMARY|total_recycled|<n>|offscreen|<n>|killed|<n>\\\`

## Beginner Trap

**Common Mistake:** Running cleanup before damage. If cleanup removes a dead enemy before the damage system logs the kill, you lose the event. The damage system marks \\\`alive = false\\\` on bullets it consumes, but does not return them to the pool. That is cleanup's job. Cleanup must be the last system in the pipeline. The order is movement, damage, cleanup. Never rearrange it.

## Elite Insight

Pool recycling is a stack push. \\\`freeList[freeCount] = idx; freeCount++;\\\` The next spawn pops from the same stack. This means recently freed slots are reused first — hot in cache, already touched this frame. The pool is a natural LRU cache without any LRU bookkeeping. The CPU prefetcher rewards you for temporal locality.

## Cross-Path Echo

Garbage collection in managed languages does the same sweep. Mark phase flags unreachable objects. Sweep phase reclaims their memory. The cleanup system is a manual GC pass — you control exactly when it runs, what it checks, and how it reclaims. Zero pause time ambiguity. Zero stop-the-world. You own the frame budget.`,
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
    { id: "g1", description: "Should show cleanup events per frame", expectedOutput: "CLEANUP\\|frame\\|\\d+\\|offscreen\\|\\d+\\|dead\\|\\d+\\|recycled\\|\\d+", isPattern: true },
    { id: "g2", description: "Should show pool state per frame", expectedOutput: "POOL_STATE\\|frame\\|\\d+\\|active\\|\\d+\\|free\\|\\d+\\|total\\|20", isPattern: true },
    { id: "g3", description: "Bullets should go offscreen with vy=-80", expectedOutput: "CLEANUP\\|frame\\|\\d+\\|offscreen\\|[1-9]", isPattern: true },
    { id: "g4", description: "Should show cleanup summary", expectedOutput: "CLEANUP_SUMMARY\\|total_recycled\\|\\d+\\|offscreen\\|\\d+\\|killed\\|\\d+", isPattern: true },
    { id: "g5", description: "Pool total should always be 20", expectedOutput: "POOL_STATE\\|frame\\|5\\|active\\|\\d+\\|free\\|\\d+\\|total\\|20", isPattern: true },
  ],
  hints: [
    "Bullets at vy=-80 from y=350 reach y=270 after frame 1, y=190 after frame 2, y=110 after frame 3, y=30 after frame 4, y=-50 after frame 5. They go offscreen at frame 5.",
    "returnToPool pushes the index back: `freeList[freeCount] = idx; freeCount++;` This is the reverse of spawnFromPool's pop. The pool is a stack.",
    "cleanupSystem checks offscreen first (y < 0 or y > 400), then dead (hp <= 0). Count each category separately, sum for the recycled total. Track globals for the final summary.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 600;
const int FIXED_DT = 16;

struct WaveSchedule {
    int waveNum;
    int enemyCount;
    int spawnInterval;
    string enemyType;
};

int x[POOL_SIZE];
int y[POOL_SIZE];
int vx[POOL_SIZE];
int vy[POOL_SIZE];
int hp[POOL_SIZE];
int damage[POOL_SIZE];
int type[POOL_SIZE];
bool alive[POOL_SIZE];

int freeList[POOL_SIZE];
int freeCount = POOL_SIZE;

int score = 0;
int totalKills = 0;

int spawnFromPool(int px, int py, int velx, int vely, int ehp, int dmg, int etype) {
    if (freeCount <= 0) return -1;
    freeCount--;
    int idx = freeList[freeCount];
    x[idx] = px;
    y[idx] = py;
    vx[idx] = velx;
    vy[idx] = vely;
    hp[idx] = ehp;
    damage[idx] = dmg;
    type[idx] = etype;
    alive[idx] = true;
    return idx;
}

void returnToPool(int idx) {
    alive[idx] = false;
    freeList[freeCount] = idx;
    freeCount++;
}

void spawnEnemy(int px, int py, int ehp, int vel) {
    spawnFromPool(px, py, 0, vel, ehp, 0, 2);
}

void spawnBullet(int px, int py) {
    spawnFromPool(px, py, 0, -16, 1, 10, 1);
}

void movementSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
}

void formationSystem(int count, int step) {
    int offsets[] = {0, 10, 0, -10, 0};
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] != 2) continue;
        x[i] += offsets[(i + step) % 5];
    }
}

void boundsSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (type[i] == 1 && y[i] < 0) {
            alive[i] = false;
        }
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
            if (dx < 20 && dy < 20) {
                hp[e] -= damage[b];
                alive[b] = false;
                if (hp[e] <= 0) {
                    alive[e] = false;
                    totalKills++;
                    score += 100;
                }
                break;
            }
        }
    }
}

void cleanupSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (y[i] < 0 || y[i] > 400) {
            returnToPool(i);
        } else if (hp[i] <= 0) {
            returnToPool(i);
        }
    }
}

void spawnSystem(WaveSchedule waves[], int numWaves, int tick,
                 int &currentWave, int &spawnedInWave, int &lastSpawnTick,
                 int &totalSpawned, int &wavesComplete) {
    if (currentWave >= numWaves) return;
    if ((tick - lastSpawnTick) >= waves[currentWave].spawnInterval
        && spawnedInWave < waves[currentWave].enemyCount) {
        int px, vel, ehp;
        if (waves[currentWave].enemyType == "basic") {
            px = 100 + spawnedInWave * 50;
            vel = 2;
            ehp = 10;
        } else if (waves[currentWave].enemyType == "fast") {
            px = 50 + spawnedInWave * 40;
            vel = 4;
            ehp = 5;
        } else {
            px = 150 + spawnedInWave * 100;
            vel = 1;
            ehp = 30;
        }
        spawnEnemy(px, 0, ehp, vel);
        lastSpawnTick = tick;
        spawnedInWave++;
        totalSpawned++;
        if (spawnedInWave >= waves[currentWave].enemyCount) {
            wavesComplete++;
            currentWave++;
            spawnedInWave = 0;
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
    for (int i = 0; i < POOL_SIZE; i++) {
        freeList[i] = i;
        alive[i] = false;
    }

    WaveSchedule waves[] = {
        {1, 3, 2, "basic"},
        {2, 5, 1, "fast"},
        {3, 2, 3, "boss"}
    };

    int currentWave = 0, spawnedInWave = 0, lastSpawnTick = 0;
    int totalSpawned = 0, wavesComplete = 0;

    for (int i = 0; i < 5; i++) {
        spawnBullet(200, 300 - i * 4);
    }

    int accumulator = 0;
    int totalSteps = 0;
    int frameTimes[] = {16, 32, 16};

    for (int f = 0; f < 3; f++) {
        accumulator += frameTimes[f];
        int stepsThisFrame = 0;
        while (accumulator >= FIXED_DT) {
            totalSteps++;
            spawnSystem(waves, 3, totalSteps, currentWave, spawnedInWave,
                        lastSpawnTick, totalSpawned, wavesComplete);
            movementSystem(POOL_SIZE);
            formationSystem(POOL_SIZE, totalSteps);
            boundsSystem(POOL_SIZE);
            damageSystem(POOL_SIZE);
            cleanupSystem(POOL_SIZE);
            accumulator -= FIXED_DT;
            stepsThisFrame++;
        }
        int bullets = countByType(POOL_SIZE, 1);
        int enemies = countByType(POOL_SIZE, 2);
        cout << "FRAME|" << (f + 1) << "|steps|" << stepsThisFrame
             << "|bullets|" << bullets << "|enemies|" << enemies << endl;
    }

    cout << "PIPELINE|spawn|movement|formation|bounds|damage|cleanup" << endl;
    cout << "SCORE|" << score << endl;
    return 0;
}
`,
};
