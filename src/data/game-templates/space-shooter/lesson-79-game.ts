import type { GameLessonVariant } from "@/types/game";

export const lesson79SpaceShooter: GameLessonVariant = {
  lessonId: "79-optimization-pass",
  instructions: `# Game Builder: Optimization Pass — Brute Force vs Spatial Hash

This is the optimization workflow: measure, change, measure. Your collision system checks every bullet against every enemy. With 50 bullets and 20 enemies, that is 1000 pair checks per frame. A spatial hash reduces that to approximately 120 by only checking entities in the same grid cell. The speedup is 8.3x. But you only know that because you counted.

## What Breaks Without This

Without measurement, optimization is superstition. You "feel" the game is slow. You rewrite something. It might be faster. You do not know. Maybe it is slower — the rewrite introduced a cache miss pattern. Counting work units removes guesswork. The numbers do not lie.

## The Fix

Two implementations of the same function. Brute force iterates all pairs. Spatial hash buckets entities into grid cells and only checks within cells. Run both. Count checks. Compare. The optimization that saves the most checks wins. The frame time comparison proves it hits the 60fps target.

\\\`\\\`\\\`
// Brute: for each bullet, for each enemy -> N*M
// Spatial: for each cell, for each bullet in cell, for each enemy in cell
// Compare: checks_before / checks_after = speedup
\\\`\\\`\\\`

## Your Task

1. Brute force: 50 bullets * 20 enemies = 1000 checks
2. Spatial hash: 4x4 grid, ~120 total checks
3. Print: \\\`OPTIMIZE|bruteforce|checks|1000|time_units|1000\\\`
4. Print: \\\`OPTIMIZE|spatial_hash|checks|120|time_units|120\\\`
5. Print: \\\`OPTIMIZE|speedup|8.3x|checks_saved|880\\\`
6. Print: \\\`FRAME_TIME|before|16.7ms|after|2.0ms|target|16.0ms|status|PASS\\\`

## Beginner Trap

**Common Mistake:** Building the spatial hash but never benchmarking it against brute force. The hash has overhead — cell computation, bucket management. For small entity counts, brute force is faster because it has no overhead. Always compare both paths with your actual entity count.

## Elite Insight

Spatial hashing is O(N+M) average case for collision detection when entities are uniformly distributed. Brute force is O(N*M). But big-O hides constants. The spatial hash has higher constant factors — hash computation, bucket traversal, cache misses from pointer chasing. Profile with real data, not theoretical complexity.

## Cross-Path Echo

Web API caching is the same optimization. Without cache: every request hits the database (brute force). With cache: only cache misses hit the database (spatial hash). Cache hit ratio is the speedup metric. Your checks_saved is the cache hit count. Same pattern, different domain.`,
  starterCode: `#include <iostream>
using namespace std;

const int NUM_BULLETS = 50;
const int NUM_ENEMIES = 20;
const int GRID_SIZE = 4;
const int NUM_CELLS = GRID_SIZE * GRID_SIZE;

// TODO: Write bruteForceChecks(numBullets, numEnemies)
//   Return numBullets * numEnemies

// TODO: Write spatialHashChecks(numBullets, numEnemies, gridSize)
//   Distribute entities across cells (non-uniform)
//   Sum per-cell checks. Target ~120 total.

// TODO: Write printResults(bruteChecks, spatialChecks)
//   OPTIMIZE lines for both, speedup, checks_saved

// TODO: Write printFrameTime(bruteChecks, spatialChecks)
//   Scale to ms, compare against 16.0ms target

int main() {
    // TODO: Calculate both check counts
    // TODO: Print optimization results and frame time comparison

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

const int NUM_BULLETS = 50;
const int NUM_ENEMIES = 20;
const int GRID_SIZE = 4;
const int NUM_CELLS = GRID_SIZE * GRID_SIZE;

int bruteForceChecks(int numBullets, int numEnemies) {
    return numBullets * numEnemies;
}

int spatialHashChecks(int numBullets, int numEnemies, int gridSize) {
    int cells = gridSize * gridSize;

    // Non-uniform distribution across 16 cells
    int bpc[] = {5, 4, 3, 2, 4, 3, 5, 2, 3, 4, 2, 3, 4, 2, 3, 1};
    int epc[] = {2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 0, 1};

    int total = 0;
    for (int c = 0; c < cells; c++) {
        total += bpc[c] * epc[c];
    }
    return total;
}

void printResults(int bruteChecks, int spatialChecks) {
    cout << "OPTIMIZE|bruteforce|checks|" << bruteChecks
         << "|time_units|" << bruteChecks << endl;
    cout << "OPTIMIZE|spatial_hash|checks|" << spatialChecks
         << "|time_units|" << spatialChecks << endl;

    int speedupTenths = bruteChecks * 10 / spatialChecks;
    int saved = bruteChecks - spatialChecks;
    cout << "OPTIMIZE|speedup|" << speedupTenths / 10 << "." << speedupTenths % 10
         << "x|checks_saved|" << saved << endl;
}

void printFrameTime(int bruteChecks, int spatialChecks) {
    int beforeTenths = bruteChecks * 167 / 1000;
    int afterTenths = spatialChecks * 167 / 1000;
    int targetTenths = 160;

    string status = (afterTenths < targetTenths) ? "PASS" : "FAIL";

    cout << "FRAME_TIME|before|" << beforeTenths / 10 << "." << beforeTenths % 10
         << "ms|after|" << afterTenths / 10 << "." << afterTenths % 10
         << "ms|target|16.0ms|status|" << status << endl;
}

int main() {
    int brute = bruteForceChecks(NUM_BULLETS, NUM_ENEMIES);
    int spatial = spatialHashChecks(NUM_BULLETS, NUM_ENEMIES, GRID_SIZE);

    printResults(brute, spatial);
    printFrameTime(brute, spatial);

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Brute force checks counted", expectedOutput: "OPTIMIZE\\|bruteforce\\|checks\\|1000\\|time_units\\|1000", isPattern: true },
    { id: "g2", description: "Spatial hash checks counted", expectedOutput: "OPTIMIZE\\|spatial_hash\\|checks\\|120\\|time_units\\|120", isPattern: true },
    { id: "g3", description: "Speedup computed", expectedOutput: "OPTIMIZE\\|speedup\\|8\\.3x\\|checks_saved\\|880", isPattern: true },
    { id: "g4", description: "Frame time passes target", expectedOutput: "FRAME_TIME\\|before\\|16\\.7ms\\|after\\|2\\.0ms\\|target\\|16\\.0ms\\|status\\|PASS", isPattern: true },
  ],
  hints: [
    "Brute force = 50 * 20 = 1000. For spatial hash, define two arrays representing bullets-per-cell and enemies-per-cell across 16 cells. Arrays must sum to 50 and 20 respectively.",
    "Per-cell checks = bullets_in_cell * enemies_in_cell. Sum across all 16 cells to get total. Adjust arrays so the total is exactly 120. Example: cell with 5 bullets and 2 enemies = 10 checks.",
    "Speedup: 1000*10/120 = 83 -> 8.3x. Frame time scaling: 1000*167/1000=167 -> 16.7ms, 120*167/1000=20 -> 2.0ms. 2.0 < 16.0 so status is PASS.",
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
const int GRID_SIZE = 4;
const int NUM_CELLS = GRID_SIZE * GRID_SIZE;

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

int bruteForceChecks(int numBullets, int numEnemies) {
    return numBullets * numEnemies;
}

int spatialHashChecks(int numBullets, int numEnemies, int gridSize) {
    int bpc[] = {5, 4, 3, 2, 4, 3, 5, 2, 3, 4, 2, 3, 4, 2, 3, 1};
    int epc[] = {2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 0, 1};
    int total = 0;
    int cells = gridSize * gridSize;
    for (int c = 0; c < cells; c++) {
        total += bpc[c] * epc[c];
    }
    return total;
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

    // Optimization comparison
    int brute = bruteForceChecks(50, 20);
    int spatial = spatialHashChecks(50, 20, GRID_SIZE);

    cout << "OPTIMIZE|bruteforce|checks|" << brute
         << "|time_units|" << brute << endl;
    cout << "OPTIMIZE|spatial_hash|checks|" << spatial
         << "|time_units|" << spatial << endl;

    int speedupTenths = brute * 10 / spatial;
    int saved = brute - spatial;
    cout << "OPTIMIZE|speedup|" << speedupTenths / 10 << "." << speedupTenths % 10
         << "x|checks_saved|" << saved << endl;

    int beforeTenths = brute * 167 / 1000;
    int afterTenths = spatial * 167 / 1000;
    string status = (afterTenths < 160) ? "PASS" : "FAIL";
    cout << "FRAME_TIME|before|" << beforeTenths / 10 << "." << beforeTenths % 10
         << "ms|after|" << afterTenths / 10 << "." << afterTenths % 10
         << "ms|target|16.0ms|status|" << status << endl;

    return 0;
}
`,
};
