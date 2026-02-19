import type { GameLessonVariant } from "@/types/game";

export const lesson32RPG: GameLessonVariant = {
  lessonId: "rpg-32-type-safe-ids",

  instructions: `# Type-Safe Entity IDs — Strong Typing

## Mental Model

There's a pattern here. Two ints walk into a function. One is an entity ID. One is a damage amount. The function cannot tell them apart. The compiler cannot tell them apart. The bug ships because nobody told the type system that these two numbers mean fundamentally different things.

Strong typing fixes this. Wrap the raw int in a struct. Now the compiler knows that an \`EntityId\` is not an \`int\`. You cannot pass a gold count where an entity reference belongs. The type system becomes your first line of defense against an entire class of silent bugs.

## What Breaks Without This

Parameter swaps: \`attack(targetId, damage)\` called as \`attack(damage, targetId)\`. Both ints. Both compile. One is wrong. Stale references: entity 5 dies, slot recycled, new entity spawns at slot 5. Old cached ID now points to the wrong entity. Without generations, this is undetectable.

## The Fix

\`EntityId\` struct: index + generation. Generation increments on destroy. \`isValid()\` checks both fields match. Stale references are caught before they cause damage.

## Pattern Insight

Strong typing moves bug detection from runtime to compile time. The \`EntityId\` struct costs zero additional runtime — same two ints — but prevents parameter swaps and stale references at the type level. Types are contracts. Contracts prevent bugs.

## Scalability Insight

Every new function that accepts \`EntityId\` instead of \`int\` is automatically protected against parameter swaps. Every cached ID is automatically validatable via \`isValid()\`. Protection scales with the codebase.

## Your Task

Build the full type-safe ID system: create entities, destroy one, recreate at the same slot, detect stale references, validate current references. Print the ID_SYSTEM summary.

## Common Mistake

Forgetting to cache the old ID before destroying. After destroyEntity increments the generation, you cannot reconstruct the old ID without knowing what the generation was. Save first, destroy second.

## Elite Insight

Rust prevents this class of bug at the language level with its borrow checker. C++ lacks that, so the generation counter is the manual equivalent. Every serious C++ entity system implements generations.

## Pattern Recognition

Type-safe IDs apply whenever two different concepts share the same raw type. Entity ID vs. room index. Item slot vs. item type. If parameters can swap without compiler errors, they need different types.

## Skill Reinforcement

- Entity pools from Lesson 17: slot reuse demands stale reference detection
- Component pattern from Lesson 31: components reference entities by typed ID
- Error handling from Lesson 22: isValid gates all entity access

## Mastery Check

Why index AND generation? Because the index identifies a slot, not an entity. Slot 5 gen 0 is the skeleton. Slot 5 gen 1 is the goblin. Without generation, all references to slot 5 are ambiguous after recycling.`,

  starterCode: `#include <iostream>
using namespace std;

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
int generations[MAX_ENTITIES] = {};

// TODO: EntityId createEntity(int slot)

// TODO: bool isValid(EntityId id)

// TODO: void destroyEntity(int slot)

int main() {
    // TODO: Create 3 entities, print each
    // TODO: Destroy entity at slot 1
    // TODO: Create new entity at slot 1
    // TODO: Validate old vs new IDs
    // TODO: Print ID_SYSTEM summary

    return 0;
}
`,

  solutionCode: `#include <iostream>
using namespace std;

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
int generations[MAX_ENTITIES] = {};

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

int main() {
    EntityId player = createEntity(0);
    cout << "Created: Entity(index=" << player.index << ",gen=" << player.generation << ")" << endl;

    EntityId enemy = createEntity(1);
    cout << "Created: Entity(index=" << enemy.index << ",gen=" << enemy.generation << ")" << endl;

    EntityId gold = createEntity(2);
    cout << "Created: Entity(index=" << gold.index << ",gen=" << gold.generation << ")" << endl;

    EntityId oldEnemy = enemy;
    destroyEntity(1);
    cout << "Destroyed entity at slot 1" << endl;

    EntityId newEnemy = createEntity(1);
    cout << "Created: Entity(index=" << newEnemy.index << ",gen=" << newEnemy.generation << ")" << endl;

    if (!isValid(oldEnemy)) {
        cout << "Stale reference detected: Entity(index=" << oldEnemy.index << ",gen=" << oldEnemy.generation << ")" << endl;
    }

    if (isValid(newEnemy)) {
        cout << "Valid reference: Entity(index=" << newEnemy.index << ",gen=" << newEnemy.generation << ")" << endl;
    }

    int total = 3;
    int valid = 0, stale = 0;
    EntityId allIds[] = {player, newEnemy, gold};
    EntityId staleIds[] = {oldEnemy};
    for (int i = 0; i < 3; i++) {
        if (isValid(allIds[i])) valid++;
    }
    for (int i = 0; i < 1; i++) {
        if (!isValid(staleIds[i])) stale++;
    }

    cout << "ID_SYSTEM|total=" << total
         << "|generations=[" << generations[0] << "," << generations[1] << "," << generations[2] << "]"
         << "|valid=" << valid
         << "|stale=" << stale << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "First entity created at slot 0 gen 0",
      expectedOutput: "Created: Entity\\(index=0,gen=0\\)",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Entity at slot 1 destroyed",
      expectedOutput: "Destroyed entity at slot 1",
      isPattern: true,
    },
    {
      id: "g3",
      description: "New entity at slot 1 has generation 1",
      expectedOutput: "Created: Entity\\(index=1,gen=1\\)",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Old ID detected as stale",
      expectedOutput: "Stale reference detected: Entity\\(index=1,gen=0\\)",
      isPattern: true,
    },
    {
      id: "g5",
      description: "New ID validated successfully",
      expectedOutput: "Valid reference: Entity\\(index=1,gen=1\\)",
      isPattern: true,
    },
    {
      id: "g6",
      description: "ID system summary correct",
      expectedOutput: "ID_SYSTEM\\|total=3\\|generations=\\[0,1,0\\]\\|valid=3\\|stale=1",
      isPattern: true,
    },
  ],

  hints: [
    "createEntity just returns {slot, generations[slot]}. It reads the current generation, does not modify it.",
    "destroyEntity(1) increments generations[1] from 0 to 1. All old IDs with gen=0 for slot 1 are now stale.",
    "Cache old ID: `EntityId oldEnemy = enemy;` BEFORE calling destroyEntity.",
    "isValid checks: index in bounds AND generation matches generations[index].",
    "Summary: generations[0]=0, generations[1]=1, generations[2]=0 after one destroy+recreate at slot 1.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

// ==============================
// RPG CORE — Lesson 32
// Type-Safe Entity IDs
// An EntityId is not an int. It carries identity AND generation.
// ==============================

// === TYPE-SAFE ID ===
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

// === COMPONENTS (from Lesson 31) ===
struct PositionComponent { int x, y; };
struct StatsComponent { int hp, maxHp, attack; };
struct AIComponent { int aiType; };
struct InventoryComponent { int gold; };

const int MAX_ENTITIES = 20;

// Component arrays
PositionComponent positions[MAX_ENTITIES];
StatsComponent stats[MAX_ENTITIES];
AIComponent ai[MAX_ENTITIES];
InventoryComponent inventory[MAX_ENTITIES];

// Component masks
bool hasStats[MAX_ENTITIES] = {};
bool hasAI[MAX_ENTITIES] = {};
bool hasInventory[MAX_ENTITIES] = {};

// Generation tracking
int generations[MAX_ENTITIES] = {};

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

int main() {
    // Create entities
    EntityId player = createEntity(0);
    positions[0] = {3, 5};
    stats[0] = {100, 100, 10};
    hasStats[0] = true;
    inventory[0] = {0};
    hasInventory[0] = true;
    cout << "Created: Entity(index=" << player.index << ",gen=" << player.generation << ")" << endl;

    EntityId enemy = createEntity(1);
    positions[1] = {10, 3};
    stats[1] = {30, 30, 5};
    hasStats[1] = true;
    ai[1] = {1};
    hasAI[1] = true;
    cout << "Created: Entity(index=" << enemy.index << ",gen=" << enemy.generation << ")" << endl;

    EntityId gold = createEntity(2);
    positions[2] = {15, 7};
    inventory[2] = {25};
    hasInventory[2] = true;
    cout << "Created: Entity(index=" << gold.index << ",gen=" << gold.generation << ")" << endl;

    // Destroy + recreate at slot 1
    EntityId oldEnemy = enemy;
    destroyEntity(1);
    cout << "Destroyed entity at slot 1" << endl;

    EntityId newEnemy = createEntity(1);
    cout << "Created: Entity(index=" << newEnemy.index << ",gen=" << newEnemy.generation << ")" << endl;

    // Stale reference check
    if (!isValid(oldEnemy)) {
        cout << "Stale reference detected: Entity(index=" << oldEnemy.index << ",gen=" << oldEnemy.generation << ")" << endl;
    }
    if (isValid(newEnemy)) {
        cout << "Valid reference: Entity(index=" << newEnemy.index << ",gen=" << newEnemy.generation << ")" << endl;
    }

    // Summary
    cout << "ID_SYSTEM|total=3"
         << "|generations=[" << generations[0] << "," << generations[1] << "," << generations[2] << "]"
         << "|valid=3|stale=1" << endl;

    return 0;
}
`,
};
