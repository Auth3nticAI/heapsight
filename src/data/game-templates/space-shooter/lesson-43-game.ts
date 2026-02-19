import type { GameLessonVariant } from "@/types/game";

export const lesson43SpaceShooter: GameLessonVariant = {
  lessonId: "43-data-driven-enemies",
  instructions: `# Data-Driven Enemies — Hardcoded Stats Kill Iteration Speed

You have four enemy types: basic, fast, tank, boss. Each one has hardcoded hp, damage, speed, and movement pattern baked into spawn functions. Changing the boss from 200 hp to 250 hp means finding the right spawn call, editing the constant, recompiling, testing. Multiply by 20 enemy types and 50 balance passes. That is 1000 edit-compile-test cycles for numbers that should live in a text file.

## What Breaks Without This

Game balance iteration stops. Every stat change requires a programmer. Designers cannot experiment. A/B testing enemy configurations requires code branches instead of config swaps. You cannot load different difficulty levels, seasonal events, or DLC enemy packs without recompiling the binary.

## The Fix

Define enemy types as data strings: \\\`"basic,30,10,2,down"\\\`. Parse them at startup into an EnemyDef struct. The spawn system reads from parsed definitions. The code never mentions specific hp values. It reads them from data.

In production, these strings come from files on disk. For now, a string array simulates the file. The parsing logic — \\\`find\\\`, \\\`substr\\\`, \\\`stoi\\\` — is identical either way. The architecture separates what enemies are (data) from how they behave (code).

## Your Task

1. Define \\\`EnemyDef\\\` struct: name, hp, damage, speed, pattern
2. Data strings (simulating enemies.txt):
   - \\\`"basic,30,10,2,down"\\\`
   - \\\`"fast,15,5,4,zigzag"\\\`
   - \\\`"tank,80,20,1,straight"\\\`
   - \\\`"boss,200,50,1,track"\\\`
3. Write \\\`parseEnemyDef(string line)\\\` — parse 5 comma-separated fields
4. Parse all 4 and print: \\\`ENEMY_DEF|<name>|hp|<hp>|dmg|<dmg>|spd|<spd>|pattern|<pattern>\\\`
5. Spawn 2 enemies per type (8 total) into SoA arrays. Type i spawns at x=100+i*80,y=40 and x=140+i*80,y=40
6. Print each: \\\`SPAWN_FROM_DATA|type|<name>|hp|<hp>|at|<x>,<y>\\\`
7. Print: \\\`DATA_SUMMARY|types_loaded|4|enemies_spawned|8\\\`
8. Print \\\`SCORE|0\\\`

## Beginner Trap

**Common Mistake:** Using \\\`find(',')\\\` without specifying a start position for subsequent searches. The first call is \\\`find(',')\\\`. The second must be \\\`find(',', prevPos + 1)\\\`. Without the start offset, you find the first comma again every time and parse the same field repeatedly.

## Elite Insight

This is the foundation of modding. Minecraft, Factorio, Rimworld — all load entity definitions from data files. The engine code never changes. Modders add new enemy types by adding data entries. The parser and spawn system handle them automatically. Data-driven architecture turns a compiled binary into an extensible platform.

## Cross-Path Echo

Web applications use the same pattern. Database schemas define what data exists. Application code processes it generically. Adding a new product type to an e-commerce site means adding a database row, not deploying new code. Configuration over code is universal.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct EnemyDef {
    string name;
    int hp;
    int damage;
    int speed;
    string pattern;
};

const int MAX_ENEMIES = 20;
int ex[MAX_ENEMIES], ey[MAX_ENEMIES];
int ehp[MAX_ENEMIES], espeed[MAX_ENEMIES];
int etype[MAX_ENEMIES];
bool ealive[MAX_ENEMIES];

// TODO: Write parseEnemyDef(string line) — parse "name,hp,damage,speed,pattern"

int main() {
    string data[] = {
        "basic,30,10,2,down",
        "fast,15,5,4,zigzag",
        "tank,80,20,1,straight",
        "boss,200,50,1,track"
    };
    const int TYPE_COUNT = 4;

    EnemyDef defs[4];

    // TODO: Parse all definitions and print ENEMY_DEF lines

    // TODO: Spawn 2 enemies per type into SoA arrays
    //       Type i: spawn at (100+i*80, 40) and (140+i*80, 40)
    //       Print SPAWN_FROM_DATA for each

    // TODO: Print DATA_SUMMARY
    // TODO: Print SCORE|0

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct EnemyDef {
    string name;
    int hp;
    int damage;
    int speed;
    string pattern;
};

const int MAX_ENEMIES = 20;
int ex[MAX_ENEMIES], ey[MAX_ENEMIES];
int ehp[MAX_ENEMIES], espeed[MAX_ENEMIES];
int etype[MAX_ENEMIES];
bool ealive[MAX_ENEMIES];

EnemyDef parseEnemyDef(string line) {
    EnemyDef def;
    int p1 = line.find(',');
    def.name = line.substr(0, p1);
    int p2 = line.find(',', p1 + 1);
    def.hp = stoi(line.substr(p1 + 1, p2 - p1 - 1));
    int p3 = line.find(',', p2 + 1);
    def.damage = stoi(line.substr(p2 + 1, p3 - p2 - 1));
    int p4 = line.find(',', p3 + 1);
    def.speed = stoi(line.substr(p3 + 1, p4 - p3 - 1));
    def.pattern = line.substr(p4 + 1);
    return def;
}

int main() {
    string data[] = {
        "basic,30,10,2,down",
        "fast,15,5,4,zigzag",
        "tank,80,20,1,straight",
        "boss,200,50,1,track"
    };
    const int TYPE_COUNT = 4;

    EnemyDef defs[4];

    for (int i = 0; i < TYPE_COUNT; i++) {
        defs[i] = parseEnemyDef(data[i]);
        cout << "ENEMY_DEF|" << defs[i].name << "|hp|" << defs[i].hp
             << "|dmg|" << defs[i].damage << "|spd|" << defs[i].speed
             << "|pattern|" << defs[i].pattern << endl;
    }

    int enemyCount = 0;
    for (int i = 0; i < TYPE_COUNT; i++) {
        for (int j = 0; j < 2; j++) {
            ex[enemyCount] = 100 + i * 80 + j * 40;
            ey[enemyCount] = 40;
            ehp[enemyCount] = defs[i].hp;
            espeed[enemyCount] = defs[i].speed;
            etype[enemyCount] = i;
            ealive[enemyCount] = true;
            cout << "SPAWN_FROM_DATA|type|" << defs[i].name << "|hp|" << defs[i].hp
                 << "|at|" << ex[enemyCount] << "," << ey[enemyCount] << endl;
            enemyCount++;
        }
    }

    cout << "DATA_SUMMARY|types_loaded|" << TYPE_COUNT << "|enemies_spawned|" << enemyCount << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should parse basic enemy with pattern", expectedOutput: "ENEMY_DEF\\|basic\\|hp\\|30\\|dmg\\|10\\|spd\\|2\\|pattern\\|down", isPattern: true },
    { id: "g2", description: "Should parse boss enemy with pattern", expectedOutput: "ENEMY_DEF\\|boss\\|hp\\|200\\|dmg\\|50\\|spd\\|1\\|pattern\\|track", isPattern: true },
    { id: "g3", description: "Should spawn fast enemies at correct positions", expectedOutput: "SPAWN_FROM_DATA\\|type\\|fast\\|hp\\|15\\|at\\|180,40", isPattern: true },
    { id: "g4", description: "Should report data summary", expectedOutput: "DATA_SUMMARY\\|types_loaded\\|4\\|enemies_spawned\\|8", isPattern: true },
    { id: "g5", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "parseEnemyDef: use find(',') four times with incrementing start positions. The fifth field (pattern) has no trailing comma — use substr(p4+1) to get the rest of the string.",
    "Spawn loop: outer i=0..3 (types), inner j=0..1. Position x = 100 + i*80 + j*40. This gives positions 100,140,180,220,260,300,340,380.",
    "Store etype[enemyCount] = i so the game can look up the EnemyDef by type index for damage, pattern, and other behavior.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 600;
const int FIXED_DT = 16;

struct EnemyDef {
    string name;
    int hp;
    int damage;
    int speed;
    string pattern;
};

int x[POOL_SIZE], y[POOL_SIZE];
int w[POOL_SIZE], h[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], type[POOL_SIZE];
int defIndex[POOL_SIZE];
bool alive[POOL_SIZE];

EnemyDef parseEnemyDef(string line) {
    EnemyDef def;
    int p1 = line.find(',');
    def.name = line.substr(0, p1);
    int p2 = line.find(',', p1 + 1);
    def.hp = stoi(line.substr(p1 + 1, p2 - p1 - 1));
    int p3 = line.find(',', p2 + 1);
    def.damage = stoi(line.substr(p2 + 1, p3 - p2 - 1));
    int p4 = line.find(',', p3 + 1);
    def.speed = stoi(line.substr(p3 + 1, p4 - p3 - 1));
    def.pattern = line.substr(p4 + 1);
    return def;
}

bool checkAABB(int ax, int ay, int aw, int ah, int bx, int by, int bw, int bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

int spawnFromData(int count, EnemyDef defs[], int typeCount) {
    for (int i = 0; i < typeCount; i++) {
        for (int j = 0; j < 2; j++) {
            x[count] = 100 + i * 80 + j * 40;
            y[count] = 40;
            w[count] = 20;
            h[count] = 20;
            vx[count] = 0;
            vy[count] = defs[i].speed;
            hp[count] = defs[i].hp;
            type[count] = 2;
            defIndex[count] = i;
            alive[count] = true;
            count++;
        }
    }
    return count;
}

int spawnBullets(int count, int num) {
    for (int i = 0; i < num; i++) {
        x[count] = 200;
        y[count] = 300 - i * 4;
        w[count] = 6;
        h[count] = 6;
        vx[count] = 0;
        vy[count] = -16;
        hp[count] = 1;
        type[count] = 1;
        alive[count] = true;
        count++;
    }
    return count;
}

int moveSystem(int count) {
    int processed = 0;
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        x[i] += vx[i];
        y[i] += vy[i];
        processed++;
    }
    return processed;
}

void boundsSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (type[i] == 1 && y[i] < 0) alive[i] = false;
    }
}

int collisionSystem(int count) {
    int hits = 0;
    for (int b = 0; b < count; b++) {
        if (!alive[b] || type[b] != 1) continue;
        for (int e = 0; e < count; e++) {
            if (!alive[e] || type[e] != 2) continue;
            if (checkAABB(x[b], y[b], w[b], h[b], x[e], y[e], w[e], h[e])) {
                hp[b] = 0;
                hp[e]--;
                hits++;
                break;
            }
        }
    }
    return hits;
}

int cleanupSystem(int count) {
    int cleaned = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i] && hp[i] <= 0) {
            alive[i] = false;
            cleaned++;
        }
    }
    return cleaned;
}

int countByType(int count, int typeVal) {
    int c = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i] && type[i] == typeVal) c++;
    }
    return c;
}

int main() {
    string enemyData[] = {
        "basic,30,10,2,down",
        "fast,15,5,4,zigzag",
        "tank,80,20,1,straight",
        "boss,200,50,1,track"
    };
    const int TYPE_COUNT = 4;
    EnemyDef defs[4];
    for (int i = 0; i < TYPE_COUNT; i++) {
        defs[i] = parseEnemyDef(enemyData[i]);
    }

    int count = 0;
    count = spawnFromData(count, defs, TYPE_COUNT);
    count = spawnBullets(count, 5);

    int accumulator = 0;
    int totalSteps = 0;
    int frameTimes[] = {16, 32, 16};

    for (int f = 0; f < 3; f++) {
        accumulator += frameTimes[f];
        int stepsThisFrame = 0;
        while (accumulator >= FIXED_DT) {
            moveSystem(count);
            boundsSystem(count);
            collisionSystem(count);
            cleanupSystem(count);
            accumulator -= FIXED_DT;
            stepsThisFrame++;
            totalSteps++;
        }
        int bullets = countByType(count, 1);
        int enemies = countByType(count, 2);
        cout << "FRAME|" << (f + 1) << "|steps|" << stepsThisFrame
             << "|bullets|" << bullets << "|enemies|" << enemies << endl;
    }

    cout << "PIPELINE|spawn|move|bounds|collision|cleanup" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
