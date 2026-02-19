import type { GameLessonVariant } from "@/types/game";

export const lesson34RPG: GameLessonVariant = {
  lessonId: "rpg-34-event-queue",

  instructions: `# Event Queue — Deferred Processing

## Mental Model

There's a pattern here. The player attacks. The enemy dies. Death spawns gold. Gold triggers pickup. Pickup modifies inventory. All of this cascades inside the combat loop. You are modifying entity state while iterating over entity state. That is the oldest bug in game development.

The event queue breaks the cascade. Systems queue events: DAMAGE, DEATH, LOOT, MOVE. After all game logic finishes, a separate phase drains the queue and processes events in order. No modifications during iteration. No cascade mutations. No surprises.

## What Breaks Without This

Immediate handling creates cascade mutations. The combat system kills an enemy inside a loop. The death handler removes the entity. The loop index is wrong. Or worse: the death handler spawns gold, triggers pickup, triggers HUD update — five levels deep in the call stack, all mutating shared state during a single combat calculation.

## The Fix

Two phases. Phase 1: game logic runs and queues events. Phase 2: event processor drains the queue. No state is modified during Phase 1 except through the queue. All mutations happen in Phase 2, against a stable snapshot.

## Pattern Insight

The Event Queue decouples when something happens from when it is processed. This temporal decoupling prevents cascades, enables audit logging (print the queue to see the frame's history), and allows multiple systems to react to the same event without knowing about each other.

## Scalability Insight

New event type = one constant + one case. New producer = one queueEvent call. New consumer = one handler. All additive. The queue scales linearly.

## Your Task

Set up player and enemy. Run combat (3 attacks). Queue all events. Process after. Print the queue summary.

## Common Mistake

Clearing the queue before reporting processed count. Save eventCount to a variable first, then clear.

## Elite Insight

The OS message loop is an event queue. Hardware interrupts queue events. The kernel dispatches them. Windows \`PeekMessage\` is an event queue. Unix \`select()\` is an event queue. Your game queue is the same architecture.

## Pattern Recognition

Event queues apply when: shared state is modified during iteration, multiple systems react to the same event, or cascading side effects create debugging nightmares.

## Skill Reinforcement

- Observer pattern: events are time-decoupled observers
- Component pattern from Lesson 31: events reference entities by index
- Combat loop: queue damage events, defer death processing

## Mastery Check

Why defer? Because immediate action cascades. One event triggers another triggers another. Each mutation happens while the previous is in flight. Deferred processing ensures every event is processed against consistent state. The queue is a transaction boundary.`,

  starterCode: `#include <iostream>
using namespace std;

const int EVENT_DAMAGE = 0;
const int EVENT_DEATH = 1;
const int EVENT_LOOT = 2;
const int EVENT_MOVE = 3;

struct GameEvent {
    int type;
    int sourceId;
    int targetId;
    int value;
};

const int MAX_EVENTS = 50;
GameEvent eventQueue[MAX_EVENTS];
int eventCount = 0;

// TODO: void queueEvent(...)
// TODO: int processEvents()

int main() {
    int playerHP = 100, playerAttack = 10;
    int enemyHP = 30, enemyAttack = 5;
    bool enemyAlive = true;

    // TODO: Combat loop, queue events
    // TODO: Queue move event
    // TODO: Print queued count, process, print summary

    return 0;
}
`,

  solutionCode: `#include <iostream>
using namespace std;

const int EVENT_DAMAGE = 0;
const int EVENT_DEATH = 1;
const int EVENT_LOOT = 2;
const int EVENT_MOVE = 3;

struct GameEvent {
    int type;
    int sourceId;
    int targetId;
    int value;
};

const int MAX_EVENTS = 50;
GameEvent eventQueue[MAX_EVENTS];
int eventCount = 0;

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
                cout << "EVENT[DEATH]: entity " << e.targetId << " died" << endl;
                break;
            case EVENT_LOOT:
                cout << "EVENT[LOOT]: " << e.value << " gold from entity " << e.sourceId << endl;
                break;
            case EVENT_MOVE:
                cout << "EVENT[MOVE]: entity " << e.sourceId << " moved to (10,3)" << endl;
                break;
        }
    }
    eventCount = 0;
    return processed;
}

int main() {
    int playerHP = 100, playerAttack = 10;
    int enemyHP = 30, enemyAttack = 5;
    bool enemyAlive = true;

    for (int i = 0; i < 3; i++) {
        enemyHP -= playerAttack;
        queueEvent(EVENT_DAMAGE, 0, 1, playerAttack);

        if (enemyHP <= 0 && enemyAlive) {
            enemyAlive = false;
            queueEvent(EVENT_DEATH, 0, 1, 0);
            queueEvent(EVENT_LOOT, 1, 0, 25);
        }
    }

    queueEvent(EVENT_MOVE, 0, -1, 0);

    cout << "Queued " << eventCount << " events" << endl;

    int processed = processEvents();

    cout << "Events processed: " << processed << endl;

    cout << "EVENT_QUEUE|queued=" << processed
         << "|processed=" << processed
         << "|remaining=" << eventCount << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Six events queued before processing",
      expectedOutput: "Queued 6 events",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Damage events logged",
      expectedOutput: "EVENT\\[DAMAGE\\]: 10 to entity 1",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Death event logged",
      expectedOutput: "EVENT\\[DEATH\\]: entity 1 died",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Loot event with gold amount",
      expectedOutput: "EVENT\\[LOOT\\]: 25 gold from entity 1",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Move event logged",
      expectedOutput: "EVENT\\[MOVE\\]: entity 0 moved to \\(10,3\\)",
      isPattern: true,
    },
    {
      id: "g6",
      description: "All events processed",
      expectedOutput: "Events processed: 6",
      isPattern: true,
    },
    {
      id: "g7",
      description: "Event queue summary correct",
      expectedOutput: "EVENT_QUEUE\\|queued=6\\|processed=6\\|remaining=0",
      isPattern: true,
    },
  ],

  hints: [
    "3 damage events + 1 death + 1 loot + 1 move = 6 total. Queue them all before processing.",
    "Combat: loop 3 times. Each: enemyHP -= 10, queue DAMAGE. Check death inside loop with enemyAlive guard.",
    "processEvents: save count first, iterate, clear queue, return saved count.",
    "Move event goes after combat. Source is player (0), target is -1 (no target).",
    "Summary: queued and processed both equal 6. remaining = eventCount after processing = 0.",
  ],

  accumulatedCode: `#include <iostream>
#include <sstream>
using namespace std;

// ==============================
// RPG CORE — Lesson 34
// Event Queue: Deferred Processing
// Queue during update. Process after. No cascades.
// ==============================

// === EVENT SYSTEM ===
const int EVENT_DAMAGE = 0;
const int EVENT_DEATH = 1;
const int EVENT_LOOT = 2;
const int EVENT_MOVE = 3;

struct GameEvent {
    int type;
    int sourceId;
    int targetId;
    int value;
};

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
const int MAX_EVENTS = 50;
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

// Event queue
GameEvent eventQueue[MAX_EVENTS];
int eventCount = 0;

// Archetype storage
EnemyArchetype archetypes[MAX_ARCHETYPES];
int archetypeCount = 0;

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
                cout << "EVENT[DEATH]: entity " << e.targetId << " died" << endl;
                break;
            case EVENT_LOOT:
                cout << "EVENT[LOOT]: " << e.value << " gold from entity " << e.sourceId << endl;
                break;
            case EVENT_MOVE:
                cout << "EVENT[MOVE]: entity " << e.sourceId << " moved" << endl;
                break;
        }
    }
    eventCount = 0;
    return processed;
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

// === GRID RENDER ===
void renderGrid(int entityCount) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else {
                bool drawn = false;
                for (int i = 0; i < entityCount; i++) {
                    if (positions[i].x == col && positions[i].y == row && hasStats[i]) {
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
    // Setup
    int playerHP = 100, playerAttack = 10;
    int enemyHP = 30, enemyAttack = 5;
    bool enemyAlive = true;

    // Combat with event queue
    for (int i = 0; i < 3; i++) {
        enemyHP -= playerAttack;
        queueEvent(EVENT_DAMAGE, 0, 1, playerAttack);
        if (enemyHP <= 0 && enemyAlive) {
            enemyAlive = false;
            queueEvent(EVENT_DEATH, 0, 1, 0);
            queueEvent(EVENT_LOOT, 1, 0, 25);
        }
    }
    queueEvent(EVENT_MOVE, 0, -1, 0);

    cout << "Queued " << eventCount << " events" << endl;
    int processed = processEvents();
    cout << "Events processed: " << processed << endl;
    cout << "EVENT_QUEUE|queued=" << processed
         << "|processed=" << processed
         << "|remaining=" << eventCount << endl;

    return 0;
}
`,
};
