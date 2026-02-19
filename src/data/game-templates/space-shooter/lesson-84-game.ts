import type { GameLessonVariant } from "@/types/game";

export const lesson84SpaceShooter: GameLessonVariant = {
  lessonId: "84-pause-menu",
  instructions: `# Pause Menu — Freeze the Simulation, Keep the Frame

Pause separates simulation from presentation. The render system keeps drawing. The HUD keeps displaying. But the simulation systems — movement, collision, spawning, scoring — all stop. The player sees a frozen game world with a menu overlay. Press P to resume. Every system resumes exactly where it left off. No lost frames. No skipped ticks. No desync.

## What Breaks Without This

Without state gating, pausing requires stopping the entire program. That kills the render loop. The screen goes black or freezes at the OS level. The player thinks the game crashed. Proper pause keeps the render loop alive, shows the overlay, and blocks only the simulation systems. The game is visually responsive even while paused.

## The Fix

Gate every simulation system behind a state check. Movement, collision, spawn, score — all skip their logic when state is PAUSED. The render system and overlay system always run. The toggle is a single key press that flips the state enum. Clean. Predictable. No edge cases.

\\\`\\\`\\\`
// Per frame:
if (input == 'p') togglePause();
if (state == PLAYING) {
    movementSystem();
    collisionSystem();
    spawnSystem();
}
renderSystem();
if (state == PAUSED) showPauseOverlay();
\\\`\\\`\\\`

## Your Task

1. Define GameState enum: PLAYING, PAUSED
2. Track state, frame counter, entities (12 total)
3. Simulate 7 frames:
   - Frames 1-3: PLAYING, all 12 entities updated
   - Frame 4: 'p' pressed, toggle to PAUSED
   - Frames 4-5: PAUSED, 0 entities updated, show overlay
   - Frame 6: 'p' pressed, toggle to PLAYING
   - Frames 6-7: PLAYING, all 12 entities updated
4. Print per frame: \\\`STATE|frame|<n>|<state>|entities_updated|<count>\\\`
5. While PAUSED, print overlay:
   \\\`PAUSE_MENU|=== PAUSED ===\\\`
   \\\`PAUSE_MENU|[P] Resume\\\`
   \\\`PAUSE_MENU|[H] Help\\\`
   \\\`PAUSE_MENU|Score: 500\\\`
6. Print: \\\`PAUSE_SUMMARY|total_paused_frames|2|total_playing_frames|5\\\`

## Beginner Trap

**Common Mistake:** Updating the frame counter only during PLAYING. The frame counter must advance every tick regardless of state. Paused frames are still frames — they just do not update the simulation. If you skip the frame counter during pause, your replay log desyncs because frame numbers no longer match tick numbers.

## Elite Insight

Commercial engines implement pause at the time scale level. Set the simulation delta time to zero. Every system that multiplies by dt automatically stops. Movement = velocity * 0 = 0. Gravity = 9.8 * 0 = 0. No if-checks needed. The math handles it. Your enum approach is the explicit version of the same idea.

## Cross-Path Echo

Database transactions use the same principle. BEGIN TRANSACTION pauses writes from other connections. The database is "paused" for external writes but continues processing the active transaction. COMMIT resumes normal operation. Your game pause is a transaction lock on the simulation state.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

enum GameState { PLAYING, PAUSED };

GameState state = PLAYING;
int score = 500;

// TODO: Write getStateName(state) — return "PLAYING" or "PAUSED"

// TODO: Write showPauseOverlay(score) — print 4 PAUSE_MENU lines

// TODO: Write updateSystems(entityCount) — return entities updated
//       PLAYING: return entityCount. PAUSED: return 0

int main() {
    int totalEntities = 12;
    int pausedFrames = 0;
    int playingFrames = 0;

    // Frame inputs: 'p' at frame 4, 'p' at frame 6, nothing otherwise
    // TODO: Simulate 7 frames
    //   Toggle state on 'p' input
    //   Update systems, print STATE line
    //   If PAUSED, show overlay
    //   Track paused/playing counts

    // TODO: Print PAUSE_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

enum GameState { PLAYING, PAUSED };

GameState state = PLAYING;
int score = 500;

string getStateName(GameState s) {
    if (s == PLAYING) return "PLAYING";
    return "PAUSED";
}

void showPauseOverlay(int sc) {
    cout << "PAUSE_MENU|=== PAUSED ===" << endl;
    cout << "PAUSE_MENU|[P] Resume" << endl;
    cout << "PAUSE_MENU|[H] Help" << endl;
    cout << "PAUSE_MENU|Score: " << sc << endl;
}

int updateSystems(int entityCount) {
    if (state == PLAYING) return entityCount;
    return 0;
}

int main() {
    int totalEntities = 12;
    int pausedFrames = 0;
    int playingFrames = 0;

    for (int frame = 1; frame <= 7; frame++) {
        if (frame == 4 || frame == 6) {
            if (state == PLAYING) state = PAUSED;
            else state = PLAYING;
        }

        int updated = updateSystems(totalEntities);

        cout << "STATE|frame|" << frame << "|" << getStateName(state)
             << "|entities_updated|" << updated << endl;

        if (state == PAUSED) {
            showPauseOverlay(score);
        }

        if (state == PAUSED) pausedFrames++;
        else playingFrames++;
    }

    cout << "PAUSE_SUMMARY|total_paused_frames|" << pausedFrames
         << "|total_playing_frames|" << playingFrames << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Frame 1 PLAYING with updates", expectedOutput: "STATE\\|frame\\|1\\|PLAYING\\|entities_updated\\|12", isPattern: true },
    { id: "g2", description: "Frame 3 still PLAYING", expectedOutput: "STATE\\|frame\\|3\\|PLAYING\\|entities_updated\\|12", isPattern: true },
    { id: "g3", description: "Frame 4 toggled to PAUSED", expectedOutput: "STATE\\|frame\\|4\\|PAUSED\\|entities_updated\\|0", isPattern: true },
    { id: "g4", description: "Pause overlay displayed", expectedOutput: "PAUSE_MENU\\|=== PAUSED ===", isPattern: true },
    { id: "g5", description: "Pause overlay shows score", expectedOutput: "PAUSE_MENU\\|Score: 500", isPattern: true },
    { id: "g6", description: "Frame 6 unpaused to PLAYING", expectedOutput: "STATE\\|frame\\|6\\|PLAYING\\|entities_updated\\|12", isPattern: true },
    { id: "g7", description: "Pause summary totals", expectedOutput: "PAUSE_SUMMARY\\|total_paused_frames\\|2\\|total_playing_frames\\|5", isPattern: true },
  ],
  hints: [
    "Toggle state only at frames 4 and 6. Check current state — if PLAYING, switch to PAUSED. If PAUSED, switch to PLAYING. This happens before systems update for that frame.",
    "updateSystems returns totalEntities (12) when PLAYING, zero when PAUSED. Print the STATE line with the return value. Then check if PAUSED to show the four-line overlay.",
    "Count frames per state after each loop iteration. PAUSED frames: 4 and 5 (total 2). PLAYING frames: 1, 2, 3, 6, 7 (total 5). Print the summary after the loop ends.",
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
enum GameState { GS_PLAYING, GS_PAUSED };

int aiPattern[POOL_SIZE];
GameState gameState = GS_PLAYING;

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

string getStateName(GameState s) {
    if (s == GS_PLAYING) return "PLAYING";
    return "PAUSED";
}

void togglePause() {
    if (gameState == GS_PLAYING) gameState = GS_PAUSED;
    else gameState = GS_PLAYING;
}

void showPauseOverlay() {
    cout << "PAUSE_MENU|=== PAUSED ===" << endl;
    cout << "PAUSE_MENU|[P] Resume" << endl;
    cout << "PAUSE_MENU|[H] Help" << endl;
    cout << "PAUSE_MENU|Score: " << score << endl;
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

FrameState captureFrameState(int count) {
    FrameState fs;
    fs.playerX = x[0];
    fs.playerY = y[0];
    fs.score = score;
    fs.enemyCount = 0;
    fs.bulletCount = 0;
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (type[i] == 2) fs.enemyCount++;
        if (type[i] == 1) fs.bulletCount++;
    }
    return fs;
}

void movementSystem(int count) {
    if (gameState != GS_PLAYING) return;
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] == 2) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
}

void boundsSystem(int count) {
    if (gameState != GS_PLAYING) return;
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (type[i] == 1 && y[i] < -50) alive[i] = false;
    }
}

void collisionSystem(int count) {
    if (gameState != GS_PLAYING) return;
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
    if (gameState != GS_PLAYING) return;
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

void initFullState() {
    for (int i = 0; i < POOL_SIZE; i++) {
        freeList[i] = i;
        alive[i] = false;
    }
    freeCount = POOL_SIZE;
    entityCount = 0;
    score = 0;
    kills = 0;
    wave = 1;
    bulletCount = 0;
    replayLogSize = 0;
    playerSpeed = 4;
    playerDamage = 10;
    gameState = GS_PLAYING;
    srand(42);
}

int main() {
    initFullState();

    int playerIdx = spawnFromPool(180, 300, 0, 0, 100, 0);

    spawnFromPool(120, 60, 0, 4, 1, 2);
    spawnFromPool(200, 60, 0, 4, 1, 2);
    spawnFromPool(280, 60, 0, 4, 1, 2);

    int count = entityCount;
    score = 500;
    int pausedFrames = 0;
    int playingFrames = 0;

    char frameInputs[] = {0, 0, 0, 'p', 0, 'p', 0};

    for (int frame = 1; frame <= 7; frame++) {
        char input = frameInputs[frame - 1];
        if (input == 'p') togglePause();

        if (gameState == GS_PLAYING) {
            movementSystem(count);
            collisionSystem(count);
            cleanupSystem(count);
            boundsSystem(count);
        }

        int updated = (gameState == GS_PLAYING) ? countAlive(count) : 0;

        cout << "STATE|frame|" << frame << "|" << getStateName(gameState)
             << "|entities_updated|" << updated << endl;

        if (gameState == GS_PAUSED) {
            showPauseOverlay();
            pausedFrames++;
        } else {
            playingFrames++;
        }
    }

    cout << "PAUSE_SUMMARY|total_paused_frames|" << pausedFrames
         << "|total_playing_frames|" << playingFrames << endl;

    return 0;
}
`,
};
