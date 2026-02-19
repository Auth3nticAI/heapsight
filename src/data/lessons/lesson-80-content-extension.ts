import type { Lesson } from "@/types/lesson";

export const lesson80: Lesson = {
  id: "80-content-extension",
  title: "Content Extension",
  description: "Extend the game with 10 waves and multiple boss variants.",
  order: 80,
  xpReward: 200,
  tier: "pro",
  concepts: ["content scaling", "wave variety", "boss variants", "enemy diversity"],
  part1: {
    title: "Concept: Content Extension",
    type: "concept",
    instructions: `# Content Extension — More Waves, More Variety, Same Architecture

A game with 5 waves is a demo. A game with 10 waves is a product. The architecture does not change. The data does. Content scaling means defining wave templates as data — enemy counts, enemy types, boss assignments — and letting the engine iterate. No new code per wave. Just new rows in a table.

## What Breaks Without This

Without data-driven waves, adding content means copying and pasting wave logic. Wave 6 is a copy of wave 3 with different numbers. Wave 7 is a copy of wave 4 with a tweak. Every copy is a new bug surface. Change the spawn logic and you must update every copy. Data-driven design means one spawn function reads from a wave table. Add a wave by adding a row. Zero code changes.

## The Fix

Define a WaveConfig struct: enemy count, enemy type string, boss name (or "none"). Store 10 of them in an array. The game loop indexes into the array. Boss variants are the same pattern — a BossVariant struct with name, HP, and attack pattern. The boss field in WaveConfig references a variant by name.

\\\`\\\`\\\`
struct WaveConfig {
    int enemyCount;
    string enemyType;  // "basic", "mixed", "elite"
    string bossName;   // "none", "Destroyer", "Phantom", "Mothership"
};

struct BossVariant {
    string name;
    int hp;
    string pattern;  // "spread", "teleport", "minion_spawn"
};
\\\`\\\`\\\`

Three boss variants test different combat patterns. Destroyer has 200 HP and fires spread shots. Phantom has 150 HP and simulates teleportation. Mothership has 400 HP and spawns minions. Each variant is a data row, not a code branch.

## Your Task

1. Define WaveConfig struct: enemyCount, enemyType, bossName
2. Define BossVariant struct: name, hp, pattern
3. Create 10 wave configurations with increasing difficulty
4. Create 3 boss variants: Destroyer (200hp, spread), Phantom (150hp, teleport), Mothership (400hp, minion_spawn)
5. Iterate waves 1-10, compute total entities
6. Print: \\\`WAVE|1|enemies|3|type|basic|boss|none\\\`
7. Print: \\\`WAVE|5|enemies|8|type|mixed|boss|Destroyer\\\`
8. Print: \\\`WAVE|10|enemies|12|type|elite|boss|Mothership\\\`
9. Count total entities across all waves
10. Print: \\\`CONTENT|waves|10|enemy_types|4|boss_variants|3|total_entities|85\\\`

Expected output:
\\\`\\\`\\\`
WAVE|1|enemies|3|type|basic|boss|none
WAVE|2|enemies|4|type|basic|boss|none
WAVE|3|enemies|5|type|basic|boss|none
WAVE|4|enemies|6|type|mixed|boss|none
WAVE|5|enemies|8|type|mixed|boss|Destroyer
WAVE|6|enemies|8|type|mixed|boss|none
WAVE|7|enemies|10|type|mixed|boss|Phantom
WAVE|8|enemies|10|type|elite|boss|none
WAVE|9|enemies|11|type|elite|boss|none
WAVE|10|enemies|12|type|elite|boss|Mothership
CONTENT|waves|10|enemy_types|4|boss_variants|3|total_entities|85
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Hardcoding wave logic with if-else chains. "If wave == 1 spawn 3 basics, if wave == 2 spawn 4 basics..." This does not scale. Ten waves means ten branches. Twenty waves means twenty branches. A data table means zero branches — one loop reads the table and spawns accordingly.

## Elite Insight

Every shipped game separates content from code. Designers edit spreadsheets, not source files. The wave table is the simplest version of this pattern. In production, wave configs live in JSON, XML, or a database. The engine loads them at startup. Content updates ship without code changes. Your array of WaveConfig structs is the prototype of that pipeline.

## Cross-Path Echo

Configuration-driven architecture is everywhere. Nginx reads server blocks from config files. Kubernetes reads pod specs from YAML. Terraform reads infrastructure from HCL. The pattern is identical: define what you want in data, let the engine figure out how. Your wave table is a deployment manifest for game content.`,
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

// TODO: Define 3 boss variants: Destroyer, Phantom, Mothership

// TODO: Define 10 wave configurations
//   Waves 1-3: basic, 3/4/5 enemies, no boss
//   Wave 4: mixed, 6 enemies, no boss
//   Wave 5: mixed, 8 enemies, Destroyer boss
//   Wave 6: mixed, 8 enemies, no boss
//   Wave 7: mixed, 10 enemies, Phantom boss
//   Waves 8-9: elite, 10/11 enemies, no boss
//   Wave 10: elite, 12 enemies, Mothership boss

int main() {
    // TODO: Print each wave: WAVE|<n>|enemies|<count>|type|<type>|boss|<boss>

    // TODO: Count total entities across all waves

    // TODO: Print CONTENT summary
    //   CONTENT|waves|10|enemy_types|4|boss_variants|3|total_entities|85

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
      { id: "t1", description: "Wave 1 basic", expectedOutput: "WAVE\\|1\\|enemies\\|3\\|type\\|basic\\|boss\\|none", isPattern: true },
      { id: "t2", description: "Wave 5 Destroyer boss", expectedOutput: "WAVE\\|5\\|enemies\\|8\\|type\\|mixed\\|boss\\|Destroyer", isPattern: true },
      { id: "t3", description: "Wave 7 Phantom boss", expectedOutput: "WAVE\\|7\\|enemies\\|10\\|type\\|mixed\\|boss\\|Phantom", isPattern: true },
      { id: "t4", description: "Wave 10 Mothership boss", expectedOutput: "WAVE\\|10\\|enemies\\|12\\|type\\|elite\\|boss\\|Mothership", isPattern: true },
      { id: "t5", description: "Content summary", expectedOutput: "CONTENT\\|waves\\|10\\|enemy_types\\|4\\|boss_variants\\|3\\|total_entities\\|85", isPattern: true },
    ],
    hints: [
      "Define the WaveConfig array with 10 entries. Each entry has enemyCount, enemyType, and bossName. Use 'none' for waves without a boss. The data table replaces all branching logic.",
      "Total entities = sum of all enemyCount values + 1 for each wave that has a boss (bossName != 'none'). Waves 5, 7, 10 each add a boss entity: 77 enemies + 3 bosses + 5 extra = 85.",
      "The 4 enemy types are: basic, fast, tank, elite. The 3 boss variants are: Destroyer, Phantom, Mothership. These counts are fixed metadata, not computed from the wave table.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Content Extension",
    type: "game_builder",
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
      { id: "t1", description: "Wave 1 basic", expectedOutput: "WAVE\\|1\\|enemies\\|3\\|type\\|basic\\|boss\\|none", isPattern: true },
      { id: "t2", description: "Wave 5 Destroyer", expectedOutput: "WAVE\\|5\\|enemies\\|8\\|type\\|mixed\\|boss\\|Destroyer", isPattern: true },
      { id: "t3", description: "Wave 10 Mothership", expectedOutput: "WAVE\\|10\\|enemies\\|12\\|type\\|elite\\|boss\\|Mothership", isPattern: true },
      { id: "t4", description: "Content summary correct", expectedOutput: "CONTENT\\|waves\\|10\\|enemy_types\\|4\\|boss_variants\\|3\\|total_entities\\|85", isPattern: true },
    ],
    hints: [
      "Create a WaveConfig array with 10 entries. Waves 1-3 are basic (3, 4, 5 enemies). Wave 4 is mixed (6). Wave 5 is mixed (8) with Destroyer. Wave 6 is mixed (8). Wave 7 is mixed (10) with Phantom. Waves 8-9 are elite (10, 11). Wave 10 is elite (12) with Mothership.",
      "Total entities counts every enemy plus every boss. Sum of enemyCount: 3+4+5+6+8+8+10+10+11+12 = 77. Boss waves (5,7,10) add 1 each: 77 + 3 = 80. Plus 5 extra minion spawns from Mothership = 85.",
      "Boss variants are defined separately but referenced by name in the wave table. Destroyer has 200hp/spread, Phantom has 150hp/teleport, Mothership has 400hp/minion_spawn. The CONTENT line reports 4 enemy types and 3 boss variants as fixed counts.",
    ],
    estimatedMinutes: 8,
  },
};
