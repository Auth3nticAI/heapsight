import type { Lesson } from "@/types/lesson";

export const lesson38: Lesson = {
  id: "38-spawn-system",
  title: "Spawn System",
  description: "Build a deterministic spawn system that schedules enemy waves.",
  order: 38,
  xpReward: 175,
  tier: "pro",
  concepts: ["spawn scheduling", "wave system", "deterministic timing", "entity creation", "system design"],
  part1: {
    title: "Concept: Deterministic Spawn Scheduling",
    type: "concept",
    instructions: `# Deterministic Spawn Scheduling — Predictable Entity Creation

Games need enemies to appear at the right time. Random spawning creates chaos. Deterministic spawning creates design. You define a wave schedule — a data structure that says exactly when, how many, and what type of entity to create. The spawn system reads this schedule and executes it against a tick counter.

## The Wave Schedule

A wave is a struct: wave number, enemy count, spawn interval (ticks between spawns), and enemy type. The system tracks the current wave, how many have spawned so far, and the last spawn tick. Each simulation tick, it checks: has enough time passed since the last spawn? If yes, spawn the next entity and advance the counter.

\\\`\\\`\\\`
struct WaveSchedule {
    int waveNum;
    int enemyCount;
    int spawnInterval;
    string enemyType;
};
\\\`\\\`\\\`

When all enemies in a wave have spawned, the system moves to the next wave. When all waves are complete, spawning stops. This is entirely deterministic — given the same schedule and tick count, you get the same spawn sequence every time.

## Your Task

1. Define a \\\`WaveSchedule\\\` struct with: \\\`waveNum\\\`, \\\`enemyCount\\\`, \\\`spawnInterval\\\`, \\\`enemyType\\\` (string)
2. Create 3 waves:
   - Wave 1: 3 basic enemies, 2 ticks apart
   - Wave 2: 2 fast enemies, 3 ticks apart
   - Wave 3: 1 boss enemy, 1 tick apart
3. Write a spawn simulation: iterate ticks 1 through 15
4. Track: current wave index, spawned count in current wave, last spawn tick
5. Spawning rule: if \\\`(tick - lastSpawnTick) >= currentWave.spawnInterval\\\` and \\\`spawnedInWave < currentWave.enemyCount\\\`, spawn
6. First spawn in each wave happens at interval ticks after the previous wave ended (or at tick = interval for wave 1)
7. For each spawn, print: \\\`SPAWN|tick|<t>|wave|<w>|type|<type>|id|<id>\\\` where id increments from 0
8. When a wave finishes all spawns, print: \\\`WAVE_COMPLETE|wave|<w>|tick|<t>\\\`
9. After all ticks, print: \\\`SPAWN_SUMMARY|total_spawned|<n>|waves_complete|<n>\\\`

Expected output:
\\\`\\\`\\\`
SPAWN|tick|2|wave|1|type|basic|id|0
SPAWN|tick|4|wave|1|type|basic|id|1
SPAWN|tick|6|wave|1|type|basic|id|2
WAVE_COMPLETE|wave|1|tick|6
SPAWN|tick|9|wave|2|type|fast|id|3
SPAWN|tick|12|wave|2|type|fast|id|4
WAVE_COMPLETE|wave|2|tick|12
SPAWN|tick|13|wave|3|type|boss|id|5
WAVE_COMPLETE|wave|3|tick|13
SPAWN_SUMMARY|total_spawned|6|waves_complete|3
\\\`\\\`\\\`

Wave 1 starts spawning at tick 2 (interval=2). Wave 2 starts at tick 9 (3 ticks after wave 1 ended at tick 6). Wave 3 starts at tick 13 (1 tick after wave 2 ended at tick 12).`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct WaveSchedule {
    int waveNum;
    int enemyCount;
    int spawnInterval;
    string enemyType;
};

int main() {
    // TODO: Define 3 waves
    // Wave 1: 3 basic enemies, 2 ticks apart
    // Wave 2: 2 fast enemies, 3 ticks apart
    // Wave 3: 1 boss enemy, 1 tick apart

    int totalSpawned = 0;
    int wavesComplete = 0;
    int currentWave = 0;
    int spawnedInWave = 0;
    int lastSpawnTick = 0;

    // TODO: Simulate ticks 1 through 15
    // For each tick:
    //   Check if current wave is valid
    //   Check if enough ticks have passed since last spawn
    //   If spawn: print SPAWN line, increment counters
    //   If wave complete: print WAVE_COMPLETE, advance to next wave

    // TODO: Print SPAWN_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct WaveSchedule {
    int waveNum;
    int enemyCount;
    int spawnInterval;
    string enemyType;
};

int main() {
    WaveSchedule waves[] = {
        {1, 3, 2, "basic"},
        {2, 2, 3, "fast"},
        {3, 1, 1, "boss"}
    };
    int numWaves = 3;

    int totalSpawned = 0;
    int wavesComplete = 0;
    int currentWave = 0;
    int spawnedInWave = 0;
    int lastSpawnTick = 0;

    for (int tick = 1; tick <= 15; tick++) {
        if (currentWave >= numWaves) continue;

        if ((tick - lastSpawnTick) >= waves[currentWave].spawnInterval
            && spawnedInWave < waves[currentWave].enemyCount) {
            cout << "SPAWN|tick|" << tick
                 << "|wave|" << waves[currentWave].waveNum
                 << "|type|" << waves[currentWave].enemyType
                 << "|id|" << totalSpawned << endl;
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

    cout << "SPAWN_SUMMARY|total_spawned|" << totalSpawned
         << "|waves_complete|" << wavesComplete << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Wave 1 first spawn at tick 2", expectedOutput: "SPAWN|tick|2|wave|1|type|basic|id|0" },
      { id: "t2", description: "Wave 1 completes at tick 6", expectedOutput: "WAVE_COMPLETE|wave|1|tick|6" },
      { id: "t3", description: "Wave 2 first spawn at tick 9", expectedOutput: "SPAWN|tick|9|wave|2|type|fast|id|3" },
      { id: "t4", description: "Wave 3 boss spawn at tick 13", expectedOutput: "SPAWN|tick|13|wave|3|type|boss|id|5" },
      { id: "t5", description: "Summary shows 6 spawned, 3 waves complete", expectedOutput: "SPAWN_SUMMARY|total_spawned|6|waves_complete|3" },
    ],
    hints: [
      "Initialize lastSpawnTick to 0. The first spawn happens when (tick - 0) >= interval, so wave 1 with interval 2 spawns at tick 2.",
      "When a wave completes, reset spawnedInWave to 0 and increment currentWave. Do NOT reset lastSpawnTick — the next wave times from the completion tick.",
      "The key condition: `(tick - lastSpawnTick) >= waves[currentWave].spawnInterval && spawnedInWave < waves[currentWave].enemyCount`. Both must be true to spawn.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Wave Spawn System",
    type: "game_builder",
    instructions: `# Game Builder: Wave Spawn System

Build a deterministic spawn system that reads a wave schedule and creates entities from the pool at precise tick intervals. The spawn system is the source of all entities in the game — bullets come from player input, but enemies come from the schedule.

## Your Task
1. Define \\\`WaveSchedule\\\` struct: waveNum, enemyCount, spawnInterval, enemyType (string)
2. Create 3 waves:
   - Wave 1: 3 basic enemies, 2 ticks apart
   - Wave 2: 5 fast enemies, 1 tick apart
   - Wave 3: 2 boss enemies, 3 ticks apart
3. SoA arrays for 20 entities: x[], y[], vx[], vy[], hp[], type[], alive[]
4. Pool: freeList[] of size 20, freeCount starts at 20, all indices available
5. Write \\\`spawnFromPool(freeList, freeCount, px, py, vel, ehp, etype)\\\` — pops index from freeList, initializes entity
6. \\\`spawnSystem(tick)\\\` processes schedule: if time to spawn and wave not done, call spawnFromPool
   - Basic enemies: x=100+(spawnedInWave*50), y=0, vy=2, hp=10
   - Fast enemies: x=50+(spawnedInWave*40), y=0, vy=4, hp=5
   - Boss enemies: x=150+(spawnedInWave*100), y=0, vy=1, hp=30
7. Run 15 ticks of simulation
8. For each spawn print: \\\`SPAWN|tick|<t>|wave|<w>|type|<type>|id|enemy_<idx>\\\`
9. When wave finishes: \\\`WAVE_COMPLETE|wave|<w>|tick|<t>\\\`
10. After all ticks: \\\`SPAWN_SUMMARY|total_spawned|10|waves_complete|3\\\`

## Beginner Trap

**Common Mistake:** Hardcoding entity indices instead of using the pool. If you do \\\`alive[totalSpawned] = true\\\`, you assume entities fill slots linearly. When cleanup recycles slots, gaps appear. Always pop from the freeList to get the next available index.

## Elite Insight

Deterministic spawning means replay is trivial. Record the initial seed and tick count, and you can reproduce every spawn event exactly. This is how replay systems work in competitive games — the entire game state is a function of the initial conditions and the sequence of inputs.

## Cross-Path Echo

Database connection pools work the same way. Idle connections sit in a free list. When a query arrives, pop a connection, use it, return it. The pool prevents allocation overhead, just like the entity pool prevents \\\`new\\\`/\\\`delete\\\` overhead.`,
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
      { id: "t1", description: "Wave 1 first spawn at tick 2", expectedOutput: "SPAWN\\|tick\\|2\\|wave\\|1\\|type\\|basic\\|id\\|enemy_\\d+", isPattern: true },
      { id: "t2", description: "Wave 1 completes at tick 6", expectedOutput: "WAVE_COMPLETE|wave|1|tick|6" },
      { id: "t3", description: "Wave 2 spawns fast enemies", expectedOutput: "SPAWN\\|tick\\|\\d+\\|wave\\|2\\|type\\|fast\\|id\\|enemy_\\d+", isPattern: true },
      { id: "t4", description: "Wave 2 completes", expectedOutput: "WAVE_COMPLETE\\|wave\\|2\\|tick\\|\\d+", isPattern: true },
      { id: "t5", description: "Wave 3 spawns boss enemies", expectedOutput: "SPAWN\\|tick\\|\\d+\\|wave\\|3\\|type\\|boss\\|id\\|enemy_\\d+", isPattern: true },
      { id: "t6", description: "Summary shows 10 spawned, 3 waves complete", expectedOutput: "SPAWN_SUMMARY|total_spawned|10|waves_complete|3" },
    ],
    hints: [
      "Initialize freeList with indices 0-19. spawnFromPool decrements freeCount and uses freeList[freeCount] as the new index. This is a stack-based pool.",
      "The spawn condition is `(tick - lastSpawnTick) >= interval && spawnedInWave < enemyCount`. When a wave completes, reset spawnedInWave but keep lastSpawnTick at the completion tick.",
      "Enemy positions depend on spawnedInWave: basic at x=100+(i*50), fast at x=50+(i*40), boss at x=150+(i*100). All start at y=0.",
    ],
    estimatedMinutes: 10,
  },
};
