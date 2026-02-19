import type { Lesson } from "@/types/lesson";

export const lesson43: Lesson = {
  id: "43-data-driven-enemies",
  title: "Data Driven Enemies",
  description: "Load enemy definitions from data instead of hardcoding them.",
  order: 43,
  xpReward: 175,
  tier: "pro",
  concepts: ["data-driven design", "string parsing", "configuration", "separation of data and logic"],
  part1: {
    title: "Concept: Data-Driven Design",
    type: "concept",
    instructions: `# Data-Driven Design — Hardcoded Stats Are Technical Debt

Every time you write \\\`hp = 30\\\` in your spawn function, you are welding game balance to code. Changing enemy health requires recompiling. A designer cannot tweak values without a programmer. Ten enemy types means ten sets of hardcoded constants scattered across functions. This does not scale.

## The Fix

Define enemy types as data. A string like \\\`"basic,30,10,2"\\\` encodes name, hp, damage, and speed. Parse it at startup. Store the results in an array of structs. The spawn function reads from the parsed definitions instead of hardcoded values. Change the data string, change the game. No recompile.

In a real engine, this data lives in a file — \\\`enemies.txt\\\` or \\\`enemies.json\\\`. We simulate this with string arrays. The parsing logic is identical.

## String Parsing

C++ string parsing with \\\`find\\\` and \\\`substr\\\`:

\\\`\\\`\\\`
string line = "basic,30,10,2";
int p1 = line.find(',');
string name = line.substr(0, p1);
int p2 = line.find(',', p1 + 1);
int hp = stoi(line.substr(p1 + 1, p2 - p1 - 1));
\\\`\\\`\\\`

Each \\\`find\\\` locates the next comma. Each \\\`substr\\\` extracts the field. \\\`stoi\\\` converts string to int.

## Your Task

1. Define a struct \\\`EnemyDef\\\` with fields: \\\`string name\\\`, \\\`int hp\\\`, \\\`int damage\\\`, \\\`int speed\\\`
2. Create a string array with 3 entries: \\\`"basic,30,10,2"\\\`, \\\`"fast,15,5,4"\\\`, \\\`"tank,80,20,1"\\\`
3. Write \\\`parseEnemyDef(string line)\\\` that returns an EnemyDef by parsing the comma-separated fields
4. Parse all 3 entries into an \\\`EnemyDef defs[3]\\\` array
5. Print each parsed definition: \\\`ENEMY_DEF|<name>|hp|<hp>|dmg|<damage>|spd|<speed>\\\`
6. Print: \\\`DATA_SUMMARY|types_loaded|3\\\`

Expected output:
\\\`\\\`\\\`
ENEMY_DEF|basic|hp|30|dmg|10|spd|2
ENEMY_DEF|fast|hp|15|dmg|5|spd|4
ENEMY_DEF|tank|hp|80|dmg|20|spd|1
DATA_SUMMARY|types_loaded|3
\\\`\\\`\\\``,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct EnemyDef {
    string name;
    int hp;
    int damage;
    int speed;
};

// TODO: Write parseEnemyDef(string line) — parse "name,hp,damage,speed"
//       Use find(',') and substr() to extract fields
//       Use stoi() to convert number strings to int

int main() {
    string data[] = {
        "basic,30,10,2",
        "fast,15,5,4",
        "tank,80,20,1"
    };

    EnemyDef defs[3];

    // TODO: Parse each data string into defs array
    // TODO: Print ENEMY_DEF lines
    // TODO: Print DATA_SUMMARY

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
};

EnemyDef parseEnemyDef(string line) {
    EnemyDef def;
    int p1 = line.find(',');
    def.name = line.substr(0, p1);
    int p2 = line.find(',', p1 + 1);
    def.hp = stoi(line.substr(p1 + 1, p2 - p1 - 1));
    int p3 = line.find(',', p2 + 1);
    def.damage = stoi(line.substr(p2 + 1, p3 - p2 - 1));
    def.speed = stoi(line.substr(p3 + 1));
    return def;
}

int main() {
    string data[] = {
        "basic,30,10,2",
        "fast,15,5,4",
        "tank,80,20,1"
    };

    EnemyDef defs[3];

    for (int i = 0; i < 3; i++) {
        defs[i] = parseEnemyDef(data[i]);
        cout << "ENEMY_DEF|" << defs[i].name << "|hp|" << defs[i].hp
             << "|dmg|" << defs[i].damage << "|spd|" << defs[i].speed << endl;
    }

    cout << "DATA_SUMMARY|types_loaded|3" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should parse basic enemy", expectedOutput: "ENEMY_DEF|basic|hp|30|dmg|10|spd|2" },
      { id: "t2", description: "Should parse fast enemy", expectedOutput: "ENEMY_DEF|fast|hp|15|dmg|5|spd|4" },
      { id: "t3", description: "Should parse tank enemy", expectedOutput: "ENEMY_DEF|tank|hp|80|dmg|20|spd|1" },
      { id: "t4", description: "Should report 3 types loaded", expectedOutput: "DATA_SUMMARY|types_loaded|3" },
    ],
    hints: [
      "Use string::find(',') to locate the first comma. substr(0, pos) gives the name. find(',', pos+1) finds the next comma.",
      "stoi() converts a substring to int. Extract each numeric field with substr between two comma positions.",
      "The last field has no trailing comma. Use substr(lastCommaPos + 1) to get everything after the last comma.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Data-Driven Enemy Spawner",
    type: "game_builder",
    instructions: `# Game Builder: Data-Driven Enemy Definitions

Wire data-driven enemy loading into your space shooter. Parse enemy type definitions from data strings. Spawn enemies using the parsed definitions instead of hardcoded values.

## Your Task
1. Define \\\`EnemyDef\\\` struct: name, hp, damage, speed, pattern (all parsed from strings)
2. Data strings simulating enemies.txt:
   - \\\`"basic,30,10,2,down"\\\`
   - \\\`"fast,15,5,4,zigzag"\\\`
   - \\\`"tank,80,20,1,straight"\\\`
   - \\\`"boss,200,50,1,track"\\\`
3. Write \\\`parseEnemyDef(string line)\\\` — parse 5 comma-separated fields
4. Parse all 4 definitions. Print: \\\`ENEMY_DEF|<name>|hp|<hp>|dmg|<dmg>|spd|<spd>|pattern|<pattern>\\\`
5. Spawn 2 enemies per type (8 total) using SoA arrays. For type i, spawn at x=100+i*80, y=40 and x=140+i*80, y=40
6. Print each spawn: \\\`SPAWN_FROM_DATA|type|<name>|hp|<hp>|at|<x>,<y>\\\`
7. Print: \\\`DATA_SUMMARY|types_loaded|4|enemies_spawned|8\\\`
8. Print: \\\`SCORE|0\\\``,
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
      { id: "t1", description: "Should parse basic enemy definition", expectedOutput: "ENEMY_DEF\\|basic\\|hp\\|30\\|dmg\\|10\\|spd\\|2\\|pattern\\|down", isPattern: true },
      { id: "t2", description: "Should parse boss enemy definition", expectedOutput: "ENEMY_DEF\\|boss\\|hp\\|200\\|dmg\\|50\\|spd\\|1\\|pattern\\|track", isPattern: true },
      { id: "t3", description: "Should spawn from data with correct positions", expectedOutput: "SPAWN_FROM_DATA\\|type\\|fast\\|hp\\|15\\|at\\|180,40", isPattern: true },
      { id: "t4", description: "Should report 4 types and 8 spawns", expectedOutput: "DATA_SUMMARY\\|types_loaded\\|4\\|enemies_spawned\\|8", isPattern: true },
      { id: "t5", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
    ],
    hints: [
      "parseEnemyDef uses find(',') four times to locate each comma. The pattern field is the last — use substr(lastComma + 1) with no length to get the rest.",
      "Spawning 2 per type: outer loop over 4 types, inner loop j=0..1. Position x = 100 + i*80 + j*40. This spaces them at 100,140,180,220,260,300,340,380.",
      "Store the type index (0-3) in etype[] so you can look up the EnemyDef later for behavior (pattern, damage).",
    ],
    estimatedMinutes: 10,
  },
};
