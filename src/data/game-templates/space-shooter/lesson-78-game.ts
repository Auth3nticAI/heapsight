import type { GameLessonVariant } from "@/types/game";

export const lesson78SpaceShooter: GameLessonVariant = {
  lessonId: "78-memory-profiling",
  instructions: `# Game Builder: Memory Profiling — Pool Usage Analysis

Your pool has 30 slots. During gameplay, entities constantly spawn and die. Without profiling, you have no idea whether the pool is right-sized, oversized, or about to overflow. The profiler samples pool state each frame and reports peak usage, allocation churn, and utilization. After the session, you know exactly whether to grow, shrink, or keep the pool as-is.

## What Breaks Without This

Without profiling, pool sizing is guesswork. Too small: entities fail to spawn during boss fights and the game breaks. Too large: memory is wasted on slots that never get used. The profiler gives you data instead of guesses. Peak utilization of 73% on a 30-slot pool means you have 8 slots of headroom — probably safe. Peak of 95% means you are one wave away from overflow.

## The Fix

Sample every frame. Record used count, free count, allocations, frees. Track peak across all frames. After the session, report peak frame, utilization percentage, and total allocation churn. Use this data to size the pool for the next build.

\\\`\\\`\\\`
// Each frame: sample(frame, allocs, frees)
// After session: report peak_frame, peak_util, total churn
\\\`\\\`\\\`

## Your Task

1. Define PoolSample struct: frame, used, free, peak, allocs, frees
2. Simulate 10 frames with varying allocation/free patterns
3. Track running used count, peak, total allocs and frees
4. Print: \\\`MEMORY|frame|1|used|8|free|22|peak|8|allocs|8|frees|0\\\`
5. Print: \\\`MEMORY|frame|5|used|18|free|12|peak|18|allocs|5|frees|3\\\`
6. Print: \\\`MEMORY|frame|7|used|22|free|8|peak|22|allocs|6|frees|2\\\`
7. Print: \\\`MEMORY|frame|10|used|6|free|24|peak|22|allocs|2|frees|8\\\`
8. Print: \\\`MEMORY_PROFILE|peak_frame|7|peak_used|22|pool_size|30|peak_util|73%\\\`
9. Print: \\\`MEMORY_SUMMARY|total_allocs|35|total_frees|29|net|6|peak|22\\\`

## Beginner Trap

**Common Mistake:** Resetting currentUsed each frame instead of accumulating. Used is a running total that persists across frames. Only allocs and frees are per-frame values. The running total is what tells you how much memory is consumed right now.

## Elite Insight

Production profilers like Valgrind and AddressSanitizer track every allocation with full call stacks. They detect leaks by finding allocations with no matching free. Your net count (totalAllocs - totalFrees) is the simplest leak detector: if net is positive at session end, something was not freed. If net is negative, you have a double-free bug.

## Cross-Path Echo

Cloud resource monitoring works identically. AWS tracks EC2 instance launches and terminations. Peak instances determine your bill. If you launch 22 instances during a traffic spike but usually run 6, you are paying for burst capacity. Your peak_util metric is the AWS cost optimization dashboard.`,
  starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 30;
const int MAX_SAMPLES = 20;

struct PoolSample {
    int frame;
    int used;
    int free;
    int peak;
    int allocs;
    int frees;
};

PoolSample samples[MAX_SAMPLES];
int sampleCount = 0;

int currentUsed = 0;
int peakUsed = 0;
int totalAllocs = 0;
int totalFrees = 0;
int peakFrame = 0;

// TODO: Write recordSample(frame, allocs, frees)
//   Update currentUsed, peak, totals. Store in samples array.

// TODO: Write printSample(index)

// TODO: Write printProfile() — peak_frame, peak_used, pool_size, peak_util

// TODO: Write printSummary() — total_allocs, total_frees, net, peak

int main() {
    // TODO: Record 10 frames with alloc/free data:
    //   Frame 1: 8/0, Frame 2: 4/1, Frame 3: 3/2, Frame 4: 2/3
    //   Frame 5: 5/3, Frame 6: 3/1, Frame 7: 6/2, Frame 8: 1/4
    //   Frame 9: 1/5, Frame 10: 2/8
    // TODO: Print frames 1, 5, 7, 10
    // TODO: Print profile and summary

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 30;
const int MAX_SAMPLES = 20;

struct PoolSample {
    int frame;
    int used;
    int free;
    int peak;
    int allocs;
    int frees;
};

PoolSample samples[MAX_SAMPLES];
int sampleCount = 0;

int currentUsed = 0;
int peakUsed = 0;
int totalAllocs = 0;
int totalFrees = 0;
int peakFrame = 0;

void recordSample(int frame, int allocs, int frees) {
    currentUsed += allocs - frees;
    totalAllocs += allocs;
    totalFrees += frees;
    if (currentUsed > peakUsed) {
        peakUsed = currentUsed;
        peakFrame = frame;
    }
    samples[sampleCount].frame = frame;
    samples[sampleCount].used = currentUsed;
    samples[sampleCount].free = POOL_SIZE - currentUsed;
    samples[sampleCount].peak = peakUsed;
    samples[sampleCount].allocs = allocs;
    samples[sampleCount].frees = frees;
    sampleCount++;
}

void printSample(int index) {
    PoolSample &s = samples[index];
    cout << "MEMORY|frame|" << s.frame << "|used|" << s.used
         << "|free|" << s.free << "|peak|" << s.peak
         << "|allocs|" << s.allocs << "|frees|" << s.frees << endl;
}

void printProfile() {
    int util = peakUsed * 100 / POOL_SIZE;
    cout << "MEMORY_PROFILE|peak_frame|" << peakFrame << "|peak_used|" << peakUsed
         << "|pool_size|" << POOL_SIZE << "|peak_util|" << util << "%" << endl;
}

void printSummary() {
    int net = totalAllocs - totalFrees;
    cout << "MEMORY_SUMMARY|total_allocs|" << totalAllocs << "|total_frees|"
         << totalFrees << "|net|" << net << "|peak|" << peakUsed << endl;
}

int main() {
    int frameAllocs[] = {8, 4, 3, 2, 5, 3, 6, 1, 1, 2};
    int frameFrees[]  = {0, 1, 2, 3, 3, 1, 2, 4, 5, 8};

    for (int i = 0; i < 10; i++) {
        recordSample(i + 1, frameAllocs[i], frameFrees[i]);
    }

    printSample(0);   // frame 1
    printSample(4);   // frame 5
    printSample(6);   // frame 7
    printSample(9);   // frame 10

    printProfile();
    printSummary();

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Frame 1 memory state", expectedOutput: "MEMORY\\|frame\\|1\\|used\\|8\\|free\\|22\\|peak\\|8\\|allocs\\|8\\|frees\\|0", isPattern: true },
    { id: "g2", description: "Frame 5 memory state", expectedOutput: "MEMORY\\|frame\\|5\\|used\\|18\\|free\\|12\\|peak\\|18\\|allocs\\|5\\|frees\\|3", isPattern: true },
    { id: "g3", description: "Frame 7 peak usage", expectedOutput: "MEMORY\\|frame\\|7\\|used\\|22\\|free\\|8\\|peak\\|22\\|allocs\\|6\\|frees\\|2", isPattern: true },
    { id: "g4", description: "Frame 10 cleanup", expectedOutput: "MEMORY\\|frame\\|10\\|used\\|6\\|free\\|24\\|peak\\|22\\|allocs\\|2\\|frees\\|8", isPattern: true },
    { id: "g5", description: "Profile peak detection", expectedOutput: "MEMORY_PROFILE\\|peak_frame\\|7\\|peak_used\\|22\\|pool_size\\|30\\|peak_util\\|73%", isPattern: true },
    { id: "g6", description: "Memory summary", expectedOutput: "MEMORY_SUMMARY\\|total_allocs\\|35\\|total_frees\\|29\\|net\\|6\\|peak\\|22", isPattern: true },
  ],
  hints: [
    "currentUsed is a running total. Start at 0. Frame 1: 0+8-0=8. Frame 2: 8+4-1=11. Continue accumulating through all 10 frames.",
    "Peak updates only when currentUsed exceeds peakUsed. After frame 7, currentUsed reaches 22, which is the session maximum. peakFrame records which frame hit the peak.",
    "Sum all per-frame allocs: 8+4+3+2+5+3+6+1+1+2=35. Sum all frees: 0+1+2+3+3+1+2+4+5+8=29. Net=6. Util=22*100/30=73%.",
  ],
  accumulatedCode: `#include <iostream>
#include <cstdlib>
#include <cmath>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
const int FIXED_DT = 16;
const int SCREEN_W = 20;
const int SCREEN_H = 10;
const int VIEW_W = 200;
const int VIEW_H = 100;
const int MAX_LOG = 64;
const int MAX_FRAMES = 20;
const int NUM_ACHIEVEMENTS = 5;
const int MAX_SAMPLES = 20;

int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], type[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int freeList[POOL_SIZE];
int freeCount = POOL_SIZE;

int score = 0;
int kills = 0;
int wave = 1;
int lives = 3;
int combo = 0;
int maxCombo = 0;
int shotsFired = 0;
int shotsHit = 0;
bool bossKilled = false;

enum Action { NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE };
enum AIPattern { AI_NONE, AI_LINEAR, AI_SINE, AI_TRACK };

int aiPattern[POOL_SIZE];

struct Achievement {
    string id;
    string name;
    bool unlocked;
};

struct GameStats {
    int shotsFired;
    int shotsHit;
    int kills;
    int damageDealt;
    int damageTaken;
    int framesPlayed;
    int maxCombo;
    int bossesKilled;
};

struct PoolSample {
    int frame;
    int used;
    int free;
    int peak;
    int allocs;
    int frees;
};

Achievement achievements[NUM_ACHIEVEMENTS];
GameStats sessionStats;
PoolSample poolSamples[MAX_SAMPLES];
int poolSampleCount = 0;

int poolCurrentUsed = 0;
int poolPeakUsed = 0;
int poolTotalAllocs = 0;
int poolTotalFrees = 0;
int poolPeakFrame = 0;

struct InputEvent {
    int tick;
    int action;
};

struct FrameState {
    int playerX, playerY;
    int score;
    int enemyCount;
    int bulletCount;
};

InputEvent replayLog[MAX_LOG];
int replayLogSize = 0;
int bulletCount = 0;

int playerSpeed = 4;
int playerDamage = 10;

void initAchievements() {
    achievements[0] = {"first_blood", "First Blood", false};
    achievements[1] = {"combo_3", "Triple Threat", false};
    achievements[2] = {"boss_slayer", "Boss Slayer", false};
    achievements[3] = {"sharpshooter", "Sharpshooter", false};
    achievements[4] = {"survivor", "Survivor", false};
}

void checkKillAchievements(int frame) {
    if (!achievements[0].unlocked && kills >= 1) {
        achievements[0].unlocked = true;
        cout << "ACHIEVEMENT|UNLOCKED|" << achievements[0].id << "|"
             << achievements[0].name << "|frame|" << frame << endl;
    }
    if (!achievements[2].unlocked && bossKilled) {
        achievements[2].unlocked = true;
        cout << "ACHIEVEMENT|UNLOCKED|" << achievements[2].id << "|"
             << achievements[2].name << "|frame|" << frame << endl;
    }
}

void checkComboAchievements(int frame) {
    if (!achievements[1].unlocked && combo >= 3) {
        achievements[1].unlocked = true;
        cout << "ACHIEVEMENT|UNLOCKED|" << achievements[1].id << "|"
             << achievements[1].name << "|frame|" << frame << endl;
    }
}

void initStats(GameStats &s) {
    s.shotsFired = 0; s.shotsHit = 0; s.kills = 0;
    s.damageDealt = 0; s.damageTaken = 0; s.framesPlayed = 0;
    s.maxCombo = 0; s.bossesKilled = 0;
}

void printStatsScreen(GameStats &s, int sc) {
    cout << "STATS|============ SESSION STATS ============" << endl;
    cout << "STATS|Shots Fired:     " << s.shotsFired << endl;
    cout << "STATS|Shots Hit:       " << s.shotsHit << endl;
    int accTenths = (s.shotsFired > 0) ? (s.shotsHit * 1000 / s.shotsFired) : 0;
    cout << "STATS|Accuracy:        " << accTenths / 10 << "." << accTenths % 10 << "%" << endl;
    cout << "STATS|Kills:           " << s.kills << endl;
    cout << "STATS|Damage Dealt:    " << s.damageDealt << endl;
    cout << "STATS|Damage Taken:    " << s.damageTaken << endl;
    cout << "STATS|Max Combo:       " << s.maxCombo << "x" << endl;
    cout << "STATS|Bosses Killed:   " << s.bossesKilled << endl;
    cout << "STATS|Frames Played:   " << s.framesPlayed << endl;
    cout << "STATS|Score:           " << sc << endl;
}

void recordPoolSample(int frame, int allocs, int frees) {
    poolCurrentUsed += allocs - frees;
    poolTotalAllocs += allocs;
    poolTotalFrees += frees;
    if (poolCurrentUsed > poolPeakUsed) {
        poolPeakUsed = poolCurrentUsed;
        poolPeakFrame = frame;
    }
    poolSamples[poolSampleCount].frame = frame;
    poolSamples[poolSampleCount].used = poolCurrentUsed;
    poolSamples[poolSampleCount].free = POOL_SIZE - poolCurrentUsed;
    poolSamples[poolSampleCount].peak = poolPeakUsed;
    poolSamples[poolSampleCount].allocs = allocs;
    poolSamples[poolSampleCount].frees = frees;
    poolSampleCount++;
}

void printPoolSample(int index) {
    PoolSample &s = poolSamples[index];
    cout << "MEMORY|frame|" << s.frame << "|used|" << s.used
         << "|free|" << s.free << "|peak|" << s.peak
         << "|allocs|" << s.allocs << "|frees|" << s.frees << endl;
}

Action mapInput(char c) {
    switch (c) {
        case 'w': return MOVE_UP;
        case 's': return MOVE_DOWN;
        case 'a': return MOVE_LEFT;
        case 'd': return MOVE_RIGHT;
        case ' ': return FIRE;
        default: return NONE;
    }
}

string getActionName(int action) {
    if (action == MOVE_UP) return "MOVE_UP";
    if (action == MOVE_DOWN) return "MOVE_DOWN";
    if (action == MOVE_LEFT) return "MOVE_LEFT";
    if (action == MOVE_RIGHT) return "MOVE_RIGHT";
    if (action == FIRE) return "FIRE";
    return "NONE";
}

int spawnFromPool(int px, int py, int pvx, int pvy, int php, int ptype) {
    if (freeCount <= 0) return -1;
    freeCount--;
    int idx = freeList[freeCount];
    x[idx] = px; y[idx] = py;
    vx[idx] = pvx; vy[idx] = pvy;
    hp[idx] = php; type[idx] = ptype;
    alive[idx] = true;
    aiPattern[idx] = AI_LINEAR;
    return idx;
}

void returnToPool(int idx) {
    alive[idx] = false;
    freeList[freeCount] = idx;
    freeCount++;
}

void movementSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] == 2) continue;
        x[i] += vx[i]; y[i] += vy[i];
    }
}

void collisionSystem(int count) {
    for (int b = 0; b < count; b++) {
        if (!alive[b] || type[b] != 1) continue;
        for (int e = 0; e < count; e++) {
            if (!alive[e] || type[e] != 2) continue;
            int dx = x[b] - x[e]; int dy = y[b] - y[e];
            if (dx < 0) dx = -dx; if (dy < 0) dy = -dy;
            if (dx < 18 && dy < 18) {
                hp[b] = 0; hp[e] -= playerDamage;
                score += 100; kills++;
                break;
            }
        }
    }
}

void cleanupSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (alive[i] && hp[i] <= 0) alive[i] = false;
    }
}

int countAlive(int count) {
    int c = 0;
    for (int i = 0; i < count; i++) { if (alive[i]) c++; }
    return c;
}

void processInput(char input, int playerIdx) {
    Action a = mapInput(input);
    if (a == MOVE_UP) y[playerIdx] -= playerSpeed;
    else if (a == MOVE_DOWN) y[playerIdx] += playerSpeed;
    else if (a == MOVE_LEFT) x[playerIdx] -= playerSpeed;
    else if (a == MOVE_RIGHT) x[playerIdx] += playerSpeed;
    else if (a == FIRE) {
        spawnFromPool(x[playerIdx], y[playerIdx], 0, -16, 1, 1);
        bulletCount++;
    }
}

int main() {
    for (int i = 0; i < POOL_SIZE; i++) {
        freeList[i] = i;
        alive[i] = false;
    }

    initAchievements();
    initStats(sessionStats);
    srand(42);

    int playerIdx = spawnFromPool(180, 300, 0, 0, 100, 0);
    spawnFromPool(120, 60, 0, 4, 1, 2);
    spawnFromPool(200, 60, 0, 4, 1, 2);
    spawnFromPool(280, 60, 0, 4, 1, 2);

    // Profile pool over 10 frames
    int frameAllocs[] = {8, 4, 3, 2, 5, 3, 6, 1, 1, 2};
    int frameFrees[]  = {0, 1, 2, 3, 3, 1, 2, 4, 5, 8};

    for (int i = 0; i < 10; i++) {
        recordPoolSample(i + 1, frameAllocs[i], frameFrees[i]);
    }

    printPoolSample(0);   // frame 1
    printPoolSample(4);   // frame 5
    printPoolSample(6);   // frame 7
    printPoolSample(9);   // frame 10

    int util = poolPeakUsed * 100 / POOL_SIZE;
    cout << "MEMORY_PROFILE|peak_frame|" << poolPeakFrame << "|peak_used|" << poolPeakUsed
         << "|pool_size|" << POOL_SIZE << "|peak_util|" << util << "%" << endl;

    int net = poolTotalAllocs - poolTotalFrees;
    cout << "MEMORY_SUMMARY|total_allocs|" << poolTotalAllocs << "|total_frees|"
         << poolTotalFrees << "|net|" << net << "|peak|" << poolPeakUsed << endl;

    return 0;
}
`,
};
