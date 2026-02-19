import type { GameLessonVariant } from "@/types/game";

export const lesson71SpaceShooter: GameLessonVariant = {
  lessonId: "71-background-loading",
  instructions: `# Background Loading — Assets Before Action

Your space shooter needs wave data, enemy definitions, and sprite maps before the first frame renders. Load them wrong and the game crashes on null data. Load them with a blocking call and the window freezes. Chunked loading processes one tick at a time, reports progress per task, and transitions cleanly from LOADING to READY.

## What Breaks Without This

Without chunked loading, the game stalls on startup. The player sees a frozen window. The OS threatens to kill the process. Even with a fast machine, there is no feedback. The player does not know if the game is loading or crashed. Chunked loading with progress tracking solves both: the thread stays alive and the player sees exactly what is happening.

## The Fix

Define load tasks with names and tick costs. Process one tick per iteration. Track per-task progress. Print status each tick. When a task finishes, announce it. When all tasks finish, transition state.

\\\`\\\`\\\`
while (state == LOADING) {
    processTick();
    reportProgress();
    if (taskDone()) nextTask();
    if (allDone()) state = READY;
}
\\\`\\\`\\\`

## Your Task

1. Define 3 load tasks for the space shooter:
   - \\\`"wave_data"\\\` — 3 ticks
   - \\\`"enemy_defs"\\\` — 2 ticks
   - \\\`"sprites"\\\` — 4 ticks
2. Total ticks = 9. Process one tick per iteration
3. Each tick, print: \\\`LOADING|tick|<t>|task|<name>|progress|<pct>%\\\`
   - Percentage = (task progress * 100) / task totalTicks
4. When a task completes: \\\`LOAD_COMPLETE|task|<name>|tick|<t>\\\`
5. After all tasks: \\\`ALL_LOADED|tick|9|tasks|3|total_ticks|9\\\`
6. Print: \\\`STATE|LOADING->READY\\\`

## Beginner Trap

**Common Mistake:** Using global tick count for per-task percentage. Tick 5 does not mean 55% of a 9-tick load. It means enemy_defs is at 100% (2/2). Always compute percentage from the task's own progress and totalTicks.

## Elite Insight

AAA engines load assets with dependency graphs. Sprite maps depend on texture data. Enemy definitions depend on sprite maps. The load scheduler resolves dependencies and loads in topological order. Your sequential approach is a degenerate case of dependency-ordered loading where each task depends on the previous one.

## Cross-Path Echo

Docker image layers load the same way. Each layer is a task with a size. Progress tracks bytes downloaded per layer. When all layers complete, the container transitions from "pulling" to "ready." Your loading system is a container image pull for game assets.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct LoadTask {
    string name;
    int totalTicks;
    int progress;
};

int main() {
    // TODO: Define 3 load tasks: wave_data(3), enemy_defs(2), sprites(4)
    LoadTask tasks[3];

    // TODO: Initialize tasks

    int totalTicks = 9;
    int currentTick = 0;
    int currentTask = 0;
    string state = "LOADING";

    // TODO: Process loading loop
    //   While state is LOADING:
    //     Advance tick, increment task progress
    //     Calculate per-task percentage
    //     Print LOADING line
    //     If task done: print LOAD_COMPLETE, advance to next task
    //     If all done: print ALL_LOADED, set state to READY

    // TODO: Print STATE transition

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct LoadTask {
    string name;
    int totalTicks;
    int progress;
};

int main() {
    LoadTask tasks[3];
    tasks[0] = {"wave_data", 3, 0};
    tasks[1] = {"enemy_defs", 2, 0};
    tasks[2] = {"sprites", 4, 0};

    int totalTicks = 9;
    int currentTick = 0;
    int currentTask = 0;
    string state = "LOADING";

    while (state == "LOADING") {
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

            if (currentTask >= 3) {
                cout << "ALL_LOADED|tick|" << currentTick
                     << "|tasks|3|total_ticks|" << totalTicks << endl;
                state = "READY";
            }
        }
    }

    cout << "STATE|LOADING->READY" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "First tick loads wave_data at 33%", expectedOutput: "LOADING\\|tick\\|1\\|task\\|wave_data\\|progress\\|33%", isPattern: true },
    { id: "g2", description: "wave_data completes at tick 3", expectedOutput: "LOAD_COMPLETE\\|task\\|wave_data\\|tick\\|3", isPattern: true },
    { id: "g3", description: "enemy_defs starts at tick 4", expectedOutput: "LOADING\\|tick\\|4\\|task\\|enemy_defs\\|progress\\|50%", isPattern: true },
    { id: "g4", description: "enemy_defs completes at tick 5", expectedOutput: "LOAD_COMPLETE\\|task\\|enemy_defs\\|tick\\|5", isPattern: true },
    { id: "g5", description: "sprites progress at tick 6", expectedOutput: "LOADING\\|tick\\|6\\|task\\|sprites\\|progress\\|25%", isPattern: true },
    { id: "g6", description: "All loaded summary", expectedOutput: "ALL_LOADED\\|tick\\|9\\|tasks\\|3\\|total_ticks\\|9", isPattern: true },
    { id: "g7", description: "State transition to READY", expectedOutput: "STATE\\|LOADING->READY", isPattern: true },
  ],
  hints: [
    "Initialize tasks: tasks[0] = {\"wave_data\", 3, 0}. Each task starts with progress 0. The totalTicks field defines how many ticks this task needs to complete.",
    "Per-task percentage uses integer division: (tasks[currentTask].progress * 100) / tasks[currentTask].totalTicks. For wave_data tick 1: (1*100)/3 = 33.",
    "After printing LOAD_COMPLETE, increment currentTask. When currentTask reaches 3, print ALL_LOADED and set state to READY. The STATE line prints after the loop.",
  ],
  accumulatedCode: `#include <iostream>
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

double enemyPhase[10];
int enemyPhaseCount = 0;

enum Action { NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE };
enum AIPattern { AI_NONE, AI_LINEAR, AI_SINE, AI_TRACK };

int aiPattern[POOL_SIZE];

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

struct LoadTask {
    string name;
    int totalTicks;
    int progress;
};

void parsePowerUp(string s, PowerUpDef &def) {
    int c1 = s.find(',');
    int c2 = s.find(',', c1 + 1);
    def.ptype = s.substr(0, c1);
    def.duration = stoi(s.substr(c1 + 1, c2 - c1 - 1));
    def.magnitude = stoi(s.substr(c2 + 1));
}

void applyBuff(PowerUpDef &def) {
    activeBuffs[numActiveBuffs].btype = def.ptype;
    activeBuffs[numActiveBuffs].remaining = def.duration;
    activeBuffs[numActiveBuffs].magnitude = def.magnitude;
    activeBuffs[numActiveBuffs].active = true;
    numActiveBuffs++;

    if (def.ptype == "speed_boost") playerSpeed *= def.magnitude;
    else if (def.ptype == "damage_up") playerDamage += def.magnitude;
}

void tickBuffs() {
    for (int i = 0; i < numActiveBuffs; i++) {
        if (!activeBuffs[i].active) continue;
        activeBuffs[i].remaining--;
        if (activeBuffs[i].remaining <= 0) {
            activeBuffs[i].active = false;
            if (activeBuffs[i].btype == "speed_boost") playerSpeed /= activeBuffs[i].magnitude;
            else if (activeBuffs[i].btype == "damage_up") playerDamage -= activeBuffs[i].magnitude;
        }
    }
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

void boundsSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (type[i] == 1 && y[i] < 0) alive[i] = false;
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

int main() {
    // Loading phase
    LoadTask loadTasks[3];
    loadTasks[0] = {"wave_data", 3, 0};
    loadTasks[1] = {"enemy_defs", 2, 0};
    loadTasks[2] = {"sprites", 4, 0};
    runLoadingPhase(loadTasks, 3);

    // Init pool
    for (int i = 0; i < POOL_SIZE; i++) {
        freeList[i] = i;
        alive[i] = false;
    }

    int playerIdx = spawnFromPool(180, 300, 0, 0, 100, 0);
    spawnFromPool(100, 40, 0, 4, 1, 2);
    spawnFromPool(180, 40, 0, 4, 1, 2);
    spawnFromPool(260, 40, 0, 4, 1, 2);
    int count = entityCount;

    string frameInputs[] = {"w", " ", "w", "d", "w"};

    for (int frame = 1; frame <= 5; frame++) {
        processInput(frameInputs[frame - 1][0], playerIdx);
        count = (entityCount > count) ? entityCount : count;
        movementSystem(count);
        collisionSystem(count);
        cleanupSystem(count);

        int active = countAlive(count);
        cout << "FRAME|" << frame << "|entities|" << active
             << "|score|" << score << "|lives|" << lives
             << "|wave|" << wave << endl;
        debugSystem(frame, count);
    }

    return 0;
}
`,
};
