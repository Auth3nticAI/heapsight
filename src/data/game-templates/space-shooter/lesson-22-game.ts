import type { GameLessonVariant } from "@/types/game";

export const lesson22SpaceShooter: GameLessonVariant = {
  lessonId: "22-memory-leaks",
  instructions: `# Pool Cleanup — Safe Component Deallocation\n\nIn a data-oriented ECS, component pools are often heap-allocated. If you forget to \`delete\` what you \`new\`, you get a **memory leak** — entities that linger invisibly, wasting resources.\n\n## Concepts\n- Dynamic allocation with \`new\` for component data\n- Proper \`delete\` to free component storage\n- What happens when you forget to clean up (leak detection)\n- Preview of RAII pattern\n\n## Your Task\n1. Allocate HP values for 3 entities using \`new int\`\n2. Create and render the 3 entities using those HP pointers\n3. Properly \`delete\` all 3 HP allocations\n4. Print a confirmation message showing all memory was freed\n5. Then show what a leak looks like: allocate one more HP with \`new\`, do NOT delete it, and print a leak warning\n\n## Protocol\n\`\`\`\nENTITY|id|type|x|y|width|height|hp\nGAME_MESSAGE|text\nSCORE|value\n\`\`\``,
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

int main() {
    // Allocate HP for 3 entities with new
    // Create entities, render them using the HP pointers
    // Delete all HP allocations
    // Print freed message
    // Show leak: allocate one more without deleting

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

int main() {
    int* hp1 = new int(100);
    int* hp2 = new int(60);
    int* hp3 = new int(60);

    Entity ship = {"ship", "player", 180, 220, 24, 24};
    Entity alien1 = {"alien1", "enemy", 100, 50, 22, 22};
    Entity alien2 = {"alien2", "enemy", 300, 70, 22, 22};

    renderEntity(ship, *hp1);
    renderEntity(alien1, *hp2);
    renderEntity(alien2, *hp3);

    delete hp1;
    delete hp2;
    delete hp3;

    cout << "GAME_MESSAGE|Pool cleanup: 3 HP components freed" << endl;

    int* leakedHP = new int(999);
    cout << "GAME_MESSAGE|WARNING: HP " << *leakedHP << " leaked! No delete called" << endl;

    cout << "SCORE|3" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render ship with allocated HP", expectedOutput: "ENTITY\\|ship\\|player\\|180\\|220\\|24\\|24\\|100", isPattern: true },
    { id: "g2", description: "Should render alien1 with allocated HP", expectedOutput: "ENTITY\\|alien1\\|enemy\\|100\\|50\\|22\\|22\\|60", isPattern: true },
    { id: "g3", description: "Should render alien2 with allocated HP", expectedOutput: "ENTITY\\|alien2\\|enemy\\|300\\|70\\|22\\|22\\|60", isPattern: true },
    { id: "g4", description: "Should confirm pool cleanup", expectedOutput: "GAME_MESSAGE\\|Pool cleanup: 3 HP components freed", isPattern: true },
    { id: "g5", description: "Should show leak warning", expectedOutput: "GAME_MESSAGE\\|WARNING: HP 999 leaked! No delete called", isPattern: true },
    { id: "g6", description: "Should output score of 3 freed entities", expectedOutput: "SCORE\\|3", isPattern: true },
  ],
  hints: [
    "Allocate with: `int* hp1 = new int(100);` — this creates a heap-allocated int with value 100.",
    "Use `*hp1` to dereference the pointer when passing to renderEntity.",
    "After rendering, call `delete hp1; delete hp2; delete hp3;` to free the memory. For the leak demo, create `int* leakedHP = new int(999);` but never delete it.",
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

int main() {
    int* hp1 = new int(100);
    int* hp2 = new int(60);
    int* hp3 = new int(60);
    Entity ship = {"ship", "player", 180, 220, 24, 24};
    Entity alien1 = {"alien1", "enemy", 100, 50, 22, 22};
    Entity alien2 = {"alien2", "enemy", 300, 70, 22, 22};
    renderEntity(ship, *hp1);
    renderEntity(alien1, *hp2);
    renderEntity(alien2, *hp3);
    delete hp1;
    delete hp2;
    delete hp3;
    cout << "GAME_MESSAGE|Pool cleanup: 3 HP components freed" << endl;
    int* leakedHP = new int(999);
    cout << "GAME_MESSAGE|WARNING: HP " << *leakedHP << " leaked! No delete called" << endl;
    cout << "SCORE|3" << endl;
    return 0;
}
`,
};
