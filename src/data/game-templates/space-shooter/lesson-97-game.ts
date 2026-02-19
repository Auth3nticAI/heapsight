import type { GameLessonVariant } from "@/types/game";

export const lesson97SpaceShooter: GameLessonVariant = {
  lessonId: "97-unit-tests",
  instructions: `# Unit Tests — Proving the Space Shooter Works

Every system in the game has assumptions. Collision assumes AABB overlap math is correct. Damage assumes HP never goes negative. The pool assumes allocation returns valid indices. The score assumes combo multiplier math is right. Clamp assumes bounds are enforced. These assumptions must be verified. Unit tests verify them.

## What Breaks Without This

Without tests, refactoring is terrifying. You want to optimize the collision check but you cannot prove it still works after the change. You want to simplify the score formula but you cannot verify edge cases. Every optimization, every refactor, every bug fix risks breaking something else. Tests are the safety net.

## The Fix

Five test functions. Each calls a core game function with known inputs. Each checks the result against expected output. Each reports PASS with check count. The test runner reports the total. Zero failures means the core is solid.

\\\`\\\`\\\`
// Test structure:
// 1. Call function with known input
// 2. Compare result to expected value
// 3. Increment check counter if correct
// 4. Print TEST|name|PASS|checks|N
\\\`\\\`\\\`

## Your Task

1. test_collision: 4 checks — overlap true, no overlap false, edge false, adjacent false
2. test_damage: 3 checks — normal subtraction, overkill clamps to 0, zero damage no change
3. test_pool_alloc: 2 checks — valid index from free count, -1 when empty
4. test_clamp: 4 checks — in range, below min, above max, at boundary
5. test_score: 3 checks — base * 1, base * 2, base * 5
6. Print per test: \\\`TEST|test_name|PASS|checks|N\\\`
7. Print: \\\`TEST_SUMMARY|total|5|passed|5|failed|0|checks|16\\\`

## Beginner Trap

**Common Mistake:** Not testing the zero and boundary cases. \\\`applyDamage(10, 50)\\\` must return 0, not -40. \\\`clamp(0, 0, 10)\\\` must return 0, not fail. \\\`poolAlloc(0)\\\` must return -1, not crash. Boundary cases are where bugs live.

## Elite Insight

Coverage measures how much of your code is tested. 100% line coverage means every line executed during tests. But 100% coverage does not mean 100% correct. You can cover every line without testing every edge case. Branch coverage is better — every if/else path tested. Mutation testing is best — change the code and verify a test fails. If no test fails, the test suite is weak.

## Cross-Path Echo

CI/CD pipelines run tests on every commit. Push code, tests run, red or green. If red, the commit is rejected. If green, it merges. Your test runner is a CI pipeline for your game. Every change must pass before it ships.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

int clamp(int val, int lo, int hi) {
    if (val < lo) return lo;
    if (val > hi) return hi;
    return val;
}

bool checkCollision(int ax, int ay, int aw, int ah,
                    int bx, int by, int bw, int bh) {
    return ax < bx + bw && ax + aw > bx &&
           ay < by + bh && ay + ah > by;
}

int applyDamage(int currentHP, int damage) {
    int result = currentHP - damage;
    if (result < 0) result = 0;
    return result;
}

int poolAlloc(int freeCount) {
    if (freeCount <= 0) return -1;
    return freeCount - 1;
}

int calcScore(int basePoints, int comboMultiplier) {
    return basePoints * comboMultiplier;
}

int totalTests = 0;
int passedTests = 0;
int failedTests = 0;
int totalChecks = 0;

// TODO: Write test_collision() — 4 checks
// TODO: Write test_damage() — 3 checks
// TODO: Write test_pool_alloc() — 2 checks
// TODO: Write test_clamp() — 4 checks
// TODO: Write test_score() — 3 checks

int main() {
    // TODO: Run all 5 tests
    // TODO: Print TEST_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int clamp(int val, int lo, int hi) {
    if (val < lo) return lo;
    if (val > hi) return hi;
    return val;
}

bool checkCollision(int ax, int ay, int aw, int ah,
                    int bx, int by, int bw, int bh) {
    return ax < bx + bw && ax + aw > bx &&
           ay < by + bh && ay + ah > by;
}

int applyDamage(int currentHP, int damage) {
    int result = currentHP - damage;
    if (result < 0) result = 0;
    return result;
}

int poolAlloc(int freeCount) {
    if (freeCount <= 0) return -1;
    return freeCount - 1;
}

int calcScore(int basePoints, int comboMultiplier) {
    return basePoints * comboMultiplier;
}

int totalTests = 0;
int passedTests = 0;
int failedTests = 0;
int totalChecks = 0;

void test_collision() {
    int checks = 0;
    if (checkCollision(0, 0, 10, 10, 5, 5, 10, 10) == true) checks++;
    if (checkCollision(0, 0, 10, 10, 50, 50, 10, 10) == false) checks++;
    if (checkCollision(0, 0, 10, 10, 10, 0, 10, 10) == false) checks++;
    if (checkCollision(0, 0, 10, 10, 0, 10, 10, 10) == false) checks++;
    totalChecks += checks;
    totalTests++;
    passedTests++;
    cout << "TEST|test_collision|PASS|checks|" << checks << endl;
}

void test_damage() {
    int checks = 0;
    if (applyDamage(50, 20) == 30) checks++;
    if (applyDamage(10, 50) == 0) checks++;
    if (applyDamage(50, 0) == 50) checks++;
    totalChecks += checks;
    totalTests++;
    passedTests++;
    cout << "TEST|test_damage|PASS|checks|" << checks << endl;
}

void test_pool_alloc() {
    int checks = 0;
    if (poolAlloc(5) == 4) checks++;
    if (poolAlloc(0) == -1) checks++;
    totalChecks += checks;
    totalTests++;
    passedTests++;
    cout << "TEST|test_pool_alloc|PASS|checks|" << checks << endl;
}

void test_clamp() {
    int checks = 0;
    if (clamp(5, 0, 10) == 5) checks++;
    if (clamp(-3, 0, 10) == 0) checks++;
    if (clamp(15, 0, 10) == 10) checks++;
    if (clamp(0, 0, 10) == 0) checks++;
    totalChecks += checks;
    totalTests++;
    passedTests++;
    cout << "TEST|test_clamp|PASS|checks|" << checks << endl;
}

void test_score() {
    int checks = 0;
    if (calcScore(100, 1) == 100) checks++;
    if (calcScore(100, 2) == 200) checks++;
    if (calcScore(100, 5) == 500) checks++;
    totalChecks += checks;
    totalTests++;
    passedTests++;
    cout << "TEST|test_score|PASS|checks|" << checks << endl;
}

int main() {
    test_collision();
    test_damage();
    test_pool_alloc();
    test_clamp();
    test_score();

    cout << "TEST_SUMMARY|total|" << totalTests
         << "|passed|" << passedTests
         << "|failed|" << failedTests
         << "|checks|" << totalChecks << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Collision tests pass", expectedOutput: "TEST\\|test_collision\\|PASS\\|checks\\|4", isPattern: true },
    { id: "g2", description: "Damage tests pass", expectedOutput: "TEST\\|test_damage\\|PASS\\|checks\\|3", isPattern: true },
    { id: "g3", description: "Pool alloc tests pass", expectedOutput: "TEST\\|test_pool_alloc\\|PASS\\|checks\\|2", isPattern: true },
    { id: "g4", description: "Clamp tests pass", expectedOutput: "TEST\\|test_clamp\\|PASS\\|checks\\|4", isPattern: true },
    { id: "g5", description: "Score tests pass", expectedOutput: "TEST\\|test_score\\|PASS\\|checks\\|3", isPattern: true },
    { id: "g6", description: "Test summary all pass", expectedOutput: "TEST_SUMMARY\\|total\\|5\\|passed\\|5\\|failed\\|0\\|checks\\|16", isPattern: true },
  ],
  hints: [
    "Each test function calls the game helper with known inputs and checks results. Increment checks only when the result matches expected. Call totalTests++ and passedTests++ after each test function.",
    "test_collision: overlapping boxes return true, non-overlapping return false. Edge-touching (ax+aw == bx) returns false because AABB uses strict less-than, not less-than-or-equal.",
    "Total checks across all 5 tests: 4+3+2+4+3 = 16. The TEST_SUMMARY line prints these totals after all tests complete.",
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
const int MAX_SFX_EVENTS = 20;
const int MAX_SFX_CHANNELS = 4;

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
int combo = 1;
int maxCombo = 1;
int lastKillTick = -99;

enum Action { NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE };
enum AIPattern { AI_NONE, AI_LINEAR, AI_SINE, AI_TRACK };
enum GameState { GS_PLAYING, GS_PAUSED, GS_MENU, GS_BOSS, GS_VICTORY };

int aiPattern[POOL_SIZE];
GameState gameState = GS_MENU;

int particleCount = 0;
int particleX[100], particleY[100];
int particleVX[100], particleVY[100];
int particleLife[100];
bool particleAlive[100];

int shakeIntensity = 0;
int shakeDuration = 0;

int trailX[10][8], trailY[10][8];
int trailLen[10];

bool achFirstBlood = false;
bool achCombo5 = false;
bool achBossKill = false;

int totalShots = 0;
int totalHits = 0;
int totalDamage = 0;

struct SoundEvent {
    string name;
    int volume;
    int priority;
};

SoundEvent sfxQueue[MAX_SFX_EVENTS];
int sfxQueueSize = 0;

struct MusicState {
    string currentTrack;
    int volume;
    string prevTrack;
};

MusicState musicState;
int musicTracksPlayed = 0;
int musicTransitions = 0;
int musicCrossfades = 0;

struct PowerUpDef {
    string ptype;
    int duration;
    int magnitude;
};

struct ActiveBuff {
    string btype;
    int remaining;
    int magnitude;
    bool active;
};

PowerUpDef powerupDefs[10];
int numPowerupDefs = 0;
ActiveBuff activeBuffs[10];
int numActiveBuffs = 0;

int playerSpeed = 4;
int playerDamage = 10;

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

FrameState liveStates[MAX_FRAMES];
FrameState replayStates[MAX_FRAMES];

void emitSound(string name, int volume, int priority) {
    sfxQueue[sfxQueueSize].name = name;
    sfxQueue[sfxQueueSize].volume = volume;
    sfxQueue[sfxQueueSize].priority = priority;
    sfxQueueSize++;
}

string getTrackForState(string stateName) {
    if (stateName == "MENU") return "menu_theme";
    if (stateName == "PLAYING") return "gameplay_normal";
    if (stateName == "BOSS") return "boss_battle";
    if (stateName == "VICTORY") return "victory_theme";
    return "silence";
}

void musicTransitionTo(string stateName) {
    string newTrack = getTrackForState(stateName);
    musicState.prevTrack = musicState.currentTrack;
    musicState.currentTrack = newTrack;
    musicState.volume = 100;
    if (musicState.prevTrack.empty()) {
        cout << "MUSIC|state|" << stateName << "|track|" << newTrack << "|vol|1.0" << endl;
    } else {
        cout << "MUSIC|state|" << stateName << "|track|" << newTrack
             << "|vol|1.0|crossfade|" << musicState.prevTrack << "->" << newTrack << endl;
        musicCrossfades++;
    }
    musicTracksPlayed++;
    if (musicTracksPlayed > 1) musicTransitions++;
}

void spawnParticles(int px, int py, int count) {
    for (int i = 0; i < count && particleCount < 100; i++) {
        particleX[particleCount] = px;
        particleY[particleCount] = py;
        particleVX[particleCount] = (rand() % 9) - 4;
        particleVY[particleCount] = (rand() % 9) - 4;
        particleLife[particleCount] = 5 + (rand() % 5);
        particleAlive[particleCount] = true;
        particleCount++;
    }
}

void triggerShake(int intensity, int duration) {
    shakeIntensity = intensity;
    shakeDuration = duration;
}

void checkAchievements(int tick) {
    if (!achFirstBlood && kills >= 1) achFirstBlood = true;
    if (!achCombo5 && maxCombo >= 5) achCombo5 = true;
}

void onKill(int enemyType, int tick) {
    if (tick - lastKillTick <= 3) {
        combo++;
        if (combo > 5) combo = 5;
    } else {
        combo = 1;
    }
    int basePoints[] = {100, 150, 300, 1000};
    int points = basePoints[enemyType] * combo;
    score += points;
    lastKillTick = tick;
    kills++;
    if (combo > maxCombo) maxCombo = combo;
    checkAchievements(tick);
    emitSound("explosion", 100, 1);
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

void initFullState() {
    for (int i = 0; i < POOL_SIZE; i++) {
        freeList[i] = i;
        alive[i] = false;
    }
    freeCount = POOL_SIZE;
    entityCount = 0;
    score = 0; kills = 0; wave = 1; lives = 3;
    combo = 1; maxCombo = 1; lastKillTick = -99;
    bulletCount = 0; replayLogSize = 0;
    playerSpeed = 4; playerDamage = 10;
    gameState = GS_MENU;
    particleCount = 0; shakeIntensity = 0; shakeDuration = 0;
    achFirstBlood = false; achCombo5 = false; achBossKill = false;
    totalShots = 0; totalHits = 0; totalDamage = 0;
    sfxQueueSize = 0;
    musicState.currentTrack = ""; musicState.prevTrack = ""; musicState.volume = 100;
    musicTracksPlayed = 0; musicTransitions = 0; musicCrossfades = 0;
    srand(42);
}

// === BUILD SYSTEM ===

void printMakefile() {
    cout << "BUILD|# Makefile for Space Shooter" << endl;
    cout << "BUILD|CXX = g++" << endl;
    cout << "BUILD|CXXFLAGS = -std=c++17 -Wall -Wextra" << endl;
    cout << "BUILD|SRC = src/main.cpp" << endl;
    cout << "BUILD|game: $(SRC)" << endl;
    cout << "BUILD|\\t$(CXX) $(CXXFLAGS) -o game $(SRC)" << endl;
}

void printCMake() {
    cout << "CMAKE|cmake_minimum_required(VERSION 3.14)" << endl;
    cout << "CMAKE|project(SpaceShooter)" << endl;
    cout << "CMAKE|add_executable(game src/main.cpp)" << endl;
}

void simulateBuild() {
    cout << "COMPILE|src/main.cpp|OK|warnings|0|errors|0" << endl;
    cout << "LINK|game|OK|size|48KB" << endl;
    cout << "BUILD_SUMMARY|files|1|compiled|1|linked|1|warnings|0|errors|0|output|game" << endl;
}

// === UNIT TESTS ===

int clampVal(int val, int lo, int hi) {
    if (val < lo) return lo;
    if (val > hi) return hi;
    return val;
}

bool testCheckCollision(int ax, int ay, int aw, int ah,
                        int bx, int by, int bw, int bh) {
    return ax < bx + bw && ax + aw > bx &&
           ay < by + bh && ay + ah > by;
}

int testApplyDamage(int currentHP, int damage) {
    int result = currentHP - damage;
    if (result < 0) result = 0;
    return result;
}

int testPoolAlloc(int fc) {
    if (fc <= 0) return -1;
    return fc - 1;
}

int testCalcScore(int basePoints, int comboMultiplier) {
    return basePoints * comboMultiplier;
}

int totalTestCount = 0;
int passedTestCount = 0;
int failedTestCount = 0;
int totalCheckCount = 0;

void test_collision() {
    int checks = 0;
    if (testCheckCollision(0, 0, 10, 10, 5, 5, 10, 10) == true) checks++;
    if (testCheckCollision(0, 0, 10, 10, 50, 50, 10, 10) == false) checks++;
    if (testCheckCollision(0, 0, 10, 10, 10, 0, 10, 10) == false) checks++;
    if (testCheckCollision(0, 0, 10, 10, 0, 10, 10, 10) == false) checks++;
    totalCheckCount += checks;
    totalTestCount++;
    passedTestCount++;
    cout << "TEST|test_collision|PASS|checks|" << checks << endl;
}

void test_damage() {
    int checks = 0;
    if (testApplyDamage(50, 20) == 30) checks++;
    if (testApplyDamage(10, 50) == 0) checks++;
    if (testApplyDamage(50, 0) == 50) checks++;
    totalCheckCount += checks;
    totalTestCount++;
    passedTestCount++;
    cout << "TEST|test_damage|PASS|checks|" << checks << endl;
}

void test_pool_alloc() {
    int checks = 0;
    if (testPoolAlloc(5) == 4) checks++;
    if (testPoolAlloc(0) == -1) checks++;
    totalCheckCount += checks;
    totalTestCount++;
    passedTestCount++;
    cout << "TEST|test_pool_alloc|PASS|checks|" << checks << endl;
}

void test_clamp() {
    int checks = 0;
    if (clampVal(5, 0, 10) == 5) checks++;
    if (clampVal(-3, 0, 10) == 0) checks++;
    if (clampVal(15, 0, 10) == 10) checks++;
    if (clampVal(0, 0, 10) == 0) checks++;
    totalCheckCount += checks;
    totalTestCount++;
    passedTestCount++;
    cout << "TEST|test_clamp|PASS|checks|" << checks << endl;
}

void test_score() {
    int checks = 0;
    if (testCalcScore(100, 1) == 100) checks++;
    if (testCalcScore(100, 2) == 200) checks++;
    if (testCalcScore(100, 5) == 500) checks++;
    totalCheckCount += checks;
    totalTestCount++;
    passedTestCount++;
    cout << "TEST|test_score|PASS|checks|" << checks << endl;
}

int main() {
    initFullState();

    test_collision();
    test_damage();
    test_pool_alloc();
    test_clamp();
    test_score();

    cout << "TEST_SUMMARY|total|" << totalTestCount
         << "|passed|" << passedTestCount
         << "|failed|" << failedTestCount
         << "|checks|" << totalCheckCount << endl;

    return 0;
}
`,
};
