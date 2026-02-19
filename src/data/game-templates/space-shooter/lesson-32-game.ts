import type { GameLessonVariant } from "@/types/game";

export const lesson32SpaceShooter: GameLessonVariant = {
  lessonId: "32-type-safe-ids",
  instructions: `# Type Safe Entity Handles — Passing the Wrong ID Corrupts State Silently

You pass an integer to a function. The function expects a player index. You gave it a component index. The program compiles. The program runs. The program damages the wrong entity. You spend two hours reading logs before you realize the bug was a type confusion that the compiler could have caught for free.

## What Breaks Without This

Raw \\\`int\\\` IDs are interchangeable. \\\`getEntity(5)\\\` and \\\`getComponent(5)\\\` take the same type. Swap them at a call site and the compiler says nothing. In a hot path processing thousands of entities per frame, one wrong index propagates through every downstream system. Movement reads wrong positions. Collision checks wrong bounds. Rendering draws wrong sprites. All because two integers were not distinguished by type.

## The Fix

Wrap each ID category in its own struct. \\\`EntityID\\\` holds an \\\`int value\\\`. \\\`ComponentID\\\` holds an \\\`int value\\\`. Same data, different types. The compiler now rejects \\\`getEntity(ComponentID{5})\\\` because the function signature demands \\\`EntityID\\\`. Zero runtime cost. The struct compiles down to a naked int. The safety is purely at compile time.

Functions that take \\\`EntityID\\\` document their intent in the signature. No comment needed. No naming convention needed. The type system enforces correctness on every call site automatically.

## Your Task

1. Define \\\`EntityID\\\` struct with \\\`int value\\\`
2. Define \\\`ComponentID\\\` struct with \\\`int value\\\`
3. Write \\\`createEntity(EntityID id, string type)\\\` — prints \\\`ENTITY_OP|create|EntityID(X)|type\\\`
4. Write \\\`getHP(EntityID id, int hpArray[], int count)\\\` — returns \\\`hpArray[id.value]\\\` with bounds check
5. Create 3 entities using EntityID: ship (0), alien1 (1), alien2 (2)
6. Look up HP for each via \\\`getHP\\\` with the EntityID
7. Render all entities and print the type-safe lookup results

## Beginner Trap

**Common Mistake:** Making \\\`EntityID\\\` implicitly convertible to \\\`int\\\` with a conversion operator. This defeats the purpose. If \\\`EntityID\\\` silently converts to \\\`int\\\`, you can pass it anywhere an \\\`int\\\` is expected. Keep the wrapper opaque. Access \\\`.value\\\` explicitly when you need the raw integer.

## Elite Insight

Production ECS frameworks use opaque handles — an index plus a generation counter. The generation detects stale references to recycled slots. This lesson builds the foundation: distinct types for distinct domains. The generation counter is the next step.

## Cross-Path Echo

Database ORMs use typed IDs for the same reason. A \\\`UserID\\\` and an \\\`OrderID\\\` are both integers in the database, but the type system prevents you from querying users with an order ID. Same pattern, different domain.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

// Define EntityID struct with int value

// Define ComponentID struct with int value

struct Entity {
    string id;
    string type;
    int x, y, width, height, hp;
    bool alive;
};

void renderEntity(Entity e) {
    if (!e.alive) return;
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.width << "|" << e.height
         << "|" << e.hp << endl;
}

// Write createEntity(EntityID id, string type)

// Write getHP(EntityID id, int hpArray[], int count) — returns hp or -1

int main() {
    // Create 3 entities using EntityID
    // Look up HP for each using getHP
    // Render all entities
    // Print GAME_MESSAGE with HP values
    // Print SCORE|0

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct EntityID {
    int value;
};

struct ComponentID {
    int value;
};

struct Entity {
    string id;
    string type;
    int x, y, width, height, hp;
    bool alive;
};

void renderEntity(Entity e) {
    if (!e.alive) return;
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.width << "|" << e.height
         << "|" << e.hp << endl;
}

void createEntity(EntityID id, string type) {
    cout << "ENTITY_OP|create|EntityID(" << id.value << ")|" << type << endl;
}

int getHP(EntityID id, int hpArray[], int count) {
    if (id.value >= 0 && id.value < count) {
        return hpArray[id.value];
    }
    return -1;
}

int main() {
    const int COUNT = 3;

    EntityID shipId = {0};
    EntityID alien1Id = {1};
    EntityID alien2Id = {2};

    createEntity(shipId, "player");
    createEntity(alien1Id, "enemy");
    createEntity(alien2Id, "enemy");

    Entity entities[COUNT] = {
        {"ship", "player", 180, 300, 24, 24, 100, true},
        {"alien1", "enemy", 100, 40, 22, 22, 30, true},
        {"alien2", "enemy", 200, 40, 22, 22, 30, true}
    };

    int hpArray[COUNT] = {100, 30, 30};

    int shipHP = getHP(shipId, hpArray, COUNT);
    int a1HP = getHP(alien1Id, hpArray, COUNT);
    int a2HP = getHP(alien2Id, hpArray, COUNT);

    for (int i = 0; i < COUNT; i++) {
        renderEntity(entities[i]);
    }

    cout << "GAME_MESSAGE|Type-safe lookup: ship=" << shipHP << "hp alien1=" << a1HP << "hp alien2=" << a2HP << "hp" << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should print create operation for ship", expectedOutput: "ENTITY_OP\\|create\\|EntityID\\(0\\)\\|player", isPattern: true },
    { id: "g2", description: "Should print create operation for alien1", expectedOutput: "ENTITY_OP\\|create\\|EntityID\\(1\\)\\|enemy", isPattern: true },
    { id: "g3", description: "Should print create operation for alien2", expectedOutput: "ENTITY_OP\\|create\\|EntityID\\(2\\)\\|enemy", isPattern: true },
    { id: "g4", description: "Should render ship entity", expectedOutput: "ENTITY\\|ship\\|player\\|180\\|300\\|24\\|24\\|100", isPattern: true },
    { id: "g5", description: "Should render alien1 entity", expectedOutput: "ENTITY\\|alien1\\|enemy\\|100\\|40\\|22\\|22\\|30", isPattern: true },
    { id: "g6", description: "Should show type-safe HP lookup results", expectedOutput: "GAME_MESSAGE\\|Type-safe lookup: ship=100hp alien1=30hp alien2=30hp", isPattern: true },
    { id: "g7", description: "Should output score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "Define `struct EntityID { int value; };` — the compiler treats this as a distinct type from int or ComponentID.",
    "getHP takes EntityID, not int. Access the HP array with `hpArray[id.value]` after checking `id.value < count`.",
    "Create EntityID variables with `EntityID shipId = {0};` and pass them to createEntity and getHP.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

struct EntityID {
    int value;
};

struct ComponentID {
    int value;
};

struct Entity {
    string id;
    string type;
    int x, y, width, height, hp;
    bool alive;
};

void renderEntity(Entity e) {
    if (!e.alive) return;
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.width << "|" << e.height
         << "|" << e.hp << endl;
}

void createEntity(EntityID id, string type) {
    cout << "ENTITY_OP|create|EntityID(" << id.value << ")|" << type << endl;
}

int getHP(EntityID id, int hpArray[], int count) {
    if (id.value >= 0 && id.value < count) {
        return hpArray[id.value];
    }
    return -1;
}

int main() {
    const int COUNT = 3;
    EntityID shipId = {0};
    EntityID alien1Id = {1};
    EntityID alien2Id = {2};
    createEntity(shipId, "player");
    createEntity(alien1Id, "enemy");
    createEntity(alien2Id, "enemy");
    Entity entities[COUNT] = {
        {"ship", "player", 180, 300, 24, 24, 100, true},
        {"alien1", "enemy", 100, 40, 22, 22, 30, true},
        {"alien2", "enemy", 200, 40, 22, 22, 30, true}
    };
    int hpArray[COUNT] = {100, 30, 30};
    int shipHP = getHP(shipId, hpArray, COUNT);
    int a1HP = getHP(alien1Id, hpArray, COUNT);
    int a2HP = getHP(alien2Id, hpArray, COUNT);
    for (int i = 0; i < COUNT; i++) {
        renderEntity(entities[i]);
    }
    cout << "GAME_MESSAGE|Type-safe lookup: ship=" << shipHP << "hp alien1=" << a1HP << "hp alien2=" << a2HP << "hp" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
