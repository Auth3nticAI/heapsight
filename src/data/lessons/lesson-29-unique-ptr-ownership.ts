import type { Lesson } from "@/types/lesson";

export const lesson29: Lesson = {
  id: "29-unique-ptr-ownership",
  title: "unique_ptr Ownership",
  description: "Replace raw pointers with unique_ptr for automatic memory management.",
  order: 29,
  xpReward: 150,
  tier: "pro",
  concepts: ["unique_ptr", "smart pointers", "ownership semantics", "make_unique", "move semantics"],
  part1: {
    title: "Concept: unique_ptr Ownership",
    type: "concept",
    instructions: `# unique_ptr Ownership

Raw pointers are dangerous — you \\\`new\\\` something and forget to \\\`delete\\\` it, or you \\\`delete\\\` it twice, or you use it after deletion. Every one of these is a crash or a memory leak.

C++ solves this with \\\`unique_ptr\\\` — a smart pointer that **owns** the object it points to. When the unique_ptr goes out of scope, it automatically deletes the object. No manual cleanup needed.

## Key Rules
1. **Create with \\\`make_unique<T>(args)\\\`** — never use raw \\\`new\\\` with unique_ptr
2. **Cannot copy** — ownership is exclusive. \\\`unique_ptr<T> b = a;\\\` won't compile
3. **Transfer with \\\`std::move()\\\`** — moves ownership from one unique_ptr to another
4. **Auto-cleanup** — destructor runs when the unique_ptr leaves scope

## Your Task
1. Create a \\\`Weapon\\\` struct with \\\`name\\\` (string) and \\\`damage\\\` (int). Add a constructor that prints \\\`"Created: <name>"\\\` and a destructor that prints \\\`"Destroyed: <name>"\\\`
2. In main, use \\\`make_unique<Weapon>("Blaster", 50)\\\` to create a weapon
3. Print \\\`"<name> deals <damage> damage"\\\` using the unique_ptr
4. Transfer ownership to a second unique_ptr using \\\`std::move()\\\`
5. Print \\\`"Transferred!"\\\` after the move
6. Check that the original pointer is now \\\`nullptr\\\` and print \\\`"Original is null: true"\\\`
7. Let the second pointer go out of scope — watch the destructor fire automatically

Expected output:
\\\`\\\`\\\`
Created: Blaster
Blaster deals 50 damage
Transferred!
Original is null: true
Destroyed: Blaster
\\\`\\\`\\\``,
    starterCode: `#include <iostream>
#include <string>
#include <memory>
using namespace std;

struct Weapon {
    string name;
    int damage;

    // TODO: Constructor that prints "Created: <name>"

    // TODO: Destructor that prints "Destroyed: <name>"
};

int main() {
    // TODO: Create unique_ptr<Weapon> using make_unique

    // TODO: Print "<name> deals <damage> damage"

    // TODO: Transfer ownership with std::move

    // TODO: Print "Transferred!"

    // TODO: Check original is nullptr

    // TODO: Let transferred pointer go out of scope

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
#include <memory>
using namespace std;

struct Weapon {
    string name;
    int damage;

    Weapon(string n, int d) : name(n), damage(d) {
        cout << "Created: " << name << endl;
    }

    ~Weapon() {
        cout << "Destroyed: " << name << endl;
    }
};

int main() {
    auto w1 = make_unique<Weapon>("Blaster", 50);
    cout << w1->name << " deals " << w1->damage << " damage" << endl;

    auto w2 = std::move(w1);
    cout << "Transferred!" << endl;

    if (w1 == nullptr) {
        cout << "Original is null: true" << endl;
    }

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should create weapon with constructor message", expectedOutput: "Created: Blaster" },
      { id: "t2", description: "Should print weapon stats", expectedOutput: "Blaster deals 50 damage" },
      { id: "t3", description: "Should transfer ownership", expectedOutput: "Transferred!" },
      { id: "t4", description: "Should confirm original is null", expectedOutput: "Original is null: true" },
      { id: "t5", description: "Should auto-destroy on scope exit", expectedOutput: "Destroyed: Blaster" },
    ],
    hints: [
      "Use `auto w1 = make_unique<Weapon>(\"Blaster\", 50);` to create the unique_ptr.",
      "After `auto w2 = std::move(w1);`, w1 becomes nullptr. Check with `if (w1 == nullptr)`.",
      "The destructor runs automatically when w2 goes out of scope at the end of main — no delete needed.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: unique_ptr Entities",
    type: "game_builder",
    instructions: `# Game Builder: unique_ptr Entity Management

Replace raw Entity pointers with unique_ptr for automatic memory management in the space shooter.

## Your Task
1. Define an Entity struct with id, type, x, y, hp, alive fields, plus a constructor that prints \\\`"SPAWN|<id>"\\\` and a destructor that prints \\\`"CLEANUP|<id>"\\\`
2. Create a \\\`unique_ptr<Entity>\\\` for the player using \\\`make_unique\\\`
3. Create a vector or array of 3 enemy \\\`unique_ptr<Entity>\\\` objects
4. Transfer one enemy to a \\\`unique_ptr<Entity>\\\` called \\\`target\\\` using \\\`std::move\\\`
5. Render all alive entities, print score
6. Let everything go out of scope — all destructors fire, zero leaks

Expected output:
\\\`\\\`\\\`
SPAWN|ship
SPAWN|alien1
SPAWN|alien2
SPAWN|alien3
ENTITY|ship|player|180|300|100
ENTITY|alien1|enemy|100|40|30
ENTITY|alien3|enemy|300|40|30
TARGET|alien2|enemy|200|40|30
SCORE|0
CLEANUP|alien2
CLEANUP|alien3
CLEANUP|alien1
CLEANUP|ship
\\\`\\\`\\\``,
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
      { id: "g1", description: "Should spawn all entities", expectedOutput: "SPAWN\\|ship.*SPAWN\\|alien1.*SPAWN\\|alien2.*SPAWN\\|alien3", isPattern: true },
      { id: "g2", description: "Should render ship", expectedOutput: "ENTITY\\|ship\\|player\\|180\\|300\\|100", isPattern: true },
      { id: "g3", description: "Should render alien1 (not moved)", expectedOutput: "ENTITY\\|alien1\\|enemy\\|100\\|40\\|30", isPattern: true },
      { id: "g4", description: "Should show transferred target", expectedOutput: "TARGET\\|alien2\\|enemy\\|200\\|40\\|30", isPattern: true },
      { id: "g5", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
      { id: "g6", description: "Should cleanup alien2", expectedOutput: "CLEANUP\\|alien2", isPattern: true },
      { id: "g7", description: "Should cleanup ship", expectedOutput: "CLEANUP\\|ship", isPattern: true },
    ],
    hints: [
      "Use `auto ship = make_unique<Entity>(\"ship\", \"player\", 180, 300, 100);` to create smart pointer entities.",
      "After `auto target = std::move(enemies[1]);`, enemies[1] is nullptr — renderEntity checks for null and skips it.",
      "Destructors fire in reverse order of scope exit. The unique_ptrs handle all cleanup automatically.",
    ],
    estimatedMinutes: 10,
  },
};
