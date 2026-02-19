import type { GameLessonVariant } from "@/types/game";

export const lesson29SpaceShooter: GameLessonVariant = {
  lessonId: "29-unique-ptr-ownership",
  instructions: `# MILESTONE 29: unique_ptr Ownership — When Raw Pointers Leak Your Ship

Every raw \\\`new\\\` without a matching \\\`delete\\\` is a memory leak. Every \\\`delete\\\` on an already-freed pointer is a crash. In a game loop running 60 frames per second, spawning and destroying entities constantly, manual memory management is a ticking bomb. The type system can enforce correctness here. Let it.

## What Breaks Without This

Raw \\\`Entity*\\\` scattered across your codebase. You \\\`new\\\` an enemy in the spawn system, pass the pointer to the movement system, the collision system, the render system. Who deletes it? Everyone assumes someone else will. Nobody does. That is a leak. Or worse — two systems both delete it. That is a double-free crash mid-frame.

## The Fix

\\\`unique_ptr<Entity>\\\` encodes ownership in the type. Exactly one unique_ptr owns each entity. When it goes out of scope, the entity is deleted. No manual cleanup. No double-free. The compiler enforces single ownership — you cannot copy a unique_ptr, only \\\`std::move()\\\` it. This makes ownership transfer explicit in the data flow.

\\\`make_unique<Entity>(args)\\\` constructs the entity and wraps it in one allocation. The constructor fires immediately. The destructor fires when the owning unique_ptr dies. This is deterministic cleanup — no garbage collector, no reference counting overhead. Just scope-based lifetime.

When you transfer an entity to a targeting system with \\\`std::move()\\\`, the source becomes \\\`nullptr\\\`. Any code that tries to use the moved-from pointer gets a null check failure, not a use-after-free. The bug becomes visible and safe instead of silent and catastrophic.

## Your Task

1. Define Entity struct with constructor printing \\\`SPAWN|<id>\\\` and destructor printing \\\`CLEANUP|<id>\\\`
2. Create player ship as \\\`unique_ptr<Entity>\\\` using \\\`make_unique\\\` — (180,300,100hp)
3. Create 3 enemy \\\`unique_ptr<Entity>\\\` objects — alien1 (100,40,30hp), alien2 (200,40,30hp), alien3 (300,40,30hp)
4. Transfer alien2 to a \\\`target\\\` variable with \\\`std::move()\\\` — the enemies array slot becomes null
5. Render alive entities with \\\`ENTITY|id|type|x|y|hp\\\`, skip null pointers
6. Print the target with \\\`TARGET|id|type|x|y|hp\\\` format
7. Print \\\`SCORE|0\\\` then let scope exit handle all cleanup

## Beginner Trap

**Common Mistake:** Accessing a unique_ptr after \\\`std::move()\\\`. The moved-from pointer is nullptr. Always null-check before dereferencing. The renderEntity function must guard against null — \\\`if (!e) return;\\\` before touching any fields.

## Elite Insight

unique_ptr has zero runtime overhead compared to a raw pointer. No reference count. No heap metadata. The destructor call is inlined by the compiler. You get safety for free. This is why Carmack said C++ RAII is one of the language's genuinely good ideas.

## Cross-Path Echo

Database connections, file handles, network sockets — any resource that must be released exactly once maps to unique_ptr semantics. RAII is not a game pattern. It is a resource management pattern.`,
  starterCode: `#include <iostream>
#include <string>
#include <memory>
using namespace std;

struct Entity {
    string id;
    string type;
    int x, y, hp;
    bool alive;

    // TODO: Constructor that prints "SPAWN|<id>"

    // TODO: Destructor that prints "CLEANUP|<id>"
};

void renderEntity(Entity* e) {
    if (!e || !e->alive) return;
    cout << "ENTITY|" << e->id << "|" << e->type << "|"
         << e->x << "|" << e->y << "|" << e->hp << endl;
}

int main() {
    // TODO: Create unique_ptr for player ship

    // TODO: Create 3 enemy unique_ptrs

    // TODO: Transfer alien2 ownership to 'target' using std::move

    // TODO: Render alive entities (alien2 was moved, skip null)

    // TODO: Render target separately with "TARGET|..." format

    // TODO: Print SCORE|0

    // Automatic cleanup happens here

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
#include <memory>
using namespace std;

struct Entity {
    string id;
    string type;
    int x, y, hp;
    bool alive;

    Entity(string i, string t, int px, int py, int h)
        : id(i), type(t), x(px), y(py), hp(h), alive(true) {
        cout << "SPAWN|" << id << endl;
    }

    ~Entity() {
        cout << "CLEANUP|" << id << endl;
    }
};

void renderEntity(Entity* e) {
    if (!e || !e->alive) return;
    cout << "ENTITY|" << e->id << "|" << e->type << "|"
         << e->x << "|" << e->y << "|" << e->hp << endl;
}

int main() {
    auto ship = make_unique<Entity>("ship", "player", 180, 300, 100);

    unique_ptr<Entity> enemies[3];
    enemies[0] = make_unique<Entity>("alien1", "enemy", 100, 40, 30);
    enemies[1] = make_unique<Entity>("alien2", "enemy", 200, 40, 30);
    enemies[2] = make_unique<Entity>("alien3", "enemy", 300, 40, 30);

    auto target = std::move(enemies[1]);

    renderEntity(ship.get());
    for (int i = 0; i < 3; i++) {
        renderEntity(enemies[i].get());
    }

    cout << "TARGET|" << target->id << "|" << target->type << "|"
         << target->x << "|" << target->y << "|" << target->hp << endl;

    cout << "SCORE|0" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should spawn all entities in order", expectedOutput: "SPAWN\\|ship.*SPAWN\\|alien1.*SPAWN\\|alien2.*SPAWN\\|alien3", isPattern: true },
    { id: "g2", description: "Should render ship entity", expectedOutput: "ENTITY\\|ship\\|player\\|180\\|300\\|100", isPattern: true },
    { id: "g3", description: "Should render alien1 (not moved)", expectedOutput: "ENTITY\\|alien1\\|enemy\\|100\\|40\\|30", isPattern: true },
    { id: "g4", description: "Should render alien3 (not moved)", expectedOutput: "ENTITY\\|alien3\\|enemy\\|300\\|40\\|30", isPattern: true },
    { id: "g5", description: "Should show transferred target", expectedOutput: "TARGET\\|alien2\\|enemy\\|200\\|40\\|30", isPattern: true },
    { id: "g6", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
    { id: "g7", description: "Should auto-cleanup alien2", expectedOutput: "CLEANUP\\|alien2", isPattern: true },
    { id: "g8", description: "Should auto-cleanup ship", expectedOutput: "CLEANUP\\|ship", isPattern: true },
  ],
  hints: [
    "Use `make_unique<Entity>(\"ship\", \"player\", 180, 300, 100)` to create smart pointer entities. Access fields with `->` not `.`.",
    "After `auto target = std::move(enemies[1]);`, enemies[1] is nullptr. The renderEntity function checks `if (!e)` and skips null pointers.",
    "Destructors fire automatically when unique_ptrs leave scope. The order is reverse of declaration — target first, then enemies array, then ship.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
#include <memory>
using namespace std;

struct Entity {
    string id;
    string type;
    int x, y, hp;
    bool alive;

    Entity(string i, string t, int px, int py, int h)
        : id(i), type(t), x(px), y(py), hp(h), alive(true) {
        cout << "SPAWN|" << id << endl;
    }

    ~Entity() {
        cout << "CLEANUP|" << id << endl;
    }
};

void renderEntity(Entity* e) {
    if (!e || !e->alive) return;
    cout << "ENTITY|" << e->id << "|" << e->type << "|"
         << e->x << "|" << e->y << "|" << e->hp << endl;
}

int main() {
    auto ship = make_unique<Entity>("ship", "player", 180, 300, 100);

    unique_ptr<Entity> enemies[3];
    enemies[0] = make_unique<Entity>("alien1", "enemy", 100, 40, 30);
    enemies[1] = make_unique<Entity>("alien2", "enemy", 200, 40, 30);
    enemies[2] = make_unique<Entity>("alien3", "enemy", 300, 40, 30);

    auto target = std::move(enemies[1]);

    renderEntity(ship.get());
    for (int i = 0; i < 3; i++) {
        renderEntity(enemies[i].get());
    }

    cout << "TARGET|" << target->id << "|" << target->type << "|"
         << target->x << "|" << target->y << "|" << target->hp << endl;

    cout << "SCORE|0" << endl;

    return 0;
}
`,
};
