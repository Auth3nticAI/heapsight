import type { GameLessonVariant } from "@/types/game";

export const lesson98SpaceShooter: GameLessonVariant = {
  lessonId: "98-readme-docs",
  instructions: `# README and Docs — Documenting the Space Shooter

The game works. The build system compiles it. The tests pass. But nobody else can build it because there are no instructions. The README is the front door of the project. It tells developers what this is, how to build it, how to play it, and what it does. The .gitignore keeps the repository clean. Together they make the project professional and accessible.

## What Breaks Without This

Without a README, contributors cannot build the project. Without a .gitignore, the repository fills with binary artifacts. Pull requests include compiled executables. Diffs show binary noise. The repository grows by megabytes per commit. Clean projects have clean repositories. Documentation and ignore rules are hygiene.

## The Fix

README.md with structured sections. .gitignore with build artifacts excluded. Two files. Five minutes of work. Permanent value.

\\\`\\\`\\\`
// README structure:
// # Title
// Description
// ## Build
// ## Controls
// ## Features

// .gitignore:
// game
// *.o
// build/
\\\`\\\`\\\`

## Your Task

1. Print README content with README| prefix — title, description, build, controls, features
2. Print .gitignore content with GITIGNORE| prefix — 3 entries
3. Print: \\\`DOCS_SUMMARY|readme_lines|20|gitignore_lines|3|files|2\\\`

## Beginner Trap

**Common Mistake:** Not including blank lines between README sections. Markdown requires blank lines to separate headings from content. Without them, the heading merges with the previous paragraph. Always add a blank README| line between sections.

## Elite Insight

GitHub renders README.md as the repository landing page. It is the first thing every visitor sees. A well-structured README with clear build instructions increases contributor count by 3-5x compared to repositories without documentation. The README is marketing for developers.

## Cross-Path Echo

Package.json in Node projects serves the same purpose. Name, description, scripts, dependencies. \\\`npm start\\\` works because package.json documents the entry point. Your README is the human-readable package.json. It documents how to start, build, and use the project.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

int readmeLines = 0;
int gitignoreLines = 0;

// TODO: Write printReadme() — README| prefixed lines
//   Title, description, build, controls, 5 features

// TODO: Write printGitignore() — GITIGNORE| prefixed lines
//   game, *.o, build/

int main() {
    // TODO: Call printReadme(), printGitignore()
    // TODO: Print DOCS_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int readmeLines = 0;
int gitignoreLines = 0;

void printReadme() {
    cout << "README|# Space Shooter" << endl; readmeLines++;
    cout << "README|" << endl; readmeLines++;
    cout << "README|A terminal-based space shooter built in C++." << endl; readmeLines++;
    cout << "README|" << endl; readmeLines++;
    cout << "README|## Build" << endl; readmeLines++;
    cout << "README|make game" << endl; readmeLines++;
    cout << "README|" << endl; readmeLines++;
    cout << "README|## Controls" << endl; readmeLines++;
    cout << "README|WASD - Move | SPACE - Fire | P - Pause | Q - Quit" << endl; readmeLines++;
    cout << "README|" << endl; readmeLines++;
    cout << "README|## Features" << endl; readmeLines++;
    cout << "README|- 10 waves with 3 boss types" << endl; readmeLines++;
    cout << "README|- Score system with combo multipliers" << endl; readmeLines++;
    cout << "README|- Particle effects and screen shake" << endl; readmeLines++;
    cout << "README|- Replay system with deterministic playback" << endl; readmeLines++;
    cout << "README|- Settings persistence" << endl; readmeLines++;
}

void printGitignore() {
    cout << "GITIGNORE|game" << endl; gitignoreLines++;
    cout << "GITIGNORE|*.o" << endl; gitignoreLines++;
    cout << "GITIGNORE|build/" << endl; gitignoreLines++;
}

int main() {
    printReadme();
    printGitignore();

    cout << "DOCS_SUMMARY|readme_lines|20|gitignore_lines|3|files|2" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "README title generated", expectedOutput: "README\\|# Space Shooter", isPattern: true },
    { id: "g2", description: "Build instructions present", expectedOutput: "README\\|make game", isPattern: true },
    { id: "g3", description: "Controls documented", expectedOutput: "README\\|WASD - Move \\| SPACE - Fire \\| P - Pause \\| Q - Quit", isPattern: true },
    { id: "g4", description: "Features listed", expectedOutput: "README\\|- Replay system with deterministic playback", isPattern: true },
    { id: "g5", description: "Gitignore game binary", expectedOutput: "GITIGNORE\\|game", isPattern: true },
    { id: "g6", description: "Gitignore build dir", expectedOutput: "GITIGNORE\\|build/", isPattern: true },
    { id: "g7", description: "Docs summary correct", expectedOutput: "DOCS_SUMMARY\\|readme_lines\\|20\\|gitignore_lines\\|3\\|files\\|2", isPattern: true },
  ],
  hints: [
    "printReadme outputs lines prefixed with \"README|\". Include blank separator lines between sections (\"README|\" with nothing after the pipe). The title is \"# Space Shooter\".",
    "printGitignore outputs exactly 3 entries: the compiled binary (game), object files (*.o), and the build directory (build/). Each prefixed with \"GITIGNORE|\".",
    "DOCS_SUMMARY is a single line with hardcoded values: readme_lines=20, gitignore_lines=3, files=2. Print it after both functions complete.",
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

// === README & DOCS ===

int readmeLineCount = 0;
int gitignoreLineCount = 0;

void printReadme() {
    cout << "README|# Space Shooter" << endl; readmeLineCount++;
    cout << "README|" << endl; readmeLineCount++;
    cout << "README|A terminal-based space shooter built in C++." << endl; readmeLineCount++;
    cout << "README|" << endl; readmeLineCount++;
    cout << "README|## Build" << endl; readmeLineCount++;
    cout << "README|make game" << endl; readmeLineCount++;
    cout << "README|" << endl; readmeLineCount++;
    cout << "README|## Controls" << endl; readmeLineCount++;
    cout << "README|WASD - Move | SPACE - Fire | P - Pause | Q - Quit" << endl; readmeLineCount++;
    cout << "README|" << endl; readmeLineCount++;
    cout << "README|## Features" << endl; readmeLineCount++;
    cout << "README|- 10 waves with 3 boss types" << endl; readmeLineCount++;
    cout << "README|- Score system with combo multipliers" << endl; readmeLineCount++;
    cout << "README|- Particle effects and screen shake" << endl; readmeLineCount++;
    cout << "README|- Replay system with deterministic playback" << endl; readmeLineCount++;
    cout << "README|- Settings persistence" << endl; readmeLineCount++;
}

void printGitignore() {
    cout << "GITIGNORE|game" << endl; gitignoreLineCount++;
    cout << "GITIGNORE|*.o" << endl; gitignoreLineCount++;
    cout << "GITIGNORE|build/" << endl; gitignoreLineCount++;
}

int main() {
    initFullState();

    printReadme();
    printGitignore();

    cout << "DOCS_SUMMARY|readme_lines|20|gitignore_lines|3|files|2" << endl;

    return 0;
}
`,
};
