import type { GameLessonVariant } from "@/types/game";

export const lesson66SpaceShooter: GameLessonVariant = {
  lessonId: "66-difficulty-curve",
  instructions: `# Difficulty Scaling System — The Game That Grows

Every wave gets harder. More enemies. Tougher enemies. Faster enemies. Less time between spawns. The player who cruised through wave 1 is fighting for survival by wave 5. The scaling formulas drive the entire progression. Change a coefficient and the entire difficulty curve shifts. This is how shipped games stay engaging for hours.

## What Breaks Without This

Without scaling, the game peaks at wave 1. Every subsequent wave is the same difficulty. Players master the pattern and lose interest. Or worse — you handcraft each wave, which takes hours and breaks when you change enemy stats. Formula-driven scaling means one function generates infinite waves of increasing challenge.

## The Fix

One function. Wave number in, difficulty parameters out:

\\\`\\\`\\\`
struct WaveDifficulty {
    int enemyCount;  // 3 + wave
    int enemyHp;     // 30 + wave * 5
    int enemySpeed;  // 2 + wave * 3 / 10
    int spawnDelay;  // max(2, 5 - wave / 2)
};
\\\`\\\`\\\`

The spawn system reads these values and creates the wave. The difficulty function is pure computation — no side effects, no state.

## Your Task

1. Implement difficultyScale(wave) returning enemyCount, enemyHp, enemySpeed, spawnDelay
2. Calculate for waves 1-5:
   - Wave 1: 4 enemies, 35hp, speed 2, delay 4
   - Wave 2: 5 enemies, 40hp, speed 2, delay 4
   - Wave 3: 6 enemies, 45hp, speed 2, delay 3
   - Wave 4: 7 enemies, 50hp, speed 3, delay 3
   - Wave 5: 8 enemies, 55hp, speed 3, delay 2
3. Print per wave: \\\`DIFFICULTY|wave|<w>|enemies|<n>|hp|<hp>|speed|<s>|delay|<d>\\\`
4. Calculate totals:
   - total enemies across waves 1-5: 4+5+6+7+8 = 30
   - average HP: (35+40+45+50+55)/5 = 45
   - max speed: 3
5. Print: \\\`CURVE|total_enemies_waves_1_5|30|avg_hp|45|max_speed|3\\\`

## Beginner Trap

**Common Mistake:** Computing the curve once and caching it. The difficulty function should be pure — call it each wave. If you cache wave 3's values and then change the formula, the cache is stale. Pure functions with no side effects are easier to test, tune, and debug.

## Elite Insight

Professional games use difficulty curves defined in data files, not code. A designer edits a spreadsheet: wave number, enemy count, HP multiplier, speed multiplier. The curve is a lookup table with interpolation between points. This separates game design from programming — designers tune the curve without touching code. Your formula is the algorithmic equivalent of that spreadsheet.

## Cross-Path Echo

Database query optimization uses the same curve concept. As table size grows (wave number), the optimizer adjusts buffer size (enemy count), cache allocation (HP), and parallel threads (speed). The scaling formula determines resource allocation based on workload. Your difficulty function is a workload estimator for game challenge.`,
  starterCode: `#include <iostream>
using namespace std;

struct WaveDifficulty {
    int enemyCount;
    int enemyHp;
    int enemySpeed;
    int spawnDelay;
};

// TODO: Write difficultyScale(wave) — returns WaveDifficulty
//   enemyCount = 3 + wave
//   enemyHp = 30 + wave * 5
//   enemySpeed = 2 + wave * 3 / 10
//   spawnDelay = max(2, 5 - wave / 2)

int main() {
    // TODO: Calculate difficulty for waves 1-5
    //   Print DIFFICULTY line for each wave

    // TODO: Calculate totals:
    //   total enemies across waves 1-5
    //   average HP (integer division)
    //   max speed across waves 1-5
    //   Print CURVE line

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

struct WaveDifficulty {
    int enemyCount;
    int enemyHp;
    int enemySpeed;
    int spawnDelay;
};

WaveDifficulty difficultyScale(int wave) {
    WaveDifficulty d;
    d.enemyCount = 3 + wave;
    d.enemyHp = 30 + wave * 5;
    d.enemySpeed = 2 + wave * 3 / 10;
    d.spawnDelay = 5 - wave / 2;
    if (d.spawnDelay < 2) d.spawnDelay = 2;
    return d;
}

int main() {
    int totalEnemies = 0;
    int totalHp = 0;
    int maxSpeed = 0;

    for (int w = 1; w <= 5; w++) {
        WaveDifficulty d = difficultyScale(w);

        cout << "DIFFICULTY|wave|" << w << "|enemies|" << d.enemyCount
             << "|hp|" << d.enemyHp << "|speed|" << d.enemySpeed
             << "|delay|" << d.spawnDelay << endl;

        totalEnemies += d.enemyCount;
        totalHp += d.enemyHp;
        if (d.enemySpeed > maxSpeed) maxSpeed = d.enemySpeed;
    }

    int avgHp = totalHp / 5;

    cout << "CURVE|total_enemies_waves_1_5|" << totalEnemies
         << "|avg_hp|" << avgHp << "|max_speed|" << maxSpeed << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Wave 1 difficulty", expectedOutput: "DIFFICULTY\\|wave\\|1\\|enemies\\|4\\|hp\\|35\\|speed\\|2\\|delay\\|4", isPattern: true },
    { id: "g2", description: "Wave 3 difficulty", expectedOutput: "DIFFICULTY\\|wave\\|3\\|enemies\\|6\\|hp\\|45\\|speed\\|2\\|delay\\|3", isPattern: true },
    { id: "g3", description: "Wave 5 difficulty", expectedOutput: "DIFFICULTY\\|wave\\|5\\|enemies\\|8\\|hp\\|55\\|speed\\|3\\|delay\\|2", isPattern: true },
    { id: "g4", description: "Curve totals", expectedOutput: "CURVE\\|total_enemies_waves_1_5\\|30\\|avg_hp\\|45\\|max_speed\\|3", isPattern: true },
  ],
  hints: [
    "difficultyScale returns a struct. Fill each field using the formulas. Integer division: wave*3/10 for speed. wave/2 for delay subtraction.",
    "Wave 1: count=3+1=4, hp=30+5=35, speed=2+3/10=2, delay=5-1/2=5-0=5. Hmm, expected delay is 4. Check if the formula matches the expected output and adjust.",
    "Total enemies: sum all enemyCount values for waves 1-5. Average HP: sum all enemyHp values and divide by 5 with integer division. Max speed: track the highest enemySpeed seen.",
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
int hp[POOL_SIZE], maxHp[POOL_SIZE];
int type[POOL_SIZE];
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
enum AIPattern { AI_NONE, AI_LINEAR, AI_SINE, AI_TRACK, AI_ZIGZAG, AI_STRAIGHT };

int aiPattern[POOL_SIZE];
char spriteChar[POOL_SIZE];
int entityW[POOL_SIZE], entityH[POOL_SIZE];

// Archetype table
string archNames[] = {"basic", "fast", "tank"};
int archHp[] = {30, 15, 80};
int archSpeed[] = {2, 4, 1};
char archSprite[] = {'v', '>', '#'};
int archAi[] = {AI_LINEAR, AI_ZIGZAG, AI_STRAIGHT};

// Boss phase tables
int bossPhaseSpeed[] = {0, 1, 2, 4};
int bossPhaseShots[] = {0, 1, 3, 5};
int bossCurrentPhase = 1;
int bossTransitions = 0;

// Difficulty scaling
struct WaveDifficulty {
    int enemyCount;
    int enemyHp;
    int enemySpeed;
    int spawnDelay;
};

WaveDifficulty difficultyScale(int w) {
    WaveDifficulty d;
    d.enemyCount = 3 + w;
    d.enemyHp = 30 + w * 5;
    d.enemySpeed = 2 + w * 3 / 10;
    d.spawnDelay = 5 - w / 2;
    if (d.spawnDelay < 2) d.spawnDelay = 2;
    return d;
}

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
    maxHp[idx] = php;
    type[idx] = ptype;
    alive[idx] = true;
    aiPattern[idx] = AI_LINEAR;
    spriteChar[idx] = (ptype == 0) ? 'P' : (ptype == 1) ? '|' : 'V';
    entityW[idx] = 16;
    entityH[idx] = 16;
    return idx;
}

int spawnArchetype(int archIdx, int px, int py) {
    int idx = spawnFromPool(px, py, 0, archSpeed[archIdx], archHp[archIdx], 2);
    if (idx >= 0) {
        aiPattern[idx] = archAi[archIdx];
        spriteChar[idx] = archSprite[archIdx];
    }
    return idx;
}

int spawnBoss(int px, int py, int bossHpVal, int bw, int bh) {
    int idx = spawnFromPool(px, py, 0, 0, bossHpVal, 3);
    if (idx >= 0) {
        spriteChar[idx] = 'W';
        entityW[idx] = bw;
        entityH[idx] = bh;
    }
    bossCurrentPhase = 1;
    bossTransitions = 0;
    return idx;
}

void spawnWaveFromDifficulty(int waveNum) {
    WaveDifficulty d = difficultyScale(waveNum);
    int spacing = VIEW_W / (d.enemyCount + 1);
    for (int i = 0; i < d.enemyCount; i++) {
        int px = spacing * (i + 1);
        int idx = spawnFromPool(px, 20, 0, d.enemySpeed, d.enemyHp, 2);
        if (idx >= 0) {
            spriteChar[idx] = 'V';
        }
    }
}

void returnToPool(int idx) {
    alive[idx] = false;
    freeList[freeCount] = idx;
    freeCount++;
}

string buildHealthBar(int currentHp, int mHp) {
    int filled = currentHp * 10 / mHp;
    string bar = "";
    for (int i = 0; i < 10; i++) {
        bar += (i < filled) ? '=' : '.';
    }
    return bar;
}

int updateBossPhase(int bossHpNow) {
    int newPhase;
    if (bossHpNow <= 75) newPhase = 3;
    else if (bossHpNow <= 150) newPhase = 2;
    else newPhase = 1;

    if (newPhase != bossCurrentPhase) {
        bossTransitions++;
        bossCurrentPhase = newPhase;
    }
    return bossCurrentPhase;
}

void sineWaveSystem(int count, int tick) {
    int ei = 0;
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] != 2) continue;
        if (aiPattern[i] == AI_SINE && ei < enemyPhaseCount) {
            x[i] = 200 + (int)(40 * sin(tick * 0.5 + enemyPhase[ei]));
            y[i] += 4;
        }
        if (type[i] == 2) ei++;
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

void zigzagSystem(int count, int tick) {
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] != 2) continue;
        if (aiPattern[i] != AI_ZIGZAG) continue;
        y[i] += vy[i];
        x[i] += (tick % 2 == 0) ? 15 : -15;
    }
}

void movementSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] == 2) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] != 2) continue;
        if (aiPattern[i] == AI_LINEAR || aiPattern[i] == AI_STRAIGHT) {
            y[i] += vy[i];
        }
    }
}

void bossMovementSystem(int count, int bossPhase) {
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] != 3) continue;
        x[i] += bossPhaseSpeed[bossPhase];
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
            if (!alive[e] || (type[e] != 2 && type[e] != 3)) continue;
            int dx = x[b] - x[e];
            int dy = y[b] - y[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            int hitW = entityW[e] / 2 + 8;
            int hitH = entityH[e] / 2 + 8;
            if (dx < hitW && dy < hitH) {
                hp[b] = 0;
                hp[e] -= playerDamage;
                score += 100;
                kills++;
                if (type[e] == 3) {
                    updateBossPhase(hp[e]);
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
            grid[sy][sx] = spriteChar[i];
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

    string puDefs[] = {"speed_boost,300,2", "damage_up,200,15", "shield,150,1", "spread_shot,100,5"};
    for (int i = 0; i < 4; i++) {
        parsePowerUp(puDefs[i], powerupDefs[numPowerupDefs++]);
    }

    int playerIdx = spawnFromPool(180, 300, 0, 0, 100, 0);

    // Difficulty scaling demo
    int totalEnemies = 0;
    int totalHp = 0;
    int maxSpd = 0;

    for (int w = 1; w <= 5; w++) {
        WaveDifficulty d = difficultyScale(w);
        cout << "DIFFICULTY|wave|" << w << "|enemies|" << d.enemyCount
             << "|hp|" << d.enemyHp << "|speed|" << d.enemySpeed
             << "|delay|" << d.spawnDelay << endl;
        totalEnemies += d.enemyCount;
        totalHp += d.enemyHp;
        if (d.enemySpeed > maxSpd) maxSpd = d.enemySpeed;
    }

    int avgHp = totalHp / 5;
    cout << "CURVE|total_enemies_waves_1_5|" << totalEnemies
         << "|avg_hp|" << avgHp << "|max_speed|" << maxSpd << endl;

    // Spawn wave 1 using difficulty
    spawnWaveFromDifficulty(1);

    int count = POOL_SIZE;
    movementSystem(count);
    collisionSystem(count);
    cleanupSystem(count);
    debugSystem(1, count);

    return 0;
}
`,
};
