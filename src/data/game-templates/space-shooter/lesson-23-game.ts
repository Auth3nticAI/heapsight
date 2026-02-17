import type { GameLessonVariant } from "@/types/game";

export const lesson23SpaceShooter: GameLessonVariant = {
  lessonId: "23-smart-pointers",
  instructions: `# Safe Entity Management — RAII Component Storage\n\nManually calling \`new\` and \`delete\` is error-prone. The **RAII** pattern (Resource Acquisition Is Initialization) wraps allocation and deallocation into helper functions, previewing how smart pointers work.\n\n## Concepts\n- RAII: tie resource lifetime to function calls\n- createHP() wraps \`new\` — allocates and initializes\n- destroyHP() wraps \`delete\` — safely deallocates\n- This is the concept behind \`unique_ptr\` and \`shared_ptr\`\n\n## Your Task\n1. Write \`createHP(int value)\` that returns \`new int(value)\`\n2. Write \`destroyHP(int*& ptr)\` that deletes and sets pointer to \`nullptr\`\n3. Use these to manage HP for 3 entities (ship + 2 enemies)\n4. Render all entities, then destroy all HP safely\n5. Verify cleanup by checking if pointers are nullptr\n\n## Protocol\n\`\`\`\nENTITY|id|type|x|y|width|height|hp\nGAME_MESSAGE|text\nSCORE|value\n\`\`\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Entity {
    string id;
    string type;
    int x, y, width, height;
};

void renderEntity(Entity e, int hp) {
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.width << "|" << e.height
         << "|" << hp << endl;
}

// Write createHP(int value) — allocates and returns new int

// Write destroyHP(int*& ptr) — deletes and sets to nullptr

int main() {
    // Use createHP to allocate HP for 3 entities
    // Render all entities
    // Use destroyHP to clean up all allocations
    // Verify all pointers are nullptr

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Entity {
    string id;
    string type;
    int x, y, width, height;
};

void renderEntity(Entity e, int hp) {
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.width << "|" << e.height
         << "|" << hp << endl;
}

int* createHP(int value) {
    return new int(value);
}

void destroyHP(int*& ptr) {
    delete ptr;
    ptr = nullptr;
}

int main() {
    int* hp1 = createHP(100);
    int* hp2 = createHP(50);
    int* hp3 = createHP(50);

    Entity ship = {"ship", "player", 180, 220, 24, 24};
    Entity alien1 = {"alien1", "enemy", 120, 40, 22, 22};
    Entity alien2 = {"alien2", "enemy", 280, 60, 22, 22};

    renderEntity(ship, *hp1);
    renderEntity(alien1, *hp2);
    renderEntity(alien2, *hp3);

    destroyHP(hp1);
    destroyHP(hp2);
    destroyHP(hp3);

    int safe = (hp1 == nullptr && hp2 == nullptr && hp3 == nullptr) ? 1 : 0;
    cout << "GAME_MESSAGE|RAII cleanup complete. All pointers null: " << safe << endl;
    cout << "SCORE|3" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render ship with RAII-managed HP", expectedOutput: "ENTITY\\|ship\\|player\\|180\\|220\\|24\\|24\\|100", isPattern: true },
    { id: "g2", description: "Should render alien1 with RAII-managed HP", expectedOutput: "ENTITY\\|alien1\\|enemy\\|120\\|40\\|22\\|22\\|50", isPattern: true },
    { id: "g3", description: "Should render alien2 with RAII-managed HP", expectedOutput: "ENTITY\\|alien2\\|enemy\\|280\\|60\\|22\\|22\\|50", isPattern: true },
    { id: "g4", description: "Should confirm RAII cleanup with null pointers", expectedOutput: "GAME_MESSAGE\\|RAII cleanup complete. All pointers null: 1", isPattern: true },
    { id: "g5", description: "Should output score", expectedOutput: "SCORE\\|3", isPattern: true },
  ],
  hints: [
    "createHP is simple: `int* createHP(int value) { return new int(value); }`",
    "destroyHP takes a reference to a pointer: `void destroyHP(int*& ptr) { delete ptr; ptr = nullptr; }` — the reference lets it set the caller's pointer to nullptr.",
    "After destroyHP, check `hp1 == nullptr && hp2 == nullptr && hp3 == nullptr` to verify safe cleanup.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

struct Entity {
    string id;
    string type;
    int x, y, width, height;
};

void renderEntity(Entity e, int hp) {
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.width << "|" << e.height
         << "|" << hp << endl;
}

int* createHP(int value) {
    return new int(value);
}

void destroyHP(int*& ptr) {
    delete ptr;
    ptr = nullptr;
}

int main() {
    int* hp1 = createHP(100);
    int* hp2 = createHP(50);
    int* hp3 = createHP(50);
    Entity ship = {"ship", "player", 180, 220, 24, 24};
    Entity alien1 = {"alien1", "enemy", 120, 40, 22, 22};
    Entity alien2 = {"alien2", "enemy", 280, 60, 22, 22};
    renderEntity(ship, *hp1);
    renderEntity(alien1, *hp2);
    renderEntity(alien2, *hp3);
    destroyHP(hp1);
    destroyHP(hp2);
    destroyHP(hp3);
    int safe = (hp1 == nullptr && hp2 == nullptr && hp3 == nullptr) ? 1 : 0;
    cout << "GAME_MESSAGE|RAII cleanup complete. All pointers null: " << safe << endl;
    cout << "SCORE|3" << endl;
    return 0;
}
`,
};
