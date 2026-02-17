import type { GameLessonVariant } from "@/types/game";

export const lesson07SpaceShooter: GameLessonVariant = {
  lessonId: "07-loops",
  instructions: `# Movement System — Batch Processing

## Project: Space Shooter ECS — Velocity & Position Update

**What you're building:** A movement system that updates ALL entity positions in a single batch loop — the core pattern of how ECS "systems" work.

## ECS Concept: Systems Process in Batches

In ECS, a **system** is a function that iterates over ALL entities that have the relevant components. A movement system needs position and velocity components:

\`\`\`
// For each entity with position + velocity:
posX[i] += velX[i];
posY[i] += velY[i];
\`\`\`

This is **batch processing** — one tight loop, no virtual function calls, no scattered memory accesses. The CPU prefetcher loves this pattern.

## Your Task

1. Create component arrays for 3 enemies:
   - \`posX[3] = {80, 200, 320}\`, \`posY[3] = {30, 30, 30}\`
   - \`velX[3] = {2, 0, -2}\`, \`velY[3] = {3, 3, 3}\`
   - \`health[3] = {50, 50, 50}\`
2. Set width=20, height=20
3. Run a movement system: loop through all entities and add velocity to position (\`posX[i] += velX[i]\`, same for Y)
4. Run the movement system **3 times** (3 ticks of the game loop)
5. After all 3 ticks, output ENTITY lines with the final positions
6. Output \`GAME_MESSAGE|Squadron advancing!\`
7. Output \`SCORE|0\`

After 3 ticks: enemy0=(86,39), enemy1=(200,39), enemy2=(314,39)`,
  starterCode: `#include <iostream>
using namespace std;

int main() {
    // Position components
    int posX[3] = {80, 200, 320};
    int posY[3] = {30, 30, 30};

    // Velocity components
    int velX[3] = {2, 0, -2};
    int velY[3] = {3, 3, 3};

    // Health components
    int health[3] = {50, 50, 50};

    int width = 20;
    int height = 20;

    // TODO: Run the movement system 3 times (3 ticks)
    // Each tick: loop all entities and update posX[i] += velX[i], posY[i] += velY[i]

    // TODO: Render all entities at their final positions

    // TODO: Output GAME_MESSAGE and SCORE

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

int main() {
    // Position components
    int posX[3] = {80, 200, 320};
    int posY[3] = {30, 30, 30};

    // Velocity components
    int velX[3] = {2, 0, -2};
    int velY[3] = {3, 3, 3};

    // Health components
    int health[3] = {50, 50, 50};

    int width = 20;
    int height = 20;

    // Movement system: run 3 ticks
    for (int tick = 0; tick < 3; tick++) {
        for (int i = 0; i < 3; i++) {
            posX[i] += velX[i];
            posY[i] += velY[i];
        }
    }

    // Render system
    for (int i = 0; i < 3; i++) {
        cout << "ENTITY|enemy" << i << "|enemy|"
             << posX[i] << "|" << posY[i] << "|"
             << width << "|" << height << "|"
             << health[i] << endl;
    }

    cout << "GAME_MESSAGE|Squadron advancing!" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Enemy0 should be at (86,39) after 3 ticks", expectedOutput: "ENTITY\\|enemy0\\|enemy\\|86\\|39\\|20\\|20\\|50", isPattern: true },
    { id: "g2", description: "Enemy1 should be at (200,39) after 3 ticks", expectedOutput: "ENTITY\\|enemy1\\|enemy\\|200\\|39\\|20\\|20\\|50", isPattern: true },
    { id: "g3", description: "Enemy2 should be at (314,39) after 3 ticks", expectedOutput: "ENTITY\\|enemy2\\|enemy\\|314\\|39\\|20\\|20\\|50", isPattern: true },
    { id: "g4", description: "Should show advancing message", expectedOutput: "GAME_MESSAGE\\|Squadron advancing!", isPattern: true },
  ],
  hints: [
    "Use nested loops: outer loop for ticks `for (int tick = 0; tick < 3; tick++)`, inner loop for entities.",
    "Inside the inner loop: `posX[i] += velX[i]; posY[i] += velY[i];`",
    "Render AFTER all 3 ticks are complete — the entities should show their final positions.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    // Position components
    int posX[3] = {80, 200, 320};
    int posY[3] = {30, 30, 30};

    // Velocity components
    int velX[3] = {2, 0, -2};
    int velY[3] = {3, 3, 3};

    // Health components
    int health[3] = {50, 50, 50};

    int width = 20;
    int height = 20;

    // Movement system: run 3 ticks
    for (int tick = 0; tick < 3; tick++) {
        for (int i = 0; i < 3; i++) {
            posX[i] += velX[i];
            posY[i] += velY[i];
        }
    }

    // Render system
    for (int i = 0; i < 3; i++) {
        cout << "ENTITY|enemy" << i << "|enemy|"
             << posX[i] << "|" << posY[i] << "|"
             << width << "|" << height << "|"
             << health[i] << endl;
    }

    cout << "GAME_MESSAGE|Squadron advancing!" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
