import type { GameLessonVariant } from "@/types/game";

export const lesson39SpaceShooter: GameLessonVariant = {
  lessonId: "39-damage-system-v2",
  instructions: `# Damage System v2 — Bullets Hit Nothing

Bullets fly. Enemies move. The collision system detected overlaps in the previous lesson. But detection without response is useless. The game knows two entities occupy the same space and does nothing about it. The damageSystem closes this gap. It takes collision hits and converts them into state changes: HP decreases, bullets despawn, enemies die.

## What Breaks Without This

Without a damage system, bullets pass through enemies. The collision system flags overlaps but nothing acts on them. Players fire endlessly with no feedback. Enemies never die. Score never changes. The game looks functional but has zero interactivity. You have a screensaver.

## The Fix

The damageSystem iterates every alive bullet against every alive enemy. For each pair within collision range, it applies the bullet's damage to the enemy's HP, marks the bullet dead, and checks if the enemy's HP has dropped to zero or below. This is a nested loop — O(bullets * enemies). For a space shooter with 20 bullets and 10 enemies, that is 200 checks per frame. Trivial for modern hardware.

The key constraint: one bullet hits one enemy. After a hit, break out of the inner loop. The bullet is spent. Without the break, a single bullet damages every enemy it overlaps simultaneously. This is wrong behavior and creates phantom kills.

Despawn is a flag flip. \\\`alive[b] = false\\\` is one store. No memory deallocation. No destructor. No pointer invalidation. The cleanup system handles recycling later. This separation — mark dead now, clean up later — prevents index invalidation during the damage pass.

## Your Task

1. SoA arrays for 8 entities: x[], y[], hp[], damage[], type[] (1=bullet, 2=enemy), alive[]
2. Spawn 5 bullets: indices 0-4, x=200, y=250/230/210/190/170, hp=1, damage=10
3. Spawn 3 enemies: index 5 at (200,60) hp=30, index 6 at (180,80) hp=10, index 7 at (220,70) hp=20
4. Write \\\`damageSystem(count, frame)\\\` that iterates all bullet-enemy pairs:
   - Collision: if both alive and \\\`abs(x[b]-x[e]) < 20 && abs(y[b]-y[e]) < 20\\\`
   - On hit: hp[e] -= damage[b], set alive[b]=false
   - Print: \\\`HIT|bullet_<b>|enemy_<e>|damage|<d>|enemy_hp|<remaining>\\\`
   - If enemy hp <= 0: alive[e]=false, print: \\\`KILL|enemy_<e>|position|<x>,<y>|frame|<f>\\\`
   - Print: \\\`DESPAWN|bullet_<b>|reason|hit\\\`
5. Simulate 3 frames. Each frame: move bullets up by 20 (y -= 20), move enemies down by 10 (y += 10), then run damageSystem
6. After each frame print: \\\`FRAME|<f>|alive_bullets|<n>|alive_enemies|<n>\\\`
7. After all frames: \\\`DAMAGE_SUMMARY|hits|<n>|kills|<n>|bullets_spent|<n>\\\`

## Beginner Trap

**Common Mistake:** Forgetting to break after a bullet hits an enemy. A bullet should only hit one target. Without the break, a single bullet damages every enemy it overlaps with in the same frame. This creates phantom multi-hits that drain enemy HP incorrectly and make debugging impossible. One bullet, one hit, one break.

## Elite Insight

The damage system does not allocate or deallocate. It flips boolean flags. \\\`alive[b] = false\\\` is a single store instruction. The actual memory reclamation happens in the cleanup system on a later pass. This separation means the damage system runs without invalidating indices mid-iteration. Process everything, mark the dead, clean up later. Two passes are cheaper than one careful pass with mid-loop deletion.

## Cross-Path Echo

Event sourcing in backend systems follows the same pattern. Record what happened (HIT, KILL, DESPAWN) as immutable events. The current state is derived from replaying those events. If a bug corrupts state, replay the event log to reconstruct the correct state. The damage system is writing an event log.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 8;

int x[MAX_ENTITIES];
int y[MAX_ENTITIES];
int hp[MAX_ENTITIES];
int damage[MAX_ENTITIES];
int type[MAX_ENTITIES];  // 1=bullet, 2=enemy
bool alive[MAX_ENTITIES];

// TODO: Write damageSystem(count, frame)
//       For each alive bullet, check against each alive enemy
//       Collision: abs(x[b]-x[e]) < 20 && abs(y[b]-y[e]) < 20
//       On hit: apply damage, despawn bullet, check kill

int main() {
    // TODO: Spawn 5 bullets at indices 0-4
    //       x=200, y=250,230,210,190,170, hp=1, damage=10

    // TODO: Spawn 3 enemies at indices 5-7
    //       (200,60) hp=30, (180,80) hp=10, (220,70) hp=20

    int count = 8;

    // TODO: Simulate 3 frames
    //   Each frame: move bullets (y-=20), move enemies (y+=10)
    //   Run damageSystem, print FRAME summary

    // TODO: Print DAMAGE_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 8;

int x[MAX_ENTITIES];
int y[MAX_ENTITIES];
int hp[MAX_ENTITIES];
int damage[MAX_ENTITIES];
int type[MAX_ENTITIES];
bool alive[MAX_ENTITIES];

int totalHits = 0;
int totalKills = 0;
int bulletsSpent = 0;

void damageSystem(int count, int frame) {
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
                totalHits++;
                cout << "HIT|bullet_" << b << "|enemy_" << e
                     << "|damage|" << damage[b]
                     << "|enemy_hp|" << hp[e] << endl;
                if (hp[e] <= 0) {
                    alive[e] = false;
                    totalKills++;
                    cout << "KILL|enemy_" << e << "|position|"
                         << x[e] << "," << y[e]
                         << "|frame|" << frame << endl;
                }
                alive[b] = false;
                bulletsSpent++;
                cout << "DESPAWN|bullet_" << b << "|reason|hit" << endl;
                break;
            }
        }
    }
}

int main() {
    for (int i = 0; i < 5; i++) {
        x[i] = 200;
        y[i] = 250 - i * 20;
        hp[i] = 1;
        damage[i] = 10;
        type[i] = 1;
        alive[i] = true;
    }

    x[5] = 200; y[5] = 60; hp[5] = 30; damage[5] = 0; type[5] = 2; alive[5] = true;
    x[6] = 180; y[6] = 80; hp[6] = 10; damage[6] = 0; type[6] = 2; alive[6] = true;
    x[7] = 220; y[7] = 70; hp[7] = 20; damage[7] = 0; type[7] = 2; alive[7] = true;

    int count = 8;

    for (int frame = 1; frame <= 3; frame++) {
        for (int i = 0; i < count; i++) {
            if (!alive[i]) continue;
            if (type[i] == 1) y[i] -= 20;
            if (type[i] == 2) y[i] += 10;
        }

        damageSystem(count, frame);

        int aliveBullets = 0, aliveEnemies = 0;
        for (int i = 0; i < count; i++) {
            if (!alive[i]) continue;
            if (type[i] == 1) aliveBullets++;
            if (type[i] == 2) aliveEnemies++;
        }
        cout << "FRAME|" << frame << "|alive_bullets|" << aliveBullets
             << "|alive_enemies|" << aliveEnemies << endl;
    }

    cout << "DAMAGE_SUMMARY|hits|" << totalHits
         << "|kills|" << totalKills
         << "|bullets_spent|" << bulletsSpent << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should show HIT events with damage", expectedOutput: "HIT\\|bullet_\\d+\\|enemy_\\d+\\|damage\\|10\\|enemy_hp\\|\\-?\\d+", isPattern: true },
    { id: "g2", description: "Should show KILL events with position", expectedOutput: "KILL\\|enemy_\\d+\\|position\\|\\d+,\\d+\\|frame\\|\\d+", isPattern: true },
    { id: "g3", description: "Should despawn bullets on hit", expectedOutput: "DESPAWN\\|bullet_\\d+\\|reason\\|hit", isPattern: true },
    { id: "g4", description: "Should show frame summaries with alive counts", expectedOutput: "FRAME\\|\\d+\\|alive_bullets\\|\\d+\\|alive_enemies\\|\\d+", isPattern: true },
    { id: "g5", description: "Should show damage summary", expectedOutput: "DAMAGE_SUMMARY\\|hits\\|\\d+\\|kills\\|\\d+\\|bullets_spent\\|\\d+", isPattern: true },
  ],
  hints: [
    "Bullets move y -= 20 per frame, enemies move y += 10. They converge. Use `abs(x[b]-x[e]) < 20 && abs(y[b]-y[e]) < 20` for collision. Compute abs manually: `if (dx < 0) dx = -dx;`.",
    "After a bullet hits, set `alive[b] = false` and `break` out of the inner loop. One bullet hits one enemy per frame. Track hits, kills, and bulletsSpent as global counters.",
    "Process all movement before running damageSystem each frame. The order is: move all entities, then check all collisions. This prevents mid-frame position inconsistencies.",
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

int spawnFromPool(int px, int py, int vel, int ehp, int dmg, int etype) {
    if (freeCount <= 0) return -1;
    freeCount--;
    int idx = freeList[freeCount];
    x[idx] = px;
    y[idx] = py;
    vx[idx] = 0;
    vy[idx] = vel;
    hp[idx] = ehp;
    damage[idx] = dmg;
    type[idx] = etype;
    alive[idx] = true;
    return idx;
}

void spawnEnemy(int px, int py, int ehp, int vel) {
    spawnFromPool(px, py, vel, ehp, 0, 2);
}

void spawnBullet(int px, int py) {
    spawnFromPool(px, py, -16, 1, 10, 1);
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
        if (alive[i] && hp[i] <= 0) {
            alive[i] = false;
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
