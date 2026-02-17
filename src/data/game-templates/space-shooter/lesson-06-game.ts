import type { GameLessonVariant } from "@/types/game";

export const lesson06SpaceShooter: GameLessonVariant = {
  lessonId: "06-arrays",
  instructions: `# Component Arrays — Structure of Arrays

## Project: Space Shooter ECS — Parallel Array Components

**What you're building:** A fleet of 3 enemy ships stored using the ECS "Structure of Arrays" (SoA) pattern — where each component type lives in its own array instead of being bundled into objects.

## ECS Concept: Structure of Arrays

In traditional OOP, you'd create an \`Enemy\` class with x, y, health all together. In **Entity Component System** design, we separate data by component type:

\`\`\`
// OOP (Array of Structs — AoS):
Enemy enemies[3];  // each bundles x, y, health

// ECS (Structure of Arrays — SoA):
int posX[3];       // all X positions together
int posY[3];       // all Y positions together
int health[3];     // all health values together
\`\`\`

**Why SoA?** When a system only needs positions (like rendering), it reads contiguous memory — no wasted cache loads on health data it doesn't need. This is the foundation of **data-oriented design**.

## Your Task

1. Create parallel arrays for 3 enemy entities: \`posX[3]\`, \`posY[3]\`, \`health[3]\`
2. Initialize them with these values:
   - Enemy 0: x=100, y=40, health=50
   - Enemy 1: x=200, y=40, health=50
   - Enemy 2: x=300, y=40, health=50
3. Also store a \`width\` and \`height\` (both 20) for all enemies
4. Loop through the arrays and output an \`ENTITY\` line for each enemy
5. Output a \`GAME_MESSAGE\` saying "Enemy squadron deployed!"
6. Output \`SCORE|0\`

Entity IDs should be "enemy0", "enemy1", "enemy2" and type should be "enemy".`,
  starterCode: `#include <iostream>
using namespace std;

int main() {
    // Component arrays (Structure of Arrays)
    // TODO: Declare posX[3], posY[3], health[3] arrays
    // Initialize: enemy0=(100,40,50), enemy1=(200,40,50), enemy2=(300,40,50)

    int width = 20;
    int height = 20;

    // TODO: Loop through all 3 enemies and output ENTITY lines
    // Format: ENTITY|enemyN|enemy|posX|posY|width|height|health

    // TODO: Output GAME_MESSAGE and SCORE

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

int main() {
    // Component arrays (Structure of Arrays)
    int posX[3] = {100, 200, 300};
    int posY[3] = {40, 40, 40};
    int health[3] = {50, 50, 50};

    int width = 20;
    int height = 20;

    // Render system: iterate all entities
    for (int i = 0; i < 3; i++) {
        cout << "ENTITY|enemy" << i << "|enemy|"
             << posX[i] << "|" << posY[i] << "|"
             << width << "|" << height << "|"
             << health[i] << endl;
    }

    cout << "GAME_MESSAGE|Enemy squadron deployed!" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render enemy0 at (100,40)", expectedOutput: "ENTITY\\|enemy0\\|enemy\\|100\\|40\\|20\\|20\\|50", isPattern: true },
    { id: "g2", description: "Should render enemy1 at (200,40)", expectedOutput: "ENTITY\\|enemy1\\|enemy\\|200\\|40\\|20\\|20\\|50", isPattern: true },
    { id: "g3", description: "Should render enemy2 at (300,40)", expectedOutput: "ENTITY\\|enemy2\\|enemy\\|300\\|40\\|20\\|20\\|50", isPattern: true },
    { id: "g4", description: "Should show deployment message", expectedOutput: "GAME_MESSAGE\\|Enemy squadron deployed!", isPattern: true },
    { id: "g5", description: "Should show initial score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "Declare arrays like: `int posX[3] = {100, 200, 300};`",
    "Use a for loop: `for (int i = 0; i < 3; i++)` to iterate all entities.",
    "Build the entity ID with string concatenation: `\"enemy\" << i`",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    // Component arrays (Structure of Arrays)
    int posX[3] = {100, 200, 300};
    int posY[3] = {40, 40, 40};
    int health[3] = {50, 50, 50};

    int width = 20;
    int height = 20;

    // Render system: iterate all entities
    for (int i = 0; i < 3; i++) {
        cout << "ENTITY|enemy" << i << "|enemy|"
             << posX[i] << "|" << posY[i] << "|"
             << width << "|" << height << "|"
             << health[i] << endl;
    }

    cout << "GAME_MESSAGE|Enemy squadron deployed!" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
