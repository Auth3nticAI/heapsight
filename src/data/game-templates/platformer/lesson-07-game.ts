import type { GameLessonVariant } from "@/types/game";

export const lesson07Platformer: GameLessonVariant = {
  lessonId: "07-loops",
  instructions: `# Coin Spawner — Loop-Generated Collectibles

## Project: Platformer FSM — Procedural Level Generation

**What you're building:** A coin spawning system that uses a for-loop to place 5 coins at evenly spaced positions across the level. This is how real games procedurally generate collectible layouts.

## Concept: Procedural Placement

Instead of manually placing each coin, we calculate positions mathematically:

\`\`\`
int startX = 60;
int spacing = 70;
// coin i is at x = startX + i * spacing
\`\`\`

This means changing one variable (spacing) instantly re-arranges the entire layout. Game designers use this to rapidly prototype level feel.

## Your Task

1. Output the player entity: \`ENTITY|runner|player|50|200|16|24\`
2. Output the ground: \`ENTITY|ground|platform|0|240|380|20\`
3. Use a for-loop to spawn 5 coins:
   - Start X = 60, spacing = 70, all at Y = 210
   - Each coin is 12x12, type "item"
   - IDs: "coin0" through "coin4"
4. Output \`GAME_MESSAGE|5 coins spawned\`
5. Output \`SCORE|0\``,
  starterCode: `#include <iostream>
using namespace std;

int main() {
    int startX = 60;
    int spacing = 70;
    int coinY = 210;

    // TODO: Output player entity

    // TODO: Output ground platform

    // TODO: Use for-loop to spawn 5 coins
    // Each coin: ENTITY|coinN|item|x|210|12|12
    // x = startX + i * spacing

    // TODO: Output GAME_MESSAGE and SCORE

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

int main() {
    int startX = 60;
    int spacing = 70;
    int coinY = 210;

    cout << "ENTITY|runner|player|50|200|16|24" << endl;
    cout << "ENTITY|ground|platform|0|240|380|20" << endl;

    for (int i = 0; i < 5; i++) {
        int x = startX + i * spacing;
        cout << "ENTITY|coin" << i << "|item|"
             << x << "|" << coinY << "|12|12" << endl;
    }

    cout << "GAME_MESSAGE|5 coins spawned" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render player", expectedOutput: "ENTITY\\|runner\\|player\\|50\\|200\\|16\\|24", isPattern: true },
    { id: "g2", description: "Should render ground", expectedOutput: "ENTITY\\|ground\\|platform\\|0\\|240\\|380\\|20", isPattern: true },
    { id: "g3", description: "Should render coin0 at x=60", expectedOutput: "ENTITY\\|coin0\\|item\\|60\\|210\\|12\\|12", isPattern: true },
    { id: "g4", description: "Should render coin2 at x=200", expectedOutput: "ENTITY\\|coin2\\|item\\|200\\|210\\|12\\|12", isPattern: true },
    { id: "g5", description: "Should render coin4 at x=340", expectedOutput: "ENTITY\\|coin4\\|item\\|340\\|210\\|12\\|12", isPattern: true },
    { id: "g6", description: "Should show coin count message", expectedOutput: "GAME_MESSAGE\\|5 coins spawned", isPattern: true },
  ],
  hints: [
    "Calculate X position: `int x = startX + i * spacing;` inside the loop.",
    "Build coin ID in output: `\"coin\" << i`",
    "coin0 is at x=60, coin1 at x=130, coin2 at x=200, coin3 at x=270, coin4 at x=340.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    int startX = 60;
    int spacing = 70;
    int coinY = 210;

    cout << "ENTITY|runner|player|50|200|16|24" << endl;
    cout << "ENTITY|ground|platform|0|240|380|20" << endl;

    for (int i = 0; i < 5; i++) {
        int x = startX + i * spacing;
        cout << "ENTITY|coin" << i << "|item|"
             << x << "|" << coinY << "|12|12" << endl;
    }

    cout << "GAME_MESSAGE|5 coins spawned" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
