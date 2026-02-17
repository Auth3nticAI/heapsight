import type { GameLessonVariant } from "@/types/game";

export const lesson11SpaceShooter: GameLessonVariant = {
  lessonId: "11-strings",
  instructions: `# Entity Registry — String-Based Component Lookup

## Project: Space Shooter ECS — Unique Entity Identification

**What you're building:** An entity registry that generates unique string IDs for each entity by concatenating type names with index numbers — showing how ECS engines identify and look up entities.

## ECS Concept: Entity IDs & Registration

Every entity in an ECS needs a unique identifier. A simple approach concatenates the entity type with a number:

\`\`\`
string id = "enemy" + to_string(index);  // "enemy0", "enemy1", etc.
\`\`\`

More advanced registries might use UUIDs or auto-incrementing counters. The key idea: **entities are just IDs** — all the real data lives in component arrays, and the ID is how you look up which slot in those arrays belongs to which entity.

## Your Task

1. Create arrays for 4 entities of different types:
   - Entity 0: type="player", posX=180, posY=220, health=100
   - Entity 1: type="enemy", posX=100, posY=40, health=50
   - Entity 2: type="enemy", posX=280, posY=40, health=50
   - Entity 3: type="powerup", posX=200, posY=130, health=0
2. Create a string array for type names: \`types[4]\`
3. Generate unique IDs by concatenating type + to_string(i): "player0", "enemy1", "enemy2", "powerup3"
4. Store the generated IDs in a string array \`ids[4]\`
5. Use width=20, height=20 for all entities
6. Render all 4 entities using the generated IDs
7. Output \`GAME_MESSAGE|Registry: 4 entities registered\`
8. Output \`SCORE|0\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int posX[4] = {180, 100, 280, 200};
    int posY[4] = {220, 40, 40, 130};
    int health[4] = {100, 50, 50, 0};
    string types[4] = {"player", "enemy", "enemy", "powerup"};

    int width = 20;
    int height = 20;

    // TODO: Create a string array ids[4]
    // TODO: Generate unique IDs: types[i] + to_string(i)

    // TODO: Render all 4 entities using generated IDs

    // TODO: Output GAME_MESSAGE and SCORE

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int posX[4] = {180, 100, 280, 200};
    int posY[4] = {220, 40, 40, 130};
    int health[4] = {100, 50, 50, 0};
    string types[4] = {"player", "enemy", "enemy", "powerup"};

    int width = 20;
    int height = 20;

    // Generate unique entity IDs
    string ids[4];
    for (int i = 0; i < 4; i++) {
        ids[i] = types[i] + to_string(i);
    }

    // Render system
    for (int i = 0; i < 4; i++) {
        cout << "ENTITY|" << ids[i] << "|" << types[i] << "|"
             << posX[i] << "|" << posY[i] << "|"
             << width << "|" << height << "|"
             << health[i] << endl;
    }

    cout << "GAME_MESSAGE|Registry: 4 entities registered" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render player0", expectedOutput: "ENTITY\\|player0\\|player\\|180\\|220\\|20\\|20\\|100", isPattern: true },
    { id: "g2", description: "Should render enemy1", expectedOutput: "ENTITY\\|enemy1\\|enemy\\|100\\|40\\|20\\|20\\|50", isPattern: true },
    { id: "g3", description: "Should render enemy2", expectedOutput: "ENTITY\\|enemy2\\|enemy\\|280\\|40\\|20\\|20\\|50", isPattern: true },
    { id: "g4", description: "Should render powerup3", expectedOutput: "ENTITY\\|powerup3\\|powerup\\|200\\|130\\|20\\|20\\|0", isPattern: true },
    { id: "g5", description: "Should show registry message", expectedOutput: "GAME_MESSAGE\\|Registry: 4 entities registered", isPattern: true },
  ],
  hints: [
    "Use `to_string(i)` to convert an integer to a string for concatenation.",
    "Build IDs with: `ids[i] = types[i] + to_string(i);`",
    "Remember to `#include <string>` for string operations and `to_string()`.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int posX[4] = {180, 100, 280, 200};
    int posY[4] = {220, 40, 40, 130};
    int health[4] = {100, 50, 50, 0};
    string types[4] = {"player", "enemy", "enemy", "powerup"};

    int width = 20;
    int height = 20;

    // Generate unique entity IDs
    string ids[4];
    for (int i = 0; i < 4; i++) {
        ids[i] = types[i] + to_string(i);
    }

    // Render system
    for (int i = 0; i < 4; i++) {
        cout << "ENTITY|" << ids[i] << "|" << types[i] << "|"
             << posX[i] << "|" << posY[i] << "|"
             << width << "|" << height << "|"
             << health[i] << endl;
    }

    cout << "GAME_MESSAGE|Registry: 4 entities registered" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
