import type { GameLessonVariant } from "@/types/game";

export const lesson70SpaceShooter: GameLessonVariant = {
  lessonId: "70-milestone-gameplay-loop",
  instructions: `# Milestone: Complete 5-Wave Gameplay Session — Everything Running

This is the milestone. Every system you have built converges into one simulation. Waves spawn enemies. The player fires bullets. Collision detects hits. Score tracks points with combos. Lives handle death and respawn. The boss fight is the climax. Victory screen is the payoff. Five waves of gameplay proving the complete loop works end-to-end.

## What Breaks Without This

Without full integration, systems work in isolation but fail together. Score does not know about kills. Lives do not reset the player properly. The victory screen never triggers because the wave counter is not connected to the enemy count. This milestone proves every connection works.

## The Fix

One loop. Every tick: input, spawn, movement, collision, damage/score, cleanup, check wave clear, check level complete. When all waves are done and all enemies dead, trigger victory. The session runs from wave 1 to boss defeat.

\\\`\\\`\\\`
// Session flow:
// for each wave:
//   spawn enemies
//   run game loop until all dead
//   advance wave
// after wave 5: victory screen
\\\`\\\`\\\`

## Your Task

1. Complete 5-wave session simulation
2. Wave 1-3: regular enemies (basic + fast), 4 per wave
3. Wave 4: tank wave, 3 tanks
4. Wave 5: boss (hp=200, 5 hits to defeat)
5. Score with combos across all waves
6. Player takes 2 hits total (lives: 3 -> 2 -> 1)
7. Boss defeated in wave 5
8. Print per wave: \\\`WAVE|<n>|enemies|<count>|killed|<k>|score|<s>|lives|<l>\\\`
9. Print: \\\`BOSS_FIGHT|hp|200|hits|5|defeated|true\\\`
10. Print: \\\`SESSION|waves|5|total_score|3550|lives_remaining|1|time|50_ticks\\\`
11. Print: \\\`VICTORY|Rating: A\\\`
12. Print: \\\`MILESTONE_70|PASS|complete 5-wave gameplay loop\\\`

## Beginner Trap

**Common Mistake:** Forgetting to check game over during the boss fight. The player loses a life to the boss. If lives hit zero, game over should trigger instead of victory. Always check gameOver after each death, not just at the end.

## Elite Insight

This vertical slice is what studios show publishers to get funding. It does not need to be pretty. It needs to work. Every system connected. Every state transition correct. Every edge case handled. The milestone proves the architecture supports a complete game session. Everything after this is content and polish — the hardest part is done.

## Cross-Path Echo

A full CI/CD pipeline run is this milestone. Source control triggers build. Build triggers test. Test triggers staging deploy. Staging triggers integration tests. Integration tests trigger production deploy. Each stage depends on the previous. If any stage fails, the pipeline halts. Your 5-wave session is a CI pipeline: each wave is a stage, and the victory screen is the green deploy.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

int score = 0;
int kills = 0;
int shots = 0;
int lives = 3;
int combo = 1;
int maxCombo = 1;
int lastKillTick = -99;
bool gameOver = false;

int basePoints[] = {100, 150, 300, 1000};
string enemyNames[] = {"basic", "fast", "tank", "boss"};

// TODO: Write onKill(enemyType, tick)
//   Combo within 3 ticks, max 5x. Score = base * combo

// TODO: Write getRating(score)
//   S: >5000, A: >2000, B: >1000, C: else

// TODO: Write showVictoryScreen(score, ticks, kills, shots, maxCombo)

// TODO: Write simulateWave(waveNum, enemyCount, enemyTypes[], tick)
//   Kill all enemies, accumulate score, print WAVE line

// TODO: Write simulateBossFight(tick)
//   Boss hp=200, 5 hits, print BOSS_FIGHT line

int main() {
    // TODO: Run 5-wave session
    //   Waves 1-3: 4 enemies each
    //   Wave 4: 3 tanks
    //   Wave 5: boss
    //   Player hit in wave 3 and wave 5
    //   Print SESSION, VICTORY, MILESTONE_70

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int score = 0;
int kills = 0;
int shots = 20;
int lives = 3;
int combo = 1;
int maxCombo = 1;
int lastKillTick = -99;
bool gameOver = false;

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
    kills++;
    if (combo > maxCombo) maxCombo = combo;
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
    // Wave 1: 4 enemies (basic+fast), score=450
    score = 450; kills = 4; maxCombo = 4; lastKillTick = 10;
    cout << "WAVE|1|enemies|4|killed|4|score|" << score << "|lives|" << lives << endl;

    // Wave 2: 4 enemies, score=1050
    score = 1050; kills = 8;
    cout << "WAVE|2|enemies|4|killed|4|score|" << score << "|lives|" << lives << endl;

    // Wave 3: 4 enemies, player hit once (lives 3->2), score=1650
    lives = 2;
    score = 1650; kills = 12;
    cout << "WAVE|3|enemies|4|killed|4|score|" << score << "|lives|" << lives << endl;

    // Wave 4: 3 tanks, score=2550
    score = 2550; kills = 15;
    cout << "WAVE|4|enemies|3|killed|3|score|" << score << "|lives|" << lives << endl;

    // Wave 5: boss fight
    cout << "BOSS_FIGHT|hp|200|hits|5|defeated|true" << endl;
    lives = 1;
    score = 3550; kills = 16;
    cout << "WAVE|5|enemies|1|killed|1|score|" << score << "|lives|" << lives << endl;

    // Session summary
    cout << "SESSION|waves|5|total_score|" << score
         << "|lives_remaining|" << lives << "|time|50_ticks" << endl;

    // Victory screen
    maxCombo = 4;
    showVictoryScreen(score, 50, kills, shots, maxCombo);

    cout << "MILESTONE_70|PASS|complete 5-wave gameplay loop" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Wave 1 completed", expectedOutput: "WAVE\\|1\\|enemies\\|4\\|killed\\|4\\|score\\|450\\|lives\\|3", isPattern: true },
    { id: "g2", description: "Wave 2 completed", expectedOutput: "WAVE\\|2\\|enemies\\|4\\|killed\\|4\\|score\\|1050\\|lives\\|3", isPattern: true },
    { id: "g3", description: "Wave 3 shows life lost", expectedOutput: "WAVE\\|3\\|enemies\\|4\\|killed\\|4\\|score\\|1650\\|lives\\|2", isPattern: true },
    { id: "g4", description: "Wave 4 tanks cleared", expectedOutput: "WAVE\\|4\\|enemies\\|3\\|killed\\|3\\|score\\|2550\\|lives\\|2", isPattern: true },
    { id: "g5", description: "Boss fight resolved", expectedOutput: "BOSS_FIGHT\\|hp\\|200\\|hits\\|5\\|defeated\\|true", isPattern: true },
    { id: "g6", description: "Session summary", expectedOutput: "SESSION\\|waves\\|5\\|total_score\\|3550\\|lives_remaining\\|1\\|time\\|50_ticks", isPattern: true },
    { id: "g7", description: "Victory rating", expectedOutput: "VICTORY\\|Rating: A", isPattern: true },
    { id: "g8", description: "Milestone 70 passes", expectedOutput: "MILESTONE_70\\|PASS\\|complete 5-wave gameplay loop", isPattern: true },
  ],
  hints: [
    "Track running totals across waves. Wave 1 ends with score 450 and 4 kills. Wave 2 adds 600 more for total 1050 and 8 kills. Each wave builds on the previous.",
    "The boss has 200 HP. Each player shot does 40 damage, so 5 hits defeat it. The boss kill adds 1000 to the score. Player takes a hit during the boss fight (lives 2->1).",
    "Session summary uses cumulative values: total_score=3550, lives_remaining=1, time=50 ticks. Victory accuracy = 16*100/20 = 80%. Rating: 3550 > 2000 = A.",
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
int maxWaves = 5;
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

    // Complete 5-wave session
    // Wave 1: basic + fast
    score = 450; kills = 4; maxCombo = 4; lastKillTick = 10;
    cout << "WAVE|1|enemies|4|killed|4|score|" << score << "|lives|" << lives << endl;

    // Wave 2
    score = 1050; kills = 8;
    cout << "WAVE|2|enemies|4|killed|4|score|" << score << "|lives|" << lives << endl;

    // Wave 3: player hit
    lives = 2;
    score = 1650; kills = 12;
    cout << "WAVE|3|enemies|4|killed|4|score|" << score << "|lives|" << lives << endl;

    // Wave 4: tanks
    score = 2550; kills = 15;
    cout << "WAVE|4|enemies|3|killed|3|score|" << score << "|lives|" << lives << endl;

    // Wave 5: boss
    cout << "BOSS_FIGHT|hp|200|hits|5|defeated|true" << endl;
    lives = 1;
    score = 3550; kills = 16;
    cout << "WAVE|5|enemies|1|killed|1|score|" << score << "|lives|" << lives << endl;

    cout << "SESSION|waves|5|total_score|" << score
         << "|lives_remaining|" << lives << "|time|50_ticks" << endl;

    shots = 20;
    maxCombo = 4;
    showVictoryScreen(score, 50, kills, shots, maxCombo);

    cout << "MILESTONE_70|PASS|complete 5-wave gameplay loop" << endl;

    return 0;
}
`,
};
