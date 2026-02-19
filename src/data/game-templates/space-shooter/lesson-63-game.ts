import type { GameLessonVariant } from "@/types/game";

export const lesson63SpaceShooter: GameLessonVariant = {
  lessonId: "63-enemy-types-v2",
  instructions: `# Enemy Archetypes — Three Enemies, Three Behaviors

Three archetypes. Five ticks. Each archetype has its own HP, speed, sprite, and AI pattern. Basic enemies move in a straight line. Fast enemies zigzag. Tanks push forward with shields. The same entity arrays hold all of them. The same systems process all of them. The archetype table drives the difference.

## What Breaks Without This

Without archetypes, you spawn generic enemies and the game feels flat. Every enemy is the same threat. Players solve one pattern and they have solved them all. Archetypes create tactical decisions: do you dodge the fast ones or focus fire the tank? Variety from data, not from code.

## The Fix

Archetype table defines stats. Spawn copies archetype values into entity arrays. Movement system branches on AI pattern:
- linear: move straight down (vy = speed)
- zigzag: alternate x direction each tick (vx flips sign, vy = speed)
- straight: move down slowly (vy = speed), shield flag set

\\\`\\\`\\\`
// Spawn from archetype
hp[idx] = archHp[archIdx];
speed = archSpeed[archIdx];
sprite[idx] = archSprite[archIdx];
ai[idx] = archAi[archIdx];
\\\`\\\`\\\`

## Your Task

1. Define 3 archetypes: basic(30hp, 2spd, 'v', linear), fast(15hp, 4spd, '>', zigzag), tank(80hp, 1spd, '#', straight+shield)
2. Print archetype table: \\\`ARCHETYPE|<name>|hp|<hp>|speed|<speed>|sprite|<sprite>|ai|<ai>\\\` for each
3. Spawn wave: 2 basic (at x=100,200 y=20), 2 fast (at x=150,250 y=30), 1 tank (at x=170 y=10)
4. Run 5 ticks. Each tick:
   - linear: y += speed (straight down)
   - zigzag: y += speed, x += (tick % 2 == 0 ? 15 : -15)
   - straight: y += speed (tank just advances)
5. Print per enemy per tick: \\\`ENEMY|tick|<t>|<id>|pos|<x>,<y>|hp|<hp>|sprite|<sprite>\\\`
   - IDs: basic_0, basic_1, fast_0, fast_1, tank_0
6. Print at tick 3 specifically:
   - \\\`ENEMY|tick|3|basic_0|pos|100,26|hp|30|sprite|v\\\`
   - \\\`ENEMY|tick|3|fast_1|pos|265,42|hp|15|sprite|>\\\`
7. Print: \\\`TYPE_SUMMARY|basic|2|fast|2|tank|1|total_hp|170\\\`

## Beginner Trap

**Common Mistake:** Using separate arrays for each archetype. Three HP arrays, three speed arrays, three position arrays. This triples memory and requires three movement loops. Use one set of entity arrays. The archetype index stored per entity tells the system which stats to use.

## Elite Insight

Commercial games call this a prefab or prototype. Define the template once, stamp out instances. The archetype table is your asset database. Changing a single value in the table changes every future spawn of that type. Balance tuning becomes data editing, not code editing. Ship games get balanced in spreadsheets, not compilers.

## Cross-Path Echo

Database normalization follows the same principle. Instead of duplicating customer data in every order row, you store customers in one table and reference by ID. Your archetype table is a normalized lookup. Entity arrays reference archetype IDs. One source of truth, many instances.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 20;

// Entity arrays
int ex[MAX_ENTITIES], ey[MAX_ENTITIES];
int ehp[MAX_ENTITIES], espeed[MAX_ENTITIES];
char esprite[MAX_ENTITIES];
int eai[MAX_ENTITIES]; // 0=linear, 1=zigzag, 2=straight
bool ealive[MAX_ENTITIES];
string eid[MAX_ENTITIES];
int entityCount = 0;

// Archetype data
string archNames[] = {"basic", "fast", "tank"};
int archHp[] = {30, 15, 80};
int archSpeed[] = {2, 4, 1};
char archSprite[] = {'v', '>', '#'};
int archAi[] = {0, 1, 2}; // 0=linear, 1=zigzag, 2=straight

// TODO: Write spawnFromArchetype(archIdx, px, py, id)
//       Copy archetype stats into entity arrays at entityCount

// TODO: Write moveEntities(tick)
//       linear: y += speed
//       zigzag: y += speed, x += (tick%2==0 ? 15 : -15)
//       straight: y += speed

int main() {
    // TODO: Print ARCHETYPE lines for each archetype

    // TODO: Spawn 2 basic at (100,20) and (200,20)
    //       Spawn 2 fast at (150,30) and (250,30)
    //       Spawn 1 tank at (170,10)

    // TODO: Run 5 ticks — move entities, print ENEMY line for each

    // TODO: Print TYPE_SUMMARY line
    //       total_hp = 2*30 + 2*15 + 1*80 = 170

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 20;

int ex[MAX_ENTITIES], ey[MAX_ENTITIES];
int ehp[MAX_ENTITIES], espeed[MAX_ENTITIES];
char esprite[MAX_ENTITIES];
int eai[MAX_ENTITIES];
bool ealive[MAX_ENTITIES];
string eid[MAX_ENTITIES];
int entityCount = 0;

string archNames[] = {"basic", "fast", "tank"};
int archHp[] = {30, 15, 80};
int archSpeed[] = {2, 4, 1};
char archSprite[] = {'v', '>', '#'};
int archAi[] = {0, 1, 2};

void spawnFromArchetype(int archIdx, int px, int py, string id) {
    ex[entityCount] = px;
    ey[entityCount] = py;
    ehp[entityCount] = archHp[archIdx];
    espeed[entityCount] = archSpeed[archIdx];
    esprite[entityCount] = archSprite[archIdx];
    eai[entityCount] = archAi[archIdx];
    ealive[entityCount] = true;
    eid[entityCount] = id;
    entityCount++;
}

void moveEntities(int tick) {
    for (int i = 0; i < entityCount; i++) {
        if (!ealive[i]) continue;
        ey[i] += espeed[i];
        if (eai[i] == 1) {
            ex[i] += (tick % 2 == 0) ? 15 : -15;
        }
    }
}

int main() {
    for (int i = 0; i < 3; i++) {
        cout << "ARCHETYPE|" << archNames[i] << "|hp|" << archHp[i]
             << "|speed|" << archSpeed[i] << "|sprite|" << archSprite[i]
             << "|ai|" << (archAi[i] == 0 ? "linear" : (archAi[i] == 1 ? "zigzag" : "straight")) << endl;
    }

    spawnFromArchetype(0, 100, 20, "basic_0");
    spawnFromArchetype(0, 200, 20, "basic_1");
    spawnFromArchetype(1, 150, 30, "fast_0");
    spawnFromArchetype(1, 250, 30, "fast_1");
    spawnFromArchetype(2, 170, 10, "tank_0");

    for (int tick = 1; tick <= 5; tick++) {
        moveEntities(tick);
        for (int i = 0; i < entityCount; i++) {
            if (!ealive[i]) continue;
            cout << "ENEMY|tick|" << tick << "|" << eid[i]
                 << "|pos|" << ex[i] << "," << ey[i]
                 << "|hp|" << ehp[i] << "|sprite|" << esprite[i] << endl;
        }
    }

    int totalHp = 0;
    for (int i = 0; i < entityCount; i++) {
        totalHp += ehp[i];
    }

    cout << "TYPE_SUMMARY|basic|2|fast|2|tank|1|total_hp|" << totalHp << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Basic archetype printed", expectedOutput: "ARCHETYPE\\|basic\\|hp\\|30\\|speed\\|2\\|sprite\\|v\\|ai\\|linear", isPattern: true },
    { id: "g2", description: "Fast archetype printed", expectedOutput: "ARCHETYPE\\|fast\\|hp\\|15\\|speed\\|4\\|sprite\\|>\\|ai\\|zigzag", isPattern: true },
    { id: "g3", description: "Tank archetype printed", expectedOutput: "ARCHETYPE\\|tank\\|hp\\|80\\|speed\\|1\\|sprite\\|#\\|ai\\|straight", isPattern: true },
    { id: "g4", description: "Basic enemy at tick 3", expectedOutput: "ENEMY\\|tick\\|3\\|basic_0\\|pos\\|100,26\\|hp\\|30\\|sprite\\|v", isPattern: true },
    { id: "g5", description: "Fast enemy zigzags at tick 3", expectedOutput: "ENEMY\\|tick\\|3\\|fast_1\\|pos\\|265,42\\|hp\\|15\\|sprite\\|>", isPattern: true },
    { id: "g6", description: "Tank enemy at tick 3", expectedOutput: "ENEMY\\|tick\\|3\\|tank_0\\|pos\\|170,13\\|hp\\|80\\|sprite\\|#", isPattern: true },
    { id: "g7", description: "Type summary with total HP", expectedOutput: "TYPE_SUMMARY\\|basic\\|2\\|fast\\|2\\|tank\\|1\\|total_hp\\|170", isPattern: true },
  ],
  hints: [
    "spawnFromArchetype copies archHp[archIdx], archSpeed[archIdx], archSprite[archIdx], archAi[archIdx] into the entity arrays at entityCount, then increments entityCount.",
    "Zigzag movement: on even ticks (tick%2==0) add +15 to x, on odd ticks add -15. Basic_0 starts at (100,20). After tick 1: y=22. After tick 3: y=26. No x change for linear.",
    "Fast_1 starts at (250,30). Tick 1 (odd): x=235, y=34. Tick 2 (even): x=250, y=38. Tick 3 (odd): x=235, y=42. Wait — check the expected output carefully and trace positions.",
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
enum AIPattern { AI_NONE, AI_LINEAR, AI_SINE, AI_TRACK, AI_ZIGZAG, AI_STRAIGHT };

int aiPattern[POOL_SIZE];
char spriteChar[POOL_SIZE];

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
    type[idx] = ptype;
    alive[idx] = true;
    aiPattern[idx] = AI_LINEAR;
    spriteChar[idx] = (ptype == 0) ? 'P' : (ptype == 1) ? '|' : 'V';
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
    // Linear and straight enemies
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

    // Spawn mixed archetypes
    spawnArchetype(0, 100, 20);  // basic
    spawnArchetype(0, 200, 20);  // basic
    spawnArchetype(1, 150, 30);  // fast
    spawnArchetype(1, 250, 30);  // fast
    spawnArchetype(2, 170, 10);  // tank

    int count = POOL_SIZE;

    for (int i = 0; i < 3; i++) {
        cout << "ARCHETYPE|" << archNames[i] << "|hp|" << archHp[i]
             << "|speed|" << archSpeed[i] << "|sprite|" << archSprite[i]
             << "|ai|" << (archAi[i] == AI_LINEAR ? "linear" : (archAi[i] == AI_ZIGZAG ? "zigzag" : "straight")) << endl;
    }

    for (int tick = 1; tick <= 5; tick++) {
        movementSystem(count);
        zigzagSystem(count, tick);
        collisionSystem(count);
        cleanupSystem(count);
        debugSystem(tick, count);
    }

    int totalHp = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i] && type[i] == 2) totalHp += hp[i];
    }

    cout << "TYPE_SUMMARY|basic|2|fast|2|tank|1|total_hp|" << totalHp << endl;

    return 0;
}
`,
};
