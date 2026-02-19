import type { GameLessonVariant } from "@/types/game";

export const lesson73SpaceShooter: GameLessonVariant = {
  lessonId: "73-determinism",
  instructions: `# Determinism Rules — Reproducible Space Shooter

Your space shooter uses rand() for enemy spawn positions, wave timing, and powerup drops. Without a seed, every playthrough is unique. With srand(42), every playthrough is identical. Same enemies at the same positions. Same powerup at the same frame. Run it twice and every value matches. This is the foundation of replays and network sync.

## What Breaks Without This

Without determinism, you cannot replay a game. You cannot debug a crash that only happens on wave 7 with specific enemy positions. You cannot run multiplayer with lockstep networking because each client generates different random values. The game diverges within frames. Determinism is not a feature. It is an engineering requirement.

## The Fix

One srand() call at startup. Every rand() call after that is deterministic. Log every random value with its purpose. Run the same sequence twice. Compare every value. Perfect match means perfect reproducibility.

\\\`\\\`\\\`
srand(42);
int spawnX = rand() % 300;   // always the same
int spawnY = rand() % 100;   // always the same
int powerup = rand() % 4;    // always the same
\\\`\\\`\\\`

## Your Task

1. Set srand(42) at game start
2. Simulate 5 frames. Each frame uses 3 rand() calls:
   - spawn_x = rand() % 300 (enemy X position)
   - spawn_y = rand() % 100 (enemy Y position)
   - powerup = rand() % 4 (powerup type: 0=none, 1=speed, 2=damage, 3=shield)
3. First run: store all 15 values, print each:
   \\\`RNG|frame|<f>|call|<n>|value|<v>|used_for|<purpose>\\\`
4. Reset srand(42). Run same 5 frames again
5. Compare each value pair per frame:
   \\\`DETERMINISM|frame|<f>|match|<true/false>|values_compared|3\\\`
6. After all frames:
   \\\`DETERMINISM_SUMMARY|seed|42|total_rng_calls|15|reproducible|true\\\`

## Beginner Trap

**Common Mistake:** Calling rand() a different number of times in the second run. If you add a debug rand() call or skip one, the entire sequence shifts. Every rand() call must be identical between runs. One extra call and all subsequent values diverge.

## Elite Insight

Replay systems store the seed and the input sequence. To replay, set the seed and feed the same inputs. The simulation produces identical results frame by frame. StarCraft, Age of Empires, and Factorio all use this technique. File size is tiny: just inputs and a seed. The deterministic simulation reconstructs everything.

## Cross-Path Echo

Cryptographic systems use seeded PRNGs for key generation. Given the same seed, the same key is produced on any machine. Your game's determinism is the same principle applied to entertainment instead of security. The math is identical.`,
  starterCode: `#include <iostream>
#include <cstdlib>
#include <string>
using namespace std;

int main() {
    const int FRAMES = 5;
    const int CALLS_PER_FRAME = 3;
    const int TOTAL_CALLS = FRAMES * CALLS_PER_FRAME;

    int run1[TOTAL_CALLS];
    int run2[TOTAL_CALLS];
    string purposes[] = {"spawn_x", "spawn_y", "powerup"};
    int mods[] = {300, 100, 4};

    // TODO: First run — srand(42)
    //   For each frame (1-5):
    //     Generate 3 rand() values with appropriate modulus
    //     Store in run1 array
    //     Print RNG line for each

    // TODO: Second run — srand(42) again
    //   Generate same 15 values into run2

    // TODO: Compare per frame (3 values each)
    //   Print DETERMINISM line per frame

    // TODO: Print DETERMINISM_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <cstdlib>
#include <string>
using namespace std;

int main() {
    const int FRAMES = 5;
    const int CALLS_PER_FRAME = 3;
    const int TOTAL_CALLS = FRAMES * CALLS_PER_FRAME;

    int run1[TOTAL_CALLS];
    int run2[TOTAL_CALLS];
    string purposes[] = {"spawn_x", "spawn_y", "powerup"};
    int mods[] = {300, 100, 4};

    // First run
    srand(42);
    for (int f = 0; f < FRAMES; f++) {
        for (int c = 0; c < CALLS_PER_FRAME; c++) {
            int idx = f * CALLS_PER_FRAME + c;
            run1[idx] = rand() % mods[c];
            cout << "RNG|frame|" << (f + 1)
                 << "|call|" << (c + 1)
                 << "|value|" << run1[idx]
                 << "|used_for|" << purposes[c] << endl;
        }
    }

    // Second run — same seed
    srand(42);
    for (int f = 0; f < FRAMES; f++) {
        for (int c = 0; c < CALLS_PER_FRAME; c++) {
            int idx = f * CALLS_PER_FRAME + c;
            run2[idx] = rand() % mods[c];
        }
    }

    // Compare per frame
    bool allReproducible = true;
    for (int f = 0; f < FRAMES; f++) {
        bool frameMatch = true;
        for (int c = 0; c < CALLS_PER_FRAME; c++) {
            int idx = f * CALLS_PER_FRAME + c;
            if (run1[idx] != run2[idx]) frameMatch = false;
        }
        if (!frameMatch) allReproducible = false;
        cout << "DETERMINISM|frame|" << (f + 1)
             << "|match|" << (frameMatch ? "true" : "false")
             << "|values_compared|" << CALLS_PER_FRAME << endl;
    }

    cout << "DETERMINISM_SUMMARY|seed|42|total_rng_calls|"
         << TOTAL_CALLS << "|reproducible|"
         << (allReproducible ? "true" : "false") << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Frame 1 spawn_x logged", expectedOutput: "RNG\\|frame\\|1\\|call\\|1\\|value\\|\\d+\\|used_for\\|spawn_x", isPattern: true },
    { id: "g2", description: "Frame 1 spawn_y logged", expectedOutput: "RNG\\|frame\\|1\\|call\\|2\\|value\\|\\d+\\|used_for\\|spawn_y", isPattern: true },
    { id: "g3", description: "Frame 5 powerup logged", expectedOutput: "RNG\\|frame\\|5\\|call\\|3\\|value\\|\\d+\\|used_for\\|powerup", isPattern: true },
    { id: "g4", description: "Frame 1 determinism verified", expectedOutput: "DETERMINISM\\|frame\\|1\\|match\\|true\\|values_compared\\|3", isPattern: true },
    { id: "g5", description: "Frame 5 determinism verified", expectedOutput: "DETERMINISM\\|frame\\|5\\|match\\|true\\|values_compared\\|3", isPattern: true },
    { id: "g6", description: "Summary confirms reproducibility", expectedOutput: "DETERMINISM_SUMMARY\\|seed\\|42\\|total_rng_calls\\|15\\|reproducible\\|true", isPattern: true },
  ],
  hints: [
    "Flat index: idx = f * CALLS_PER_FRAME + c. Frame 0, call 0 maps to index 0. Frame 4, call 2 maps to index 14. Store rand() % mods[c] at this index.",
    "The purposes[] and mods[] arrays are parallel: purposes[0]=\"spawn_x\" with mods[0]=300, purposes[1]=\"spawn_y\" with mods[1]=100, purposes[2]=\"powerup\" with mods[2]=4.",
    "Call srand(42) before each run. The second run must call rand() exactly 15 times in the same order. Compare run1[idx] != run2[idx] per frame to check determinism.",
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

enum Action { NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE };
enum AIPattern { AI_NONE, AI_LINEAR, AI_SINE, AI_TRACK };

int aiPattern[POOL_SIZE];

int playerSpeed = 4;
int playerDamage = 10;

// --- Loading system ---
struct LoadTask {
    string name;
    int totalTicks;
    int progress;
};

bool runLoadingPhase(LoadTask tasks[], int numTasks) {
    int currentTick = 0;
    int currentTask = 0;
    int totalTicks = 0;
    for (int i = 0; i < numTasks; i++) totalTicks += tasks[i].totalTicks;

    while (currentTask < numTasks) {
        currentTick++;
        tasks[currentTask].progress++;
        int pct = (tasks[currentTask].progress * 100) / tasks[currentTask].totalTicks;
        cout << "LOADING|tick|" << currentTick
             << "|task|" << tasks[currentTask].name
             << "|progress|" << pct << "%" << endl;
        if (tasks[currentTask].progress >= tasks[currentTask].totalTicks) {
            cout << "LOAD_COMPLETE|task|" << tasks[currentTask].name
                 << "|tick|" << currentTick << endl;
            currentTask++;
        }
    }
    cout << "ALL_LOADED|tick|" << currentTick
         << "|tasks|" << numTasks << "|total_ticks|" << totalTicks << endl;
    cout << "STATE|LOADING->READY" << endl;
    return true;
}

// --- Job system ---
const int JOB_SPAWN = 0;
const int JOB_MOVE = 1;
const int JOB_DAMAGE = 2;
const int JOB_CLEANUP = 3;
const int JOB_RENDER = 4;

struct Job {
    int jtype;
    int data;
};

const int MAX_JOBS = 32;
Job jobQueue[MAX_JOBS];
int jobCount = 0;

void submitJob(int jtype, int data) {
    if (jobCount < MAX_JOBS) {
        jobQueue[jobCount++] = {jtype, data};
    }
}

void sortJobs() {
    for (int i = 0; i < jobCount - 1; i++) {
        for (int j = 0; j < jobCount - 1 - i; j++) {
            if (jobQueue[j].jtype > jobQueue[j + 1].jtype) {
                Job tmp = jobQueue[j];
                jobQueue[j] = jobQueue[j + 1];
                jobQueue[j + 1] = tmp;
            }
        }
    }
}

string jobTypeName(int t) {
    if (t == JOB_SPAWN) return "SPAWN";
    if (t == JOB_MOVE) return "MOVE";
    if (t == JOB_DAMAGE) return "DAMAGE";
    if (t == JOB_CLEANUP) return "CLEANUP";
    if (t == JOB_RENDER) return "RENDER";
    return "UNKNOWN";
}

// --- Determinism ---
int gameSeed = 42;

void initRNG() {
    srand(gameSeed);
}

int seededRand(int mod) {
    return rand() % mod;
}

// --- Core systems ---
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

int spawnFromPool(int px, int py, int pvx, int pvy, int php, int ptype) {
    if (freeCount <= 0) return -1;
    freeCount--;
    int idx = freeList[freeCount];
    x[idx] = px;
    y[idx] = py;
    vx[idx] = pvx;
    vy[idx] = pvy;
    hp[idx] = php;
    type[idx] = ptype;
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
        x[i] += vx[i];
        y[i] += vy[i];
    }
}

void collisionSystem(int count) {
    for (int b = 0; b < count; b++) {
        if (!alive[b] || type[b] != 1) continue;
        for (int e = 0; e < count; e++) {
            if (!alive[e] || type[e] != 2) continue;
            int dx = x[b] - x[e];
            int dy = y[b] - y[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            if (dx < 18 && dy < 18) {
                hp[b] = 0;
                hp[e] -= playerDamage;
                score += 100;
                kills++;
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
    for (int i = 0; i < count; i++) {
        if (alive[i]) c++;
    }
    return c;
}

int worldToScreenX(int wx, int camX) {
    return (wx - camX) * SCREEN_W / VIEW_W;
}

int worldToScreenY(int wy, int camY) {
    return (wy - camY) * SCREEN_H / VIEW_H;
}

void processInput(char input, int playerIdx) {
    Action a = mapInput(input);
    if (a == MOVE_UP) y[playerIdx] -= playerSpeed;
    else if (a == MOVE_DOWN) y[playerIdx] += playerSpeed;
    else if (a == MOVE_LEFT) x[playerIdx] -= playerSpeed;
    else if (a == MOVE_RIGHT) x[playerIdx] += playerSpeed;
    else if (a == FIRE) {
        spawnFromPool(x[playerIdx], y[playerIdx], 0, -16, 1, 1);
    }
}

void renderSystem(int count, int camX, int camY) {
    char grid[SCREEN_H][SCREEN_W];
    for (int r = 0; r < SCREEN_H; r++)
        for (int c = 0; c < SCREEN_W; c++)
            grid[r][c] = '.';

    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        int sx = worldToScreenX(x[i], camX);
        int sy = worldToScreenY(y[i], camY);
        if (sx >= 0 && sx < SCREEN_W && sy >= 0 && sy < SCREEN_H) {
            if (type[i] == 0) grid[sy][sx] = 'P';
            else if (type[i] == 1) grid[sy][sx] = '|';
            else if (type[i] == 2) grid[sy][sx] = 'V';
        }
    }

    for (int r = 0; r < SCREEN_H; r++) {
        for (int c = 0; c < SCREEN_W; c++) cout << grid[r][c];
        cout << endl;
    }
}

void debugSystem(int frame, int count) {
    int active = countAlive(count);
    cout << "DEBUG|frame|" << frame << "|active|" << active
         << "|pool|" << active << "/" << POOL_SIZE
         << "|fps|60|kills|" << kills << endl;
}

int main() {
    // Deterministic seed
    initRNG();

    const int FRAMES = 5;
    const int CALLS_PER_FRAME = 3;
    const int TOTAL_CALLS = FRAMES * CALLS_PER_FRAME;

    int run1[TOTAL_CALLS];
    int run2[TOTAL_CALLS];
    string purposes[] = {"spawn_x", "spawn_y", "powerup"};
    int mods[] = {300, 100, 4};

    // First run
    srand(gameSeed);
    for (int f = 0; f < FRAMES; f++) {
        for (int c = 0; c < CALLS_PER_FRAME; c++) {
            int idx = f * CALLS_PER_FRAME + c;
            run1[idx] = rand() % mods[c];
            cout << "RNG|frame|" << (f + 1)
                 << "|call|" << (c + 1)
                 << "|value|" << run1[idx]
                 << "|used_for|" << purposes[c] << endl;
        }
    }

    // Second run
    srand(gameSeed);
    for (int f = 0; f < FRAMES; f++) {
        for (int c = 0; c < CALLS_PER_FRAME; c++) {
            int idx = f * CALLS_PER_FRAME + c;
            run2[idx] = rand() % mods[c];
        }
    }

    // Compare
    bool allReproducible = true;
    for (int f = 0; f < FRAMES; f++) {
        bool frameMatch = true;
        for (int c = 0; c < CALLS_PER_FRAME; c++) {
            int idx = f * CALLS_PER_FRAME + c;
            if (run1[idx] != run2[idx]) frameMatch = false;
        }
        if (!frameMatch) allReproducible = false;
        cout << "DETERMINISM|frame|" << (f + 1)
             << "|match|" << (frameMatch ? "true" : "false")
             << "|values_compared|" << CALLS_PER_FRAME << endl;
    }

    cout << "DETERMINISM_SUMMARY|seed|" << gameSeed
         << "|total_rng_calls|" << TOTAL_CALLS
         << "|reproducible|"
         << (allReproducible ? "true" : "false") << endl;

    return 0;
}
`,
};
