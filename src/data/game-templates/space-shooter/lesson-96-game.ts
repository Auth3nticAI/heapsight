import type { GameLessonVariant } from "@/types/game";

export const lesson96SpaceShooter: GameLessonVariant = {
  lessonId: "96-build-system",
  instructions: `# Build System — Makefile and CMake for Space Shooter

The game is built. The code compiles. But there is no build system. Every compilation is a manual command. Miss a flag and warnings disappear. Miss a file and the linker fails. A Makefile automates the build. CMake generates the Makefile for any platform. Together they ensure the build is reproducible, correct, and fast.

## What Breaks Without This

Without a build system, the build is whatever the developer remembers to type. Different developers use different flags. One builds with optimizations, another without. One includes debug symbols, another strips them. The binary behaves differently on each machine. The bug exists only in the release build because nobody tested with \\\`-O2\\\`. Reproducibility requires automation.

## The Fix

A Makefile for direct builds. CMakeLists.txt for cross-platform generation. Both declare the same thing: source files, compiler, flags, output. The build system is the single source of truth for how the project compiles.

\\\`\\\`\\\`
# Makefile: explicit control
# CMake: portable generation
# Both: reproducible builds
\\\`\\\`\\\`

## Your Task

1. Print Makefile content with BUILD| prefix (6 lines)
2. Print CMakeLists.txt content with CMAKE| prefix (3 lines)
3. Simulate compile: \\\`COMPILE|src/main.cpp|OK|warnings|0|errors|0\\\`
4. Simulate link: \\\`LINK|game|OK|size|48KB\\\`
5. Print: \\\`BUILD_SUMMARY|files|1|compiled|1|linked|1|warnings|0|errors|0|output|game\\\`

## Beginner Trap

**Common Mistake:** Forgetting to set \\\`-std=c++17\\\` in CXXFLAGS. Without the standard flag, the compiler defaults to an older standard. Structured bindings, if-init, and constexpr-if all fail. The build system must enforce the standard. Every build. Every machine.

## Elite Insight

Professional projects use CMake presets. A CMakePresets.json file defines configurations: debug, release, sanitizer, profile. Each preset specifies flags, build directory, and generator. \\\`cmake --preset=release\\\` builds the optimized binary. \\\`cmake --preset=debug\\\` builds with symbols. One command, correct flags, every time.

## Cross-Path Echo

Docker builds follow the same pattern. A Dockerfile declares the base image, copies source, runs build commands, and produces a binary. The Dockerfile is a Makefile for containers. Reproducible builds on any machine. Your Makefile is a Dockerfile for compilation.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

// TODO: Write printMakefile() — 6 BUILD| lines
//   # Makefile for Space Shooter, CXX, CXXFLAGS, SRC, target, recipe

// TODO: Write printCMake() — 3 CMAKE| lines
//   cmake_minimum_required, project, add_executable

// TODO: Write simulateBuild() — compile, link, summary

int main() {
    // TODO: Call all three functions

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

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

int main() {
    printMakefile();
    printCMake();
    simulateBuild();

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Makefile header generated", expectedOutput: "BUILD\\|# Makefile for Space Shooter", isPattern: true },
    { id: "g2", description: "C++17 flags in Makefile", expectedOutput: "BUILD\\|CXXFLAGS = -std=c\\+\\+17 -Wall -Wextra", isPattern: true },
    { id: "g3", description: "CMake project declared", expectedOutput: "CMAKE\\|project\\(SpaceShooter\\)", isPattern: true },
    { id: "g4", description: "CMake executable target", expectedOutput: "CMAKE\\|add_executable\\(game src/main\\.cpp\\)", isPattern: true },
    { id: "g5", description: "Compile succeeds", expectedOutput: "COMPILE\\|src/main\\.cpp\\|OK\\|warnings\\|0\\|errors\\|0", isPattern: true },
    { id: "g6", description: "Link succeeds", expectedOutput: "LINK\\|game\\|OK\\|size\\|48KB", isPattern: true },
    { id: "g7", description: "Build summary correct", expectedOutput: "BUILD_SUMMARY\\|files\\|1\\|compiled\\|1\\|linked\\|1\\|warnings\\|0\\|errors\\|0\\|output\\|game", isPattern: true },
  ],
  hints: [
    "printMakefile outputs 6 lines, each prefixed with \"BUILD|\". The comment line, CXX variable, CXXFLAGS, SRC, target rule, and recipe. The recipe line has a \\t for the tab character.",
    "printCMake outputs 3 lines prefixed with \"CMAKE|\". These are the three essential CMake commands: cmake_minimum_required, project, and add_executable.",
    "simulateBuild prints three lines: COMPILE for the source, LINK for the binary, BUILD_SUMMARY with all counts at 1 and warnings/errors at 0. Output name is \"game\".",
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

int main() {
    initFullState();

    printMakefile();
    printCMake();
    simulateBuild();

    return 0;
}
`,
};
