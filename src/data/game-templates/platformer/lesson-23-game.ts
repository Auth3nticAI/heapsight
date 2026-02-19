import type { GameLessonVariant } from "@/types/game";

export const lesson23Platformer: GameLessonVariant = {
  lessonId: "23-thread-awareness-v0",
  instructions: `# Safe Level Loading — RAII for Level Data\n\nThe previous lesson used raw \`new\`/\`delete\` for platform data. But what if an error occurs between allocation and deallocation? The memory **leaks**. The RAII pattern (Resource Acquisition Is Initialization) solves this: wrap resources in helper functions that guarantee cleanup.\n\n## Concepts\n- RAII: tie resource lifetime to scope/function lifecycle\n- Create/destroy helper functions as a manual RAII pattern\n- Guaranteed cleanup even when errors occur\n- Encapsulating allocation + deallocation in paired functions\n\n## Your Task\n1. Write a \`createLevel\` function that allocates an array of 3 platform x-positions with \`new int[3]\` and sets them to: 0, 120, 260\n2. Write a \`destroyLevel\` function that takes the pointer and calls \`delete[]\`\n3. Write a \`renderLevel\` function that loops through 3 platforms and renders each at (x, 240) size 80x16\n4. In main: create level, render the player at (40, 216) size 16x24, render level, destroy level\n5. Output messages showing the RAII lifecycle: creation, rendering, cleanup\n\n## Protocol Reminder\n\`\`\`\nENTITY|id|type|x|y|width|height\nGAME_MESSAGE|text\nSCORE|value\n\`\`\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

void renderEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

// Write createLevel: allocates int[3], sets values to 0, 120, 260, returns pointer

// Write destroyLevel: takes int* and deletes it

// Write renderLevel: takes int* and count, renders each platform

int main() {
    // Create level data
    // Render player and level
    // Destroy level data
    // Output lifecycle messages and score

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

int* createLevel() {
    int* platforms = new int[3];
    platforms[0] = 0;
    platforms[1] = 120;
    platforms[2] = 260;
    return platforms;
}

void destroyLevel(int* platforms) {
    delete[] platforms;
}

void renderLevel(int* platforms, int count) {
    for (int i = 0; i < count; i++) {
        string id = "plat" + to_string(i + 1);
        renderEntity(id, "platform", platforms[i], 240, 80, 16);
    }
}

int main() {
    cout << "GAME_MESSAGE|Level created — 3 platforms allocated" << endl;
    int* levelData = createLevel();

    renderEntity("runner", "player", 40, 216, 16, 24);
    renderLevel(levelData, 3);

    destroyLevel(levelData);
    cout << "GAME_MESSAGE|Level destroyed — memory freed safely" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render player", expectedOutput: "ENTITY\\|runner\\|player\\|40\\|216\\|16\\|24", isPattern: true },
    { id: "g2", description: "Should render platform 1", expectedOutput: "ENTITY\\|plat1\\|platform\\|0\\|240\\|80\\|16", isPattern: true },
    { id: "g3", description: "Should render platform 2", expectedOutput: "ENTITY\\|plat2\\|platform\\|120\\|240\\|80\\|16", isPattern: true },
    { id: "g4", description: "Should render platform 3", expectedOutput: "ENTITY\\|plat3\\|platform\\|260\\|240\\|80\\|16", isPattern: true },
    { id: "g5", description: "Should show creation message", expectedOutput: "GAME_MESSAGE\\|Level created", isPattern: true },
    { id: "g6", description: "Should show destruction message", expectedOutput: "GAME_MESSAGE\\|Level destroyed", isPattern: true },
  ],
  hints: [
    "createLevel allocates `new int[3]`, sets platforms[0]=0, platforms[1]=120, platforms[2]=260, and returns the pointer.",
    "renderLevel uses a for loop from 0 to count-1, building the id with `\"plat\" + to_string(i + 1)`.",
    "destroyLevel simply calls `delete[] platforms;` — the key is that create and destroy are always called as a pair.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

void renderEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

int* createLevel() {
    int* platforms = new int[3];
    platforms[0] = 0;
    platforms[1] = 120;
    platforms[2] = 260;
    return platforms;
}

void destroyLevel(int* platforms) {
    delete[] platforms;
}

void renderLevel(int* platforms, int count) {
    for (int i = 0; i < count; i++) {
        string id = "plat" + to_string(i + 1);
        renderEntity(id, "platform", platforms[i], 240, 80, 16);
    }
}

int main() {
    cout << "GAME_MESSAGE|Level created — 3 platforms allocated" << endl;
    int* levelData = createLevel();
    renderEntity("runner", "player", 40, 216, 16, 24);
    renderLevel(levelData, 3);
    destroyLevel(levelData);
    cout << "GAME_MESSAGE|Level destroyed — memory freed safely" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
