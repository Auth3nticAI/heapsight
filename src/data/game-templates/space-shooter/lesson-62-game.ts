import type { GameLessonVariant } from "@/types/game";

export const lesson62SpaceShooter: GameLessonVariant = {
  lessonId: "62-powerups-data",
  instructions: `# Power-Ups Data System — Items That Transform Gameplay

Power-ups turn a simple shooter into a dynamic experience. Speed boost lets the player dodge. Damage up melts enemies. Shield absorbs hits. Spread shot covers the screen. Each one changes the game feel without changing the game code. Define them as data, apply them as effects, expire them on timers. One system handles everything.

## What Breaks Without This

Without a data-driven power-up system, each new item requires its own code path. Speed boost needs a speed timer. Damage needs a damage timer. Shield needs a shield flag. The code doubles with each new item. Data-driven design means adding an item is adding a line of data. The system does not change.

## The Fix

Parse power-up definitions from data strings. Store active buffs with remaining durations. Each tick, decrement all buff timers. When a timer hits zero, revert the effect. The pickup-apply-tick-expire cycle handles every power-up type through one code path.

\\\`\\\`\\\`
// Parse: "speed_boost,300,2"
// Apply: playerSpeed *= magnitude
// Tick:  remaining--
// Expire: playerSpeed /= magnitude
\\\`\\\`\\\`

## Your Task

1. Parse 4 power-up definitions from data strings
2. Print: \\\`POWERUP_DEF|<type>|duration|<dur>|magnitude|<mag>\\\` for each
3. Player at (180, 300) with base speed 4, base damage 10
4. Simulate: speed_boost pickup at tick 5, damage_up pickup at tick 10
5. Print: \\\`PICKUP|tick|<t>|type|<type>|player_speed|<old>-><new>\\\` or player_damage
6. Show active buffs at tick 15: \\\`ACTIVE|tick|15|buffs|speed_boost(<remaining>)|damage_up(<remaining>)\\\`
7. Simulate speed_boost expiry at tick 305: \\\`EXPIRE|tick|305|type|speed_boost|player_speed|<old>-><new>\\\`
8. Print: \\\`POWERUP_SUMMARY|defined|4|picked_up|2|active|1|expired|1\\\`

## Beginner Trap

**Common Mistake:** Forgetting to revert the effect on expiry. If speed_boost multiplies speed by 2, expiry must divide by 2. If you just set speed back to base, you break stacking — what if the player has two speed buffs? Always reverse the exact operation.

## Elite Insight

Commercial games use a modifier stack. Instead of modifying the base stat, they push modifiers onto a stack and recompute: \\\`finalSpeed = baseSpeed * product(speedModifiers)\\\`. When a buff expires, remove the modifier and recompute. This handles stacking, ordering, and priority automatically. Your data-driven approach is the first step toward this architecture.

## Cross-Path Echo

CSS specificity works the same way. Multiple rules apply to an element. The browser stacks them, applies priority, and computes the final value. When a class is removed, the style recomputes without it. Your power-up stack is a real-time CSS cascade for game stats.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct PowerUpDef {
    string type;
    int duration;
    int magnitude;
};

struct ActiveBuff {
    string type;
    int remaining;
    int magnitude;
    bool active;
};

const int POOL_SIZE = 20;
int x[POOL_SIZE], y[POOL_SIZE];
int hp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int playerSpeed = 4;
int playerDamage = 10;
int score = 0;

// TODO: Write parsePowerUp(str, def) — parse "type,duration,magnitude"

// TODO: Write applyBuff(def, buffs, numBuffs) — activate a buff and apply effect

// TODO: Write expireBuff(buff) — revert effect when timer runs out

int main() {
    string defs[] = {
        "speed_boost,300,2",
        "damage_up,200,15",
        "shield,150,1",
        "spread_shot,100,5"
    };

    PowerUpDef powerups[4];
    ActiveBuff buffs[4];
    int numBuffs = 0;

    // TODO: Parse all definitions and print POWERUP_DEF lines

    // TODO: Simulate pickup events and buff lifecycle
    //   Print PICKUP, ACTIVE, EXPIRE, POWERUP_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct PowerUpDef {
    string type;
    int duration;
    int magnitude;
};

struct ActiveBuff {
    string type;
    int remaining;
    int magnitude;
    bool active;
};

const int POOL_SIZE = 20;
int x[POOL_SIZE], y[POOL_SIZE];
int hp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int playerSpeed = 4;
int playerDamage = 10;
int score = 0;

void parsePowerUp(string s, PowerUpDef &def) {
    int c1 = s.find(',');
    int c2 = s.find(',', c1 + 1);
    def.type = s.substr(0, c1);
    def.duration = stoi(s.substr(c1 + 1, c2 - c1 - 1));
    def.magnitude = stoi(s.substr(c2 + 1));
}

int main() {
    string defs[] = {
        "speed_boost,300,2",
        "damage_up,200,15",
        "shield,150,1",
        "spread_shot,100,5"
    };

    PowerUpDef powerups[4];
    ActiveBuff buffs[4];
    int numBuffs = 0;

    // Parse and print definitions
    for (int i = 0; i < 4; i++) {
        parsePowerUp(defs[i], powerups[i]);
        cout << "POWERUP_DEF|" << powerups[i].type
             << "|duration|" << powerups[i].duration
             << "|magnitude|" << powerups[i].magnitude << endl;
    }

    // Tick 5: pickup speed_boost
    int oldSpeed = playerSpeed;
    playerSpeed *= powerups[0].magnitude;
    buffs[numBuffs].type = powerups[0].type;
    buffs[numBuffs].remaining = powerups[0].duration;
    buffs[numBuffs].magnitude = powerups[0].magnitude;
    buffs[numBuffs].active = true;
    numBuffs++;
    cout << "PICKUP|tick|5|type|speed_boost|player_speed|"
         << oldSpeed << "->" << playerSpeed << endl;

    // Tick 10: pickup damage_up
    int oldDamage = playerDamage;
    playerDamage += powerups[1].magnitude;
    buffs[numBuffs].type = powerups[1].type;
    buffs[numBuffs].remaining = powerups[1].duration;
    buffs[numBuffs].magnitude = powerups[1].magnitude;
    buffs[numBuffs].active = true;
    numBuffs++;
    cout << "PICKUP|tick|10|type|damage_up|player_damage|"
         << oldDamage << "->" << playerDamage << endl;

    // Tick 15: show active buffs
    int speedRemain = powerups[0].duration - (15 - 5);
    int damageRemain = powerups[1].duration - (15 - 10);
    cout << "ACTIVE|tick|15|buffs|speed_boost(" << speedRemain
         << ")|damage_up(" << damageRemain << ")" << endl;

    // Tick 305: speed_boost expires
    oldSpeed = playerSpeed;
    playerSpeed /= powerups[0].magnitude;
    buffs[0].active = false;
    cout << "EXPIRE|tick|305|type|speed_boost|player_speed|"
         << oldSpeed << "->" << playerSpeed << endl;

    // Summary
    cout << "POWERUP_SUMMARY|defined|4|picked_up|2|active|1|expired|1" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Speed boost definition parsed", expectedOutput: "POWERUP_DEF\\|speed_boost\\|duration\\|300\\|magnitude\\|2", isPattern: true },
    { id: "g2", description: "All 4 definitions parsed", expectedOutput: "POWERUP_DEF\\|spread_shot\\|duration\\|100\\|magnitude\\|5", isPattern: true },
    { id: "g3", description: "Speed boost pickup applied", expectedOutput: "PICKUP\\|tick\\|5\\|type\\|speed_boost\\|player_speed\\|4->8", isPattern: true },
    { id: "g4", description: "Damage up pickup applied", expectedOutput: "PICKUP\\|tick\\|10\\|type\\|damage_up\\|player_damage\\|10->25", isPattern: true },
    { id: "g5", description: "Active buffs at tick 15", expectedOutput: "ACTIVE\\|tick\\|15\\|buffs\\|speed_boost\\(\\d+\\)\\|damage_up\\(\\d+\\)", isPattern: true },
    { id: "g6", description: "Speed boost expires at tick 305", expectedOutput: "EXPIRE\\|tick\\|305\\|type\\|speed_boost\\|player_speed\\|8->4", isPattern: true },
    { id: "g7", description: "Summary line", expectedOutput: "POWERUP_SUMMARY\\|defined\\|4\\|picked_up\\|2\\|active\\|1\\|expired\\|1", isPattern: true },
  ],
  hints: [
    "Parse with string::find(',') to locate delimiters. Use substr() to extract between commas. stoi() converts the duration and magnitude substrings to integers.",
    "Speed boost multiplies: playerSpeed *= magnitude (4*2=8). Damage up adds: playerDamage += magnitude (10+15=25). On expiry, reverse: speed /= magnitude, damage -= magnitude.",
    "Remaining ticks at tick 15: speed_boost picked at tick 5, so 300-(15-5)=290 remaining. damage_up picked at tick 10, so 200-(15-10)=195 remaining.",
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

    // Parse power-up definitions
    string puDefs[] = {"speed_boost,300,2", "damage_up,200,15", "shield,150,1", "spread_shot,100,5"};
    for (int i = 0; i < 4; i++) {
        parsePowerUp(puDefs[i], powerupDefs[numPowerupDefs++]);
    }

    int playerIdx = spawnFromPool(180, 300, 0, 0, 100, 0);

    // Wave 1: tracking enemies
    int e0 = spawnFromPool(100, 60, 0, 0, 1, 2);
    aiPattern[e0] = AI_TRACK;
    int e1 = spawnFromPool(200, 80, 0, 0, 1, 2);
    aiPattern[e1] = AI_TRACK;
    int e2 = spawnFromPool(300, 50, 0, 0, 1, 2);
    aiPattern[e2] = AI_TRACK;

    int count = entityCount;

    // Print definitions
    for (int i = 0; i < numPowerupDefs; i++) {
        cout << "POWERUP_DEF|" << powerupDefs[i].ptype
             << "|duration|" << powerupDefs[i].duration
             << "|magnitude|" << powerupDefs[i].magnitude << endl;
    }

    // Simulate pickup
    int oldSpeed = playerSpeed;
    applyBuff(powerupDefs[0]);
    cout << "PICKUP|tick|5|type|speed_boost|player_speed|"
         << oldSpeed << "->" << playerSpeed << endl;

    int oldDamage = playerDamage;
    applyBuff(powerupDefs[1]);
    cout << "PICKUP|tick|10|type|damage_up|player_damage|"
         << oldDamage << "->" << playerDamage << endl;

    int speedRemain = powerupDefs[0].duration - (15 - 5);
    int damageRemain = powerupDefs[1].duration - (15 - 10);
    cout << "ACTIVE|tick|15|buffs|speed_boost(" << speedRemain
         << ")|damage_up(" << damageRemain << ")" << endl;

    oldSpeed = playerSpeed;
    playerSpeed /= powerupDefs[0].magnitude;
    activeBuffs[0].active = false;
    cout << "EXPIRE|tick|305|type|speed_boost|player_speed|"
         << oldSpeed << "->" << playerSpeed << endl;

    cout << "POWERUP_SUMMARY|defined|4|picked_up|2|active|1|expired|1" << endl;

    return 0;
}
`,
};
