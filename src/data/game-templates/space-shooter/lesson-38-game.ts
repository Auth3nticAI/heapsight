import type { GameLessonVariant } from "@/types/game";

export const lesson38SpaceShooter: GameLessonVariant = {
  lessonId: "38-spawn-system",
  instructions: `# Spawn System — Enemies Appear From Nowhere

You have a pool. You have movement. You have collision detection. But nothing actually creates enemies. Right now your game is a shooting range with no targets. The spawn system reads a wave schedule and pulls entities from the pool at deterministic intervals. Without it, the game loop runs but nothing happens.

## What Breaks Without This

No spawn system means no enemies. No enemies means no collisions. No collisions means no score. The entire downstream pipeline — damage, cleanup, scoring — sits idle. The pool has 20 slots allocated and zero of them used. You have an engine with no fuel.

## The Fix

Define the wave schedule as data: a struct with wave number, enemy count, spawn interval, and enemy type. The spawn system checks the current tick against the schedule. When conditions are met, it pops an index from the pool freeList, initializes the entity at that slot, and advances the spawn counter. The schedule drives everything. Change the data, change the game. No code modification required.

Pool allocation is a stack pop. \\\`freeCount--; idx = freeList[freeCount];\\\` One decrement, one array read. No \\\`new\\\`, no \\\`malloc\\\`, no heap fragmentation. The entity slot was pre-allocated at startup. Spawning is O(1).

Each enemy type gets different stats. Basic enemies are slow with moderate HP. Fast enemies move quickly with low HP. Bosses are slow with high HP. The spawn system sets position, velocity, and HP based on the type string. The rest of the pipeline — movement, collision, damage — does not care about type. It processes arrays.

## Your Task

1. Define \\\`WaveSchedule\\\` struct: waveNum, enemyCount, spawnInterval, enemyType (string)
2. Create 3 waves:
   - Wave 1: 3 basic enemies, 2 ticks apart
   - Wave 2: 5 fast enemies, 1 tick apart
   - Wave 3: 2 boss enemies, 3 ticks apart
3. SoA arrays for 20 entities: x[], y[], vx[], vy[], hp[], type[], alive[]
4. Pool: freeList[] of size 20, freeCount starts at 20, all indices available
5. Write \\\`spawnFromPool(px, py, vel, ehp, etype)\\\` — pops index from freeList, initializes entity, returns index
6. \\\`spawnSystem\\\` processes schedule: if time to spawn and wave not done, call spawnFromPool
   - Basic enemies: x=100+(spawnedInWave*50), y=0, vy=2, hp=10
   - Fast enemies: x=50+(spawnedInWave*40), y=0, vy=4, hp=5
   - Boss enemies: x=150+(spawnedInWave*100), y=0, vy=1, hp=30
7. Run 15 ticks of simulation
8. For each spawn print: \\\`SPAWN|tick|<t>|wave|<w>|type|<type>|id|enemy_<idx>\\\`
9. When wave finishes: \\\`WAVE_COMPLETE|wave|<w>|tick|<t>\\\`
10. After all ticks: \\\`SPAWN_SUMMARY|total_spawned|10|waves_complete|3\\\`

## Beginner Trap

**Common Mistake:** Hardcoding entity indices instead of using the pool. If you do \\\`alive[totalSpawned] = true\\\`, you assume entities fill slots linearly. When cleanup recycles slots later, gaps appear. Always pop from the freeList to get the next available index. The pool is the single source of truth for slot allocation.

## Elite Insight

Deterministic spawning means replay is trivial. Record the initial seed and tick count, and you can reproduce every spawn event exactly. This is how replay systems work in competitive games — the entire game state is a function of the initial conditions and the sequence of inputs. No randomness, no desync.

## Cross-Path Echo

Database connection pools work the same way. Idle connections sit in a free list. When a query arrives, pop a connection, use it, return it when done. The pool prevents allocation overhead just like the entity pool prevents \\\`new\\\`/\\\`delete\\\` overhead in the hot path.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 20;

struct WaveSchedule {
    int waveNum;
    int enemyCount;
    int spawnInterval;
    string enemyType;
};

int x[MAX_ENTITIES];
int y[MAX_ENTITIES];
int vx[MAX_ENTITIES];
int vy[MAX_ENTITIES];
int hp[MAX_ENTITIES];
int type[MAX_ENTITIES];  // 0=none, 1=bullet, 2=enemy
bool alive[MAX_ENTITIES];

int freeList[MAX_ENTITIES];
int freeCount = MAX_ENTITIES;

// TODO: Write spawnFromPool(px, py, vel, ehp, etype)
//       Pop index from freeList, initialize entity, return index

// TODO: Write spawnSystem logic inside main loop
//       Check wave schedule against current tick
//       Spawn enemies using pool

int main() {
    // Initialize pool - all indices free
    for (int i = 0; i < MAX_ENTITIES; i++) {
        freeList[i] = i;
        alive[i] = false;
    }

    // TODO: Define 3 waves
    // Wave 1: 3 basic, interval 2
    // Wave 2: 5 fast, interval 1
    // Wave 3: 2 boss, interval 3

    // TODO: Run 15 ticks, spawn from schedule, print events

    // TODO: Print SPAWN_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 20;

struct WaveSchedule {
    int waveNum;
    int enemyCount;
    int spawnInterval;
    string enemyType;
};

int x[MAX_ENTITIES];
int y[MAX_ENTITIES];
int vx[MAX_ENTITIES];
int vy[MAX_ENTITIES];
int hp[MAX_ENTITIES];
int type[MAX_ENTITIES];
bool alive[MAX_ENTITIES];

int freeList[MAX_ENTITIES];
int freeCount = MAX_ENTITIES;

int spawnFromPool(int px, int py, int vel, int ehp, int etype) {
    if (freeCount <= 0) return -1;
    freeCount--;
    int idx = freeList[freeCount];
    x[idx] = px;
    y[idx] = py;
    vx[idx] = 0;
    vy[idx] = vel;
    hp[idx] = ehp;
    type[idx] = etype;
    alive[idx] = true;
    return idx;
}

int main() {
    for (int i = 0; i < MAX_ENTITIES; i++) {
        freeList[i] = i;
        alive[i] = false;
    }

    WaveSchedule waves[] = {
        {1, 3, 2, "basic"},
        {2, 5, 1, "fast"},
        {3, 2, 3, "boss"}
    };
    int numWaves = 3;

    int totalSpawned = 0;
    int wavesComplete = 0;
    int currentWave = 0;
    int spawnedInWave = 0;
    int lastSpawnTick = 0;

    for (int tick = 1; tick <= 15; tick++) {
        if (currentWave < numWaves) {
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
                int idx = spawnFromPool(px, 0, vel, ehp, 2);
                if (idx >= 0) {
                    cout << "SPAWN|tick|" << tick
                         << "|wave|" << waves[currentWave].waveNum
                         << "|type|" << waves[currentWave].enemyType
                         << "|id|enemy_" << idx << endl;
                    lastSpawnTick = tick;
                    spawnedInWave++;
                    totalSpawned++;

                    if (spawnedInWave >= waves[currentWave].enemyCount) {
                        cout << "WAVE_COMPLETE|wave|" << waves[currentWave].waveNum
                             << "|tick|" << tick << endl;
                        wavesComplete++;
                        currentWave++;
                        spawnedInWave = 0;
                    }
                }
            }
        }
    }

    cout << "SPAWN_SUMMARY|total_spawned|" << totalSpawned
         << "|waves_complete|" << wavesComplete << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Wave 1 first spawn at tick 2", expectedOutput: "SPAWN\\|tick\\|2\\|wave\\|1\\|type\\|basic\\|id\\|enemy_\\d+", isPattern: true },
    { id: "g2", description: "Wave 1 completes at tick 6", expectedOutput: "WAVE_COMPLETE|wave|1|tick|6" },
    { id: "g3", description: "Wave 2 spawns fast enemies", expectedOutput: "SPAWN\\|tick\\|\\d+\\|wave\\|2\\|type\\|fast\\|id\\|enemy_\\d+", isPattern: true },
    { id: "g4", description: "Wave 2 completes", expectedOutput: "WAVE_COMPLETE\\|wave\\|2\\|tick\\|\\d+", isPattern: true },
    { id: "g5", description: "Wave 3 spawns boss enemies", expectedOutput: "SPAWN\\|tick\\|\\d+\\|wave\\|3\\|type\\|boss\\|id\\|enemy_\\d+", isPattern: true },
    { id: "g6", description: "Summary shows 10 spawned, 3 waves complete", expectedOutput: "SPAWN_SUMMARY|total_spawned|10|waves_complete|3" },
  ],
  hints: [
    "Initialize freeList with indices 0-19. spawnFromPool decrements freeCount and uses freeList[freeCount] as the new index. This is a stack-based pool.",
    "The spawn condition is `(tick - lastSpawnTick) >= interval && spawnedInWave < enemyCount`. When a wave completes, reset spawnedInWave but keep lastSpawnTick at the completion tick.",
    "Enemy positions depend on spawnedInWave: basic at x=100+(i*50), fast at x=50+(i*40), boss at x=150+(i*100). All start at y=0.",
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
int type[POOL_SIZE];
bool alive[POOL_SIZE];

int freeList[POOL_SIZE];
int freeCount = POOL_SIZE;

int spawnFromPool(int px, int py, int vel, int ehp, int etype) {
    if (freeCount <= 0) return -1;
    freeCount--;
    int idx = freeList[freeCount];
    x[idx] = px;
    y[idx] = py;
    vx[idx] = 0;
    vy[idx] = vel;
    hp[idx] = ehp;
    type[idx] = etype;
    alive[idx] = true;
    return idx;
}

void spawnEnemy(int px, int py) {
    spawnFromPool(px, py, 4, 3, 2);
}

void spawnBullet(int px, int py) {
    spawnFromPool(px, py, -16, 1, 1);
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
        spawnFromPool(px, 0, vel, ehp, 2);
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

    // Spawn initial bullets
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
            collisionSystem(POOL_SIZE);
            cleanupSystem(POOL_SIZE);
            accumulator -= FIXED_DT;
            stepsThisFrame++;
        }
        int bullets = countByType(POOL_SIZE, 1);
        int enemies = countByType(POOL_SIZE, 2);
        cout << "FRAME|" << (f + 1) << "|steps|" << stepsThisFrame
             << "|bullets|" << bullets << "|enemies|" << enemies << endl;
    }

    cout << "PIPELINE|spawn|movement|formation|bounds|collision|cleanup" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
