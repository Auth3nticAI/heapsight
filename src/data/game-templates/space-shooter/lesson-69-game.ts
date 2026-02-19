import type { GameLessonVariant } from "@/types/game";

export const lesson69SpaceShooter: GameLessonVariant = {
  lessonId: "69-level-complete",
  instructions: `# Level Complete — The Payoff

The win condition is the contract between the game and the player. Clear all waves, defeat all enemies, and the game rewards you with a victory screen. Stats tell the story of how you played. Rating gives a target for the next run. Without this, the player clears the last enemy and stares at an empty screen. Level complete transforms that anticlimax into a moment of triumph.

## What Breaks Without This

Without level complete detection, the game keeps running after all enemies are dead. The player drifts through empty space. Without the victory screen, there is no closure. Without stats, no feedback. Without rating, no replayability. Each missing piece erodes the player's motivation to play again.

## The Fix

Every frame after cleanup, count active enemies. If all waves are done and active enemies equals zero, trigger level complete. Freeze the game loop. Compute stats from accumulated data. Display the formatted victory screen with rating.

\\\`\\\`\\\`
// Check after cleanup, every frame:
// waveNum > maxWaves && countEnemies() == 0
// -> freeze -> compute stats -> display victory -> rating
\\\`\\\`\\\`

## Your Task

1. Win condition: waveNum > maxWaves AND activeEnemies == 0
2. Simulate 3 waves, enemies killed each wave
3. Print: \\\`WAVE_STATUS|wave|<w>|enemies_alive|<n>|total_waves|3\\\`
4. On completion: \\\`LEVEL_COMPLETE|wave|3|tick|45\\\`
5. Victory screen with stats: Score, Time, Kills, Accuracy, Combo Max, Rating
6. Rating: S (>5000), A (>2000), B (>1000), C (else)

## Beginner Trap

**Common Mistake:** Checking level complete inside the spawn system. The spawn system adds enemies. If you check the win condition there, new enemies just spawned and the count is never zero during that phase. Check after cleanup — that is when the count reflects the true state.

## Elite Insight

Speedrunners optimize for the level-complete trigger frame. In many games, the trigger has a specific check order and timing. Understanding when the win condition evaluates lets you minimize time. Your checkLevelComplete runs after cleanup — that means the frame an enemy dies is the frame the level can complete. No delay. Frame-perfect wins are possible by design.

## Cross-Path Echo

Deployment pipelines check completion the same way. All stages must pass (waves cleared) AND no errors remain (enemies alive). The deployment summary shows: duration, tests passed, coverage, build size. Green deploy is your victory screen. The health dashboard is your stats display. The SLA grade is your letter rating.`,
  starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 30;
int x[POOL_SIZE], y[POOL_SIZE];
int hp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int waveNum = 1;
int maxWaves = 3;
int score = 2500;
int kills = 12;
int shots = 16;
int maxCombo = 4;

// TODO: Write checkLevelComplete(waveNum, maxWaves, activeEnemies)

// TODO: Write getRating(score)
//   S: >5000, A: >2000, B: >1000, C: else

// TODO: Write showVictoryScreen(score, ticks, kills, shots, maxCombo)
//   Print VICTORY lines with all stats and rating

int main() {
    // TODO: Print WAVE_STATUS for wave 2

    // TODO: Simulate all waves cleared, check level complete

    // TODO: Print LEVEL_COMPLETE and show victory screen

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 30;
int x[POOL_SIZE], y[POOL_SIZE];
int hp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int waveNum = 1;
int maxWaves = 3;
int score = 2500;
int kills = 12;
int shots = 16;
int maxCombo = 4;

bool checkLevelComplete(int wNum, int mWaves, int activeEnemies) {
    return wNum > mWaves && activeEnemies == 0;
}

char getRating(int s) {
    if (s > 5000) return 'S';
    if (s > 2000) return 'A';
    if (s > 1000) return 'B';
    return 'C';
}

void showVictoryScreen(int s, int ticks, int k, int sh, int mc) {
    int accuracy = (sh > 0) ? (k * 100 / sh) : 0;
    cout << "VICTORY|===== LEVEL COMPLETE =====" << endl;
    cout << "VICTORY|Score: " << s << endl;
    cout << "VICTORY|Time: " << ticks << " ticks" << endl;
    cout << "VICTORY|Kills: " << k << endl;
    cout << "VICTORY|Accuracy: " << accuracy << "%" << endl;
    cout << "VICTORY|Combo Max: " << mc << "x" << endl;
    cout << "VICTORY|Rating: " << getRating(s) << endl;
}

int main() {
    // Wave status mid-game
    cout << "WAVE_STATUS|wave|2|enemies_alive|3|total_waves|3" << endl;

    // All waves done, enemies cleared
    waveNum = 4;
    int activeEnemies = 0;

    if (checkLevelComplete(waveNum, maxWaves, activeEnemies)) {
        cout << "LEVEL_COMPLETE|wave|3|tick|45" << endl;
        showVictoryScreen(score, 45, kills, shots, maxCombo);
    }

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Wave status displayed", expectedOutput: "WAVE_STATUS\\|wave\\|2\\|enemies_alive\\|3\\|total_waves\\|3", isPattern: true },
    { id: "g2", description: "Level complete triggered", expectedOutput: "LEVEL_COMPLETE\\|wave\\|3\\|tick\\|45", isPattern: true },
    { id: "g3", description: "Victory header", expectedOutput: "VICTORY\\|===== LEVEL COMPLETE =====", isPattern: true },
    { id: "g4", description: "Score displayed", expectedOutput: "VICTORY\\|Score: 2500", isPattern: true },
    { id: "g5", description: "Accuracy calculated", expectedOutput: "VICTORY\\|Accuracy: 75%", isPattern: true },
    { id: "g6", description: "Rating assigned", expectedOutput: "VICTORY\\|Rating: A", isPattern: true },
  ],
  hints: [
    "checkLevelComplete takes waveNum, maxWaves, and activeEnemies. Return true only when waveNum > maxWaves AND activeEnemies == 0. Both conditions must hold.",
    "Accuracy = kills * 100 / shots. Integer division: 12 * 100 = 1200, 1200 / 16 = 75. No floating point needed.",
    "Rating checks from highest to lowest: S (>5000), A (>2000), B (>1000), C (default). Score 2500 is greater than 2000 but not greater than 5000, so rating is A.",
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
int shots = 0;
int wave = 1;
int maxWaves = 3;
int lives = 3;
int invFrames = 0;
int combo = 1;
int maxCombo = 1;
int lastKillTick = -99;
bool gameOver = false;
bool levelComplete = false;

int basePoints[] = {100, 150, 300, 1000};
string enemyNames[] = {"basic", "fast", "tank", "boss"};

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

bool isPlayerVulnerable() {
    return invFrames == 0;
}

void onPlayerDeath(int tick) {
    lives--;
    x[0] = 180;
    y[0] = 300;
    invFrames = 10;
    if (lives <= 0) gameOver = true;
}

void tickInvuln() {
    if (invFrames > 0) invFrames--;
}

bool checkLevelComplete(int wNum, int mWaves, int activeEnemies) {
    return wNum > mWaves && activeEnemies == 0;
}

char getRating(int s) {
    if (s > 5000) return 'S';
    if (s > 2000) return 'A';
    if (s > 1000) return 'B';
    return 'C';
}

void showVictoryScreen(int s, int ticks, int k, int sh, int mc) {
    int accuracy = (sh > 0) ? (k * 100 / sh) : 0;
    cout << "VICTORY|===== LEVEL COMPLETE =====" << endl;
    cout << "VICTORY|Score: " << s << endl;
    cout << "VICTORY|Time: " << ticks << " ticks" << endl;
    cout << "VICTORY|Kills: " << k << endl;
    cout << "VICTORY|Accuracy: " << accuracy << "%" << endl;
    cout << "VICTORY|Combo Max: " << mc << "x" << endl;
    cout << "VICTORY|Rating: " << getRating(s) << endl;
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
                if (hp[e] <= 0) onKill(0, tick);
                break;
            }
        }
    }
    if (isPlayerVulnerable()) {
        for (int e = 0; e < count; e++) {
            if (!alive[e] || type[e] != 2) continue;
            int dx = x[0] - x[e];
            int dy = y[0] - y[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            if (dx < 18 && dy < 18) {
                onPlayerDeath(tick);
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
        shots++;
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
            if (type[i] == 0) {
                if (invFrames > 0 && invFrames % 2 != 0) grid[sy][sx] = '.';
                else grid[sy][sx] = '@';
            }
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

    // Level complete demo
    score = 2500;
    kills = 12;
    shots = 16;
    maxCombo = 4;

    cout << "WAVE_STATUS|wave|2|enemies_alive|3|total_waves|3" << endl;

    wave = 4;
    int activeEnemies = 0;
    if (checkLevelComplete(wave, maxWaves, activeEnemies)) {
        cout << "LEVEL_COMPLETE|wave|3|tick|45" << endl;
        showVictoryScreen(score, 45, kills, shots, maxCombo);
    }

    return 0;
}
`,
};
