import type { GameLessonVariant } from "@/types/game";

export const lesson10SpaceShooter: GameLessonVariant = {
  lessonId: "10-dynamic-memory",
  instructions: `# Entity Spawning — Dynamic Component Allocation

## Project: Space Shooter ECS — Runtime Entity Creation

**What you're building:** A dynamic entity spawning system that allocates component storage at runtime using \`new\` and \`delete\` — demonstrating how ECS engines manage entity pools.

## ECS Concept: Dynamic Entity Pools

Fixed-size arrays limit your entity count at compile time. Real games need to spawn and destroy entities dynamically. In ECS, we allocate **component arrays** on the heap:

\`\`\`
int* posX = new int[capacity];
int* posY = new int[capacity];
int* health = new int[capacity];
// ... use them ...
delete[] posX;
delete[] posY;
delete[] health;
\`\`\`

This is the foundation of **entity pools** — pre-allocated blocks of component memory that entities can be added to and removed from at runtime.

## Your Task

1. Ask for a capacity of 3 entities
2. Dynamically allocate component arrays: \`posX\`, \`posY\`, \`health\` using \`new int[3]\`
3. Spawn 3 entities by assigning values:
   - Entity 0: posX=120, posY=50, health=60
   - Entity 1: posX=200, posY=50, health=60
   - Entity 2: posX=280, posY=50, health=60
4. Use width=18, height=18 for all entities
5. Render all 3 entities in a loop
6. Clean up memory with \`delete[]\`
7. Output \`GAME_MESSAGE|3 entities spawned dynamically!\`
8. Output \`SCORE|0\``,
  starterCode: `#include <iostream>
using namespace std;

int main() {
    int count = 3;
    int width = 18;
    int height = 18;

    // TODO: Dynamically allocate component arrays
    // int* posX = new int[count];
    // int* posY = new int[count];
    // int* health = new int[count];

    // TODO: Spawn entities by assigning component values
    // Entity 0: (120, 50, 60)
    // Entity 1: (200, 50, 60)
    // Entity 2: (280, 50, 60)

    // TODO: Render system - loop and output ENTITY lines

    // TODO: Output GAME_MESSAGE and SCORE

    // TODO: Free memory with delete[]

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

int main() {
    int count = 3;
    int width = 18;
    int height = 18;

    // Dynamically allocate component arrays (entity pool)
    int* posX = new int[count];
    int* posY = new int[count];
    int* health = new int[count];

    // Spawn entities
    posX[0] = 120; posY[0] = 50; health[0] = 60;
    posX[1] = 200; posY[1] = 50; health[1] = 60;
    posX[2] = 280; posY[2] = 50; health[2] = 60;

    // Render system
    for (int i = 0; i < count; i++) {
        cout << "ENTITY|enemy" << i << "|enemy|"
             << posX[i] << "|" << posY[i] << "|"
             << width << "|" << height << "|"
             << health[i] << endl;
    }

    cout << "GAME_MESSAGE|3 entities spawned dynamically!" << endl;
    cout << "SCORE|0" << endl;

    // Free component memory
    delete[] posX;
    delete[] posY;
    delete[] health;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render enemy0 at (120,50)", expectedOutput: "ENTITY\\|enemy0\\|enemy\\|120\\|50\\|18\\|18\\|60", isPattern: true },
    { id: "g2", description: "Should render enemy1 at (200,50)", expectedOutput: "ENTITY\\|enemy1\\|enemy\\|200\\|50\\|18\\|18\\|60", isPattern: true },
    { id: "g3", description: "Should render enemy2 at (280,50)", expectedOutput: "ENTITY\\|enemy2\\|enemy\\|280\\|50\\|18\\|18\\|60", isPattern: true },
    { id: "g4", description: "Should show spawn message", expectedOutput: "GAME_MESSAGE\\|3 entities spawned dynamically!", isPattern: true },
    { id: "g5", description: "Should show initial score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "Allocate with: `int* posX = new int[count];` — this creates an array on the heap.",
    "Assign values like a normal array: `posX[0] = 120;`",
    "Always free with `delete[] posX;` — the `[]` is required for arrays!",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    int count = 3;
    int width = 18;
    int height = 18;

    // Dynamically allocate component arrays (entity pool)
    int* posX = new int[count];
    int* posY = new int[count];
    int* health = new int[count];

    // Spawn entities
    posX[0] = 120; posY[0] = 50; health[0] = 60;
    posX[1] = 200; posY[1] = 50; health[1] = 60;
    posX[2] = 280; posY[2] = 50; health[2] = 60;

    // Render system
    for (int i = 0; i < count; i++) {
        cout << "ENTITY|enemy" << i << "|enemy|"
             << posX[i] << "|" << posY[i] << "|"
             << width << "|" << height << "|"
             << health[i] << endl;
    }

    cout << "GAME_MESSAGE|3 entities spawned dynamically!" << endl;
    cout << "SCORE|0" << endl;

    // Free component memory
    delete[] posX;
    delete[] posY;
    delete[] health;

    return 0;
}
`,
};
