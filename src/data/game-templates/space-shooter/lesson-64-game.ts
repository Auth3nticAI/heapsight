import type { GameLessonVariant } from "@/types/game";

export const lesson64SpaceShooter: GameLessonVariant = {
  lessonId: "64-boss-intro",
  instructions: `# Boss Entity Combat — The Big Target

A boss entity sits at center screen. 200 HP. Sprite 'W'. Five frames of sustained combat. Each frame the player deals 40 damage. The health bar drains. The boss dies. This is the first multi-hit encounter in the game. The same collision and damage systems handle it — the boss just has more HP.

## What Breaks Without This

Without a boss, waves end abruptly. The player clears five enemies in one second and waits for the next wave. No tension. No sustained engagement. The boss creates a 5-second encounter where the player must keep hitting while dodging. It transforms the game from whack-a-mole into a real fight.

## The Fix

Boss entity in the same arrays as everything else. Type 3 distinguishes it from regular enemies (type 2). The collision system already handles HP reduction. The render system draws the boss sprite at its position. The only new code is the health bar display — a 10-character ASCII string computed from HP percentage.

\\\`\\\`\\\`
// Health bar computation
int filled = currentHp * 10 / maxHp;
// filled=8: "========.."
// filled=4: "====......"
// filled=0: ".........."
\\\`\\\`\\\`

## Your Task

1. Boss entity: id "BOSS_1", type 3, 200hp, size 60x40, position (170,40), sprite 'W'
2. Boss takes 40 damage each frame for 5 frames
3. Print each hit: \\\`BOSS_HIT|frame|<f>|damage|40|hp|<remaining>|bar|<healthbar>\\\`
4. Health bar: 10 chars, '=' for filled, '.' for empty
   - Frame 1: hp=160, bar=\\\`========..\\\`
   - Frame 2: hp=120, bar=\\\`======....\\\`
   - Frame 3: hp=80, bar=\\\`====......\\\`
   - Frame 4: hp=40, bar=\\\`==........\\\`
   - Frame 5: hp=0, bar=\\\`..........\\\`
5. Print: \\\`BOSS|frame|5|hp|0|status|DEFEATED\\\`
6. Print: \\\`BOSS_SUMMARY|total_hits|5|total_damage|200|frames_alive|5\\\`
7. Render boss 'W' on a 20x10 ASCII grid at center position

## Beginner Trap

**Common Mistake:** Using floating-point for the health bar. Integer math is sufficient and exact: \\\`filled = hp * 10 / maxHp\\\`. With hp=160, maxHp=200: 160*10=1600, 1600/200=8. No floats needed. Floats introduce rounding errors in what should be a discrete display.

## Elite Insight

Boss fights in commercial games use the same entity system with modifier flags. A "boss" flag might increase collision box size, enable health bar rendering, trigger music changes, and lock the arena. But the entity itself is processed by the same systems. The flag triggers behavior, not a separate code path. Your type field is that flag.

## Cross-Path Echo

HTTP status codes work this way. A 404 response uses the same TCP connection, same HTTP parser, same header format as a 200. The status code is a type field that changes how the client handles the response. Your boss type field changes how the game handles the entity. Same system, different behavior from a single integer.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int SCREEN_W = 20;
const int SCREEN_H = 10;

int main() {
    // Boss entity
    string bossId = "BOSS_1";
    int bossHp = 200;
    int bossMaxHp = 200;
    int bossX = 170, bossY = 40;
    int bossW = 60, bossH = 40;
    char bossSprite = 'W';
    int bossType = 3;
    int damagePerHit = 40;

    // TODO: Run 5 frames of boss combat
    //   Each frame: apply 40 damage
    //   Calculate health bar: filled = bossHp * 10 / bossMaxHp
    //   Build 10-char bar: '=' for filled, '.' for empty
    //   Print BOSS_HIT line

    // TODO: Print BOSS defeated line

    // TODO: Print BOSS_SUMMARY line

    // TODO: Render 20x10 grid with boss 'W' at screen center
    //       Boss screen pos: sx=10, sy=4 (approximate center)

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int SCREEN_W = 20;
const int SCREEN_H = 10;

int main() {
    string bossId = "BOSS_1";
    int bossHp = 200;
    int bossMaxHp = 200;
    int bossX = 170, bossY = 40;
    int bossW = 60, bossH = 40;
    char bossSprite = 'W';
    int bossType = 3;
    int damagePerHit = 40;
    int totalDamage = 0;
    int totalHits = 0;

    for (int frame = 1; frame <= 5; frame++) {
        bossHp -= damagePerHit;
        if (bossHp < 0) bossHp = 0;
        totalDamage += damagePerHit;
        totalHits++;

        int filled = bossHp * 10 / bossMaxHp;
        string bar = "";
        for (int i = 0; i < 10; i++) {
            bar += (i < filled) ? '=' : '.';
        }

        cout << "BOSS_HIT|frame|" << frame << "|damage|" << damagePerHit
             << "|hp|" << bossHp << "|bar|" << bar << endl;
    }

    cout << "BOSS|frame|5|hp|0|status|DEFEATED" << endl;
    cout << "BOSS_SUMMARY|total_hits|" << totalHits
         << "|total_damage|" << totalDamage
         << "|frames_alive|5" << endl;

    // Render grid with boss at center
    char grid[SCREEN_H][SCREEN_W];
    for (int r = 0; r < SCREEN_H; r++)
        for (int c = 0; c < SCREEN_W; c++)
            grid[r][c] = '.';

    int bsx = 10, bsy = 4;
    grid[bsy][bsx] = bossSprite;

    for (int r = 0; r < SCREEN_H; r++) {
        for (int c = 0; c < SCREEN_W; c++) cout << grid[r][c];
        cout << endl;
    }

    return 0;
}
`,
  tests: [
    { id: "g1", description: "First hit reduces to 160hp", expectedOutput: "BOSS_HIT\\|frame\\|1\\|damage\\|40\\|hp\\|160\\|bar\\|========\\.\\.", isPattern: true },
    { id: "g2", description: "Third hit reduces to 80hp", expectedOutput: "BOSS_HIT\\|frame\\|3\\|damage\\|40\\|hp\\|80\\|bar\\|====", isPattern: true },
    { id: "g3", description: "Fifth hit kills boss", expectedOutput: "BOSS_HIT\\|frame\\|5\\|damage\\|40\\|hp\\|0\\|bar\\|\\.{10}", isPattern: true },
    { id: "g4", description: "Boss defeated status", expectedOutput: "BOSS\\|frame\\|5\\|hp\\|0\\|status\\|DEFEATED", isPattern: true },
    { id: "g5", description: "Boss summary correct", expectedOutput: "BOSS_SUMMARY\\|total_hits\\|5\\|total_damage\\|200\\|frames_alive\\|5", isPattern: true },
    { id: "g6", description: "Grid contains boss sprite", expectedOutput: "W", isPattern: true },
  ],
  hints: [
    "Health bar: filled = bossHp * 10 / bossMaxHp. At 160hp: 8 filled. At 120hp: 6 filled. At 0hp: 0 filled. Build string with a 10-iteration loop.",
    "Subtract damage before computing the bar. Frame 1: 200-40=160, then compute bar for 160. Frame 5: 40-40=0, bar is all dots.",
    "Grid rendering: initialize 20x10 with '.', place 'W' at approximate center (col 10, row 4). Print row by row.",
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

int spawnBoss(int px, int py, int bossHp, int bw, int bh) {
    int idx = spawnFromPool(px, py, 0, 0, bossHp, 3);
    if (idx >= 0) {
        spriteChar[idx] = 'W';
        entityW[idx] = bw;
        entityH[idx] = bh;
    }
    return idx;
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

    // Spawn boss
    int bossIdx = spawnBoss(170, 40, 200, 60, 40);
    int bossMaxHpVal = 200;

    int count = POOL_SIZE;
    int damagePerHit = 40;

    for (int frame = 1; frame <= 5; frame++) {
        // Simulate boss taking damage
        if (alive[bossIdx]) {
            hp[bossIdx] -= damagePerHit;
            if (hp[bossIdx] < 0) hp[bossIdx] = 0;

            string bar = buildHealthBar(hp[bossIdx], bossMaxHpVal);
            cout << "BOSS_HIT|frame|" << frame << "|damage|" << damagePerHit
                 << "|hp|" << hp[bossIdx] << "|bar|" << bar << endl;

            if (hp[bossIdx] <= 0) {
                alive[bossIdx] = false;
                cout << "BOSS|frame|" << frame << "|hp|0|status|DEFEATED" << endl;
            }
        }
    }

    cout << "BOSS_SUMMARY|total_hits|5|total_damage|200|frames_alive|5" << endl;

    // Render
    int camX = x[playerIdx] - VIEW_W / 2;
    int camY = y[playerIdx] - VIEW_H / 2;
    renderSystem(count, camX, camY);

    return 0;
}
`,
};
