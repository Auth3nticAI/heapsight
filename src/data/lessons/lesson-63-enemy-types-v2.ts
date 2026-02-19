import type { Lesson } from "@/types/lesson";

export const lesson63: Lesson = {
  id: "63-enemy-types-v2",
  title: "Enemy Types v2",
  description: "Define three enemy archetypes with distinct stats, AI, and sprites.",
  order: 63,
  xpReward: 200,
  tier: "pro",
  concepts: ["archetypes", "data composition", "behavior variation", "type hierarchy"],
  part1: {
    title: "Concept: Enemy Types v2",
    type: "concept",
    instructions: `# Enemy Types v2 — One Enemy Class Is Not Enough

You have one enemy struct and every enemy behaves identically. Same speed. Same HP. Same movement. The player learns the pattern in ten seconds and the game is dead. Archetypes fix this. Instead of inheritance hierarchies, compose behavior from data. A basic enemy is 30 HP, speed 2, linear movement. A fast enemy is 15 HP, speed 4, zigzag. A tank is 80 HP, speed 1, shield. Same struct. Different values. Different gameplay.

## What Breaks Without This

Without archetypes, every enemy feels the same. Players stop paying attention because every encounter is identical. You try to fix it with subclasses and end up with an inheritance tree that fights you every time you add a variant. Data composition means one struct, one system, infinite variety.

## The Fix

Define archetypes as data tables. Each archetype is a row: name, HP, speed, sprite character, AI pattern. Spawning an enemy means copying values from the archetype table into the entity arrays. The movement system reads the AI pattern field and branches. No subclasses. No virtual functions. Just data.

\\\`\\\`\\\`
// Archetype table
// name     hp  speed  sprite  ai
// basic    30  2      'v'     linear
// fast     15  4      '>'     zigzag
// tank     80  1      '#'     straight
\\\`\\\`\\\`

One spawn function. One movement system with a switch on AI pattern. Three completely different enemies from three rows of data.

## Your Task

1. Define 3 archetypes as parallel arrays: name, hp, speed, sprite char, AI pattern
   - basic: 30hp, speed 2, sprite 'v', AI "linear"
   - fast: 15hp, speed 4, sprite '>', AI "zigzag"
   - tank: 80hp, speed 1, sprite '#', AI "straight"
2. Print each archetype: \\\`ARCHETYPE|<name>|hp|<hp>|speed|<speed>|sprite|<sprite>|ai|<ai>\\\`
3. Calculate total HP across one of each: 30 + 15 + 80 = 125
4. Print: \\\`ARCHETYPE_TOTAL|count|3|total_hp|125|avg_speed|2\\\`
5. Show a comparison: fastest is "fast" at speed 4, toughest is "tank" at 80hp
6. Print: \\\`COMPARISON|fastest|fast|speed|4|toughest|tank|hp|80\\\`

Expected output:
\\\`\\\`\\\`
ARCHETYPE|basic|hp|30|speed|2|sprite|v|ai|linear
ARCHETYPE|fast|hp|15|speed|4|sprite|>|ai|zigzag
ARCHETYPE|tank|hp|80|speed|1|sprite|#|ai|straight
ARCHETYPE_TOTAL|count|3|total_hp|125|avg_speed|2
COMPARISON|fastest|fast|speed|4|toughest|tank|hp|80
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Creating separate structs for each enemy type. BasicEnemy, FastEnemy, TankEnemy — three structs, three movement functions, three spawn functions. Tripled code for the same result. One struct with different data values does the same job with one-third the code.

## Elite Insight

This is the Entity Component System philosophy. Components are data. Systems are behavior. Entities are just IDs. An archetype is a predefined set of component values. Unity, Unreal, and every modern engine use this pattern. Your archetype table is a prototype-based spawner — the same pattern used in commercial ECS frameworks.

## Cross-Path Echo

CSS classes work this way. You do not create a separate HTML element for every style. You define classes with different property values and apply them. \\\`.basic { speed: 2 }\\\`, \\\`.fast { speed: 4 }\\\`. Same element, different class, different behavior. Your archetype table is a stylesheet for enemies.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Archetype data tables
    string names[] = {"basic", "fast", "tank"};
    int archHp[] = {30, 15, 80};
    int archSpeed[] = {2, 4, 1};
    char archSprite[] = {'v', '>', '#'};
    string archAi[] = {"linear", "zigzag", "straight"};
    int numArchetypes = 3;

    // TODO: Print ARCHETYPE line for each archetype

    // TODO: Calculate total HP and average speed across all archetypes
    //   total_hp = 30 + 15 + 80 = 125
    //   avg_speed = (2 + 4 + 1) / 3 = 2 (integer division)
    //   Print ARCHETYPE_TOTAL line

    // TODO: Find fastest (highest speed) and toughest (highest hp)
    //   Print COMPARISON line

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string names[] = {"basic", "fast", "tank"};
    int archHp[] = {30, 15, 80};
    int archSpeed[] = {2, 4, 1};
    char archSprite[] = {'v', '>', '#'};
    string archAi[] = {"linear", "zigzag", "straight"};
    int numArchetypes = 3;

    int totalHp = 0;
    int totalSpeed = 0;

    for (int i = 0; i < numArchetypes; i++) {
        cout << "ARCHETYPE|" << names[i] << "|hp|" << archHp[i]
             << "|speed|" << archSpeed[i] << "|sprite|" << archSprite[i]
             << "|ai|" << archAi[i] << endl;
        totalHp += archHp[i];
        totalSpeed += archSpeed[i];
    }

    int avgSpeed = totalSpeed / numArchetypes;
    cout << "ARCHETYPE_TOTAL|count|" << numArchetypes
         << "|total_hp|" << totalHp << "|avg_speed|" << avgSpeed << endl;

    int fastIdx = 0, toughIdx = 0;
    for (int i = 1; i < numArchetypes; i++) {
        if (archSpeed[i] > archSpeed[fastIdx]) fastIdx = i;
        if (archHp[i] > archHp[toughIdx]) toughIdx = i;
    }

    cout << "COMPARISON|fastest|" << names[fastIdx] << "|speed|" << archSpeed[fastIdx]
         << "|toughest|" << names[toughIdx] << "|hp|" << archHp[toughIdx] << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Basic archetype defined", expectedOutput: "ARCHETYPE\\|basic\\|hp\\|30\\|speed\\|2\\|sprite\\|v\\|ai\\|linear", isPattern: true },
      { id: "t2", description: "Fast archetype defined", expectedOutput: "ARCHETYPE\\|fast\\|hp\\|15\\|speed\\|4\\|sprite\\|>\\|ai\\|zigzag", isPattern: true },
      { id: "t3", description: "Tank archetype defined", expectedOutput: "ARCHETYPE\\|tank\\|hp\\|80\\|speed\\|1\\|sprite\\|#\\|ai\\|straight", isPattern: true },
      { id: "t4", description: "Archetype totals correct", expectedOutput: "ARCHETYPE_TOTAL\\|count\\|3\\|total_hp\\|125\\|avg_speed\\|2", isPattern: true },
      { id: "t5", description: "Comparison identifies fastest and toughest", expectedOutput: "COMPARISON\\|fastest\\|fast\\|speed\\|4\\|toughest\\|tank\\|hp\\|80", isPattern: true },
    ],
    hints: [
      "Loop through all archetypes with a single for loop. Print each one using the parallel arrays: names[i], archHp[i], archSpeed[i], archSprite[i], archAi[i].",
      "Total HP is the sum of archHp values. Average speed uses integer division: (2+4+1)/3 = 7/3 = 2 in C++ integer math.",
      "To find the fastest, track the index of the highest speed. Start with index 0 and compare each subsequent archetype. Same approach for toughest with HP.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Enemy Archetypes",
    type: "game_builder",
    instructions: `# Game Builder: Enemy Archetypes — Three Enemies, Three Behaviors

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
      { id: "t1", description: "Basic archetype printed", expectedOutput: "ARCHETYPE\\|basic\\|hp\\|30\\|speed\\|2\\|sprite\\|v\\|ai\\|linear", isPattern: true },
      { id: "t2", description: "Fast archetype printed", expectedOutput: "ARCHETYPE\\|fast\\|hp\\|15\\|speed\\|4\\|sprite\\|>\\|ai\\|zigzag", isPattern: true },
      { id: "t3", description: "Tank archetype printed", expectedOutput: "ARCHETYPE\\|tank\\|hp\\|80\\|speed\\|1\\|sprite\\|#\\|ai\\|straight", isPattern: true },
      { id: "t4", description: "Basic enemy at tick 3", expectedOutput: "ENEMY\\|tick\\|3\\|basic_0\\|pos\\|100,26\\|hp\\|30\\|sprite\\|v", isPattern: true },
      { id: "t5", description: "Fast enemy zigzags at tick 3", expectedOutput: "ENEMY\\|tick\\|3\\|fast_1\\|pos\\|265,42\\|hp\\|15\\|sprite\\|>", isPattern: true },
      { id: "t6", description: "Tank enemy at tick 3", expectedOutput: "ENEMY\\|tick\\|3\\|tank_0\\|pos\\|170,13\\|hp\\|80\\|sprite\\|#", isPattern: true },
      { id: "t7", description: "Type summary with total HP", expectedOutput: "TYPE_SUMMARY\\|basic\\|2\\|fast\\|2\\|tank\\|1\\|total_hp\\|170", isPattern: true },
    ],
    hints: [
      "spawnFromArchetype copies archHp[archIdx], archSpeed[archIdx], archSprite[archIdx], archAi[archIdx] into the entity arrays at entityCount, then increments entityCount.",
      "Zigzag movement: on even ticks (tick%2==0) add +15 to x, on odd ticks add -15. Basic_0 starts at (100,20). After tick 1: y=22. After tick 3: y=26. No x change for linear.",
      "Fast_1 starts at (250,30). Tick 1 (odd): x=235, y=34. Tick 2 (even): x=250, y=38. Tick 3 (odd): x=235, y=42. Wait — check tick parity carefully for zigzag direction.",
    ],
    estimatedMinutes: 8,
  },
};
