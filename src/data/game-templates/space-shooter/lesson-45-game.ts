import type { GameLessonVariant } from "@/types/game";

export const lesson45SpaceShooter: GameLessonVariant = {
  lessonId: "45-milestone-stable-core",
  instructions: `# Stable Core with Debug Overlay — If You Cannot Prove It Works, It Does Not Work

This is the milestone. Every system you have built — spawn, movement, collision, damage, cleanup, render — runs together in a single pipeline. Five frames. Full diagnostics. The debug overlay prints proof that nothing leaks, nothing crashes, and every entity follows its lifecycle from birth to death.

Most bugs do not appear in isolation. They appear when systems interact. A collision that fires after cleanup reads dead entities. A spawn that reuses an index mid-frame corrupts two systems at once. Integration testing is not optional. It is the only testing that matters for shipped software.

## What Breaks Without This

You ship a game where entities slowly leak. The pool fills up over 10 minutes. New enemies stop spawning. The player notices the game getting easier and thinks it is a bug — because it is. Or worse: a dangling reference causes a crash 8 minutes into a session. You cannot reproduce it because it depends on exact spawn timing. Without frame-by-frame diagnostics, you are debugging blind.

## The Fix

Run the full pipeline every frame in strict order. After each frame, dump diagnostics: how many entities are active, what fraction of the pool is used, how many kills have accumulated, what the score is. If any number drifts from the expected trajectory, you have a bug. The debug overlay is your flight recorder.

The pipeline order matters. Spawn first — new entities enter the world. Move second — everything updates position. Collide third — check for overlaps on current positions. Damage fourth — apply hp changes from collisions. Cleanup fifth — remove dead entities. Render sixth — count what survives. Debug last — record the state.

## Your Task

1. Pool of 30 slots: \\\`x[30]\\\`, \\\`y[30]\\\`, \\\`vx[30]\\\`, \\\`vy[30]\\\`, \\\`hp[30]\\\`, \\\`type[30]\\\`, \\\`alive[30]\\\`
2. \\\`spawnEnemy(idx, px, py)\\\` — type=2, hp=3, vy=4
3. \\\`spawnBullet(idx, px, py)\\\` — type=1, hp=1, vy=-16
4. Systems: \\\`movementSystem\\\` (returns moved count), \\\`collisionSystem\\\` (AABB 6x6 vs 18x18, returns checks), \\\`damageSystem\\\` (hp<=0 dies, returns damaged count), \\\`cleanupSystem\\\` (zeros dead slots, returns cleaned count), \\\`renderSystem\\\` (returns alive count)
5. Frame 1: spawn 5 enemies at x=40,80,120,160,200 y=20 and 3 bullets at x=120,160,200 y=280
6. Each frame: spawn (frame 1 only), move, collide, damage, cleanup, render
7. Print per frame: \\\`FRAME|<f>|spawn|<n>|move|<n>|collide|<n>|damage|<n>|cleanup|<n>|render|<n>\\\`
8. Print per frame: \\\`DEBUG|frame|<f>|active|<n>|pool|<n>/<pool_size>|kills|<total>|score|<total>\\\`
9. Score: +100 per enemy killed
10. After all: \\\`STABILITY|frames|5|leaks|0|crashes|0|peak_entities|<peak>\\\`
11. Final: \\\`MILESTONE_45|PASS|stable core with debug overlay\\\`

## Beginner Trap

**Common Mistake:** Running damageSystem before collisionSystem. Collision detects overlaps and modifies hp. Damage reads hp and kills entities. If damage runs first, it processes stale hp values from the previous frame and misses this frame's hits entirely. Pipeline order is load-bearing.

## Elite Insight

This is the game loop architecture used in every commercial engine. Unreal calls it the tick pipeline. Unity calls it the player loop. The names change but the structure is identical: input, spawn, physics, collision, damage, cleanup, render, debug. Each phase reads the state left by the previous phase. The ordering is the architecture.

## Cross-Path Echo

CI/CD pipelines follow the same pattern: build, test, lint, deploy, verify. Each stage transforms state for the next. If you swap test and deploy, you ship broken code. If you swap collision and damage, you miss hits. Pipeline ordering is a universal engineering principle.`,
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
// TODO: Write cleanupSystem(count) — zero out dead slots, returns cleaned count
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
    // Track kills and score (+100 per kill)

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
    { id: "g1", description: "Frame 1: Should run full pipeline with spawns", expectedOutput: "FRAME\\|1\\|spawn\\|8\\|move\\|\\d+\\|collide\\|\\d+\\|damage\\|\\d+\\|cleanup\\|\\d+\\|render\\|\\d+", isPattern: true },
    { id: "g2", description: "Frame 1: Should print debug diagnostics", expectedOutput: "DEBUG\\|frame\\|1\\|active\\|\\d+\\|pool\\|\\d+/30\\|kills\\|\\d+\\|score\\|\\d+", isPattern: true },
    { id: "g3", description: "Frame 5: Should run pipeline with zero spawns", expectedOutput: "FRAME\\|5\\|spawn\\|0\\|move\\|\\d+\\|collide\\|\\d+\\|damage\\|\\d+\\|cleanup\\|\\d+\\|render\\|\\d+", isPattern: true },
    { id: "g4", description: "Should report stability with no leaks or crashes", expectedOutput: "STABILITY\\|frames\\|5\\|leaks\\|0\\|crashes\\|0\\|peak_entities\\|\\d+", isPattern: true },
    { id: "g5", description: "Should pass milestone 45", expectedOutput: "MILESTONE_45\\|PASS\\|stable core with debug overlay", isPattern: true },
  ],
  hints: [
    "Spawn happens only in frame 1: 5 enemies (indices 0-4) then 3 bullets (indices 5-7). Total count = 8. After frame 1, spawned = 0 for all subsequent frames.",
    "Pipeline order is critical: move, collide, damage, cleanup, render. damageSystem marks alive=false for hp<=0. cleanupSystem zeros the type field on dead slots. renderSystem counts remaining alive entities.",
    "peakEntities tracks the highest alive count seen at the start of any frame. It should be 8 after frame 1 spawns. Bullets leave bounds and die over subsequent frames, so active decreases.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 600;
const int FIXED_DT = 16;

int x[POOL_SIZE];
int y[POOL_SIZE];
int vx[POOL_SIZE];
int vy[POOL_SIZE];
int hp[POOL_SIZE];
int type[POOL_SIZE];
bool alive[POOL_SIZE];

void spawnEnemy(int idx, int px, int py) {
    x[idx] = px;
    y[idx] = py;
    vx[idx] = 0;
    vy[idx] = 4;
    hp[idx] = 3;
    type[idx] = 2;
    alive[idx] = true;
}

void spawnBullet(int idx, int px, int py) {
    x[idx] = px;
    y[idx] = py;
    vx[idx] = 0;
    vy[idx] = -16;
    hp[idx] = 1;
    type[idx] = 1;
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

int countByType(int count, int typeVal) {
    int c = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i] && type[i] == typeVal) c++;
    }
    return c;
}

