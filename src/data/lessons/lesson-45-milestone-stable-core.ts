import type { Lesson } from "@/types/lesson";

export const lesson45: Lesson = {
  id: "45-milestone-stable-core",
  title: "Milestone: Stable Core",
  description: "Combine all systems into a stable core with full debug diagnostics.",
  order: 45,
  xpReward: 300,
  tier: "pro",
  concepts: ["system integration", "stability testing", "debug overlay", "entity lifecycle", "full pipeline"],
  part1: {
    title: "Concept: System Integration Pipeline",
    type: "concept",
    instructions: `# System Integration Pipeline — One Broken Link Kills the Chain

Every system you have built so far works in isolation. Movement moves. Collision collides. Cleanup cleans. But running them together on the same data, frame after frame, is where bugs hide. A cleanup that runs before collision misses hits. A spawn that overwrites a live slot corrupts state. Integration is where theory meets reality.

## What Breaks Without This

Systems that pass unit tests individually will crash when composed. Movement updates a position. Collision reads that position. If cleanup runs between them, the collision reads a dead entity. If spawn reuses a slot mid-frame, two systems process different entities at the same index. Frame-over-frame accumulation exposes leaks that single-frame tests miss.

## The Fix

Run the full pipeline in strict order: spawn, move, collide, damage, cleanup. Every frame. Same order. No exceptions. Then add a debug pass at the end that counts active entities, pool utilization, and accumulated kills. If the debug numbers drift from expected values, something is broken. The debug overlay is not optional — it is your proof of correctness.

## Your Task

1. Create SoA arrays for 20 entities: \\\`x[20]\\\`, \\\`y[20]\\\`, \\\`vx[20]\\\`, \\\`vy[20]\\\`, \\\`hp[20]\\\`, \\\`type[20]\\\` (0=empty, 1=bullet, 2=enemy), \\\`alive[20]\\\`
2. Write \\\`spawnEntity(idx, px, py, pvx, pvy, php, ptype)\\\` — initializes all fields, sets alive = true
3. Write \\\`movementSystem(count)\\\` — for each alive entity: x += vx, y += vy
4. Write \\\`boundsSystem(count)\\\` — bullets with y < 0 get alive = false
5. Write \\\`cleanupSystem(count)\\\` — entities with hp <= 0 get alive = false
6. Spawn 5 enemies at x=40,80,120,160,200, y=30, vx=0, vy=8, hp=2
7. Spawn 3 bullets at x=80,120,160, y=200, vx=0, vy=-50, hp=1
8. Run 5 frames. Each frame: movement, bounds, cleanup
9. After each frame print: \\\`FRAME|<n>|active|<alive_count>|bullets|<b>|enemies|<e>\\\`
10. After all frames print: \\\`STABILITY|frames|5|leaks|0|crashes|0|peak_active|8\\\`
11. Print: \\\`PIPELINE|movement|bounds|cleanup|complete\\\`

Expected: bullets fly up and leave bounds by frame 4-5. Enemies keep moving down. No leaks. Peak active is 8 (the initial count).`,
    starterCode: `#include <iostream>
using namespace std;

const int POOL = 20;

int x[POOL], y[POOL], vx[POOL], vy[POOL], hp[POOL], type[POOL];
bool alive[POOL];

// TODO: Write spawnEntity(idx, px, py, pvx, pvy, php, ptype)

// TODO: Write movementSystem(count) — x += vx, y += vy for alive

// TODO: Write boundsSystem(count) — bullets with y < 0 become not alive

// TODO: Write cleanupSystem(count) — hp <= 0 becomes not alive

int main() {
    int count = 0;

    // TODO: Spawn 5 enemies at x=40,80,120,160,200 y=30 vy=8 hp=2
    // TODO: Spawn 3 bullets at x=80,120,160 y=200 vy=-50 hp=1

    // TODO: Run 5 frames: movement -> bounds -> cleanup
    // Print FRAME line after each frame
    // Print STABILITY and PIPELINE after all frames

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int POOL = 20;

int x[POOL], y[POOL], vx[POOL], vy[POOL], hp[POOL], type[POOL];
bool alive[POOL];

void spawnEntity(int idx, int px, int py, int pvx, int pvy, int php, int ptype) {
    x[idx] = px; y[idx] = py;
    vx[idx] = pvx; vy[idx] = pvy;
    hp[idx] = php; type[idx] = ptype;
    alive[idx] = true;
}

void movementSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        x[i] += vx[i];
        y[i] += vy[i];
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

void cleanupSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (alive[i] && hp[i] <= 0) {
            alive[i] = false;
        }
    }
}

int main() {
    int count = 0;

    int ex[] = {40, 80, 120, 160, 200};
    for (int i = 0; i < 5; i++) {
        spawnEntity(count, ex[i], 30, 0, 8, 2, 2);
        count++;
    }

    int bx[] = {80, 120, 160};
    for (int i = 0; i < 3; i++) {
        spawnEntity(count, bx[i], 200, 0, -50, 1, 1);
        count++;
    }

    int peakActive = count;

    for (int frame = 1; frame <= 5; frame++) {
        movementSystem(count);
        boundsSystem(count);
        cleanupSystem(count);

        int bullets = 0, enemies = 0;
        for (int i = 0; i < count; i++) {
            if (!alive[i]) continue;
            if (type[i] == 1) bullets++;
            if (type[i] == 2) enemies++;
        }
        int active = bullets + enemies;
        cout << "FRAME|" << frame << "|active|" << active << "|bullets|" << bullets << "|enemies|" << enemies << endl;
    }

    cout << "STABILITY|frames|5|leaks|0|crashes|0|peak_active|" << peakActive << endl;
    cout << "PIPELINE|movement|bounds|cleanup|complete" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 1: Should show active entities", expectedOutput: "FRAME\\|1\\|active\\|\\d+\\|bullets\\|\\d+\\|enemies\\|5", isPattern: true },
      { id: "t2", description: "Frame 5: Bullets should have left bounds", expectedOutput: "FRAME\\|5\\|active\\|\\d+\\|bullets\\|0\\|enemies\\|5", isPattern: true },
      { id: "t3", description: "Should report stability with no leaks", expectedOutput: "STABILITY\\|frames\\|5\\|leaks\\|0\\|crashes\\|0\\|peak_active\\|8", isPattern: true },
      { id: "t4", description: "Should report pipeline complete", expectedOutput: "PIPELINE\\|movement\\|bounds\\|cleanup\\|complete", isPattern: true },
    ],
    hints: [
      "spawnEntity sets all 7 fields on the given index. Enemies are type=2, bullets are type=1. Increment count after each spawn.",
      "Bullets start at y=200 with vy=-50. After frame 1: y=150. Frame 2: y=100. Frame 3: y=50. Frame 4: y=0. Frame 5: y=-50 — out of bounds.",
      "boundsSystem only kills bullets (type==1) with y < 0. Enemies keep moving down regardless of y value.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Game: Stable Core with Debug Overlay",
    type: "game_builder",
    instructions: `# Game Builder: Stable Core with Debug Overlay

This is a milestone. You will run the full system pipeline over 5 frames with debug diagnostics proving stability. Spawn, move, collide, damage, cleanup, render — all systems active. Track every metric. Prove no leaks, no crashes.

## Your Task
1. Pool of 30 entity slots: \\\`x[30]\\\`, \\\`y[30]\\\`, \\\`vx[30]\\\`, \\\`vy[30]\\\`, \\\`hp[30]\\\`, \\\`type[30]\\\`, \\\`alive[30]\\\`
2. Write spawnEnemy(idx, px, py) — type=2, hp=3, vy=4
3. Write spawnBullet(idx, px, py) — type=1, hp=1, vy=-16
4. Write all systems: movementSystem, collisionSystem (AABB bullet 6x6, enemy 18x18), damageSystem (hp<=0 dies), cleanupSystem (mark dead), renderSystem (count rendered)
5. Frame 1: spawn 5 enemies at x=40,80,120,160,200 y=20. Spawn 3 bullets at x=120,160,200 y=280
6. Each frame: spawn phase (frame 1 only), move, collide, damage, cleanup, render
7. After EACH system in each frame, print: \\\`FRAME|<f>|spawn|<spawned>|move|<moved>|collide|<checks>|damage|<damaged>|cleanup|<cleaned>|render|<rendered>\\\`
8. After each frame print debug: \\\`DEBUG|frame|<f>|active|<active>|pool|<active>/<pool_size>|kills|<total_kills>|score|<score>\\\`
9. Score: +100 per enemy killed
10. After all frames: \\\`STABILITY|frames|5|leaks|0|crashes|0|peak_entities|<peak>\\\`
11. Final: \\\`MILESTONE_45|PASS|stable core with debug overlay\\\``,
    starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 30;

int x[POOL_SIZE], y[POOL_SIZE], vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], type[POOL_SIZE];
bool alive[POOL_SIZE];

// TODO: Write spawnEnemy(idx, px, py) — type=2, hp=3, vy=4
// TODO: Write spawnBullet(idx, px, py) — type=1, hp=1, vy=-16

// TODO: Write movementSystem(count) — returns number moved
// TODO: Write collisionSystem(count) — AABB bullet 6x6, enemy 18x18, returns checks
// TODO: Write damageSystem(count) — mark hp<=0 as not alive, returns number damaged
// TODO: Write cleanupSystem(count) — count cleaned slots
// TODO: Write renderSystem(count) — count alive entities (rendered)

int main() {
    int count = 0;
    int totalKills = 0;
    int score = 0;
    int peakEntities = 0;

    // TODO: Run 5 frames
    // Frame 1: spawn 5 enemies and 3 bullets
    // Each frame: move, collide, damage, cleanup, render
    // Print FRAME line with all system counts
    // Print DEBUG line with diagnostics
    // Track kills and score

    // TODO: Print STABILITY summary
    // TODO: Print MILESTONE_45 pass

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 30;

int x[POOL_SIZE], y[POOL_SIZE], vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], type[POOL_SIZE];
bool alive[POOL_SIZE];

void spawnEnemy(int idx, int px, int py) {
    x[idx] = px; y[idx] = py;
    vx[idx] = 0; vy[idx] = 4;
    hp[idx] = 3; type[idx] = 2;
    alive[idx] = true;
}

void spawnBullet(int idx, int px, int py) {
    x[idx] = px; y[idx] = py;
    vx[idx] = 0; vy[idx] = -16;
    hp[idx] = 1; type[idx] = 1;
    alive[idx] = true;
}

int movementSystem(int count) {
    int moved = 0;
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        x[i] += vx[i];
        y[i] += vy[i];
        moved++;
    }
    return moved;
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

int damageSystem(int count) {
    int damaged = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i] && hp[i] <= 0) {
            alive[i] = false;
            damaged++;
        }
    }
    return damaged;
}

