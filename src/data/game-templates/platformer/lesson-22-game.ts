import type { GameLessonVariant } from "@/types/game";

export const lesson22Platformer: GameLessonVariant = {
  lessonId: "22-memory-leaks",
  instructions: `# Level Cleanup — Dynamic Platform Deallocation\n\nWhen a player transitions between levels, the old level's platforms must be **deallocated** to prevent memory leaks. In C++, any memory allocated with \`new\` must be freed with \`delete\`. Forgetting to delete causes a **memory leak** — the program holds onto memory it no longer uses.\n\n## Concepts\n- Dynamic memory allocation with \`new\` for level data\n- Proper deallocation with \`delete\` to prevent memory leaks\n- Level transition pattern: allocate -> render -> deallocate\n- Tracking allocation/deallocation count for leak detection\n\n## Your Task\n1. Allocate 3 platform positions dynamically using \`new int[2]\` (each stores x, y)\n2. Platform data: plat1 at (0, 240), plat2 at (100, 200), plat3 at (220, 180)\n3. Render each platform as an entity (all size 80x16, type "platform")\n4. Render the player at (50, 216) size 16x24\n5. Delete all 3 dynamically allocated arrays\n6. Track allocations and deallocations — output a message confirming cleanup\n\n## Protocol Reminder\n\`\`\`\nENTITY|id|type|x|y|width|height\nGAME_MESSAGE|text\nSCORE|value\n\`\`\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

void renderEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

int main() {
    int allocCount = 0;
    int freeCount = 0;

    // Allocate 3 platform position arrays with new int[2]
    // Increment allocCount for each allocation

    // Set platform positions: (0,240), (100,200), (220,180)

    // Render player and all 3 platforms

    // Delete all allocated arrays, increment freeCount for each

    // Output cleanup message and score

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

void renderEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

int main() {
    int allocCount = 0;
    int freeCount = 0;

    int* plat1 = new int[2];
    allocCount++;
    int* plat2 = new int[2];
    allocCount++;
    int* plat3 = new int[2];
    allocCount++;

    plat1[0] = 0;   plat1[1] = 240;
    plat2[0] = 100;  plat2[1] = 200;
    plat3[0] = 220;  plat3[1] = 180;

    renderEntity("runner", "player", 50, 216, 16, 24);
    renderEntity("plat1", "platform", plat1[0], plat1[1], 80, 16);
    renderEntity("plat2", "platform", plat2[0], plat2[1], 80, 16);
    renderEntity("plat3", "platform", plat3[0], plat3[1], 80, 16);

    delete[] plat1;
    freeCount++;
    delete[] plat2;
    freeCount++;
    delete[] plat3;
    freeCount++;

    cout << "GAME_MESSAGE|Level cleanup: " << allocCount << " allocated, " << freeCount << " freed, " << (allocCount - freeCount) << " leaks" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render player", expectedOutput: "ENTITY\\|runner\\|player\\|50\\|216\\|16\\|24", isPattern: true },
    { id: "g2", description: "Should render platform 1", expectedOutput: "ENTITY\\|plat1\\|platform\\|0\\|240\\|80\\|16", isPattern: true },
    { id: "g3", description: "Should render platform 2", expectedOutput: "ENTITY\\|plat2\\|platform\\|100\\|200\\|80\\|16", isPattern: true },
    { id: "g4", description: "Should render platform 3", expectedOutput: "ENTITY\\|plat3\\|platform\\|220\\|180\\|80\\|16", isPattern: true },
    { id: "g5", description: "Should show 0 leaks in cleanup message", expectedOutput: "GAME_MESSAGE\\|Level cleanup: 3 allocated, 3 freed, 0 leaks", isPattern: true },
  ],
  hints: [
    "Allocate each platform with `int* plat1 = new int[2];` and increment allocCount after each allocation.",
    "Set coordinates with array indexing: `plat1[0] = 0; plat1[1] = 240;` for the x and y values.",
    "Free each array with `delete[] plat1;` (note the [] for array deletion) and increment freeCount for each.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

void renderEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

int main() {
    int allocCount = 0;
    int freeCount = 0;
    int* plat1 = new int[2];
    allocCount++;
    int* plat2 = new int[2];
    allocCount++;
    int* plat3 = new int[2];
    allocCount++;
    plat1[0] = 0;   plat1[1] = 240;
    plat2[0] = 100;  plat2[1] = 200;
    plat3[0] = 220;  plat3[1] = 180;
    renderEntity("runner", "player", 50, 216, 16, 24);
    renderEntity("plat1", "platform", plat1[0], plat1[1], 80, 16);
    renderEntity("plat2", "platform", plat2[0], plat2[1], 80, 16);
    renderEntity("plat3", "platform", plat3[0], plat3[1], 80, 16);
    delete[] plat1;
    freeCount++;
    delete[] plat2;
    freeCount++;
    delete[] plat3;
    freeCount++;
    cout << "GAME_MESSAGE|Level cleanup: " << allocCount << " allocated, " << freeCount << " freed, " << (allocCount - freeCount) << " leaks" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
