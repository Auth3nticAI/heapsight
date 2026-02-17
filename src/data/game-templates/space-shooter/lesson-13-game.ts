import type { GameLessonVariant } from "@/types/game";

export const lesson13SpaceShooter: GameLessonVariant = {
  lessonId: "13-enums",
  instructions: `# Entity Types — Enum-Based Component Tags

## Project: Space Shooter ECS — Type Tagging with Enums

**What you're building:** An entity type system using C++ enums to tag entities, then a render system that changes behavior based on the type tag — demonstrating how ECS uses lightweight tag components.

## ECS Concept: Tag Components

Not all components hold data. Some are just **tags** — lightweight markers that tell systems how to handle an entity. An enum is perfect for this:

\`\`\`
enum EntityType { PLAYER, ENEMY, BULLET, POWERUP };
\`\`\`

The render system can then branch on the tag:
- PLAYER entities get rendered at a certain size
- ENEMY entities get different sizes
- BULLET entities are small and fast
- POWERUP entities have special properties

Tag components cost almost nothing but give systems the information they need to process entities differently.

## Your Task

1. Define \`enum EntityType { PLAYER, ENEMY, BULLET, POWERUP };\`
2. Create component arrays for 5 entities:
   - Entity 0: type=PLAYER, posX=180, posY=220, health=100
   - Entity 1: type=ENEMY, posX=100, posY=40, health=50
   - Entity 2: type=ENEMY, posX=300, posY=40, health=50
   - Entity 3: type=BULLET, posX=190, posY=180, health=0
   - Entity 4: type=POWERUP, posX=200, posY=130, health=0
3. Create a string array for type names: "player", "enemy", "enemy", "bullet", "powerup"
4. Create a string array for entity IDs: "ship", "alien0", "alien1", "laser0", "shield0"
5. Use the enum to set width/height per entity type:
   - PLAYER: 24x24
   - ENEMY: 20x20
   - BULLET: 4x10
   - POWERUP: 16x16
6. Render all 5 entities with their type-specific sizes
7. Output \`GAME_MESSAGE|Battlefield: 1 player, 2 enemies, 1 bullet, 1 powerup\`
8. Output \`SCORE|0\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

// TODO: Define enum EntityType { PLAYER, ENEMY, BULLET, POWERUP };

int main() {
    int count = 5;

    // Tag components (entity type)
    // TODO: Declare EntityType tags[5] with appropriate values

    // Position & health components
    int posX[5] = {180, 100, 300, 190, 200};
    int posY[5] = {220, 40, 40, 180, 130};
    int health[5] = {100, 50, 50, 0, 0};

    // String components for IDs and type names
    string ids[5] = {"ship", "alien0", "alien1", "laser0", "shield0"};
    string typeNames[5] = {"player", "enemy", "enemy", "bullet", "powerup"};

    // TODO: Render system - loop through all entities
    // Use if/else or switch on tags[i] to set width/height:
    //   PLAYER: 24x24, ENEMY: 20x20, BULLET: 4x10, POWERUP: 16x16
    // Output ENTITY line for each

    // TODO: Output GAME_MESSAGE and SCORE

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

enum EntityType { PLAYER, ENEMY, BULLET, POWERUP };

int main() {
    int count = 5;

    // Tag components
    EntityType tags[5] = {PLAYER, ENEMY, ENEMY, BULLET, POWERUP};

    // Position & health components
    int posX[5] = {180, 100, 300, 190, 200};
    int posY[5] = {220, 40, 40, 180, 130};
    int health[5] = {100, 50, 50, 0, 0};

    // String components
    string ids[5] = {"ship", "alien0", "alien1", "laser0", "shield0"};
    string typeNames[5] = {"player", "enemy", "enemy", "bullet", "powerup"};

    // Render system with type-based sizing
    for (int i = 0; i < count; i++) {
        int w, h;
        if (tags[i] == PLAYER) {
            w = 24; h = 24;
        } else if (tags[i] == ENEMY) {
            w = 20; h = 20;
        } else if (tags[i] == BULLET) {
            w = 4; h = 10;
        } else {
            w = 16; h = 16;
        }

        cout << "ENTITY|" << ids[i] << "|" << typeNames[i] << "|"
             << posX[i] << "|" << posY[i] << "|"
             << w << "|" << h << "|"
             << health[i] << endl;
    }

    cout << "GAME_MESSAGE|Battlefield: 1 player, 2 enemies, 1 bullet, 1 powerup" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render player with 24x24 size", expectedOutput: "ENTITY\\|ship\\|player\\|180\\|220\\|24\\|24\\|100", isPattern: true },
    { id: "g2", description: "Should render alien0 with 20x20 size", expectedOutput: "ENTITY\\|alien0\\|enemy\\|100\\|40\\|20\\|20\\|50", isPattern: true },
    { id: "g3", description: "Should render alien1 with 20x20 size", expectedOutput: "ENTITY\\|alien1\\|enemy\\|300\\|40\\|20\\|20\\|50", isPattern: true },
    { id: "g4", description: "Should render laser with 4x10 size", expectedOutput: "ENTITY\\|laser0\\|bullet\\|190\\|180\\|4\\|10\\|0", isPattern: true },
    { id: "g5", description: "Should render powerup with 16x16 size", expectedOutput: "ENTITY\\|shield0\\|powerup\\|200\\|130\\|16\\|16\\|0", isPattern: true },
    { id: "g6", description: "Should show battlefield summary", expectedOutput: "GAME_MESSAGE\\|Battlefield: 1 player, 2 enemies, 1 bullet, 1 powerup", isPattern: true },
  ],
  hints: [
    "Define the enum before main: `enum EntityType { PLAYER, ENEMY, BULLET, POWERUP };`",
    "Initialize the tag array: `EntityType tags[5] = {PLAYER, ENEMY, ENEMY, BULLET, POWERUP};`",
    "Use `if (tags[i] == PLAYER)` or a switch statement to set width and height per type.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

enum EntityType { PLAYER, ENEMY, BULLET, POWERUP };

int main() {
    int count = 5;

    // Tag components
    EntityType tags[5] = {PLAYER, ENEMY, ENEMY, BULLET, POWERUP};

    // Position & health components
    int posX[5] = {180, 100, 300, 190, 200};
    int posY[5] = {220, 40, 40, 180, 130};
    int health[5] = {100, 50, 50, 0, 0};

    // String components
    string ids[5] = {"ship", "alien0", "alien1", "laser0", "shield0"};
    string typeNames[5] = {"player", "enemy", "enemy", "bullet", "powerup"};

    // Render system with type-based sizing
    for (int i = 0; i < count; i++) {
        int w, h;
        if (tags[i] == PLAYER) {
            w = 24; h = 24;
        } else if (tags[i] == ENEMY) {
            w = 20; h = 20;
        } else if (tags[i] == BULLET) {
            w = 4; h = 10;
        } else {
            w = 16; h = 16;
        }

        cout << "ENTITY|" << ids[i] << "|" << typeNames[i] << "|"
             << posX[i] << "|" << posY[i] << "|"
             << w << "|" << h << "|"
             << health[i] << endl;
    }

    cout << "GAME_MESSAGE|Battlefield: 1 player, 2 enemies, 1 bullet, 1 powerup" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
