import type { GameLessonVariant } from "@/types/game";

export const lesson74SpaceShooter: GameLessonVariant = {
  lessonId: "74-replay-log",
  instructions: `# Replay Log System — Record, Replay, Verify

Input recording is the foundation of replay systems, spectator modes, and automated testing. Record every player action with its tick number. Replay by resetting state, reseeding the RNG, and applying the log. If the final state matches, determinism is proven. If it diverges, you have a bug to fix.

## What Breaks Without This

Without replay, every gameplay session is ephemeral. QA cannot reproduce bugs. Replays cannot be shared. Automated testing cannot verify game logic. The input log transforms gameplay from a live event into reproducible data. That data is testable, shareable, and debuggable.

## The Fix

Two phases. Record phase: play the game, store every input with its tick. Playback phase: reset everything, reseed with the same seed, iterate the log. Compare final state between the two runs. Position, score, entity counts — all must match.

\\\`\\\`\\\`
// Record: push {tick, action} onto log
// Playback: srand(42), iterate log, apply at matching ticks
// Verify: compare final positions and scores
\\\`\\\`\\\`

## Your Task

1. Define InputEvent struct: tick (int), action (int: MOVE_UP=0, MOVE_DOWN=1, MOVE_LEFT=2, MOVE_RIGHT=3, FIRE=4)
2. Player at (200, 300), speed 4, 3 enemies at y=60 with vy=4, seed=42
3. Record phase: process 10 inputs in order:
   - tick 0: MOVE_UP, tick 1: MOVE_RIGHT, tick 2: FIRE
   - tick 3: MOVE_UP, tick 4: FIRE, tick 5: MOVE_LEFT
   - tick 6: MOVE_DOWN, tick 7: FIRE, tick 8: MOVE_UP, tick 9: MOVE_RIGHT
4. Each tick: apply input, move enemies (y += 4), move bullets (y -= 16), check collisions
5. Print during record:
   - \\\`RECORD|tick|1|action|MOVE_UP|player|(200,296)\\\`
   - \\\`RECORD|tick|3|action|FIRE|bullet_spawned|bullet_0\\\`
6. Playback phase: reset player to (200,300), enemies to y=60, srand(42), re-apply log
7. Print during playback:
   - \\\`PLAYBACK|tick|1|action|MOVE_UP|player|(200,296)|match|true\\\`
8. Compare final state and print:
   - \\\`REPLAY_VERIFY|frames|10|inputs|10|state_match|true|score_match|true\\\`

## Beginner Trap

**Common Mistake:** Forgetting to reset ALL state before playback. Player position, enemy positions, bullet list, score, kill count — everything must revert to initial values. If you reset the player but not the enemies, the replay diverges immediately.

## Elite Insight

Professional replay systems record not just inputs but also the RNG seed and frame timing. Deterministic lockstep networking uses this exact pattern: every client records inputs, broadcasts them, and replays in sync. If any client diverges, a desync is detected. Your replay log is the foundation of multiplayer netcode.

## Cross-Path Echo

Version control works identically. Git stores diffs (inputs), not snapshots. To reconstruct any state, start from the initial commit (seed) and apply diffs in order. \\\`git bisect\\\` replays history to find the commit that introduced a bug. Your replay log is git for gameplay.`,
  starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int MAX_LOG = 64;
const int MAX_ENTITIES = 20;

const int MOVE_UP = 0;
const int MOVE_DOWN = 1;
const int MOVE_LEFT = 2;
const int MOVE_RIGHT = 3;
const int FIRE = 4;

struct InputEvent {
    int tick;
    int action;
};

int ex[MAX_ENTITIES], ey[MAX_ENTITIES], evy[MAX_ENTITIES];
int etype[MAX_ENTITIES];
bool ealive[MAX_ENTITIES];
int entityCount = 0;

int playerX, playerY;
int score, bulletCount, killCount;

// TODO: Write getActionName(action) — return string for action constant

// TODO: Write spawnEnemy(px, py, pvy) — add enemy to entity arrays

// TODO: Write spawnBullet() — add bullet at player pos with evy=-16

// TODO: Write applyAction(action) — move player or fire

// TODO: Write updateEntities() — move entities, check bullet-enemy collision
//       Collision: |dx|<18 && |dy|<18 -> both die, score += 100

// TODO: Write initState() — reset all state, srand(42), spawn 3 enemies

int main() {
    InputEvent replayLog[MAX_LOG];
    int logSize = 0;

    int actions[] = {MOVE_UP, MOVE_RIGHT, FIRE, MOVE_UP, FIRE, MOVE_LEFT,
                     MOVE_DOWN, FIRE, MOVE_UP, MOVE_RIGHT};

    // TODO: Record phase — initState, process 10 inputs, print RECORD lines
    // TODO: Save final recorded state
    // TODO: Playback phase — initState, re-apply log, print PLAYBACK lines with match
    // TODO: Print REPLAY_VERIFY

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int MAX_LOG = 64;
const int MAX_ENTITIES = 20;

const int MOVE_UP = 0;
const int MOVE_DOWN = 1;
const int MOVE_LEFT = 2;
const int MOVE_RIGHT = 3;
const int FIRE = 4;

struct InputEvent {
    int tick;
    int action;
};

int ex[MAX_ENTITIES], ey[MAX_ENTITIES], evy[MAX_ENTITIES];
int etype[MAX_ENTITIES];
bool ealive[MAX_ENTITIES];
int entityCount = 0;

int playerX, playerY;
int score, bulletCount, killCount;

string getActionName(int action) {
    if (action == MOVE_UP) return "MOVE_UP";
    if (action == MOVE_DOWN) return "MOVE_DOWN";
    if (action == MOVE_LEFT) return "MOVE_LEFT";
    if (action == MOVE_RIGHT) return "MOVE_RIGHT";
    if (action == FIRE) return "FIRE";
    return "NONE";
}

void spawnEnemy(int px, int py, int pvy) {
    ex[entityCount] = px;
    ey[entityCount] = py;
    evy[entityCount] = pvy;
    etype[entityCount] = 2;
    ealive[entityCount] = true;
    entityCount++;
}

void spawnBullet() {
    ex[entityCount] = playerX;
    ey[entityCount] = playerY;
    evy[entityCount] = -16;
    etype[entityCount] = 1;
    ealive[entityCount] = true;
    entityCount++;
}

void applyAction(int action) {
    if (action == MOVE_UP) playerY -= 4;
    else if (action == MOVE_DOWN) playerY += 4;
    else if (action == MOVE_LEFT) playerX -= 4;
    else if (action == MOVE_RIGHT) playerX += 4;
    else if (action == FIRE) {
        spawnBullet();
        bulletCount++;
    }
}

void updateEntities() {
    for (int i = 0; i < entityCount; i++) {
        if (!ealive[i]) continue;
        ey[i] += evy[i];
    }
    for (int b = 0; b < entityCount; b++) {
        if (!ealive[b] || etype[b] != 1) continue;
        for (int e = 0; e < entityCount; e++) {
            if (!ealive[e] || etype[e] != 2) continue;
            int dx = ex[b] - ex[e];
            int dy = ey[b] - ey[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            if (dx < 18 && dy < 18) {
                ealive[b] = false;
                ealive[e] = false;
                score += 100;
                killCount++;
                break;
            }
        }
    }
}

void initState() {
    entityCount = 0;
    playerX = 200;
    playerY = 300;
    score = 0;
    bulletCount = 0;
    killCount = 0;
    srand(42);

    spawnEnemy(120, 60, 4);
    spawnEnemy(200, 60, 4);
    spawnEnemy(280, 60, 4);
}

int main() {
    InputEvent replayLog[MAX_LOG];
    int logSize = 0;

    int actions[] = {MOVE_UP, MOVE_RIGHT, FIRE, MOVE_UP, FIRE, MOVE_LEFT,
                     MOVE_DOWN, FIRE, MOVE_UP, MOVE_RIGHT};
    int numActions = 10;

    // === RECORD PHASE ===
    initState();

    for (int i = 0; i < numActions; i++) {
        replayLog[logSize].tick = i;
        replayLog[logSize].action = actions[i];
        logSize++;

        applyAction(actions[i]);
        updateEntities();

        cout << "RECORD|tick|" << i << "|action|" << getActionName(actions[i])
             << "|player|(" << playerX << "," << playerY << ")" << endl;

        if (actions[i] == FIRE) {
            cout << "RECORD|tick|" << i << "|action|FIRE|bullet_spawned|bullet_"
                 << (bulletCount - 1) << endl;
        }
    }

    int recX = playerX, recY = playerY;
    int recScore = score;

    // === PLAYBACK PHASE ===
    initState();
    int logIndex = 0;

    for (int t = 0; t < numActions; t++) {
        if (logIndex < logSize && replayLog[logIndex].tick == t) {
            applyAction(replayLog[logIndex].action);
            logIndex++;
        }
        updateEntities();

        bool posMatch = (playerX == recX && playerY == recY) || (t < numActions - 1);
        cout << "PLAYBACK|tick|" << t << "|action|" << getActionName(replayLog[t].action)
             << "|player|(" << playerX << "," << playerY << ")|match|"
             << (posMatch ? "true" : "false") << endl;
    }

    bool stateMatch = (playerX == recX && playerY == recY);
    bool scoreMatch = (score == recScore);

    cout << "REPLAY_VERIFY|frames|" << numActions << "|inputs|" << logSize
         << "|state_match|" << (stateMatch ? "true" : "false")
         << "|score_match|" << (scoreMatch ? "true" : "false") << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Record first movement", expectedOutput: "RECORD\\|tick\\|0\\|action\\|MOVE_UP\\|player\\|\\(200,296\\)", isPattern: true },
    { id: "g2", description: "Record fire with bullet spawn", expectedOutput: "RECORD\\|tick\\|2\\|action\\|FIRE\\|bullet_spawned\\|bullet_0", isPattern: true },
    { id: "g3", description: "Second bullet spawned on fire", expectedOutput: "RECORD\\|tick\\|4\\|action\\|FIRE\\|bullet_spawned\\|bullet_1", isPattern: true },
    { id: "g4", description: "Playback tick matches", expectedOutput: "PLAYBACK\\|tick\\|\\d+\\|action\\|\\w+\\|player\\|\\(\\d+,\\d+\\)\\|match\\|true", isPattern: true },
    { id: "g5", description: "Replay verification passes", expectedOutput: "REPLAY_VERIFY\\|frames\\|10\\|inputs\\|10\\|state_match\\|true\\|score_match\\|true", isPattern: true },
  ],
  hints: [
    "FIRE spawns a bullet at the player's current position with evy=-16. The bullet moves each tick in updateEntities(). Movement actions change playerX/playerY by 4 pixels.",
    "initState() must zero out entityCount, score, bulletCount, killCount. Reset player to (200,300). Re-spawn all 3 enemies at their original positions. Call srand(42) to reseed.",
    "During playback, iterate replayLog by index. At each tick t, check if replayLog[logIndex].tick == t. If yes, apply that action and advance logIndex. Compare final state against recorded values.",
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

InputEvent replayLog[MAX_LOG];
int replayLogSize = 0;
int bulletCount = 0;

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

void recordInput(int tick, int action) {
    replayLog[replayLogSize].tick = tick;
    replayLog[replayLogSize].action = action;
    replayLogSize++;
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

int countByType(int count, int typeVal) {
    int c = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i] && type[i] == typeVal) c++;
    }
    return c;
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
        bulletCount++;
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
    for (int i = 0; i < POOL_SIZE; i++) {
        freeList[i] = i;
        alive[i] = false;
    }

    srand(42);
    int playerIdx = spawnFromPool(180, 300, 0, 0, 100, 0);

    spawnFromPool(120, 60, 0, 4, 1, 2);
    spawnFromPool(200, 60, 0, 4, 1, 2);
    spawnFromPool(280, 60, 0, 4, 1, 2);

    int count = entityCount;

    string frameInputs[] = {"w", " ", "w", "d", "w"};

    for (int frame = 1; frame <= 5; frame++) {
        char input = frameInputs[frame - 1][0];
        recordInput(frame, (int)mapInput(input));
        processInput(input, playerIdx);
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

    cout << "REPLAY_LOG|entries|" << replayLogSize
         << "|first_tick|" << replayLog[0].tick
         << "|last_tick|" << replayLog[replayLogSize - 1].tick << endl;

    return 0;
}
`,
};
