import type { GameLessonVariant } from "@/types/game";

export const lesson09SpaceShooter: GameLessonVariant = {
  lessonId: "09-references",
  instructions: `# Damage System — Component Mutation by Reference

## Project: Space Shooter ECS — In-Place Component Updates

**What you're building:** A damage system function that modifies entity health components in-place using references — showing how ECS systems mutate component data without copying.

## ECS Concept: Systems Modify Components In-Place

In ECS, systems don't return new data — they **modify components directly**. In C++, we use references to achieve this:

\`\`\`
void applyDamage(int& hp, int dmg) {
    hp -= dmg;           // modifies the original component
    if (hp < 0) hp = 0;  // clamp to zero
}
\`\`\`

The \`&\` means the function operates on the **actual component data** in the array, not a copy. This is how real ECS systems work — they process component arrays in-place for maximum performance.

## Your Task

1. Write a function \`void applyDamage(int& hp, int dmg)\` that subtracts damage and clamps to 0
2. Create 3 enemies with component arrays:
   - posX = {100, 200, 300}, posY = {60, 60, 60}
   - health = {80, 50, 80}
   - width=20, height=20
3. Output all entities BEFORE damage with \`GAME_MESSAGE|--- Before Damage ---\`
4. Apply 35 damage to enemy 0 (health: 80 -> 45)
5. Apply 60 damage to enemy 1 (health: 50 -> 0, clamped)
6. Output \`GAME_MESSAGE|--- After Damage ---\`
7. Output all entities AFTER damage (including dead ones with health 0)
8. Output \`SCORE|95\` (total damage dealt: 35 + 60)`,
  starterCode: `#include <iostream>
using namespace std;

// TODO: Write applyDamage(int& hp, int dmg)
// Subtract dmg from hp, clamp to 0 if negative

int main() {
    int posX[3] = {100, 200, 300};
    int posY[3] = {60, 60, 60};
    int health[3] = {80, 50, 80};

    int width = 20;
    int height = 20;

    // TODO: Output "--- Before Damage ---" message
    // TODO: Render all 3 entities with current health

    // TODO: Apply 35 damage to enemy 0
    // TODO: Apply 60 damage to enemy 1

    // TODO: Output "--- After Damage ---" message
    // TODO: Render all 3 entities with updated health

    // TODO: Output SCORE|95

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

void applyDamage(int& hp, int dmg) {
    hp -= dmg;
    if (hp < 0) hp = 0;
}

int main() {
    int posX[3] = {100, 200, 300};
    int posY[3] = {60, 60, 60};
    int health[3] = {80, 50, 80};

    int width = 20;
    int height = 20;

    cout << "GAME_MESSAGE|--- Before Damage ---" << endl;
    for (int i = 0; i < 3; i++) {
        cout << "ENTITY|enemy" << i << "|enemy|"
             << posX[i] << "|" << posY[i] << "|"
             << width << "|" << height << "|"
             << health[i] << endl;
    }

    applyDamage(health[0], 35);
    applyDamage(health[1], 60);

    cout << "GAME_MESSAGE|--- After Damage ---" << endl;
    for (int i = 0; i < 3; i++) {
        cout << "ENTITY|enemy" << i << "|enemy|"
             << posX[i] << "|" << posY[i] << "|"
             << width << "|" << height << "|"
             << health[i] << endl;
    }

    cout << "SCORE|95" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should show before-damage message", expectedOutput: "GAME_MESSAGE\\|--- Before Damage ---", isPattern: true },
    { id: "g2", description: "Enemy0 should have 80 health before damage", expectedOutput: "ENTITY\\|enemy0\\|enemy\\|100\\|60\\|20\\|20\\|80", isPattern: true },
    { id: "g3", description: "Should show after-damage message", expectedOutput: "GAME_MESSAGE\\|--- After Damage ---", isPattern: true },
    { id: "g4", description: "Enemy0 should have 45 health after damage", expectedOutput: "ENTITY\\|enemy0\\|enemy\\|100\\|60\\|20\\|20\\|45", isPattern: true },
    { id: "g5", description: "Enemy1 should have 0 health (clamped) after damage", expectedOutput: "ENTITY\\|enemy1\\|enemy\\|200\\|60\\|20\\|20\\|0", isPattern: true },
    { id: "g6", description: "Enemy2 should remain at 80 health", expectedOutput: "ENTITY\\|enemy2\\|enemy\\|300\\|60\\|20\\|20\\|80", isPattern: true },
    { id: "g7", description: "Should show total damage as score", expectedOutput: "SCORE\\|95", isPattern: true },
  ],
  hints: [
    "The `&` in `int& hp` means the function modifies the original variable, not a copy.",
    "Clamp with: `if (hp < 0) hp = 0;` — health shouldn't go negative.",
    "Call it like: `applyDamage(health[0], 35);` — passing the array element directly.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

void applyDamage(int& hp, int dmg) {
    hp -= dmg;
    if (hp < 0) hp = 0;
}

int main() {
    int posX[3] = {100, 200, 300};
    int posY[3] = {60, 60, 60};
    int health[3] = {80, 50, 80};

    int width = 20;
    int height = 20;

    cout << "GAME_MESSAGE|--- Before Damage ---" << endl;
    for (int i = 0; i < 3; i++) {
        cout << "ENTITY|enemy" << i << "|enemy|"
             << posX[i] << "|" << posY[i] << "|"
             << width << "|" << height << "|"
             << health[i] << endl;
    }

    applyDamage(health[0], 35);
    applyDamage(health[1], 60);

    cout << "GAME_MESSAGE|--- After Damage ---" << endl;
    for (int i = 0; i < 3; i++) {
        cout << "ENTITY|enemy" << i << "|enemy|"
             << posX[i] << "|" << posY[i] << "|"
             << width << "|" << height << "|"
             << health[i] << endl;
    }

    cout << "SCORE|95" << endl;
    return 0;
}
`,
};
