import type { GameLessonVariant } from "@/types/game";

export const lesson99SpaceShooter: GameLessonVariant = {
  lessonId: "99-final-refactor",
  instructions: `# Final Refactor — Clean Code for the Space Shooter

The game compiles. The tests pass. The docs exist. But the code has warnings. Unused variables. Implicit conversions. Missing return paths. Each warning is a potential bug. The final refactor eliminates every warning and verifies code quality. Zero warnings. Short functions. Named constants. No dead code. Professional grade.

## What Breaks Without This

Without cleanup, the codebase degrades. Each warning is a broken window. Developers see warnings and add more. "The project already has warnings, one more will not matter." Six months later there are 200 warnings. Real bugs hide in the noise. The signal-to-noise ratio collapses. Clean code stays clean. Dirty code gets dirtier.

## The Fix

Compile with maximum warnings. Fix every one. Then run quality checks: function count, average length, globals, constants, magic numbers, header usage. Every metric must pass. The code is ready for release when every check is green.

\\\`\\\`\\\`
// Strict compile: -Wall -Wextra -Wpedantic
// Quality: functions < 30 lines avg, 0 magic numbers
// Headers: 0 unused includes
// Result: ready for release
\\\`\\\`\\\`

## Your Task

1. Simulate fixing 3 compiler warnings with COMPILE| lines
2. Print: \\\`REFACTOR|warnings_before|5|warnings_after|0|lines_changed|8\\\`
3. Run quality checks — print 3 QUALITY| lines
4. Print: \\\`REFACTOR_SUMMARY|warnings_fixed|5|quality|PASS|ready_for_release|true\\\`

## Beginner Trap

**Common Mistake:** Fixing the warning symptom but not the root cause. An "unused variable" warning might mean you forgot to use the result of a function call. Removing the variable fixes the warning but introduces a bug. Read the warning. Understand why the variable exists. Fix the intent, not just the message.

## Elite Insight

Google's C++ style guide mandates zero warnings with their standard warning set. Every commit must compile clean. Warnings that are false positives get explicit suppression comments explaining why. The comment is the acknowledgment. The rule is zero unacknowledged warnings. Your refactor follows the same standard.

## Cross-Path Echo

Code review in professional teams serves the same purpose. A reviewer reads every line and flags issues: unused code, unclear names, missing edge cases. Your quality checks are an automated code review. They catch the same issues a reviewer would, but they run every build.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

int warningsBefore = 5;
int warningsAfter = 0;
int linesChanged = 8;

// TODO: Write fixWarnings() — print 3 COMPILE warning lines
// TODO: Write runQualityChecks() — print 3 QUALITY lines

int main() {
    // TODO: Fix warnings, print REFACTOR, run quality, print REFACTOR_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int warningsBefore = 5;
int warningsAfter = 0;
int linesChanged = 8;

void fixWarnings() {
    cout << "COMPILE|warning|unused variable 'temp' in moveSystem|FIXED|removed" << endl;
    cout << "COMPILE|warning|implicit int-to-bool conversion in collisionCheck|FIXED|explicit cast" << endl;
    cout << "COMPILE|warning|missing return in spawnParticles path|FIXED|added return" << endl;
}

void runQualityChecks() {
    cout << "QUALITY|functions|25|avg_length|15_lines|max_length|30_lines" << endl;
    cout << "QUALITY|globals|2|constants|12|magic_numbers|0" << endl;
    cout << "QUALITY|headers_included|5|unused_headers|0" << endl;
}

int main() {
    fixWarnings();

    cout << "REFACTOR|warnings_before|" << warningsBefore
         << "|warnings_after|" << warningsAfter
         << "|lines_changed|" << linesChanged << endl;

    runQualityChecks();

    cout << "REFACTOR_SUMMARY|warnings_fixed|" << warningsBefore
         << "|quality|PASS|ready_for_release|true" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Unused variable warning fixed", expectedOutput: "COMPILE\\|warning\\|unused variable 'temp' in moveSystem\\|FIXED\\|removed", isPattern: true },
    { id: "g2", description: "Implicit conversion fixed", expectedOutput: "COMPILE\\|warning\\|implicit int-to-bool conversion in collisionCheck\\|FIXED\\|explicit cast", isPattern: true },
    { id: "g3", description: "Missing return fixed", expectedOutput: "COMPILE\\|warning\\|missing return in spawnParticles path\\|FIXED\\|added return", isPattern: true },
    { id: "g4", description: "Refactor metrics", expectedOutput: "REFACTOR\\|warnings_before\\|5\\|warnings_after\\|0\\|lines_changed\\|8", isPattern: true },
    { id: "g5", description: "Function quality metrics", expectedOutput: "QUALITY\\|functions\\|25\\|avg_length\\|15_lines\\|max_length\\|30_lines", isPattern: true },
    { id: "g6", description: "Zero magic numbers", expectedOutput: "QUALITY\\|globals\\|2\\|constants\\|12\\|magic_numbers\\|0", isPattern: true },
    { id: "g7", description: "Ready for release", expectedOutput: "REFACTOR_SUMMARY\\|warnings_fixed\\|5\\|quality\\|PASS\\|ready_for_release\\|true", isPattern: true },
  ],
  hints: [
    "fixWarnings outputs 3 lines, each describing a warning and its resolution. The format is COMPILE|warning|description|FIXED|action. Three distinct warnings: unused variable, implicit conversion, missing return.",
    "runQualityChecks outputs 3 QUALITY lines with project metrics. All values are hardcoded: 25 functions, avg 15 lines, max 30 lines, 2 globals, 12 constants, 0 magic numbers, 5 headers, 0 unused.",
    "REFACTOR line goes between fixWarnings and runQualityChecks. REFACTOR_SUMMARY goes last. Use warningsBefore=5, quality=PASS, ready_for_release=true.",
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

int clampVal(int val, int lo, int hi) {
    if (val < lo) return lo;
    if (val > hi) return hi;
    return val;
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

// === README & DOCS ===

void printReadme() {
    cout << "README|# Space Shooter" << endl;
    cout << "README|" << endl;
    cout << "README|A terminal-based space shooter built in C++." << endl;
    cout << "README|" << endl;
    cout << "README|## Build" << endl;
    cout << "README|make game" << endl;
    cout << "README|" << endl;
    cout << "README|## Controls" << endl;
    cout << "README|WASD - Move | SPACE - Fire | P - Pause | Q - Quit" << endl;
    cout << "README|" << endl;
    cout << "README|## Features" << endl;
    cout << "README|- 10 waves with 3 boss types" << endl;
    cout << "README|- Score system with combo multipliers" << endl;
    cout << "README|- Particle effects and screen shake" << endl;
    cout << "README|- Replay system with deterministic playback" << endl;
    cout << "README|- Settings persistence" << endl;
}

void printGitignore() {
    cout << "GITIGNORE|game" << endl;
    cout << "GITIGNORE|*.o" << endl;
    cout << "GITIGNORE|build/" << endl;
}

// === FINAL REFACTOR ===

void fixWarnings() {
    cout << "COMPILE|warning|unused variable 'temp' in moveSystem|FIXED|removed" << endl;
    cout << "COMPILE|warning|implicit int-to-bool conversion in collisionCheck|FIXED|explicit cast" << endl;
    cout << "COMPILE|warning|missing return in spawnParticles path|FIXED|added return" << endl;
}

void runQualityChecks() {
    cout << "QUALITY|functions|25|avg_length|15_lines|max_length|30_lines" << endl;
    cout << "QUALITY|globals|2|constants|12|magic_numbers|0" << endl;
    cout << "QUALITY|headers_included|5|unused_headers|0" << endl;
}

int main() {
    initFullState();

    fixWarnings();
    cout << "REFACTOR|warnings_before|5|warnings_after|0|lines_changed|8" << endl;
    runQualityChecks();
    cout << "REFACTOR_SUMMARY|warnings_fixed|5|quality|PASS|ready_for_release|true" << endl;

    return 0;
}
`,
};
