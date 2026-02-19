import type { GameLessonVariant } from "@/types/game";

export const lesson33RPG: GameLessonVariant = {
  lessonId: "rpg-33-data-tables",

  instructions: `# Data Tables — Data Drives the Game

## Mental Model

Data drives the game. Code drives the engine. Your engine does not know what a goblin is. It knows what an archetype is. Data says "a goblin has 30 HP, 5 attack, drops 25 gold, and renders as E." The engine reads that and creates it. When a designer wants to add a lich, they add one line of data. The engine does not change. The game changes. That is data-driven design.

## What Breaks Without This

Hardcoded values embed content in logic. A goblin's 30 HP lives on line 47 of main.cpp. A skeleton's 50 HP lives on line 63. A designer wants to rebalance? They recompile. They miss one instance of 30 in a different function? Bug. Data tables centralize truth: one source, many consumers.

## The Fix

Parse a data string into archetype structs. Spawn entities by archetype name lookup. The engine is generic. The data is specific. Change data, change game. Change engine, change capabilities.

\`\`\`
goblin 30 5 25 E
skeleton 50 8 30 E
dragon 200 25 100 D
\`\`\`

## Pattern Insight

Data-driven design is why modding exists. Doom reads WAD files. Skyrim reads ESP files. Your dungeon reads a string. The principle is identical: the engine is content-agnostic. It reads structured data and makes it real.

## Scalability Insight

One new enemy = one new line of data. One new item type = one new line. The engine already knows how to spawn, fight, and loot from archetype data. Content scales with data, not code.

## Your Task

Parse the enemy data string, create archetypes, spawn entities from data, render the grid, attack a goblin using data-driven stats, and print the summary.

## Common Mistake

Hardcoding archetype values defeats the purpose. The parser must read generically: loop, tokenize, populate. The engine should not contain the word "goblin" in its parsing logic.

## Elite Insight

id Software's Doom (1993) stored enemy stats in WAD data lumps. Blizzard's Diablo read from text tables that modders could edit. Data-driven design is not a modern invention. It is a foundational architecture decision that has powered 30 years of moddable games.

## Pattern Recognition

Data tables apply when: balance requires iteration without recompilation, multiple variants of the same concept exist, or designers need autonomy from programmers.

## Skill Reinforcement

- Component pattern from Lesson 31: archetypes fill component arrays
- Struct definitions from Lesson 11: EnemyArchetype holds config data
- String parsing: istringstream tokenizes structured text

## Mastery Check

Why parse at runtime? Because the engine should not know content. It knows structure. Data fills in the specifics. This decoupling means designers iterate in minutes. Without it, they wait for builds.`,

  starterCode: `#include <iostream>
#include <sstream>
using namespace std;

struct EnemyArchetype {
    string name;
    int hp, attack, goldDrop;
    char glyph;
};

struct PositionComponent { int x, y; };
struct StatsComponent { int hp, maxHp, attack; };

const int MAX_ENTITIES = 20;
const int MAX_ARCHETYPES = 10;

PositionComponent positions[MAX_ENTITIES];
StatsComponent stats[MAX_ENTITIES];
bool hasStats[MAX_ENTITIES] = {};
char glyphs[MAX_ENTITIES] = {};

EnemyArchetype archetypes[MAX_ARCHETYPES];
int archetypeCount = 0;

const char* enemyData =
    "goblin 30 5 25 E\\n"
    "skeleton 50 8 30 E\\n"
    "dragon 200 25 100 D\\n";

// TODO: parseEnemyData, findArchetype, spawnFromArchetype

int main() {
    // TODO: Parse data, print archetypes
    // TODO: Set up player, spawn enemies from data
    // TODO: Render grid, print HUD
    // TODO: Attack goblin
    // TODO: Print DATA_TABLES summary

    return 0;
}
`,

  solutionCode: `#include <iostream>
#include <sstream>
using namespace std;

struct EnemyArchetype {
    string name;
    int hp, attack, goldDrop;
    char glyph;
};

struct PositionComponent { int x, y; };
struct StatsComponent { int hp, maxHp, attack; };

const int MAX_ENTITIES = 20;
const int MAX_ARCHETYPES = 10;

PositionComponent positions[MAX_ENTITIES];
StatsComponent stats[MAX_ENTITIES];
bool hasStats[MAX_ENTITIES] = {};
char glyphs[MAX_ENTITIES] = {};

EnemyArchetype archetypes[MAX_ARCHETYPES];
int archetypeCount = 0;

const char* enemyData =
    "goblin 30 5 25 E\\n"
    "skeleton 50 8 30 E\\n"
    "dragon 200 25 100 D\\n";

void parseEnemyData(const char* data) {
    istringstream stream(data);
    string name;
    int hp, attack, goldDrop;
    char glyph;
    while (stream >> name >> hp >> attack >> goldDrop >> glyph) {
        archetypes[archetypeCount] = {name, hp, attack, goldDrop, glyph};
        archetypeCount++;
    }
}

int findArchetype(const string& name) {
    for (int i = 0; i < archetypeCount; i++) {
        if (archetypes[i].name == name) return i;
    }
    return -1;
}

void spawnFromArchetype(int slot, const string& name, int x, int y) {
    int idx = findArchetype(name);
    if (idx < 0) return;
    positions[slot] = {x, y};
    stats[slot] = {archetypes[idx].hp, archetypes[idx].hp, archetypes[idx].attack};
    hasStats[slot] = true;
    glyphs[slot] = archetypes[idx].glyph;
}

int main() {
    parseEnemyData(enemyData);

    for (int i = 0; i < archetypeCount; i++) {
        cout << "Archetype: " << archetypes[i].name
             << " HP=" << archetypes[i].hp
             << " ATK=" << archetypes[i].attack
             << " Gold=" << archetypes[i].goldDrop
             << " Glyph=" << archetypes[i].glyph << endl;
    }

    // Player
    positions[0] = {3, 5};
    stats[0] = {100, 100, 10};
    hasStats[0] = true;
    glyphs[0] = '@';

    spawnFromArchetype(1, "goblin", 10, 3);
    cout << "Spawned goblin at (10,3) with HP=30" << endl;

    spawnFromArchetype(2, "skeleton", 14, 5);
    cout << "Spawned skeleton at (14,5) with HP=50" << endl;

    int entityCount = 3;

    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else {
                bool drawn = false;
                for (int i = 0; i < entityCount; i++) {
                    if (positions[i].x == col && positions[i].y == row) {
                        cout << glyphs[i];
                        drawn = true;
                        break;
                    }
                }
                if (!drawn) cout << '.';
            }
        }
        cout << endl;
    }

    cout << "HUD|HP:" << stats[0].hp << "|Gold:0|Room:0" << endl;

    stats[1].hp -= stats[0].attack;
    cout << "Attack goblin! HP: " << stats[1].hp << endl;

    cout << "DATA_TABLES|archetypes=" << archetypeCount
         << "|spawned=2|from_data=true" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Goblin archetype parsed from data string",
      expectedOutput: "Archetype: goblin HP=30 ATK=5 Gold=25 Glyph=E",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Dragon archetype parsed from data string",
      expectedOutput: "Archetype: dragon HP=200 ATK=25 Gold=100 Glyph=D",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Goblin spawned from archetype",
      expectedOutput: "Spawned goblin at \\(10,3\\) with HP=30",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Skeleton spawned from archetype",
      expectedOutput: "Spawned skeleton at \\(14,5\\) with HP=50",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Grid renders with walls",
      expectedOutput: "####################",
      isPattern: true,
    },
    {
      id: "g6",
      description: "HUD shows initial state",
      expectedOutput: "HUD\\|HP:100\\|Gold:0\\|Room:0",
      isPattern: true,
    },
    {
      id: "g7",
      description: "Combat uses data-driven stats",
      expectedOutput: "Attack goblin! HP: 20",
      isPattern: true,
    },
    {
      id: "g8",
      description: "Data tables summary correct",
      expectedOutput: "DATA_TABLES\\|archetypes=3\\|spawned=2\\|from_data=true",
      isPattern: true,
    },
  ],

  hints: [
    "Parse with istringstream: `while (stream >> name >> hp >> attack >> goldDrop >> glyph)` reads each archetype in a loop.",
    "findArchetype: compare names in a loop. Return the index, or -1 if not found.",
    "spawnFromArchetype: use archetype.hp for both hp and maxHp. Set the glyph from archetype.glyph.",
    "Player glyph is '@', set manually. Enemy glyphs come from parsed data.",
    "Combat math: stats[1].hp (30) - stats[0].attack (10) = 20.",
  ],

  accumulatedCode: `#include <iostream>
#include <sstream>
using namespace std;

// ==============================
// RPG CORE — Lesson 33
// Data Tables: Data Drives the Game
// The engine reads data. Data defines content.
// ==============================

// === DATA TABLES ===
struct EnemyArchetype {
    string name;
    int hp, attack, goldDrop;
    char glyph;
};

// === COMPONENTS ===
struct PositionComponent { int x, y; };
struct StatsComponent { int hp, maxHp, attack; };
struct AIComponent { int aiType; };
struct InventoryComponent { int gold; };

// === TYPE-SAFE IDS ===
struct EntityId {
    int index;
    int generation;
    bool operator==(const EntityId& other) const {
        return index == other.index && generation == other.generation;
    }
    bool operator!=(const EntityId& other) const {
        return !(*this == other);
    }
};
const EntityId INVALID_ID = {-1, -1};

const int MAX_ENTITIES = 20;
const int MAX_ARCHETYPES = 10;

// Component arrays
PositionComponent positions[MAX_ENTITIES];
StatsComponent stats[MAX_ENTITIES];
AIComponent ai[MAX_ENTITIES];
InventoryComponent inventory[MAX_ENTITIES];
char glyphs[MAX_ENTITIES] = {};

// Component masks
bool hasStats[MAX_ENTITIES] = {};
bool hasAI[MAX_ENTITIES] = {};
bool hasInventory[MAX_ENTITIES] = {};

// Generation tracking
int generations[MAX_ENTITIES] = {};

// Archetype storage
EnemyArchetype archetypes[MAX_ARCHETYPES];
int archetypeCount = 0;

// Enemy data
const char* enemyData =
    "goblin 30 5 25 E\\n"
    "skeleton 50 8 30 E\\n"
    "dragon 200 25 100 D\\n";

// === DATA PARSING ===
void parseEnemyData(const char* data) {
    istringstream stream(data);
    string name;
    int hp, attack, goldDrop;
    char glyph;
    while (stream >> name >> hp >> attack >> goldDrop >> glyph) {
        archetypes[archetypeCount] = {name, hp, attack, goldDrop, glyph};
        archetypeCount++;
    }
}

int findArchetype(const string& name) {
    for (int i = 0; i < archetypeCount; i++) {
        if (archetypes[i].name == name) return i;
    }
    return -1;
}

void spawnFromArchetype(int slot, const string& name, int x, int y) {
    int idx = findArchetype(name);
    if (idx < 0) return;
    positions[slot] = {x, y};
    stats[slot] = {archetypes[idx].hp, archetypes[idx].hp, archetypes[idx].attack};
    hasStats[slot] = true;
    glyphs[slot] = archetypes[idx].glyph;
}

// === ID MANAGEMENT ===
EntityId createEntity(int slot) {
    return {slot, generations[slot]};
}
bool isValid(EntityId id) {
    return id.index >= 0 && id.index < MAX_ENTITIES
        && id.generation == generations[id.index];
}
void destroyEntity(int slot) {
    generations[slot]++;
}

// === GRID RENDER ===
void renderGrid(int entityCount) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else {
                bool drawn = false;
                for (int i = 0; i < entityCount; i++) {
                    if (positions[i].x == col && positions[i].y == row) {
                        cout << glyphs[i];
                        drawn = true;
                        break;
                    }
                }
                if (!drawn) cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    parseEnemyData(enemyData);

    for (int i = 0; i < archetypeCount; i++) {
        cout << "Archetype: " << archetypes[i].name
             << " HP=" << archetypes[i].hp
             << " ATK=" << archetypes[i].attack
             << " Gold=" << archetypes[i].goldDrop
             << " Glyph=" << archetypes[i].glyph << endl;
    }

    // Player
    positions[0] = {3, 5};
    stats[0] = {100, 100, 10};
    hasStats[0] = true;
    glyphs[0] = '@';

    spawnFromArchetype(1, "goblin", 10, 3);
    cout << "Spawned goblin at (10,3) with HP=30" << endl;

    spawnFromArchetype(2, "skeleton", 14, 5);
    cout << "Spawned skeleton at (14,5) with HP=50" << endl;

    int entityCount = 3;

    renderGrid(entityCount);
    cout << "HUD|HP:" << stats[0].hp << "|Gold:0|Room:0" << endl;

    stats[1].hp -= stats[0].attack;
    cout << "Attack goblin! HP: " << stats[1].hp << endl;

    cout << "DATA_TABLES|archetypes=" << archetypeCount
         << "|spawned=2|from_data=true" << endl;

    return 0;
}
`,
};
