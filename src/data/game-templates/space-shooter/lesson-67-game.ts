import type { GameLessonVariant } from "@/types/game";

export const lesson67SpaceShooter: GameLessonVariant = {
  lessonId: "67-score-system",
  instructions: `# Score System — Every Kill Tells a Story

Points are feedback. Combos are rhythm. Without a score system, the player mashes fire and watches enemies vanish with no differentiation. A basic enemy and a boss feel the same. A lucky shot and a skilled chain feel the same. Score breaks that flatness. Base points create hierarchy. Combo multipliers create flow state.

## What Breaks Without This

Without scoring, the game has no memory. Kill 50 enemies and there is nothing to show for it. No high score. No personal best. No way to tell if this run was better than the last. Score is the game's long-term memory. Combos are the short-term memory — they remember what you did 3 ticks ago and reward you for consistency.

## The Fix

Define base points per enemy type. Track the tick of the last kill. If the current kill is within 3 ticks, increment the combo multiplier (cap at 5x). Otherwise reset to 1x. Multiply base points by combo for the final score. Print every kill event with full breakdown.

\\\`\\\`\\\`
// Kill sequence determines score
// basic(100) -> fast(150) -> basic(100) -> [gap] -> tank(300)
// 1x=100, 2x=300, 3x=300, reset 1x=300 = 1000 total
\\\`\\\`\\\`

## Your Task

1. Base points: basic=100, fast=150, tank=300, boss=1000
2. Combo: kills within 3 ticks increment multiplier (max 5x). Gap > 3 resets to 1x
3. Simulate kill sequence:
   - Tick 1: basic (combo 1x, points 100, total 100)
   - Tick 3: fast (combo 2x, points 300, total 400)
   - Tick 5: basic (combo 3x, points 300, total 700)
   - Tick 10: tank (combo reset 1x, points 300, total 1000)
4. Print per kill: \\\`SCORE|tick|<t>|kill|<type>|base|<b>|combo|<c>x|points|<p>|total|<total>\\\`
5. Print: \\\`SCORE_SUMMARY|kills|4|max_combo|3x|total|1000\\\`

## Beginner Trap

**Common Mistake:** Resetting combo to 0 instead of 1. The minimum combo is always 1x — every kill is worth at least its base points. A combo of 0 means zero points, which breaks the entire system.

## Elite Insight

Arcade games like Galaga and Space Invaders used score as the only progression. No levels, no upgrades — just a number that went up. The high score table was the social contract. Your combo system adds depth to that contract: it is not just how many you killed, but how fast you killed them. The score encodes play style.

## Cross-Path Echo

Network packet acknowledgment uses combo-like batching. TCP delayed ACK waits briefly before sending acknowledgment, hoping to batch multiple packets. If the window expires, it sends immediately. Your combo timer is a delayed ACK for kill events — batch them for a multiplier, or timeout and flush at 1x.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int ehp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int score = 0;
int combo = 1;
int maxCombo = 1;
int lastKillTick = -99;
int killCount = 0;

// Enemy types: 0=basic, 1=fast, 2=tank, 3=boss
int basePoints[] = {100, 150, 300, 1000};
string enemyNames[] = {"basic", "fast", "tank", "boss"};

// TODO: Write onKill(enemyType, tick)
//   Check combo window (3 ticks), update combo, calc points
//   Print SCORE line

// TODO: Write simulateKillSequence()
//   Kill basic at tick 1, fast at tick 3, basic at tick 5, tank at tick 10

int main() {
    // TODO: Run kill sequence simulation

    // TODO: Print SCORE_SUMMARY with kills, max_combo, total

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int ehp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int score = 0;
int combo = 1;
int maxCombo = 1;
int lastKillTick = -99;
int killCount = 0;

// Enemy types: 0=basic, 1=fast, 2=tank, 3=boss
int basePoints[] = {100, 150, 300, 1000};
string enemyNames[] = {"basic", "fast", "tank", "boss"};

void onKill(int enemyType, int tick) {
    if (tick - lastKillTick <= 3) {
        combo++;
        if (combo > 5) combo = 5;
    } else {
        combo = 1;
    }

    int points = basePoints[enemyType] * combo;
    score += points;
    lastKillTick = tick;
    killCount++;

    if (combo > maxCombo) maxCombo = combo;

    cout << "SCORE|tick|" << tick << "|kill|" << enemyNames[enemyType]
         << "|base|" << basePoints[enemyType] << "|combo|" << combo
         << "x|points|" << points << "|total|" << score << endl;
}

int main() {
    onKill(0, 1);   // basic at tick 1
    onKill(1, 3);   // fast at tick 3
    onKill(0, 5);   // basic at tick 5
    onKill(2, 10);  // tank at tick 10

    cout << "SCORE_SUMMARY|kills|" << killCount
         << "|max_combo|" << maxCombo << "x|total|" << score << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "First kill scores 100 at 1x combo", expectedOutput: "SCORE\\|tick\\|1\\|kill\\|basic\\|base\\|100\\|combo\\|1x\\|points\\|100\\|total\\|100", isPattern: true },
    { id: "g2", description: "Second kill combos to 2x", expectedOutput: "SCORE\\|tick\\|3\\|kill\\|fast\\|base\\|150\\|combo\\|2x\\|points\\|300\\|total\\|400", isPattern: true },
    { id: "g3", description: "Third kill combos to 3x", expectedOutput: "SCORE\\|tick\\|5\\|kill\\|basic\\|base\\|100\\|combo\\|3x\\|points\\|300\\|total\\|700", isPattern: true },
    { id: "g4", description: "Tank kill resets combo", expectedOutput: "SCORE\\|tick\\|10\\|kill\\|tank\\|base\\|300\\|combo\\|1x\\|points\\|300\\|total\\|1000", isPattern: true },
    { id: "g5", description: "Score summary correct", expectedOutput: "SCORE_SUMMARY\\|kills\\|4\\|max_combo\\|3x\\|total\\|1000", isPattern: true },
  ],
  hints: [
    "The combo window is 3 ticks. Tick 1 to tick 3 = gap of 2 (<= 3), so combo goes to 2. Tick 3 to tick 5 = gap of 2 (<= 3), so combo goes to 3. Tick 5 to tick 10 = gap of 5 (> 3), so combo resets to 1.",
    "Points = base * combo. Fast at 2x = 150*2 = 300. Basic at 3x = 100*3 = 300. Tank at 1x = 300*1 = 300. Running total: 100, 400, 700, 1000.",
    "maxCombo tracks the highest combo reached. It never decreases. After the sequence, maxCombo = 3 even though combo reset to 1 for the tank kill.",
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
int combo = 1;
int maxCombo = 1;
int lastKillTick = -99;

// Score system
int basePoints[] = {100, 150, 300, 1000}; // basic, fast, tank, boss
string enemyNames[] = {"basic", "fast", "tank", "boss"};

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

void onKill(int enemyType, int tick) {
    if (tick - lastKillTick <= 3) {
        combo++;
        if (combo > 5) combo = 5;
    } else {
        combo = 1;
    }
    int points = basePoints[enemyType] * combo;
    score += points;
    lastKillTick = tick;
    kills++;
    if (combo > maxCombo) maxCombo = combo;
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

void targetSystem(int count, int playerIdx) {
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] != 2) continue;
        if (aiPattern[i] != AI_TRACK) continue;
        int dx = x[playerIdx] - x[i];
        if (dx > 0) x[i] += 2;
        else if (dx < 0) x[i] -= 2;
        y[i] += 4;
    }
}

void boundsSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (type[i] == 1 && y[i] < 0) alive[i] = false;
    }
}

void collisionSystem(int count, int tick) {
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
                    // Determine enemy subtype for scoring
                    onKill(0, tick); // default basic
                }
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
    for (int i = 0; i < POOL_SIZE; i++) {
        freeList[i] = i;
        alive[i] = false;
    }

    int playerIdx = spawnFromPool(180, 300, 0, 0, 100, 0);

    spawnFromPool(100, 40, 0, 4, 1, 2);
    spawnFromPool(180, 40, 0, 4, 1, 2);
    spawnFromPool(260, 40, 0, 4, 1, 2);
    int count = entityCount;

    // Score demo
    onKill(0, 1);
    cout << "SCORE|tick|1|kill|basic|base|100|combo|" << combo
         << "x|points|" << 100 * combo << "|total|" << score << endl;

    onKill(1, 3);
    cout << "SCORE|tick|3|kill|fast|base|150|combo|" << combo
         << "x|points|" << 150 * combo << "|total|" << score << endl;

    onKill(0, 5);
    cout << "SCORE|tick|5|kill|basic|base|100|combo|" << combo
         << "x|points|" << 100 * combo << "|total|" << score << endl;

    onKill(2, 10);
    cout << "SCORE|tick|10|kill|tank|base|300|combo|" << combo
         << "x|points|" << 300 * combo << "|total|" << score << endl;

    cout << "SCORE_SUMMARY|kills|" << kills
         << "|max_combo|" << maxCombo << "x|total|" << score << endl;

    return 0;
}
`,
};