int main() {
    int count = 0;
    int totalKills = 0;
    int score = 0;
    int peakEntities = 0;

    // Spawn enemies
    int ex[] = {40, 80, 120, 160, 200};
    for (int i = 0; i < 5; i++) {
        spawnEnemy(count, ex[i], 20);
        count++;
    }

    // Spawn bullets
    int bx[] = {120, 160, 200};
    for (int i = 0; i < 3; i++) {
        spawnBullet(count, bx[i], 280);
        count++;
    }

    peakEntities = count;

    for (int frame = 1; frame <= 5; frame++) {
        int moved = movementSystem(count);
        int checks = collisionSystem(count);
        int damaged = damageSystem(count);
        totalKills += damaged;
        score += damaged * 100;
        int cleaned = cleanupSystem(count);
        int rendered = renderSystem(count);

        int aliveNow = 0;
        for (int i = 0; i < count; i++) {
            if (alive[i]) aliveNow++;
        }
        if (aliveNow > peakEntities) peakEntities = aliveNow;

        cout << "FRAME|" << frame << "|spawn|" << (frame == 1 ? 8 : 0)
             << "|move|" << moved << "|collide|" << checks
             << "|damage|" << damaged << "|cleanup|" << cleaned
             << "|render|" << rendered << endl;
        cout << "DEBUG|frame|" << frame << "|active|" << aliveNow
             << "|pool|" << aliveNow << "/" << POOL_SIZE
             << "|kills|" << totalKills << "|score|" << score << endl;
    }

    cout << "STABILITY|frames|5|leaks|0|crashes|0|peak_entities|" << peakEntities << endl;
    cout << "MILESTONE_45|PASS|stable core with debug overlay" << endl;
    return 0;
}
`,
};
