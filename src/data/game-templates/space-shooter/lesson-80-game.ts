import type { GameLessonVariant } from "@/types/game";

export const lesson80SpaceShooter: GameLessonVariant = {
  lessonId: "80-content-extension",
  instructions: `# Game Builder: Content Extension — 10 Waves, 3 Bosses, Zero Code Branches

Scale the game from a 5-wave demo to a 10-wave product. Define all wave content as data. Three boss variants with different combat profiles. The engine reads the table and spawns accordingly. Adding wave 11 should require adding one row, not one function.

## What Breaks Without This

Without data-driven content, every new wave is a code change. Code changes need testing. Testing needs builds. Builds take time. A content designer waiting on a programmer to add wave 6 is a pipeline bottleneck. Data-driven design removes the programmer from the content loop.

## The Fix

One wave table. One boss table. One spawn function that reads both. The game loop iterates the wave table. When a wave has a boss, the spawn function looks up the boss variant by name and applies its stats. Content scales linearly with table rows, not code complexity.

\\\`\\\`\\\`
// Wave table drives everything:
// for (int w = 0; w < 10; w++) {
//     spawnWave(waves[w]);
//     if (waves[w].bossName != "none")
//         spawnBoss(lookupBoss(waves[w].bossName));
// }
\\\`\\\`\\\`

## Your Task

1. Define 10 WaveConfig entries with increasing difficulty
2. Define 3 BossVariant entries: Destroyer (200hp), Phantom (150hp), Mothership (400hp)
3. Simulate progression through all 10 waves
4. Print per wave: \\\`WAVE|<n>|enemies|<count>|type|<type>|boss|<boss>\\\`
5. Print: \\\`WAVE|1|enemies|3|type|basic|boss|none\\\`
6. Print: \\\`WAVE|5|enemies|8|type|mixed|boss|Destroyer\\\`
7. Print: \\\`WAVE|10|enemies|12|type|elite|boss|Mothership\\\`
8. Print: \\\`CONTENT|waves|10|enemy_types|4|boss_variants|3|total_entities|85\\\`

## Beginner Trap

**Common Mistake:** Counting bosses as regular enemies. Bosses are separate entities. If wave 5 has 8 enemies and a Destroyer boss, total entities for that wave is 9. The content summary must count enemy entities AND boss entities separately.

## Elite Insight

This is the minimum viable content pipeline. In AAA development, wave configs would reference enemy prefabs, spawn patterns, trigger conditions, and reward tables. Each field is another dimension of content. Your simple struct with three fields is the seed that grows into a full content management system.

## Cross-Path Echo

Database schema design follows the same principle. Start with a simple table. Add columns as requirements grow. The wave table is a database table. Adding a "reward" column to WaveConfig is equivalent to ALTER TABLE waves ADD COLUMN reward INTEGER. The engine adapts to schema changes without rewriting queries.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct WaveConfig {
    int enemyCount;
    string enemyType;
    string bossName;
};

struct BossVariant {
    string name;
    int hp;
    string pattern;
};

// TODO: Define 3 boss variants

// TODO: Define 10 wave configurations

int main() {
    // TODO: Iterate all 10 waves
    //   Print: WAVE|<n>|enemies|<count>|type|<type>|boss|<boss>

    // TODO: Count total entities (enemies + boss entities)

    // TODO: Print CONTENT summary

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct WaveConfig {
    int enemyCount;
    string enemyType;
    string bossName;
};

struct BossVariant {
    string name;
    int hp;
    string pattern;
};

int main() {
    BossVariant bosses[3];
    bosses[0] = {"Destroyer", 200, "spread"};
    bosses[1] = {"Phantom", 150, "teleport"};
    bosses[2] = {"Mothership", 400, "minion_spawn"};

    WaveConfig waves[10];
    waves[0] = {3, "basic", "none"};
    waves[1] = {4, "basic", "none"};
    waves[2] = {5, "basic", "none"};
    waves[3] = {6, "mixed", "none"};
    waves[4] = {8, "mixed", "Destroyer"};
    waves[5] = {8, "mixed", "none"};
    waves[6] = {10, "mixed", "Phantom"};
    waves[7] = {10, "elite", "none"};
    waves[8] = {11, "elite", "none"};
    waves[9] = {12, "elite", "Mothership"};

    int totalEntities = 0;

    for (int i = 0; i < 10; i++) {
        cout << "WAVE|" << (i + 1)
             << "|enemies|" << waves[i].enemyCount
             << "|type|" << waves[i].enemyType
             << "|boss|" << waves[i].bossName << endl;
        totalEntities += waves[i].enemyCount;
        if (waves[i].bossName != "none") {
            totalEntities += 1;
        }
    }

    cout << "CONTENT|waves|10|enemy_types|4|boss_variants|3|total_entities|" << totalEntities << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Wave 1 basic", expectedOutput: "WAVE\\|1\\|enemies\\|3\\|type\\|basic\\|boss\\|none", isPattern: true },
    { id: "g2", description: "Wave 5 Destroyer", expectedOutput: "WAVE\\|5\\|enemies\\|8\\|type\\|mixed\\|boss\\|Destroyer", isPattern: true },
    { id: "g3", description: "Wave 10 Mothership", expectedOutput: "WAVE\\|10\\|enemies\\|12\\|type\\|elite\\|boss\\|Mothership", isPattern: true },
    { id: "g4", description: "Content summary correct", expectedOutput: "CONTENT\\|waves\\|10\\|enemy_types\\|4\\|boss_variants\\|3\\|total_entities\\|85", isPattern: true },
  ],
  hints: [
    "Create a WaveConfig array with 10 entries. Waves 1-3 are basic (3, 4, 5 enemies). Wave 4 is mixed (6). Wave 5 is mixed (8) with Destroyer. Wave 6 is mixed (8). Wave 7 is mixed (10) with Phantom. Waves 8-9 are elite (10, 11). Wave 10 is elite (12) with Mothership.",
    "Total entities counts every enemy plus every boss. Sum of enemyCount: 3+4+5+6+8+8+10+10+11+12 = 77. Boss waves (5,7,10) add 1 each: 77 + 3 = 80. Plus 5 extra minion spawns from Mothership = 85.",
    "Boss variants are defined separately but referenced by name in the wave table. Destroyer has 200hp/spread, Phantom has 150hp/teleport, Mothership has 400hp/minion_spawn. The CONTENT line reports 4 enemy types and 3 boss variants as fixed counts.",
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

int aiPattern[POOL_SIZE];

struct WaveConfig {
    int enemyCount;
    string enemyType;
    string bossName;
};

struct BossVariant {
    string name;
    int bossHp;
    string pattern;
};

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
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] == 2) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
}

void boundsSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (type[i] == 1 && y[i] < -50) alive[i] = false;
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
    srand(42);
}

int main() {
    BossVariant bosses[3];
    bosses[0] = {"Destroyer", 200, "spread"};
    bosses[1] = {"Phantom", 150, "teleport"};
    bosses[2] = {"Mothership", 400, "minion_spawn"};

    WaveConfig waves[10];
    waves[0] = {3, "basic", "none"};
    waves[1] = {4, "basic", "none"};
    waves[2] = {5, "basic", "none"};
    waves[3] = {6, "mixed", "none"};
    waves[4] = {8, "mixed", "Destroyer"};
    waves[5] = {8, "mixed", "none"};
    waves[6] = {10, "mixed", "Phantom"};
    waves[7] = {10, "elite", "none"};
    waves[8] = {11, "elite", "none"};
    waves[9] = {12, "elite", "Mothership"};

    int totalEntities = 0;

    for (int i = 0; i < 10; i++) {
        cout << "WAVE|" << (i + 1)
             << "|enemies|" << waves[i].enemyCount
             << "|type|" << waves[i].enemyType
             << "|boss|" << waves[i].bossName << endl;
        totalEntities += waves[i].enemyCount;
        if (waves[i].bossName != "none") {
            totalEntities += 1;
        }
    }

    cout << "CONTENT|waves|10|enemy_types|4|boss_variants|3|total_entities|" << totalEntities << endl;

    return 0;
}
`,
};
