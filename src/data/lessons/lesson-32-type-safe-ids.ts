import type { Lesson } from "@/types/lesson";

export const lesson32: Lesson = {
  id: "32-type-safe-ids",
  title: "Type Safe IDs",
  description: "Prevent entity ID bugs at compile time with strong typing.",
  order: 32,
  xpReward: 150,
  tier: "pro",
  concepts: ["type safety", "strong typedef", "compile-time checks", "enum class", "wrapper types"],
  part1: {
    title: "Concept: Type Safe IDs",
    type: "concept",
    instructions: `# Type Safe IDs

Raw \\\`int\\\` IDs are a class of bug that the compiler cannot catch. If your player ID is \\\`3\\\` and your enemy ID is \\\`3\\\`, nothing stops you from passing the enemy ID to a function expecting a player ID. Both are just \\\`int\\\`. The compiler shrugs.

## The Problem

\\\`\\\`\\\`
void damagePlayer(int playerId, int amount);
void damageEnemy(int enemyId, int amount);

int playerId = 3;
int enemyId = 7;
damagePlayer(enemyId, 50);  // Compiles fine. Damages wrong entity.
\\\`\\\`\\\`

This compiles, runs, and silently corrupts your game state. The fix is to make the compiler distinguish between ID types.

## Wrapper Structs

Create a struct that wraps an \\\`int\\\` but is a distinct type:

\\\`\\\`\\\`
struct PlayerID {
    int value;
};

struct EnemyID {
    int value;
};
\\\`\\\`\\\`

Now \\\`PlayerID\\\` and \\\`EnemyID\\\` are different types. A function taking \\\`PlayerID\\\` will not accept an \\\`EnemyID\\\`:

\\\`\\\`\\\`
void damagePlayer(PlayerID id, int amount);
damagePlayer(EnemyID{7}, 50);  // COMPILER ERROR
\\\`\\\`\\\`

## Enum Class for Categories

\\\`enum class\\\` creates strongly-typed enumerations that do not implicitly convert to \\\`int\\\`:

\\\`\\\`\\\`
enum class EntityType { Player, Enemy, Bullet, Particle };
EntityType t = EntityType::Enemy;
// int x = t;  // Error — no implicit conversion
\\\`\\\`\\\`

## Your Task
1. Define a \\\`PlayerID\\\` struct with an \\\`int value\\\` member
2. Define an \\\`EnemyID\\\` struct with an \\\`int value\\\` member
3. Write \\\`printPlayerID(PlayerID id)\\\` that prints \\\`"PlayerID: X"\\\`
4. Write \\\`printEnemyID(EnemyID id)\\\` that prints \\\`"EnemyID: X"\\\`
5. Create a PlayerID with value 1 and EnemyID with value 5
6. Print both IDs using the correct functions
7. Define \\\`enum class EntityType\\\` with Player, Enemy, Bullet
8. Print the enum as int: \\\`"EntityType::Enemy = 1"\\\``,
    starterCode: `#include <iostream>
using namespace std;

// Define PlayerID struct with int value

// Define EnemyID struct with int value

// Define enum class EntityType with Player, Enemy, Bullet

// Write printPlayerID(PlayerID id)

// Write printEnemyID(EnemyID id)

int main() {
    // Create PlayerID with value 1
    // Create EnemyID with value 5
    // Print both using the typed functions

    // Create an EntityType variable set to Enemy
    // Print its integer value using static_cast<int>

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

struct PlayerID {
    int value;
};

struct EnemyID {
    int value;
};

enum class EntityType { Player, Enemy, Bullet };

void printPlayerID(PlayerID id) {
    cout << "PlayerID: " << id.value << endl;
}

void printEnemyID(EnemyID id) {
    cout << "EnemyID: " << id.value << endl;
}

int main() {
    PlayerID pid = {1};
    EnemyID eid = {5};

    printPlayerID(pid);
    printEnemyID(eid);

    EntityType t = EntityType::Enemy;
    cout << "EntityType::Enemy = " << static_cast<int>(t) << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should print PlayerID", expectedOutput: "PlayerID: 1\n" },
      { id: "t2", description: "Should print EnemyID", expectedOutput: "EnemyID: 5\n" },
      { id: "t3", description: "Should print EntityType enum value", expectedOutput: "EntityType::Enemy = 1", isPattern: true },
    ],
    hints: [
      "Define `struct PlayerID { int value; };` — a simple wrapper around int.",
      "Use `static_cast<int>(t)` to print an enum class value as an integer.",
      "PlayerID{1} and EnemyID{5} use aggregate initialization. Pass them to their respective print functions.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Type Safe Entity IDs",
    type: "game_builder",
    instructions: `# Game Builder: Type Safe Entity IDs

Apply the wrapper struct pattern to your space shooter entity system. Instead of passing raw \\\`int\\\` everywhere, you will create \\\`EntityID\\\` and \\\`ComponentID\\\` types that the compiler can distinguish.

## Your Task
1. Define \\\`EntityID\\\` struct wrapping an \\\`int value\\\`
2. Define \\\`ComponentID\\\` struct wrapping an \\\`int value\\\`
3. Write \\\`createEntity(EntityID id, string type)\\\` that prints \\\`"ENTITY_OP|create|EntityID(X)|type"\\\`
4. Write \\\`getHP(EntityID id, int hpArray[], int count)\\\` that returns \\\`hpArray[id.value]\\\` if valid
5. Create 3 entities: ship (EntityID 0), alien1 (EntityID 1), alien2 (EntityID 2)
6. Look up HP for each entity using \\\`getHP\\\` with EntityID
7. Render entities and print a score

Expected output:
\\\`\\\`\\\`
ENTITY_OP|create|EntityID(0)|player
ENTITY_OP|create|EntityID(1)|enemy
ENTITY_OP|create|EntityID(2)|enemy
ENTITY|ship|player|180|300|24|24|100
ENTITY|alien1|enemy|100|40|22|22|30
ENTITY|alien2|enemy|200|40|22|22|30
GAME_MESSAGE|Type-safe lookup: ship=100hp alien1=30hp alien2=30hp
SCORE|0
\\\`\\\`\\\``,
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
      { id: "g3", description: "Should render ship entity", expectedOutput: "ENTITY\\|ship\\|player\\|180\\|300\\|24\\|24\\|100", isPattern: true },
      { id: "g4", description: "Should render alien1 entity", expectedOutput: "ENTITY\\|alien1\\|enemy\\|100\\|40\\|22\\|22\\|30", isPattern: true },
      { id: "g5", description: "Should show type-safe HP lookup", expectedOutput: "GAME_MESSAGE\\|Type-safe lookup: ship=100hp alien1=30hp alien2=30hp", isPattern: true },
      { id: "g6", description: "Should output score", expectedOutput: "SCORE\\|0", isPattern: true },
    ],
    hints: [
      "Define `struct EntityID { int value; };` — a wrapper that the compiler treats as a distinct type from raw int.",
      "getHP takes an EntityID, not an int. Access the array with `hpArray[id.value]` after bounds checking.",
      "Create EntityID variables with `EntityID shipId = {0};` and pass them to createEntity and getHP.",
    ],
    estimatedMinutes: 8,
  },
};
