import type { GameLessonVariant } from "@/types/game";

export const lesson08SpaceShooter: GameLessonVariant = {
  lessonId: "08-conditionals",
  instructions: `# Health System — Conditional Component Queries

## Project: Space Shooter ECS — Alive/Dead Filtering

**What you're building:** A health system that checks each entity's health component and only renders entities that are still alive — demonstrating how ECS systems filter entities by component state.

## ECS Concept: Component Queries & Filtering

Real ECS engines let you query: "give me all entities where health > 0." In our C++ version, we do this with a simple conditional inside the system loop:

\`\`\`
// Render system with health filter
for (int i = 0; i < count; i++) {
    if (health[i] > 0) {
        // render entity i
    }
}
\`\`\`

This is a **conditional query** — the system only processes entities that match certain component criteria.

## Your Task

1. Create component arrays for 4 enemies at these positions:
   - posX = {60, 160, 260, 360}, posY = {50, 50, 50, 50}
   - health = {40, 40, 40, 40}
   - width=18, height=18
2. Deal 50 damage to enemy at index 1 (health becomes -10)
3. Deal 25 damage to enemy at index 3 (health becomes 15)
4. Loop through all enemies: only output ENTITY for those with health > 0
5. Count how many enemies are still alive
6. Output \`GAME_MESSAGE|Enemies remaining: N\` (where N is the alive count)
7. Output \`SCORE|K\` where K = number of enemies destroyed (killed)`,
  starterCode: `#include <iostream>
using namespace std;

int main() {
    int posX[4] = {60, 160, 260, 360};
    int posY[4] = {50, 50, 50, 50};
    int health[4] = {40, 40, 40, 40};

    int width = 18;
    int height = 18;

    // TODO: Deal 50 damage to enemy index 1
    // TODO: Deal 25 damage to enemy index 3

    int alive = 0;

    // TODO: Loop through all enemies
    // Only render (output ENTITY) if health[i] > 0
    // Count how many are alive

    // TODO: Output GAME_MESSAGE with enemies remaining count
    // TODO: Output SCORE with number of enemies destroyed (4 - alive)

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

int main() {
    int posX[4] = {60, 160, 260, 360};
    int posY[4] = {50, 50, 50, 50};
    int health[4] = {40, 40, 40, 40};

    int width = 18;
    int height = 18;

    // Damage system
    health[1] -= 50;
    health[3] -= 25;

    int alive = 0;

    // Render system with health filter
    for (int i = 0; i < 4; i++) {
        if (health[i] > 0) {
            cout << "ENTITY|enemy" << i << "|enemy|"
                 << posX[i] << "|" << posY[i] << "|"
                 << width << "|" << height << "|"
                 << health[i] << endl;
            alive++;
        }
    }

    cout << "GAME_MESSAGE|Enemies remaining: " << alive << endl;
    cout << "SCORE|" << (4 - alive) << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render enemy0 (alive, health 40)", expectedOutput: "ENTITY\\|enemy0\\|enemy\\|60\\|50\\|18\\|18\\|40", isPattern: true },
    { id: "g2", description: "Should NOT render enemy1 (dead)", expectedOutput: "^(?!.*ENTITY\\|enemy1)", isPattern: true },
    { id: "g3", description: "Should render enemy2 (alive, health 40)", expectedOutput: "ENTITY\\|enemy2\\|enemy\\|260\\|50\\|18\\|18\\|40", isPattern: true },
    { id: "g4", description: "Should render enemy3 (alive, health 15)", expectedOutput: "ENTITY\\|enemy3\\|enemy\\|360\\|50\\|18\\|18\\|15", isPattern: true },
    { id: "g5", description: "Should show 3 enemies remaining", expectedOutput: "GAME_MESSAGE\\|Enemies remaining: 3", isPattern: true },
    { id: "g6", description: "Should show score of 1 kill", expectedOutput: "SCORE\\|1", isPattern: true },
  ],
  hints: [
    "Deal damage by subtracting: `health[1] -= 50;` makes health go to -10 (dead).",
    "In the loop, use `if (health[i] > 0)` to filter which entities to render.",
    "Increment `alive++` inside the if-block to count living enemies.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    int posX[4] = {60, 160, 260, 360};
    int posY[4] = {50, 50, 50, 50};
    int health[4] = {40, 40, 40, 40};

    int width = 18;
    int height = 18;

    // Damage system
    health[1] -= 50;
    health[3] -= 25;

    int alive = 0;

    // Render system with health filter
    for (int i = 0; i < 4; i++) {
        if (health[i] > 0) {
            cout << "ENTITY|enemy" << i << "|enemy|"
                 << posX[i] << "|" << posY[i] << "|"
                 << width << "|" << height << "|"
                 << health[i] << endl;
            alive++;
        }
    }

    cout << "GAME_MESSAGE|Enemies remaining: " << alive << endl;
    cout << "SCORE|" << (4 - alive) << endl;
    return 0;
}
`,
};