int cleanupSystem(int count) {
    int cleaned = 0;
    for (int i = 0; i < count; i++) {
        if (!alive[i] && type[i] != 0) {
            type[i] = 0;
            cleaned++;
        }
    }
    return cleaned;
}

int renderSystem(int count) {
    int rendered = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i]) rendered++;
    }
    return rendered;
}

int main() {
    int count = 0;
    int totalKills = 0;
    int score = 0;
    int peakEntities = 0;

    for (int frame = 1; frame <= 5; frame++) {
        int spawned = 0;
        if (frame == 1) {
            int ex[] = {40, 80, 120, 160, 200};
            for (int i = 0; i < 5; i++) {
                spawnEnemy(count, ex[i], 20);
                count++;
                spawned++;
            }
            int bx[] = {120, 160, 200};
            for (int i = 0; i < 3; i++) {
                spawnBullet(count, bx[i], 280);
                count++;
                spawned++;
            }
        }

        int active = 0;
        for (int i = 0; i < count; i++) {
            if (alive[i]) active++;
        }
        if (active > peakEntities) peakEntities = active;

        int moved = movementSystem(count);
        int checks = collisionSystem(count);
        int damaged = damageSystem(count);

        totalKills += damaged;
        score += damaged * 100;

        int cleaned = cleanupSystem(count);
        int rendered = renderSystem(count);

        cout << "FRAME|" << frame << "|spawn|" << spawned << "|move|" << moved
             << "|collide|" << checks << "|damage|" << damaged
             << "|cleanup|" << cleaned << "|render|" << rendered << endl;

        int aliveNow = 0;
        for (int i = 0; i < count; i++) {
            if (alive[i]) aliveNow++;
        }
        cout << "DEBUG|frame|" << frame << "|active|" << aliveNow
             << "|pool|" << aliveNow << "/" << POOL_SIZE
             << "|kills|" << totalKills << "|score|" << score << endl;
    }

    cout << "STABILITY|frames|5|leaks|0|crashes|0|peak_entities|" << peakEntities << endl;
    cout << "MILESTONE_45|PASS|stable core with debug overlay" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 1: Should run full pipeline with spawn", expectedOutput: "FRAME\\|1\\|spawn\\|8\\|move\\|\\d+\\|collide\\|\\d+\\|damage\\|\\d+\\|cleanup\\|\\d+\\|render\\|\\d+", isPattern: true },
      { id: "t2", description: "Frame 1: Should print debug overlay", expectedOutput: "DEBUG\\|frame\\|1\\|active\\|\\d+\\|pool\\|\\d+/30\\|kills\\|\\d+\\|score\\|\\d+", isPattern: true },
      { id: "t3", description: "Frame 5: Should show pipeline running with no spawns", expectedOutput: "FRAME\\|5\\|spawn\\|0\\|move\\|\\d+\\|collide\\|\\d+\\|damage\\|\\d+\\|cleanup\\|\\d+\\|render\\|\\d+", isPattern: true },
      { id: "t4", description: "Should report stability with no leaks", expectedOutput: "STABILITY\\|frames\\|5\\|leaks\\|0\\|crashes\\|0\\|peak_entities\\|\\d+", isPattern: true },
      { id: "t5", description: "Should pass milestone 45", expectedOutput: "MILESTONE_45\\|PASS\\|stable core with debug overlay", isPattern: true },
    ],
    hints: [
      "Spawn only happens in frame 1. After that, the pipeline runs on existing entities. Track spawned count per frame to print correctly.",
      "damageSystem checks alive entities with hp <= 0 and marks them dead. Each kill adds 100 to score. Track totalKills across all frames.",
      "peakEntities is the maximum number of alive entities seen at the start of any frame. It should be 8 (5 enemies + 3 bullets spawned in frame 1).",
    ],
    estimatedMinutes: 15,
  },
};
