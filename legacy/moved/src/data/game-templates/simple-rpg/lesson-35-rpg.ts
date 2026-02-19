import type { GameLessonVariant } from "@/types/game";

export const lesson35RPG: GameLessonVariant = {
  lessonId: "rpg-35-pattern-milestone",

  instructions: `# Pattern Milestone: Refactored Dungeon

## THIS IS IT. YOU BUILT AN ARCHITECTURE.

Three rooms. Two data-driven enemies. A treasure room. Components for entity flexibility. Typed IDs for safety. Data tables for configuration. An event queue for decoupled processing. Every pattern from Phase 3 working together. This is not a toy. This is the structural DNA of every dungeon crawler ever shipped.

## Mental Model

The pattern emerges. Ten lessons of tools. One milestone of integration. Components define what entities are. Data tables define what enemies look like. Typed IDs prevent stale references when slots are reused. The event queue decouples combat from its consequences. The factory creates entities from data. The state machine drives game flow. Every pattern has a job. Every job is necessary.

## What Breaks Without This

Remove any pattern and something breaks. Without components, entities are monolithic blobs. Without data tables, adding the skeleton requires hardcoded values scattered across functions. Without the event queue, killing the goblin cascades mutations during iteration. Without typed IDs, reusing slot 1 for the skeleton after the goblin dies creates invisible stale references. Without the factory, entity creation is manual and error-prone. The patterns are not decorative. They are structural.

## The Fix

The architecture is the fix. Data at the foundation. Components for entity structure. Events for communication. Typed IDs for safety. The factory for creation. The state machine for flow. Each layer builds on the one below. Together they form a complete, extensible, data-driven dungeon crawler.

## Pattern Insight

The value of patterns is multiplicative, not additive. Observer alone is notification. Observer + Event Queue is deferred notification. Observer + Event Queue + Components is deferred, entity-aware notification. Each combination unlocks capabilities that no single pattern provides. Eight patterns interacting create a system exponentially more capable than eight patterns in isolation.

## Scalability Insight

3 rooms today. 30 rooms tomorrow. Same architecture. The data file gets more lines. The event queue gets more events. The entity pool gets more entities. No structural changes. That is the hallmark of a correct architecture: content scales by configuration, not by code changes.

## Your Task (MILESTONE — CELEBRATE THIS)

Build the complete 3-room Pattern Dungeon:

**Data:** Parse 2 archetypes. \`Data loaded: 2 archetypes\`
**Room 0:** Player + Goblin. Grid. Combat (3x10). Events (5 processed). Pickup (25 gold).
**Room 1:** Clear slot, spawn Skeleton. Grid. Combat (5x10). Events (7 processed). Pickup (30 gold, total 55).
**Room 2:** Treasure room. Grid with G. Pickup (50 gold, total 105). Save. Milestone. SCORE|315.

## Common Mistake

Forgetting clearEntity before reusing entity slot 1. The goblin's stale component data and generation must be reset before the skeleton can inhabit that slot cleanly.

## Elite Insight

Diablo, Darkest Dungeon, Enter the Gungeon, Hades. Components. Data tables. Events. State machines. Typed IDs. The names change. The scale changes. The architecture does not. You built the universal dungeon crawler architecture. Everything from here is content.

## Pattern Recognition

Integration tests every contract between patterns. "I assumed clearEntity resets alive." "I assumed spawnFromArchetype sets the glyph." Each assumption is a joint. The milestone loads every joint simultaneously. If it holds, the architecture is correct.

## Skill Reinforcement

- Components (L31): parallel arrays + boolean masks
- Typed IDs (L32): generation counter prevents stale references
- Data tables (L33): enemy stats parsed from data string
- Event queue (L34): queue during combat, process after
- Factory: spawnFromArchetype creates entities from data
- State machine: game flow MENU -> PLAYING -> SCORE
- Grid rendering: component positions drive display

## Mastery Check

Why 300 XP? Because integration is combinatorially harder than isolation. Each pattern pair must cooperate. Components + data tables. Data tables + factory. Factory + typed IDs. Events + combat. Events + loot. The number of interactions grows quadratically with the number of patterns. Holding eight patterns in your head simultaneously and making them cooperate — that is architecture. That is what this milestone proves.

You built the architecture. The dungeon is real. The badge is earned.`,

  starterCode: `#include <iostream>
#include <sstream>
using namespace std;

// === EVENTS ===
const int EVENT_DAMAGE = 0;
const int EVENT_DEATH = 1;
const int EVENT_LOOT = 2;
const int EVENT_MOVE = 3;

struct GameEvent { int type, sourceId, targetId, value; };

// === DATA TABLES ===
struct EnemyArchetype { string name; int hp, attack, goldDrop; char glyph; };

// === COMPONENTS ===
struct PositionComponent { int x, y; };
struct StatsComponent { int hp, maxHp, attack; };
struct InventoryComponent { int gold; };

// === ENTITY ID ===
struct EntityId {
    int index, generation;
    bool operator==(const EntityId& o) const { return index == o.index && generation == o.generation; }
    bool operator!=(const EntityId& o) const { return !(*this == o); }
};

const int MAX_ENTITIES = 20;
const int MAX_EVENTS = 50;
const int MAX_ARCHETYPES = 10;

PositionComponent positions[MAX_ENTITIES];
StatsComponent stats[MAX_ENTITIES];
InventoryComponent inventory[MAX_ENTITIES];
char glyphs[MAX_ENTITIES] = {};
bool hasStats[MAX_ENTITIES] = {};
bool hasInventory[MAX_ENTITIES] = {};
bool alive[MAX_ENTITIES] = {};
int generations[MAX_ENTITIES] = {};

GameEvent eventQueue[MAX_EVENTS];
int eventCount = 0;

EnemyArchetype archetypes[MAX_ARCHETYPES];
int archetypeCount = 0;

const char* enemyData =
    "goblin 30 5 25 E\\n"
    "skeleton 50 8 30 E\\n";

// TODO: Implement all functions
// TODO: Build the 3-room dungeon

int main() {
    // TODO: Data -> Room 0 -> Room 1 -> Room 2 -> Victory

    return 0;
}
`,

  solutionCode: `#include <iostream>
#include <sstream>
using namespace std;

// === EVENTS ===
const int EVENT_DAMAGE = 0;
const int EVENT_DEATH = 1;
const int EVENT_LOOT = 2;
const int EVENT_MOVE = 3;

struct GameEvent { int type, sourceId, targetId, value; };

// === DATA TABLES ===
struct EnemyArchetype { string name; int hp, attack, goldDrop; char glyph; };

// === COMPONENTS ===
struct PositionComponent { int x, y; };
struct StatsComponent { int hp, maxHp, attack; };
struct InventoryComponent { int gold; };

// === ENTITY ID ===
struct EntityId {
    int index, generation;
    bool operator==(const EntityId& o) const { return index == o.index && generation == o.generation; }
    bool operator!=(const EntityId& o) const { return !(*this == o); }
};

const int MAX_ENTITIES = 20;
const int MAX_EVENTS = 50;
const int MAX_ARCHETYPES = 10;

PositionComponent positions[MAX_ENTITIES];
StatsComponent stats[MAX_ENTITIES];
InventoryComponent inventory[MAX_ENTITIES];
char glyphs[MAX_ENTITIES] = {};
bool hasStats[MAX_ENTITIES] = {};
bool hasInventory[MAX_ENTITIES] = {};
bool alive[MAX_ENTITIES] = {};
int generations[MAX_ENTITIES] = {};

GameEvent eventQueue[MAX_EVENTS];
int eventCount = 0;

EnemyArchetype archetypes[MAX_ARCHETYPES];
int archetypeCount = 0;

const char* enemyData =
    "goblin 30 5 25 E\\n"
    "skeleton 50 8 30 E\\n";

// === DATA PARSING ===
void parseEnemyData(const char* data) {
    istringstream stream(data);
    string name; int hp, attack, goldDrop; char glyph;
    while (stream >> name >> hp >> attack >> goldDrop >> glyph) {
        archetypes[archetypeCount] = {name, hp, attack, goldDrop, glyph};
        archetypeCount++;
    }
}

int findArchetype(const string& name) {
    for (int i = 0; i < archetypeCount; i++)
        if (archetypes[i].name == name) return i;
    return -1;
}

void spawnFromArchetype(int slot, const string& name, int x, int y) {
    int idx = findArchetype(name);
    if (idx < 0) return;
    positions[slot] = {x, y};
    stats[slot] = {archetypes[idx].hp, archetypes[idx].hp, archetypes[idx].attack};
    hasStats[slot] = true;
    glyphs[slot] = archetypes[idx].glyph;
    alive[slot] = true;
}

// === EVENT QUEUE ===
void queueEvent(int type, int source, int target, int value) {
    if (eventCount < MAX_EVENTS) {
        eventQueue[eventCount] = {type, source, target, value};
        eventCount++;
    }
}

int processEvents() {
    int processed = eventCount;
    for (int i = 0; i < processed; i++) {
        GameEvent& e = eventQueue[i];
        switch (e.type) {
            case EVENT_DAMAGE:
                cout << "EVENT[DAMAGE]: " << e.value << " to entity " << e.targetId << endl;
                break;
            case EVENT_DEATH:
                cout << "EVENT[DEATH]: entity " << e.targetId << endl;
                break;
            case EVENT_LOOT:
                cout << "EVENT[LOOT]: " << e.value << " gold" << endl;
                break;
            case EVENT_MOVE:
                cout << "EVENT[MOVE]: entity " << e.sourceId << endl;
                break;
        }
    }
    eventCount = 0;
    return processed;
}

// === ENTITY MANAGEMENT ===
void clearEntity(int slot) {
    hasStats[slot] = false;
    hasInventory[slot] = false;
    alive[slot] = false;
    glyphs[slot] = '.';
    generations[slot]++;
}

// === GRID RENDER ===
void renderGrid(int px, int py, int entityCount, bool showGold, int gx, int gy) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (showGold && col == gx && row == gy) {
                cout << 'G';
            } else {
                bool drawn = false;
                for (int i = 1; i < entityCount; i++) {
                    if (alive[i] && positions[i].x == col && positions[i].y == row) {
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
    // =========================================================
    // DATA SETUP
    // =========================================================
    parseEnemyData(enemyData);
    cout << "Data loaded: " << archetypeCount << " archetypes" << endl;

    // =========================================================
    // ROOM 0 SETUP
    // =========================================================
    // Player (entity 0)
    positions[0] = {3, 5};
    stats[0] = {100, 100, 10};
    hasStats[0] = true;
    inventory[0] = {0};
    hasInventory[0] = true;
    glyphs[0] = '@';
    alive[0] = true;

    // Goblin (entity 1) — from data table
    spawnFromArchetype(1, "goblin", 10, 3);
    int goblinGold = archetypes[findArchetype("goblin")].goldDrop;
    cout << "Room 0: 2 entities spawned" << endl;

    // =========================================================
    // FRAME 1: MENU
    // =========================================================
    cout << "=== PATTERN DUNGEON ===" << endl;

    // =========================================================
    // FRAME 2: ROOM 0 GRID
    // =========================================================
    int room = 0;
    renderGrid(positions[0].x, positions[0].y, 2, false, 0, 0);
    cout << "HUD|HP:" << stats[0].hp << "|Gold:" << inventory[0].gold << "|Room:" << room << endl;

    // =========================================================
    // FRAME 3: COMBAT — GOBLIN
    // =========================================================
    for (int i = 0; i < 3; i++) {
        stats[1].hp -= stats[0].attack;
        queueEvent(EVENT_DAMAGE, 0, 1, stats[0].attack);
        cout << "Attack! Goblin HP: " << stats[1].hp << endl;
        if (stats[1].hp <= 0 && alive[1]) {
            alive[1] = false;
            queueEvent(EVENT_DEATH, 0, 1, 0);
            queueEvent(EVENT_LOOT, 1, 0, goblinGold);
        }
    }
    cout << "Goblin defeated! Gold dropped." << endl;

    // =========================================================
    // FRAME 4: PROCESS EVENTS
    // =========================================================
    int processed = processEvents();
    cout << "Events processed: " << processed << endl;

    // =========================================================
    // FRAME 5: PICKUP
    // =========================================================
    positions[0] = {10, 3};
    inventory[0].gold += goblinGold;
    cout << "Picked up " << goblinGold << " gold! Total: " << inventory[0].gold << endl;

    // =========================================================
    // FRAME 6: ROOM TRANSITION 0 -> 1
    // =========================================================
    cout << "Room transition: 0 -> 1" << endl;
    room = 1;

    // Clear goblin slot, spawn skeleton from data
    clearEntity(1);
    spawnFromArchetype(1, "skeleton", 8, 4);
    int skelGold = archetypes[findArchetype("skeleton")].goldDrop;
    positions[0] = {1, 5};
    cout << "Room 1: 1 enemy spawned" << endl;

    // =========================================================
    // FRAME 7: ROOM 1 GRID
    // =========================================================
    renderGrid(positions[0].x, positions[0].y, 2, false, 0, 0);
    cout << "HUD|HP:" << stats[0].hp << "|Gold:" << inventory[0].gold << "|Room:" << room << endl;

    // =========================================================
    // FRAME 8: COMBAT — SKELETON
    // =========================================================
    for (int i = 0; i < 5; i++) {
        stats[1].hp -= stats[0].attack;
        queueEvent(EVENT_DAMAGE, 0, 1, stats[0].attack);
        if (stats[1].hp <= 0 && alive[1]) {
            alive[1] = false;
            queueEvent(EVENT_DEATH, 0, 1, 0);
            queueEvent(EVENT_LOOT, 1, 0, skelGold);
        }
    }
    cout << "Skeleton defeated! Gold dropped." << endl;

    processed = processEvents();
    cout << "Events processed: " << processed << endl;

    // Pickup skeleton gold
    positions[0] = {8, 4};
    inventory[0].gold += skelGold;
    cout << "Picked up " << skelGold << " gold! Total: " << inventory[0].gold << endl;

    // =========================================================
    // FRAME 9: ROOM TRANSITION 1 -> 2
    // =========================================================
    cout << "Room transition: 1 -> 2" << endl;
    room = 2;

    clearEntity(1);
    positions[0] = {1, 5};
    cout << "Room 2: Treasure room" << endl;

    // =========================================================
    // FRAME 10: VICTORY
    // =========================================================
    int treasureGold = 50;
    renderGrid(positions[0].x, positions[0].y, 2, true, 10, 5);
    cout << "HUD|HP:" << stats[0].hp << "|Gold:" << inventory[0].gold << "|Room:" << room << endl;

    // Pickup treasure
    positions[0] = {10, 5};
    inventory[0].gold += treasureGold;
    cout << "Picked up " << treasureGold << " gold! Total: " << inventory[0].gold << endl;

    // Save
    cout << "Saving... hp=" << stats[0].hp << " gold=" << inventory[0].gold << " room=" << room << endl;

    // Milestone
    cout << "MILESTONE: Pattern Dungeon Complete!" << endl;
    cout << "SCORE|315" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Data loaded from parsed archetypes",
      expectedOutput: "Data loaded: 2 archetypes",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Room 0 entities spawned from data",
      expectedOutput: "Room 0: 2 entities spawned",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Title screen",
      expectedOutput: "=== PATTERN DUNGEON ===",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Room 0 HUD with initial state",
      expectedOutput: "HUD\\|HP:100\\|Gold:0\\|Room:0",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Goblin defeated in combat",
      expectedOutput: "Goblin defeated! Gold dropped.",
      isPattern: true,
    },
    {
      id: "g6",
      description: "Events processed after goblin fight",
      expectedOutput: "Events processed: 5",
      isPattern: true,
    },
    {
      id: "g7",
      description: "Gold pickup from goblin reaches 25",
      expectedOutput: "Picked up 25 gold! Total: 25",
      isPattern: true,
    },
    {
      id: "g8",
      description: "Room transition to Room 1",
      expectedOutput: "Room transition: 0 -> 1",
      isPattern: true,
    },
    {
      id: "g9",
      description: "Room 1 HUD with 25 gold",
      expectedOutput: "HUD\\|HP:100\\|Gold:25\\|Room:1",
      isPattern: true,
    },
    {
      id: "g10",
      description: "Skeleton defeated in combat",
      expectedOutput: "Skeleton defeated! Gold dropped.",
      isPattern: true,
    },
    {
      id: "g11",
      description: "Gold total 55 after skeleton loot",
      expectedOutput: "Picked up 30 gold! Total: 55",
      isPattern: true,
    },
    {
      id: "g12",
      description: "Treasure room message",
      expectedOutput: "Room 2: Treasure room",
      isPattern: true,
    },
    {
      id: "g13",
      description: "Final gold total 105 from treasure",
      expectedOutput: "Picked up 50 gold! Total: 105",
      isPattern: true,
    },
    {
      id: "g14",
      description: "Save state with final values",
      expectedOutput: "Saving... hp=100 gold=105 room=2",
      isPattern: true,
    },
    {
      id: "g15",
      description: "Milestone complete message",
      expectedOutput: "MILESTONE: Pattern Dungeon Complete!",
      isPattern: true,
    },
    {
      id: "g16",
      description: "Final score output",
      expectedOutput: "SCORE\\|315",
      isPattern: true,
    },
  ],

  hints: [
    "Parse data first with parseEnemyData. Then set up player at entity 0 and spawn goblin at entity 1 using spawnFromArchetype.",
    "Goblin combat: 3 attacks, 10 damage each. Queue EVENT_DAMAGE each time. Queue EVENT_DEATH + EVENT_LOOT when alive[1] transitions to false. Total: 5 events.",
    "Between rooms: clearEntity(1) resets masks, alive flag, glyph, and increments generation. Then spawnFromArchetype reuses slot 1 cleanly.",
    "Skeleton combat: 5 attacks, 10 damage each (50 HP). Same event pattern: 5 DAMAGE + 1 DEATH + 1 LOOT = 7 events.",
    "Room 2: no enemies. Show gold G at (10,5) using renderGrid with showGold=true. Pick up 50 gold for total 105.",
    "Final: save hp=100 gold=105 room=2. Print milestone message. SCORE|315.",
  ],

  accumulatedCode: `#include <iostream>
#include <sstream>
using namespace std;

// ==============================
// RPG CORE — Lesson 35
// PATTERN MILESTONE: Refactored Dungeon
// All patterns. All systems. One architecture.
// ==============================

// === EVENT TYPES ===
const int EVENT_DAMAGE = 0;
const int EVENT_DEATH = 1;
const int EVENT_LOOT = 2;
const int EVENT_MOVE = 3;

struct GameEvent { int type, sourceId, targetId, value; };

// === DATA TABLES ===
struct EnemyArchetype { string name; int hp, attack, goldDrop; char glyph; };

// === COMPONENTS ===
struct PositionComponent { int x, y; };
struct StatsComponent { int hp, maxHp, attack; };
struct InventoryComponent { int gold; };

// === TYPE-SAFE IDS ===
struct EntityId {
    int index, generation;
    bool operator==(const EntityId& o) const { return index == o.index && generation == o.generation; }
    bool operator!=(const EntityId& o) const { return !(*this == o); }
};
const EntityId INVALID_ID = {-1, -1};

const int MAX_ENTITIES = 20;
const int MAX_EVENTS = 50;
const int MAX_ARCHETYPES = 10;

// === COMPONENT ARRAYS ===
PositionComponent positions[MAX_ENTITIES];
StatsComponent stats[MAX_ENTITIES];
InventoryComponent inventory[MAX_ENTITIES];
char glyphs[MAX_ENTITIES] = {};
bool hasStats[MAX_ENTITIES] = {};
bool hasInventory[MAX_ENTITIES] = {};
bool alive[MAX_ENTITIES] = {};
int generations[MAX_ENTITIES] = {};

// === EVENT QUEUE ===
GameEvent eventQueue[MAX_EVENTS];
int eventCount = 0;

// === ARCHETYPE STORAGE ===
EnemyArchetype archetypes[MAX_ARCHETYPES];
int archetypeCount = 0;

const char* enemyData =
    "goblin 30 5 25 E\\n"
    "skeleton 50 8 30 E\\n";

// === DATA PARSING ===
void parseEnemyData(const char* data) {
    istringstream stream(data);
    string name; int hp, attack, goldDrop; char glyph;
    while (stream >> name >> hp >> attack >> goldDrop >> glyph) {
        archetypes[archetypeCount] = {name, hp, attack, goldDrop, glyph};
        archetypeCount++;
    }
}

int findArchetype(const string& name) {
    for (int i = 0; i < archetypeCount; i++)
        if (archetypes[i].name == name) return i;
    return -1;
}

// === FACTORY — Data-Driven Entity Creation ===
void spawnFromArchetype(int slot, const string& name, int x, int y) {
    int idx = findArchetype(name);
    if (idx < 0) return;
    positions[slot] = {x, y};
    stats[slot] = {archetypes[idx].hp, archetypes[idx].hp, archetypes[idx].attack};
    hasStats[slot] = true;
    glyphs[slot] = archetypes[idx].glyph;
    alive[slot] = true;
}

// === EVENT QUEUE ===
void queueEvent(int type, int source, int target, int value) {
    if (eventCount < MAX_EVENTS) {
        eventQueue[eventCount] = {type, source, target, value};
        eventCount++;
    }
}

int processEvents() {
    int processed = eventCount;
    for (int i = 0; i < processed; i++) {
        GameEvent& e = eventQueue[i];
        switch (e.type) {
            case EVENT_DAMAGE:
                cout << "EVENT[DAMAGE]: " << e.value << " to entity " << e.targetId << endl;
                break;
            case EVENT_DEATH:
                cout << "EVENT[DEATH]: entity " << e.targetId << endl;
                break;
            case EVENT_LOOT:
                cout << "EVENT[LOOT]: " << e.value << " gold" << endl;
                break;
            case EVENT_MOVE:
                cout << "EVENT[MOVE]: entity " << e.sourceId << endl;
                break;
        }
    }
    eventCount = 0;
    return processed;
}

// === ENTITY MANAGEMENT — ID + Generation ===
EntityId createEntity(int slot) {
    return {slot, generations[slot]};
}

bool isValid(EntityId id) {
    return id.index >= 0 && id.index < MAX_ENTITIES
        && id.generation == generations[id.index];
}

void clearEntity(int slot) {
    hasStats[slot] = false;
    hasInventory[slot] = false;
    alive[slot] = false;
    glyphs[slot] = '.';
    generations[slot]++;
}

// === GRID RENDER — Component-Driven ===
void renderGrid(int px, int py, int entityCount, bool showGold, int gx, int gy) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (showGold && col == gx && row == gy) {
                cout << 'G';
            } else {
                bool drawn = false;
                for (int i = 1; i < entityCount; i++) {
                    if (alive[i] && positions[i].x == col && positions[i].y == row) {
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

// =========================================================
// MAIN — 3-Room Pattern Dungeon
// =========================================================
int main() {
    // === DATA SETUP ===
    parseEnemyData(enemyData);
    cout << "Data loaded: " << archetypeCount << " archetypes" << endl;

    // === ROOM 0 SETUP ===
    positions[0] = {3, 5};
    stats[0] = {100, 100, 10};
    hasStats[0] = true;
    inventory[0] = {0};
    hasInventory[0] = true;
    glyphs[0] = '@';
    alive[0] = true;

    spawnFromArchetype(1, "goblin", 10, 3);
    int goblinGold = archetypes[findArchetype("goblin")].goldDrop;
    cout << "Room 0: 2 entities spawned" << endl;

    // === MENU ===
    cout << "=== PATTERN DUNGEON ===" << endl;

    // === ROOM 0 GRID ===
    int room = 0;
    renderGrid(positions[0].x, positions[0].y, 2, false, 0, 0);
    cout << "HUD|HP:" << stats[0].hp << "|Gold:" << inventory[0].gold << "|Room:" << room << endl;

    // === COMBAT: GOBLIN ===
    for (int i = 0; i < 3; i++) {
        stats[1].hp -= stats[0].attack;
        queueEvent(EVENT_DAMAGE, 0, 1, stats[0].attack);
        cout << "Attack! Goblin HP: " << stats[1].hp << endl;
        if (stats[1].hp <= 0 && alive[1]) {
            alive[1] = false;
            queueEvent(EVENT_DEATH, 0, 1, 0);
            queueEvent(EVENT_LOOT, 1, 0, goblinGold);
        }
    }
    cout << "Goblin defeated! Gold dropped." << endl;

    int processed = processEvents();
    cout << "Events processed: " << processed << endl;

    positions[0] = {10, 3};
    inventory[0].gold += goblinGold;
    cout << "Picked up " << goblinGold << " gold! Total: " << inventory[0].gold << endl;

    // === ROOM TRANSITION 0 -> 1 ===
    cout << "Room transition: 0 -> 1" << endl;
    room = 1;
    clearEntity(1);
    spawnFromArchetype(1, "skeleton", 8, 4);
    int skelGold = archetypes[findArchetype("skeleton")].goldDrop;
    positions[0] = {1, 5};
    cout << "Room 1: 1 enemy spawned" << endl;

    // === ROOM 1 GRID ===
    renderGrid(positions[0].x, positions[0].y, 2, false, 0, 0);
    cout << "HUD|HP:" << stats[0].hp << "|Gold:" << inventory[0].gold << "|Room:" << room << endl;

    // === COMBAT: SKELETON ===
    for (int i = 0; i < 5; i++) {
        stats[1].hp -= stats[0].attack;
        queueEvent(EVENT_DAMAGE, 0, 1, stats[0].attack);
        if (stats[1].hp <= 0 && alive[1]) {
            alive[1] = false;
            queueEvent(EVENT_DEATH, 0, 1, 0);
            queueEvent(EVENT_LOOT, 1, 0, skelGold);
        }
    }
    cout << "Skeleton defeated! Gold dropped." << endl;

    processed = processEvents();
    cout << "Events processed: " << processed << endl;

    positions[0] = {8, 4};
    inventory[0].gold += skelGold;
    cout << "Picked up " << skelGold << " gold! Total: " << inventory[0].gold << endl;

    // === ROOM TRANSITION 1 -> 2 ===
    cout << "Room transition: 1 -> 2" << endl;
    room = 2;
    clearEntity(1);
    positions[0] = {1, 5};
    cout << "Room 2: Treasure room" << endl;

    // === VICTORY ===
    int treasureGold = 50;
    renderGrid(positions[0].x, positions[0].y, 2, true, 10, 5);
    cout << "HUD|HP:" << stats[0].hp << "|Gold:" << inventory[0].gold << "|Room:" << room << endl;

    positions[0] = {10, 5};
    inventory[0].gold += treasureGold;
    cout << "Picked up " << treasureGold << " gold! Total: " << inventory[0].gold << endl;

    cout << "Saving... hp=" << stats[0].hp << " gold=" << inventory[0].gold << " room=" << room << endl;
    cout << "MILESTONE: Pattern Dungeon Complete!" << endl;
    cout << "SCORE|315" << endl;

    return 0;
}
`,
};
