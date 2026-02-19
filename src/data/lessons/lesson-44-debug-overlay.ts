import type { Lesson } from "@/types/lesson";

export const lesson44: Lesson = {
  id: "44-debug-overlay",
  title: "Debug Overlay",
  description: "Add a debug overlay showing FPS, entity counts, and pool usage.",
  order: 44,
  xpReward: 175,
  tier: "pro",
  concepts: ["debug overlay", "diagnostics", "FPS counter", "runtime statistics"],
  part1: {
    title: "Concept: Debug Overlay",
    type: "concept",
    instructions: `# Debug Overlay — Blind Code Cannot Be Fixed

You have a bug. Entities are disappearing. Is it cleanup killing them? Bounds checking? Collision? You add print statements, run, read output, remove prints, repeat. This takes minutes per iteration. A debug overlay gives you the answer in one frame.

## What To Track

Three numbers catch 90% of bugs:

1. **Frame count** — is the game loop actually advancing?
2. **Entity count** — is it stable, growing, or shrinking? Growing means a leak. Shrinking means something is killing entities too aggressively.
3. **FPS** — is the frame time consistent? Spikes mean a system is doing too much work.

Print them every frame. Read them at a glance. The debug overlay is your instrument panel.

## Detecting Leaks

If entity count grows every frame, you are spawning without cleanup. If it drops to zero, cleanup is too aggressive. If it spikes then drops, you have a burst spawn followed by mass death. The delta between frames tells you exactly what happened.

## Your Task

1. Create a struct \\\`DebugInfo\\\` with: \\\`int frameCount\\\`, \\\`int entityCount\\\`, \\\`int fps\\\`
2. Simulate 5 frames. Each frame:
   - Start with 10 entities
   - Frame 1: spawn 2 (total 12)
   - Frame 2: spawn 3 (total 15)
   - Frame 3: kill 5 (total 10)
   - Frame 4: spawn 1 (total 11)
   - Frame 5: kill 2 (total 9)
3. Simulated FPS: 60 for all frames
4. Print each frame: \\\`DEBUG|frame|<n>|fps|60|entities|<count>\\\`
5. Detect spikes: if entity delta from previous frame is >= 3 or <= -3, print: \\\`DEBUG_ALERT|entity_count_spike|frame|<n>|delta|<+/-amount>\\\`
6. After all frames: \\\`DEBUG_SUMMARY|frames|5|final_entities|9|alerts|2\\\`

Expected output:
\\\`\\\`\\\`
DEBUG|frame|1|fps|60|entities|12
DEBUG|frame|2|fps|60|entities|15
DEBUG_ALERT|entity_count_spike|frame|2|delta|+3
DEBUG|frame|3|fps|60|entities|10
DEBUG_ALERT|entity_count_spike|frame|3|delta|-5
DEBUG|frame|4|fps|60|entities|11
DEBUG|frame|5|fps|60|entities|9
DEBUG_SUMMARY|frames|5|final_entities|9|alerts|2
\\\`\\\`\\\`

Frame 2 spikes +3 (spawn burst). Frame 3 spikes -5 (mass kill). Both trigger alerts.`,
    starterCode: `#include <iostream>
using namespace std;

struct DebugInfo {
    int frameCount;
    int entityCount;
    int fps;
};

int main() {
    DebugInfo debug;
    debug.frameCount = 0;
    debug.entityCount = 10;
    debug.fps = 60;

    int deltas[] = {2, 3, -5, 1, -2};  // entity changes per frame
    int alerts = 0;

    // TODO: Loop 5 frames
    //   Apply delta to entityCount
    //   Print DEBUG line
    //   Check if abs(delta) >= 3, if so print DEBUG_ALERT and increment alerts
    //   Track previous count for delta display

    // TODO: Print DEBUG_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

struct DebugInfo {
    int frameCount;
    int entityCount;
    int fps;
};

int main() {
    DebugInfo debug;
    debug.frameCount = 0;
    debug.entityCount = 10;
    debug.fps = 60;

    int deltas[] = {2, 3, -5, 1, -2};
    int alerts = 0;

    for (int i = 0; i < 5; i++) {
        debug.frameCount++;
        debug.entityCount += deltas[i];
        cout << "DEBUG|frame|" << debug.frameCount << "|fps|" << debug.fps
             << "|entities|" << debug.entityCount << endl;

        int absDelta = deltas[i];
        if (absDelta < 0) absDelta = -absDelta;
        if (absDelta >= 3) {
            cout << "DEBUG_ALERT|entity_count_spike|frame|" << debug.frameCount
                 << "|delta|" << (deltas[i] > 0 ? "+" : "") << deltas[i] << endl;
            alerts++;
        }
    }

    cout << "DEBUG_SUMMARY|frames|" << debug.frameCount << "|final_entities|"
         << debug.entityCount << "|alerts|" << alerts << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 1 should show 12 entities", expectedOutput: "DEBUG|frame|1|fps|60|entities|12" },
      { id: "t2", description: "Frame 2 should trigger spike alert for +3", expectedOutput: "DEBUG_ALERT|entity_count_spike|frame|2|delta|+3" },
      { id: "t3", description: "Frame 3 should trigger spike alert for -5", expectedOutput: "DEBUG_ALERT|entity_count_spike|frame|3|delta|-5" },
      { id: "t4", description: "Summary should show 5 frames, 9 entities, 2 alerts", expectedOutput: "DEBUG_SUMMARY|frames|5|final_entities|9|alerts|2" },
    ],
    hints: [
      "Apply the delta first, then print. The DEBUG line shows the count AFTER the delta is applied.",
      "To get absolute value without abs(): `int absDelta = delta; if (absDelta < 0) absDelta = -absDelta;`",
      "For the delta sign in output: if delta > 0, prepend '+'. Negative numbers already have '-' from the integer print.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Debug Overlay System",
    type: "game_builder",
    instructions: `# Game Builder: Debug Overlay

Add a debug overlay to your space shooter that reports frame count, FPS, entity counts, bullet counts, enemy counts, and pool usage every frame. Detect entity count spikes.

## Your Task
1. Define struct \\\`DebugOverlay\\\`: frameCount, entityCount, bulletCount, enemyCount, poolUsed, poolFree, fps
2. SoA arrays for 20-slot pool. Spawn 5 enemies (type=2, alive) and 10 bullets (type=1, alive). Pool: 15 used, 5 free
3. Simulate 3 frames:
   - Frame 1: no changes (15 alive, 5 free)
   - Frame 2: spawn 3 more bullets (18 alive, 2 free) — a spawn burst
   - Frame 3: kill 4 bullets via collision (14 alive, 2 free but 4 dead slots)
4. Each frame, compute debug stats from the arrays
5. Print overlay: \\\`DEBUG|frame|<n>|fps|60|entities|<total>|bullets|<b>|enemies|<e>|pool|<used>/<capacity>\\\`
6. If entity delta from previous frame has abs >= 3: \\\`DEBUG_ALERT|entity_count_spike|frame|<n>|delta|<+/-amount>\\\`
7. After all frames: \\\`DEBUG_SUMMARY|frames|3|peak_entities|18|final_entities|14|alerts|<n>\\\`
8. Print: \\\`SCORE|0\\\``,
    starterCode: `#include <iostream>
using namespace std;

struct DebugOverlay {
    int frameCount;
    int entityCount;
    int bulletCount;
    int enemyCount;
    int poolUsed;
    int poolFree;
    int fps;
};

const int POOL_CAPACITY = 20;
int type[POOL_CAPACITY];
bool alive[POOL_CAPACITY];
int poolCount = 0;

// TODO: Write updateDebug(DebugOverlay&, frame) — scan arrays, compute counts

// TODO: Write printDebug(DebugOverlay&) — output formatted debug line

int main() {
    // TODO: Spawn 5 enemies (type=2) and 10 bullets (type=1)

    DebugOverlay debug;
    debug.fps = 60;

    // TODO: Frame 1: compute and print debug (15 entities)
    // TODO: Frame 2: spawn 3 more bullets, compute and print (18 entities)
    // TODO: Frame 3: kill 4 bullets, compute and print (14 entities)
    // Check for spikes after each frame

    // TODO: Print DEBUG_SUMMARY and SCORE

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

struct DebugOverlay {
    int frameCount;
    int entityCount;
    int bulletCount;
    int enemyCount;
    int poolUsed;
    int poolFree;
    int fps;
};

const int POOL_CAPACITY = 20;
int type[POOL_CAPACITY];
bool alive[POOL_CAPACITY];
int poolCount = 0;

void updateDebug(DebugOverlay& dbg, int frame) {
    dbg.frameCount = frame;
    dbg.entityCount = 0;
    dbg.bulletCount = 0;
    dbg.enemyCount = 0;
    for (int i = 0; i < poolCount; i++) {
        if (!alive[i]) continue;
        dbg.entityCount++;
        if (type[i] == 1) dbg.bulletCount++;
        if (type[i] == 2) dbg.enemyCount++;
    }
    dbg.poolUsed = poolCount;
    dbg.poolFree = POOL_CAPACITY - poolCount;
}

void printDebug(DebugOverlay& dbg) {
    cout << "DEBUG|frame|" << dbg.frameCount << "|fps|" << dbg.fps
         << "|entities|" << dbg.entityCount << "|bullets|" << dbg.bulletCount
         << "|enemies|" << dbg.enemyCount << "|pool|" << dbg.poolUsed
         << "/" << POOL_CAPACITY << endl;
}

int main() {
    for (int i = 0; i < 5; i++) {
        type[poolCount] = 2;
        alive[poolCount] = true;
        poolCount++;
    }
    for (int i = 0; i < 10; i++) {
        type[poolCount] = 1;
        alive[poolCount] = true;
        poolCount++;
    }

    DebugOverlay debug;
    debug.fps = 60;
    int prevEntityCount = 0;
    int alerts = 0;
    int peakEntities = 0;

    // Frame 1: no changes
    updateDebug(debug, 1);
    printDebug(debug);
    prevEntityCount = debug.entityCount;
    if (debug.entityCount > peakEntities) peakEntities = debug.entityCount;

    // Frame 2: spawn 3 more bullets
    for (int i = 0; i < 3; i++) {
        type[poolCount] = 1;
        alive[poolCount] = true;
        poolCount++;
    }
    updateDebug(debug, 2);
    printDebug(debug);
    int delta2 = debug.entityCount - prevEntityCount;
    int absDelta2 = delta2 < 0 ? -delta2 : delta2;
    if (absDelta2 >= 3) {
        cout << "DEBUG_ALERT|entity_count_spike|frame|2|delta|" << (delta2 > 0 ? "+" : "") << delta2 << endl;
        alerts++;
    }
    prevEntityCount = debug.entityCount;
    if (debug.entityCount > peakEntities) peakEntities = debug.entityCount;

    // Frame 3: kill 4 bullets (indices 5,6,7,8)
    alive[5] = false;
    alive[6] = false;
    alive[7] = false;
    alive[8] = false;
    updateDebug(debug, 3);
    printDebug(debug);
    int delta3 = debug.entityCount - prevEntityCount;
    int absDelta3 = delta3 < 0 ? -delta3 : delta3;
    if (absDelta3 >= 3) {
        cout << "DEBUG_ALERT|entity_count_spike|frame|3|delta|" << (delta3 > 0 ? "+" : "") << delta3 << endl;
        alerts++;
    }
    if (debug.entityCount > peakEntities) peakEntities = debug.entityCount;

    cout << "DEBUG_SUMMARY|frames|3|peak_entities|" << peakEntities
         << "|final_entities|" << debug.entityCount << "|alerts|" << alerts << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 1 should show 15 entities with pool 15/20", expectedOutput: "DEBUG\\|frame\\|1\\|fps\\|60\\|entities\\|15\\|bullets\\|10\\|enemies\\|5\\|pool\\|15/20", isPattern: true },
      { id: "t2", description: "Frame 2 should show 18 entities after spawn burst", expectedOutput: "DEBUG\\|frame\\|2\\|fps\\|60\\|entities\\|18\\|bullets\\|13\\|enemies\\|5\\|pool\\|18/20", isPattern: true },
      { id: "t3", description: "Frame 2 should trigger spike alert for +3", expectedOutput: "DEBUG_ALERT\\|entity_count_spike\\|frame\\|2\\|delta\\|\\+3", isPattern: true },
      { id: "t4", description: "Frame 3 should show 14 entities after kills", expectedOutput: "DEBUG\\|frame\\|3\\|fps\\|60\\|entities\\|14\\|bullets\\|9\\|enemies\\|5\\|pool\\|18/20", isPattern: true },
      { id: "t5", description: "Frame 3 should trigger spike alert for -4", expectedOutput: "DEBUG_ALERT\\|entity_count_spike\\|frame\\|3\\|delta\\|-4", isPattern: true },
      { id: "t6", description: "Should show debug summary", expectedOutput: "DEBUG_SUMMARY\\|frames\\|3\\|peak_entities\\|18\\|final_entities\\|14\\|alerts\\|2", isPattern: true },
      { id: "t7", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
    ],
    hints: [
      "updateDebug scans the alive[] and type[] arrays to count entities. poolUsed is poolCount (total slots ever allocated), poolFree is POOL_CAPACITY - poolCount.",
      "Frame 2 spawns 3 bullets at indices 15,16,17. poolCount goes from 15 to 18. Entity count goes from 15 to 18. Delta = +3, triggers alert.",
      "Frame 3 kills indices 5,6,7,8 (bullets). poolCount stays 18 (slots not reclaimed). Alive count drops to 14. Delta = -4, triggers alert.",
    ],
    estimatedMinutes: 10,
  },
};
