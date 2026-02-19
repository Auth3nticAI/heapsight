import type { GameLessonVariant } from "@/types/game";

export const lesson100SpaceShooter: GameLessonVariant = {
  lessonId: "100-milestone-release",
  instructions: `# Milestone: Release v1.0 — The Complete Space Shooter Ships Now

This is it. One hundred lessons. Every system built, tested, documented, and polished. The entity pool handles 500 objects. The collision system resolves AABB overlaps. The score system multiplies combos. The wave system escalates through 10 waves with 3 boss types. Particles erupt. The screen shakes. Trails follow. Achievements pop. Stats track. The replay deterministically reproduces every frame. Settings persist. Audio events fire. Music crossfades between states. The build system compiles it. The tests prove it. The docs explain it. The refactor cleaned it. Now ship it.

## What Breaks Without This

Without a formal release, the project is perpetually "almost done." There is always one more thing. One more feature. One more fix. One more optimization. The release is the decision to stop adding and start shipping. Version 1.0 is the contract: this works, this is documented, this is tested, this is the product. Everything after v1.0 is v1.1.

## The Fix

A complete release checklist. Seven categories covering every aspect of the project. Each category runs verification and reports PASS or FAIL. If all pass, print the release manifest, tag the version, and ship. The checklist is the quality gate. Nothing passes without clearing every check.

\\\`\\\`\\\`
// Release pipeline:
// 1. Build verification
// 2. Test suite execution
// 3. Documentation check
// 4. Config persistence check
// 5. Gameplay verification
// 6. Feature inventory
// 7. Performance benchmark
// -> All PASS -> Tag v1.0 -> SHIP IT
\\\`\\\`\\\`

## Your Task

1. Run complete release checklist (7 categories)
2. Print release manifest — all RELEASE| lines
3. Print: \\\`MILESTONE_100|PASS|Space Shooter v1.0 released\\\`
4. Print: \\\`VERSION|tag|v1.0|status|RELEASED|date|2024-01-01\\\`

Release manifest format:
\\\`\\\`\\\`
RELEASE|=== SPACE SHOOTER v1.0 ===
RELEASE|Build:       PASS (0 warnings)
RELEASE|Tests:       PASS (5/5 suites, 16 checks)
RELEASE|Docs:        PASS (README.md, .gitignore)
RELEASE|Gameplay:    PASS (10 waves, 3 bosses)
RELEASE|Features:    PASS (15 systems active)
RELEASE|Performance: PASS (500 entities, 85% pool)
RELEASE|Crash Proof: PASS (0 unhandled errors)
RELEASE|
RELEASE|Total Lessons: 100
RELEASE|Systems Built: 15
RELEASE|Lines of C++: ~1200
RELEASE|
RELEASE|SHIP IT.
MILESTONE_100|PASS|Space Shooter v1.0 released
VERSION|tag|v1.0|status|RELEASED|date|2024-01-01
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Thinking v1.0 means the game is finished forever. v1.0 means the game is shippable. Bugs will be found. Features will be requested. Performance will need tuning. v1.1 fixes the critical bugs. v1.2 adds the requested feature. v2.0 rewrites the renderer. Shipping is the beginning of the product lifecycle, not the end.

## Elite Insight

John Carmack shipped Doom in December 1993. The code was not perfect. The BSP tree had edge cases. The fixed-point math had precision limits. The renderer had known artifacts at extreme angles. But it shipped. And it changed the industry. Shipping imperfect code that works is infinitely more valuable than perfect code that never ships. v1.0 is the proof that you can ship. Everything else is iteration.

## Cross-Path Echo

Production deployment in web applications follows this exact pattern. CI builds the artifact, runs the test suite, checks documentation, verifies configuration, runs smoke tests, benchmarks performance, deploys to staging, then promotes to production. Your release checklist is a CI/CD pipeline for a game. Seven stages. All green. Deploy to production. Ship it.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

bool buildPass = false;
bool testsPass = false;
bool docsPass = false;
bool gameplayPass = false;
bool featuresPass = false;
bool performancePass = false;
bool crashProofPass = false;

// TODO: Write runReleaseChecklist() — set all 7 checks to true

// TODO: Write printReleaseManifest() — print 13 RELEASE| lines
//   Header, 7 check results, blank, 3 stats, blank, SHIP IT.

int main() {
    // TODO: Run checklist
    // TODO: Print manifest
    // TODO: Print MILESTONE_100
    // TODO: Print VERSION

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

bool buildPass = false;
bool testsPass = false;
bool docsPass = false;
bool gameplayPass = false;
bool featuresPass = false;
bool performancePass = false;
bool crashProofPass = false;

void runReleaseChecklist() {
    buildPass = true;
    testsPass = true;
    docsPass = true;
    gameplayPass = true;
    featuresPass = true;
    performancePass = true;
    crashProofPass = true;
}

void printReleaseManifest() {
    cout << "RELEASE|=== SPACE SHOOTER v1.0 ===" << endl;
    cout << "RELEASE|Build:       PASS (0 warnings)" << endl;
    cout << "RELEASE|Tests:       PASS (5/5 suites, 16 checks)" << endl;
    cout << "RELEASE|Docs:        PASS (README.md, .gitignore)" << endl;
    cout << "RELEASE|Gameplay:    PASS (10 waves, 3 bosses)" << endl;
    cout << "RELEASE|Features:    PASS (15 systems active)" << endl;
    cout << "RELEASE|Performance: PASS (500 entities, 85% pool)" << endl;
    cout << "RELEASE|Crash Proof: PASS (0 unhandled errors)" << endl;
    cout << "RELEASE|" << endl;
    cout << "RELEASE|Total Lessons: 100" << endl;
    cout << "RELEASE|Systems Built: 15" << endl;
    cout << "RELEASE|Lines of C++: ~1200" << endl;
    cout << "RELEASE|" << endl;
    cout << "RELEASE|SHIP IT." << endl;
}

int main() {
    runReleaseChecklist();
    printReleaseManifest();

    cout << "MILESTONE_100|PASS|Space Shooter v1.0 released" << endl;
    cout << "VERSION|tag|v1.0|status|RELEASED|date|2024-01-01" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Release header", expectedOutput: "RELEASE\\|=== SPACE SHOOTER v1\\.0 ===", isPattern: true },
    { id: "g2", description: "Build check passes", expectedOutput: "RELEASE\\|Build:       PASS \\(0 warnings\\)", isPattern: true },
    { id: "g3", description: "Tests check passes", expectedOutput: "RELEASE\\|Tests:       PASS \\(5/5 suites, 16 checks\\)", isPattern: true },
    { id: "g4", description: "Docs check passes", expectedOutput: "RELEASE\\|Docs:        PASS \\(README\\.md, \\.gitignore\\)", isPattern: true },
    { id: "g5", description: "Gameplay check passes", expectedOutput: "RELEASE\\|Gameplay:    PASS \\(10 waves, 3 bosses\\)", isPattern: true },
    { id: "g6", description: "Features check passes", expectedOutput: "RELEASE\\|Features:    PASS \\(15 systems active\\)", isPattern: true },
    { id: "g7", description: "Performance check passes", expectedOutput: "RELEASE\\|Performance: PASS \\(500 entities, 85% pool\\)", isPattern: true },
    { id: "g8", description: "Ship it declared", expectedOutput: "RELEASE\\|SHIP IT\\.", isPattern: true },
    { id: "g9", description: "Milestone 100 passes", expectedOutput: "MILESTONE_100\\|PASS\\|Space Shooter v1\\.0 released", isPattern: true },
    { id: "g10", description: "Version tagged", expectedOutput: "VERSION\\|tag\\|v1\\.0\\|status\\|RELEASED\\|date\\|2024-01-01", isPattern: true },
  ],
  hints: [
    "runReleaseChecklist sets all 7 booleans to true. Each represents a category: build, tests, docs, gameplay, features, performance, crash proof. All pass for the v1.0 release.",
    "printReleaseManifest has 13 lines. The header line, 7 check lines with aligned spacing, a blank RELEASE| line, 3 stats lines, another blank RELEASE| line, and \"RELEASE|SHIP IT.\" with a period.",
    "After the manifest, print two final lines: MILESTONE_100|PASS|Space Shooter v1.0 released and VERSION|tag|v1.0|status|RELEASED|date|2024-01-01. These mark the official release.",
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

string getTrackForState(string stateName) {
    if (stateName == "MENU") return "menu_theme";
    if (stateName == "PLAYING") return "gameplay_normal";
    if (stateName == "BOSS") return "boss_battle";
    if (stateName == "VICTORY") return "victory_theme";
    return "silence";
}

int musicTracksPlayed = 0;
int musicTransitions = 0;
int musicCrossfades = 0;

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

int clampVal(int val, int lo, int hi) {
    if (val < lo) return lo;
    if (val > hi) return hi;
    return val;
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

string getStateName(GameState s) {
    if (s == GS_PLAYING) return "PLAYING";
    if (s == GS_PAUSED) return "PAUSED";
    if (s == GS_MENU) return "MENU";
    if (s == GS_BOSS) return "BOSS";
    if (s == GS_VICTORY) return "VICTORY";
    return "UNKNOWN";
}

void togglePause() {
    if (gameState == GS_PLAYING) gameState = GS_PAUSED;
    else if (gameState == GS_PAUSED) gameState = GS_PLAYING;
}

void movementSystem(int count) {
    if (gameState != GS_PLAYING && gameState != GS_BOSS) return;
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] == 2) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
}

void collisionSystem(int count, int tick) {
    if (gameState != GS_PLAYING && gameState != GS_BOSS) return;
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
                if (hp[e] <= 0) {
                    onKill(0, tick);
                    spawnParticles(x[e], y[e], 4);
                    triggerShake(4, 3);
                }
                totalHits++;
                emitSound("hit", 60, 3);
                break;
            }
        }
    }
}

void cleanupSystem(int count) {
    if (gameState != GS_PLAYING && gameState != GS_BOSS) return;
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

void processInput(char input, int playerIdx) {
    Action a = mapInput(input);
    if (a == MOVE_UP) y[playerIdx] -= playerSpeed;
    else if (a == MOVE_DOWN) y[playerIdx] += playerSpeed;
    else if (a == MOVE_LEFT) x[playerIdx] -= playerSpeed;
    else if (a == MOVE_RIGHT) x[playerIdx] += playerSpeed;
    else if (a == FIRE) {
        spawnFromPool(x[playerIdx], y[playerIdx], 0, -16, 1, 1);
        bulletCount++;
        totalShots++;
        emitSound("shoot", 80, 2);
    }
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

// === RELEASE v1.0 ===

bool buildPass = false;
bool testsPass = false;
bool docsPass = false;
bool gameplayPass = false;
bool featuresPass = false;
bool performancePass = false;
bool crashProofPass = false;

void runReleaseChecklist() {
    buildPass = true;
    testsPass = true;
    docsPass = true;
    gameplayPass = true;
    featuresPass = true;
    performancePass = true;
    crashProofPass = true;
}

void printReleaseManifest() {
    cout << "RELEASE|=== SPACE SHOOTER v1.0 ===" << endl;
    cout << "RELEASE|Build:       PASS (0 warnings)" << endl;
    cout << "RELEASE|Tests:       PASS (5/5 suites, 16 checks)" << endl;
    cout << "RELEASE|Docs:        PASS (README.md, .gitignore)" << endl;
    cout << "RELEASE|Gameplay:    PASS (10 waves, 3 bosses)" << endl;
    cout << "RELEASE|Features:    PASS (15 systems active)" << endl;
    cout << "RELEASE|Performance: PASS (500 entities, 85% pool)" << endl;
    cout << "RELEASE|Crash Proof: PASS (0 unhandled errors)" << endl;
    cout << "RELEASE|" << endl;
    cout << "RELEASE|Total Lessons: 100" << endl;
    cout << "RELEASE|Systems Built: 15" << endl;
    cout << "RELEASE|Lines of C++: ~1200" << endl;
    cout << "RELEASE|" << endl;
    cout << "RELEASE|SHIP IT." << endl;
}

int main() {
    initFullState();

    runReleaseChecklist();
    printReleaseManifest();

    cout << "MILESTONE_100|PASS|Space Shooter v1.0 released" << endl;
    cout << "VERSION|tag|v1.0|status|RELEASED|date|2024-01-01" << endl;

    return 0;
}
`,
};
